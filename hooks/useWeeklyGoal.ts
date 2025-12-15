/**
 * useWeeklyGoal Hook
 * Manages weekly reading goal data fetching, updating, and state
 * Implements 60-second caching (goals change less frequently than stats)
 */

import { useState, useCallback, useRef } from 'react';
import { gamificationService } from '@/services/gamificationApi';
import type { WeeklyGoal } from '@/types/gamification';

interface UseWeeklyGoalResult {
  // Data
  goal: WeeklyGoal | null;

  // Loading states
  isLoading: boolean;
  isRefreshing: boolean;
  isUpdating: boolean;

  // Error state
  error: string | null;

  // Actions
  fetchGoal: () => Promise<void>;
  refreshGoal: () => Promise<void>;
  updateGoal: (target: number) => Promise<WeeklyGoal | null>;
  invalidateCache: () => void;
}

// Module-level cache to prevent duplicate requests
let cachedGoal: WeeklyGoal | null = null;
let lastFetchTime: number = 0;
const CACHE_DURATION = 60000; // 60 seconds cache (goals change less frequently)

/**
 * Custom hook to fetch and manage weekly reading goals
 *
 * Features:
 * - 60-second cache (longer than stats since goals don't change often)
 * - Loading, refreshing, and updating states
 * - Error handling with validation
 * - Manual refetch capability
 * - Pull-to-refresh support
 * - Update goal functionality
 *
 * @example
 * ```tsx
 * const { goal, isLoading, updateGoal } = useWeeklyGoal();
 *
 * useEffect(() => {
 *   fetchGoal();
 * }, []);
 *
 * // Update goal
 * await updateGoal(7); // Set target to 7 articles
 *
 * // Goal structure:
 * goal.target // Target articles for the week
 * goal.completed // Articles completed so far
 * goal.daysLeft // Days remaining in the week
 * goal.isActive // Whether goal is active
 * ```
 */
export function useWeeklyGoal(): UseWeeklyGoalResult {
  // Data state
  const [goal, setGoal] = useState<WeeklyGoal | null>(cachedGoal);

  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Error state
  const [error, setError] = useState<string | null>(null);

  // Ref to track if request is in progress
  const isRequestInProgress = useRef(false);

  /**
   * Fetch weekly goal with caching
   */
  const fetchGoal = useCallback(async () => {
    // Check if request is already in progress
    if (isRequestInProgress.current) {
      return;
    }

    // Check cache validity
    const now = Date.now();
    const cacheAge = now - lastFetchTime;

    if (cachedGoal && cacheAge < CACHE_DURATION) {
      setGoal(cachedGoal);
      return;
    }

    isRequestInProgress.current = true;
    setIsLoading(true);
    setError(null);

    try {
      const data = await gamificationService.getWeeklyGoal();

      // Update cache
      cachedGoal = data;
      lastFetchTime = Date.now();

      setGoal(data);
    } catch (err: any) {

      if (err.response?.status === 401) {
        setError('Please login to view your goal');
      } else if (err.response?.status === 404) {
        setGoal(null);
        setError(null);
      } else if (err.response?.status === 429) {
        // Use cached data if available
        if (cachedGoal) {
          setGoal(cachedGoal);
          setError(null);
        }
      } else {
        setError(err.message || 'Failed to load weekly goal');
      }
    } finally {
      setIsLoading(false);
      isRequestInProgress.current = false;
    }
  }, []);

  /**
   * Refresh goal (for pull-to-refresh)
   * Forces a fresh fetch, bypassing cache
   */
  const refreshGoal = useCallback(async () => {
    // Check if request is already in progress
    if (isRequestInProgress.current) {
      return;
    }

    isRequestInProgress.current = true;
    setIsRefreshing(true);
    setError(null);

    try {
      const data = await gamificationService.getWeeklyGoal();

      // Update cache
      cachedGoal = data;
      lastFetchTime = Date.now();

      setGoal(data);
    } catch (err: any) {

      if (err.response?.status === 404) {
        setGoal(null);
        setError(null);
      } else if (err.response?.status === 429) {
        if (cachedGoal) {
          setGoal(cachedGoal);
        }
      }
    } finally {
      setIsRefreshing(false);
      isRequestInProgress.current = false;
    }
  }, []);

  /**
   * Update weekly reading goal
   * Sets a new target for the current week (1-50 articles)
   *
   * @param target - Number of articles to read this week (1-50)
   * @returns Updated weekly goal or null if failed
   */
  const updateGoal = useCallback(async (target: number): Promise<WeeklyGoal | null> => {
    // Client-side validation
    if (target < 1 || target > 50) {
      const errorMsg = 'Target must be between 1 and 50 articles';
      setError(errorMsg);
      return null;
    }

    setIsUpdating(true);
    setError(null);

    try {
      const data = await gamificationService.updateWeeklyGoal(target);

      // Update cache
      cachedGoal = data;
      lastFetchTime = Date.now();

      setGoal(data);
      return data;
    } catch (err: any) {
      if (err.response?.status === 400) {
        setError('Invalid goal target');
      } else if (err.response?.status === 401) {
        setError('Please login to set a goal');
      } else {
        setError(err.message || 'Failed to update goal');
      }

      return null;
    } finally {
      setIsUpdating(false);
    }
  }, []);

  /**
   * Invalidate cache - useful after completing articles
   * Forces next fetch to retrieve fresh data from server
   */
  const invalidateCache = useCallback(() => {
    cachedGoal = null;
    lastFetchTime = 0;
  }, []);

  return {
    // Data
    goal,

    // Loading states
    isLoading,
    isRefreshing,
    isUpdating,

    // Error state
    error,

    // Actions
    fetchGoal,
    refreshGoal,
    updateGoal,
    invalidateCache,
  };
}

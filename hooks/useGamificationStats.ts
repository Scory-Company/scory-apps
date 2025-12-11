/**
 * useGamificationStats Hook
 * Manages gamification statistics data fetching and state
 * Implements 30-second caching to prevent rate limiting
 */

import { useState, useCallback, useRef } from 'react';
import { gamificationService } from '@/services/gamificationApi';
import type { GamificationStats } from '@/types/gamification';

interface UseGamificationStatsResult {
  // Data
  stats: GamificationStats | null;

  // Loading states
  isLoading: boolean;
  isRefreshing: boolean;

  // Error state
  error: string | null;

  // Actions
  fetchStats: () => Promise<void>;
  refreshStats: () => Promise<void>;
  invalidateCache: () => void;
}

// Module-level cache to prevent duplicate requests
let cachedStats: GamificationStats | null = null;
let lastFetchTime: number = 0;
const CACHE_DURATION = 30000; // 30 seconds cache (same as useUserInsights)

/**
 * Custom hook to fetch and manage gamification statistics
 *
 * Features:
 * - 30-second cache to prevent rate limiting
 * - Loading and refreshing states
 * - Error handling with 404/401/429 support
 * - Manual refetch capability
 * - Pull-to-refresh support
 * - Optimistic cache usage on rate limit
 *
 * @example
 * ```tsx
 * const { stats, isLoading, error, fetchStats } = useGamificationStats();
 *
 * useEffect(() => {
 *   fetchStats();
 * }, []);
 *
 * // Stats structure:
 * stats.streak.current // Current streak days
 * stats.articlesRead.thisWeek // Articles read this week
 * stats.readingTime.thisWeek // Minutes read this week
 * ```
 */
export function useGamificationStats(): UseGamificationStatsResult {
  // Data state
  const [stats, setStats] = useState<GamificationStats | null>(cachedStats);

  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Error state
  const [error, setError] = useState<string | null>(null);

  // Ref to track if request is in progress
  const isRequestInProgress = useRef(false);

  /**
   * Fetch gamification stats with caching to prevent rate limiting
   */
  const fetchStats = useCallback(async () => {
    // Check if request is already in progress
    if (isRequestInProgress.current) {
      console.log('[GAMIFICATION_STATS] Request already in progress, skipping...');
      return;
    }

    // Check cache validity
    const now = Date.now();
    const cacheAge = now - lastFetchTime;

    if (cachedStats && cacheAge < CACHE_DURATION) {
      console.log('[GAMIFICATION_STATS] Using cached data (age:', Math.round(cacheAge / 1000), 'seconds)');
      setStats(cachedStats);
      return;
    }

    isRequestInProgress.current = true;
    setIsLoading(true);
    setError(null);

    try {
      console.log('[GAMIFICATION_STATS] Fetching gamification stats...');
      const data = await gamificationService.getStats();

      // Update cache
      cachedStats = data;
      lastFetchTime = Date.now();

      setStats(data);
      console.log('[GAMIFICATION_STATS] Stats loaded:', {
        streak: data.streak.current,
        articlesThisWeek: data.articlesRead.thisWeek,
        minutesThisWeek: data.readingTime.thisWeek,
      });
    } catch (err: any) {
      console.error('[GAMIFICATION_STATS] Error fetching stats:', err);

      if (err.response?.status === 401) {
        setError('Please login to view your stats');
      } else if (err.response?.status === 404) {
        setError('Gamification feature not available');
        console.warn('[GAMIFICATION_STATS] Endpoint not found - backend may not have implemented this yet');
      } else if (err.response?.status === 429) {
        setError('Too many requests. Please wait a moment.');
        console.warn('[GAMIFICATION_STATS] Rate limited (429). Using cached data if available.');
        // Use cached data if available
        if (cachedStats) {
          setStats(cachedStats);
          setError(null);
        }
      } else {
        setError(err.message || 'Failed to load stats');
      }
    } finally {
      setIsLoading(false);
      isRequestInProgress.current = false;
    }
  }, []);

  /**
   * Refresh stats (for pull-to-refresh)
   * Forces a fresh fetch, bypassing cache
   */
  const refreshStats = useCallback(async () => {
    // Check if request is already in progress
    if (isRequestInProgress.current) {
      console.log('[GAMIFICATION_STATS] Request already in progress, skipping refresh...');
      return;
    }

    isRequestInProgress.current = true;
    setIsRefreshing(true);
    setError(null);

    try {
      console.log('[GAMIFICATION_STATS] Refreshing stats...');
      const data = await gamificationService.getStats();

      // Update cache
      cachedStats = data;
      lastFetchTime = Date.now();

      setStats(data);
      console.log('[GAMIFICATION_STATS] Stats refreshed');
    } catch (err: any) {
      console.error('[GAMIFICATION_STATS] Error refreshing stats:', err);

      if (err.response?.status === 429) {
        console.warn('[GAMIFICATION_STATS] Rate limited (429) on refresh. Using cached data.');
        // Don't show error, just use cached data
        if (cachedStats) {
          setStats(cachedStats);
        }
      }
      // Don't show error on refresh for other errors, just silently fail
    } finally {
      setIsRefreshing(false);
      isRequestInProgress.current = false;
    }
  }, []);

  /**
   * Invalidate cache - useful after quiz submission or activity recording
   * Forces next fetch to retrieve fresh data from server
   */
  const invalidateCache = useCallback(() => {
    console.log('[GAMIFICATION_STATS] Cache invalidated');
    cachedStats = null;
    lastFetchTime = 0;
  }, []);

  return {
    // Data
    stats,

    // Loading states
    isLoading,
    isRefreshing,

    // Error state
    error,

    // Actions
    fetchStats,
    refreshStats,
    invalidateCache,
  };
}

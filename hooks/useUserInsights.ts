import { useState, useEffect, useCallback, useRef } from 'react';
import { insightsApi, InsightNote } from '@/services';

interface UseUserInsightsReturn {
  // Data
  insights: InsightNote[];

  // Loading states
  isLoading: boolean;
  isRefreshing: boolean;

  // Error state
  error: string | null;

  // Actions
  fetchInsights: () => Promise<void>;
  refreshInsights: () => Promise<void>;
  deleteInsight: (noteId: number) => Promise<boolean>;
  invalidateCache: () => void;
}

// Cache to prevent duplicate requests
let cachedInsights: InsightNote[] | null = null;
let lastFetchTime: number = 0;
const CACHE_DURATION = 30000; // 30 seconds cache

/**
 * Custom hook for managing user's insights in Learn tab
 * Fetches all insights across all articles
 * Implements caching and debouncing to prevent rate limiting (429 errors)
 *
 * @param autoFetch - Whether to automatically fetch on mount (default: true)
 * @returns User insights state and actions
 *
 * @example
 * ```tsx
 * const { insights, isLoading, fetchInsights } = useUserInsights();
 *
 * // Insights are auto-fetched on mount
 * // Or manually refetch:
 * await fetchInsights();
 * ```
 */
export const useUserInsights = (autoFetch: boolean = true): UseUserInsightsReturn => {
  // Data state
  const [insights, setInsights] = useState<InsightNote[]>(cachedInsights || []);

  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Error state
  const [error, setError] = useState<string | null>(null);

  // Ref to track if request is in progress
  const isRequestInProgress = useRef(false);

  /**
   * Fetch all user insights with caching to prevent rate limiting
   */
  const fetchInsights = useCallback(async () => {
    // Check if request is already in progress
    if (isRequestInProgress.current) {
      console.log('[USER_INSIGHTS] Request already in progress, skipping...');
      return;
    }

    // Check cache validity
    const now = Date.now();
    const cacheAge = now - lastFetchTime;

    if (cachedInsights && cacheAge < CACHE_DURATION) {
      console.log('[USER_INSIGHTS] Using cached data (age:', Math.round(cacheAge / 1000), 'seconds)');
      setInsights(cachedInsights);
      return;
    }

    isRequestInProgress.current = true;
    setIsLoading(true);
    setError(null);

    try {
      console.log('[USER_INSIGHTS] Fetching all user insights...');
      const response = await insightsApi.getUserInsightNotes();

      if (response.success && response.data) {
        // Sort by createdAt (newest first)
        const sortedInsights = response.data.sort((a, b) => {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });

        // Update cache
        cachedInsights = sortedInsights;
        lastFetchTime = Date.now();

        setInsights(sortedInsights);
        console.log('[USER_INSIGHTS] Loaded', sortedInsights.length, 'insights');
      } else {
        setError(response.message || 'Failed to load insights');
      }
    } catch (err: any) {
      console.error('[USER_INSIGHTS] Error fetching insights:', err);

      if (err.response?.status === 401) {
        setError('Please login to view your insights');
      } else if (err.response?.status === 404) {
        setError('Insights feature not available yet');
        console.warn('[USER_INSIGHTS] Endpoint not found - backend may not have implemented this yet');
      } else if (err.response?.status === 429) {
        setError('Too many requests. Please wait a moment.');
        console.warn('[USER_INSIGHTS] Rate limited (429). Using cached data if available.');
        // Use cached data if available
        if (cachedInsights) {
          setInsights(cachedInsights);
          setError(null);
        }
      } else {
        setError(err.response?.data?.message || 'Failed to load insights');
      }
    } finally {
      setIsLoading(false);
      isRequestInProgress.current = false;
    }
  }, []);

  /**
   * Refresh insights (for pull-to-refresh)
   * Forces a fresh fetch, bypassing cache
   */
  const refreshInsights = useCallback(async () => {
    // Check if request is already in progress
    if (isRequestInProgress.current) {
      console.log('[USER_INSIGHTS] Request already in progress, skipping refresh...');
      return;
    }

    isRequestInProgress.current = true;
    setIsRefreshing(true);
    setError(null);

    try {
      console.log('[USER_INSIGHTS] Refreshing insights...');
      const response = await insightsApi.getUserInsightNotes();

      if (response.success && response.data) {
        const sortedInsights = response.data.sort((a, b) => {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });

        // Update cache
        cachedInsights = sortedInsights;
        lastFetchTime = Date.now();

        setInsights(sortedInsights);
        console.log('[USER_INSIGHTS] Refreshed', sortedInsights.length, 'insights');
      }
    } catch (err: any) {
      console.error('[USER_INSIGHTS] Error refreshing insights:', err);

      if (err.response?.status === 429) {
        console.warn('[USER_INSIGHTS] Rate limited (429) on refresh. Using cached data.');
        // Don't show error, just use cached data
        if (cachedInsights) {
          setInsights(cachedInsights);
        }
      }
      // Don't show error on refresh for other errors, just silently fail
    } finally {
      setIsRefreshing(false);
      isRequestInProgress.current = false;
    }
  }, []);

  /**
   * Delete an insight note
   *
   * @param noteId - ID of note to delete
   * @returns true if deletion was successful
   */
  const deleteInsight = useCallback(
    async (noteId: number): Promise<boolean> => {
      try {
        console.log('[USER_INSIGHTS] Deleting note:', noteId);
        const response = await insightsApi.deleteInsightNote(noteId);

        if (response.success) {
          // Optimistically remove from local state and cache
          const updatedInsights = insights.filter((note) => note.id !== noteId);
          setInsights(updatedInsights);

          // Update cache
          cachedInsights = updatedInsights;
          lastFetchTime = Date.now();

          console.log('[USER_INSIGHTS] Note deleted successfully');
          return true;
        } else {
          setError(response.message || 'Failed to delete note');
          return false;
        }
      } catch (err: any) {
        console.error('[USER_INSIGHTS] Error deleting note:', err);

        if (err.response?.status === 403) {
          setError('You are not authorized to delete this note');
        } else {
          setError(err.response?.data?.message || 'Failed to delete note');
        }

        return false;
      }
    },
    [insights]
  );

  /**
   * Invalidate cache - useful after adding/updating notes
   */
  const invalidateCache = useCallback(() => {
    console.log('[USER_INSIGHTS] Cache invalidated');
    cachedInsights = null;
    lastFetchTime = 0;
  }, []);

  // Auto-fetch on mount if enabled
  useEffect(() => {
    if (autoFetch) {
      fetchInsights();
    }
  }, [autoFetch, fetchInsights]);

  return {
    // Data
    insights,

    // Loading states
    isLoading,
    isRefreshing,

    // Error state
    error,

    // Actions
    fetchInsights,
    refreshInsights,
    deleteInsight,
    invalidateCache,
  };
};

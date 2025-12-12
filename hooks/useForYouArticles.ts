import { useState, useCallback } from 'react';
import { articlesApi, ArticleResponse } from '@/services';

/**
 * For You Articles Hook
 * Manages personalized article feed with smart caching and filters
 *
 * Features:
 * - Smart caching (60s TTL - articles change less frequently)
 * - Exclude read articles filter
 * - Random shuffle support
 * - Pull-to-refresh
 * - Loading states
 */

interface ForYouFilters {
  excludeRead?: boolean;
  shuffle?: boolean;
}

interface UseForYouArticlesOptions {
  limit?: number;
}

interface CacheEntry {
  data: ArticleResponse[];
  timestamp: number;
}

// Module-level cache (same pattern as useGamificationStats)
let cache: CacheEntry | null = null;
const CACHE_TTL = 60000; // 60 seconds (articles change less frequently than stats)

/**
 * Invalidate For You cache from outside the hook (e.g., after quiz completion)
 * This is exported so other components can invalidate without using the hook
 */
export const invalidateForYouCache = (): void => {
  console.log('[useForYouArticles] Cache invalidated (external call)');
  cache = null;
};

export const useForYouArticles = (options: UseForYouArticlesOptions = {}) => {
  const { limit = 5 } = options;

  const [articles, setArticles] = useState<ArticleResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ForYouFilters>({
    excludeRead: true, // Always exclude read articles by default
    shuffle: true, // Always shuffle (random sort) by default
  });

  /**
   * Check if cache is still valid
   */
  const isCacheValid = useCallback((): boolean => {
    if (!cache) return false;
    const now = Date.now();
    const age = now - cache.timestamp;
    return age < CACHE_TTL;
  }, []);

  /**
   * Fetch articles from API or cache
   */
  const fetchArticles = useCallback(
    async (forceRefresh = false): Promise<ArticleResponse[]> => {
      // Use cache if valid and not forcing refresh
      if (!forceRefresh && isCacheValid() && cache) {
        console.log('[useForYouArticles] Using cached data');
        setArticles(cache.data);
        setError(null);
        return cache.data;
      }

      try {
        setIsLoading(true);
        setError(null);

        console.log('[useForYouArticles] Fetching from API with filters:', filters);

        // Build API params
        const params: any = { page: 1, limit };

        // Add excludeRead filter if enabled
        if (filters.excludeRead) {
          params.excludeRead = true;
        }

        // Add random sort if shuffle enabled
        if (filters.shuffle) {
          params.sort = 'random';
        }

        const response = await articlesApi.getForYou(params);
        const apiData = response.data?.data;

        if (apiData?.articles && Array.isArray(apiData.articles)) {
          const fetchedArticles = apiData.articles;

          // Update cache
          cache = {
            data: fetchedArticles,
            timestamp: Date.now(),
          };

          setArticles(fetchedArticles);
          console.log(`[useForYouArticles] ✅ Fetched ${fetchedArticles.length} articles`);
          return fetchedArticles;
        } else {
          console.log('[useForYouArticles] ⚠️ No articles in response');
          setArticles([]);
          return [];
        }
      } catch (err: any) {
        const errorMessage = err?.response?.data?.message || err?.message || 'Failed to fetch articles';
        console.error('[useForYouArticles] ❌ Error:', errorMessage);
        setError(errorMessage);

        // On error, use cache if available (graceful degradation)
        if (cache) {
          console.log('[useForYouArticles] Using stale cache due to error');
          setArticles(cache.data);
          return cache.data;
        }

        setArticles([]);
        return [];
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [filters, limit, isCacheValid]
  );

  /**
   * Refresh articles (for pull-to-refresh)
   */
  const refreshArticles = useCallback(async (): Promise<void> => {
    setIsRefreshing(true);
    await fetchArticles(true);
  }, [fetchArticles]);

  /**
   * Shuffle articles (force random sort + refresh)
   */
  const shuffleArticles = useCallback(async (): Promise<void> => {
    console.log('[useForYouArticles] 🔀 Shuffling articles...');
    setFilters((prev) => ({ ...prev, shuffle: true }));

    // Force refresh with shuffle
    await fetchArticles(true);

    // Reset shuffle flag after fetch
    setFilters((prev) => ({ ...prev, shuffle: false }));
  }, [fetchArticles]);

  /**
   * Toggle exclude read filter
   */
  const toggleExcludeRead = useCallback(async (): Promise<void> => {
    const newValue = !filters.excludeRead;
    console.log('[useForYouArticles] Toggling excludeRead:', newValue);

    setFilters((prev) => ({ ...prev, excludeRead: newValue }));

    // Invalidate cache and fetch with new filter
    cache = null;
    await fetchArticles(true);
  }, [filters.excludeRead, fetchArticles]);

  /**
   * Invalidate cache (called after quiz completion)
   */
  const invalidateCache = useCallback((): void => {
    console.log('[useForYouArticles] Cache invalidated');
    cache = null;
  }, []);

  return {
    articles,
    isLoading,
    isRefreshing,
    error,
    filters,
    fetchArticles,
    refreshArticles,
    shuffleArticles,
    toggleExcludeRead,
    invalidateCache,
  };
};

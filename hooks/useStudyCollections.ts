/**
 * useStudyCollections Hook
 * Manages study collections data fetching and state
 */

import { useState, useCallback, useEffect } from 'react';
import { collectionService } from '@/services/collectionService';
import type { StudyCollection } from '@/types/collection';
import * as BookmarkCache from '@/utils/bookmarkCache';

interface UseStudyCollectionsResult {
  collections: StudyCollection[];
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  refresh: () => Promise<void>;
}

/**
 * Custom hook to fetch and manage study collections
 *
 * Features:
 * - Auto-fetch on mount via manual call
 * - Loading and refreshing states
 * - Error handling
 * - Manual refetch capability
 * - Pull-to-refresh support
 *
 * @example
 * ```tsx
 * const { collections, isLoading, error, refetch } = useStudyCollections();
 *
 * useEffect(() => {
 *   refetch();
 * }, []);
 * ```
 */
export function useStudyCollections(): UseStudyCollectionsResult {
  const [collections, setCollections] = useState<StudyCollection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch collections from API
   * @param isRefresh - Whether this is a refresh action (for pull-to-refresh)
   */
  const fetchCollections = useCallback(async (isRefresh = false) => {
    try {
      // Set appropriate loading state
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      // Clear previous error
      setError(null);

      // Fetch from API
      const data = await collectionService.getAllCollections();

      // Sync bookmark cache with fetched collections
      // Get all article IDs from all collections and sync cache
      const fetchCollectionDetails = async () => {
        const allArticleIds: string[] = [];

        for (const collection of data) {
          try {
            const detail = await collectionService.getCollectionDetail(collection.id);
            detail.articles.forEach(article => allArticleIds.push(article.id));
          } catch (error) {
          }
        }

        // Sync cache with actual bookmarked articles
        await BookmarkCache.syncBookmarkCache(allArticleIds);
      };

      // Sync cache in background (don't block UI)
      fetchCollectionDetails().catch(error => {
      });

      // Update state
      setCollections(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load collections';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  /**
   * Refetch collections (shows loading indicator)
   */
  const refetch = useCallback(async () => {
    await fetchCollections(false);
  }, [fetchCollections]);

  /**
   * Refresh collections (for pull-to-refresh, shows refresh indicator)
   */
  const refresh = useCallback(async () => {
    await fetchCollections(true);
  }, [fetchCollections]);

  // Auto-fetch on mount
  useEffect(() => {
    fetchCollections(false);
  }, [fetchCollections]);

  return {
    collections,
    isLoading,
    isRefreshing,
    error,
    refetch,
    refresh,
  };
}

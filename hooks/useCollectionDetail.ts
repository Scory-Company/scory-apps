/**
 * useCollectionDetail Hook
 * Manages collection detail data fetching and state
 */

import { useState, useCallback, useEffect } from 'react';
import { collectionService } from '@/services/collectionService';
import type { StudyCollection, BookmarkedArticle } from '@/types/collection';

interface UseCollectionDetailResult {
  collection: StudyCollection | null;
  articles: BookmarkedArticle[];
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  refresh: () => Promise<void>;
  markAsRead: (articleId: string) => Promise<void>;
  unbookmarkArticle: (articleId: string) => Promise<void>;
}

/**
 * Custom hook to fetch and manage collection detail with articles
 *
 * Features:
 * - Auto-fetch on mount with collectionId
 * - Loading and refreshing states
 * - Error handling
 * - Manual refetch capability
 * - Pull-to-refresh support
 * - Mark article as read
 * - Unbookmark article from collection
 *
 * @param collectionId - The collection ID to fetch
 * @example
 * ```tsx
 * const { collection, articles, isLoading, markAsRead } = useCollectionDetail('col_123');
 * ```
 */
export function useCollectionDetail(collectionId: string): UseCollectionDetailResult {
  const [collection, setCollection] = useState<StudyCollection | null>(null);
  const [articles, setArticles] = useState<BookmarkedArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch collection detail from API
   * @param isRefresh - Whether this is a refresh action (for pull-to-refresh)
   */
  const fetchCollectionDetail = useCallback(
    async (isRefresh = false) => {
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
        const data = await collectionService.getCollectionDetail(collectionId);

  // Update state
        setCollection(data.collection);
        setArticles(data.articles);
      } catch (err) {
        const errorMessage =
        err instanceof Error ? err.message : 'Failed to load collection detail';
        setError(errorMessage);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [collectionId]
  );

  /**
   * Mark an article as read in the collection
   * Updates both the article state and collection progress
   */
  const markAsRead = useCallback(
    async (articleId: string) => {
      if (!collection) return;

      try {

        // Optimistically update UI
        setArticles((prev) =>
          prev.map((article) =>
            article.id === articleId
              ? { ...article, isRead: true, lastReadAt: new Date().toISOString() }
              : article
          )
        );

        // Call API
        const response = await collectionService.markAsRead(collection.id, articleId);

        // Update collection progress from API response
        setCollection((prev) =>
          prev ? { ...prev, progress: response.collection.progress } : prev
        );

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to mark as read';
        setError(errorMessage);

        // Revert optimistic update on error
        await fetchCollectionDetail(true);
      }
    },
    [collection, fetchCollectionDetail]
  );

  /**
   * Unbookmark an article from the collection
   * If collection becomes empty, it will be auto-deleted by backend
   */
  const unbookmarkArticle = useCallback(
    async (articleId: string) => {
      try {

        // Optimistically update UI
        setArticles((prev) => prev.filter((article) => article.id !== articleId));
        setCollection((prev) =>
          prev ? { ...prev, articlesCount: prev.articlesCount - 1 } : prev
        );

        // Call API
        const response = await collectionService.unbookmarkArticle(articleId);

        // If collection was deleted, we might want to navigate back
        if (response.collection.wasDeleted) {
          setError('Collection was deleted (no articles remaining)');
        } else {
          // Refresh to get accurate state from backend
          await fetchCollectionDetail(true);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to unbookmark article';
        setError(errorMessage);

        // Revert optimistic update on error
        await fetchCollectionDetail(true);
      }
    },
    [fetchCollectionDetail]
  );

  /**
   * Refetch collection detail (shows loading indicator)
   */
  const refetch = useCallback(async () => {
    await fetchCollectionDetail(false);
  }, [fetchCollectionDetail]);

  /**
   * Refresh collection detail (for pull-to-refresh, shows refresh indicator)
   */
  const refresh = useCallback(async () => {
    await fetchCollectionDetail(true);
  }, [fetchCollectionDetail]);

  // Auto-fetch on mount when collectionId is available
  useEffect(() => {
    if (collectionId) {
      fetchCollectionDetail(false);
    }
  }, [collectionId, fetchCollectionDetail]);

  return {
    collection,
    articles,
    isLoading,
    isRefreshing,
    error,
    refetch,
    refresh,
    markAsRead,
    unbookmarkArticle,
  };
}

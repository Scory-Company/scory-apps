/**
 * Study Collections API Service
 * Handles all API calls related to study collections
 */

import api from './api';
import type {
  StudyCollection,
  CollectionDetail,
  CategoryMapping,
  GetCollectionsResponse,
  GetCollectionDetailResponse,
  BookmarkArticleResponse,
  UnbookmarkArticleResponse,
  MarkAsReadResponse,
  GetCategoryMappingsResponse,
} from '@/types/collection';

/**
 * Collection Service
 * All methods throw errors that should be caught by the caller
 */
export const collectionService = {
  /**
   * Get all study collections for the current user
   * @returns Array of study collections
   */
  async getAllCollections(): Promise<StudyCollection[]> {
    try {
      const response = await api.get<GetCollectionsResponse>('/collections');
      return response.data.data.collections;
    } catch (error: any) {
      console.error('[collectionService] getAllCollections error:', error);
      throw new Error(error.response?.data?.error || 'Failed to fetch collections');
    }
  },

  /**
   * Get collection details including all bookmarked articles
   * @param collectionId - The collection ID
   * @returns Collection detail with articles
   */
  async getCollectionDetail(collectionId: string): Promise<CollectionDetail> {
    try {
      const response = await api.get<GetCollectionDetailResponse>(
        `/collections/${collectionId}`
      );
      return response.data.data;
    } catch (error: any) {
      console.error('[collectionService] getCollectionDetail error:', error);
      throw new Error(error.response?.data?.error || 'Failed to fetch collection details');
    }
  },

  /**
   * Bookmark an article
   * This will auto-create or update the appropriate collection
   * @param articleId - The article ID to bookmark
   * @returns Bookmark response with collection info
   */
  async bookmarkArticle(articleId: string): Promise<BookmarkArticleResponse['data']> {
    try {
      const response = await api.post<BookmarkArticleResponse>('/bookmarks', {
        articleId,
      });
      return response.data.data;
    } catch (error: any) {
      console.error('[collectionService] bookmarkArticle error:', error);

      // Handle specific error cases
      if (error.response?.status === 400) {
        throw new Error('Article already bookmarked');
      }
      if (error.response?.status === 404) {
        throw new Error('Article not found');
      }

      throw new Error(error.response?.data?.error || 'Failed to bookmark article');
    }
  },

  /**
   * Remove bookmark from an article
   * This will auto-delete the collection if it becomes empty
   * @param articleId - The article ID to unbookmark
   * @returns Unbookmark response with collection info
   */
  async unbookmarkArticle(articleId: string): Promise<UnbookmarkArticleResponse['data']> {
    try {
      const response = await api.delete<UnbookmarkArticleResponse>(
        `/bookmarks/${articleId}`
      );
      return response.data.data;
    } catch (error: any) {
      console.error('[collectionService] unbookmarkArticle error:', error);

      if (error.response?.status === 404) {
        throw new Error('Bookmark not found');
      }

      throw new Error(error.response?.data?.error || 'Failed to remove bookmark');
    }
  },

  /**
   * Mark an article as read in a collection
   * This will auto-update the collection progress
   * @param collectionId - The collection ID
   * @param articleId - The article ID
   * @returns Mark as read response with updated progress
   */
  async markAsRead(collectionId: string, articleId: string): Promise<MarkAsReadResponse['data']> {
    try {
      const response = await api.post<MarkAsReadResponse>(
        `/collections/${collectionId}/articles/${articleId}/read`
      );
      return response.data.data;
    } catch (error: any) {
      console.error('[collectionService] markAsRead error:', error);

      if (error.response?.status === 404) {
        throw new Error('Article not found in collection');
      }

      throw new Error(error.response?.data?.error || 'Failed to mark article as read');
    }
  },

  /**
   * Get predefined category mappings for icons and colors
   * This endpoint does NOT require authentication
   * @returns Array of category mappings
   */
  async getCategoryMappings(): Promise<CategoryMapping[]> {
    try {
      const response = await api.get<GetCategoryMappingsResponse>(
        '/collections/category-mappings'
      );
      return response.data.data.mappings;
    } catch (error: any) {
      console.error('[collectionService] getCategoryMappings error:', error);
      throw new Error('Failed to fetch category mappings');
    }
  },

};

/**
 * Export individual functions for convenience
 */
export const {
  getAllCollections,
  getCollectionDetail,
  bookmarkArticle,
  unbookmarkArticle,
  markAsRead,
  getCategoryMappings,
} = collectionService;

import api from './api';

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface Insight {
  id: number;
  articleId: number;
  content: string;
  order: number;
  title: string;
  icon: 'lightbulb' | 'rocket' | 'star';
}

export interface InsightsResponse {
  articleId: string;
  articleTitle: string;
  articleSlug: string;
  readingLevel: string;
  insights: Insight[];
}

export interface SaveInsightNoteRequest {
  content: string;
  isCustom?: boolean; // true = user wrote it, false = selected from suggestions
}

export interface InsightNote {
  id: number;
  userId?: number;
  articleId?: number;
  articleTitle: string;
  articleSlug: string;
  content: string;
  isCustom: boolean;
  createdAt: string;
}

// ============================================================================
// API Functions
// ============================================================================

/**
 * Get key insights for an article (3 insights)
 * Auth: Optional (for reading level adjustment)
 *
 * @param slug - Article slug
 * @returns Insights data
 */
export const getInsights = async (slug: string) => {
  const response = await api.get<{
    success: boolean;
    message: string;
    data: InsightsResponse;
  }>(`/articles/${slug}/insights`);

  return response.data;
};

/**
 * Save insight note for an article
 * Note: If user already saved note for this article, it will UPDATE (not create new)
 * Auth: Required
 *
 * @param slug - Article slug
 * @param content - Note content (min 5 chars, max 1000 chars)
 * @param isCustom - Whether user wrote it themselves or selected from suggestions
 * @returns Saved note data
 */
export const saveInsightNote = async (
  slug: string,
  content: string,
  isCustom: boolean = false
) => {
  const response = await api.post<{
    success: boolean;
    message: string;
    data: InsightNote;
  }>(`/articles/${slug}/notes`, {
    content,
    isCustom,
  });

  return response.data;
};

/**
 * Get all insight notes for current user
 * Auth: Required
 *
 * @returns Array of user's insight notes
 */
export const getUserInsightNotes = async () => {
  console.log('[INSIGHTS_API] Calling GET /articles/notes');

  const response = await api.get<{
    success: boolean;
    message: string;
    data: InsightNote[];
  }>('/articles/notes');

  console.log('[INSIGHTS_API] Response status:', response.status);
  console.log('[INSIGHTS_API] Response data:', response.data);

  return response.data;
};

/**
 * Get insight note for specific article
 * Auth: Required
 *
 * @param slug - Article slug
 * @returns User's note for this article (if exists)
 */
export const getUserInsightNoteByArticle = async (slug: string) => {
  const response = await api.get<{
    success: boolean;
    message: string;
    data: InsightNote[];
  }>(`/articles/${slug}/notes`);

  return response.data;
};

/**
 * Delete insight note
 * Auth: Required
 *
 * @param noteId - Note ID to delete
 * @returns Success response
 */
export const deleteInsightNote = async (noteId: number) => {
  const response = await api.delete<{
    success: boolean;
    message: string;
    data: {
      success: boolean;
      message: string;
    };
  }>(`/articles/notes/${noteId}`);

  return response.data;
};

// ============================================================================
// Export all
// ============================================================================

export const insightsApi = {
  getInsights,
  saveInsightNote,
  getUserInsightNotes,
  getUserInsightNoteByArticle,
  deleteInsightNote,
};

import api from './api';
import { notesApi, Note } from './notesApi';

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

// NOTE: Using unified Note type from notesApi
// For backward compatibility, we export it as InsightNote
export type InsightNote = Note;

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
 * Uses unified Notes API - creates article note
 * Auth: Required
 *
 * @param slug - Article slug
 * @param content - Note content (min 1 char, max 10000 chars)
 * @param _isCustom - (Deprecated) Whether user wrote it themselves - always true now
 * @returns Saved note data
 */
export const saveInsightNote = async (
  slug: string,
  content: string,
  _isCustom: boolean = true // Deprecated parameter, kept for compatibility
) => {
  // Use unified Notes API
  return notesApi.createArticleNote(slug, content);
};

/**
 * Get all insight notes for current user (all notes - article notes + standalone notes)
 * Uses unified Notes API
 * Auth: Required
 *
 * @returns Array of all user's notes (both article notes and standalone notes)
 */
export const getUserInsightNotes = async () => {

  // Get all notes (both article notes and standalone notes)
  const response = await notesApi.getAllNotes();

  if (response.success && response.data) {

    return {
      success: true,
      message: response.message,
      data: response.data,
    };
  }

  return response;
};

/**
 * Get insight note for specific article
 * Uses unified Notes API with articleSlug filter
 * Auth: Required
 *
 * @param slug - Article slug
 * @returns User's notes for this article (array)
 */
export const getUserInsightNoteByArticle = async (slug: string) => {

  // Use unified Notes API with articleSlug filter
  const response = await notesApi.getArticleNotes(slug);

  return response;
};

/**
 * Delete insight note
 * Uses unified Notes API
 * Auth: Required
 *
 * @param noteId - Note ID to delete (UUID string)
 * @returns Success response
 */
export const deleteInsightNote = async (noteId: string | number) => {

  // Convert to string if number (for backward compatibility)
  const noteIdStr = String(noteId);

  // Use unified Notes API
  return notesApi.deleteNote(noteIdStr);
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

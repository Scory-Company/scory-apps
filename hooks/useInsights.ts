import { useState, useCallback, useEffect } from 'react';
import { insightsApi, InsightsResponse, InsightNote } from '@/services';

interface UseInsightsReturn {
  // Data
  insights: InsightsResponse | null;
  userNote: InsightNote | null;

  // Loading states
  isLoadingInsights: boolean;
  isLoadingNote: boolean;
  isSavingNote: boolean;

  // Error states
  insightsError: string | null;
  noteError: string | null;

  // Actions
  fetchInsights: () => Promise<void>;
  fetchUserNote: () => Promise<void>;
  saveNote: (content: string, isCustom?: boolean) => Promise<boolean>;
  deleteNote: () => Promise<boolean>;

  // Helper
  hasUserNote: boolean;
}

/**
 * Custom hook for managing insights and notes functionality
 *
 * @param articleSlug - The article slug to fetch insights for
 * @param autoFetch - Whether to automatically fetch insights on mount (default: false)
 * @returns Insights state and actions
 *
 * @example
 * ```tsx
 * const { insights, saveNote, isSavingNote } = useInsights('ai-in-healthcare');
 *
 * // Save a note
 * const success = await saveNote('This is a great insight!', true);
 * ```
 */
export const useInsights = (
  articleSlug: string,
  autoFetch: boolean = false
): UseInsightsReturn => {
  // Data state
  const [insights, setInsights] = useState<InsightsResponse | null>(null);
  const [userNote, setUserNote] = useState<InsightNote | null>(null);

  // Loading states
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);
  const [isLoadingNote, setIsLoadingNote] = useState(false);
  const [isSavingNote, setIsSavingNote] = useState(false);

  // Error states
  const [insightsError, setInsightsError] = useState<string | null>(null);
  const [noteError, setNoteError] = useState<string | null>(null);

  /**
   * Fetch insights for the article
   */
  const fetchInsights = useCallback(async () => {
    if (!articleSlug) {
      setInsightsError('Article slug is required');
      return;
    }

    setIsLoadingInsights(true);
    setInsightsError(null);

    try {
      const response = await insightsApi.getInsights(articleSlug);

      if (response.success && response.data) {
        setInsights(response.data);
        const count = response.data.insights?.length || 0;
      } else {
        setInsightsError(response.message || 'Failed to load insights');
      }
    } catch (error: any) {

      if (error.response?.status === 404) {
        setInsightsError('Insights not available for this article');
      } else if (error.response?.status === 500) {
        setInsightsError('Server error loading insights');
      } else {
        setInsightsError(error.response?.data?.message || 'Failed to load insights');
      }
    } finally {
      setIsLoadingInsights(false);
    }
  }, [articleSlug]);

  /**
   * Fetch user's note for this article
   */
  const fetchUserNote = useCallback(async () => {
    if (!articleSlug) {
      return;
    }

    setIsLoadingNote(true);

    try {
      const response = await insightsApi.getUserInsightNoteByArticle(articleSlug);

      if (response.success && response.data && response.data.length > 0) {
        // User has a saved note for this article
        setUserNote(response.data[0]);
      } else {
        setUserNote(null);
      }
    } catch (error: any) {
      // Don't show error to user, just assume no note exists
      setUserNote(null);
    } finally {
      setIsLoadingNote(false);
    }
  }, [articleSlug]);

  /**
   * Save a note for this article
   * Note: Backend will UPDATE if note already exists, not create new
   *
   * @param content - Note content (min 5 chars, max 1000 chars)
   * @param isCustom - Whether user wrote it themselves or selected from suggestions
   * @returns true if save was successful, false otherwise
   */
  const saveNote = useCallback(
    async (content: string, isCustom: boolean = false): Promise<boolean> => {
      if (!articleSlug) {
        setNoteError('Article slug is required');
        return false;
      }

      if (content.length < 5) {
        setNoteError('Note must be at least 5 characters');
        return false;
      }

      if (content.length > 1000) {
        setNoteError('Note must be less than 1000 characters');
        return false;
      }

      setIsSavingNote(true);
      setNoteError(null);

      try {
        const response = await insightsApi.saveInsightNote(articleSlug, content, isCustom);

        if (response.success && response.data) {
          // Optimistically update local state
          setUserNote(response.data);
          return true;
        } else {
          setNoteError(response.message || 'Failed to save note');
          return false;
        }
      } catch (error: any) {

        if (error.response?.status === 401) {
          setNoteError('Please login to save notes');
        } else if (error.response?.status === 400) {
          setNoteError(error.response?.data?.message || 'Invalid note content');
        } else {
          setNoteError(error.response?.data?.message || 'Failed to save note');
        }

        return false;
      } finally {
        setIsSavingNote(false);
      }
    },
    [articleSlug]
  );

  /**
   * Delete the user's note for this article
   *
   * @returns true if deletion was successful, false otherwise
   */
  const deleteNote = useCallback(async (): Promise<boolean> => {
    if (!userNote) {
      setNoteError('No note to delete');
      return false;
    }

    setIsSavingNote(true);
    setNoteError(null);

    try {
      // Note: userNote.id is now a UUID string (not number)
      const response = await insightsApi.deleteInsightNote(userNote.id);

      if (response.success) {
        // Optimistically update local state
        setUserNote(null);
        return true;
      } else {
        setNoteError(response.message || 'Failed to delete note');
        return false;
      }
    } catch (error: any) {

      if (error.response?.status === 403) {
        setNoteError('You are not authorized to delete this note');
      } else {
        setNoteError(error.response?.data?.message || 'Failed to delete note');
      }

      return false;
    } finally {
      setIsSavingNote(false);
    }
  }, [userNote]);

  // Auto-fetch on mount if enabled
  useEffect(() => {
    if (autoFetch && articleSlug) {
      fetchInsights();
      fetchUserNote();
    }
  }, [autoFetch, articleSlug, fetchInsights, fetchUserNote]);

  return {
    // Data
    insights,
    userNote,

    // Loading states
    isLoadingInsights,
    isLoadingNote,
    isSavingNote,

    // Error states
    insightsError,
    noteError,

    // Actions
    fetchInsights,
    fetchUserNote,
    saveNote,
    deleteNote,

    // Helper
    hasUserNote: userNote !== null,
  };
};

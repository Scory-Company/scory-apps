import api from './api';

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface StandaloneNote {
  id: string;
  title: string | null;
  content: string;
  isCustom: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateStandaloneNoteRequest {
  title?: string;
  content: string;
}

export interface UpdateStandaloneNoteRequest {
  title?: string;
  content?: string;
}

// ============================================================================
// API Functions
// ============================================================================

/**
 * Create a standalone note (not associated with any article)
 * Auth: Required
 *
 * @param title - Optional note title (max 255 chars)
 * @param content - Note content (min 5 chars, max 5000 chars)
 * @returns Created note data
 */
export const createStandaloneNote = async (title: string | undefined, content: string) => {
  const response = await api.post<{
    success: boolean;
    message: string;
    data: StandaloneNote;
  }>('/notes', {
    title: title || undefined,
    content,
  });

  return response.data;
};

/**
 * Get all user's standalone notes
 * Auth: Required
 *
 * @returns Array of user's standalone notes (sorted by updatedAt DESC)
 */
export const getAllStandaloneNotes = async () => {
  const response = await api.get<{
    success: boolean;
    message: string;
    data: StandaloneNote[];
  }>('/notes');

  return response.data;
};

/**
 * Get single standalone note by ID
 * Auth: Required
 *
 * @param noteId - Note ID
 * @returns Note data
 */
export const getStandaloneNote = async (noteId: string) => {
  const response = await api.get<{
    success: boolean;
    message: string;
    data: StandaloneNote;
  }>(`/notes/${noteId}`);

  return response.data;
};

/**
 * Update standalone note
 * Auth: Required
 *
 * @param noteId - Note ID
 * @param updates - Fields to update (title and/or content)
 * @returns Updated note data
 */
export const updateStandaloneNote = async (
  noteId: string,
  updates: UpdateStandaloneNoteRequest
) => {
  const response = await api.put<{
    success: boolean;
    message: string;
    data: StandaloneNote;
  }>(`/notes/${noteId}`, updates);

  return response.data;
};

/**
 * Delete standalone note
 * Auth: Required
 *
 * @param noteId - Note ID
 * @returns Success response
 */
export const deleteStandaloneNote = async (noteId: string) => {
  const response = await api.delete<{
    success: boolean;
    message: string;
    data: {
      success: boolean;
      message: string;
    };
  }>(`/notes/${noteId}`);

  return response.data;
};

// ============================================================================
// Export all
// ============================================================================

export const standaloneNotesApi = {
  createStandaloneNote,
  getAllStandaloneNotes,
  getStandaloneNote,
  updateStandaloneNote,
  deleteStandaloneNote,
};

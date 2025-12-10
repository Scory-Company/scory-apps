import api from './api';

// ============================================================================
// Types & Interfaces - Unified Notes API
// ============================================================================

/**
 * Unified Note interface
 * Supports both article notes (articleId populated) and standalone notes (articleId = null)
 */
export interface Note {
  id: string; // UUID
  title: string | null; // Optional title (usually for standalone notes)
  content: string; // Note content (required)
  isCustom: boolean; // Always true (user-created)
  articleId: string | null; // NULL = standalone, NOT NULL = article note
  articleTitle: string | null; // Article title (if articleId exists)
  articleSlug: string | null; // Article slug (if articleId exists)
  createdAt: string; // ISO 8601 timestamp
  updatedAt: string; // ISO 8601 timestamp
}

/**
 * Request to create a new note
 */
export interface CreateNoteRequest {
  title?: string; // Optional title (max 255 chars)
  content: string; // Note content (required, min 1, max 10000 chars)
  articleSlug?: string; // Optional article slug (makes it an article note)
}

/**
 * Request to update an existing note
 */
export interface UpdateNoteRequest {
  title?: string; // Optional title
  content?: string; // Optional content
}

/**
 * API Response wrapper
 */
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// ============================================================================
// API Functions
// ============================================================================

/**
 * Create a new note (standalone or article-based)
 * Auth: Required
 *
 * @param data - Note data (content required, title/articleSlug optional)
 * @returns Created note
 *
 * @example
 * // Create standalone note
 * await createNote({ title: "My Note", content: "Note content" });
 *
 * // Create article note
 * await createNote({ content: "My insight", articleSlug: "quantum-computing" });
 */
export const createNote = async (data: CreateNoteRequest) => {
  const response = await api.post<ApiResponse<Note>>('/notes', data);
  return response.data;
};

/**
 * Get all user notes with optional filtering
 * Auth: Required
 *
 * @param options - Filter options
 * @param options.articleSlug - Filter by article slug (get notes for specific article)
 * @param options.standalone - If true, only return standalone notes (articleId = null)
 * @returns Array of notes
 *
 * @example
 * // Get all notes
 * await getAllNotes();
 *
 * // Get standalone notes only
 * await getAllNotes({ standalone: true });
 *
 * // Get notes for specific article
 * await getAllNotes({ articleSlug: "quantum-computing" });
 */
export const getAllNotes = async (options?: {
  articleSlug?: string;
  standalone?: boolean;
}) => {
  const params = new URLSearchParams();

  if (options?.articleSlug) {
    params.append('articleSlug', options.articleSlug);
  }

  if (options?.standalone) {
    params.append('standalone', 'true');
  }

  const url = params.toString() ? `/notes?${params.toString()}` : '/notes';
  const response = await api.get<ApiResponse<Note[]>>(url);

  return response.data;
};

/**
 * Get single note by ID
 * Auth: Required
 *
 * @param noteId - Note ID (UUID)
 * @returns Note data
 *
 * @example
 * await getNoteById("550e8400-e29b-41d4-a716-446655440000");
 */
export const getNoteById = async (noteId: string) => {
  const response = await api.get<ApiResponse<Note>>(`/notes/${noteId}`);
  return response.data;
};

/**
 * Update an existing note
 * Auth: Required
 *
 * @param noteId - Note ID (UUID)
 * @param data - Fields to update (title and/or content)
 * @returns Updated note
 *
 * @example
 * // Update both title and content
 * await updateNote(noteId, { title: "New Title", content: "New content" });
 *
 * // Update content only
 * await updateNote(noteId, { content: "Updated content" });
 */
export const updateNote = async (noteId: string, data: UpdateNoteRequest) => {
  const response = await api.put<ApiResponse<Note>>(`/notes/${noteId}`, data);
  return response.data;
};

/**
 * Delete a note
 * Auth: Required
 *
 * @param noteId - Note ID (UUID)
 * @returns Success response
 *
 * @example
 * await deleteNote("550e8400-e29b-41d4-a716-446655440000");
 */
export const deleteNote = async (noteId: string) => {
  const response = await api.delete<ApiResponse<{ success: boolean; message: string }>>(
    `/notes/${noteId}`
  );
  return response.data;
};

// ============================================================================
// Convenience Functions (Backward Compatibility)
// ============================================================================

/**
 * Create a standalone note (not linked to any article)
 *
 * @param title - Note title (optional)
 * @param content - Note content (required)
 * @returns Created note
 */
export const createStandaloneNote = async (title: string | undefined, content: string) => {
  return createNote({ title, content });
};

/**
 * Create an article note (linked to an article)
 *
 * @param articleSlug - Article slug
 * @param content - Note content
 * @returns Created note
 */
export const createArticleNote = async (articleSlug: string, content: string) => {
  return createNote({ content, articleSlug });
};

/**
 * Get all standalone notes (not linked to articles)
 *
 * @returns Array of standalone notes
 */
export const getStandaloneNotes = async () => {
  return getAllNotes({ standalone: true });
};

/**
 * Get all notes for a specific article
 *
 * @param articleSlug - Article slug
 * @returns Array of notes for the article
 */
export const getArticleNotes = async (articleSlug: string) => {
  return getAllNotes({ articleSlug });
};

// ============================================================================
// Export all
// ============================================================================

export const notesApi = {
  // Core CRUD operations
  createNote,
  getAllNotes,
  getNoteById,
  updateNote,
  deleteNote,

  // Convenience functions
  createStandaloneNote,
  createArticleNote,
  getStandaloneNotes,
  getArticleNotes,
};

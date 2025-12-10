import { notesApi, Note } from './notesApi';

// ============================================================================
// Types & Interfaces
// ============================================================================

// NOTE: Using unified Note type from notesApi
// For backward compatibility, we export it as StandaloneNote
export type StandaloneNote = Note;

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
 * Uses unified Notes API
 * Auth: Required
 *
 * @param title - Optional note title (max 255 chars)
 * @param content - Note content (min 1 char, max 10000 chars)
 * @returns Created note data
 */
export const createStandaloneNote = async (title: string | undefined, content: string) => {
  // Use unified Notes API
  return notesApi.createStandaloneNote(title, content);
};

/**
 * Get all user's standalone notes
 * Uses unified Notes API with standalone filter
 * Auth: Required
 *
 * @returns Array of user's standalone notes (sorted by updatedAt DESC)
 */
export const getAllStandaloneNotes = async () => {
  // Use unified Notes API with standalone filter
  return notesApi.getStandaloneNotes();
};

/**
 * Get single standalone note by ID
 * Uses unified Notes API
 * Auth: Required
 *
 * @param noteId - Note ID (UUID)
 * @returns Note data
 */
export const getStandaloneNote = async (noteId: string) => {
  // Use unified Notes API
  return notesApi.getNoteById(noteId);
};

/**
 * Update standalone note
 * Uses unified Notes API
 * Auth: Required
 *
 * @param noteId - Note ID (UUID)
 * @param updates - Fields to update (title and/or content)
 * @returns Updated note data
 */
export const updateStandaloneNote = async (
  noteId: string,
  updates: UpdateStandaloneNoteRequest
) => {
  // Use unified Notes API
  return notesApi.updateNote(noteId, updates);
};

/**
 * Delete standalone note
 * Uses unified Notes API
 * Auth: Required
 *
 * @param noteId - Note ID (UUID)
 * @returns Success response
 */
export const deleteStandaloneNote = async (noteId: string) => {
  // Use unified Notes API
  return notesApi.deleteNote(noteId);
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

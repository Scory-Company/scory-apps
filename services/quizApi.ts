import api from './api';

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface QuizQuestion {
  id: string | number; // UUID string (new) or number (legacy)
  articleId: number;
  questionId?: string; // Alternative field name (same as id, UUID string)
  question: string;
  options: string[];
  correctIndex: number;
  order: number;
}

export interface QuizQuestionsResponse {
  articleId: string;
  articleTitle: string;
  articleSlug: string;
  readingLevel: string;
  questions: QuizQuestion[];
}

export interface QuizAnswer {
  questionId: string | number; // Accept both string and number
  selectedAnswer: string; // "A", "B", "C", or "D"
}

export interface QuizSubmitRequest {
  answers: QuizAnswer[];
}

export interface QuizAnswerResult {
  questionId: string;
  question: string;
  selectedAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  explanation: string;
}

export interface QuizSubmitResponse {
  attemptId: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  answers: QuizAnswerResult[];
  completedAt: string;
}

export interface QuizAttempt {
  id: number;
  userId: number;
  articleId: number;
  score: number;
  totalQuestions: number;
  completedAt: string;
}

// ============================================================================
// API Functions
// ============================================================================

/**
 * Get quiz questions for an article (3 questions)
 * Auth: Optional (for reading level adjustment)
 *
 * @param slug - Article slug
 * @returns Quiz questions data
 */
export const getQuizQuestions = async (slug: string) => {
  const response = await api.get<{
    success: boolean;
    message: string;
    data: QuizQuestionsResponse;
  }>(`/articles/${slug}/quiz`);

  return response.data;
};

/**
 * Submit quiz answers and get grading results
 * Auth: Required
 *
 * @param slug - Article slug
 * @param answers - Array of 3 answers
 * @returns Quiz results with score and explanations
 */
export const submitQuiz = async (slug: string, answers: QuizAnswer[]) => {
  const response = await api.post<{
    success: boolean;
    message: string;
    data: QuizSubmitResponse;
  }>(`/articles/${slug}/quiz`, { answers });

  return response.data;
};

/**
 * Get all quiz attempts for current user
 * Auth: Required
 *
 * @returns Array of quiz attempts
 */
export const getUserQuizAttempts = async () => {
  const response = await api.get<{
    success: boolean;
    message: string;
    data: QuizAttempt[];
  }>('/articles/quiz/attempts');

  return response.data;
};

/**
 * Get quiz attempts for specific article
 * Auth: Required
 *
 * @param slug - Article slug
 * @returns Array of quiz attempts for this article
 */
export const getUserQuizAttemptsByArticle = async (slug: string) => {
  const response = await api.get<{
    success: boolean;
    message: string;
    data: QuizAttempt[];
  }>(`/articles/${slug}/quiz/attempts`);

  return response.data;
};

// ============================================================================
// Export all
// ============================================================================

export const quizApi = {
  getQuizQuestions,
  submitQuiz,
  getUserQuizAttempts,
  getUserQuizAttemptsByArticle,
};

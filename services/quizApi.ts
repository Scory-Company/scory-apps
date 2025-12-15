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
  readingTime?: number; // NEW: Reading time in minutes
}

export interface QuizAnswerResult {
  questionId: string;
  question: string;
  selectedAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  explanation: string;
}

export interface GamificationResult {
  completionType: 'verified' | 'basic' | 'rejected';
  streakUpdated: boolean;
  newStreak?: number;
  weeklyGoalProgress?: {
    completed: number;
    target: number;
  };
}

export interface QuizSubmitResponse {
  attemptId: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  answers: QuizAnswerResult[];
  completedAt: string;
  gamification?: GamificationResult; // NEW: Gamification result
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
 * @param readingLevel - Optional reading level to get quiz for specific level
 * @returns Quiz questions data
 */
export const getQuizQuestions = async (slug: string, readingLevel?: string) => {
  try {
    // Build query params
    const params = new URLSearchParams();
    if (readingLevel) {
      params.append('readingLevel', readingLevel);
    }

    const url = `/articles/${slug}/quiz${params.toString() ? `?${params}` : ''}`;

    const response = await api.get<{
      success: boolean;
      message: string;
      data: QuizQuestionsResponse;
    }>(url);

    return response.data;
  } catch (error: any) {
    // Handle 404 gracefully (quiz not available is expected)
    if (error.response?.status === 404) {
      return {
        success: false,
        message: 'Quiz not available for this article',
        data: null as any, // Will be handled in the hook
      };
    }
    // Re-throw other errors
    throw error;
  }
};

/**
 * Submit quiz answers and get grading results
 * Auth: Required
 *
 * @param slug - Article slug
 * @param answers - Array of 3 answers
 * @param readingTime - Optional reading time in minutes (triggers gamification)
 * @returns Quiz results with score, explanations, and gamification result
 */
export const submitQuiz = async (slug: string, answers: QuizAnswer[], readingTime?: number) => {
  const payload: QuizSubmitRequest = { answers };

  // Include readingTime if provided (enables gamification)
  if (readingTime !== undefined) {
    payload.readingTime = readingTime;
  }

  const response = await api.post<{
    success: boolean;
    message: string;
    data: QuizSubmitResponse;
  }>(`/articles/${slug}/quiz`, payload);

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

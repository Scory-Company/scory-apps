import { useState, useCallback } from 'react';
import { quizApi, QuizAnswer, QuizQuestionsResponse, QuizSubmitResponse } from '@/services';
import type { GamificationResult } from '@/types/gamification';

interface UseQuizReturn {
  // Data
  questions: QuizQuestionsResponse | null;
  results: QuizSubmitResponse | null;

  // Loading states
  isLoadingQuestions: boolean;
  isSubmitting: boolean;

  // Error states
  questionsError: string | null;
  submitError: string | null;

  // Actions
  fetchQuestions: () => Promise<void>;
  submitQuiz: (answers: QuizAnswer[], readingTime?: number) => Promise<GamificationResult | null>;
  resetQuiz: () => void;
}

interface UseQuizOptions {
  onError?: (message: string) => void;
}

/**
 * Custom hook for managing quiz functionality
 *
 * @param articleSlug - The article slug to fetch quiz for
 * @param options - Optional configuration including error callback
 * @returns Quiz state and actions
 *
 * @example
 * ```tsx
 * const { questions, fetchQuestions, submitQuiz, isLoadingQuestions } = useQuiz('ai-in-healthcare', {
 *   onError: (message) => toast.error(message)
 * });
 *
 * // Fetch questions
 * await fetchQuestions();
 *
 * // Submit quiz
 * const success = await submitQuiz([
 *   { questionId: 'q1', selectedAnswer: 'A' },
 *   { questionId: 'q2', selectedAnswer: 'B' },
 *   { questionId: 'q3', selectedAnswer: 'C' },
 * ]);
 * ```
 */
export const useQuiz = (articleSlug: string, options?: UseQuizOptions): UseQuizReturn => {

  // Data state
  const [questions, setQuestions] = useState<QuizQuestionsResponse | null>(null);
  const [results, setResults] = useState<QuizSubmitResponse | null>(null);

  // Loading states
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Error states
  const [questionsError, setQuestionsError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  /**
   * Fetch quiz questions for the article
   */
  const fetchQuestions = useCallback(async () => {
    if (!articleSlug) {
      setQuestionsError('Article slug is required');
      return;
    }

    setIsLoadingQuestions(true);
    setQuestionsError(null);

    try {
      console.log('[QUIZ] Fetching questions for:', articleSlug);
      const response = await quizApi.getQuizQuestions(articleSlug);

      if (response.success && response.data) {
        setQuestions(response.data);
        console.log('[QUIZ] Questions loaded:', response.data.questions.length);
      } else {
        // Quiz not available (404 handled gracefully by API)
        console.log('[QUIZ] Quiz not available for this article');
        setQuestionsError(null); // Don't show error, just show empty state
        setQuestions(null); // Will show "No quiz available"
      }
    } catch (error: any) {
      // Handle remaining errors (401, 500, etc.)
      if (error.response?.status === 401) {
        console.warn('[QUIZ] Unauthorized:', error);
        const errorMsg = 'Please login to take the quiz';
        setQuestionsError(errorMsg);
        options?.onError?.(errorMsg);
      } else {
        console.error('[QUIZ] Error fetching questions:', error);
        const errorMsg = error.response?.data?.message || 'Failed to load quiz questions';
        setQuestionsError(errorMsg);
        options?.onError?.(errorMsg);
      }
    } finally {
      setIsLoadingQuestions(false);
    }
  }, [articleSlug]); // Removed 'options' from dependency to prevent re-creation

  /**
   * Submit quiz answers and get results
   *
   * @param answers - Array of quiz answers (must be exactly 3)
   * @param readingTime - Optional reading time in minutes (triggers gamification)
   * @returns GamificationResult if successful and present, null otherwise
   */
  const submitQuiz = useCallback(
    async (answers: QuizAnswer[], readingTime?: number): Promise<GamificationResult | null> => {
      if (!articleSlug) {
        setSubmitError('Article slug is required');
        return null;
      }

      if (answers.length !== 3) {
        setSubmitError(`Expected 3 answers, got ${answers.length}`);
        return null;
      }

      setIsSubmitting(true);
      setSubmitError(null);

      try {
        console.log('[QUIZ] Submitting answers:', JSON.stringify(answers, null, 2));
        if (readingTime !== undefined) {
          console.log('[QUIZ] Reading time:', readingTime, 'minutes');
        }

        const response = await quizApi.submitQuiz(articleSlug, answers, readingTime);

        if (response.success && response.data) {
          setResults(response.data);
          console.log('[QUIZ] Quiz submitted! Score:', response.data.score, '/', response.data.totalQuestions);

          // Log and return gamification result if present
          if (response.data.gamification) {
            console.log('[QUIZ] Gamification result:', JSON.stringify(response.data.gamification, null, 2));
            return response.data.gamification;
          }

          return null;
        } else {
          setSubmitError(response.message || 'Failed to submit quiz');
          return null;
        }
      } catch (error: any) {
        console.error('[QUIZ] Error submitting quiz:', error);
        console.error('[QUIZ] Error response:', JSON.stringify(error.response?.data, null, 2));
        console.error('[QUIZ] Request payload:', JSON.stringify({ answers, readingTime }, null, 2));

        let errorMessage = 'Failed to submit quiz';

        if (error.response?.status === 401) {
          errorMessage = 'Please login to submit the quiz';
        } else if (error.response?.status === 400) {
          // Validation error - extract specific error messages
          const responseData = error.response?.data;

          if (responseData?.errors) {
            // If there are specific field errors, show the first one
            const firstErrorField = Object.keys(responseData.errors)[0];
            const firstErrorMessage = responseData.errors[firstErrorField]?.[0];

            if (firstErrorMessage) {
              errorMessage = firstErrorMessage;
            } else {
              errorMessage = responseData?.message || 'Validation error';
            }
          } else {
            errorMessage = responseData?.message || 'Invalid quiz submission';
          }

          console.error('[QUIZ] 400 Validation Error:', errorMessage);
        } else {
          errorMessage = error.response?.data?.message || 'Failed to submit quiz';
        }

        setSubmitError(errorMessage);
        options?.onError?.(errorMessage);

        return null;
      } finally {
        setIsSubmitting(false);
      }
    },
    [articleSlug] // Removed 'options' from dependency to prevent re-creation
  );

  /**
   * Reset quiz state to allow retaking
   */
  const resetQuiz = useCallback(() => {
    setResults(null);
    setSubmitError(null);
    console.log('[QUIZ] Quiz reset');
  }, []);

  return {
    // Data
    questions,
    results,

    // Loading states
    isLoadingQuestions,
    isSubmitting,

    // Error states
    questionsError,
    submitError,

    // Actions
    fetchQuestions,
    submitQuiz,
    resetQuiz,
  };
};

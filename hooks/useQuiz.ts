import { useState, useCallback } from 'react';
import { quizApi, QuizAnswer, QuizQuestionsResponse, QuizSubmitResponse } from '@/services';

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
  submitQuiz: (answers: QuizAnswer[]) => Promise<boolean>;
  resetQuiz: () => void;
}

/**
 * Custom hook for managing quiz functionality
 *
 * @param articleSlug - The article slug to fetch quiz for
 * @returns Quiz state and actions
 *
 * @example
 * ```tsx
 * const { questions, fetchQuestions, submitQuiz, isLoadingQuestions } = useQuiz('ai-in-healthcare');
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
export const useQuiz = (articleSlug: string): UseQuizReturn => {
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
        setQuestionsError(response.message || 'Failed to load quiz questions');
      }
    } catch (error: any) {
      console.error('[QUIZ] Error fetching questions:', error);

      if (error.response?.status === 404) {
        setQuestionsError('Quiz not available for this article');
      } else if (error.response?.status === 401) {
        setQuestionsError('Please login to take the quiz');
      } else {
        setQuestionsError(error.response?.data?.message || 'Failed to load quiz questions');
      }
    } finally {
      setIsLoadingQuestions(false);
    }
  }, [articleSlug]);

  /**
   * Submit quiz answers and get results
   *
   * @param answers - Array of quiz answers (must be exactly 3)
   * @returns true if submission was successful, false otherwise
   */
  const submitQuiz = useCallback(
    async (answers: QuizAnswer[]): Promise<boolean> => {
      if (!articleSlug) {
        setSubmitError('Article slug is required');
        return false;
      }

      if (answers.length !== 3) {
        setSubmitError(`Expected 3 answers, got ${answers.length}`);
        return false;
      }

      setIsSubmitting(true);
      setSubmitError(null);

      try {
        console.log('[QUIZ] Submitting answers:', JSON.stringify(answers, null, 2));
        const response = await quizApi.submitQuiz(articleSlug, answers);

        if (response.success && response.data) {
          setResults(response.data);
          console.log('[QUIZ] Quiz submitted! Score:', response.data.score, '/', response.data.totalQuestions);
          return true;
        } else {
          setSubmitError(response.message || 'Failed to submit quiz');
          return false;
        }
      } catch (error: any) {
        console.error('[QUIZ] Error submitting quiz:', error);
        console.error('[QUIZ] Error response:', JSON.stringify(error.response?.data, null, 2));
        console.error('[QUIZ] Request payload:', JSON.stringify({ answers }, null, 2));

        if (error.response?.status === 401) {
          setSubmitError('Please login to submit the quiz');
        } else if (error.response?.status === 400) {
          const errorMessage = error.response?.data?.message || 'Invalid quiz submission';
          console.error('[QUIZ] 400 Error:', errorMessage);
          setSubmitError(errorMessage);
        } else {
          setSubmitError(error.response?.data?.message || 'Failed to submit quiz');
        }

        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [articleSlug]
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

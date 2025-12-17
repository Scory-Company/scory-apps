import { useToast } from '@/features/shared/hooks/useToast';
import {
  hasFeedbackForArticle,
  submitArticleFeedback,
} from '@/services/feedbackService';
import { useCallback, useEffect, useState } from 'react';
import { FeedbackFormData, FeedbackTrigger } from '../types/feedback';
import { router } from 'expo-router';

interface UseArticleFeedbackProps {
  articleId: string;
  readingTime?: number; // In seconds
  quizScore?: number;
}

interface UseArticleFeedbackReturn {
  // State
  showFeedbackModal: boolean;
  showQuickFeedback: boolean;
  feedbackTrigger: FeedbackTrigger | null;
  hasFeedback: boolean;

  // Actions
  triggerFeedbackAfterQuiz: (score?: number) => void;
  triggerQuickFeedback: () => boolean;
  triggerManualFeedback: () => void;
  handleFeedbackSubmit: (data: FeedbackFormData) => Promise<void>;
  handleQuickFeedbackSubmit: (rating: number) => Promise<void>;
  closeFeedbackModal: () => void;
  closeQuickFeedback: () => void;
}

/**
 * Hook to manage article feedback flow
 * Handles both full modal (after quiz) and quick feedback (exit intent)
 */
export const useArticleFeedback = ({
  articleId,
  readingTime = 0,
  quizScore,
}: UseArticleFeedbackProps): UseArticleFeedbackReturn => {
  const { showToast } = useToast();

  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showQuickFeedback, setShowQuickFeedback] = useState(false);
  const [feedbackTrigger, setFeedbackTrigger] = useState<FeedbackTrigger | null>(null);
  const [hasFeedback, setHasFeedback] = useState(false);
  const [currentQuizScore, setCurrentQuizScore] = useState<number | undefined>(quizScore);

  // Check if user has already given feedback for this article
  useEffect(() => {
    const checkFeedbackStatus = async () => {
      const hasGivenFeedback = await hasFeedbackForArticle(articleId);
      setHasFeedback(hasGivenFeedback);
    };

    checkFeedbackStatus();
  }, [articleId]);

  /**
   * Trigger full feedback modal after quiz completion
   */
  const triggerFeedbackAfterQuiz = useCallback(
    (score?: number) => {
      if (hasFeedback) {
        return;
      }

      console.log('🎯 Triggering feedback after quiz completion');
      setCurrentQuizScore(score);
      setFeedbackTrigger('quiz_completion');

      // Show modal after 2 second delay
      setTimeout(() => {
        setShowFeedbackModal(true);
      }, 2000);
    },
    [hasFeedback]
  );

  /**
   * Trigger quick feedback on exit intent
   * Returns true if feedback was triggered (blocks navigation)
   * Returns false if feedback not triggered (allows navigation)
   */
  const triggerQuickFeedback = useCallback((): boolean => {
    if (hasFeedback) {
      return false;
    }

    // Only show if user has read for at least 10 seconds (reduced from 60 for better UX)
    // TODO: Consider A/B testing this threshold (10s vs 30s vs 60s)
    if (readingTime < 10) {
      console.log('⏭️ Reading time too short for feedback request');
      return false;
    }

    console.log('🚪 Triggering quick feedback on exit intent');
    setFeedbackTrigger('exit_intent');
    setShowQuickFeedback(true);
    return true;
  }, [hasFeedback, readingTime]);

  /**
   * Trigger manual feedback (from feedback card)
   */
  const triggerManualFeedback = useCallback(() => {
    console.log('👆 Triggering manual feedback from card');
    setFeedbackTrigger('manual');
    setShowFeedbackModal(true);
  }, []);

  /**
   * Handle full feedback modal submission
   */
  const handleFeedbackSubmit = useCallback(
    async (data: FeedbackFormData) => {
      try {
        await submitArticleFeedback({
          articleId,
          rating: data.rating,
          quizRelevant: data.quizRelevant,
          improvementText: data.improvementText,
          trigger: feedbackTrigger || 'quiz_completion',
          quizScore: currentQuizScore,
          readingTime,
        });

        setHasFeedback(true);
        showToast({ type: 'success', message: 'Thank you for your feedback! 🎉' });
        console.log('✅ Feedback submitted successfully');

        // Navigate to explore after feedback submission
        setTimeout(() => {
          router.push('/(tabs)/explore');
        }, 1000); // Small delay to show toast
      } catch (error) {
        console.error('❌ Error submitting feedback:', error);
        showToast({ type: 'error', message: 'Failed to submit feedback. Please try again.' });
        throw error;
      }
    },
    [articleId, feedbackTrigger, currentQuizScore, readingTime, showToast]
  );

  /**
   * Handle quick feedback submission
   */
  const handleQuickFeedbackSubmit = useCallback(
    async (rating: number) => {
      try {
        await submitArticleFeedback({
          articleId,
          rating,
          trigger: 'exit_intent',
          readingTime,
        });

        setHasFeedback(true);
        showToast({ type: 'success', message: 'Thanks for the quick rating! ⭐' });
        console.log('✅ Quick feedback submitted');
      } catch (error) {
        console.error('❌ Error submitting quick feedback:', error);
        showToast({ type: 'error', message: 'Failed to submit rating.' });
        throw error;
      }
    },
    [articleId, readingTime, showToast]
  );

  /**
   * Close feedback modal
   */
  const closeFeedbackModal = useCallback(() => {
    setShowFeedbackModal(false);
    setFeedbackTrigger(null);
  }, []);

  /**
   * Close quick feedback
   */
  const closeQuickFeedback = useCallback(() => {
    setShowQuickFeedback(false);
    setFeedbackTrigger(null);
  }, []);

  return {
    // State
    showFeedbackModal,
    showQuickFeedback,
    feedbackTrigger,
    hasFeedback,

    // Actions
    triggerFeedbackAfterQuiz,
    triggerQuickFeedback,
    triggerManualFeedback,
    handleFeedbackSubmit,
    handleQuickFeedbackSubmit,
    closeFeedbackModal,
    closeQuickFeedback,
  };
};

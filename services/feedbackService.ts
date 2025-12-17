import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  ArticleFeedback,
  FeedbackHistory,
  FeedbackSubmitParams,
} from '@/features/article/types/feedback';
import api from './api';

// Local storage key for feedback history (to track which articles user has given feedback on)
const FEEDBACK_HISTORY_KEY = '@scory_feedback_history';

/**
 * API Service for Article Feedback
 * Integrated with backend API
 */

/**
 * Submit article feedback to backend API
 */
export const submitArticleFeedback = async (
  params: FeedbackSubmitParams
): Promise<ArticleFeedback> => {
  try {
    console.log('📤 Submitting feedback to API:', params);

    // Call backend API
    const response = await api.post('/feedback/article', params);

    // Extract feedback data from response
    const feedbackData = response.data?.data;

    if (!feedbackData) {
      throw new Error('Invalid response from server');
    }

    // Convert timestamp string to Date object
    const feedback: ArticleFeedback = {
      ...feedbackData,
      timestamp: new Date(feedbackData.createdAt || feedbackData.timestamp),
    };

    // Update local feedback history (for quick UI checks)
    await markFeedbackGiven(params.articleId);

    console.log('✅ Feedback submitted successfully:', feedback.id);
    return feedback;
  } catch (error: any) {
    console.error('❌ Error submitting feedback:', error);

    // Handle specific error cases
    if (error.response?.status === 409) {
      // Duplicate feedback - user already submitted
      console.log('⚠️ User already submitted feedback for this article');
      await markFeedbackGiven(params.articleId); // Update local cache
      throw new Error('You have already submitted feedback for this article');
    } else if (error.response?.status === 404) {
      throw new Error('Article not found');
    } else if (error.response?.status === 401) {
      throw new Error('Please login to submit feedback');
    } else if (error.response?.status === 400) {
      const message = error.response?.data?.message || 'Invalid feedback data';
      throw new Error(message);
    }

    // Generic error
    throw new Error('Failed to submit feedback. Please try again.');
  }
};

/**
 * Check if user has given feedback for an article
 */
export const hasFeedbackForArticle = async (articleId: string): Promise<boolean> => {
  try {
    const historyData = await AsyncStorage.getItem(FEEDBACK_HISTORY_KEY);
    if (!historyData) return false;

    const history: FeedbackHistory = JSON.parse(historyData);
    return history[articleId]?.hasFeedback || false;
  } catch (error) {
    console.error('❌ Error checking feedback history:', error);
    return false;
  }
};

/**
 * Mark that user has given feedback for an article
 */
const markFeedbackGiven = async (articleId: string): Promise<void> => {
  try {
    const historyData = await AsyncStorage.getItem(FEEDBACK_HISTORY_KEY);
    const history: FeedbackHistory = historyData ? JSON.parse(historyData) : {};

    history[articleId] = {
      hasFeedback: true,
      timestamp: new Date(),
    };

    await AsyncStorage.setItem(FEEDBACK_HISTORY_KEY, JSON.stringify(history));
  } catch (error) {
    console.error('❌ Error marking feedback given:', error);
  }
};

/**
 * Clear local feedback history
 * Useful for testing or when user logs out
 */
export const clearFeedbackHistory = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(FEEDBACK_HISTORY_KEY);
    console.log('✅ Feedback history cleared');
  } catch (error) {
    console.error('❌ Error clearing feedback history:', error);
  }
};

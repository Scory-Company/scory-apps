export type FeedbackTrigger = 'quiz_completion' | 'exit_intent' | 'manual';

export interface ArticleFeedback {
  id: string;
  articleId: string;
  userId: string;
  rating: number; // 1-5 stars
  quizRelevant?: boolean; // Only for quiz_completion trigger
  improvementText?: string; // Optional text feedback
  trigger: FeedbackTrigger;
  quizScore?: number; // Context: user's quiz score
  readingTime?: number; // In seconds
  timestamp: Date;
}

export interface FeedbackFormData {
  rating: number;
  quizRelevant?: boolean;
  improvementText?: string;
}

export interface FeedbackSubmitParams {
  articleId: string;
  rating: number;
  quizRelevant?: boolean;
  improvementText?: string;
  trigger: FeedbackTrigger;
  quizScore?: number;
  readingTime?: number;
}

export interface FeedbackHistory {
  [articleId: string]: {
    hasFeedback: boolean;
    timestamp: Date;
  };
}

/**
 * Gamification Type Definitions
 * Based on backend API documentation (docs/GAMIFICATION_IMPLEMENTATION_SUMMARY.md)
 */

/**
 * User's gamification statistics
 * GET /api/v1/user/gamification/stats
 */
export interface GamificationStats {
  streak: {
    current: number;
    longest: number;
  };
  articlesRead: {
    total: number;
    thisWeek: number;
    today: number;
  };
  readingTime: {
    totalMinutes: number;
    thisWeek: number;
  };
}

/**
 * Weekly reading goal
 * GET /api/v1/user/gamification/weekly-goal
 */
export interface WeeklyGoal {
  target: number;
  completed: number;
  daysLeft: number;
  isActive: boolean;
}

/**
 * Gamification result from activity recording
 * Returned when completing an article (via quiz or manual record)
 */
export interface GamificationResult {
  completionType: 'verified' | 'basic' | 'rejected';
  streakUpdated: boolean;
  newStreak?: number;
  weeklyGoalProgress?: {
    completed: number;
    target: number;
  };
}

/**
 * Activity recording request payload
 * POST /api/v1/user/gamification/record-activity
 */
export interface RecordActivityRequest {
  articleId: string;
  readingTime: number; // minutes
  quizScore?: number; // 0-3, optional
  progressPercentage: number; // 0-100
}

/**
 * API Response Types
 */

export interface GetGamificationStatsResponse {
  success: boolean;
  data: GamificationStats;
}

export interface GetWeeklyGoalResponse {
  success: boolean;
  data: {
    goal: WeeklyGoal;
  };
}

export interface UpdateWeeklyGoalRequest {
  target: number; // 1-50
}

export interface UpdateWeeklyGoalResponse {
  success: boolean;
  data: {
    goal: WeeklyGoal;
  };
}

export interface RecordActivityResponse {
  success: boolean;
  data: GamificationResult;
}

export interface GamificationApiErrorResponse {
  success: false;
  error: string;
}

/**
 * Completion type descriptions for UI messaging
 */
export const COMPLETION_TYPE_MESSAGES = {
  verified: '🔥 Great job! Streak updated!',
  basic: '⚡ Article completed! Read more carefully next time to earn streak points.',
  rejected: '⚠️ Completion not counted. Make sure to read thoroughly.',
} as const;

/**
 * Validation rules (matching backend logic)
 */
export const GAMIFICATION_RULES = {
  MIN_READING_TIME_PERCENTAGE: 0.3, // 30% of estimated time
  VERIFIED_READING_TIME_PERCENTAGE: 0.5, // 50% of estimated time
  MIN_QUIZ_SCORE: 2, // out of 3
  MIN_PROGRESS: 100, // 100% completion required
  WEEKLY_GOAL_MIN: 1,
  WEEKLY_GOAL_MAX: 50,
} as const;

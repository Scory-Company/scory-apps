/**
 * Gamification API Service
 * Handles all API calls related to gamification features
 * Based on backend spec: docs/GAMIFICATION_IMPLEMENTATION_SUMMARY.md
 */

import api from './api';
import type {
  GamificationStats,
  WeeklyGoal,
  GamificationResult,
  RecordActivityRequest,
  GetGamificationStatsResponse,
  GetWeeklyGoalResponse,
  UpdateWeeklyGoalRequest,
  UpdateWeeklyGoalResponse,
  RecordActivityResponse,
} from '@/types/gamification';

const GAMIFICATION_BASE = '/user/gamification';

/**
 * Gamification Service
 * All methods throw errors that should be caught by the caller
 */
export const gamificationService = {
  /**
   * Get user's gamification statistics
   * Includes streak, articles read, and reading time
   * @returns Gamification statistics
   */
  async getStats(): Promise<GamificationStats> {
    try {
      const response = await api.get<GetGamificationStatsResponse>(
        `${GAMIFICATION_BASE}/stats`
      );
      return response.data.data;
    } catch (error: any) {
      console.error('[gamificationService] getStats error:', error);
      throw new Error(error.response?.data?.error || 'Failed to fetch gamification stats');
    }
  },

  /**
   * Get current week's reading goal
   * Week runs from Monday 00:00 to Sunday 23:59 UTC
   * @returns Weekly goal with progress
   */
  async getWeeklyGoal(): Promise<WeeklyGoal> {
    try {
      const response = await api.get<GetWeeklyGoalResponse>(
        `${GAMIFICATION_BASE}/weekly-goal`
      );
      return response.data.data.goal;
    } catch (error: any) {
      console.error('[gamificationService] getWeeklyGoal error:', error);
      throw new Error(error.response?.data?.error || 'Failed to fetch weekly goal');
    }
  },

  /**
   * Set or update weekly reading goal
   * User must explicitly set target (1-50 articles)
   * Goal auto-deactivates when week ends
   * @param target - Number of articles to read this week (1-50)
   * @returns Updated weekly goal
   */
  async updateWeeklyGoal(target: number): Promise<WeeklyGoal> {
    try {
      // Client-side validation
      if (target < 1 || target > 50) {
        throw new Error('Target must be between 1 and 50 articles');
      }

      const response = await api.put<UpdateWeeklyGoalResponse>(
        `${GAMIFICATION_BASE}/weekly-goal`,
        { target } as UpdateWeeklyGoalRequest
      );
      return response.data.data.goal;
    } catch (error: any) {
      console.error('[gamificationService] updateWeeklyGoal error:', error);

      // Handle specific error cases
      if (error.response?.status === 400) {
        throw new Error(error.response?.data?.error || 'Invalid goal target');
      }

      throw new Error(error.response?.data?.error || 'Failed to update weekly goal');
    }
  },

  /**
   * Record article reading activity
   * NOTE: This is usually auto-triggered by quiz submission
   * Only use this for manual completion tracking (if needed)
   *
   * Completion validation rules:
   * - "verified": Progress 100% + time ≥30% + (quiz ≥2 OR time ≥50%) → Earns streak
   * - "basic": Progress 100% + time 30-50% + quiz failed → Stats only, no streak
   * - "rejected": Progress <100% OR time <30% → Not counted
   *
   * @param data - Activity data including reading time and quiz score
   * @returns Gamification result with streak updates
   */
  async recordActivity(data: RecordActivityRequest): Promise<GamificationResult> {
    try {
      const response = await api.post<RecordActivityResponse>(
        `${GAMIFICATION_BASE}/record-activity`,
        data
      );
      return response.data.data;
    } catch (error: any) {
      console.error('[gamificationService] recordActivity error:', error);

      // Handle specific error cases
      if (error.response?.status === 400) {
        throw new Error(error.response?.data?.error || 'Invalid activity data');
      }
      if (error.response?.status === 404) {
        throw new Error('Article not found');
      }

      throw new Error(error.response?.data?.error || 'Failed to record activity');
    }
  },
};

/**
 * Export individual functions for convenience
 */
export const {
  getStats,
  getWeeklyGoal,
  updateWeeklyGoal,
  recordActivity,
} = gamificationService;

/**
 * Default export for consistency with other services
 */
export default gamificationService;

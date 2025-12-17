/**
 * TypeScript Types for Article Feedback API
 *
 * Backend developers can use these types for:
 * - NestJS DTOs
 * - Express request validation
 * - Database models
 * - API response typing
 */

// ============================================================================
// Enums & Constants
// ============================================================================

/**
 * Trigger point for feedback submission
 */
export enum FeedbackTrigger {
  QUIZ_COMPLETION = 'quiz_completion',
  EXIT_INTENT = 'exit_intent',
  MANUAL = 'manual',
}

/**
 * Rating range constants
 */
export const RATING = {
  MIN: 1,
  MAX: 5,
} as const;

/**
 * Text limits
 */
export const LIMITS = {
  IMPROVEMENT_TEXT_MAX_LENGTH: 500,
} as const;

// ============================================================================
// Request DTOs
// ============================================================================

/**
 * DTO for submitting article feedback
 *
 * POST /api/v1/feedback/article
 */
export interface SubmitArticleFeedbackDto {
  articleId: string; // UUID
  rating: number; // 1-5
  quizRelevant?: boolean;
  improvementText?: string; // Max 500 chars
  trigger: FeedbackTrigger;
  quizScore?: number;
  readingTime?: number; // In seconds
}

/**
 * Validation decorators for NestJS (example)
 *
 * import { IsUUID, IsInt, Min, Max, IsOptional, IsString, MaxLength, IsEnum } from 'class-validator';
 *
 * export class SubmitArticleFeedbackDto {
 *   @IsUUID()
 *   articleId: string;
 *
 *   @IsInt()
 *   @Min(1)
 *   @Max(5)
 *   rating: number;
 *
 *   @IsOptional()
 *   @IsBoolean()
 *   quizRelevant?: boolean;
 *
 *   @IsOptional()
 *   @IsString()
 *   @MaxLength(500)
 *   improvementText?: string;
 *
 *   @IsEnum(FeedbackTrigger)
 *   trigger: FeedbackTrigger;
 *
 *   @IsOptional()
 *   @IsInt()
 *   @Min(0)
 *   quizScore?: number;
 *
 *   @IsOptional()
 *   @IsInt()
 *   @Min(1)
 *   readingTime?: number;
 * }
 */

// ============================================================================
// Database Entity
// ============================================================================

/**
 * Database entity for article_feedback table
 */
export interface ArticleFeedbackEntity {
  id: string; // UUID
  articleId: string; // UUID, foreign key to articles
  userId: string; // UUID, foreign key to users
  rating: number; // 1-5
  quizRelevant?: boolean | null;
  improvementText?: string | null;
  trigger: FeedbackTrigger;
  quizScore?: number | null;
  readingTime?: number | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * TypeORM Entity example (if using TypeORM):
 *
 * import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Unique } from 'typeorm';
 *
 * @Entity('article_feedback')
 * @Unique(['userId', 'articleId']) // One feedback per user per article
 * export class ArticleFeedback {
 *   @PrimaryGeneratedColumn('uuid')
 *   id: string;
 *
 *   @Column({ type: 'uuid', name: 'article_id' })
 *   articleId: string;
 *
 *   @Column({ type: 'uuid', name: 'user_id' })
 *   userId: string;
 *
 *   @Column({ type: 'int' })
 *   rating: number;
 *
 *   @Column({ type: 'boolean', nullable: true, name: 'quiz_relevant' })
 *   quizRelevant?: boolean;
 *
 *   @Column({ type: 'text', nullable: true, name: 'improvement_text' })
 *   improvementText?: string;
 *
 *   @Column({ type: 'varchar', length: 20 })
 *   trigger: FeedbackTrigger;
 *
 *   @Column({ type: 'int', nullable: true, name: 'quiz_score' })
 *   quizScore?: number;
 *
 *   @Column({ type: 'int', nullable: true, name: 'reading_time' })
 *   readingTime?: number;
 *
 *   @CreateDateColumn({ name: 'created_at' })
 *   createdAt: Date;
 *
 *   @UpdateDateColumn({ name: 'updated_at' })
 *   updatedAt: Date;
 *
 *   @ManyToOne(() => Article, { onDelete: 'CASCADE' })
 *   @JoinColumn({ name: 'article_id' })
 *   article: Article;
 *
 *   @ManyToOne(() => User, { onDelete: 'CASCADE' })
 *   @JoinColumn({ name: 'user_id' })
 *   user: User;
 * }
 */

// ============================================================================
// Response DTOs
// ============================================================================

/**
 * Success response for feedback submission
 */
export interface SubmitArticleFeedbackResponse {
  success: true;
  message: string;
  data: ArticleFeedbackData;
}

/**
 * Article feedback data in response
 */
export interface ArticleFeedbackData {
  id: string;
  articleId: string;
  userId: string;
  rating: number;
  quizRelevant?: boolean | null;
  improvementText?: string | null;
  trigger: FeedbackTrigger;
  quizScore?: number | null;
  readingTime?: number | null;
  createdAt: string; // ISO 8601 format
}

/**
 * Error response structure
 */
export interface ErrorResponse {
  success: false;
  message: string;
  errors?: ValidationError[];
}

/**
 * Validation error detail
 */
export interface ValidationError {
  field: string;
  message: string;
}

// ============================================================================
// Additional Response Types (for optional endpoints)
// ============================================================================

/**
 * Response for GET /api/v1/feedback/my-feedback
 */
export interface GetUserFeedbackHistoryResponse {
  success: true;
  data: {
    feedbacks: ArticleFeedbackData[];
    pagination: PaginationMeta;
  };
}

/**
 * Pagination metadata
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/**
 * Response for GET /api/v1/feedback/article/:articleId/status
 */
export interface CheckFeedbackStatusResponse {
  success: true;
  data: {
    hasFeedback: boolean;
    feedback?: {
      id: string;
      rating: number;
      createdAt: string;
    } | null;
  };
}

// ============================================================================
// Analytics Types (Optional - for internal use)
// ============================================================================

/**
 * Aggregated feedback statistics per article
 */
export interface ArticleFeedbackStats {
  articleId: string;
  totalFeedbacks: number;
  averageRating: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
  triggerDistribution: {
    quiz_completion: number;
    exit_intent: number;
    manual: number;
  };
  averageReadingTime: number;
  quizRelevanceRate: number; // Percentage of quiz_completion feedbacks that said quiz is relevant
}

/**
 * System-wide feedback analytics
 */
export interface SystemFeedbackAnalytics {
  totalFeedbacks: number;
  averageRating: number;
  feedbackCompletionRate: number; // % of users who gave feedback
  mostCommonTrigger: FeedbackTrigger;
  averageReadingTimeBeforeFeedback: number;
  topRatedArticles: Array<{
    articleId: string;
    articleTitle: string;
    averageRating: number;
    totalFeedbacks: number;
  }>;
}

// ============================================================================
// Service Layer Types
// ============================================================================

/**
 * Service method for creating feedback
 */
export interface CreateFeedbackParams {
  articleId: string;
  userId: string; // Extracted from JWT
  rating: number;
  quizRelevant?: boolean;
  improvementText?: string;
  trigger: FeedbackTrigger;
  quizScore?: number;
  readingTime?: number;
}

/**
 * Service method return type
 */
export type CreateFeedbackResult = ArticleFeedbackEntity;

// ============================================================================
// Query Parameters
// ============================================================================

/**
 * Query params for GET /api/v1/feedback/my-feedback
 */
export interface GetFeedbackHistoryQuery {
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'rating';
  order?: 'ASC' | 'DESC';
}

// ============================================================================
// Validation Helpers
// ============================================================================

/**
 * Helper function to validate rating
 */
export function isValidRating(rating: number): boolean {
  return Number.isInteger(rating) && rating >= RATING.MIN && rating <= RATING.MAX;
}

/**
 * Helper function to validate improvement text length
 */
export function isValidImprovementText(text?: string): boolean {
  if (!text) return true; // Optional field
  return text.length <= LIMITS.IMPROVEMENT_TEXT_MAX_LENGTH;
}

/**
 * Helper function to validate trigger
 */
export function isValidTrigger(trigger: string): trigger is FeedbackTrigger {
  return Object.values(FeedbackTrigger).includes(trigger as FeedbackTrigger);
}

// ============================================================================
// Error Messages Constants
// ============================================================================

export const ERROR_MESSAGES = {
  INVALID_RATING: 'Rating must be between 1 and 5',
  INVALID_ARTICLE_ID: 'Invalid article ID format',
  ARTICLE_NOT_FOUND: 'Article not found',
  DUPLICATE_FEEDBACK: 'You have already submitted feedback for this article',
  IMPROVEMENT_TEXT_TOO_LONG: `Improvement text must be at most ${LIMITS.IMPROVEMENT_TEXT_MAX_LENGTH} characters`,
  INVALID_TRIGGER: 'Invalid feedback trigger',
  UNAUTHORIZED: 'Unauthorized. Please login.',
  INTERNAL_ERROR: 'Internal server error',
} as const;

// ============================================================================
// HTTP Status Codes
// ============================================================================

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
} as const;

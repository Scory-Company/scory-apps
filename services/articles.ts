import api from './api';

// ============================================
// TYPES
// ============================================

export interface ArticleListParams {
  page?: number;
  limit?: number;
  category?: string;
  topic?: string;
  search?: string;
  sort?: 'recent' | 'popular' | 'top_rated' | 'trending' | 'random';
  excludeRead?: boolean; // Filter out completed articles
}

// Reading Level Enum (sync with backend Prisma enum)
export enum ReadingLevel {
  SIMPLE = 'SIMPLE',
  STUDENT = 'STUDENT',
  ACADEMIC = 'ACADEMIC',
  EXPERT = 'EXPERT',
}

// Content Block Types
export type ContentBlock =
  | { type: 'text'; data: { text: string } }
  | { type: 'heading'; data: { text: string; level: 1 | 2 | 3 | 4 | 5 | 6 } }
  | { type: 'quote'; data: { text: string; author?: string } }
  | { type: 'list'; data: { style: 'bullet' | 'numbered'; items: string[] } }
  | { type: 'image'; data: { url: string; caption?: string; alt?: string } }
  | { type: 'infographic'; data: { url: string; caption?: string; alt?: string } }
  | { type: 'callout'; data: { text: string; variant: 'info' | 'warning' | 'success' | 'error' } }
  | { type: 'divider'; data: Record<string, never> };

// Article Content (with blocks)
export interface ArticleContent {
  id: string;
  articleId: string;
  readingLevel: ReadingLevel;
  blocks: ContentBlock[];
  createdAt: string;
  updatedAt: string;
}

export interface ArticleResponse {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  imageUrl?: string;
  authorName: string;
  authorAvatar?: string;
  category: { id: string; name: string; slug: string };
  rating: number;
  totalRatings: number;
  viewCount: number;
  viewCountWeek?: number;
  readCount?: number;
  bookmarkCount?: number;
  readTimeMinutes: number;
  publishedAt: string;
  isFeatured?: boolean;
  popularityScore?: number;
  popularityRank?: number;
  contents?: ArticleContent[]; // Array of content for all reading levels
  externalMetadata?: {
    source: 'openalex' | 'scholar';
    externalId: string;
    doi?: string;
    pdfUrl?: string;
    landingPageUrl?: string;
    year: number;
  };
  isExternal?: boolean;
}

export interface PaginatedResponse<T> {
  data: {
    articles: T[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
    meta?: {
      algorithm?: string;
      timeframe?: string;
      lastUpdated?: string;
    };
  };
  message: string;
  success: boolean;
}

export interface SingleResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

// ============================================
// API FUNCTIONS
// ============================================

export const articlesApi = {
  // Get articles list with filters
  getArticles: (params?: ArticleListParams) =>
    api.get<PaginatedResponse<ArticleResponse>>('/articles', { params }),

  // Get single article by slug
  getBySlug: (slug: string) =>
    api.get<SingleResponse<ArticleResponse>>(`/articles/${slug}`),

  // Get single article by ID (for simplified articles)
  getById: (id: string) =>
    api.get<SingleResponse<ArticleResponse>>(`/articles/by-id/${id}`),

  // Get article content by reading level
  getContent: (slug: string, readingLevel: string) =>
    api.get(`/articles/${slug}/content`, { params: { readingLevel } }),

  // Get personalized "For You" feed
  getForYou: (params?: { page?: number; limit?: number; excludeRead?: boolean; sort?: string; readingLevel?: string }) =>
    api.get<PaginatedResponse<ArticleResponse>>('/articles/for-you', { params }),

  // Get popular articles
  getPopular: (params?: { page?: number; limit?: number; timeframe?: '7d' | '30d' | 'all' }) =>
    api.get<PaginatedResponse<ArticleResponse>>('/articles/popular', {
      params
    }),

  // Get top rated articles
  getTopRated: (params?: { page?: number; limit?: number }) =>
    api.get<PaginatedResponse<ArticleResponse>>('/articles', {
      params: { ...params, sort: 'top_rated' }
    }),

  // Get trending articles (this week)
  getTrending: (params?: { page?: number; limit?: number }) =>
    api.get<PaginatedResponse<ArticleResponse>>('/articles', {
      params: { ...params, sort: 'trending' }
    }),

  // Get recent articles
  getRecent: (params?: { page?: number; limit?: number }) =>
    api.get<PaginatedResponse<ArticleResponse>>('/articles', {
      params: { ...params, sort: 'recent' }
    }),
};

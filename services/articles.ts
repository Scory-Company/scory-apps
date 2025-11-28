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
  sort?: 'recent' | 'popular' | 'top_rated' | 'trending';
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

  // Get article content by reading level
  getContent: (slug: string, readingLevel: string) =>
    api.get(`/articles/${slug}/content`, { params: { readingLevel } }),

  // Get personalized "For You" feed
  getForYou: (params?: { page?: number; limit?: number }) =>
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

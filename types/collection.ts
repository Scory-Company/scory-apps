/**
 * Study Collections Type Definitions
 * Auto-generated from API documentation
 */

/**
 * Main Study Collection interface
 * Represents a collection of bookmarked articles grouped by category
 */
export interface StudyCollection {
  id: string;
  userId: string;
  category: string;
  title: string;
  icon: string; // Ionicons name
  color: string; // Hex color code
  articlesCount: number;
  progress: number; // 0-100
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
}

/**
 * Bookmarked article in a collection
 */
export interface BookmarkedArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  authorName: string;
  authorAvatar: string;
  imageUrl: string;
  readTimeMinutes: number;
  rating: number;
  totalRatings: number;
  viewCount: number;
  category: {
    id: string;
    name: string;
    slug: string;
  };
  isRead: boolean;
  bookmarkedAt: string; // ISO timestamp
  lastReadAt: string | null; // ISO timestamp
}

/**
 * Category mapping for icon and color
 */
export interface CategoryMapping {
  category: string;
  icon: string; // Ionicons name
  color: string; // Hex color code
}

/**
 * Collection detail with articles
 */
export interface CollectionDetail {
  collection: StudyCollection;
  articles: BookmarkedArticle[];
}

/**
 * API Response Types
 */

export interface GetCollectionsResponse {
  success: boolean;
  data: {
    collections: StudyCollection[];
  };
}

export interface GetCollectionDetailResponse {
  success: boolean;
  data: CollectionDetail;
}

export interface BookmarkArticleResponse {
  success: boolean;
  data: {
    bookmark: {
      articleId: string;
      bookmarkedAt: string;
    };
    collection: {
      id: string;
      category: string;
      articlesCount: number;
      isNew: boolean;
    };
  };
  message: string;
}

export interface UnbookmarkArticleResponse {
  success: boolean;
  data: {
    articleId: string;
    collection: {
      id: string;
      articlesCount: number;
      wasDeleted: boolean;
    };
  };
  message: string;
}

export interface MarkAsReadResponse {
  success: boolean;
  data: {
    articleId: string;
    isRead: boolean;
    lastReadAt: string;
    collection: {
      id: string;
      progress: number;
    };
  };
}

export interface GetCategoryMappingsResponse {
  success: boolean;
  data: {
    mappings: CategoryMapping[];
  };
}

export interface ApiErrorResponse {
  success: false;
  error: string;
}

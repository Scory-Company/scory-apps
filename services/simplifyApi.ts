/**
 * Simplify API Service
 *
 * Handles paper simplification workflow:
 * 1. Check if paper already simplified (cache check)
 * 2. Simplify external paper
 * 3. Get simplified article content
 */

import api from './api';
import { ReadingLevel } from '@/constants/readingLevels';

// ==================== TYPES ====================

export type ExternalSource = 'openalex' | 'scholar';

export interface SimplifyCacheCheckResponse {
  success: boolean;
  data: {
    isCached: boolean;
    articleId?: string;
    articleSlug?: string;
    availableLevels?: ReadingLevel[];
    isPublished?: boolean;
    externalId?: string;
  };
}

export interface SimplifyExternalRequest {
  externalId: string;
  source: ExternalSource;
  title: string;
  authors: string[];
  year: number;
  abstract?: string;
  pdfUrl?: string;
  landingPageUrl?: string;
  doi?: string;
  readingLevel?: ReadingLevel;
  categoryName?: string;
  citations?: number;
  rating?: number;
}

export interface ContentBlock {
  type: 'heading' | 'text' | 'list' | 'quote' | 'callout' | 'divider' | 'code';
  data: {
    // For heading
    level?: number;
    text?: string;

    // For list
    style?: 'ordered' | 'unordered';
    items?: string[];

    // For quote
    caption?: string;

    // For callout
    variant?: 'info' | 'warning' | 'success' | 'error';
  };
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  order: number;
}

export interface SimplifyExternalResponse {
  success: boolean;
  message: string;
  data: {
    articleId: string;
    isNewSimplification: boolean;
    isCached: boolean;
    content: ContentBlock[];
    quiz?: QuizQuestion[];
    metadata?: {
      extractionMethod: 'pdf' | 'html' | 'abstract';
      aiCost: number;
      processingTime: number;
      readingLevel: ReadingLevel;
    };
  };
}

export interface GetSimplifiedArticleResponse {
  success: boolean;
  data: {
    article: {
      id: string;
      title: string;
      slug: string;
      excerpt: string;
      authorName: string;
      imageUrl: string | null;
      readTimeMinutes: number;
      viewCount: number;
      isExternal: boolean;
      publishedAt: string;
      category: { id: string; name: string; slug: string };
    };
    content: ContentBlock[];
    quiz?: QuizQuestion[];
    externalMetadata?: {
      source: ExternalSource;
      externalId: string;
      doi: string;
      pdfUrl: string;
      year: number;
      extractionMethod: 'pdf' | 'html' | 'abstract';
    };
    readingLevel: ReadingLevel;
  };
}

// ==================== API FUNCTIONS ====================

/**
 * Check if external paper already simplified (cached)
 */
export async function checkSimplifyCache(
  externalId: string
): Promise<SimplifyCacheCheckResponse> {
  try {
    const encodedId = encodeURIComponent(externalId);
    const response = await api.get<SimplifyCacheCheckResponse>(
      `/simplify/check-cache/${encodedId}`
    );
    return response.data;
  } catch (error: any) {
    console.error('[SimplifyAPI] Check cache error:', error);
    throw error;
  }
}

/**
 * Simplify external paper (OpenAlex or Scholar)
 */
export async function simplifyExternalPaper(
  request: SimplifyExternalRequest
): Promise<SimplifyExternalResponse> {
  try {
    console.log('[SimplifyAPI] Simplifying paper:', request.title);
    console.log('[SimplifyAPI] Request payload:', JSON.stringify(request, null, 2));
    console.log('[SimplifyAPI] Base URL:', api.defaults.baseURL);

    const response = await api.post<SimplifyExternalResponse>(
      '/simplify/external',
      request
    );
    console.log('[SimplifyAPI] Response received:', response.status);
    return response.data;
  } catch (error: any) {
    console.error('[SimplifyAPI] Simplify error:', error);
    console.error('[SimplifyAPI] Error details:', {
      message: error.message,
      code: error.code,
      url: error.config?.url,
      baseURL: error.config?.baseURL,
      timeout: error.config?.timeout,
    });
    throw error;
  }
}

/**
 * Get simplified article by ID
 */
export async function getSimplifiedArticle(
  articleId: string,
  options?: {
    readingLevel?: ReadingLevel;
    includeQuiz?: boolean;
  }
): Promise<GetSimplifiedArticleResponse> {
  try {
    const params = new URLSearchParams();
    if (options?.readingLevel) params.append('readingLevel', options.readingLevel);
    if (options?.includeQuiz) params.append('includeQuiz', 'true');

    const url = `/simplify/${articleId}${params.toString() ? `?${params}` : ''}`;
    const response = await api.get<GetSimplifiedArticleResponse>(url);
    return response.data;
  } catch (error: any) {
    console.error('[SimplifyAPI] Get article error:', error);
    throw error;
  }
}

/**
 * Health check for simplify service
 */
export async function simplifyHealthCheck(): Promise<{ success: boolean; message: string }> {
  try {
    const response = await api.get<{ success: boolean; message: string }>('/simplify/health');
    return response.data;
  } catch (error: any) {
    console.error('[SimplifyAPI] Health check error:', error);
    throw error;
  }
}

// ==================== HELPER FUNCTIONS ====================

/**
 * Full simplify workflow with cache check
 *
 * Usage:
 * ```ts
 * const result = await simplifyPaperWorkflow({
 *   externalId: 'https://openalex.org/W123',
 *   source: 'openalex',
 *   title: 'Paper Title',
 *   authors: ['Author 1'],
 *   year: 2024
 * });
 *
 * if (result.isCached) {
 *   console.log('Already simplified, article ID:', result.articleId);
 * } else {
 *   console.log('Newly simplified, processing time:', result.processingTime);
 * }
 * ```
 */
export async function simplifyPaperWorkflow(
  request: SimplifyExternalRequest
): Promise<{
  articleId: string;
  isCached: boolean;
  isNewSimplification: boolean;
  processingTime?: number;
}> {
  try {
    // Step 1: Check cache
    console.log('[SimplifyWorkflow] Checking cache for:', request.externalId);
    const cacheCheck = await checkSimplifyCache(request.externalId);

    if (cacheCheck.data.isCached && cacheCheck.data.articleId) {
      console.log('[SimplifyWorkflow] ✅ Found in cache:', cacheCheck.data.articleId);
      return {
        articleId: cacheCheck.data.articleId,
        isCached: true,
        isNewSimplification: false,
      };
    }

    // Step 2: Simplify paper (not in cache)
    console.log('[SimplifyWorkflow] ⏳ Simplifying paper (not in cache)...');
    const simplifyResult = await simplifyExternalPaper(request);

    console.log('[SimplifyWorkflow] ✅ Simplification complete:', {
      articleId: simplifyResult.data.articleId,
      processingTime: simplifyResult.data.metadata?.processingTime,
      isCached: simplifyResult.data.isCached,
    });

    return {
      articleId: simplifyResult.data.articleId,
      isCached: simplifyResult.data.isCached,
      isNewSimplification: simplifyResult.data.isNewSimplification,
      processingTime: simplifyResult.data.metadata?.processingTime,
    };
  } catch (error: any) {
    console.error('[SimplifyWorkflow] ❌ Error:', error);
    throw error;
  }
}

/**
 * Re-simplify existing article to different reading level
 *
 * @param articleId - The article ID to re-simplify
 * @param readingLevel - Target reading level (SIMPLE, STUDENT, ACADEMIC, EXPERT)
 */
export async function resimplifyArticle(
  articleId: string,
  readingLevel: string
): Promise<SimplifyExternalResponse> {
  try {
    console.log('[SimplifyAPI] Re-simplifying article:', articleId);
    console.log('[SimplifyAPI] Target reading level:', readingLevel);

    const response = await api.post<SimplifyExternalResponse>(
      `/simplify/${articleId}/resimplify`,
      { readingLevel }
    );

    console.log('[SimplifyAPI] Re-simplify response:', response.status);
    return response.data;
  } catch (error: any) {
    console.error('[SimplifyAPI] Re-simplify error:', error);
    console.error('[SimplifyAPI] Error details:', {
      message: error.message,
      code: error.code,
      status: error.response?.status,
    });
    throw error;
  }
}

export default {
  checkCache: checkSimplifyCache,
  simplify: simplifyExternalPaper,
  resimplify: resimplifyArticle,
  getArticle: getSimplifiedArticle,
  healthCheck: simplifyHealthCheck,
  workflow: simplifyPaperWorkflow,
};

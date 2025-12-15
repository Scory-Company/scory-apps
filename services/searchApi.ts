/**
 * Unified Search API Service
 *
 * Integrates with backend /search endpoint
 * Supports multiple sources: internal, OpenAlex, Google Scholar
 */

import api from './api';

// ==================== TYPES ====================

export type SearchSource = 'auto' | 'internal' | 'openalex' | 'scholar' | 'all';

export interface SearchOptions {
  sources?: SearchSource;
  page?: number;
  limit?: number;
  year?: number;
  openAccess?: boolean;
  language?: string;
}

export interface SearchResultMetadata {
  isSimplified?: boolean;
  isExternal?: boolean;
  articleId?: string;
  externalId?: string;
  externalSource?: 'openalex' | 'scholar';
}

export interface SearchResult {
  id: string;
  title: string;
  excerpt: string;
  authors: string[];
  year: number | null;
  source: 'internal' | 'openalex' | 'scholar';
  type: 'article' | 'paper' | 'preprint' | 'journal-article' | 'review';
  link: string;
  pdfUrl: string | null;
  citations: number;
  rating?: number;
  isOpenAccess: boolean;
  publisher: string | null;
  doi: string | null;
  language: string | null;
  metadata?: SearchResultMetadata;
}

export interface SearchMeta {
  total: number;
  page: number;
  limit: number;
  hasMore: boolean; // Indicates if there are more results to load
  sources: {
    internal: number;
    openalex: number;
    scholar: number;
  };
  scholarUsed: boolean;
  searchTime: string;
}

export interface SearchResponse {
  success: boolean;
  query: string;
  data: {
    results: SearchResult[];
    meta: SearchMeta;
  };
}

// ==================== API FUNCTIONS ====================

/**
 * Unified Search
 *
 * Search across multiple sources (internal DB, OpenAlex, Google Scholar)
 *
 * @param query - Search query string
 * @param options - Search options (sources, filters, pagination)
 *
 * @example
 * ```ts
 * const results = await unifiedSearch('machine learning', {
 *   sources: 'auto',
 *   limit: 20,
 *   year: 2024,
 *   openAccess: true
 * });
 * ```
 */
export async function unifiedSearch(
  query: string,
  options: SearchOptions = {}
): Promise<SearchResponse> {
  try {

    const params = new URLSearchParams();
    params.append('q', query);

    if (options.sources) params.append('sources', options.sources);
    if (options.page) params.append('page', String(options.page));
    if (options.limit) params.append('limit', String(options.limit));
    if (options.year) params.append('year', String(options.year));
    if (options.openAccess !== undefined) params.append('openAccess', String(options.openAccess));
    if (options.language) params.append('language', options.language);

    const response = await api.get<SearchResponse>(`/search?${params.toString()}`);

    return response.data;
  } catch (error: any) {
    throw error;
  }
}

/**
 * Search Health Check
 *
 * Check if search service is available
 */
export async function searchHealthCheck(): Promise<{
  success: boolean;
  message: string;
  data?: {
    database: boolean;
    external: {
      openAlex: boolean;
      scholar: boolean;
      scholarEnabled: boolean;
    };
  };
}> {
  try {
    const response = await api.get('/search/health');
    return response.data;
  } catch (error: any) {
    throw error;
  }
}

// ==================== HELPER FUNCTIONS ====================

/**
 * Search with automatic fallback
 *
 * Tries internal first, then external if no results
 */
export async function searchWithFallback(query: string): Promise<SearchResult[]> {
  try {
    const internalResults = await unifiedSearch(query, { sources: 'internal', limit: 20 });

    if (internalResults.data.results.length > 0) {
      return internalResults.data.results;
    }

    const externalResults = await unifiedSearch(query, { sources: 'auto', limit: 20 });

    return externalResults.data.results;
  } catch (error) {
    return [];
  }
}

/**
 * Search only internal database
 */
export async function searchInternal(query: string, limit = 20): Promise<SearchResult[]> {
  try {
    const response = await unifiedSearch(query, { sources: 'internal', limit });
    return response.data.results;
  } catch (error) {
    return [];
  }
}

/**
 * Search only external sources (OpenAlex + Scholar)
 */
export async function searchExternal(query: string, limit = 20): Promise<SearchResult[]> {
  try {
    const response = await unifiedSearch(query, { sources: 'auto', limit });
    return response.data.results.filter((r) => r.source !== 'internal');
  } catch (error) {
    return [];
  }
}

export default {
  search: unifiedSearch,
  healthCheck: searchHealthCheck,
  withFallback: searchWithFallback,
  internal: searchInternal,
  external: searchExternal,
};

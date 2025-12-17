/**
 * Simplify API Service
 *
 * Handles paper simplification workflow:
 * 1. Check if paper already simplified (cache check)
 * 2. Simplify external paper (starts async job OR returns cached)
 * 3. Poll job status until complete (if job started)
 * 4. Get simplified article content
 */

import api from './api';
import { ReadingLevel, toAPIReadingLevel } from '@/constants/readingLevels';
import * as JobPersistence from '@/utils/jobPersistence';

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

// 1. Response when job is created (201 Created)
export interface SimplifyJobCreatedResponse {
  success: true;
  message: string;
  data: {
    jobId: string;
    status: 'pending' | 'completed';
    isCached: false;
    statusUrl: string;
    estimatedTime: string;
    pollingInterval: number;
  };
}


// 2. Response when already cached (200 OK)
export interface SimplifyCachedResponse {
  success: true;
  message: string;
  data: {
    isCached: true;
    isNewSimplification: boolean;
    articleId: string;
    content: ContentBlock[];
    quiz?: QuizQuestion[];
  };
}

// 3. Response when processed synchronously (200 OK, direct content)
export interface SimplifySynchronousResponse {
  success: true;
  message: string;
  data: {
    articleId: string;
    isNewSimplification: boolean;
    isCached: false;
    content: ContentBlock[];
    quiz?: QuizQuestion[];
    metadata?: {
      extractionMethod: string;
      aiCost: number;
      processingTime: number;
      readingLevel: string;
    };
  };
}

export type SimplifyResponse = SimplifyJobCreatedResponse | SimplifyCachedResponse | SimplifySynchronousResponse;

// Response when polling job status
export interface JobStatusResponse {
  success: boolean;
  data: {
    jobId: string;
    status: 'pending' | 'active' | 'completed' | 'failed';
    progress: number; // 0-100
    estimatedTimeRemaining?: number;
    result?: {
      articleId: string;
      isNewSimplification: boolean;
      metadata?: {
        aiCost: number;
        processingTime: number;
      };
    };
    error?: string;
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

// ==================== TYPE GUARDS ====================

/**
 * Type guard to check if response is cached
 * More robust to handle various response formats
 */
function isCachedResponse(response: any): response is SimplifyCachedResponse {
  return (
    response &&
    response.data &&
    response.data.isCached === true &&
    'articleId' in response.data
  );
}

/**
 * Type guard to check if response is job created
 * More robust to handle various response formats
 */
function isJobCreatedResponse(response: any): response is SimplifyJobCreatedResponse {
  return (
    response &&
    response.data &&
    response.data.isCached === false &&
    'jobId' in response.data
  );
}

/**
 * Type guard to check if response is synchronous (direct content)
 * Backend processed immediately and returned content without job
 */
function isSynchronousResponse(response: any): response is SimplifySynchronousResponse {
  return (
    response &&
    response.data &&
    'articleId' in response.data &&
    'content' in response.data &&
    !('jobId' in response.data)
  );
}

// ==================== API FUNCTIONS ====================

/**
 * Check if external paper already simplified (cached)
 * Note: This is rarely needed - the simplifyExternalPaper endpoint already checks cache
 */
export async function checkSimplifyCache(
  externalId: string
): Promise<SimplifyCacheCheckResponse> {
  try {
    // Always encode to match backend expectations
    const encodedId = encodeURIComponent(externalId);
    const response = await api.get<SimplifyCacheCheckResponse>(
      `/simplify/check-cache/${encodedId}`
    );
    return response.data;
  } catch (error: any) {
    throw error;
  }
}

/**
 * Start simplification job for external paper
 * Handles both 201 (Job Created) and 200 (Cached) responses
 */
export async function simplifyExternalPaper(
  request: SimplifyExternalRequest
): Promise<SimplifyResponse> {
  try {
    // Default to SIMPLE if not provided, and convert to API format (ENUM)
    const apiReadingLevel = toAPIReadingLevel(request.readingLevel || 'simple');

    // ENCODE externalId to prevent backend error "Custom Id cannot contain :"
    // The backend uses externalId to construct the Job ID, which fails if it contains ':'
    const encodedExternalId = encodeURIComponent(request.externalId);

    const payload = {
      ...request,
      externalId: encodedExternalId,
      readingLevel: apiReadingLevel
    };

    const response = await api.post<SimplifyResponse>(
      '/simplify/external',
      payload
    );
    return response.data;
  } catch (error: any) {
    if (error.response) {
    }
    throw error;
  }
}

/**
 * Poll job status
 */
export async function pollJobStatus(jobId: string): Promise<JobStatusResponse> {
  try {
    const response = await api.get<JobStatusResponse>(`/jobs/${jobId}`);
    return response.data;
  } catch (error: any) {
    throw error;
  }
}

/**
 * Cancel a pending job
 * Only works for jobs in 'waiting' status
 */
export async function cancelJob(jobId: string): Promise<{ success: boolean; message: string }> {
  try {
    const response = await api.delete<{ success: boolean; message: string }>(`/jobs/${jobId}`);
    return response.data;
  } catch (error: any) {
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
    throw error;
  }
}

// ==================== HELPER FUNCTIONS ====================

/**
 * Full simplify workflow with job creation and polling
 * Includes proper timeout and cleanup mechanisms
 */
export async function simplifyPaperWorkflow(
  request: SimplifyExternalRequest,
  options?: {
    onProgress?: (progress: number) => void;
    pollingTimeout?: number; // Max time to wait for job completion (default: 120s)
    signal?: AbortSignal; // For cancellation support
  }
): Promise<{
  articleId: string;
  isCached: boolean;
  isNewSimplification: boolean;
  processingTime?: number;
}> {
  const { onProgress, pollingTimeout = 120000, signal } = options || {};

  try {
    const response = await simplifyExternalPaper(request);

    // Check if it was a Cache Hit (200 OK with cached data)
    if (isCachedResponse(response)) {
      onProgress?.(100);
      return {
        articleId: response.data.articleId,
        isCached: true,
        isNewSimplification: false
      };
    }

    // It's a Job Created (201 Created)
    if (isJobCreatedResponse(response)) {
      const { jobId, pollingInterval = 3000 } = response.data;

      // Persist job for recovery
      await JobPersistence.saveJob({
        jobId,
        type: 'simplify',
        timestamp: Date.now(),
        metadata: {
          title: request.title,
          readingLevel: request.readingLevel
        }
      });

      try {
        const result = await pollJobUntilComplete(jobId, {
          pollingInterval,
          timeout: pollingTimeout,
          onProgress,
          signal
        });

        // Remove from persistence after completion
        await JobPersistence.removeJob(jobId);

        return result;
      } catch (error) {
        // Keep in persistence if failed (for manual recovery)
        throw error;
      }
    }

    throw new Error('Unexpected response format from simplify endpoint');

  } catch (error: any) {
    throw error;
  }
}

/**
 * Poll job status until completion with proper cleanup
 * @internal
 */
async function pollJobUntilComplete(
  jobId: string,
  options: {
    pollingInterval: number;
    timeout: number;
    onProgress?: (progress: number) => void;
    signal?: AbortSignal;
  }
): Promise<{
  articleId: string;
  isCached: boolean;
  isNewSimplification: boolean;
  processingTime?: number;
}> {
  const { pollingInterval, timeout, onProgress, signal } = options;
  const startTime = Date.now();

  return new Promise((resolve, reject) => {
    let timeoutId: number | null = null;
    let isCleanedUp = false;

    const cleanup = () => {
      if (isCleanedUp) return;
      isCleanedUp = true;

      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }

      // Remove abort listener if exists
      if (signal) {
        signal.removeEventListener('abort', handleAbort);
      }
    };

    const handleAbort = () => {
      cleanup();
      reject(new Error('Job polling cancelled by user'));
    };

    // Setup abort handler
    if (signal) {
      signal.addEventListener('abort', handleAbort);

      // Check if already aborted
      if (signal.aborted) {
        handleAbort();
        return;
      }
    }

    const poll = async () => {
      try {
        // Check timeout
        const elapsed = Date.now() - startTime;
        if (elapsed >= timeout) {
          cleanup();
          reject(new Error(`Job polling timeout after ${timeout}ms`));
          return;
        }

        // Poll status
        const statusRes = await pollJobStatus(jobId);
        const { status, progress, result, error } = statusRes.data;

        // Update progress
        if (progress !== undefined) {
          onProgress?.(progress);
        }

        // Check status
        if (status === 'completed' && result) {
          cleanup();
          resolve({
            articleId: result.articleId,
            isCached: false,
            isNewSimplification: result.isNewSimplification,
            processingTime: result.metadata?.processingTime
          });
        } else if (status === 'failed') {
          cleanup();
          reject(new Error(error || 'Simplification job failed'));
        } else {
          // Continue polling (waiting or active)
          timeoutId = setTimeout(poll, pollingInterval);
        }
      } catch (err) {
        cleanup();
        reject(err);
      }
    };

    // Start polling
    poll();
  });
}

/**
 * Re-simplify existing article to different reading level
 * Returns either cached result OR job ID for polling
 */
export async function resimplifyArticle(
  articleId: string,
  readingLevel: string
): Promise<SimplifyResponse> {
  try {
    const response = await api.post<SimplifyResponse>(
      `/simplify/${articleId}/resimplify`,
      { readingLevel }
    );

    return response.data;
  } catch (error: any) {
    // Extract detailed error information
    const statusCode = error.response?.status;
    const errorMessage = error.response?.data?.message || error.message;
    const errorDetails = error.response?.data?.error;

    // Throw user-friendly error message
    if (statusCode === 500) {
      throw new Error('Server error while re-simplifying article. Please try again later.');
    } else if (statusCode === 404) {
      throw new Error('Article not found. Please refresh and try again.');
    } else if (statusCode === 400) {
      throw new Error(errorMessage || 'Invalid request. Please check your selection.');
    } else {
      throw new Error(errorMessage || 'Failed to re-simplify article');
    }
  }
}

/**
 * Re-simplify workflow with job polling
 * Similar to simplifyPaperWorkflow but for existing articles
 */
export async function resimplifyWorkflow(
  articleId: string,
  readingLevel: string,
  options?: {
    onProgress?: (progress: number) => void;
    pollingTimeout?: number;
    signal?: AbortSignal;
  }
): Promise<{
  articleId: string;
  isCached: boolean;
  isNewSimplification: boolean;
  processingTime?: number;
}> {
  const { onProgress, pollingTimeout = 120000, signal } = options || {};

  try {
    const response = await resimplifyArticle(articleId, readingLevel);

    // Check if it was a Cache Hit (already simplified to this level)
    if (isCachedResponse(response)) {
      onProgress?.(100);
      return {
        articleId: response.data.articleId,
        isCached: true,
        isNewSimplification: false
      };
    }

    // Check if it's a Synchronous Response (backend processed immediately)
    if (isSynchronousResponse(response)) {
      onProgress?.(100);
      return {
        articleId: response.data.articleId,
        isCached: false,
        isNewSimplification: response.data.isNewSimplification || true
      };
    }

    // It's a Job Created (async processing needed)
    if (isJobCreatedResponse(response)) {
      const { jobId, pollingInterval = 3000 } = response.data;


      // Persist job for recovery
      await JobPersistence.saveJob({
        jobId,
        type: 'resimplify',
        timestamp: Date.now(),
        metadata: {
          articleId,
          readingLevel
        }
      });

      try {
        // Poll with timeout and abort support
        const result = await pollJobUntilComplete(jobId, {
          pollingInterval,
          timeout: pollingTimeout,
          onProgress,
          signal
        });

        // Remove from persistence after completion
        await JobPersistence.removeJob(jobId);

        return result;
      } catch (error) {
        // Keep in persistence if failed (for manual recovery)
        throw error;
      }
    }

    // If we reach here, the response format is unexpected
    throw new Error('Unexpected response format from resimplify endpoint');

  } catch (error: any) {
    throw error;
  }
}

/**
 * Resume polling for a persisted job
 * Useful if app was closed during job processing
 */
export async function resumeJob(
  jobId: string,
  options?: {
    onProgress?: (progress: number) => void;
    pollingTimeout?: number;
    signal?: AbortSignal;
  }
): Promise<{
  articleId: string;
  isCached: boolean;
  isNewSimplification: boolean;
  processingTime?: number;
}> {
  const { onProgress, pollingTimeout = 120000, signal } = options || {};


  try {
    // Check current job status
    const statusRes = await pollJobStatus(jobId);
    const { status, result } = statusRes.data;

    // If already completed, return immediately
    if (status === 'completed' && result) {
      await JobPersistence.removeJob(jobId);
      return {
        articleId: result.articleId,
        isCached: false,
        isNewSimplification: result.isNewSimplification,
        processingTime: result.metadata?.processingTime
      };
    }

    // If failed, throw error
    if (status === 'failed') {
      await JobPersistence.removeJob(jobId);
      throw new Error('Job failed during processing');
    }

    // Otherwise, continue polling
    const pollResult = await pollJobUntilComplete(jobId, {
      pollingInterval: 3000,
      timeout: pollingTimeout,
      onProgress,
      signal
    });

    // Remove from persistence after completion
    await JobPersistence.removeJob(jobId);

    return pollResult;
  } catch (error: any) {
    throw error;
  }
}

export default {
  checkCache: checkSimplifyCache,
  simplify: simplifyExternalPaper,
  pollStatus: pollJobStatus,
  cancelJob: cancelJob,
  resimplify: resimplifyArticle,
  getArticle: getSimplifiedArticle,
  healthCheck: simplifyHealthCheck,
  workflow: simplifyPaperWorkflow,
  resimplifyWorkflow: resimplifyWorkflow,
  resumeJob: resumeJob,
};

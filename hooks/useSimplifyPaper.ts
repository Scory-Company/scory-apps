/**
 * useSimplifyPaper Hook
 *
 * Custom hook for paper simplification workflow
 *
 * Features:
 * - Check cache before simplifying
 * - Loading states
 * - Error handling
 * - Progress tracking
 * - Async job polling
 *
 * Usage:
 * ```tsx
 * const { simplify, isSimplifying, error } = useSimplifyPaper();
 *
 * const handleSimplify = async () => {
 *   const result = await simplify({
 *     externalId: 'https://openalex.org/W123',
 *     source: 'openalex',
 *     title: 'Paper Title',
 *     authors: ['Author 1'],
 *     year: 2024
 *   });
 *
 *   if (result) {
 *     router.push(`/article/${result.articleId}`);
 *   }
 * };
 * ```
 */

import { useState, useCallback } from 'react';
import { router } from 'expo-router';
import { simplifyApi, SimplifyExternalRequest } from '@/services';

interface UseSimplifyPaperResult {
  simplify: (request: SimplifyExternalRequest) => Promise<{
    articleId: string;
    isCached: boolean;
  } | null>;
  isSimplifying: boolean;
  error: string | null;
  errorTitle: string | null;
  progress: {
    step: 'idle' | 'checking' | 'simplifying' | 'done';
    message: string;
    value?: number; // 0-100
  };
}

interface UseSimplifyPaperOptions {
  onError?: (title: string, message: string) => void;
}

export function useSimplifyPaper(options?: UseSimplifyPaperOptions): UseSimplifyPaperResult {
  const [isSimplifying, setIsSimplifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorTitle, setErrorTitle] = useState<string | null>(null);
  const [progress, setProgress] = useState<{
    step: 'idle' | 'checking' | 'simplifying' | 'done';
    message: string;
    value?: number;
  }>({
    step: 'idle',
    message: '',
    value: 0,
  });

  const simplify = useCallback(async (request: SimplifyExternalRequest) => {

    try {
      setIsSimplifying(true);
      setError(null);
      setErrorTitle(null);
      setProgress({
        step: 'checking',
        message: 'Initializing...',
        value: 0,
      });

      // Delegate to service workflow with progress updates
      const result = await simplifyApi.workflow(request, {
        onProgress: (progressValue) => {
          // Map progress to user-friendly messages
          let message = 'Processing...';

          if (progressValue === 100) {
            message = 'Complete!';
          } else if (progressValue >= 80) {
            message = 'Generating quiz...';
          } else if (progressValue >= 50) {
            message = 'Simplifying content...';
          } else if (progressValue >= 20) {
            message = 'Analyzing paper structure...';
          } else if (progressValue > 0) {
            message = 'Starting job...';
          }

          setProgress({
            step: 'simplifying',
            message,
            value: progressValue
          });
        }
      });

      // Success

      setProgress({
        step: 'done',
        message: result.isCached ? 'Loaded from cache!' : 'Paper simplified successfully!',
        value: 100,
      });

      setIsSimplifying(false);

      return {
        articleId: result.articleId,
        isCached: result.isCached,
      };

    } catch (err: any) {

      // Simplified error handling - backend should return structured errors
      const errorTitle = err.response?.data?.title || 'Simplification Failed';
      const errorMessage = err.response?.data?.message || err.message || 'Failed to simplify paper. Please try again.';


      // Call onError callback if provided
      options?.onError?.(errorTitle, errorMessage);

      setIsSimplifying(false);
      return null;
    }
  }, [options]);

  return {
    simplify,
    isSimplifying,
    error,
    errorTitle,
    progress,
  };
}

/**
 * useSimplifyAndNavigate Hook
 *
 * Simplified version that automatically navigates to article after simplification
 * Includes loading modal display
 */
export function useSimplifyAndNavigate(options?: UseSimplifyPaperOptions) {
  const { simplify, isSimplifying, error, progress } = useSimplifyPaper(options);

  const simplifyAndNavigate = useCallback(
    async (request: SimplifyExternalRequest) => {

      const result = await simplify(request);

      if (result) {

        // Try to get slug, but don't fail if network error
        try {
          const articleDetails = await simplifyApi.getArticle(result.articleId);

          if (articleDetails.data.article.slug) {
            router.push(`/article/${articleDetails.data.article.slug}` as any);
          } else {
            router.push(`/article/${result.articleId}` as any);
          }
        } catch (fetchError: any) {
          // Network error or other issues - just navigate with articleId
          const errorType = fetchError.message || 'Unknown error';

          // Navigate anyway - article exists, we just couldn't get the slug
          router.push(`/article/${result.articleId}` as any);
        }
      } else {
      }
    },
    [simplify]
  );

  return {
    simplifyAndNavigate,
    isSimplifying,
    error,
    progress,
  };
}

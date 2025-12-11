/**
 * useSimplifyPaper Hook
 *
 * Custom hook for paper simplification workflow
 *
 * Features:
 * - Check cache before simplifying
 * - Loading states
 * - Error handling
 * - Progress tracking (optional)
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
  };
}

export function useSimplifyPaper(): UseSimplifyPaperResult {
  const [isSimplifying, setIsSimplifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorTitle, setErrorTitle] = useState<string | null>(null);
  const [progress, setProgress] = useState<{
    step: 'idle' | 'checking' | 'simplifying' | 'done';
    message: string;
  }>({
    step: 'idle',
    message: '',
  });

  const simplify = useCallback(async (request: SimplifyExternalRequest) => {
    console.log('='.repeat(60));
    console.log('[🔍 SIMPLIFY DEBUG] Starting simplify workflow');
    console.log('[🔍 SIMPLIFY DEBUG] Request:', JSON.stringify(request, null, 2));
    console.log('='.repeat(60));

    try {
      setIsSimplifying(true);
      setError(null);

      // Step 1: Check cache
      console.log('[📋 STEP 1] Checking cache...');
      setProgress({
        step: 'checking',
        message: 'Checking if paper already simplified...',
      });

      const cacheCheck = await simplifyApi.checkCache(request.externalId);
      console.log('[📋 STEP 1] Cache check result:', JSON.stringify(cacheCheck.data, null, 2));

      if (cacheCheck.data.isCached && cacheCheck.data.articleId) {
        // Already simplified - navigate immediately
        console.log('[✅ CACHE HIT] Article already simplified!');
        console.log('[✅ CACHE HIT] Article ID:', cacheCheck.data.articleId);

        setProgress({
          step: 'done',
          message: 'Paper already simplified!',
        });

        setIsSimplifying(false);

        return {
          articleId: cacheCheck.data.articleId,
          isCached: true,
        };
      }

      // Step 2: Simplify paper (takes 20-30 seconds)
      console.log('[📝 STEP 2] Not in cache, starting simplification...');
      setProgress({
        step: 'simplifying',
        message: 'Simplifying paper... This may take 20-30 seconds.',
      });

      const result = await simplifyApi.simplify(request);
      console.log('[📝 STEP 2] Simplify result:', JSON.stringify({
        articleId: result.data.articleId,
        isCached: result.data.isCached,
        isNewSimplification: result.data.isNewSimplification,
        processingTime: result.data.metadata?.processingTime,
        hasContent: !!result.data.content,
        contentBlocks: result.data.content?.length,
      }, null, 2));

      setProgress({
        step: 'done',
        message: `Paper simplified successfully! (${
          result.data.metadata?.processingTime
            ? `${(result.data.metadata.processingTime / 1000).toFixed(1)}s`
            : 'done'
        })`,
      });

      setIsSimplifying(false);

      console.log('[✅ SUCCESS] Returning articleId:', result.data.articleId);
      console.log('='.repeat(60));

      return {
        articleId: result.data.articleId,
        isCached: result.data.isCached,
      };
    } catch (err: any) {
      console.log('='.repeat(60));
      console.error('[❌ ERROR] Simplify failed!');
      console.error('[❌ ERROR] Error object:', err);
      console.error('[❌ ERROR] Error message:', err.message);
      console.error('[❌ ERROR] Error response:', err.response?.data);
      console.error('[❌ ERROR] Error status:', err.response?.status);
      console.error('[❌ ERROR] Error config:', {
        url: err.config?.url,
        method: err.config?.method,
        baseURL: err.config?.baseURL,
        timeout: err.config?.timeout,
      });
      console.log('='.repeat(60));

      // Generate user-friendly error message based on error type
      let errorTitle = 'Simplification Failed';
      let errorMessage = 'Failed to simplify paper. Please try again.';

      if (err.response?.status === 500) {
        // Server error
        const serverError = err.response?.data?.error || '';

        if (serverError.includes('AI returned invalid JSON') || serverError.includes('SyntaxError')) {
          errorTitle = 'Processing Error';
          errorMessage = 'The AI service encountered an issue while processing this paper. This usually happens with very long or complex documents. Please try again or choose a different paper.';
        } else if (serverError.includes('timeout') || serverError.includes('Timeout')) {
          errorTitle = 'Timeout Error';
          errorMessage = 'The simplification process took too long. Please try again with a shorter paper or try later.';
        } else {
          errorTitle = 'Server Error';
          errorMessage = err.response?.data?.message || 'The server encountered an error while processing your request. Please try again later.';
        }
      } else if (err.response?.status === 404) {
        errorTitle = 'Paper Not Found';
        errorMessage = 'The paper could not be found or accessed. Please try a different paper.';
      } else if (err.response?.status === 403) {
        errorTitle = 'Access Denied';
        errorMessage = 'You do not have permission to simplify this paper.';
      } else if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
        errorTitle = 'Connection Timeout';
        errorMessage = 'The request took too long to complete. Please check your internet connection and try again.';
      } else if (err.message?.includes('Network Error') || !err.response) {
        errorTitle = 'Network Error';
        errorMessage = 'Unable to connect to the server. Please check your internet connection and try again.';
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }

      setError(errorMessage);
      setErrorTitle(errorTitle);
      setProgress({
        step: 'idle',
        message: '',
      });

      setIsSimplifying(false);
      return null;
    }
  }, []);

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
 *
 * Usage:
 * ```tsx
 * const { simplifyAndNavigate, isSimplifying, progress, SimplifyLoadingModal } = useSimplifyAndNavigate();
 *
 * return (
 *   <>
 *     <Button onPress={() => simplifyAndNavigate({ ... })}>
 *       Simplify Paper
 *     </Button>
 *     <SimplifyLoadingModal />
 *   </>
 * );
 * ```
 */
export function useSimplifyAndNavigate() {
  const { simplify, isSimplifying, error, progress } = useSimplifyPaper();

  const simplifyAndNavigate = useCallback(
    async (request: SimplifyExternalRequest) => {
      console.log('='.repeat(60));
      console.log('[🚀 NAVIGATE DEBUG] Starting simplify and navigate workflow');
      console.log('='.repeat(60));

      const result = await simplify(request);

      if (result) {
        try {
          // Fetch the full article to get the slug
          console.log('[📡 STEP 3] Fetching article details...');
          console.log('[📡 STEP 3] Article ID:', result.articleId);

          const articleDetails = await simplifyApi.getArticle(result.articleId);

          console.log('[📡 STEP 3] Article details received:', JSON.stringify({
            id: articleDetails.data.article.id,
            slug: articleDetails.data.article.slug,
            title: articleDetails.data.article.title,
            hasSlug: !!articleDetails.data.article.slug,
          }, null, 2));

          if (articleDetails.data.article.slug) {
            // Navigate using slug instead of ID
            const targetPath = `/article/${articleDetails.data.article.slug}`;
            console.log('[🎯 NAVIGATION] Navigating to:', targetPath);
            console.log('[🎯 NAVIGATION] Using SLUG:', articleDetails.data.article.slug);

            router.push(targetPath as any);

            console.log('[✅ NAVIGATION] Navigation triggered successfully!');
          } else {
            console.error('[⚠️ WARNING] Article has no slug, falling back to ID');
            const fallbackPath = `/article/${result.articleId}`;
            console.log('[🎯 NAVIGATION] Fallback path:', fallbackPath);

            router.push(fallbackPath as any);
          }
        } catch (fetchError: any) {
          console.log('='.repeat(60));
          console.error('[❌ FETCH ERROR] Failed to fetch article details!');
          console.error('[❌ FETCH ERROR] Error:', fetchError);
          console.error('[❌ FETCH ERROR] Error message:', fetchError.message);
          console.error('[❌ FETCH ERROR] Error response:', fetchError.response?.data);
          console.error('[❌ FETCH ERROR] Error status:', fetchError.response?.status);
          console.log('='.repeat(60));

          // Fallback: try with articleId anyway
          const fallbackPath = `/article/${result.articleId}`;
          console.log('[🎯 NAVIGATION] Emergency fallback to ID:', fallbackPath);
          router.push(fallbackPath as any);
        }
      } else {
        console.error('[❌ NO RESULT] Simplify returned null, cannot navigate');
      }

      console.log('='.repeat(60));
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

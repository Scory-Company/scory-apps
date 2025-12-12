/**
 * useResimplify Hook
 *
 * Custom hook for re-simplifying articles to different reading levels
 *
 * **IMPORTANT**: All re-simplify operations require Premium subscription
 *
 * Usage:
 * ```tsx
 * const { resimplify, resimplifyManual, isResimplifying, progress, PremiumModal } = useResimplify();
 *
 * // Auto re-simplify (when level not available - PREMIUM REQUIRED)
 * const handleAutoResimplify = async () => {
 *   await resimplify(articleId, 'STUDENT');
 * };
 *
 * // Manual re-simplify (user triggered - PREMIUM REQUIRED)
 * const handleManualResimplify = async () => {
 *   await resimplifyManual(articleId, 'STUDENT');
 * };
 *
 * // In component render:
 * <PremiumModal />
 * ```
 */

import { useState, useCallback, JSX } from 'react';
import { simplifyApi } from '@/services';
import { usePremiumModal } from '@/features/premium';

interface UseResimplifyResult {
  resimplify: (articleId: string, readingLevel: string) => Promise<boolean>;
  resimplifyManual: (articleId: string, readingLevel: string) => Promise<boolean>;
  isResimplifying: boolean;
  error: string | null;
  progress: {
    step: 'idle' | 'resimplifying' | 'done';
    message: string;
  };
  PremiumModal: () => JSX.Element | null;
}

interface UseResimplifyOptions {
  onError?: (message: string) => void;
}

export function useResimplify(options?: UseResimplifyOptions): UseResimplifyResult {
  const [isResimplifying, setIsResimplifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<{
    step: 'idle' | 'resimplifying' | 'done';
    message: string;
  }>({
    step: 'idle',
    message: '',
  });

  const { showPremiumModal, PremiumModal } = usePremiumModal();

  // Auto re-simplify (called automatically when level not available, requires premium)
  const resimplify = useCallback(async (articleId: string, readingLevel: string) => {
    console.log('='.repeat(60));
    console.log('[🔄 AUTO-RESIMPLIFY] Level not available, checking premium...');
    console.log('[🔄 AUTO-RESIMPLIFY] Article ID:', articleId);
    console.log('[🔄 AUTO-RESIMPLIFY] Target Level:', readingLevel);
    console.log('='.repeat(60));

    // Check if user has premium (placeholder - backend not implemented yet)
    const hasPremium = false; // TODO: Get from user context/auth state

    if (!hasPremium) {
      console.log('[⚠️ AUTO-RESIMPLIFY] Premium required for this reading level!');
      // Show premium upgrade modal
      showPremiumModal(`Level ${readingLevel}`);
      return false;
    }

    // If premium, proceed with re-simplify workflow (with job polling)
    try {
      setIsResimplifying(true);
      setError(null);

      setProgress({
        step: 'resimplifying',
        message: `Simplifying to ${readingLevel} level...`,
      });

      // Use the new workflow function that handles job polling
      const result = await simplifyApi.resimplifyWorkflow(articleId, readingLevel, {
        onProgress: (progressValue) => {
          // Update progress message based on value
          let message = `Processing (${progressValue}%)...`;
          if (progressValue >= 80) message = 'Generating quiz...';
          else if (progressValue >= 50) message = 'Simplifying content...';
          else if (progressValue >= 20) message = 'Analyzing structure...';

          setProgress({
            step: 'resimplifying',
            message,
          });
        }
      });

      console.log('[✅ AUTO-RESIMPLIFY] Success!', {
        articleId: result.articleId,
        isCached: result.isCached,
        isNew: result.isNewSimplification
      });

      setProgress({
        step: 'done',
        message: result.isCached ? 'Loaded from cache!' : `Successfully simplified to ${readingLevel} level!`,
      });

      setIsResimplifying(false);
      return true;

    } catch (err: any) {
      console.error('[❌ AUTO-RESIMPLIFY ERROR]', err.message);

      // Simplified error handling
      const errorMessage = err.response?.data?.message || err.message || 'Failed to re-simplify article. Please try again.';

      setError(errorMessage);
      setProgress({
        step: 'idle',
        message: '',
      });

      // Call onError callback if provided
      options?.onError?.(errorMessage);

      setIsResimplifying(false);
      return false;
    }
  }, [showPremiumModal, options]);

  // Manual re-simplify (triggered by user, requires premium)
  const resimplifyManual = useCallback(async (articleId: string, readingLevel: string) => {
    console.log('='.repeat(60));
    console.log('[🔄 MANUAL-RESIMPLIFY] User triggered manual re-simplify');
    console.log('[🔄 MANUAL-RESIMPLIFY] Article ID:', articleId);
    console.log('[🔄 MANUAL-RESIMPLIFY] Target Level:', readingLevel);
    console.log('='.repeat(60));

    // Check if user has premium (placeholder - backend not implemented yet)
    const hasPremium = false; // TODO: Get from user context/auth state

    if (!hasPremium) {
      console.log('[⚠️ MANUAL-RESIMPLIFY] Premium required!');
      // Show premium upgrade modal
      showPremiumModal('Re-simplify Artikel');
      return false;
    }

    // If premium, proceed with re-simplify workflow (with job polling)
    try {
      setIsResimplifying(true);
      setError(null);

      setProgress({
        step: 'resimplifying',
        message: `Re-simplifying to ${readingLevel} level...`,
      });

      // Use the new workflow function that handles job polling
      const result = await simplifyApi.resimplifyWorkflow(articleId, readingLevel, {
        onProgress: (progressValue) => {
          // Update progress message based on value
          let message = `Processing (${progressValue}%)...`;
          if (progressValue >= 80) message = 'Generating quiz...';
          else if (progressValue >= 50) message = 'Simplifying content...';
          else if (progressValue >= 20) message = 'Analyzing structure...';

          setProgress({
            step: 'resimplifying',
            message,
          });
        }
      });

      console.log('[✅ MANUAL-RESIMPLIFY] Success!', {
        articleId: result.articleId,
        isCached: result.isCached,
        isNew: result.isNewSimplification
      });

      setProgress({
        step: 'done',
        message: result.isCached ? 'Loaded from cache!' : `Successfully re-simplified to ${readingLevel} level!`,
      });

      setIsResimplifying(false);
      return true;

    } catch (err: any) {
      console.error('[❌ MANUAL-RESIMPLIFY ERROR]', err.message);

      // Simplified error handling
      const errorMessage = err.response?.data?.message || err.message || 'Failed to re-simplify article. Please try again.';

      setError(errorMessage);
      setProgress({
        step: 'idle',
        message: '',
      });

      // Call onError callback if provided
      options?.onError?.(errorMessage);

      setIsResimplifying(false);
      return false;
    }
  }, [showPremiumModal, options]);

  return {
    resimplify,
    resimplifyManual,
    isResimplifying,
    error,
    progress,
    PremiumModal,
  };
}

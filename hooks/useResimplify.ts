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
  onSuccess?: (message: string) => void;
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
    console.log('[Auto-Resimplify]', readingLevel);

    // Allow all users to re-simplify articles (premium requirement removed)
    const hasPremium = true; // Enabled for all users

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

      const successMessage = result.isCached
        ? 'Content loaded from cache!'
        : `Article simplified to ${readingLevel} level!`;

      setProgress({
        step: 'done',
        message: successMessage,
      });

      // Call onSuccess callback if provided
      options?.onSuccess?.(successMessage);

      setIsResimplifying(false);
      return true;

    } catch (err: any) {
      console.error('[Auto-Resimplify] Error:', err.message);

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

    // Allow all users to manually re-simplify articles (premium requirement removed)
    const hasPremium = true; // Enabled for all users

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

      const successMessage = result.isCached
        ? 'Content loaded from cache!'
        : `Article re-simplified to ${readingLevel} level!`;

      setProgress({
        step: 'done',
        message: successMessage,
      });

      // Call onSuccess callback if provided
      options?.onSuccess?.(successMessage);

      setIsResimplifying(false);
      return true;

    } catch (err: any) {
      console.error('[Manual-Resimplify] Error:', err.message);

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

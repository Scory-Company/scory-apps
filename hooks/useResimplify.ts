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

export function useResimplify(): UseResimplifyResult {
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

    // If premium, proceed with re-simplify
    try {
      setIsResimplifying(true);
      setError(null);

      setProgress({
        step: 'resimplifying',
        message: `Simplifying to ${readingLevel} level... This may take 20-30 seconds.`,
      });

      const result = await simplifyApi.resimplify(articleId, readingLevel);

      console.log('[🔄 AUTO-RESIMPLIFY] Result:', JSON.stringify({
        articleId: result.data.articleId,
        isNewSimplification: result.data.isNewSimplification,
        hasContent: !!result.data.content,
        contentBlocks: result.data.content?.length,
      }, null, 2));

      setProgress({
        step: 'done',
        message: `Successfully simplified to ${readingLevel} level!`,
      });

      setIsResimplifying(false);
      console.log('[✅ AUTO-RESIMPLIFY] Success!');
      console.log('='.repeat(60));

      return true;
    } catch (err: any) {
      console.log('='.repeat(60));
      console.error('[❌ AUTO-RESIMPLIFY ERROR] Auto re-simplify failed!');
      console.error('[❌ AUTO-RESIMPLIFY ERROR] Error:', err);
      console.error('[❌ AUTO-RESIMPLIFY ERROR] Error message:', err.message);
      console.error('[❌ AUTO-RESIMPLIFY ERROR] Error response:', err.response?.data);
      console.log('='.repeat(60));

      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        'Failed to re-simplify article. Please try again.';

      setError(errorMessage);
      setProgress({
        step: 'idle',
        message: '',
      });

      // Just log error, don't show modal for API errors
      setIsResimplifying(false);
      return false;
    }
  }, [showPremiumModal]);

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

    // If premium, proceed with re-simplify
    try {
      setIsResimplifying(true);
      setError(null);

      setProgress({
        step: 'resimplifying',
        message: `Re-simplifying to ${readingLevel} level...`,
      });

      const result = await simplifyApi.resimplify(articleId, readingLevel);

      console.log('[🔄 MANUAL-RESIMPLIFY] Result:', JSON.stringify({
        articleId: result.data.articleId,
        isNewSimplification: result.data.isNewSimplification,
        hasContent: !!result.data.content,
        contentBlocks: result.data.content?.length,
      }, null, 2));

      setProgress({
        step: 'done',
        message: `Successfully re-simplified to ${readingLevel} level!`,
      });

      setIsResimplifying(false);
      console.log('[✅ MANUAL-RESIMPLIFY] Success!');
      console.log('='.repeat(60));

      return true;
    } catch (err: any) {
      console.log('='.repeat(60));
      console.error('[❌ MANUAL-RESIMPLIFY ERROR] Manual re-simplify failed!');
      console.error('[❌ MANUAL-RESIMPLIFY ERROR] Error:', err);
      console.error('[❌ MANUAL-RESIMPLIFY ERROR] Error message:', err.message);
      console.error('[❌ MANUAL-RESIMPLIFY ERROR] Error response:', err.response?.data);
      console.log('='.repeat(60));

      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        'Failed to re-simplify article. Please try again.';

      setError(errorMessage);
      setProgress({
        step: 'idle',
        message: '',
      });

      // Just log error, don't show modal for API errors
      setIsResimplifying(false);
      return false;
    }
  }, [showPremiumModal]);

  return {
    resimplify,
    resimplifyManual,
    isResimplifying,
    error,
    progress,
    PremiumModal,
  };
}

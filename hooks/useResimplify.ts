/**
 * useResimplify Hook
 *
 * Custom hook for re-simplifying articles to different reading levels
 *
 * Usage:
 * ```tsx
 * const { resimplify, isResimplifying, progress } = useResimplify();
 *
 * const handleResimplify = async () => {
 *   await resimplify(articleId, 'STUDENT');
 * };
 * ```
 */

import { useState, useCallback } from 'react';
import { simplifyApi } from '@/services';
import { Alert } from 'react-native';

interface UseResimplifyResult {
  resimplify: (articleId: string, readingLevel: string) => Promise<boolean>;
  isResimplifying: boolean;
  error: string | null;
  progress: {
    step: 'idle' | 'resimplifying' | 'done';
    message: string;
  };
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

  const resimplify = useCallback(async (articleId: string, readingLevel: string) => {
    console.log('='.repeat(60));
    console.log('[🔄 RESIMPLIFY] Starting re-simplify workflow');
    console.log('[🔄 RESIMPLIFY] Article ID:', articleId);
    console.log('[🔄 RESIMPLIFY] Target Level:', readingLevel);
    console.log('='.repeat(60));

    try {
      setIsResimplifying(true);
      setError(null);

      setProgress({
        step: 'resimplifying',
        message: `Simplifying to ${readingLevel} level... This may take 20-30 seconds.`,
      });

      const result = await simplifyApi.resimplify(articleId, readingLevel);

      console.log('[🔄 RESIMPLIFY] Result:', JSON.stringify({
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
      console.log('[✅ RESIMPLIFY] Success!');
      console.log('='.repeat(60));

      return true;
    } catch (err: any) {
      console.log('='.repeat(60));
      console.error('[❌ RESIMPLIFY ERROR] Re-simplify failed!');
      console.error('[❌ RESIMPLIFY ERROR] Error:', err);
      console.error('[❌ RESIMPLIFY ERROR] Error message:', err.message);
      console.error('[❌ RESIMPLIFY ERROR] Error response:', err.response?.data);
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

      // Show error alert
      Alert.alert(
        'Re-simplification Failed',
        errorMessage,
        [{ text: 'OK' }]
      );

      setIsResimplifying(false);
      return false;
    }
  }, []);

  return {
    resimplify,
    isResimplifying,
    error,
    progress,
  };
}

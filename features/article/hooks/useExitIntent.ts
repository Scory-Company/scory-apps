import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef } from 'react';
import { BackHandler } from 'react-native';

interface UseExitIntentProps {
  enabled: boolean;
  onExitIntent: () => boolean; // Return true if handled, false to allow navigation
}

/**
 * Hook to detect when user tries to exit the screen (back button)
 * Allows intercepting the exit to show feedback prompt
 */
export const useExitIntent = ({ enabled, onExitIntent }: UseExitIntentProps) => {
  const router = useRouter();
  const isHandlingRef = useRef(false);

  const handleBackPress = useCallback(() => {
    if (!enabled || isHandlingRef.current) {
      return false; // Let default behavior happen
    }

    // Call the exit intent handler
    const handled = onExitIntent();

    if (handled) {
      // Prevent navigation, show feedback
      isHandlingRef.current = true;
      return true;
    }

    // Allow navigation
    return false;
  }, [enabled, onExitIntent]);

  useEffect(() => {
    if (!enabled) return;

    // Add back button listener
    const subscription = BackHandler.addEventListener('hardwareBackPress', handleBackPress);

    return () => {
      subscription.remove();
    };
  }, [enabled, handleBackPress]);

  /**
   * Call this after feedback is submitted/skipped to allow navigation
   */
  const allowNavigation = useCallback(() => {
    isHandlingRef.current = false;
    router.back();
  }, [router]);

  return {
    allowNavigation,
  };
};

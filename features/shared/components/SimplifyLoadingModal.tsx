/**
 * SimplifyLoadingModal Component
 *
 * Loading modal for paper simplification process
 * Shows progress messages during the 20-30 second simplification
 */

import { Colors, Spacing, Typography, Radius } from '@/constants/theme';
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SimplifyLoadingModalProps {
  visible: boolean;
  step: 'idle' | 'checking' | 'simplifying' | 'done';
  message?: string;
  progressValue?: number; // 0-100
}

const PROGRESS_MESSAGES = [
  'Analyzing paper structure...',
  'Extracting key concepts...',
  'Simplifying complex terms...',
  'Generating insights...',
  'Creating quiz questions...',
  'Almost done...',
];

export const SimplifyLoadingModal: React.FC<SimplifyLoadingModalProps> = ({
  visible,
  step,
  message,
  progressValue,
}) => {
  const colors = Colors.light;
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [fadeAnim] = useState(new Animated.Value(1));
  const [progressWidthAnim] = useState(new Animated.Value(0));

  // Animate progress bar
  useEffect(() => {
    if (progressValue !== undefined) {
      Animated.timing(progressWidthAnim, {
        toValue: progressValue,
        duration: 500,
        useNativeDriver: false,
      }).start();
    }
  }, [progressValue]);

  // Rotate progress messages during simplification
  useEffect(() => {
    if (step === 'simplifying') {
      const interval = setInterval(() => {
        // Fade out
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          // Change message
          setCurrentMessageIndex((prev) => (prev + 1) % PROGRESS_MESSAGES.length);
          // Fade in
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }).start();
        });
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [step, fadeAnim]);

  const getStepIcon = () => {
    switch (step) {
      case 'checking':
        return 'search-outline';
      case 'simplifying':
        return 'sparkles-outline';
      case 'done':
        return 'checkmark-circle-outline';
      default:
        return 'hourglass-outline';
    }
  };

  const getStepColor = () => {
    switch (step) {
      case 'checking':
        return '#6366F1'; // Purple
      case 'simplifying':
        return '#F59E0B'; // Orange
      case 'done':
        return '#10B981'; // Green
      default:
        return colors.textMuted;
      }
  };

  const displayMessage =
    message || (step === 'simplifying' ? PROGRESS_MESSAGES[currentMessageIndex] : '');

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: colors.surface }]}>
          {/* Icon */}
          <View style={[styles.iconContainer, { backgroundColor: getStepColor() + '15' }]}>
            <Ionicons name={getStepIcon() as any} size={48} color={getStepColor()} />
          </View>

          {/* Title */}
          <Text style={[styles.title, { color: colors.text }]}>
            {step === 'checking' && 'Checking Cache...'}
            {step === 'simplifying' && 'Simplifying Paper'}
            {step === 'done' && 'Done!'}
          </Text>

          {/* Message */}
          {displayMessage && (
            <Animated.View style={{ opacity: fadeAnim }}>
              <Text style={[styles.message, { color: colors.textSecondary }]}>
                {displayMessage}
              </Text>
            </Animated.View>
          )}

          {/* Progress Bar */}
          {step === 'simplifying' && progressValue !== undefined && (
            <View style={styles.progressContainer}>
              <View style={[styles.progressBarBackground, { backgroundColor: colors.border }]}>
                <Animated.View 
                  style={[
                    styles.progressBarFill, 
                    { 
                      backgroundColor: getStepColor(),
                      width: progressWidthAnim.interpolate({
                        inputRange: [0, 100],
                        outputRange: ['0%', '100%']
                      })
                    }
                  ]} 
                />
              </View>
              <Text style={[styles.progressText, { color: colors.textMuted }]}>
                {progressValue}%
              </Text>
            </View>
          )}

          {/* Loading Indicator (if no progress value or checking) */}
          {(step === 'checking' || (step === 'simplifying' && progressValue === undefined)) && (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" color={getStepColor()} />
            </View>
          )}

          {/* Estimated Time (for simplifying step) */}
          {step === 'simplifying' && progressValue === undefined && (
            <Text style={[styles.estimatedTime, { color: colors.textMuted }]}>
              This usually takes 20-30 seconds
            </Text>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  container: {
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    alignItems: 'center',
    width: '100%',
    maxWidth: 340,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: Typography.fontSize.xl,
    fontWeight: '700',
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  message: {
    fontSize: Typography.fontSize.base,
    textAlign: 'center',
    marginBottom: Spacing.lg,
    minHeight: 48,
  },
  loaderContainer: {
    marginBottom: Spacing.md,
  },
  estimatedTime: {
    fontSize: Typography.fontSize.sm,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  progressContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  progressBarBackground: {
    width: '100%',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: Spacing.xs,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: Typography.fontSize.sm,
    fontVariant: ['tabular-nums'],
  }
});

/**
 * SimplifyLoadingModal Component
 *
 * Loading modal for paper simplification process
 * Shows progress messages and engaging visual feedback
 */

import { Colors, Spacing, Typography, Radius } from '@/constants/theme';
import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ActivityIndicator,
  Animated,
  Easing,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface SimplifyLoadingModalProps {
  visible: boolean;
  step: 'idle' | 'checking' | 'simplifying' | 'done';
  message?: string;
  progressValue?: number; // 0-100
}

const PROGRESS_MESSAGES = [
  'Reading the paper...',
  'Connecting dots...',
  'Extracting wisdom...',
  'Simplifying complex terms...',
  'Crafting your summary...',
  'Almost ready...',
];

const { width } = Dimensions.get('window');

export const SimplifyLoadingModal: React.FC<SimplifyLoadingModalProps> = ({
  visible,
  step,
  message,
  progressValue,
}) => {
  const colors = Colors.light;
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  
  // Animations
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const progressWidthAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  // Clamp progress value
  const normalizedProgress = progressValue !== undefined 
    ? Math.min(100, Math.max(0, courseProgress(progressValue)))
    : undefined;

  // Helper to make progress feel smoother/faster at start
  function courseProgress(value: number) {
    return value;
  }

  // Animate progress bar
  useEffect(() => {
    if (normalizedProgress !== undefined) {
      Animated.timing(progressWidthAnim, {
        toValue: normalizedProgress,
        duration: 500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }).start();
    }
  }, [normalizedProgress]);

  // Pulse Animation Loop
  useEffect(() => {
    if (visible && step !== 'done') {
      const pulseLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );
      pulseLoop.start();

      // Slow rotation for background decorative elements if we had them, 
      // or just rotate the icon slightly for dynamic feel? 
      // Let's stick to pulse for the icon to keep it clean.
      
      return () => {
        pulseLoop.stop();
        pulseAnim.setValue(1);
      };
    }
  }, [visible, step]);

  // Reset state when modal closes
  useEffect(() => {
    if (!visible) {
      progressWidthAnim.setValue(0);
      setCurrentMessageIndex(0);
    }
  }, [visible]);

  // Cycle messages
  useEffect(() => {
    if (visible && step === 'simplifying' && !message) {
      const interval = setInterval(() => {
        Animated.sequence([
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start();

        setTimeout(() => {
          setCurrentMessageIndex((prev) => (prev + 1) % PROGRESS_MESSAGES.length);
        }, 300); // Change text in middle of fade
      }, 2500);

      return () => clearInterval(interval);
    }
  }, [visible, step, message, fadeAnim]);

  const getStepIcon = () => {
    switch (step) {
      case 'checking':
        return 'scan-outline';
      case 'simplifying':
        return 'sparkles';
      case 'done':
        return 'checkmark-circle';
      default:
        return 'hourglass-outline';
    }
  };

  const getStepColor = () => {
    switch (step) {
      case 'checking':
        return ['#6366F1', '#818CF8']; // Indigo
      case 'simplifying':
        return ['#F59E0B', '#FCD34D']; // Amber
      case 'done':
        return ['#10B981', '#34D399']; // Emerald
      default:
        return ['#9CA3AF', '#D1D5DB'];
    }
  };

  const displayMessage =
    message || (step === 'simplifying' ? PROGRESS_MESSAGES[currentMessageIndex] : '');

  const gradientColors = getStepColor();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: colors.surface }]}>
          
          {/* Animated Icon Container */}
          <Animated.View 
            style={[
              styles.iconContainer, 
              { 
                backgroundColor: gradientColors[0] + '10',
                transform: [{ scale: pulseAnim }]
              }
            ]}
          >
            <LinearGradient
              colors={gradientColors as [string, string]}
              style={styles.iconBackground}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons 
                name={getStepIcon() as any} 
                size={42} 
                color="#FFFFFF" 
              />
            </LinearGradient>
          </Animated.View>

          {/* Title */}
          <Text style={[styles.title, { color: colors.text }]}>
            {step === 'checking' && 'Analyzing...'}
            {step === 'simplifying' && 'Simplifying'}
            {step === 'done' && 'Success!'}
          </Text>

          {/* Dynamic Message */}
          <View style={styles.messageContainer}>
            {displayMessage ? (
              <Animated.Text 
                style={[
                  styles.message, 
                  { 
                    color: colors.textSecondary,
                    opacity: fadeAnim 
                  }
                ]}
              >
                {displayMessage}
              </Animated.Text>
            ) : null}
          </View>

          {/* Indeterminate Loading */}
          {(step === 'checking' ||step === 'simplifying') && (
            <ActivityIndicator 
              size="small" 
              color={gradientColors[0]} 
              style={{ marginTop: 10 }} 
            />
          )}

        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)', // Darker overlay for better focus
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  container: {
    borderRadius: 24, // Softer corners
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
    width: '100%',
    maxWidth: 320,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconBackground: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  messageContainer: {
    height: 24, // Fixed height to prevent jumping
    marginBottom: 24,
    justifyContent: 'center',
  },
  message: {
    fontSize: 15,
    textAlign: 'center',
    fontWeight: '500',
  },
});

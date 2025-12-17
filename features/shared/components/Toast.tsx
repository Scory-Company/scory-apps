import { Colors, Radius, Shadows, Spacing, Typography } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect } from 'react';
import {
  Animated,
  Dimensions,
  Pressable,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  Platform,
} from 'react-native';

type ToastType = 'success' | 'error' | 'warning' | 'info' | 'loading' | 'progress';
type ToastPosition = 'top' | 'bottom';

interface ToastAction {
  label: string;
  onClick: () => void;
}

interface ToastProps {
  id: string;
  visible: boolean;
  type?: ToastType;
  message: string;
  description?: string;
  position?: ToastPosition;
  duration?: number;
  progress?: number; // 0-100 for progress type
  action?: ToastAction;
  onHide?: () => void;
  index?: number; // For stacking multiple toasts
}

const SCREEN_WIDTH = Dimensions.get('window').width;
const TOAST_MIN_HEIGHT = 80;
const TOAST_SPACING = 12;

export function Toast({
  visible,
  type = 'info',
  message,
  description,
  position = 'top',
  duration = 3000,
  progress,
  action,
  onHide,
  index = 0,
}: ToastProps) {
  const colors = Colors.light;
  const translateYRef = React.useRef(new Animated.Value(position === 'top' ? -100 : 100));
  const opacityRef = React.useRef(new Animated.Value(0));

  const hideToast = React.useCallback(() => {
    Animated.parallel([
      Animated.timing(translateYRef.current, {
        toValue: position === 'top' ? -100 : 100,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacityRef.current, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onHide?.();
    });
  }, [position, onHide]);

  useEffect(() => {
    if (visible) {
      // Show toast with fade in
      Animated.parallel([
        Animated.spring(translateYRef.current, {
          toValue: index * (TOAST_MIN_HEIGHT + TOAST_SPACING),
          useNativeDriver: true,
          friction: 8,
          tension: 100,
        }),
        Animated.timing(opacityRef.current, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto hide after duration (except for loading/progress types)
      if (type !== 'loading' && type !== 'progress' && duration !== Infinity) {
        const timer = setTimeout(() => {
          hideToast();
        }, duration);

        return () => clearTimeout(timer);
      }
    } else {
      // Reset position when not visible
      translateYRef.current.setValue(position === 'top' ? -100 : 100);
      opacityRef.current.setValue(0);
    }
  }, [visible, index, type, duration, position, hideToast]);

  const getToastConfig = () => {
    switch (type) {
      case 'success':
        return {
          icon: 'checkmark-circle' as const,
          iconColor: colors.success,
          bgColor: colors.success,
          showSpinner: false,
        };
      case 'error':
        return {
          icon: 'close-circle' as const,
          iconColor: colors.error,
          bgColor: colors.error,
          showSpinner: false,
        };
      case 'warning':
        return {
          icon: 'warning' as const,
          iconColor: colors.warning,
          bgColor: colors.warning,
          showSpinner: false,
        };
      case 'loading':
      case 'progress':
        return {
          icon: 'hourglass' as const,
          iconColor: colors.primary,
          bgColor: colors.primary,
          showSpinner: true,
        };
      case 'info':
      default:
        return {
          icon: 'information-circle' as const,
          iconColor: colors.info,
          bgColor: colors.info,
          showSpinner: false,
        };
    }
  };

  const config = getToastConfig();

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.toastContainer,
        position === 'top' ? styles.toastTop : styles.toastBottom,
        {
          transform: [{ translateY: translateYRef.current }],
          opacity: opacityRef.current,
        },
      ]}
      pointerEvents="box-none"
    >
      <Pressable
        onPress={action?.onClick}
        style={[styles.toast, { backgroundColor: config.bgColor }]}
        disabled={!action}
      >
        {/* Icon */}
        {config.showSpinner ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <Ionicons name={config.icon} size={20} color="#FFFFFF" />
        )}

        {/* Text Content */}
        <View style={styles.textContainer}>
          <Text 
            style={{
              fontSize: 14,
              fontWeight: '600',
              lineHeight: 18,
              color: '#FFFFFF',
              includeFontPadding: false,
            }} 
            numberOfLines={2}
            ellipsizeMode="tail"
          >
            {message || 'Notification'}
          </Text>
          
          {description && description.trim() !== '' && (
            <Text 
              style={{
                fontSize: 12,
                fontWeight: '400',
                lineHeight: 16,
                color: '#FFFFFF',
                opacity: 0.9,
                includeFontPadding: false,
                marginTop: 2,
              }}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {description}
            </Text>
          )}
        </View>

        {/* Action Button */}
        {action && (
          <View style={[styles.actionContainer, { backgroundColor: 'rgba(255, 255, 255, 0.2)' }]}>
            <Text style={[styles.actionText, { color: '#FFFFFF' }]}>
              {action.label}
            </Text>
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    zIndex: 9999,
  },
  toastTop: {
    top: Spacing['3xl'],
  },
  toastBottom: {
    bottom: Spacing['3xl'],
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.lg,
    maxWidth: SCREEN_WIDTH * 0.85,
    minHeight: 48,
    overflow: 'visible',
    ...Shadows.md,
  },
  textContainer: {
    flex: 1,
  },
  message: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
    includeFontPadding: false,
  },
  description: {
    fontSize: 12,
    fontWeight: '400',
    opacity: 0.95,
    lineHeight: 16,
    includeFontPadding: false,
  },
  actionContainer: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: Radius.sm,
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
  },
  actionText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: '700',
    fontFamily: Typography.fontFamily.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});

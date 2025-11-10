import { Colors, Radius, Shadows, Spacing, Typography } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect } from 'react';
import { Animated, Dimensions, Modal, StyleSheet, Text, View } from 'react-native';

type ToastType = 'success' | 'error' | 'warning' | 'info';
type ToastPosition = 'top' | 'bottom';

interface ToastProps {
  visible: boolean;
  type?: ToastType;
  message: string;
  position?: ToastPosition;
  duration?: number;
  onHide?: () => void;
}

const SCREEN_WIDTH = Dimensions.get('window').width;

export function Toast({
  visible,
  type = 'info',
  message,
  position = 'top',
  duration = 3000,
  onHide,
}: ToastProps) {
  const colors = Colors.light;
  const [translateY] = React.useState(new Animated.Value(position === 'top' ? -100 : 100));

  useEffect(() => {
    if (visible) {
      // Show toast
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        friction: 8,
        tension: 100,
      }).start();

      // Auto hide after duration
      const timer = setTimeout(() => {
        hideToast();
      }, duration);

      return () => clearTimeout(timer);
    } else {
      // Reset position when not visible
      translateY.setValue(position === 'top' ? -100 : 100);
    }
  }, [visible]);

  const hideToast = () => {
    Animated.timing(translateY, {
      toValue: position === 'top' ? -100 : 100,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      onHide?.();
    });
  };

  const getToastConfig = () => {
    switch (type) {
      case 'success':
        return {
          icon: 'checkmark-circle' as const,
          iconColor: colors.success,
          bgColor: colors.success,
        };
      case 'error':
        return {
          icon: 'close-circle' as const,
          iconColor: colors.error,
          bgColor: colors.error,
        };
      case 'warning':
        return {
          icon: 'warning' as const,
          iconColor: colors.warning,
          bgColor: colors.warning,
        };
      case 'info':
      default:
        return {
          icon: 'information-circle' as const,
          iconColor: colors.info,
          bgColor: colors.info,
        };
    }
  };

  const config = getToastConfig();

  return (
    <Modal visible={visible} transparent animationType="none" statusBarTranslucent>
      <Animated.View
        style={[
          styles.toastContainer,
          position === 'top' ? styles.toastTop : styles.toastBottom,
          { transform: [{ translateY }] },
        ]}
        pointerEvents="box-none"
      >
        <View style={[styles.toast, { backgroundColor: config.bgColor }]}>
          <Ionicons name={config.icon} size={20} color={colors.textwhite} />
          <Text style={[styles.message, { color: colors.textwhite }]} numberOfLines={2}>
            {message}
          </Text>
        </View>
      </Animated.View>
    </Modal>
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
    ...Shadows.md,
  },
  message: {
    flex: 1,
    fontSize: Typography.fontSize.xs,
    fontWeight: '600',
    fontFamily: Typography.fontFamily.semiBold,
    lineHeight: 18,
  },
});

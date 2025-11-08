import { Colors, Radius, Spacing, Typography } from '@/constants/theme';
import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  TouchableOpacityProps,
  ViewStyle,
} from 'react-native';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'google';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends TouchableOpacityProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: React.ReactNode;
  loading?: boolean;
  fullWidth?: boolean;
}

export function Button({
  variant = 'primary',
  size = 'lg',
  children,
  loading = false,
  fullWidth = false,
  disabled,
  style,
  ...props
}: ButtonProps) {
  const colors = Colors.light;

  const getVariantStyles = (): { container: ViewStyle; text: TextStyle } => {
    switch (variant) {
      case 'primary':
        return {
          container: {
            backgroundColor: colors.primaryDark,
          },
          text: {
            color: colors.textInverse,
          },
        };
      case 'secondary':
        return {
          container: {
            backgroundColor: colors.primary,
          },
          text: {
            color: colors.secondary,
          },
        };
      case 'outline':
        return {
          container: {
            backgroundColor: 'transparent',
            borderWidth: 2,
            borderColor: colors.primary,
          },
          text: {
            color: colors.secondary,
          },
        };
      case 'ghost':
        return {
          container: {
            backgroundColor: 'transparent',
          },
          text: {
            color: colors.primary,
          },
        };
      case 'google':
        return {
          container: {
            backgroundColor: 'transparent',
            borderWidth: 2,
            borderColor: colors.textMuted,
          },
          text: {
            color: colors.primary,
          },
        };
    }
  };

  const getSizeStyles = (): { container: ViewStyle; text: TextStyle } => {
    switch (size) {
      case 'sm':
        return {
          container: {
            paddingVertical: Spacing.sm,
            paddingHorizontal: Spacing.md,
          },
          text: {
            fontSize: Typography.fontSize.sm,
          },
        };
      case 'md':
        return {
          container: {
            paddingVertical: Spacing.md,
            paddingHorizontal: Spacing.lg,
          },
          text: {
            fontSize: Typography.fontSize.base,
          },
        };
      case 'lg':
        return {
          container: {
            paddingVertical: Spacing.lg - 4,
            paddingHorizontal: Spacing.xl,
          },
          text: {
            fontSize: Typography.fontSize.base,
          },
        };
    }
  };

  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();

  return (
    <TouchableOpacity
      style={[
        styles.container,
        variantStyles.container,
        sizeStyles.container,
        fullWidth && styles.fullWidth,
        disabled && styles.disabled,
        style,
      ]}
      disabled={disabled || loading}
      activeOpacity={0.7}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'outline' || variant === 'ghost' ? colors.primary : colors.textInverse}
        />
      ) : (
        <Text style={[styles.text, variantStyles.text, sizeStyles.text]}>{children}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  text: {
    fontFamily: Typography.fontFamily.semiBold,
    textAlign: 'center',
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
});

export function ButtonLink({
  children,
  disabled,
  style,
  ...props
}: TouchableOpacityProps & { children: React.ReactNode }) {
  const colors = Colors.light;

  return (
    <TouchableOpacity disabled={disabled} activeOpacity={0.7} {...props}>
      <Text
        style={[
          {
            color: colors.textMuted,
            fontSize: Typography.fontSize.sm,
            fontFamily: Typography.fontFamily.regular,
            textAlign: 'center',
          },
          disabled && { opacity: 0.5 },
        ]}
      >
        {children}
      </Text>
    </TouchableOpacity>
  );
}

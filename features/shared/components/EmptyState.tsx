import { Colors, Radius, Spacing, Typography } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TouchableOpacity } from 'react-native';

interface EmptyStateProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  message?: string;
  iconSize?: number;
  style?: ViewStyle;
  actionLabel?: string;
  onActionPress?: () => void;
  actionIcon?: keyof typeof Ionicons.glyphMap;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  message,
  iconSize = 48,
  style,
  actionLabel,
  onActionPress,
  actionIcon = 'add-circle',
}) => {
  const colors = Colors.light;

  return (
    <View style={[styles.container, style]}>
      <View style={[styles.iconContainer, { backgroundColor: colors.surfaceSecondary }]}>
        <Ionicons name={icon} size={iconSize} color={colors.textMuted} />
      </View>
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      {message && (
        <Text style={[styles.message, { color: colors.textSecondary }]}>{message}</Text>
      )}
      {actionLabel && onActionPress && (
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.third }]}
          activeOpacity={0.8}
          onPress={onActionPress}
        >
          <Ionicons name={actionIcon} size={20} color={colors.textwhite} />
          <Text style={[styles.actionButtonText, { color: colors.textwhite }]}>
            {actionLabel}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing['2xl'],
    paddingHorizontal: Spacing.lg,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: Typography.fontSize.lg,
    fontWeight: '600',
    marginBottom: Spacing.xs,
    textAlign: 'center',
  },
  message: {
    fontSize: Typography.fontSize.sm,
    textAlign: 'center',
    maxWidth: 280,
    marginBottom: Spacing.lg,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    borderRadius: Radius.md,
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  actionButtonText: {
    fontSize: Typography.fontSize.base,
    fontWeight: '600',
  },
});

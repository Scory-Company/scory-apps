import { Colors, Spacing, Typography, Radius, Shadows } from '@/constants/theme';
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface TopicCardProps {
  emoji: string;
  title: string;
  backgroundColor?: string;
  onPress?: () => void;
}

export function TopicCard({ emoji, title, backgroundColor, onPress }: TopicCardProps) {
  const colors = Colors.light;

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          ...Shadows.sm,
        },
      ]}
      activeOpacity={0.8}
      onPress={onPress}
    >
      <View
        style={[
          styles.icon,
          {
            backgroundColor: backgroundColor || colors.primary + '15',
          },
        ]}
      >
        <Text style={styles.emoji}>{emoji}</Text>
      </View>
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '47%',
    padding: Spacing.md,
    borderRadius: Radius.lg,
    gap: Spacing.sm,
  },
  icon: {
    width: 48,
    height: 48,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 24,
  },
  title: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '700',
  },
});

import { Colors, Spacing, Typography, Radius } from '@/constants/theme';
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface XPBadgeProps {
  level: number;
  xp: number;
}

export function XPBadge({ level, xp }: XPBadgeProps) {
  const colors = Colors.light;

  return (
    <View style={[styles.container, { backgroundColor: colors.primary }]}>
      <Text style={styles.level}>Level {level}</Text>
      <Text style={styles.xp}>{xp} XP</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.lg,
    alignItems: 'center',
    minWidth: 80,
  },
  level: {
    fontSize: Typography.fontSize.xs,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 2,
  },
  xp: {
    fontSize: Typography.fontSize.lg,
    fontWeight: '700',
    color: '#000000',
  },
});

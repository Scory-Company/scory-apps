import { Colors, Radius, Shadows, Spacing, Typography } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';

interface StatCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  value: string;
  labelKey: string;
  color?: string;
  bgColor?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  icon,
  value,
  labelKey,
  color,
  bgColor,
}) => {
  const { t } = useTranslation();
  const colors = Colors.light;

  return (
    <View style={[styles.statCard, Shadows.sm, { backgroundColor: colors.surface }]}>
      <View style={[styles.statIconContainer, { backgroundColor: bgColor || colors.surfaceSecondary }]}>
        <Ionicons name={icon} size={24} color={color || colors.primary} />
      </View>
      <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{t(labelKey)}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  statCard: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    alignItems: 'center',
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  statValue: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: '700',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: Typography.fontSize.xs,
    textAlign: 'center',
  },
});
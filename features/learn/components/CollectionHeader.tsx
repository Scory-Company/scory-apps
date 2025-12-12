import { Colors, Radius, Spacing, Typography } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ProgressBar } from './ProgressBar';

interface CollectionHeaderProps {
  title: string;
  category: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  articlesCount: number;
  progress: number;
}

export const CollectionHeader: React.FC<CollectionHeaderProps> = ({
  title,
  category,
  icon,
  color,
  articlesCount,
  progress,
}) => {
  const colors = Colors.light;

  // Calculate read articles count
  const readCount = Math.round((progress / 100) * articlesCount);

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      {/* Icon and Title */}
      <View style={styles.headerRow}>
        <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
          <Ionicons name={icon} size={40} color={color} />
        </View>

        <View style={styles.headerContent}>
          <Text style={[styles.category, { color: colors.textSecondary }]}>{category}</Text>
          <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        </View>
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Ionicons name="book-outline" size={16} color={colors.textSecondary} />
          <Text style={[styles.statText, { color: colors.textSecondary }]}>
            {articlesCount} {articlesCount === 1 ? 'article' : 'articles'}
          </Text>
        </View>

        <View style={styles.statDivider} />

        <View style={styles.statItem}>
          <Ionicons name="checkmark-circle-outline" size={16} color={colors.textSecondary} />
          <Text style={[styles.statText, { color: colors.textSecondary }]}>
            {progress}% completed
          </Text>
        </View>
      </View>

      {/* Progress Bar */}
      {progress > 0 && (
        <View style={styles.progressSection}>
          <ProgressBar current={readCount} total={articlesCount} />
          <Text style={[styles.progressLabel, { color: colors.textSecondary }]}>
            {readCount} of {articlesCount} read
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    gap: Spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerContent: {
    flex: 1,
    gap: Spacing.xs,
  },
  category: {
    fontSize: Typography.fontSize.xs,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: '700',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  statText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: 16,
    backgroundColor: Colors.light.border,
  },
  progressSection: {
    gap: Spacing.xs,
  },
  progressLabel: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '500',
    marginTop: Spacing.xs,
  },
});

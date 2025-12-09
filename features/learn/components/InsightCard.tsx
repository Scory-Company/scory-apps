import { Colors, Radius, Shadows, Spacing, Typography } from '@/constants/theme';
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { InsightNote } from '@/services';

interface InsightCardProps {
  insight: InsightNote;
  onPress?: () => void;
}

/**
 * Format date as relative time (Today, Yesterday, X days ago)
 */
const formatRelativeDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return `${Math.floor(diffDays / 30)} months ago`;
};

export const InsightCard: React.FC<InsightCardProps> = ({ insight, onPress }) => {
  const colors = Colors.light;

  // Format date
  const date = formatRelativeDate(insight.createdAt);

  return (
    <TouchableOpacity
      style={[styles.insightCard, Shadows.sm, { backgroundColor: colors.surface }]}
      activeOpacity={0.8}
      onPress={onPress}
    >
      <View style={styles.insightHeader}>
        <Text style={[styles.insightArticleTitle, { color: colors.text }]} numberOfLines={1}>
          {insight.articleTitle}
        </Text>
        <Text style={[styles.insightDate, { color: colors.textMuted }]}>
          {date}
        </Text>
      </View>

      <Text style={[styles.insightNote, { color: colors.textSecondary }]} numberOfLines={3}>
        {insight.content}
      </Text>

      <View style={styles.seeDetailContainer}>
        <Text style={[styles.seeDetailText, { color: colors.third }]}>See Detail</Text>
        <Ionicons name="chevron-forward" size={16} color={colors.third} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  insightCard: {
    padding: Spacing.md,
    borderRadius: Radius.lg,
  },
  insightHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  insightArticleTitle: {
    flex: 1,
    fontSize: Typography.fontSize.base,
    fontWeight: '600',
  },
  insightDate: {
    fontSize: Typography.fontSize.xs,
  },
  insightNote: {
    fontSize: Typography.fontSize.sm,
    lineHeight: 20,
    marginBottom: Spacing.sm,
  },
  seeDetailContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    gap: 4,
  },
  seeDetailText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '500',
  },
});
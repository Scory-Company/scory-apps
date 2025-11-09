import { Colors, Radius, Shadows, Spacing, Typography } from '@/constants/theme';
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface InsightCardProps {
  articleTitle: string;
  note: string;
  date: string;
  tags: string[];
  onPress?: () => void;
}

export const InsightCard: React.FC<InsightCardProps> = ({
  articleTitle,
  note,
  date,
  tags,
  onPress,
}) => {
  const colors = Colors.light;

  return (
    <TouchableOpacity
      style={[styles.insightCard, Shadows.sm, { backgroundColor: colors.surface }]}
      activeOpacity={0.8}
      onPress={onPress}
    >
      <View style={styles.insightHeader}>
        <Text style={[styles.insightArticleTitle, { color: colors.text }]} numberOfLines={1}>
          {articleTitle}
        </Text>
        <Text style={[styles.insightDate, { color: colors.textMuted }]}>
          {date}
        </Text>
      </View>

      <Text style={[styles.insightNote, { color: colors.textSecondary }]} numberOfLines={3}>
        {note}
      </Text>

      <View style={styles.insightTags}>
        {tags.map((tag, index) => (
          <View key={index} style={[styles.tag, { backgroundColor: colors.primary + '20' }]}>
            <Text style={[styles.tagText, { color: colors.third }]}>{tag}</Text>
          </View>
        ))}
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
  insightTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  tag: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.sm,
  },
  tagText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: '500',
  },
});
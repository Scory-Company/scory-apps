import { Colors, Radius, Shadows, Spacing, Typography } from '@/constants/theme';
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { InsightNote } from '@/services';
import { useTranslation } from 'react-i18next';

interface InsightCardProps {
  insight: InsightNote;
  onPress?: () => void;
}

/**
 * Format date as relative time (Today, Yesterday, X days ago)
 */
const formatRelativeDate = (dateString: string, t: any): string => {
  const date = new Date(dateString);
  const now = new Date();

  // Set both dates to start of day (midnight) for accurate day comparison
  const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const nowOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const diffMs = nowOnly.getTime() - dateOnly.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return t('insightCard.dates.today');
  if (diffDays === 1) return t('insightCard.dates.yesterday');
  if (diffDays < 7) return t('insightCard.dates.daysAgo', { days: diffDays });
  if (diffDays < 30) return t('insightCard.dates.weeksAgo', { weeks: Math.floor(diffDays / 7) });
  return t('insightCard.dates.monthsAgo', { months: Math.floor(diffDays / 30) });
};

export const InsightCard: React.FC<InsightCardProps> = ({ insight, onPress }) => {
  const { t } = useTranslation();
  const colors = Colors.light;

  // Format date
  const date = formatRelativeDate(insight.createdAt, t);

  // Determine title and type
  const isStandalone = !insight.articleId;
  const displayTitle = insight.articleTitle || insight.title || t('insightCard.personalNote');

  return (
    <TouchableOpacity
      style={[styles.insightCard, Shadows.sm, { backgroundColor: colors.surface }]}
      activeOpacity={0.8}
      onPress={onPress}
    >
      <View style={styles.insightHeader}>
        <View style={[styles.titleContainer, { borderLeftColor: colors.third }]}>
          {isStandalone && (
            <Ionicons name="document-text-outline" size={16} color={colors.textMuted} style={styles.titleIcon} />
          )}
          <Text style={[styles.insightArticleTitle, { color: colors.text }]}>
            {displayTitle}
          </Text>
        </View>
        <Text style={[styles.insightDate, { color: colors.textMuted }]}>
          {date}
        </Text>
      </View>

      <Text style={[styles.insightNote, { color: colors.textSecondary }]} numberOfLines={3}>
        {insight.content}
      </Text>

      <View style={styles.seeDetailContainer}>
        <Text style={[styles.seeDetailText, { color: colors.third }]}>{t('insightCard.seeDetail')}</Text>
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
  titleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingLeft: Spacing.sm,
    borderLeftWidth: 3,
  },
  titleIcon: {
    marginTop: 2,
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
import { Colors, Radius, Shadows, Spacing, Typography } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ProgressBar } from './ProgressBar';
import { useTranslation } from 'react-i18next';

interface StudyCollectionCardProps {
  title: string;
  category: string;
  articlesCount: number;
  progress: number;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  onPress?: () => void;
}

export const StudyCollectionCard: React.FC<StudyCollectionCardProps> = ({
  title,
  category,
  articlesCount,
  progress,
  icon,
  color,
  onPress,
}) => {
  const { t } = useTranslation();
  const colors = Colors.light;

  // Calculate read articles count from progress percentage
  const readCount = Math.round((progress / 100) * articlesCount);
  const isCompleted = progress >= 100;

  return (
    <TouchableOpacity
      style={[styles.collectionCard, Shadows.md, { backgroundColor: colors.surface }]}
      activeOpacity={0.8}
      onPress={onPress}
    >
      <View style={[styles.collectionIconContainer, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={28} color={color} />
        {isCompleted && (
          <View style={[styles.completedBadge, { backgroundColor: colors.success }]}>
            <Ionicons name="checkmark" size={12} color={colors.textwhite} />
          </View>
        )}
      </View>

      <View style={styles.collectionContent}>
        <View style={styles.categoryRow}>
          <Text style={[styles.collectionCategory, { color: colors.textSecondary }]}>
            {category}
          </Text>
          {isCompleted && (
            <View style={[styles.completedLabel, { backgroundColor: colors.success + '20' }]}>
              <Ionicons name="trophy" size={10} color={colors.success} />
              <Text style={[styles.completedLabelText, { color: colors.success }]}>
                {t('learn.components.studyCollectionCard.completed')}
              </Text>
            </View>
          )}
        </View>
        <Text style={[styles.collectionTitle, { color: colors.text }]} numberOfLines={2}>
          {title}
        </Text>
        <Text style={[styles.collectionArticles, { color: colors.textSecondary }]}>
          {articlesCount} {t('learn.components.studyCollectionCard.articles')}
        </Text>

        {progress > 0 ? (
          <View style={styles.collectionProgress}>
            <ProgressBar current={readCount} total={articlesCount} />
          </View>
        ) : (
          <View style={[styles.startButton, { borderColor: color }]}>
            <Text style={[styles.startButtonText, { color: color }]}>{t('learn.components.studyCollectionCard.startLearning')}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  collectionCard: {
    flexDirection: 'row',
    padding: Spacing.md,
    borderRadius: Radius.lg,
    gap: Spacing.md,
  },
  collectionIconContainer: {
    width: 64,
    height: 64,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  completedBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  collectionContent: {
    flex: 1,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  collectionCategory: {
    fontSize: Typography.fontSize.xs,
    fontWeight: '500',
    textTransform: 'uppercase',
  },
  completedLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    borderRadius: Radius.sm,
  },
  completedLabelText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: '600',
  },
  collectionTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  collectionArticles: {
    fontSize: Typography.fontSize.sm,
    marginBottom: Spacing.sm,
  },
  collectionProgress: {
    marginTop: Spacing.xs,
  },
  startButton: {
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    alignSelf: 'flex-start',
    marginTop: Spacing.xs,
  },
  startButtonText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '600',
  },
});
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Colors, Spacing, Typography, Radius } from '@/constants/theme';
import { CardArticle } from '@/features/shared/components/CardArticle';
import { forYouArticles } from '@/data/mock';
import { ReadingLevel, getReadingLevel } from '@/constants/readingLevels';
import { router } from 'expo-router';

interface ForYouSectionProps {
  readingLevel: ReadingLevel;
  onChangeLevel?: () => void;
}

export function ForYouSection({ readingLevel, onChangeLevel }: ForYouSectionProps) {
  const colors = Colors.light;
  const levelInfo = getReadingLevel(readingLevel);

  // Get top 3 recommended articles
  const recommendedArticles = forYouArticles.slice(0, 3);

  return (
    <View style={styles.container}>
      {/* Header with level info */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={[styles.title, { color: colors.text }]}>For You</Text>
          <View style={[styles.levelBadge, { backgroundColor: colors.primary + '20' }]}>
            <Text style={styles.levelEmoji}>{levelInfo?.emoji}</Text>
            <Text style={[styles.levelText, { color: colors.third }]}>
              {levelInfo?.label}
            </Text>
          </View>
        </View>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Based on your reading level
        </Text>
      </View>

      {/* Horizontal scroll articles */}
      <View style={styles.scrollWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {recommendedArticles.map((article) => (
            <View key={article.id} style={styles.cardWrapper}>
              <CardArticle
                image={article.image}
                title={article.title}
                author={article.author}
                category={article.category}
                rating={article.rating}
                reads={article.reads}
                onPress={() => router.push(`/article/${article.id}` as any)}
              />
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Change level link */}
      {/* <TouchableOpacity
        style={styles.changeLevelButton}
        onPress={onChangeLevel}
        activeOpacity={0.7}
      >
        <Text style={[styles.changeLevelText, { color: colors.third }]}>
          Adjust your reading level
        </Text>
      </TouchableOpacity> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.lg,
  },
  header: {
    marginBottom: Spacing.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  title: {
    fontSize: Typography.fontSize.xl,
    fontWeight: '700',
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
    gap: 4,
  },
  levelEmoji: {
    fontSize: 14,
  },
  levelText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: Typography.fontSize.sm,
  },
  scrollWrapper: {
    marginHorizontal: -Spacing.lg,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  cardWrapper: {
    width: 220,
  },
  changeLevelButton: {
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  changeLevelText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '600',
  },
});

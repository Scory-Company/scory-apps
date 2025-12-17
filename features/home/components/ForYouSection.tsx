import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Colors, Radius, Spacing, Typography } from '@/constants/theme';
import { CardArticle, SkeletonCardArticle } from '@/features/shared/components';
import { ReadingLevel } from '@/constants/readingLevels';
import { router } from 'expo-router';
import { useForYouArticles } from '@/hooks/useForYouArticles';
import { ArticleResponse } from '@/services';

interface ForYouSectionProps {
  readingLevel: ReadingLevel;
  onChangeLevel?: () => void;
}

export function ForYouSection({ readingLevel }: ForYouSectionProps) {
  const colors = Colors.light;

  // Fetch personalized articles with auto-exclude read articles
  const {
    articles,
    isLoading,
    fetchArticles,
  } = useForYouArticles({ limit: 5, readingLevel });

  // Fetch articles on mount and when reading level changes
  // Note: fetchArticles has built-in caching (30s TTL), so it won't refetch unnecessarily
  useEffect(() => {
    fetchArticles();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [readingLevel]); // Only refetch when reading level changes

  // Display max 5 articles
  const displayArticles = articles.slice(0, 5);

  // Loading skeleton
  if (isLoading && !articles.length) {
    return (
      <View style={styles.container}>
        <View style={[styles.header, styles.contentPadding]}>
          <View style={styles.titleRow}>
            <Text style={[styles.title, { color: colors.text }]}>For You</Text>
          </View>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Curating articles for you...
          </Text>
        </View>

        <View style={styles.scrollWrapper}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            scrollEnabled={false}
          >
            <SkeletonCardArticle />
            <SkeletonCardArticle />
            <SkeletonCardArticle />
          </ScrollView>
        </View>
      </View>
    );
  }

  // Empty state
  if (!isLoading && articles.length === 0) {
    return (
      <View style={styles.container}>
        <View style={[styles.header, styles.contentPadding]}>
          <View style={styles.titleRow}>
            <Text style={[styles.title, { color: colors.text }]}>For You</Text>
          </View>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            All caught up! No new articles available.
          </Text>
        </View>
      </View>
    );
  }

  // Main content
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, styles.contentPadding]}>
        <View style={styles.titleRow}>
          <Text style={[styles.title, { color: colors.text }]}>For You</Text>
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
          {displayArticles.map((article: ArticleResponse) => {
            const cardProps = {
              image: article.imageUrl
                ? { uri: article.imageUrl }
                : require('@/assets/images/dummy/news/education.png'),
              title: article.title,
              author: article.authorName,
              category: article.category?.name || 'General',
              rating: article.rating || 0,
              reads:
                article.viewCount >= 1000
                  ? `${(article.viewCount / 1000).toFixed(1)}k reads`
                  : `${article.viewCount || 0} reads`,
            };

            return (
              <View key={article.id}>
                <CardArticle
                  {...cardProps}
                  onPress={() => router.push(`/article/${article.slug}` as any)}
                />
              </View>
            );
          })}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.xl,
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
  contentPadding: {
    paddingHorizontal: Spacing.sm,
  },
});

import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Colors, Spacing, Typography, Radius } from '@/constants/theme';
import { CardArticle } from '@/features/shared/components/CardArticle';
import { ReadingLevel, getReadingLevel } from '@/constants/readingLevels';
import { router } from 'expo-router';
import { articlesApi } from '@/services';

interface ForYouSectionProps {
  readingLevel: ReadingLevel;
  onChangeLevel?: () => void;
}

interface Article {
  id: string;
  slug: string;
  image: any;
  title: string;
  author: string;
  category: string;
  rating: number;
  reads: string;
}

export function ForYouSection({ readingLevel, onChangeLevel }: ForYouSectionProps) {
  const colors = Colors.light;
  const levelInfo = getReadingLevel(readingLevel);

  // State for articles
  const [articles, setArticles] = useState<Article[]>([]);

  // Fetch For You articles from API
  const fetchForYouArticles = useCallback(async () => {
    try {
      console.log('[For You Feed] Fetching personalized articles...');
      console.log('[For You Feed] Reading level:', readingLevel);

      const response = await articlesApi.getForYou({ page: 1, limit: 5 });
      console.log('[For You Feed] API Response:', response.data);

      const apiData = response.data?.data;

      if (apiData?.articles?.length > 0) {
        // Transform API response to match UI structure
        const transformedArticles: Article[] = apiData.articles.map((article: any) => ({
          id: article.id,
          slug: article.slug,
          image: article.imageUrl
            ? { uri: article.imageUrl }
            : require('@/assets/images/dummy/news/education.png'),
          title: article.title,
          author: article.authorName,
          category: article.category?.name || 'General',
          rating: article.rating || 0,
          reads: article.viewCount
            ? `${(article.viewCount / 1000).toFixed(1)}k reads`
            : '0 reads',
        }));

        setArticles(transformedArticles.slice(0, 3)); // Take top 3
        console.log('[For You Feed] ✅ Loaded articles from API:', transformedArticles.length);
      } else {
        console.log('[For You Feed] ⚠️ No articles from API');
        setArticles([]);
      }
    } catch (error: any) {
      console.log('[For You Feed] ❌ API error');
      console.error('[For You Feed] Error:', error?.message || error);
      setArticles([]);
    }
  }, [readingLevel]);

  // Fetch on mount and when reading level changes
  useEffect(() => {
    fetchForYouArticles();
  }, [fetchForYouArticles]);

  // Show empty state if no articles
  if (articles.length === 0) {
    return (
      <View style={styles.container}>
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
            Loading personalized articles...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header with level info */}
      <View style={[styles.header, styles.contentPadding]}>
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
          {articles.map((article) => (
            <View key={article.id}>
              <CardArticle
                image={article.image}
                title={article.title}
                author={article.author}
                category={article.category}
                rating={article.rating}
                reads={article.reads}
                onPress={() => router.push(`/article/${article.slug}` as any)}
              />
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Change level link */}
      {onChangeLevel && (
        <TouchableOpacity
          style={[styles.changeLevelButton, styles.contentPadding]}
          onPress={onChangeLevel}
          activeOpacity={0.7}
        >
          <Text style={[styles.changeLevelText, { color: colors.third }]}>
            Adjust your reading level
          </Text>
        </TouchableOpacity>
      )}
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
  changeLevelButton: {
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    marginTop: Spacing.xs,
  },
  changeLevelText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '600',
  },
  contentPadding: {
    paddingHorizontal: Spacing.sm,
  },
});

import { Colors, Spacing, Typography, Radius, Shadows } from '@/constants/theme';
import { SearchBar } from '@/features/explore/components/SearchBar';
import { CategoryFilterChips } from '@/features/explore/components/CategoryFilterChips';
import React, { useState, useMemo, useEffect } from 'react';
import { ScrollView, StatusBar, StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { popularArticles, categoryList } from '@/data/mock';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { filterContent } from '@/utils/filterContent';
import { articlesApi } from '@/services';

// Display article type for UI compatibility
interface DisplayArticle {
  id: string | number;
  image: any;
  title: string;
  author: string;
  category: string;
  rating: number;
  reads: string;
}

export default function PopularArticlesScreen() {
  const colors = Colors.light;
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [articles, setArticles] = useState<DisplayArticle[]>(popularArticles);
  const [_isLoading, setIsLoading] = useState(true);

  // Fetch articles from API
  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    setIsLoading(true);
    try {
      const response = await articlesApi.getPopular({ page: 1, limit: 50 });
      const apiData = response.data?.data;
      if (apiData?.articles?.length > 0) {
        const transformed = apiData.articles.map((article: any) => ({
          id: article.id,
          slug: article.slug,
          image: { uri: article.imageUrl || 'https://images.unsplash.com/photo-1477332552946-cfb384aeaf1c?w=600' },
          title: article.title,
          author: article.authorName,
          category: article.category?.name || 'General',
          rating: article.rating,
          reads: `${(article.viewCount / 1000).toFixed(1)}k reads`,
        }));
        setArticles(transformed);
        console.log('Loaded', transformed.length, 'popular articles from API');
      }
    } catch {
      console.log('API unavailable, using mock data');
      setArticles(popularArticles);
    } finally {
      setIsLoading(false);
    }
  };

  // Filtered articles using reusable utility
  const filteredArticles = useMemo(() => {
    return filterContent({
      searchQuery,
      selectedCategory,
      allData: articles,
    });
  }, [searchQuery, selectedCategory, articles]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* Header with Back Button */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Most Popular</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchBarContainer}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search articles..."
        />
      </View>

      {/* Articles List */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Category Filter */}
        <View style={styles.categoryFilterWrapper}>
          <CategoryFilterChips
            categories={categoryList}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
        </View>
        {filteredArticles.length > 0 ? (
          <View style={styles.listContainer}>
            {filteredArticles.map((article) => (
              <TouchableOpacity
                key={article.id}
                style={[styles.largeCard, { backgroundColor: colors.surface }, Shadows.sm]}
                onPress={() => router.push(`/article/${article.slug || article.id}` as any)}
              >
                <Image source={article.image} style={styles.largeImage} />
                <View style={styles.largeContent}>
                  <View style={[styles.largeCategoryBadge, { backgroundColor: colors.surfaceSecondary }]}>
                    <Text style={[styles.largeCategoryText, { color: colors.textSecondary }]}>
                      {article.category}
                    </Text>
                  </View>
                  <Text style={[styles.largeTitle, { color: colors.text }]} numberOfLines={2}>
                    {article.title}
                  </Text>
                  <Text style={[styles.largeAuthor, { color: colors.textMuted }]}>{article.author}</Text>
                  <View style={styles.largeFooter}>
                    <View style={styles.largeRating}>
                      <Ionicons name="star" size={14} color={colors.warning} />
                      <Text style={[styles.largeRatingText, { color: colors.text }]}>{article.rating}</Text>
                    </View>
                    <Text style={[styles.largeReads, { color: colors.textMuted }]}>{article.reads}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyIcon, { color: colors.textMuted }]}>🔍</Text>
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>
              No articles found
            </Text>
            <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
              Try searching with different keywords
            </Text>
          </View>
        )}

        {/* Bottom Padding */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  backButton: {
    padding: Spacing.xs,
  },
  title: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: '700' as const,
    flex: 1,
    textAlign: 'center',
  },
  // Search Bar
  searchBarContainer: {
    marginBottom: Spacing.md,
  },
  // Category Filter Wrapper
  categoryFilterWrapper: {
    marginLeft: -Spacing.lg,
    marginBottom: Spacing.xxs,
  },
  // List
  listContainer: {
    gap: Spacing.lg,
  },
  // Large Card Styles (Vertical Layout: Image on top)
  largeCard: {
    borderRadius: Radius.xl,
    overflow: 'hidden',
  },
  largeImage: {
    width: '100%',
    height: 180,
  },
  largeContent: {
    padding: Spacing.lg,
  },
  largeCategoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 4,
    borderRadius: Radius.sm,
    marginBottom: Spacing.sm,
  },
  largeCategoryText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: '500',
  },
  largeTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: '600',
    marginBottom: Spacing.xs,
    lineHeight: Typography.fontSize.lg * 1.4,
  },
  largeAuthor: {
    fontSize: Typography.fontSize.sm,
    marginBottom: Spacing.md,
  },
  largeFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  largeRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  largeRatingText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '600',
  },
  largeReads: {
    fontSize: Typography.fontSize.sm,
  },
  // Empty State
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing['4xl'],
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: Spacing.md,
  },
  emptyText: {
    fontSize: Typography.fontSize.lg,
    fontWeight: '600' as const,
    marginBottom: Spacing.xs,
  },
  emptySubtext: {
    fontSize: Typography.fontSize.sm,
  },
});

import { Colors, Spacing, Typography, Radius, Shadows } from '@/constants/theme';
import { SearchBar } from '@/features/explore/components/SearchBar';
import { CategoryFilterChips } from '@/features/explore/components/CategoryFilterChips';
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { ScrollView, StatusBar, StyleSheet, Text, View, TouchableOpacity, Image, ActivityIndicator, NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { popularArticles, categoryList } from '@/data/mock';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { filterContent } from '@/utils/filterContent';
import { articlesApi } from '@/services';
import { SkeletonListArticle } from '@/features/shared/components';
import { useTranslation } from 'react-i18next';

// Display article type for UI compatibility
interface DisplayArticle {
  id: string | number;
  slug?: string;
  image: any;
  title: string;
  author: string;
  category: string;
  rating: number;
  reads: string;
}

export default function PopularArticlesScreen() {
  const { t } = useTranslation();
  const colors = Colors.light;
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [articles, setArticles] = useState<DisplayArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreArticles, setHasMoreArticles] = useState(true);
  const [isUsingApi, setIsUsingApi] = useState(false);

  const INITIAL_LOAD = 10;
  const LOAD_MORE_COUNT = 10;

  // Fetch articles from API
  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    setIsLoading(true);
    try {
      const response = await articlesApi.getPopular({ page: 1, limit: INITIAL_LOAD, timeframe: 'all' });
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
          reads: article.viewCount >= 1000
            ? `${(article.viewCount / 1000).toFixed(1)}k reads`
            : `${article.viewCount || 0} reads`,
        }));
        setArticles(transformed);
        setIsUsingApi(true);
        setHasMoreArticles(apiData.pagination.page < apiData.pagination.totalPages);
      }
    } catch {
      // API unavailable, using mock data
      const initialMockData = popularArticles.slice(0, INITIAL_LOAD);
      setArticles(initialMockData);
      setHasMoreArticles(popularArticles.length > INITIAL_LOAD);
    } finally {
      setIsLoading(false);
    }
  };

  // Load more articles (API or mock)
  const loadMoreArticles = useCallback(async () => {
    if (isLoadingMore || !hasMoreArticles) return;

    setIsLoadingMore(true);

    if (isUsingApi) {
      // Load from API
      try {
        const nextPage = currentPage + 1;
        const response = await articlesApi.getPopular({ page: nextPage, limit: LOAD_MORE_COUNT, timeframe: 'all' });
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
            reads: article.viewCount >= 1000
              ? `${(article.viewCount / 1000).toFixed(1)}k reads`
              : `${article.viewCount || 0} reads`,
          }));
          setArticles(prev => [...prev, ...transformed]);
          setCurrentPage(nextPage);
          setHasMoreArticles(nextPage < apiData.pagination.totalPages);
        }
      } catch {
        setHasMoreArticles(false);
      }
    } else {
      // Load from mock data
      await new Promise(resolve => setTimeout(resolve, 300));
      const currentLength = articles.length;
      const nextBatch = popularArticles.slice(currentLength, currentLength + LOAD_MORE_COUNT);

      if (nextBatch.length > 0) {
        setArticles(prev => [...prev, ...nextBatch]);
        setHasMoreArticles(currentLength + nextBatch.length < popularArticles.length);
      } else {
        setHasMoreArticles(false);
      }
    }

    setIsLoadingMore(false);
  }, [isLoadingMore, hasMoreArticles, isUsingApi, currentPage, articles.length, LOAD_MORE_COUNT]);

  // Detect when user scrolls near the end
  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const paddingToEnd = 200; // Trigger before reaching the end

    // Check if scrolled near the end
    if (layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToEnd) {
      loadMoreArticles();
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
        <Text style={[styles.title, { color: colors.text }]}>{t('popularArticles.title')}</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchBarContainer}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSearch={() => {}} // No-op: instant filtering, no search button needed
          placeholder={t('popularArticles.searchPlaceholder')}
        />
      </View>

      {/* Articles List */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {/* Category Filter */}
        <View style={styles.categoryFilterWrapper}>
          <CategoryFilterChips
            categories={categoryList}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
        </View>

        {/* Loading State */}
        {isLoading ? (
          <SkeletonListArticle count={5} />
        ) : filteredArticles.length > 0 ? (
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

            {/* Loading indicator when loading more */}
            {isLoadingMore && (
              <View style={styles.loadingMore}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                  Loading more articles...
                </Text>
              </View>
            )}

            {/* End of list indicator */}
            {!hasMoreArticles && filteredArticles.length > INITIAL_LOAD && (
              <View style={styles.endOfList}>
                <Text style={[styles.endOfListText, { color: colors.textMuted }]}>
                  You&apos;ve reached the end
                </Text>
              </View>
            )}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyIcon, { color: colors.textMuted }]}>🔍</Text>
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>
              {t('popularArticles.emptyState.title')}
            </Text>
            <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
              {t('popularArticles.emptyState.subtitle')}
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
  // Loading More Styles
  loadingMore: {
    paddingVertical: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  loadingText: {
    fontSize: Typography.fontSize.sm,
  },
  // End of List Styles
  endOfList: {
    paddingVertical: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  endOfListText: {
    fontSize: Typography.fontSize.sm,
    fontStyle: 'italic',
  },
});

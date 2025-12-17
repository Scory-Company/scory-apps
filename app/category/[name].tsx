import { Colors, Spacing, Typography, Radius, Shadows } from '@/constants/theme';
import { SearchBar } from '@/features/explore/components/SearchBar';
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { ScrollView, StatusBar, StyleSheet, Text, View, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { articlesApi, ArticleResponse } from '@/services/articles';
import { SkeletonListArticle } from '@/features/shared/components';

interface TransformedArticle {
  id: string;
  slug: string;
  title: string;
  author: string;
  category: string;
  rating: number;
  image: { uri: string } | any;
  reads: string;
}

export default function CategoryDetailScreen() {
  const colors = Colors.light;
  const { name } = useLocalSearchParams();

  // Capitalize first letter of category name (science -> Science)
  const categoryName = typeof name === 'string'
    ? name.charAt(0).toUpperCase() + name.slice(1).toLowerCase()
    : 'Category';

  const [searchQuery, setSearchQuery] = useState('');
  const [articles, setArticles] = useState<TransformedArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Fetch ALL articles from API (no category filter in API call)
  const fetchArticles = useCallback(async (pageNum: number = 1, append: boolean = false) => {
    try {
      if (pageNum === 1) {
        setLoading(true);
        setError(null);
      } else {
        setLoadingMore(true);
      }

      console.log(`[Category Detail] Fetching articles (page ${pageNum})...`);

      // Fetch ALL articles without category filter (backend doesn't support it properly)
      const response = await articlesApi.getArticles({
        page: pageNum,
        limit: 50, // Load more to ensure we have enough for filtering
      });

      const apiData = response.data?.data;

      if (apiData?.articles) {
        const transformedArticles: TransformedArticle[] = apiData.articles.map((article: ArticleResponse) => ({
          id: article.id,
          slug: article.slug,
          title: article.title,
          author: article.authorName,
          category: article.category?.name || 'General',
          rating: article.rating || 0,
          image: article.imageUrl
            ? { uri: article.imageUrl }
            : require('@/assets/images/dummy/news/education.png'),
          reads: article.viewCount
            ? `${(article.viewCount / 1000).toFixed(1)}k reads`
            : '0 reads',
        }));

        if (append) {
          setArticles(prev => [...prev, ...transformedArticles]);
        } else {
          setArticles(transformedArticles);
        }

        // Check if there are more pages
        const { page: currentPage, totalPages } = apiData.pagination;
        setHasMore(currentPage < totalPages);

        console.log(`[Category Detail] ✅ Loaded ${transformedArticles.length} articles (page ${currentPage}/${totalPages})`);
      } else {
        setArticles([]);
        setHasMore(false);
      }
    } catch (err: any) {
      console.error('[Category Detail] ❌ Error fetching articles:', err);
      setError(err?.message || 'Failed to load articles');
      if (!append) {
        setArticles([]);
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []); // Remove categoryName dependency

  // Initial load
  useEffect(() => {
    fetchArticles(1, false);
  }, [fetchArticles]);

  // Load more function
  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchArticles(nextPage, true);
    }
  };

  // Filter articles by category AND search query (client-side)
  const filteredArticles = useMemo(() => {
    // First, filter by category
    let filtered = articles.filter(
      article => article.category.toLowerCase() === categoryName.toLowerCase()
    );

    // Then, apply search filter if query exists
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        article =>
          article.title.toLowerCase().includes(query) ||
          article.author.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [articles, categoryName, searchQuery]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* Header with Back Button */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>{categoryName}</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchBarContainer}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSearch={() => {}} // No-op: instant filtering
          placeholder={`Search ${categoryName} articles...`}
        />
      </View>

      {/* Articles List */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        onScroll={({ nativeEvent }) => {
          const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
          const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 100;
          if (isCloseToBottom && !searchQuery.trim()) {
            handleLoadMore();
          }
        }}
        scrollEventThrottle={400}
      >
        {/* Loading State (Initial) */}
        {loading && <SkeletonListArticle count={5} />}

        {/* Error State */}
        {error && !loading && (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyIcon, { color: colors.textMuted }]}>⚠️</Text>
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>
              Failed to load articles
            </Text>
            <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
              {error}
            </Text>
            <TouchableOpacity
              style={[styles.retryButton, { backgroundColor: colors.primary }]}
              onPress={() => fetchArticles(1, false)}
            >
              <Text style={[styles.retryButtonText, { color: colors.surface }]}>
                Retry
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Articles List */}
        {!loading && !error && filteredArticles.length > 0 && (
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

            {/* Load More Indicator */}
            {loadingMore && (
              <View style={styles.loadMoreContainer}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={[styles.loadMoreText, { color: colors.textMuted }]}>
                  Loading more...
                </Text>
              </View>
            )}

            {/* No More Articles */}
            {!hasMore && !searchQuery.trim() && articles.length > 0 && (
              <Text style={[styles.endText, { color: colors.textMuted }]}>
                No more articles
              </Text>
            )}
          </View>
        )}

        {/* Empty State */}
        {!loading && !error && filteredArticles.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyIcon, { color: colors.textMuted }]}>📚</Text>
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>
              No {categoryName} articles found
            </Text>
            <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
              {searchQuery.trim()
                ? 'Try searching with different keywords'
                : `We don't have any ${categoryName} articles yet`}
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
    textAlign: 'center',
  },
  // Loading States
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing['4xl'],
  },
  loadingText: {
    fontSize: Typography.fontSize.sm,
    marginTop: Spacing.md,
  },
  loadMoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.lg,
    gap: Spacing.sm,
  },
  loadMoreText: {
    fontSize: Typography.fontSize.sm,
  },
  endText: {
    fontSize: Typography.fontSize.sm,
    textAlign: 'center',
    paddingVertical: Spacing.lg,
  },
  retryButton: {
    marginTop: Spacing.lg,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: Radius.md,
  },
  retryButtonText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '600',
  },
});

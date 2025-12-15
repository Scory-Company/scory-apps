import { Colors, Spacing, Typography, Radius, Shadows } from '@/constants/theme';
import { SearchBar } from '@/features/explore/components/SearchBar';
import { CategoryFilterChips } from '@/features/explore/components/CategoryFilterChips';
import React, { useState, useMemo } from 'react';
import { ScrollView, StatusBar, StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { forYouArticles, recentlyAddedArticles, popularArticles, categoryList } from '@/data/mock';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { filterContent } from '@/utils/filterContent';

export default function TopRatedArticlesScreen() {
  const colors = Colors.light;
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Combine all articles and sort by rating (highest first)
  const allArticlesSorted = useMemo(() => {
    const combined = [
      ...forYouArticles,
      ...recentlyAddedArticles,
      ...popularArticles,
    ];

    // Remove duplicates based on id
    const unique = combined.filter((article, index, self) =>
      index === self.findIndex((a) => a.id === article.id)
    );

    // Sort by rating (highest first)
    return unique.sort((a, b) => b.rating - a.rating);
  }, []);

  // Filtered articles using reusable utility
  const filteredArticles = useMemo(() => {
    return filterContent({
      searchQuery,
      selectedCategory,
      allData: allArticlesSorted,
    });
  }, [searchQuery, selectedCategory, allArticlesSorted]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* Header with Back Button */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Top Rated</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchBarContainer}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSearch={() => {}} // No-op: instant filtering
          placeholder="Search top rated articles..."
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
            {filteredArticles.map((article, index) => (
              <TouchableOpacity
                key={article.id}
                style={[styles.largeCard, { backgroundColor: colors.surface }, Shadows.sm]}
                onPress={() => router.push(`/article/${article.id}` as any)}
              >
                <Image source={article.image} style={styles.largeImage} />
                {/* Top Rated Badge for top 3 */}
                {index < 3 && (
                  <View style={[styles.topBadge, { backgroundColor: colors.warning }]}>
                    <Ionicons name="trophy" size={12} color="#FFF" />
                    <Text style={styles.topBadgeText}>#{index + 1}</Text>
                  </View>
                )}
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
                    <Text style={[styles.largeReads, { color: colors.textMuted }]}>
                      {article.reads || article.date}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyIcon, { color: colors.textMuted }]}>🏆</Text>
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
    position: 'relative',
  },
  largeImage: {
    width: '100%',
    height: 180,
  },
  topBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
    zIndex: 10,
  },
  topBadgeText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '700',
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

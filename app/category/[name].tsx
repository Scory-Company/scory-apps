import { Colors, Spacing, Typography, Radius, Shadows } from '@/constants/theme';
import { SearchBar } from '@/features/explore/components/SearchBar';
import React, { useState, useMemo } from 'react';
import { ScrollView, StatusBar, StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { forYouArticles, recentlyAddedArticles, popularArticles } from '@/data/mock';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function CategoryDetailScreen() {
  const colors = Colors.light;
  const { name } = useLocalSearchParams();
  const categoryName = typeof name === 'string' ? name : 'Category';

  const [searchQuery, setSearchQuery] = useState('');

  // Combine ALL articles that have images (for display with cards)
  const allArticles = useMemo(() => {
    // Only use articles with complete data (including images)
    const combined = [
      ...forYouArticles,
      ...recentlyAddedArticles,
      ...popularArticles,
    ];

    // Remove duplicates based on id
    const unique = combined.filter((article, index, self) =>
      index === self.findIndex((a) => a.id === article.id)
    );

    return unique;
  }, []);

  // Filter articles by category and search query
  const filteredArticles = useMemo(() => {
    let filtered = allArticles.filter(
      article => article.category.toLowerCase() === categoryName.toLowerCase()
    );

    // Apply search filter if query exists
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        article =>
          article.title.toLowerCase().includes(query) ||
          article.author.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [allArticles, categoryName, searchQuery]);

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
          placeholder={`Search ${categoryName} articles...`}
        />
      </View>

      {/* Articles List */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {filteredArticles.length > 0 ? (
          <View style={styles.listContainer}>
            {filteredArticles.map((article) => (
              <TouchableOpacity
                key={article.id}
                style={[styles.largeCard, { backgroundColor: colors.surface }, Shadows.sm]}
                onPress={() => router.push(`/article/${article.id}` as any)}
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
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
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
  },
});

import { Colors, Spacing, Typography } from '@/constants/theme';
import { SearchBar } from '@/features/explore/components/SearchBar';
import { StudyCollectionCard } from '@/features/learn/components';
import { EmptyState, SkeletonListArticle } from '@/features/shared/components';
import { useStudyCollections } from '@/hooks/useStudyCollections';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState, useMemo } from 'react';
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

export default function AllCollectionsScreen() {
  const { t } = useTranslation();
  const colors = Colors.light;
  const [searchQuery, setSearchQuery] = useState('');

  const {
    collections,
    isLoading,
    isRefreshing,
    error,
    refresh,
  } = useStudyCollections();

  // Filtered collections based on search query
  const filteredCollections = useMemo(() => {
    if (!searchQuery.trim()) {
      return collections;
    }

    const query = searchQuery.toLowerCase();
    return collections.filter(
      (collection) =>
        collection.title.toLowerCase().includes(query) ||
        collection.category.toLowerCase().includes(query)
    );
  }, [searchQuery, collections]);

  // Sort collections by articlesCount (descending) and progress
  const sortedCollections = useMemo(() => {
    return [...filteredCollections].sort((a, b) => {
      // First, sort by articles count (more articles = higher priority)
      if (b.articlesCount !== a.articlesCount) {
        return b.articlesCount - a.articlesCount;
      }
      // If same count, sort by progress (lower progress = higher priority for completion)
      return a.progress - b.progress;
    });
  }, [filteredCollections]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* Header with Back Button */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>{t('collections.title')}</Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            {collections.length} {collections.length === 1 ? t('collections.collection') : t('collections.collection_plural')}
          </Text>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchSection}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSearch={() => {}} // No-op, filtering happens on text change
          placeholder={t('collections.searchPlaceholder')}
        />
      </View>

      {/* Collections List */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {/* Loading State */}
        {isLoading && collections.length === 0 ? (
          <View style={styles.listContainer}>
            <SkeletonListArticle count={5} />
          </View>
        ) : error && collections.length === 0 ? (
          /* Error State */
          <View style={styles.emptyContainer}>
            <EmptyState
              icon="alert-circle-outline"
              title={t('collections.errors.unableToLoad')}
              message={error}
            />
          </View>
        ) : sortedCollections.length > 0 ? (
          /* Collections Grid */
          <View style={styles.listContainer}>
            {sortedCollections.map((collection) => (
              <StudyCollectionCard
                key={collection.id}
                title={collection.title}
                category={collection.category}
                articlesCount={collection.articlesCount}
                progress={collection.progress}
                icon={collection.icon as any}
                color={collection.color}
                onPress={() => router.push(`/collection/${collection.id}` as any)}
              />
            ))}
          </View>
        ) : searchQuery.trim() ? (
          /* No Search Results */
          <View style={styles.emptyContainer}>
            <EmptyState
              icon="search-outline"
              title={t('collections.emptyStates.noResults')}
              message={t('collections.emptyStates.noResultsMessage', { query: searchQuery })}
            />
          </View>
        ) : (
          /* Empty State - No Collections */
          <View style={styles.emptyContainer}>
            <EmptyState
              icon="folder-open-outline"
              title={t('collections.emptyStates.noCollections')}
              message={t('collections.emptyStates.noCollectionsMessage')}
            />
          </View>
        )}

        {/* Bottom Padding */}
        <View style={{ height: 100 }} />
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
    paddingBottom: 30,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.md,
  },
  backButton: {
    padding: Spacing.xs,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: '700',
  },
  headerSubtitle: {
    fontSize: Typography.fontSize.sm,
    marginTop: 2,
  },
  searchSection: {
    paddingBottom: Spacing.md,
  },
  listContainer: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  emptyContainer: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing['3xl'],
  },
});

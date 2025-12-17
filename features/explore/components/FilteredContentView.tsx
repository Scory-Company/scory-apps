import { Colors, Spacing, Typography } from '@/constants/theme';
import { EmptyState, SkeletonSearchResult } from '@/features/shared/components';
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { FilterChip } from './FilterChip';
import { UnifiedSearchResultCard, UnifiedSearchResult } from './UnifiedSearchResultCard';
import { Article } from '@/utils/filterContent';
import { router } from 'expo-router';
import { SearchResult } from '@/services';
import { useSimplifyAndNavigate } from '@/hooks/useSimplifyPaper';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

interface FilteredContentViewProps {
  results: Article[];
  searchQuery: string;
  selectedCategory: string;
  onClearFilters: () => void;
  onClearSearch?: () => void;
  onClearCategory?: () => void;
  isLoading?: boolean;
  externalResults?: SearchResult[];
  hasMore?: boolean;
  onLoadMore?: () => void;
  isLoadingMore?: boolean;
  onSimplifyExternal?: (paper: SearchResult) => void | Promise<void>;
}

export const FilteredContentView: React.FC<FilteredContentViewProps> = ({
  results,
  searchQuery,
  selectedCategory,
  onClearFilters,
  onClearSearch,
  onClearCategory,
  isLoading = false,
  externalResults = [],
  hasMore = false,
  onLoadMore,
  isLoadingMore = false,
  onSimplifyExternal,
}) => {
  const { t } = useTranslation();
  const colors = Colors.light;
  // Keep old simplifyAndNavigate as fallback for backward compatibility
  const { simplifyAndNavigate } = useSimplifyAndNavigate();

  const hasExternalResults = externalResults.length > 0;
  const hasLocalResults = results.length > 0;

  // Loading state
  if (isLoading) {
    return (
      <View style={styles.container}>
        <SkeletonSearchResult count={5} />
      </View>
    );
  }

  // No results in local database
  if (!hasLocalResults && !hasExternalResults) {
    const message = searchQuery && selectedCategory !== 'All'
      ? t('explore.filteredContent.noResultsMessages.searchAndCategory', { query: searchQuery, category: selectedCategory })
      : searchQuery
      ? t('explore.filteredContent.noResultsMessages.searchOnly', { query: searchQuery })
      : t('explore.filteredContent.noResultsMessages.categoryOnly', { category: selectedCategory });

    return (
      <View style={styles.container}>
        <EmptyState
          icon="search-outline"
          title={t('explore.filteredContent.noResultsTitle')}
          message={message}
          actionLabel={t('explore.filteredContent.clearFilters')}
          actionIcon="refresh"
          onActionPress={onClearFilters}
        />
      </View>
    );
  }

  // Has results (local or external or both)
  const totalResults = results.length + externalResults.length;

  return (
    <View style={styles.container}>
      {/* Results Header */}
      <View style={styles.resultsHeader}>
        <Text style={[styles.resultCount, { color: colors.text }]}>
          {t('explore.filteredContent.resultsCount', { count: totalResults })}
        </Text>

        {/* Active Filters */}
        {(searchQuery || selectedCategory !== 'All') && (
          <View style={styles.activeFilters}>
            {searchQuery && (
              <FilterChip
                label={`"${searchQuery.length > 20 ? searchQuery.substring(0, 20) + '...' : searchQuery}"`}
                onRemove={onClearSearch || onClearFilters}
              />
            )}
            {selectedCategory !== 'All' && (
              <FilterChip
                label={selectedCategory}
                onRemove={onClearCategory || onClearFilters}
              />
            )}
          </View>
        )}

        {/* Clear All Button */}
        {(searchQuery || selectedCategory !== 'All') && (
          <TouchableOpacity onPress={onClearFilters} style={styles.clearButton}>
            <Text style={[styles.clearButtonText, { color: colors.error }]}>
              {t('explore.filteredContent.clearAllFilters')}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Results List */}
      <View style={styles.resultsList}>
        {/* Local Database Results */}
        {hasLocalResults && results.map((article) => {
          const unifiedResult: UnifiedSearchResult = {
            id: String(article.id),
            title: article.title,
            excerpt: '', // Internal articles don't have excerpt in current data structure
            authors: [article.author],
            year: null, // Internal articles don't have year in current data structure
            source: 'internal',
            type: 'article',
            category: article.category,
            rating: article.rating,
            reads: article.reads,
            metadata: {
              isSimplified: true, // Internal articles are already simplified
              isExternal: false,
              articleId: String(article.id), // Add articleId for navigation
            },
          };

          return (
            <UnifiedSearchResultCard
              key={article.id}
              result={unifiedResult}
              highlightText={searchQuery}
              onPress={() => router.push(`/article/${article.slug || article.id}` as any)}
              onReadSimplified={() => router.push(`/article/${article.slug || article.id}` as any)}
            />
          );
        })}

        {/* External Results Section (OpenAlex + Scholar) */}
        {hasExternalResults && (
          <>
            {/* Separator if both local and external results exist */}
            {hasLocalResults && (
              <View style={styles.scholarSeparator}>
                <View style={[styles.separatorLine, { backgroundColor: colors.border }]} />
                <Text style={[styles.separatorText, { color: colors.textSecondary }]}>
                  {t('explore.filteredContent.externalSources')}
                </Text>
                <View style={[styles.separatorLine, { backgroundColor: colors.border }]} />
              </View>
            )}

            {/* External Search Results */}
            {externalResults.map((article: SearchResult) => {
              // SearchResult already matches UnifiedSearchResult interface
              const unifiedResult: UnifiedSearchResult = {
                ...article,
                // Ensure metadata exists with proper defaults
                metadata: article.metadata || {
                  isSimplified: false,
                  isExternal: true,
                  externalId: article.id,
                  externalSource: article.source === 'openalex' ? 'openalex' : 'scholar',
                },
              };

              return (
                <UnifiedSearchResultCard
                  key={article.id}
                  result={unifiedResult}
                  highlightText={searchQuery}
                  onSimplify={() => {
                    // Use background simplification if handler provided, otherwise use old method
                    if (onSimplifyExternal) {
                      // NEW: Background simplification (non-blocking)
                      onSimplifyExternal(article);
                    } else {
                      // OLD: Blocking simplification (fallback)
                      simplifyAndNavigate({
                        externalId: article.id,
                        source: article.source === 'openalex' ? 'openalex' : 'scholar',
                        title: article.title,
                        authors: article.authors,
                        year: article.year || 2024,
                        abstract: article.excerpt,
                        pdfUrl: article.pdfUrl || undefined,
                        doi: article.doi || undefined,
                        citations: article.citations || undefined,
                        rating: (article as any).rating || undefined,
                      });
                    }
                  }}
                  onReadSimplified={(articleId) => {
                    // Navigate to already simplified article
                    router.push(`/article/${articleId}` as any);
                  }}
                />
              );
            })}

            {/* Load More / End Message */}
            {isLoadingMore && (
              <View style={styles.loadingMore}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={[styles.loadingMoreText, { color: colors.textSecondary }]}>
                  {t('explore.filteredContent.loadingMore')}
                </Text>
              </View>
            )}

            {hasMore && !isLoadingMore && onLoadMore && (
              <TouchableOpacity
                style={styles.loadMoreButton}
                activeOpacity={0.7}
                onPress={onLoadMore}
              >
                <Ionicons name="arrow-down-circle-outline" size={20} color={colors.textMuted} />
                <Text style={[styles.loadMoreText, { color: colors.textSecondary }]}>
                  {t('explore.filteredContent.loadMore')}
                </Text>
              </TouchableOpacity>
            )}

            {!hasMore && externalResults.length > 0 && (
              <View style={styles.endMessage}>
                <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                <Text style={[styles.endMessageText, { color: colors.textSecondary }]}>
                  {t('explore.filteredContent.allLoaded', { count: externalResults.length })}
                </Text>
              </View>
            )}
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: Spacing.xs,
  },
  resultsHeader: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  resultCount: {
    fontSize: Typography.fontSize.base,
    fontWeight: '600',
    marginBottom: Spacing.sm,
  },
  activeFilters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  clearButton: {
    alignSelf: 'flex-start',
  },
  clearButtonText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '500',
  },
  resultsList: {
    paddingHorizontal: Spacing.lg,
  },
  scholarSeparator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.xl,
    gap: Spacing.sm,
  },
  separatorLine: {
    flex: 1,
    height: 1,
  },
  separatorText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '600',
    paddingHorizontal: Spacing.sm,
  },
  loadingMore: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.lg,
    gap: Spacing.sm,
  },
  loadingMoreText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '500',
  },
  loadMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    marginTop: Spacing.md,
    gap: Spacing.xs,
  },
  loadMoreText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '500',
  },
  endMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.lg,
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  endMessageText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '500',
  },
});

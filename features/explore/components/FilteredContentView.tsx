import { Colors, Spacing, Typography } from '@/constants/theme';
import { EmptyState, SkeletonSearchResult, SimplifyLoadingModal } from '@/features/shared/components';
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { FilterChip } from './FilterChip';
import { UnifiedSearchResultCard, UnifiedSearchResult } from './UnifiedSearchResultCard';
import { Article } from '@/utils/filterContent';
import { router } from 'expo-router';
import { SearchResult } from '@/services';
import { useSimplifyAndNavigate } from '@/hooks/useSimplifyPaper';

interface FilteredContentViewProps {
  results: Article[];
  searchQuery: string;
  selectedCategory: string;
  onClearFilters: () => void;
  onClearSearch?: () => void;
  onClearCategory?: () => void;
  isLoading?: boolean;
  externalResults?: SearchResult[];
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
}) => {
  const colors = Colors.light;
  const { simplifyAndNavigate, isSimplifying, progress } = useSimplifyAndNavigate();

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
    return (
      <View style={styles.container}>
        <EmptyState
          icon="search-outline"
          title="No Results Found"
          message={
            searchQuery && selectedCategory !== 'All'
              ? `No articles found for "${searchQuery}" in ${selectedCategory}`
              : searchQuery
              ? `No articles found for "${searchQuery}" in our database or external sources`
              : `No articles found in ${selectedCategory}`
          }
          actionLabel="Clear Filters"
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
          {totalResults} article{totalResults > 1 ? 's' : ''} found
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
              Clear All Filters
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
            excerpt: '', // Article doesn't have excerpt
            authors: [article.author],
            year: null,
            source: 'internal',
            type: 'article',
            image: article.image,
            category: article.category,
            rating: article.rating,
            reads: article.reads,
            metadata: {
              isSimplified: false,
              isExternal: false,
            },
          };

          return (
            <UnifiedSearchResultCard
              key={article.id}
              result={unifiedResult}
              highlightText={searchQuery}
              onPress={() => router.push(`/article/${article.slug || article.id}` as any)}
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
                  External Sources (OpenAlex & Google Scholar)
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
                    // Simplify workflow with backend integration
                    simplifyAndNavigate({
                      externalId: article.id,
                      source: article.source === 'openalex' ? 'openalex' : 'scholar',
                      title: article.title,
                      authors: article.authors,
                      year: article.year || 2024,
                      abstract: article.excerpt,
                      pdfUrl: article.pdfUrl || undefined,
                      doi: article.doi || undefined,
                    });
                  }}
                  onReadSimplified={(articleId) => {
                    // Navigate to already simplified article
                    router.push(`/article/${articleId}` as any);
                  }}
                />
              );
            })}
          </>
        )}
      </View>

      {/* Simplify Loading Modal */}
      <SimplifyLoadingModal
        visible={isSimplifying}
        step={progress.step}
        message={progress.message}
      />
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
});

import { Colors, Spacing, Typography } from '@/constants/theme';
import { EmptyState, SkeletonSearchResult } from '@/features/shared/components';
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { FilterChip } from './FilterChip';
import { SearchResultCard } from './SearchResultCard';
import { Article } from '@/utils/filterContent';
import { router } from 'expo-router';
import { ScholarArticle } from '@/data/mock/scholar/scholar-results';
import { ScholarResultCard } from './ScholarResultCard';

interface FilteredContentViewProps {
  results: Article[];
  searchQuery: string;
  selectedCategory: string;
  onClearFilters: () => void;
  onClearSearch?: () => void;
  onClearCategory?: () => void;
  isLoading?: boolean;
  scholarResults?: ScholarArticle[];
  isSearchingScholar?: boolean;
}

export const FilteredContentView: React.FC<FilteredContentViewProps> = ({
  results,
  searchQuery,
  selectedCategory,
  onClearFilters,
  onClearSearch,
  onClearCategory,
  isLoading = false,
  scholarResults = [],
  isSearchingScholar = false,
}) => {
  const colors = Colors.light;

  const hasScholarResults = scholarResults.length > 0;
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
  if (!hasLocalResults && !hasScholarResults) {
    return (
      <View style={styles.container}>
        <EmptyState
          icon="search-outline"
          title="No Results Found"
          message={
            searchQuery && selectedCategory !== 'All'
              ? `No articles found for "${searchQuery}" in ${selectedCategory}`
              : searchQuery
              ? `No articles found for "${searchQuery}" in our database or Google Scholar`
              : `No articles found in ${selectedCategory}`
          }
          actionLabel="Clear Filters"
          actionIcon="refresh"
          onActionPress={onClearFilters}
        />
      </View>
    );
  }

  // Has results (local or scholar or both)
  const totalResults = results.length + scholarResults.length;

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
        {hasLocalResults && results.map((article) => (
          <SearchResultCard
            key={article.id}
            image={article.image}
            title={article.title}
            author={article.author}
            category={article.category}
            rating={article.rating}
            reads={article.reads}
            highlightText={searchQuery}
            onPress={() => router.push(`/article/${article.slug || article.id}` as any)}
          />
        ))}

        {/* Scholar Results Section */}
        {hasScholarResults && (
          <>
            {/* Separator if both local and scholar results exist */}
            {hasLocalResults && (
              <View style={styles.scholarSeparator}>
                <View style={[styles.separatorLine, { backgroundColor: colors.border }]} />
                <Text style={[styles.separatorText, { color: colors.textSecondary }]}>
                  External Sources (Google Scholar)
                </Text>
                <View style={[styles.separatorLine, { backgroundColor: colors.border }]} />
              </View>
            )}

            {/* Google Scholar Results */}
            {scholarResults.map((article) => (
              <ScholarResultCard
                key={article.id}
                article={article}
                highlightText={searchQuery}
              />
            ))}
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
});

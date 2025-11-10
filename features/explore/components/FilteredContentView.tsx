import { Colors, Spacing, Typography } from '@/constants/theme';
import { EmptyState } from '@/features/shared/components';
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { FilterChip } from './FilterChip';
import { SearchResultCard } from './SearchResultCard';
import { Article } from '@/utils/filterContent';

interface FilteredContentViewProps {
  results: Article[];
  searchQuery: string;
  selectedCategory: string;
  onClearFilters: () => void;
  onClearSearch?: () => void;
  onClearCategory?: () => void;
}

export const FilteredContentView: React.FC<FilteredContentViewProps> = ({
  results,
  searchQuery,
  selectedCategory,
  onClearFilters,
  onClearSearch,
  onClearCategory,
}) => {
  const colors = Colors.light;

  // No results case
  if (results.length === 0) {
    return (
      <View style={styles.container}>
        <EmptyState
          icon="search-outline"
          title="No Results Found"
          message={
            searchQuery && selectedCategory !== 'All'
              ? `No articles found for "${searchQuery}" in ${selectedCategory}`
              : searchQuery
              ? `No articles found for "${searchQuery}"`
              : `No articles found in ${selectedCategory}`
          }
          actionLabel="Clear Filters"
          actionIcon="refresh"
          onActionPress={onClearFilters}
        />
      </View>
    );
  }

  // Has results
  return (
    <View style={styles.container}>
      {/* Results Header */}
      <View style={styles.resultsHeader}>
        <Text style={[styles.resultCount, { color: colors.text }]}>
          {results.length} article{results.length > 1 ? 's' : ''} found
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
        {results.map((article) => (
          <SearchResultCard
            key={article.id}
            image={article.image}
            title={article.title}
            author={article.author}
            category={article.category}
            rating={article.rating}
            reads={article.reads}
            highlightText={searchQuery}
            onPress={() => console.log('Article pressed:', article.title)}
          />
        ))}
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
});

/**
 * UnifiedSearchResultCard Component
 *
 * Universal card for displaying search results from all sources:
 * - Internal database articles
 * - OpenAlex papers
 * - Google Scholar papers
 *
 * Supports:
 * - Source badges (Internal/OpenAlex/Scholar)
 * - "Already Simplified" badge (if metadata.isSimplified = true)
 * - Conditional actions (Read Simplified vs Simplify Paper)
 * - Search text highlighting
 */

import { Colors, Radius, Shadows, Spacing, Typography } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ImageSourcePropType, Linking } from 'react-native';

// Search Result from API
export interface SearchResultMetadata {
  isSimplified?: boolean;
  isExternal?: boolean;
  articleId?: string;
  externalId?: string;
  externalSource?: 'openalex' | 'scholar';
}

export interface UnifiedSearchResult {
  id: string;
  title: string;
  excerpt: string;
  authors: string[];
  year: number | null;
  source: 'internal' | 'openalex' | 'scholar';
  type?: 'article' | 'paper' | 'preprint' | 'journal-article' | 'review';
  link?: string;
  pdfUrl?: string | null;
  citations?: number;
  isOpenAccess?: boolean;
  publisher?: string | null;
  doi?: string | null;
  language?: string | null;
  metadata?: SearchResultMetadata;

  // Legacy support for existing code
  image?: ImageSourcePropType;
  category?: string;
  rating?: number;
  reads?: string;
  journal?: string;
}

interface UnifiedSearchResultCardProps {
  result: UnifiedSearchResult;
  highlightText?: string;
  onPress?: () => void;
  onSimplify?: () => void;
  onReadSimplified?: (articleId: string) => void;
}

export const UnifiedSearchResultCard: React.FC<UnifiedSearchResultCardProps> = ({
  result,
  highlightText,
  onPress,
  onSimplify,
  onReadSimplified,
}) => {
  const colors = Colors.light;

  // Determine if this is a Scholar result (for special styling)
  const isScholarResult = result.source === 'scholar';
  const isExternalSource = result.source === 'openalex' || result.source === 'scholar';
  const isSimplified = result.metadata?.isSimplified || false;

  // Calculate rating from citations (for Scholar results)
  const rating = result.rating || (result.citations ? citationsToRating(result.citations) : 0);

  // Format authors
  const authorText = Array.isArray(result.authors)
    ? result.authors.join(', ')
    : result.authors || 'Unknown Author';

  // Highlight matching text in title
  const renderHighlightedTitle = () => {
    if (!highlightText || highlightText.trim() === '') {
      return <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>{result.title}</Text>;
    }

    const parts = result.title.split(new RegExp(`(${highlightText})`, 'gi'));
    return (
      <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
        {parts.map((part, i) =>
          part.toLowerCase() === highlightText.toLowerCase() ? (
            <Text key={i} style={[styles.highlight, { backgroundColor: colors.warning + '30' }]}>
              {part}
            </Text>
          ) : (
            <Text key={i}>{part}</Text>
          )
        )}
      </Text>
    );
  };

  // Handle opening external links
  const handleOpenUrl = async (url?: string | null) => {
    if (url) {
      await Linking.openURL(url);
    }
  };

  const handleOpenDoi = async () => {
    if (result.doi) {
      const doiUrl = result.doi.startsWith('http') ? result.doi : `https://doi.org/${result.doi}`;
      await Linking.openURL(doiUrl);
    }
  };

  // Main action handler
  const handleMainAction = () => {
    if (isSimplified && result.metadata?.articleId && onReadSimplified) {
      onReadSimplified(result.metadata.articleId);
    } else if (!isSimplified && onSimplify) {
      onSimplify();
    } else if (onPress) {
      onPress();
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.card,
        Shadows.sm,
        { backgroundColor: colors.surface },
        isExternalSource && styles.externalCard,
      ]}
      activeOpacity={0.8}
      onPress={handleMainAction}
    >
      {/* Image (for internal articles) or placeholder */}
      {result.image && (
        <Image source={result.image} style={styles.image} resizeMode="cover" />
      )}

      <View style={styles.content}>
        {/* Badges Container */}
        <View style={styles.badgesContainer}>
          {/* Source Badge */}
          {isExternalSource && (
            <View style={styles.sourceBadge}>
              <Ionicons name="globe-outline" size={10} color="#6366F1" />
              <Text style={styles.sourceBadgeText}>
                {result.source === 'scholar' ? 'Google Scholar' : 'OpenAlex'}
              </Text>
            </View>
          )}

          {/* Already Simplified Badge */}
          {isSimplified && (
            <View style={styles.simplifiedBadge}>
              <Ionicons name="checkmark-circle" size={10} color="#10B981" />
              <Text style={styles.simplifiedBadgeText}>✓ Already Simplified</Text>
            </View>
          )}
        </View>

        {/* Title with highlight */}
        {renderHighlightedTitle()}

        {/* Authors */}
        <Text style={[styles.author, { color: colors.textSecondary }]} numberOfLines={1}>
          {authorText}
        </Text>

        {/* Metadata Row: Category/Journal + Year */}
        <View style={styles.metaRow}>
          {/* Category Badge (internal) or Journal (external) */}
          {(result.category || result.journal) && (
            <View style={[styles.categoryBadge, { backgroundColor: colors.primary + '15' }]}>
              <Text style={[styles.categoryText, { color: colors.third }]} numberOfLines={1}>
                {result.category || result.journal}
              </Text>
            </View>
          )}

          {/* Year */}
          {result.year && (
            <Text style={[styles.year, { color: colors.textMuted }]}>{result.year}</Text>
          )}
        </View>

        {/* Excerpt/Abstract (for Scholar results) */}
        {isScholarResult && result.excerpt && (
          <Text style={[styles.excerpt, { color: colors.textSecondary }]} numberOfLines={2}>
            {result.excerpt}
          </Text>
        )}

        {/* Footer: Rating, Citations, Reads */}
        <View style={styles.footer}>
          {/* Rating */}
          {rating > 0 && (
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={14} color={colors.warning} />
              <Text style={[styles.rating, { color: colors.textSecondary }]}>{rating.toFixed(1)}</Text>
            </View>
          )}

          {/* Citations (for external sources) */}
          {result.citations !== undefined && result.citations > 0 && (
            <View style={styles.citationsContainer}>
              <Ionicons name="document-text-outline" size={14} color={colors.textMuted} />
              <Text style={[styles.citationsText, { color: colors.textMuted }]}>
                {result.citations} citations
              </Text>
            </View>
          )}

          {/* Reads (for internal articles) */}
          {result.reads && (
            <Text style={[styles.reads, { color: colors.textMuted }]}>{result.reads}</Text>
          )}
        </View>

        {/* Action Buttons (for external sources) */}
        {isExternalSource && (
          <View style={styles.actionsContainer}>
            {/* PDF Button */}
            {result.pdfUrl && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleOpenUrl(result.pdfUrl)}
                activeOpacity={0.7}
              >
                <Ionicons name="document-outline" size={16} color="#6366F1" />
                <Text style={styles.actionText}>PDF</Text>
              </TouchableOpacity>
            )}

            {/* DOI Button */}
            {result.doi && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleOpenDoi}
                activeOpacity={0.7}
              >
                <Ionicons name="link-outline" size={16} color="#6366F1" />
                <Text style={styles.actionText}>DOI</Text>
              </TouchableOpacity>
            )}

            {/* Main Action Button */}
            {isSimplified ? (
              <TouchableOpacity
                style={[styles.actionButton, styles.primaryActionButton]}
                onPress={handleMainAction}
                activeOpacity={0.7}
              >
                <Ionicons name="book-outline" size={16} color="#FFFFFF" />
                <Text style={[styles.actionText, styles.primaryActionText]}>Read</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.actionButton, styles.primaryActionButton]}
                onPress={handleMainAction}
                activeOpacity={0.7}
              >
                <Ionicons name="sparkles-outline" size={16} color="#FFFFFF" />
                <Text style={[styles.actionText, styles.primaryActionText]}>Simplify</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

// Helper function: Convert citations to rating (0-5 scale)
function citationsToRating(citations: number): number {
  if (citations >= 1000) return 5.0;
  if (citations >= 500) return 4.5;
  if (citations >= 200) return 4.0;
  if (citations >= 100) return 3.5;
  if (citations >= 50) return 3.0;
  if (citations >= 20) return 2.5;
  if (citations >= 10) return 2.0;
  if (citations >= 5) return 1.5;
  if (citations >= 1) return 1.0;
  return 0.5;
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    borderRadius: Radius.md,
    overflow: 'hidden',
    marginBottom: Spacing.md,
  },
  externalCard: {
    borderWidth: 1,
    borderColor: '#E0E7FF',
  },
  image: {
    width: 100,
    height: '100%',
  },
  content: {
    flex: 1,
    padding: Spacing.sm,
    justifyContent: 'space-between',
  },
  badgesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.xs,
    flexWrap: 'wrap',
  },
  sourceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 3,
  },
  sourceBadgeText: {
    fontSize: 9,
    fontWeight: '600',
    color: '#6366F1',
  },
  simplifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 3,
  },
  simplifiedBadgeText: {
    fontSize: 9,
    fontWeight: '600',
    color: '#10B981',
  },
  title: {
    fontSize: Typography.fontSize.base,
    fontWeight: '600',
    marginBottom: Spacing.xs,
    lineHeight: 20,
  },
  highlight: {
    fontWeight: '700',
    borderRadius: 2,
  },
  author: {
    fontSize: Typography.fontSize.sm,
    marginBottom: Spacing.xs,
    fontStyle: 'italic',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
    flexWrap: 'wrap',
  },
  categoryBadge: {
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    borderRadius: Radius.sm,
    flex: 1,
    maxWidth: '70%',
  },
  categoryText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: '600',
  },
  year: {
    fontSize: Typography.fontSize.xs,
    fontWeight: '600',
  },
  excerpt: {
    fontSize: Typography.fontSize.sm,
    lineHeight: 18,
    marginBottom: Spacing.xs,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flexWrap: 'wrap',
    marginBottom: Spacing.xs,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  rating: {
    fontSize: Typography.fontSize.xs,
    fontWeight: '500',
  },
  citationsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  citationsText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: '500',
  },
  reads: {
    fontSize: Typography.fontSize.xs,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  primaryActionButton: {
    backgroundColor: '#6366F1',
  },
  actionText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6366F1',
  },
  primaryActionText: {
    color: '#FFFFFF',
  },
});

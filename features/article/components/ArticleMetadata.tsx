import { Colors, Radius, Spacing, Typography } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface ArticleMetadataProps {
  category: string;
  title: string;
  author: string;
  rating: number;
  reads?: string;
  readTime?: string;
}

export const ArticleMetadata: React.FC<ArticleMetadataProps> = ({
  category,
  title,
  author,
  rating,
  reads = '10k',
  readTime = '5 min read',
}) => {
  const colors = Colors.light;

  // Format author name - max 2 authors, add "et al." if more
  const formatAuthorName = (authorString: string): string => {
    const authors = authorString.split(',').map(a => a.trim());

    if (authors.length <= 2) {
      return authorString;
    }

    // More than 2 authors, show first 2 + "et al."
    return `${authors[0]}, ${authors[1]}, et al.`;
  };

  const displayAuthor = formatAuthorName(author);

  return (
    <>
      {/* Category Badge */}
      <View style={[styles.categoryBadge, { backgroundColor: colors.primary }]}>
        <Text style={[styles.categoryText, { color: colors.text }]}>{category}</Text>
      </View>

      {/* Title */}
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>

      {/* Metadata Row */}
      <View style={styles.metadataContainer}>
        <View style={styles.metadataLeft}>
          <Text style={[styles.authorName, { color: colors.text }]}>{displayAuthor}</Text>
          <View style={styles.metadataStats}>
            <View style={styles.statItem}>
              <Ionicons name="star" size={16} color={colors.warning} />
              <Text style={[styles.statText, { color: colors.textSecondary }]}>{rating}</Text>
            </View>
            <View style={styles.separator} />
            <View style={styles.statItem}>
              <Ionicons name="eye-outline" size={16} color={colors.textMuted} />
              <Text style={[styles.statText, { color: colors.textSecondary }]}>{reads}</Text>
            </View>
            <View style={styles.separator} />
            <View style={styles.statItem}>
              <Ionicons name="time-outline" size={16} color={colors.textMuted} />
              <Text style={[styles.statText, { color: colors.textSecondary }]}>{readTime}</Text>
            </View>
          </View>
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.lg,
    marginBottom: Spacing.md,
  },
  categoryText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '600',
  },
  title: {
    fontSize: Typography.fontSize['3xl'],
    fontWeight: '700',
    lineHeight: Typography.fontSize['3xl'] * 1.3,
    marginBottom: Spacing.md,
  },
  metadataContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  metadataLeft: {
    flex: 1,
  },
  authorName: {
    fontSize: Typography.fontSize.base,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  metadataStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '500',
  },
  separator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D1D5DB',
  },
});

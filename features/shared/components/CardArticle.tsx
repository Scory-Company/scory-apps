import { Colors, Radius, Shadows, Spacing, Typography } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, ImageSourcePropType, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface CardArticleProps {
  image: ImageSourcePropType;
  title: string;
  author: string;
  category: string;
  rating: number;
  reads: string;
  onPress: () => void;
}

export const CardArticle: React.FC<CardArticleProps> = ({
  image,
  title,
  author,
  category,
  rating,
  reads,
  onPress,
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
    <TouchableOpacity
      style={[styles.forYouCard, { backgroundColor: colors.surface }, Shadows.md]}
      onPress={onPress}
    >
      <Image source={image} style={styles.forYouImage} />
      <View style={styles.forYouContent}>
        <View style={[styles.categoryBadge, { backgroundColor: colors.surfaceSecondary }]}>
          <Text style={[styles.categoryBadgeText, { color: colors.textSecondary }]}>
            {category}
          </Text>
        </View>
        <Text style={[styles.forYouTitle, { color: colors.text }]} numberOfLines={2}>
          {title}
        </Text>
        <Text style={[styles.forYouAuthor, { color: colors.textMuted }]}>{displayAuthor}</Text>
        <View style={styles.forYouStats}>
          <View style={styles.statItem}>
            <Ionicons name="star" size={14} color={colors.warning} />
            <Text style={[styles.statText, { color: colors.textSecondary }]}>{rating}</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="eye" size={14} color={colors.textMuted} />
            <Text style={[styles.statText, { color: colors.textSecondary }]}>{reads}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  forYouCard: {
    width: 285,
    borderRadius: Radius.xl,
    overflow: 'hidden',
    height: 350,
  },
  forYouImage: {
    width: '100%',
    height: 170,
  },
  forYouContent: {
    padding: Spacing.md,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.sm,
    marginBottom: Spacing.sm,
  },
  categoryBadgeText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: '500',
  },
  forYouTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: '600',
    marginBottom: Spacing.xs,
    lineHeight: Typography.fontSize.base * 1.4,
  },
  forYouAuthor: {
    fontSize: Typography.fontSize.sm,
    marginBottom: Spacing.sm,
  },
  forYouStats: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: '500',
  },

});
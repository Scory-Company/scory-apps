import { Colors, Radius, Shadows, Spacing, Typography } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ImageSourcePropType } from 'react-native';

interface SearchResultCardProps {
  image: ImageSourcePropType;
  title: string;
  author: string;
  category: string;
  rating: number;
  reads?: string;
  highlightText?: string;
  onPress?: () => void;
}

export const SearchResultCard: React.FC<SearchResultCardProps> = ({
  image,
  title,
  author,
  category,
  rating,
  reads,
  highlightText,
  onPress,
}) => {
  const colors = Colors.light;

  // Highlight matching text in title
  const renderHighlightedTitle = () => {
    if (!highlightText || highlightText.trim() === '') {
      return <Text style={[styles.title, { color: colors.text }]}>{title}</Text>;
    }

    const parts = title.split(new RegExp(`(${highlightText})`, 'gi'));
    return (
      <Text style={[styles.title, { color: colors.text }]}>
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

  return (
    <TouchableOpacity
      style={[styles.card, Shadows.sm, { backgroundColor: colors.surface }]}
      activeOpacity={0.8}
      onPress={onPress}
    >
      <Image source={image} style={styles.image} resizeMode="cover" />
      <View style={styles.content}>
        {renderHighlightedTitle()}
        <Text style={[styles.author, { color: colors.textSecondary }]} numberOfLines={1}>
          {author}
        </Text>
        <View style={styles.meta}>
          <View style={[styles.categoryBadge, { backgroundColor: colors.primary + '15' }]}>
            <Text style={[styles.categoryText, { color: colors.third }]}>{category}</Text>
          </View>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={14} color={colors.warning} />
            <Text style={[styles.rating, { color: colors.textSecondary }]}>{rating}</Text>
          </View>
          {reads && (
            <Text style={[styles.reads, { color: colors.textMuted }]}>{reads}</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    borderRadius: Radius.md,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
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
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flexWrap: 'wrap',
  },
  categoryBadge: {
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    borderRadius: Radius.sm,
  },
  categoryText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: '600',
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
  reads: {
    fontSize: Typography.fontSize.xs,
  },
});

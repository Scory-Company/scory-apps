import { Colors, Radius, Shadows, Spacing, Typography } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface TopRatedCardProps {
  rank: number;
  title: string;
  author: string;
  category: string;
  rating: number;
  onPress: () => void;
}

export const TopRatedCard: React.FC<TopRatedCardProps> = ({
  rank,
  title,
  author,
  category,
  rating,
  onPress,
}) => {
  const colors = Colors.light;

  return (
    <TouchableOpacity
      style={[styles.topRatedCard, { backgroundColor: colors.surface }, Shadows.sm]}
      onPress={onPress}
    >
      <View style={[styles.rankBadge, { backgroundColor: colors.primary }]}>
        <Text style={[styles.rankText, { color: colors.primaryDark }]}>{rank}</Text>
      </View>
      <View style={styles.topRatedContent}>
        <Text style={[styles.topRatedTitle, { color: colors.text }]} numberOfLines={1}>
          {title}
        </Text>
        <View style={styles.topRatedMeta}>
          <Text style={[styles.topRatedAuthor, { color: colors.textMuted }]}>{author}</Text>
          <View style={[styles.categorySmallBadge, { backgroundColor: colors.surfaceSecondary }]}>
            <Text style={[styles.categorySmallText, { color: colors.textSecondary }]}>
              {category}
            </Text>
          </View>
        </View>
      </View>
      <View style={styles.topRatedRating}>
        <Ionicons name="star" size={16} color={colors.warning} />
        <Text style={[styles.ratingText, { color: colors.text }]}>{rating}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  topRatedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: Radius.lg,
    gap: Spacing.md,
  },
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankText: {
    fontSize: Typography.fontSize.base,
    fontWeight: '700',
  },
  topRatedContent: {
    flex: 1,
  },
  topRatedTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  topRatedMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  topRatedAuthor: {
    fontSize: Typography.fontSize.xs,
  },
  categorySmallBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.sm,
  },
  categorySmallText: {
    fontSize: 10,
    fontWeight: '500',
  },
  topRatedRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '600',
  },
});

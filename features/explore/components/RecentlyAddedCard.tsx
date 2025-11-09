import { Colors, Radius, Shadows, Spacing, Typography } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, ImageSourcePropType, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface RecentlyAddedCardProps {
  image: ImageSourcePropType;
  title: string;
  author: string;
  category: string;
  rating: number;
  date: string;
  onPress: () => void;
}

export const RecentlyAddedCard: React.FC<RecentlyAddedCardProps> = ({
  image,
  title,
  author,
  category,
  rating,
  date,
  onPress,
}) => {
  const colors = Colors.light;

  return (
    <TouchableOpacity
      style={[styles.recentCard, { backgroundColor: colors.surface }, Shadows.sm]}
      onPress={onPress}
    >
      <Image source={image} style={styles.recentImage} />
      <View style={styles.recentContent}>
        <Text style={[styles.recentTitle, { color: colors.text }]} numberOfLines={2}>
          {title}
        </Text>
        <Text style={[styles.recentAuthor, { color: colors.textMuted }]}>{author}</Text>
        <View style={styles.recentFooter}>
          <View style={[styles.categorySmallBadge, { backgroundColor: colors.surfaceSecondary }]}>
            <Text style={[styles.categorySmallText, { color: colors.textSecondary }]}>
              {category}
            </Text>
          </View>
          <Text style={[styles.recentDate, { color: colors.textMuted }]}>{date}</Text>
        </View>
      </View>
      <View style={styles.recentRating}>
        <Ionicons name="star" size={14} color={colors.warning} />
        <Text style={[styles.ratingText, { color: colors.text }]}>{rating}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  recentCard: {
    flexDirection: 'row',
    padding: Spacing.md,
    borderRadius: Radius.lg,
    gap: Spacing.md,
  },
  recentImage: {
    width: 80,
    height: 80,
    borderRadius: Radius.md,
  },
  recentContent: {
    flex: 1,
  },
  recentTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: '600',
    marginBottom: Spacing.xs,
    lineHeight: Typography.fontSize.base * 1.3,
  },
  recentAuthor: {
    fontSize: Typography.fontSize.xs,
    marginBottom: Spacing.sm,
  },
  recentFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  recentDate: {
    fontSize: Typography.fontSize.xs,
  },
  recentRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '600',
  },
});

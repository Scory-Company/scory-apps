import { Radius, Shadows, Spacing, Typography } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ImageBackground, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface TrendingTopicCardProps {
  keyword: string;
  count: string;
  onPress: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  backgroundColor?: string;
  backgroundImage?: any; // Image source from require()
}

export const TrendingTopicCard: React.FC<TrendingTopicCardProps> = ({
  keyword,
  count,
  onPress,
  icon = 'flash',
  backgroundColor = '#6366F1',
  backgroundImage,
}) => {
  const cardContent = (
    <View style={styles.cardContent}>
      {/* Icon at top */}
      <View style={styles.iconContainer}>
        <Ionicons name={icon} size={28} color="#FFFFFF" />
      </View>

      {/* Title text */}
      <Text style={styles.trendingKeyword} numberOfLines={2}>
        {keyword}
      </Text>

      {/* Bottom: Count */}
      <View style={styles.bottomRow}>
        <Text style={styles.trendingCount}>{count}</Text>
      </View>
    </View>
  );

  return (
    <TouchableOpacity
      style={styles.trendingCard}
      onPress={onPress}
      activeOpacity={0.85}
    >
      {backgroundImage ? (
        <ImageBackground
          source={backgroundImage}
          style={[styles.imageBackground, { backgroundColor }]}
          imageStyle={styles.imageStyle}
          resizeMode="cover"
        >
          {cardContent}
        </ImageBackground>
      ) : (
        <View style={[styles.solidBackground, { backgroundColor }]}>
          {cardContent}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  trendingCard: {
    borderRadius: 16,
    marginBottom: Spacing.sm,
    minHeight: 145,
    width: '48%',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  imageBackground: {
    flex: 1,
    minHeight: 145,
  },
  imageStyle: {
    borderRadius: 16,
  },
  solidBackground: {
    flex: 1,
    minHeight: 145,
    borderRadius: 16,
  },
  cardContent: {
    flex: 1,
    padding: Spacing.lg,
    justifyContent: 'space-between',
    minHeight: 145,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  trendingKeyword: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.3,
    lineHeight: 32,
  },
  trendingCount: {
    fontSize: Typography.fontSize.sm,
    color: 'rgba(255, 255, 255, 0.95)',
    fontWeight: '500',
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
});
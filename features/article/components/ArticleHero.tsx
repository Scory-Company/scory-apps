import { Colors, Radius, Spacing } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Image, ImageSourcePropType, StyleSheet, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ArticleHeroProps {
  image: ImageSourcePropType;
  onBookmark?: () => void;
  onShare?: () => void;
  isBookmarked?: boolean;
  isBookmarking?: boolean;
}

export const ArticleHero: React.FC<ArticleHeroProps> = ({
  image,
  onBookmark,
  onShare,
  isBookmarked = false,
  isBookmarking = false
}) => {
  const colors = Colors.light;

  return (
    <View style={styles.heroContainer}>
      <Image source={image} style={styles.heroImage} />

      {/* Gradient Overlay */}
      <View style={styles.gradientOverlay} />

      {/* Header with Back Button and Actions */}
      <SafeAreaView edges={['top']} style={styles.headerContainer}>
        <TouchableOpacity
          style={[styles.iconButton, { backgroundColor: 'rgba(0,0,0,0.5)' }]}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>

        {/* Action Buttons */}
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={[styles.iconButton, { backgroundColor: isBookmarked ? colors.primary : 'rgba(0,0,0,0.5)' }]}
            onPress={onBookmark}
            disabled={isBookmarking}
          >
            {isBookmarking ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Ionicons
                name={isBookmarked ? "bookmark" : "bookmark-outline"}
                size={22}
                color="#FFFFFF"
              />
            )}
          </TouchableOpacity>
          {/* <TouchableOpacity
            style={[styles.iconButton, { backgroundColor: 'rgba(0,0,0,0.5)' }]}
            onPress={onShare}
          >
            <Ionicons name="share-outline" size={22} color="#FFFFFF" />
          </TouchableOpacity> */}
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  heroContainer: {
    height: 360,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  headerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
  },
  headerActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

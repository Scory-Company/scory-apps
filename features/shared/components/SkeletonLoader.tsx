import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Colors, Spacing, Radius } from '@/constants/theme';

interface SkeletonLoaderProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
}

/**
 * Basic Skeleton component with shimmer effect
 */
export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  width = '100%',
  height = 20,
  borderRadius = Radius.sm,
  style,
}) => {
  const colors = Colors.light;
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [shimmerAnim]);

  const shimmerTranslate = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-300, 300],
  });

  return (
    <View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
          backgroundColor: colors.border,
        },
        style,
      ]}
    >
      <Animated.View
        style={[
          styles.shimmer,
          {
            transform: [{ translateX: shimmerTranslate }],
          },
        ]}
      />
    </View>
  );
};

interface SkeletonCardArticleProps {
  width?: number;
}

/**
 * Skeleton for article card (used in horizontal scroll)
 */
export const SkeletonCardArticle: React.FC<SkeletonCardArticleProps> = ({
  width = 280,
}) => {
  const colors = Colors.light;

  return (
    <View style={[styles.card, { width, backgroundColor: colors.surface }]}>
      {/* Image skeleton */}
      <SkeletonLoader width="100%" height={160} borderRadius={0} />

      {/* Content skeleton */}
      <View style={styles.cardContent}>
        {/* Category badge */}
        <SkeletonLoader width={80} height={20} />

        {/* Title lines */}
        <SkeletonLoader width="100%" height={16} />
        <SkeletonLoader width="70%" height={16} />

        {/* Footer */}
        <View style={styles.cardFooter}>
          <SkeletonLoader width={100} height={14} />
          <SkeletonLoader width={60} height={14} />
        </View>
      </View>
    </View>
  );
};

interface SkeletonListArticleProps {
  count?: number;
}

/**
 * Skeleton for vertical list of articles
 */
export const SkeletonListArticle: React.FC<SkeletonListArticleProps> = ({
  count = 3,
}) => {
  const colors = Colors.light;

  return (
    <View style={styles.listContainer}>
      {Array.from({ length: count }).map((_, index) => (
        <View
          key={index}
          style={[styles.listItem, { backgroundColor: colors.surface }]}
        >
          {/* Image skeleton */}
          <SkeletonLoader
            width="100%"
            height={180}
            borderRadius={Radius.xl}
            style={{ marginBottom: Spacing.md }}
          />

          {/* Content */}
          <View style={styles.listItemContent}>
            {/* Category badge */}
            <SkeletonLoader
              width={80}
              height={20}
              style={{ marginBottom: Spacing.sm }}
            />

            {/* Title */}
            <SkeletonLoader
              width="100%"
              height={18}
              style={{ marginBottom: Spacing.xs }}
            />
            <SkeletonLoader
              width="80%"
              height={18}
              style={{ marginBottom: Spacing.md }}
            />

            {/* Author */}
            <SkeletonLoader
              width={120}
              height={14}
              style={{ marginBottom: Spacing.md }}
            />

            {/* Footer */}
            <View style={styles.listItemFooter}>
              <SkeletonLoader width={60} height={14} />
              <SkeletonLoader width={80} height={14} />
            </View>
          </View>
        </View>
      ))}
    </View>
  );
};

interface SkeletonTextProps {
  lines?: number;
  lineHeight?: number;
  lastLineWidth?: string;
}

/**
 * Skeleton for text blocks (paragraphs)
 */
export const SkeletonText: React.FC<SkeletonTextProps> = ({
  lines = 3,
  lineHeight = 16,
  lastLineWidth = '60%',
}) => {
  return (
    <View style={styles.textBlock}>
      {Array.from({ length: lines }).map((_, index) => (
        <SkeletonLoader
          key={index}
          width={index === lines - 1 ? lastLineWidth : '100%'}
          height={lineHeight}
          style={{ marginBottom: Spacing.xs }}
        />
      ))}
    </View>
  );
};

interface SkeletonSearchResultProps {
  count?: number;
}

/**
 * Skeleton for search result cards (horizontal layout with image on left)
 * Used in FilteredContentView for search/filter results
 * Matches SearchResultCard component layout
 */
export const SkeletonSearchResult: React.FC<SkeletonSearchResultProps> = ({
  count = 3,
}) => {
  const colors = Colors.light;

  return (
    <View style={styles.searchResultContainer}>
      {Array.from({ length: count }).map((_, index) => (
        <View
          key={index}
          style={[styles.searchResultCard, { backgroundColor: colors.surface }]}
        >
          {/* Image skeleton - left side (100px width, full height) */}
          <SkeletonLoader
            width={100}
            height={120}
            borderRadius={0}
          />

          {/* Content - right side */}
          <View style={styles.searchResultContent}>
            {/* Title (2 lines) */}
            <SkeletonLoader
              width="100%"
              height={16}
              style={{ marginBottom: 4 }}
            />
            <SkeletonLoader
              width="85%"
              height={16}
              style={{ marginBottom: Spacing.xs }}
            />

            {/* Author */}
            <SkeletonLoader
              width={120}
              height={14}
              style={{ marginBottom: Spacing.xs }}
            />

            {/* Meta row (category, rating, reads in horizontal) */}
            <View style={styles.searchResultMeta}>
              <SkeletonLoader width={60} height={18} />
              <SkeletonLoader width={40} height={14} />
              <SkeletonLoader width={50} height={14} />
            </View>
          </View>
        </View>
      ))}
    </View>
  );
};

interface SkeletonCollectionCardProps {
  count?: number;
}

/**
 * Skeleton for Study Collection Cards
 * Used in Learn screen for collections loading state
 */
export const SkeletonCollectionCard: React.FC<SkeletonCollectionCardProps> = ({
  count = 2,
}) => {
  const colors = Colors.light;

  return (
    <View style={styles.collectionCardContainer}>
      {Array.from({ length: count }).map((_, index) => (
        <View
          key={index}
          style={[styles.collectionCard, { backgroundColor: colors.surface }]}
        >
          {/* Icon skeleton - left side (64x64) */}
          <SkeletonLoader
            width={64}
            height={64}
            borderRadius={Radius.md}
          />

          {/* Content - right side */}
          <View style={styles.collectionCardContent}>
            {/* Category */}
            <SkeletonLoader
              width={80}
              height={12}
              style={{ marginBottom: 4 }}
            />

            {/* Title (2 lines) */}
            <SkeletonLoader
              width="100%"
              height={16}
              style={{ marginBottom: 2 }}
            />
            <SkeletonLoader
              width="60%"
              height={16}
              style={{ marginBottom: Spacing.xs }}
            />

            {/* Articles count */}
            <SkeletonLoader
              width={80}
              height={14}
              style={{ marginBottom: Spacing.sm }}
            />

            {/* Progress bar or button */}
            <SkeletonLoader
              width="100%"
              height={8}
            />
          </View>
        </View>
      ))}
    </View>
  );
};

interface SkeletonWeeklyGoalCardProps {
  // Optional props for customization
}

/**
 * Skeleton for Weekly Goal Card
 * Used in Learn screen for weekly goal loading state
 */
export const SkeletonWeeklyGoalCard: React.FC<SkeletonWeeklyGoalCardProps> = () => {
  const colors = Colors.light;

  return (
    <View style={[styles.weeklyGoalCard, { backgroundColor: colors.surface }]}>
      {/* Title */}
      <SkeletonLoader
        width="70%"
        height={18}
        style={{ marginBottom: Spacing.xs }}
      />

      {/* Days left */}
      <SkeletonLoader
        width={80}
        height={14}
        style={{ marginBottom: Spacing.md }}
      />

      {/* Progress bar */}
      <SkeletonLoader
        width="100%"
        height={8}
        borderRadius={4}
        style={{ marginBottom: Spacing.md }}
      />

      {/* Motivation badge */}
      <View style={styles.weeklyGoalBadge}>
        <SkeletonLoader
          width={16}
          height={16}
          borderRadius={8}
        />
        <SkeletonLoader
          width="80%"
          height={14}
        />
      </View>

      {/* Button */}
      <SkeletonLoader
        width="100%"
        height={48}
        borderRadius={Radius.md}
        style={{ marginTop: Spacing.md }}
      />
    </View>
  );
};

interface SkeletonArticleDetailProps {
  // Optional props for customization
}

/**
 * Full skeleton loader for article detail page
 * Shows hero image, header, metadata, and content structure
 */
export const SkeletonArticleDetail: React.FC<SkeletonArticleDetailProps> = () => {
  const colors = Colors.light;

  return (
    <View style={styles.articleDetailContainer}>
      {/* Hero Image Skeleton */}
      <SkeletonLoader
        width="100%"
        height={300}
        borderRadius={0}
      />

      {/* Content Container */}
      <View style={styles.articleContent}>
        {/* Category Badge */}
        <SkeletonLoader
          width={100}
          height={24}
          style={{ marginBottom: Spacing.md }}
        />

        {/* Title Skeleton (2-3 lines) */}
        <SkeletonLoader
          width="100%"
          height={28}
          style={{ marginBottom: Spacing.xs }}
        />
        <SkeletonLoader
          width="90%"
          height={28}
          style={{ marginBottom: Spacing.md }}
        />

        {/* Metadata Row (Author, Rating, Views, Read Time) */}
        <View style={styles.metadataRow}>
          <SkeletonLoader width={80} height={16} />
          <SkeletonLoader width={60} height={16} />
          <SkeletonLoader width={70} height={16} />
          <SkeletonLoader width={80} height={16} />
        </View>

        {/* Divider */}
        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        {/* Content Paragraphs */}
        <View style={styles.contentParagraphs}>
          {/* Paragraph 1 */}
          <View style={styles.paragraph}>
            <SkeletonLoader width="100%" height={16} style={{ marginBottom: Spacing.xs }} />
            <SkeletonLoader width="100%" height={16} style={{ marginBottom: Spacing.xs }} />
            <SkeletonLoader width="100%" height={16} style={{ marginBottom: Spacing.xs }} />
            <SkeletonLoader width="80%" height={16} />
          </View>

          {/* Paragraph 2 */}
          <View style={styles.paragraph}>
            <SkeletonLoader width="100%" height={16} style={{ marginBottom: Spacing.xs }} />
            <SkeletonLoader width="100%" height={16} style={{ marginBottom: Spacing.xs }} />
            <SkeletonLoader width="90%" height={16} />
          </View>

          {/* Paragraph 3 */}
          <View style={styles.paragraph}>
            <SkeletonLoader width="100%" height={16} style={{ marginBottom: Spacing.xs }} />
            <SkeletonLoader width="100%" height={16} style={{ marginBottom: Spacing.xs }} />
            <SkeletonLoader width="100%" height={16} style={{ marginBottom: Spacing.xs }} />
            <SkeletonLoader width="85%" height={16} />
          </View>

          {/* Paragraph 4 */}
          <View style={styles.paragraph}>
            <SkeletonLoader width="100%" height={16} style={{ marginBottom: Spacing.xs }} />
            <SkeletonLoader width="100%" height={16} style={{ marginBottom: Spacing.xs }} />
            <SkeletonLoader width="75%" height={16} />
          </View>

          {/* Paragraph 5 */}
          <View style={styles.paragraph}>
            <SkeletonLoader width="100%" height={16} style={{ marginBottom: Spacing.xs }} />
            <SkeletonLoader width="100%" height={16} style={{ marginBottom: Spacing.xs }} />
            <SkeletonLoader width="100%" height={16} style={{ marginBottom: Spacing.xs }} />
            <SkeletonLoader width="95%" height={16} />
          </View>
        </View>

        {/* Comprehension Section Skeleton (Optional) */}
        <View style={styles.comprehensionSection}>
          <SkeletonLoader
            width={200}
            height={24}
            style={{ marginBottom: Spacing.md }}
          />
          <SkeletonLoader
            width="100%"
            height={120}
            style={{ marginBottom: Spacing.md }}
          />
          <SkeletonLoader
            width="100%"
            height={120}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  skeleton: {
    overflow: 'hidden',
  },
  shimmer: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  // Card Skeleton
  card: {
    borderRadius: Radius.xl,
    overflow: 'hidden',
  },
  cardContent: {
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  // List Skeleton
  listContainer: {
    gap: Spacing.lg,
  },
  listItem: {
    borderRadius: Radius.xl,
    overflow: 'hidden',
  },
  listItemContent: {
    padding: Spacing.lg,
  },
  listItemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  // Text Skeleton
  textBlock: {
    gap: Spacing.xs,
  },
  // Article Detail Skeleton
  articleDetailContainer: {
    flex: 1,
  },
  articleContent: {
    marginTop: -20,
    borderTopLeftRadius: Radius['2xl'],
    borderTopRightRadius: Radius['2xl'],
    backgroundColor: Colors.light.background,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
  },
  metadataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  divider: {
    height: 1,
    marginVertical: Spacing.lg,
  },
  contentParagraphs: {
    gap: Spacing.lg,
  },
  paragraph: {
    gap: Spacing.xs,
  },
  comprehensionSection: {
    marginTop: Spacing['2xl'],
  },
  // Search Result Skeleton (matches SearchResultCard layout)
  searchResultContainer: {
    gap: Spacing.sm,
  },
  searchResultCard: {
    flexDirection: 'row',
    borderRadius: Radius.md,
    overflow: 'hidden',
  },
  searchResultContent: {
    flex: 1,
    padding: Spacing.sm,
    justifyContent: 'space-between',
  },
  searchResultMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  // Collection Card Skeleton
  collectionCardContainer: {
    gap: Spacing.md,
  },
  collectionCard: {
    flexDirection: 'row',
    padding: Spacing.md,
    borderRadius: Radius.lg,
    gap: Spacing.md,
  },
  collectionCardContent: {
    flex: 1,
  },
  // Weekly Goal Card Skeleton
  weeklyGoalCard: {
    padding: Spacing.lg,
    borderRadius: Radius.lg,
  },
  weeklyGoalBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
});

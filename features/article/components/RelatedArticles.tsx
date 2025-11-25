import { Colors, Radius, Shadows, Spacing, Typography } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Image, ImageSourcePropType, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Article {
  id: number;
  image: ImageSourcePropType;
  title: string;
  author: string;
  rating: number;
  reads?: string;
}

interface RelatedArticlesProps {
  articles: Article[];
  category: string;
}

export const RelatedArticles: React.FC<RelatedArticlesProps> = ({ articles, category }) => {
  const colors = Colors.light;

  if (articles.length === 0) {
    return null;
  }

  return (
    <>
      <View style={[styles.divider, { backgroundColor: colors.border }]} />
      <View style={styles.relatedSection}>
        <Text style={[styles.relatedTitle, { color: colors.text }]}>
          Related Articles in {category}
        </Text>
        {articles.map((article) => (
          <TouchableOpacity
            key={article.id}
            style={[styles.relatedCard, { backgroundColor: colors.surface }, Shadows.sm]}
            onPress={() => router.push(`/article/${article.id}` as any)}
          >
            <Image source={article.image} style={styles.relatedImage} />
            <View style={styles.relatedContent}>
              <Text style={[styles.relatedCardTitle, { color: colors.text }]} numberOfLines={2}>
                {article.title}
              </Text>
              <Text style={[styles.relatedAuthor, { color: colors.textMuted }]}>
                {article.author}
              </Text>
              <View style={styles.relatedStats}>
                <View style={styles.statItem}>
                  <Ionicons name="star" size={12} color={colors.warning} />
                  <Text style={[styles.relatedStatText, { color: colors.textSecondary }]}>
                    {article.rating}
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <Ionicons name="eye-outline" size={12} color={colors.textMuted} />
                  <Text style={[styles.relatedStatText, { color: colors.textSecondary }]}>
                    {'reads' in article ? article.reads : '10k'}
                  </Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  divider: {
    height: 1,
    marginVertical: Spacing.lg,
  },
  relatedSection: {
    marginTop: Spacing.md,
  },
  relatedTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: '700',
    marginBottom: Spacing.md,
  },
  relatedCard: {
    flexDirection: 'row',
    borderRadius: Radius.lg,
    overflow: 'hidden',
    marginBottom: Spacing.md,
    padding: Spacing.sm,
  },
  relatedImage: {
    width: 100,
    height: 100,
    borderRadius: Radius.md,
  },
  relatedContent: {
    flex: 1,
    marginLeft: Spacing.md,
    justifyContent: 'center',
  },
  relatedCardTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: '600',
    marginBottom: Spacing.xs,
    lineHeight: Typography.fontSize.base * 1.3,
  },
  relatedAuthor: {
    fontSize: Typography.fontSize.sm,
    marginBottom: Spacing.xs,
  },
  relatedStats: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  relatedStatText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: '500',
  },
});

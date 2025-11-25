import { Colors, Spacing, Typography } from '@/constants/theme';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface ArticleContentProps {
  category: string;
}

export const ArticleContent: React.FC<ArticleContentProps> = ({ category }) => {
  const colors = Colors.light;

  return (
    <View style={styles.articleContent}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Abstract</Text>
      <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
        This comprehensive research explores the cutting-edge developments and implications in the field
        of {category.toLowerCase()}. Our study examines multiple perspectives and presents evidence-based
        insights that contribute to the broader understanding of this critical topic.
      </Text>

      <Text style={[styles.sectionTitle, { color: colors.text }]}>Introduction</Text>
      <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
        In recent years, there has been growing interest in understanding the complex dynamics of{' '}
        {category.toLowerCase()} and its impact on modern society. This article delves into the
        fundamental concepts and explores practical applications that can drive positive change.
      </Text>

      <Text style={[styles.sectionTitle, { color: colors.text }]}>Key Findings</Text>
      <View style={styles.keyPointsContainer}>
        <View style={styles.keyPointItem}>
          <View style={[styles.keyPointBullet, { backgroundColor: colors.primary }]} />
          <Text style={[styles.keyPointText, { color: colors.textSecondary }]}>
            Significant advancements in research methodologies have enabled deeper insights
          </Text>
        </View>
        <View style={styles.keyPointItem}>
          <View style={[styles.keyPointBullet, { backgroundColor: colors.primary }]} />
          <Text style={[styles.keyPointText, { color: colors.textSecondary }]}>
            Cross-disciplinary collaboration has proven essential for breakthrough discoveries
          </Text>
        </View>
        <View style={styles.keyPointItem}>
          <View style={[styles.keyPointBullet, { backgroundColor: colors.primary }]} />
          <Text style={[styles.keyPointText, { color: colors.textSecondary }]}>
            Real-world applications demonstrate promising results across diverse contexts
          </Text>
        </View>
      </View>

      <Text style={[styles.sectionTitle, { color: colors.text }]}>Methodology</Text>
      <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
        Our research employs a rigorous mixed-methods approach, combining quantitative data analysis
        with qualitative interviews. This comprehensive methodology ensures robust findings that are
        both statistically significant and contextually meaningful.
      </Text>

      <Text style={[styles.sectionTitle, { color: colors.text }]}>Conclusion</Text>
      <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
        The findings presented in this study contribute valuable insights to the field of{' '}
        {category.toLowerCase()}. Future research should continue to explore these emerging trends and
        their long-term implications for society.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  articleContent: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: '700',
    marginBottom: Spacing.md,
    marginTop: Spacing.md,
  },
  paragraph: {
    fontSize: Typography.fontSize.base,
    lineHeight: Typography.fontSize.base * 1.7,
    marginBottom: Spacing.md,
  },
  keyPointsContainer: {
    marginBottom: Spacing.md,
  },
  keyPointItem: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
    paddingRight: Spacing.md,
  },
  keyPointBullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 8,
    marginRight: Spacing.md,
  },
  keyPointText: {
    flex: 1,
    fontSize: Typography.fontSize.base,
    lineHeight: Typography.fontSize.base * 1.6,
  },
});

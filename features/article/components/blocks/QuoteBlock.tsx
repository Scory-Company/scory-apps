import { Colors, Radius, Spacing, Typography } from '@/constants/theme';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface QuoteBlockProps {
  text: string;
  author?: string;
}

export const QuoteBlock: React.FC<QuoteBlockProps> = ({ text, author }) => {
  const colors = Colors.light;

  return (
    <View style={[styles.quoteContainer, { borderLeftColor: colors.primary }]}>
      <Text style={[styles.quoteText, { color: colors.text }]}>
        &quot;{text}&quot;
      </Text>
      {author && (
        <Text style={[styles.quoteAuthor, { color: colors.textMuted }]}>
          — {author}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  quoteContainer: {
    borderLeftWidth: 4,
    paddingLeft: Spacing.lg,
    paddingVertical: Spacing.sm,
    marginVertical: Spacing.md,
  },
  quoteText: {
    fontSize: Typography.fontSize.lg,
    fontStyle: 'italic',
    lineHeight: Typography.fontSize.lg * 1.5,
  },
  quoteAuthor: {
    fontSize: Typography.fontSize.sm,
    marginTop: Spacing.sm,
    fontWeight: '600',
  },
});

import { Colors, Spacing, Typography } from '@/constants/theme';
import React from 'react';
import { StyleSheet, Text } from 'react-native';

interface TextBlockProps {
  text: string;
}

export const TextBlock: React.FC<TextBlockProps> = ({ text }) => {
  const colors = Colors.light;

  return (
    <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
      {text}
    </Text>
  );
};

const styles = StyleSheet.create({
  paragraph: {
    fontSize: Typography.fontSize.base,
    lineHeight: Typography.fontSize.base * 1.7,
    marginBottom: Spacing.md,
  },
});

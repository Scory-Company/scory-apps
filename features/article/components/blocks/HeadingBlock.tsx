import { Colors, Spacing, Typography } from '@/constants/theme';
import React from 'react';
import { StyleSheet, Text } from 'react-native';

interface HeadingBlockProps {
  text: string;
  level: 1 | 2 | 3 | 4 | 5 | 6;
}

export const HeadingBlock: React.FC<HeadingBlockProps> = ({ text, level }) => {
  const colors = Colors.light;

  // Map heading levels to font sizes
  const getFontSize = () => {
    switch (level) {
      case 1:
        return Typography.fontSize['3xl'];
      case 2:
        return Typography.fontSize['2xl'];
      case 3:
        return Typography.fontSize.xl;
      case 4:
        return Typography.fontSize.lg;
      case 5:
        return Typography.fontSize.base;
      case 6:
        return Typography.fontSize.sm;
      default:
        return Typography.fontSize.xl;
    }
  };

  return (
    <Text
      style={[
        styles.heading,
        {
          color: colors.text,
          fontSize: getFontSize(),
        }
      ]}
    >
      {text}
    </Text>
  );
};

const styles = StyleSheet.create({
  heading: {
    fontWeight: '700',
    marginBottom: Spacing.md,
    marginTop: Spacing.md,
  },
});

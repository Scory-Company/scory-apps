import { Colors, Typography as TypographyTokens } from '@/constants/theme';
import React from 'react';
import { StyleSheet, Text, TextProps } from 'react-native';

type FontSize = 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
type FontWeight = 'regular' | 'medium' | 'semiBold' | 'bold';

interface BaseTextProps extends TextProps {
  children: React.ReactNode;
  color?: string;
  align?: 'left' | 'center' | 'right';
  size?: FontSize;
  weight?: FontWeight;
}

const getFontFamily = (weight?: FontWeight, defaultWeight: FontWeight = 'bold') => {
  const w = weight || defaultWeight;
  return TypographyTokens.fontFamily[w];
};

const getFontSize = (size?: FontSize, defaultSize: FontSize = 'base') => {
  const s = size || defaultSize;
  return TypographyTokens.fontSize[s];
};

export function Heading({ children, style, color, align = 'left', size, weight, ...props }: BaseTextProps) {
  const colors = Colors.light;
  const fontSize = getFontSize(size, '3xl');
  const fontFamily = getFontFamily(weight, 'bold');

  return (
    <Text
      style={[
        styles.heading,
        {
          color: color || colors.text,
          textAlign: align,
          fontSize,
          fontFamily,
          lineHeight: fontSize * TypographyTokens.lineHeight.tight,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  );
}

export function Title({ children, style, color, align = 'left', size, weight, ...props }: BaseTextProps) {
  const colors = Colors.light;
  const fontSize = getFontSize(size, '2xl');
  const fontFamily = getFontFamily(weight, 'semiBold');

  return (
    <Text
      style={[
        styles.title,
        {
          color: color || colors.text,
          textAlign: align,
          fontSize,
          fontFamily,
          lineHeight: fontSize * TypographyTokens.lineHeight.normal,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  );
}

export function Body({ children, style, color, align = 'left', size, weight, ...props }: BaseTextProps) {
  const colors = Colors.light;
  const fontSize = getFontSize(size, 'base');
  const fontFamily = getFontFamily(weight, 'regular');

  return (
    <Text
      style={[
        styles.body,
        {
          color: color || colors.textSecondary,
          textAlign: align,
          fontSize,
          fontFamily,
          lineHeight: fontSize * TypographyTokens.lineHeight.relaxed,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  );
}

export function Caption({ children, style, color, align = 'left', size, weight, ...props }: BaseTextProps) {
  const colors = Colors.light;
  const fontSize = getFontSize(size, 'sm');
  const fontFamily = getFontFamily(weight, 'regular');

  return (
    <Text
      style={[
        styles.caption,
        {
          color: color || colors.textMuted,
          textAlign: align,
          fontSize,
          fontFamily,
          lineHeight: fontSize * TypographyTokens.lineHeight.normal,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  heading: {
    fontSize: TypographyTokens.fontSize['3xl'],
    fontFamily: TypographyTokens.fontFamily.bold,
    lineHeight: TypographyTokens.fontSize['3xl'] * TypographyTokens.lineHeight.tight,
  },
  title: {
    fontSize: TypographyTokens.fontSize['2xl'],
    fontFamily: TypographyTokens.fontFamily.semiBold,
    lineHeight: TypographyTokens.fontSize['2xl'] * TypographyTokens.lineHeight.normal,
  },
  body: {
    fontSize: TypographyTokens.fontSize.base,
    fontFamily: TypographyTokens.fontFamily.regular,
    lineHeight: TypographyTokens.fontSize.base * TypographyTokens.lineHeight.relaxed,
  },
  caption: {
    fontSize: TypographyTokens.fontSize.sm,
    fontFamily: TypographyTokens.fontFamily.regular,
    lineHeight: TypographyTokens.fontSize.sm * TypographyTokens.lineHeight.normal,
  },
});

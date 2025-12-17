import { Colors, Spacing, Typography } from '@/constants/theme';
import React from 'react';
import { Platform, StyleSheet, Text } from 'react-native';

interface TextBlockProps {
  text: string;
}

const parseFormattedText = (text: string, colors: typeof Colors.light) => {
  // Regex explanation:
  // 1. (**...**) for bold
  // 2. (*...*) or (_..._) for italic
  // 3. (`...`) or ('...') for code/highlight
  const regex = /(\*\*.*?\*\*|\*.*?\*|`.*?`|'.*?')/g;
  
  const parts = text.split(regex);

  return parts.map((part, index) => {
    // Bold: **text**
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <Text key={index} style={[styles.bold, { color: colors.text }]}>
          {part.slice(2, -2)}
        </Text>
      );
    }
    // Italic: *text* (only checks * for now to avoid confusion with bullets)
    if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
      return (
        <Text key={index} style={[styles.italic, { color: colors.text }]}>
          {part.slice(1, -1)}
        </Text>
      );
    }
    // Code/Highlight: `text` or 'text' (as seen in your image)
    if ((part.startsWith('`') && part.endsWith('`')) || (part.startsWith("'") && part.endsWith("'"))) {
      // Clean quotes/backticks
      const cleanText = part.slice(1, -1);
      // Skip styling if it's just a single quote or empty
      if (cleanText.length === 0) return <Text key={index}>{part}</Text>;

      return (
        <Text key={index} style={[styles.code, { color: colors.text, backgroundColor: colors.primary + '50' }]}>
          {cleanText}
        </Text>
      );
    }
    
    // Normal text
    return <Text key={index}>{part}</Text>;
  });
};

export const TextBlock: React.FC<TextBlockProps> = ({ text }) => {
  const colors = Colors.light;

  return (
    <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
      {parseFormattedText(text, colors)}
    </Text>
  );
};

const styles = StyleSheet.create({
  paragraph: {
    fontSize: Typography.fontSize.base,
    lineHeight: Typography.fontSize.base * 1.7,
    marginBottom: Spacing.md,
  },
  bold: {
    fontWeight: '700',
  },
  italic: {
    fontStyle: 'italic',
  },
  code: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: Typography.fontSize.sm,
    fontWeight: '500',
  },
});

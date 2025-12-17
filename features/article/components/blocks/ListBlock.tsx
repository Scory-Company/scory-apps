import { Colors, Spacing, Typography } from '@/constants/theme';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface ListBlockProps {
  style: 'bullet' | 'numbered';
  items: string[];
}

const parseTextWithBold = (text: string, colors: typeof Colors.light) => {
  // Split by bold markers (**text**)
  const parts = text.split(/(\*\*.*?\*\*)/g);

  return (
    <Text style={[styles.listText, { color: colors.textSecondary }]}>
      {parts.map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          // Render bold content
          const content = part.slice(2, -2);
          return (
            <Text key={index} style={[styles.boldText, { color: colors.text }]}>
              {content}
            </Text>
          );
        }
        // Render normal content
        return <Text key={index}>{part}</Text>;
      })}
    </Text>
  );
};

export const ListBlock: React.FC<ListBlockProps> = ({ style, items }) => {
  const colors = Colors.light;

  return (
    <View style={styles.listContainer}>
      {items.map((item, index) => (
        <View key={index} style={styles.listItem}>
          {style === 'bullet' ? (
            <View style={[styles.bullet, { backgroundColor: colors.text }]} />
          ) : (
            <Text style={[styles.number, { color: colors.text }]}>
              {index + 1}.
            </Text>
          )}
          <View style={styles.textWrapper}>
            {parseTextWithBold(item, colors)}
          </View>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  listContainer: {
    marginBottom: Spacing.md,
  },
  listItem: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
    paddingRight: Spacing.md,
  },
  textWrapper: {
    flex: 1,
  },
  bullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 8,
    marginRight: Spacing.md,
  },
  number: {
    fontSize: Typography.fontSize.base,
    fontWeight: '600',
    marginRight: Spacing.sm,
    minWidth: 24,
  },
  listText: {
    fontSize: Typography.fontSize.base,
    lineHeight: Typography.fontSize.base * 1.6,
  },
  boldText: {
    fontWeight: '700',
  },
});

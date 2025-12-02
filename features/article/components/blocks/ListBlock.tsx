import { Colors, Spacing, Typography } from '@/constants/theme';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface ListBlockProps {
  style: 'bullet' | 'numbered';
  items: string[];
}

export const ListBlock: React.FC<ListBlockProps> = ({ style, items }) => {
  const colors = Colors.light;

  return (
    <View style={styles.listContainer}>
      {items.map((item, index) => (
        <View key={index} style={styles.listItem}>
          {style === 'bullet' ? (
            <View style={[styles.bullet, { backgroundColor: colors.primary }]} />
          ) : (
            <Text style={[styles.number, { color: colors.primary }]}>
              {index + 1}.
            </Text>
          )}
          <Text style={[styles.listText, { color: colors.textSecondary }]}>
            {item}
          </Text>
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
    flex: 1,
    fontSize: Typography.fontSize.base,
    lineHeight: Typography.fontSize.base * 1.6,
  },
});

import { Colors, Radius, Shadows, Spacing, Typography } from '@/constants/theme';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';

interface CategoryFilterChipsProps {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

export const CategoryFilterChips: React.FC<CategoryFilterChipsProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
}) => {
  const colors = Colors.light;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.categoryScrollContent}
      style={styles.categoryScroll}
    >
      {categories.map((category) => (
        <TouchableOpacity
          key={category}
          style={[
            styles.categoryChip,
            {
              backgroundColor: selectedCategory === category ? colors.primary : colors.surface,
              borderColor: selectedCategory === category ? colors.primary : colors.border,
            },
            Shadows.sm,
          ]}
          onPress={() => onSelectCategory(category)}
        >
          <Text
            style={[
              styles.categoryChipText,
              {
                color: selectedCategory === category ? colors.primaryDark : colors.textSecondary,
                fontWeight: selectedCategory === category ? '600' : '400',
              },
            ]}
          >
            {category}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  categoryScroll: {
    marginBottom: Spacing.lg,
  },
  categoryScrollContent: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
  },
  categoryChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  categoryChipText: {
    fontSize: Typography.fontSize.sm,
  },
});

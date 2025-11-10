import { Colors, Spacing, Typography } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface ViewAllEndCardProps {
  count: number;
  label?: string; // e.g., 'article', 'book', 'item'
  onPress?: () => void;
}

export const ViewAllEndCard: React.FC<ViewAllEndCardProps> = ({
  count,
  label = 'item',
  onPress
}) => {
  const colors = Colors.light;

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}
      activeOpacity={0.7}
      onPress={onPress}
    >
      <View style={styles.content}>
        <Ionicons name="arrow-forward-circle" size={48} color={colors.primary} />

        <Text style={[styles.title, { color: colors.text }]}>
          View All
        </Text>

        <Text style={[styles.count, { color: colors.textMuted }]}>
          {count} {label}{count > 1 ? 's' : ''}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 100,
    height: 310, // Same total height as CardArticle (140 image + ~100 content)
    borderRadius: 16,
    marginRight: Spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  content: {
    alignItems: 'center',
    gap: Spacing.sm,
  },
  title: {
    fontSize: Typography.fontSize.base,
    fontWeight: '600',
  },
  count: {
    fontSize: Typography.fontSize.xs,
    fontWeight: '400',
  },
});

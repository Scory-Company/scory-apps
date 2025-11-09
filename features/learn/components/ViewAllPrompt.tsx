import { Colors, Spacing, Typography } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface ViewAllPromptProps {
  count: number;
  onPress?: () => void;
}

export const ViewAllPrompt: React.FC<ViewAllPromptProps> = ({ count, onPress }) => {
  const colors = Colors.light;

  return (
    <TouchableOpacity
      style={styles.container}
      activeOpacity={0.7}
      onPress={onPress}
    >
      <View style={styles.content}>
        <Ionicons name="arrow-forward-circle-outline" size={20} color={colors.textMuted} />
        <Text style={[styles.text, { color: colors.textSecondary }]}>
          View all to see {count} more insight{count > 1 ? 's' : ''}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.md,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
  },
  text: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '500',
  },
});

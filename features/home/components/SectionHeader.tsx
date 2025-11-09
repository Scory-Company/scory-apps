import { Colors, Spacing, Typography } from '@/constants/theme';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface SectionHeaderProps {
  title: string;
  actionText?: string;
  onActionPress?: () => void;
}

export function SectionHeader({ title, actionText, onActionPress }: SectionHeaderProps) {
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {actionText && onActionPress && (
        <TouchableOpacity onPress={onActionPress}>
          <Text style={styles.actionText}>{actionText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: Typography.fontSize.xl,
    fontWeight: '700',
    color: Colors.light.text,
  },
  actionText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '600',
    color: Colors.light.textSecondary,
  },
});

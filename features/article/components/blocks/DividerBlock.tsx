import { Colors, Spacing } from '@/constants/theme';
import React from 'react';
import { StyleSheet, View } from 'react-native';

export const DividerBlock: React.FC = () => {
  const colors = Colors.light;

  return <View style={[styles.divider, { backgroundColor: colors.border }]} />;
};

const styles = StyleSheet.create({
  divider: {
    height: 1,
    marginVertical: Spacing.lg,
  },
});

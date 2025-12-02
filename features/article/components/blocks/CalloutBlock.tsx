import { Colors, Radius, Spacing, Typography } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface CalloutBlockProps {
  text: string;
  variant: 'info' | 'warning' | 'success' | 'error';
}

export const CalloutBlock: React.FC<CalloutBlockProps> = ({ text, variant }) => {
  const colors = Colors.light;

  // Get color and icon based on variant
  const getVariantStyle = () => {
    switch (variant) {
      case 'info':
        return {
          backgroundColor: colors.primaryLight,
          iconColor: colors.primary,
          icon: 'information-circle' as const,
        };
      case 'warning':
        return {
          backgroundColor: '#FFF3CD',
          iconColor: '#856404',
          icon: 'warning' as const,
        };
      case 'success':
        return {
          backgroundColor: '#D4EDDA',
          iconColor: '#155724',
          icon: 'checkmark-circle' as const,
        };
      case 'error':
        return {
          backgroundColor: '#F8D7DA',
          iconColor: '#721C24',
          icon: 'close-circle' as const,
        };
      default:
        return {
          backgroundColor: colors.primaryLight,
          iconColor: colors.primary,
          icon: 'information-circle' as const,
        };
    }
  };

  const variantStyle = getVariantStyle();

  return (
    <View
      style={[
        styles.calloutContainer,
        { backgroundColor: variantStyle.backgroundColor }
      ]}
    >
      <Ionicons
        name={variantStyle.icon}
        size={24}
        color={variantStyle.iconColor}
        style={styles.icon}
      />
      <Text style={[styles.calloutText, { color: colors.text }]}>
        {text}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  calloutContainer: {
    flexDirection: 'row',
    padding: Spacing.md,
    borderRadius: Radius.lg,
    marginVertical: Spacing.md,
    alignItems: 'flex-start',
  },
  icon: {
    marginRight: Spacing.sm,
    marginTop: 2,
  },
  calloutText: {
    flex: 1,
    fontSize: Typography.fontSize.base,
    lineHeight: Typography.fontSize.base * 1.5,
  },
});

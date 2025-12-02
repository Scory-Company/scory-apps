import { Colors, Radius, Spacing, Typography } from '@/constants/theme';
import React from 'react';
import { StyleSheet, Text, View, Image } from 'react-native';

interface InfographicBlockProps {
  url: string;
  caption?: string;
  alt?: string;
}

export const InfographicBlock: React.FC<InfographicBlockProps> = ({ url, caption, alt }) => {
  const colors = Colors.light;

  return (
    <View style={styles.infographicContainer}>
      <Image
        source={{ uri: url }}
        style={styles.infographic}
        resizeMode="contain"
        accessibilityLabel={alt}
      />
      {caption && (
        <Text style={[styles.caption, { color: colors.textMuted }]}>
          {caption}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  infographicContainer: {
    marginVertical: Spacing.lg,
    alignItems: 'center',
  },
  infographic: {
    width: '100%',
    height: 300,
    borderRadius: Radius.lg,
  },
  caption: {
    fontSize: Typography.fontSize.sm,
    fontStyle: 'italic',
    marginTop: Spacing.sm,
    textAlign: 'center',
    paddingHorizontal: Spacing.md,
  },
});

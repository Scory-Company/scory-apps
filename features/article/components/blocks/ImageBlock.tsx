import { Colors, Radius, Spacing, Typography } from '@/constants/theme';
import React from 'react';
import { StyleSheet, Text, View, Image } from 'react-native';

interface ImageBlockProps {
  url: string;
  caption?: string;
  alt?: string;
}

export const ImageBlock: React.FC<ImageBlockProps> = ({ url, caption, alt }) => {
  const colors = Colors.light;

  return (
    <View style={styles.imageContainer}>
      <Image
        source={{ uri: url }}
        style={styles.image}
        resizeMode="cover"
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
  imageContainer: {
    marginVertical: Spacing.lg,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: Radius.lg,
  },
  caption: {
    fontSize: Typography.fontSize.sm,
    fontStyle: 'italic',
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
});

import { Colors, Spacing } from '@/constants/theme';
import { Image, ImageSource } from 'expo-image';
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface CategoryCardProps {
  icon?: ImageSource;
  emoji?: string;
  label: string;
  backgroundColor?: string;
  onPress?: () => void;
}

export function CategoryCard({ icon, emoji, label, backgroundColor, onPress }: CategoryCardProps) {
  const colors = Colors.light;

  return (
    <TouchableOpacity style={styles.categoryItem} onPress={onPress} activeOpacity={0.7}>
      {icon ? (
        <View style={styles.categoryIconImage}>
          <Image source={icon} style={styles.categoryImage} contentFit="contain" />
        </View>
      ) : (
        <View style={[styles.categoryIcon, { backgroundColor: backgroundColor || colors.primary + '20' }]}>
          <Text style={styles.categoryEmoji}>{emoji || '📁'}</Text>
        </View>
      )}
      <Text style={[styles.categoryLabel, { color: colors.text }]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  categoryItem: {
    width: '22%',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  categoryIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  categoryIconImage: {
    width: 64,
    height: 64,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  categoryEmoji: {
    fontSize: 28,
  },
  categoryImage: {
    width: 64,
    height: 64,
  },
  categoryLabel: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
});

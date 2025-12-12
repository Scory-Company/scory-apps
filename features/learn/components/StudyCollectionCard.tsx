import { Colors, Radius, Shadows, Spacing, Typography } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ProgressBar } from './ProgressBar';

interface StudyCollectionCardProps {
  title: string;
  category: string;
  articlesCount: number;
  progress: number;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  onPress?: () => void;
}

export const StudyCollectionCard: React.FC<StudyCollectionCardProps> = ({
  title,
  category,
  articlesCount,
  progress,
  icon,
  color,
  onPress,
}) => {
  const colors = Colors.light;

  // Calculate read articles count from progress percentage
  const readCount = Math.round((progress / 100) * articlesCount);

  return (
    <TouchableOpacity
      style={[styles.collectionCard, Shadows.md, { backgroundColor: colors.surface }]}
      activeOpacity={0.8}
      onPress={onPress}
    >
      <View style={[styles.collectionIconContainer, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={28} color={color} />
      </View>

      <View style={styles.collectionContent}>
        <Text style={[styles.collectionCategory, { color: colors.textSecondary }]}>
          {category}
        </Text>
        <Text style={[styles.collectionTitle, { color: colors.text }]} numberOfLines={2}>
          {title}
        </Text>
        <Text style={[styles.collectionArticles, { color: colors.textSecondary }]}>
          {articlesCount} articles
        </Text>

        {progress > 0 ? (
          <View style={styles.collectionProgress}>
            <ProgressBar current={readCount} total={articlesCount} />
          </View>
        ) : (
          <View style={[styles.startButton, { borderColor: color }]}>
            <Text style={[styles.startButtonText, { color: color }]}>Start Learning</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  collectionCard: {
    flexDirection: 'row',
    padding: Spacing.md,
    borderRadius: Radius.lg,
    gap: Spacing.md,
  },
  collectionIconContainer: {
    width: 64,
    height: 64,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  collectionContent: {
    flex: 1,
  },
  collectionCategory: {
    fontSize: Typography.fontSize.xs,
    fontWeight: '500',
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  collectionTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  collectionArticles: {
    fontSize: Typography.fontSize.sm,
    marginBottom: Spacing.sm,
  },
  collectionProgress: {
    marginTop: Spacing.xs,
  },
  startButton: {
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    alignSelf: 'flex-start',
    marginTop: Spacing.xs,
  },
  startButtonText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '600',
  },
});
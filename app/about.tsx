import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { Logo } from '@/shared/components/ui/Logo';
import { useTranslation } from 'react-i18next';

interface FeatureItem {
  id: number;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
}

export default function AboutScreen() {
  const colors = Colors.light;
  const { t } = useTranslation();

  const features: FeatureItem[] = [
    {
      id: 1,
      icon: 'sparkles',
      title: t('about.features.aiSimplification.title'),
      description: t('about.features.aiSimplification.description'),
    },
    {
      id: 2,
      icon: 'bulb',
      title: t('about.features.smartInsights.title'),
      description: t('about.features.smartInsights.description'),
    },
    {
      id: 3,
      icon: 'person',
      title: t('about.features.personalized.title'),
      description: t('about.features.personalized.description'),
    },
    {
      id: 4,
      icon: 'flame',
      title: t('about.features.trackProgress.title'),
      description: t('about.features.trackProgress.description'),
    },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: t('about.title'),
          headerBackTitle: t('common.back'),
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTintColor: colors.text,
        }}
      />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Logo & Header */}
        <View style={styles.header}>
          <Logo width={200} height={80} color={colors.text} />
          <Text style={[styles.tagline, { color: colors.textMuted }]}>
            {t('about.tagline')}
          </Text>
        </View>

        {/* About Section */}
        <View style={[styles.aboutCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.aboutTitle, { color: colors.text }]}>
            {t('about.whatIsScory.title')}
          </Text>
          <Text style={[styles.aboutText, { color: colors.textMuted }]}>
            {t('about.whatIsScory.paragraph1')}
          </Text>
          <Text style={[styles.aboutText, { color: colors.textMuted }]}>
            {t('about.whatIsScory.paragraph2')}
          </Text>
        </View>

        {/* Features Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('about.keyFeatures')}</Text>
          <View style={styles.featuresContainer}>
            {features.map((feature) => (
              <View key={feature.id} style={[styles.featureCard, { backgroundColor: colors.surface }]}>
                <View style={[styles.featureIconContainer, { backgroundColor: colors.primary + '15' }]}>
                  <Ionicons name={feature.icon} size={24} color={colors.primary} />
                </View>
                <View style={styles.featureContent}>
                  <Text style={[styles.featureTitle, { color: colors.text }]}>
                    {feature.title}
                  </Text>
                  <Text style={[styles.featureDescription, { color: colors.textMuted }]}>
                    {feature.description}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Mission Section */}
        <View style={[styles.missionCard, { backgroundColor: colors.primary + '15' }]}>
          <Ionicons name="rocket" size={48} color={colors.primary} />
          <Text style={[styles.missionTitle, { color: colors.text }]}>
            {t('about.mission.title')}
          </Text>
          <Text style={[styles.missionText, { color: colors.textMuted }]}>
            {t('about.mission.text')}
          </Text>
        </View>

        {/* Version Info */}
        <View style={styles.versionContainer}>
          <Text style={[styles.versionText, { color: colors.textMuted }]}>
            {t('about.version')}
          </Text>
          <Text style={[styles.copyrightText, { color: colors.textMuted }]}>
            {t('about.copyright')}
          </Text>
        </View>

        {/* Bottom Padding */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing.xl,
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xl,
    gap: Spacing.md,
  },
  tagline: {
    fontSize: Typography.fontSize.base,
    textAlign: 'center',
  },
  aboutCard: {
    marginHorizontal: Spacing.lg,
    padding: Spacing.lg,
    borderRadius: 12,
    marginBottom: Spacing.xl,
  },
  aboutTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: '700',
    marginBottom: Spacing.md,
  },
  aboutText: {
    fontSize: Typography.fontSize.base,
    lineHeight: 24,
    marginBottom: Spacing.md,
  },
  section: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: '700',
    marginBottom: Spacing.md,
  },
  featuresContainer: {
    gap: Spacing.md,
  },
  featureCard: {
    padding: Spacing.lg,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  featureIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
    flexShrink: 0,
  },
  featureContent: {
    flex: 1,
    minWidth: 0,
  },
  featureTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: '600',
    marginBottom: Spacing.xs,
    flexWrap: 'wrap',
  },
  featureDescription: {
    fontSize: Typography.fontSize.sm,
    lineHeight: 20,
    flexWrap: 'wrap',
  },
  missionCard: {
    marginHorizontal: Spacing.lg,
    padding: Spacing.xl,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  missionTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: '700',
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  missionText: {
    fontSize: Typography.fontSize.base,
    lineHeight: 24,
    textAlign: 'center',
  },
  versionContainer: {
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  versionText: {
    fontSize: Typography.fontSize.sm,
    marginBottom: Spacing.xs,
  },
  copyrightText: {
    fontSize: Typography.fontSize.sm,
  },
});

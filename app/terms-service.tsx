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
import { useTranslation } from 'react-i18next';

interface TermSection {
  id: number;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  content: string;
}

export default function TermsServiceScreen() {
  const colors = Colors.light;
  const { t } = useTranslation();

  const termsSections: TermSection[] = [
    {
      id: 1,
      icon: 'checkmark-circle-outline',
      title: t('termsService.sections.acceptance.title'),
      content: t('termsService.sections.acceptance.content'),
    },
    {
      id: 2,
      icon: 'person-add-outline',
      title: t('termsService.sections.accountRegistration.title'),
      content: t('termsService.sections.accountRegistration.content'),
    },
    {
      id: 3,
      icon: 'book-outline',
      title: t('termsService.sections.contentUsage.title'),
      content: t('termsService.sections.contentUsage.content'),
    },
    {
      id: 4,
      icon: 'sparkles-outline',
      title: t('termsService.sections.aiFeatures.title'),
      content: t('termsService.sections.aiFeatures.content'),
    },
    {
      id: 5,
      icon: 'shield-outline',
      title: t('termsService.sections.userConduct.title'),
      content: t('termsService.sections.userConduct.content'),
    },
    {
      id: 6,
      icon: 'documents-outline',
      title: t('termsService.sections.intellectualProperty.title'),
      content: t('termsService.sections.intellectualProperty.content'),
    },
    {
      id: 7,
      icon: 'close-circle-outline',
      title: t('termsService.sections.termination.title'),
      content: t('termsService.sections.termination.content'),
    },
    {
      id: 8,
      icon: 'refresh-outline',
      title: t('termsService.sections.changes.title'),
      content: t('termsService.sections.changes.content'),
    },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: t('termsService.title'),
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
        {/* Header */}
        <View style={styles.header}>
          <Ionicons name="document-text" size={64} color={colors.primary} />
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            {t('termsService.header.title')}
          </Text>
          <Text style={[styles.headerSubtitle, { color: colors.textMuted }]}>
            {t('termsService.header.subtitle')}
          </Text>
          <Text style={[styles.lastUpdated, { color: colors.textMuted }]}>
            {t('termsService.header.lastUpdated')}
          </Text>
        </View>

        {/* Terms Sections */}
        <View style={styles.sectionsContainer}>
          {termsSections.map((section) => (
            <View key={section.id} style={[styles.termCard, { backgroundColor: colors.surface }]}>
              <View style={[styles.iconContainer, { backgroundColor: colors.primary + '15' }]}>
                <Ionicons name={section.icon} size={24} color={colors.primary} />
              </View>
              <Text style={[styles.termTitle, { color: colors.text }]}>
                {section.title}
              </Text>
              <Text style={[styles.termContent, { color: colors.textMuted }]}>
                {section.content}
              </Text>
            </View>
          ))}
        </View>

        {/* Contact Section */}
        <View style={[styles.contactSection, { backgroundColor: colors.surface }]}>
          <Ionicons name="chatbubble-ellipses-outline" size={32} color={colors.primary} />
          <Text style={[styles.contactTitle, { color: colors.text }]}>
            {t('termsService.contactSection.title')}
          </Text>
          <Text style={[styles.contactText, { color: colors.textMuted }]}>
            {t('termsService.contactSection.text')}
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
  },
  headerTitle: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: '700',
    marginTop: Spacing.md,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: Typography.fontSize.base,
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
  lastUpdated: {
    fontSize: Typography.fontSize.sm,
    marginTop: Spacing.md,
    fontStyle: 'italic',
  },
  sectionsContainer: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  termCard: {
    padding: Spacing.lg,
    borderRadius: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  termTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: '600',
    marginBottom: Spacing.sm,
  },
  termContent: {
    fontSize: Typography.fontSize.base,
    lineHeight: 24,
  },
  contactSection: {
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.xl,
    padding: Spacing.lg,
    borderRadius: 12,
    alignItems: 'center',
  },
  contactTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: '600',
    marginTop: Spacing.md,
    textAlign: 'center',
  },
  contactText: {
    fontSize: Typography.fontSize.base,
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
});

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

interface PolicySection {
  id: number;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  content: string;
}

export default function PrivacyPolicyScreen() {
  const colors = Colors.light;
  const { t } = useTranslation();

  const policySections: PolicySection[] = [
    {
      id: 1,
      icon: 'information-circle-outline',
      title: t('privacyPolicy.sections.informationCollect.title'),
      content: t('privacyPolicy.sections.informationCollect.content'),
    },
    {
      id: 2,
      icon: 'shield-checkmark-outline',
      title: t('privacyPolicy.sections.dataUsage.title'),
      content: t('privacyPolicy.sections.dataUsage.content'),
    },
    {
      id: 3,
      icon: 'lock-closed-outline',
      title: t('privacyPolicy.sections.dataSecurity.title'),
      content: t('privacyPolicy.sections.dataSecurity.content'),
    },
    {
      id: 4,
      icon: 'share-social-outline',
      title: t('privacyPolicy.sections.dataSharing.title'),
      content: t('privacyPolicy.sections.dataSharing.content'),
    },
    {
      id: 5,
      icon: 'person-outline',
      title: t('privacyPolicy.sections.yourRights.title'),
      content: t('privacyPolicy.sections.yourRights.content'),
    },
    {
      id: 6,
      icon: 'trash-outline',
      title: t('privacyPolicy.sections.dataRetention.title'),
      content: t('privacyPolicy.sections.dataRetention.content'),
    },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: t('privacyPolicy.title'),
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
          <Ionicons name="shield-checkmark" size={64} color={colors.primary} />
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            {t('privacyPolicy.header.title')}
          </Text>
          <Text style={[styles.headerSubtitle, { color: colors.textMuted }]}>
            {t('privacyPolicy.header.subtitle')}
          </Text>
          <Text style={[styles.lastUpdated, { color: colors.textMuted }]}>
            {t('privacyPolicy.header.lastUpdated')}
          </Text>
        </View>

        {/* Policy Sections */}
        <View style={styles.sectionsContainer}>
          {policySections.map((section) => (
            <View key={section.id} style={[styles.policyCard, { backgroundColor: colors.surface }]}>
              <View style={[styles.iconContainer, { backgroundColor: colors.primary + '15' }]}>
                <Ionicons name={section.icon} size={24} color={colors.primary} />
              </View>
              <Text style={[styles.policyTitle, { color: colors.text }]}>
                {section.title}
              </Text>
              <Text style={[styles.policyContent, { color: colors.textMuted }]}>
                {section.content}
              </Text>
            </View>
          ))}
        </View>

        {/* Contact Section */}
        <View style={[styles.contactSection, { backgroundColor: colors.surface }]}>
          <Ionicons name="mail-outline" size={32} color={colors.primary} />
          <Text style={[styles.contactTitle, { color: colors.text }]}>
            {t('privacyPolicy.contactSection.title')}
          </Text>
          <Text style={[styles.contactText, { color: colors.textMuted }]}>
            {t('privacyPolicy.contactSection.text')}
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
  policyCard: {
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
  policyTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: '600',
    marginBottom: Spacing.sm,
  },
  policyContent: {
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

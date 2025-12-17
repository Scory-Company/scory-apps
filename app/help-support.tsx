import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { useTranslation } from 'react-i18next';

interface FAQItem {
  id: number;
  question: string;
  answer: string;
}

interface ContactOption {
  id: number;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  action: () => void;
}

export default function HelpSupportScreen() {
  const colors = Colors.light;
  const { t } = useTranslation();
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);

  // FAQ Data
  const faqs: FAQItem[] = [
    {
      id: 1,
      question: t('helpSupport.faq.items.q1.question'),
      answer: t('helpSupport.faq.items.q1.answer'),
    },
    {
      id: 2,
      question: t('helpSupport.faq.items.q2.question'),
      answer: t('helpSupport.faq.items.q2.answer'),
    },
    {
      id: 3,
      question: t('helpSupport.faq.items.q3.question'),
      answer: t('helpSupport.faq.items.q3.answer'),
    },
    {
      id: 4,
      question: t('helpSupport.faq.items.q4.question'),
      answer: t('helpSupport.faq.items.q4.answer'),
    },
    {
      id: 5,
      question: t('helpSupport.faq.items.q5.question'),
      answer: t('helpSupport.faq.items.q5.answer'),
    },
  ];

  // Contact Options
  const contactOptions: ContactOption[] = [
    {
      id: 1,
      icon: 'mail-outline',
      title: t('helpSupport.contact.email.title'),
      description: t('helpSupport.contact.email.description'),
      action: () => {
        Linking.openURL('mailto:scoryjournal@gmail.com?subject=Help Request');
      },
    },
    {
      id: 2,
      icon: 'logo-whatsapp',
      title: t('helpSupport.contact.whatsapp.title'),
      description: t('helpSupport.contact.whatsapp.description'),
      action: () => {
        Linking.openURL('https://wa.me/6281235873675');
      },
    },
    {
      id: 3,
      icon: 'logo-instagram',
      title: t('helpSupport.contact.instagram.title'),
      description: t('helpSupport.contact.instagram.description'),
      action: () => {
        Linking.openURL('https://instagram.com/scory_journal');
      },
    },
  ];

  const toggleFAQ = (id: number) => {
    setExpandedFAQ(expandedFAQ === id ? null : id);
  };


  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: t('helpSupport.title'),
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
        {/* Header Section */}
        <View style={styles.header}>
          <Ionicons name="help-circle-outline" size={64} color={colors.primary} />
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            {t('helpSupport.header.title')}
          </Text>
          <Text style={[styles.headerSubtitle, { color: colors.textMuted }]}>
            {t('helpSupport.header.subtitle')}
          </Text>
        </View>

        {/* Contact Options */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('helpSupport.contactUs')}</Text>

          <View style={styles.contactContainer}>
            {contactOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[styles.contactCard, { backgroundColor: colors.surface }]}
                onPress={option.action}
                activeOpacity={0.7}
              >
                <View style={[styles.contactIconContainer, { backgroundColor: colors.primary + '15' }]}>
                  <Ionicons name={option.icon} size={24} color={colors.primary} />
                </View>
                <View style={styles.contactInfo}>
                  <Text style={[styles.contactTitle, { color: colors.text }]}>
                    {option.title}
                  </Text>
                  <Text style={[styles.contactDescription, { color: colors.textMuted }]}>
                    {option.description}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* FAQ Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t('helpSupport.faq.title')}
          </Text>

          <View style={styles.faqContainer}>
            {faqs.map((faq) => (
              <View key={faq.id} style={[styles.faqItem, { backgroundColor: colors.surface }]}>
                <TouchableOpacity
                  style={styles.faqQuestion}
                  onPress={() => toggleFAQ(faq.id)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.faqQuestionText, { color: colors.text }]}>
                    {faq.question}
                  </Text>
                  <Ionicons
                    name={expandedFAQ === faq.id ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color={colors.textMuted}
                  />
                </TouchableOpacity>
                {expandedFAQ === faq.id && (
                  <View style={[styles.faqAnswer, { borderTopColor: colors.border }]}>
                    <Text style={[styles.faqAnswerText, { color: colors.textMuted }]}>
                      {faq.answer}
                    </Text>
                  </View>
                )}
              </View>
            ))}
          </View>
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
  section: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: '600',
    marginBottom: Spacing.md,
  },
  contactContainer: {
    gap: Spacing.sm,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: 12,
  },
  contactIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  contactInfo: {
    flex: 1,
  },
  contactTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: '600',
    marginBottom: 2,
  },
  contactDescription: {
    fontSize: Typography.fontSize.sm,
  },
  faqContainer: {
    gap: Spacing.sm,
  },
  faqItem: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  faqQuestion: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
  },
  faqQuestionText: {
    flex: 1,
    fontSize: Typography.fontSize.base,
    fontWeight: '600',
    marginRight: Spacing.sm,
  },
  faqAnswer: {
    borderTopWidth: 1,
    padding: Spacing.md,
    paddingTop: Spacing.sm,
  },
  faqAnswerText: {
    fontSize: Typography.fontSize.sm,
    lineHeight: 20,
  },
});

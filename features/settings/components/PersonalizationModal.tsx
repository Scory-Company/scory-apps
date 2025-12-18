import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { BottomSheetModal } from '@/features/shared/components/BottomSheetModal';
import { Colors, Spacing, Typography, Radius } from '@/constants/theme';
import { personalizationApi } from '@/services/personalization';

interface PersonalizationModalProps {
  visible: boolean;
  onClose: () => void;
  onEdit: () => void;
  onReset: () => void;
}

interface PersonalizationData {
  readingLevel?: string;
  topics?: Array<{ id: string; name: string }>;
}

export function PersonalizationModal({
  visible,
  onClose,
  onEdit,
  onReset,
}: PersonalizationModalProps) {
  const { t } = useTranslation();
  const colors = Colors.light;
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<PersonalizationData | null>(null);

  useEffect(() => {
    if (visible) {
      loadPersonalization();
    }
  }, [visible]);

  const loadPersonalization = async () => {
    setLoading(true);
    try {
      const [settings, topics] = await Promise.all([
        personalizationApi.getSettings(),
        personalizationApi.getTopicInterests(),
      ]);

      const readingLevel = settings.data?.data?.readingLevel?.toLowerCase();
      const topicsList = topics.data?.data || [];

      setData({
        readingLevel,
        topics: topicsList,
      });
    } catch (error) {
      // If error (e.g., 404), user hasn't setup personalization yet
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const hasPersonalization = data?.readingLevel || (data?.topics && data.topics.length > 0);

  return (
    <BottomSheetModal visible={visible} onClose={onClose} height="70%" showHandle>
      <View style={styles.container}>
        <Text style={[styles.title, { color: colors.text }]}>
          {t('settings.personalization.title')}
        </Text>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : hasPersonalization ? (
          <>
            {/* Current Settings */}
            <View style={styles.settingsSection}>
              {data?.readingLevel && (
                <View style={styles.settingItem}>
                  <Ionicons name="book-outline" size={20} color={colors.textMuted} />
                  <View style={styles.settingTextContainer}>
                    <Text style={[styles.settingLabel, { color: colors.textMuted }]}>
                      {t('settings.personalization.readingLevel')}
                    </Text>
                    <Text style={[styles.settingValue, { color: colors.text }]}>
                      {t(`personalization.results.${data.readingLevel}.title`)}
                    </Text>
                  </View>
                </View>
              )}

              {data?.topics && data.topics.length > 0 && (
                <View style={styles.settingItem}>
                  <Ionicons name="grid-outline" size={20} color={colors.textMuted} />
                  <View style={styles.settingTextContainer}>
                    <Text style={[styles.settingLabel, { color: colors.textMuted }]}>
                      {t('settings.personalization.topics')}
                    </Text>
                    <Text style={[styles.settingValue, { color: colors.text }]}>
                      {data.topics.length} {t('settings.personalization.topicsSelected')}
                    </Text>
                  </View>
                </View>
              )}
            </View>

            {/* Action Buttons */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.primaryButton, { backgroundColor: colors.primary }]}
                onPress={onEdit}
              >
                <Ionicons name="create-outline" size={20} color="white" />
                <Text style={styles.primaryButtonText}>
                  {t('settings.personalization.edit')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.secondaryButton, { borderColor: colors.border }]}
                onPress={onReset}
              >
                <Ionicons name="refresh-outline" size={20} color={colors.error} />
                <Text style={[styles.secondaryButtonText, { color: colors.error }]}>
                  {t('settings.personalization.reset')}
                </Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <>
            {/* No Personalization */}
            <View style={styles.emptyState}>
              <Ionicons name="sparkles-outline" size={48} color={colors.textMuted} />
              <Text style={[styles.emptyTitle, { color: colors.text }]}>
                {t('settings.personalization.notSetup')}
              </Text>
              <Text style={[styles.emptyMessage, { color: colors.textMuted }]}>
                {t('settings.personalization.setupMessage')}
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.button, styles.primaryButton, { backgroundColor: colors.primary }]}
              onPress={onEdit}
            >
              <Ionicons name="sparkles" size={20} color="white" />
              <Text style={styles.primaryButtonText}>
                {t('settings.personalization.setup')}
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.lg,
    paddingBottom: Spacing['4xl'],
  },
  title: {
    fontSize: Typography.fontSize.xl,
    fontWeight: '700',
    marginBottom: Spacing.lg,
  },
  loadingContainer: {
    paddingVertical: Spacing['3xl'],
    alignItems: 'center',
  },
  settingsSection: {
    marginBottom: Spacing.xl,
    gap: Spacing.md,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.sm,
    backgroundColor: '#F8F9FA',
    borderRadius: Radius.lg,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingLabel: {
    fontSize: Typography.fontSize.sm,
    marginBottom: 2,
  },
  settingValue: {
    fontSize: Typography.fontSize.base,
    fontWeight: '600',
  },
  buttonContainer: {
    gap: Spacing.sm,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.lg,
    gap: Spacing.sm,
  },
  primaryButton: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: Typography.fontSize.base,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: 'white',
    borderWidth: 1,
  },
  secondaryButtonText: {
    fontSize: Typography.fontSize.base,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing['2xl'],
    marginBottom: Spacing.lg,
  },
  emptyTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: '600',
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
  },
  emptyMessage: {
    fontSize: Typography.fontSize.sm,
    textAlign: 'center',
    lineHeight: 20,
  },
});

/**
 * Set Weekly Goal Modal
 * Allows users to set their weekly reading goal (1-50 articles)
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Typography, Radius } from '@/constants/theme';
import { BottomSheetModal } from '@/features/shared/components/BottomSheetModal';

interface SetWeeklyGoalModalProps {
  visible: boolean;
  currentTarget?: number;
  onClose: () => void;
  onGoalSet: (target: number) => Promise<void>;
}

const PRESET_GOALS = [3, 5, 7, 10];

export function SetWeeklyGoalModal({
  visible,
  currentTarget = 0,
  onClose,
  onGoalSet,
}: SetWeeklyGoalModalProps) {
  const colors = Colors.light;
  const [selectedTarget, setSelectedTarget] = useState(currentTarget > 0 ? currentTarget.toString() : '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Reset state when modal opens
  React.useEffect(() => {
    if (visible) {
      console.log('[SetWeeklyGoalModal] Modal opened, currentTarget:', currentTarget);
      setSelectedTarget(currentTarget > 0 ? currentTarget.toString() : '');
      setErrorMessage(null);
    }
  }, [visible, currentTarget]);

  const handlePresetSelect = (target: number) => {
    setSelectedTarget(target.toString());
    setErrorMessage(null);
  };

  const handleCustomInput = (text: string) => {
    // Only allow numbers
    const cleaned = text.replace(/[^0-9]/g, '');
    setSelectedTarget(cleaned);
    setErrorMessage(null);
  };

  const handleSubmit = async () => {
    const targetNum = parseInt(selectedTarget, 10);

    // Validation
    if (!selectedTarget || isNaN(targetNum)) {
      setErrorMessage('Please enter a target number');
      return;
    }

    if (targetNum < 1 || targetNum > 50) {
      setErrorMessage('Target must be between 1-50 articles');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage(null);
      await onGoalSet(targetNum);
      // Success - modal will close via onClose from parent
      onClose();
    } catch (error: any) {
      console.error('[SetWeeklyGoalModal] Error setting goal:', error);
      setErrorMessage(error.message || 'Failed to set goal. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <BottomSheetModal
      visible={visible}
      onClose={onClose}
      height="70%"
      enableSwipeToDismiss={!isSubmitting}
    >
      <View style={styles.modalContent}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Ionicons name="flag" size={24} color={colors.primary} />
            <Text style={[styles.title, { color: colors.text }]}>
              Set Weekly Goal
            </Text>
          </View>
          <TouchableOpacity
            onPress={onClose}
            disabled={isSubmitting}
            style={styles.closeButton}
          >
            <Ionicons name="close" size={24} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Description */}
        <Text style={[styles.description, { color: colors.textSecondary }]}>
          Challenge yourself to read more articles this week. Set a goal that motivates you!
        </Text>

        {/* Preset Goals */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.text }]}>
            Quick Select
          </Text>
          <View style={styles.presetGrid}>
            {PRESET_GOALS.map((preset) => {
              const isSelected = selectedTarget === preset.toString();
              return (
                <TouchableOpacity
                  key={preset}
                  style={[
                    styles.presetButton,
                    {
                      backgroundColor: isSelected ? colors.primary : colors.background,
                      borderColor: isSelected ? colors.primary : colors.border,
                    },
                  ]}
                  onPress={() => handlePresetSelect(preset)}
                  disabled={isSubmitting}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.presetNumber,
                      {
                        color: isSelected ? '#fff' : colors.text,
                      },
                    ]}
                  >
                    {preset}
                  </Text>
                  <Text
                    style={[
                      styles.presetLabel,
                      {
                        color: isSelected ? '#fff' : colors.textSecondary,
                      },
                    ]}
                  >
                    articles
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Custom Input */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.text }]}>
            Or Enter Custom Target
          </Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.background,
                  color: colors.text,
                  borderColor: errorMessage ? colors.error : colors.border,
                },
              ]}
              value={selectedTarget}
              onChangeText={handleCustomInput}
              keyboardType="number-pad"
              placeholder="1 - 50"
              placeholderTextColor={colors.textSecondary}
              editable={!isSubmitting}
              maxLength={2}
            />
            <Text style={[styles.inputSuffix, { color: colors.textSecondary }]}>
              articles
            </Text>
          </View>
          <Text style={[styles.hint, { color: colors.textSecondary }]}>
            💡 Set a realistic goal to keep your streak going!
          </Text>
        </View>

        {/* Error Message */}
        {errorMessage && (
          <View style={[styles.errorContainer, { backgroundColor: colors.error + '10' }]}>
            <Ionicons name="alert-circle" size={16} color={colors.error} />
            <Text style={[styles.errorText, { color: colors.error }]}>
              {errorMessage}
            </Text>
          </View>
        )}

        {/* Submit Button */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            {
              backgroundColor: colors.primary,
              opacity: isSubmitting || !selectedTarget ? 0.6 : 1,
            },
          ]}
          onPress={handleSubmit}
          disabled={isSubmitting || !selectedTarget}
          activeOpacity={0.8}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={20} color="#fff" />
              <Text style={styles.submitButtonText}>
                {currentTarget > 0 ? 'Update Goal' : 'Set Goal'}
              </Text>
            </>
          )}
        </TouchableOpacity>

        {/* Current Goal Info */}
        {currentTarget > 0 && (
          <Text style={[styles.currentGoalInfo, { color: colors.textSecondary }]}>
            Current goal: {currentTarget} articles/week
          </Text>
        )}
      </View>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  modalContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing['3xl'],
    minHeight: '65%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  title: {
    fontSize: Typography.fontSize.xl,
    fontWeight: '700',
  },
  closeButton: {
    padding: Spacing.xs,
  },
  description: {
    fontSize: Typography.fontSize.sm,
    lineHeight: 20,
    marginBottom: Spacing.xl,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionLabel: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '600',
    marginBottom: Spacing.sm,
  },
  presetGrid: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  presetButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  presetNumber: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },
  presetLabel: {
    fontSize: Typography.fontSize.xs,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: Typography.fontSize.lg,
    fontWeight: '600',
    textAlign: 'center',
  },
  inputSuffix: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '500',
  },
  hint: {
    fontSize: Typography.fontSize.xs,
    marginTop: Spacing.sm,
    fontStyle: 'italic',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    padding: Spacing.sm,
    borderRadius: Radius.sm,
    marginBottom: Spacing.md,
  },
  errorText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: '500',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    marginBottom: Spacing.sm,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: Typography.fontSize.base,
    fontWeight: '600',
  },
  currentGoalInfo: {
    fontSize: Typography.fontSize.xs,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

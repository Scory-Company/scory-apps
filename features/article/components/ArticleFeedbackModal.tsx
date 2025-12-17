import { Colors, Radius, Spacing, Typography, Shadows } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { FeedbackFormData, FeedbackTrigger } from '../types/feedback';

interface ArticleFeedbackModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: FeedbackFormData) => Promise<void>;
  trigger: FeedbackTrigger;
  quizScore?: number;
}

export const ArticleFeedbackModal: React.FC<ArticleFeedbackModalProps> = ({
  visible,
  onClose,
  onSubmit,
  trigger,
  quizScore,
}) => {
  const colors = Colors.light;

  const [rating, setRating] = useState(0);
  const [quizRelevant, setQuizRelevant] = useState<boolean | undefined>(undefined);
  const [improvementText, setImprovementText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [canSkip, setCanSkip] = useState(trigger === 'exit_intent' || trigger === 'manual');

  useEffect(() => {
    if (visible && trigger === 'quiz_completion') {
      // Only delay skip button for quiz completion trigger
      const timer = setTimeout(() => setCanSkip(true), 5000);
      return () => clearTimeout(timer);
    }
  }, [visible, trigger]);

  const handleSubmit = async () => {
    if (rating === 0) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        rating,
        quizRelevant: trigger === 'quiz_completion' ? quizRelevant : undefined,
        improvementText: improvementText.trim() || undefined,
      });
      handleClose();
    } catch (error) {
      console.error('Error submitting feedback:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setRating(0);
    setQuizRelevant(undefined);
    setImprovementText('');
    setIsSubmitting(false);
    setCanSkip(trigger === 'exit_intent');
    onClose();
  };

  const isQuizTrigger = trigger === 'quiz_completion';

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <View style={[styles.modalContainer, { backgroundColor: colors.surface }]}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={styles.header}>
              <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
                <Ionicons name="chatbubble-outline" size={28} color={colors.primary} />
              </View>

              <Text style={[styles.title, { color: colors.text }]}>
                {isQuizTrigger ? 'Quick Feedback' : 'Rate this article'}
              </Text>

              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                {isQuizTrigger
                  ? 'Help us improve your learning experience'
                  : 'Your feedback helps us get better'}
              </Text>
            </View>

            {/* Quiz Score */}
            {isQuizTrigger && quizScore !== undefined && (
              <View style={[styles.quizScoreBox, { backgroundColor: colors.surfaceSecondary }]}>
                <Ionicons name="trophy-outline" size={18} color={colors.primary} />
                <Text style={[styles.quizScoreText, { color: colors.text }]}>
                  You scored {quizScore}
                </Text>
              </View>
            )}

            {/* Rating */}
            <View style={styles.section}>
              <Text style={[styles.sectionLabel, { color: colors.text }]}>
                How was this article? <Text style={{ color: colors.error }}>*</Text>
              </Text>

              <View style={styles.starsContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Pressable
                    key={star}
                    onPress={() => setRating(star)}
                    style={styles.starButton}
                  >
                    <Ionicons
                      name={star <= rating ? 'star' : 'star-outline'}
                      size={36}
                      color={star <= rating ? colors.warning : colors.textMuted}
                    />
                  </Pressable>
                ))}
              </View>

              {rating > 0 && (
                <Text style={[styles.ratingText, { color: colors.textSecondary }]}>
                  {rating === 5 && 'Excellent'}
                  {rating === 4 && 'Great'}
                  {rating === 3 && 'Good'}
                  {rating === 2 && 'Okay'}
                  {rating === 1 && 'Needs improvement'}
                </Text>
              )}
            </View>

            {/* Quiz relevance */}
            {isQuizTrigger && (
              <View style={styles.section}>
                <Text style={[styles.sectionLabel, { color: colors.text }]}>
                  Was the quiz relevant?
                </Text>

                <View style={styles.buttonGroup}>
                  <Pressable
                    onPress={() => setQuizRelevant(true)}
                    style={[
                      styles.optionButton,
                      quizRelevant === true && {
                        backgroundColor: colors.primary,
                        borderColor: colors.primary,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.optionButtonText,
                        { color: quizRelevant === true ? colors.textwhite : colors.text },
                      ]}
                    >
                      Yes
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={() => setQuizRelevant(false)}
                    style={[
                      styles.optionButton,
                      quizRelevant === false && {
                        backgroundColor: colors.error,
                        borderColor: colors.error,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.optionButtonText,
                        { color: quizRelevant === false ? colors.textwhite : colors.text },
                      ]}
                    >
                      No
                    </Text>
                  </Pressable>
                </View>
              </View>
            )}

            {/* Improvement */}
            <View style={styles.section}>
              <Text style={[styles.sectionLabel, { color: colors.text }]}>
                What can we improve?{' '}
                <Text style={{ color: colors.textMuted }}>(Optional)</Text>
              </Text>

              <TextInput
                style={[
                  styles.textInput,
                  {
                    backgroundColor: colors.surfaceSecondary,
                    borderColor: colors.border,
                    color: colors.text,
                  },
                ]}
                placeholder="Share your thoughts..."
                placeholderTextColor={colors.textMuted}
                value={improvementText}
                onChangeText={setImprovementText}
                multiline
                maxLength={500}
                textAlignVertical="top"
              />

              <Text style={[styles.charCount, { color: colors.textMuted }]}>
                {improvementText.length}/500
              </Text>
            </View>

            {/* Actions */}
            <View style={styles.actions}>
              <Pressable
                onPress={handleSubmit}
                disabled={rating === 0 || isSubmitting}
                style={[
                  styles.submitButton,
                  {
                    backgroundColor:
                      rating === 0 ? colors.textMuted : colors.primary,
                  },
                ]}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.submitButtonText}>Submit feedback</Text>
                )}
              </Pressable>

              {canSkip && (
                <Pressable onPress={handleClose} style={styles.skipButton}>
                  <Text style={[styles.skipButtonText, { color: colors.textSecondary }]}>
                    Skip
                  </Text>
                </Pressable>
              )}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },

  modalContainer: {
    width: '100%',
    maxWidth: 520,
    maxHeight: '90%',
    borderRadius: Radius['2xl'],
    padding: Spacing.xl,
    ...Shadows.lg,
  },

  header: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },

  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: Radius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },

  title: {
    fontSize: Typography.fontSize.xl,
    fontFamily: Typography.fontFamily.semiBold,
    marginBottom: Spacing.xs,
    textAlign: 'center',
  },

  subtitle: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
    textAlign: 'center',
  },

  quizScoreBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    padding: Spacing.md,
    borderRadius: Radius.md,
    marginBottom: Spacing.lg,
  },

  quizScoreText: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.medium,
  },

  section: {
    marginBottom: Spacing.lg,
  },

  sectionLabel: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.medium,
    marginBottom: Spacing.sm,
  },

  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },

  starButton: {
    padding: Spacing.xs,
  },

  ratingText: {
    fontSize: Typography.fontSize.sm,
    textAlign: 'center',
    fontFamily: Typography.fontFamily.medium,
  },

  buttonGroup: {
    flexDirection: 'row',
    gap: Spacing.md,
  },

  optionButton: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    borderWidth: 1,
    alignItems: 'center',
  },

  optionButtonText: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.medium,
  },

  textInput: {
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.md,
    minHeight: 96,
    fontSize: Typography.fontSize.base,
  },

  charCount: {
    fontSize: Typography.fontSize.xs,
    textAlign: 'right',
    marginTop: Spacing.xs,
  },

  actions: {
    gap: Spacing.md,
    marginTop: Spacing.md,
  },

  submitButton: {
    paddingVertical: Spacing.md,
    borderRadius: Radius.full,
    alignItems: 'center',
    minHeight: 48,
  },

  submitButtonText: {
    color: '#fff',
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.semiBold,
  },

  skipButton: {
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },

  skipButtonText: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.medium,
  },
});

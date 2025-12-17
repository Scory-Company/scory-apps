import { Colors, Radius, Spacing, Typography } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

interface ArticleQuickFeedbackProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (rating: number) => Promise<void>;
}

export const ArticleQuickFeedback: React.FC<ArticleQuickFeedbackProps> = ({
  visible,
  onClose,
  onSubmit,
}) => {
  const colors = Colors.light;
  const [rating, setRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRatingSelect = async (selectedRating: number) => {
    setRating(selectedRating);
    setIsSubmitting(true);

    try {
      await onSubmit(selectedRating);
      // Close after short delay to show selection
      setTimeout(() => {
        handleClose();
      }, 500);
    } catch {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setRating(0);
    setIsSubmitting(false);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <Pressable style={styles.overlay} onPress={handleClose}>
        <Pressable
          style={[styles.bottomSheet, { backgroundColor: colors.background }]}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Handle bar */}
          <View style={[styles.handleBar, { backgroundColor: colors.textMuted }]} />

          {/* Content */}
          <View style={styles.content}>
            {/* Icon & Title */}
            <View style={styles.header}>
              <Ionicons name="star-outline" size={28} color={colors.primary} />
              <Text style={[styles.title, { color: colors.text }]}>Before you go...</Text>
            </View>

            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Quick rating? (Takes 5 seconds)
            </Text>

            {/* Rating Stars */}
            <View style={styles.starsContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Pressable
                  key={star}
                  onPress={() => handleRatingSelect(star)}
                  disabled={isSubmitting}
                  style={[
                    styles.starButton,
                    rating === star && styles.starButtonSelected,
                  ]}
                >
                  {isSubmitting && rating === star ? (
                    <ActivityIndicator size="small" color={colors.primary} />
                  ) : (
                    <Ionicons
                      name={star <= rating ? 'star' : 'star-outline'}
                      size={36}
                      color={star <= rating ? colors.warning : colors.textMuted}
                    />
                  )}
                </Pressable>
              ))}
            </View>

            {/* Labels */}
            <View style={styles.labelsContainer}>
              <Text style={[styles.labelText, { color: colors.textMuted }]}>
                Not good
              </Text>
              <Text style={[styles.labelText, { color: colors.textMuted }]}>
                Excellent
              </Text>
            </View>

            {/* Skip Button */}
            <Pressable
              onPress={handleClose}
              disabled={isSubmitting}
              style={styles.skipButton}
            >
              <Text style={[styles.skipButtonText, { color: colors.textSecondary }]}>
                Skip & Exit
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    paddingBottom: Spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  handleBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
  },
  content: {
    paddingHorizontal: Spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  title: {
    fontSize: Typography.fontSize.xl,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: Typography.fontSize.sm,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  starButton: {
    padding: Spacing.xs,
    borderRadius: Radius.md,
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  starButtonSelected: {
    transform: [{ scale: 1.1 }],
  },
  labelsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
    paddingHorizontal: Spacing.xs,
  },
  labelText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: '500',
  },
  skipButton: {
    paddingVertical: Spacing.md,
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  skipButtonText: {
    fontSize: Typography.fontSize.base,
    fontWeight: '600',
  },
});

import { Colors, Radius, Spacing, Typography } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import React, { useState, useRef, useEffect } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewToken,
} from 'react-native';
import { useQuiz } from '@/hooks/useQuiz';
import { QuizAnswer } from '@/services';
import { useToast } from '@/features/shared/hooks/useToast';
import { router } from 'expo-router';

interface ComprehensionSectionProps {
  articleSlug: string;
  category: string;
  readingLevel?: string; // Reading level for quiz questions
  onQuizAvailabilityChange?: (isAvailable: boolean) => void;
  readingStartTime?: number; // Timestamp when article reading started
  onGamificationResult?: (result: any) => void; // Callback for gamification result
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - Spacing.lg * 2 - Spacing.lg * 2;

// Letter mapping for quiz answers
const OPTION_LETTERS = ['A', 'B', 'C', 'D'];

export const ComprehensionSection: React.FC<ComprehensionSectionProps> = ({
  articleSlug,
  readingLevel,
  onQuizAvailabilityChange,
  readingStartTime,
  onGamificationResult,
}) => {
  const colors = Colors.light;
  const flatListRef = useRef<FlatList>(null);
  const toast = useToast();

  // ============================================================================
  // API Hooks
  // ============================================================================

  // Quiz hook with error handling via toast
  const {
    questions: quizData,
    results,
    isLoadingQuestions,
    questionsError,
    fetchQuestions,
    submitQuiz: submitQuizApi,
    resetQuiz,
  } = useQuiz(articleSlug, readingLevel, {
    onError: (message) => toast.error(message),
  });

  // ============================================================================
  // Local State
  // ============================================================================

  // Quiz state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string | number, number>>({});
  const [wrongAnswers, setWrongAnswers] = useState<Record<string | number, boolean>>({});

  // Computed values
  const questionsArray = quizData?.questions || [];
  const correctCount = Object.keys(selectedAnswers).length;
  const isQuizCompleted = results !== null;

  // ============================================================================
  // Effects - Fetch data on mount
  // ============================================================================

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]); // fetchQuestions is now stable (only changes when articleSlug changes)

  // Notify parent about quiz availability
  useEffect(() => {
    if (!isLoadingQuestions && !questionsError) {
      const isAvailable = questionsArray.length > 0;
      onQuizAvailabilityChange?.(isAvailable);
    }
  }, [isLoadingQuestions, questionsError, questionsArray.length, onQuizAvailabilityChange]);

  // ============================================================================
  // Quiz Handlers
  // ============================================================================

  const handleStartQuiz = () => {
    fetchQuestions();
  };

  const handleSelectAnswer = (questionId: string | number, optionIndex: number) => {
    const question = quizData?.questions.find((q) => q.id === questionId);
    if (!question) return;

    const isCorrect = optionIndex === question.correctIndex;

    if (isCorrect) {
      // Mark as correct
      const newSelectedAnswers = { ...selectedAnswers, [questionId]: optionIndex };
      setSelectedAnswers(newSelectedAnswers);
      setWrongAnswers((prev) => ({ ...prev, [questionId]: false }));

      // Check if all questions are now answered correctly
      const allQuestionsAnswered = quizData?.questions.every((q) => newSelectedAnswers[q.id] !== undefined);

      if (allQuestionsAnswered) {
        // All questions answered correctly, submit quiz
        // ✅ OPTIMIZED: Reduced delay from 500ms to 200ms
        setTimeout(() => {
          handleSubmitQuiz(newSelectedAnswers); // Pass the fresh answers to avoid stale state
        }, 200);
      } else {
        // Auto-advance to next unanswered question
        const currentQuestionIndex = quizData?.questions.findIndex((q) => q.id === questionId);
        if (currentQuestionIndex !== undefined && quizData && currentQuestionIndex < quizData.questions.length - 1) {
          // ✅ OPTIMIZED: Reduced delay from 500ms to 300ms
          setTimeout(() => {
            flatListRef.current?.scrollToIndex({
              index: currentQuestionIndex + 1,
              animated: true,
            });
          }, 300);
        }
      }
    } else {
      // Mark as wrong
      setWrongAnswers((prev) => ({ ...prev, [questionId]: true }));
    }
  };

  const handleRetryQuestion = (questionId: string | number) => {
    setWrongAnswers((prev) => ({ ...prev, [questionId]: false }));
  };

  const handleSubmitQuiz = async (finalAnswers?: Record<string | number, number>) => {
    if (!quizData) return;

    // Use provided finalAnswers or fall back to state (for manual submit button clicks)
    const answersToSubmit = finalAnswers || selectedAnswers;

    // VALIDATION: Check for unanswered questions
    const unansweredQuestions = quizData.questions.filter((q) => answersToSubmit[q.id] === undefined);

    if (unansweredQuestions.length > 0) {
      console.error(
        unansweredQuestions.map((q) => `Q${q.order + 1}`).join(', ')
      );
      return; // Block submission
    }

    // Build answers array in API format
    // Backend expects UUID string for questionId
    // Use q.id (should be UUID string) or q.questionId as fallback
    const answers: QuizAnswer[] = quizData.questions.map((q) => {
      // Use questionId or id field (both should be UUID string from backend)
      const questionId = q.questionId || q.id;

      // Get the selected answer for this question
      const selectedIndex = answersToSubmit[q.id];

      // This should never happen now due to validation above
      // But keeping as safety check
      if (selectedIndex === undefined) {
      }

      return {
        questionId: String(questionId), // Ensure it's string
        selectedAnswer: OPTION_LETTERS[selectedIndex !== undefined ? selectedIndex : 0],
      };
    });

    // Calculate reading time if readingStartTime is provided
    let readingTime: number | undefined;
    if (readingStartTime) {
      const endTime = Date.now();
      const durationInMinutes = (endTime - readingStartTime) / 60000; // Convert to minutes

      // Backend validation: reading time must be between 0.1 and 240 minutes
      if (durationInMinutes < 0.1) {
        readingTime = 0.1; // Use minimum valid value
      } else {
        readingTime = Math.round(durationInMinutes * 10) / 10; // Round to 1 decimal place
      }
    } else {
      toast.warning('Reading time not tracked');
    }

    // Submit quiz with reading time (triggers gamification)
    const gamificationResult = await submitQuizApi(answers, readingTime);

    // Handle gamification result if present
    if (gamificationResult) {
      // ✅ IMPORTANT: Always call the callback with gamification result
      // This triggers the feedback modal after quiz completion
      onGamificationResult?.(gamificationResult);
    } else {
      // ✅ FALLBACK: Even if no gamification result, still trigger callback
      // This ensures feedback modal appears after quiz completion
      onGamificationResult?.({
        completionType: 'basic',
        streakUpdated: false,
      });

      if (!readingStartTime) {
        // Don't show toast again if already shown above
        return;
      }
    }
  };

  const handleRetakeQuiz = () => {
    setSelectedAnswers({});
    setWrongAnswers({});
    setCurrentIndex(0);
    resetQuiz();
    flatListRef.current?.scrollToIndex({ index: 0, animated: true });
  };

  // ============================================================================
  // Helpers
  // ============================================================================

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0 && viewableItems[0].index !== null) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  // ============================================================================
  // Render Quiz Item
  // ============================================================================

  const renderQuizItem = ({ item: q, index }: { item: typeof questionsArray[0]; index: number }) => {
    const isAnswered = selectedAnswers[q.id] !== undefined;
    const isWrong = wrongAnswers[q.id] === true;

    return (
      <View style={[styles.slideCard, { width: CARD_WIDTH }]}>
        <Text style={[styles.questionNumber, { color: colors.primary }]}>
          {index + 1}/{questionsArray.length}
        </Text>
        <Text style={[styles.questionText, { color: colors.text }]}>{q.question}</Text>

        {isWrong ? (
          // Wrong answer state
          <View style={styles.wrongAnswerContainer}>
            <View style={[styles.wrongFeedback, { backgroundColor: '#FF4444' + '15' }]}>
              <Ionicons name="close-circle" size={24} color="#FF4444" />
              <Text style={[styles.wrongText, { color: '#FF4444' }]}>
                Oops! That&apos;s not correct.
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.retryQuestionButton, { backgroundColor: colors.primary }]}
              onPress={() => handleRetryQuestion(q.id)}
            >
              <Ionicons name="refresh" size={18} color={colors.text} />
              <Text style={[styles.retryQuestionText, { color: colors.text }]}>Try Again</Text>
            </TouchableOpacity>
          </View>
        ) : isAnswered ? (
          // Correct answer state
          <View style={[styles.correctFeedback, { backgroundColor: colors.success + '15' }]}>
            <Ionicons name="checkmark-circle" size={24} color={colors.success} />
            <Text style={[styles.correctText, { color: colors.success }]}>Correct!</Text>
          </View>
        ) : (
          // Options to select
          q.options.map((option, oIndex) => (
            <TouchableOpacity
              key={oIndex}
              style={[
                styles.optionButton,
                {
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                },
              ]}
              onPress={() => handleSelectAnswer(q.id, oIndex)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.optionIndicator,
                  {
                    backgroundColor: 'transparent',
                    borderColor: colors.border,
                  },
                ]}
              />
              <Text style={[styles.optionText, { color: colors.textSecondary }]}>{option}</Text>
            </TouchableOpacity>
          ))
        )}
      </View>
    );
  };

  // ============================================================================
  // Render
  // ============================================================================

  // Hide entire section if no quiz available
  if (!isLoadingQuestions && !questionsError && questionsArray.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Toast Component */}
      <toast.ToastComponent />

      {/* Section Header */}
      <View style={styles.sectionHeader}>
        <Ionicons name="school-outline" size={24} color={colors.primary} />
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Check Your Understanding</Text>
      </View>

      {/* Quiz Section */}
      <View style={[styles.quizContainer, { backgroundColor: colors.surface }]}>
        {questionsError ? (
          // Error state
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={48} color={colors.textMuted} />
            <Text style={[styles.errorText, { color: colors.textMuted }]}>{questionsError}</Text>
            <TouchableOpacity
              style={[styles.retryButton, { backgroundColor: colors.primary }]}
              onPress={handleStartQuiz}
            >
              <Text style={[styles.retryButtonText, { color: colors.text }]}>Try Again</Text>
            </TouchableOpacity>
          </View>
        ) : isLoadingQuestions ? (
          // Loading state
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.textMuted }]}>Loading quiz...</Text>
          </View>
        ) : isQuizCompleted ? (
          // Completion state
          <View style={styles.completionContainer}>
            <View style={[styles.completionCard, { backgroundColor: colors.success + '15' }]}>
              <Ionicons name="trophy" size={48} color={colors.success} />
              <Text style={[styles.completionTitle, { color: colors.success }]}>
                {results.score === results.totalQuestions ? 'Perfect Score!' : 'Quiz Completed!'}
              </Text>
              <Text style={[styles.completionSubtitle, { color: colors.textSecondary }]}>
                You scored {results.score} out of {results.totalQuestions} ({results.percentage}%)
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.exploreButton, { backgroundColor: colors.primary }]}
              onPress={() => router.push('/(tabs)/explore')}
            >
              <Ionicons name="compass" size={20} color={colors.textwhite} />
              <Text style={[styles.exploreButtonText, { color: colors.textwhite }]}>Explore More Articles</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Quiz Slides */}
            <FlatList
              ref={flatListRef}
              data={questionsArray}
              renderItem={renderQuizItem}
              keyExtractor={(item) => item.id.toString()}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onViewableItemsChanged={onViewableItemsChanged}
              viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
              scrollEnabled={true}
              contentContainerStyle={styles.flatListContent}
              snapToInterval={CARD_WIDTH}
              decelerationRate="fast"
            />

            {/* Pagination Dots */}
            <View style={styles.pagination}>
              {questionsArray.map((q, index) => {
                const isAnswered = selectedAnswers[q.id] !== undefined;
                const isActive = currentIndex === index;
                return (
                  <View
                    key={index}
                    style={[
                      styles.dot,
                      {
                        backgroundColor: isAnswered
                          ? colors.success
                          : isActive
                          ? colors.primary
                          : colors.border,
                        width: isActive ? 20 : 8,
                      },
                    ]}
                  />
                );
              })}
            </View>

            {/* Progress indicator */}
            <Text style={[styles.progressText, { color: colors.textMuted }]}>
              {correctCount}/{questionsArray.length} completed
            </Text>
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: Spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: '700',
  },
  // Quiz Styles
  quizContainer: {
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    minHeight: 200,
  },
  flatListContent: {
    gap: Spacing.md,
  },
  slideCard: {
    gap: Spacing.sm,
  },
  questionNumber: {
    fontSize: Typography.fontSize.xs,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  questionText: {
    fontSize: Typography.fontSize.base,
    fontWeight: '600',
    lineHeight: Typography.fontSize.base * 1.5,
    marginBottom: Spacing.sm,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  optionIndicator: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionText: {
    flex: 1,
    fontSize: Typography.fontSize.sm,
    lineHeight: Typography.fontSize.sm * 1.4,
  },
  // Wrong answer state
  wrongAnswerContainer: {
    gap: Spacing.md,
  },
  wrongFeedback: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    gap: Spacing.sm,
  },
  wrongText: {
    fontSize: Typography.fontSize.base,
    fontWeight: '600',
  },
  retryQuestionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    borderRadius: Radius.lg,
    gap: Spacing.xs,
  },
  retryQuestionText: {
    fontSize: Typography.fontSize.base,
    fontWeight: '600',
  },
  // Correct answer state
  correctFeedback: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    gap: Spacing.sm,
  },
  correctText: {
    fontSize: Typography.fontSize.base,
    fontWeight: '600',
  },
  // Pagination
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  progressText: {
    textAlign: 'center',
    fontSize: Typography.fontSize.sm,
  },
  // Completion state
  completionContainer: {
    gap: Spacing.md,
  },
  completionCard: {
    alignItems: 'center',
    padding: Spacing.xl,
    borderRadius: Radius.lg,
    gap: Spacing.sm,
  },
  completionTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: '700',
  },
  completionSubtitle: {
    fontSize: Typography.fontSize.sm,
  },
  retryAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    gap: Spacing.xs,
  },
  retryAllText: {
    fontSize: Typography.fontSize.base,
    fontWeight: '600',
  },
  // Explore button (after quiz completion)
  exploreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.lg,
    gap: Spacing.sm,
  },
  exploreButtonText: {
    fontSize: Typography.fontSize.base,
    fontWeight: '600',
  },
  // Loading state
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
    gap: Spacing.sm,
  },
  loadingText: {
    fontSize: Typography.fontSize.sm,
  },
  // Error state
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
    gap: Spacing.md,
  },
  errorText: {
    fontSize: Typography.fontSize.sm,
    textAlign: 'center',
  },
  retryButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
  },
  retryButtonText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '600',
  },
  // Empty state
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
    gap: Spacing.sm,
  },
  emptyText: {
    fontSize: Typography.fontSize.sm,
    textAlign: 'center',
  },
});

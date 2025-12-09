import { Colors, Radius, Spacing, Typography } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import React, { useState, useRef, useEffect } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ViewToken,
} from 'react-native';
import { useQuiz } from '@/hooks/useQuiz';
import { useInsights } from '@/hooks/useInsights';
import { QuizAnswer } from '@/services';

interface ComprehensionSectionProps {
  articleSlug: string;
  category: string;
  onSaveReflection: (reflection: string) => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - Spacing.lg * 2 - Spacing.lg * 2;

// Icon mapping for insights
const ICON_MAP: Record<string, keyof typeof Ionicons.glyphMap> = {
  lightbulb: 'bulb',
  rocket: 'rocket',
  star: 'star',
};

// Letter mapping for quiz answers
const OPTION_LETTERS = ['A', 'B', 'C', 'D'];

export const ComprehensionSection: React.FC<ComprehensionSectionProps> = ({
  articleSlug,
  onSaveReflection,
}) => {
  const colors = Colors.light;
  const flatListRef = useRef<FlatList>(null);

  // ============================================================================
  // API Hooks
  // ============================================================================

  // Quiz hook
  const {
    questions: quizData,
    results,
    isLoadingQuestions,
    questionsError,
    fetchQuestions,
    submitQuiz: submitQuizApi,
    resetQuiz,
  } = useQuiz(articleSlug);

  // Insights hook
  const {
    insights: insightsData,
    userNote,
    isLoadingInsights,
    isSavingNote,
    fetchInsights,
    fetchUserNote,
    saveNote: saveNoteApi,
  } = useInsights(articleSlug);

  // ============================================================================
  // Local State
  // ============================================================================

  // Quiz state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string | number, number>>({});
  const [wrongAnswers, setWrongAnswers] = useState<Record<string | number, boolean>>({});

  // Insights state
  const [reflection, setReflection] = useState('');
  const [selectedInsightIndex, setSelectedInsightIndex] = useState<number | null>(null);
  const [inputHeight, setInputHeight] = useState(60);

  // ============================================================================
  // Effects - Fetch data on mount
  // ============================================================================

  useEffect(() => {
    fetchQuestions();
    fetchInsights();
    fetchUserNote();
  }, [fetchQuestions, fetchInsights, fetchUserNote]);

  // Pre-fill reflection if user already has a saved note
  useEffect(() => {
    if (userNote && !reflection) {
      setReflection(userNote.content);
    }
  }, [userNote, reflection]);

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
        console.log('[COMPREHENSION] All questions answered! Auto-submitting...');
        setTimeout(() => {
          handleSubmitQuiz(newSelectedAnswers); // Pass the fresh answers to avoid stale state
        }, 500);
      } else {
        // Auto-advance to next unanswered question
        const currentQuestionIndex = quizData?.questions.findIndex((q) => q.id === questionId);
        if (currentQuestionIndex !== undefined && quizData && currentQuestionIndex < quizData.questions.length - 1) {
          setTimeout(() => {
            flatListRef.current?.scrollToIndex({
              index: currentQuestionIndex + 1,
              animated: true,
            });
          }, 500);
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

    console.log('[COMPREHENSION] Quiz data:', JSON.stringify(quizData, null, 2));
    console.log('[COMPREHENSION] Answers to submit:', answersToSubmit);

    // VALIDATION: Check for unanswered questions
    const unansweredQuestions = quizData.questions.filter((q) => answersToSubmit[q.id] === undefined);

    if (unansweredQuestions.length > 0) {
      console.error(
        '[COMPREHENSION] ERROR: Cannot submit incomplete quiz! Unanswered questions:',
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

      console.log(`[COMPREHENSION] Question ${q.order + 1}:`);
      console.log(`  - id: ${q.id} (type: ${typeof q.id})`);
      console.log(`  - questionId: ${q.questionId}`);
      console.log(`  - Using: ${questionId}`);

      // Get the selected answer for this question
      const selectedIndex = answersToSubmit[q.id];

      // This should never happen now due to validation above
      // But keeping as safety check
      if (selectedIndex === undefined) {
        console.error(`[COMPREHENSION] CRITICAL: Question ${q.order + 1} has no answer after validation!`);
      }

      return {
        questionId: String(questionId), // Ensure it's string
        selectedAnswer: OPTION_LETTERS[selectedIndex !== undefined ? selectedIndex : 0],
      };
    });

    console.log('[COMPREHENSION] Submitting to API:', JSON.stringify(answers, null, 2));
    await submitQuizApi(answers);
  };

  const handleRetakeQuiz = () => {
    setSelectedAnswers({});
    setWrongAnswers({});
    setCurrentIndex(0);
    resetQuiz();
    flatListRef.current?.scrollToIndex({ index: 0, animated: true });
  };

  // ============================================================================
  // Insights Handlers
  // ============================================================================

  const handleSelectInsight = (index: number) => {
    if (!insightsData) return;

    setSelectedInsightIndex(index);
    setReflection(insightsData.insights[index].content);
  };

  const handleSaveReflection = async () => {
    if (!reflection.trim()) return;

    // Check if user selected a suggested insight or wrote custom
    const isCustom =
      selectedInsightIndex === null ||
      (insightsData && selectedInsightIndex !== null && reflection !== insightsData.insights[selectedInsightIndex].content);

    // Convert null to undefined for the API (accepts boolean | undefined, not null)
    const success = await saveNoteApi(reflection.trim(), isCustom ?? false);

    if (success) {
      onSaveReflection(reflection.trim());
      // Refresh user note
      fetchUserNote();
    }
  };

  // ============================================================================
  // Helpers
  // ============================================================================

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0 && viewableItems[0].index !== null) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const questionsArray = quizData?.questions || [];
  const insightsArray = insightsData?.insights || [];
  const correctCount = Object.keys(selectedAnswers).length;
  const isQuizCompleted = results !== null;

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

  return (
    <View style={styles.container}>
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
              style={[styles.retryAllButton, { borderColor: colors.primary }]}
              onPress={handleRetakeQuiz}
            >
              <Ionicons name="refresh" size={18} color={colors.primary} />
              <Text style={[styles.retryAllText, { color: colors.primary }]}>Take Quiz Again</Text>
            </TouchableOpacity>
          </View>
        ) : questionsArray.length === 0 ? (
          // No quiz available
          <View style={styles.emptyContainer}>
            <Ionicons name="help-circle-outline" size={48} color={colors.textMuted} />
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>
              No quiz available for this article
            </Text>
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

      {/* Reflection Section - Key Insights */}
      {/* <View style={[styles.reflectionContainer, { backgroundColor: colors.surface }]}>
        <View style={styles.reflectionHeader}>
          <Ionicons name="bulb-outline" size={20} color={colors.third} />
          <Text style={[styles.reflectionTitle, { color: colors.text }]}>Key Insights</Text>
        </View>
        <Text style={[styles.reflectionSubtitle, { color: colors.textMuted }]}>
          Save a key takeaway to your notes
        </Text>

        {userNote && !isSavingNote ? (
          // User already saved a note
          <View style={[styles.savedReflection, { backgroundColor: colors.success + '15' }]}>
            <Ionicons name="checkmark-circle" size={24} color={colors.success} />
            <Text style={[styles.savedReflectionText, { color: colors.success }]}>
              Saved to your notes!
            </Text>
          </View>
        ) : isLoadingInsights ? (
          // Loading insights
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={colors.primary} />
          </View>
        ) : (
          <>
            {insightsArray.length > 0 && (
              <View style={styles.insightsContainer}>
                {insightsArray.map((insight, index) => (
                  <TouchableOpacity
                    key={insight.id}
                    style={[
                      styles.insightCard,
                      {
                        backgroundColor:
                          selectedInsightIndex === index ? colors.third + '15' : colors.background,
                        borderColor: selectedInsightIndex === index ? colors.third : colors.border,
                      },
                    ]}
                    onPress={() => handleSelectInsight(index)}
                  >
                    <View style={styles.insightRow}>
                      <View
                        style={[
                          styles.insightCheck,
                          {
                            backgroundColor:
                              selectedInsightIndex === index ? colors.third : 'transparent',
                            borderColor: selectedInsightIndex === index ? colors.third : colors.border,
                          },
                        ]}
                      >
                        {selectedInsightIndex === index && (
                          <Ionicons name="checkmark" size={12} color="#fff" />
                        )}
                      </View>
                      <View style={styles.insightContent}>
                        <Ionicons
                          name={ICON_MAP[insight.icon] || 'bulb'}
                          size={16}
                          color={colors.third}
                          style={{ marginRight: Spacing.xs }}
                        />
                        <Text
                          style={[
                            styles.insightText,
                            {
                              color:
                                selectedInsightIndex === index ? colors.text : colors.textSecondary,
                            },
                          ]}
                        >
                          {insight.content}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <TextInput
              style={[
                styles.reflectionInput,
                {
                  backgroundColor: colors.background,
                  color: colors.text,
                  borderColor: colors.border,
                  height: Math.max(60, inputHeight),
                },
              ]}
              placeholder="Or write your own insight..."
              placeholderTextColor={colors.textMuted}
              multiline
              value={reflection}
              onChangeText={(text) => {
                setReflection(text);
                // Deselect if user types something different
                if (
                  selectedInsightIndex !== null &&
                  insightsData &&
                  text !== insightsData.insights[selectedInsightIndex].content
                ) {
                  setSelectedInsightIndex(null);
                }
              }}
              onContentSizeChange={(event) => {
                setInputHeight(event.nativeEvent.contentSize.height);
              }}
              textAlignVertical="top"
            />

            <TouchableOpacity
              style={[
                styles.saveButton,
                {
                  backgroundColor: reflection.trim() ? colors.primary : colors.border,
                  opacity: isSavingNote ? 0.5 : 1,
                },
              ]}
              onPress={handleSaveReflection}
              disabled={!reflection.trim() || isSavingNote}
            >
              {isSavingNote ? (
                <ActivityIndicator size="small" color={colors.text} />
              ) : (
                <>
                  <Ionicons name="bookmark-outline" size={18} color={colors.text} />
                  <Text style={[styles.saveButtonText, { color: colors.text }]}>Save to Notes</Text>
                </>
              )}
            </TouchableOpacity>
          </>
        )}
      </View> */}
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
  // Reflection Styles
  reflectionContainer: {
    borderRadius: Radius.xl,
    padding: Spacing.lg,
  },
  reflectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  reflectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: '700',
  },
  reflectionSubtitle: {
    fontSize: Typography.fontSize.sm,
    marginBottom: Spacing.md,
  },
  insightsContainer: {
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  insightCard: {
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
  },
  insightRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  insightCheck: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  insightContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  insightText: {
    flex: 1,
    fontSize: Typography.fontSize.sm,
    lineHeight: Typography.fontSize.sm * 1.5,
  },
  reflectionInput: {
    borderWidth: 1.5,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    fontSize: Typography.fontSize.base,
    marginBottom: Spacing.md,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    borderRadius: Radius.lg,
    gap: Spacing.xs,
  },
  saveButtonText: {
    fontSize: Typography.fontSize.base,
    fontWeight: '600',
  },
  savedReflection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
    borderRadius: Radius.lg,
    gap: Spacing.sm,
  },
  savedReflectionText: {
    fontSize: Typography.fontSize.base,
    fontWeight: '600',
  },
});

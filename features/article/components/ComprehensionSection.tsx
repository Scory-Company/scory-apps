import { Colors, Radius, Spacing, Typography } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import React, { useState, useRef } from 'react';
import {
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ViewToken,
} from 'react-native';

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
}

interface ComprehensionSectionProps {
  category: string;
  onSaveReflection: (reflection: string) => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - Spacing.lg * 2 - Spacing.lg * 2;

// Key insights/conclusions from the article (contextual based on category)
const getKeyInsights = (category: string): string[] => [
  `Cross-disciplinary collaboration is essential for breakthrough discoveries in ${category.toLowerCase()}.`,
  `Mixed-methods research provides both statistical significance and contextual meaning.`,
  `Real-world applications of ${category.toLowerCase()} research show promising results across diverse contexts.`,
];

// Generate quiz questions based on category
const getQuizQuestions = (category: string): QuizQuestion[] => [
  {
    id: 1,
    question: `What is the main focus of this ${category.toLowerCase()} research?`,
    options: [
      'Historical analysis only',
      'Cutting-edge developments and implications',
      'Personal opinions',
      'Unrelated topics',
    ],
    correctIndex: 1,
  },
  {
    id: 2,
    question: 'What methodology approach was used in this study?',
    options: [
      'Only qualitative methods',
      'Only quantitative methods',
      'Mixed-methods approach',
      'No methodology mentioned',
    ],
    correctIndex: 2,
  },
  {
    id: 3,
    question: 'What was highlighted as essential for breakthrough discoveries?',
    options: [
      'Working in isolation',
      'Cross-disciplinary collaboration',
      'Avoiding new methods',
      'Ignoring context',
    ],
    correctIndex: 1,
  },
];

export const ComprehensionSection: React.FC<ComprehensionSectionProps> = ({
  category,
  onSaveReflection,
}) => {
  const colors = Colors.light;
  const questions = getQuizQuestions(category);
  const keyInsights = getKeyInsights(category);
  const flatListRef = useRef<FlatList>(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: number }>({});
  const [wrongAnswers, setWrongAnswers] = useState<{ [key: number]: boolean }>({});
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [reflection, setReflection] = useState('');
  const [reflectionSaved, setReflectionSaved] = useState(false);
  const [selectedInsight, setSelectedInsight] = useState<number | null>(null);

  const handleSelectAnswer = (questionId: number, optionIndex: number) => {
    const question = questions.find((q) => q.id === questionId);
    if (!question) return;

    const isCorrect = optionIndex === question.correctIndex;

    if (isCorrect) {
      // Mark as correct and auto-advance
      setAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
      setWrongAnswers((prev) => ({ ...prev, [questionId]: false }));

      // Check if this was the last question
      const currentQuestionIndex = questions.findIndex((q) => q.id === questionId);
      if (currentQuestionIndex === questions.length - 1) {
        // Quiz completed!
        setTimeout(() => setQuizCompleted(true), 500);
      } else {
        // Auto-advance to next question
        setTimeout(() => {
          flatListRef.current?.scrollToIndex({
            index: currentQuestionIndex + 1,
            animated: true,
          });
        }, 500);
      }
    } else {
      // Mark as wrong - show try again
      setWrongAnswers((prev) => ({ ...prev, [questionId]: true }));
    }
  };

  const handleRetryQuestion = (questionId: number) => {
    setWrongAnswers((prev) => ({ ...prev, [questionId]: false }));
  };

  const handleRetryAll = () => {
    setAnswers({});
    setWrongAnswers({});
    setQuizCompleted(false);
    setCurrentIndex(0);
    flatListRef.current?.scrollToIndex({ index: 0, animated: true });
  };

  const handleSelectInsight = (index: number) => {
    setSelectedInsight(index);
    setReflection(keyInsights[index]);
  };

  const handleSaveReflection = () => {
    if (reflection.trim()) {
      onSaveReflection(reflection.trim());
      setReflectionSaved(true);
    }
  };

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0 && viewableItems[0].index !== null) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const correctCount = Object.keys(answers).length;

  const renderQuizItem = ({ item: q, index }: { item: QuizQuestion; index: number }) => {
    const isAnswered = answers[q.id] !== undefined;
    const isWrong = wrongAnswers[q.id] === true;

    return (
      <View style={[styles.slideCard, { width: CARD_WIDTH }]}>
        <Text style={[styles.questionNumber, { color: colors.primary }]}>
          {index + 1}/{questions.length}
        </Text>
        <Text style={[styles.questionText, { color: colors.text }]}>{q.question}</Text>

        {isWrong ? (
          // Wrong answer state
          <View style={styles.wrongAnswerContainer}>
            <View style={[styles.wrongFeedback, { backgroundColor: '#FF4444' + '15' }]}>
              <Ionicons name="close-circle" size={24} color="#FF4444" />
              <Text style={[styles.wrongText, { color: '#FF4444' }]}>
                Oops! That's not correct.
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

  return (
    <View style={styles.container}>
      {/* Section Header */}
      <View style={styles.sectionHeader}>
        <Ionicons name="school-outline" size={24} color={colors.primary} />
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Check Your Understanding</Text>
      </View>

      {/* Quiz Section */}
      <View style={[styles.quizContainer, { backgroundColor: colors.surface }]}>
        {quizCompleted ? (
          // Completion state
          <View style={styles.completionContainer}>
            <View style={[styles.completionCard, { backgroundColor: colors.success + '15' }]}>
              <Ionicons name="trophy" size={48} color={colors.success} />
              <Text style={[styles.completionTitle, { color: colors.success }]}>
                All Correct!
              </Text>
              <Text style={[styles.completionSubtitle, { color: colors.textSecondary }]}>
                Great job understanding this article!
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.retryAllButton, { borderColor: colors.primary }]}
              onPress={handleRetryAll}
            >
              <Ionicons name="refresh" size={18} color={colors.primary} />
              <Text style={[styles.retryAllText, { color: colors.primary }]}>Take Quiz Again</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Quiz Slides */}
            <FlatList
              ref={flatListRef}
              data={questions}
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
              {questions.map((q, index) => {
                const isAnswered = answers[q.id] !== undefined;
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
              {correctCount}/{questions.length} completed
            </Text>
          </>
        )}
      </View>

      {/* Reflection Section - Key Insights */}
      <View style={[styles.reflectionContainer, { backgroundColor: colors.surface }]}>
        <View style={styles.reflectionHeader}>
          <Ionicons name="bulb-outline" size={20} color={colors.third} />
          <Text style={[styles.reflectionTitle, { color: colors.text }]}>Key Insights</Text>
        </View>
        <Text style={[styles.reflectionSubtitle, { color: colors.textMuted }]}>
          Save a key takeaway to your notes
        </Text>

        {reflectionSaved ? (
          <View style={[styles.savedReflection, { backgroundColor: colors.success + '15' }]}>
            <Ionicons name="checkmark-circle" size={24} color={colors.success} />
            <Text style={[styles.savedReflectionText, { color: colors.success }]}>
              Saved to your notes!
            </Text>
          </View>
        ) : (
          <>
            {/* Key Insights from article */}
            <View style={styles.insightsContainer}>
              {keyInsights.map((insight, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.insightCard,
                    {
                      backgroundColor:
                        selectedInsight === index ? colors.third + '15' : colors.background,
                      borderColor: selectedInsight === index ? colors.third : colors.border,
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
                            selectedInsight === index ? colors.third : 'transparent',
                          borderColor: selectedInsight === index ? colors.third : colors.border,
                        },
                      ]}
                    >
                      {selectedInsight === index && (
                        <Ionicons name="checkmark" size={12} color="#fff" />
                      )}
                    </View>
                    <Text
                      style={[
                        styles.insightText,
                        { color: selectedInsight === index ? colors.text : colors.textSecondary },
                      ]}
                    >
                      {insight}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            {/* Custom note input */}
            <TextInput
              style={[
                styles.reflectionInput,
                {
                  backgroundColor: colors.background,
                  color: colors.text,
                  borderColor: colors.border,
                },
              ]}
              placeholder="Or write your own insight..."
              placeholderTextColor={colors.textMuted}
              multiline
              numberOfLines={2}
              value={reflection}
              onChangeText={(text) => {
                setReflection(text);
                // Deselect if user types something different
                if (selectedInsight !== null && text !== keyInsights[selectedInsight]) {
                  setSelectedInsight(null);
                }
              }}
              textAlignVertical="top"
            />

            <TouchableOpacity
              style={[
                styles.saveButton,
                { backgroundColor: reflection.trim() ? colors.third : colors.border },
              ]}
              onPress={handleSaveReflection}
              disabled={!reflection.trim()}
            >
              <Ionicons name="bookmark-outline" size={18} color={colors.text} />
              <Text style={[styles.saveButtonText, { color: colors.text }]}>Save to Notes</Text>
            </TouchableOpacity>
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
    minHeight: 60,
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

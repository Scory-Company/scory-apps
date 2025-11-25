import { Spacing, Typography, Radius, Shadows, PersonalizationTheme } from '@/constants/theme';
import { ReadingLevel } from '@/constants/readingLevels';
import { PERSONALIZATION_QUIZ, LEVEL_EMOJIS, QuizOption } from '@/data/mock/personalization';
import { categoryCards } from '@/data/mock/categories';
import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Pressable,
  useColorScheme,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';

// Filter out 'All' category and get selectable topics
const TOPIC_OPTIONS = categoryCards;
const MIN_TOPICS = 3;

export default function PersonalizationScreen() {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const quizColors = PersonalizationTheme[colorScheme === 'dark' ? 'dark' : 'light'];

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<ReadingLevel[]>([]);
  const [showTopicSelection, setShowTopicSelection] = useState(false);
  const [selectedTopics, setSelectedTopics] = useState<number[]>([]);
  const [showResult, setShowResult] = useState(false);

  const currentQuestion = PERSONALIZATION_QUIZ[currentQuestionIndex];
  const totalQuestions = PERSONALIZATION_QUIZ.length;
  const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;

  // Animations (initialize progress with first question's progress)
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value((1 / totalQuestions) * 100)).current;

  // Calculate recommended level based on answers
  const calculateLevel = (userAnswers: ReadingLevel[]): ReadingLevel => {
    const counts: Record<ReadingLevel, number> = {
      simple: 0,
      student: 0,
      academic: 0,
      expert: 0,
    };

    userAnswers.forEach((level) => {
      counts[level]++;
    });

    // Find level with most votes
    const recommended = Object.entries(counts).reduce((a, b) =>
      a[1] > b[1] ? a : b
    )[0] as ReadingLevel;

    return recommended;
  };

  // Handle answer selection
  const handleAnswer = (option: QuizOption) => {
    const newAnswers = [...answers, option.weight];
    setAnswers(newAnswers);

    // Animate out
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -30,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Check if quiz is complete - go to topic selection
      if (currentQuestionIndex + 1 >= totalQuestions) {
        setShowTopicSelection(true);
      } else {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      }

      // Animate progress bar
      Animated.timing(progressAnim, {
        toValue: ((currentQuestionIndex + 2) / totalQuestions) * 100,
        duration: 300,
        useNativeDriver: false,
      }).start();

      // Animate in
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  // Handle going back
  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setCurrentQuestionIndex(currentQuestionIndex - 1);
        setAnswers(answers.slice(0, -1));

        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(progressAnim, {
            toValue: (currentQuestionIndex / totalQuestions) * 100,
            duration: 300,
            useNativeDriver: false,
          }),
        ]).start();
      });
    } else {
      router.back();
    }
  };

  // Handle topic selection
  const handleTopicToggle = (topicId: number) => {
    setSelectedTopics((prev) =>
      prev.includes(topicId)
        ? prev.filter((id) => id !== topicId)
        : [...prev, topicId]
    );
  };

  // Handle continue from topic selection to result
  const handleTopicsContinue = () => {
    if (selectedTopics.length >= MIN_TOPICS) {
      // Reset animations before showing result
      fadeAnim.setValue(1);
      slideAnim.setValue(0);
      setShowTopicSelection(false);
      setShowResult(true);
    }
  };

  // Handle final confirmation
  const handleConfirm = async () => {
    const recommendedLevel = calculateLevel(answers);
    const selectedTopicLabels = categoryCards
      .filter((cat) => selectedTopics.includes(cat.id))
      .map((cat) => cat.label);

    try {
      await AsyncStorage.setItem('userReadingLevel', recommendedLevel);
      await AsyncStorage.setItem('userTopicInterests', JSON.stringify(selectedTopicLabels));
      await AsyncStorage.setItem('hasSeenPersonalizationTutorial', 'true');
      console.log('Personalization completed. Level:', recommendedLevel, 'Topics:', selectedTopicLabels);
      router.back();
    } catch (error) {
      console.error('Error saving personalization:', error);
    }
  };

  // Get result data from translations
  const recommendedLevel = calculateLevel(answers);
  const getResultData = (level: ReadingLevel) => {
    const levelKey = level;
    return {
      emoji: LEVEL_EMOJIS[level],
      title: t(`personalization.results.${levelKey}.title`),
      description: t(`personalization.results.${levelKey}.description`),
      features: t(`personalization.results.${levelKey}.features`, { returnObjects: true }) as string[],
    };
  };
  const result = getResultData(recommendedLevel);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: quizColors.bg }]} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={quizColors.bg} />

      {showTopicSelection ? (
        // TOPIC SELECTION MODE
        <View style={styles.quizContainer}>
          <View style={styles.quizHeader}>
            <View style={styles.progressContainer}>
              <View style={styles.progressInfo}>
                <Text style={[styles.progressText, { color: quizColors.textSecondary }]}>
                  {t('personalization.topics.stepLabel')}
                </Text>
              </View>
              <View style={[styles.progressBar, { backgroundColor: quizColors.progressBg }]}>
                <View style={[styles.progressFill, { backgroundColor: quizColors.primary, width: '100%' }]} />
              </View>
            </View>
          </View>

          <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <View style={styles.questionCard}>
              <View style={styles.questionEmojiContainer}>
                <Text style={styles.questionEmoji}>🎯</Text>
              </View>
              <Text style={[styles.questionTitle, { color: quizColors.text }]}>
                {t('personalization.topics.title')}
              </Text>
              <Text style={[styles.questionSubtitle, { color: quizColors.textSecondary }]}>
                {t('personalization.topics.subtitle', { min: MIN_TOPICS })}
              </Text>

              <View style={styles.topicsGrid}>
                {TOPIC_OPTIONS.map((topic) => {
                  const isSelected = selectedTopics.includes(topic.id);
                  return (
                    <Pressable
                      key={topic.id}
                      onPress={() => handleTopicToggle(topic.id)}
                      style={[
                        styles.topicCard,
                        {
                          backgroundColor: isSelected ? quizColors.primaryLight : quizColors.surface,
                          borderColor: isSelected ? quizColors.primary : quizColors.border,
                        },
                      ]}
                    >
                      <Image source={topic.icon} style={styles.topicIcon} />
                      <Text style={[styles.topicLabel, { color: isSelected ? quizColors.primary : quizColors.text }]}>
                        {topic.label}
                      </Text>
                      {isSelected && (
                        <View style={[styles.topicCheck, { backgroundColor: quizColors.primary }]}>
                          <Text style={styles.topicCheckIcon}>✓</Text>
                        </View>
                      )}
                    </Pressable>
                  );
                })}
              </View>
            </View>
            <View style={{ height: 120 }} />
          </ScrollView>

          <View style={[styles.bottomButtons, { backgroundColor: quizColors.bg, ...Shadows.lg }]}>
            <TouchableOpacity
              style={[
                styles.primaryButton,
                {
                  backgroundColor: selectedTopics.length >= MIN_TOPICS ? quizColors.primary : quizColors.border,
                },
              ]}
              onPress={handleTopicsContinue}
              disabled={selectedTopics.length < MIN_TOPICS}
              activeOpacity={0.8}
            >
              <Text style={[styles.primaryButtonText, { color: selectedTopics.length >= MIN_TOPICS ? quizColors.buttonText : quizColors.textMuted }]}>
                {t('personalization.topics.continue')} ({selectedTopics.length}/{MIN_TOPICS})
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : !showResult ? (
        // QUIZ MODE
        <View style={styles.quizContainer}>
          {/* Header with Progress */}
          <View style={styles.quizHeader}>
            <View style={styles.progressContainer}>
              <View style={styles.progressInfo}>
                <Text style={[styles.progressText, { color: quizColors.textSecondary }]}>
                  {t('personalization.header.questionLabel', { current: currentQuestionIndex + 1, total: totalQuestions })}
                </Text>
                <Text style={[styles.progressPercent, { color: quizColors.primary }]}>
                  {Math.round(progress)}%
                </Text>
              </View>
              <View style={[styles.progressBar, { backgroundColor: quizColors.progressBg }]}>
                <Animated.View
                  style={[
                    styles.progressFill,
                    {
                      backgroundColor: quizColors.primary,
                      width: progressAnim.interpolate({
                        inputRange: [0, 100],
                        outputRange: ['0%', '100%'],
                      }),
                    },
                  ]}
                />
              </View>
            </View>

            {/* Back Button */}
            {currentQuestionIndex > 0 && (
              <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                <Text style={[styles.backButtonText, { color: quizColors.textMuted }]}>
                  {t('personalization.header.back')}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Question Card */}
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <Animated.View
              style={[
                styles.questionCard,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              {/* Question Emoji */}
              <View style={styles.questionEmojiContainer}>
                <Text style={styles.questionEmoji}>{currentQuestion.emoji}</Text>
              </View>

              {/* Question Title */}
              <Text style={[styles.questionTitle, { color: quizColors.text }]}>
                {t(`personalization.questions.${currentQuestion.questionKey}.title`)}
              </Text>
              <Text style={[styles.questionSubtitle, { color: quizColors.textSecondary }]}>
                {t(`personalization.questions.${currentQuestion.questionKey}.subtitle`)}
              </Text>

              {/* Options */}
              <View style={styles.optionsContainer}>
                {currentQuestion.options.map((option, index) => (
                  <Pressable
                    key={option.id}
                    onPress={() => handleAnswer(option)}
                    style={({ pressed }) => [
                      styles.optionCard,
                      {
                        backgroundColor: quizColors.surface,
                        borderColor: quizColors.border,
                      },
                      pressed && styles.optionCardPressed,
                    ]}
                  >
                    <Text style={styles.optionEmoji}>{option.emoji}</Text>
                    <Text style={[styles.optionText, { color: quizColors.text }]}>
                      {t(`personalization.questions.${currentQuestion.questionKey}.options.${option.weight}`)}
                    </Text>
                    <Text style={[styles.optionArrow, { color: quizColors.primary }]}>→</Text>
                  </Pressable>
                ))}
              </View>
            </Animated.View>

            {/* Skip Button */}
            <TouchableOpacity onPress={() => router.back()} style={styles.skipButton}>
              <Text style={[styles.skipButtonText, { color: quizColors.textMuted }]}>
                {t('personalization.header.skip')}
              </Text>
            </TouchableOpacity>

            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
      ) : (
        // RESULT SCREEN
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View
            style={[
              styles.resultContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            {/* Success Animation */}
            <View style={styles.resultHeader}>
              <View style={[styles.resultIcon, { backgroundColor: quizColors.primaryLight }]}>
                <Text style={styles.resultEmoji}>{result.emoji}</Text>
              </View>
              <Text style={[styles.resultTitle, { color: quizColors.textMuted }]}>
                {t('personalization.results.title')}
              </Text>
              <Text style={[styles.resultLevelTitle, { color: quizColors.primary }]}>
                {result.title}
              </Text>
              <Text style={[styles.resultDescription, { color: quizColors.text }]}>
                {result.description}
              </Text>
            </View>

            {/* Features List */}
            <View style={[styles.featuresCard, { backgroundColor: quizColors.surface, ...Shadows.md }]}>
              <Text style={[styles.featuresTitle, { color: quizColors.text }]}>
                {t('personalization.results.featuresTitle')}
              </Text>
              {result.features.map((feature, index) => (
                <View key={index} style={styles.featureItem}>
                  <Text style={[styles.featureIcon, { color: quizColors.primary }]}>✓</Text>
                  <Text style={[styles.featureText, { color: quizColors.text }]}>
                    {feature}
                  </Text>
                </View>
              ))}
            </View>

            {/* Info Cards */}
            <View style={styles.infoCards}>
              <View style={[styles.infoCard, { backgroundColor: quizColors.primaryLight }]}>
                <Text style={styles.infoCardIcon}>🎯</Text>
                <Text style={[styles.infoCardText, { color: quizColors.text }]}>
                  {t('personalization.results.infoCards.adaptive')}
                </Text>
              </View>

              <View style={[styles.infoCard, { backgroundColor: quizColors.accentLight }]}>
                <Text style={styles.infoCardIcon}>🔄</Text>
                <Text style={[styles.infoCardText, { color: quizColors.text }]}>
                  {t('personalization.results.infoCards.flexible')}
                </Text>
              </View>
            </View>

            {/* Bottom spacing for button */}
            <View style={{ height: 100 }} />
          </Animated.View>
        </ScrollView>
      )}

      {/* Fixed Bottom Button (Result Screen) */}
      {showResult && (
        <View style={[styles.bottomButtons, { backgroundColor: quizColors.bg, ...Shadows.lg }]}>
          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: quizColors.primary }]}
            onPress={handleConfirm}
            activeOpacity={0.8}
          >
            <Text style={[styles.primaryButtonText, { color: quizColors.buttonText }]}>
              {t('personalization.results.ctaButton')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              setShowResult(false);
              setCurrentQuestionIndex(0);
              setAnswers([]);
              progressAnim.setValue((1 / totalQuestions) * 100);
            }}
            style={styles.secondaryButton}
          >
            <Text style={[styles.secondaryButtonText, { color: quizColors.textMuted }]}>
              {t('personalization.results.retakeButton')}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  quizContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
  },

  // Quiz Header & Progress
  quizHeader: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  progressContainer: {
    marginBottom: Spacing.md,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  progressText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '600',
  },
  progressPercent: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '700',
  },
  progressBar: {
    height: 6,
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: Radius.full,
  },
  backButton: {
    alignSelf: 'flex-start',
  },
  backButtonText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '500',
  },

  // Question Card
  questionCard: {
    paddingTop: Spacing.xl,
  },
  questionEmojiContainer: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  questionEmoji: {
    fontSize: 64,
  },
  questionTitle: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  questionSubtitle: {
    fontSize: Typography.fontSize.base,
    textAlign: 'center',
    marginBottom: Spacing['2xl'],
  },

  // Options
  optionsContainer: {
    gap: Spacing.md,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    borderWidth: 2,
    gap: Spacing.md,
  },
  optionCardPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
  optionEmoji: {
    fontSize: 28,
  },
  optionText: {
    flex: 1,
    fontSize: Typography.fontSize.base,
    lineHeight: Typography.fontSize.base * 1.4,
  },
  optionArrow: {
    fontSize: Typography.fontSize.lg,
    fontWeight: '600',
  },

  // Result Screen
  resultContainer: {
    paddingTop: Spacing.xl,
  },
  resultHeader: {
    alignItems: 'center',
    marginBottom: Spacing['2xl'],
  },
  resultIcon: {
    width: 100,
    height: 100,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  resultEmoji: {
    fontSize: 48,
  },
  resultTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: '600',
    marginBottom: Spacing.sm,
  },
  resultLevelTitle: {
    fontSize: Typography.fontSize['3xl'],
    fontWeight: '700',
    marginBottom: Spacing.sm,
  },
  resultDescription: {
    fontSize: Typography.fontSize.base,
    textAlign: 'center',
    lineHeight: Typography.fontSize.base * 1.5,
    paddingHorizontal: Spacing.md,
  },

  // Features
  featuresCard: {
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    marginBottom: Spacing.lg,
  },
  featuresTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: '600',
    marginBottom: Spacing.md,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  featureIcon: {
    fontSize: Typography.fontSize.lg,
    fontWeight: '700',
  },
  featureText: {
    flex: 1,
    fontSize: Typography.fontSize.base,
    lineHeight: Typography.fontSize.base * 1.4,
  },

  // Info Cards
  infoCards: {
    gap: Spacing.sm,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.md,
    borderRadius: Radius.md,
  },
  infoCardIcon: {
    fontSize: 24,
  },
  infoCardText: {
    flex: 1,
    fontSize: Typography.fontSize.sm,
  },

  // Bottom Buttons
  bottomButtons: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  primaryButton: {
    paddingVertical: Spacing.md,
    borderRadius: Radius.lg,
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  primaryButtonText: {
    fontSize: Typography.fontSize.lg,
    fontWeight: '700',
  },
  secondaryButton: {
    paddingVertical: Spacing.sm,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '500',
  },
  skipButton: {
    paddingVertical: Spacing.lg,
    alignItems: 'center',
    marginTop: Spacing.lg,
  },
  skipButtonText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '500',
  },

  // Topic Selection
  topicsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    justifyContent: 'center',
  },
  topicCard: {
    width: '45%',
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 2,
    alignItems: 'center',
    position: 'relative',
  },
  topicIcon: {
    width: 48,
    height: 48,
    marginBottom: Spacing.sm,
  },
  topicLabel: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '600',
    textAlign: 'center',
  },
  topicCheck: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topicCheckIcon: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
});

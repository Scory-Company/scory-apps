import { Colors, Spacing, Typography } from '@/constants/theme';
import {
  LearningStatCard,
  WeeklyGoalCard,
  StudyCollectionCard,
  InsightCard,
  SectionHeader,
  AddInsightButton,
  ViewAllPrompt,
} from '@/features/learn/components';
import { EmptyState } from '@/features/shared/components';
import React from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  studyCollections,
  weeklyGoal,
  learningStats as learningStatsData,
  readingInsights
} from '@/data/mock';

export default function LearnScreen() {
  const colors = Colors.light;

  // Use mock data from centralized location
  const allInsights = readingInsights;

  // Learning Stats with color config
  const learningStats = learningStatsData.map((stat) => {
    let iconColor = colors.primary;
    let iconBackgroundColor = colors.primary + '20';

    if (stat.icon === 'book') {
      iconColor = colors.warning;
      iconBackgroundColor = '#FEF3E2';
    } else if (stat.icon === 'time') {
      iconColor = colors.info;
      iconBackgroundColor = '#E0F2FE';
    }

    return {
      ...stat,
      iconColor,
      iconBackgroundColor,
    };
  });

  // Limit to max 3 recent insights
  const recentInsights = allInsights.slice(0, 3);

  // Conditional logic for add button placement
  const showBottomAddButton = allInsights.length <= 2;
  const showHeaderAddButton = allInsights.length > 2;
  const remainingInsightsCount = allInsights.length > 3 ? allInsights.length - 3 : 0;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* Header */}
      <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Learn</Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            Your personalized learning journey
          </Text>
        </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >

        {/* Learning Stats Cards */}
        <View style={styles.statsContainer}>
          {learningStats.map((stat) => (
            <LearningStatCard
              key={stat.id}
              icon={stat.icon}
              value={stat.value}
              label={stat.label}
              iconColor={stat.iconColor}
              iconBackgroundColor={stat.iconBackgroundColor}
            />
          ))}
        </View>

        {/* Weekly Reading Goal */}
        <View style={styles.section}>
          <SectionHeader
            title="Weekly Reading Goal"
            icon="flag"
            iconColor={colors.info}
            showViewAll={false}
          />

          <WeeklyGoalCard
            completed={weeklyGoal.completed}
            target={weeklyGoal.target}
            daysLeft={weeklyGoal.daysLeft}
            onContinuePress={() => console.log('Continue reading pressed')}
            onSetGoalPress={() => console.log('Open goal setup modal')}
          />
        </View>

        {/* Study Collections */}
        <View style={styles.section}>
          <SectionHeader
            title="Study Collections"
            icon="folder-open"
            iconColor={colors.warning}
            onViewAllPress={() => console.log('View all collections')}
          />

          {studyCollections.length > 0 ? (
            <View style={styles.collectionsContainer}>
              {studyCollections.map((collection) => (
                <StudyCollectionCard
                  key={collection.id}
                  title={collection.title}
                  category={collection.category}
                  articlesCount={collection.articlesCount}
                  progress={collection.progress}
                  icon={collection.icon}
                  color={collection.color}
                  onPress={() => console.log('Collection pressed:', collection.title)}
                />
              ))}
            </View>
          ) : (
            <EmptyState
              icon="folder-open-outline"
              title="No Collections Yet"
              message="Start creating your first study collection to organize your learning"
              actionLabel="Create Collection"
              onActionPress={() => console.log('Create collection pressed')}
            />
          )}
        </View>

        {/* Reading Notes & Insights */}
        <View style={styles.section}>
          <SectionHeader
            title="Reading Notes & Insights"
            icon="bulb"
            iconColor={colors.warning}
            showViewAll={false}
            showAddButton={showHeaderAddButton}
            onAddPress={() => console.log('Add insight pressed')}
          />

          {recentInsights.length > 0 ? (
            <>
              <View style={styles.insightsContainer}>
                {recentInsights.map((insight) => (
                  <InsightCard
                    key={insight.id}
                    articleTitle={insight.articleTitle}
                    note={insight.note}
                    date={insight.date}
                    tags={insight.tags}
                    onPress={() => console.log('Insight pressed:', insight.articleTitle)}
                  />
                ))}
              </View>

              {/* Show ViewAllPrompt if there are more insights */}
              {remainingInsightsCount > 0 && (
                <ViewAllPrompt
                  count={remainingInsightsCount}
                  label="insight"
                  onPress={() => console.log('View all insights')}
                />
              )}

              {/* Show bottom add button only when insights <= 2 */}
              {showBottomAddButton && (
                <AddInsightButton onPress={() => console.log('Add insight pressed')} />
              )}
            </>
          ) : (
            <>
              <EmptyState
                icon="bulb-outline"
                title="Start Capturing Insights"
                message="Take notes while reading to remember key ideas"
              />
              <AddInsightButton onPress={() => console.log('Add insight pressed')} />
            </>
          )}
        </View>

        {/* Bottom Padding */}
        <View style={{ height: 100 }} />
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
    paddingBottom: 30,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  headerTitle: {
    fontSize: Typography.fontSize['3xl'],
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },
  headerSubtitle: {
    fontSize: Typography.fontSize.base,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  collectionsContainer: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  insightsContainer: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
});
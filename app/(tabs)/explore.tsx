import { Colors, Spacing, Typography } from '@/constants/theme';
import {
  CategoryFilterChips,
  RecentlyAddedCard,
  SearchBar,
  SectionHeader,
  TopRatedCard,
  TrendingTopicCard,
  PersonalizationPrompt,
  FilteredContentView
} from '@/features/explore/components';
import { CardArticle } from '@/features/shared/components/CardArticle';
import { ViewAllPrompt } from '@/features/shared/components/ViewAllPrompt';
import React, { useState, useMemo, useEffect } from 'react';
import { ScrollView, StatusBar, StyleSheet, Text, View, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from 'expo-router';
import { filterContent } from '@/utils/filterContent';
import {
  trendingTopics,
  forYouArticles,
  recentlyAddedArticles,
  topRatedArticles,
  categoryList
} from '@/data/mock';

export default function ExploreScreen() {
  const colors = Colors.light;
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const hasPersonalizationData = true;

  // Check if filters are active
  const hasActiveFilters = searchQuery.trim() !== '' || selectedCategory !== 'All';
  const hasActiveKeyboard = searchQuery.trim() !== '';

  // Hide TabBar when search/filter is active (for CustomTabBar)
  useEffect(() => {
    navigation.setOptions({
      tabBarVisible: !hasActiveKeyboard
    });
  }, [hasActiveKeyboard, navigation]);

  // Combine all data for filtering - using centralized mock data
  const allArticlesData = useMemo(() => {
    return [...forYouArticles, ...recentlyAddedArticles];
  }, []);

  // Filter results based on search and category
  const filteredResults = useMemo(() => {
    if (!hasActiveFilters) return [];

    return filterContent({
      searchQuery,
      selectedCategory,
      allData: allArticlesData,
    });
  }, [searchQuery, selectedCategory, allArticlesData, hasActiveFilters]);

  // Handlers
  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
  };

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  const handleClearCategory = () => {
    setSelectedCategory('All');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={0}
      >

      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Explore</Text>
        <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
          Discover new research & insights
        </Text>
      </View>

      {/* Search Bar - Fixed */}
      <View style={[styles.searchBarContainer, { backgroundColor: colors.background }]}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search journals, topics, authors..."
        />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Category Filter Chips */}
        <CategoryFilterChips
          categories={categoryList}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />

        {/* CONDITIONAL RENDERING: Filtered View vs Default View */}
        {hasActiveFilters ? (
          // ========== FILTERED VIEW ==========
          <FilteredContentView
            results={filteredResults}
            searchQuery={searchQuery}
            selectedCategory={selectedCategory}
            onClearFilters={handleClearFilters}
            onClearSearch={handleClearSearch}
            onClearCategory={handleClearCategory}
          />
        ) : (
          // ========== DEFAULT VIEW ==========
          <>
            {/* Trending Topics */}
            <View style={styles.section}>
          <SectionHeader
            title="Trending Now"
            icon="flame"
            iconColor={colors.error}
            onViewAllPress={() => console.log('View all trending')}
          />

          <View style={styles.trendingGrid}>
            {trendingTopics.slice(0, 4).map((topic) => (
              <TrendingTopicCard
                key={topic.id}
                keyword={topic.keyword}
                count={topic.count}
                icon={topic.icon}
                gradientColors={topic.gradientColors}
                onPress={() => console.log('Trending topic pressed:', topic.keyword)}
              />
            ))}
          </View>
        </View>

        {/* For You Section - Conditional based on personalization */}
        {hasPersonalizationData ? (
          <View style={styles.section}>
            <SectionHeader
              title="For You"
              icon="sparkles"
              iconColor={colors.warning}
              onViewAllPress={() => console.log('View all for you')}
            />

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.forYouScrollContent}
            >
              {forYouArticles.map((item) => (
                <CardArticle
                  key={item.id}
                  image={item.image}
                  title={item.title}
                  author={item.author}
                  category={item.category}
                  rating={item.rating}
                  reads={item.reads}
                  onPress={() => console.log('For you card pressed:', item.title)}
                />
              ))}
            </ScrollView>
          </View>
        ) : (
          <View style={styles.section}>
            <PersonalizationPrompt
              showIndicator={true}
              onSetupPress={() => console.log('Setup personalization')}
            />
          </View>
        )}

        {/* Top Rated This Week */}
        <View style={styles.section}>
          <SectionHeader
            title="Top Rated This Week"
            icon="trophy"
            iconColor={colors.warning}
            onViewAllPress={() => console.log('View all top rated')}
          />

          <View style={styles.topRatedList}>
            {topRatedArticles.slice(0, 3).map((item, index) => (
              <TopRatedCard
                key={item.id}
                rank={index + 1}
                title={item.title}
                author={item.author}
                category={item.category}
                rating={item.rating}
                onPress={() => console.log('Top rated card pressed:', item.title)}
              />
            ))}
          </View>

          {topRatedArticles.length > 3 && (
            <ViewAllPrompt
              count={topRatedArticles.length - 3}
              label="article"
              onPress={() => console.log('View all top rated')}
            />
          )}
        </View>

        {/* Recently Added */}
        <View style={styles.section}>
          <SectionHeader
            title="Recently Added"
            icon="time"
            iconColor={colors.info}
            onViewAllPress={() => console.log('View all recently added')}
          />

          <View style={styles.recentlyAddedList}>
            {recentlyAddedArticles.slice(0, 3).map((item) => (
              <RecentlyAddedCard
                key={item.id}
                image={item.image}
                title={item.title}
                author={item.author}
                category={item.category}
                rating={item.rating}
                date={item.date}
                onPress={() => console.log('Recently added card pressed:', item.title)}
              />
            ))}
          </View>

          {recentlyAddedArticles.length > 3 && (
            <ViewAllPrompt
              count={recentlyAddedArticles.length - 3}
              label="article"
              onPress={() => console.log('View all recently added')}
            />
          )}
        </View>
            <View style={{ height: 100 }} />
          </>
        )}
      </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  headerTitle: {
    fontSize: Typography.fontSize['3xl'],
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },
  headerSubtitle: {
    fontSize: Typography.fontSize.base,
  },
  searchBarContainer: {
    paddingBottom: Spacing.sm,
    zIndex: 10,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  trendingGrid: {
    paddingHorizontal: Spacing.lg,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  forYouScrollContent: {
    paddingLeft: Spacing.lg,
    paddingRight: Spacing.xl,
    gap: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  topRatedList: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  recentlyAddedList: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
});

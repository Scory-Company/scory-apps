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
import { ForYouSection } from '@/features/home/components';
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { ScrollView, StatusBar, StyleSheet, Text, View, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, router } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { filterContent } from '@/utils/filterContent';
import { articlesApi, categoriesApi, personalizationApi } from '@/services';
import { ReadingLevel } from '@/constants/readingLevels';
import {
  trendingTopics,
  recentlyAddedArticles as mockRecentlyAdded,
  topRatedArticles as mockTopRated,
  categoryList as mockCategoryList
} from '@/data/mock';
import { ScholarArticle, searchScholarMock } from '@/data/mock/scholar/scholar-results';

// Display article type
interface DisplayArticle {
  id: string | number;
  slug?: string;
  image: any;
  title: string;
  author: string;
  category: string;
  rating: number;
  reads?: string;
  date?: string;
  badge?: string;
}

export default function ExploreScreen() {
  const colors = Colors.light;
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [topRatedArticles, setTopRatedArticles] = useState<DisplayArticle[]>(mockTopRated);
  const [recentlyAddedArticles, setRecentlyAddedArticles] = useState<DisplayArticle[]>(mockRecentlyAdded);
  const [categoryList, setCategoryList] = useState<string[]>(mockCategoryList);

  // Dynamic personalization state - fetched from API
  const [hasPersonalizationData, setHasPersonalizationData] = useState(false);
  const [userReadingLevel, setUserReadingLevel] = useState<ReadingLevel>('student');

  // Check personalization status from API
  const checkPersonalizationStatus = useCallback(async () => {
    try {
      console.log('[Explore - Personalization] Checking status...');
      const response = await personalizationApi.getSettings();

      if (response.data?.data && response.data.data.readingLevel) {
        // User has completed personalization
        const readingLevel = response.data.data.readingLevel.toLowerCase() as ReadingLevel;
        setUserReadingLevel(readingLevel);
        setHasPersonalizationData(true);
        console.log('[Explore - Personalization] ✅ User has personalization data, level:', readingLevel);
      } else {
        // User hasn't completed personalization
        setHasPersonalizationData(false);
        console.log('[Explore - Personalization] ❌ No personalization data');
      }
    } catch (error) {
      // API error - assume not completed
      setHasPersonalizationData(false);
      console.log('[Explore - Personalization] ❌ Error checking, using mock');
    }
  }, []);

  // Fetch data from API on mount
  useEffect(() => {
    fetchCategories();
    fetchTopRated();
    fetchRecentlyAdded();
    checkPersonalizationStatus();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-check personalization when screen is focused
  useFocusEffect(
    useCallback(() => {
      checkPersonalizationStatus();
    }, [checkPersonalizationStatus])
  );

  const fetchCategories = async () => {
    try {
      console.log('Fetching categories...');
      const response = await categoriesApi.getAll();
      console.log('Categories API Response:', response.data);

      // Check if response has nested data structure
      const categoriesData = response.data?.data || response.data;

      if (categoriesData && Array.isArray(categoriesData)) {
        // Transform API response to category names array
        const categoryNames = ['All', ...categoriesData.map((cat: any) => cat.name)];
        setCategoryList(categoryNames);
        console.log('Loaded categories from API:', categoryNames);
      }
    } catch {
      console.log('Categories API unavailable, using mock');
    }
  };

  const fetchTopRated = async () => {
    try {
      const response = await articlesApi.getTopRated({ page: 1, limit: 5 });
      const apiData = response.data?.data;
      if (apiData?.articles?.length > 0) {
        const transformed = apiData.articles.map((article: any) => ({
          id: article.id,
          slug: article.slug,
          image: { uri: article.imageUrl || 'https://images.unsplash.com/photo-1477332552946-cfb384aeaf1c?w=600' },
          title: article.title,
          author: article.authorName,
          category: article.category?.name || 'General',
          rating: article.rating,
        }));
        setTopRatedArticles(transformed);
        console.log('Loaded top rated from API:', transformed.length);
      }
    } catch {
      console.log('Top rated API unavailable, using mock');
    }
  };

  const fetchRecentlyAdded = async () => {
    try {
      const response = await articlesApi.getRecent({ page: 1, limit: 5 });
      const apiData = response.data?.data;
      if (apiData?.articles?.length > 0) {
        const transformed = apiData.articles.map((article: any) => ({
          id: article.id,
          slug: article.slug,
          image: { uri: article.imageUrl || 'https://images.unsplash.com/photo-1477332552946-cfb384aeaf1c?w=600' },
          title: article.title,
          author: article.authorName,
          category: article.category?.name || 'General',
          rating: article.rating,
          date: new Date(article.publishedAt).toLocaleDateString(),
        }));
        setRecentlyAddedArticles(transformed);
        console.log('Loaded recently added from API:', transformed.length);
      }
    } catch {
      console.log('Recently added API unavailable, using mock');
    }
  };

  // Check if filters are active
  const hasActiveFilters = searchQuery.trim() !== '' || selectedCategory !== 'All';
  const hasActiveKeyboard = searchQuery.trim() !== '';

  // Hide TabBar when search/filter is active (for CustomTabBar)
  useEffect(() => {
    navigation.setOptions({
      tabBarVisible: !hasActiveKeyboard
    });
  }, [hasActiveKeyboard, navigation]);

  // Combine all data for filtering (fallback data for search)
  const allArticlesData = useMemo(() => {
    return [...recentlyAddedArticles, ...topRatedArticles];
  }, [recentlyAddedArticles, topRatedArticles]);

  // Fetch ALL articles from API (no category filter - backend doesn't support it)
  const [allFetchedArticles, setAllFetchedArticles] = useState<DisplayArticle[]>([]);
  const [isLoadingFiltered, setIsLoadingFiltered] = useState(false);

  // Google Scholar fallback state
  const [scholarResults, setScholarResults] = useState<ScholarArticle[]>([]);
  const [isSearchingScholar, setIsSearchingScholar] = useState(false);

  const fetchAllArticles = useCallback(async () => {
    setIsLoadingFiltered(true);
    setScholarResults([]); // Reset scholar results when fetching new data

    try {
      console.log('[Explore] Fetching ALL articles for filtering...');

      // Fetch ALL articles without category filter (backend doesn't work properly)
      const params: any = { page: 1, limit: 50 };
      // Only add search parameter if search query exists
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const response = await articlesApi.getArticles(params);
      const apiData = response.data?.data;

      if (apiData?.articles && apiData.articles.length > 0) {
        const transformed = apiData.articles.map((article: any) => ({
          id: article.id,
          slug: article.slug,
          image: { uri: article.imageUrl || 'https://images.unsplash.com/photo-1477332552946-cfb384aeaf1c?w=600' },
          title: article.title,
          author: article.authorName,
          category: article.category?.name || 'General',
          rating: article.rating,
          reads: `${(article.viewCount / 1000).toFixed(1)}k reads`,
        }));
        setAllFetchedArticles(transformed);
        console.log(`[Explore] ✅ Loaded ${transformed.length} articles from API`);
      } else {
        setAllFetchedArticles([]);
        console.log('[Explore] ⚠️ No articles from API');
      }
    } catch {
      console.log('[Explore] ❌ API failed, using local data');
      // Fallback to local mock data
      setAllFetchedArticles(allArticlesData);
    } finally {
      setIsLoadingFiltered(false);
    }
  }, [searchQuery, allArticlesData]);

  // Fetch articles when filters are active
  useEffect(() => {
    if (hasActiveFilters) {
      fetchAllArticles();
    }
  }, [hasActiveFilters, fetchAllArticles]);

  // Apply client-side filtering to fetched articles
  const filteredResults = useMemo(() => {
    if (!hasActiveFilters) return [];

    console.log(`[Explore Filter] Total articles: ${allFetchedArticles.length}`);
    console.log(`[Explore Filter] Selected category: "${selectedCategory}"`);
    console.log(`[Explore Filter] Search query: "${searchQuery}"`);

    // Use filterContent utility for client-side filtering
    const filtered = filterContent({
      searchQuery,
      selectedCategory,
      allData: allFetchedArticles,
    });

    console.log(`[Explore Filter] ✅ Filtered to ${filtered.length} articles`);
    return filtered;
  }, [hasActiveFilters, allFetchedArticles, searchQuery, selectedCategory]);

  // Auto-fallback to Scholar if filtered results are empty
  useEffect(() => {
    const shouldSearchScholar =
      hasActiveFilters &&
      searchQuery.trim() !== '' &&
      selectedCategory === 'All' && // Only search Scholar for "All" category
      filteredResults.length === 0 &&
      !isLoadingFiltered &&
      scholarResults.length === 0; // Prevent duplicate searches

    if (shouldSearchScholar) {
      console.log('[Explore] 🔍 No filtered results, triggering Scholar search...');
      setIsSearchingScholar(true);

      searchScholarMock(searchQuery.trim())
        .then((scholarData) => {
          setScholarResults(scholarData);
          console.log(`[Explore] ✅ Found ${scholarData.length} Scholar results`);
        })
        .catch((error) => {
          console.log('[Explore] ❌ Scholar search failed', error);
          setScholarResults([]);
        })
        .finally(() => {
          setIsSearchingScholar(false);
        });
    }

    // Reset Scholar results when there are local results
    if (filteredResults.length > 0 && scholarResults.length > 0) {
      setScholarResults([]);
    }
  }, [filteredResults, hasActiveFilters, searchQuery, selectedCategory, isLoadingFiltered, scholarResults.length]);

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
          isSearchingScholar={isSearchingScholar}
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
            isLoading={isLoadingFiltered || isSearchingScholar}
            scholarResults={scholarResults}
            isSearchingScholar={isSearchingScholar}
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
            offViewAll={true}
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
                onPress={() => setSearchQuery(topic.keyword)}
              />
            ))}
          </View>
        </View>

        {/* For You Section - Conditional based on personalization */}
        {hasPersonalizationData ? (
        <View style={styles.sectionWrapper}>
          <ForYouSection
            readingLevel={userReadingLevel}
            onChangeLevel={() => router.push('/personalization')}
          />
        </View>
        ) : (
          <View style={styles.section}>
            <PersonalizationPrompt
              showIndicator={true}
              onSetupPress={() => router.push('/personalization')}
            />
          </View>
        )}

        {/* Top Rated This Week */}
        <View style={styles.section}>
          <SectionHeader
            title="Top Rated This Week"
            icon="trophy"
            iconColor={colors.warning}
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
                onPress={() => router.push(`/article/${item.slug || item.id}` as any)}
              />
            ))}
          </View>
        </View>

        {/* Recently Added */}
        <View style={styles.section}>
          <SectionHeader
            title="Recently Added"
            icon="time"
            iconColor={colors.info}
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
                date={item.date || ''}
                onPress={() => router.push(`/article/${item.slug || item.id}` as any)}
              />
            ))}
          </View>

          {/* {recentlyAddedArticles.length > 3 && (
            <ViewAllPrompt
              count={recentlyAddedArticles.length - 3}
              label="article"
              onPress={() => console.log('View all recently added')}
            />
          )} */}
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
  topRatedList: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  recentlyAddedList: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  sectionWrapper: { 
    paddingHorizontal: Spacing.lg,
  },
});

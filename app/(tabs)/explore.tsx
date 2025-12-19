import { Colors, Spacing, Typography } from '@/constants/theme';
import {
  CategoryFilterChips,
  RecentlyAddedCard,
  SearchBar,
  SectionHeader,
  TopRatedCard,
  TrendingTopicCard,
  TrendingTopicSkeleton,
  PersonalizationPrompt,
  FilteredContentView
} from '@/features/explore/components';
import { ForYouSection } from '@/features/home/components';
import { EmptyState } from '@/features/shared/components';
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { ScrollView, StatusBar, StyleSheet, Text, View, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, router } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { articlesApi, categoriesApi, personalizationApi, searchApi, SearchResult } from '@/services';
import { ReadingLevel } from '@/constants/readingLevels';
import { filterContent } from '@/utils/filterContent';
import {
  recentlyAddedArticles as mockRecentlyAdded,
  topRatedArticles as mockTopRated,
  categoryList as mockCategoryList
} from '@/data/mock';
import { useBackgroundSimplify } from '@/features/simplify/hooks/useBackgroundSimplify';
import { useTranslation } from 'react-i18next';
import { getCategoryIcon, getCategorySolidColor, getCategoryBackgroundImage } from '@/utils/categoryIconMapping';

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
  badge?: 'new' | 'updated' | null;
}

// Trending topic type (from categories)
interface TrendingTopic {
  id: string;
  keyword: string;
  count: string;
  icon: any;
  backgroundColor: string;
  backgroundImage?: any;
}

export default function ExploreScreen() {
  const { t } = useTranslation();
  const colors = Colors.light;
  const navigation = useNavigation();
  const { startSimplification } = useBackgroundSimplify();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [topRatedArticles, setTopRatedArticles] = useState<DisplayArticle[]>(mockTopRated);
  const [recentlyAddedArticles, setRecentlyAddedArticles] = useState<DisplayArticle[]>(mockRecentlyAdded);
  const [categoryList, setCategoryList] = useState<string[]>(mockCategoryList);

  // Trending topics state (dynamic from API)
  const [trendingTopics, setTrendingTopics] = useState<TrendingTopic[]>([]);
  const [isLoadingTrending, setIsLoadingTrending] = useState(true);

  // Dynamic personalization state - fetched from API
  const [hasPersonalizationData, setHasPersonalizationData] = useState(false);
  const [userReadingLevel, setUserReadingLevel] = useState<ReadingLevel>('student');

  // Fetch ALL articles from API for filtering (instant category filter)
  const [allFetchedArticles, setAllFetchedArticles] = useState<DisplayArticle[]>([]);
  const [isLoadingFiltered, setIsLoadingFiltered] = useState(false);
  const [isLoadingCategory, setIsLoadingCategory] = useState(false);
  const [hasFetchedArticles, setHasFetchedArticles] = useState(false); // Track if articles have been fetched

  // External search results (OpenAlex + Scholar) state
  const [externalResults, setExternalResults] = useState<SearchResult[]>([]);
  const [isSearchingExternal, setIsSearchingExternal] = useState(false);

  // Track if user has initiated search (button click or Enter)
  const [hasSearched, setHasSearched] = useState(false);

  // Pagination state for external search
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Check personalization status from API
  const checkPersonalizationStatus = useCallback(async () => {
    try {
      const response = await personalizationApi.getSettings();

      if (response.data?.data && response.data.data.readingLevel) {
        const readingLevel = response.data.data.readingLevel.toLowerCase() as ReadingLevel;
        setUserReadingLevel(readingLevel);
        setHasPersonalizationData(true);
      } else {
        setHasPersonalizationData(false);
      }
    } catch {
      setHasPersonalizationData(false);
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
      // Auto-refresh data sections when screen is focused
      fetchRecentlyAdded();
      fetchTopRated();
    }, [checkPersonalizationStatus])
  );

  // Auto-fetch internal articles when category changes (for instant filtering)
  useEffect(() => {
    if (selectedCategory !== 'All') {
      // Only fetch if not already fetched (caching)
      if (!hasFetchedArticles) {
        // Fetch articles in background for instant category filtering
        const fetchForCategory = async () => {
          setIsLoadingCategory(true);
          try {
            const params: any = { page: 1, limit: 50 };
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
                reads: article.viewCount >= 1000
                  ? `${(article.viewCount / 1000).toFixed(1)}k reads`
                  : `${article.viewCount || 0} reads`,
              }));
              setAllFetchedArticles(transformed);
              setHasFetchedArticles(true); // Mark as fetched
            } else {
              setAllFetchedArticles([]);
              setHasFetchedArticles(true);
            }
          } catch {
            setAllFetchedArticles([]);
            setHasFetchedArticles(true);
          } finally {
            setIsLoadingCategory(false);
          }
        };
        fetchForCategory();
      } else {
        // Already have data, no need to show loading
        setIsLoadingCategory(false);
      }
    } else {
      // Reset when "All" is selected
      setIsLoadingCategory(false);
    }
  }, [selectedCategory, hasFetchedArticles]);

  const fetchCategories = async () => {
    setIsLoadingTrending(true);
    try {
      const response = await categoriesApi.getAll();
      const categoriesData = response.data?.data || response.data;

      if (categoriesData && Array.isArray(categoriesData)) {
        const categoryNames = ['All', ...categoriesData.map((cat: any) => cat.name)];
        setCategoryList(categoryNames);

        // Transform categories to trending topics (top 4 by articleCount)
        // Note: API returns _count.articles, not articleCount
        const sortedCategories = [...categoriesData]
          .map((cat: any) => ({
            ...cat,
            articleCount: cat._count?.articles || cat.articleCount || 0
          }))
          .filter((cat: any) => cat.articleCount > 0) // Only categories with articles
          .sort((a: any, b: any) => b.articleCount - a.articleCount)
          .slice(0, 4); // Get top 4

        const trending: TrendingTopic[] = sortedCategories.map((cat: any) => ({
          id: cat.id,
          keyword: cat.name,
          count: cat.articleCount === 1
            ? '1 article'
            : `${cat.articleCount} articles`,
          icon: getCategoryIcon(cat.name),
          backgroundColor: getCategorySolidColor(cat.name),
          backgroundImage: getCategoryBackgroundImage(cat.name),
        }));

        setTrendingTopics(trending);
      }
    } catch {
      // Use mock data - keep empty array, will use fallback in render
    } finally {
      setIsLoadingTrending(false);
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
      }
    } catch {
      // Use mock data
    }
  };

  const fetchRecentlyAdded = async () => {
    try {
      const response = await articlesApi.getRecent({ page: 1, limit: 5 });
      const apiData = response.data?.data;
      if (apiData?.articles?.length > 0) {
        const transformed = apiData.articles.map((article: any) => {
          const publishedDate = new Date(article.publishedAt);
          const now = new Date();
          const hoursDiff = (now.getTime() - publishedDate.getTime()) / (1000 * 60 * 60);
          
          // Show NEW badge if article is less than 24 hours old
          const badge: 'new' | 'updated' | null = hoursDiff < 24 ? 'new' : null;
          
          return {
            id: article.id,
            slug: article.slug,
            image: { uri: article.imageUrl || 'https://images.unsplash.com/photo-1477332552946-cfb384aeaf1c?w=600' },
            title: article.title,
            author: article.authorName,
            category: article.category?.name || 'General',
            rating: article.rating,
            date: new Date(article.publishedAt).toLocaleDateString(),
            badge: badge,
          };
        });
        setRecentlyAddedArticles(transformed);
      }
    } catch {
      // Use mock data
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



  const fetchAllArticles = useCallback(async () => {
    setIsLoadingFiltered(true);
    setIsSearchingExternal(true);

    try {
      const params: any = { page: 1, limit: 50 };
      const internalResponse = await articlesApi.getArticles(params);
      const apiData = internalResponse.data?.data;

      if (apiData?.articles && apiData.articles.length > 0) {
        const transformed = apiData.articles.map((article: any) => ({
          id: article.id,
          slug: article.slug,
          image: { uri: article.imageUrl || 'https://images.unsplash.com/photo-1477332552946-cfb384aeaf1c?w=600' },
          title: article.title,
          author: article.authorName,
          category: article.category?.name || 'General',
          rating: article.rating,
          reads: article.viewCount >= 1000
            ? `${(article.viewCount / 1000).toFixed(1)}k reads`
            : `${article.viewCount || 0} reads`,
        }));
        setAllFetchedArticles(transformed);
      } else {
        setAllFetchedArticles([]);
      }

      if (searchQuery.trim()) {
        const externalResponse = await searchApi.search(searchQuery.trim(), {
          sources: 'auto',
          page: 1,
          limit: 20
        });

        const external = externalResponse.data.results.filter(r => r.source !== 'internal');
        setExternalResults(external);
        setHasMore(externalResponse.data.meta.hasMore);
        setCurrentPage(1);
      } else {
        setExternalResults([]);
        setHasMore(true);
      }

    } catch {
      setAllFetchedArticles(allArticlesData);
      setExternalResults([]);
    } finally {
      setIsLoadingFiltered(false);
      setIsSearchingExternal(false);
    }
  }, [searchQuery, allArticlesData]);

  // Manual search function - triggered by button/Enter only
  const handleSearch = useCallback(() => {
    if (searchQuery.trim() || selectedCategory !== 'All') {
      setHasSearched(true);
      setCurrentPage(1); // Reset to page 1 on new search
      setHasMore(true);
      setExternalResults([]); // Clear previous external results
      fetchAllArticles();
    }
  }, [searchQuery, selectedCategory, fetchAllArticles]);

  // Instant category filtering for better UX (like popular-articles)
  // Search query still requires button click (for external search)
  
  // Apply client-side filtering to fetched articles
  const filteredResults = useMemo(() => {
    // If loading, return empty array (will show skeleton)
    if (isLoadingCategory) {
      return [];
    }

    // If no search triggered but category selected, show instant filtered results
    if (!hasSearched && selectedCategory !== 'All') {
      return filterContent({
        searchQuery: '',
        selectedCategory,
        allData: allFetchedArticles,
      });
    }

    // If search was triggered, apply both filters
    if (hasSearched && hasActiveFilters) {
      return filterContent({
        searchQuery,
        selectedCategory,
        allData: allFetchedArticles,
      });
    }

    return [];
  }, [hasSearched, hasActiveFilters, allFetchedArticles, searchQuery, selectedCategory, isLoadingCategory]);

  // Note: External search is now fetched together with internal search in fetchAllArticles()
  // No need for separate auto-fallback logic

  // Load more external results (infinite scroll)
  const handleLoadMore = useCallback(async () => {
    if (!hasMore || isLoadingMore || isSearchingExternal) {
      return;
    }

    const nextPage = currentPage + 1;
    setIsLoadingMore(true);

    try {
      const response = await searchApi.search(searchQuery.trim(), {
        sources: 'auto',
        page: nextPage,
        limit: 20
      });

      const external = response.data.results.filter(r => r.source !== 'internal');
      setExternalResults(prev => [...prev, ...external]);
      setHasMore(response.data.meta.hasMore);
      setCurrentPage(nextPage);
    } catch {
      setHasMore(false);
    } finally {
      setIsLoadingMore(false);
    }
  }, [hasMore, isLoadingMore, isSearchingExternal, currentPage, searchQuery]);

  // Handlers
  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setHasSearched(false);
    setExternalResults([]);
    setCurrentPage(1);
    setHasMore(true);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setHasSearched(false);
    setExternalResults([]);
    setCurrentPage(1);
    setHasMore(true);
  };

  const handleClearCategory = () => {
    setSelectedCategory('All');
    setAllFetchedArticles([]); // Clear fetched articles
    setHasSearched(false); // Reset search state
    setExternalResults([]); // Clear external results
  };

  // Handler for category selection with loading state
  const handleCategorySelect = (category: string) => {
    // If not already fetched and selecting a specific category, show loading immediately
    if (category !== 'All' && !hasFetchedArticles) {
      setIsLoadingCategory(true);
    }
    setSelectedCategory(category);
    setSearchQuery(''); // Clear search query when selecting category
    setHasSearched(false); // Reset search state
  };

  // Handle background simplification for external papers
  const handleSimplifyExternalPaper = useCallback(async (paper: SearchResult) => {
    // Map reading level from user preference
    const readingLevelMap: Record<ReadingLevel, 'SIMPLE' | 'STUDENT' | 'ACADEMIC' | 'EXPERT'> = {
      simple: 'SIMPLE',
      student: 'STUDENT',
      academic: 'ACADEMIC',
      expert: 'EXPERT',
    };

    await startSimplification({
      externalId: paper.id, // SearchResult uses 'id' field
      source: paper.source as 'openalex' | 'scholar', // Ensure source is correct
      title: paper.title,
      authors: paper.authors || [], // Required field
      year: paper.year || new Date().getFullYear(), // Required field, fallback to current year
      abstract: paper.excerpt || undefined, // Use excerpt as abstract
      pdfUrl: paper.pdfUrl || undefined,
      landingPageUrl: paper.link || undefined,
      doi: paper.doi || undefined,
      readingLevel: readingLevelMap[userReadingLevel],
      citationCount: paper.citations || 0,
      rating: paper.rating || 0,
      categoryName: undefined, // Can be added later if needed
    });
  }, [startSimplification, userReadingLevel]);

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
        <Text style={[styles.headerTitle, { color: colors.text }]}>{t('explore.title')}</Text>
        <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
          {t('explore.subtitle')}
        </Text>
      </View>

      {/* Search Bar - Fixed */}
      <View style={[styles.searchBarContainer, { backgroundColor: colors.background }]}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSearch={handleSearch}
          onClear={handleClearSearch}
          placeholder={t('explore.searchPlaceholder')}
          isSearchingScholar={isSearchingExternal}
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
          onSelectCategory={handleCategorySelect}
        />


        {/* CONDITIONAL RENDERING: Filtered View vs Empty State vs Default View */}
        {/* Show filtered view if: category selected OR search triggered */}
        {selectedCategory !== 'All' || hasSearched ? (
          // Category is selected or search is triggered
          isLoadingCategory || isLoadingFiltered ? (
            // ========== LOADING STATE (Show Skeleton) ==========
            <FilteredContentView
              results={[]}
              searchQuery={searchQuery}
              selectedCategory={selectedCategory}
              onClearFilters={handleClearFilters}
              onClearSearch={handleClearSearch}
              onClearCategory={handleClearCategory}
              isLoading={true}
              externalResults={[]}
              hasMore={false}
              onLoadMore={handleLoadMore}
              isLoadingMore={false}
              onSimplifyExternal={handleSimplifyExternalPaper}
            />
          ) : filteredResults.length > 0 || externalResults.length > 0 ? (
            // ========== FILTERED VIEW (Has Results) ==========
            <FilteredContentView
              results={filteredResults}
              searchQuery={searchQuery}
              selectedCategory={selectedCategory}
              onClearFilters={handleClearFilters}
              onClearSearch={handleClearSearch}
              onClearCategory={handleClearCategory}
              isLoading={false}
              externalResults={externalResults}
              hasMore={hasMore}
              onLoadMore={handleLoadMore}
              isLoadingMore={isLoadingMore}
              onSimplifyExternal={handleSimplifyExternalPaper}
            />
          ) : (
            // ========== EMPTY STATE (No results after loading) ==========
            <View style={{ paddingVertical: Spacing['4xl'] }}>
              <EmptyState
                icon="search-outline"
                title={t('explore.emptyState.title')}
                message={t('explore.emptyState.message', { category: selectedCategory })}
                actionLabel={t('explore.emptyState.clearFilter')}
                actionIcon="close-circle"
                onActionPress={handleClearCategory}
              />
            </View>
          )
        ) : (
          // ========== DEFAULT VIEW ==========
          <>
            {/* Trending Topics */}
            <View style={styles.section}>
              <SectionHeader
                title={t('explore.trendingNow')}
                icon="flame"
                iconColor={colors.error}
                offViewAll={true}
                onViewAllPress={() => {}}
              />

              <View style={styles.trendingGrid}>
                {isLoadingTrending ? (
                  // Show skeleton while loading
                  <>
                    <TrendingTopicSkeleton />
                    <TrendingTopicSkeleton />
                    <TrendingTopicSkeleton />
                    <TrendingTopicSkeleton />
                  </>
                ) : trendingTopics.length > 0 ? (
                  // Show actual trending topics
                  trendingTopics.slice(0, 4).map((topic) => (
                    <TrendingTopicCard
                      key={topic.id}
                      keyword={topic.keyword}
                      count={topic.count}
                      icon={topic.icon}
                      backgroundColor={topic.backgroundColor}
                      backgroundImage={topic.backgroundImage}
                      onPress={() => handleCategorySelect(topic.keyword)}
                    />
                  ))
                ) : null}
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
            title={t('explore.topRatedThisWeek')}
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
            title={t('explore.recentlyAdded')}
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
                badge={item.badge}
                onPress={() => router.push(`/article/${item.slug || item.id}` as any)}
              />
            ))}
          </View>

          {/* {recentlyAddedArticles.length > 3 && (
            <ViewAllPrompt
              count={recentlyAddedArticles.length - 3}
              label="article"
              onPress={() => {}}
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

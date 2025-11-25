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
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { ScrollView, StatusBar, StyleSheet, Text, View, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, router } from 'expo-router';
import { filterContent } from '@/utils/filterContent';
import { articlesApi } from '@/services';
import {
  trendingTopics,
  forYouArticles,
  recentlyAddedArticles as mockRecentlyAdded,
  topRatedArticles as mockTopRated,
  categoryList
} from '@/data/mock';

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

  const hasPersonalizationData = false;

  // Fetch data from API on mount
  useEffect(() => {
    fetchTopRated();
    fetchRecentlyAdded();
  }, []);

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

  // Combine all data for filtering
  const allArticlesData = useMemo(() => {
    return [...forYouArticles, ...recentlyAddedArticles];
  }, [recentlyAddedArticles]);

  // Fetch filtered articles from API
  const [filteredArticles, setFilteredArticles] = useState<DisplayArticle[]>([]);

  const fetchFilteredArticles = useCallback(async () => {
    try {
      const params: any = { page: 1, limit: 20 };
      if (searchQuery.trim()) params.search = searchQuery.trim();
      if (selectedCategory !== 'All') params.category = selectedCategory;

      const response = await articlesApi.getArticles(params);
      const apiData = response.data?.data;

      if (apiData?.articles) {
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
        setFilteredArticles(transformed);
        console.log('Filtered articles from API:', transformed.length);
      } else {
        setFilteredArticles([]);
      }
    } catch {
      console.log('Search/filter API failed, using local filter');
      // Fallback to local filtering
      const localResults = filterContent({
        searchQuery,
        selectedCategory,
        allData: allArticlesData,
      });
      setFilteredArticles(localResults);
    }
  }, [searchQuery, selectedCategory, allArticlesData]);

  useEffect(() => {
    if (hasActiveFilters) {
      fetchFilteredArticles();
    } else {
      setFilteredArticles([]);
    }
  }, [hasActiveFilters, fetchFilteredArticles]);

  // Filter results based on search and category
  const filteredResults = useMemo(() => {
    if (!hasActiveFilters) return [];
    return filteredArticles;
  }, [hasActiveFilters, filteredArticles]);

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
                  onPress={() => router.push(`/article/${(item as any).slug || item.id}` as any)}
                />
              ))}
            </ScrollView>
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

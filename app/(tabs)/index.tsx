import { Colors, Spacing } from '@/constants/theme';
import {
  CategoryCard,
  HeroBanner,
  PersonalizationCard,
  SectionHeader,
  ForYouSection
} from '@/features/home/components';
import { CardArticle } from '@/features/shared/components/CardArticle';
import { NotificationModal } from '@/features/shared/components/NotificationModal';
import React, { useEffect, useState, useCallback } from 'react';
import { ScrollView, StatusBar, StyleSheet, Text, View, ActivityIndicator, NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GreetingsCard } from '@/features/home/components/GreetingsCard';
import { categoryCards as mockCategoryCards, popularArticles, notifications, getUnreadCount } from '@/data/mock';
import { getProfile, User } from '@/services/auth';
import { articlesApi, categoriesApi, personalizationApi } from '@/services';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { ReadingLevel } from '@/constants/readingLevels';

// Article type for display
interface DisplayArticle {
  id: string | number;
  slug?: string;
  image: any;
  title: string;
  author: string;
  category: string;
  rating: number;
  reads: string;
  badge?: string;
}

export default function HomeScreen() {
  const colors = Colors.light;
  const [user, setUser] = useState<User | null>(null);

  // Popular articles state
  const INITIAL_LOAD = 5;
  const [displayedArticles, setDisplayedArticles] = useState<DisplayArticle[]>(popularArticles.slice(0, INITIAL_LOAD));
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMoreArticles, setHasMoreArticles] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [isUsingApi, setIsUsingApi] = useState(false);

  // Categories state
  const [categoryCards, setCategoryCards] = useState(mockCategoryCards);

  // First-time user indicator state
  const [showPersonalizationIndicator, setShowPersonalizationIndicator] = useState(false);

  // Personalization state - dynamically fetched from API
  const [hasCompletedPersonalization, setHasCompletedPersonalization] = useState(false);
  const [userReadingLevel, setUserReadingLevel] = useState<ReadingLevel>('student');

  // Notification modal state
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const unreadCount = getUnreadCount();

  // Icon mapping for categories
  const categoryIconMap: { [key: string]: any } = {
    Finance: require('@/assets/images/icon-categories/finance.png'),
    Health: require('@/assets/images/icon-categories/health.png'),
    Business: require('@/assets/images/icon-categories/business.png'),
    Science: require('@/assets/images/icon-categories/science.png'),
    Technology: require('@/assets/images/icon-categories/technology.png'),
    Education: require('@/assets/images/icon-categories/education.png'),
    Environment: require('@/assets/images/icon-categories/environment.png'),
    Social: require('@/assets/images/icon-categories/social.png'),
  };

  // Fetch categories from API
  const fetchCategories = async () => {
    try {
      console.log('=================================');
      console.log('[Categories API] 🚀 Starting fetch...');
      console.log('[Categories API] Current state:', categoryCards.length, 'categories');

      const response = await categoriesApi.getAll();
      console.log('[Categories API] 📦 Raw response received');
      console.log('[Categories API] Response structure:', {
        hasData: !!response.data,
        dataKeys: response.data ? Object.keys(response.data) : [],
      });

      const categoriesData = response.data?.data || response.data;
      console.log('[Categories API] Categories data:', {
        isArray: Array.isArray(categoriesData),
        length: categoriesData?.length,
      });

      if (categoriesData && Array.isArray(categoriesData)) {
        console.log('[Categories API] First raw category:', categoriesData[0]);

        // Transform API response to match mock structure with icons
        const transformedCategories = categoriesData.map((cat: any) => ({
          id: cat.id, // Use UUID from API
          slug: cat.slug, // Keep slug for routing
          icon: categoryIconMap[cat.name] || categoryIconMap['Science'], // fallback icon
          label: cat.name,
        }));

        console.log('[Categories API] 🔄 Transformed categories:', transformedCategories.length);
        console.log('[Categories API] First transformed:', transformedCategories[0]);

        setCategoryCards(transformedCategories);
        console.log('[Categories API] ✅ State updated successfully!');
      } else {
        console.log('[Categories API] ⚠️ Invalid data structure, keeping mock');
      }
      console.log('=================================');
    } catch (error: any) {
      console.log('=================================');
      console.log('[Categories API] ❌ API unavailable, using mock data');
      console.log('[Categories API] Error message:', error?.message || 'Unknown error');
      console.log('[Categories API] Error details:', error);
      console.log('=================================');
    }
  };

  // Check personalization status from API
  const checkPersonalizationStatus = async () => {
    try {
      console.log('[Personalization Status] Checking...');
      const response = await personalizationApi.getSettings();
      console.log('[Personalization Status] Response:', response.data);

      if (response.data?.data && response.data.data.readingLevel) {
        // User has completed personalization
        const readingLevel = response.data.data.readingLevel.toLowerCase() as ReadingLevel;
        setUserReadingLevel(readingLevel);
        setHasCompletedPersonalization(true);
        console.log('[Personalization Status] ✅ Completed - Level:', readingLevel);
      } else {
        // User hasn't completed personalization
        setHasCompletedPersonalization(false);
        console.log('[Personalization Status] ❌ Not completed');
      }
    } catch (error) {
      // API error or user not found - assume not completed
      setHasCompletedPersonalization(false);
      console.log('[Personalization Status] ❌ Error or not found, showing PersonalizationCard');
    }
  };

  // Load user and popular articles on initial mount
  useEffect(() => {
    loadUser();
    checkFirstTimeUser();
    checkPersonalizationStatus();
    fetchCategories();
    fetchPopularArticles();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch popular articles from API with fallback to mock
  const fetchPopularArticles = async () => {
    console.log('Fetching popular articles...');
    try {
      const response = await articlesApi.getPopular({ page: 1, limit: INITIAL_LOAD });
      console.log('API Response:', response.data);
      const apiData = response.data?.data;
      if (apiData?.articles?.length > 0) {
        // Transform API response to match mock data structure
        const articles = apiData.articles.map((article: any) => ({
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
        setDisplayedArticles(articles);
        setIsUsingApi(true);
        setHasMoreArticles(apiData.pagination.page < apiData.pagination.totalPages);
        console.log('Loaded popular articles from API:', articles.length);
      }
    } catch {
      // Fallback to mock data (already set as default)
      console.log('API unavailable, using mock data for popular articles');
      setHasMoreArticles(popularArticles.length > INITIAL_LOAD);
    }
  };

  // Check if this is first-time user
  const checkFirstTimeUser = async () => {
    try {
      // TEMPORARY: Show for ALL users (for testing)
      // TODO: Uncomment line below to enable first-time user detection
      // const hasSeenTutorial = await AsyncStorage.getItem('hasSeenPersonalizationTutorial');
      // if (!hasSeenTutorial) {
        setShowPersonalizationIndicator(true);
      // }
    } catch (error) {
      console.error('Error checking first-time user:', error);
    }
  };

  const loadUser = async () => {
    const profile = await getProfile();
    if (profile) {
      setUser(profile);
    }
  };

  const checkAndReloadUser = useCallback(async () => {
    try {
      // Get stored user data from AsyncStorage
      const storedUser = await AsyncStorage.getItem('user');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);

        // Only update if data is different (check by comparing relevant fields)
        if (
          !user ||
          user.fullName !== parsedUser.fullName ||
          user.nickname !== parsedUser.nickname ||
          user.avatarUrl !== parsedUser.avatarUrl
        ) {
          setUser(parsedUser);
        } else {
          // No changes detected, skipping reload
        }
      }
    } catch {
      // Ignore errors checking user data
    }
  }, [user]);

  // Reload user data and personalization status when screen is focused
  useFocusEffect(
    useCallback(() => {
      checkAndReloadUser();
      // Re-check personalization status when returning from personalization screen
      checkPersonalizationStatus();
    }, [checkAndReloadUser])
  );

  // Load more articles (API or mock)
  const loadMoreArticles = useCallback(async () => {
    if (isLoadingMore || !hasMoreArticles) return;

    setIsLoadingMore(true);

    if (isUsingApi) {
      // Load from API
      try {
        const nextPage = currentPage + 1;
        const response = await articlesApi.getPopular({ page: nextPage, limit: 5 });
        const apiData = response.data?.data;
        if (apiData?.articles?.length > 0) {
          const articles = apiData.articles.map((article: any) => ({
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
          setDisplayedArticles(prev => [...prev, ...articles]);
          setCurrentPage(nextPage);
          setHasMoreArticles(nextPage < apiData.pagination.totalPages);
        }
      } catch {
        setHasMoreArticles(false);
      }
    } else {
      // Load from mock data
      await new Promise(resolve => setTimeout(resolve, 300));
      const currentLength = displayedArticles.length;
      const nextBatch = popularArticles.slice(currentLength, currentLength + 5);

      if (nextBatch.length > 0) {
        setDisplayedArticles(prev => [...prev, ...nextBatch]);
        setHasMoreArticles(currentLength + nextBatch.length < popularArticles.length);
      } else {
        setHasMoreArticles(false);
      }
    }

    setIsLoadingMore(false);
  }, [isLoadingMore, hasMoreArticles, isUsingApi, currentPage, displayedArticles.length]);

  // Detect when user scrolls near the end of horizontal ScrollView
  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const paddingToEnd = 100; // Trigger sebelum sampai ujung

    // Check if scrolled near the end
    if (layoutMeasurement.width + contentOffset.x >= contentSize.width - paddingToEnd) {
      loadMoreArticles();
    }
  };

  // Priority: nickname > first name from fullName > 'there'
  const displayName = user?.nickname || user?.fullName.split(' ')[0] || 'there';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      <View style={styles.header}>
        <GreetingsCard
          title={`Hello, ${displayName}🖐️`}
          subtitle={'What do you want to learn today?'}
          onPress={() => setShowNotificationModal(true)}
          unreadCount={unreadCount}
        />
      </View>

      {/* Notification Modal */}
      <NotificationModal
        visible={showNotificationModal}
        onClose={() => setShowNotificationModal(false)}
        notifications={notifications}
      />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >

        {/* Hero Banner - Large with Gradient */}
        <View style={styles.heroSection}>
          <HeroBanner
            title={'Discover Your Next\nResearch Journey'}
            subtitle="Transform complex journals into engaging learning"
            onPress={() => console.log('Hero banner pressed')}
          />
        </View>

        {/* Personalization Card OR For You Section */}
        {hasCompletedPersonalization ? (
          <ForYouSection
            readingLevel={userReadingLevel}
            onChangeLevel={() => router.push('/personalization')}
          />
        ) : (
          <PersonalizationCard
            showIndicator={showPersonalizationIndicator}
            onPress={() => router.push('/personalization')}
            style={styles.personalizationSection}
          />
        )}


        {/* Categories Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Categories</Text>

          <View style={styles.categoryGrid}>
            {categoryCards.slice(0, 8).map((category) => (
              <CategoryCard
                key={category.id}
                icon={category.icon}
                label={category.label}
                onPress={() => {
                  const routePath = (category as any).slug
                    ? `/category/${(category as any).slug}`
                    : `/category/${category.label}`;
                  router.push(routePath as any);
                }}
              />
            ))}
          </View>
        </View>

        {/* Most Popular Section - Optimized with Lazy Loading */}
        <View style={styles.section}>
          <SectionHeader
            title="Most Popular"
            actionText="View All"
            onActionPress={() => router.push('/popular-articles')}
          />

            <View style={styles.popularScrollWrapper}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.popularScrollContent}
                onScroll={handleScroll}
                scrollEventThrottle={16}
              >
                {displayedArticles.map((article, index) => (
                  <View key={`${article.id}-${index}`} style={styles.popularCardWrapper}>
                    {article.badge && (
                      <View style={[styles.bestSellerBadge, { backgroundColor: colors.primary }]}>
                        <Text style={[styles.bestSellerText, { color: colors.text }]}>
                          {article.badge}
                        </Text>
                      </View>
                    )}
                    <CardArticle
                      image={article.image}
                      title={article.title}
                      author={article.author}
                      category={article.category}
                      rating={article.rating}
                      reads={article.reads}
                      onPress={() => router.push(`/article/${article.slug || article.id}` as any)}
                    />
                  </View>
                ))}

                {/* Loading indicator saat load more */}
                {isLoadingMore && (
                  <View style={styles.loadingWrapper}>
                    <ActivityIndicator size="small" color={colors.primary} />
                  </View>
                )}

                {/* Placeholder skeleton untuk artikel yang belum di-load */}
                {!isLoadingMore && hasMoreArticles && (
                  <View style={styles.skeletonWrapper}>
                    <View style={[styles.skeletonCard, { backgroundColor: colors.border }]} />
                  </View>
                )}
              </ScrollView>
            </View>
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
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xs,
    paddingBottom: Spacing.md,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: 30,
  },
  heroSection: {
    marginBottom: Spacing.lg,
  },
  continueLearningSection: {
    marginBottom: Spacing.lg,
  },
  personalizationSection: {
    marginBottom: Spacing.lg,
  },
  section: {
    marginBottom: Spacing.xs,
  },
  sectionTitle: {
    fontSize: 20,
  fontWeight: '700' as const,
    marginBottom: Spacing.md,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  // Popular Section Styles
  popularScrollWrapper: {
    marginHorizontal: -Spacing.lg,
    
  },
  popularScrollContent: {
    paddingLeft: Spacing.lg,
    paddingRight: Spacing.xl,
    paddingVertical: Spacing.sm,
    gap: Spacing.lg,
  },
  popularCardWrapper: {
    position: 'relative',
    width: 280,
  },
  bestSellerBadge: {
    position: 'absolute' as const,
    top: 12,
    left: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    zIndex: 10,
  },
  bestSellerText: {
    fontSize: 10,
    fontWeight: '600' as const,
  },
  // Loading & Skeleton Styles
  loadingWrapper: {
    width: 240,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  skeletonWrapper: {
    width: 240,
  },
  skeletonCard: {
    width: 240,
    height: 320,
    borderRadius: 16,
    opacity: 0.3,
  },
});

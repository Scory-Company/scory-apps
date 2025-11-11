import { Colors, Spacing } from '@/constants/theme';
import {
  CategoryCard,
  HeroBanner,
  PersonalizationCard,
  SectionHeader
} from '@/features/home/components';
import { CardArticle } from '@/features/shared/components/CardArticle';
import React, { useEffect, useState, useCallback } from 'react';
import { ScrollView, StatusBar, StyleSheet, Text, View, ActivityIndicator, NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GreetingsCard } from '@/features/home/components/GreetingsCard';
import { categoryCards, popularArticles } from '@/data/mock';
import { getProfile, User } from '@/services/auth';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function HomeScreen() {
  const colors = Colors.light;
  const [user, setUser] = useState<User | null>(null);

  // Lazy loading state for popular articles
  const INITIAL_LOAD = 5; // Load 5 items first for fast initial render
  const [displayedArticles, setDisplayedArticles] = useState(popularArticles.slice(0, INITIAL_LOAD));
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMoreArticles, setHasMoreArticles] = useState(popularArticles.length > INITIAL_LOAD);

  // First-time user indicator state
  const [showPersonalizationIndicator, setShowPersonalizationIndicator] = useState(false);

  // Load user on initial mount
  useEffect(() => {
    loadUser();
    checkFirstTimeUser();
  }, []);

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

  // Handle personalization card click
  const handlePersonalizationClick = async () => {
    setShowPersonalizationIndicator(false);
    try {
      await AsyncStorage.setItem('hasSeenPersonalizationTutorial', 'true');
      // Execute personalization action
      console.log('Start personalization');
    } catch (error) {
      console.error('Error saving tutorial state:', error);
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

  // Reload user data only when screen is focused AND data might have changed
  useFocusEffect(
    useCallback(() => {
      checkAndReloadUser();
    }, [checkAndReloadUser])
  );

  // Simulate lazy loading - load more articles
  const loadMoreArticles = useCallback(() => {
    if (isLoadingMore || !hasMoreArticles) return;

    setIsLoadingMore(true);

    // Simulate API delay (300ms untuk UX yang smooth)
    setTimeout(() => {
      const currentLength = displayedArticles.length;
      const nextBatch = popularArticles.slice(currentLength, currentLength + 5);

      if (nextBatch.length > 0) {
        setDisplayedArticles(prev => [...prev, ...nextBatch]);
        setHasMoreArticles(currentLength + nextBatch.length < popularArticles.length);
      } else {
        setHasMoreArticles(false);
      }

      setIsLoadingMore(false);
    }, 300);
  }, [isLoadingMore, hasMoreArticles, displayedArticles.length]);

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
        onPress={() => console.log('Notifications pressed')}
        />
      </View>

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

        {/* Personalization Card */}
        <PersonalizationCard
          showIndicator={showPersonalizationIndicator}
          onPress={handlePersonalizationClick}
          style={styles.personalizationSection}
        />


        {/* Categories Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Categories</Text>

          <View style={styles.categoryGrid}>
            {categoryCards.map((category) => (
              <CategoryCard
                key={category.id}
                icon={category.icon}
                label={category.label}
                onPress={() => console.log(`${category.label} pressed`)}
              />
            ))}
          </View>
        </View>

        {/* Most Popular Section - Optimized with Lazy Loading */}
        <View style={styles.section}>
          <SectionHeader
            title="Most Popular"
            actionText="View All"
            onActionPress={() => console.log('View all popular')}
          />

          <View style={styles.popularScrollWrapper}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.popularScrollContent}
              onScroll={handleScroll}
              scrollEventThrottle={16}
            >
              {displayedArticles.map((article) => (
                <View key={article.id} style={styles.popularCardWrapper}>
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
                    onPress={() => console.log(`${article.title} pressed`)}
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
    gap: Spacing['2xl'],
  },
  popularCardWrapper: {
    position: 'relative',
    width: 240,
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

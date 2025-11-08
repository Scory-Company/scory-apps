import { Colors, Spacing } from '@/constants/theme';
import {
  CategoryCard,
  HeroBanner,
  PersonalizationCard,
  SectionHeader,
  TrendingCard
} from '@/features/home/components';
import React from 'react';
import { ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const colors = Colors.light;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header with Gamification */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={[styles.greeting, { color: colors.text }]}>Hello, Habdil 👋</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              What do you want to learn today?
            </Text>
          </View>
          {/* <XPBadge level={4} xp={320} /> */}
        </View>

        {/* Hero Banner - Large with Gradient */}
        <View style={styles.heroSection}>
          <HeroBanner
            badge="Featured"
            title={'Discover Your Next\nResearch Journey'}
            subtitle="Transform complex journals into engaging learning"
            onPress={() => console.log('Hero banner pressed')}
          />
        </View>

        {/* Continue Learning - Compact Horizontal */}
        {/* <View style={styles.continueLearningSection}>
          <ContinueLearningCard
            image={require('@/assets/images/dummy/news/mental-health.png')}
            title="Mental Health in Digital Age"
            lastAccessed="Continue learning"
            progress={62}
            currentPage={11}
            totalPages={18}
            onPress={() => console.log('Continue learning pressed')}
          />
        </View> */}

        {/* Personalization Card */}
        <View style={styles.personalizationSection}>
          <PersonalizationCard onPress={() => console.log('Start personalization')} />
        </View>

        {/* Categories Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Categories</Text>

          <View style={styles.categoryGrid}>
            <CategoryCard
              icon={require('@/assets/images/icon-categories/finance.png')}
              label="Finance"
              onPress={() => console.log('Finance pressed')}
            />
            <CategoryCard
              icon={require('@/assets/images/icon-categories/health.png')}
              label="Health"
              onPress={() => console.log('Health pressed')}
            />
            <CategoryCard
              icon={require('@/assets/images/icon-categories/business.png')}
              label="Business"
              onPress={() => console.log('Business pressed')}
            />
            <CategoryCard
              icon={require('@/assets/images/icon-categories/science.png')}
              label="Science"
              onPress={() => console.log('Science pressed')}
            />
            <CategoryCard
              icon={require('@/assets/images/icon-categories/technology.png')}
              label="Technology"
              onPress={() => console.log('Technology pressed')}
            />
            <CategoryCard
              icon={require('@/assets/images/icon-categories/education.png')}
              label="Education"
              onPress={() => console.log('Education pressed')}
            />
            <CategoryCard
              icon={require('@/assets/images/icon-categories/environment.png')}
              label="Environment"
              onPress={() => console.log('Environment pressed')}
            />
            <CategoryCard
              icon={require('@/assets/images/icon-categories/social.png')}
              label="Social"
              onPress={() => console.log('Social pressed')}
            />
          </View>
        </View>

        {/* Most Popular Section */}
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
            >
            <View style={styles.popularCardWrapper}>
              <View style={[styles.bestSellerBadge, { backgroundColor: 'rgba(0, 0, 0, 0.7)' }]}>
                <Text style={styles.bestSellerText}>Trending</Text>
              </View>
              <TrendingCard
                image={require('@/assets/images/dummy/news/education.png')}
                title="AI Revolution in Healthcare"
                duration="15 min"
                pages={25}
                onPress={() => console.log('Popular 1 pressed')}
              />
            </View>

            <View style={styles.popularCardWrapper}>
              <View style={[styles.bestSellerBadge, { backgroundColor: 'rgba(0, 0, 0, 0.7)' }]}>
                <Text style={styles.bestSellerText}>Top Rated</Text>
              </View>
              <TrendingCard
                image={require('@/assets/images/dummy/news/blockchain.png')}
                title="Climate Change Solutions in Indonesia"
                duration="12 min"
                pages={20}
                onPress={() => console.log('Popular 2 pressed')}
              />
            </View>

            <View style={styles.popularCardWrapper}>
              <TrendingCard
                image={require('@/assets/images/dummy/news/mental-health.png')}
                title="Quantum Computing Basics"
                duration="10 min"
                pages={16}
                onPress={() => console.log('Popular 3 pressed')}
              />
            </View>
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
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: 30,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  headerLeft: {
    flex: 1,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '400',
  },
  heroSection: {
    marginBottom: Spacing.lg,
  },
  continueLearningSection: {
    marginBottom: Spacing.lg,
  },
  personalizationSection: {
    marginBottom: Spacing.xl,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: Spacing.md,
  },
  // Categories Styles
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
    width: 240,
  },
  bestSellerBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    zIndex: 10,
  },
  bestSellerText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
});

import { Colors, Spacing } from '@/constants/theme';
import { onboardingSlides } from '@/features/onboarding/data/slides';
import { Button, ButtonLink } from '@/shared/components/ui/Button';
import { Body, Heading } from '@/shared/components/ui/Typography';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import PagerView from 'react-native-pager-view';
import { useTranslation } from 'react-i18next';

const { width } = Dimensions.get('window');

export default function OnboardingScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const colors = Colors.light;
  const pagerRef = useRef<PagerView>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = () => {
    if (currentIndex < onboardingSlides.length - 1) {
      pagerRef.current?.setPage(currentIndex + 1);
    } else {
      handleFinish();
    }
  };

  const handleFinish = async () => {
    // Mark onboarding as completed
    await AsyncStorage.setItem('onboarding_completed', 'true');
    router.replace('/(auth)/login');
  };

  const isLastSlide = currentIndex === onboardingSlides.length - 1;
  const currentSlide = onboardingSlides[currentIndex];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Logo - Fixed at top */}
      <View style={styles.logoSection}>
        <Image
          source={require('@/assets/images/onboarding/logo.svg')}
          style={styles.logo}
          contentFit="contain"
        />
      </View>

      {/* Carousel */}
      <PagerView
        ref={pagerRef}
        style={styles.pagerView}
        initialPage={0}
        onPageSelected={(e) => setCurrentIndex(e.nativeEvent.position)}
      >
        {onboardingSlides.map((item) => (
          <View key={item.id} style={styles.slide}>
            {/* Illustration */}
            <View style={styles.illustrationSection}>
              {item.illustration && (
                <Image
                  source={item.illustration}
                  style={styles.illustration}
                  contentFit="contain"
                  transition={300}
                />
              )}
            </View>

            {/* Content */}
            <View style={styles.contentSection}>
              <Heading align="center">{t(item.titleKey)}</Heading>
              <Body align="center" style={styles.description}>
                {t(item.descriptionKey)}
              </Body>
            </View>
          </View>
        ))}
      </PagerView>

      {/* Pagination Dots */}
      <View style={styles.pagination}>
        {onboardingSlides.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              {
                backgroundColor: index === currentIndex ? colors.primary : colors.border,
                width: index === currentIndex ? 24 : 8,
              },
            ]}
          />
        ))}
      </View>

      {/* Fixed Bottom CTA */}
      <View style={styles.bottomSection}>
        <Button variant="primary" size="lg" fullWidth onPress={handleNext}>
          {isLastSlide ? t('onboarding.getStarted') : t('common.next')}
        </Button>
        {currentSlide?.isIntro && (
          <ButtonLink
            onPress={async () => {
              await AsyncStorage.setItem('onboarding_completed', 'true');
              router.replace('/(auth)/login');
            }}
          >
            {t('auth.haveAccount')} <Body color={colors.primary}>{t('auth.login')}</Body>
          </ButtonLink>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  logoSection: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing['3xl'],
    paddingBottom: Spacing.md,
  },
  logo: {
    width: 80,
    height: 72,
  },
  pagerView: {
    flex: 1,
  },
  slide: {
    width,
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  illustrationSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: Spacing.xl,
  },
  illustration: {
    width: '100%',
    aspectRatio: 1,
    maxHeight: 300,
  },
  contentSection: {
    gap: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  description: {
    lineHeight: 24,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.lg,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  bottomSection: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing['3xl'],
    gap: Spacing.md,
  },
});

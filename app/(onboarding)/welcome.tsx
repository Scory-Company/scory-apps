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
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  scaleWidth,
  isSmallDevice,
  hp,
  wp,
  rs,
} from '@/utils/responsive';

const { width } = Dimensions.get('window');
const isSmall = isSmallDevice();

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
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
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
                  transition={150}
                  cachePolicy="memory-disk"
                  priority="high"
                  recyclingKey={item.id}
                  allowDownscaling={false}
                  placeholder={null}
                />
              )}
            </View>

            {/* Content */}
            <View style={styles.contentSection}>
              <Heading
                align="center"
                size={isSmall ? '2xl' : '3xl'}
              >
                {t(item.titleKey)}
              </Heading>
              <Body
                align="center"
                size={isSmall ? 'sm' : 'base'}
                style={styles.description}
              >
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
                width: index === currentIndex ? scaleWidth(24) : scaleWidth(8),
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  logoSection: {
    paddingHorizontal: scaleWidth(Spacing.lg),
    paddingTop: isSmall ? rs(Spacing.lg) : rs(Spacing['2xl']),
    paddingBottom: rs(Spacing.sm),
  },
  logo: {
    width: scaleWidth(80),
    height: scaleWidth(72),
  },
  pagerView: {
    flex: 1,
  },
  slide: {
    width,
    flex: 1,
    paddingHorizontal: scaleWidth(Spacing.lg),
  },
  illustrationSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: isSmall ? rs(Spacing.md) : rs(Spacing.lg),
    minHeight: isSmall ? hp(25) : hp(35),
    maxHeight: isSmall ? hp(35) : hp(45),
  },
  illustration: {
    width: wp(85),
    height: '100%',
    maxWidth: isSmall ? scaleWidth(260) : scaleWidth(340),
  },
  contentSection: {
    gap: rs(Spacing.md),
    paddingBottom: rs(Spacing.md),
    paddingHorizontal: scaleWidth(Spacing.sm),
  },
  description: {
    lineHeight: isSmall ? 20 : 24,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: scaleWidth(Spacing.xs),
    paddingVertical: rs(isSmall ? Spacing.md : Spacing.lg),
  },
  dot: {
    height: scaleWidth(8),
    borderRadius: scaleWidth(4),
  },
  bottomSection: {
    paddingHorizontal: scaleWidth(Spacing.lg),
    paddingBottom: isSmall ? rs(Spacing.lg) : rs(Spacing['2xl']),
    gap: rs(Spacing.md),
  },
});

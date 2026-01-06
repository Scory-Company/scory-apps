import { Colors, Spacing } from '@/constants/theme';
import { onboardingSlides } from '@/features/onboarding/data/slides';
import { Button, ButtonLink } from '@/shared/components/ui/Button';
import { Body, Heading } from '@/shared/components/ui/Typography';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useRef, useState, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import PagerView from 'react-native-pager-view';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useResponsiveDimensions } from '@/utils/responsive';

export default function OnboardingScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const colors = Colors.light;
  const pagerRef = useRef<PagerView>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Use dynamic responsive dimensions that update on screen changes
  const responsive = useResponsiveDimensions();

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

  // Create dynamic styles based on responsive dimensions
  const dynamicStyles = useMemo(() => ({
    logoSection: {
      paddingHorizontal: responsive.scaleWidth(Spacing.lg),
      paddingTop: responsive.isSmall ? responsive.rs(Spacing.lg) : responsive.rs(Spacing['2xl']),
      paddingBottom: responsive.rs(Spacing.sm),
    },
    logo: {
      width: responsive.scaleWidth(80),
      height: responsive.scaleHeight(72), // Fix: use scaleHeight for proper aspect ratio
    },
    slide: {
      width: responsive.width,
      flex: 1,
      paddingHorizontal: responsive.scaleWidth(Spacing.lg),
    },
    illustrationSection: {
      flex: 1,
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
      marginVertical: responsive.isSmall ? responsive.rs(Spacing.md) : responsive.rs(Spacing.lg),
      minHeight: responsive.isSmall ? responsive.hp(25) : responsive.hp(30),
      maxHeight: responsive.isSmall ? responsive.hp(35) : responsive.hp(40),
    },
    illustration: {
      width: responsive.wp(80),
      height: '100%' as const,
      maxWidth: responsive.isSmall ? responsive.scaleWidth(240) : responsive.scaleWidth(320),
    },
    contentSection: {
      gap: responsive.rs(Spacing.md),
      paddingBottom: responsive.rs(Spacing.md),
      paddingHorizontal: responsive.scaleWidth(Spacing.xs), // Reduced from sm
    },
    description: {
      lineHeight: responsive.isSmall ? 20 : 24,
    },
    pagination: {
      flexDirection: 'row' as const,
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
      gap: responsive.scaleWidth(Spacing.xs),
      paddingVertical: responsive.rs(responsive.isSmall ? Spacing.md : Spacing.lg),
    },
    dot: {
      height: responsive.scaleWidth(8),
      borderRadius: responsive.scaleWidth(4),
    },
    bottomSection: {
      paddingHorizontal: responsive.scaleWidth(Spacing.lg),
      paddingBottom: responsive.isSmall ? responsive.rs(Spacing.lg) : responsive.rs(Spacing['2xl']),
      gap: responsive.rs(Spacing.md),
    },
  }), [responsive]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      {/* Logo - Fixed at top */}
      <View style={dynamicStyles.logoSection}>
        <Image
          source={require('@/assets/images/onboarding/logo.svg')}
          style={dynamicStyles.logo}
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
          <View key={item.id} style={dynamicStyles.slide}>
            {/* Illustration */}
            <View style={dynamicStyles.illustrationSection}>
              {item.illustration && (
                <Image
                  source={item.illustration}
                  style={dynamicStyles.illustration}
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
            <View style={dynamicStyles.contentSection}>
              <Heading
                align="center"
                size={responsive.isSmall ? '2xl' : '3xl'}
              >
                {t(item.titleKey)}
              </Heading>
              <Body
                align="center"
                size={responsive.isSmall ? 'sm' : 'base'}
                style={dynamicStyles.description}
              >
                {t(item.descriptionKey)}
              </Body>
            </View>
          </View>
        ))}
      </PagerView>

      {/* Pagination Dots */}
      <View style={dynamicStyles.pagination}>
        {onboardingSlides.map((_, index) => (
          <View
            key={index}
            style={[
              dynamicStyles.dot,
              {
                backgroundColor: index === currentIndex ? colors.primary : colors.border,
                width: index === currentIndex ? responsive.scaleWidth(24) : responsive.scaleWidth(8),
              },
            ]}
          />
        ))}
      </View>

      {/* Fixed Bottom CTA */}
      <View style={dynamicStyles.bottomSection}>
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

// Static styles (non-responsive values only)
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  pagerView: {
    flex: 1,
  },
});

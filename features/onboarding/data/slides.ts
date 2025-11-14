export interface OnboardingSlide {
  id: string;
  titleKey: string;
  descriptionKey: string;
  illustration?: any; // Image source (optional for intro slide)
  isIntro?: boolean; // First slide with CTA
}

export const onboardingSlides: OnboardingSlide[] = [
  {
    id: '0',
    titleKey: 'onboarding.slide1.title',
    descriptionKey: 'onboarding.slide1.description',
    illustration: require('@/assets/images/onboarding/intro.png'),
    isIntro: true,
  },
  {
    id: '1',
    titleKey: 'onboarding.slide2.title',
    descriptionKey: 'onboarding.slide2.description',
    illustration: require('@/assets/images/onboarding/slide-1.png'),
  },
  {
    id: '2',
    titleKey: 'onboarding.slide3.title',
    descriptionKey: 'onboarding.slide3.description',
    illustration: require('@/assets/images/onboarding/slide-2.png'),
  },
  {
    id: '3',
    titleKey: 'onboarding.slide4.title',
    descriptionKey: 'onboarding.slide4.description',
    illustration: require('@/assets/images/onboarding/slide-3.png'),
  },
];

export interface OnboardingSlide {
  id: string;
  title: string;
  description: string;
  illustration?: any; // Image source (optional for intro slide)
  isIntro?: boolean; // First slide with CTA
}

export const onboardingSlides: OnboardingSlide[] = [
  {
    id: '0',
    title: 'Welcome to Scory',
    description: 'Unlock academic journals easily.\nTransform complex research papers into engaging stories and interactive quizzes',
    illustration: require('@/assets/images/onboarding/intro.png'),
    isIntro: true,
  },
  {
    id: '1',
    title: 'Read Journals\nWithout Headaches',
    description: 'Complex academic papers simplified into easy-to-understand content',
    illustration: require('@/assets/images/onboarding/slide-1.png'),
  },
  {
    id: '2',
    title: 'AI Storyteller\nfor Research',
    description: 'Transform rigid academic language into engaging stories with AI',
    illustration: require('@/assets/images/onboarding/slide-2.png'),
  },
  {
    id: '3',
    title: 'Learn While\nPlaying Quizzes',
    description: 'Collect points, unlock badges, and climb the leaderboard!',
    illustration: require('@/assets/images/onboarding/slide-3.png'),
  },
];

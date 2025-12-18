import { Ionicons } from '@expo/vector-icons';

// Icon mapping for categories - using clean, simple icons
export const getCategoryIcon = (categoryName: string): keyof typeof Ionicons.glyphMap => {
  const name = categoryName.toLowerCase();

  // Match exact API categories
  if (name.includes('science')) return 'flask';
  if (name.includes('health')) return 'heart';
  if (name.includes('tech')) return 'hardware-chip';
  if (name.includes('business')) return 'briefcase';
  if (name.includes('finance')) return 'calculator';
  if (name.includes('education')) return 'book';
  if (name.includes('environment')) return 'earth';
  if (name.includes('social')) return 'people';

  // Additional categories
  if (name.includes('medical')) return 'medical';
  if (name.includes('cyber') || name.includes('security')) return 'shield-checkmark';
  if (name.includes('game') || name.includes('gamification')) return 'game-controller';
  if (name.includes('startup')) return 'rocket';
  if (name.includes('learning')) return 'book-outline';
  if (name.includes('money')) return 'cash';
  if (name.includes('art') || name.includes('design')) return 'color-palette';
  if (name.includes('nature')) return 'leaf';
  if (name.includes('food')) return 'restaurant';
  if (name.includes('sport') || name.includes('fitness')) return 'fitness';
  if (name.includes('travel')) return 'airplane';
  if (name.includes('music')) return 'musical-notes';

  // Default icon
  return 'flash';
};

// Elegant vibrant color mapping - modern & professional
export const getCategorySolidColor = (categoryName: string): string => {
  const name = categoryName.toLowerCase();

  // Match exact API categories with elegant vibrant colors
  if (name.includes('science'))
    return '#8B5CF6'; // Vibrant Purple
  if (name.includes('health'))
    return '#10B981'; // Emerald Green
  if (name.includes('tech'))
    return '#3B82F6'; // Royal Blue
  if (name.includes('business'))
    return '#F59E0B'; // Amber Orange
  if (name.includes('finance'))
    return '#059669'; // Teal Green
  if (name.includes('education'))
    return '#EC4899'; // Hot Pink
  if (name.includes('environment'))
    return '#14B8A6'; // Cyan Teal
  if (name.includes('social'))
    return '#F43F5E'; // Rose Red

  // Additional categories
  if (name.includes('medical'))
    return '#10B981'; // Emerald
  if (name.includes('cyber') || name.includes('security'))
    return '#EF4444'; // Red
  if (name.includes('game') || name.includes('gamification'))
    return '#8B5CF6'; // Purple
  if (name.includes('startup'))
    return '#F59E0B'; // Orange
  if (name.includes('learning'))
    return '#EC4899'; // Pink
  if (name.includes('money'))
    return '#059669'; // Green
  if (name.includes('art') || name.includes('design'))
    return '#A855F7'; // Violet
  if (name.includes('nature'))
    return '#14B8A6'; // Teal
  if (name.includes('food'))
    return '#FB923C'; // Orange
  if (name.includes('sport') || name.includes('fitness'))
    return '#F97316'; // Orange
  if (name.includes('travel'))
    return '#06B6D4'; // Sky Blue
  if (name.includes('music'))
    return '#A855F7'; // Violet

  // Default color
  return '#6366F1'; // Indigo
};

// Keep gradient for backward compatibility but deprecated
export const getCategoryGradient = (categoryName: string): [string, string] => {
  const solidColor = getCategorySolidColor(categoryName);
  return [solidColor, solidColor]; // Return same color twice for solid effect
};

// Background image mapping for trending cards
export const getCategoryBackgroundImage = (categoryName: string) => {
  const name = categoryName.toLowerCase();

  // Match exact API categories
  if (name.includes('science'))
    return require('@/assets/images/trending-card-bg/science.jpg');
  if (name.includes('health'))
    return require('@/assets/images/trending-card-bg/health.jpg');
  if (name.includes('tech'))
    return require('@/assets/images/trending-card-bg/technology.jpg');
  if (name.includes('business'))
    return require('@/assets/images/trending-card-bg/science.jpg');
  if (name.includes('finance'))
    return require('@/assets/images/trending-card-bg/science.jpg');
  if (name.includes('education'))
    return require('@/assets/images/trending-card-bg/education.jpg');
  if (name.includes('environment'))
    return require('@/assets/images/trending-card-bg/science.jpg');
  if (name.includes('social'))
    return require('@/assets/images/trending-card-bg/social.jpg');

  // Return null if no image available - will fallback to solid color
  return null;
};

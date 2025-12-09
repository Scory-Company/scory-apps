/**
 * Reading Level Constants for Personalization
 * Based on Scory's adaptive content complexity concept
 *
 * NOTE: Uses lowercase for UI/storage, converts to uppercase for API calls
 */

// Import the enum from services for API consistency
import { ReadingLevel as APIReadingLevel } from '@/services/articles';

export type ReadingLevel = 'simple' | 'student' | 'academic' | 'expert';

export interface ReadingLevelOption {
  id: ReadingLevel;
  apiValue: APIReadingLevel;
  emoji: string;
  label: string;
  description: string;
  previewText: string;
}

export const READING_LEVELS: ReadingLevelOption[] = [
  {
    id: 'simple',
    apiValue: APIReadingLevel.SIMPLE,
    emoji: '🌱',
    label: 'Simple',
    description: 'Perfect for curious learners',
    previewText: 'Learn about research in everyday language you already know',
  },
  {
    id: 'student',
    apiValue: APIReadingLevel.STUDENT,
    emoji: '📖',
    label: 'Student',
    description: 'Great for students & enthusiasts',
    previewText: 'Understand key concepts with simplified academic terms',
  },
  {
    id: 'academic',
    apiValue: APIReadingLevel.ACADEMIC,
    emoji: '🎓',
    label: 'Academic',
    description: 'Detailed for university students',
    previewText: 'Explore research with proper terminology and methodology',
  },
  {
    id: 'expert',
    apiValue: APIReadingLevel.EXPERT,
    emoji: '🔬',
    label: 'Expert',
    description: 'Full technical depth',
    previewText: 'Read original research with complete academic rigor',
  },
];

// Helper to get level by ID
export const getReadingLevel = (id: ReadingLevel): ReadingLevelOption | undefined => {
  return READING_LEVELS.find((level) => level.id === id);
};

// Helper to convert UI level to API level
export const toAPIReadingLevel = (level: ReadingLevel): APIReadingLevel => {
  const levelOption = getReadingLevel(level);
  return levelOption?.apiValue || APIReadingLevel.SIMPLE;
};

// Helper to convert API level to UI level
export const fromAPIReadingLevel = (apiLevel: APIReadingLevel): ReadingLevel => {
  const levelOption = READING_LEVELS.find(l => l.apiValue === apiLevel);
  return levelOption?.id || 'simple';
};

// Default level for first-time users
export const DEFAULT_READING_LEVEL: ReadingLevel = 'simple';

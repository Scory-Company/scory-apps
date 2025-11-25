/**
 * Reading Level Constants for Personalization
 * Based on Scory's adaptive content complexity concept
 */

export type ReadingLevel = 'simple' | 'student' | 'academic' | 'expert';

export interface ReadingLevelOption {
  id: ReadingLevel;
  emoji: string;
  label: string;
  description: string;
  previewText: string;
}

export const READING_LEVELS: ReadingLevelOption[] = [
  {
    id: 'simple',
    emoji: '🌱',
    label: 'Simple',
    description: 'Perfect for curious learners',
    previewText: 'Learn about research in everyday language you already know',
  },
  {
    id: 'student',
    emoji: '📖',
    label: 'Student',
    description: 'Great for students & enthusiasts',
    previewText: 'Understand key concepts with simplified academic terms',
  },
  {
    id: 'academic',
    emoji: '🎓',
    label: 'Academic',
    description: 'Detailed for university students',
    previewText: 'Explore research with proper terminology and methodology',
  },
  {
    id: 'expert',
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

// Default level for first-time users
export const DEFAULT_READING_LEVEL: ReadingLevel = 'simple';

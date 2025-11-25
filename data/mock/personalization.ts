/**
 * Mock data for personalization quiz
 * Text content is now managed in locales (en.json, id.json)
 */

import { ReadingLevel } from '@/constants/readingLevels';

export interface QuizOption {
  id: string;
  emoji: string;
  weight: ReadingLevel;
}

export interface QuizQuestion {
  id: number;
  questionKey: string; // Key for locale lookup
  emoji: string;
  options: QuizOption[];
}

// Quiz structure (text comes from locales)
export const PERSONALIZATION_QUIZ: QuizQuestion[] = [
  {
    id: 1,
    questionKey: 'q1',
    emoji: '🎯',
    options: [
      { id: 'q1_a', emoji: '🌱', weight: 'simple' },
      { id: 'q1_b', emoji: '📖', weight: 'student' },
      { id: 'q1_c', emoji: '🎓', weight: 'academic' },
      { id: 'q1_d', emoji: '🔬', weight: 'expert' },
    ],
  },
  {
    id: 2,
    questionKey: 'q2',
    emoji: '💡',
    options: [
      { id: 'q2_a', emoji: '😊', weight: 'simple' },
      { id: 'q2_b', emoji: '📚', weight: 'student' },
      { id: 'q2_c', emoji: '📝', weight: 'academic' },
      { id: 'q2_d', emoji: '🔍', weight: 'expert' },
    ],
  },
  {
    id: 3,
    questionKey: 'q3',
    emoji: '📖',
    options: [
      { id: 'q3_a', emoji: '🌱', weight: 'simple' },
      { id: 'q3_b', emoji: '📖', weight: 'student' },
      { id: 'q3_c', emoji: '🎓', weight: 'academic' },
      { id: 'q3_d', emoji: '🔬', weight: 'expert' },
    ],
  },
];

// Emoji mapping for result levels
export const LEVEL_EMOJIS: Record<ReadingLevel, string> = {
  simple: '🌱',
  student: '📖',
  academic: '🎓',
  expert: '🔬',
};

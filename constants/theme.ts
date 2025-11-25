/**
 * Scory Design System (Updated Colors + Poppins)
 */

import { Platform } from 'react-native';

export const Colors = {
  light: {
    primary: '#26EE5A',
    primaryLight: '#74E99D',
    primaryDark: '#000000',
    secondary: '#282828',
    third: '#19A03DFF',
    success: '#22C55E',
    warning: '#FACC15',
    error: '#EF4444',
    info: '#3B82F6',

    textwhite: '#FFFFFF',

    background: '#F9FAFB',
    surface: '#FFFFFF',
    surfaceSecondary: '#F3F4F6',

    text: '#111827',
    textSecondary: '#374151',
    textMuted: '#9CA3AF',
    textInverse: '#FFFFFF',

    border: '#E5E7EB',
    borderLight: '#F3F4F6',

    icon: '#6B7280',
    iconActive: '#26EE5A',

    tint: '#282828',
    tabIconDefault: '#9CA3AF',
    tabIconSelected: '#282828',
  },
  dark: {
    primary: '#26EE5A',
    primaryDark: '#282828',
    secondary: '#282828',
    success: '#34D399',
    warning: '#EAB308',
    error: '#F87171',
    info: '#60A5FA',

    background: '#0B0B0B',
    surface: '#1E1E1E',
    surfaceSecondary: '#2A2A2A',

    text: '#F9FAFB',
    textSecondary: '#D1D5DB',
    textMuted: '#9CA3AF',
    textInverse: '#000000',

    border: '#2A2A2A',
    borderLight: '#1E1E1E',

    icon: '#9CA3AF',
    iconActive: '#26EE5A',

    tint: '#26EE5A',
    tabIconDefault: '#9CA3AF',
    tabIconSelected: '#26EE5A',
  },
};

export const Typography = {
  fontFamily: {
    regular: 'Poppins-Regular',
    medium: 'Poppins-Medium',
    semiBold: 'Poppins-SemiBold',
    bold: 'Poppins-Bold',
  },
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 28,
    '4xl': 32,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
};

export const Spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 40,
  '3xl': 48,
  '4xl': 64,
};

export const Radius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 24,
  full: 9999,
};

export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
};

// Personalization Quiz Theme
export const PersonalizationTheme = {
  light: {
    bg: '#F8FAFB',
    surface: '#FFFFFF',
    primary: '#20B548',
    primaryLight: '#74E99D',
    primarySoft: '#70BF8E',
    text: '#1A1D1F',
    textSecondary: '#383839',
    textMuted: '#9CA3AF',
    border: '#E8ECEF',
    progressBg: '#F0F2F4',
    accent: '#7C3AED',
    accentLight: '#EDE9FE',
    buttonText: '#FFFFFF',
  },
  dark: {
    bg: '#0F0F0F',
    surface: '#1A1A1A',
    primary: '#26EE5A',
    primaryLight: '#1E3A2C',
    primarySoft: '#2D5A43',
    text: '#F9FAFB',
    textSecondary: '#D1D5DB',
    textMuted: '#9CA3AF',
    border: '#2A2A2A',
    progressBg: '#1E1E1E',
    accent: '#9D6CFF',
    accentLight: '#2D1F4A',
    buttonText: '#000000',
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: 'Poppins-Regular',
    serif: 'ui-serif',
    rounded: 'Poppins-Regular',
    mono: 'monospace',
  },
  android: {
    sans: 'Poppins-Regular',
    serif: 'serif',
    rounded: 'Poppins-Regular',
    mono: 'monospace',
  },
  default: {
    sans: 'Poppins-Regular',
    serif: 'serif',
    rounded: 'Poppins-Regular',
    mono: 'monospace',
  },
  web: {
    sans: "'Poppins', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'Poppins', sans-serif",
    mono: "Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

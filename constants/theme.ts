/**
 * Scory Design System (Updated Colors)
 * Primary: #26EE5A (Green)
 * Secondary: #000000 (Black)
 */

import { Platform } from 'react-native';

export const Colors = {
  light: {
    // Brand Colors
    primary: '#26EE5A',
    primaryDark: '#000000',
    secondary: '#000000',
    success: '#22C55E',
    warning: '#FACC15',
    error: '#EF4444',
    info: '#3B82F6',

    // Background
    background: '#F9FAFB',
    surface: '#FFFFFF',
    surfaceSecondary: '#F3F4F6',

    // Text
    text: '#111827',
    textSecondary: '#374151',
    textMuted: '#9CA3AF',
    textInverse: '#FFFFFF',

    // Border
    border: '#E5E7EB',
    borderLight: '#F3F4F6',

    // Icon
    icon: '#6B7280',
    iconActive: '#26EE5A',

    // Legacy (for compatibility)
    tint: '#000000',
    tabIconDefault: '#9CA3AF',
    tabIconSelected: '#000000',
  },
  dark: {
    // Brand Colors
    primary: '#26EE5A',
    primaryDark: '#000000',
    secondary: '#000000',
    success: '#34D399',
    warning: '#EAB308',
    error: '#F87171',
    info: '#60A5FA',

    // Background
    background: '#0B0B0B',
    surface: '#1E1E1E',
    surfaceSecondary: '#2A2A2A',

    // Text
    text: '#F9FAFB',
    textSecondary: '#D1D5DB',
    textMuted: '#9CA3AF',
    textInverse: '#000000',

    // Border
    border: '#2A2A2A',
    borderLight: '#1E1E1E',

    // Icon
    icon: '#9CA3AF',
    iconActive: '#26EE5A',

    // Legacy (for compatibility)
    tint: '#26EE5A',
    tabIconDefault: '#9CA3AF',
    tabIconSelected: '#26EE5A',
  },
};

export const Typography = {
  fontFamily: {
    regular: 'SFProDisplay-Regular',
    medium: 'SFProDisplay-Medium',
    semiBold: 'SFProDisplay-Semibold',
    bold: 'SFProDisplay-Bold',
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

export const Fonts = Platform.select({
  ios: {
    sans: 'SF Pro Display',
    serif: 'ui-serif',
    rounded: 'SF Pro Rounded',
    mono: 'ui-monospace',
  },
  android: {
    sans: 'SFProDisplay-Regular',
    serif: 'serif',
    rounded: 'sans-serif',
    mono: 'monospace',
  },
  default: {
    sans: 'SFProDisplay-Regular',
    serif: 'serif',
    rounded: 'sans-serif',
    mono: 'monospace',
  },
  web: {
    sans: "'SF Pro Display', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

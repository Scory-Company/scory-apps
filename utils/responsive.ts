/**
 * Responsive Utilities
 * Provides scaling functions based on device dimensions for consistent UI across different screen sizes
 */

import { Dimensions, PixelRatio, Platform } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Base dimensions (design reference - iPhone 14 Pro)
const BASE_WIDTH = 393;
const BASE_HEIGHT = 852;

/**
 * Scale value based on screen width
 * Use for: horizontal spacing, widths, horizontal margins/paddings
 */
export const scaleWidth = (size: number): number => {
  return (SCREEN_WIDTH / BASE_WIDTH) * size;
};

/**
 * Scale value based on screen height
 * Use for: vertical spacing, heights, vertical margins/paddings
 */
export const scaleHeight = (size: number): number => {
  return (SCREEN_HEIGHT / BASE_HEIGHT) * size;
};

/**
 * Moderate scale - scales less aggressively
 * Use for: font sizes, icon sizes, border radius
 * @param size - base size
 * @param factor - how much to scale (0 = no scale, 1 = full scale). Default 0.5
 */
export const moderateScale = (size: number, factor: number = 0.5): number => {
  return size + (scaleWidth(size) - size) * factor;
};

/**
 * Scale with min/max bounds
 * Prevents values from becoming too small or too large
 */
export const scaleBounded = (
  size: number,
  min?: number,
  max?: number
): number => {
  const scaled = scaleWidth(size);
  if (min !== undefined && scaled < min) return min;
  if (max !== undefined && scaled > max) return max;
  return scaled;
};

/**
 * Get responsive font size
 * Automatically handles different screen sizes with min/max constraints
 */
export const responsiveFontSize = (size: number): number => {
  const scale = SCREEN_WIDTH / BASE_WIDTH;
  const newSize = size * scale;

  // Prevent fonts from becoming too small or too large
  if (Platform.OS === 'android') {
    return Math.round(PixelRatio.roundToNearestPixel(newSize));
  }

  return Math.round(newSize);
};

/**
 * Get device type
 */
export const getDeviceType = () => {
  if (SCREEN_WIDTH < 360) return 'small'; // Small phones (e.g., iPhone SE)
  if (SCREEN_WIDTH < 414) return 'medium'; // Standard phones
  if (SCREEN_WIDTH < 768) return 'large'; // Large phones / small tablets
  return 'tablet'; // Tablets
};

/**
 * Check if screen is small (useful for conditional rendering)
 */
export const isSmallDevice = (): boolean => {
  return SCREEN_HEIGHT < 700 || SCREEN_WIDTH < 360;
};

/**
 * Get safe spacing based on screen size
 * Returns smaller spacing on small devices
 */
export const getResponsiveSpacing = (spacing: {
  small: number;
  medium: number;
  large: number;
}) => {
  const deviceType = getDeviceType();

  switch (deviceType) {
    case 'small':
      return spacing.small;
    case 'medium':
      return spacing.medium;
    case 'large':
    case 'tablet':
      return spacing.large;
    default:
      return spacing.medium;
  }
};

/**
 * Responsive spacing multiplier
 * Automatically scales spacing values based on screen size
 */
export const rs = (baseSpacing: number): number => {
  return scaleHeight(baseSpacing);
};

/**
 * Get percentage of screen width
 */
export const wp = (percentage: number): number => {
  return (SCREEN_WIDTH * percentage) / 100;
};

/**
 * Get percentage of screen height
 */
export const hp = (percentage: number): number => {
  return (SCREEN_HEIGHT * percentage) / 100;
};

// Export screen dimensions for convenience
export const screenDimensions = {
  width: SCREEN_WIDTH,
  height: SCREEN_HEIGHT,
  isSmall: isSmallDevice(),
  deviceType: getDeviceType(),
};

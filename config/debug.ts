/**
 * Debug Configuration
 *
 * Settings untuk debugging dan development.
 * Jangan lupa set ke false sebelum production build!
 */

export const DebugConfig = {
  /**
   * 🐛 RESET ONBOARDING
   *
   * - true: Onboarding akan selalu muncul setiap kali app dibuka (untuk testing)
   * - false: Onboarding hanya muncul sekali (behavior normal)
   *
   * Default: false
   */
  RESET_ONBOARDING_ON_LAUNCH: false,

  /**
   * 🐛 SHOW DEBUG LOGS
   *
   * - true: Console log untuk debugging akan ditampilkan
   * - false: Console log debugging tidak ditampilkan
   *
   * Default: false
   */
  SHOW_DEBUG_LOGS: false,
} as const;

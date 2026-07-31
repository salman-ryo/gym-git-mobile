/**
 * Gym-Git Theme Colors
 * 
 * Converted from the Next.js globals.css oklch settings to standard HEX/RGBA formats
 * suitable for React Native styling and expo-linear-gradient.
 */

export const Colors = {
  // Brand Gradients
  brandGradient: ['#34d399', '#5eead4', '#a7f3d0'], // Emerald-400 -> Teal-300 -> Emerald-200
  brandPrimary: '#06b6d4', // Emerald-400
  brandSecondary: '#0891b2', // Emerald-500
  brandTeal: '#14b8a6', // Teal-500

  // Backdrop glows
  glowTeal: 'rgba(20, 184, 166, 0.10)',
  glowPurple: 'rgba(168, 85, 247, 0.10)',

  // Card themes
  cards: {
    streak: {
      border: '#f59e0b', // Amber-500
      glow: 'rgba(245, 158, 11, 0.15)',
      text: '#fbbf24', // Amber-400
    },
    record: {
      border: '#10b981', // Emerald-500
      glow: 'rgba(16, 185, 129, 0.15)',
      text: '#34d399', // Emerald-400
    },
    compliance: {
      border: '#a855f7', // Purple-500
      glow: 'rgba(168, 85, 247, 0.15)',
      text: '#c084fc', // Purple-400
    },
    hours: {
      border: '#3b82f6', // Blue-500
      glow: 'rgba(59, 130, 246, 0.15)',
      text: '#60a5fa', // Blue-400
    },
  },

  // Dark Theme (default)
  dark: {
    background: '#0a0a0a',
    foreground: '#fafafa',
    card: '#171717',
    cardForeground: '#fafafa',
    popover: '#171717',
    popoverForeground: '#fafafa',
    primary: '#e5e5e5',
    primaryForeground: '#171717',
    secondary: '#262626',
    secondaryForeground: '#fafafa',
    muted: '#262626',
    mutedForeground: '#a1a1a1',
    accent: '#262626',
    accentForeground: '#fafafa',
    destructive: '#ff6467',
    border: 'rgba(255, 255, 255, 0.10)',
    input: 'rgba(255, 255, 255, 0.15)',
    ring: '#737373',
  },

  // Light Theme (included for reference/completeness)
  light: {
    background: '#ffffff',
    foreground: '#0a0a0a',
    card: '#ffffff',
    cardForeground: '#0a0a0a',
    popover: '#ffffff',
    popoverForeground: '#0a0a0a',
    primary: '#171717',
    primaryForeground: '#fafafa',
    secondary: '#f5f5f5',
    secondaryForeground: '#171717',
    muted: '#f5f5f5',
    mutedForeground: '#737373',
    accent: '#f5f5f5',
    accentForeground: '#171717',
    destructive: '#e7000b',
    border: '#e5e5e5',
    input: '#e5e5e5',
    ring: '#a1a1a1',
  }
};

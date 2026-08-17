/**
 * Gym-Git Cyberpunk Design System & Color Tokens
 * 
 * Provides unified theme colors, glow palettes, item rarities,
 * and heat map styling matching the Next.js web application.
 */

export const Colors = {
  // Primary Cyberpunk Neon Accents
  neonGreen: '#00ff88',
  neonCyan: '#22d3ee',
  neonPurple: '#a855f7',
  amber: '#fbbf24',
  amberDark: '#f59e0b',
  rose: '#f43f5e',
  redAlert: '#ef4444',
  teal: '#14b8a6',

  // Heatmap & Status Specific Colors
  iceFrost: '#38bdf8',
  iceFrostGlow: 'rgba(56, 189, 248, 0.25)',
  iceFrostBg: 'rgba(2, 132, 199, 0.15)',
  slateRest: '#334155',
  slateRestDark: '#1e293b',
  missedDay: '#18181b',
  tileEmpty: '#27272a',

  // Brand Gradients (for expo-linear-gradient)
  brandGradient: ['#00ff88', '#00e077', '#22d3ee'] as const,
  brandPrimary: '#00ff88',
  brandSecondary: '#22d3ee',
  brandTeal: '#14b8a6',

  // Ambient Backdrop Glows
  glowGreen: 'rgba(0, 255, 136, 0.12)',
  glowCyan: 'rgba(34, 211, 238, 0.12)',
  glowPurple: 'rgba(168, 85, 247, 0.12)',
  glowAmber: 'rgba(245, 158, 11, 0.12)',
  glowIce: 'rgba(56, 189, 248, 0.15)',
  glowTeal: 'rgba(20, 184, 166, 0.10)',

  // RPG Game Item Rarities
  rarities: {
    common: {
      name: 'Common',
      border: '#3f3f46',
      text: '#a1a1aa',
      glow: 'transparent',
      bg: 'rgba(39, 39, 42, 0.3)',
      badgeBg: '#27272a',
    },
    uncommon: {
      name: 'Uncommon',
      border: '#10b981',
      text: '#34d399',
      glow: 'rgba(16, 185, 129, 0.25)',
      bg: 'rgba(16, 185, 129, 0.1)',
      badgeBg: 'rgba(16, 185, 129, 0.15)',
    },
    rare: {
      name: 'Rare',
      border: '#22d3ee',
      text: '#22d3ee',
      glow: 'rgba(34, 211, 238, 0.3)',
      bg: 'rgba(34, 211, 238, 0.1)',
      badgeBg: 'rgba(34, 211, 238, 0.15)',
    },
    epic: {
      name: 'Epic',
      border: '#a855f7',
      text: '#c084fc',
      glow: 'rgba(168, 85, 247, 0.35)',
      bg: 'rgba(168, 85, 247, 0.1)',
      badgeBg: 'rgba(168, 85, 247, 0.15)',
    },
    legendary: {
      name: 'Legendary',
      border: '#f59e0b',
      text: '#fbbf24',
      glow: 'rgba(251, 191, 36, 0.45)',
      bg: 'rgba(245, 158, 11, 0.12)',
      badgeBg: 'rgba(245, 158, 11, 0.2)',
    },
  },

  // Dashboard Metric Card Themes
  cards: {
    streak: {
      border: 'rgba(0, 255, 136, 0.3)',
      borderHover: '#00ff88',
      glow: 'rgba(0, 255, 136, 0.12)',
      text: '#00ff88',
      accentBar: ['rgba(0, 255, 136, 0.35)', 'transparent'] as const,
      gradient: ['#090d13', 'rgba(0, 255, 136, 0.06)'] as const,
    },
    streakFrozen: {
      border: 'rgba(34, 211, 238, 0.4)',
      borderHover: '#22d3ee',
      glow: 'rgba(34, 211, 238, 0.2)',
      text: '#22d3ee',
      accentBar: ['rgba(34, 211, 238, 0.5)', 'transparent'] as const,
      gradient: ['#080c10', 'rgba(34, 211, 238, 0.08)'] as const,
    },
    record: {
      border: 'rgba(34, 211, 238, 0.25)',
      borderHover: '#22d3ee',
      glow: 'rgba(34, 211, 238, 0.12)',
      text: '#22d3ee',
      accentBar: ['rgba(34, 211, 238, 0.35)', 'transparent'] as const,
      gradient: ['#090d13', 'rgba(34, 211, 238, 0.06)'] as const,
    },
    compliance: {
      border: 'rgba(168, 85, 247, 0.25)',
      borderHover: '#a855f7',
      glow: 'rgba(168, 85, 247, 0.12)',
      text: '#c084fc',
      accentBar: ['rgba(168, 85, 247, 0.35)', 'transparent'] as const,
      gradient: ['#090d13', 'rgba(168, 85, 247, 0.06)'] as const,
    },
    hours: {
      border: 'rgba(251, 191, 36, 0.25)',
      borderHover: '#fbbf24',
      glow: 'rgba(251, 191, 36, 0.12)',
      text: '#fbbf24',
      accentBar: ['rgba(251, 191, 36, 0.35)', 'transparent'] as const,
      gradient: ['#090d13', 'rgba(251, 191, 36, 0.06)'] as const,
    },
  },

  // Heatmap Tile Gradients
  heatmap: {
    workoutLevels: [
      '#14532d', // Level 1 (<0.75h)
      '#166534', // Level 2 (0.75h - 1.25h)
      '#22c55e', // Level 3 (1.25h - 2h)
      '#00ff88', // Level 4 (>2h peak)
    ] as const,
    frozen: '#38bdf8',
    restToken: '#334155',
    empty: '#18181b',
    border: '#27272a',
  },

  // Dark Theme Standard (Cyberpunk)
  dark: {
    background: '#060a0e',
    surface: '#090d13',
    surfaceElevated: '#0e141d',
    surfaceTranslucent: 'rgba(9, 13, 19, 0.85)',
    foreground: '#fafafa',
    card: '#080c10',
    cardBorder: '#1a2332',
    cardForeground: '#fafafa',
    popover: '#080c10',
    popoverForeground: '#fafafa',
    primary: '#00ff88',
    primaryForeground: '#060a0e',
    secondary: '#18181b',
    secondaryForeground: '#fafafa',
    muted: '#18181b',
    mutedForeground: '#71717a',
    accent: '#27272a',
    accentForeground: '#fafafa',
    destructive: '#f43f5e',
    border: '#27272a',
    input: '#18181b',
    ring: '#00ff88',
  },

  // Light Theme (reference fallback)
  light: {
    background: '#ffffff',
    surface: '#f8fafc',
    surfaceElevated: '#ffffff',
    surfaceTranslucent: 'rgba(255, 255, 255, 0.85)',
    foreground: '#09090b',
    card: '#ffffff',
    cardBorder: '#e2e8f0',
    cardForeground: '#09090b',
    popover: '#ffffff',
    popoverForeground: '#09090b',
    primary: '#059669',
    primaryForeground: '#ffffff',
    secondary: '#f1f5f9',
    secondaryForeground: '#09090b',
    muted: '#f1f5f9',
    mutedForeground: '#64748b',
    accent: '#f1f5f9',
    accentForeground: '#09090b',
    destructive: '#e11d48',
    border: '#e2e8f0',
    input: '#e2e8f0',
    ring: '#059669',
  },
};

export type RarityType = keyof typeof Colors.rarities;

export function getRarityStyles(rarity: string) {
  const normalized = (rarity || 'common').toLowerCase() as RarityType;
  return Colors.rarities[normalized] || Colors.rarities.common;
}

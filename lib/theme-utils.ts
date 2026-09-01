import { WeeklyPlan } from '@/lib/types';
import { Colors } from '@/constants/Colors';

export interface WorkoutTheme {
  name: string;
  primary: string;
  text: string;
  gradient: readonly [string, string];
  glow: string;
  bgLight: string;
}

export const THEMES: WorkoutTheme[] = [
  {
    name: 'green',
    primary: Colors.neonGreen,
    text: '#060a0e',
    gradient: [Colors.neonGreen, '#00e077'],
    glow: 'rgba(0, 255, 136, 0.25)',
    bgLight: 'rgba(0, 255, 136, 0.12)',
  },
  {
    name: 'cyan',
    primary: Colors.neonCyan,
    text: '#060a0e',
    gradient: [Colors.neonCyan, '#00b8d4'],
    glow: 'rgba(34, 211, 238, 0.25)',
    bgLight: 'rgba(34, 211, 238, 0.12)',
  },
  {
    name: 'purple',
    primary: Colors.neonPurple,
    text: '#ffffff',
    gradient: [Colors.neonPurple, '#9333ea'],
    glow: 'rgba(168, 85, 247, 0.25)',
    bgLight: 'rgba(168, 85, 247, 0.12)',
  },
  {
    name: 'sky',
    primary: '#38bdf8', // sky-400
    text: '#060a0e',
    gradient: ['#38bdf8', '#0ea5e9'],
    glow: 'rgba(56, 189, 248, 0.25)',
    bgLight: 'rgba(56, 189, 248, 0.12)',
  },
  {
    name: 'amber',
    primary: '#fbbf24', // amber-400
    text: '#060a0e',
    gradient: ['#fbbf24', '#f59e0b'],
    glow: 'rgba(251, 191, 36, 0.25)',
    bgLight: 'rgba(251, 191, 36, 0.12)',
  },
  {
    name: 'rose',
    primary: '#fb7185', // rose-400
    text: '#ffffff',
    gradient: ['#fb7185', '#f43f5e'],
    glow: 'rgba(251, 113, 133, 0.25)',
    bgLight: 'rgba(251, 113, 133, 0.12)',
  },
  {
    name: 'emerald',
    primary: '#34d399', // emerald-400
    text: '#060a0e',
    gradient: ['#34d399', '#10b981'],
    glow: 'rgba(52, 211, 153, 0.25)',
    bgLight: 'rgba(52, 211, 153, 0.12)',
  },
  {
    name: 'fuchsia',
    primary: '#e879f9', // fuchsia-400
    text: '#ffffff',
    gradient: ['#e879f9', '#d946ef'],
    glow: 'rgba(232, 121, 249, 0.25)',
    bgLight: 'rgba(232, 121, 249, 0.12)',
  },
  {
    name: 'indigo',
    primary: '#818cf8', // indigo-400
    text: '#ffffff',
    gradient: ['#818cf8', '#6366f1'],
    glow: 'rgba(129, 140, 248, 0.25)',
    bgLight: 'rgba(129, 140, 248, 0.12)',
  },
  {
    name: 'teal',
    primary: '#2dd4bf', // teal-400
    text: '#060a0e',
    gradient: ['#2dd4bf', '#14b8a6'],
    glow: 'rgba(45, 212, 191, 0.25)',
    bgLight: 'rgba(45, 212, 191, 0.12)',
  },
  {
    name: 'lime',
    primary: '#a3e635', // lime-400
    text: '#060a0e',
    gradient: ['#a3e635', '#84cc16'],
    glow: 'rgba(163, 230, 53, 0.25)',
    bgLight: 'rgba(163, 230, 53, 0.12)',
  }
];

export const DEFAULT_GREEN_THEME = THEMES[0];

export const getThemeForWorkout = (type?: string, weeklyPlan?: WeeklyPlan): WorkoutTheme => {
  if (!type || type === 'All' || type.toLowerCase() === 'rest') {
    return DEFAULT_GREEN_THEME;
  }

  // If weekly plan is provided, match by plan categories index
  if (weeklyPlan?.categories && weeklyPlan.categories.length > 0) {
    const categoryIndex = weeklyPlan.categories.indexOf(type);
    if (categoryIndex !== -1) {
      return THEMES[categoryIndex % THEMES.length];
    }
  }

  // Fallback deterministic hashing
  let hash = 0;
  for (let i = 0; i < type.length; i++) {
    hash = type.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % THEMES.length;
  return THEMES[index];
};

/**
 * Returns a hex color for the tile based on intensity, interpolating between the theme primary and dark backgrounds.
 * This mirrors the web frontend's GitHub-style 4-tier intensity levels.
 */
export const getTileBgColor = (hours: number, workoutType?: string, weeklyPlan?: WeeklyPlan): string => {
  if (workoutType && (workoutType.toLowerCase() === 'freeze' || workoutType.toLowerCase() === 'frozen')) {
    return Colors.iceFrost;
  }
  if (workoutType && workoutType.toLowerCase() === 'rest') {
    return Colors.slateRest;
  }
  if (hours <= 0) return '#18181b';

  // Find the exact primary color for this category
  const theme = getThemeForWorkout(workoutType, weeklyPlan);
  
  // Return different opacity levels as hex codes or rgba depending on tier. 
  // We'll mimic the green shades from web but adapt them to the chosen primary color.
  
  // For green, web used: <1.0 = #0e4429, <1.5 = #006d32, <2.0 = #26a641, >=2.0 = #39d353
  // This is roughly 25%, 45%, 70%, 100% brightness.
  // We can return the primary color combined with an opacity using rgba.
  
  // Extract RGB from hex (assuming hex format like #RRGGBB)
  const hex = theme.primary.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  if (hours < 1.0) return `rgba(${r}, ${g}, ${b}, 0.25)`; // Tier 1
  if (hours < 1.5) return `rgba(${r}, ${g}, ${b}, 0.45)`; // Tier 2
  if (hours < 2.0) return `rgba(${r}, ${g}, ${b}, 0.7)`;  // Tier 3
  return theme.primary; // Tier 4 (Peak)
};


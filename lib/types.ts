export type WorkoutType = string;

export interface WeeklyPlan {
  id: string;
  name: string;
  description?: string;
  categories: string[];
}

export interface GymLog {
  id: string;
  date: string; // YYYY-MM-DD
  hours: number;
  workoutType: WorkoutType;
  notes?: string;
  updatedAt?: string;
}

export interface User {
  email: string;
  name: string;
  avatarUrl?: string;
  provider: 'email' | 'google';
  weeklyPlan?: WeeklyPlan;
}

export interface MonthlyStat {
  month: string;
  monthIndex: number;
  year: number;
  count: number;
  totalHours: number;
}

export interface Stats {
  currentStreak: number;
  longestStreak: number;
  totalDays: number;
  totalHours: number;
  averageHoursPerSession: number;
  monthlyData: MonthlyStat[];
  scientificStreak?: StreakAnalysis;
}

export type TimeframeView = 'year' | 'month' | 'week';

export interface AnimePower {
  id: string;
  name: string;
  image: any;
  power: number;
}

export interface PowerScoreBreakdown {
  consistencyScore: number;    // 0 - 45
  durationQualityScore: number;// 0 - 25
  varietyScore: number;        // 0 - 20
  momentumScore: number;       // 0 - 10
  totalScore: number;          // 0 - 100
  character: AnimePower;
  activeDays: number;
  totalDays: number;
  avgSessionHours: number;
  uniqueTypesCount: number;
  evaluationText: string;
}

export interface StreakAnalysis {
  currentStreakDays: number;
  longestStreakDays: number;
  complianceRate: number;
  currentWeekDone: number;
  currentWeekTarget: number;
  currentWeekStatus: 'On Track' | 'Target Met' | 'Behind';
  breakReason?: string;
}

export const PREBUILT_PLANS: WeeklyPlan[] = [
  {
    id: 'ppl-standard',
    name: 'Push / Pull / Legs (PPL)',
    description: 'Classic 4-day active split focusing on movement patterns.',
    categories: ['Push', 'Pull', 'Legs', 'Cardio', 'Custom'],
  },
  {
    id: 'ppl-core',
    name: 'PPL + Core & Cardio',
    description: 'Comprehensive 5-day athletic split.',
    categories: ['Push', 'Pull', 'Legs', 'Core', 'Cardio', 'Custom'],
  },
  {
    id: 'upper-lower',
    name: 'Upper / Lower Split',
    description: '4-day hypertrophy split split into upper & lower body.',
    categories: ['Upper Body', 'Lower Body', 'Core & Cardio', 'Custom'],
  },
  {
    id: 'full-body',
    name: 'Full Body & Functional',
    description: '3-day full body strength & conditioning plan.',
    categories: ['Full Body', 'Cardio', 'Mobility', 'Custom'],
  },
];

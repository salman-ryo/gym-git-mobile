export type WorkoutType = string;

export interface WeeklyPlan {
  id: string;
  name: string;
  description?: string;
  categories: string[]; // e.g. ['Push', 'Pull', 'Legs', 'Core', 'Cardio']
  daysPerWeek?: number; // e.g. 3, 4, 5, 6
  schedule?: string[]; // 7-day schedule Mon-Sun: e.g. ['Push', 'Pull', 'Legs', 'Rest', 'Cardio', 'Rest', 'Rest']
}

export interface GymLog {
  id: string;
  date: string; // YYYY-MM-DD
  hours: number;
  workoutType: WorkoutType;
  notes?: string;
  updatedAt?: string;
}

export interface CheckinSnoozeStatus {
  date?: string;
  snoozed_at?: string;
  is_snoozed: boolean;
  remaining_seconds: number;
}

export interface User {
  email: string;
  name: string;
  avatarUrl?: string;
  provider: 'email' | 'google';
  weeklyPlan?: WeeklyPlan;
  queuedWeeklyPlanId?: string | null;
  streak?: UserStreak;
  checkinSnooze?: CheckinSnoozeStatus;
}

export interface MonthlyStat {
  month: string; // e.g. 'Jan', 'Feb'
  monthIndex: number; // 0..11
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
  cycleInfo?: CycleInfo;
  accuracyScore?: number;
  isFrozen?: boolean;
  streakBrokenEvent?: StreakBrokenEvent | null;
  streakWarningEvent?: StreakWarningEvent | null;
}

export interface CycleInfo {
  cycle_start_date: string;
  cycle_end_date: string;
  workouts_completed_in_cycle: number;
  workouts_target_in_cycle: number;
  rest_tokens_total: number;
  rest_tokens_used: number;
  rest_tokens_remaining: number;
  days_remaining_in_cycle: number;
}

export interface StreakBrokenEvent {
  previous_streak: number;
  broken_on: string;
  restore_shield_available: boolean;
  restore_shields_count: number;
  can_restore_until: string;
}

export interface StreakWarningEvent {
  is_at_risk: boolean;
  hours_remaining: number;
  rest_tokens_left: number;
  message: string;
}

export interface ItemCatalogItem {
  item_id: 'RESTORE_SHIELD' | 'STREAK_FREEZE_TOKEN' | 'XP_BOOST' | 'ACCURACY_CHARM';
  name: string;
  effect_type: 'INSTANT_USE' | 'TIME_BASED';
  duration_seconds: number;
  description: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  icon: string;
}

export interface UserInventoryItem {
  item_id: string;
  quantity: number;
  item_details: ItemCatalogItem;
}

export interface ActiveItemEffect {
  item_id: string;
  activated_at: string;
  expires_at: string;
  remaining_seconds: number;
}

export type MilestoneStatus = 'LOCKED' | 'CLAIMABLE' | 'CLAIMED';

export interface RoadmapMilestone {
  milestone_id: string;
  plan_id: string;
  streak_target: number;
  item_id: string;
  item_name: string;
  item_icon: string;
  rarity: string;
  quantity: number;
  title: string;
  description: string;
  badge_slug: string;
  status: MilestoneStatus;
  claimed_at?: string;
}

export interface UserStreak {
  currentStreak: number;
  longestStreak: number;
  complianceRate: number;
  cycleInfo?: CycleInfo;
  accuracyScore: number;
  isFrozen: boolean;
  streakBrokenEvent?: StreakBrokenEvent | null;
  streakWarningEvent?: StreakWarningEvent | null;
}

export interface RawStreakResponse {
  current_streak?: number;
  currentStreak?: number;
  longest_streak?: number;
  longestStreak?: number;
  compliance_rate?: number;
  complianceRate?: number;
  cycle_info?: {
    cycle_start_date: string;
    cycle_end_date: string;
    workouts_completed_in_cycle: number;
    workouts_target_in_cycle: number;
    rest_tokens_total: number;
    rest_tokens_used: number;
    rest_tokens_remaining: number;
    days_remaining_in_cycle: number;
  };
  accuracy_score?: number;
  accuracyScore?: number;
  is_frozen?: boolean;
  isFrozen?: boolean;
  streak_broken_event?: {
    previous_streak: number;
    broken_on: string;
    restore_shield_available: boolean;
    restore_shields_count: number;
    can_restore_until: string;
  };
  streak_warning_event?: {
    is_at_risk: boolean;
    hours_remaining: number;
    rest_tokens_left: number;
    message: string;
  };
  streak?: RawStreakResponse;
}

export interface RawStatsResponse {
  total_sessions?: number;
  totalDays?: number;
  total_hours?: number;
  totalHours?: number;
  avg_session_duration?: number;
  averageHoursPerSession?: number;
  streak?: RawStreakResponse;
  current_streak?: number;
  currentStreak?: number;
  longest_streak?: number;
  longestStreak?: number;
  compliance_rate?: number;
  complianceRate?: number;
  cycle_info?: {
    cycle_start_date: string;
    cycle_end_date: string;
    workouts_completed_in_cycle: number;
    workouts_target_in_cycle: number;
    rest_tokens_total: number;
    rest_tokens_used: number;
    rest_tokens_remaining: number;
    days_remaining_in_cycle: number;
  };
  accuracy_score?: number;
  accuracyScore?: number;
  is_frozen?: boolean;
  isFrozen?: boolean;
  streak_broken_event?: {
    previous_streak: number;
    broken_on: string;
    restore_shield_available: boolean;
    restore_shields_count: number;
    can_restore_until: string;
  };
  streak_warning_event?: {
    is_at_risk: boolean;
    hours_remaining: number;
    rest_tokens_left: number;
    message: string;
  };
}

export interface RawAuthMeResponse {
  user?: {
    email?: string;
    name?: string;
    avatar_url?: string;
    avatarUrl?: string;
    provider?: 'email' | 'google';
    weeklyPlan?: WeeklyPlan;
    weekly_plan_id?: string;
    queued_weekly_plan_id?: string | null;
    queuedWeeklyPlanId?: string | null;
    timezone?: string;
  };
  plan?: WeeklyPlan;
  streak?: RawStreakResponse;
  checkin_snooze?: CheckinSnoozeStatus;
  email?: string;
  name?: string;
  avatar_url?: string;
  avatarUrl?: string;
  provider?: 'email' | 'google';
  weeklyPlan?: WeeklyPlan;
  weekly_plan_id?: string;
  queued_weekly_plan_id?: string | null;
  queuedWeeklyPlanId?: string | null;
}

export type TimeframeView = 'year' | 'month' | 'week';

export interface AnimePower {
  id: string;
  name: string;
  image: any;
  minPower: number;
  description?: string;
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
    daysPerWeek: 4,
    schedule: ['Push', 'Pull', 'Legs', 'Rest', 'Cardio', 'Rest', 'Rest'],
    categories: ['Push', 'Pull', 'Legs', 'Cardio', 'Custom'],
  },
  {
    id: 'upper-lower',
    name: 'Upper / Lower Split',
    description: '4-day hypertrophy split divided into upper & lower body.',
    daysPerWeek: 4,
    schedule: ['Upper Body', 'Lower Body', 'Rest', 'Upper Body', 'Lower Body', 'Rest', 'Rest'],
    categories: ['Upper Body', 'Lower Body', 'Core & Cardio', 'Custom'],
  },
  {
    id: 'full-body',
    name: 'Full Body & Functional',
    description: '3-day full body strength & conditioning plan.',
    daysPerWeek: 3,
    schedule: ['Full Body', 'Rest', 'Cardio', 'Rest', 'Mobility', 'Rest', 'Rest'],
    categories: ['Full Body', 'Cardio', 'Mobility', 'Custom'],
  },
  {
    id: 'ppl-core',
    name: 'PPL + Core & Cardio',
    description: 'Comprehensive 5-day athletic split.',
    daysPerWeek: 5,
    schedule: ['Push', 'Pull', 'Legs', 'Core', 'Cardio', 'Rest', 'Rest'],
    categories: ['Push', 'Pull', 'Legs', 'Core', 'Cardio', 'Custom'],
  },
  {
    id: 'bro-split',
    name: 'Classic Bodypart Split',
    description: '5-day muscle isolation targeting one group per day.',
    daysPerWeek: 5,
    schedule: ['Chest', 'Back', 'Shoulders', 'Legs', 'Arms', 'Rest', 'Rest'],
    categories: ['Chest', 'Back', 'Shoulders', 'Legs', 'Arms', 'Custom'],
  },
  {
    id: 'ppl',
    name: '6-Day Push / Pull / Legs (PPL x2)',
    description: 'High frequency 6-day split with 1 active rest token.',
    daysPerWeek: 6,
    schedule: ['Push', 'Pull', 'Legs', 'Push', 'Pull', 'Legs', 'Rest'],
    categories: ['Push', 'Pull', 'Legs', 'Custom'],
  },
];

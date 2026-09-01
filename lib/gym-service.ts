import { api } from '@/utils/api';
import { animePowerLevels } from '@/assets/anime';
import { calculateScientificPowerScore, PowerScoreBreakdown } from './scientific-power';
import { calculateScientificStreak } from './scientific-streak';
import {
  GymLog,
  MonthlyStat,
  Stats,
  WeeklyPlan,
  UserStreak,
  RawStreakResponse,
  RawStatsResponse,
} from './types';

/**
 * Service wrapper for Gym Logs & Analytics in Mobile App.
 * Routes requests strictly to the Go backend via utils/api.ts.
 */

export function mapGymLog(raw: any): GymLog {
  if (!raw) {
    return {
      id: '',
      date: '',
      hours: 0,
      workoutType: 'Custom',
    };
  }

  return {
    id: raw.id || '',
    date: raw.date || '',
    hours: typeof raw.hours === 'number' ? raw.hours : parseFloat(raw.hours || '0'),
    workoutType: raw.workout_type || raw.workoutType || 'Custom',
    notes: raw.notes || undefined,
    updatedAt: raw.updated_at || raw.updatedAt,
  };
}

export async function fetchGymLogs(
  startDate?: string,
  endDate?: string,
  workoutType?: string
): Promise<GymLog[]> {
  const queryParams = new URLSearchParams();
  if (startDate) queryParams.append('startDate', startDate);
  if (endDate) queryParams.append('endDate', endDate);
  if (workoutType && workoutType !== 'All') queryParams.append('workoutType', workoutType);

  const queryString = queryParams.toString();
  const endpoint = `/logs${queryString ? `?${queryString}` : ''}`;

  const rawLogs = await api.get<any[]>(endpoint);
  return (Array.isArray(rawLogs) ? rawLogs : []).map(mapGymLog);
}

export async function saveGymLog(
  date: string,
  hours: number,
  workoutType: string,
  notes?: string
): Promise<GymLog> {
  const payload = {
    date,
    hours,
    workout_type: workoutType,
    notes: notes || undefined,
  };

  const rawLog = await api.post<any>('/logs', payload);
  return mapGymLog(rawLog);
}

export async function deleteGymLog(date: string): Promise<void> {
  await api.delete(`/logs/${date}`);
}

export async function fetchDashboardStateAPI(): Promise<import('./types').DashboardState | null> {
  try {
    const data = await api.get<any>('/auth/state');
    if (!data) return null;

    let streakObj: import('./types').UserStreak | undefined;
    if (data.streak) {
      const s = data.streak;
      streakObj = {
        currentStreak: s.current_streak ?? s.currentStreak ?? 0,
        longestStreak: s.longest_streak ?? s.longestStreak ?? 0,
        complianceRate: s.compliance_rate ?? s.complianceRate ?? 0,
        cycleInfo: s.cycle_info ? {
          cycle_start_date: s.cycle_info.cycle_start_date,
          cycle_end_date: s.cycle_info.cycle_end_date,
          workouts_completed_in_cycle: s.cycle_info.workouts_completed_in_cycle,
          workouts_target_in_cycle: s.cycle_info.workouts_target_in_cycle,
          rest_tokens_total: s.cycle_info.rest_tokens_total,
          rest_tokens_used: s.cycle_info.rest_tokens_used,
          rest_tokens_remaining: s.cycle_info.rest_tokens_remaining,
          days_remaining_in_cycle: s.cycle_info.days_remaining_in_cycle,
        } : undefined,
        accuracyScore: s.accuracy_score ?? s.accuracyScore ?? 0,
        isFrozen: s.is_frozen ?? s.isFrozen ?? false,
        streakBrokenEvent: s.streak_broken_event ? {
          previous_streak: s.streak_broken_event.previous_streak,
          last_streak_date: s.streak_broken_event.last_streak_date,
          broken_on: s.streak_broken_event.broken_on,
          missed_days_count: s.streak_broken_event.missed_days_count,
          required_shields: s.streak_broken_event.required_shields,
          restore_shield_available: s.streak_broken_event.restore_shield_available,
          restore_shields_count: s.streak_broken_event.restore_shields_count,
          missed_dates: s.streak_broken_event.missed_dates,
          can_restore_until: s.streak_broken_event.can_restore_until,
        } : null,
        streakWarningEvent: s.streak_warning_event ? {
          is_at_risk: s.streak_warning_event.is_at_risk,
          hours_remaining: s.streak_warning_event.hours_remaining,
          rest_tokens_left: s.streak_warning_event.rest_tokens_left,
          message: s.streak_warning_event.message,
        } : null,
      };
    }

    const p = data.plan;

    return {
      plan: p ? {
        id: p.id,
        name: p.name,
        description: p.description,
        categories: p.categories || [],
      } : undefined,
      queuedWeeklyPlanId: data.queued_weekly_plan_id || data.queuedWeeklyPlanId || null,
      streak: streakObj,
      checkinSnooze: data.checkin_snooze ? {
        date: data.checkin_snooze.date,
        snoozed_at: data.checkin_snooze.snoozed_at,
        is_snoozed: data.checkin_snooze.is_snoozed,
        remaining_seconds: data.checkin_snooze.remaining_seconds,
      } : undefined,
    };
  } catch (err) {
    console.error('Failed to fetch dashboard state', err);
    return null;
  }
}

export async function updateUserPlanAPI(plan: import('./types').WeeklyPlan): Promise<void> {
  const payload: Record<string, unknown> = { plan_id: plan.id };
  if (plan.id === 'custom-plan') {
    payload.name = plan.name;
    payload.description = plan.description;
    payload.categories = plan.categories;
  }
  await api.put('/auth/plan', payload);
}

export async function fetchDashboardStats(_userPlan?: WeeklyPlan, existingLogs?: GymLog[]): Promise<Stats> {
  const [rawStats, rawStreak, logs] = await Promise.all([
    api.get<RawStatsResponse>('/stats').catch(() => null),
    api.get<RawStreakResponse>('/streak').catch(() => null),
    existingLogs !== undefined ? Promise.resolve(existingLogs) : fetchGymLogs().catch(() => []),
  ]);

  let oldestDate = new Date();
  if (logs.length > 0) {
    logs.forEach((log) => {
      const logDate = new Date(log.date);
      if (logDate < oldestDate) oldestDate = logDate;
    });
  }

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonthIdx = today.getMonth();

  const startYear = oldestDate.getFullYear();
  const startMonthIdx = oldestDate.getMonth();

  const monthlyData: MonthlyStat[] = [];
  let tempYear = startYear;
  let tempMonthIdx = startMonthIdx;

  while (tempYear < currentYear || (tempYear === currentYear && tempMonthIdx <= 11)) {
    let count = 0;
    let totalHours = 0;

    logs.forEach((log) => {
      if (!log.date) return;
      const [yStr, mStr] = log.date.split('-');
      const year = parseInt(yStr, 10);
      const monthIdx = parseInt(mStr, 10) - 1;
      if (year === tempYear && monthIdx === tempMonthIdx) {
        count += 1;
        totalHours += log.hours || 0;
      }
    });

    monthlyData.push({
      month: monthNames[tempMonthIdx],
      monthIndex: tempMonthIdx,
      year: tempYear,
      count,
      totalHours: Math.round(totalHours * 10) / 10,
    });

    tempMonthIdx++;
    if (tempMonthIdx > 11) {
      tempMonthIdx = 0;
      tempYear++;
    }
  }

  if (monthlyData.length === 0) {
    monthlyData.push({
      month: monthNames[currentMonthIdx],
      monthIndex: currentMonthIdx,
      year: currentYear,
      count: 0,
      totalHours: 0,
    });
  }

  const streakFull = rawStreak?.streak || rawStreak || {};
  const streakStats = rawStats?.streak || {};
  const streakObj = Object.keys(streakFull).length > 0 ? streakFull : streakStats;

  const currentStreak = streakObj.current_streak ?? streakObj.currentStreak ?? 0;
  const longestStreak = streakObj.longest_streak ?? streakObj.longestStreak ?? currentStreak;
  const totalDays = rawStats?.total_sessions ?? rawStats?.totalDays ?? logs.length;
  const totalHours = rawStats?.total_hours ?? rawStats?.totalHours ?? 0;
  const averageHoursPerSession = rawStats?.avg_session_duration ?? rawStats?.averageHoursPerSession ?? 0;

  const cycleInfo = streakObj.cycle_info ? {
    cycle_start_date: streakObj.cycle_info.cycle_start_date,
    cycle_end_date: streakObj.cycle_info.cycle_end_date,
    workouts_completed_in_cycle: streakObj.cycle_info.workouts_completed_in_cycle,
    workouts_target_in_cycle: streakObj.cycle_info.workouts_target_in_cycle,
    rest_tokens_total: streakObj.cycle_info.rest_tokens_total,
    rest_tokens_used: streakObj.cycle_info.rest_tokens_used,
    rest_tokens_remaining: streakObj.cycle_info.rest_tokens_remaining,
    days_remaining_in_cycle: streakObj.cycle_info.days_remaining_in_cycle,
  } : undefined;

  const accuracyScore = streakObj.accuracy_score ?? streakObj.accuracyScore ?? undefined;
  const isFrozen = streakObj.is_frozen ?? streakObj.isFrozen ?? undefined;

  const streakBrokenEvent = streakObj.streak_broken_event ? {
    previous_streak: streakObj.streak_broken_event.previous_streak,
    last_streak_date: streakObj.streak_broken_event.last_streak_date,
    broken_on: streakObj.streak_broken_event.broken_on,
    missed_days_count: streakObj.streak_broken_event.missed_days_count,
    required_shields: streakObj.streak_broken_event.required_shields,
    restore_shield_available: streakObj.streak_broken_event.restore_shield_available,
    restore_shields_count: streakObj.streak_broken_event.restore_shields_count,
    missed_dates: streakObj.streak_broken_event.missed_dates,
    can_restore_until: streakObj.streak_broken_event.can_restore_until,
  } : null;

  const streakWarningEvent = streakObj.streak_warning_event ? {
    is_at_risk: streakObj.streak_warning_event.is_at_risk,
    hours_remaining: streakObj.streak_warning_event.hours_remaining,
    rest_tokens_left: streakObj.streak_warning_event.rest_tokens_left,
    message: streakObj.streak_warning_event.message,
  } : null;

  const scientificStreak = calculateScientificStreak(logs, _userPlan);

  return {
    currentStreak,
    longestStreak: Math.max(longestStreak, scientificStreak.longestStreakDays),
    totalDays,
    totalHours: Math.round(totalHours * 10) / 10,
    averageHoursPerSession: Math.round(averageHoursPerSession * 10) / 10,
    monthlyData,
    scientificStreak,
    cycleInfo,
    accuracyScore,
    isFrozen,
    streakBrokenEvent,
    streakWarningEvent,
  };
}

export async function fetchStreakLifecycle(): Promise<UserStreak> {
  const data = await api.get<RawStreakResponse>('/streak');
  const s = data?.streak || data || {};
  return {
    currentStreak: s.current_streak ?? s.currentStreak ?? 0,
    longestStreak: s.longest_streak ?? s.longestStreak ?? 0,
    complianceRate: s.compliance_rate ?? s.complianceRate ?? 0,
    cycleInfo: s.cycle_info ? {
      cycle_start_date: s.cycle_info.cycle_start_date,
      cycle_end_date: s.cycle_info.cycle_end_date,
      workouts_completed_in_cycle: s.cycle_info.workouts_completed_in_cycle,
      workouts_target_in_cycle: s.cycle_info.workouts_target_in_cycle,
      rest_tokens_total: s.cycle_info.rest_tokens_total,
      rest_tokens_used: s.cycle_info.rest_tokens_used,
      rest_tokens_remaining: s.cycle_info.rest_tokens_remaining,
      days_remaining_in_cycle: s.cycle_info.days_remaining_in_cycle,
    } : undefined,
    accuracyScore: s.accuracy_score ?? s.accuracyScore ?? 0,
    isFrozen: s.is_frozen ?? s.isFrozen ?? false,
    streakBrokenEvent: s.streak_broken_event ? {
      previous_streak: s.streak_broken_event.previous_streak,
      last_streak_date: s.streak_broken_event.last_streak_date,
      broken_on: s.streak_broken_event.broken_on,
      missed_days_count: s.streak_broken_event.missed_days_count,
      required_shields: s.streak_broken_event.required_shields,
      restore_shield_available: s.streak_broken_event.restore_shield_available,
      restore_shields_count: s.streak_broken_event.restore_shields_count,
      missed_dates: s.streak_broken_event.missed_dates,
      can_restore_until: s.streak_broken_event.can_restore_until,
    } : null,
    streakWarningEvent: s.streak_warning_event ? {
      is_at_risk: s.streak_warning_event.is_at_risk,
      hours_remaining: s.streak_warning_event.hours_remaining,
      rest_tokens_left: s.streak_warning_event.rest_tokens_left,
      message: s.streak_warning_event.message,
    } : null,
  };
}

export async function fetchPowerScore(
  logs: GymLog[],
  days: number = 30,
  targetWeeklyDays: number = 4
): Promise<PowerScoreBreakdown> {
  try {
    const rawPower = await api.get<any>(`/stats/power?days=${days}`);
    if (rawPower?.power_score) {
      const ps = rawPower.power_score;
      const score = ps.total_score || 0;
      const sortedChars = [...animePowerLevels].sort((a, b) => b.minPower - a.minPower);
      const matchedChar = sortedChars.find((c) => score >= c.minPower) || animePowerLevels[0];

      return {
        consistencyScore: ps.consistency || 0,
        durationQualityScore: ps.duration_quality || 0,
        varietyScore: ps.variety || 0,
        momentumScore: ps.momentum || 0,
        totalScore: score,
        character: matchedChar,
        activeDays: rawPower.active_days || 0,
        totalDays: days,
        avgSessionHours: 0,
        uniqueTypesCount: rawPower.unique_workout_types || 0,
        evaluationText: `Gym Power Score: ${score}/100`,
      };
    }
  } catch {
    // Fall back to client calculation if backend call fails
  }
  return calculateScientificPowerScore(logs, days, targetWeeklyDays);
}

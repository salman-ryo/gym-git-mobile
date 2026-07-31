import { api } from '@/utils/api';
import { GymLog, MonthlyStat, Stats, WeeklyPlan } from './types';
import { calculateScientificStreak } from './scientific-streak';

export function mapGymLog(raw: any): GymLog {
  if (!raw) return { id: '', date: '', hours: 0, workoutType: 'Custom' };
  return {
    id: raw.id || '',
    date: raw.date || '',
    hours: typeof raw.hours === 'number' ? raw.hours : parseFloat(raw.hours || '0'),
    workoutType: raw.workout_type || raw.workoutType || 'Custom',
    notes: raw.notes || undefined,
    updatedAt: raw.updated_at || raw.updatedAt,
  };
}

export async function fetchGymLogs(startDate?: string, endDate?: string, workoutType?: string): Promise<GymLog[]> {
  const queryParams = new URLSearchParams();
  if (startDate) queryParams.append('startDate', startDate);
  if (endDate) queryParams.append('endDate', endDate);
  if (workoutType && workoutType !== 'All') queryParams.append('workoutType', workoutType);

  const queryString = queryParams.toString();
  const endpoint = `/logs${queryString ? `?${queryString}` : ''}`;
  const rawLogs = await api.get<any[]>(endpoint);
  return (Array.isArray(rawLogs) ? rawLogs : []).map(mapGymLog);
}

export async function saveGymLog(date: string, hours: number, workoutType: string, notes?: string): Promise<GymLog> {
  const payload = { date, hours, workout_type: workoutType, notes: notes || undefined };
  const rawLog = await api.post<any>('/logs', payload);
  return mapGymLog(rawLog);
}

export async function deleteGymLog(date: string): Promise<void> {
  await api.delete(`/logs/${date}`);
}

export async function fetchDashboardStats(_userPlan?: WeeklyPlan): Promise<Stats> {
  const [rawStats, logs] = await Promise.all([
    api.get<any>('/stats').catch(() => null),
    fetchGymLogs().catch(() => []),
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
      if (parseInt(yStr, 10) === tempYear && parseInt(mStr, 10) - 1 === tempMonthIdx) {
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
    monthlyData.push({ month: monthNames[today.getMonth()], monthIndex: today.getMonth(), year: currentYear, count: 0, totalHours: 0 });
  }

  const streakObj = rawStats?.streak || {};
  const currentStreak = streakObj.current_streak ?? streakObj.currentStreak ?? 0;
  const totalDays = rawStats?.total_sessions ?? rawStats?.totalDays ?? logs.length;
  const totalHours = rawStats?.total_hours ?? rawStats?.totalHours ?? 0;
  const averageHoursPerSession = rawStats?.avg_session_duration ?? rawStats?.averageHoursPerSession ?? 0;

  const scientificStreak = calculateScientificStreak(logs, _userPlan);

  return {
    currentStreak,
    longestStreak: Math.max(currentStreak, scientificStreak.longestStreakDays),
    totalDays,
    totalHours: Math.round(totalHours * 10) / 10,
    averageHoursPerSession: Math.round(averageHoursPerSession * 10) / 10,
    monthlyData,
    scientificStreak,
  };
}

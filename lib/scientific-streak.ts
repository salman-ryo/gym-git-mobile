import { GymLog, StreakAnalysis, WeeklyPlan } from './types';

export function formatDateKey(date: Date): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * "2026-08-01" → "Friday, August 1, 2026"
 */
export function formatDisplayDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  });
}

/**
 * "2026-08-01" → "Aug 1"
 */
export function formatShortDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}


export function calculateScientificStreak(logs: GymLog[], plan?: WeeklyPlan): StreakAnalysis {
  let targetDaysPerWeek = 4;
  if (plan?.categories) {
    const activeCats = plan.categories.filter((c) => c.toLowerCase() !== 'rest');
    targetDaysPerWeek = Math.min(6, Math.max(3, activeCats.length));
  }

  const activeDatesSet = new Set<string>();
  logs.forEach((log) => {
    if (log.hours > 0) activeDatesSet.add(log.date);
  });

  const today = new Date();

  const getWindowActiveCount = (endDate: Date): number => {
    let count = 0;
    for (let i = 0; i < 7; i++) {
      const d = new Date(endDate);
      d.setDate(endDate.getDate() - i);
      if (activeDatesSet.has(formatDateKey(d))) count++;
    }
    return count;
  };

  const isDateCompliant = (checkDate: Date): boolean => {
    const dStr = formatDateKey(checkDate);
    if (activeDatesSet.has(dStr)) return true;
    return getWindowActiveCount(checkDate) >= Math.max(2, targetDaysPerWeek - 1);
  };

  let currentStreakDays = 0;
  let checkDate = new Date(today);
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  if (!isDateCompliant(today) && isDateCompliant(yesterday)) {
    checkDate = yesterday;
  }

  while (isDateCompliant(checkDate)) {
    currentStreakDays++;
    checkDate.setDate(checkDate.getDate() - 1);
    if (currentStreakDays > 365) break;
  }

  let longestStreakDays = 0;
  let tempStreak = 0;
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - 365);

  let iterDate = new Date(startDate);
  while (iterDate <= today) {
    if (isDateCompliant(iterDate)) {
      tempStreak++;
      if (tempStreak > longestStreakDays) longestStreakDays = tempStreak;
    } else {
      tempStreak = 0;
    }
    iterDate.setDate(iterDate.getDate() + 1);
  }

  const dayOfWeek = today.getDay();
  const distanceToMon = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const currentMonday = new Date(today);
  currentMonday.setDate(today.getDate() + distanceToMon);

  let currentWeekDone = 0;
  for (let i = 0; i < 7; i++) {
    const d = new Date(currentMonday);
    d.setDate(currentMonday.getDate() + i);
    if (d > today) break;
    if (activeDatesSet.has(formatDateKey(d))) currentWeekDone++;
  }

  let currentWeekStatus: 'On Track' | 'Target Met' | 'Behind' = 'On Track';
  if (currentWeekDone >= targetDaysPerWeek) {
    currentWeekStatus = 'Target Met';
  } else if (dayOfWeek >= 5 && currentWeekDone < targetDaysPerWeek - 1) {
    currentWeekStatus = 'Behind';
  }

  let totalTrackedDays = 0;
  let totalCompliantDays = 0;
  let evalDate = new Date(startDate);
  while (evalDate <= today) {
    totalTrackedDays++;
    if (isDateCompliant(evalDate)) totalCompliantDays++;
    evalDate.setDate(evalDate.getDate() + 1);
  }

  const complianceRate = Math.round((totalCompliantDays / Math.max(1, totalTrackedDays)) * 100);

  return {
    currentStreakDays,
    longestStreakDays: Math.max(longestStreakDays, currentStreakDays),
    complianceRate,
    currentWeekDone,
    currentWeekTarget: targetDaysPerWeek,
    currentWeekStatus,
  };
}

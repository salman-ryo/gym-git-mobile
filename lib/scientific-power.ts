import { animePowerLevels } from '@/assets/anime';
import { GymLog, PowerScoreBreakdown } from './types';

export function calculateScientificPowerScore(
  logs: GymLog[],
  periodTotalDays: number,
  targetWeeklyDays = 4
): PowerScoreBreakdown {
  const activeLogMap = new Map<string, GymLog>();
  const workoutTypesSet = new Set<string>();
  let totalHours = 0;

  logs.forEach((log) => {
    if (log.hours > 0) {
      activeLogMap.set(log.date, log);
      workoutTypesSet.add(log.workoutType);
      totalHours += log.hours;
    }
  });

  const activeDays = activeLogMap.size;
  const totalDays = Math.max(periodTotalDays, 1);

  // 1. Consistency Score (0 - 45)
  const targetActiveDays = Math.max(1, Math.round((targetWeeklyDays / 7) * totalDays));
  const consistencyRatio = Math.min(1.0, activeDays / targetActiveDays);
  const consistencyScore = Math.round(consistencyRatio * 45);

  // 2. Duration Quality Score (0 - 25) - Sweet spot: 0.75h to 1.75h
  let totalQualityScore = 0;
  if (activeDays > 0) {
    activeLogMap.forEach((log) => {
      const h = log.hours;
      let sessionQuality = 0;
      if (h >= 0.75 && h <= 1.75) {
        sessionQuality = 1.0;
      } else if (h > 1.75) {
        sessionQuality = Math.max(0.4, 1.0 - (h - 1.75) * 0.25);
      } else {
        sessionQuality = Math.max(0.2, h / 0.75);
      }
      totalQualityScore += sessionQuality;
    });
  }
  const avgSessionQuality = activeDays > 0 ? totalQualityScore / activeDays : 0;
  const durationQualityScore = Math.round(avgSessionQuality * 25);

  // 3. Variety Score (0 - 20)
  const uniqueTypesCount = workoutTypesSet.size;
  const varietyRatio = Math.min(1.0, uniqueTypesCount / 3);
  const varietyScore = Math.round(varietyRatio * 20);

  // 4. Momentum Score (0 - 10)
  const momentumRatio = activeDays > 0 ? Math.min(1.0, activeDays / (totalDays * 0.5)) : 0;
  const momentumScore = Math.round(momentumRatio * 10);

  // Total Power Score (0 - 100)
  const rawTotal = consistencyScore + durationQualityScore + varietyScore + momentumScore;
  const totalScore = activeDays > 0 ? Math.min(100, Math.max(5, rawTotal)) : 0;

  // Match Anime Tier
  const sortedChars = [...animePowerLevels].sort((a, b) => b.minPower - a.minPower);
  const matched = sortedChars.find((c) => totalScore >= c.minPower) || animePowerLevels[0];

  const avgSessionHours = activeDays > 0 ? Number((totalHours / activeDays).toFixed(1)) : 0;
  let evaluationText = 'No gym attendance recorded yet.';
  if (activeDays > 0) {
    if (consistencyScore >= 40 && durationQualityScore >= 20) {
      evaluationText = 'Ultra Instinct consistency! Perfect session duration and frequency.';
    } else if (consistencyScore >= 30) {
      evaluationText = 'High discipline! Consistent workout schedule with solid muscle balance.';
    } else if (durationQualityScore < 15 && totalHours > 10) {
      evaluationText = 'Warning: Overlong single sessions! Consistency matters more than binge workouts.';
    } else {
      evaluationText = 'Building fitness habits. Increase weekly frequency for higher power tiers!';
    }
  }

  return {
    consistencyScore,
    durationQualityScore,
    varietyScore,
    momentumScore,
    totalScore,
    character: matched,
    activeDays,
    totalDays,
    avgSessionHours,
    uniqueTypesCount,
    evaluationText,
  };
}

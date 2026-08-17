import { api } from '@/utils/api';
import { CheckinSnoozeStatus } from './types';

/**
 * Dynamic Backend-Driven Check-In "Later" Snooze & Late-Night Risk Utilities
 * All snooze state is dynamically stored and synced with the Go backend database.
 */

export const SNOOZE_DURATION_MINUTES = 30;
export const SNOOZE_DURATION_MS = SNOOZE_DURATION_MINUTES * 60 * 1000;

/**
 * Snoozes daily check-in for 30 minutes dynamically on the backend.
 */
export async function snoozeCheckIn(dateStr: string): Promise<CheckinSnoozeStatus> {
  return await api.post<CheckinSnoozeStatus>('/auth/checkin-snooze', { date: dateStr });
}

/**
 * Clears any active check-in snooze on the backend (e.g. after user logs session or rest day).
 */
export async function clearCheckInSnooze(): Promise<void> {
  await api.delete('/auth/checkin-snooze').catch(() => {});
}

/**
 * Checks if the current local time is 11:30 PM (23:30) or later.
 * At this time, snoozing 30 minutes would exceed midnight and jeopardize daily streak logging.
 */
export function isLateNightStreakRisk(now: Date = new Date()): boolean {
  const hours = now.getHours();
  const minutes = now.getMinutes();
  return hours === 23 && minutes >= 30;
}

/**
 * Returns the exact remaining minutes until local midnight.
 */
export function getMinutesUntilMidnight(now: Date = new Date()): number {
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  const diffMs = midnight.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diffMs / (1000 * 60)));
}

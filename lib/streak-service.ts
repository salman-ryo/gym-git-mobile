import { api } from '@/utils/api';

/**
 * Service wrapper for Streak Freeze, Unfreeze, and Recovery.
 * Routes requests strictly to the Go backend via utils/api.ts.
 */

export interface FreezeResult {
  is_frozen: boolean;
  tokens_consumed: number;
  remaining_tokens: number;
  active_until: string;
  details: string;
}

export interface UnfreezeResult {
  is_frozen: boolean;
  message: string;
}

export interface RestoreResult {
  success: boolean;
  restored_date: string;
  new_current_streak: number;
  shields_remaining: number;
  message: string;
}

/**
 * Activates a sickness/injury freeze vault using streak freeze token(s).
 */
export async function freezeStreak(
  durationDays: number,
  reason: string
): Promise<FreezeResult> {
  return api.post<FreezeResult>('/streak/freeze', {
    duration_days: durationDays,
    reason,
  });
}

/**
 * Manually deactivates an active streak freeze state.
 */
export async function unfreezeStreak(): Promise<UnfreezeResult> {
  return api.post<UnfreezeResult>('/streak/unfreeze');
}

/**
 * Consumes 1 Restore Shield to revive streak from a missed date.
 */
export async function restoreStreak(
  targetDate: string,
  workoutType?: string,
  hours?: number
): Promise<RestoreResult> {
  return api.post<RestoreResult>('/streak/restore', {
    target_date: targetDate,
    workout_type: workoutType,
    hours,
  });
}

import { api } from '@/utils/api';
import { RoadmapMilestone } from './types';

export interface ClaimRewardResult {
  success: boolean;
  streak_target: number;
  item_id: string;
  item_name: string;
  quantity_awarded: number;
  remaining_inventory: number;
  claimed_at: string;
}

/**
 * Service wrapper for Streak Reward Roadmap.
 * Routes requests strictly to the Go backend via utils/api.ts.
 */

/**
 * Retrieves the user streak progression roadmap with milestone statuses.
 */
export async function fetchRewardRoadmap(planId?: string): Promise<RoadmapMilestone[]> {
  const endpoint = `/rewards/roadmap${planId ? `?plan_id=${planId}` : ''}`;
  return api.get<RoadmapMilestone[]>(endpoint);
}

/**
 * Claims an unlocked milestone reward and grants the item into inventory.
 */
export async function claimReward(
  planId: string,
  streakTarget: number,
  itemId: string
): Promise<ClaimRewardResult> {
  return api.post<ClaimRewardResult>('/rewards/claim', {
    plan_id: planId,
    streak_target: streakTarget,
    item_id: itemId,
  });
}

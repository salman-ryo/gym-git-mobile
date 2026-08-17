import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { RoadmapMilestone } from '@/lib/types';
import { claimReward } from '@/lib/rewards-service';
import RoadmapMilestoneNode from './RoadmapMilestoneNode';
import { Gift, Award } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';

interface RewardRoadmapProps {
  milestones: RoadmapMilestone[];
  longestStreak: number;
  onClaimSuccess: (details: {
    itemName: string;
    itemId: string;
    quantity: number;
    rarity: string;
    description?: string;
  }) => Promise<void>;
  planId?: string;
}

export default function RewardRoadmap({
  milestones = [],
  longestStreak,
  onClaimSuccess,
  planId = 'ppl-standard',
}: RewardRoadmapProps) {
  const [claimLoadingId, setClaimLoadingId] = useState<string | null>(null);

  const sortedMilestones = useMemo(() => {
    return [...milestones].sort((a, b) => a.streak_target - b.streak_target);
  }, [milestones]);

  const handleClaim = async (milestone: RoadmapMilestone) => {
    setClaimLoadingId(milestone.milestone_id);
    try {
      const result = await claimReward(
        milestone.plan_id || planId,
        milestone.streak_target,
        milestone.item_id
      );
      if (result.success) {
        await onClaimSuccess({
          itemName: milestone.item_name,
          itemId: milestone.item_id,
          quantity: milestone.quantity,
          rarity: milestone.rarity,
          description: milestone.description,
        });
      }
    } catch (err) {
      console.error('Failed to claim reward:', err);
    } finally {
      setClaimLoadingId(null);
    }
  };

  if (sortedMilestones.length === 0) return null;

  return (
    <View style={styles.container}>
      {/* Top Ambient Glow */}
      <View style={styles.topGlowLine} />

      {/* Header */}
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <View style={styles.iconBox}>
            <Gift size={18} color={Colors.neonCyan} />
          </View>
          <View>
            <Text style={styles.titleText}>STREAK REWARD ROADMAP</Text>
            <Text style={styles.subtitleText}>Unlock RPG power items as your streak grows</Text>
          </View>
        </View>

        <View style={styles.longestStreakBadge}>
          <Award size={13} color={Colors.amber} />
          <Text style={styles.longestStreakLabel}>Longest:</Text>
          <Text style={styles.longestStreakValue}>{longestStreak}d</Text>
        </View>
      </View>

      {/* Horizontal Scrollable Timeline */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.timelineScrollContent}
      >
        {/* Continuous Connecting Line Background */}
        <View style={styles.connectingLine} />

        {sortedMilestones.map((milestone) => (
          <RoadmapMilestoneNode
            key={milestone.milestone_id}
            milestone={milestone}
            onClaim={handleClaim}
            isClaiming={claimLoadingId === milestone.milestone_id}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#090d13',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1a2332',
    padding: 16,
    marginBottom: 16,
    position: 'relative',
    overflow: 'hidden',
  },
  topGlowLine: {
    position: 'absolute',
    top: 0,
    left: '25%',
    right: '25%',
    height: 2,
    backgroundColor: Colors.neonCyan,
    opacity: 0.4,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#1a2332',
    flexWrap: 'wrap',
    gap: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(34, 211, 238, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(34, 211, 238, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#f4f4f5',
    letterSpacing: 0.8,
  },
  subtitleText: {
    fontSize: 10.5,
    color: '#71717a',
    marginTop: 2,
  },
  longestStreakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  longestStreakLabel: {
    fontSize: 10,
    color: '#a1a1aa',
    fontWeight: '600',
  },
  longestStreakValue: {
    fontSize: 11,
    fontWeight: '900',
    color: Colors.amber,
  },
  timelineScrollContent: {
    paddingVertical: 12,
    gap: 16,
    position: 'relative',
  },
  connectingLine: {
    position: 'absolute',
    top: 46,
    left: 85,
    right: 85,
    height: 2,
    backgroundColor: '#1a2332',
    zIndex: -1,
  },
});

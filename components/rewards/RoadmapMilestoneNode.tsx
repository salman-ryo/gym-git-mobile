import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { RoadmapMilestone } from '@/lib/types';
import ItemIcon from '@/components/inventory/ItemIcon';
import { Lock, Gift, Check } from 'lucide-react-native';
import { Colors, getRarityStyles } from '@/constants/Colors';
import * as Haptics from 'expo-haptics';

interface RoadmapMilestoneNodeProps {
  milestone: RoadmapMilestone;
  onClaim: (milestone: RoadmapMilestone) => Promise<void>;
  isClaiming: boolean;
}

export default function RoadmapMilestoneNode({
  milestone,
  onClaim,
  isClaiming,
}: RoadmapMilestoneNodeProps) {
  const { status, streak_target, item_id, item_name, quantity, title, rarity } = milestone;
  const rStyles = getRarityStyles(rarity);

  const isLocked = status === 'LOCKED';
  const isClaimable = status === 'CLAIMABLE';
  const isClaimed = status === 'CLAIMED';

  const handleClaimPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onClaim(milestone);
  };

  return (
    <View style={styles.container}>
      {/* Target Day Header Indicator */}
      <View style={styles.targetDayContainer}>
        {isClaimed ? (
          <Text style={[styles.targetDayText, { color: Colors.neonGreen }]}>
            ✓ Day {streak_target}
          </Text>
        ) : isClaimable ? (
          <Text style={[styles.targetDayText, { color: Colors.neonCyan }]}>
            Day {streak_target}
          </Text>
        ) : (
          <Text style={[styles.targetDayText, { color: '#71717a' }]}>
            Day {streak_target}
          </Text>
        )}
      </View>

      {/* Anchor Dot */}
      <View style={styles.anchorDotContainer}>
        <View
          style={[
            styles.anchorDot,
            isClaimed && styles.anchorDotClaimed,
            isClaimable && styles.anchorDotClaimable,
            isLocked && styles.anchorDotLocked,
          ]}
        />
      </View>

      {/* Milestone Card */}
      <View
        style={[
          styles.milestoneCard,
          {
            borderColor: isLocked ? '#1a2332' : isClaimable ? Colors.neonCyan : rStyles.border,
            backgroundColor: isLocked ? 'rgba(9, 13, 19, 0.4)' : 'rgba(9, 13, 19, 0.85)',
          },
        ]}
      >
        {/* Item Icon Frame */}
        <View style={styles.iconFrameWrapper}>
          <View
            style={[
              styles.iconBox,
              {
                borderColor: isLocked ? '#27272a' : rStyles.border,
                backgroundColor: isLocked ? 'rgba(24, 24, 27, 0.4)' : rStyles.bg,
              },
            ]}
          >
            <ItemIcon itemId={item_id} size={26} />
          </View>
          {isLocked && (
            <View style={styles.lockBadge}>
              <Lock size={10} color="#71717a" />
            </View>
          )}
        </View>

        {/* Title and Item Details */}
        <View style={styles.detailsCol}>
          <Text
            style={[
              styles.milestoneTitle,
              { color: isLocked ? '#71717a' : '#ffffff' },
            ]}
            numberOfLines={1}
          >
            {title}
          </Text>
          <View
            style={[
              styles.rewardPill,
              {
                backgroundColor: isLocked ? '#18181b' : rStyles.badgeBg,
                borderColor: isLocked ? '#27272a' : rStyles.border,
              },
            ]}
          >
            <Text
              style={[
                styles.rewardPillText,
                { color: isLocked ? '#71717a' : rStyles.text },
              ]}
            >
              {quantity}x {item_name}
            </Text>
          </View>
        </View>

        {/* Status / Claim Action Button */}
        <View style={styles.actionRow}>
          {isClaimed ? (
            <View style={styles.claimedBadge}>
              <Check size={13} color={Colors.neonGreen} />
              <Text style={styles.claimedText}>Claimed</Text>
            </View>
          ) : isClaimable ? (
            <TouchableOpacity
              onPress={handleClaimPress}
              disabled={isClaiming}
              style={styles.claimButton}
            >
              {isClaiming ? (
                <ActivityIndicator size="small" color="#060a0e" />
              ) : (
                <View style={styles.claimButtonContent}>
                  <Gift size={12} color="#060a0e" />
                  <Text style={styles.claimButtonText}>CLAIM</Text>
                </View>
              )}
            </TouchableOpacity>
          ) : (
            <View style={styles.lockedRow}>
              <Lock size={11} color="#52525b" />
              <Text style={styles.lockedText}>Locked</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 170,
    alignItems: 'center',
  },
  targetDayContainer: {
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  targetDayText: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  anchorDotContainer: {
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  anchorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
  },
  anchorDotClaimed: {
    backgroundColor: Colors.neonGreen,
    borderColor: 'rgba(0, 255, 136, 0.4)',
  },
  anchorDotClaimable: {
    backgroundColor: Colors.neonCyan,
    borderColor: 'rgba(34, 211, 238, 0.4)',
  },
  anchorDotLocked: {
    backgroundColor: '#090d13',
    borderColor: '#3f3f46',
  },
  milestoneCard: {
    width: '100%',
    borderRadius: 18,
    borderWidth: 1,
    padding: 12,
    alignItems: 'center',
    gap: 8,
    minHeight: 160,
    justifyContent: 'space-between',
  },
  iconFrameWrapper: {
    position: 'relative',
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#18181b',
    borderWidth: 1,
    borderColor: '#27272a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailsCol: {
    alignItems: 'center',
    gap: 4,
    width: '100%',
  },
  milestoneTitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.2,
    textAlign: 'center',
  },
  rewardPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  rewardPillText: {
    fontSize: 9,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  actionRow: {
    width: '100%',
    borderTopWidth: 1,
    borderTopColor: '#1a2332',
    paddingTop: 8,
    alignItems: 'center',
  },
  claimedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  claimedText: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.neonGreen,
  },
  claimButton: {
    width: '100%',
    backgroundColor: Colors.neonCyan,
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  claimButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  claimButtonText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#060a0e',
    letterSpacing: 0.8,
  },
  lockedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  lockedText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#52525b',
  },
});

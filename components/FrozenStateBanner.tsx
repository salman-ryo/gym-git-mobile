import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { Snowflake, Play, AlertTriangle, Loader2 } from 'lucide-react-native';
import { ActiveItemEffect } from '@/lib/types';
import { unfreezeStreak } from '@/lib/streak-service';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/Colors';
import * as Haptics from 'expo-haptics';

interface FrozenStateBannerProps {
  isFrozen: boolean;
  activeEffects?: ActiveItemEffect[];
  onUnfreezeSuccess: () => Promise<void>;
}

function formatDuration(totalSeconds: number): string {
  if (totalSeconds <= 0) return 'Expired';
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0 || days > 0) parts.push(`${hours}h`);
  if (minutes > 0 || hours > 0 || days > 0) parts.push(`${minutes}m`);
  parts.push(`${seconds}s`);

  return parts.join(' ');
}

export default function FrozenStateBanner({
  isFrozen,
  activeEffects = [],
  onUnfreezeSuccess,
}: FrozenStateBannerProps) {
  const freezeEffect = activeEffects.find((e) => e.item_id === 'STREAK_FREEZE_TOKEN');
  const [remainingSeconds, setRemainingSeconds] = useState<number>(
    freezeEffect ? freezeEffect.remaining_seconds : 0
  );
  const [showConfirm, setShowConfirm] = useState<boolean>(false);
  const [isResuming, setIsResuming] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (freezeEffect) {
      setRemainingSeconds(freezeEffect.remaining_seconds);
    }
  }, [freezeEffect]);

  useEffect(() => {
    if (!isFrozen || remainingSeconds <= 0) return;

    const interval = setInterval(() => {
      setRemainingSeconds((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [isFrozen, remainingSeconds]);

  if (!isFrozen) return null;

  const handleUnfreeze = async () => {
    setIsResuming(true);
    setErrorMsg(null);
    try {
      await unfreezeStreak();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await onUnfreezeSuccess();
      setShowConfirm(false);
    } catch (err: any) {
      console.error('Failed to manually unfreeze:', err);
      setErrorMsg(err.message || 'Failed to resume streak. Please try again.');
    } finally {
      setIsResuming(false);
    }
  };

  return (
    <LinearGradient
      colors={['rgba(2, 132, 199, 0.25)', 'rgba(8, 12, 16, 0.95)', 'rgba(2, 132, 199, 0.25)']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={styles.container}
    >
      <View style={styles.leftAccentBar} />

      <View style={styles.contentRow}>
        {/* Left: Icon and Message */}
        <View style={styles.iconBox}>
          <Snowflake size={20} color={Colors.neonCyan} />
        </View>

        <View style={styles.textContainer}>
          <View style={styles.titleRow}>
            <Text style={styles.titleText}>ICE PAUSE ACTIVE</Text>
            {remainingSeconds > 0 && (
              <View style={styles.countdownBadge}>
                <Text style={styles.countdownText}>{formatDuration(remainingSeconds)}</Text>
              </View>
            )}
          </View>
          <Text style={styles.descText}>
            Streak decay is paused. Workout requirements are temporarily suspended.
          </Text>
        </View>
      </View>

      {/* Unfreeze Action Section */}
      <View style={styles.actionContainer}>
        {showConfirm ? (
          <View style={styles.confirmBox}>
            <View style={styles.confirmTextRow}>
              <AlertTriangle size={13} color={Colors.amber} />
              <Text style={styles.confirmPrompt}>Resume streak?</Text>
            </View>
            <View style={styles.confirmButtonsRow}>
              <TouchableOpacity
                onPress={handleUnfreeze}
                disabled={isResuming}
                style={styles.confirmYesButton}
              >
                {isResuming ? (
                  <ActivityIndicator size="small" color="#060a0e" />
                ) : (
                  <Text style={styles.confirmYesText}>Yes, Resume</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setShowConfirm(false);
                  setErrorMsg(null);
                }}
                disabled={isResuming}
                style={styles.confirmCancelButton}
              >
                <Text style={styles.confirmCancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
            {errorMsg && <Text style={styles.errorText}>{errorMsg}</Text>}
          </View>
        ) : (
          <TouchableOpacity
            onPress={() => setShowConfirm(true)}
            style={styles.resumeButton}
          >
            <Play size={13} color={Colors.neonCyan} />
            <Text style={styles.resumeButtonText}>RESUME STREAK</Text>
          </TouchableOpacity>
        )}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(34, 211, 238, 0.35)',
    padding: 14,
    marginBottom: 12,
    position: 'relative',
    overflow: 'hidden',
    gap: 12,
  },
  leftAccentBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3.5,
    backgroundColor: Colors.neonCyan,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(34, 211, 238, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(34, 211, 238, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
    gap: 2,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  titleText: {
    fontSize: 12,
    fontWeight: '900',
    color: Colors.neonCyan,
    letterSpacing: 0.8,
  },
  countdownBadge: {
    backgroundColor: 'rgba(34, 211, 238, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(34, 211, 238, 0.3)',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  countdownText: {
    fontSize: 10,
    fontWeight: '800',
    fontFamily: 'monospace',
    color: Colors.neonCyan,
  },
  descText: {
    fontSize: 11,
    color: '#d1d5db',
    lineHeight: 15,
    marginTop: 2,
  },
  actionContainer: {
    width: '100%',
  },
  resumeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    backgroundColor: 'rgba(34, 211, 238, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(34, 211, 238, 0.4)',
    borderRadius: 12,
  },
  resumeButtonText: {
    fontSize: 11,
    fontWeight: '900',
    color: Colors.neonCyan,
    letterSpacing: 0.8,
  },
  confirmBox: {
    backgroundColor: 'rgba(6, 10, 14, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(34, 211, 238, 0.25)',
    padding: 10,
    borderRadius: 12,
    gap: 8,
  },
  confirmTextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  confirmPrompt: {
    fontSize: 11,
    fontWeight: '700',
    color: '#e0f2fe',
  },
  confirmButtonsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  confirmYesButton: {
    flex: 1,
    backgroundColor: Colors.neonCyan,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmYesText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#060a0e',
    textTransform: 'uppercase',
  },
  confirmCancelButton: {
    flex: 1,
    backgroundColor: '#1f2937',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmCancelText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#d1d5db',
    textTransform: 'uppercase',
  },
  errorText: {
    fontSize: 9,
    color: '#f87171',
    marginTop: 2,
  },
});

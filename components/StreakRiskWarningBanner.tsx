import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { AlertTriangle, Clock, Play, Bell, ChevronDown, ChevronUp } from 'lucide-react-native';
import { StreakWarningEvent } from '@/lib/types';
import { Colors } from '@/constants/Colors';
import * as Haptics from 'expo-haptics';

interface StreakRiskWarningBannerProps {
  event: StreakWarningEvent | null;
  currentStreak?: number;
  onLogWorkoutClick: () => void;
}

export default function StreakRiskWarningBanner({
  event,
  currentStreak,
  onLogWorkoutClick,
}: StreakRiskWarningBannerProps) {
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

  useEffect(() => {
    if (!event) return;

    const calculateTimeLeft = () => {
      const now = new Date();
      const midnight = new Date();
      midnight.setHours(23, 59, 59, 999);

      const diffMs = midnight.getTime() - now.getTime();
      if (diffMs <= 0) {
        return '00:00:00';
      }

      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

      const pad = (num: number) => String(num).padStart(2, '0');
      return `${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s`;
    };

    setTimeLeft(calculateTimeLeft());
    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(interval);
  }, [event]);

  if (!event || !event.is_at_risk || (currentStreak !== undefined && currentStreak <= 0)) {
    return null;
  }

  const handleAction = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onLogWorkoutClick();
  };

  if (isCollapsed) {
    return (
      <View style={styles.collapsedWrapper}>
        <TouchableOpacity
          onPress={() => setIsCollapsed(false)}
          style={styles.collapsedButton}
        >
          <Bell size={14} color={Colors.amber} />
          <Text style={styles.collapsedLabel}>Streak At Risk:</Text>
          <Text style={styles.collapsedTime}>{timeLeft}</Text>
          <ChevronDown size={13} color={Colors.amber} />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Top Alert Line */}
      <View style={styles.topAlertLine} />

      <View style={styles.contentRow}>
        <View style={styles.iconBox}>
          <AlertTriangle size={20} color={Colors.amber} />
        </View>

        <View style={styles.textDetails}>
          <View style={styles.badgeRow}>
            <Text style={styles.titleText}>STREAK DECAY IMMINENT</Text>
            <View style={styles.atRiskBadge}>
              <Text style={styles.atRiskBadgeText}>AT RISK</Text>
            </View>
          </View>
          <Text style={styles.descText}>
            Rest tokens are exhausted (0 remaining). Log a workout before midnight to protect your streak.
          </Text>
        </View>
      </View>

      {/* Action Row: Countdown + CTA Button + Collapse */}
      <View style={styles.actionRow}>
        <View style={styles.countdownBadge}>
          <Clock size={13} color={Colors.amber} />
          <Text style={styles.countdownText}>{timeLeft}</Text>
        </View>

        <TouchableOpacity onPress={handleAction} style={styles.logBtn}>
          <Play size={12} color="#060a0e" />
          <Text style={styles.logBtnText}>LOG WORKOUT</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setIsCollapsed(true)}
          style={styles.collapseBtn}
        >
          <ChevronUp size={14} color="#71717a" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  collapsedWrapper: {
    alignItems: 'flex-end',
    marginBottom: 10,
  },
  collapsedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.35)',
  },
  collapsedLabel: {
    fontSize: 10.5,
    color: '#d4d4d8',
    fontWeight: '600',
  },
  collapsedTime: {
    fontSize: 11,
    fontWeight: '900',
    fontFamily: 'monospace',
    color: Colors.amber,
  },
  container: {
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    padding: 14,
    marginBottom: 12,
    position: 'relative',
    overflow: 'hidden',
    gap: 12,
  },
  topAlertLine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2.5,
    backgroundColor: Colors.amber,
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
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textDetails: {
    flex: 1,
    gap: 3,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  titleText: {
    fontSize: 11.5,
    fontWeight: '900',
    color: Colors.amber,
    letterSpacing: 0.8,
  },
  atRiskBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.4)',
  },
  atRiskBadgeText: {
    fontSize: 8,
    fontWeight: '900',
    color: Colors.amber,
  },
  descText: {
    fontSize: 11,
    color: '#d1d5db',
    lineHeight: 15,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  countdownBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#090d13',
    borderWidth: 1,
    borderColor: '#1a2332',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
  },
  countdownText: {
    fontSize: 10.5,
    fontWeight: '800',
    fontFamily: 'monospace',
    color: Colors.amber,
  },
  logBtn: {
    flex: 1,
    backgroundColor: Colors.amber,
    paddingVertical: 8,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  logBtnText: {
    fontSize: 10.5,
    fontWeight: '900',
    color: '#060a0e',
    letterSpacing: 0.5,
  },
  collapseBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#090d13',
    borderWidth: 1,
    borderColor: '#1a2332',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

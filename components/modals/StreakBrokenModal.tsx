import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Flame, ShieldAlert, Gift, AlertTriangle, Check, RotateCcw, ShieldCheck, Zap } from 'lucide-react-native';
import { StreakBrokenEvent } from '@/lib/types';
import { restoreStreak } from '@/lib/streak-service';
import ItemIcon from '@/components/inventory/ItemIcon';
import { Colors } from '@/constants/Colors';
import * as Haptics from 'expo-haptics';

function formatHumanDate(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr + 'T00:00:00');
  if (isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

interface StreakBrokenModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: StreakBrokenEvent | null;
  onRestoreSuccess: () => Promise<void>;
  onOpenRoadmap: () => void;
}

export default function StreakBrokenModal({
  isOpen,
  onClose,
  event,
  onRestoreSuccess,
  onOpenRoadmap,
}: StreakBrokenModalProps) {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen || !event) return null;

  const {
    previous_streak,
    last_streak_date,
    broken_on,
    missed_days_count = 1,
    required_shields = 1,
    restore_shield_available,
    restore_shields_count,
    missed_dates = [broken_on],
  } = event;

  const displayDate = last_streak_date || broken_on;
  const isRecoverable = restore_shield_available && restore_shields_count >= required_shields && required_shields <= 9;

  const handleRestore = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const targetPayload = missed_dates && missed_dates.length > 0 ? missed_dates : [broken_on];
      const res = await restoreStreak(targetPayload);
      if (res.success) {
        setSuccess(true);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setTimeout(async () => {
          await onRestoreSuccess();
          onClose();
        }, 1800);
      } else {
        setErrorMsg(res.message || 'Failed to restore streak.');
      }
    } catch (err: any) {
      console.error('Failed to restore streak:', err);
      setErrorMsg(err.message || 'An error occurred during restoration.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={isOpen} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={[styles.modalCard, isRecoverable ? styles.modalCardRecoverable : styles.modalCardDecayed]}>
          {/* Top Alert Accent Line */}
          <View style={[styles.topAlertLine, isRecoverable ? styles.topAlertLineCyan : styles.topAlertLineRed]} />

          {success ? (
            /* Success Revival View */
            <View style={styles.successContainer}>
              <View style={styles.successIconCircle}>
                <Check size={36} color={Colors.neonGreen} />
              </View>
              <Text style={styles.successTitle}>STREAK REVIVED!</Text>
              <Text style={styles.successDesc}>
                {required_shields} Restore {required_shields === 1 ? 'Shield' : 'Shields'} consumed. Your {previous_streak}-day record streak is fully restored and active.
              </Text>
            </View>
          ) : isRecoverable ? (
            /* State A: Streak Recoverable */
            <View style={styles.mainContainer}>
              {/* Header Icon */}
              <View style={styles.iconCircleWrapper}>
                <View style={styles.recoverableCircle}>
                  <ShieldCheck size={32} color={Colors.neonCyan} />
                </View>
                <View style={styles.zapBadge}>
                  <Zap size={12} color="#060a0e" />
                </View>
              </View>

              {/* Title & Date Notice */}
              <View style={styles.headerTextGroup}>
                <View style={styles.recoverableBadge}>
                  <Text style={styles.recoverableBadgeText}>⚡ STREAK RECOVERABLE</Text>
                </View>
                <Text style={styles.mainTitle}>RESCUE YOUR STREAK</Text>
                <Text style={styles.dateNotice}>
                  Your previous streak was{' '}
                  <Text style={{ color: Colors.neonCyan, fontWeight: '900' }}>
                    {previous_streak} days
                  </Text>{' '}
                  on{' '}
                  <Text style={{ color: '#f4f4f5', fontWeight: '700' }}>
                    {formatHumanDate(displayDate)}
                  </Text>.
                </Text>
              </View>

              {errorMsg && (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>{errorMsg}</Text>
                </View>
              )}

              {/* Diagnostics Card */}
              <View style={styles.recoveryCard}>
                <View style={styles.statRow}>
                  <Text style={styles.statLabel}>Missed Period:</Text>
                  <Text style={styles.statValWhite}>{missed_days_count} {missed_days_count === 1 ? 'Day' : 'Days'} Gap</Text>
                </View>
                <View style={styles.statRow}>
                  <Text style={styles.statLabel}>Shields Required:</Text>
                  <Text style={styles.statValAmber}>{required_shields}x Restore Shields</Text>
                </View>
                <View style={styles.statRow}>
                  <Text style={styles.statLabel}>Your Inventory:</Text>
                  <Text style={styles.statValGreen}>{restore_shields_count}x Available (✓ Sufficient)</Text>
                </View>
                <Text style={styles.cardExplainer}>
                  Redeeming {required_shields} Restore {required_shields === 1 ? 'Shield' : 'Shields'} will create protected logs for all {missed_days_count} missed days and restore your full record.
                </Text>

                <TouchableOpacity
                  onPress={handleRestore}
                  disabled={loading}
                  style={styles.restoreBtnCyan}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#060a0e" />
                  ) : (
                    <View style={styles.btnContent}>
                      <ShieldAlert size={15} color="#060a0e" />
                      <Text style={styles.restoreBtnTextCyan}>
                        CONSUME {required_shields}x SHIELDS (REVIVE)
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>

              {/* Dismiss */}
              <TouchableOpacity onPress={onClose} style={styles.dismissBtn}>
                <RotateCcw size={12} color="#71717a" />
                <Text style={styles.dismissBtnText}>START FRESH (DISMISS)</Text>
              </TouchableOpacity>
            </View>
          ) : (
            /* State B: Streak Unrecoverable */
            <View style={styles.mainContainer}>
              {/* Flame Header with Alert Indicator */}
              <View style={styles.iconCircleWrapper}>
                <View style={styles.flameCircle}>
                  <Flame size={32} color="#ef4444" />
                </View>
                <View style={styles.alertBadge}>
                  <AlertTriangle size={12} color="#fca5a5" />
                </View>
              </View>

              {/* Title & Date Notice */}
              <View style={styles.headerTextGroup}>
                <View style={styles.decayBadge}>
                  <Text style={styles.decayBadgeText}>⚠️ DECAY DETECTED • UNRECOVERABLE</Text>
                </View>
                <Text style={styles.mainTitle}>STREAK BROKEN</Text>
                <Text style={styles.dateNotice}>
                  Your previous streak was{' '}
                  <Text style={{ color: '#ef4444', fontWeight: '900' }}>
                    {previous_streak} days
                  </Text>{' '}
                  on{' '}
                  <Text style={{ color: '#f4f4f5', fontWeight: '700' }}>
                    {formatHumanDate(displayDate)}
                  </Text>{' '}
                  ({missed_days_count} {missed_days_count === 1 ? 'day' : 'days'} ago).
                </Text>
              </View>

              {errorMsg && (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>{errorMsg}</Text>
                </View>
              )}

              {/* Unrecoverable Breakdown Card */}
              <View style={styles.recoveryCard}>
                <View style={styles.statRow}>
                  <Text style={styles.statLabel}>Missed Period:</Text>
                  <Text style={styles.statValWhite}>{missed_days_count} {missed_days_count === 1 ? 'Day' : 'Days'} Inactive</Text>
                </View>
                <View style={styles.statRow}>
                  <Text style={styles.statLabel}>Shields Required:</Text>
                  <Text style={styles.statValRed}>{required_shields}x Restore Shields</Text>
                </View>
                <View style={styles.statRow}>
                  <Text style={styles.statLabel}>Your Inventory:</Text>
                  <Text style={styles.statValGray}>{restore_shields_count}x Available (✗ Insufficient)</Text>
                </View>
                <Text style={styles.cardExplainer}>
                  {required_shields > 9
                    ? `You missed ${missed_days_count} days (exceeds 9-day max capacity). This streak cannot be restored.`
                    : `Requires ${required_shields} Restore Shields. Because you only have ${restore_shields_count}x, this streak cannot be restored (partial restore is not supported).`}
                </Text>

                <TouchableOpacity
                  onPress={onClose}
                  style={styles.startFreshBtn}
                >
                  <Zap size={14} color="#060a0e" />
                  <Text style={styles.startFreshBtnText}>START NEW STREAK</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    onClose();
                    onOpenRoadmap();
                  }}
                  style={styles.roadmapBtn}
                >
                  <Gift size={14} color={Colors.neonCyan} />
                  <Text style={styles.roadmapBtnText}>VIEW REWARD ROADMAP</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#080c10',
    borderRadius: 24,
    borderWidth: 1.5,
    padding: 22,
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  modalCardRecoverable: {
    borderColor: 'rgba(34, 211, 238, 0.35)',
  },
  modalCardDecayed: {
    borderColor: 'rgba(239, 68, 68, 0.35)',
  },
  topAlertLine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
  },
  topAlertLineCyan: {
    backgroundColor: Colors.neonCyan,
  },
  topAlertLineRed: {
    backgroundColor: '#ef4444',
  },
  successContainer: {
    alignItems: 'center',
    gap: 12,
    paddingVertical: 18,
  },
  successIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(0, 255, 136, 0.1)',
    borderWidth: 2,
    borderColor: Colors.neonGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.neonGreen,
    letterSpacing: 1,
  },
  successDesc: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 17,
  },
  mainContainer: {
    width: '100%',
    alignItems: 'center',
    gap: 16,
  },
  iconCircleWrapper: {
    position: 'relative',
    marginTop: 4,
  },
  recoverableCircle: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: 'rgba(34, 211, 238, 0.1)',
    borderWidth: 1.5,
    borderColor: 'rgba(34, 211, 238, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  zapBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 6,
    backgroundColor: Colors.neonCyan,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flameCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#7f1d1d',
    borderWidth: 1,
    borderColor: '#ef4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTextGroup: {
    alignItems: 'center',
    gap: 4,
  },
  recoverableBadge: {
    backgroundColor: 'rgba(34, 211, 238, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(34, 211, 238, 0.35)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  recoverableBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: Colors.neonCyan,
    letterSpacing: 0.8,
  },
  decayBadge: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  decayBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#f87171',
    letterSpacing: 0.8,
  },
  mainTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 0.5,
    marginTop: 4,
  },
  dateNotice: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 16,
  },
  errorBox: {
    width: '100%',
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    padding: 10,
    borderRadius: 10,
  },
  errorText: {
    fontSize: 11,
    color: '#f87171',
    textAlign: 'center',
  },
  recoveryCard: {
    width: '100%',
    backgroundColor: 'rgba(18, 24, 32, 0.6)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1a2332',
    padding: 14,
    gap: 8,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#121822',
  },
  statLabel: {
    fontSize: 11,
    color: '#9ca3af',
    fontWeight: '600',
  },
  statValWhite: {
    fontSize: 11,
    color: '#f4f4f5',
    fontWeight: '800',
  },
  statValAmber: {
    fontSize: 11,
    color: '#fbbf24',
    fontWeight: '900',
  },
  statValRed: {
    fontSize: 11,
    color: '#f87171',
    fontWeight: '900',
  },
  statValGreen: {
    fontSize: 11,
    color: Colors.neonGreen,
    fontWeight: '900',
  },
  statValGray: {
    fontSize: 11,
    color: '#71717a',
    fontWeight: '800',
  },
  cardExplainer: {
    fontSize: 10.5,
    color: '#9ca3af',
    lineHeight: 15,
    paddingTop: 4,
  },
  restoreBtnCyan: {
    backgroundColor: Colors.neonCyan,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  restoreBtnTextCyan: {
    fontSize: 10.5,
    fontWeight: '900',
    color: '#060a0e',
    letterSpacing: 0.8,
  },
  startFreshBtn: {
    backgroundColor: '#ffffff',
    paddingVertical: 11,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 4,
  },
  startFreshBtnText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#060a0e',
    letterSpacing: 0.5,
  },
  roadmapBtn: {
    backgroundColor: '#090d13',
    borderWidth: 1,
    borderColor: 'rgba(34, 211, 238, 0.3)',
    paddingVertical: 11,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  roadmapBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.neonCyan,
    letterSpacing: 0.5,
  },
  dismissBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
  },
  dismissBtnText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#71717a',
    letterSpacing: 0.8,
  },
  btnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
});

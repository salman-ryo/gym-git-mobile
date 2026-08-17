import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Flame, ShieldAlert, Gift, AlertTriangle, Check, RotateCcw } from 'lucide-react-native';
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

  const { previous_streak, broken_on, restore_shields_count } = event;

  const handleRestore = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await restoreStreak(broken_on);
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
        <View style={styles.modalCard}>
          {/* Top Alert Accent Line */}
          <View style={styles.topAlertLine} />

          {success ? (
            /* Success Revival View */
            <View style={styles.successContainer}>
              <View style={styles.successIconCircle}>
                <Check size={36} color={Colors.neonGreen} />
              </View>
              <Text style={styles.successTitle}>STREAK REVIVED!</Text>
              <Text style={styles.successDesc}>
                Restore Shield consumed. Your {previous_streak}-day record streak is fully restored and active.
              </Text>
            </View>
          ) : (
            /* Main Broken View */
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
                  <Text style={styles.decayBadgeText}>⚠️ DECAY DETECTED</Text>
                </View>
                <Text style={styles.mainTitle}>STREAK BROKEN</Text>
                <Text style={styles.dateNotice}>
                  Your last streak was{' '}
                  <Text style={{ color: '#ef4444', fontWeight: '900' }}>
                    {previous_streak} days
                  </Text>{' '}
                  on{' '}
                  <Text style={{ color: '#f4f4f5', fontWeight: '700' }}>
                    {formatHumanDate(broken_on)}
                  </Text>.
                </Text>
              </View>

              {errorMsg && (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>{errorMsg}</Text>
                </View>
              )}

              {/* Recovery Options Card */}
              <View style={styles.recoveryCard}>
                <View style={styles.shieldHeaderRow}>
                  <View style={styles.shieldLeft}>
                    <View style={styles.shieldIconBox}>
                      <ItemIcon itemId="RESTORE_SHIELD" size={22} />
                    </View>
                    <View>
                      <Text style={styles.shieldTitle}>RESTORE SHIELD</Text>
                      <Text style={styles.shieldCount}>
                        Inventory: {restore_shields_count}x
                      </Text>
                    </View>
                  </View>

                  <View
                    style={[
                      styles.availabilityPill,
                      restore_shields_count > 0
                        ? styles.availabilityPillActive
                        : styles.availabilityPillInactive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.availabilityPillText,
                        restore_shields_count > 0
                          ? { color: Colors.neonGreen }
                          : { color: '#ef4444' },
                      ]}
                    >
                      {restore_shields_count > 0 ? 'AVAILABLE' : 'UNAVAILABLE'}
                    </Text>
                  </View>
                </View>

                {restore_shields_count > 0 ? (
                  /* Option A: Use Shield */
                  <View style={styles.optionSection}>
                    <Text style={styles.optionExplainer}>
                      Redeem 1 Restore Shield to rescue your streak. This reverts the decay and protects your active split.
                    </Text>
                    <TouchableOpacity
                      onPress={handleRestore}
                      disabled={loading}
                      style={styles.restoreBtn}
                    >
                      {loading ? (
                        <ActivityIndicator size="small" color="#060a0e" />
                      ) : (
                        <View style={styles.btnContent}>
                          <ShieldAlert size={15} color="#060a0e" />
                          <Text style={styles.restoreBtnText}>CONSUME RESTORE SHIELD</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  </View>
                ) : (
                  /* Option B: Open Roadmap */
                  <View style={styles.optionSection}>
                    <Text style={styles.optionExplainer}>
                      You have 0 Restore Shields left. Earn shields by claiming upcoming milestones in your Roadmap.
                    </Text>
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
                )}
              </View>

              {/* Start Fresh Dismiss */}
              <TouchableOpacity onPress={onClose} style={styles.dismissBtn}>
                <RotateCcw size={12} color="#71717a" />
                <Text style={styles.dismissBtnText}>START FRESH (DISMISS)</Text>
              </TouchableOpacity>
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
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
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
    borderColor: 'rgba(239, 68, 68, 0.35)',
    padding: 22,
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  topAlertLine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
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
    gap: 12,
  },
  shieldHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  shieldLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  shieldIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#090d13',
    borderWidth: 1,
    borderColor: '#1a2332',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shieldTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: '#f4f4f5',
    letterSpacing: 0.5,
  },
  shieldCount: {
    fontSize: 10,
    color: '#71717a',
    marginTop: 1,
  },
  availabilityPill: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  availabilityPillActive: {
    backgroundColor: 'rgba(0, 255, 136, 0.1)',
    borderColor: 'rgba(0, 255, 136, 0.3)',
  },
  availabilityPillInactive: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  availabilityPillText: {
    fontSize: 8.5,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  optionSection: {
    gap: 10,
  },
  optionExplainer: {
    fontSize: 11,
    color: '#9ca3af',
    lineHeight: 15,
  },
  restoreBtn: {
    backgroundColor: '#ef4444',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  restoreBtnText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#060a0e',
    letterSpacing: 0.8,
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
});

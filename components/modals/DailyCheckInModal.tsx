import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, TextInput, Image, StyleSheet, ActivityIndicator } from 'react-native';
import { WorkoutType } from '@/lib/types';
import { formatDisplayDate } from '@/lib/scientific-streak';
import { isLateNightStreakRisk, snoozeCheckIn, clearCheckInSnooze } from '@/lib/checkin-snooze';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/Colors';
import { getThemeForWorkout } from '@/lib/theme-utils';
import { Clock, AlertTriangle, ShieldCheck } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

interface DailyCheckInModalProps {
  dateStr: string;
  isOpen: boolean;
  onCheckInYes: (hours: number, workoutType: WorkoutType, notes?: string) => Promise<void>;
  onCheckInNo: () => void;
  onCheckInLater?: () => void;
  availableWorkoutTypes?: string[];
}

export default function DailyCheckInModal({
  dateStr,
  isOpen,
  onCheckInYes,
  onCheckInNo,
  onCheckInLater,
  availableWorkoutTypes = ['Push', 'Pull', 'Legs', 'Cardio', 'Core', 'Custom'],
}: DailyCheckInModalProps) {
  const [answeredYes, setAnsweredYes] = useState(false);
  const [hours, setHours] = useState(1.0);
  const [workoutType, setWorkoutType] = useState('Push');
  const [notes, setNotes] = useState('');
  const [isSnoozing, setIsSnoozing] = useState(false);
  const [showLateNightWarning, setShowLateNightWarning] = useState(false);

  if (!isOpen) return null;

  const handleSnooze = async () => {
    if (isLateNightStreakRisk() && !showLateNightWarning) {
      setShowLateNightWarning(true);
      return;
    }

    setIsSnoozing(true);
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await snoozeCheckIn(dateStr);
      if (onCheckInLater) {
        onCheckInLater();
      }
    } catch (err) {
      console.error('Failed to snooze check-in:', err);
    } finally {
      setIsSnoozing(false);
    }
  };

  const handleYesSave = async () => {
    await clearCheckInSnooze();
    await onCheckInYes(hours, workoutType, notes);
  };

  const handleNoSave = async () => {
    await clearCheckInSnooze();
    onCheckInNo();
  };

  return (
    <Modal visible={isOpen} transparent animationType="slide">
      <View style={styles.overlay}>
        <LinearGradient
          colors={[Colors.dark.card, Colors.dark.background]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.modalCard}
        >
          {/* Background watermarks */}
          <Image
            source={require('@/assets/images/ggdumbell.webp')}
            style={styles.watermark1}
            resizeMode="contain"
          />
          <Image
            source={require('@/assets/images/gggit.webp')}
            style={styles.watermark2}
            resizeMode="contain"
          />

          {!answeredYes ? (
            <View style={{ alignItems: 'center' }}>
              {/* Dumbbell Icon Avatar */}
              <View style={styles.avatarIconBox}>
                <Image
                  source={require('@/assets/images/ggdumbell.webp')}
                  style={{ width: 46, height: 46 }}
                  resizeMode="contain"
                />
              </View>

              <Text style={styles.headingTitle}>
                Did you hit the gym today?
              </Text>
              <Text style={styles.headingSubtitle}>
                {formatDisplayDate(dateStr)}
              </Text>

              {/* Late Night Risk Warning Callout */}
              {showLateNightWarning && (
                <View style={styles.lateNightWarningBox}>
                  <AlertTriangle size={14} color={Colors.amber} />
                  <Text style={styles.lateNightWarningText}>
                    Warning: It is past 11:30 PM. Snoozing 30 minutes will cross midnight and risk breaking your daily streak!
                  </Text>
                </View>
              )}

              {/* 3-Way Action Row */}
              <View style={{ gap: 10, width: '100%' }}>
                <TouchableOpacity onPress={() => setAnsweredYes(true)} style={styles.yesButton}>
                  <LinearGradient
                    colors={[Colors.brandPrimary, Colors.brandSecondary]}
                    style={{ paddingVertical: 14, alignItems: 'center' }}
                  >
                    <Text style={styles.yesButtonText}>Yes, I Worked Out! 💪</Text>
                  </LinearGradient>
                </TouchableOpacity>

                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <TouchableOpacity
                    onPress={handleNoSave}
                    style={styles.restDayButton}
                  >
                    <Text style={styles.restDayText}>Rest Day 🛌</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={handleSnooze}
                    disabled={isSnoozing}
                    style={styles.snoozeButton}
                  >
                    {isSnoozing ? (
                      <ActivityIndicator size="small" color={Colors.neonCyan} />
                    ) : (
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <Clock size={14} color={Colors.neonCyan} />
                        <Text style={styles.snoozeText}>Ask Later ⏳</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ) : (
            <View>
              {/* Header */}
              <View style={styles.detailsHeaderRow}>
                <Image
                  source={require('@/assets/images/ggdumbell.webp')}
                  style={{ width: 28, height: 28 }}
                  resizeMode="contain"
                />
                <View>
                  <Text style={styles.detailsTitle}>Session Details</Text>
                  <Text style={styles.detailsSubtitle}>{formatDisplayDate(dateStr)}</Text>
                </View>
              </View>

              {/* Hours Presets */}
              <Text style={styles.fieldLabel}>Duration</Text>
              <View style={styles.durationRow}>
                {[0.5, 1.0, 1.5, 2.0, 2.5].map((h) => (
                  <TouchableOpacity
                    key={h}
                    onPress={() => setHours(h)}
                    style={{ flex: 1, borderRadius: 10, overflow: 'hidden' }}
                  >
                    {hours === h ? (
                      <LinearGradient colors={[Colors.brandPrimary, Colors.brandSecondary]} style={{ paddingVertical: 9, alignItems: 'center' }}>
                        <Text style={styles.activeDurationText}>{h}h</Text>
                      </LinearGradient>
                    ) : (
                      <View style={styles.inactiveDurationPill}>
                        <Text style={styles.inactiveDurationText}>{h}h</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>

              {/* Workout Type Chips */}
              <Text style={styles.fieldLabel}>Category</Text>
              <View style={styles.categoryRow}>
                {availableWorkoutTypes.map((cat) => {
                  const theme = getThemeForWorkout(cat);
                  return (
                    <TouchableOpacity
                      key={cat}
                      onPress={() => setWorkoutType(cat)}
                      style={{ borderRadius: 10, overflow: 'hidden' }}
                    >
                      {workoutType === cat ? (
                        <LinearGradient colors={[theme.primary, theme.gradient[1]]} style={{ paddingHorizontal: 14, paddingVertical: 7 }}>
                          <Text style={{ ...styles.activeCategoryText, color: theme.text }}>{cat}</Text>
                        </LinearGradient>
                      ) : (
                        <View style={styles.inactiveCategoryChip}>
                          <Text style={styles.inactiveCategoryText}>{cat}</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Notes */}
              <TextInput
                value={notes}
                onChangeText={setNotes}
                placeholder="Session notes (optional)..."
                placeholderTextColor={Colors.dark.mutedForeground}
                style={styles.textInput}
              />

              <TouchableOpacity onPress={handleYesSave} style={{ borderRadius: 14, overflow: 'hidden' }}>
                <LinearGradient
                  colors={[Colors.brandPrimary, Colors.brandTeal, '#a855f7']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{ paddingVertical: 15, alignItems: 'center' }}
                >
                  <Text style={styles.saveBtnText}>Commit Workout Log</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}
        </LinearGradient>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.88)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    borderRadius: 28,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 136, 0.35)',
    overflow: 'hidden',
    position: 'relative',
  },
  watermark1: {
    position: 'absolute',
    top: -20,
    right: -20,
    width: 160,
    height: 160,
    opacity: 0.06,
    transform: [{ rotate: '-15deg' }],
  },
  watermark2: {
    position: 'absolute',
    bottom: -20,
    left: -20,
    width: 130,
    height: 130,
    opacity: 0.05,
    transform: [{ rotate: '10deg' }],
  },
  avatarIconBox: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: Colors.brandTeal,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
  },
  headingTitle: {
    color: Colors.dark.foreground,
    fontSize: 22,
    fontWeight: '900',
    textAlign: 'center',
  },
  headingSubtitle: {
    color: Colors.dark.mutedForeground,
    fontSize: 13,
    marginTop: 6,
    marginBottom: 20,
    textAlign: 'center',
  },
  lateNightWarningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.35)',
    padding: 10,
    borderRadius: 12,
    marginBottom: 16,
  },
  lateNightWarningText: {
    fontSize: 11,
    color: Colors.amber,
    flex: 1,
    lineHeight: 15,
  },
  yesButton: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  yesButtonText: {
    color: '#060a0e',
    fontWeight: '900',
    fontSize: 15,
  },
  restDayButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.dark.border,
    backgroundColor: 'rgba(38,38,38,0.6)',
  },
  restDayText: {
    color: Colors.dark.mutedForeground,
    fontWeight: '700',
    fontSize: 14,
  },
  snoozeButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(34, 211, 238, 0.3)',
    backgroundColor: 'rgba(34, 211, 238, 0.08)',
  },
  snoozeText: {
    color: Colors.neonCyan,
    fontWeight: '800',
    fontSize: 13,
  },
  detailsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 20,
  },
  detailsTitle: {
    color: Colors.dark.foreground,
    fontSize: 18,
    fontWeight: '800',
  },
  detailsSubtitle: {
    color: Colors.dark.mutedForeground,
    fontSize: 11,
  },
  fieldLabel: {
    color: Colors.dark.mutedForeground,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  durationRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 18,
  },
  activeDurationText: {
    color: '#060a0e',
    fontWeight: '800',
    fontSize: 12,
  },
  inactiveDurationPill: {
    paddingVertical: 9,
    backgroundColor: 'rgba(38,38,38,0.6)',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.dark.border,
    borderRadius: 10,
  },
  inactiveDurationText: {
    color: Colors.dark.mutedForeground,
    fontWeight: '700',
    fontSize: 12,
  },
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 18,
  },
  activeCategoryText: {
    color: '#060a0e',
    fontWeight: '800',
    fontSize: 12,
  },
  inactiveCategoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    backgroundColor: 'rgba(38,38,38,0.6)',
    borderWidth: 1,
    borderColor: Colors.dark.border,
    borderRadius: 10,
  },
  inactiveCategoryText: {
    color: Colors.dark.mutedForeground,
    fontWeight: '700',
    fontSize: 12,
  },
  textInput: {
    backgroundColor: 'rgba(9,9,11,0.7)',
    color: Colors.dark.foreground,
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    fontSize: 13,
  },
  saveBtnText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 15,
  },
});

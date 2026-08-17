import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity, TextInput, Image, StyleSheet } from 'react-native';
import { GymLog, WorkoutType } from '@/lib/types';
import { formatDisplayDate } from '@/lib/scientific-streak';
import { Trash2, X, Shield, Sparkles } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/Colors';
import * as Haptics from 'expo-haptics';

interface EditLogModalProps {
  dateStr: string;
  existingLog?: GymLog;
  isOpen: boolean;
  onSave: (dateStr: string, hours: number, workoutType: WorkoutType, notes?: string) => Promise<void>;
  onDelete: (dateStr: string) => Promise<void>;
  onClose: () => void;
  availableWorkoutTypes?: string[];
  restoreShieldCount?: number;
  onRestoreWithShield?: (dateStr: string, hours: number, workoutType: WorkoutType, notes?: string) => Promise<void>;
}

export default function EditLogModal({
  dateStr,
  existingLog,
  isOpen,
  onSave,
  onDelete,
  onClose,
  availableWorkoutTypes = ['Push', 'Pull', 'Legs', 'Cardio', 'Core', 'Custom'],
  restoreShieldCount = 0,
  onRestoreWithShield,
}: EditLogModalProps) {
  const [hours, setHours] = useState(existingLog?.hours || 1.0);
  const [workoutType, setWorkoutType] = useState<WorkoutType>(existingLog?.workoutType || 'Push');
  const [notes, setNotes] = useState(existingLog?.notes || '');
  const [useRestoreShield, setUseRestoreShield] = useState(false);

  // Check if date is in past 1-3 days and had no log
  const isPastLookback = React.useMemo(() => {
    if (!dateStr || existingLog) return false;
    const target = new Date(dateStr + 'T00:00:00');
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const diffDays = Math.round((now.getTime() - target.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays >= 1 && diffDays <= 3;
  }, [dateStr, existingLog]);

  useEffect(() => {
    if (existingLog) {
      setHours(existingLog.hours);
      setWorkoutType(existingLog.workoutType);
      setNotes(existingLog.notes || '');
      setUseRestoreShield(false);
    } else {
      setHours(1.0);
      setWorkoutType('Push');
      setNotes('');
      setUseRestoreShield(false);
    }
  }, [existingLog, isOpen]);

  if (!isOpen) return null;

  const handleSaveAction = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (useRestoreShield && onRestoreWithShield) {
      await onRestoreWithShield(dateStr, hours, workoutType, notes);
    } else {
      await onSave(dateStr, hours, workoutType, notes);
    }
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

          {/* Header */}
          <View style={styles.headerRow}>
            <View style={styles.headerLeft}>
              <View style={styles.headerIconBox}>
                <Image
                  source={require('@/assets/images/ggdumbell.webp')}
                  style={{ width: 28, height: 28 }}
                  resizeMode="contain"
                />
              </View>
              <View>
                <Text style={styles.headerTitle}>
                  {existingLog ? 'Edit Log' : 'Log Workout'}
                </Text>
                <Text style={styles.headerSubtitle}>
                  {formatDisplayDate(dateStr)}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeBtn}
            >
              <X size={18} color={Colors.dark.mutedForeground} />
            </TouchableOpacity>
          </View>

          {/* Past Missed Date Recovery Callout */}
          {isPastLookback && restoreShieldCount > 0 && onRestoreWithShield && (
            <TouchableOpacity
              onPress={() => setUseRestoreShield(!useRestoreShield)}
              style={[
                styles.restoreCallout,
                useRestoreShield && styles.restoreCalloutActive,
              ]}
            >
              <View style={styles.shieldIconWrapper}>
                <Shield size={16} color={Colors.neonCyan} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.restoreCalloutTitle}>
                  RECOVER WITH RESTORE SHIELD
                </Text>
                <Text style={styles.restoreCalloutDesc}>
                  Consume 1 of your {restoreShieldCount} Restore Shields to retroactive-log and rescue your streak.
                </Text>
              </View>
              <View style={[styles.checkboxOuter, useRestoreShield && styles.checkboxOuterActive]}>
                {useRestoreShield && <View style={styles.checkboxInner} />}
              </View>
            </TouchableOpacity>
          )}

          {/* Duration Presets */}
          <Text style={styles.fieldLabel}>Duration</Text>
          <View style={styles.durationRow}>
            {[0.5, 1.0, 1.5, 2.0, 2.5].map((h) => (
              <TouchableOpacity key={h} onPress={() => setHours(h)} style={{ flex: 1, borderRadius: 10, overflow: 'hidden' }}>
                {hours === h ? (
                  <LinearGradient colors={[Colors.brandPrimary, Colors.brandSecondary]} style={{ paddingVertical: 9, alignItems: 'center' }}>
                    <Text style={{ color: Colors.dark.primaryForeground, fontWeight: '800', fontSize: 12 }}>{h}h</Text>
                  </LinearGradient>
                ) : (
                  <View style={styles.durationPillInactive}>
                    <Text style={{ color: Colors.dark.mutedForeground, fontWeight: '700', fontSize: 12 }}>{h}h</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Workout Type Chips */}
          <Text style={styles.fieldLabel}>Category</Text>
          <View style={styles.categoryRow}>
            {availableWorkoutTypes.map((cat) => (
              <TouchableOpacity key={cat} onPress={() => setWorkoutType(cat)} style={{ borderRadius: 10, overflow: 'hidden' }}>
                {workoutType === cat ? (
                  <LinearGradient colors={[Colors.brandPrimary, Colors.brandSecondary]} style={{ paddingHorizontal: 14, paddingVertical: 7 }}>
                    <Text style={{ color: Colors.dark.primaryForeground, fontWeight: '800', fontSize: 12 }}>{cat}</Text>
                  </LinearGradient>
                ) : (
                  <View style={styles.categoryChipInactive}>
                    <Text style={{ color: Colors.dark.mutedForeground, fontWeight: '700', fontSize: 12 }}>{cat}</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Notes */}
          <TextInput
            value={notes}
            onChangeText={setNotes}
            placeholder="Session notes (optional)..."
            placeholderTextColor={Colors.dark.mutedForeground}
            style={styles.textInput}
          />

          {/* Actions */}
          <View style={{ flexDirection: 'row', gap: 12 }}>
            {existingLog && (
              <TouchableOpacity
                onPress={() => onDelete(dateStr)}
                style={styles.deleteBtn}
              >
                <Trash2 size={20} color="#ef4444" />
              </TouchableOpacity>
            )}

            <TouchableOpacity onPress={handleSaveAction} style={{ flex: 1, borderRadius: 14, overflow: 'hidden' }}>
              <LinearGradient
                colors={
                  useRestoreShield
                    ? ['#0284c7', Colors.neonCyan, '#00ff88']
                    : [Colors.brandPrimary, Colors.brandTeal, '#a855f7']
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{ paddingVertical: 15, alignItems: 'center' }}
              >
                <Text style={{ color: '#fff', fontWeight: '900', fontSize: 15 }}>
                  {useRestoreShield
                    ? 'Consume Shield & Save'
                    : existingLog
                    ? 'Update Log Entry'
                    : 'Save Log Entry'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
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
    borderColor: 'rgba(52,211,153,0.25)',
    overflow: 'hidden',
    position: 'relative',
  },
  watermark1: {
    position: 'absolute',
    top: -15,
    right: -15,
    width: 140,
    height: 140,
    opacity: 0.06,
    transform: [{ rotate: '-20deg' }],
  },
  watermark2: {
    position: 'absolute',
    bottom: -15,
    left: -15,
    width: 120,
    height: 120,
    opacity: 0.05,
    transform: [{ rotate: '8deg' }],
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(52,211,153,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(52,211,153,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: Colors.dark.foreground,
    fontSize: 18,
    fontWeight: '800',
  },
  headerSubtitle: {
    color: Colors.dark.mutedForeground,
    fontSize: 11,
    fontWeight: '600',
    marginTop: 1,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: 'rgba(38,38,38,0.7)',
    borderWidth: 1,
    borderColor: Colors.dark.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  restoreCallout: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(34, 211, 238, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(34, 211, 238, 0.3)',
    borderRadius: 14,
    padding: 12,
    marginBottom: 16,
  },
  restoreCalloutActive: {
    borderColor: Colors.neonCyan,
    backgroundColor: 'rgba(34, 211, 238, 0.15)',
  },
  shieldIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(34, 211, 238, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  restoreCalloutTitle: {
    fontSize: 10,
    fontWeight: '900',
    color: Colors.neonCyan,
    letterSpacing: 0.5,
  },
  restoreCalloutDesc: {
    fontSize: 10.5,
    color: '#d1d5db',
    lineHeight: 14,
    marginTop: 2,
  },
  checkboxOuter: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: '#52525b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxOuterActive: {
    borderColor: Colors.neonCyan,
  },
  checkboxInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.neonCyan,
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
  durationPillInactive: {
    paddingVertical: 9,
    backgroundColor: 'rgba(38,38,38,0.6)',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.dark.border,
    borderRadius: 10,
  },
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 18,
  },
  categoryChipInactive: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    backgroundColor: 'rgba(38,38,38,0.6)',
    borderWidth: 1,
    borderColor: Colors.dark.border,
    borderRadius: 10,
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
  deleteBtn: {
    backgroundColor: 'rgba(239,68,68,0.1)',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.35)',
  },
});

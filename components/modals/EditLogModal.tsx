import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity, TextInput, Image } from 'react-native';
import { GymLog, WorkoutType } from '@/lib/types';
import { formatDisplayDate } from '@/lib/scientific-streak';
import { Trash2, X } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/Colors';

interface EditLogModalProps {
  dateStr: string;
  existingLog?: GymLog;
  isOpen: boolean;
  onSave: (dateStr: string, hours: number, workoutType: WorkoutType, notes?: string) => Promise<void>;
  onDelete: (dateStr: string) => Promise<void>;
  onClose: () => void;
  availableWorkoutTypes?: string[];
}

export default function EditLogModal({
  dateStr,
  existingLog,
  isOpen,
  onSave,
  onDelete,
  onClose,
  availableWorkoutTypes = ['Push', 'Pull', 'Legs', 'Cardio', 'Core', 'Custom'],
}: EditLogModalProps) {
  const [hours, setHours] = useState(existingLog?.hours || 1.0);
  const [workoutType, setWorkoutType] = useState<WorkoutType>(existingLog?.workoutType || 'Push');
  const [notes, setNotes] = useState(existingLog?.notes || '');

  useEffect(() => {
    if (existingLog) {
      setHours(existingLog.hours);
      setWorkoutType(existingLog.workoutType);
      setNotes(existingLog.notes || '');
    } else {
      setHours(1.0);
      setWorkoutType('Push');
      setNotes('');
    }
  }, [existingLog, isOpen]);

  if (!isOpen) return null;

  return (
    <Modal visible={isOpen} transparent animationType="slide">
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.88)', justifyContent: 'center', padding: 20 }}>
        <LinearGradient
          colors={[Colors.dark.card, Colors.dark.background]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            borderRadius: 28,
            padding: 24,
            borderWidth: 1,
            borderColor: 'rgba(52,211,153,0.25)',
            overflow: 'hidden',
          }}
        >
          {/* Background watermarks */}
          <Image
            source={require('@/assets/images/ggdumbell.webp')}
            style={{ position: 'absolute', top: -15, right: -15, width: 140, height: 140, opacity: 0.06, transform: [{ rotate: '-20deg' }] }}
            resizeMode="contain"
          />
          <Image
            source={require('@/assets/images/gggit.webp')}
            style={{ position: 'absolute', bottom: -15, left: -15, width: 120, height: 120, opacity: 0.05, transform: [{ rotate: '8deg' }] }}
            resizeMode="contain"
          />

          {/* Glow blobs */}
          <View style={{ position: 'absolute', top: -50, left: -50, width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(20,184,166,0.06)' }} />
          <View style={{ position: 'absolute', bottom: -50, right: -50, width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(168,85,247,0.05)' }} />

          {/* Header */}
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 22 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <View style={{
                width: 44,
                height: 44,
                borderRadius: 14,
                backgroundColor: 'rgba(52,211,153,0.1)',
                borderWidth: 1,
                borderColor: 'rgba(52,211,153,0.25)',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
                <Image
                  source={require('@/assets/images/ggdumbell.webp')}
                  style={{ width: 28, height: 28 }}
                  resizeMode="contain"
                />
              </View>
              <View>
                <Text style={{ color: Colors.dark.foreground, fontSize: 18, fontWeight: '800' }}>
                  {existingLog ? 'Edit Log' : 'Log Workout'}
                </Text>
                <Text style={{ color: Colors.dark.mutedForeground, fontSize: 11, fontWeight: '600', marginTop: 1 }}>
                  {formatDisplayDate(dateStr)}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={{
                width: 34,
                height: 34,
                borderRadius: 10,
                backgroundColor: 'rgba(38,38,38,0.7)',
                borderWidth: 1,
                borderColor: Colors.dark.border,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <X size={18} color={Colors.dark.mutedForeground} />
            </TouchableOpacity>
          </View>

          {/* Duration Presets */}
          <Text style={{ color: Colors.dark.mutedForeground, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Duration</Text>
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 18 }}>
            {[0.5, 1.0, 1.5, 2.0, 2.5].map((h) => (
              <TouchableOpacity key={h} onPress={() => setHours(h)} style={{ flex: 1, borderRadius: 10, overflow: 'hidden' }}>
                {hours === h ? (
                  <LinearGradient colors={[Colors.brandPrimary, Colors.brandSecondary]} style={{ paddingVertical: 9, alignItems: 'center' }}>
                    <Text style={{ color: Colors.dark.primaryForeground, fontWeight: '800', fontSize: 12 }}>{h}h</Text>
                  </LinearGradient>
                ) : (
                  <View style={{ paddingVertical: 9, backgroundColor: 'rgba(38,38,38,0.6)', alignItems: 'center', borderWidth: 1, borderColor: Colors.dark.border, borderRadius: 10 }}>
                    <Text style={{ color: Colors.dark.mutedForeground, fontWeight: '700', fontSize: 12 }}>{h}h</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Workout Type Chips */}
          <Text style={{ color: Colors.dark.mutedForeground, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Category</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 18 }}>
            {availableWorkoutTypes.map((cat) => (
              <TouchableOpacity key={cat} onPress={() => setWorkoutType(cat)} style={{ borderRadius: 10, overflow: 'hidden' }}>
                {workoutType === cat ? (
                  <LinearGradient colors={[Colors.brandPrimary, Colors.brandSecondary]} style={{ paddingHorizontal: 14, paddingVertical: 7 }}>
                    <Text style={{ color: Colors.dark.primaryForeground, fontWeight: '800', fontSize: 12 }}>{cat}</Text>
                  </LinearGradient>
                ) : (
                  <View style={{ paddingHorizontal: 14, paddingVertical: 7, backgroundColor: 'rgba(38,38,38,0.6)', borderWidth: 1, borderColor: Colors.dark.border, borderRadius: 10 }}>
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
            style={{
              backgroundColor: 'rgba(9,9,11,0.7)',
              color: Colors.dark.foreground,
              borderRadius: 12,
              padding: 12,
              marginBottom: 20,
              borderWidth: 1,
              borderColor: Colors.dark.border,
              fontSize: 13,
            }}
          />

          {/* Actions */}
          <View style={{ flexDirection: 'row', gap: 12 }}>
            {existingLog && (
              <TouchableOpacity
                onPress={() => onDelete(dateStr)}
                style={{
                  backgroundColor: 'rgba(239,68,68,0.1)',
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  borderRadius: 14,
                  alignItems: 'center',
                  borderWidth: 1,
                  borderColor: 'rgba(239,68,68,0.35)',
                }}
              >
                <Trash2 size={20} color="#ef4444" />
              </TouchableOpacity>
            )}

            <TouchableOpacity onPress={() => onSave(dateStr, hours, workoutType, notes)} style={{ flex: 1, borderRadius: 14, overflow: 'hidden' }}>
              <LinearGradient
                colors={[Colors.brandPrimary, Colors.brandTeal, '#a855f7']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{ paddingVertical: 15, alignItems: 'center' }}
              >
                <Text style={{ color: '#fff', fontWeight: '900', fontSize: 15 }}>
                  {existingLog ? 'Update Log Entry' : 'Save Log Entry'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>
    </Modal>
  );
}

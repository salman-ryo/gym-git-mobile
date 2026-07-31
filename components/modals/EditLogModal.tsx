import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity, TextInput } from 'react-native';
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
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', padding: 20 }}>
        <LinearGradient
          colors={[Colors.dark.card, '#072417']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ borderRadius: 28, padding: 24, borderWidth: 1, borderColor: 'rgba(52,211,153,0.3)' }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
            <View>
              <Text style={{ color: Colors.dark.foreground, fontSize: 18, fontWeight: '800' }}>Edit Log</Text>
              <Text style={{ color: Colors.dark.mutedForeground, fontSize: 12, fontWeight: '600', marginTop: 2 }}>{formatDisplayDate(dateStr)}</Text>
            </View>
            <TouchableOpacity onPress={onClose}>
              <X size={20} color={Colors.dark.mutedForeground} />
            </TouchableOpacity>
          </View>

          {/* Duration Presets */}
          <Text style={{ color: Colors.dark.primary, fontSize: 12, fontWeight: '600', marginBottom: 8 }}>Duration (Hours)</Text>
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
            {[0.5, 1.0, 1.5, 2.0, 2.5].map((h) => (
              <TouchableOpacity key={h} onPress={() => setHours(h)} style={{ flex: 1, borderRadius: 8, overflow: 'hidden' }}>
                {hours === h ? (
                  <LinearGradient colors={[Colors.brandPrimary, Colors.brandSecondary]} style={{ paddingVertical: 8, alignItems: 'center' }}>
                    <Text style={{ color: Colors.dark.primaryForeground, fontWeight: '800', fontSize: 12 }}>{h}h</Text>
                  </LinearGradient>
                ) : (
                  <View style={{ paddingVertical: 8, backgroundColor: Colors.dark.background, alignItems: 'center', borderWidth: 1, borderColor: Colors.dark.border, borderRadius: 8 }}>
                    <Text style={{ color: Colors.dark.mutedForeground, fontWeight: '700', fontSize: 12 }}>{h}h</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Workout Type Chips */}
          <Text style={{ color: Colors.dark.primary, fontSize: 12, fontWeight: '600', marginBottom: 8 }}>Workout Category</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
            {availableWorkoutTypes.map((cat) => (
              <TouchableOpacity key={cat} onPress={() => setWorkoutType(cat)} style={{ borderRadius: 8, overflow: 'hidden' }}>
                {workoutType === cat ? (
                  <LinearGradient colors={[Colors.brandPrimary, Colors.brandSecondary]} style={{ paddingHorizontal: 12, paddingVertical: 6 }}>
                    <Text style={{ color: Colors.dark.primaryForeground, fontWeight: '800', fontSize: 12 }}>{cat}</Text>
                  </LinearGradient>
                ) : (
                  <View style={{ paddingHorizontal: 12, paddingVertical: 6, backgroundColor: Colors.dark.background, borderWidth: 1, borderColor: Colors.dark.border, borderRadius: 8 }}>
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
            style={{ backgroundColor: Colors.dark.background, color: Colors.dark.foreground, borderRadius: 10, padding: 12, marginBottom: 20, borderWidth: 1, borderColor: Colors.dark.border }}
          />

          <View style={{ flexDirection: 'row', gap: 12 }}>
            {existingLog && (
              <TouchableOpacity onPress={() => onDelete(dateStr)} style={{ backgroundColor: 'rgba(239,68,68,0.15)', paddingHorizontal: 16, paddingVertical: 14, borderRadius: 14, alignItems: 'center', borderWidth: 1, borderColor: '#ef4444' }}>
                <Trash2 size={20} color="#ef4444" />
              </TouchableOpacity>
            )}

            <TouchableOpacity onPress={() => onSave(dateStr, hours, workoutType, notes)} style={{ flex: 1, borderRadius: 14, overflow: 'hidden' }}>
              <LinearGradient colors={[Colors.brandPrimary, Colors.brandSecondary]} style={{ paddingVertical: 14, alignItems: 'center' }}>
                <Text style={{ color: Colors.dark.primaryForeground, fontWeight: '800', fontSize: 15 }}>Update Log Entry</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>
    </Modal>
  );
}

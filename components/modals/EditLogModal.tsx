import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity, TextInput } from 'react-native';
import { GymLog, WorkoutType } from '@/lib/types';
import { Trash2, X } from 'lucide-react-native';

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
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', padding: 20 }}>
        <View style={{ backgroundColor: '#18181b', borderRadius: 24, padding: 24, borderWidth: 1, borderColor: '#27272a' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <Text style={{ color: '#f4f4f5', fontSize: 18, fontWeight: '800' }}>Edit Log: {dateStr}</Text>
            <TouchableOpacity onPress={onClose}>
              <X size={20} color="#a1a1aa" />
            </TouchableOpacity>
          </View>

          {/* Duration Presets */}
          <Text style={{ color: '#d4d4d8', fontSize: 12, fontWeight: '600', marginBottom: 8 }}>Duration (Hours)</Text>
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
            {[0.5, 1.0, 1.5, 2.0, 2.5].map((h) => (
              <TouchableOpacity
                key={h}
                onPress={() => setHours(h)}
                style={{ flex: 1, paddingVertical: 8, borderRadius: 8, backgroundColor: hours === h ? '#10b981' : '#09090b', alignItems: 'center' }}
              >
                <Text style={{ color: hours === h ? '#09090b' : '#a1a1aa', fontWeight: '700', fontSize: 12 }}>{h}h</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Workout Type Chips */}
          <Text style={{ color: '#d4d4d8', fontSize: 12, fontWeight: '600', marginBottom: 8 }}>Workout Category</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
            {availableWorkoutTypes.map((cat) => (
              <TouchableOpacity
                key={cat}
                onPress={() => setWorkoutType(cat)}
                style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: workoutType === cat ? '#10b981' : '#09090b' }}
              >
                <Text style={{ color: workoutType === cat ? '#09090b' : '#a1a1aa', fontWeight: '700', fontSize: 12 }}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Notes */}
          <TextInput
            value={notes}
            onChangeText={setNotes}
            placeholder="Session notes (optional)..."
            placeholderTextColor="#71717a"
            style={{ backgroundColor: '#09090b', color: '#f4f4f5', borderRadius: 10, padding: 12, marginBottom: 20, borderWidth: 1, borderColor: '#27272a' }}
          />

          <View style={{ flexDirection: 'row', gap: 12 }}>
            {existingLog && (
              <TouchableOpacity onPress={() => onDelete(dateStr)} style={{ backgroundColor: 'rgba(239,68,68,0.15)', paddingHorizontal: 16, paddingVertical: 14, borderRadius: 14, alignItems: 'center', borderWidth: 1, borderColor: '#ef4444' }}>
                <Trash2 size={20} color="#ef4444" />
              </TouchableOpacity>
            )}

            <TouchableOpacity onPress={() => onSave(dateStr, hours, workoutType, notes)} style={{ flex: 1, backgroundColor: '#10b981', paddingVertical: 14, borderRadius: 14, alignItems: 'center' }}>
              <Text style={{ color: '#09090b', fontWeight: '800', fontSize: 15 }}>Update Log Entry</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

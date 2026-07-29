import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, TextInput } from 'react-native';
import { WorkoutType } from '@/lib/types';
import { Dumbbell } from 'lucide-react-native';

interface DailyCheckInModalProps {
  dateStr: string;
  isOpen: boolean;
  onCheckInYes: (hours: number, workoutType: WorkoutType, notes?: string) => Promise<void>;
  onCheckInNo: () => void;
  availableWorkoutTypes?: string[];
}

export default function DailyCheckInModal({
  dateStr,
  isOpen,
  onCheckInYes,
  onCheckInNo,
  availableWorkoutTypes = ['Push', 'Pull', 'Legs', 'Cardio', 'Core', 'Custom'],
}: DailyCheckInModalProps) {
  const [answeredYes, setAnsweredYes] = useState(false);
  const [hours, setHours] = useState(1.0);
  const [workoutType, setWorkoutType] = useState('Push');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  return (
    <Modal visible={isOpen} transparent animationType="slide">
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', padding: 20 }}>
        <View style={{ backgroundColor: '#18181b', borderRadius: 24, padding: 24, borderWidth: 1, borderColor: '#27272a' }}>
          {!answeredYes ? (
            <View style={{ alignItems: 'center' }}>
              <Dumbbell size={36} color="#10b981" style={{ marginBottom: 12 }} />
              <Text style={{ color: '#f4f4f5', fontSize: 22, fontWeight: '900', textAlign: 'center' }}>Did you hit the gym today?</Text>
              <Text style={{ color: '#a1a1aa', fontSize: 13, marginTop: 4, marginBottom: 24, textAlign: 'center' }}>{dateStr}</Text>

              <View style={{ flexDirection: 'row', gap: 12, width: '100%' }}>
                <TouchableOpacity onPress={() => setAnsweredYes(true)} style={{ flex: 1, backgroundColor: '#10b981', paddingVertical: 14, borderRadius: 14, alignItems: 'center' }}>
                  <Text style={{ color: '#09090b', fontWeight: '800', fontSize: 15 }}>Yes!</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={onCheckInNo} style={{ flex: 1, backgroundColor: '#27272a', paddingVertical: 14, borderRadius: 14, alignItems: 'center' }}>
                  <Text style={{ color: '#f4f4f5', fontWeight: '700', fontSize: 15 }}>Rest Day</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View>
              <Text style={{ color: '#f4f4f5', fontSize: 18, fontWeight: '800', marginBottom: 16 }}>Session Details</Text>

              {/* Hours Presets */}
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

              <TouchableOpacity onPress={() => onCheckInYes(hours, workoutType, notes)} style={{ backgroundColor: '#10b981', paddingVertical: 14, borderRadius: 14, alignItems: 'center' }}>
                <Text style={{ color: '#09090b', fontWeight: '800', fontSize: 15 }}>Save Workout Log</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

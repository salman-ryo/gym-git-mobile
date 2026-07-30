import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, TextInput } from 'react-native';
import { WorkoutType } from '@/lib/types';
import { Dumbbell } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

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
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', padding: 20 }}>
        <LinearGradient
          colors={['#18181b', '#0f291e']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ borderRadius: 28, padding: 24, borderWidth: 1, borderColor: 'rgba(16,185,129,0.3)' }}
        >
          {!answeredYes ? (
            <View style={{ alignItems: 'center' }}>
              <LinearGradient
                colors={['#10b981', '#059669']}
                style={{ width: 56, height: 56, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 16 }}
              >
                <Dumbbell size={30} color="#09090b" />
              </LinearGradient>
              <Text style={{ color: '#f4f4f5', fontSize: 22, fontWeight: '900', textAlign: 'center' }}>Did you hit the gym today?</Text>
              <Text style={{ color: '#a1a1aa', fontSize: 13, marginTop: 4, marginBottom: 24, textAlign: 'center' }}>{dateStr}</Text>

              <View style={{ flexDirection: 'row', gap: 12, width: '100%' }}>
                <TouchableOpacity onPress={() => setAnsweredYes(true)} style={{ flex: 1, borderRadius: 14, overflow: 'hidden' }}>
                  <LinearGradient colors={['#10b981', '#059669']} style={{ paddingVertical: 14, alignItems: 'center' }}>
                    <Text style={{ color: '#09090b', fontWeight: '800', fontSize: 15 }}>Yes!</Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity onPress={onCheckInNo} style={{ flex: 1, backgroundColor: '#27272a', paddingVertical: 14, borderRadius: 14, alignItems: 'center', borderWidth: 1, borderColor: '#3f3f46' }}>
                  <Text style={{ color: '#f4f4f5', fontWeight: '700', fontSize: 15 }}>Rest Day</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View>
              <Text style={{ color: '#f4f4f5', fontSize: 20, fontWeight: '800', marginBottom: 16 }}>Session Details</Text>

              {/* Hours Presets */}
              <Text style={{ color: '#d4d4d8', fontSize: 12, fontWeight: '600', marginBottom: 8 }}>Duration (Hours)</Text>
              <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
                {[0.5, 1.0, 1.5, 2.0, 2.5].map((h) => (
                  <TouchableOpacity
                    key={h}
                    onPress={() => setHours(h)}
                    style={{ flex: 1, borderRadius: 8, overflow: 'hidden' }}
                  >
                    {hours === h ? (
                      <LinearGradient colors={['#10b981', '#059669']} style={{ paddingVertical: 8, alignItems: 'center' }}>
                        <Text style={{ color: '#09090b', fontWeight: '800', fontSize: 12 }}>{h}h</Text>
                      </LinearGradient>
                    ) : (
                      <View style={{ paddingVertical: 8, backgroundColor: '#09090b', alignItems: 'center', borderWidth: 1, borderColor: '#27272a', borderRadius: 8 }}>
                        <Text style={{ color: '#a1a1aa', fontWeight: '700', fontSize: 12 }}>{h}h</Text>
                      </View>
                    )}
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
                    style={{ borderRadius: 8, overflow: 'hidden' }}
                  >
                    {workoutType === cat ? (
                      <LinearGradient colors={['#10b981', '#059669']} style={{ paddingHorizontal: 12, paddingVertical: 6 }}>
                        <Text style={{ color: '#09090b', fontWeight: '800', fontSize: 12 }}>{cat}</Text>
                      </LinearGradient>
                    ) : (
                      <View style={{ paddingHorizontal: 12, paddingVertical: 6, backgroundColor: '#09090b', borderWidth: 1, borderColor: '#27272a', borderRadius: 8 }}>
                        <Text style={{ color: '#a1a1aa', fontWeight: '700', fontSize: 12 }}>{cat}</Text>
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
                placeholderTextColor="#71717a"
                style={{ backgroundColor: '#09090b', color: '#f4f4f5', borderRadius: 10, padding: 12, marginBottom: 20, borderWidth: 1, borderColor: '#27272a' }}
              />

              <TouchableOpacity onPress={() => onCheckInYes(hours, workoutType, notes)} style={{ borderRadius: 14, overflow: 'hidden' }}>
                <LinearGradient colors={['#10b981', '#059669']} style={{ paddingVertical: 14, alignItems: 'center' }}>
                  <Text style={{ color: '#09090b', fontWeight: '800', fontSize: 15 }}>Save Workout Log</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}
        </LinearGradient>
      </View>
    </Modal>
  );
}

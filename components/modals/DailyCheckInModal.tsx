import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, TextInput } from 'react-native';
import { WorkoutType } from '@/lib/types';
import { Dumbbell } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/Colors';

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
          colors={[Colors.dark.card, '#072417']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ borderRadius: 28, padding: 24, borderWidth: 1, borderColor: 'rgba(52,211,153,0.3)' }}
        >
          {!answeredYes ? (
            <View style={{ alignItems: 'center' }}>
              <LinearGradient
                colors={[Colors.brandPrimary, Colors.brandSecondary]}
                style={{ width: 56, height: 56, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 16 }}
              >
                <Dumbbell size={30} color={Colors.dark.primaryForeground} />
              </LinearGradient>
              <Text style={{ color: Colors.dark.foreground, fontSize: 22, fontWeight: '900', textAlign: 'center' }}>Did you hit the gym today?</Text>
              <Text style={{ color: Colors.dark.mutedForeground, fontSize: 13, marginTop: 4, marginBottom: 24, textAlign: 'center' }}>{dateStr}</Text>

              <View style={{ flexDirection: 'row', gap: 12, width: '100%' }}>
                <TouchableOpacity onPress={() => setAnsweredYes(true)} style={{ flex: 1, borderRadius: 14, overflow: 'hidden' }}>
                  <LinearGradient colors={[Colors.brandPrimary, Colors.brandSecondary]} style={{ paddingVertical: 14, alignItems: 'center' }}>
                    <Text style={{ color: Colors.dark.primaryForeground, fontWeight: '800', fontSize: 15 }}>Yes!</Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity onPress={onCheckInNo} style={{ flex: 1, backgroundColor: Colors.dark.secondary, paddingVertical: 14, borderRadius: 14, alignItems: 'center', borderWidth: 1, borderColor: Colors.dark.border }}>
                  <Text style={{ color: Colors.dark.foreground, fontWeight: '700', fontSize: 15 }}>Rest Day</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View>
              <Text style={{ color: Colors.dark.foreground, fontSize: 20, fontWeight: '800', marginBottom: 16 }}>Session Details</Text>

              {/* Hours Presets */}
              <Text style={{ color: Colors.dark.primary, fontSize: 12, fontWeight: '600', marginBottom: 8 }}>Duration (Hours)</Text>
              <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
                {[0.5, 1.0, 1.5, 2.0, 2.5].map((h) => (
                  <TouchableOpacity
                    key={h}
                    onPress={() => setHours(h)}
                    style={{ flex: 1, borderRadius: 8, overflow: 'hidden' }}
                  >
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
                  <TouchableOpacity
                    key={cat}
                    onPress={() => setWorkoutType(cat)}
                    style={{ borderRadius: 8, overflow: 'hidden' }}
                  >
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

              <TouchableOpacity onPress={() => onCheckInYes(hours, workoutType, notes)} style={{ borderRadius: 14, overflow: 'hidden' }}>
                <LinearGradient colors={[Colors.brandPrimary, Colors.brandSecondary]} style={{ paddingVertical: 14, alignItems: 'center' }}>
                  <Text style={{ color: Colors.dark.primaryForeground, fontWeight: '800', fontSize: 15 }}>Save Workout Log</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}
        </LinearGradient>
      </View>
    </Modal>
  );
}

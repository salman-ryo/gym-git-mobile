import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, TextInput, Image } from 'react-native';
import { WorkoutType } from '@/lib/types';
import { formatDisplayDate } from '@/lib/scientific-streak';
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
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.88)', justifyContent: 'center', padding: 20 }}>
        <LinearGradient
          colors={[Colors.dark.card, Colors.dark.background]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            borderRadius: 28,
            padding: 24,
            borderWidth: 1,
            borderColor: 'rgba(21, 223, 226, 0.69)',
            overflow: 'hidden',
          }}
        >
          {/* Background watermarks */}
          <Image
            source={require('@/assets/images/ggdumbell.webp')}
            style={{ position: 'absolute', top: -20, right: -20, width: 160, height: 160, opacity: 0.06, transform: [{ rotate: '-15deg' }] }}
            resizeMode="contain"
          />
          <Image
            source={require('@/assets/images/gggit.webp')}
            style={{ position: 'absolute', bottom: -20, left: -20, width: 130, height: 130, opacity: 0.05, transform: [{ rotate: '10deg' }] }}
            resizeMode="contain"
          />

          {/* Glow blobs */}
          <View style={{ position: 'absolute', top: -40, left: -40, width: 180, height: 180, borderRadius: 90, backgroundColor: 'rgba(20,184,166,0.06)' }} />
          <View style={{ position: 'absolute', bottom: -40, right: -40, width: 180, height: 180, borderRadius: 90, backgroundColor: 'rgba(168,85,247,0.06)' }} />

          {!answeredYes ? (
            <View style={{ alignItems: 'center' }}>
              {/* Real dumbbell image */}
              <View style={{
                width: 72,
                height: 72,
                borderRadius: 24,
                backgroundColor: Colors.brandTeal,
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 18,
              }}>
                <Image
                  source={require('@/assets/images/ggdumbell.webp')}
                  style={{ width: 46, height: 46 }}
                  resizeMode="contain"
                />
              </View>

              <Text style={{ color: Colors.dark.foreground, fontSize: 22, fontWeight: '900', textAlign: 'center' }}>
                Did you hit the gym today?
              </Text>
              <Text style={{ color: Colors.dark.mutedForeground, fontSize: 13, marginTop: 6, marginBottom: 28, textAlign: 'center' }}>
                {formatDisplayDate(dateStr)}
              </Text>

              <View style={{ flexDirection: 'row', gap: 12, width: '100%' }}>
                <TouchableOpacity onPress={() => setAnsweredYes(true)} style={{ flex: 1, borderRadius: 14, overflow: 'hidden' }}>
                  <LinearGradient colors={[Colors.brandPrimary, Colors.brandSecondary]} style={{ paddingVertical: 14, alignItems: 'center' }}>
                    <Text style={{ color: Colors.dark.primaryForeground, fontWeight: '800', fontSize: 15 }}>Yes! 💪</Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={onCheckInNo}
                  style={{ flex: 1, paddingVertical: 14, borderRadius: 14, alignItems: 'center', borderWidth: 1, borderColor: Colors.dark.border, backgroundColor: 'rgba(38,38,38,0.6)' }}
                >
                  <Text style={{ color: Colors.dark.mutedForeground, fontWeight: '700', fontSize: 15 }}>Rest Day</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View>
              {/* Section header with dumbbell image */}
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                <Image
                  source={require('@/assets/images/ggdumbell.webp')}
                  style={{ width: 28, height: 28 }}
                  resizeMode="contain"
                />
                <View>
                  <Text style={{ color: Colors.dark.foreground, fontSize: 18, fontWeight: '800' }}>Session Details</Text>
                  <Text style={{ color: Colors.dark.mutedForeground, fontSize: 11 }}>{formatDisplayDate(dateStr)}</Text>
                </View>
              </View>

              {/* Hours Presets */}
              <Text style={{ color: Colors.dark.mutedForeground, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Duration</Text>
              <View style={{ flexDirection: 'row', gap: 8, marginBottom: 18 }}>
                {[0.5, 1.0, 1.5, 2.0, 2.5].map((h) => (
                  <TouchableOpacity
                    key={h}
                    onPress={() => setHours(h)}
                    style={{ flex: 1, borderRadius: 10, overflow: 'hidden' }}
                  >
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
                  <TouchableOpacity
                    key={cat}
                    onPress={() => setWorkoutType(cat)}
                    style={{ borderRadius: 10, overflow: 'hidden' }}
                  >
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

              <TouchableOpacity onPress={() => onCheckInYes(hours, workoutType, notes)} style={{ borderRadius: 14, overflow: 'hidden' }}>
                <LinearGradient
                  colors={[Colors.brandPrimary, Colors.brandTeal, '#a855f7']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{ paddingVertical: 15, alignItems: 'center' }}
                >
                  <Text style={{ color: '#fff', fontWeight: '900', fontSize: 15 }}>Save Workout Log</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}
        </LinearGradient>
      </View>
    </Modal>
  );
}

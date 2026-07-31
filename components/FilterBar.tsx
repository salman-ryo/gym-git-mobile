import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { WorkoutType, WeeklyPlan } from '@/lib/types';
import { SlidersHorizontal } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/Colors';

interface FilterBarProps {
  activeFilter: WorkoutType | 'All';
  onFilterChange: (filter: WorkoutType | 'All') => void;
  weeklyPlan?: WeeklyPlan;
  availableTypes?: string[];
}

export default function FilterBar({
  activeFilter,
  onFilterChange,
  weeklyPlan,
  availableTypes = [],
}: FilterBarProps) {
  const planCategories = weeklyPlan?.categories || ['Push', 'Pull', 'Legs', 'Cardio', 'Custom'];
  const extraHistoricalTypes = availableTypes.filter((t) => !planCategories.includes(t) && t !== 'All');

  const displayFilterItems: { label: WorkoutType | 'All'; isExtra?: boolean }[] = [{ label: 'All' }];
  planCategories.forEach((cat) => displayFilterItems.push({ label: cat }));
  extraHistoricalTypes.forEach((cat) => displayFilterItems.push({ label: cat, isExtra: true }));

  return (
    <LinearGradient
      colors={[Colors.dark.card, Colors.dark.background]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ padding: 14, borderRadius: 20, marginBottom: 16, borderWidth: 1, borderColor: Colors.dark.border }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 }}>
        <SlidersHorizontal size={14} color={Colors.brandPrimary} />
        <Text style={{ color: Colors.dark.foreground, fontSize: 12, fontWeight: '700', textTransform: 'uppercase' }}>Filter Activity</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
        {displayFilterItems.map((item) => {
          const isActive = activeFilter === item.label;

          if (isActive) {
            return (
              <TouchableOpacity key={item.label} onPress={() => onFilterChange(item.label)}>
                <LinearGradient
                  colors={[Colors.brandPrimary, Colors.brandSecondary]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{ paddingHorizontal: 14, paddingVertical: 7, borderRadius: 10 }}
                >
                  <Text style={{ color: Colors.dark.primaryForeground, fontWeight: '800', fontSize: 12 }}>
                    {item.label} {item.isExtra ? '(Past)' : ''}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            );
          }

          return (
            <TouchableOpacity
              key={item.label}
              onPress={() => onFilterChange(item.label)}
              style={{
                paddingHorizontal: 14,
                paddingVertical: 7,
                borderRadius: 10,
                backgroundColor: item.isExtra ? Colors.cards.streak.glow : Colors.dark.background,
                borderWidth: 1,
                borderColor: item.isExtra ? Colors.cards.streak.border : Colors.dark.border,
              }}
            >
              <Text style={{ color: item.isExtra ? Colors.cards.streak.text : Colors.dark.mutedForeground, fontWeight: '700', fontSize: 12 }}>
                {item.label} {item.isExtra ? '(Past)' : ''}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </LinearGradient>
  );
}

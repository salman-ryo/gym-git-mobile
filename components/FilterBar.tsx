import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { WorkoutType, WeeklyPlan } from '@/lib/types';
import { SlidersHorizontal, Settings2 } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface FilterBarProps {
  activeFilter: WorkoutType | 'All';
  onFilterChange: (filter: WorkoutType | 'All') => void;
  weeklyPlan?: WeeklyPlan;
  onOpenPlanModal?: () => void;
  availableTypes?: string[];
}

export default function FilterBar({
  activeFilter,
  onFilterChange,
  weeklyPlan,
  onOpenPlanModal,
  availableTypes = [],
}: FilterBarProps) {
  const planCategories = weeklyPlan?.categories || ['Push', 'Pull', 'Legs', 'Cardio', 'Custom'];
  const extraHistoricalTypes = availableTypes.filter((t) => !planCategories.includes(t) && t !== 'All');

  const displayFilterItems: { label: WorkoutType | 'All'; isExtra?: boolean }[] = [{ label: 'All' }];
  planCategories.forEach((cat) => displayFilterItems.push({ label: cat }));
  extraHistoricalTypes.forEach((cat) => displayFilterItems.push({ label: cat, isExtra: true }));

  return (
    <LinearGradient
      colors={['#18181b', '#0f172a']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ padding: 14, borderRadius: 20, marginBottom: 16, borderWidth: 1, borderColor: '#27272a' }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <SlidersHorizontal size={14} color="#10b981" />
          <Text style={{ color: '#d4d4d8', fontSize: 12, fontWeight: '700', textTransform: 'uppercase' }}>Filter Activity</Text>
        </View>
        {onOpenPlanModal && (
          <TouchableOpacity onPress={onOpenPlanModal} style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#27272a', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 }}>
            <Settings2 size={12} color="#10b981" />
            <Text style={{ color: '#10b981', fontSize: 11, fontWeight: '700' }}>Plan Split</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
        {displayFilterItems.map((item) => {
          const isActive = activeFilter === item.label;

          if (isActive) {
            return (
              <TouchableOpacity key={item.label} onPress={() => onFilterChange(item.label)}>
                <LinearGradient
                  colors={['#10b981', '#059669']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{ paddingHorizontal: 14, paddingVertical: 7, borderRadius: 10 }}
                >
                  <Text style={{ color: '#09090b', fontWeight: '800', fontSize: 12 }}>
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
                backgroundColor: item.isExtra ? 'rgba(245,158,11,0.15)' : '#09090b',
                borderWidth: 1,
                borderColor: item.isExtra ? '#f59e0b' : '#27272a',
              }}
            >
              <Text style={{ color: item.isExtra ? '#f59e0b' : '#a1a1aa', fontWeight: '700', fontSize: 12 }}>
                {item.label} {item.isExtra ? '(Past)' : ''}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </LinearGradient>
  );
}

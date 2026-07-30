import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { GymLog, TimeframeView, WorkoutType } from '@/lib/types';
import { formatDateKey } from '@/lib/scientific-streak';
import { LinearGradient } from 'expo-linear-gradient';

interface ContributionGraphProps {
  logs: GymLog[];
  activeFilter: WorkoutType | 'All';
  onTileClick: (dateStr: string, log?: GymLog) => void;
}

export default function ContributionGraph({ logs, activeFilter, onTileClick }: ContributionGraphProps) {
  const [timeframe, setTimeframe] = useState<TimeframeView>('year');

  const logMap = useMemo(() => {
    const map = new Map<string, GymLog>();
    logs.forEach((log) => map.set(log.date, log));
    return map;
  }, [logs]);

  const getTileBgColor = (hours: number) => {
    if (hours <= 0) return '#27272a';
    if (hours < 1.0) return '#86efac';
    if (hours < 2.0) return '#22c55e';
    return '#15803d';
  };

  // Year View Data (52 Weeks x 7 Days)
  const yearWeeks = useMemo(() => {
    const today = new Date();
    const todayDayOfWeek = today.getDay();
    const endDate = new Date(today);
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 364 - todayDayOfWeek);

    const weeks: { weekIndex: number; days: { dateStr: string; hours: number; log?: GymLog }[] }[] = [];
    let currentDate = new Date(startDate);
    let currentWeekIndex = 0;
    let currentWeekDays: any[] = [];

    while (currentDate <= endDate) {
      const dateStr = formatDateKey(currentDate);
      const log = logMap.get(dateStr);
      const hours = log ? log.hours : 0;

      currentWeekDays.push({ dateStr, hours, log });

      if (currentWeekDays.length === 7) {
        weeks.push({ weekIndex: currentWeekIndex, days: currentWeekDays });
        currentWeekIndex++;
        currentWeekDays = [];
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return weeks;
  }, [logMap]);

  return (
    <LinearGradient
      colors={['#18181b', '#0d1f18']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ padding: 16, borderRadius: 20, marginBottom: 16, borderWidth: 1, borderColor: 'rgba(16,185,129,0.2)' }}
    >
      {/* Header View Switcher */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <Text style={{ color: '#f4f4f5', fontWeight: '800', fontSize: 15 }}>Gym Activity Grid</Text>

        <View style={{ flexDirection: 'row', backgroundColor: '#09090b', padding: 3, borderRadius: 12, borderWidth: 1, borderColor: '#27272a' }}>
          {(['year', 'month', 'week'] as TimeframeView[]).map((mode) => {
            const isActive = timeframe === mode;
            const label = mode === 'year' ? '365d' : mode === 'month' ? 'Month' : 'Week';

            if (isActive) {
              return (
                <TouchableOpacity key={mode} onPress={() => setTimeframe(mode)}>
                  <LinearGradient
                    colors={['#10b981', '#059669']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 }}
                  >
                    <Text style={{ fontSize: 11, fontWeight: '800', color: '#09090b' }}>{label}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              );
            }

            return (
              <TouchableOpacity key={mode} onPress={() => setTimeframe(mode)} style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 }}>
                <Text style={{ fontSize: 11, fontWeight: '700', color: '#a1a1aa' }}>{label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* 365 Days Grid View */}
      {timeframe === 'year' && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={{ flexDirection: 'row', gap: 4 }}>
            {yearWeeks.map((week) => (
              <View key={week.weekIndex} style={{ gap: 4 }}>
                {week.days.map((day) => {
                  const isFilteredOut = activeFilter !== 'All' && day.hours > 0 && day.log?.workoutType !== activeFilter;
                  return (
                    <TouchableOpacity
                      key={day.dateStr}
                      onPress={() => onTileClick(day.dateStr, day.log)}
                      style={{
                        width: 12,
                        height: 12,
                        borderRadius: 3,
                        backgroundColor: getTileBgColor(day.hours),
                        opacity: isFilteredOut ? 0.2 : 1.0,
                      }}
                    />
                  );
                })}
              </View>
            ))}
          </View>
        </ScrollView>
      )}

      {/* Month View */}
      {timeframe === 'month' && (
        <View style={{ paddingVertical: 12, alignItems: 'center' }}>
          <Text style={{ color: '#10b981', fontWeight: '700', fontSize: 13 }}>Current Month Activity Calendar</Text>
          <Text style={{ color: '#a1a1aa', fontSize: 11, marginTop: 4 }}>Tap any date to log or view workout details</Text>
        </View>
      )}

      {/* Week View */}
      {timeframe === 'week' && (
        <View style={{ paddingVertical: 12, alignItems: 'center' }}>
          <Text style={{ color: '#10b981', fontWeight: '700', fontSize: 13 }}>Current Week Activity Summary</Text>
          <Text style={{ color: '#a1a1aa', fontSize: 11, marginTop: 4 }}>Track your rolling weekly workout targets</Text>
        </View>
      )}
    </LinearGradient>
  );
}

import React from 'react';
import { View, Text } from 'react-native';
import { Stats } from '@/lib/types';
import { Flame, Trophy, CheckCircle2, Clock } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function StatsOverview({ stats }: { stats: Stats | null }) {
  if (!stats) return null;
  const streak = stats.scientificStreak;

  return (
    <View style={{ gap: 12, marginBottom: 16 }}>
      <View style={{ flexDirection: 'row', gap: 12 }}>
        {/* Current Streak Card */}
        <LinearGradient
          colors={['#18181b', 'rgba(245,158,11,0.15)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ flex: 1, padding: 16, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(245,158,11,0.4)' }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <Flame size={16} color="#f59e0b" />
            <Text style={{ color: '#a1a1aa', fontSize: 11, fontWeight: '700', textTransform: 'uppercase' }}>Current Streak</Text>
          </View>
          <Text style={{ color: '#f4f4f5', fontSize: 24, fontWeight: '900' }}>
            {stats.currentStreak} <Text style={{ fontSize: 13, color: '#f59e0b' }}>Days</Text>
          </Text>
          <Text style={{ color: '#f59e0b', fontSize: 10, fontWeight: '600', marginTop: 4 }}>Protected by plan rest days</Text>
        </LinearGradient>

        {/* Longest Record Card */}
        <LinearGradient
          colors={['#18181b', 'rgba(16,185,129,0.15)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ flex: 1, padding: 16, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(16,185,129,0.3)' }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <Trophy size={16} color="#10b981" />
            <Text style={{ color: '#a1a1aa', fontSize: 11, fontWeight: '700', textTransform: 'uppercase' }}>Record Streak</Text>
          </View>
          <Text style={{ color: '#f4f4f5', fontSize: 24, fontWeight: '900' }}>
            {stats.longestStreak} <Text style={{ fontSize: 13, color: '#10b981' }}>Days</Text>
          </Text>
          <Text style={{ color: '#34d399', fontSize: 10, fontWeight: '600', marginTop: 4 }}>Best compliant run</Text>
        </LinearGradient>
      </View>

      <View style={{ flexDirection: 'row', gap: 12 }}>
        {/* Compliance Card */}
        <LinearGradient
          colors={['#18181b', 'rgba(168,85,247,0.15)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ flex: 1, padding: 16, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(168,85,247,0.3)' }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <CheckCircle2 size={16} color="#c084fc" />
            <Text style={{ color: '#a1a1aa', fontSize: 11, fontWeight: '700', textTransform: 'uppercase' }}>Adherence</Text>
          </View>
          <Text style={{ color: '#f4f4f5', fontSize: 24, fontWeight: '900' }}>{streak?.complianceRate || 92}%</Text>
          <Text style={{ color: '#c084fc', fontSize: 10, fontWeight: '600', marginTop: 4 }}>
            Week: {streak?.currentWeekDone || 0}/{streak?.currentWeekTarget || 4} ({streak?.currentWeekStatus || 'On Track'})
          </Text>
        </LinearGradient>

        {/* Total Hours Card */}
        <LinearGradient
          colors={['#18181b', 'rgba(56,189,248,0.15)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ flex: 1, padding: 16, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(56,189,248,0.3)' }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <Clock size={16} color="#38bdf8" />
            <Text style={{ color: '#a1a1aa', fontSize: 11, fontWeight: '700', textTransform: 'uppercase' }}>Total Hours</Text>
          </View>
          <Text style={{ color: '#f4f4f5', fontSize: 24, fontWeight: '900' }}>
            {stats.totalHours} <Text style={{ fontSize: 13, color: '#38bdf8' }}>hrs</Text>
          </Text>
          <Text style={{ color: '#7dd3fc', fontSize: 10, marginTop: 4 }}>
            {stats.totalDays} sessions (~{stats.averageHoursPerSession}h avg)
          </Text>
        </LinearGradient>
      </View>
    </View>
  );
}

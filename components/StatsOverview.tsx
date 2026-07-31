import React from 'react';
import { View, Text } from 'react-native';
import { Stats } from '@/lib/types';
import { Flame, Trophy, CheckCircle2, Clock } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/Colors';

export default function StatsOverview({ stats }: { stats: Stats | null }) {
  if (!stats) return null;
  const streak = stats.scientificStreak;

  return (
    <View style={{ gap: 12, marginBottom: 16 }}>
      <View style={{ flexDirection: 'row', gap: 12 }}>
        {/* Current Streak Card */}
        <LinearGradient
          colors={[Colors.dark.card, Colors.cards.streak.glow]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ flex: 1, padding: 16, borderRadius: 20, borderWidth: 1, borderColor: Colors.cards.streak.border }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <Flame size={16} color={Colors.cards.streak.border} />
            <Text style={{ color: Colors.dark.mutedForeground, fontSize: 11, fontWeight: '700', textTransform: 'uppercase' }}>Current Streak</Text>
          </View>
          <Text style={{ color: Colors.dark.foreground, fontSize: 24, fontWeight: '900' }}>
            {stats.currentStreak} <Text style={{ fontSize: 13, color: Colors.cards.streak.text }}>Days</Text>
          </Text>
          <Text style={{ color: Colors.cards.streak.text, fontSize: 10, fontWeight: '600', marginTop: 4 }}>Protected by plan rest days</Text>
        </LinearGradient>

        {/* Longest Record Card */}
        <LinearGradient
          colors={[Colors.dark.card, Colors.cards.record.glow]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ flex: 1, padding: 16, borderRadius: 20, borderWidth: 1, borderColor: Colors.cards.record.border }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <Trophy size={16} color={Colors.cards.record.border} />
            <Text style={{ color: Colors.dark.mutedForeground, fontSize: 11, fontWeight: '700', textTransform: 'uppercase' }}>Record Streak</Text>
          </View>
          <Text style={{ color: Colors.dark.foreground, fontSize: 24, fontWeight: '900' }}>
            {stats.longestStreak} <Text style={{ fontSize: 13, color: Colors.cards.record.text }}>Days</Text>
          </Text>
          <Text style={{ color: Colors.cards.record.text, fontSize: 10, fontWeight: '600', marginTop: 4 }}>Best compliant run</Text>
        </LinearGradient>
      </View>

      <View style={{ flexDirection: 'row', gap: 12 }}>
        {/* Compliance Card */}
        <LinearGradient
          colors={[Colors.dark.card, Colors.cards.compliance.glow]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ flex: 1, padding: 16, borderRadius: 20, borderWidth: 1, borderColor: Colors.cards.compliance.border }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <CheckCircle2 size={16} color={Colors.cards.compliance.border} />
            <Text style={{ color: Colors.dark.mutedForeground, fontSize: 11, fontWeight: '700', textTransform: 'uppercase' }}>Adherence</Text>
          </View>
          <Text style={{ color: Colors.dark.foreground, fontSize: 24, fontWeight: '900' }}>{streak?.complianceRate || 92}%</Text>
          <Text style={{ color: Colors.cards.compliance.text, fontSize: 10, fontWeight: '600', marginTop: 4 }}>
            Week: {streak?.currentWeekDone || 0}/{streak?.currentWeekTarget || 4} ({streak?.currentWeekStatus || 'On Track'})
          </Text>
        </LinearGradient>

        {/* Total Hours Card */}
        <LinearGradient
          colors={[Colors.dark.card, Colors.cards.hours.glow]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ flex: 1, padding: 16, borderRadius: 20, borderWidth: 1, borderColor: Colors.cards.hours.border }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <Clock size={16} color={Colors.cards.hours.border} />
            <Text style={{ color: Colors.dark.mutedForeground, fontSize: 11, fontWeight: '700', textTransform: 'uppercase' }}>Total Hours</Text>
          </View>
          <Text style={{ color: Colors.dark.foreground, fontSize: 24, fontWeight: '900' }}>
            {stats.totalHours} <Text style={{ fontSize: 13, color: Colors.cards.hours.text }}>hrs</Text>
          </Text>
          <Text style={{ color: Colors.cards.hours.text, fontSize: 10, marginTop: 4 }}>
            {stats.totalDays} sessions (~{stats.averageHoursPerSession}h avg)
          </Text>
        </LinearGradient>
      </View>
    </View>
  );
}

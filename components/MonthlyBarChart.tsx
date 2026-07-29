import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView } from 'react-native';
import { GymLog, MonthlyStat } from '@/lib/types';
import { calculateScientificPowerScore } from '@/lib/scientific-power';
import { Swords } from 'lucide-react-native';

interface MonthlyBarChartProps {
  monthlyData: MonthlyStat[];
  logs: GymLog[];
}

export default function MonthlyBarChart({ monthlyData, logs }: MonthlyBarChartProps) {
  const [showFormula, setShowFormula] = useState(false);

  const logsMap = useMemo(() => {
    const map = new Map<string, GymLog>();
    logs.forEach((log) => { if (log.hours > 0) map.set(log.date, log); });
    return map;
  }, [logs]);

  const monthlyPowerStats = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return monthlyData.map((m) => {
      const daysInMonth = new Date(currentYear, m.monthIndex + 1, 0).getDate();
      const monthLogs: GymLog[] = [];
      logsMap.forEach((log) => {
        const [y, monthNum] = log.date.split('-').map(Number);
        if (y === currentYear && monthNum === m.monthIndex + 1) monthLogs.push(log);
      });
      const scoreData = calculateScientificPowerScore(monthLogs, daysInMonth, 4);
      return { ...m, scoreData };
    });
  }, [monthlyData, logsMap]);

  return (
    <View style={{ backgroundColor: '#18181b', padding: 16, borderRadius: 20, marginBottom: 16, borderWidth: 1, borderColor: '#27272a' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Swords size={16} color="#10b981" />
          <Text style={{ color: '#f4f4f5', fontWeight: '800', fontSize: 15 }}>Anime Power Levels</Text>
        </View>

        <TouchableOpacity onPress={() => setShowFormula(!showFormula)} style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, backgroundColor: '#27272a' }}>
          <Text style={{ color: '#10b981', fontSize: 11, fontWeight: '700' }}>Formula Info</Text>
        </TouchableOpacity>
      </View>

      {showFormula && (
        <View style={{ backgroundColor: '#09090b', padding: 12, borderRadius: 12, marginBottom: 14, borderWidth: 1, borderColor: '#10b981' }}>
          <Text style={{ color: '#10b981', fontWeight: '800', fontSize: 12, marginBottom: 4 }}>Scientific Scoring Breakdown (100 Pts Max):</Text>
          <Text style={{ color: '#a1a1aa', fontSize: 11 }}>• Consistency (45 pts): Target days hit per week</Text>
          <Text style={{ color: '#a1a1aa', fontSize: 11 }}>• Duration Quality (25 pts): 45m - 90m sweet spot</Text>
          <Text style={{ color: '#a1a1aa', fontSize: 11 }}>• Variety (20 pts): 3+ distinct workout types</Text>
          <Text style={{ color: '#a1a1aa', fontSize: 11 }}>• Momentum (10 pts): Attendance sequence ratio</Text>
        </View>
      )}

      {/* Vertical Bar Chart */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: 180, gap: 16, paddingTop: 30 }}>
          {monthlyPowerStats.map((m) => {
            const score = m.scoreData.totalScore;
            const heightPercent = Math.max(8, score);
            const char = m.scoreData.character;

            return (
              <View key={m.month} style={{ alignItems: 'center', width: 36, height: '100%', justifyContent: 'flex-end' }}>
                {/* Floating Anime Avatar Image */}
                {char && (
                  <View style={{ position: 'absolute', bottom: `${Math.min(75, heightPercent * 0.7 + 24)}%`, alignItems: 'center' }}>
                    <Image source={char.image} style={{ width: 28, height: 28, borderRadius: 14, borderWidth: 1, borderColor: '#f59e0b' }} />
                  </View>
                )}

                <Text style={{ color: '#a1a1aa', fontSize: 9, fontWeight: '700', marginBottom: 4 }}>{score}p</Text>

                <View style={{ width: 24, height: `${heightPercent}%`, backgroundColor: score > 35 ? '#10b981' : '#27272a', borderRadius: 4 }} />
                <Text style={{ color: '#71717a', fontSize: 10, marginTop: 6, fontWeight: '600' }}>{m.month}</Text>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

'use client';

import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView } from 'react-native';
import { GymLog, MonthlyStat, PowerScoreBreakdown, AnimePower } from '@/lib/types';
import { formatDateKey } from '@/lib/scientific-streak';
import { calculateScientificPowerScore } from '@/lib/scientific-power';
import { Swords } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import PowerScoreGuideModal from './modals/PowerScoreGuideModal';
import AnimeTierCard from './AnimeTierCard';
import { Colors } from '@/constants/Colors';

interface PowerLevelChartProps {
  monthlyData: MonthlyStat[];
  logs: GymLog[];
}

interface MonthlyPowerStat {
  month: string;
  monthIndex: number;
  year: number;
  count: number;
  totalHours: number;
  isCurrentMonth: boolean;
  scoreData: PowerScoreBreakdown;
}

interface WeeklyPowerStat {
  weekLabel: string;
  count: number;
  totalHours: number;
  isCurrentWeek: boolean;
  scoreData: PowerScoreBreakdown;
}

interface PowerColorTheme {
  barColors: [string, string];
  borderColor: string;
  textColor: string;
  scoreColor: string;
}

const getPowerColorTheme = (score: number, isCurrent: boolean): PowerColorTheme => {
  if (score === 0) {
    return {
      barColors: [Colors.dark.secondary, Colors.dark.card],
      borderColor: Colors.dark.secondary,
      textColor: Colors.dark.mutedForeground,
      scoreColor: Colors.dark.mutedForeground,
    };
  }

  if (score < 35) {
    return {
      barColors: isCurrent ? [Colors.cards.hours.border, Colors.cards.hours.text] : ['rgba(59,130,246,0.3)', 'rgba(96,165,250,0.3)'],
      borderColor: isCurrent ? Colors.cards.hours.text : Colors.dark.border,
      textColor: isCurrent ? Colors.cards.hours.text : Colors.dark.mutedForeground,
      scoreColor: isCurrent ? Colors.cards.hours.text : Colors.dark.mutedForeground,
    };
  }
  if (score < 55) {
    return {
      barColors: isCurrent ? [Colors.brandSecondary, Colors.brandPrimary] : ['rgba(16,185,129,0.3)', 'rgba(52,211,153,0.3)'],
      borderColor: isCurrent ? Colors.brandPrimary : Colors.dark.border,
      textColor: isCurrent ? Colors.brandPrimary : Colors.dark.mutedForeground,
      scoreColor: isCurrent ? Colors.brandPrimary : Colors.dark.mutedForeground,
    };
  }
  if (score < 72) {
    return {
      barColors: isCurrent ? ['#4f46e5', '#818cf8'] : ['rgba(79,70,229,0.3)', 'rgba(129,140,248,0.3)'],
      borderColor: isCurrent ? '#818cf8' : Colors.dark.border,
      textColor: isCurrent ? '#818cf8' : Colors.dark.mutedForeground,
      scoreColor: isCurrent ? '#818cf8' : Colors.dark.mutedForeground,
    };
  }
  if (score < 88) {
    return {
      barColors: isCurrent ? [Colors.cards.compliance.border, Colors.cards.compliance.text] : ['rgba(168,85,247,0.3)', 'rgba(192,132,252,0.3)'],
      borderColor: isCurrent ? Colors.cards.compliance.text : Colors.dark.border,
      textColor: isCurrent ? Colors.cards.compliance.text : Colors.dark.mutedForeground,
      scoreColor: isCurrent ? Colors.cards.compliance.text : Colors.dark.mutedForeground,
    };
  }
  if (score < 97) {
    return {
      barColors: isCurrent ? ['#be123c', '#fb7185'] : ['rgba(190,18,60,0.3)', 'rgba(251,113,133,0.3)'],
      borderColor: isCurrent ? '#fb7185' : Colors.dark.border,
      textColor: isCurrent ? '#fb7185' : Colors.dark.mutedForeground,
      scoreColor: isCurrent ? '#fb7185' : Colors.dark.mutedForeground,
    };
  }
  return {
    barColors: isCurrent ? [Colors.cards.streak.border, Colors.cards.streak.text] : ['rgba(245,158,11,0.3)', 'rgba(251,191,36,0.3)'],
    borderColor: isCurrent ? Colors.cards.streak.text : Colors.dark.border,
    textColor: isCurrent ? Colors.cards.streak.text : Colors.dark.mutedForeground,
    scoreColor: isCurrent ? Colors.cards.streak.text : Colors.dark.mutedForeground,
  };
};

export default function PowerLevelChart({ monthlyData, logs }: PowerLevelChartProps) {
  const [guideOpen, setGuideOpen] = useState(false);
  const [selectedStat, setSelectedStat] = useState<{
    title: string;
    score: number;
    character: AnimePower;
    gymDays: number;
    totalHours: number;
    scoreData: PowerScoreBreakdown;
  } | null>(null);

  const logsMap = useMemo(() => {
    const map = new Map<string, GymLog>();
    logs.forEach((l) => map.set(l.date, l));
    return map;
  }, [logs]);

  const monthlyPowerStats = useMemo(() => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonthIndex = today.getMonth();
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const result: MonthlyPowerStat[] = [];

    for (let i = 11; i >= 0; i--) {
      const targetDate = new Date(currentYear, currentMonthIndex - i, 1);
      const targetYear = targetDate.getFullYear();
      const targetMonthIndex = targetDate.getMonth();

      const daysInMonth = new Date(targetYear, targetMonthIndex + 1, 0).getDate();

      const monthLogs: GymLog[] = [];
      let count = 0;
      let totalHours = 0;

      logsMap.forEach((log) => {
        const [logY, logM] = log.date.split('-').map(Number);
        if (logY === targetYear && logM === targetMonthIndex + 1) {
          monthLogs.push(log);
          count++;
          totalHours += log.hours;
        }
      });

      const scoreData = calculateScientificPowerScore(monthLogs, daysInMonth, 4);

      result.push({
        month: monthNames[targetMonthIndex],
        monthIndex: targetMonthIndex,
        year: targetYear,
        count,
        totalHours: Number(totalHours.toFixed(1)),
        isCurrentMonth: i === 0,
        scoreData,
      });
    }

    return result;
  }, [logsMap]);

  const weeklyPowerStats = useMemo(() => {
    if (!logs) return [];

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();

    const startOfMonth = new Date(currentYear, currentMonth, 1);
    const endOfMonth = new Date(currentYear, currentMonth + 1, 0);

    const firstDayOfWeek = startOfMonth.getDay();
    const diffToMonday = startOfMonth.getDate() - firstDayOfWeek + (firstDayOfWeek === 0 ? -6 : 1);
    const currentWeekStart = new Date(startOfMonth);
    currentWeekStart.setDate(diffToMonday);

    const result: WeeklyPowerStat[] = [];

    while (currentWeekStart <= endOfMonth) {
      const mon = new Date(currentWeekStart);
      const sun = new Date(mon);
      sun.setDate(mon.getDate() + 6);

      const monStr = formatDateKey(mon);
      const sunStr = formatDateKey(sun);

      const weekLogs: GymLog[] = [];
      let count = 0;
      let totalHours = 0;

      logsMap.forEach((log) => {
        if (log.date >= monStr && log.date <= sunStr) {
          weekLogs.push(log);
          count++;
          totalHours += log.hours;
        }
      });

      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const weekLabel = `${monthNames[mon.getMonth()]} ${mon.getDate()}`;

      const isCurrentWeek = today >= mon && today <= sun;

      const scoreData = calculateScientificPowerScore(weekLogs, 7, 4);

      result.push({
        weekLabel,
        count,
        totalHours: Number(totalHours.toFixed(1)),
        isCurrentWeek,
        scoreData,
      });

      currentWeekStart.setDate(currentWeekStart.getDate() + 7);
    }

    return result;
  }, [logs, logsMap]);

  return (
    <LinearGradient
      colors={[Colors.dark.card, Colors.dark.background]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ padding: 16, borderRadius: 24, marginBottom: 16, borderWidth: 1, borderColor: Colors.dark.border, gap: 16 }}
    >
      {/* Header Info */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flex: 1, marginRight: 8 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 }}>
            <Swords size={16} color={Colors.brandPrimary} />
            <Text style={{ color: Colors.brandPrimary, fontWeight: '900', fontSize: 13, textTransform: 'uppercase', letterSpacing: 1.5 }}>
              Power Levels
            </Text>
          </View>
          <Text style={{ color: Colors.dark.mutedForeground, fontSize: 9, fontWeight: '600' }}>
            Sci-scored based on consistency, duration, variety &amp; momentum.
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => setGuideOpen(true)}
          style={{
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 20,
            backgroundColor: Colors.dark.background,
            borderWidth: 1,
            borderColor: Colors.dark.border,
          }}
        >
          <Text style={{ color: Colors.brandPrimary, fontSize: 9, fontWeight: '900', textTransform: 'uppercase' }}>
            What is it?
          </Text>
        </TouchableOpacity>
      </View>

      {/* Weekly Progress Chart */}
      <View style={{ borderTopWidth: 1, borderTopColor: Colors.dark.border, paddingTop: 14 }}>
        <Text style={{ color: Colors.dark.mutedForeground, fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1.2, textAlign: 'center', marginBottom: 10 }}>
          Weekly Progress
        </Text>

        <View style={{ flexDirection: 'row', height: 180, gap: 12, paddingTop: 24 }}>
          {weeklyPowerStats.map((w, idx) => {
            const score = w.scoreData.totalScore;
            const heightPercent = Math.max(6, score);
            const char = w.scoreData.character;
            const theme = getPowerColorTheme(score, w.isCurrentWeek);

              return (
              <TouchableOpacity
                key={`${w.weekLabel}-${idx}`}
                onPress={() => {
                  if (char) {
                    setSelectedStat({
                      title: `Week of ${w.weekLabel}`,
                      score,
                      character: char,
                      gymDays: w.count,
                      totalHours: w.totalHours,
                      scoreData: w.scoreData,
                    });
                  }
                }}
                style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-end', height: '100%' }}
              >
                {char && (
                  <View style={{ position: 'absolute', bottom: `${Math.min(75, heightPercent * 0.7 + 22)}%`, zIndex: 10 }}>
                    <Image source={char.image} style={{ width: 26, height: 26, borderRadius: 13, borderWidth: 1.5, borderColor: theme.borderColor }} />
                  </View>
                )}

                <Text style={{ fontSize: 9, fontWeight: '900', color: theme.scoreColor, marginBottom: 4 }}>
                  {score}
                </Text>

                <LinearGradient
                  colors={theme.barColors}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0, y: 1 }}
                  style={{
                    width: '100%',
                    maxWidth: 24,
                    height: `${heightPercent}%`,
                    borderRadius: 6,
                    borderWidth: w.isCurrentWeek ? 1 : 0,
                    borderColor: '#ffffff',
                  }}
                />

                <Text numberOfLines={1} style={{ fontSize: 8, color: theme.textColor, fontWeight: '700', marginTop: 6, width: '100%', textAlign: 'center' }}>
                  {w.weekLabel}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Monthly Progress Chart */}
      <View style={{ borderTopWidth: 1, borderTopColor: '#27272a', paddingTop: 14 }}>
        <Text style={{ color: '#a1a1aa', fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1.2, textAlign: 'center', marginBottom: 10 }}>
          Last 12 Months
        </Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={{ flexDirection: 'row', height: 180, gap: 14, paddingTop: 24, paddingRight: 10 }}>
            {monthlyPowerStats.map((m, idx) => {
              const score = m.scoreData.totalScore;
              const heightPercent = Math.max(6, score);
              const char = m.scoreData.character;
              const theme = getPowerColorTheme(score, m.isCurrentMonth);

              return (
              <TouchableOpacity
                key={`${m.year}-${m.monthIndex}-${idx}`}
                onPress={() => {
                  if (char) {
                    setSelectedStat({
                      title: `${m.month} ${m.year}`,
                      score,
                      character: char,
                      gymDays: m.count,
                      totalHours: m.totalHours,
                      scoreData: m.scoreData,
                    });
                  }
                }}
                style={{ width: 34, alignItems: 'center', justifyContent: 'flex-end', height: '100%' }}
              >
                {char && (
                  <View style={{ position: 'absolute', bottom: `${Math.min(75, heightPercent * 0.7 + 22)}%`, zIndex: 10 }}>
                    <Image source={char.image} style={{ width: 26, height: 26, borderRadius: 13, borderWidth: 1.5, borderColor: theme.borderColor }} />
                  </View>
                )}

                <Text style={{ fontSize: 9, fontWeight: '900', color: theme.scoreColor, marginBottom: 4 }}>
                  {score}
                </Text>

                <LinearGradient
                  colors={theme.barColors}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0, y: 1 }}
                  style={{
                    width: 20,
                    height: `${heightPercent}%`,
                    borderRadius: 6,
                    borderWidth: m.isCurrentMonth ? 1 : 0,
                    borderColor: '#ffffff',
                  }}
                />

                <Text style={{ fontSize: 8, color: theme.textColor, fontWeight: '700', marginTop: 6 }}>
                  {m.month}
                </Text>
              </TouchableOpacity>
            );
            })}
          </View>
        </ScrollView>
      </View>

      <PowerScoreGuideModal isOpen={guideOpen} onClose={() => setGuideOpen(false)} />

      {/* Anime Tier Card bottom sheet */}
      {selectedStat && (
        <AnimeTierCard
          isOpen={!!selectedStat}
          onClose={() => setSelectedStat(null)}
          title={selectedStat.title}
          score={selectedStat.score}
          character={selectedStat.character}
          gymDays={selectedStat.gymDays}
          totalHours={selectedStat.totalHours}
          scoreData={selectedStat.scoreData}
        />
      )}
    </LinearGradient>
  );
}

import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { GymLog, TimeframeView, WorkoutType } from '@/lib/types';
import { formatDateKey } from '@/lib/scientific-streak';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/Colors';

interface ContributionGraphProps {
  logs: GymLog[];
  activeFilter: WorkoutType | 'All';
  onTileClick: (dateStr: string, log?: GymLog) => void;
}

interface DayTile {
  dateStr: string;
  dateObj: Date;
  log?: GymLog;
  hours: number;
  workoutType?: WorkoutType;
  dayOfMonth?: number;
  isToday: boolean;
  isFuture: boolean;
}

interface WeekColumn {
  weekIndex: number;
  days: DayTile[];
}

const THEMES = [
  {
    name: 'sky',
    tile: '#38bdf8',
    border: '#0284c7',
    pill: '#0284c7',
    pillText: '#09090b',
    text: '#38bdf8',
    todayRing: '#38bdf8',
    todayDot: '#38bdf8',
    pillWeek: 'rgba(56,189,248,0.1)',
    pillWeekBorder: 'rgba(56,189,248,0.4)',
    barColors: ['#38bdf8', '#0284c7'] as [string, string],
  },
  {
    name: 'purple',
    tile: '#c084fc',
    border: '#7e22ce',
    pill: '#7e22ce',
    pillText: '#09090b',
    text: '#c084fc',
    todayRing: '#c084fc',
    todayDot: '#c084fc',
    pillWeek: 'rgba(192,132,252,0.1)',
    pillWeekBorder: 'rgba(192,132,252,0.4)',
    barColors: ['#c084fc', '#7e22ce'] as [string, string],
  },
  {
    name: 'rose',
    tile: '#fb7185',
    border: '#be123c',
    pill: '#be123c',
    pillText: '#09090b',
    text: '#fb7185',
    todayRing: '#fb7185',
    todayDot: '#fb7185',
    pillWeek: 'rgba(251,113,133,0.1)',
    pillWeekBorder: 'rgba(251,113,133,0.4)',
    barColors: ['#fb7185', '#be123c'] as [string, string],
  },
  {
    name: 'amber',
    tile: '#fbbf24',
    border: '#b45309',
    pill: '#b45309',
    pillText: '#09090b',
    text: '#fbbf24',
    todayRing: '#fbbf24',
    todayDot: '#fbbf24',
    pillWeek: 'rgba(251,191,36,0.1)',
    pillWeekBorder: 'rgba(251,191,36,0.4)',
    barColors: ['#fbbf24', '#b45309'] as [string, string],
  },
  {
    name: 'cyan',
    tile: '#22d3ee',
    border: '#0891b2',
    pill: '#0891b2',
    pillText: '#09090b',
    text: '#22d3ee',
    todayRing: '#22d3ee',
    todayDot: '#22d3ee',
    pillWeek: 'rgba(34,211,238,0.1)',
    pillWeekBorder: 'rgba(34,211,238,0.4)',
    barColors: ['#22d3ee', '#0891b2'] as [string, string],
  }
];

const getThemeForWorkout = (type: string) => {
  const defaultTheme = {
    tile: Colors.brandPrimary,
    border: Colors.brandSecondary,
    pill: Colors.brandSecondary,
    pillText: Colors.dark.primaryForeground,
    text: Colors.brandPrimary,
    todayRing: Colors.brandPrimary,
    todayDot: Colors.brandPrimary,
    pillWeek: 'rgba(52, 211, 153, 0.1)',
    pillWeekBorder: 'rgba(52, 211, 153, 0.4)',
    barColors: [Colors.brandPrimary, Colors.brandSecondary] as [string, string],
  };

  if (!type || type === 'All') return defaultTheme;

  let hash = 0;
  for (let i = 0; i < type.length; i++) {
    hash = type.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % THEMES.length;
  return THEMES[index];
};

const getTileBgColor = (hours: number): string => {
  if (hours <= 0) return '#27272a'; // zinc-800
  if (hours < 0.5) return '#052e16'; // green-950
  if (hours < 1.0) return '#166534'; // green-800
  if (hours < 1.5) return '#16a34a'; // green-600
  if (hours < 2.0) return '#4ade80'; // green-400
  if (hours < 2.6) return '#c084fc'; // purple-400
  if (hours >= 3.0) return '#fbbf24'; // amber-400
  return '#4ade80';
};

export default function ContributionGraph({ logs, activeFilter, onTileClick }: ContributionGraphProps) {
  const [timeframe, setTimeframe] = useState<TimeframeView>('year');

  const logMap = useMemo(() => {
    const map = new Map<string, GymLog>();
    logs.forEach((log) => map.set(log.date, log));
    return map;
  }, [logs]);

  // 1. YEAR VIEW DATA
  const yearData = useMemo(() => {
    const todayObj = new Date();
    const todayStr = formatDateKey(todayObj);
    todayObj.setHours(0, 0, 0, 0);

    const resultWeeks: WeekColumn[] = [];
    const months: { name: string; weekIndex: number }[] = [];

    const todayDayOfWeek = new Date().getDay();
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 364 - todayDayOfWeek);

    let currentDate = new Date(startDate);
    let currentWeekIndex = 0;
    let currentWeekDays: DayTile[] = [];
    let lastMonth = -1;

    let yearWorkouts = 0;
    let yearHours = 0;

    while (currentDate <= endDate) {
      const dateStr = formatDateKey(currentDate);
      const log = logMap.get(dateStr);
      const hours = log ? log.hours : 0;

      if (hours > 0) {
        yearWorkouts++;
        yearHours += hours;
      }

      const monthIndex = currentDate.getMonth();
      if (monthIndex !== lastMonth) {
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        if (months.length === 0 || currentWeekIndex - months[months.length - 1].weekIndex >= 3) {
          months.push({ name: monthNames[monthIndex], weekIndex: currentWeekIndex });
        }
        lastMonth = monthIndex;
      }

      const tileTime = new Date(currentDate);
      tileTime.setHours(0, 0, 0, 0);

      currentWeekDays.push({
        dateStr,
        dateObj: new Date(currentDate),
        log,
        hours,
        workoutType: log?.workoutType,
        isToday: dateStr === todayStr,
        isFuture: tileTime.getTime() > todayObj.getTime(),
      });

      if (currentWeekDays.length === 7) {
        resultWeeks.push({ weekIndex: currentWeekIndex, days: currentWeekDays });
        currentWeekIndex++;
        currentWeekDays = [];
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    if (currentWeekDays.length > 0) {
      resultWeeks.push({ weekIndex: currentWeekIndex, days: currentWeekDays });
    }

    return {
      weeks: resultWeeks,
      monthLabels: months,
      totalWorkouts: yearWorkouts,
      totalHours: Number(yearHours.toFixed(1)),
    };
  }, [logMap]);

  // 2. MONTH VIEW DATA
  const monthData = useMemo(() => {
    const todayObj = new Date();
    const todayStr = formatDateKey(todayObj);
    todayObj.setHours(0, 0, 0, 0);

    const year = todayObj.getFullYear();
    const month = todayObj.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const monthDays: DayTile[] = [];
    let monthWorkouts = 0;
    let monthHours = 0;

    const startPadding = firstDay.getDay();

    let d = new Date(firstDay);
    while (d <= lastDay) {
      const dateStr = formatDateKey(d);
      const log = logMap.get(dateStr);
      const hours = log ? log.hours : 0;

      if (hours > 0) {
        monthWorkouts++;
        monthHours += hours;
      }

      const tileTime = new Date(d);
      tileTime.setHours(0, 0, 0, 0);

      monthDays.push({
        dateStr,
        dateObj: new Date(d),
        log,
        hours,
        workoutType: log?.workoutType,
        dayOfMonth: d.getDate(),
        isToday: dateStr === todayStr,
        isFuture: tileTime.getTime() > todayObj.getTime(),
      });
      d.setDate(d.getDate() + 1);
    }

    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    return {
      monthName: monthNames[month],
      year,
      startPadding,
      days: monthDays,
      totalWorkouts: monthWorkouts,
      totalHours: Number(monthHours.toFixed(1)),
    };
  }, [logMap]);

  // 3. WEEK VIEW DATA
  const weekData = useMemo(() => {
    const todayObj = new Date();
    const todayStr = formatDateKey(todayObj);
    todayObj.setHours(0, 0, 0, 0);

    const dayOfWeek = todayObj.getDay();
    const distanceToMon = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(todayObj);
    monday.setDate(todayObj.getDate() + distanceToMon);

    const weekDays: DayTile[] = [];
    let weekWorkouts = 0;
    let weekHours = 0;

    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const dateStr = formatDateKey(d);
      const log = logMap.get(dateStr);
      const hours = log ? log.hours : 0;

      if (hours > 0) {
        weekWorkouts++;
        weekHours += hours;
      }

      const tileTime = new Date(d);
      tileTime.setHours(0, 0, 0, 0);

      weekDays.push({
        dateStr,
        dateObj: d,
        log,
        hours,
        workoutType: log?.workoutType,
        isToday: dateStr === todayStr,
        isFuture: tileTime.getTime() > todayObj.getTime(),
      });
    }

    return {
      days: weekDays,
      totalWorkouts: weekWorkouts,
      totalHours: Number(weekHours.toFixed(1)),
    };
  }, [logMap]);

  return (
    <LinearGradient
      colors={[Colors.dark.card, Colors.dark.background]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ padding: 16, borderRadius: 24, marginBottom: 16, borderWidth: 1, borderColor: Colors.dark.border }}
    >
      {/* Cyberpunk Header Layout */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <View style={{ flex: 1, marginRight: 8 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 }}>
            <View style={{ width: 6, height: 6, backgroundColor: Colors.brandPrimary, transform: [{ rotate: '45deg' }] }} />
            <Text style={{ color: Colors.brandPrimary, fontWeight: '900', fontSize: 13, textTransform: 'uppercase', letterSpacing: 1.5 }}>
              Activity Grid
            </Text>
          </View>
          <Text style={{ color: Colors.dark.mutedForeground, fontSize: 9, fontWeight: '600' }}>
            {timeframe === 'year' && `${yearData.totalWorkouts} sessions (${yearData.totalHours} hrs) in 365 Days`}
            {timeframe === 'month' && `${monthData.totalWorkouts} sessions (${monthData.totalHours} hrs) in ${monthData.monthName}`}
            {timeframe === 'week' && `${weekData.totalWorkouts} sessions (${weekData.totalHours} hrs) Current Week`}
          </Text>
        </View>

        {/* Timeframe selector pills */}
        <View style={{ flexDirection: 'row', backgroundColor: Colors.dark.background, padding: 3, borderRadius: 20, borderWidth: 1, borderColor: Colors.dark.border }}>
          {(['year', 'month', 'week'] as TimeframeView[]).map((mode) => {
            const isActive = timeframe === mode;
            const label = mode === 'year' ? '365d' : mode === 'month' ? 'Month' : 'Week';

            return (
              <TouchableOpacity
                key={mode}
                onPress={() => setTimeframe(mode)}
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 5,
                  borderRadius: 16,
                  backgroundColor: isActive ? Colors.brandPrimary : 'transparent',
                }}
              >
                <Text style={{ fontSize: 10, fontWeight: '800', color: isActive ? Colors.dark.primaryForeground : Colors.dark.mutedForeground }}>
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* 365 Days Grid View */}
      {timeframe === 'year' && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={{ flexDirection: 'row', gap: 4 }}>
            {yearData.weeks.map((week) => (
              <View key={week.weekIndex} style={{ gap: 4 }}>
                {week.days.map((day) => {
                  const isFilteredOut = activeFilter !== 'All' && day.hours > 0 && day.workoutType !== activeFilter;
                  const isMatchFilter = activeFilter !== 'All' && day.hours > 0 && day.workoutType === activeFilter;
                  const activeTheme = isMatchFilter ? getThemeForWorkout(activeFilter) : null;

                  let tileColor = getTileBgColor(day.hours);
                  if (isMatchFilter && activeTheme) tileColor = activeTheme.tile;

                  return (
                    <TouchableOpacity
                      key={day.dateStr}
                      disabled={day.isFuture}
                      onPress={() => onTileClick(day.dateStr, day.log)}
                      style={{
                        width: 12,
                        height: 12,
                        borderRadius: 3,
                        backgroundColor: tileColor,
                        opacity: day.isFuture ? 0.15 : isFilteredOut ? 0.2 : 1.0,
                        borderWidth: day.isToday ? 1.5 : 0,
                        borderColor: '#ffffff',
                      }}
                    />
                  );
                })}
              </View>
            ))}
          </View>
        </ScrollView>
      )}

      {/* Month View (Full Calendar Grid) */}
      {timeframe === 'month' && (
        <View style={{ gap: 8, marginTop: 8 }}>
          {/* Weekday Labels */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 4 }}>
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
              <Text key={idx} style={{ width: '12.8%', textAlign: 'center', color: '#71717a', fontSize: 10, fontWeight: '800' }}>
                {day}
              </Text>
            ))}
          </View>

          {/* Grid Cells */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-start' }}>
            {/* Start padding */}
            {Array.from({ length: monthData.startPadding }).map((_, i) => (
              <View
                key={`pad-${i}`}
                style={{
                  width: '12.8%',
                  aspectRatio: 1,
                  margin: '0.6%',
                  backgroundColor: 'rgba(39, 39, 42, 0.15)',
                  borderWidth: 1,
                  borderColor: 'rgba(39, 39, 42, 0.2)',
                  borderRadius: 8,
                }}
              />
            ))}

            {/* Days in Month */}
            {monthData.days.map((day) => {
              const isFilteredOut = activeFilter !== 'All' && day.hours > 0 && day.workoutType !== activeFilter;
              const theme = (day.hours > 0 && day.workoutType)
                ? getThemeForWorkout(day.workoutType)
                : getThemeForWorkout('All');

              return (
                <TouchableOpacity
                  key={day.dateStr}
                  disabled={day.isFuture}
                  onPress={() => onTileClick(day.dateStr, day.log)}
                  style={{
                    width: '12.8%',
                    aspectRatio: 1,
                    margin: '0.6%',
                    padding: 3,
                    borderRadius: 8,
                    backgroundColor: day.isFuture
                      ? 'rgba(24, 24, 27, 0.4)'
                      : day.hours > 0
                      ? 'rgba(52, 211, 153, 0.05)'
                      : Colors.dark.background,
                    borderWidth: day.isToday ? 1.5 : 1,
                    borderColor: day.isToday
                      ? theme.todayRing
                      : day.isFuture
                      ? 'rgba(39, 39, 42, 0.2)'
                      : day.hours > 0
                      ? 'rgba(52, 211, 153, 0.3)'
                      : Colors.dark.border,
                    opacity: day.isFuture ? 0.3 : isFilteredOut ? 0.3 : 1.0,
                    justifyContent: 'space-between',
                  }}
                >
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ fontSize: 9, fontWeight: '900', color: day.isToday ? theme.text : '#a1a1aa' }}>
                      {day.dayOfMonth}
                    </Text>
                    {day.hours > 0 && (
                      <View style={{ backgroundColor: theme.pill, paddingHorizontal: 3, paddingVertical: 1, borderRadius: 4 }}>
                        <Text style={{ fontSize: 7, fontWeight: '900', color: theme.pillText }}>
                          {day.hours}h
                        </Text>
                      </View>
                    )}
                  </View>

                  {day.workoutType ? (
                    <Text numberOfLines={1} style={{ fontSize: 7, fontWeight: '800', color: theme.text, textTransform: 'uppercase' }}>
                      {day.workoutType}
                    </Text>
                  ) : null}

                  {day.isToday && (
                    <View style={{ position: 'absolute', bottom: 3, right: 3, width: 4, height: 4, borderRadius: 2, backgroundColor: theme.todayDot }} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      )}

      {/* Week View (Vertical Card Stack) */}
      {timeframe === 'week' && (
        <View style={{ gap: 10, marginTop: 8 }}>
          {weekData.days.map((day) => {
            const dayName = day.dateObj.toLocaleDateString('en-US', { weekday: 'short' });
            const isFilteredOut = activeFilter !== 'All' && day.hours > 0 && day.workoutType !== activeFilter;
            const theme = (day.hours > 0 && day.workoutType)
              ? getThemeForWorkout(day.workoutType)
              : getThemeForWorkout('All');

            return (
              <TouchableOpacity
                key={day.dateStr}
                disabled={day.isFuture}
                onPress={() => onTileClick(day.dateStr, day.log)}
                style={{
                  backgroundColor: day.isFuture
                    ? 'rgba(24, 24, 27, 0.4)'
                    : day.hours > 0
                    ? 'rgba(52, 211, 153, 0.05)'
                    : Colors.dark.background,
                  borderRadius: 16,
                  padding: 12,
                  borderWidth: day.isToday ? 1.5 : 1,
                  borderColor: day.isToday ? theme.todayRing : Colors.dark.border,
                  opacity: day.isFuture ? 0.35 : isFilteredOut ? 0.35 : 1,
                  overflow: 'hidden',
                }}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View>
                    <Text style={{ fontSize: 10, fontWeight: '800', color: day.isToday ? theme.text : '#71717a', textTransform: 'uppercase' }}>
                      {dayName} • {day.dateStr.slice(5)}
                    </Text>
                    <Text style={{ fontSize: 18, fontWeight: '900', color: day.hours > 0 ? '#f4f4f5' : '#52525b', marginTop: 2 }}>
                      {day.hours > 0 ? `${day.hours} Hours` : 'REST DAY'}
                    </Text>
                  </View>

                  {day.workoutType ? (
                    <View style={{ backgroundColor: theme.pillWeek, borderColor: theme.pillWeekBorder, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 }}>
                      <Text style={{ fontSize: 9, fontWeight: '900', color: theme.text, textTransform: 'uppercase' }}>
                        {day.workoutType}
                      </Text>
                    </View>
                  ) : (
                    <Text style={{ fontSize: 10, fontWeight: '700', color: '#52525b', textTransform: 'uppercase' }}>None</Text>
                  )}
                </View>

                {/* Progress bar fill for active hours */}
                {day.hours > 0 && (
                  <View style={{ height: 4, backgroundColor: '#27272a', borderRadius: 2, marginTop: 10, overflow: 'hidden' }}>
                    <View
                      style={{
                        height: '100%',
                        backgroundColor: theme.tile,
                        width: `${Math.min(100, (day.hours / 2.5) * 100)}%`,
                      }}
                    />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </LinearGradient>
  );
}

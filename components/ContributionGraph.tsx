import React, { useMemo, useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Animated, StyleSheet } from 'react-native';
import { GymLog, TimeframeView, WorkoutType } from '@/lib/types';
import { formatDateKey, formatShortDate } from '@/lib/scientific-streak';
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

const getTileBgColor = (hours: number, workoutType?: string): string => {
  if (workoutType && (workoutType.toLowerCase() === 'freeze' || workoutType.toLowerCase() === 'frozen')) {
    return Colors.iceFrost;
  }
  if (workoutType && workoutType.toLowerCase() === 'rest') {
    return Colors.slateRest;
  }
  if (hours <= 0) return '#18181b';
  if (hours < 0.75) return '#14532d'; // Level 1
  if (hours < 1.25) return '#166534'; // Level 2
  if (hours < 2.0) return '#22c55e';  // Level 3
  return '#00ff88';                  // Level 4 (Peak)
};

export default function ContributionGraph({ logs, activeFilter, onTileClick }: ContributionGraphProps) {
  const [timeframe, setTimeframe] = useState<TimeframeView>('year');

  const yearScrollRef = useRef<ScrollView>(null);
  const monthScrollRef = useRef<ScrollView>(null);

  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.06, duration: 900, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1.0, duration: 900, useNativeDriver: true }),
      ])
    ).start();
  }, [pulseAnim]);

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
      style={styles.cardContainer}
    >
      {/* Cyberpunk Header Layout */}
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <View style={styles.headerTitleRow}>
            <View style={styles.diamondAccent} />
            <Text style={styles.headerTitleText}>
              ACTIVITY HEATMAP
            </Text>
          </View>
          <Text style={styles.headerSubtitleText}>
            {timeframe === 'year' && `${yearData.totalWorkouts} sessions (${yearData.totalHours} hrs) in 365 Days`}
            {timeframe === 'month' && `${monthData.totalWorkouts} sessions (${monthData.totalHours} hrs) in ${monthData.monthName}`}
            {timeframe === 'week' && `${weekData.totalWorkouts} sessions (${weekData.totalHours} hrs) Current Week`}
          </Text>
        </View>

        {/* Timeframe selector pills */}
        <View style={styles.timeframePillsRow}>
          {(['year', 'month', 'week'] as TimeframeView[]).map((mode) => {
            const isActive = timeframe === mode;
            const label = mode === 'year' ? '365d' : mode === 'month' ? 'Month' : 'Week';

            return (
              <TouchableOpacity
                key={mode}
                onPress={() => setTimeframe(mode)}
                style={[
                  styles.timeframePill,
                  isActive && styles.timeframePillActive,
                ]}
              >
                <Text
                  style={[
                    styles.timeframePillText,
                    isActive ? styles.timeframePillTextActive : styles.timeframePillTextInactive,
                  ]}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* 365 Days Grid View */}
      {timeframe === 'year' && (
        <ScrollView
          ref={yearScrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          onLayout={() => {
            yearScrollRef.current?.scrollToEnd({ animated: false });
          }}
        >
          <View style={{ flexDirection: 'row', gap: 4 }}>
            {yearData.weeks.map((week) => (
              <View key={week.weekIndex} style={{ gap: 4 }}>
                {week.days.map((day) => {
                  const isFilteredOut = activeFilter !== 'All' && day.hours > 0 && day.workoutType !== activeFilter;
                  const tileColor = getTileBgColor(day.hours, day.workoutType);

                  return (
                    <TouchableOpacity
                      key={day.dateStr}
                      disabled={day.isFuture}
                      onPress={() => onTileClick(day.dateStr, day.log)}
                      style={[
                        styles.yearTile,
                        {
                          backgroundColor: tileColor,
                          opacity: day.isFuture ? 0.15 : isFilteredOut ? 0.2 : 1.0,
                          borderWidth: day.isToday ? 1.5 : 1,
                          borderColor: day.isToday ? '#ffffff' : '#27272a',
                        },
                      ]}
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
        <ScrollView
          ref={monthScrollRef}
          showsVerticalScrollIndicator={false}
          onLayout={() => {
            const todayNum = new Date().getDate();
            const rowIndex = Math.floor((monthData.startPadding + todayNum - 1) / 7);
            const rowH = 48 + 8;
            const offset = Math.max(0, rowIndex * rowH - rowH);
            monthScrollRef.current?.scrollTo({ y: offset, animated: false });
          }}
        >
          <View style={{ gap: 8, marginTop: 8 }}>
            {/* Weekday Labels */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 4 }}>
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
                <Text key={idx} style={styles.monthWeekdayHeader}>
                  {day}
                </Text>
              ))}
            </View>

            {/* Grid Cells */}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-start' }}>
              {Array.from({ length: monthData.startPadding }).map((_, i) => (
                <View
                  key={`pad-${i}`}
                  style={styles.monthPadCell}
                />
              ))}

              {monthData.days.map((day) => {
                const isFilteredOut = activeFilter !== 'All' && day.hours > 0 && day.workoutType !== activeFilter;
                const tileColor = getTileBgColor(day.hours, day.workoutType);

                return (
                  <TouchableOpacity
                    key={day.dateStr}
                    disabled={day.isFuture}
                    onPress={() => onTileClick(day.dateStr, day.log)}
                    style={[
                      styles.monthCell,
                      {
                        backgroundColor: day.isFuture
                          ? 'rgba(24, 24, 27, 0.4)'
                          : tileColor === '#18181b'
                          ? Colors.dark.background
                          : `${tileColor}22`,
                        borderColor: day.isToday
                          ? '#ffffff'
                          : day.hours > 0
                          ? tileColor
                          : Colors.dark.border,
                        opacity: day.isFuture ? 0.3 : isFilteredOut ? 0.3 : 1.0,
                      },
                    ]}
                  >
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text style={{ fontSize: 9, fontWeight: '900', color: day.isToday ? '#ffffff' : '#a1a1aa' }}>
                        {day.dayOfMonth}
                      </Text>
                      {day.hours > 0 && (
                        <View style={[styles.hourBadge, { backgroundColor: tileColor }]}>
                          <Text style={styles.hourBadgeText}>{day.hours}h</Text>
                        </View>
                      )}
                    </View>

                    {day.workoutType ? (
                      <Text numberOfLines={1} style={[styles.monthWorkoutType, { color: tileColor }]}>
                        {day.workoutType}
                      </Text>
                    ) : null}

                    {day.isToday && (
                      <View style={styles.todayDot} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </ScrollView>
      )}

      {/* Week View (Vertical Card Stack) */}
      {timeframe === 'week' && (
        <View style={{ gap: 10, marginTop: 8 }}>
          {weekData.days.map((day) => {
            const dayName = day.dateObj.toLocaleDateString('en-US', { weekday: 'short' });
            const isFilteredOut = activeFilter !== 'All' && day.hours > 0 && day.workoutType !== activeFilter;
            const tileColor = getTileBgColor(day.hours, day.workoutType);
            const isToday = day.isToday;

            return (
              <Animated.View
                key={day.dateStr}
                style={isToday ? { transform: [{ scale: pulseAnim }] } : undefined}
              >
                <TouchableOpacity
                  disabled={day.isFuture}
                  onPress={() => onTileClick(day.dateStr, day.log)}
                  style={[
                    styles.weekCard,
                    {
                      backgroundColor: day.isFuture
                        ? 'rgba(24, 24, 27, 0.4)'
                        : day.hours > 0
                        ? 'rgba(0, 255, 136, 0.05)'
                        : Colors.dark.background,
                      borderColor: isToday ? Colors.neonGreen : Colors.dark.border,
                      opacity: day.isFuture ? 0.35 : isFilteredOut ? 0.35 : 1,
                    },
                  ]}
                >
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <View>
                      <Text style={[styles.weekDayHeader, { color: isToday ? Colors.neonGreen : '#71717a' }]}>
                        {dayName} • {formatShortDate(day.dateStr)}{isToday ? ' — TODAY' : ''}
                      </Text>
                      <Text style={[styles.weekDayValue, { color: day.hours > 0 ? '#f4f4f5' : '#52525b' }]}>
                        {day.hours > 0
                          ? `${day.hours} Hours`
                          : day.workoutType && day.workoutType.toLowerCase() === 'rest'
                          ? 'Rest Day'
                          : day.workoutType && (day.workoutType.toLowerCase() === 'freeze' || day.workoutType.toLowerCase() === 'frozen')
                          ? 'Ice Pause'
                          : 'No workout logged'}
                      </Text>
                    </View>

                    {day.workoutType ? (
                      <View style={[styles.weekCategoryPill, { borderColor: tileColor, backgroundColor: `${tileColor}20` }]}>
                        <Text style={[styles.weekCategoryText, { color: tileColor }]}>
                          {day.workoutType}
                        </Text>
                      </View>
                    ) : (
                      <Text style={styles.noneCategoryText}>None</Text>
                    )}
                  </View>

                  {/* Progress bar fill */}
                  {day.hours > 0 && (
                    <View style={styles.weekProgressBar}>
                      <View
                        style={{
                          height: '100%',
                          backgroundColor: tileColor,
                          width: `${Math.min(100, (day.hours / 2.5) * 100)}%`,
                        }}
                      />
                    </View>
                  )}
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>
      )}

      {/* Heatmap Legend */}
      <View style={styles.legendContainer}>
        <Text style={styles.legendLabel}>Less</Text>
        <View style={[styles.legendTile, { backgroundColor: '#18181b', borderColor: '#27272a', borderWidth: 1 }]} />
        <View style={[styles.legendTile, { backgroundColor: '#14532d' }]} />
        <View style={[styles.legendTile, { backgroundColor: '#166534' }]} />
        <View style={[styles.legendTile, { backgroundColor: '#22c55e' }]} />
        <View style={[styles.legendTile, { backgroundColor: '#00ff88' }]} />
        <Text style={styles.legendLabel}>More</Text>

        <View style={styles.legendSeparator} />

        <View style={[styles.legendTile, { backgroundColor: Colors.slateRest }]} />
        <Text style={styles.legendLabel}>Rest</Text>

        <View style={[styles.legendTile, { backgroundColor: Colors.iceFrost }]} />
        <Text style={styles.legendLabel}>Frozen</Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    padding: 16,
    borderRadius: 24,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  headerLeft: {
    flex: 1,
    marginRight: 8,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  diamondAccent: {
    width: 6,
    height: 6,
    backgroundColor: Colors.neonGreen,
    transform: [{ rotate: '45deg' }],
  },
  headerTitleText: {
    color: Colors.neonGreen,
    fontWeight: '900',
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  headerSubtitleText: {
    color: Colors.dark.mutedForeground,
    fontSize: 9.5,
    fontWeight: '600',
  },
  timeframePillsRow: {
    flexDirection: 'row',
    backgroundColor: Colors.dark.background,
    padding: 3,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  timeframePill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,
  },
  timeframePillActive: {
    backgroundColor: Colors.neonGreen,
  },
  timeframePillText: {
    fontSize: 10,
    fontWeight: '800',
  },
  timeframePillTextActive: {
    color: '#060a0e',
  },
  timeframePillTextInactive: {
    color: Colors.dark.mutedForeground,
  },
  yearTile: {
    width: 12,
    height: 12,
    borderRadius: 3,
  },
  monthWeekdayHeader: {
    width: '12.8%',
    textAlign: 'center',
    color: '#71717a',
    fontSize: 10,
    fontWeight: '800',
  },
  monthPadCell: {
    width: '12.8%',
    aspectRatio: 1,
    margin: '0.6%',
    backgroundColor: 'rgba(39, 39, 42, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(39, 39, 42, 0.2)',
    borderRadius: 8,
  },
  monthCell: {
    width: '12.8%',
    aspectRatio: 1,
    margin: '0.6%',
    padding: 3,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'space-between',
    position: 'relative',
  },
  hourBadge: {
    paddingHorizontal: 3,
    paddingVertical: 1,
    borderRadius: 4,
  },
  hourBadgeText: {
    fontSize: 7,
    fontWeight: '900',
    color: '#060a0e',
  },
  monthWorkoutType: {
    fontSize: 7,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  todayDot: {
    position: 'absolute',
    bottom: 3,
    right: 3,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#ffffff',
  },
  weekCard: {
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  weekDayHeader: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  weekDayValue: {
    fontSize: 18,
    fontWeight: '900',
    marginTop: 2,
  },
  weekCategoryPill: {
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  weekCategoryText: {
    fontSize: 9,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  noneCategoryText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#52525b',
    textTransform: 'uppercase',
  },
  weekProgressBar: {
    height: 4,
    backgroundColor: '#27272a',
    borderRadius: 2,
    marginTop: 10,
    overflow: 'hidden',
  },
  legendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
    marginTop: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#1a2332',
  },
  legendTile: {
    width: 10,
    height: 10,
    borderRadius: 2.5,
  },
  legendLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#71717a',
    marginHorizontal: 2,
  },
  legendSeparator: {
    width: 1,
    height: 10,
    backgroundColor: '#27272a',
    marginHorizontal: 4,
  },
});

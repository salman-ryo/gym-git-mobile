import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Stats, User } from '@/lib/types';
import { Flame, Trophy, CheckCircle2, Clock, Snowflake, ShieldCheck } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/Colors';
import CycleProgressCard from './CycleProgressCard';

interface StatsOverviewProps {
  stats: Stats | null;
  user?: User | null;
  queuedWeeklyPlanId?: string | null;
}

export default function StatsOverview({ stats, user, queuedWeeklyPlanId }: StatsOverviewProps) {
  if (!stats) return null;
  const streak = stats.scientificStreak;
  const isFrozen = !!stats.isFrozen;

  return (
    <View style={styles.container}>
      {/* ── Section Title Divider ── */}
      <View style={styles.sectionHeader}>
        <View style={styles.dividerLine} />
        <View style={styles.headerBadge}>
          <View style={[styles.headerDot, { backgroundColor: Colors.neonGreen }]} />
          <Text style={styles.headerBadgeText}>GRIND STATS</Text>
          <View style={[styles.headerDot, { backgroundColor: Colors.neonCyan }]} />
        </View>
        <View style={styles.dividerLine} />
      </View>

      {/* ── Row 1: Current Streak & Longest Record ── */}
      <View style={styles.row}>
        {/* Current Streak Card */}
        <View style={styles.cardWrapper}>
          <LinearGradient
            colors={isFrozen ? Colors.cards.streakFrozen.gradient : Colors.cards.streak.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[
              styles.card,
              { borderColor: isFrozen ? Colors.cards.streakFrozen.border : Colors.cards.streak.border },
            ]}
          >
            {/* Top Accent Line */}
            <View
              style={[
                styles.cardTopAccent,
                { backgroundColor: isFrozen ? Colors.neonCyan : Colors.neonGreen },
              ]}
            />

            {/* Corner Diamonds */}
            <View
              style={[
                styles.cornerDiamondTopLeft,
                { backgroundColor: isFrozen ? Colors.neonCyan : Colors.neonGreen },
              ]}
            />
            <View
              style={[
                styles.cornerDiamondBottomRight,
                { backgroundColor: isFrozen ? Colors.neonCyan : Colors.neonGreen },
              ]}
            />

            <View style={styles.cardHeaderRow}>
              {isFrozen ? (
                <Snowflake size={15} color={Colors.neonCyan} />
              ) : (
                <Flame size={15} color={Colors.neonGreen} />
              )}
              <Text style={styles.cardTitle}>CURRENT STREAK</Text>
            </View>

            <View style={styles.valueRow}>
              <Text style={styles.mainValue}>{stats.currentStreak}</Text>
              <Text style={[styles.unitValue, { color: isFrozen ? Colors.neonCyan : Colors.neonGreen }]}>
                Days
              </Text>
            </View>

            <View style={styles.subtextRow}>
              {isFrozen ? (
                <>
                  <Snowflake size={11} color={Colors.neonCyan} />
                  <Text style={[styles.subtext, { color: Colors.neonCyan, fontWeight: '700' }]}>
                    Ice Pause Active
                  </Text>
                </>
              ) : (
                <>
                  <ShieldCheck size={11} color={Colors.neonGreen} />
                  <Text style={styles.subtext}>Rest days protected</Text>
                </>
              )}
            </View>
          </LinearGradient>
        </View>

        {/* Longest Record Card */}
        <View style={styles.cardWrapper}>
          <LinearGradient
            colors={Colors.cards.record.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.card, { borderColor: Colors.cards.record.border }]}
          >
            <View style={[styles.cardTopAccent, { backgroundColor: Colors.neonCyan }]} />
            <View style={[styles.cornerDiamondTopLeft, { backgroundColor: Colors.neonCyan }]} />
            <View style={[styles.cornerDiamondBottomRight, { backgroundColor: Colors.neonCyan }]} />

            <View style={styles.cardHeaderRow}>
              <Trophy size={15} color={Colors.neonCyan} />
              <Text style={styles.cardTitle}>LONGEST STREAK</Text>
            </View>

            <View style={styles.valueRow}>
              <Text style={styles.mainValue}>{stats.longestStreak}</Text>
              <Text style={[styles.unitValue, { color: Colors.neonCyan }]}>Days</Text>
            </View>

            <View style={styles.subtextRow}>
              <Trophy size={11} color={Colors.neonCyan} />
              <Text style={styles.subtext}>Best record sequence</Text>
            </View>
          </LinearGradient>
        </View>
      </View>

      {/* ── Row 2: Plan Adherence & Hours Invested ── */}
      <View style={styles.row}>
        {/* Compliance / Plan Adherence Card */}
        <View style={styles.cardWrapper}>
          <LinearGradient
            colors={Colors.cards.compliance.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.card, { borderColor: Colors.cards.compliance.border }]}
          >
            <View style={[styles.cardTopAccent, { backgroundColor: Colors.neonPurple }]} />
            <View style={[styles.cornerDiamondTopLeft, { backgroundColor: Colors.neonPurple }]} />
            <View style={[styles.cornerDiamondBottomRight, { backgroundColor: Colors.neonPurple }]} />

            <View style={styles.cardHeaderRow}>
              <CheckCircle2 size={15} color={Colors.neonPurple} />
              <Text style={styles.cardTitle}>PLAN ADHERENCE</Text>
            </View>

            <View style={styles.valueRow}>
              <Text style={styles.mainValue}>{streak?.complianceRate || 92}%</Text>
              <Text style={[styles.unitValue, { color: Colors.neonPurple }]}>Score</Text>
            </View>

            <View style={styles.subtextRow}>
              <CheckCircle2 size={11} color={Colors.neonPurple} />
              <Text style={styles.subtext}>
                Wk: {streak?.currentWeekDone || 0}/{streak?.currentWeekTarget || 4} ({streak?.currentWeekStatus || 'On Track'})
              </Text>
            </View>
          </LinearGradient>
        </View>

        {/* Hours Invested Card */}
        <View style={styles.cardWrapper}>
          <LinearGradient
            colors={Colors.cards.hours.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.card, { borderColor: Colors.cards.hours.border }]}
          >
            <View style={[styles.cardTopAccent, { backgroundColor: Colors.amber }]} />
            <View style={[styles.cornerDiamondTopLeft, { backgroundColor: Colors.amber }]} />
            <View style={[styles.cornerDiamondBottomRight, { backgroundColor: Colors.amber }]} />

            <View style={styles.cardHeaderRow}>
              <Clock size={15} color={Colors.amber} />
              <Text style={styles.cardTitle}>HOURS INVESTED</Text>
            </View>

            <View style={styles.valueRow}>
              <Text style={styles.mainValue}>{stats.totalHours}</Text>
              <Text style={[styles.unitValue, { color: Colors.amber }]}>hrs</Text>
            </View>

            <View style={styles.subtextRow}>
              <Clock size={11} color={Colors.amber} />
              <Text style={styles.subtext}>
                {stats.totalDays} sessions (~{stats.averageHoursPerSession}h avg)
              </Text>
            </View>
          </LinearGradient>
        </View>
      </View>

      {/* ── 7-Day Cycle Progress Card ── */}
      {stats.cycleInfo && <CycleProgressCard stats={stats} user={user} queuedWeeklyPlanId={queuedWeeklyPlanId} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#1a2332',
  },
  headerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 20,
    backgroundColor: 'rgba(9, 13, 19, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 136, 0.25)',
  },
  headerDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  headerBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#f4f4f5',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  cardWrapper: {
    flex: 1,
  },
  card: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    minHeight: 120,
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  cardTopAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    opacity: 0.8,
  },
  cornerDiamondTopLeft: {
    position: 'absolute',
    top: -3,
    left: -3,
    width: 6,
    height: 6,
    transform: [{ rotate: '45deg' }],
  },
  cornerDiamondBottomRight: {
    position: 'absolute',
    bottom: -3,
    right: -3,
    width: 6,
    height: 6,
    transform: [{ rotate: '45deg' }],
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  cardTitle: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#a1a1aa',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
    marginBottom: 6,
  },
  mainValue: {
    fontSize: 22,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: -0.5,
  },
  unitValue: {
    fontSize: 12,
    fontWeight: '800',
  },
  subtextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  subtext: {
    fontSize: 10,
    fontWeight: '600',
    color: '#71717a',
  },
});

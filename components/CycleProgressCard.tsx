import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Stats, User } from '@/lib/types';
import { Activity, Zap, AlertTriangle } from 'lucide-react-native';
import Svg, { Circle } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/Colors';

interface CycleProgressCardProps {
  stats: Stats;
  user?: User | null;
  queuedWeeklyPlanId?: string | null;
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  const monthIdx = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  return `${monthNames[monthIdx] || ''} ${day}`;
}

export default function CycleProgressCard({ stats, user, queuedWeeklyPlanId }: CycleProgressCardProps) {
  const cycle = stats.cycleInfo;
  if (!cycle) return null;

  const completed = cycle.workouts_completed_in_cycle;
  const target = cycle.workouts_target_in_cycle;
  const accuracy = Math.min(100, Math.max(0, stats.accuracyScore ?? 0));

  // Circular gauge calculations
  const size = 88;
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (accuracy / 100) * circumference;

  return (
    <View style={styles.container}>
      {/* ── Top Ambient Highlight ── */}
      <View style={styles.topGlowLine} />

      {/* ── Panel 1: Cycle Readout ── */}
      <View style={styles.cycleHeaderPanel}>
        <View style={styles.leftAccentBar} />
        <View style={styles.cycleHeaderContent}>
          <View style={styles.cycleInfoLeft}>
            <View style={styles.iconContainer}>
              <Activity size={16} color={Colors.neonCyan} />
            </View>
            <View>
              <Text style={styles.subLabel}>CYCLE RANGE</Text>
              <Text style={styles.cycleDates}>
                {formatDate(cycle.cycle_start_date)} — {formatDate(cycle.cycle_end_date)}
              </Text>
            </View>
          </View>

          <View style={styles.daysRemainingBadge}>
            <View style={styles.pulsingDot} />
            <Text style={styles.daysRemainingText}>
              {cycle.days_remaining_in_cycle} {cycle.days_remaining_in_cycle === 1 ? 'DAY' : 'DAYS'} LEFT
            </Text>
          </View>
        </View>
      </View>

      {/* ── Inner Row: Workouts & Rest Tokens + Accuracy Gauge ── */}
      <View style={styles.metricsRow}>
        {/* Left Side: Workout Progress + Rest Tokens */}
        <View style={styles.leftMetricsCol}>
          {/* Workout Progress Card */}
          <View style={styles.metricPanel}>
            <View style={styles.metricHeaderRow}>
              <Text style={styles.subLabel}>WORKOUT PROGRESS</Text>
              <Text style={styles.metricValueText}>
                <Text style={{ color: Colors.neonCyan, fontWeight: '900' }}>{completed}</Text> / {target}
              </Text>
            </View>

            {/* Segmented Progress Bar */}
            <View style={styles.segmentContainer}>
              {Array.from({ length: Math.max(1, target) }).map((_, idx) => {
                const isActive = idx < completed;
                return (
                  <View
                    key={idx}
                    style={[
                      styles.segmentBar,
                      isActive ? styles.segmentActive : styles.segmentInactive,
                    ]}
                  />
                );
              })}
            </View>
          </View>

          {/* Rest Tokens Card */}
          <View style={styles.metricPanel}>
            <View style={styles.metricHeaderRow}>
              <Text style={styles.subLabel}>REST TOKENS</Text>
              <Text style={styles.metricValueText}>
                <Text style={{ color: Colors.neonCyan, fontWeight: '900' }}>{cycle.rest_tokens_remaining}</Text> Available
              </Text>
            </View>

            {/* Hardware Battery Pods */}
            <View style={styles.podsContainer}>
              {Array.from({ length: Math.max(1, cycle.rest_tokens_total) }).map((_, idx) => {
                const isActive = idx < cycle.rest_tokens_remaining;
                return (
                  <View
                    key={idx}
                    style={[
                      styles.tokenPod,
                      isActive ? styles.tokenPodActive : styles.tokenPodInactive,
                    ]}
                  >
                    <Zap
                      size={12}
                      color={isActive ? Colors.neonCyan : '#52525b'}
                    />
                  </View>
                );
              })}
            </View>
          </View>
        </View>

        {/* Right Side: Split Accuracy Circular Gauge */}
        <View style={styles.accuracyCard}>
          <Text style={[styles.subLabel, { marginBottom: 6, textAlign: 'center' }]}>DIAGNOSTICS</Text>

          <View style={styles.gaugeContainer}>
            <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
              {/* Background Track */}
              <Circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke="#18181b"
                strokeWidth={strokeWidth}
                fill="none"
              />
              {/* Active Neon Cyan Stroke */}
              <Circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke={Colors.neonCyan}
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="none"
              />
            </Svg>

            {/* Center Accuracy Score */}
            <View style={styles.gaugeCenter}>
              <Text style={styles.gaugePercent}>
                {accuracy}
                <Text style={{ fontSize: 10, color: Colors.neonCyan }}>%</Text>
              </Text>
              <Text style={styles.gaugeLabel}>Accuracy</Text>
            </View>
          </View>
        </View>
      </View>

      {/* ── Queued Plan Banner ── */}
      {queuedWeeklyPlanId && (
        <View style={styles.queuedPlanBanner}>
          <View style={styles.queuedIconContainer}>
            <AlertTriangle size={14} color={Colors.neonPurple} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.queuedTitle}>PLAN UPDATE QUEUED</Text>
            <Text style={styles.queuedText}>
              Your new plan [<Text style={{ color: '#fff', fontWeight: '800' }}>{queuedWeeklyPlanId}</Text>] will start next cycle.
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#090d13',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1a2332',
    padding: 14,
    gap: 10,
    marginTop: 4,
    marginBottom: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  topGlowLine: {
    position: 'absolute',
    top: 0,
    left: '25%',
    right: '25%',
    height: 2,
    backgroundColor: Colors.neonCyan,
    opacity: 0.3,
  },
  cycleHeaderPanel: {
    backgroundColor: 'rgba(6, 10, 14, 0.8)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1a2332',
    padding: 12,
    position: 'relative',
    overflow: 'hidden',
  },
  leftAccentBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: 3,
    backgroundColor: Colors.neonCyan,
  },
  cycleHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 4,
    flexWrap: 'wrap',
    gap: 8,
  },
  cycleInfoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#060a0e',
    borderWidth: 1,
    borderColor: '#1a2332',
    alignItems: 'center',
    justifyContent: 'center',
  },
  subLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#71717a',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  cycleDates: {
    fontSize: 13,
    fontWeight: '800',
    color: '#f4f4f5',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  daysRemainingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(34, 211, 238, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(34, 211, 238, 0.25)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  pulsingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.neonCyan,
  },
  daysRemainingText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.neonCyan,
    letterSpacing: 0.5,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  leftMetricsCol: {
    flex: 1.6,
    gap: 10,
  },
  metricPanel: {
    backgroundColor: 'rgba(6, 10, 14, 0.8)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1a2332',
    padding: 10,
  },
  metricHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  metricValueText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#a1a1aa',
  },
  segmentContainer: {
    flexDirection: 'row',
    gap: 4,
    height: 16,
  },
  segmentBar: {
    flex: 1,
    height: '100%',
    borderRadius: 4,
  },
  segmentActive: {
    backgroundColor: Colors.neonCyan,
  },
  segmentInactive: {
    backgroundColor: 'rgba(39, 39, 42, 0.4)',
  },
  podsContainer: {
    flexDirection: 'row',
    gap: 6,
    height: 22,
  },
  tokenPod: {
    flex: 1,
    height: '100%',
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tokenPodActive: {
    borderColor: Colors.neonCyan,
    backgroundColor: 'rgba(34, 211, 238, 0.1)',
  },
  tokenPodInactive: {
    borderColor: '#27272a',
    backgroundColor: 'rgba(24, 24, 27, 0.4)',
  },
  accuracyCard: {
    flex: 1,
    backgroundColor: 'rgba(6, 10, 14, 0.8)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1a2332',
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gaugeContainer: {
    width: 88,
    height: 88,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  gaugeCenter: {
    position: 'absolute',
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#060a0e',
    borderWidth: 1,
    borderColor: '#1a2332',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gaugePercent: {
    fontSize: 15,
    fontWeight: '900',
    color: '#ffffff',
    lineHeight: 17,
  },
  gaugeLabel: {
    fontSize: 7,
    fontWeight: '800',
    color: '#71717a',
    textTransform: 'uppercase',
  },
  queuedPlanBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(168, 85, 247, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.25)',
    borderRadius: 12,
    padding: 10,
  },
  queuedIconContainer: {
    width: 26,
    height: 26,
    borderRadius: 6,
    backgroundColor: 'rgba(168, 85, 247, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  queuedTitle: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.neonPurple,
    letterSpacing: 0.5,
  },
  queuedText: {
    fontSize: 11,
    color: '#d4d4d8',
    marginTop: 1,
  },
});

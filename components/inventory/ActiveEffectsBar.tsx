import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ActiveItemEffect } from '@/lib/types';
import { Snowflake, Zap, Target, Sparkles } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';

interface ActiveEffectsBarProps {
  activeEffects: ActiveItemEffect[];
}

function formatEffectTime(totalSeconds: number): string {
  if (totalSeconds <= 0) return 'Expiring';
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

export default function ActiveEffectsBar({ activeEffects }: ActiveEffectsBarProps) {
  const [effects, setEffects] = useState<ActiveItemEffect[]>(activeEffects);

  useEffect(() => {
    setEffects(activeEffects);
  }, [activeEffects]);

  useEffect(() => {
    if (!effects.length) return;

    const interval = setInterval(() => {
      setEffects((prev) =>
        prev
          .map((e) => ({
            ...e,
            remaining_seconds: Math.max(0, e.remaining_seconds - 1),
          }))
          .filter((e) => e.remaining_seconds > 0)
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [effects.length]);

  if (!effects || effects.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Sparkles size={12} color={Colors.neonCyan} />
        <Text style={styles.headerLabel}>ACTIVE BUFFS & EFFECTS</Text>
      </View>

      <View style={styles.badgesRow}>
        {effects.map((eff, idx) => {
          let icon = <Sparkles size={12} color={Colors.neonCyan} />;
          let label = eff.item_id;
          let badgeBorder = Colors.neonCyan;
          let badgeBg = 'rgba(34, 211, 238, 0.1)';

          if (eff.item_id === 'STREAK_FREEZE_TOKEN') {
            icon = <Snowflake size={12} color={Colors.iceFrost} />;
            label = 'Ice Pause';
            badgeBorder = Colors.iceFrost;
            badgeBg = 'rgba(56, 189, 248, 0.12)';
          } else if (eff.item_id === 'XP_BOOST') {
            icon = <Zap size={12} color={Colors.neonPurple} />;
            label = 'XP Boost';
            badgeBorder = Colors.neonPurple;
            badgeBg = 'rgba(168, 85, 247, 0.12)';
          } else if (eff.item_id === 'ACCURACY_CHARM') {
            icon = <Target size={12} color={Colors.amber} />;
            label = 'Accuracy Charm';
            badgeBorder = Colors.amber;
            badgeBg = 'rgba(251, 191, 36, 0.12)';
          }

          return (
            <View
              key={idx}
              style={[
                styles.buffBadge,
                { borderColor: badgeBorder, backgroundColor: badgeBg },
              ]}
            >
              <View style={styles.iconWrapper}>{icon}</View>
              <Text style={[styles.buffName, { color: badgeBorder }]}>{label}</Text>
              <Text style={styles.buffTime}>{formatEffectTime(eff.remaining_seconds)}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#090d13',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1a2332',
    padding: 10,
    marginBottom: 12,
    gap: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerLabel: {
    fontSize: 9,
    fontWeight: '900',
    color: '#71717a',
    letterSpacing: 0.8,
  },
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  buffBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  buffName: {
    fontSize: 10,
    fontWeight: '800',
  },
  buffTime: {
    fontSize: 10,
    fontWeight: '700',
    fontFamily: 'monospace',
    color: '#f4f4f5',
  },
});

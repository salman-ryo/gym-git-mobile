import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Colors } from '@/constants/Colors';

const usePulsingAnimation = () => {
  const pulseAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.7,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.3,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [pulseAnim]);

  return pulseAnim;
};

export const StatsOverviewSkeleton = () => {
  const pulseAnim = usePulsingAnimation();

  return (
    <View style={styles.grid}>
      {[...Array(4)].map((_, i) => (
        <Animated.View
          key={`stat-skeleton-${i}`}
          style={[styles.statCard, { opacity: pulseAnim }]}
        />
      ))}
    </View>
  );
};

export const ContributionGraphSkeleton = () => {
  const pulseAnim = usePulsingAnimation();

  return (
    <Animated.View style={[styles.graphContainer, { opacity: pulseAnim }]}>
      <View style={styles.graphHeader} />
      <View style={styles.graphBody} />
    </Animated.View>
  );
};

export const PowerLevelChartSkeleton = () => {
  const pulseAnim = usePulsingAnimation();

  return (
    <Animated.View style={[styles.chartContainer, { opacity: pulseAnim }]} />
  );
};

export const RewardRoadmapSkeleton = () => {
  const pulseAnim = usePulsingAnimation();

  return (
    <Animated.View style={[styles.roadmapContainer, { opacity: pulseAnim }]}>
      <View style={styles.roadmapHeader} />
      <View style={styles.roadmapLine} />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    width: '48%',
    height: 100,
    backgroundColor: Colors.dark.cardBorder,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  graphContainer: {
    height: 200,
    backgroundColor: Colors.dark.cardBorder,
    borderRadius: 8,
    marginBottom: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  graphHeader: {
    height: 20,
    width: '40%',
    backgroundColor: Colors.dark.border,
    borderRadius: 4,
    marginBottom: 16,
  },
  graphBody: {
    flex: 1,
    backgroundColor: Colors.dark.border,
    borderRadius: 4,
  },
  chartContainer: {
    height: 250,
    backgroundColor: Colors.dark.cardBorder,
    borderRadius: 8,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  roadmapContainer: {
    height: 180,
    backgroundColor: Colors.dark.cardBorder,
    borderRadius: 8,
    marginBottom: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  roadmapHeader: {
    height: 24,
    width: '50%',
    backgroundColor: Colors.dark.border,
    borderRadius: 4,
    marginBottom: 24,
  },
  roadmapLine: {
    flex: 1,
    backgroundColor: Colors.dark.border,
    borderRadius: 4,
  },
});


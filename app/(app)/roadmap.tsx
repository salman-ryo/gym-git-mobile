import RewardRoadmap from "@/components/rewards/RewardRoadmap";
import { RewardRoadmapSkeleton } from "@/components/skeletons/DashboardSkeletons";
import CyberpunkSectionError from "@/components/ui/CyberpunkSectionError";
import { Colors } from "@/constants/Colors";
import { useDashboard } from "@/contexts/DashboardContext";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { Sparkles, Target, Trophy } from "lucide-react-native";
import { useState } from "react";
import {
    Platform,
    RefreshControl,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    View,
} from "react-native";

const STATUS_BAR_HEIGHT =
  Platform.OS === "android" ? (StatusBar.currentHeight ?? 24) : 0;

export default function RoadmapScreen() {
  const state = useDashboard();
  const [refreshing, setRefreshing] = useState(false);

  const activePlan = state.dashboardState?.plan;
  const longestStreak = state.stats?.longestStreak ?? 0;
  const currentStreak = state.stats?.currentStreak ?? 0;

  const onRefresh = async () => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await state.fetchRoadmapOnly();
    setRefreshing(false);
  };

  const handleClaimRewardSuccess = async (details: {
    itemName: string;
    itemId: string;
    quantity: number;
    rarity: string;
    description?: string;
  }) => {
    state.setCelebrationDetails(details);
    await state.refreshData();
  };

  // Find next unclaimed milestone
  const nextMilestone = state.roadmapMilestones
    .filter((m) => m.status !== "CLAIMED")
    .sort((a, b) => a.streak_target - b.streak_target)[0];

  const daysRemaining = nextMilestone
    ? Math.max(0, nextMilestone.streak_target - longestStreak)
    : 0;

  return (
    <LinearGradient
      colors={[Colors.dark.background, "#0c0f17", Colors.dark.background]}
      style={styles.screen}
    >
      {/* ── Screen Header ───────────────────────── */}
      <View style={styles.header}>
        <LinearGradient
          colors={[Colors.dark.background, "#0c0f17"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.headerContent}>
          <View>
            <View style={styles.badgeRow}>
              <Trophy size={14} color={Colors.amber} />
              <Text style={styles.headerBadge}>STREAK REWARDS</Text>
            </View>
            <Text style={styles.headerTitle}>Roadmap</Text>
          </View>

          <View style={styles.recordPill}>
            <Text style={styles.recordLabel}>Best Streak</Text>
            <Text style={styles.recordValue}>{longestStreak}d</Text>
          </View>
        </View>
      </View>

      {/* ── Scrollable Track ────────────────────── */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.brandPrimary}
          />
        }
      >
        {/* Next Goal Tracker Card */}
        {nextMilestone && (
          <LinearGradient
            colors={["rgba(245,158,11,0.12)", "rgba(245,158,11,0.03)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.goalCard}
          >
            <View style={styles.goalHeader}>
              <View style={styles.goalTitleRow}>
                <Target size={16} color={Colors.amber} />
                <Text style={styles.goalSubtitle}>UPCOMING MILESTONE</Text>
              </View>
              <View style={styles.daysBadge}>
                <Sparkles size={12} color={Colors.amber} />
                <Text style={styles.daysBadgeText}>
                  {daysRemaining === 0
                    ? "READY TO CLAIM!"
                    : `${daysRemaining} days away`}
                </Text>
              </View>
            </View>

            <Text style={styles.goalName}>
              Day {nextMilestone.streak_target}:{" "}
              {nextMilestone.title || nextMilestone.item_name || "Mystery Loot"}
            </Text>
            <Text style={styles.goalDescription}>
              Current run: {currentStreak} days (All-time best: {longestStreak}{" "}
              days). Stay consistent with your {activePlan?.name || "workout"}{" "}
              plan to claim.
            </Text>
          </LinearGradient>
        )}

        {/* Milestone Path */}
        {state.roadmapQuery.isLoading ? (
          <RewardRoadmapSkeleton />
        ) : state.roadmapQuery.error ? (
          <CyberpunkSectionError
            title="Reward Roadmap Offline"
            message={state.roadmapQuery.error}
            onRetry={state.roadmapQuery.refetch}
          />
        ) : state.roadmapQuery.data.length > 0 ? (
          <RewardRoadmap
            milestones={state.roadmapQuery.data}
            longestStreak={longestStreak}
            planId={activePlan?.id}
            onClaimSuccess={handleClaimRewardSuccess}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No roadmap milestones found.</Text>
          </View>
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  header: {
    paddingTop: STATUS_BAR_HEIGHT + 8,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(39,39,42,0.6)",
    position: "relative",
    overflow: "hidden",
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 2,
  },
  headerBadge: {
    color: Colors.amber,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.2,
  },
  headerTitle: {
    color: Colors.dark.foreground,
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: -0.5,
  },
  recordPill: {
    backgroundColor: "rgba(245,158,11,0.12)",
    borderWidth: 1,
    borderColor: "rgba(245,158,11,0.3)",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignItems: "flex-end",
  },
  recordLabel: {
    color: "#a1a1aa",
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  recordValue: {
    color: Colors.amber,
    fontSize: 16,
    fontWeight: "900",
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  goalCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(245,158,11,0.25)",
    marginBottom: 16,
  },
  goalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  goalTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  goalSubtitle: {
    color: Colors.amber,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.8,
  },
  daysBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(245,158,11,0.15)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  daysBadgeText: {
    color: Colors.amber,
    fontSize: 11,
    fontWeight: "800",
  },
  goalName: {
    color: Colors.dark.foreground,
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 4,
  },
  goalDescription: {
    color: "#a1a1aa",
    fontSize: 12,
    lineHeight: 17,
  },
  emptyContainer: {
    padding: 32,
    alignItems: "center",
  },
  emptyText: {
    color: "#71717a",
    fontSize: 14,
  },
});

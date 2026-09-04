import ContributionGraph from "@/components/ContributionGraph";
import DashboardHeader from "@/components/DashboardHeader";
import FilterBar from "@/components/FilterBar";
import FrozenStateBanner from "@/components/FrozenStateBanner";
import PowerLevelChart from "@/components/PowerLevelChart";
import StatsOverview from "@/components/StatsOverview";
import StreakRiskWarningBanner from "@/components/StreakRiskWarningBanner";
import ActiveEffectsBar from "@/components/inventory/ActiveEffectsBar";
import EditLogModal from "@/components/modals/EditLogModal";
import { useState } from "react";
import { RefreshControl, ScrollView, StyleSheet } from "react-native";

import {
    ContributionGraphSkeleton,
    PowerLevelChartSkeleton,
    StatsOverviewSkeleton,
} from "@/components/skeletons/DashboardSkeletons";
import CyberpunkSectionError from "@/components/ui/CyberpunkSectionError";
import { useDashboard } from "@/contexts/DashboardContext";

import { Colors } from "@/constants/Colors";
import { deleteGymLog, saveGymLog } from "@/lib/gym-service";
import { restoreStreak } from "@/lib/streak-service";
import { WorkoutType } from "@/lib/types";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";

export default function DashboardScreen() {
  const state = useDashboard();
  const [refreshing, setRefreshing] = useState(false);

  const activePlan = state.dashboardState?.plan;
  const availableTypes = Array.from(
    new Set(state.logs.map((l) => l.workoutType)),
  );

  const onRefresh = async () => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await state.refreshData();
    setRefreshing(false);
  };

  const handleSaveEditLog = async (
    dateStr: string,
    hours: number,
    workoutType: WorkoutType,
    notes?: string,
  ) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await saveGymLog(dateStr, hours, workoutType, notes);
    state.setEditTileDate(null);
    state.setEditTileLog(undefined);
    await Promise.all([state.fetchLogsOnly(), state.fetchStatsOnly()]);
  };

  const handleRestoreWithShield = async (
    dateStr: string,
    hours: number,
    workoutType: WorkoutType,
    notes?: string,
  ) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await restoreStreak(dateStr, workoutType, hours);
    await saveGymLog(dateStr, hours, workoutType, notes);
    state.setEditTileDate(null);
    state.setEditTileLog(undefined);
    await Promise.all([
      state.fetchLogsOnly(),
      state.fetchStatsOnly(),
      state.fetchInventoryOnly(),
    ]);
  };

  const handleDeleteEditLog = async (dateStr: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    await deleteGymLog(dateStr);
    state.setEditTileDate(null);
    state.setEditTileLog(undefined);
    await Promise.all([state.fetchLogsOnly(), state.fetchStatsOnly()]);
  };

  return (
    <LinearGradient
      colors={[Colors.dark.background, "#0c0f17", Colors.dark.background]}
      style={styles.screen}
    >
      {/* ── Native Mobile Top Header ─────────────── */}
      <DashboardHeader
        stats={state.stats}
        onOpenCheckIn={() => state.setShowDailyCheckIn(true)}
      />

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
        {/* Streak Risk Warning Banner */}
        {state.stats?.streakWarningEvent && (
          <StreakRiskWarningBanner
            event={state.stats.streakWarningEvent}
            currentStreak={state.stats.currentStreak}
            onLogWorkoutClick={() => state.setShowDailyCheckIn(true)}
          />
        )}

        {/* Active Buffs / Effects HUD */}
        <ActiveEffectsBar activeEffects={state.activeEffects} />

        {/* Frozen State Banner */}
        {state.stats?.isFrozen && (
          <FrozenStateBanner
            isFrozen={state.stats.isFrozen}
            activeEffects={state.activeEffects}
            onUnfreezeSuccess={async () => {
              await state.refreshData();
            }}
          />
        )}

        {/* Section 1: Grind Stats & Analytics Overview */}
        {state.statsQuery.isLoading ? (
          <StatsOverviewSkeleton />
        ) : state.statsQuery.error ? (
          <CyberpunkSectionError
            title="Grind Stats Link Severed"
            message={state.statsQuery.error}
            onRetry={state.statsQuery.refetch}
          />
        ) : state.statsQuery.data ? (
          <StatsOverview
            stats={state.statsQuery.data}
            user={state.user}
            queuedWeeklyPlanId={state.dashboardState?.queuedWeeklyPlanId}
          />
        ) : null}

        {/* Section 2: Filter Bar */}
        <FilterBar
          activeFilter={state.activeFilter}
          onFilterChange={state.setActiveFilter}
          weeklyPlan={activePlan}
          availableTypes={availableTypes}
        />

        {/* Section 3: Contribution Graph (Heatmap) */}
        {state.logsQuery.isLoading ? (
          <ContributionGraphSkeleton />
        ) : state.logsQuery.error ? (
          <CyberpunkSectionError
            title="Consistency Matrix Offline"
            message={state.logsQuery.error}
            onRetry={state.logsQuery.refetch}
          />
        ) : (
          <ContributionGraph
            logs={state.logsQuery.data}
            activeFilter={state.activeFilter}
            weeklyPlan={activePlan}
            onTileClick={(date, log) => {
              state.setEditTileDate(date);
              state.setEditTileLog(log);
            }}
          />
        )}

        {/* Section 4: Power Level & Anime Tier Telemetry */}
        {state.statsQuery.isLoading || state.logsQuery.isLoading ? (
          <PowerLevelChartSkeleton />
        ) : state.statsQuery.error || state.logsQuery.error ? (
          <CyberpunkSectionError
            title="Power Level Telemetry Offline"
            message={state.statsQuery.error || state.logsQuery.error!}
            onRetry={() => {
              if (state.statsQuery.error) state.statsQuery.refetch();
              if (state.logsQuery.error) state.logsQuery.refetch();
            }}
          />
        ) : state.stats?.monthlyData ? (
          <PowerLevelChart
            monthlyData={state.stats.monthlyData}
            logs={state.logsQuery.data}
          />
        ) : null}
      </ScrollView>

      {/* Tile Edit Modal */}
      {state.editTileDate && (
        <EditLogModal
          dateStr={state.editTileDate}
          existingLog={state.editTileLog}
          isOpen={!!state.editTileDate}
          onSave={handleSaveEditLog}
          onDelete={handleDeleteEditLog}
          onClose={() => {
            state.setEditTileDate(null);
            state.setEditTileLog(undefined);
          }}
          availableWorkoutTypes={activePlan?.categories}
          restoreShieldCount={state.restoreShieldCount}
          onRestoreWithShield={handleRestoreWithShield}
        />
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
});

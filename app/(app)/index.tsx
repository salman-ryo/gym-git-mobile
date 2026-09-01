import React, { useState, useCallback } from 'react';
import { View, ScrollView, RefreshControl } from 'react-native';
import AppHeader from '@/components/AppHeader';
import FilterBar from '@/components/FilterBar';
import ContributionGraph from '@/components/ContributionGraph';
import PowerLevelChart from '@/components/PowerLevelChart';
import DailyCheckInModal from '@/components/modals/DailyCheckInModal';
import EditLogModal from '@/components/modals/EditLogModal';
import WeeklyPlanModal from '@/components/modals/WeeklyPlanModal';
import FreezeModal from '@/components/modals/FreezeModal';
import FrozenStateBanner from '@/components/FrozenStateBanner';
import StreakBrokenModal from '@/components/modals/StreakBrokenModal';
import StreakRiskWarningBanner from '@/components/StreakRiskWarningBanner';
import InventoryDrawer from '@/components/inventory/InventoryDrawer';
import ActiveEffectsBar from '@/components/inventory/ActiveEffectsBar';
import RewardRoadmap from '@/components/rewards/RewardRoadmap';
import ClaimCelebrationModal from '@/components/modals/ClaimCelebrationModal';
import PowerLevelCelebrationModal from '@/components/modals/PowerLevelCelebrationModal';
import StatsOverview from '@/components/StatsOverview';

import { useDashboardState } from '@/hooks/useDashboardState';
import {
  StatsOverviewSkeleton,
  ContributionGraphSkeleton,
  PowerLevelChartSkeleton,
  RewardRoadmapSkeleton,
} from '@/components/skeletons/DashboardSkeletons';
import CyberpunkSectionError from '@/components/ui/CyberpunkSectionError';

import { saveGymLog, deleteGymLog } from '@/lib/gym-service';
import { restoreStreak } from '@/lib/streak-service';
import { WorkoutType } from '@/lib/types';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/Colors';

export default function DashboardScreen() {
  const state = useDashboardState();
  const [refreshing, setRefreshing] = useState(false);

  const activePlan = state.dashboardState?.plan;
  const availableTypes = Array.from(new Set(state.logs.map((l) => l.workoutType)));

  const onRefresh = async () => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await state.refreshData();
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

  const handleSaveEditLog = async (dateStr: string, hours: number, workoutType: WorkoutType, notes?: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await saveGymLog(dateStr, hours, workoutType, notes);
    state.setEditTileDate(null);
    state.setEditTileLog(undefined);
    await Promise.all([state.fetchLogsOnly(), state.fetchStatsOnly()]);
  };

  const handleRestoreWithShield = async (dateStr: string, hours: number, workoutType: WorkoutType, notes?: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await restoreStreak(dateStr, workoutType, hours);
    await saveGymLog(dateStr, hours, workoutType, notes);
    state.setEditTileDate(null);
    state.setEditTileLog(undefined);
    await Promise.all([state.fetchLogsOnly(), state.fetchStatsOnly(), state.fetchInventoryOnly()]);
  };

  const handleDeleteEditLog = async (dateStr: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    await deleteGymLog(dateStr);
    state.setEditTileDate(null);
    state.setEditTileLog(undefined);
    await Promise.all([state.fetchLogsOnly(), state.fetchStatsOnly()]);
  };

  const showBrokenModal =
    !state.hasSeenBrokenModal &&
    !!state.stats?.streakBrokenEvent &&
    state.stats.streakBrokenEvent.previous_streak > 0;

  return (
    <LinearGradient colors={[Colors.dark.background, '#0c0f17', Colors.dark.background]} style={{ flex: 1 }}>
      <AppHeader
        stats={state.stats}
        weeklyPlan={activePlan}
        onPlanSaved={state.refreshData}
        onOpenInventory={() => state.setIsInventoryOpen(true)}
        inventoryCount={state.inventoryCount}
      />

      <ScrollView
        contentContainerStyle={{ padding: 16 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.brandPrimary} />}
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
          <StatsOverview stats={state.statsQuery.data} user={state.user} queuedWeeklyPlanId={state.dashboardState?.queuedWeeklyPlanId} />
        ) : null}

        {/* Dynamic Streak Reward Roadmap */}
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
            longestStreak={state.stats?.longestStreak || 0}
            planId={activePlan?.id}
            onClaimSuccess={handleClaimRewardSuccess}
          />
        ) : null}

        <FilterBar
          activeFilter={state.activeFilter}
          onFilterChange={state.setActiveFilter}
          weeklyPlan={activePlan}
          availableTypes={availableTypes}
        />

        {/* Section 3: Contribution Graph */}
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
            onTileClick={(date, log) => {
              state.setEditTileDate(date);
              state.setEditTileLog(log);
            }}
          />
        )}

        {/* Section 4: Power Level Chart */}
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
          <PowerLevelChart monthlyData={state.stats.monthlyData} logs={state.logsQuery.data} />
        ) : null}
      </ScrollView>

      <DailyCheckInModal
        dateStr={state.todayDateStr}
        isOpen={state.showDailyCheckIn}
        onCheckInYes={state.handleDailyCheckInYes}
        onCheckInNo={state.handleDailyCheckInNo}
        onCheckInLater={state.handleDailyCheckInLater}
        availableWorkoutTypes={activePlan?.categories}
      />

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

      <WeeklyPlanModal
        isOpen={state.showPlanModal || state.needsPlanSelection}
        currentPlan={activePlan}
        onClose={() => state.setShowPlanModal(false)}
        onSavePlan={state.handleSavePlan}
        preventClose={state.needsPlanSelection}
      />

      <FreezeModal
        isOpen={state.isFreezeModalOpen}
        onClose={() => state.setIsFreezeModalOpen(false)}
        availableTokens={state.availableFreezeTokens}
        onSuccess={async () => {
          await state.refreshData();
        }}
      />

      <InventoryDrawer
        isOpen={state.isInventoryOpen}
        onClose={() => state.setIsInventoryOpen(false)}
        inventoryItems={state.inventoryItems}
        onUseItem={state.handleUseInventoryItem}
        onRequestFreeze={() => {
          state.setIsInventoryOpen(false);
          state.setIsFreezeModalOpen(true);
        }}
      />

      <ClaimCelebrationModal
        isOpen={!!state.celebrationDetails}
        onClose={() => state.setCelebrationDetails(null)}
        itemDetails={state.celebrationDetails}
      />

      <PowerLevelCelebrationModal
        isOpen={!!state.powerCelebrationData}
        onClose={() => state.setPowerCelebrationData(null)}
        powerScore={state.powerCelebrationData}
      />

      {/* Streak Broken Decay Recovery Modal */}
      {state.stats?.streakBrokenEvent && (
        <StreakBrokenModal
          isOpen={showBrokenModal}
          onClose={() => state.setHasSeenBrokenModal(true)}
          event={state.stats.streakBrokenEvent}
          onRestoreSuccess={async () => {
            await state.refreshData();
          }}
          onOpenRoadmap={() => {
            // Roadmap is directly visible in scroll view
          }}
        />
      )}
    </LinearGradient>
  );
}

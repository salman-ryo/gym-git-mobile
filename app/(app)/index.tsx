import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
import CyberpunkLoader from '@/components/CyberpunkLoader';
import StatsOverview from '@/components/StatsOverview';

import { useAuth } from '@/lib/auth-context';
import { fetchGymLogs, fetchDashboardStats, saveGymLog, deleteGymLog } from '@/lib/gym-service';
import { fetchUserInventory, consumeInventoryItem } from '@/lib/inventory-service';
import { fetchRewardRoadmap } from '@/lib/rewards-service';
import { restoreStreak } from '@/lib/streak-service';
import { formatDateKey } from '@/lib/scientific-streak';
import {
  GymLog,
  Stats,
  WorkoutType,
  UserInventoryItem,
  ActiveItemEffect,
  RoadmapMilestone,
  PowerScoreBreakdown,
} from '@/lib/types';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/Colors';

export default function DashboardScreen() {
  const { user, updateUserPlan } = useAuth();

  const [logs, setLogs] = useState<GymLog[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [inventoryItems, setInventoryItems] = useState<UserInventoryItem[]>([]);
  const [activeEffects, setActiveEffects] = useState<ActiveItemEffect[]>([]);
  const [milestones, setMilestones] = useState<RoadmapMilestone[]>([]);
  const [celebrationPowerScore, setCelebrationPowerScore] = useState<PowerScoreBreakdown | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [activeFilter, setActiveFilter] = useState<WorkoutType | 'All'>('All');
  const [showDailyCheckIn, setShowDailyCheckIn] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [isFreezeModalOpen, setIsFreezeModalOpen] = useState(false);
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);
  const [isBrokenModalDismissed, setIsBrokenModalDismissed] = useState(false);
  const [claimedCelebrationItem, setClaimedCelebrationItem] = useState<{
    itemName: string;
    itemId: string;
    quantity: number;
    rarity: string;
    description?: string;
  } | null>(null);
  const [editTileDate, setEditTileDate] = useState<string | null>(null);
  const [editTileLog, setEditTileLog] = useState<GymLog | undefined>(undefined);

  const todayStr = formatDateKey(new Date());
  const needsPlanSelection = !!(user && !user.weeklyPlan);

  const totalInventoryCount = useMemo(() => {
    return inventoryItems.reduce((acc, curr) => acc + curr.quantity, 0);
  }, [inventoryItems]);

  const availableFreezeTokens = useMemo(() => {
    const item = inventoryItems.find((i) => i.item_details.item_id === 'STREAK_FREEZE_TOKEN');
    return item ? item.quantity : 0;
  }, [inventoryItems]);

  const restoreShieldCount = useMemo(() => {
    const item = inventoryItems.find((i) => i.item_details.item_id === 'RESTORE_SHIELD');
    return item ? item.quantity : 0;
  }, [inventoryItems]);

  const refreshData = useCallback(async () => {
    try {
      const [fetchedLogs, fetchedStats] = await Promise.all([
        fetchGymLogs(),
        fetchDashboardStats(user?.weeklyPlan),
      ]);
      setLogs(fetchedLogs);
      setStats(fetchedStats);

      if (user) {
        try {
          const [invData, roadmapData] = await Promise.all([
            fetchUserInventory(),
            fetchRewardRoadmap(user.weeklyPlan?.id),
          ]);
          setInventoryItems(invData.inventory || []);
          setActiveEffects(invData.active_effects || []);
          setMilestones(roadmapData || []);
        } catch (subErr) {
          console.warn('Failed to load inventory/roadmap:', subErr);
        }
      }

      return fetchedLogs;
    } catch (err) {
      console.error('Data load error:', err);
      return [];
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.weeklyPlan, user]);

  useEffect(() => {
    async function init() {
      const currentLogs = await refreshData();
      if (needsPlanSelection) {
        setShowPlanModal(true);
      } else {
        const hasToday = currentLogs.some((l) => l.date === todayStr);
        const isSnoozed = user?.checkinSnooze?.is_snoozed;
        if (!hasToday && !stats?.isFrozen && !isSnoozed) {
          setShowDailyCheckIn(true);
        }
      }
    }
    if (user) init();
  }, [user, needsPlanSelection]);

  const onRefresh = () => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    refreshData();
  };

  const handleUseItem = async (itemId: string, payload?: Record<string, unknown>) => {
    try {
      const updatedInv = await consumeInventoryItem(itemId, 1, payload);
      setInventoryItems(updatedInv.inventory || []);
      setActiveEffects(updatedInv.active_effects || []);
      await refreshData();
    } catch (err: any) {
      console.error('Failed to consume item:', err);
    }
  };

  const handleClaimRewardSuccess = async (details: {
    itemName: string;
    itemId: string;
    quantity: number;
    rarity: string;
    description?: string;
  }) => {
    setClaimedCelebrationItem(details);
    await refreshData();
  };

  const handleDailyCheckInYes = async (hours: number, workoutType: WorkoutType, notes?: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await saveGymLog(todayStr, hours, workoutType, notes);
    setShowDailyCheckIn(false);
    await refreshData();
  };

  const handleDailyCheckInNo = async () => {
    await saveGymLog(todayStr, 0, 'Rest');
    setShowDailyCheckIn(false);
    await refreshData();
  };

  const handleSaveEditLog = async (dateStr: string, hours: number, workoutType: WorkoutType, notes?: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await saveGymLog(dateStr, hours, workoutType, notes);
    setEditTileDate(null);
    setEditTileLog(undefined);
    await refreshData();
  };

  const handleRestoreWithShield = async (dateStr: string, hours: number, workoutType: WorkoutType, notes?: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await restoreStreak(dateStr, workoutType, hours);
    await saveGymLog(dateStr, hours, workoutType, notes);
    setEditTileDate(null);
    setEditTileLog(undefined);
    await refreshData();
  };

  const handleDeleteEditLog = async (dateStr: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    await deleteGymLog(dateStr);
    setEditTileDate(null);
    setEditTileLog(undefined);
    await refreshData();
  };

  const showBrokenModal =
    !isBrokenModalDismissed &&
    !!stats?.streakBrokenEvent &&
    stats.streakBrokenEvent.previous_streak > 0;

  return (
    <LinearGradient colors={[Colors.dark.background, '#0c0f17', Colors.dark.background]} style={{ flex: 1 }}>
      <AppHeader
        stats={stats}
        onPlanSaved={refreshData}
        onOpenInventory={() => setIsInventoryOpen(true)}
        inventoryCount={totalInventoryCount}
      />

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <CyberpunkLoader text="Loading Dashboard..." />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{ padding: 16 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.brandPrimary} />}
        >
          {/* Streak Risk Warning Banner */}
          {stats?.streakWarningEvent && (
            <StreakRiskWarningBanner
              event={stats.streakWarningEvent}
              currentStreak={stats.currentStreak}
              onLogWorkoutClick={() => setShowDailyCheckIn(true)}
            />
          )}

          {/* Active Buffs / Effects HUD */}
          <ActiveEffectsBar activeEffects={activeEffects} />

          {/* Frozen State Banner */}
          {stats?.isFrozen && (
            <FrozenStateBanner
              isFrozen={stats.isFrozen}
              activeEffects={activeEffects}
              onUnfreezeSuccess={async () => {
                await refreshData();
              }}
            />
          )}

          <StatsOverview stats={stats} user={user} />

          {/* Dynamic Streak Reward Roadmap */}
          {milestones.length > 0 && (
            <RewardRoadmap
              milestones={milestones}
              longestStreak={stats?.longestStreak || 0}
              planId={user?.weeklyPlan?.id}
              onClaimSuccess={handleClaimRewardSuccess}
            />
          )}

          <FilterBar
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
            weeklyPlan={user?.weeklyPlan}
            availableTypes={Array.from(new Set(logs.map((l) => l.workoutType)))}
          />

          <ContributionGraph
            logs={logs}
            activeFilter={activeFilter}
            onTileClick={(date, log) => {
              setEditTileDate(date);
              setEditTileLog(log);
            }}
          />

          {stats?.monthlyData && <PowerLevelChart monthlyData={stats.monthlyData} logs={logs} />}
        </ScrollView>
      )}

      <DailyCheckInModal
        dateStr={todayStr}
        isOpen={showDailyCheckIn}
        onCheckInYes={handleDailyCheckInYes}
        onCheckInNo={handleDailyCheckInNo}
        onCheckInLater={() => setShowDailyCheckIn(false)}
        availableWorkoutTypes={user?.weeklyPlan?.categories}
      />

      {editTileDate && (
        <EditLogModal
          dateStr={editTileDate}
          existingLog={editTileLog}
          isOpen={!!editTileDate}
          onSave={handleSaveEditLog}
          onDelete={handleDeleteEditLog}
          onClose={() => {
            setEditTileDate(null);
            setEditTileLog(undefined);
          }}
          availableWorkoutTypes={user?.weeklyPlan?.categories}
          restoreShieldCount={restoreShieldCount}
          onRestoreWithShield={handleRestoreWithShield}
        />
      )}

      <WeeklyPlanModal
        isOpen={showPlanModal || needsPlanSelection}
        currentPlan={user?.weeklyPlan}
        onClose={() => setShowPlanModal(false)}
        onSavePlan={async (p) => {
          await updateUserPlan(p);
          setShowPlanModal(false);
          refreshData();
        }}
        preventClose={needsPlanSelection}
      />

      <FreezeModal
        isOpen={isFreezeModalOpen}
        onClose={() => setIsFreezeModalOpen(false)}
        availableTokens={availableFreezeTokens}
        onSuccess={async () => {
          await refreshData();
        }}
      />

      <InventoryDrawer
        isOpen={isInventoryOpen}
        onClose={() => setIsInventoryOpen(false)}
        inventoryItems={inventoryItems}
        onUseItem={handleUseItem}
        onRequestFreeze={() => {
          setIsInventoryOpen(false);
          setIsFreezeModalOpen(true);
        }}
      />

      <ClaimCelebrationModal
        isOpen={!!claimedCelebrationItem}
        onClose={() => setClaimedCelebrationItem(null)}
        itemDetails={claimedCelebrationItem}
      />

      <PowerLevelCelebrationModal
        isOpen={!!celebrationPowerScore}
        onClose={() => setCelebrationPowerScore(null)}
        powerScore={celebrationPowerScore}
      />

      {/* Streak Broken Decay Recovery Modal */}
      {stats?.streakBrokenEvent && (
        <StreakBrokenModal
          isOpen={showBrokenModal}
          onClose={() => setIsBrokenModalDismissed(true)}
          event={stats.streakBrokenEvent}
          onRestoreSuccess={async () => {
            await refreshData();
          }}
          onOpenRoadmap={() => {
            // Roadmap is directly visible in scroll view
          }}
        />
      )}
    </LinearGradient>
  );
}

import React, { useState, useEffect, useCallback } from 'react';
import { View, ScrollView, RefreshControl } from 'react-native';
import AppHeader from '@/components/AppHeader';
import FilterBar from '@/components/FilterBar';
import ContributionGraph from '@/components/ContributionGraph';
import PowerLevelChart from '@/components/PowerLevelChart';
import DailyCheckInModal from '@/components/modals/DailyCheckInModal';
import EditLogModal from '@/components/modals/EditLogModal';
import WeeklyPlanModal from '@/components/modals/WeeklyPlanModal';
import CyberpunkLoader from '@/components/CyberpunkLoader';

import { useAuth } from '@/lib/auth-context';
import { fetchGymLogs, fetchDashboardStats, saveGymLog, deleteGymLog } from '@/lib/gym-service';
import { formatDateKey } from '@/lib/scientific-streak';
import { GymLog, Stats, WorkoutType } from '@/lib/types';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/Colors';

export default function DashboardScreen() {
  const { user, updateUserPlan } = useAuth();

  const [logs, setLogs] = useState<GymLog[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [activeFilter, setActiveFilter] = useState<WorkoutType | 'All'>('All');
  const [showDailyCheckIn, setShowDailyCheckIn] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [editTileDate, setEditTileDate] = useState<string | null>(null);
  const [editTileLog, setEditTileLog] = useState<GymLog | undefined>(undefined);

  const todayStr = formatDateKey(new Date());
  const needsPlanSelection = !!(user && !user.weeklyPlan);

  const refreshData = useCallback(async () => {
    try {
      const fetchedLogs = await fetchGymLogs();
      const fetchedStats = await fetchDashboardStats(user?.weeklyPlan);
      setLogs(fetchedLogs);
      setStats(fetchedStats);
      return fetchedLogs;
    } catch (err) {
      console.error('Data load error:', err);
      return [];
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.weeklyPlan]);

  useEffect(() => {
    async function init() {
      const currentLogs = await refreshData();
      if (needsPlanSelection) {
        setShowPlanModal(true);
      } else {
        const hasToday = currentLogs.some((l) => l.date === todayStr);
        if (!hasToday) setShowDailyCheckIn(true);
      }
    }
    if (user) init();
  }, [user, needsPlanSelection]);

  const onRefresh = () => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    refreshData();
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

  const handleDeleteEditLog = async (dateStr: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    await deleteGymLog(dateStr);
    setEditTileDate(null);
    setEditTileLog(undefined);
    await refreshData();
  };

  return (
    <LinearGradient colors={[Colors.dark.background, '#0c0f17', Colors.dark.background]} style={{ flex: 1 }}>
      <AppHeader stats={stats} onPlanSaved={refreshData} />

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <CyberpunkLoader text="Loading Dashboard..." />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{ padding: 16 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.brandPrimary} />}
        >
          <FilterBar
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
            weeklyPlan={user?.weeklyPlan}
            onOpenPlanModal={() => setShowPlanModal(true)}
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
    </LinearGradient>
  );
}

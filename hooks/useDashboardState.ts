import { useAuth } from "@/lib/auth-context";
import {
    clearCheckInSnooze,
    SNOOZE_DURATION_MS,
    snoozeCheckIn,
} from "@/lib/checkin-snooze";
import {
    fetchDashboardStateAPI,
    fetchDashboardStats,
    fetchGymLogs,
    saveGymLog
} from "@/lib/gym-service";
import {
    consumeInventoryItem,
    fetchUserInventory,
} from "@/lib/inventory-service";
import { fetchRewardRoadmap } from "@/lib/rewards-service";
import { formatDateKey } from "@/lib/scientific-streak";
import {
    ActiveItemEffect,
    DashboardState,
    GymLog,
    PowerScoreBreakdown,
    RoadmapMilestone,
    Stats,
    UserInventoryItem,
    WeeklyPlan,
    WorkoutType,
} from "@/lib/types";
import * as Haptics from "expo-haptics";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export interface SectionQueryState<T> {
  data: T;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useDashboardState() {
  const { user, updateUserPlan } = useAuth();

  const [dashboardState, setDashboardState] = useState<DashboardState | null>(
    null,
  );
  const [isDashboardStateLoading, setIsDashboardStateLoading] =
    useState<boolean>(true);

  // 1. Stats Query State
  const [stats, setStats] = useState<Stats | null>(null);
  const [isStatsLoading, setIsStatsLoading] = useState<boolean>(true);
  const [statsError, setStatsError] = useState<string | null>(null);

  // 2. Logs Query State
  const [logs, setLogs] = useState<GymLog[]>([]);
  const [isLogsLoading, setIsLogsLoading] = useState<boolean>(true);
  const [logsError, setLogsError] = useState<string | null>(null);

  // 3. Rewards Roadmap Query State
  const [roadmapMilestones, setRoadmapMilestones] = useState<
    RoadmapMilestone[]
  >([]);
  const [isRoadmapLoading, setIsRoadmapLoading] = useState<boolean>(true);
  const [roadmapError, setRoadmapError] = useState<string | null>(null);

  // 4. Inventory Query State
  const [inventoryItems, setInventoryItems] = useState<UserInventoryItem[]>([]);
  const [activeEffects, setActiveEffects] = useState<ActiveItemEffect[]>([]);
  const [isInventoryLoading, setIsInventoryLoading] = useState<boolean>(true);
  const [inventoryError, setInventoryError] = useState<string | null>(null);

  const [activeFilter, setActiveFilter] = useState<WorkoutType | "All">("All");

  const [showDailyCheckIn, setShowDailyCheckIn] = useState<boolean>(false);
  const [showPlanModal, setShowPlanModal] = useState<boolean>(false);
  const [isFreezeModalOpen, setIsFreezeModalOpen] = useState<boolean>(false);
  const [isInventoryOpen, setIsInventoryOpen] = useState<boolean>(false);

  const [todayDateStr, setTodayDateStr] = useState<string>("");

  const [editTileDate, setEditTileDate] = useState<string | null>(null);
  const [editTileLog, setEditTileLog] = useState<GymLog | undefined>(undefined);

  const [celebrationDetails, setCelebrationDetails] = useState<{
    itemName: string;
    itemId: string;
    quantity: number;
    rarity: string;
    description?: string;
  } | null>(null);

  const [powerCelebrationData, setPowerCelebrationData] =
    useState<PowerScoreBreakdown | null>(null);
  const [hasSeenBrokenModal, setHasSeenBrokenModal] = useState<boolean>(false);

  const userPlanRef = useRef(dashboardState?.plan);
  useEffect(() => {
    userPlanRef.current = dashboardState?.plan;
  }, [dashboardState?.plan]);

  const snoozeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchDashboardStateOnly = useCallback(async () => {
    setIsDashboardStateLoading(true);
    try {
      const state = await fetchDashboardStateAPI();
      setDashboardState(state);
      return state;
    } finally {
      setIsDashboardStateLoading(false);
    }
  }, []);

  const fetchStatsOnly = useCallback(
    async (targetPlan?: WeeklyPlan, currentLogs?: GymLog[]) => {
      setIsStatsLoading(true);
      setStatsError(null);
      try {
        const plan = targetPlan ?? userPlanRef.current;
        const res = await fetchDashboardStats(plan, currentLogs);
        setStats(res);
        return res;
      } catch (err: unknown) {
        const msg =
          err instanceof Error ? err.message : "Failed to fetch stats.";
        setStatsError(msg);
        return null;
      } finally {
        setIsStatsLoading(false);
      }
    },
    [],
  );

  const fetchLogsOnly = useCallback(async () => {
    setIsLogsLoading(true);
    setLogsError(null);
    try {
      const res = await fetchGymLogs();
      const logsData = Array.isArray(res) ? res : [];
      setLogs(logsData);
      return logsData;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to fetch logs.";
      setLogsError(msg);
      return [];
    } finally {
      setIsLogsLoading(false);
    }
  }, []);

  const fetchRoadmapOnly = useCallback(async (targetPlanId?: string) => {
    setIsRoadmapLoading(true);
    setRoadmapError(null);
    try {
      const planId = targetPlanId ?? userPlanRef.current?.id;
      const roadmap = await fetchRewardRoadmap(planId);
      const items = Array.isArray(roadmap) ? roadmap : [];
      setRoadmapMilestones(items);
      return items;
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to fetch roadmap.";
      setRoadmapError(msg);
      return [];
    } finally {
      setIsRoadmapLoading(false);
    }
  }, []);

  const fetchInventoryOnly = useCallback(async () => {
    setIsInventoryLoading(true);
    setInventoryError(null);
    try {
      const res = await fetchUserInventory();
      setInventoryItems(res.inventory || []);
      setActiveEffects(res.active_effects || []);
      return res;
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to fetch inventory.";
      setInventoryError(msg);
      return { inventory: [], active_effects: [] };
    } finally {
      setIsInventoryLoading(false);
    }
  }, []);

  const refreshData = useCallback(async () => {
    const results = await Promise.allSettled([
      fetchDashboardStateOnly(),
      fetchLogsOnly(),
      fetchInventoryOnly(),
    ]);

    const stateResult = results[0];
    const logsResult = results[1];

    let plan: WeeklyPlan | undefined = undefined;
    if (stateResult.status === "fulfilled") {
      plan = stateResult.value?.plan;
      if (plan) {
        fetchRoadmapOnly(plan.id);
      }
    }

    let fetchedLogs: GymLog[] | undefined = undefined;
    if (logsResult.status === "fulfilled") {
      fetchedLogs = logsResult.value;
    }

    await fetchStatsOnly(plan, fetchedLogs);
  }, [
    fetchDashboardStateOnly,
    fetchLogsOnly,
    fetchInventoryOnly,
    fetchRoadmapOnly,
    fetchStatsOnly,
  ]);

  const scheduleSnoozeReminder = useCallback(
    (delayMs: number, dateKey: string) => {
      if (snoozeTimerRef.current) clearTimeout(snoozeTimerRef.current);
      snoozeTimerRef.current = setTimeout(async () => {
        const today = formatDateKey(new Date());
        if (today === dateKey) {
          const fetchedLogs = await fetchGymLogs();
          const hasLog = fetchedLogs.some((l) => l.date === today);
          const fetchedStats = await fetchDashboardStats(
            userPlanRef.current,
            fetchedLogs,
          );
          const isFrozen = fetchedStats?.isFrozen;

          if (!hasLog && !isFrozen) {
            setShowDailyCheckIn(true);
          }
          await clearCheckInSnooze();
        }
      }, delayMs);
    },
    [],
  );

  useEffect(() => {
    return () => {
      if (snoozeTimerRef.current) clearTimeout(snoozeTimerRef.current);
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function initDashboard() {
      const todayStr = formatDateKey(new Date());
      if (isMounted) setTodayDateStr(todayStr);
      if (!user) return;

      const statePromise = fetchDashboardStateOnly();
      const logsPromise = fetchLogsOnly();
      const inventoryPromise = fetchInventoryOnly();

      const state = await statePromise;
      if (!isMounted) return;

      if (!state?.plan) {
        setShowPlanModal(true);
        setShowDailyCheckIn(false);
      } else {
        fetchRoadmapOnly(state.plan.id);
      }

      const currentLogs = await logsPromise;
      if (!isMounted) return;

      const hasTodayLog = currentLogs.some((l) => l.date === todayStr);
      const snoozeStatus = state?.checkinSnooze;
      const isSnoozed = !!(
        snoozeStatus?.is_snoozed &&
        snoozeStatus.date === todayStr &&
        snoozeStatus.remaining_seconds > 0
      );

      if (!hasTodayLog && !isSnoozed && state?.plan) {
        setShowDailyCheckIn(true);
      } else if (isSnoozed) {
        const remainingMs = (snoozeStatus?.remaining_seconds ?? 0) * 1000;
        if (remainingMs > 0) {
          scheduleSnoozeReminder(remainingMs, todayStr);
        }
      }

      await fetchStatsOnly(state?.plan, currentLogs);
      await inventoryPromise;
    }

    initDashboard();

    return () => {
      isMounted = false;
    };
  }, [
    user,
    fetchDashboardStateOnly,
    fetchLogsOnly,
    fetchInventoryOnly,
    fetchRoadmapOnly,
    fetchStatsOnly,
    scheduleSnoozeReminder,
  ]);

  const handleDailyCheckInYes = useCallback(
    async (hours: number, workoutType: WorkoutType, notes?: string) => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await clearCheckInSnooze();
      if (snoozeTimerRef.current) clearTimeout(snoozeTimerRef.current);
      await saveGymLog(todayDateStr, hours, workoutType, notes);
      setShowDailyCheckIn(false);
      const [logsRes] = await Promise.all([fetchLogsOnly(), fetchStatsOnly()]);
    },
    [fetchLogsOnly, fetchStatsOnly, todayDateStr],
  );

  const handleDailyCheckInNo = useCallback(async () => {
    await clearCheckInSnooze();
    if (snoozeTimerRef.current) clearTimeout(snoozeTimerRef.current);
    await saveGymLog(todayDateStr, 0, "Rest");
    setShowDailyCheckIn(false);
    await Promise.all([fetchLogsOnly(), fetchStatsOnly()]);
  }, [fetchLogsOnly, fetchStatsOnly, todayDateStr]);

  const handleDailyCheckInLater = useCallback(async () => {
    setShowDailyCheckIn(false);
    try {
      await snoozeCheckIn(todayDateStr);
    } catch (err) {
      console.error("Failed to save checkin snooze to backend", err);
    }
    scheduleSnoozeReminder(SNOOZE_DURATION_MS, todayDateStr);
  }, [scheduleSnoozeReminder, todayDateStr]);

  const handleSavePlan = useCallback(
    async (plan: WeeklyPlan) => {
      await updateUserPlan(plan);
      setDashboardState((prev) => (prev ? { ...prev, plan } : { plan }));
      setShowPlanModal(false);
      await Promise.all([fetchStatsOnly(plan), fetchRoadmapOnly(plan.id)]);
    },
    [updateUserPlan, fetchStatsOnly, fetchRoadmapOnly],
  );

  const handleUseInventoryItem = useCallback(
    async (itemId: string, payload?: Record<string, unknown>) => {
      try {
        const updatedInv = await consumeInventoryItem(itemId, 1, payload);
        setInventoryItems(updatedInv.inventory || []);
        setActiveEffects(updatedInv.active_effects || []);
        await fetchStatsOnly();
      } catch (err: any) {
        console.error("Failed to consume item:", err);
      }
    },
    [fetchStatsOnly],
  );

  const availableFreezeTokens = useMemo(() => {
    const item = inventoryItems.find(
      (i) => i.item_details.item_id === "STREAK_FREEZE_TOKEN",
    );
    return item ? item.quantity : 0;
  }, [inventoryItems]);

  const restoreShieldCount = useMemo(() => {
    const item = inventoryItems.find(
      (i) => i.item_details.item_id === "RESTORE_SHIELD",
    );
    return item ? item.quantity : 0;
  }, [inventoryItems]);

  const inventoryCount = useMemo(() => {
    return inventoryItems.reduce((acc, curr) => acc + curr.quantity, 0);
  }, [inventoryItems]);

  const statsQuery: SectionQueryState<Stats | null> = useMemo(
    () => ({
      data: stats,
      isLoading: isStatsLoading,
      error: statsError,
      refetch: async () => {
        await fetchStatsOnly();
      },
    }),
    [stats, isStatsLoading, statsError, fetchStatsOnly],
  );

  const logsQuery: SectionQueryState<GymLog[]> = useMemo(
    () => ({
      data: logs,
      isLoading: isLogsLoading,
      error: logsError,
      refetch: async () => {
        await fetchLogsOnly();
      },
    }),
    [logs, isLogsLoading, logsError, fetchLogsOnly],
  );

  const roadmapQuery: SectionQueryState<RoadmapMilestone[]> = useMemo(
    () => ({
      data: roadmapMilestones,
      isLoading: isRoadmapLoading,
      error: roadmapError,
      refetch: async () => {
        await fetchRoadmapOnly();
      },
    }),
    [roadmapMilestones, isRoadmapLoading, roadmapError, fetchRoadmapOnly],
  );

  const inventoryQuery: SectionQueryState<{
    inventory: UserInventoryItem[];
    activeEffects: ActiveItemEffect[];
  }> = useMemo(
    () => ({
      data: { inventory: inventoryItems, activeEffects },
      isLoading: isInventoryLoading,
      error: inventoryError,
      refetch: async () => {
        await fetchInventoryOnly();
      },
    }),
    [
      inventoryItems,
      activeEffects,
      isInventoryLoading,
      inventoryError,
      fetchInventoryOnly,
    ],
  );

  return {
    user,
    dashboardState,
    isDashboardStateLoading,
    todayDateStr,

    statsQuery,
    logsQuery,
    roadmapQuery,
    inventoryQuery,

    stats,
    logs,
    inventoryItems,
    activeEffects,
    roadmapMilestones,
    availableFreezeTokens,
    restoreShieldCount,
    inventoryCount,

    activeFilter,
    setActiveFilter,
    showDailyCheckIn,
    setShowDailyCheckIn,
    showPlanModal,
    setShowPlanModal,
    isFreezeModalOpen,
    setIsFreezeModalOpen,
    isInventoryOpen,
    setIsInventoryOpen,
    editTileDate,
    setEditTileDate,
    editTileLog,
    setEditTileLog,
    celebrationDetails,
    setCelebrationDetails,
    powerCelebrationData,
    setPowerCelebrationData,
    hasSeenBrokenModal,
    setHasSeenBrokenModal,

    refreshData,
    fetchStatsOnly,
    fetchLogsOnly,
    fetchInventoryOnly,
    fetchRoadmapOnly,
    handleSavePlan,
    handleUseInventoryItem,
    handleDailyCheckInYes,
    handleDailyCheckInNo,
    handleDailyCheckInLater,

    needsPlanSelection: !!(
      user &&
      !isDashboardStateLoading &&
      !dashboardState?.plan
    ),
  };
}

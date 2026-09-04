import AuthGuard from "@/components/AuthGuard";
import { Colors } from "@/constants/Colors";
import { DashboardProvider, useDashboard } from "@/contexts/DashboardContext";
import * as Haptics from "expo-haptics";
import { Tabs } from "expo-router";
import { LayoutDashboard, Package, Trophy, User } from "lucide-react-native";
import { Platform } from "react-native";

import ClaimCelebrationModal from "@/components/modals/ClaimCelebrationModal";
import DailyCheckInModal from "@/components/modals/DailyCheckInModal";
import FreezeModal from "@/components/modals/FreezeModal";
import PowerLevelCelebrationModal from "@/components/modals/PowerLevelCelebrationModal";
import StreakBrokenModal from "@/components/modals/StreakBrokenModal";
import WeeklyPlanModal from "@/components/modals/WeeklyPlanModal";

function GlobalModals() {
  const state = useDashboard();
  const activePlan = state.dashboardState?.plan;

  const showBrokenModal =
    !state.hasSeenBrokenModal &&
    !!state.stats?.streakBrokenEvent &&
    state.stats.streakBrokenEvent.previous_streak > 0;

  return (
    <>
      <DailyCheckInModal
        dateStr={state.todayDateStr}
        isOpen={state.showDailyCheckIn}
        onCheckInYes={state.handleDailyCheckInYes}
        onCheckInNo={state.handleDailyCheckInNo}
        onCheckInLater={state.handleDailyCheckInLater}
        availableWorkoutTypes={activePlan?.categories}
      />

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

      {state.stats?.streakBrokenEvent && (
        <StreakBrokenModal
          isOpen={showBrokenModal}
          onClose={() => state.setHasSeenBrokenModal(true)}
          event={state.stats.streakBrokenEvent}
          onRestoreSuccess={async () => {
            await state.refreshData();
          }}
          onOpenRoadmap={() => {}}
        />
      )}
    </>
  );
}

function TabsNavigator() {
  const { inventoryCount } = useDashboard();

  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: "#0c0f17",
            borderTopColor: "rgba(39,39,42,0.7)",
            borderTopWidth: 1,
            height: Platform.OS === "ios" ? 88 : 64,
            paddingBottom: Platform.OS === "ios" ? 28 : 10,
            paddingTop: 8,
          },
          tabBarActiveTintColor: Colors.brandPrimary,
          tabBarInactiveTintColor: "#71717a",
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: "700",
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Dashboard",
            tabBarIcon: ({ color, size }) => (
              <LayoutDashboard size={size || 22} color={color} />
            ),
          }}
          listeners={{
            tabPress: () => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            },
          }}
        />

        <Tabs.Screen
          name="roadmap"
          options={{
            title: "Roadmap",
            tabBarIcon: ({ color, size }) => (
              <Trophy size={size || 22} color={color} />
            ),
          }}
          listeners={{
            tabPress: () => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            },
          }}
        />

        <Tabs.Screen
          name="inventory"
          options={{
            title: "Inventory",
            tabBarIcon: ({ color, size }) => (
              <Package size={size || 22} color={color} />
            ),
            tabBarBadge: inventoryCount > 0 ? inventoryCount : undefined,
            tabBarBadgeStyle: {
              backgroundColor: Colors.neonCyan,
              color: "#060a0e",
              fontSize: 10,
              fontWeight: "900",
            },
          }}
          listeners={{
            tabPress: () => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            },
          }}
        />

        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            tabBarIcon: ({ color, size }) => (
              <User size={size || 22} color={color} />
            ),
          }}
          listeners={{
            tabPress: () => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            },
          }}
        />
      </Tabs>
      <GlobalModals />
    </>
  );
}

export default function AppLayout() {
  return (
    <AuthGuard>
      <DashboardProvider>
        <TabsNavigator />
      </DashboardProvider>
    </AuthGuard>
  );
}

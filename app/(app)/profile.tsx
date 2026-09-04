import { Colors } from "@/constants/Colors";
import { useDashboard } from "@/contexts/DashboardContext";
import { useAuth } from "@/lib/auth-context";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import {
    CalendarDays,
    CheckCircle2,
    ChevronRight,
    Clock,
    Dumbbell,
    Flame,
    LogOut,
    Settings2,
    ShieldCheck,
    Trophy,
    User as UserIcon,
} from "lucide-react-native";
import { useState } from "react";
import {
    Alert,
    Image,
    Platform,
    RefreshControl,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const STATUS_BAR_HEIGHT =
  Platform.OS === "android" ? (StatusBar.currentHeight ?? 24) : 0;

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const state = useDashboard();
  const [refreshing, setRefreshing] = useState(false);

  const activePlan = state.dashboardState?.plan;
  const stats = state.stats;
  const streak = stats?.scientificStreak;

  const onRefresh = async () => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await state.refreshData();
    setRefreshing(false);
  };

  const handleOpenPlanModal = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    state.setShowPlanModal(true);
  };

  const handleLogout = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert(
      "Sign Out",
      "Are you sure you want to end your current Gym-Git session?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Sign Out",
          style: "destructive",
          onPress: async () => {
            await logout();
          },
        },
      ],
    );
  };

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
              <UserIcon size={14} color={Colors.brandPrimary} />
              <Text style={styles.headerBadge}>ATHLETE SETTINGS</Text>
            </View>
            <Text style={styles.headerTitle}>Profile & Plan</Text>
          </View>
        </View>
      </View>

      {/* ── Scrollable Profile Content ──────────── */}
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
        {/* User Identity Card */}
        <LinearGradient
          colors={["rgba(0,255,136,0.12)", "rgba(0,255,136,0.03)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.userCard}
        >
          {user?.avatarUrl ? (
            <Image
              source={{ uri: user.avatarUrl }}
              style={styles.avatarImage}
            />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <UserIcon size={26} color={Colors.brandPrimary} />
            </View>
          )}

          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user?.name || "Athlete"}</Text>
            <Text style={styles.userEmail} numberOfLines={1}>
              {user?.email || "No email attached"}
            </Text>
            <View style={styles.providerBadge}>
              <ShieldCheck size={11} color={Colors.brandPrimary} />
              <Text style={styles.providerText}>
                {user?.provider === "google"
                  ? "Google Authenticated"
                  : "Email Verified"}
              </Text>
            </View>
          </View>
        </LinearGradient>

        {/* Workout Plan Configuration */}
        <Text style={styles.sectionTitle}>WORKOUT SPLIT</Text>
        {activePlan ? (
          <View style={styles.planCard}>
            <View style={styles.planCardHeader}>
              <View style={styles.planTitleRow}>
                <CalendarDays size={16} color={Colors.brandPrimary} />
                <Text style={styles.planName}>{activePlan.name}</Text>
              </View>
              {activePlan.description && (
                <Text style={styles.planDescription}>
                  {activePlan.description}
                </Text>
              )}

              {/* Categories */}
              <View style={styles.categoriesRow}>
                {activePlan.categories.map((cat) => (
                  <View key={cat} style={styles.categoryChip}>
                    <Text style={styles.categoryText}>{cat}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Change Plan Button */}
            <TouchableOpacity
              onPress={handleOpenPlanModal}
              activeOpacity={0.8}
              style={styles.changePlanButton}
            >
              <Settings2 size={14} color={Colors.brandPrimary} />
              <Text style={styles.changePlanText}>Change Workout Split</Text>
              <ChevronRight size={14} color={Colors.brandPrimary} />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            onPress={handleOpenPlanModal}
            activeOpacity={0.8}
            style={styles.noPlanCard}
          >
            <Text style={styles.noPlanText}>No workout plan active</Text>
            <View style={styles.choosePlanRow}>
              <Text style={styles.choosePlanText}>Select Split</Text>
              <ChevronRight size={14} color={Colors.brandPrimary} />
            </View>
          </TouchableOpacity>
        )}

        {/* Training Performance Summary */}
        <Text style={styles.sectionTitle}>TRAINING ANALYTICS</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View style={styles.statIconRow}>
              <Flame size={15} color="#f59e0b" />
              <Text style={styles.statLabel}>Current Streak</Text>
            </View>
            <Text style={styles.statValue}>
              {stats?.currentStreak ?? 0}{" "}
              <Text style={styles.statUnit}>days</Text>
            </Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statIconRow}>
              <Trophy size={15} color={Colors.brandPrimary} />
              <Text style={styles.statLabel}>Record Streak</Text>
            </View>
            <Text style={styles.statValue}>
              {stats?.longestStreak ?? 0}{" "}
              <Text style={styles.statUnit}>days</Text>
            </Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statIconRow}>
              <Clock size={15} color="#38bdf8" />
              <Text style={styles.statLabel}>Total Volume</Text>
            </View>
            <Text style={styles.statValue}>
              {stats?.totalHours ?? 0} <Text style={styles.statUnit}>hrs</Text>
            </Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statIconRow}>
              <CheckCircle2 size={15} color="#a855f7" />
              <Text style={styles.statLabel}>Adherence</Text>
            </View>
            <Text style={styles.statValue}>
              {streak?.complianceRate ?? 0}{" "}
              <Text style={styles.statUnit}>%</Text>
            </Text>
          </View>
        </View>

        {/* Weekly Status Indicator */}
        {streak && (
          <LinearGradient
            colors={["rgba(168,85,247,0.12)", "rgba(168,85,247,0.03)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.weeklyCard}
          >
            <View style={styles.weeklyRow}>
              <View style={styles.weeklyIconBadge}>
                <Dumbbell size={20} color="#a855f7" />
              </View>
              <View>
                <Text style={styles.weeklyTarget}>
                  {streak.currentWeekDone} / {streak.currentWeekTarget}
                  <Text style={{ fontSize: 12, color: "#a1a1aa" }}>
                    {" "}
                    sessions this week
                  </Text>
                </Text>
                <Text style={styles.weeklySub}>Target compliance pacing</Text>
              </View>
            </View>
            <View
              style={[
                styles.statusPill,
                {
                  backgroundColor:
                    streak.currentWeekStatus === "Behind"
                      ? "rgba(239,68,68,0.15)"
                      : "rgba(52,211,153,0.15)",
                  borderColor:
                    streak.currentWeekStatus === "Behind"
                      ? "rgba(239,68,68,0.4)"
                      : "rgba(52,211,153,0.4)",
                },
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  {
                    color:
                      streak.currentWeekStatus === "Behind"
                        ? "#f87171"
                        : Colors.brandPrimary,
                  },
                ]}
              >
                {streak.currentWeekStatus}
              </Text>
            </View>
          </LinearGradient>
        )}

        {/* Sign Out Action */}
        <TouchableOpacity
          onPress={handleLogout}
          activeOpacity={0.8}
          style={styles.logoutButton}
        >
          <LogOut size={16} color="#ef4444" />
          <Text style={styles.logoutText}>Sign Out of Gym-Git</Text>
        </TouchableOpacity>
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
    paddingHorizontal: 16,
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 2,
  },
  headerBadge: {
    color: Colors.brandPrimary,
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
  scrollContent: {
    padding: 16,
    paddingBottom: 36,
  },
  userCard: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(0,255,136,0.25)",
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 24,
  },
  avatarImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: Colors.brandPrimary,
  },
  avatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#18181b",
    borderWidth: 2,
    borderColor: Colors.brandPrimary,
    alignItems: "center",
    justifyContent: "center",
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    color: Colors.dark.foreground,
    fontSize: 17,
    fontWeight: "800",
  },
  userEmail: {
    color: "#a1a1aa",
    fontSize: 12,
    marginTop: 2,
  },
  providerBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 6,
  },
  providerText: {
    color: Colors.brandPrimary,
    fontSize: 10,
    fontWeight: "700",
  },
  sectionTitle: {
    color: "#71717a",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.2,
    marginBottom: 10,
  },
  planCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(0,255,136,0.25)",
    backgroundColor: "rgba(0,255,136,0.05)",
    marginBottom: 24,
    overflow: "hidden",
  },
  planCardHeader: {
    padding: 16,
  },
  planTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  planName: {
    color: Colors.dark.foreground,
    fontWeight: "800",
    fontSize: 15,
  },
  planDescription: {
    color: "#a1a1aa",
    fontSize: 12,
    marginBottom: 10,
  },
  categoriesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  categoryChip: {
    backgroundColor: "rgba(0,255,136,0.12)",
    borderWidth: 1,
    borderColor: "rgba(0,255,136,0.3)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  categoryText: {
    color: Colors.brandPrimary,
    fontSize: 11,
    fontWeight: "700",
  },
  changePlanButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,255,136,0.15)",
    backgroundColor: "rgba(0,255,136,0.06)",
  },
  changePlanText: {
    color: Colors.brandPrimary,
    fontWeight: "800",
    fontSize: 13,
  },
  noPlanCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#27272a",
    padding: 16,
    marginBottom: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#18181b",
  },
  noPlanText: {
    color: "#a1a1aa",
    fontSize: 13,
  },
  choosePlanRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  choosePlanText: {
    color: Colors.brandPrimary,
    fontWeight: "800",
    fontSize: 13,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 16,
  },
  statCard: {
    width: "48.5%",
    backgroundColor: "#18181b",
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: "#27272a",
  },
  statIconRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },
  statLabel: {
    color: "#a1a1aa",
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  statValue: {
    color: "#f4f4f5",
    fontSize: 18,
    fontWeight: "900",
  },
  statUnit: {
    fontSize: 11,
    color: "#71717a",
  },
  weeklyCard: {
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(168,85,247,0.25)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  weeklyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  weeklyIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "rgba(168,85,247,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  weeklyTarget: {
    color: Colors.dark.foreground,
    fontWeight: "800",
    fontSize: 16,
  },
  weeklySub: {
    color: "#71717a",
    fontSize: 10,
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "800",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: "rgba(239,68,68,0.1)",
    borderWidth: 1,
    borderColor: "rgba(239,68,68,0.3)",
    marginTop: 8,
  },
  logoutText: {
    color: "#ef4444",
    fontWeight: "800",
    fontSize: 14,
  },
});

import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Animated,
  Dimensions,
  ScrollView,
  Pressable,
  Platform,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/lib/auth-context';
import { Colors } from '@/constants/Colors';
import { Stats, WeeklyPlan } from '@/lib/types';
import {
  Menu,
  X,
  Flame,
  Trophy,
  CheckCircle2,
  Clock,
  LogOut,
  User,
  Dumbbell,
  CalendarDays,
  Settings2,
  ChevronRight,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import WeeklyPlanModal from '@/components/modals/WeeklyPlanModal';

const SCREEN_WIDTH = Dimensions.get('window').width;
const DRAWER_WIDTH = SCREEN_WIDTH * 0.82;
const STATUS_BAR_HEIGHT = Platform.OS === 'android' ? StatusBar.currentHeight ?? 24 : 0;

interface AppHeaderProps {
  stats?: Stats | null;
  onPlanSaved?: () => void;
}

export default function AppHeader({ stats, onPlanSaved }: AppHeaderProps) {
  const { user, logout, updateUserPlan } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [planModalOpen, setPlanModalOpen] = useState(false);
  const slideAnim = useRef(new Animated.Value(DRAWER_WIDTH)).current;
  const overlayAnim = useRef(new Animated.Value(0)).current;

  const openDrawer = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setDrawerOpen(true);
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 0,
        damping: 20,
        stiffness: 180,
        useNativeDriver: true,
      }),
      Animated.timing(overlayAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closeDrawer = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: DRAWER_WIDTH,
        damping: 22,
        stiffness: 200,
        useNativeDriver: true,
      }),
      Animated.timing(overlayAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => setDrawerOpen(false));
  };

  const handleLogout = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    closeDrawer();
    setTimeout(() => logout(), 300);
  };

  const handleChangePlan = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setPlanModalOpen(true);
  };

  const handlePlanSaved = async (plan: WeeklyPlan) => {
    await updateUserPlan(plan);
    setPlanModalOpen(false);
    onPlanSaved?.();
  };

  const firstName = user?.name?.split(' ')[0] ?? 'Athlete';
  const streak = stats?.currentStreak ?? 0;
  const scientificStreak = stats?.scientificStreak;

  return (
    <>
      {/* ── Top Bar ────────────────────────────────── */}
      <LinearGradient
        colors={[Colors.dark.background, Colors.dark.card]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          paddingTop: STATUS_BAR_HEIGHT + 10,
          paddingBottom: 14,
          paddingHorizontal: 20,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottomWidth: 1,
          borderBottomColor: Colors.dark.border,
        }}
      >
        {/* Left: Greeting */}
        <View>
          <Text style={{ color: Colors.dark.mutedForeground, fontSize: 12, fontWeight: '600' }}>
            Welcome back,
          </Text>
          <Text style={{ color: Colors.dark.foreground, fontSize: 20, fontWeight: '900', letterSpacing: -0.4 }}>
            {firstName} 👊
          </Text>
        </View>

        {/* Right: streak pill + hamburger */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          {streak > 0 && (
            <LinearGradient
              colors={['rgba(245,158,11,0.18)', 'rgba(245,158,11,0.06)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 5,
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 20,
                borderWidth: 1,
                borderColor: 'rgba(245,158,11,0.35)',
              }}
            >
              <Flame size={14} color="#f59e0b" />
              <Text style={{ color: '#fbbf24', fontWeight: '800', fontSize: 13 }}>
                {streak}
              </Text>
            </LinearGradient>
          )}

          <TouchableOpacity
            onPress={openDrawer}
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              backgroundColor: Colors.dark.secondary,
              borderWidth: 1,
              borderColor: Colors.dark.border,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Menu size={20} color={Colors.dark.foreground} />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* ── Drawer Overlay + Panel ──────────────────── */}
      {drawerOpen && (
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1000,
            flexDirection: 'row',
          }}
          pointerEvents="box-none"
        >
          {/* Dim overlay */}
          <Animated.View
            style={{
              flex: 1,
              backgroundColor: 'rgba(0,0,0,0.65)',
              opacity: overlayAnim,
            }}
          >
            <Pressable style={{ flex: 1 }} onPress={closeDrawer} />
          </Animated.View>

          {/* Drawer panel */}
          <Animated.View
            style={{
              width: DRAWER_WIDTH,
              transform: [{ translateX: slideAnim }],
            }}
          >
            <LinearGradient
              colors={[Colors.dark.card, '#0f0f13']}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={{
                flex: 1,
                paddingTop: STATUS_BAR_HEIGHT + 16,
                borderLeftWidth: 1,
                borderLeftColor: Colors.dark.border,
              }}
            >
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ padding: 20, paddingBottom: 48 }}
              >
                {/* Close button */}
                <TouchableOpacity
                  onPress={closeDrawer}
                  style={{
                    alignSelf: 'flex-end',
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    backgroundColor: Colors.dark.secondary,
                    borderWidth: 1,
                    borderColor: Colors.dark.border,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 20,
                  }}
                >
                  <X size={18} color={Colors.dark.mutedForeground} />
                </TouchableOpacity>

                {/* ── User Profile ─────────────────────── */}
                <LinearGradient
                  colors={['rgba(52,211,153,0.12)', 'rgba(52,211,153,0.03)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{
                    borderRadius: 20,
                    padding: 18,
                    borderWidth: 1,
                    borderColor: 'rgba(52,211,153,0.2)',
                    marginBottom: 20,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 14,
                  }}
                >
                  {user?.avatarUrl ? (
                    <Image
                      source={{ uri: user.avatarUrl }}
                      style={{ width: 52, height: 52, borderRadius: 26, borderWidth: 2, borderColor: Colors.brandPrimary }}
                    />
                  ) : (
                    <View style={{
                      width: 52, height: 52, borderRadius: 26,
                      backgroundColor: Colors.dark.secondary,
                      borderWidth: 2, borderColor: Colors.brandPrimary,
                      alignItems: 'center', justifyContent: 'center',
                    }}>
                      <User size={24} color={Colors.brandPrimary} />
                    </View>
                  )}
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: Colors.dark.foreground, fontSize: 16, fontWeight: '800' }}>
                      {user?.name ?? 'Athlete'}
                    </Text>
                    <Text style={{ color: Colors.dark.mutedForeground, fontSize: 12, marginTop: 2 }} numberOfLines={1}>
                      {user?.email}
                    </Text>
                  </View>
                </LinearGradient>

                {/* ── Workout Plan ─────────────────────── */}
                <Text style={sectionLabel}>Workout Plan</Text>
                {user?.weeklyPlan ? (
                  <View style={{
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor: 'rgba(52,211,153,0.25)',
                    backgroundColor: 'rgba(52,211,153,0.06)',
                    marginBottom: 20,
                    overflow: 'hidden',
                  }}>
                    {/* Plan header */}
                    <View style={{ padding: 16 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        <CalendarDays size={16} color={Colors.brandPrimary} />
                        <Text style={{ color: Colors.dark.foreground, fontWeight: '800', fontSize: 14, flex: 1 }}>
                          {user.weeklyPlan.name}
                        </Text>
                      </View>
                      {user.weeklyPlan.description && (
                        <Text style={{ color: Colors.dark.mutedForeground, fontSize: 11, marginBottom: 10 }}>
                          {user.weeklyPlan.description}
                        </Text>
                      )}
                      {/* Category chips */}
                      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 5 }}>
                        {user.weeklyPlan.categories.map((cat) => (
                          <View
                            key={cat}
                            style={{
                              backgroundColor: 'rgba(52,211,153,0.12)',
                              borderWidth: 1,
                              borderColor: 'rgba(52,211,153,0.3)',
                              paddingHorizontal: 8,
                              paddingVertical: 3,
                              borderRadius: 6,
                            }}
                          >
                            <Text style={{ color: Colors.brandPrimary, fontSize: 10, fontWeight: '700' }}>{cat}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                    {/* Change plan button */}
                    <TouchableOpacity
                      onPress={handleChangePlan}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6,
                        paddingVertical: 11,
                        borderTopWidth: 1,
                        borderTopColor: 'rgba(52,211,153,0.15)',
                        backgroundColor: 'rgba(52,211,153,0.06)',
                      }}
                    >
                      <Settings2 size={14} color={Colors.brandPrimary} />
                      <Text style={{ color: Colors.brandPrimary, fontWeight: '700', fontSize: 13 }}>Change Plan</Text>
                      <ChevronRight size={14} color={Colors.brandPrimary} />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    onPress={handleChangePlan}
                    style={{
                      borderRadius: 16,
                      borderWidth: 1,
                      borderColor: Colors.dark.border,
                      padding: 16,
                      marginBottom: 20,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Text style={{ color: Colors.dark.mutedForeground, fontSize: 13 }}>No plan selected</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <Text style={{ color: Colors.brandPrimary, fontWeight: '700', fontSize: 13 }}>Choose Plan</Text>
                      <ChevronRight size={14} color={Colors.brandPrimary} />
                    </View>
                  </TouchableOpacity>
                )}

                {/* ── Stats ─────────────────────────────── */}
                <Text style={sectionLabel}>Your Stats</Text>

                <View style={{ flexDirection: 'row', gap: 10, marginBottom: 10 }}>
                  <MiniStatCard
                    icon={<Flame size={16} color="#f59e0b" />}
                    label="Streak"
                    value={`${stats?.currentStreak ?? 0}`}
                    unit="days"
                    borderColor="rgba(245,158,11,0.4)"
                    glowColor="rgba(245,158,11,0.12)"
                  />
                  <MiniStatCard
                    icon={<Trophy size={16} color={Colors.brandPrimary} />}
                    label="Record"
                    value={`${stats?.longestStreak ?? 0}`}
                    unit="days"
                    borderColor="rgba(52,211,153,0.4)"
                    glowColor="rgba(52,211,153,0.12)"
                  />
                </View>

                <View style={{ flexDirection: 'row', gap: 10, marginBottom: 20 }}>
                  <MiniStatCard
                    icon={<Clock size={16} color="#60a5fa" />}
                    label="Total Hours"
                    value={`${stats?.totalHours ?? 0}`}
                    unit="hrs"
                    borderColor="rgba(59,130,246,0.4)"
                    glowColor="rgba(59,130,246,0.12)"
                  />
                  <MiniStatCard
                    icon={<CheckCircle2 size={16} color="#a855f7" />}
                    label="Adherence"
                    value={`${scientificStreak?.complianceRate ?? 0}`}
                    unit="%"
                    borderColor="rgba(168,85,247,0.4)"
                    glowColor="rgba(168,85,247,0.12)"
                  />
                </View>

                {/* ── This Week ─────────────────────────── */}
                {scientificStreak && (
                  <>
                    <Text style={sectionLabel}>This Week</Text>
                    <LinearGradient
                      colors={['rgba(168,85,247,0.12)', 'rgba(168,85,247,0.04)']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={{
                        borderRadius: 16,
                        padding: 16,
                        borderWidth: 1,
                        borderColor: 'rgba(168,85,247,0.25)',
                        marginBottom: 20,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                        <Dumbbell size={22} color="#a855f7" />
                        <View>
                          <Text style={{ color: Colors.dark.foreground, fontWeight: '800', fontSize: 20 }}>
                            {scientificStreak.currentWeekDone}
                            <Text style={{ fontSize: 13, color: Colors.dark.mutedForeground }}>
                              /{scientificStreak.currentWeekTarget}
                            </Text>
                          </Text>
                          <Text style={{ color: Colors.dark.mutedForeground, fontSize: 11 }}>sessions done</Text>
                        </View>
                      </View>
                      <View style={{
                        paddingHorizontal: 12,
                        paddingVertical: 5,
                        borderRadius: 20,
                        backgroundColor: scientificStreak.currentWeekStatus === 'Behind'
                          ? 'rgba(239,68,68,0.15)' : 'rgba(52,211,153,0.15)',
                        borderWidth: 1,
                        borderColor: scientificStreak.currentWeekStatus === 'Behind'
                          ? 'rgba(239,68,68,0.4)' : 'rgba(52,211,153,0.4)',
                      }}>
                        <Text style={{
                          color: scientificStreak.currentWeekStatus === 'Behind' ? '#f87171' : Colors.brandPrimary,
                          fontWeight: '800', fontSize: 11,
                        }}>
                          {scientificStreak.currentWeekStatus}
                        </Text>
                      </View>
                    </LinearGradient>
                  </>
                )}

                {/* ── Logout ────────────────────────────── */}
                <TouchableOpacity
                  onPress={handleLogout}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    paddingVertical: 14,
                    borderRadius: 14,
                    backgroundColor: 'rgba(239,68,68,0.1)',
                    borderWidth: 1,
                    borderColor: 'rgba(239,68,68,0.3)',
                  }}
                >
                  <LogOut size={17} color="#ef4444" />
                  <Text style={{ color: '#ef4444', fontWeight: '800', fontSize: 14 }}>Sign Out</Text>
                </TouchableOpacity>
              </ScrollView>
            </LinearGradient>
          </Animated.View>
        </View>
      )}

      {/* ── Plan Modal (mounted outside drawer so it can outlive it) ── */}
      <WeeklyPlanModal
        isOpen={planModalOpen}
        currentPlan={user?.weeklyPlan}
        onSavePlan={handlePlanSaved}
        onClose={() => setPlanModalOpen(false)}
      />
    </>
  );
}

/* ── Shared styles ───────────────────────────── */
const sectionLabel = {
  color: '#71717a',
  fontSize: 10,
  fontWeight: '700' as const,
  textTransform: 'uppercase' as const,
  letterSpacing: 1.5,
  marginBottom: 10,
};

/* ── Reusable mini stat card ─────────────────── */
function MiniStatCard({
  icon,
  label,
  value,
  unit,
  borderColor,
  glowColor,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  unit: string;
  borderColor: string;
  glowColor: string;
}) {
  return (
    <LinearGradient
      colors={[glowColor, 'transparent']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{
        flex: 1,
        padding: 14,
        borderRadius: 16,
        borderWidth: 1,
        borderColor,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 6 }}>
        {icon}
        <Text style={{ color: Colors.dark.mutedForeground, fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 }}>
          {label}
        </Text>
      </View>
      <Text style={{ color: Colors.dark.foreground, fontSize: 22, fontWeight: '900' }}>
        {value}
        <Text style={{ fontSize: 12, color: Colors.dark.mutedForeground }}> {unit}</Text>
      </Text>
    </LinearGradient>
  );
}

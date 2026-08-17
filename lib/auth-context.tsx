import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase';
import { api } from '@/utils/api';
import { User, WeeklyPlan, UserStreak, RawAuthMeResponse } from './types';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';

WebBrowser.maybeCompleteAuthSession();

interface AuthContextType {
  user: User | null;
  streak: UserStreak | null;
  loading: boolean;
  login: (email: string, pass: string, plan?: WeeklyPlan) => Promise<void>;
  signup: (email: string, pass: string, name?: string, plan?: WeeklyPlan) => Promise<void>;
  loginWithGoogle: (plan?: WeeklyPlan) => Promise<void>;
  logout: () => Promise<void>;
  updateUserPlan: (plan: WeeklyPlan) => Promise<void>;
  bootstrapBackend: (selectedPlan?: WeeklyPlan, accessToken?: string) => Promise<User | null>;
}

function mapBackendUser(data: RawAuthMeResponse): User {
  if (!data) {
    return {
      email: '',
      name: '',
      provider: 'email',
    };
  }

  const u = data.user || data;
  const p = data.plan || u.weeklyPlan;

  let streakObj: UserStreak | undefined;
  if (data.streak) {
    const s = data.streak;
    streakObj = {
      currentStreak: s.current_streak ?? s.currentStreak ?? 0,
      longestStreak: s.longest_streak ?? s.longestStreak ?? 0,
      complianceRate: s.compliance_rate ?? s.complianceRate ?? 0,
      cycleInfo: s.cycle_info ? {
        cycle_start_date: s.cycle_info.cycle_start_date,
        cycle_end_date: s.cycle_info.cycle_end_date,
        workouts_completed_in_cycle: s.cycle_info.workouts_completed_in_cycle,
        workouts_target_in_cycle: s.cycle_info.workouts_target_in_cycle,
        rest_tokens_total: s.cycle_info.rest_tokens_total,
        rest_tokens_used: s.cycle_info.rest_tokens_used,
        rest_tokens_remaining: s.cycle_info.rest_tokens_remaining,
        days_remaining_in_cycle: s.cycle_info.days_remaining_in_cycle,
      } : undefined,
      accuracyScore: s.accuracy_score ?? s.accuracyScore ?? 0,
      isFrozen: s.is_frozen ?? s.isFrozen ?? false,
      streakBrokenEvent: s.streak_broken_event ? {
        previous_streak: s.streak_broken_event.previous_streak,
        broken_on: s.streak_broken_event.broken_on,
        restore_shield_available: s.streak_broken_event.restore_shield_available,
        restore_shields_count: s.streak_broken_event.restore_shields_count,
        can_restore_until: s.streak_broken_event.can_restore_until,
      } : null,
      streakWarningEvent: s.streak_warning_event ? {
        is_at_risk: s.streak_warning_event.is_at_risk,
        hours_remaining: s.streak_warning_event.hours_remaining,
        rest_tokens_left: s.streak_warning_event.rest_tokens_left,
        message: s.streak_warning_event.message,
      } : null,
    };
  }

  return {
    email: u.email || '',
    name: u.name || (u.email ? u.email.split('@')[0] : 'Gymbro'),
    avatarUrl: u.avatar_url || u.avatarUrl,
    provider: u.provider || 'email',
    weeklyPlan: p
      ? {
          id: p.id,
          name: p.name,
          description: p.description,
          categories: p.categories || [],
          daysPerWeek: p.daysPerWeek,
          schedule: p.schedule,
        }
      : undefined,
    queuedWeeklyPlanId: u.queued_weekly_plan_id || u.queuedWeeklyPlanId || null,
    streak: streakObj,
    checkinSnooze: data.checkin_snooze ? {
      date: data.checkin_snooze.date,
      snoozed_at: data.checkin_snooze.snoozed_at,
      is_snoozed: data.checkin_snooze.is_snoozed,
      remaining_seconds: data.checkin_snooze.remaining_seconds,
    } : undefined,
  };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [streak, setStreak] = useState<UserStreak | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const bootstrapBackend = async (
    selectedPlan?: WeeklyPlan,
    accessToken?: string
  ): Promise<User | null> => {
    let token = accessToken;
    if (!token) {
      const { data: { session } } = await supabase.auth.getSession();
      token = session?.access_token;
    }
    if (!token) {
      setUser(null);
      setStreak(null);
      return null;
    }

    try {
      // 1. Critical Bootstrap Step (Idempotent profile creation in Postgres)
      await api.post(
        '/auth/bootstrap',
        { selectedPlanId: selectedPlan?.id || 'ppl-standard' },
        { token }
      );

      // 2. Fetch User Profile, Streak & Active Plan
      const rawProfileData = await api.get<RawAuthMeResponse>('/auth/me', { token });
      const mappedUser = mapBackendUser(rawProfileData);
      setUser(mappedUser);
      setStreak(mappedUser.streak || null);
      return mappedUser;
    } catch (err) {
      console.error('[Bootstrap Failed]', err);
      setUser(null);
      setStreak(null);
      return null;
    }
  };

  useEffect(() => {
    async function initSession() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.access_token) {
          await bootstrapBackend(undefined, session.access_token);
        }
      } catch (err) {
        console.error('Session initialization error:', err);
      } finally {
        setLoading(false);
      }
    }

    initSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.access_token) {
        await bootstrapBackend(undefined, session.access_token);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setStreak(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, pass: string, plan?: WeeklyPlan) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password: pass });
      if (error) throw new Error(error.message);
      if (data.session?.access_token) {
        await bootstrapBackend(plan, data.session.access_token);
      }
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email: string, pass: string, name?: string, plan?: WeeklyPlan) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password: pass,
        options: { data: { name: name || email.split('@')[0] } },
      });
      if (error) throw new Error(error.message);
      if (data.session?.access_token) {
        await bootstrapBackend(plan, data.session.access_token);
      }
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async (_plan?: WeeklyPlan) => {
    setLoading(true);
    try {
      const redirectUrl = AuthSession.makeRedirectUri({ scheme: 'gymgit' });
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: redirectUrl },
      });
      if (error) throw new Error(error.message);
      if (data?.url) {
        await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
      try {
        await api.post('/auth/logout');
      } catch {}
      setUser(null);
      setStreak(null);
    } finally {
      setLoading(false);
    }
  };

  const updateUserPlan = async (plan: WeeklyPlan) => {
    const payload: Record<string, unknown> = { plan_id: plan.id };
    if (plan.id === 'custom-plan') {
      payload.name = plan.name;
      payload.description = plan.description;
      payload.categories = plan.categories;
      payload.schedule = plan.schedule;
      payload.days_per_week = plan.daysPerWeek;
    }
    await api.put('/auth/plan', payload);
    if (user) {
      setUser({ ...user, weeklyPlan: plan });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        streak,
        loading,
        login,
        signup,
        loginWithGoogle,
        logout,
        updateUserPlan,
        bootstrapBackend,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

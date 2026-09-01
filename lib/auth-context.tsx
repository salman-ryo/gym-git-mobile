import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase';
import { api } from '@/utils/api';
import { User, WeeklyPlan, UserStreak, RawAuthMeResponse } from './types';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';

WebBrowser.maybeCompleteAuthSession();

interface AuthContextType {
  user: User | null;
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

  return {
    id: u.id || (data as Record<string, unknown>).id as string | undefined,
    email: u.email || '',
    name: u.name || (u.email ? u.email.split('@')[0] : 'Gymbro'),
    avatarUrl: u.avatar_url || u.avatarUrl,
    provider: u.provider || 'email',
    role: u.role || data.role || (data as Record<string, unknown>).role as string | undefined || 'user',
  };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
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
      return null;
    }

    try {
      // 1. Critical Bootstrap Step (Idempotent profile creation in Postgres)
      await api.post(
        '/auth/bootstrap',
        { selectedPlanId: selectedPlan?.id || 'ppl-standard' },
        { token }
      );

      // 2. Fetch User Profile
      const rawProfileData = await api.get<RawAuthMeResponse>('/auth/me', { token });
      const mappedUser = mapBackendUser(rawProfileData);
      setUser(mappedUser);
      return mappedUser;
    } catch (err) {
      console.error('[Bootstrap Failed]', err);
      setUser(null);
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
  };

  return (
    <AuthContext.Provider
      value={{
        user,
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

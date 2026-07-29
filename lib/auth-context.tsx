import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase';
import { api } from '@/utils/api';
import { User, WeeklyPlan } from './types';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';

WebBrowser.maybeCompleteAuthSession();

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  signup: (email: string, pass: string, name?: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  updateUserPlan: (plan: WeeklyPlan) => Promise<void>;
  bootstrapBackend: (selectedPlan?: WeeklyPlan, accessToken?: string) => Promise<User | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const bootstrapBackend = async (selectedPlan?: WeeklyPlan, accessToken?: string) => {
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
      await api.post('/auth/bootstrap', { selectedPlanId: selectedPlan?.id || 'ppl-standard' }, { token });

      // 2. Fetch User Profile & Active Plan
      const raw = await api.get<any>('/auth/me', { token });
      const u = raw.user || raw;
      const p = raw.plan || u.weeklyPlan;

      const mappedUser: User = {
        email: u.email || '',
        name: u.name || (u.email ? u.email.split('@')[0] : 'Gymbro'),
        avatarUrl: u.avatar_url || u.avatarUrl,
        provider: u.provider || 'email',
        weeklyPlan: p ? { id: p.id, name: p.name, description: p.description, categories: p.categories || [] } : undefined,
      };

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
        console.error(err);
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

  const login = async (email: string, pass: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password: pass });
      if (error) throw new Error(error.message);
      if (data.session?.access_token) {
        await bootstrapBackend(undefined, data.session.access_token);
      }
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email: string, pass: string, name?: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password: pass,
        options: { data: { name: name || email.split('@')[0] } },
      });
      if (error) throw new Error(error.message);
      if (data.session?.access_token) {
        await bootstrapBackend(undefined, data.session.access_token);
      }
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async () => {
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
      try { await api.post('/auth/logout'); } catch {}
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const updateUserPlan = async (plan: WeeklyPlan) => {
    const payload: any = { plan_id: plan.id };
    if (plan.id === 'custom-plan') {
      payload.name = plan.name;
      payload.description = plan.description;
      payload.categories = plan.categories;
    }
    await api.put('/auth/plan', payload);
    if (user) setUser({ ...user, weeklyPlan: plan });
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

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

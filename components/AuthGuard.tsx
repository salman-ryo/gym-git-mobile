import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'expo-router';
import CyberpunkLoader from './CyberpunkLoader';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return <CyberpunkLoader text="Decrypting Neural Logs..." fullScreen />;
  }

  if (!user) return null;
  return <>{children}</>;
}

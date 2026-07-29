import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'expo-router';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#09090b', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#10b981" />
        <Text style={{ color: '#a1a1aa', marginTop: 12, fontSize: 14 }}>Loading Gym-Git workspace...</Text>
      </View>
    );
  }

  if (!user) return null;
  return <>{children}</>;
}

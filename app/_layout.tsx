import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { AuthProvider, useAuth } from '@/lib/auth-context';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();

function RootStack() {
  const { loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [loading]);

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#09090b' } }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="(app)" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <StatusBar style="light" />
      <RootStack />
    </AuthProvider>
  );
}

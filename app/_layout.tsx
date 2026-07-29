import React from 'react';
import { Stack } from 'expo-router';
import { AuthProvider } from '@/lib/auth-context';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <AuthProvider>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#09090b' } }}>
        <Stack.Screen name="login" />
        <Stack.Screen name="(app)" />
      </Stack>
    </AuthProvider>
  );
}

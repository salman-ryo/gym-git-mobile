import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useAuth } from '@/lib/auth-context';
import { Dumbbell, Flame, LogOut } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

interface HeaderProps {
  currentStreak?: number;
}

export default function Header({ currentStreak = 0 }: HeaderProps) {
  const { logout } = useAuth();

  const handleLogout = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    logout();
  };

  return (
    <LinearGradient
      colors={['#09090b', '#121215']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(39,39,42,0.6)',
      }}
    >
      {/* Brand Logo */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <LinearGradient
          colors={['#10b981', '#059669']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ width: 38, height: 38, borderRadius: 12, justifyContent: 'center', alignItems: 'center' }}
        >
          <Dumbbell size={22} color="#09090b" />
        </LinearGradient>
        <Text style={{ fontSize: 20, fontWeight: '900', color: '#10b981', letterSpacing: -0.5 }}>Gym-Git</Text>
      </View>

      {/* Streak Badge */}
      <LinearGradient
        colors={['rgba(245,158,11,0.15)', 'rgba(217,119,6,0.25)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 14,
          paddingVertical: 6,
          borderRadius: 20,
          gap: 6,
          borderWidth: 1,
          borderColor: 'rgba(245,158,11,0.4)',
        }}
      >
        <Flame size={16} color="#f59e0b" />
        <Text style={{ color: '#f59e0b', fontWeight: '800', fontSize: 13 }}>{currentStreak} Days</Text>
      </LinearGradient>

      {/* Logout Button */}
      <TouchableOpacity onPress={handleLogout} style={{ padding: 8, borderRadius: 10, backgroundColor: 'rgba(39,39,42,0.6)', borderWidth: 1, borderColor: '#27272a' }}>
        <LogOut size={18} color="#ef4444" />
      </TouchableOpacity>
    </LinearGradient>
  );
}

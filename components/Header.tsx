import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useAuth } from '@/lib/auth-context';
import { Dumbbell, Flame, LogOut } from 'lucide-react-native';
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
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#09090b', borderBottomWidth: 1, borderBottomColor: '#18181b' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: '#10b981', justifyContent: 'center', alignItems: 'center' }}>
          <Dumbbell size={20} color="#09090b" />
        </View>
        <Text style={{ fontSize: 18, fontWeight: '900', color: '#10b981' }}>Gym-Git</Text>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#18181b', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, gap: 6 }}>
        <Flame size={16} color="#f59e0b" />
        <Text style={{ color: '#f59e0b', fontWeight: '800', fontSize: 13 }}>{currentStreak} Days</Text>
      </View>

      <TouchableOpacity onPress={handleLogout} style={{ padding: 8, borderRadius: 10, backgroundColor: '#18181b' }}>
        <LogOut size={18} color="#ef4444" />
      </TouchableOpacity>
    </View>
  );
}

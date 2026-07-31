import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { useAuth } from '@/lib/auth-context';
import { Flame, LogOut } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/Colors';

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
      colors={[Colors.dark.background, Colors.dark.card]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: Colors.dark.border,
      }}
    >
      {/* Brand Logo */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <Image
          source={require('@/assets/images/logo.png')}
          style={{ width: 34, height: 34, borderRadius: 10 }}
        />
        <Text style={{ fontSize: 20, fontWeight: '900', color: Colors.brandPrimary, letterSpacing: -0.5 }}>Gym-Git</Text>
      </View>

      {/* Logout Button */}
      <TouchableOpacity onPress={handleLogout} style={{ padding: 8, borderRadius: 10, backgroundColor: Colors.dark.secondary, borderWidth: 1, borderColor: Colors.dark.border }}>
        <LogOut size={18} color="#ef4444" />
      </TouchableOpacity>
    </LinearGradient>
  );
}

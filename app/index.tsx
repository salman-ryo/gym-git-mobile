import React from 'react';
import { View, Text } from 'react-native';
import { PREBUILT_PLANS } from '@/lib/types';
import { animePowerLevels } from '@/assets/anime';
import { supabase } from '@/utils/supabase';
import { api } from '@/utils/api';

export default function IndexScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: '#09090b', justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ color: '#10b981', fontSize: 24, fontWeight: 'bold' }}>Gym-Git Mobile</Text>
      <Text style={{ color: '#a1a1aa', marginTop: 8 }}>Phase 2 Core Infrastructure Active</Text>
      <Text style={{ color: '#71717a', marginTop: 4, fontSize: 12 }}>
        Plans: {PREBUILT_PLANS.length} | Anime Tiers: {animePowerLevels.length}
      </Text>
    </View>
  );
}

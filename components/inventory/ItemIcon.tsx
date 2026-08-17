import React from 'react';
import { View, Image, StyleSheet, ImageSourcePropType } from 'react-native';
import { Shield, Snowflake, Zap, Target } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';

interface ItemIconProps {
  itemId: string;
  imageSrc?: ImageSourcePropType | { uri: string };
  size?: number;
}

export default function ItemIcon({ itemId, imageSrc, size = 24 }: ItemIconProps) {
  if (imageSrc) {
    return (
      <View style={[styles.container, { width: size, height: size }]}>
        <Image
          source={imageSrc}
          style={{ width: size, height: size, resizeMode: 'contain' }}
        />
      </View>
    );
  }

  // Neon Cyberpunk icon renderers
  switch (itemId) {
    case 'RESTORE_SHIELD':
      return (
        <View style={styles.container}>
          <Shield size={size} color={Colors.neonCyan} />
        </View>
      );
    case 'STREAK_FREEZE_TOKEN':
      return (
        <View style={styles.container}>
          <Snowflake size={size} color={Colors.iceFrost} />
        </View>
      );
    case 'XP_BOOST':
      return (
        <View style={styles.container}>
          <Zap size={size} color={Colors.neonPurple} />
        </View>
      );
    case 'ACCURACY_CHARM':
      return (
        <View style={styles.container}>
          <Target size={size} color={Colors.amber} />
        </View>
      );
    default:
      return (
        <View style={styles.container}>
          <Target size={size} color="#a1a1aa" />
        </View>
      );
  }
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

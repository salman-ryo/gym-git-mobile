import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, Easing } from 'react-native';
import { Colors } from '@/constants/Colors';

interface CyberpunkLoaderProps {
  text?: string;
  fullScreen?: boolean;
}

export default function CyberpunkLoader({
  text = 'Syncing Neural Logs',
  fullScreen = false,
}: CyberpunkLoaderProps) {
  // Rotations
  const rotateAnim = useRef(new Animated.Value(0)).current;

  // Pulse core
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Bouncing dots
  const bounce1 = useRef(new Animated.Value(0)).current;
  const bounce2 = useRef(new Animated.Value(0)).current;
  const bounce3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 1. Rotation animation
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // 2. Pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.3,
          duration: 800,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1.0,
          duration: 800,
          easing: Easing.ease,
          useNativeDriver: true,
        })
      ])
    ).start();

    // 3. Bouncing dots animations helper
    const createBounce = (anim: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, {
            toValue: -6,
            duration: 300,
            easing: Easing.ease,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 300,
            easing: Easing.ease,
            useNativeDriver: true,
          }),
          Animated.delay(800 - delay),
        ])
      );
    };

    Animated.parallel([
      createBounce(bounce1, 0),
      createBounce(bounce2, 150),
      createBounce(bounce3, 300),
    ]).start();
  }, [rotateAnim, pulseAnim, bounce1, bounce2, bounce3]);

  const spinClockwise = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const spinCounterClockwise = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['360deg', '0deg'],
  });

  const containerStyle = fullScreen
    ? {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: Colors.dark.background,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
      }
    : { width: '100%', paddingVertical: 40, justifyContent: 'center', alignItems: 'center' };

  return (
    <View style={[containerStyle as any, { gap: 32 }]}>
      {/* HUD Spinner */}
      <View style={{ width: 96, height: 96, justifyContent: 'center', alignItems: 'center' }}>
        {/* Outer Ring - Indigo */}
        <Animated.View
          style={{
            position: 'absolute',
            width: 96,
            height: 96,
            borderRadius: 48,
            borderWidth: 2,
            borderColor: 'transparent',
            borderTopColor: '#818cf8',
            borderRightColor: '#818cf8',
            transform: [{ rotate: spinClockwise }],
            shadowColor: '#818cf8',
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.6,
            shadowRadius: 10,
          }}
        />

        {/* Inner Ring - Cyan */}
        <Animated.View
          style={{
            position: 'absolute',
            width: 76,
            height: 76,
            borderRadius: 38,
            borderWidth: 2,
            borderColor: 'transparent',
            borderBottomColor: '#22d3ee',
            borderLeftColor: '#22d3ee',
            transform: [{ rotate: spinCounterClockwise }],
            shadowColor: '#22d3ee',
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.5,
            shadowRadius: 8,
          }}
        />

        {/* Core Pulsating Diamond - Amber */}
        <Animated.View
          style={{
            width: 12,
            height: 12,
            backgroundColor: '#fbbf24',
            transform: [
              { rotate: '45deg' },
              { scale: pulseAnim }
            ],
            shadowColor: '#fbbf24',
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.8,
            shadowRadius: 12,
          }}
        />
      </View>

      {/* Text & Dots */}
      <View style={{ alignItems: 'center', gap: 12 }}>
        <Text
          style={{
            color: '#818cf8',
            fontSize: 10,
            fontWeight: '900',
            textTransform: 'uppercase',
            letterSpacing: 3,
            textAlign: 'center',
          }}
        >
          {text}
        </Text>
        <View style={{ flexDirection: 'row', gap: 6 }}>
          <Animated.View
            style={{
              width: 6,
              height: 6,
              borderRadius: 3,
              backgroundColor: '#818cf8',
              transform: [{ translateY: bounce1 }],
            }}
          />
          <Animated.View
            style={{
              width: 6,
              height: 6,
              borderRadius: 3,
              backgroundColor: '#818cf8',
              transform: [{ translateY: bounce2 }],
            }}
          />
          <Animated.View
            style={{
              width: 6,
              height: 6,
              borderRadius: 3,
              backgroundColor: '#818cf8',
              transform: [{ translateY: bounce3 }],
            }}
          />
        </View>
      </View>
    </View>
  );
}

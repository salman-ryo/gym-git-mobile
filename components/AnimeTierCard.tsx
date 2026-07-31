import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  Image,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { X, Target, Timer, Puzzle, Flame, Calendar } from 'lucide-react-native';
import { AnimePower, PowerScoreBreakdown } from '@/lib/types';

const SCREEN_HEIGHT = Dimensions.get('window').height;

interface AnimeTierCardProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;           // e.g. "Oct" or "Week Aug 4"
  score: number;
  character: AnimePower;
  gymDays: number;
  totalHours: number;
  scoreData: PowerScoreBreakdown;
}

// Derive accent colors from score tier
function getTierAccent(score: number): { primary: string; secondary: string; glow: string } {
  if (score < 15) return { primary: '#71717a', secondary: '#52525b', glow: 'rgba(113,113,122,0.15)' };
  if (score < 25) return { primary: '#94a3b8', secondary: '#64748b', glow: 'rgba(148,163,184,0.15)' };
  if (score < 35) return { primary: '#60a5fa', secondary: '#3b82f6', glow: 'rgba(59,130,246,0.18)' };
  if (score < 45) return { primary: '#34d399', secondary: '#10b981', glow: 'rgba(52,211,153,0.18)' };
  if (score < 55) return { primary: '#34d399', secondary: '#10b981', glow: 'rgba(52,211,153,0.18)' };
  if (score < 65) return { primary: '#818cf8', secondary: '#4f46e5', glow: 'rgba(129,140,248,0.2)' };
  if (score < 75) return { primary: '#818cf8', secondary: '#4f46e5', glow: 'rgba(129,140,248,0.2)' };
  if (score < 85) return { primary: '#c084fc', secondary: '#a855f7', glow: 'rgba(168,85,247,0.2)' };
  if (score < 90) return { primary: '#fb7185', secondary: '#be123c', glow: 'rgba(251,113,133,0.2)' };
  if (score < 97) return { primary: '#fb7185', secondary: '#be123c', glow: 'rgba(251,113,133,0.2)' };
  return { primary: '#fbbf24', secondary: '#f59e0b', glow: 'rgba(251,191,36,0.22)' };
}

function ProgressBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  const widthAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(widthAnim, { toValue: pct, duration: 600, useNativeDriver: false }).start();
  }, [pct]);
  return (
    <View style={{ height: 4, backgroundColor: '#27272a', borderRadius: 2, marginTop: 5, overflow: 'hidden' }}>
      <Animated.View style={{
        height: '100%',
        borderRadius: 2,
        backgroundColor: color,
        width: widthAnim.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] }),
      }} />
    </View>
  );
}

export default function AnimeTierCard({
  isOpen,
  onClose,
  title,
  score,
  character,
  gymDays,
  totalHours,
  scoreData,
}: AnimeTierCardProps) {
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const { primary, secondary, glow } = getTierAccent(score);

  useEffect(() => {
    if (isOpen) {
      Animated.spring(slideAnim, {
        toValue: 0,
        damping: 20,
        stiffness: 160,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: SCREEN_HEIGHT,
        duration: 260,
        useNativeDriver: true,
      }).start();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <Modal visible={isOpen} transparent animationType="none" onRequestClose={onClose}>
      {/* Scrim */}
      <TouchableOpacity
        activeOpacity={1}
        onPress={onClose}
        style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'flex-end' }}
      >
        <Animated.View
          style={{ transform: [{ translateY: slideAnim }] }}
        >
          {/* Stop tap-through on card */}
          <TouchableOpacity activeOpacity={1} onPress={() => { }}>
            <LinearGradient
              colors={['#111118', '#09090d']}
              style={{
                borderTopLeftRadius: 28,
                borderTopRightRadius: 28,
                overflow: 'hidden',
                borderTopWidth: 1,
                borderLeftWidth: 1,
                borderRightWidth: 1,
                borderColor: `${primary}40`,
                paddingBottom: 32,
              }}
            >
              {/* Glow blob */}
              <View style={{
                position: 'absolute', top: -60, alignSelf: 'center',
                width: 220, height: 220, borderRadius: 110,
                backgroundColor: glow,
              }} />

              {/* Drag handle */}
              <View style={{ alignItems: 'center', paddingTop: 12, paddingBottom: 4 }}>
                <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: '#3f3f46' }} />
              </View>

              {/* ── Header ── */}
              <View style={{
                flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
                paddingHorizontal: 20, paddingVertical: 12,
                borderBottomWidth: 1, borderBottomColor: `${primary}30`,
              }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Calendar size={14} color={primary} />
                  <Text style={{ color: '#e4e4e7', fontSize: 13, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1.2 }}>
                    {title}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 2 }}>
                    <Text style={{ color: primary, fontSize: 20, fontWeight: '900' }}>{score}</Text>
                    <Text style={{ color: secondary, fontSize: 11, fontWeight: '700' }}>/100 PTS</Text>
                  </View>
                  <TouchableOpacity
                    onPress={onClose}
                    style={{
                      width: 30, height: 30, borderRadius: 9,
                      backgroundColor: '#1c1c1e', borderWidth: 1, borderColor: '#27272a',
                      alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    <X size={15} color="#71717a" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Amber score separator line */}
              <LinearGradient
                colors={[`${secondary}00`, secondary, `${secondary}00`]}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={{ height: 1.5, opacity: 0.6 }}
              />

              {/* ── Profile area ── */}
              <View style={{ flexDirection: 'row', gap: 16, paddingHorizontal: 20, paddingTop: 18, paddingBottom: 14 }}>
                {/* Character image with glow */}
                <View style={{ width: 96, height: 96, position: 'relative', alignItems: 'center', justifyContent: 'center' }}>
                  <View style={{
                    position: 'absolute', width: 80, height: 80, borderRadius: 40,
                    backgroundColor: `${primary}22`,
                  }} />
                  <Image
                    source={character.image}
                    style={{ width: 96, height: 96, objectFit: "contain" }}
                    resizeMode="cover"
                  />
                </View>

                {/* Name + description */}
                <View style={{ flex: 1, justifyContent: 'center' }}>
                  <Text style={{ color: '#fbbf24', fontSize: 20, fontWeight: '900', textTransform: 'uppercase', letterSpacing: -0.3 }}>
                    {character.name} Tier
                  </Text>
                  <Text style={{ color: '#a1a1aa', fontSize: 10.5, lineHeight: 15, marginTop: 5 }} numberOfLines={4}>
                    {character.description}
                  </Text>
                  <Text style={{ color: '#52525b', fontSize: 11, fontWeight: '600', marginTop: 8 }}>
                    {gymDays} gym days · {totalHours}h total
                  </Text>
                </View>
              </View>

              {/* Divider */}
              <View style={{ height: 1, backgroundColor: `${primary}20`, marginHorizontal: 20 }} />

              {/* ── Stats Grid ── */}
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, padding: 16 }}>
                {/* Consistency */}
                <View style={{
                  flex: 1, minWidth: '45%', backgroundColor: 'rgba(239,68,68,0.08)',
                  borderWidth: 1, borderColor: 'rgba(239,68,68,0.2)',
                  borderRadius: 14, padding: 12,
                }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}>
                    <View style={{ backgroundColor: 'rgba(239,68,68,0.18)', padding: 5, borderRadius: 8 }}>
                      <Target size={13} color="#f87171" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text style={{ color: '#f4f4f5', fontSize: 11, fontWeight: '800' }}>Consistency</Text>
                        <Text style={{ color: '#71717a', fontSize: 10 }}>{scoreData.consistencyScore}/45</Text>
                      </View>
                      <Text style={{ color: '#71717a', fontSize: 9, marginTop: 1 }}>Consistent check-ins</Text>
                      <ProgressBar value={scoreData.consistencyScore} max={45} color="#f87171" />
                    </View>
                  </View>
                </View>

                {/* Duration */}
                <View style={{
                  flex: 1, minWidth: '45%', backgroundColor: 'rgba(59,130,246,0.08)',
                  borderWidth: 1, borderColor: 'rgba(59,130,246,0.2)',
                  borderRadius: 14, padding: 12,
                }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}>
                    <View style={{ backgroundColor: 'rgba(59,130,246,0.18)', padding: 5, borderRadius: 8 }}>
                      <Timer size={13} color="#60a5fa" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text style={{ color: '#f4f4f5', fontSize: 11, fontWeight: '800' }}>Duration</Text>
                        <Text style={{ color: '#71717a', fontSize: 10 }}>{scoreData.durationQualityScore}/25</Text>
                      </View>
                      <Text style={{ color: '#71717a', fontSize: 9, marginTop: 1 }}>Session quality</Text>
                      <ProgressBar value={scoreData.durationQualityScore} max={25} color="#60a5fa" />
                    </View>
                  </View>
                </View>

                {/* Variety */}
                <View style={{
                  flex: 1, minWidth: '45%', backgroundColor: 'rgba(34,197,94,0.08)',
                  borderWidth: 1, borderColor: 'rgba(34,197,94,0.2)',
                  borderRadius: 14, padding: 12,
                }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}>
                    <View style={{ backgroundColor: 'rgba(34,197,94,0.18)', padding: 5, borderRadius: 8 }}>
                      <Puzzle size={13} color="#4ade80" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text style={{ color: '#f4f4f5', fontSize: 11, fontWeight: '800' }}>Variety</Text>
                        <Text style={{ color: '#71717a', fontSize: 10 }}>{scoreData.varietyScore}/20</Text>
                      </View>
                      <Text style={{ color: '#71717a', fontSize: 9, marginTop: 1 }}>Workout diversity</Text>
                      <ProgressBar value={scoreData.varietyScore} max={20} color="#4ade80" />
                    </View>
                  </View>
                </View>

                {/* Momentum */}
                <View style={{
                  flex: 1, minWidth: '45%', backgroundColor: 'rgba(249,115,22,0.08)',
                  borderWidth: 1, borderColor: 'rgba(249,115,22,0.2)',
                  borderRadius: 14, padding: 12,
                }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}>
                    <View style={{ backgroundColor: 'rgba(249,115,22,0.18)', padding: 5, borderRadius: 8 }}>
                      <Flame size={13} color="#fb923c" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text style={{ color: '#f4f4f5', fontSize: 11, fontWeight: '800' }}>Momentum</Text>
                        <Text style={{ color: '#71717a', fontSize: 10 }}>{scoreData.momentumScore}/10</Text>
                      </View>
                      <Text style={{ color: '#71717a', fontSize: 9, marginTop: 1 }}>Streak bonus</Text>
                      <ProgressBar value={scoreData.momentumScore} max={10} color="#fb923c" />
                    </View>
                  </View>
                </View>
              </View>

              {/* ── Footer quote ── */}
              <View style={{
                marginHorizontal: 16,
                padding: 14, borderRadius: 14,
                backgroundColor: 'rgba(9,9,11,0.7)',
                borderWidth: 1, borderColor: '#27272a',
              }}>
                <Text style={{ color: '#71717a', fontSize: 11, fontStyle: 'italic', lineHeight: 16 }}>
                  {scoreData.evaluationText || 'No gym attendance recorded yet.'}
                </Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
}

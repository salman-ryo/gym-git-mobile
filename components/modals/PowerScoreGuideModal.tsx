'use client';

import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView, Image } from 'react-native';
import { Zap, X, Activity, Swords } from 'lucide-react-native';
import { animePowerLevels } from '@/assets/anime';
import { AnimePower } from '@/lib/types';
import { LinearGradient } from 'expo-linear-gradient';

interface PowerScoreGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const getTierColor = (score: number) => {
  if (score < 35) return '#22d3ee'; // cyan-400
  if (score < 55) return '#34d399'; // emerald-400
  if (score < 72) return '#818cf8'; // indigo-400
  if (score < 88) return '#c084fc'; // purple-400
  if (score < 97) return '#fb7185'; // rose-400
  return '#fbbf24'; // amber-400
};

export default function PowerScoreGuideModal({ isOpen, onClose }: PowerScoreGuideModalProps) {
  const [selectedChar, setSelectedChar] = useState<AnimePower | null>(null);

  if (!isOpen) return null;

  return (
    <Modal visible={isOpen} transparent animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', padding: 16 }}>
        <LinearGradient
          colors={['#09090b', '#18181b']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ borderRadius: 28, padding: 20, borderWidth: 1, borderColor: 'rgba(129, 140, 248, 0.3)', maxHeight: '90%' }}
        >
          {/* Sticky Header */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#27272a' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Zap size={20} color="#fbbf24" style={{ shadowColor: '#fbbf24', shadowOpacity: 0.5, shadowRadius: 8 }} />
              <View>
                <Text style={{ color: '#818cf8', fontSize: 13, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1 }}>
                  Progression &amp; Scoring
                </Text>
                <Text style={{ color: '#71717a', fontSize: 9, fontWeight: '700', textTransform: 'uppercase' }}>
                  100 Pts Max • Quality &gt; Junk Volume
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={{ padding: 4 }}>
              <X size={20} color="#a1a1aa" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={{ gap: 20 }}>
              
              {/* LEFT SIDE: Progression Roadmap */}
              <View style={{ backgroundColor: 'rgba(9,9,11,0.5)', borderWidth: 1, borderColor: '#27272a', borderRadius: 20, padding: 12 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Activity size={14} color="#818cf8" />
                    <Text style={{ color: '#f4f4f5', fontSize: 11, fontWeight: '800', textTransform: 'uppercase' }}>
                      Power Path
                    </Text>
                  </View>
                  <Text style={{ color: '#71717a', fontSize: 9, fontWeight: '600' }}>
                    Scroll Right • Tap portraits
                  </Text>
                </View>

                {/* Horizontal Roadmap Scroll view */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ height: 260, backgroundColor: '#09090b', borderRadius: 12, borderWidth: 1, borderColor: '#18181b' }}>
                  <View style={{ width: 1100, height: '100%', position: 'relative' }}>
                    
                    {/* The Path Gradient Line */}
                    <View style={{ position: 'absolute', top: '50%', left: 32, right: 32, height: 4, backgroundColor: '#27272a', borderRadius: 2, transform: [{ translateY: -2 }] }}>
                      <LinearGradient
                        colors={['#22d3ee', '#818cf8', '#fbbf24']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={{ width: '100%', height: '100%', borderRadius: 2 }}
                      />
                    </View>

                    {/* Nodes */}
                    {animePowerLevels.map((char, index) => {
                      const isTop = index % 2 === 0;
                      const mappedPosition = 30 + (char.power * 10);
                      const activeColor = getTierColor(char.power);
                      const isSelected = selectedChar?.id === char.id;

                      return (
                        <TouchableOpacity
                          key={char.id}
                          onPress={() => setSelectedChar(char as AnimePower)}
                          style={{
                            position: 'absolute',
                            left: mappedPosition,
                            top: isTop ? '12%' : '48%',
                            width: 70,
                            alignItems: 'center',
                          }}
                        >
                          {isTop ? (
                            <View style={{ alignItems: 'center' }}>
                              <View style={{ backgroundColor: '#09090b', borderWidth: 1, borderColor: isSelected ? '#ffffff' : 'rgba(129,140,248,0.3)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, marginBottom: 4 }}>
                                <Text style={{ fontSize: 9, fontWeight: '900', color: '#818cf8' }}>{char.power}+</Text>
                              </View>
                              <View style={{ width: 44, height: 44, borderRadius: 22, overflow: 'hidden', borderWidth: isSelected ? 2.5 : 1.5, borderColor: isSelected ? '#ffffff' : activeColor, shadowColor: activeColor, shadowOpacity: isSelected ? 0.8 : 0.2, shadowRadius: 6 }}>
                                <Image source={char.image} style={{ width: '100%', height: '100%', resizeMode: 'contain' }} />
                              </View>
                              <Text numberOfLines={1} style={{ fontSize: 8, fontWeight: '800', color: '#f4f4f5', marginTop: 4, width: '100%', textAlign: 'center' }}>
                                {char.name}
                              </Text>

                              {/* Connectors */}
                              <View style={{ width: 1, height: 20, backgroundColor: '#27272a', marginTop: 2 }} />
                              <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#52525b', borderWidth: 1, borderColor: '#09090b', marginTop: -3 }} />
                            </View>
                          ) : (
                            <View style={{ alignItems: 'center' }}>
                              {/* Connectors */}
                              <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#52525b', borderWidth: 1, borderColor: '#09090b', marginBottom: -3, zIndex: 5 }} />
                              <View style={{ width: 1, height: 20, backgroundColor: '#27272a', marginBottom: 2 }} />

                              <Text numberOfLines={1} style={{ fontSize: 8, fontWeight: '800', color: '#f4f4f5', marginBottom: 4, width: '100%', textAlign: 'center' }}>
                                {char.name}
                              </Text>
                              <View style={{ width: 44, height: 44, borderRadius: 22, overflow: 'hidden', borderWidth: isSelected ? 2.5 : 1.5, borderColor: isSelected ? '#ffffff' : activeColor, shadowColor: activeColor, shadowOpacity: isSelected ? 0.8 : 0.2, shadowRadius: 6 }}>
                                <Image source={char.image} style={{ width: '100%', height: '100%', resizeMode: 'contain' }} />
                              </View>
                              <View style={{ backgroundColor: '#09090b', borderWidth: 1, borderColor: isSelected ? '#ffffff' : 'rgba(129,140,248,0.3)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, marginTop: 4 }}>
                                <Text style={{ fontSize: 9, fontWeight: '900', color: '#818cf8' }}>{char.power}+</Text>
                              </View>
                            </View>
                          )}
                        </TouchableOpacity>
                      );
                    })}

                  </View>
                </ScrollView>

                {/* Character Detail Display Box */}
                <View style={{ marginTop: 10, minHeight: 60, padding: 10, borderRadius: 12, backgroundColor: '#09090b', borderWidth: 1, borderColor: '#18181b', justifyContent: 'center' }}>
                  {selectedChar ? (
                    <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                      <Image source={selectedChar.image} style={{ width: 34, height: 34, resizeMode: 'contain' }} />
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 11, fontWeight: '900', color: '#818cf8', textTransform: 'uppercase' }}>
                          {selectedChar.name} (Tier: {selectedChar.power}+)
                        </Text>
                        <Text style={{ fontSize: 9.5, color: '#d4d4d8', marginTop: 2, lineHeight: 13, fontWeight: '500' }}>
                          {selectedChar.description}
                        </Text>
                      </View>
                    </View>
                  ) : (
                    <Text style={{ color: '#71717a', fontSize: 10, fontWeight: '600', textAlign: 'center' }}>
                      Tap a character portrait above to unlock lore details.
                    </Text>
                  )}
                </View>
              </View>

              {/* RIGHT SIDE: Scoring metrics */}
              <View style={{ gap: 10 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                  <Swords size={14} color="#71717a" />
                  <Text style={{ color: '#f4f4f5', fontSize: 11, fontWeight: '800', textTransform: 'uppercase' }}>
                    Scoring Metrics
                  </Text>
                </View>

                <View style={{ gap: 8 }}>
                  <View style={{ backgroundColor: 'rgba(9,9,11,0.5)', borderWidth: 1, borderColor: '#27272a', padding: 12, borderRadius: 16 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                      <Text style={{ color: '#818cf8', fontSize: 11, fontWeight: '900' }}>🎯 Consistency</Text>
                      <Text style={{ color: '#52525b', fontSize: 11, fontWeight: '900' }}>45%</Text>
                    </View>
                    <Text style={{ color: '#a1a1aa', fontSize: 9.5, lineHeight: 13, fontWeight: '500' }}>
                      Days hit vs target frequency. 5 days @ 45m beats 1 day @ 4h.
                    </Text>
                  </View>

                  <View style={{ backgroundColor: 'rgba(9,9,11,0.5)', borderWidth: 1, borderColor: '#27272a', padding: 12, borderRadius: 16 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                      <Text style={{ color: '#22d3ee', fontSize: 11, fontWeight: '900' }}>⏱️ Optimal Length</Text>
                      <Text style={{ color: '#52525b', fontSize: 11, fontWeight: '900' }}>25%</Text>
                    </View>
                    <Text style={{ color: '#a1a1aa', fontSize: 9.5, lineHeight: 13, fontWeight: '500' }}>
                      45m - 90m sweet spot gets 100%. Overlong binge days (&gt;3h) diminish returns.
                    </Text>
                  </View>

                  <View style={{ backgroundColor: 'rgba(9,9,11,0.5)', borderWidth: 1, borderColor: '#27272a', padding: 12, borderRadius: 16 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                      <Text style={{ color: '#fbbf24', fontSize: 11, fontWeight: '900' }}>🧩 Split Variety</Text>
                      <Text style={{ color: '#52525b', fontSize: 11, fontWeight: '900' }}>20%</Text>
                    </View>
                    <Text style={{ color: '#a1a1aa', fontSize: 9.5, lineHeight: 13, fontWeight: '500' }}>
                      Rewards training 3+ distinct workout types (Push, Pull, Legs, etc.) to ensure balanced training.
                    </Text>
                  </View>

                  <View style={{ backgroundColor: 'rgba(9,9,11,0.5)', borderWidth: 1, borderColor: '#27272a', padding: 12, borderRadius: 16 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                      <Text style={{ color: '#fb7185', fontSize: 11, fontWeight: '900' }}>🔥 Momentum</Text>
                      <Text style={{ color: '#52525b', fontSize: 11, fontWeight: '900' }}>10%</Text>
                    </View>
                    <Text style={{ color: '#a1a1aa', fontSize: 9.5, lineHeight: 13, fontWeight: '500' }}>
                      Active habit sequences &amp; steady weekly attendance multipliers.
                    </Text>
                  </View>
                </View>
              </View>

            </View>
          </ScrollView>
        </LinearGradient>
      </View>
    </Modal>
  );
}

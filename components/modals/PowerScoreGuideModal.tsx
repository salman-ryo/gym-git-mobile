'use client';

import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView, Image } from 'react-native';
import { Zap, X, Activity, Swords } from 'lucide-react-native';
import { animePowerLevels } from '@/assets/anime';
import { AnimePower } from '@/lib/types';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/Colors';

interface PowerScoreGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const getTierColor = (score: number) => {
  if (score < 35) return '#22d3ee'; // cyan-400 (Aqua, Mumen Rider, Tanjiro)
  if (score < 55) return Colors.brandPrimary; // emerald-400 (Asta, Deku)
  if (score < 75) return '#818cf8'; // indigo-400 (Levi, Zoro)
  if (score < 90) return Colors.cards.compliance.border; // purple-400 (Gojo, Naruto)
  if (score < 97) return '#fb7185'; // rose-400 (Luffy)
  return Colors.cards.streak.border; // amber-400 (Goku)
};

export default function PowerScoreGuideModal({ isOpen, onClose }: PowerScoreGuideModalProps) {
  const [selectedChar, setSelectedChar] = useState<AnimePower | null>(null);

  if (!isOpen) return null;

  return (
    <Modal visible={isOpen} transparent animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', padding: 16 }}>
        <LinearGradient
          colors={[Colors.dark.background, Colors.dark.card]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ borderRadius: 28, padding: 20, borderWidth: 1, borderColor: Colors.dark.border, maxHeight: '90%' }}
        >
          {/* Sticky Header */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: Colors.dark.border }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Zap size={20} color={Colors.cards.streak.border} style={{ shadowColor: Colors.cards.streak.border, shadowOpacity: 0.5, shadowRadius: 8 }} />
              <View>
                <Text style={{ color: Colors.brandPrimary, fontSize: 13, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1 }}>
                  Progression &amp; Scoring
                </Text>
                <Text style={{ color: Colors.dark.mutedForeground, fontSize: 9, fontWeight: '700', textTransform: 'uppercase' }}>
                  100 Pts Max • Quality &gt; Junk Volume
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={{ padding: 4 }}>
              <X size={20} color={Colors.dark.mutedForeground} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={{ gap: 20 }}>
              
              {/* LEFT SIDE: Progression Roadmap */}
              <View style={{ backgroundColor: 'rgba(10,10,10,0.5)', borderWidth: 1, borderColor: Colors.dark.border, borderRadius: 20, padding: 12 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Activity size={14} color={Colors.brandPrimary} />
                    <Text style={{ color: Colors.dark.foreground, fontSize: 11, fontWeight: '800', textTransform: 'uppercase' }}>
                      Power Path
                    </Text>
                  </View>
                  <Text style={{ color: Colors.dark.mutedForeground, fontSize: 9, fontWeight: '600' }}>
                    Scroll Right • Tap portraits
                  </Text>
                </View>

                {/* Horizontal Roadmap Scroll view */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ height: 260, backgroundColor: Colors.dark.background, borderRadius: 12, borderWidth: 1, borderColor: Colors.dark.border }}>
                  <View style={{ width: 1100, height: '100%', position: 'relative' }}>
                    
                    {/* The Path Gradient Line */}
                    <View style={{ position: 'absolute', top: '50%', left: 32, right: 32, height: 4, backgroundColor: Colors.dark.border, borderRadius: 2, transform: [{ translateY: -2 }] }}>
                      <LinearGradient
                        colors={['#22d3ee', Colors.brandPrimary, Colors.cards.compliance.border, Colors.cards.streak.border]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={{ width: '100%', height: '100%', borderRadius: 2 }}
                      />
                    </View>

                    {/* Nodes */}
                    {animePowerLevels.map((char, index) => {
                      const isTop = index % 2 === 0;
                      const mappedPosition = 30 + (char.minPower * 10);
                      const activeColor = getTierColor(char.minPower);
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
                              <View style={{ backgroundColor: Colors.dark.background, borderWidth: 1, borderColor: isSelected ? Colors.dark.foreground : Colors.dark.border, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, marginBottom: 4 }}>
                                <Text style={{ fontSize: 9, fontWeight: '900', color: Colors.brandPrimary }}>{char.minPower}+</Text>
                              </View>
                              <View style={{ width: 44, height: 44, borderRadius: 22, overflow: 'hidden', borderWidth: isSelected ? 2.5 : 1.5, borderColor: isSelected ? Colors.dark.foreground : activeColor, shadowColor: activeColor, shadowOpacity: isSelected ? 0.8 : 0.2, shadowRadius: 6 }}>
                                <Image source={char.image} style={{ width: '100%', height: '100%', resizeMode: 'contain' }} />
                              </View>
                              <Text numberOfLines={1} style={{ fontSize: 8, fontWeight: '800', color: Colors.dark.foreground, marginTop: 4, width: '100%', textAlign: 'center' }}>
                                {char.name}
                              </Text>

                              {/* Connectors */}
                              <View style={{ width: 1, height: 20, backgroundColor: Colors.dark.border, marginTop: 2 }} />
                              <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.dark.muted, borderWidth: 1, borderColor: Colors.dark.background, marginTop: -3 }} />
                            </View>
                          ) : (
                            <View style={{ alignItems: 'center' }}>
                              {/* Connectors */}
                              <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.dark.muted, borderWidth: 1, borderColor: Colors.dark.background, marginBottom: -3, zIndex: 5 }} />
                              <View style={{ width: 1, height: 20, backgroundColor: Colors.dark.border, marginBottom: 2 }} />

                              <Text numberOfLines={1} style={{ fontSize: 8, fontWeight: '800', color: Colors.dark.foreground, marginBottom: 4, width: '100%', textAlign: 'center' }}>
                                {char.name}
                              </Text>
                              <View style={{ width: 44, height: 44, borderRadius: 22, overflow: 'hidden', borderWidth: isSelected ? 2.5 : 1.5, borderColor: isSelected ? Colors.dark.foreground : activeColor, shadowColor: activeColor, shadowOpacity: isSelected ? 0.8 : 0.2, shadowRadius: 6 }}>
                                <Image source={char.image} style={{ width: '100%', height: '100%', resizeMode: 'contain' }} />
                              </View>
                              <View style={{ backgroundColor: Colors.dark.background, borderWidth: 1, borderColor: isSelected ? Colors.dark.foreground : Colors.dark.border, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, marginTop: 4 }}>
                                <Text style={{ fontSize: 9, fontWeight: '900', color: Colors.brandPrimary }}>{char.minPower}+</Text>
                              </View>
                            </View>
                          )}
                        </TouchableOpacity>
                      );
                    })}

                  </View>
                </ScrollView>

                {/* Character Detail Display Box */}
                <View style={{ marginTop: 10, minHeight: 60, padding: 10, borderRadius: 12, backgroundColor: Colors.dark.background, borderWidth: 1, borderColor: Colors.dark.border, justifyContent: 'center' }}>
                  {selectedChar ? (
                    <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                      <Image source={selectedChar.image} style={{ width: 34, height: 34, resizeMode: 'contain' }} />
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 11, fontWeight: '900', color: Colors.brandPrimary, textTransform: 'uppercase' }}>
                          {selectedChar.name} (Tier: {selectedChar.minPower}+)
                        </Text>
                        <Text style={{ fontSize: 9.5, color: Colors.dark.mutedForeground, marginTop: 2, lineHeight: 13, fontWeight: '500' }}>
                          {selectedChar.description}
                        </Text>
                      </View>
                    </View>
                  ) : (
                    <Text style={{ color: Colors.dark.mutedForeground, fontSize: 10, fontWeight: '600', textAlign: 'center' }}>
                      Tap a character portrait above to unlock lore details.
                    </Text>
                  )}
                </View>
              </View>

              {/* RIGHT SIDE: Scoring metrics */}
              <View style={{ gap: 10 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                  <Swords size={14} color={Colors.dark.mutedForeground} />
                  <Text style={{ color: Colors.dark.foreground, fontSize: 11, fontWeight: '800', textTransform: 'uppercase' }}>
                    Scoring Metrics
                  </Text>
                </View>

                <View style={{ gap: 8 }}>
                  <View style={{ backgroundColor: 'rgba(10,10,10,0.5)', borderWidth: 1, borderColor: Colors.dark.border, padding: 12, borderRadius: 16 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                      <Text style={{ color: Colors.cards.compliance.text, fontSize: 11, fontWeight: '900' }}>🎯 Consistency</Text>
                      <Text style={{ color: Colors.dark.mutedForeground, fontSize: 11, fontWeight: '900' }}>45%</Text>
                    </View>
                    <Text style={{ color: Colors.dark.mutedForeground, fontSize: 9.5, lineHeight: 13, fontWeight: '500' }}>
                      Days hit vs target frequency. 5 days @ 45m beats 1 day @ 4h.
                    </Text>
                  </View>

                  <View style={{ backgroundColor: 'rgba(10,10,10,0.5)', borderWidth: 1, borderColor: Colors.dark.border, padding: 12, borderRadius: 16 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                      <Text style={{ color: Colors.cards.hours.text, fontSize: 11, fontWeight: '900' }}>⏱️ Optimal Length</Text>
                      <Text style={{ color: Colors.dark.mutedForeground, fontSize: 11, fontWeight: '900' }}>25%</Text>
                    </View>
                    <Text style={{ color: Colors.dark.mutedForeground, fontSize: 9.5, lineHeight: 13, fontWeight: '500' }}>
                      45m - 90m sweet spot gets 100%. Overlong binge days (&gt;3h) diminish returns.
                    </Text>
                  </View>

                  <View style={{ backgroundColor: 'rgba(10,10,10,0.5)', borderWidth: 1, borderColor: Colors.dark.border, padding: 12, borderRadius: 16 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                      <Text style={{ color: Colors.cards.streak.text, fontSize: 11, fontWeight: '900' }}>🧩 Split Variety</Text>
                      <Text style={{ color: Colors.dark.mutedForeground, fontSize: 11, fontWeight: '900' }}>20%</Text>
                    </View>
                    <Text style={{ color: Colors.dark.mutedForeground, fontSize: 9.5, lineHeight: 13, fontWeight: '500' }}>
                      Rewards training 3+ distinct workout types (Push, Pull, Legs, etc.) to ensure balanced training.
                    </Text>
                  </View>

                  <View style={{ backgroundColor: 'rgba(10,10,10,0.5)', borderWidth: 1, borderColor: Colors.dark.border, padding: 12, borderRadius: 16 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                      <Text style={{ color: Colors.dark.destructive, fontSize: 11, fontWeight: '900' }}>🔥 Momentum</Text>
                      <Text style={{ color: Colors.dark.mutedForeground, fontSize: 11, fontWeight: '900' }}>10%</Text>
                    </View>
                    <Text style={{ color: Colors.dark.mutedForeground, fontSize: 9.5, lineHeight: 13, fontWeight: '500' }}>
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

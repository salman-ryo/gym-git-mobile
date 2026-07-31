import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { PREBUILT_PLANS, WeeklyPlan } from '@/lib/types';
import { Settings2, Check, X, Plus } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/Colors';

interface WeeklyPlanModalProps {
  isOpen: boolean;
  currentPlan?: WeeklyPlan;
  onSavePlan: (plan: WeeklyPlan) => Promise<void>;
  onClose?: () => void;
  preventClose?: boolean;
}

export default function WeeklyPlanModal({ isOpen, currentPlan, onSavePlan, onClose, preventClose }: WeeklyPlanModalProps) {
  const [selectedPlanId, setSelectedPlanId] = useState<string>(currentPlan?.id || 'ppl-standard');
  const [customName, setCustomName] = useState<string>(currentPlan?.id === 'custom-plan' ? currentPlan.name : 'My Custom Split');
  const [customCats, setCustomCats] = useState<string[]>(currentPlan?.id === 'custom-plan' ? currentPlan.categories : ['Chest', 'Back', 'Legs', 'Cardio']);
  const [newTagInput, setNewTagInput] = useState('');

  if (!isOpen) return null;

  const handleAddCustomTag = () => {
    if (newTagInput.trim() && !customCats.includes(newTagInput.trim())) {
      setCustomCats([...customCats, newTagInput.trim()]);
      setNewTagInput('');
    }
  };

  const handleRemoveCustomTag = (tag: string) => {
    setCustomCats(customCats.filter((c) => c !== tag));
  };

  const handleSave = async () => {
    if (selectedPlanId === 'custom-plan') {
      const plan: WeeklyPlan = {
        id: 'custom-plan',
        name: customName || 'Custom Split',
        description: 'Personalized user workout categories',
        categories: customCats.length > 0 ? customCats : ['Workout', 'Cardio'],
      };
      await onSavePlan(plan);
    } else {
      const prebuilt = PREBUILT_PLANS.find((p) => p.id === selectedPlanId) || PREBUILT_PLANS[0];
      await onSavePlan(prebuilt);
    }
  };

  return (
    <Modal visible={isOpen} transparent animationType="slide">
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', padding: 20 }}>
        <LinearGradient
          colors={[Colors.dark.card, Colors.dark.background]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ borderRadius: 28, padding: 24, borderWidth: 1, borderColor: Colors.dark.border, maxHeight: '85%' }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Settings2 size={20} color={Colors.brandPrimary} />
              <Text style={{ color: Colors.dark.foreground, fontSize: 18, fontWeight: '800' }}>Choose Workout Split</Text>
            </View>
            {onClose && !preventClose && (
              <TouchableOpacity onPress={onClose}>
                <X size={20} color={Colors.dark.mutedForeground} />
              </TouchableOpacity>
            )}
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Prebuilt Plans */}
            {PREBUILT_PLANS.map((plan) => {
              const isSelected = selectedPlanId === plan.id;
              return (
                <TouchableOpacity
                  key={plan.id}
                  onPress={() => setSelectedPlanId(plan.id)}
                  style={{
                    backgroundColor: isSelected ? 'rgba(52, 211, 153, 0.08)' : Colors.dark.background,
                    padding: 14,
                    borderRadius: 16,
                    marginBottom: 10,
                    borderWidth: 1,
                    borderColor: isSelected ? Colors.brandPrimary : Colors.dark.border,
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                    <Text style={{ color: Colors.dark.foreground, fontWeight: '800', fontSize: 14 }}>{plan.name}</Text>
                    {isSelected && <Check size={16} color={Colors.brandPrimary} />}
                  </View>
                  <Text style={{ color: Colors.dark.mutedForeground, fontSize: 11, marginBottom: 8 }}>{plan.description}</Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4 }}>
                    {plan.categories.map((c) => (
                      <View key={c} style={{ backgroundColor: Colors.dark.secondary, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 }}>
                        <Text style={{ color: Colors.brandPrimary, fontSize: 10, fontWeight: '600' }}>{c}</Text>
                      </View>
                    ))}
                  </View>
                </TouchableOpacity>
              );
            })}

            {/* Custom Plan Option */}
            <TouchableOpacity
              onPress={() => setSelectedPlanId('custom-plan')}
              style={{
                backgroundColor: selectedPlanId === 'custom-plan' ? 'rgba(52, 211, 153, 0.08)' : Colors.dark.background,
                padding: 14,
                borderRadius: 16,
                marginBottom: 10,
                borderWidth: 1,
                borderColor: selectedPlanId === 'custom-plan' ? Colors.brandPrimary : Colors.dark.border,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4, justifyContent: 'space-between' }}>
                <Text style={{ color: Colors.dark.foreground, fontWeight: '800', fontSize: 14 }}>Custom Workout Split</Text>
                {selectedPlanId === 'custom-plan' && <Check size={16} color={Colors.brandPrimary} />}
              </View>
              <Text style={{ color: Colors.dark.mutedForeground, fontSize: 11 }}>Define your own workout categories and tags.</Text>
            </TouchableOpacity>

            {selectedPlanId === 'custom-plan' && (
              <View style={{ backgroundColor: Colors.dark.background, padding: 12, borderRadius: 12, marginBottom: 14, borderWidth: 1, borderColor: Colors.dark.border }}>
                <Text style={{ color: Colors.dark.foreground, fontSize: 11, fontWeight: '600', marginBottom: 6 }}>Plan Name</Text>
                <TextInput
                  value={customName}
                  onChangeText={setCustomName}
                  placeholder="Custom Split"
                  placeholderTextColor={Colors.dark.mutedForeground}
                  style={{ backgroundColor: Colors.dark.card, color: Colors.dark.foreground, borderRadius: 8, padding: 8, fontSize: 12, marginBottom: 10, borderWidth: 1, borderColor: Colors.dark.border }}
                />

                <Text style={{ color: Colors.dark.foreground, fontSize: 11, fontWeight: '600', marginBottom: 6 }}>Categories</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginBottom: 10 }}>
                  {customCats.map((cat) => (
                    <View key={cat} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.dark.secondary, paddingLeft: 8, paddingRight: 4, paddingVertical: 4, borderRadius: 6, gap: 4 }}>
                      <Text style={{ color: Colors.brandPrimary, fontSize: 11, fontWeight: '600' }}>{cat}</Text>
                      <TouchableOpacity onPress={() => handleRemoveCustomTag(cat)}>
                        <X size={12} color="#ef4444" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>

                <View style={{ flexDirection: 'row', gap: 6 }}>
                  <TextInput
                    value={newTagInput}
                    onChangeText={setNewTagInput}
                    placeholder="Add category tag..."
                    placeholderTextColor={Colors.dark.mutedForeground}
                    style={{ flex: 1, backgroundColor: Colors.dark.card, color: Colors.dark.foreground, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, fontSize: 12, borderWidth: 1, borderColor: Colors.dark.border }}
                  />
                  <TouchableOpacity onPress={handleAddCustomTag} style={{ backgroundColor: Colors.brandPrimary, paddingHorizontal: 12, borderRadius: 8, justifyContent: 'center' }}>
                    <Plus size={16} color={Colors.dark.primaryForeground} />
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </ScrollView>

          <TouchableOpacity onPress={handleSave} style={{ borderRadius: 14, overflow: 'hidden', marginTop: 12 }}>
            <LinearGradient colors={[Colors.brandPrimary, Colors.brandSecondary]} style={{ paddingVertical: 14, alignItems: 'center' }}>
              <Text style={{ color: Colors.dark.primaryForeground, fontWeight: '800', fontSize: 15 }}>Activate Selected Plan</Text>
            </LinearGradient>
          </TouchableOpacity>
        </LinearGradient>
      </View>
    </Modal>
  );
}

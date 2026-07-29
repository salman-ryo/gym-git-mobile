import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { PREBUILT_PLANS, WeeklyPlan } from '@/lib/types';
import { Settings2, Check, X, Plus } from 'lucide-react-native';

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
        <View style={{ backgroundColor: '#18181b', borderRadius: 24, padding: 24, borderWidth: 1, borderColor: '#27272a', maxHeight: '85%' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Settings2 size={20} color="#10b981" />
              <Text style={{ color: '#f4f4f5', fontSize: 18, fontWeight: '800' }}>Choose Workout Split</Text>
            </View>
            {onClose && !preventClose && (
              <TouchableOpacity onPress={onClose}>
                <X size={20} color="#a1a1aa" />
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
                    backgroundColor: isSelected ? 'rgba(16,185,129,0.1)' : '#09090b',
                    padding: 14,
                    borderRadius: 14,
                    marginBottom: 10,
                    borderWidth: 1,
                    borderColor: isSelected ? '#10b981' : '#27272a',
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                    <Text style={{ color: '#f4f4f5', fontWeight: '800', fontSize: 14 }}>{plan.name}</Text>
                    {isSelected && <Check size={16} color="#10b981" />}
                  </View>
                  <Text style={{ color: '#a1a1aa', fontSize: 11, marginBottom: 8 }}>{plan.description}</Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4 }}>
                    {plan.categories.map((c) => (
                      <View key={c} style={{ backgroundColor: '#27272a', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 }}>
                        <Text style={{ color: '#10b981', fontSize: 10, fontWeight: '600' }}>{c}</Text>
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
                backgroundColor: selectedPlanId === 'custom-plan' ? 'rgba(16,185,129,0.1)' : '#09090b',
                padding: 14,
                borderRadius: 14,
                marginBottom: 10,
                borderWidth: 1,
                borderColor: selectedPlanId === 'custom-plan' ? '#10b981' : '#27272a',
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                <Text style={{ color: '#f4f4f5', fontWeight: '800', fontSize: 14 }}>Custom Workout Split</Text>
                {selectedPlanId === 'custom-plan' && <Check size={16} color="#10b981" />}
              </View>
              <Text style={{ color: '#a1a1aa', fontSize: 11 }}>Define your own workout categories and tags.</Text>
            </TouchableOpacity>

            {selectedPlanId === 'custom-plan' && (
              <View style={{ backgroundColor: '#09090b', padding: 12, borderRadius: 12, marginBottom: 14, borderWidth: 1, borderColor: '#27272a' }}>
                <Text style={{ color: '#d4d4d8', fontSize: 11, fontWeight: '600', marginBottom: 6 }}>Plan Name</Text>
                <TextInput
                  value={customName}
                  onChangeText={setCustomName}
                  placeholder="Custom Split"
                  placeholderTextColor="#71717a"
                  style={{ backgroundColor: '#18181b', color: '#f4f4f5', borderRadius: 8, padding: 8, fontSize: 12, marginBottom: 10, borderWidth: 1, borderColor: '#27272a' }}
                />

                <Text style={{ color: '#d4d4d8', fontSize: 11, fontWeight: '600', marginBottom: 6 }}>Categories</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginBottom: 10 }}>
                  {customCats.map((cat) => (
                    <View key={cat} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#27272a', paddingLeft: 8, paddingRight: 4, paddingVertical: 4, borderRadius: 6, gap: 4 }}>
                      <Text style={{ color: '#10b981', fontSize: 11, fontWeight: '600' }}>{cat}</Text>
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
                    placeholderTextColor="#71717a"
                    style={{ flex: 1, backgroundColor: '#18181b', color: '#f4f4f5', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, fontSize: 12, borderWidth: 1, borderColor: '#27272a' }}
                  />
                  <TouchableOpacity onPress={handleAddCustomTag} style={{ backgroundColor: '#10b981', paddingHorizontal: 12, borderRadius: 8, justifyContent: 'center' }}>
                    <Plus size={16} color="#09090b" />
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </ScrollView>

          <TouchableOpacity onPress={handleSave} style={{ backgroundColor: '#10b981', paddingVertical: 14, borderRadius: 14, alignItems: 'center', marginTop: 12 }}>
            <Text style={{ color: '#09090b', fontWeight: '800', fontSize: 15 }}>Activate Selected Plan</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

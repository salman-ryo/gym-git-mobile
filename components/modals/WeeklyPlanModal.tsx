import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView, TextInput, StyleSheet } from 'react-native';
import { PREBUILT_PLANS, WeeklyPlan } from '@/lib/types';
import { Settings2, Check, X, Plus, Calendar, AlertCircle } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/Colors';
import { getThemeForWorkout } from '@/lib/theme-utils';
import * as Haptics from 'expo-haptics';

interface WeeklyPlanModalProps {
  isOpen: boolean;
  currentPlan?: WeeklyPlan;
  onSavePlan: (plan: WeeklyPlan) => Promise<void>;
  onClose?: () => void;
  preventClose?: boolean;
}

const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function WeeklyPlanModal({
  isOpen,
  currentPlan,
  onSavePlan,
  onClose,
  preventClose,
}: WeeklyPlanModalProps) {
  const [selectedPlanId, setSelectedPlanId] = useState<string>(currentPlan?.id || 'ppl-standard');
  const [customName, setCustomName] = useState<string>(currentPlan?.id === 'custom-plan' ? currentPlan.name : 'My Custom Split');
  const [customCats, setCustomCats] = useState<string[]>(
    currentPlan?.id === 'custom-plan'
      ? currentPlan.categories
      : ['Push', 'Pull', 'Legs', 'Core', 'Cardio']
  );
  const [customSchedule, setCustomSchedule] = useState<string[]>(
    currentPlan?.schedule || ['Push', 'Pull', 'Legs', 'Rest', 'Cardio', 'Rest', 'Rest']
  );
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

  const handleCycleDaySchedule = (dayIdx: number) => {
    const allOptions = [...customCats, 'Rest'];
    const current = customSchedule[dayIdx] || 'Rest';
    const currIdx = allOptions.indexOf(current);
    const nextIdx = (currIdx + 1) % allOptions.length;
    const updated = [...customSchedule];
    updated[dayIdx] = allOptions[nextIdx];
    setCustomSchedule(updated);
  };

  const handleSave = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (selectedPlanId === 'custom-plan') {
      const activeDays = customSchedule.filter((s) => s !== 'Rest').length;
      const plan: WeeklyPlan = {
        id: 'custom-plan',
        name: customName || 'Custom Split',
        description: 'Personalized 7-day schedule',
        categories: customCats.length > 0 ? customCats : ['Workout', 'Cardio'],
        daysPerWeek: activeDays,
        schedule: customSchedule,
      };
      await onSavePlan(plan);
    } else {
      const prebuilt = PREBUILT_PLANS.find((p) => p.id === selectedPlanId) || PREBUILT_PLANS[0];
      await onSavePlan(prebuilt);
    }
  };

  return (
    <Modal visible={isOpen} transparent animationType="slide">
      <View style={styles.overlay}>
        <LinearGradient
          colors={[Colors.dark.card, Colors.dark.background]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.modalCard}
        >
          <View style={styles.headerRow}>
            <View style={styles.headerTitleRow}>
              <Settings2 size={20} color={Colors.neonGreen} />
              <Text style={styles.headerTitleText}>CHOOSE WORKOUT SPLIT</Text>
            </View>
            {onClose && !preventClose && (
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <X size={18} color="#a1a1aa" />
              </TouchableOpacity>
            )}
          </View>

          {currentPlan && (
            <View style={styles.cycleNoticeBox}>
              <AlertCircle size={13} color={Colors.neonCyan} />
              <Text style={styles.cycleNoticeText}>
                Plan changes are queued for the start of your next 7-day cycle to maintain active cycle accuracy.
              </Text>
            </View>
          )}

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {/* Prebuilt Plans */}
            {PREBUILT_PLANS.map((plan) => {
              const isSelected = selectedPlanId === plan.id;
              const restDays = 7 - (plan.daysPerWeek || 4);

              return (
                <TouchableOpacity
                  key={plan.id}
                  onPress={() => setSelectedPlanId(plan.id)}
                  style={[
                    styles.planCard,
                    isSelected ? styles.planCardSelected : styles.planCardUnselected,
                  ]}
                >
                  <View style={styles.planCardHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.planName}>{plan.name}</Text>
                      <Text style={styles.planDaysBadge}>
                        {plan.daysPerWeek} Active Days • {restDays} Rest Tokens
                      </Text>
                    </View>
                    {isSelected && <Check size={18} color={Colors.neonGreen} />}
                  </View>

                  <Text style={styles.planDesc}>{plan.description}</Text>

                  {/* Category Chips */}
                  <View style={styles.categoriesRow}>
                    {plan.categories.map((c) => {
                      const theme = getThemeForWorkout(c, plan);
                      return (
                        <View key={c} style={[styles.categoryChip, { borderColor: theme.glow, backgroundColor: theme.bgLight }]}>
                          <Text style={[styles.categoryChipText, { color: theme.primary }]}>{c}</Text>
                        </View>
                      );
                    })}
                  </View>
                </TouchableOpacity>
              );
            })}

            {/* Custom Plan Option */}
            <TouchableOpacity
              onPress={() => setSelectedPlanId('custom-plan')}
              style={[
                styles.planCard,
                selectedPlanId === 'custom-plan' ? styles.planCardSelected : styles.planCardUnselected,
              ]}
            >
              <View style={styles.planCardHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.planName}>Custom Workout Split</Text>
                  <Text style={styles.planDaysBadge}>Build your own 7-Day schedule</Text>
                </View>
                {selectedPlanId === 'custom-plan' && <Check size={18} color={Colors.neonGreen} />}
              </View>
              <Text style={styles.planDesc}>Define custom categories and assign workouts Mon–Sun.</Text>
            </TouchableOpacity>

            {selectedPlanId === 'custom-plan' && (
              <View style={styles.customBuilderCard}>
                <Text style={styles.builderLabel}>Plan Name</Text>
                <TextInput
                  value={customName}
                  onChangeText={setCustomName}
                  placeholder="Custom Split"
                  placeholderTextColor="#71717a"
                  style={styles.textInput}
                />

                <Text style={styles.builderLabel}>Workout Categories</Text>
                <View style={styles.categoriesRow}>
                  {customCats.map((cat) => (
                    <View key={cat} style={styles.customCatChip}>
                      <Text style={styles.customCatText}>{cat}</Text>
                      <TouchableOpacity onPress={() => handleRemoveCustomTag(cat)}>
                        <X size={12} color="#ef4444" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>

                <View style={styles.addCategoryRow}>
                  <TextInput
                    value={newTagInput}
                    onChangeText={setNewTagInput}
                    placeholder="Add category tag..."
                    placeholderTextColor="#71717a"
                    style={[styles.textInput, { flex: 1, marginBottom: 0 }]}
                  />
                  <TouchableOpacity onPress={handleAddCustomTag} style={styles.addTagBtn}>
                    <Plus size={16} color="#060a0e" />
                  </TouchableOpacity>
                </View>

                {/* 7-Day Interactive Schedule Grid */}
                <Text style={[styles.builderLabel, { marginTop: 12 }]}>7-Day Schedule (Tap to toggle)</Text>
                <View style={styles.scheduleGrid}>
                  {DAYS_OF_WEEK.map((dayName, idx) => {
                    const assigned = customSchedule[idx] || 'Rest';
                    const isRest = assigned === 'Rest';

                    return (
                      <TouchableOpacity
                        key={dayName}
                        onPress={() => handleCycleDaySchedule(idx)}
                        style={[
                          styles.scheduleDayCell,
                          isRest ? styles.scheduleDayRest : styles.scheduleDayActive,
                        ]}
                      >
                        <Text style={styles.scheduleDayName}>{dayName}</Text>
                        <Text
                          style={[
                            styles.scheduleDayWorkout,
                            isRest ? { color: '#71717a' } : { color: Colors.neonGreen },
                          ]}
                          numberOfLines={1}
                        >
                          {assigned}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}
          </ScrollView>

          <TouchableOpacity onPress={handleSave} style={styles.activateBtn}>
            <LinearGradient colors={[Colors.brandPrimary, Colors.brandSecondary]} style={styles.activateGradient}>
              <Text style={styles.activateBtnText}>ACTIVATE SELECTED PLAN</Text>
            </LinearGradient>
          </TouchableOpacity>
        </LinearGradient>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.88)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    borderRadius: 28,
    padding: 22,
    borderWidth: 1,
    borderColor: '#1a2332',
    maxHeight: '85%',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitleText: {
    color: '#f4f4f5',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#121820',
    borderWidth: 1,
    borderColor: '#1f2937',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cycleNoticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(34, 211, 238, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(34, 211, 238, 0.25)',
    padding: 10,
    borderRadius: 12,
    marginBottom: 14,
  },
  cycleNoticeText: {
    fontSize: 10.5,
    color: '#d4d4d8',
    flex: 1,
    lineHeight: 14,
  },
  scrollContent: {
    gap: 10,
    paddingBottom: 10,
  },
  planCard: {
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  planCardSelected: {
    backgroundColor: 'rgba(0, 255, 136, 0.08)',
    borderColor: Colors.neonGreen,
  },
  planCardUnselected: {
    backgroundColor: '#090d13',
    borderColor: '#1a2332',
  },
  planCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  planName: {
    color: '#f4f4f5',
    fontWeight: '900',
    fontSize: 13,
  },
  planDaysBadge: {
    color: Colors.neonGreen,
    fontSize: 10,
    fontWeight: '700',
    marginTop: 2,
  },
  planDesc: {
    color: '#9ca3af',
    fontSize: 11,
    marginBottom: 8,
  },
  categoriesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  categoryChip: {
    backgroundColor: '#18181b',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#27272a',
  },
  categoryChipText: {
    color: Colors.neonGreen,
    fontSize: 9.5,
    fontWeight: '700',
  },
  customBuilderCard: {
    backgroundColor: '#090d13',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1a2332',
    gap: 8,
  },
  builderLabel: {
    color: '#a1a1aa',
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  textInput: {
    backgroundColor: '#18181b',
    color: '#ffffff',
    borderRadius: 10,
    padding: 10,
    fontSize: 12,
    borderWidth: 1,
    borderColor: '#27272a',
  },
  customCatChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#18181b',
    paddingLeft: 8,
    paddingRight: 6,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 6,
    borderWidth: 1,
    borderColor: '#27272a',
  },
  customCatText: {
    color: Colors.neonGreen,
    fontSize: 11,
    fontWeight: '700',
  },
  addCategoryRow: {
    flexDirection: 'row',
    gap: 6,
  },
  addTagBtn: {
    backgroundColor: Colors.neonGreen,
    paddingHorizontal: 14,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scheduleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  scheduleDayCell: {
    width: '31%',
    padding: 8,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
  },
  scheduleDayActive: {
    backgroundColor: 'rgba(0, 255, 136, 0.08)',
    borderColor: 'rgba(0, 255, 136, 0.3)',
  },
  scheduleDayRest: {
    backgroundColor: '#18181b',
    borderColor: '#27272a',
  },
  scheduleDayName: {
    fontSize: 9,
    fontWeight: '900',
    color: '#a1a1aa',
    textTransform: 'uppercase',
  },
  scheduleDayWorkout: {
    fontSize: 10,
    fontWeight: '800',
    marginTop: 2,
  },
  activateBtn: {
    borderRadius: 14,
    overflow: 'hidden',
    marginTop: 12,
  },
  activateGradient: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  activateBtnText: {
    color: '#060a0e',
    fontWeight: '900',
    fontSize: 13,
    letterSpacing: 0.8,
  },
});

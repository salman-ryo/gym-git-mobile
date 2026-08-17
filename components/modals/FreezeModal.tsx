import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { X, Snowflake, AlertCircle, ShieldAlert } from 'lucide-react-native';
import { freezeStreak } from '@/lib/streak-service';
import { Colors } from '@/constants/Colors';
import * as Haptics from 'expo-haptics';

interface FreezeModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableTokens: number;
  onSuccess: () => Promise<void>;
}

const PRESET_REASONS = [
  { id: 'sick', label: '🤒 Sickness / Flu recovery', defaultText: 'Flu/Sickness recovery' },
  { id: 'injury', label: '🤕 Muscle / Joint injury', defaultText: 'Injury/Rehab pause' },
  { id: 'travel', label: '✈️ Travel / No gym access', defaultText: 'Travel - No gym access' },
  { id: 'other', label: '⚙️ Other reason', defaultText: '' },
];

export default function FreezeModal({
  isOpen,
  onClose,
  availableTokens,
  onSuccess,
}: FreezeModalProps) {
  const maxDays = Math.min(7, Math.max(0, availableTokens));
  const [selectedDuration, setSelectedDuration] = useState<number>(maxDays > 0 ? 1 : 0);
  const [selectedReasonId, setSelectedReasonId] = useState<string>('sick');
  const [customReason, setCustomReason] = useState<string>('');
  const [saving, setSaving] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleActivate = async () => {
    if (selectedDuration <= 0) {
      setErrorMsg('Please select a valid duration.');
      return;
    }
    if (selectedDuration > availableTokens) {
      setErrorMsg("You don't have enough Streak Freeze Tokens.");
      return;
    }

    const matchedReason = PRESET_REASONS.find((r) => r.id === selectedReasonId);
    let finalReason = matchedReason?.defaultText || '';
    if (selectedReasonId === 'other') {
      if (!customReason.trim()) {
        setErrorMsg('Please specify your reason.');
        return;
      }
      finalReason = customReason.trim();
    } else if (customReason.trim()) {
      finalReason = `${matchedReason?.defaultText || ''}: ${customReason.trim()}`;
    }

    setSaving(true);
    setErrorMsg(null);
    try {
      await freezeStreak(selectedDuration, finalReason);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Failed to freeze streak:', err);
      setErrorMsg(err.message || 'Failed to activate Ice Pause. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={isOpen} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          {/* Close button */}
          <TouchableOpacity
            onPress={onClose}
            style={styles.closeButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <X size={16} color="#a1a1aa" />
          </TouchableOpacity>

          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={styles.headerRow}>
              <View style={styles.iconBox}>
                <Snowflake size={22} color={Colors.neonCyan} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalTitle}>SICKNESS FREEZE VAULT</Text>
                <Text style={styles.modalSubtitle}>
                  Activate Ice Pause to safeguard your current streak from decay while resting.
                </Text>
              </View>
            </View>

            {availableTokens <= 0 ? (
              <View style={styles.noTokensBox}>
                <ShieldAlert size={36} color="#71717a" />
                <Text style={styles.noTokensTitle}>NO FREEZE TOKENS AVAILABLE</Text>
                <Text style={styles.noTokensDesc}>
                  You do not have any Streak Freeze Tokens left. Complete milestones or claim roadmap rewards to earn tokens.
                </Text>
                <TouchableOpacity onPress={onClose} style={styles.secondaryButton}>
                  <Text style={styles.secondaryButtonText}>Close</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.formContainer}>
                {/* Error Banner */}
                {errorMsg && (
                  <View style={styles.errorBox}>
                    <AlertCircle size={14} color="#f87171" />
                    <Text style={styles.errorText}>{errorMsg}</Text>
                  </View>
                )}

                {/* Select Duration */}
                <View style={styles.fieldSection}>
                  <Text style={styles.fieldLabel}>FREEZE DURATION (DAYS):</Text>
                  <View style={styles.durationRow}>
                    {Array.from({ length: maxDays }).map((_, idx) => {
                      const day = idx + 1;
                      const isSelected = selectedDuration === day;
                      return (
                        <TouchableOpacity
                          key={day}
                          onPress={() => setSelectedDuration(day)}
                          style={[
                            styles.durationPill,
                            isSelected && styles.durationPillSelected,
                          ]}
                        >
                          <Text
                            style={[
                              styles.durationPillText,
                              isSelected && styles.durationPillTextSelected,
                            ]}
                          >
                            {day}d
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                  <Text style={styles.tokensNote}>
                    Available: <Text style={{ color: Colors.neonCyan, fontWeight: '800' }}>{availableTokens} tokens</Text>. (Max {maxDays} days).
                  </Text>
                </View>

                {/* Reason Selection */}
                <View style={styles.fieldSection}>
                  <Text style={styles.fieldLabel}>REASON FOR ICE PAUSE:</Text>
                  <View style={{ gap: 8 }}>
                    {PRESET_REASONS.map((reason) => {
                      const isSelected = selectedReasonId === reason.id;
                      return (
                        <TouchableOpacity
                          key={reason.id}
                          onPress={() => {
                            setSelectedReasonId(reason.id);
                            setErrorMsg(null);
                          }}
                          style={[
                            styles.reasonRow,
                            isSelected && styles.reasonRowSelected,
                          ]}
                        >
                          <Text
                            style={[
                              styles.reasonLabel,
                              isSelected && styles.reasonLabelSelected,
                            ]}
                          >
                            {reason.label}
                          </Text>
                          <View
                            style={[
                              styles.radioOuter,
                              isSelected && styles.radioOuterSelected,
                            ]}
                          >
                            {isSelected && <View style={styles.radioInner} />}
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                {/* Custom Reason / Notes Input */}
                <View style={styles.fieldSection}>
                  <Text style={styles.fieldLabel}>
                    {selectedReasonId === 'other' ? 'SPECIFY CUSTOM REASON:' : 'OPTIONAL NOTES:'}
                  </Text>
                  <TextInput
                    value={customReason}
                    onChangeText={setCustomReason}
                    placeholder={
                      selectedReasonId === 'other'
                        ? 'Describe your injury/sickness...'
                        : 'Write any specific recovery goals or symptoms (optional)...'
                    }
                    placeholderTextColor="#52525b"
                    multiline
                    numberOfLines={2}
                    style={styles.textInput}
                  />
                </View>

                {/* Summary Info Box */}
                <View style={styles.summaryBox}>
                  <Text style={styles.summaryLabel}>Streak Freeze Cost:</Text>
                  <Text style={styles.summaryValue}>
                    {selectedDuration} Token{selectedDuration > 1 ? 's' : ''}
                  </Text>
                </View>

                {/* Action button */}
                <TouchableOpacity
                  onPress={handleActivate}
                  disabled={saving}
                  style={styles.actionButton}
                >
                  {saving ? (
                    <ActivityIndicator size="small" color="#060a0e" />
                  ) : (
                    <View style={styles.actionButtonContent}>
                      <Snowflake size={16} color="#060a0e" />
                      <Text style={styles.actionButtonText}>ACTIVATE ICE PAUSE</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    width: '100%',
    maxWidth: 480,
    backgroundColor: '#080c10',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(34, 211, 238, 0.25)',
    maxHeight: '90%',
    overflow: 'hidden',
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#121820',
    borderWidth: 1,
    borderColor: '#1f2937',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 24,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1a2332',
    marginBottom: 16,
    paddingRight: 32,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(34, 211, 238, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(34, 211, 238, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: Colors.neonCyan,
    letterSpacing: 0.8,
  },
  modalSubtitle: {
    fontSize: 11,
    color: '#9ca3af',
    marginTop: 2,
    lineHeight: 15,
  },
  noTokensBox: {
    padding: 24,
    borderRadius: 16,
    backgroundColor: 'rgba(18, 24, 32, 0.5)',
    borderWidth: 1,
    borderColor: '#1a2332',
    alignItems: 'center',
    textAlign: 'center',
    gap: 12,
  },
  noTokensTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: '#f4f4f5',
    letterSpacing: 0.5,
  },
  noTokensDesc: {
    fontSize: 11,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 16,
  },
  secondaryButton: {
    width: '100%',
    paddingVertical: 12,
    backgroundColor: '#121820',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1f2937',
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#e5e7eb',
    textTransform: 'uppercase',
  },
  formContainer: {
    gap: 16,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    padding: 10,
    borderRadius: 12,
  },
  errorText: {
    fontSize: 11,
    color: '#fca5a5',
    flex: 1,
  },
  fieldSection: {
    gap: 6,
  },
  fieldLabel: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#9ca3af',
    letterSpacing: 0.8,
  },
  durationRow: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  durationPill: {
    flex: 1,
    minWidth: 40,
    paddingVertical: 10,
    backgroundColor: 'rgba(18, 24, 32, 0.6)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1a2332',
    alignItems: 'center',
    justifyContent: 'center',
  },
  durationPillSelected: {
    backgroundColor: 'rgba(34, 211, 238, 0.15)',
    borderColor: Colors.neonCyan,
  },
  durationPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#9ca3af',
  },
  durationPillTextSelected: {
    color: Colors.neonCyan,
    fontWeight: '900',
  },
  tokensNote: {
    fontSize: 10,
    color: '#6b7280',
    marginTop: 2,
  },
  reasonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: 'rgba(18, 24, 32, 0.4)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1a2332',
  },
  reasonRowSelected: {
    borderColor: Colors.neonCyan,
    backgroundColor: 'rgba(34, 211, 238, 0.08)',
  },
  reasonLabel: {
    fontSize: 12,
    color: '#d1d5db',
    fontWeight: '600',
  },
  reasonLabelSelected: {
    color: Colors.neonCyan,
    fontWeight: '800',
  },
  radioOuter: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#4b5563',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterSelected: {
    borderColor: Colors.neonCyan,
  },
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.neonCyan,
  },
  textInput: {
    backgroundColor: 'rgba(18, 24, 32, 0.8)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1a2332',
    padding: 12,
    fontSize: 12,
    color: '#f9fafb',
    textAlignVertical: 'top',
    minHeight: 60,
  },
  summaryBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: 'rgba(18, 24, 32, 0.5)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1a2332',
  },
  summaryLabel: {
    fontSize: 11,
    color: '#9ca3af',
    fontWeight: '600',
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: '900',
    color: Colors.neonCyan,
  },
  actionButton: {
    backgroundColor: Colors.neonCyan,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  actionButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#060a0e',
    letterSpacing: 0.8,
  },
});

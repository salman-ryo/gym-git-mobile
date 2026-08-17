import React from 'react';
import { View, Text, Modal, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { PowerScoreBreakdown } from '@/lib/types';
import { Zap, Flame, Shield, Sparkles, Check } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/Colors';
import * as Haptics from 'expo-haptics';

interface PowerLevelCelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  powerScore: PowerScoreBreakdown | null;
}

export default function PowerLevelCelebrationModal({
  isOpen,
  onClose,
  powerScore,
}: PowerLevelCelebrationModalProps) {
  if (!isOpen || !powerScore) return null;

  const { totalScore, character, consistencyScore, durationQualityScore, varietyScore, momentumScore } = powerScore;

  const handleDismiss = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onClose();
  };

  return (
    <Modal visible={isOpen} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          {/* Top Ambient Glow */}
          <View style={styles.topGlowLine} />

          {/* Celebration Header */}
          <View style={styles.headerBadge}>
            <Sparkles size={14} color={Colors.neonGreen} />
            <Text style={styles.headerBadgeText}>POWER CALIBRATION COMPLETE</Text>
            <Sparkles size={14} color={Colors.neonGreen} />
          </View>

          {/* Character Avatar Card */}
          <View style={styles.avatarContainer}>
            {character?.image && (
              <Image
                source={character.image}
                style={styles.avatarImage}
                resizeMode="cover"
              />
            )}
            <View style={styles.powerScoreBadge}>
              <Text style={styles.powerScoreText}>{totalScore}</Text>
              <Text style={styles.powerScoreLabel}>PWR</Text>
            </View>
          </View>

          {/* Character Name & Evaluation */}
          <View style={styles.titleGroup}>
            <Text style={styles.characterName}>{character?.name || 'Power Warrior'}</Text>
            <Text style={styles.evaluationText}>{powerScore.evaluationText}</Text>
          </View>

          {/* 4-Metric Grid Breakdown */}
          <View style={styles.metricGrid}>
            <View style={styles.metricCell}>
              <Text style={styles.cellLabel}>Consistency</Text>
              <Text style={styles.cellValue}>{consistencyScore}/45</Text>
            </View>
            <View style={styles.metricCell}>
              <Text style={styles.cellLabel}>Duration Quality</Text>
              <Text style={styles.cellValue}>{durationQualityScore}/25</Text>
            </View>
            <View style={styles.metricCell}>
              <Text style={styles.cellLabel}>Muscle Variety</Text>
              <Text style={styles.cellValue}>{varietyScore}/20</Text>
            </View>
            <View style={styles.metricCell}>
              <Text style={styles.cellLabel}>Momentum</Text>
              <Text style={styles.cellValue}>{momentumScore}/10</Text>
            </View>
          </View>

          {/* Confirm Button */}
          <TouchableOpacity onPress={handleDismiss} style={styles.confirmButton}>
            <LinearGradient
              colors={[Colors.brandPrimary, Colors.brandTeal, '#a855f7']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.confirmGradient}
            >
              <Check size={16} color="#060a0e" />
              <Text style={styles.confirmText}>CLAIM POWER STATUS</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#080c10',
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: 'rgba(0, 255, 136, 0.35)',
    padding: 24,
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
    gap: 14,
  },
  topGlowLine: {
    position: 'absolute',
    top: 0,
    left: '20%',
    right: '20%',
    height: 3,
    backgroundColor: Colors.neonGreen,
    opacity: 0.7,
  },
  headerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 255, 136, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 136, 0.3)',
  },
  headerBadgeText: {
    fontSize: 9.5,
    fontWeight: '900',
    color: Colors.neonGreen,
    letterSpacing: 1,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: Colors.neonGreen,
    overflow: 'hidden',
    position: 'relative',
    marginTop: 4,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  powerScoreBadge: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(6, 10, 14, 0.85)',
    alignItems: 'center',
    paddingVertical: 2,
  },
  powerScoreText: {
    fontSize: 14,
    fontWeight: '900',
    color: Colors.neonGreen,
    lineHeight: 16,
  },
  powerScoreLabel: {
    fontSize: 7,
    fontWeight: '800',
    color: '#a1a1aa',
    letterSpacing: 0.5,
  },
  titleGroup: {
    alignItems: 'center',
    gap: 4,
  },
  characterName: {
    fontSize: 20,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  evaluationText: {
    fontSize: 11,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 15,
  },
  metricGrid: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  metricCell: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: 'rgba(18, 24, 32, 0.6)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1a2332',
    padding: 10,
    alignItems: 'center',
  },
  cellLabel: {
    fontSize: 9.5,
    color: '#71717a',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  cellValue: {
    fontSize: 13,
    fontWeight: '900',
    color: '#f4f4f5',
    marginTop: 2,
  },
  confirmButton: {
    width: '100%',
    borderRadius: 14,
    overflow: 'hidden',
    marginTop: 6,
  },
  confirmGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
  },
  confirmText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#060a0e',
    letterSpacing: 0.8,
  },
});

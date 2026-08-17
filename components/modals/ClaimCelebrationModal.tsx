import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet } from 'react-native';
import ItemIcon from '@/components/inventory/ItemIcon';
import { Sparkles, Trophy, Check } from 'lucide-react-native';
import { Colors, getRarityStyles } from '@/constants/Colors';
import * as Haptics from 'expo-haptics';

interface ClaimCelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemDetails: {
    itemName: string;
    itemId: string;
    quantity: number;
    rarity: string;
    description?: string;
  } | null;
}

export default function ClaimCelebrationModal({
  isOpen,
  onClose,
  itemDetails,
}: ClaimCelebrationModalProps) {
  if (!isOpen || !itemDetails) return null;

  const rStyles = getRarityStyles(itemDetails.rarity);

  const handleDismiss = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onClose();
  };

  return (
    <Modal visible={isOpen} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={[styles.modalCard, { borderColor: rStyles.border }]}>
          {/* Top Ambient Glow Line */}
          <View style={[styles.topGlowLine, { backgroundColor: rStyles.border }]} />

          {/* Celebration Header Badge */}
          <View style={styles.badgeRow}>
            <Sparkles size={14} color={rStyles.text} />
            <Text style={[styles.badgeText, { color: rStyles.text }]}>REWARD UNLOCKED</Text>
            <Sparkles size={14} color={rStyles.text} />
          </View>

          {/* Large Item Icon Card */}
          <View
            style={[
              styles.itemCard,
              {
                borderColor: rStyles.border,
                backgroundColor: rStyles.bg,
              },
            ]}
          >
            <ItemIcon itemId={itemDetails.itemId} size={48} />
          </View>

          {/* Item Name & Quantity */}
          <View style={styles.textDetailsCol}>
            <Text style={styles.rewardQuantity}>+{itemDetails.quantity}</Text>
            <Text style={styles.rewardName}>{itemDetails.itemName}</Text>

            <View style={[styles.rarityPill, { backgroundColor: rStyles.badgeBg, borderColor: rStyles.border }]}>
              <Text style={[styles.rarityPillText, { color: rStyles.text }]}>
                {itemDetails.rarity.toUpperCase()} REWARD
              </Text>
            </View>

            {itemDetails.description && (
              <Text style={styles.itemDesc}>{itemDetails.description}</Text>
            )}
          </View>

          {/* Equip Button */}
          <TouchableOpacity onPress={handleDismiss} style={styles.equipButton}>
            <View style={styles.equipButtonContent}>
              <Check size={16} color="#060a0e" />
              <Text style={styles.equipButtonText}>EQUIP TO INVENTORY</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.88)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#080c10',
    borderRadius: 24,
    borderWidth: 1.5,
    padding: 24,
    alignItems: 'center',
    gap: 16,
    position: 'relative',
    overflow: 'hidden',
  },
  topGlowLine: {
    position: 'absolute',
    top: 0,
    left: '20%',
    right: '20%',
    height: 3,
    opacity: 0.6,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(9, 13, 19, 0.8)',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  itemCard: {
    width: 88,
    height: 88,
    borderRadius: 22,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
  },
  textDetailsCol: {
    alignItems: 'center',
    gap: 6,
    width: '100%',
  },
  rewardQuantity: {
    fontSize: 16,
    fontWeight: '900',
    color: Colors.neonCyan,
  },
  rewardName: {
    fontSize: 18,
    fontWeight: '900',
    color: '#ffffff',
    textAlign: 'center',
  },
  rarityPill: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    marginVertical: 2,
  },
  rarityPillText: {
    fontSize: 9.5,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  itemDesc: {
    fontSize: 11.5,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 16,
    marginTop: 4,
  },
  equipButton: {
    width: '100%',
    backgroundColor: Colors.neonGreen,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  equipButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  equipButtonText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#060a0e',
    letterSpacing: 0.8,
  },
});

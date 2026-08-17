import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { UserInventoryItem } from '@/lib/types';
import ItemIcon from './ItemIcon';
import { X, ShieldAlert, Sparkles, Loader2, Package } from 'lucide-react-native';
import { Colors, getRarityStyles } from '@/constants/Colors';
import * as Haptics from 'expo-haptics';

interface InventoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  inventoryItems: UserInventoryItem[];
  onUseItem: (itemId: string, payload?: Record<string, unknown>) => Promise<void>;
  loading?: boolean;
  onRequestFreeze?: (availableTokens: number) => void;
}

export default function InventoryDrawer({
  isOpen,
  onClose,
  inventoryItems,
  onUseItem,
  loading = false,
  onRequestFreeze,
}: InventoryDrawerProps) {
  const [selectedItem, setSelectedItem] = useState<UserInventoryItem | null>(null);
  const [showConfirm, setShowConfirm] = useState<boolean>(false);
  const [isUsing, setIsUsing] = useState<boolean>(false);

  // Fill up slots up to 8 for classic RPG empty slot look
  const totalSlots = Math.max(8, Math.ceil((inventoryItems.length || 1) / 4) * 4);
  const slots = Array.from({ length: totalSlots }).map((_, idx) => {
    return inventoryItems[idx] || null;
  });

  if (!isOpen) return null;

  const handleSelect = (item: UserInventoryItem | null) => {
    if (isUsing) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedItem(item);
    setShowConfirm(false);
  };

  const handleUseRequest = () => {
    if (!selectedItem) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Intercept streak freeze to open FreezeModal
    if (selectedItem.item_details.item_id === 'STREAK_FREEZE_TOKEN') {
      if (onRequestFreeze) {
        onRequestFreeze(selectedItem.quantity);
      }
    } else if (selectedItem.item_details.item_id === 'RESTORE_SHIELD') {
      setShowConfirm(true);
    } else {
      executeUse();
    }
  };

  const executeUse = async () => {
    if (!selectedItem) return;
    setIsUsing(true);
    try {
      await onUseItem(selectedItem.item_details.item_id);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Refresh selected item balance
      const updated = inventoryItems.find(
        (i) => i.item_details.item_id === selectedItem.item_details.item_id
      );
      if (updated && updated.quantity > 1) {
        setSelectedItem({
          ...selectedItem,
          quantity: updated.quantity - 1,
        });
      } else {
        setSelectedItem(null);
      }
      setShowConfirm(false);
    } catch (err) {
      console.error('Failed to use item:', err);
    } finally {
      setIsUsing(false);
    }
  };

  return (
    <Modal visible={isOpen} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.drawerCard}>
          {/* Top Ambient Glow Line */}
          <View style={styles.topGlowLine} />

          {/* Header */}
          <View style={styles.headerRow}>
            <View style={styles.headerTitleRow}>
              <Sparkles size={18} color={Colors.neonCyan} />
              <Text style={styles.headerTitle}>HERO INVENTORY</Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <X size={16} color="#a1a1aa" />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.scrollBody} showsVerticalScrollIndicator={false}>
            {/* Slot Grid Section */}
            <View style={styles.slotsSection}>
              <Text style={styles.sectionSubtitle}>
                ITEM SLOTS ({inventoryItems.length} ACTIVE)
              </Text>

              <View style={styles.gridContainer}>
                {slots.map((item, idx) => {
                  const isSelected =
                    selectedItem &&
                    item &&
                    selectedItem.item_details.item_id === item.item_details.item_id;
                  const rStyles = item
                    ? getRarityStyles(item.item_details.rarity)
                    : null;

                  return (
                    <TouchableOpacity
                      key={idx}
                      onPress={() => item && handleSelect(item)}
                      activeOpacity={item ? 0.7 : 1}
                      style={[
                        styles.slotCard,
                        item
                          ? {
                              borderColor: rStyles?.border,
                              backgroundColor: rStyles?.bg,
                            }
                          : styles.emptySlot,
                        isSelected && styles.selectedSlot,
                      ]}
                    >
                      {item ? (
                        <>
                          <ItemIcon
                            itemId={item.item_details.item_id}
                            size={28}
                          />
                          {/* Stack Count Badge */}
                          <View style={styles.quantityBadge}>
                            <Text style={styles.quantityBadgeText}>x{item.quantity}</Text>
                          </View>
                        </>
                      ) : (
                        <View style={styles.emptyDot} />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Selected Item Details Inspector */}
            <View style={styles.inspectorCard}>
              {selectedItem ? (
                <View style={styles.inspectorContent}>
                  {/* Rarity Pill Badge */}
                  <View style={[styles.rarityPill, { backgroundColor: getRarityStyles(selectedItem.item_details.rarity).badgeBg }]}>
                    <Text
                      style={[
                        styles.rarityPillText,
                        { color: getRarityStyles(selectedItem.item_details.rarity).text },
                      ]}
                    >
                      {selectedItem.item_details.rarity.toUpperCase()}
                    </Text>
                  </View>

                  {/* Title & Icon Header */}
                  <View style={styles.itemHeaderRow}>
                    <View
                      style={[
                        styles.largeIconBox,
                        {
                          borderColor: getRarityStyles(selectedItem.item_details.rarity).border,
                          backgroundColor: getRarityStyles(selectedItem.item_details.rarity).bg,
                        },
                      ]}
                    >
                      <ItemIcon
                        itemId={selectedItem.item_details.item_id}
                        size={32}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.itemName}>
                        {selectedItem.item_details.name}
                      </Text>
                      <Text style={styles.itemQuantityHeld}>
                        Quantity: <Text style={{ color: Colors.neonCyan, fontWeight: '900' }}>{selectedItem.quantity}</Text>
                      </Text>
                    </View>
                  </View>

                  {/* Description */}
                  <Text style={styles.itemDesc}>
                    {selectedItem.item_details.description}
                  </Text>

                  {/* Actions / Confirmation */}
                  <View style={styles.actionContainer}>
                    {showConfirm ? (
                      <View style={styles.confirmBox}>
                        <View style={styles.confirmHeader}>
                          <ShieldAlert size={14} color="#f87171" />
                          <Text style={styles.confirmTitle}>Confirm using high-value item?</Text>
                        </View>
                        <View style={styles.confirmButtonsRow}>
                          <TouchableOpacity
                            onPress={executeUse}
                            disabled={isUsing}
                            style={styles.confirmYesBtn}
                          >
                            {isUsing ? (
                              <ActivityIndicator size="small" color="#fff" />
                            ) : (
                              <Text style={styles.confirmYesText}>Yes, Use</Text>
                            )}
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() => setShowConfirm(false)}
                            disabled={isUsing}
                            style={styles.confirmCancelBtn}
                          >
                            <Text style={styles.confirmCancelText}>Cancel</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    ) : (
                      <TouchableOpacity
                        onPress={handleUseRequest}
                        disabled={loading || isUsing}
                        style={styles.useButton}
                      >
                        <Text style={styles.useButtonText}>ACTIVATE BUFF / USE</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              ) : (
                <View style={styles.emptyInspector}>
                  <Package size={28} color="#52525b" />
                  <Text style={styles.emptyInspectorTitle}>SELECT AN ITEM</Text>
                  <Text style={styles.emptyInspectorDesc}>
                    Tap any item in your inventory slots to inspect details and use it.
                  </Text>
                </View>
              )}
            </View>
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
    justifyContent: 'flex-end',
  },
  drawerCard: {
    backgroundColor: '#080c10',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderColor: '#1a2332',
    maxHeight: '85%',
    overflow: 'hidden',
    position: 'relative',
  },
  topGlowLine: {
    position: 'absolute',
    top: 0,
    left: '20%',
    right: '20%',
    height: 2,
    backgroundColor: Colors.neonCyan,
    opacity: 0.5,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#1a2332',
    backgroundColor: 'rgba(6, 10, 14, 0.95)',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#f4f4f5',
    letterSpacing: 1.2,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#121820',
    borderWidth: 1,
    borderColor: '#1f2937',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollBody: {
    padding: 18,
    gap: 16,
    paddingBottom: 36,
  },
  slotsSection: {
    gap: 10,
  },
  sectionSubtitle: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#71717a',
    letterSpacing: 0.8,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  slotCard: {
    width: '22.5%',
    aspectRatio: 1,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  emptySlot: {
    borderColor: '#1a2332',
    backgroundColor: 'rgba(18, 24, 32, 0.3)',
  },
  selectedSlot: {
    borderColor: '#ffffff',
    transform: [{ scale: 1.05 }],
  },
  emptyDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#27272a',
  },
  quantityBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#060a0e',
    borderWidth: 1,
    borderColor: '#1a2332',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 6,
  },
  quantityBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: Colors.neonCyan,
  },
  inspectorCard: {
    backgroundColor: 'rgba(18, 24, 32, 0.6)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#1a2332',
    padding: 16,
    minHeight: 180,
  },
  inspectorContent: {
    gap: 12,
  },
  rarityPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  rarityPillText: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  itemHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  largeIconBox: {
    width: 50,
    height: 50,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemName: {
    fontSize: 14,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 0.3,
  },
  itemQuantityHeld: {
    fontSize: 11,
    color: '#9ca3af',
    marginTop: 2,
  },
  itemDesc: {
    fontSize: 11.5,
    color: '#d1d5db',
    lineHeight: 16,
  },
  actionContainer: {
    marginTop: 6,
  },
  useButton: {
    backgroundColor: Colors.neonCyan,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  useButtonText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#060a0e',
    letterSpacing: 0.8,
  },
  confirmBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderRadius: 12,
    padding: 10,
    gap: 8,
  },
  confirmHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  confirmTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fca5a5',
  },
  confirmButtonsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  confirmYesBtn: {
    flex: 1,
    backgroundColor: '#dc2626',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmYesText: {
    fontSize: 10.5,
    fontWeight: '900',
    color: '#ffffff',
    textTransform: 'uppercase',
  },
  confirmCancelBtn: {
    flex: 1,
    backgroundColor: '#1f2937',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmCancelText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#d1d5db',
    textTransform: 'uppercase',
  },
  emptyInspector: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    gap: 6,
  },
  emptyInspectorTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: '#71717a',
    letterSpacing: 0.8,
  },
  emptyInspectorDesc: {
    fontSize: 10.5,
    color: '#52525b',
    textAlign: 'center',
    maxWidth: 240,
    lineHeight: 14,
  },
});

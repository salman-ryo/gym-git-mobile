import ActiveEffectsBar from "@/components/inventory/ActiveEffectsBar";
import ItemIcon from "@/components/inventory/ItemIcon";
import { Colors, getRarityStyles } from "@/constants/Colors";
import { useDashboard } from "@/contexts/DashboardContext";
import { UserInventoryItem } from "@/lib/types";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { Package, Shield, Snowflake, Zap } from "lucide-react-native";
import { useState } from "react";
import {
    ActivityIndicator,
    Platform,
    RefreshControl,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const STATUS_BAR_HEIGHT =
  Platform.OS === "android" ? (StatusBar.currentHeight ?? 24) : 0;

export default function InventoryScreen() {
  const state = useDashboard();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedItem, setSelectedItem] = useState<UserInventoryItem | null>(
    null,
  );
  const [isUsing, setIsUsing] = useState(false);

  const inventoryItems = state.inventoryItems || [];
  const activeEffects = state.activeEffects || [];

  // Minimum 16 slots for a classic 4x4 RPG backpack grid
  const totalSlots = Math.max(
    16,
    Math.ceil((inventoryItems.length || 1) / 4) * 4,
  );
  const slots: (UserInventoryItem | null)[] = Array.from({
    length: totalSlots,
  }).map((_, idx) => inventoryItems[idx] || null);

  const onRefresh = async () => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await state.fetchInventoryOnly();
    setRefreshing(false);
  };

  const handleSelectItem = (item: UserInventoryItem | null) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedItem(item);
  };

  const handleUseItem = async () => {
    if (!selectedItem) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // If freeze token, open the freeze modal
    if (selectedItem.item_details.item_id === "STREAK_FREEZE_TOKEN") {
      state.setIsFreezeModalOpen(true);
      return;
    }

    setIsUsing(true);
    try {
      await state.handleUseInventoryItem(selectedItem.item_details.item_id);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Update selected item state
      const updated = inventoryItems.find(
        (i) => i.item_details.item_id === selectedItem.item_details.item_id,
      );
      if (updated && updated.quantity > 1) {
        setSelectedItem({
          ...selectedItem,
          quantity: updated.quantity - 1,
        });
      } else {
        setSelectedItem(null);
      }
    } catch (err) {
      console.error("Failed to use item:", err);
    } finally {
      setIsUsing(false);
    }
  };

  const selectedRarity = selectedItem
    ? getRarityStyles(selectedItem.item_details.rarity)
    : null;

  return (
    <LinearGradient
      colors={[Colors.dark.background, "#0c0f17", Colors.dark.background]}
      style={styles.screen}
    >
      {/* ── Screen Header ───────────────────────── */}
      <View style={styles.header}>
        <LinearGradient
          colors={[Colors.dark.background, "#0c0f17"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.headerContent}>
          <View>
            <View style={styles.badgeRow}>
              <Package size={14} color={Colors.neonCyan} />
              <Text style={styles.headerBadge}>BACKPACK & GEAR</Text>
            </View>
            <Text style={styles.headerTitle}>Inventory</Text>
          </View>

          <View style={styles.capacityPill}>
            <Text style={styles.capacityLabel}>Capacity</Text>
            <Text style={styles.capacityValue}>
              {inventoryItems.length} / {totalSlots}
            </Text>
          </View>
        </View>
      </View>

      {/* ── Scrollable Backpack Content ─────────── */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.brandPrimary}
          />
        }
      >
        {/* Active Buffs / HUD */}
        <ActiveEffectsBar activeEffects={activeEffects} />

        {/* Quick Quick Stat Overview for Tokens */}
        <View style={styles.tokenBar}>
          <View style={styles.tokenCard}>
            <View style={styles.tokenIconCircle}>
              <Snowflake size={16} color={Colors.iceFrost} />
            </View>
            <View>
              <Text style={styles.tokenLabel}>Freeze Tokens</Text>
              <Text style={styles.tokenCount}>
                {state.availableFreezeTokens}
              </Text>
            </View>
          </View>

          <View style={styles.tokenCard}>
            <View
              style={[
                styles.tokenIconCircle,
                { backgroundColor: "rgba(34,211,238,0.1)" },
              ]}
            >
              <Shield size={16} color={Colors.neonCyan} />
            </View>
            <View>
              <Text style={styles.tokenLabel}>Restore Shields</Text>
              <Text style={styles.tokenCount}>{state.restoreShieldCount}</Text>
            </View>
          </View>
        </View>

        {/* RPG Grid Section Header */}
        <View style={styles.gridSectionHeader}>
          <Text style={styles.gridTitle}>ITEM SLOTS</Text>
          <Text style={styles.gridHint}>
            Tap an item to inspect or activate
          </Text>
        </View>

        {/* 4-Column RPG Slot Grid */}
        <View style={styles.slotGrid}>
          {slots.map((item, idx) => {
            const isSelected =
              selectedItem?.item_details.item_id === item?.item_details.item_id;
            const rarity = item
              ? getRarityStyles(item.item_details.rarity)
              : null;

            return (
              <TouchableOpacity
                key={item?.item_details.item_id || `empty-${idx}`}
                onPress={() => handleSelectItem(item)}
                activeOpacity={item ? 0.7 : 1}
                style={[
                  styles.slot,
                  item
                    ? {
                        backgroundColor: rarity?.bg || "#18181b",
                        borderColor: isSelected
                          ? Colors.brandPrimary
                          : rarity?.border || "#3f3f46",
                        borderWidth: isSelected ? 2 : 1,
                      }
                    : styles.emptySlot,
                ]}
              >
                {item ? (
                  <>
                    <ItemIcon itemId={item.item_details.item_id} size={28} />
                    {item.quantity > 1 && (
                      <View style={styles.quantityBadge}>
                        <Text style={styles.quantityText}>
                          x{item.quantity}
                        </Text>
                      </View>
                    )}
                    {isSelected && <View style={styles.selectedGlow} />}
                  </>
                ) : (
                  <View style={styles.emptySlotDot} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Selected Item Inspector Sheet */}
        {selectedItem && (
          <LinearGradient
            colors={[
              selectedRarity?.bg || "rgba(39,39,42,0.3)",
              "rgba(18,18,22,0.9)",
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[
              styles.inspectorCard,
              { borderColor: selectedRarity?.border || "#3f3f46" },
            ]}
          >
            <View style={styles.inspectorHeader}>
              <View style={styles.inspectorIconWrapper}>
                <ItemIcon
                  itemId={selectedItem.item_details.item_id}
                  size={36}
                />
              </View>

              <View style={styles.inspectorInfo}>
                <View style={styles.nameRarityRow}>
                  <Text style={styles.inspectorName}>
                    {selectedItem.item_details.name}
                  </Text>
                  <View
                    style={[
                      styles.rarityBadge,
                      { backgroundColor: selectedRarity?.badgeBg || "#27272a" },
                    ]}
                  >
                    <Text
                      style={[
                        styles.rarityText,
                        { color: selectedRarity?.text || "#a1a1aa" },
                      ]}
                    >
                      {selectedItem.item_details.rarity}
                    </Text>
                  </View>
                </View>
                <Text style={styles.inspectorCount}>
                  Available:{" "}
                  <Text style={{ color: "#f4f4f5", fontWeight: "800" }}>
                    x{selectedItem.quantity}
                  </Text>
                </Text>
              </View>
            </View>

            <Text style={styles.inspectorDescription}>
              {selectedItem.item_details.description ||
                "No description available."}
            </Text>

            {/* Action button */}
            <TouchableOpacity
              onPress={handleUseItem}
              disabled={isUsing}
              activeOpacity={0.8}
              style={[
                styles.actionButton,
                {
                  backgroundColor:
                    selectedItem.item_details.item_id === "STREAK_FREEZE_TOKEN"
                      ? Colors.iceFrost
                      : Colors.brandPrimary,
                },
              ]}
            >
              {isUsing ? (
                <ActivityIndicator color="#060a0e" />
              ) : (
                <View style={styles.actionButtonContent}>
                  {selectedItem.item_details.item_id ===
                  "STREAK_FREEZE_TOKEN" ? (
                    <Snowflake size={16} color="#060a0e" />
                  ) : (
                    <Zap size={16} color="#060a0e" />
                  )}
                  <Text style={styles.actionButtonText}>
                    {selectedItem.item_details.item_id === "STREAK_FREEZE_TOKEN"
                      ? "Activate Streak Freeze"
                      : "Consume Item"}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </LinearGradient>
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  header: {
    paddingTop: STATUS_BAR_HEIGHT + 8,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(39,39,42,0.6)",
    position: "relative",
    overflow: "hidden",
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 2,
  },
  headerBadge: {
    color: Colors.neonCyan,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.2,
  },
  headerTitle: {
    color: Colors.dark.foreground,
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: -0.5,
  },
  capacityPill: {
    backgroundColor: "rgba(34,211,238,0.1)",
    borderWidth: 1,
    borderColor: "rgba(34,211,238,0.3)",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignItems: "flex-end",
  },
  capacityLabel: {
    color: "#a1a1aa",
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  capacityValue: {
    color: Colors.neonCyan,
    fontSize: 14,
    fontWeight: "900",
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  tokenBar: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  tokenCard: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#18181b",
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: "#27272a",
  },
  tokenIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "rgba(56,189,248,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  tokenLabel: {
    color: "#a1a1aa",
    fontSize: 11,
    fontWeight: "700",
  },
  tokenCount: {
    color: "#f4f4f5",
    fontSize: 16,
    fontWeight: "900",
  },
  gridSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  gridTitle: {
    color: "#71717a",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
  },
  gridHint: {
    color: "#52525b",
    fontSize: 11,
  },
  slotGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 20,
  },
  slot: {
    width: "22.5%",
    aspectRatio: 1,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    overflow: "hidden",
  },
  emptySlot: {
    backgroundColor: "rgba(24,24,27,0.5)",
    borderWidth: 1,
    borderColor: "#27272a",
    borderStyle: "dashed",
  },
  emptySlotDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#3f3f46",
  },
  quantityBadge: {
    position: "absolute",
    bottom: 4,
    right: 4,
    backgroundColor: "rgba(9,9,11,0.85)",
    borderRadius: 6,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  quantityText: {
    color: "#f4f4f5",
    fontSize: 9,
    fontWeight: "800",
  },
  selectedGlow: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,255,136,0.1)",
  },
  inspectorCard: {
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
  },
  inspectorHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  inspectorIconWrapper: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: "rgba(9,9,11,0.7)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  inspectorInfo: {
    flex: 1,
  },
  nameRarityRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  inspectorName: {
    color: "#f4f4f5",
    fontSize: 16,
    fontWeight: "800",
    flex: 1,
  },
  rarityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  rarityText: {
    fontSize: 10,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  inspectorCount: {
    color: "#a1a1aa",
    fontSize: 12,
  },
  inspectorDescription: {
    color: "#d4d4d8",
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 16,
  },
  actionButton: {
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  actionButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  actionButtonText: {
    color: "#060a0e",
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: 0.3,
  },
});

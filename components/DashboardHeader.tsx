import { Colors } from "@/constants/Colors";
import { Stats } from "@/lib/types";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { Dumbbell, Flame, PlusCircle, Snowflake } from "lucide-react-native";
import {
    Platform,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const STATUS_BAR_HEIGHT =
  Platform.OS === "android" ? (StatusBar.currentHeight ?? 24) : 0;

interface DashboardHeaderProps {
  stats?: Stats | null;
  onOpenCheckIn?: () => void;
}

export default function DashboardHeader({
  stats,
  onOpenCheckIn,
}: DashboardHeaderProps) {
  const streak = stats?.currentStreak ?? 0;
  const isFrozen = !!stats?.isFrozen;

  const handleCheckInPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onOpenCheckIn?.();
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.dark.background, "#0c0f17"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.contentRow}>
        {/* Left: Branding */}
        <View style={styles.brandContainer}>
          <View style={styles.logoBadge}>
            <Dumbbell size={16} color={Colors.neonGreen} />
          </View>
          <View>
            <Text style={styles.brandTitle}>GYM-GIT</Text>
            <Text style={styles.brandSubtitle}>DEV FIT PROTOCOL</Text>
          </View>
        </View>

        {/* Right: Streak badge & Quick Check-in CTA */}
        <View style={styles.rightActions}>
          {streak > 0 && (
            <LinearGradient
              colors={
                isFrozen
                  ? ["rgba(56,189,248,0.25)", "rgba(56,189,248,0.08)"]
                  : ["rgba(0,255,136,0.22)", "rgba(0,255,136,0.08)"]
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[
                styles.streakBadge,
                {
                  borderColor: isFrozen
                    ? "rgba(56,189,248,0.4)"
                    : "rgba(0,255,136,0.4)",
                },
              ]}
            >
              {isFrozen ? (
                <Snowflake size={13} color={Colors.iceFrost} />
              ) : (
                <Flame size={13} color={Colors.neonGreen} />
              )}
              <Text
                style={[
                  styles.streakText,
                  { color: isFrozen ? Colors.iceFrost : Colors.neonGreen },
                ]}
              >
                {streak} {streak === 1 ? "day" : "days"}
              </Text>
            </LinearGradient>
          )}

          {onOpenCheckIn && (
            <TouchableOpacity
              onPress={handleCheckInPress}
              activeOpacity={0.8}
              style={styles.checkInButton}
            >
              <LinearGradient
                colors={["rgba(0,255,136,0.2)", "rgba(34,211,238,0.1)"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.checkInGradient}
              >
                <PlusCircle size={14} color={Colors.brandPrimary} />
                <Text style={styles.checkInText}>Check-in</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: STATUS_BAR_HEIGHT + 8,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(39,39,42,0.6)",
    position: "relative",
    overflow: "hidden",
  },
  contentRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  brandContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  logoBadge: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "rgba(0,255,136,0.12)",
    borderWidth: 1,
    borderColor: "rgba(0,255,136,0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  brandTitle: {
    color: Colors.neonGreen,
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: 1.2,
  },
  brandSubtitle: {
    color: "#71717a",
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 0.6,
  },
  rightActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  streakBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
  },
  streakText: {
    fontWeight: "800",
    fontSize: 12,
  },
  checkInButton: {
    borderRadius: 10,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(0,255,136,0.35)",
  },
  checkInGradient: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  checkInText: {
    color: Colors.brandPrimary,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
});

import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import GlassCard from "../../components/GlassCard";
import { darkColors, lightColors, theme, useThemeMode } from "../../theme";

const INITIAL_GROUPS = [
  { id: "g1", key: "react-native-guild", name: "React Native Guild", members: 1284, topic: "Mobile UI, animations, gestures, Expo SDK 57", active: 42, icon: "phone-portrait" },
  { id: "g2", key: "mongodb-architecture", name: "MongoDB Architecture", members: 1907, topic: "Indexing, Mongoose schemas, clustering & replication", active: 61, icon: "server" },
  { id: "g3", key: "webgpu-engines", name: "WebGPU Engine Masters", members: 863, topic: "Rust, WGSL shaders, high-fps 3D graphics", active: 27, icon: "hardware-chip" },
  { id: "g4", key: "design-systems-guild", name: "Design Systems Guild", members: 742, topic: "Dark glassmorphism tokens & Figma component specs", active: 15, icon: "color-palette" },
  { id: "g5", key: "microservices-go", name: "Microservices & Go", members: 2310, topic: "gRPC, Kafka streams, distributed Docker orchestration", active: 88, icon: "layers" },
  { id: "g6", key: "ship-30-sprint", name: "Ship-30 Sprint Club", members: 519, topic: "30 days, 30 shipped software features & production commits", active: 34, icon: "rocket" },
];

export default function StudentGroupsScreen({ navigation }) {
  const themeMode = typeof useThemeMode === "function" ? useThemeMode() : null;
  const isDarkMode = themeMode?.isDarkMode ?? true;
  const colors = themeMode?.themeColors || (isDarkMode ? darkColors : lightColors);

  const [groups, setGroups] = useState(INITIAL_GROUPS);
  const [joinedKeys, setJoinedKeys] = useState(["react-native-guild", "design-systems-guild"]);

  const toggleJoin = (group) => {
    const isJoined = joinedKeys.includes(group.key);
    if (isJoined) {
      setJoinedKeys(joinedKeys.filter((k) => k !== group.key));
      Alert.alert("Left Squad", `You have left ${group.name}.`);
    } else {
      setJoinedKeys([...joinedKeys, group.key]);
      Alert.alert("Squad Joined! 🎉", `You are now a member of ${group.name}. Live channel unlocked in Chat!`);
    }
  };

  const activeSquads = groups.filter((g) => joinedKeys.includes(g.key));

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.badgePill}>
            <Text style={styles.badgePillText}>GROUPS & GUILDS</Text>
          </View>
          <Text style={[styles.title, { color: colors.foreground }]}>Find Your Engineering Squad</Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>
            Join tech guilds that meet weekly and review code together. Every joined squad unlocks a live channel in Chat.
          </Text>
        </View>

        {/* ACTIVE SQUADS BANNER */}
        <GlassCard elevated style={styles.activeCard}>
          <View style={styles.activeCardHeader}>
            <View>
              <Text style={[styles.activeTitle, { color: colors.foreground }]}>
                Your Active Squads ({activeSquads.length})
              </Text>
              <Text style={[styles.activeSubtitle, { color: colors.muted }]}>
                Joined channels receive real-time push announcements
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.chatShortcutBtn, { backgroundColor: "#CCFF00" }]}
              onPress={() => navigation.navigate("ChatTab")}
            >
              <Ionicons name="chatbubbles" size={14} color="#000000" />
              <Text style={styles.chatShortcutText}>Open Chat →</Text>
            </TouchableOpacity>
          </View>

          {activeSquads.length === 0 ? (
            <Text style={[styles.emptyNotice, { color: colors.muted }]}>
              You haven't joined any squad yet. Tap "Join Squad" below to get started!
            </Text>
          ) : (
            <View style={styles.activeChipsRow}>
              {activeSquads.map((squad) => (
                <View key={squad.id} style={[styles.squadPill, { backgroundColor: colors.elevated, borderColor: colors.border }]}>
                  <Ionicons name={squad.icon} size={14} color="#CCFF00" />
                  <Text style={[styles.squadPillText, { color: colors.foreground }]}>{squad.name}</Text>
                  <View style={styles.onlineDot} />
                </View>
              ))}
            </View>
          )}
        </GlassCard>

        {/* ALL GUILDS DIRECTORY */}
        <Text style={[styles.sectionHeading, { color: colors.foreground }]}>Discover Tech Guilds</Text>
        <View style={styles.guildsGrid}>
          {groups.map((g) => {
            const isJoined = joinedKeys.includes(g.key);
            return (
              <GlassCard key={g.id} elevated style={styles.guildCard}>
                <View style={styles.guildTopRow}>
                  <View style={[styles.guildIconWrap, { backgroundColor: "rgba(204, 255, 0, 0.12)" }]}>
                    <Ionicons name={g.icon} size={22} color="#CCFF00" />
                  </View>
                  <View style={[styles.onlineBadge, { backgroundColor: "rgba(16, 185, 129, 0.15)" }]}>
                    <View style={styles.livePulse} />
                    <Text style={styles.onlineText}>{g.active} active now</Text>
                  </View>
                </View>

                <Text style={[styles.guildName, { color: colors.foreground }]}>{g.name}</Text>
                <Text style={[styles.guildTopic, { color: colors.muted }]}>{g.topic}</Text>

                <View style={styles.guildFooter}>
                  <View style={styles.memberCountRow}>
                    <Ionicons name="people-outline" size={14} color={colors.muted} />
                    <Text style={[styles.memberCount, { color: colors.muted }]}>{g.members} members</Text>
                  </View>

                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => toggleJoin(g)}
                    style={[
                      styles.joinBtn,
                      isJoined ? styles.joinedBtn : { backgroundColor: "#CCFF00" },
                    ]}
                  >
                    <Ionicons
                      name={isJoined ? "checkmark-circle" : "add"}
                      size={15}
                      color={isJoined ? "#10B981" : "#000000"}
                    />
                    <Text style={[styles.joinBtnText, isJoined && { color: "#10B981" }]}>
                      {isJoined ? "Joined ✓" : "Join Squad"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </GlassCard>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 18,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 20,
  },
  badgePill: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(204, 255, 0, 0.12)",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(204, 255, 0, 0.25)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginBottom: 8,
  },
  badgePillText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#CCFF00",
    letterSpacing: 0.8,
  },
  title: {
    fontSize: 26,
    fontWeight: "900",
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    marginTop: 6,
    lineHeight: 18,
  },
  activeCard: {
    padding: 18,
    borderRadius: 20,
    marginBottom: 24,
  },
  activeCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  activeTitle: {
    fontSize: 16,
    fontWeight: "800",
  },
  activeSubtitle: {
    fontSize: 11,
    marginTop: 2,
  },
  chatShortcutBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 9999,
  },
  chatShortcutText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#000000",
  },
  emptyNotice: {
    fontSize: 12,
    fontStyle: "italic",
    marginTop: 4,
  },
  activeChipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  squadPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
  },
  squadPillText: {
    fontSize: 12,
    fontWeight: "700",
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#10B981",
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 14,
  },
  guildsGrid: {
    gap: 14,
  },
  guildCard: {
    padding: 18,
    borderRadius: 20,
  },
  guildTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  guildIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  onlineBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  livePulse: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#10B981",
  },
  onlineText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#10B981",
  },
  guildName: {
    fontSize: 17,
    fontWeight: "800",
    marginBottom: 4,
  },
  guildTopic: {
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 16,
  },
  guildFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.06)",
    paddingTop: 12,
  },
  memberCountRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  memberCount: {
    fontSize: 12,
    fontWeight: "600",
  },
  joinBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 9999,
  },
  joinedBtn: {
    backgroundColor: "rgba(16, 185, 129, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.3)",
  },
  joinBtnText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#000000",
  },
});

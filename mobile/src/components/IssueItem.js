import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import GlassCard from "./GlassCard";
import { darkColors, lightColors, theme, useThemeMode } from "../theme";

export default function IssueItem({ issue, onToggle }) {
  const themeMode = typeof useThemeMode === "function" ? useThemeMode() : null;
  const isDarkMode = themeMode?.isDarkMode ?? true;
  const colors = themeMode?.themeColors || (isDarkMode ? darkColors : lightColors);

  const isResolved = issue.status === "resolved" || issue.isDone;

  const getPriorityBadgeStyle = () => {
    switch ((issue.priority || "").toLowerCase()) {
      case "high":
        return { bg: "rgba(239, 68, 68, 0.15)", text: colors.danger };
      case "medium":
        return { bg: "rgba(245, 158, 11, 0.15)", text: colors.amber };
      default:
        return { bg: "rgba(16, 185, 129, 0.15)", text: colors.success };
    }
  };

  const badgeStyle = getPriorityBadgeStyle();

  return (
    <GlassCard style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => onToggle && onToggle(issue.id, issue.status)}
        style={styles.container}
      >
        <View style={[styles.checkbox, isResolved && { backgroundColor: colors.success, borderColor: colors.success }]}>
          {isResolved && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
        </View>

        <View style={styles.content}>
          <Text style={[styles.title, { color: colors.foreground }, isResolved && styles.resolvedTitle]}>
            {issue.title}
          </Text>
          <Text style={[styles.description, { color: colors.muted }]}>{issue.description || issue.desc}</Text>

          <View style={styles.metaRow}>
            <View style={[styles.badge, { backgroundColor: badgeStyle.bg }]}>
              <Text style={[styles.badgeText, { color: badgeStyle.text }]}>
                {issue.priority ? issue.priority.toUpperCase() : "NORMAL"}
              </Text>
            </View>

            <Text style={[styles.statusText, { color: isResolved ? colors.success : colors.subtle }]}>
              {isResolved ? "Resolved" : "Open"}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: theme.spacing(1.2),
    padding: theme.spacing(1.8),
  },
  container: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#9CA3AF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: theme.spacing(1.5),
    marginTop: 2,
  },
  content: {
    flex: 1,
  },
  title: {
    ...theme.typography.h3,
    fontSize: 15,
  },
  resolvedTitle: {
    textDecorationLine: "line-through",
    opacity: 0.6,
  },
  description: {
    ...theme.typography.body,
    fontSize: 12,
    marginTop: 2,
    marginBottom: theme.spacing(1),
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "700",
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600",
  },
});

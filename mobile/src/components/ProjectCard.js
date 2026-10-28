import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import GlassCard from "./GlassCard";
import { darkColors, lightColors, theme, useThemeMode } from "../theme";

export default function ProjectCard({ project, onPress }) {
  const navigation = useNavigation();
  const themeMode = typeof useThemeMode === "function" ? useThemeMode() : null;
  const isDarkMode = themeMode?.isDarkMode ?? true;
  const colors = themeMode?.themeColors || (isDarkMode ? darkColors : lightColors);

  const isCompleted =
    project.status === "Completed" ||
    project.status === "completed" ||
    project.progress === 100 ||
    project.tag === "Completed";

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      navigation.navigate("ProjectDetailsScreen", { project });
    }
  };

  const currentProgress = isCompleted ? 100 : project.progress || 0;

  return (
    <TouchableOpacity activeOpacity={0.7} onPress={handlePress}>
      <GlassCard elevated style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.foreground }]}>{project.name}</Text>
          <View
            style={[
              styles.tagBadge,
              { backgroundColor: isCompleted ? "rgba(16, 185, 129, 0.15)" : colors.elevated },
            ]}
          >
            <Text style={[styles.tagText, { color: isCompleted ? colors.success : colors.amber }]}>
              {isCompleted ? "Completed ✓" : project.tag || "Active"}
            </Text>
          </View>
        </View>

        <Text style={[styles.description, { color: colors.muted }]} numberOfLines={2}>
          {project.description}
        </Text>

        <View style={styles.footer}>
          <View style={styles.progressContainer}>
            <View style={styles.progressLabelRow}>
              <Text style={[styles.progressText, { color: colors.muted }]}>
                {isCompleted ? "Status" : "Progress"}
              </Text>
              <Text style={[styles.progressPercent, { color: isCompleted ? colors.success : colors.foreground }]}>
                {isCompleted ? "100% (Completed)" : `${currentProgress}%`}
              </Text>
            </View>
            <View style={[styles.track, { backgroundColor: colors.elevated }]}>
              <View
                style={[
                  styles.fill,
                  {
                    width: `${currentProgress}%`,
                    backgroundColor: isCompleted ? colors.success : colors.amber,
                  },
                ]}
              />
            </View>
          </View>

          <Ionicons name="chevron-forward" size={18} color={colors.subtle} style={{ marginLeft: 12 }} />
        </View>
      </GlassCard>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: theme.spacing(1.8),
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing(1),
  },
  title: {
    ...theme.typography.h3,
    fontSize: 16,
    flex: 1,
  },
  tagBadge: {
    paddingHorizontal: theme.spacing(1.2),
    paddingVertical: theme.spacing(0.4),
    borderRadius: theme.radius.sm,
  },
  tagText: {
    fontSize: 11,
    fontWeight: "700",
  },
  description: {
    ...theme.typography.body,
    fontSize: 13,
    marginBottom: theme.spacing(2),
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  progressContainer: {
    flex: 1,
  },
  progressLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  progressText: {
    fontSize: 11,
  },
  progressPercent: {
    fontSize: 11,
    fontWeight: "700",
  },
  track: {
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: 3,
  },
});

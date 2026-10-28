import React from "react";
import { Platform, StyleSheet, View } from "react-native";
import { darkColors, lightColors, theme, useThemeMode } from "../theme";

export default function GlassCard({ children, style, elevated = false, glowing = false, ...props }) {
  const themeMode = typeof useThemeMode === "function" ? useThemeMode() : null;
  const isDarkMode = themeMode?.isDarkMode ?? true;
  const colors = themeMode?.themeColors || (isDarkMode ? darkColors : lightColors);

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.cardBorder,
        },
        elevated && {
          backgroundColor: isDarkMode ? "#18181B" : "#FFFFFF",
          borderColor: isDarkMode ? "#27272A" : "#E2E3E1",
          ...(Platform.OS !== "web" && { shadowOpacity: isDarkMode ? 0.2 : 0.08 }),
        },
        glowing && {
          borderColor: colors.cardBorderGlow,
          ...theme.shadows.glow,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    padding: theme.spacing(2.5),
    position: "relative",
    overflow: "hidden",
    ...theme.shadows.card,
  },
});

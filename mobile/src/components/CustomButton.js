import React from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity } from "react-native";
import { darkColors, lightColors, theme, useThemeMode } from "../theme";

export default function CustomButton({
  title,
  onPress,
  variant = "primary", // primary | secondary | outline | ghost
  size = "md", // sm | md | lg
  loading = false,
  disabled = false,
  style,
  textStyle,
  icon,
}) {
  const themeMode = typeof useThemeMode === "function" ? useThemeMode() : null;
  const isDarkMode = themeMode?.isDarkMode ?? true;
  const colors = themeMode?.themeColors || (isDarkMode ? darkColors : lightColors);

  const getVariantStyles = () => {
    switch (variant) {
      case "primary":
        return {
          backgroundColor: isDarkMode ? "#FFFFFF" : "#000000",
          borderWidth: 0,
        };
      case "secondary":
        return {
          backgroundColor: colors.amber,
          borderWidth: 0,
        };
      case "outline":
        return {
          backgroundColor: isDarkMode ? "rgba(24, 24, 27, 0.8)" : "#FFFFFF",
          borderWidth: 1.5,
          borderColor: colors.border,
        };
      case "ghost":
        return {
          backgroundColor: "transparent",
          borderWidth: 0,
        };
      default:
        return {
          backgroundColor: colors.primary,
        };
    }
  };

  const getTextColor = () => {
    switch (variant) {
      case "primary":
        return isDarkMode ? "#000000" : "#FFFFFF";
      case "secondary":
        return "#000000";
      case "outline":
        return colors.foreground;
      case "ghost":
        return colors.amber;
      default:
        return colors.foreground;
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.82}
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.base,
        getVariantStyles(),
        styles[`size_${size}`],
        disabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} size="small" />
      ) : (
        <>
          {icon}
          <Text
            style={[
              styles.textBase,
              { color: getTextColor() },
              styles[`text_size_${size}`],
              icon ? { marginLeft: 6 } : null,
              textStyle,
            ]}
          >
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 9999, // FULL PILL ROUNDED SHAPE
    elevation: 2,
  },
  size_sm: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 9999,
  },
  size_md: {
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 9999,
  },
  size_lg: {
    paddingHorizontal: 28,
    paddingVertical: 16,
    borderRadius: 9999,
  },
  disabled: {
    opacity: 0.5,
  },
  textBase: {
    fontWeight: "800",
    textAlign: "center",
    letterSpacing: -0.2,
  },
  text_size_sm: {
    fontSize: 12,
  },
  text_size_md: {
    fontSize: 14,
  },
  text_size_lg: {
    fontSize: 15,
  },
});

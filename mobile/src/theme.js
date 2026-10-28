import React, { createContext, useContext, useState } from "react";
import { Platform } from "react-native";
import { UserRoleContext } from "./context/UserRoleContext";

// CYBERPUNK BLACK & NEON GREEN (STUDENT / DEFAULT)
export const darkColors = {
  background: "#08090A",
  surface: "#0E1015",
  elevated: "#141720",
  card: "#0E1015",
  cardBorder: "#1E2638",
  cardBorderGlow: "rgba(204, 255, 0, 0.4)",
  foreground: "#F8FAFC",
  muted: "#94A3B8",
  subtle: "#64748B",
  border: "#1E2638",
  primary: "#CCFF00", // Neon Green
  neonAccent: "#CCFF00",
  amber: "#CCFF00", // Accent mapped to neon green
  amberGlow: "rgba(204, 255, 0, 0.2)",
  danger: "#EF4444",
  success: "#CCFF00",
  warning: "#EAB308",
};

// CYBERPUNK BLACK & NEON GREEN (MENTOR PORTAL - STRICT THEME)
export const mentorDarkColors = {
  background: "#08090A",
  surface: "#0E1015",
  elevated: "#141720",
  card: "#0E1015",
  cardBorder: "#1E2638",
  cardBorderGlow: "rgba(204, 255, 0, 0.4)",
  foreground: "#F8FAFC",
  muted: "#94A3B8",
  subtle: "#64748B",
  border: "#1E2638",
  primary: "#CCFF00", // Neon Green
  neonAccent: "#CCFF00",
  amber: "#CCFF00", // Accent mapped to neon green
  amberGlow: "rgba(204, 255, 0, 0.2)",
  danger: "#EF4444",
  success: "#CCFF00",
  warning: "#EAB308",
};

export const lightColors = {
  background: "#F8F9FA",
  surface: "#FFFFFF",
  elevated: "#F1F3F5",
  card: "#FFFFFF",
  cardBorder: "#E9ECEF",
  cardBorderGlow: "rgba(204, 255, 0, 0.4)",
  foreground: "#111827",
  muted: "#4B5563",
  subtle: "#9CA3AF",
  border: "#E5E7EB",
  primary: "#CCFF00",
  neonAccent: "#CCFF00",
  amber: "#CCFF00",
  amberGlow: "rgba(204, 255, 0, 0.15)",
  danger: "#DC2626",
  success: "#059669",
  warning: "#D97706",
};


const typography = {
  h1: {
    fontSize: 32,
    fontWeight: "800",
    letterSpacing: -1,
  },
  h2: {
    fontSize: 24,
    fontWeight: "700",
    letterSpacing: -0.5,
  },
  h3: {
    fontSize: 18,
    fontWeight: "700",
  },
  body: {
    fontSize: 14,
    lineHeight: 20,
  },
  bodySm: {
    fontSize: 12,
    lineHeight: 16,
  },
  caption: {
    fontSize: 11,
    letterSpacing: 0.5,
  },
  badge: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
  },
};

export const theme = {
  colors: darkColors,
  spacing: (factor) => factor * 8,
  radius: {
    sm: 6,
    md: 10,
    lg: 16,
    xl: 24,
    full: 9999,
  },
  typography,
  font: typography, // ALIAS font TO typography TO PREVENT 'reading h3 of undefined'
  shadows: Platform.OS === "web" ? {
    card: { boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.4)" },
    glow: { boxShadow: "0px 2px 10px rgba(204, 255, 0, 0.25)" },
  } : {
    card: {
      shadowColor: "#000000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 10,
      elevation: 2,
    },
    glow: {
      shadowColor: "#CCFF00",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 10,
      elevation: 4,
    },
  },
};

const ThemeModeContext = createContext({
  isDarkMode: true,
  toggleThemeMode: () => {},
  themeColors: darkColors,
  isMentorTheme: false,
});

export function ThemeModeProvider({ children }) {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const userRoleCtx = useContext(UserRoleContext);
  const isMentor = userRoleCtx?.role === "mentor";

  const toggleThemeMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  const themeColors = isDarkMode
    ? (isMentor ? mentorDarkColors : darkColors)
    : lightColors;

  return (
    <ThemeModeContext.Provider
      value={{
        isDarkMode,
        toggleThemeMode,
        themeColors,
        isMentorTheme: isMentor,
      }}
    >
      {children}
    </ThemeModeContext.Provider>
  );
}

export function useThemeMode() {
  const ctx = useContext(ThemeModeContext);
  return ctx || {
    isDarkMode: true,
    toggleThemeMode: () => {},
    themeColors: darkColors,
    isMentorTheme: false,
  };
}
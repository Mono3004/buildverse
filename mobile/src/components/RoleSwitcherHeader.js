import React, { useState } from "react";
import {
  Linking,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useUserRole } from "../context/UserRoleContext";
import { darkColors, lightColors, theme, useThemeMode } from "../theme";

export default function RoleSwitcherHeader() {
  const { role, switchRole, logout } = useUserRole();
  const themeMode = typeof useThemeMode === "function" ? useThemeMode() : null;
  const isDarkMode = themeMode?.isDarkMode ?? true;
  const colors = themeMode?.themeColors || (isDarkMode ? darkColors : lightColors);

  const [showAdminModal, setShowAdminModal] = useState(false);

  const handleSwitch = (targetRole) => {
    switchRole(targetRole);
  };

  return (
    <>
      <View style={[styles.container, { backgroundColor: isDarkMode ? "#121216" : "#FFFFFF", borderColor: colors.border }]}>
        <View style={styles.leftInfo}>
          <View
            style={[
              styles.indicatorDot,
              { backgroundColor: role === "mentor" ? colors.amber : "#3B82F6" },
            ]}
          />
          <View>
            <Text style={[styles.modeLabel, { color: colors.muted }]}>CURRENT APP MODULE</Text>
            <Text style={[styles.modeName, { color: role === "mentor" ? colors.amber : "#3B82F6" }]}>
              {role === "mentor" ? "👨‍🏫 MENTOR PORTAL" : "🎓 STUDENT PORTAL"}
            </Text>
          </View>
        </View>

        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <View style={[styles.toggleWrap, { backgroundColor: colors.elevated, borderColor: colors.border }]}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => handleSwitch("student")}
              style={[
                styles.toggleBtn,
                role === "student" && { backgroundColor: "#2563EB" },
              ]}
            >
              <Ionicons
                name="school"
                size={14}
                color={role === "student" ? "#FFFFFF" : colors.muted}
              />
              <Text
                style={[
                  styles.toggleText,
                  { color: role === "student" ? "#FFFFFF" : colors.muted },
                  role === "student" && { fontWeight: "800" },
                ]}
              >
                Student
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => handleSwitch("mentor")}
              style={[
                styles.toggleBtn,
                role === "mentor" && { backgroundColor: colors.amber },
              ]}
            >
              <Ionicons
                name="shield-checkmark"
                size={14}
                color={role === "mentor" ? "#000000" : colors.muted}
              />
              <Text
                style={[
                  styles.toggleText,
                  { color: role === "mentor" ? "#000000" : colors.muted },
                  role === "mentor" && { fontWeight: "800" },
                ]}
              >
                Mentor
              </Text>
            </TouchableOpacity>
          </View>

          {/* ADMIN CONSOLE INFO BUTTON */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setShowAdminModal(true)}
            style={[styles.adminCrownBtn, { backgroundColor: colors.elevated, borderColor: colors.border }]}
            title="Admin Console Info"
          >
            <Text style={{ fontSize: 14 }}>👑</Text>
          </TouchableOpacity>

          {/* SIGN OUT / SWITCH ACCOUNT BUTTON */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={logout}
            style={[styles.adminCrownBtn, { backgroundColor: colors.elevated, borderColor: colors.border }]}
            title="Switch Account / Sign Out"
          >
            <Ionicons name="log-out-outline" size={16} color={colors.muted} />
          </TouchableOpacity>
        </View>
      </View>

      {/* ADMIN CONSOLE INFO MODAL */}
      <Modal visible={showAdminModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.adminModalCard, { backgroundColor: isDarkMode ? "#18181B" : "#FFFFFF", borderColor: colors.border }]}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <Text style={{ fontSize: 24 }}>👑</Text>
                <View>
                  <Text style={[styles.modalTitle, { color: colors.foreground }]}>Admin Console</Text>
                  <Text style={[styles.modalSubtitle, { color: colors.muted }]}>Web Platform Module</Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => setShowAdminModal(false)}>
                <Ionicons name="close-circle" size={24} color={colors.muted} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.adminModalBody, { color: colors.muted }]}>
              The BuildVerse Admin Console is hosted on the desktop web platform for system administration, cluster diagnostics, course moderation, and platform user roles.
            </Text>

            <View style={[styles.adminFeaturesBox, { backgroundColor: colors.elevated, borderColor: colors.border }]}>
              <Text style={[styles.adminFeatureItem, { color: colors.foreground }]}>• 🖥️ System-wide Telemetry & Metrics</Text>
              <Text style={[styles.adminFeatureItem, { color: colors.foreground }]}>• 👥 Manage Student & Mentor Accounts</Text>
              <Text style={[styles.adminFeatureItem, { color: colors.foreground }]}>• 📚 Course Catalog & Curriculum Moderation</Text>
              <Text style={[styles.adminFeatureItem, { color: colors.foreground }]}>• 🛠️ Issue Tracker & Bug Diagnostics</Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.8}
              style={[styles.webLaunchBtn, { backgroundColor: colors.primary }]}
              onPress={() => {
                setShowAdminModal(false);
                Linking.openURL("http://localhost:8080/admin").catch(() => {});
              }}
            >
              <Text style={styles.webLaunchBtnText}>🌐 Open Admin Web Console →</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  leftInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  indicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  modeLabel: {
    fontSize: 9,
    letterSpacing: 0.8,
    fontWeight: "700",
  },
  modeName: {
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  toggleWrap: {
    flexDirection: "row",
    borderRadius: 9999,
    padding: 3,
    borderWidth: 1,
  },
  toggleBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 9999,
  },
  toggleText: {
    fontSize: 11,
    marginLeft: 4,
  },
  adminCrownBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  adminModalCard: {
    width: "100%",
    borderRadius: 24,
    borderWidth: 1.5,
    padding: 22,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "900",
  },
  modalSubtitle: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  adminModalBody: {
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 16,
  },
  adminFeaturesBox: {
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    gap: 8,
    marginBottom: 20,
  },
  adminFeatureItem: {
    fontSize: 12,
    fontWeight: "600",
  },
  webLaunchBtn: {
    paddingVertical: 13,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  webLaunchBtnText: {
    fontSize: 14,
    fontWeight: "900",
    color: "#000000",
  },
});

import React, { useState } from "react";
import {
  Alert,
  Image,
  Linking,
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import GlassCard from "../components/GlassCard";
import CustomButton from "../components/CustomButton";
import CertificateModal from "../components/CertificateModal";
import { useUserRole } from "../context/UserRoleContext";
import { logoutUserSession } from "../lib/api";
import { darkColors, lightColors, theme, useThemeMode } from "../theme";

const INITIAL_USER = {
  name: "Alex Chen",
  username: "@alexchen",
  email: "alex@buildverse.io",
  role: "Senior Full-Stack Engineer",
  bio: "Full-stack web & mobile developer building scalable microservices with React Native, Node.js, and MongoDB.",
  location: "San Francisco, CA",
  website: "https://buildverse.io",
  joined: "November 2026",
  avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300",
  skills: ["React Native", "Node.js", "MongoDB", "Express", "Tailwind CSS", "WebSockets", "TypeScript"],
};

const USER_PROJECTS = [
  { id: "p1", name: "MongoDB Express API", role: "Lead Dev", progress: 60, tag: "Node.js" },
  { id: "p2", name: "Mobile App Redesign", role: "UI Contributor", progress: 85, tag: "React Native" },
  { id: "p3", name: "Lumina WebGPU Engine", role: "Core Contributor", progress: 90, tag: "Rust / GPU" },
];

export default function ProfileScreen({ navigation }) {
  const themeMode = typeof useThemeMode === "function" ? useThemeMode() : null;
  const isDarkMode = themeMode?.isDarkMode ?? true;
  const toggleThemeMode = themeMode?.toggleThemeMode || (() => {});
  const colors = themeMode?.themeColors || (isDarkMode ? darkColors : lightColors);
  const { logout, role } = useUserRole();

  const [user, setUser] = useState(INITIAL_USER);
  const [activeTab, setActiveTab] = useState("overview"); // overview | projects | badges
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCertModal, setShowCertModal] = useState(false);
  const [savedToast, setSavedToast] = useState(false);

  // 2FA & SECURITY CREDENTIALS
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleToggle2FA = () => {
    const next = !twoFactorEnabled;
    setTwoFactorEnabled(next);
    Alert.alert(
      next ? "2FA Activated ✓" : "2FA Deactivated",
      next
        ? "Two-Factor Authentication is now enabled for your account."
        : "Two-Factor Authentication has been disabled."
    );
  };

  const handleUpdatePassword = () => {
    if (!currentPassword) {
      Alert.alert("Missing Password", "Please enter your current password.");
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      Alert.alert("Password Length", "New password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("Mismatch", "New password and confirmation password do not match.");
      return;
    }
    Alert.alert("Password Updated ✓", "Your security credentials have been updated successfully.");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setShowPasswordModal(false);
  };

  // EDIT MODAL FORM FIELDS
  const [editName, setEditName] = useState(user.name);
  const [editUsername, setEditUsername] = useState(user.username);
  const [editEmail, setEditEmail] = useState(user.email);
  const [editRole, setEditRole] = useState(user.role);
  const [editBio, setEditBio] = useState(user.bio);
  const [editLocation, setEditLocation] = useState(user.location);
  const [editWebsite, setEditWebsite] = useState(user.website);
  const [editAvatar, setEditAvatar] = useState(user.avatar);
  const [editSkills, setEditSkills] = useState(user.skills);
  const [newSkillText, setNewSkillText] = useState("");

  const handleOpenEdit = () => {
    setEditName(user.name);
    setEditUsername(user.username);
    setEditEmail(user.email);
    setEditRole(user.role);
    setEditBio(user.bio);
    setEditLocation(user.location);
    setEditWebsite(user.website);
    setEditAvatar(user.avatar);
    setEditSkills([...user.skills]);
    setNewSkillText("");
    setShowEditModal(true);
  };

  const handleAddSkill = () => {
    const trimmed = newSkillText.trim();
    if (trimmed && !editSkills.includes(trimmed)) {
      setEditSkills([...editSkills, trimmed]);
      setNewSkillText("");
    }
  };

  const handleRemoveSkill = (skill) => {
    setEditSkills(editSkills.filter((s) => s !== skill));
  };

  const handleSaveProfile = () => {
    const updated = {
      ...user,
      name: editName.trim() || user.name,
      username: editUsername.startsWith("@") ? editUsername.trim() : `@${editUsername.trim()}`,
      email: editEmail.trim() || user.email,
      role: editRole.trim() || user.role,
      bio: editBio.trim() || user.bio,
      location: editLocation.trim() || user.location,
      website: editWebsite.trim() || user.website,
      avatar: editAvatar.trim() || user.avatar,
      skills: editSkills,
    };
    setUser(updated);
    setShowEditModal(false);
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 3000);
  };

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to log out of BuildVerse?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: () => {
          logoutUserSession();
          logout();
        },
      },
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* SAVED NOTIFICATION TOAST */}
        {savedToast && (
          <View style={[styles.toastAlert, { backgroundColor: "rgba(16, 185, 129, 0.15)", borderColor: "rgba(16, 185, 129, 0.4)" }]}>
            <Ionicons name="checkmark-circle" size={16} color="#10B981" />
            <Text style={[styles.toastText, { color: "#10B981" }]}>
              Profile successfully updated and saved locally!
            </Text>
          </View>
        )}

        {/* COVER BANNER & PROFILE HEADER */}
        <View style={[styles.coverCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {/* GRADIENT COVER */}
          <View style={[styles.gradientBanner, { backgroundColor: colors.amber }]}>
            <View style={styles.bannerOverlay} />
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.editBannerBtn}
              onPress={handleOpenEdit}
            >
              <Ionicons name="pencil" size={13} color="#FFFFFF" />
              <Text style={styles.editBannerBtnText}>✏️ Edit Profile</Text>
            </TouchableOpacity>
          </View>

          {/* AVATAR & IDENTITY */}
          <View style={styles.identityRow}>
            <View style={styles.avatarWrapper}>
              <Image source={{ uri: user.avatar }} style={[styles.avatar, { borderColor: colors.card }]} />
              <TouchableOpacity style={styles.cameraOverlayBtn} onPress={handleOpenEdit}>
                <Ionicons name="camera" size={16} color="#FFFFFF" />
              </TouchableOpacity>
              <View style={[styles.onlineIndicator, { borderColor: colors.card }]} />
            </View>

            <View style={styles.nameBlock}>
              <Text style={[styles.userName, { color: colors.foreground }]}>{user.name}</Text>
              <View style={[styles.rolePill, { backgroundColor: "rgba(59, 130, 246, 0.15)", borderColor: "rgba(59, 130, 246, 0.3)" }]}>
                <Text style={[styles.rolePillText, { color: "#60A5FA" }]}>{user.role.toUpperCase()}</Text>
              </View>
              <Text style={[styles.userHandle, { color: colors.muted }]}>
                {user.username} • {user.email}
              </Text>
            </View>
          </View>

          {/* META INFO (LOCATION & JOINED) */}
          <View style={[styles.metaInfoRow, { borderTopColor: colors.border }]}>
            <View style={styles.metaItem}>
              <Ionicons name="location-outline" size={14} color={colors.amber} />
              <Text style={[styles.metaText, { color: colors.muted }]}>{user.location}</Text>
            </View>
            <Text style={{ color: colors.border }}>•</Text>
            <View style={styles.metaItem}>
              <Ionicons name="calendar-outline" size={14} color={colors.amber} />
              <Text style={[styles.metaText, { color: colors.muted }]}>Joined {user.joined}</Text>
            </View>
          </View>
        </View>

        {/* 4 BENTO STATS CARDS (EXACT MATCH TO WEB) */}
        <View style={styles.statsGrid}>
          <GlassCard elevated style={styles.statCard}>
            <Text style={[styles.statLabel, { color: colors.muted }]}>ACTIVE PROJECTS</Text>
            <View style={styles.statInnerRow}>
              <Text style={[styles.statNumber, { color: colors.foreground }]}>6</Text>
              <View style={[styles.statIconCircle, { backgroundColor: "rgba(59, 130, 246, 0.15)" }]}>
                <Ionicons name="folder-open" size={16} color="#3B82F6" />
              </View>
            </View>
          </GlassCard>

          <GlassCard elevated style={styles.statCard}>
            <Text style={[styles.statLabel, { color: colors.muted }]}>ISSUES SOLVED</Text>
            <View style={styles.statInnerRow}>
              <Text style={[styles.statNumber, { color: colors.foreground }]}>24</Text>
              <View style={[styles.statIconCircle, { backgroundColor: "rgba(16, 185, 129, 0.15)" }]}>
                <Ionicons name="checkmark-done" size={16} color="#10B981" />
              </View>
            </View>
          </GlassCard>

          <GlassCard elevated style={styles.statCard}>
            <Text style={[styles.statLabel, { color: colors.muted }]}>BUILD RATE</Text>
            <View style={styles.statInnerRow}>
              <Text style={[styles.statNumber, { color: colors.foreground }]}>98.4%</Text>
              <View style={[styles.statIconCircle, { backgroundColor: "rgba(59, 130, 246, 0.15)" }]}>
                <Ionicons name="code-slash" size={16} color="#3B82F6" />
              </View>
            </View>
          </GlassCard>

          <GlassCard elevated style={styles.statCard}>
            <Text style={[styles.statLabel, { color: colors.muted }]}>COMMUNITY RANK</Text>
            <View style={styles.statInnerRow}>
              <Text style={[styles.statNumber, { color: colors.foreground }]}>Top 5%</Text>
              <View style={[styles.statIconCircle, { backgroundColor: "rgba(245, 158, 11, 0.15)" }]}>
                <Ionicons name="ribbon" size={16} color={colors.amber} />
              </View>
            </View>
          </GlassCard>
        </View>

        {/* 3 NAVIGATION SUB-TABS */}
        <View style={[styles.tabBar, { borderBottomColor: colors.border }]}>
          {[
            { id: "overview", label: "Overview & Skills" },
            { id: "projects", label: "Projects (3)" },
            { id: "badges", label: "Diplomas & Certs" },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                activeOpacity={0.8}
                style={[
                  styles.tabItem,
                  isActive && {
                    backgroundColor: colors.primary,
                    borderColor: colors.primary,
                  },
                ]}
                onPress={() => setActiveTab(tab.id)}
              >
                <Text
                  style={[
                    styles.tabItemText,
                    { color: isActive ? "#000000" : colors.muted },
                    isActive && { fontWeight: "900" },
                  ]}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* SUB-TAB 1: OVERVIEW & SKILLS */}
        {activeTab === "overview" && (
          <View style={styles.tabSection}>
            {/* ABOUT ME CARD */}
            <GlassCard elevated style={styles.overviewCard}>
              <Text style={[styles.cardHeading, { color: colors.foreground }]}>About Me</Text>
              <Text style={[styles.bioText, { color: colors.muted }]}>{user.bio}</Text>

              <Text style={[styles.sectionSubHeading, { color: colors.muted, marginTop: 14 }]}>
                ENGINEERING STACK & SKILLS
              </Text>
              <View style={styles.skillsTagCloud}>
                {user.skills.map((s, idx) => (
                  <View
                    key={idx}
                    style={[styles.skillPill, { backgroundColor: colors.elevated, borderColor: colors.border }]}
                  >
                    <Text style={[styles.skillPillText, { color: colors.foreground }]}>{s}</Text>
                  </View>
                ))}
              </View>
            </GlassCard>

            {/* ACCOUNT TELEMETRY CARD */}
            <GlassCard elevated style={styles.overviewCard}>
              <Text style={[styles.cardHeading, { color: colors.foreground }]}>Account Telemetry</Text>
              <View style={styles.telemetryList}>
                <View style={[styles.telemetryRow, { borderBottomColor: colors.border }]}>
                  <Text style={[styles.telemetryLabel, { color: colors.muted }]}>Account Role</Text>
                  <Text style={[styles.telemetryVal, { color: colors.amber }]}>{user.role}</Text>
                </View>

                <View style={[styles.telemetryRow, { borderBottomColor: colors.border }]}>
                  <Text style={[styles.telemetryLabel, { color: colors.muted }]}>Primary Email</Text>
                  <Text style={[styles.telemetryVal, { color: colors.foreground }]}>{user.email}</Text>
                </View>

                <View style={[styles.telemetryRow, { borderBottomColor: colors.border }]}>
                  <Text style={[styles.telemetryLabel, { color: colors.muted }]}>Location</Text>
                  <Text style={[styles.telemetryVal, { color: colors.foreground }]}>{user.location}</Text>
                </View>

                <View style={[styles.telemetryRow, { borderBottomColor: colors.border }]}>
                  <Text style={[styles.telemetryLabel, { color: colors.muted }]}>Website Link</Text>
                  <TouchableOpacity onPress={() => Linking.openURL(user.website).catch(() => {})}>
                    <Text style={[styles.telemetryVal, { color: "#3B82F6", textDecorationLine: "underline" }]}>
                      {user.website}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </GlassCard>
          </View>
        )}

        {/* SUB-TAB 2: CONTRIBUTED PROJECTS */}
        {activeTab === "projects" && (
          <View style={styles.tabSection}>
            {USER_PROJECTS.map((proj) => (
              <GlassCard key={proj.id} elevated style={styles.projectCard}>
                <View style={styles.projectTopRow}>
                  <View style={[styles.projectTagPill, { backgroundColor: "rgba(59, 130, 246, 0.15)", borderColor: "rgba(59, 130, 246, 0.3)" }]}>
                    <Text style={[styles.projectTagText, { color: "#60A5FA" }]}>{proj.tag}</Text>
                  </View>
                  <Text style={[styles.projectRoleText, { color: colors.muted }]}>{proj.role}</Text>
                </View>

                <Text style={[styles.projectNameText, { color: colors.foreground }]}>{proj.name}</Text>

                <View style={styles.progressWrap}>
                  <View style={styles.progressTextRow}>
                    <Text style={[styles.progressLabel, { color: colors.muted }]}>Milestone Progress</Text>
                    <Text style={[styles.progressPct, { color: colors.amber }]}>{proj.progress}%</Text>
                  </View>
                  <View style={[styles.progressTrack, { backgroundColor: colors.elevated }]}>
                    <View style={[styles.progressFill, { width: `${proj.progress}%`, backgroundColor: colors.amber }]} />
                  </View>
                </View>
              </GlassCard>
            ))}
          </View>
        )}

        {/* SUB-TAB 3: BADGES & CERTIFICATES */}
        {activeTab === "badges" && (
          <View style={styles.tabSection}>
            <GlassCard elevated style={[styles.certCard, { borderColor: colors.amber }]}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                <Text style={{ fontSize: 32 }}>🏆</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.certBadgeText, { color: colors.amber }]}>OFFICIAL CREDENTIAL</Text>
                  <Text style={[styles.certTitleText, { color: colors.foreground }]}>
                    Design Systems 2.0 Architect
                  </Text>
                  <Text style={[styles.certIdText, { color: colors.muted }]}>
                    Certificate ID: BV-CERT-982415 • Issued Oct 2026
                  </Text>
                </View>
              </View>

              <CustomButton
                title="🎓 View Official PDF Certificate"
                variant="primary"
                size="sm"
                style={{ marginTop: 14 }}
                onPress={() => setShowCertModal(true)}
              />
            </GlassCard>
          </View>
        )}

        {/* THEME MODE SWITCH TOGGLE */}
        <GlassCard elevated style={styles.settingCard}>
          <View style={styles.settingRow}>
            <Ionicons name={isDarkMode ? "moon" : "sunny"} size={18} color={colors.amber} />
            <Text style={[styles.settingLabel, { color: colors.foreground }]}>
              {isDarkMode ? "Dark Visual Mode" : "Light Visual Mode"}
            </Text>
            <Switch
              value={isDarkMode}
              onValueChange={toggleThemeMode}
              trackColor={{ false: "#E2E8F0", true: colors.amber }}
              thumbColor="#FFFFFF"
            />
          </View>
        </GlassCard>

        {/* SECURITY & 2FA SECTION */}
        <GlassCard elevated style={[styles.settingCard, { paddingVertical: 14, marginBottom: 14 }]}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12, borderBottomWidth: 1, borderBottomColor: colors.border, paddingBottom: 8 }}>
            <Ionicons name="shield-checkmark" size={18} color="#CCFF00" />
            <Text style={{ fontSize: 13, fontWeight: "800", color: colors.foreground, textTransform: "uppercase", letterSpacing: 0.5 }}>
              Security & Authentication
            </Text>
          </View>

          {/* TWO-FACTOR AUTHENTICATION TOGGLE */}
          <View style={[styles.settingRow, { marginBottom: 12 }]}>
            <View style={{ flex: 1, paddingRight: 10 }}>
              <Text style={[styles.settingLabel, { color: colors.foreground, fontSize: 13 }]}>
                Two-Factor Authentication (2FA)
              </Text>
              <Text style={{ fontSize: 10, color: colors.muted, marginTop: 2 }}>
                {twoFactorEnabled ? "Active: Extra login verification code enabled" : "Disabled: Protect your account from unauthorized logins"}
              </Text>
            </View>
            <Switch
              value={twoFactorEnabled}
              onValueChange={handleToggle2FA}
              trackColor={{ false: colors.border, true: "#CCFF00" }}
              thumbColor={twoFactorEnabled ? "#08090A" : "#FFFFFF"}
            />
          </View>

          {/* CHANGE PASSWORD ACTION */}
          <TouchableOpacity
            activeOpacity={0.8}
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              padding: 12,
              borderRadius: 14,
              borderWidth: 1,
              borderColor: colors.border,
              backgroundColor: colors.elevated,
            }}
            onPress={() => setShowPasswordModal(true)}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
              <Ionicons name="key-outline" size={18} color="#CCFF00" />
              <View>
                <Text style={{ fontSize: 13, fontWeight: "700", color: colors.foreground }}>Change Password</Text>
                <Text style={{ fontSize: 10, color: colors.muted }}>Update encrypted account password</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.muted} />
          </TouchableOpacity>
        </GlassCard>

        {/* SIGN OUT BUTTON */}
        <TouchableOpacity
          activeOpacity={0.8}
          style={[styles.signOutBtn, { borderColor: colors.danger }]}
          onPress={handleSignOut}
        >
          <Ionicons name="log-out-outline" size={16} color={colors.danger} />
          <Text style={[styles.signOutBtnText, { color: colors.danger }]}>
            Sign Out / Switch Account
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* EDIT PROFILE MODAL */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: isDarkMode ? "#18181B" : "#FFFFFF", borderColor: colors.border }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.foreground }]}>Edit User Profile</Text>
              <TouchableOpacity onPress={() => setShowEditModal(false)}>
                <Ionicons name="close-circle" size={24} color={colors.muted} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
              <Text style={[styles.fieldLabel, { color: colors.muted }]}>Full Display Name</Text>
              <TextInput
                style={[styles.modalInput, { backgroundColor: colors.elevated, borderColor: colors.border, color: colors.foreground }]}
                value={editName}
                onChangeText={setEditName}
              />

              <Text style={[styles.fieldLabel, { color: colors.muted }]}>Username</Text>
              <TextInput
                style={[styles.modalInput, { backgroundColor: colors.elevated, borderColor: colors.border, color: colors.foreground }]}
                value={editUsername}
                onChangeText={setEditUsername}
              />

              <Text style={[styles.fieldLabel, { color: colors.muted }]}>Primary Email</Text>
              <TextInput
                style={[styles.modalInput, { backgroundColor: colors.elevated, borderColor: colors.border, color: colors.foreground }]}
                value={editEmail}
                onChangeText={setEditEmail}
                keyboardType="email-address"
              />

              <Text style={[styles.fieldLabel, { color: colors.muted }]}>Role / Title</Text>
              <TextInput
                style={[styles.modalInput, { backgroundColor: colors.elevated, borderColor: colors.border, color: colors.foreground }]}
                value={editRole}
                onChangeText={setEditRole}
              />

              <Text style={[styles.fieldLabel, { color: colors.muted }]}>Location</Text>
              <TextInput
                style={[styles.modalInput, { backgroundColor: colors.elevated, borderColor: colors.border, color: colors.foreground }]}
                value={editLocation}
                onChangeText={setEditLocation}
              />

              <Text style={[styles.fieldLabel, { color: colors.muted }]}>Website / Portfolio Link</Text>
              <TextInput
                style={[styles.modalInput, { backgroundColor: colors.elevated, borderColor: colors.border, color: colors.foreground }]}
                value={editWebsite}
                onChangeText={setEditWebsite}
              />

              <Text style={[styles.fieldLabel, { color: colors.muted }]}>Avatar Photo URL</Text>
              <TextInput
                style={[styles.modalInput, { backgroundColor: colors.elevated, borderColor: colors.border, color: colors.foreground }]}
                value={editAvatar}
                onChangeText={setEditAvatar}
              />

              <Text style={[styles.fieldLabel, { color: colors.muted }]}>Bio / Summary</Text>
              <TextInput
                style={[styles.modalInput, styles.textArea, { backgroundColor: colors.elevated, borderColor: colors.border, color: colors.foreground }]}
                value={editBio}
                onChangeText={setEditBio}
                multiline
                numberOfLines={3}
              />

              {/* SKILLS MANAGER */}
              <Text style={[styles.fieldLabel, { color: colors.muted, marginTop: 14 }]}>
                Engineering Skills & Technologies
              </Text>
              <View style={styles.skillsTagCloud}>
                {editSkills.map((s, idx) => (
                  <View
                    key={idx}
                    style={[styles.skillEditablePill, { backgroundColor: colors.elevated, borderColor: colors.border }]}
                  >
                    <Text style={[styles.skillPillText, { color: colors.foreground }]}>{s}</Text>
                    <TouchableOpacity onPress={() => handleRemoveSkill(s)} style={{ marginLeft: 6 }}>
                      <Ionicons name="close-circle" size={14} color={colors.danger} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>

              <View style={styles.addSkillRow}>
                <TextInput
                  style={[styles.skillInput, { backgroundColor: colors.elevated, borderColor: colors.border, color: colors.foreground }]}
                  placeholder="e.g. Next.js, Rust, Docker"
                  placeholderTextColor={colors.subtle}
                  value={newSkillText}
                  onChangeText={setNewSkillText}
                />
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={[styles.addSkillBtn, { backgroundColor: colors.elevated, borderColor: colors.border }]}
                  onPress={handleAddSkill}
                >
                  <Text style={[styles.addSkillBtnText, { color: colors.foreground }]}>+ Add</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                activeOpacity={0.8}
                style={[styles.saveBtn, { backgroundColor: "#CCFF00" }]}
                onPress={handleSaveProfile}
              >
                <Text style={styles.saveBtnText}>Save Profile Changes ✓</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* CHANGE PASSWORD MODAL */}
      <Modal
        visible={showPasswordModal}
        animationType="fade"
        transparent
        onRequestClose={() => setShowPasswordModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: isDarkMode ? "#121318" : "#FFFFFF", borderColor: colors.border, maxWidth: 400 }]}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <Ionicons name="key" size={20} color="#CCFF00" />
                <Text style={[styles.modalTitle, { color: colors.foreground }]}>Change Password</Text>
              </View>
              <TouchableOpacity onPress={() => setShowPasswordModal(false)}>
                <Ionicons name="close-circle" size={24} color={colors.muted} />
              </TouchableOpacity>
            </View>

            <View style={{ paddingVertical: 8 }}>
              <Text style={{ fontSize: 11, color: colors.muted, marginBottom: 14 }}>
                Update your account password securely. It must be at least 6 characters.
              </Text>

              <Text style={[styles.fieldLabel, { color: colors.muted }]}>Current Password</Text>
              <TextInput
                style={[styles.modalInput, { backgroundColor: colors.elevated, borderColor: colors.border, color: colors.foreground }]}
                value={currentPassword}
                onChangeText={setCurrentPassword}
                secureTextEntry
                placeholder="Enter current password"
                placeholderTextColor={colors.subtle}
              />

              <Text style={[styles.fieldLabel, { color: colors.muted, marginTop: 10 }]}>New Password</Text>
              <TextInput
                style={[styles.modalInput, { backgroundColor: colors.elevated, borderColor: colors.border, color: colors.foreground }]}
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
                placeholder="At least 6 characters"
                placeholderTextColor={colors.subtle}
              />

              <Text style={[styles.fieldLabel, { color: colors.muted, marginTop: 10 }]}>Confirm New Password</Text>
              <TextInput
                style={[styles.modalInput, { backgroundColor: colors.elevated, borderColor: colors.border, color: colors.foreground }]}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                placeholder="Re-enter new password"
                placeholderTextColor={colors.subtle}
              />

              <TouchableOpacity
                activeOpacity={0.8}
                style={[styles.saveBtn, { backgroundColor: "#CCFF00", marginTop: 18 }]}
                onPress={handleUpdatePassword}
              >
                <Text style={[styles.saveBtnText, { color: "#08090A", fontWeight: "900" }]}>Update Password ✓</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* VERIFIED DIPLOMA MODAL */}
      <CertificateModal
        visible={showCertModal}
        course={{
          id: "bv_cert_1",
          title: "Design Systems 2.0 Architecture",
          level: "Mastery",
          progress: 100,
        }}
        onClose={() => setShowCertModal(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 18, paddingBottom: 40 },
  toastAlert: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 14,
  },
  toastText: { fontSize: 12, fontWeight: "700" },
  coverCard: { borderRadius: 24, borderWidth: 1, overflow: "hidden", marginBottom: 16 },
  gradientBanner: { height: 110, position: "relative" },
  bannerOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.25)" },
  editBannerBtn: {
    position: "absolute",
    top: 12,
    right: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 9999,
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  editBannerBtnText: { fontSize: 11, fontWeight: "800", color: "#FFFFFF" },
  identityRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 16,
    marginTop: -40,
    gap: 14,
  },
  avatarWrapper: { position: "relative" },
  avatar: { width: 80, height: 80, borderRadius: 40, borderWidth: 3 },
  cameraOverlayBtn: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.35)",
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    opacity: 0.8,
  },
  onlineIndicator: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#10B981",
    borderWidth: 2,
  },
  nameBlock: { flex: 1, paddingBottom: 4 },
  userName: { fontSize: 20, fontWeight: "900", letterSpacing: -0.3 },
  rolePill: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 9999,
    borderWidth: 1,
    marginVertical: 4,
  },
  rolePillText: { fontSize: 9, fontWeight: "900", letterSpacing: 0.8 },
  userHandle: { fontSize: 11 },
  metaInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    marginTop: 12,
  },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaText: { fontSize: 11 },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 16 },
  statCard: { width: "48%", padding: 14, borderRadius: 18, borderWidth: 1 },
  statLabel: { fontSize: 9, fontWeight: "800", letterSpacing: 0.6 },
  statInnerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  statNumber: { fontSize: 22, fontWeight: "900" },
  statIconCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  tabBar: {
    flexDirection: "row",
    gap: 8,
    borderBottomWidth: 1,
    paddingBottom: 12,
    marginBottom: 16,
  },
  tabItem: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: "transparent",
  },
  tabItemText: { fontSize: 12 },
  tabSection: { gap: 14, marginBottom: 16 },
  overviewCard: { padding: 16, borderRadius: 20, borderWidth: 1 },
  cardHeading: { fontSize: 15, fontWeight: "800", marginBottom: 6 },
  bioText: { fontSize: 12, lineHeight: 18 },
  sectionSubHeading: { fontSize: 10, fontWeight: "900", letterSpacing: 0.8 },
  skillsTagCloud: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 8 },
  skillPill: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 9999, borderWidth: 1 },
  skillPillText: { fontSize: 11, fontWeight: "700" },
  skillEditablePill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 9999,
    borderWidth: 1,
  },
  telemetryList: { gap: 8, marginTop: 6 },
  telemetryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
    borderBottomWidth: 1,
  },
  telemetryLabel: { fontSize: 12 },
  telemetryVal: { fontSize: 12, fontWeight: "700" },
  projectCard: { padding: 16, borderRadius: 20, borderWidth: 1 },
  projectTopRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  projectTagPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 9999,
    borderWidth: 1,
  },
  projectTagText: { fontSize: 10, fontWeight: "800" },
  projectRoleText: { fontSize: 11 },
  projectNameText: { fontSize: 15, fontWeight: "800", marginTop: 8 },
  progressWrap: { marginTop: 10 },
  progressTextRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  progressLabel: { fontSize: 11 },
  progressPct: { fontSize: 11, fontWeight: "800" },
  progressTrack: { height: 6, borderRadius: 3, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 3 },
  certCard: { padding: 16, borderRadius: 20, borderWidth: 1.5 },
  certBadgeText: { fontSize: 9, fontWeight: "900", letterSpacing: 0.8 },
  certTitleText: { fontSize: 15, fontWeight: "800", marginTop: 2 },
  certIdText: { fontSize: 11, marginTop: 2 },
  settingCard: { padding: 14, borderRadius: 18, borderWidth: 1, marginBottom: 16 },
  settingRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  settingLabel: { fontSize: 13, fontWeight: "700", flex: 1 },
  signOutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  signOutBtnText: { fontSize: 13, fontWeight: "800" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.75)",
    justifyContent: "center",
    padding: 20,
  },
  modalCard: { borderRadius: 24, borderWidth: 1.5, padding: 20, maxHeight: "90%" },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: { fontSize: 17, fontWeight: "900" },
  fieldLabel: { fontSize: 11, fontWeight: "700", marginTop: 10, marginBottom: 4 },
  modalInput: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
  },
  textArea: { height: 60, textAlignVertical: "top" },
  addSkillRow: { flexDirection: "row", gap: 8, marginTop: 10, marginBottom: 8 },
  skillInput: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 12,
  },
  addSkillBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  addSkillBtnText: { fontSize: 12, fontWeight: "800" },
  saveBtn: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 13,
    borderRadius: 9999,
    marginTop: 20,
    marginBottom: 10,
  },
  saveBtnText: { fontSize: 13, fontWeight: "900", color: "#000000" },
});

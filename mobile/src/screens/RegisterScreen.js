import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useUserRole } from "../context/UserRoleContext";
import { setCurrentUserSession, registerUserApi } from "../lib/api";

export default function RegisterScreen({ navigation }) {
  const { login } = useUserRole();

  const [role, setRole] = useState("student"); // "student" | "mentor"
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [notice, setNotice] = useState("");

  const handleSelectRole = (selectedRole) => {
    if (selectedRole === "admin") {
      Alert.alert(
        "👑 Admin Console (Web Only)",
        "The BuildVerse Admin Console is hosted on the desktop web application (http://localhost:8080/admin).\n\nIn this mobile app, you can register as a Student or Mentor.",
        [{ text: "Understood" }]
      );
      return;
    }

    setRole(selectedRole);
    if (selectedRole === "mentor") {
      setNotice("Joining as Mentor: Guide student projects, review PRs, and publish masterclasses.");
    } else {
      setNotice("Joining as Student: Access interactive labs, video masterclasses, and verified diplomas.");
    }
  };

  const handleClearSession = () => {
    setFullName("");
    setEmail("");
    setPassword("");
    setNotice("Fields reset.");
  };

  const handleRegister = async () => {
    if (!fullName.trim() || !email.trim() || !password.trim()) {
      Alert.alert("Missing Fields", "Please enter your Full Name, Email Address, and Password.");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Password Too Short", "Password must be at least 6 characters.");
      return;
    }

    setNotice("Creating account in MongoDB...");
    const result = await registerUserApi(fullName.trim(), email.trim(), password.trim(), role);

    if (!result.success) {
      Alert.alert("Registration Error", result.message || "Could not complete registration.");
      setNotice("");
      return;
    }

    const isMentor = role === "mentor";
    const userPayload = {
      id: result.user?.id || result.user?._id || `u_${role}_${Date.now()}`,
      name: result.user?.name || fullName.trim(),
      email: result.user?.email || email.trim(),
      role: isMentor ? "Principal Architect & Lead Mentor" : "Student Software Engineer",
      avatar: result.user?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${email.trim()}`,
    };

    setCurrentUserSession(userPayload);
    login(role, userPayload);
    // AppNavigator automatically mounts StudentTabs or MentorTabs via UserRoleContext isLoggedIn state
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        {/* ATMOSPHERIC GLOW BLUR */}
        <View style={styles.ambientGlow} />

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* FLOATING CARD CONTAINER */}
          <View style={styles.authCard}>
            {/* BRAND HEADER & CLEAR SESSION */}
            <View style={styles.brandRow}>
              <Text style={styles.brandLogo}>
                buildverse<Text style={styles.brandDot}>.</Text>
              </Text>
              <TouchableOpacity activeOpacity={0.7} onPress={handleClearSession}>
                <Text style={styles.clearSessionText}>Clear Session</Text>
              </TouchableOpacity>
            </View>

            {/* HEADINGS */}
            <View style={styles.headingWrap}>
              <Text style={styles.title}>Create your account</Text>
              <Text style={styles.subtitle}>
                Join BuildVerse engineering workspace, masterclasses & labs.
              </Text>
            </View>

            {/* NOTICE BANNER */}
            {!!notice && (
              <View style={styles.noticeBox}>
                <Ionicons name="sparkles" size={16} color="#CCFF00" />
                <Text style={styles.noticeText}>{notice}</Text>
              </View>
            )}

            {/* SELECT PORTAL ROLE BOX */}
            <View style={styles.roleBox}>
              <Text style={styles.roleBoxLabel}>SELECT PORTAL ROLE:</Text>
              <View style={styles.roleGrid}>
                {/* STUDENT BUTTON */}
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={[
                    styles.roleBtn,
                    role === "student" && styles.roleBtnActive,
                  ]}
                  onPress={() => handleSelectRole("student")}
                >
                  <Ionicons
                    name="people"
                    size={16}
                    color={role === "student" ? "#000000" : "#94A3B8"}
                  />
                  <Text
                    style={[
                      styles.roleBtnText,
                      role === "student" && styles.roleBtnTextActive,
                    ]}
                  >
                    Student
                  </Text>
                </TouchableOpacity>

                {/* MENTOR BUTTON */}
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={[
                    styles.roleBtn,
                    role === "mentor" && styles.roleBtnActive,
                  ]}
                  onPress={() => handleSelectRole("mentor")}
                >
                  <Ionicons
                    name="school"
                    size={16}
                    color={role === "mentor" ? "#000000" : "#94A3B8"}
                  />
                  <Text
                    style={[
                      styles.roleBtnText,
                      role === "mentor" && styles.roleBtnTextActive,
                    ]}
                  >
                    Mentor
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* FORM INPUTS */}
            <View style={styles.formWrap}>
              {/* FULL NAME */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Full Name</Text>
                <TextInput
                  style={styles.input}
                  value={fullName}
                  onChangeText={setFullName}
                  placeholder="Full name"
                  placeholderTextColor="#64748B"
                  autoCapitalize="words"
                />
              </View>

              {/* EMAIL */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Email Address</Text>
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="you@buildverse.io"
                  placeholderTextColor="#64748B"
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>

              {/* PASSWORD */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Password</Text>
                <View style={styles.passwordWrap}>
                  <TextInput
                    style={[styles.input, styles.passwordInput]}
                    value={password}
                    onChangeText={setPassword}
                    placeholder="••••••"
                    placeholderTextColor="#64748B"
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity
                    style={styles.eyeBtn}
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Ionicons
                      name={showPassword ? "eye-off-outline" : "eye-outline"}
                      size={18}
                      color="#94A3B8"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* CREATE ACCOUNT BUTTON */}
              <TouchableOpacity
                activeOpacity={0.85}
                style={styles.submitBtn}
                onPress={handleRegister}
              >
                <Text style={styles.submitBtnText}>Create Account →</Text>
              </TouchableOpacity>
            </View>

            {/* FOOTER */}
            <View style={styles.footerRow}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate("LoginScreen")}>
                <Text style={styles.footerLink}>Sign in</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#070A0E",
  },
  container: {
    flex: 1,
  },
  ambientGlow: {
    position: "absolute",
    top: -100,
    alignSelf: "center",
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: "rgba(16, 185, 129, 0.08)",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
    paddingVertical: 32,
  },
  authCard: {
    backgroundColor: "#0E141D",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 10,
  },
  brandRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  brandLogo: {
    fontSize: 20,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: -0.5,
  },
  brandDot: {
    color: "#CCFF00",
  },
  clearSessionText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#94A3B8",
    textDecorationLine: "underline",
  },
  headingWrap: {
    marginBottom: 18,
  },
  title: {
    fontSize: 28,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    color: "#94A3B8",
    marginTop: 6,
    lineHeight: 18,
  },
  noticeBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(204, 255, 0, 0.08)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(204, 255, 0, 0.2)",
    padding: 10,
    marginBottom: 16,
    gap: 8,
  },
  noticeText: {
    flex: 1,
    fontSize: 11,
    color: "#CCFF00",
    fontWeight: "600",
  },
  roleBox: {
    backgroundColor: "#131923",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
    padding: 12,
    marginBottom: 20,
  },
  roleBoxLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: "#94A3B8",
    letterSpacing: 1,
    marginBottom: 10,
  },
  roleGrid: {
    flexDirection: "row",
    gap: 8,
  },
  roleBtn: {
    flex: 1,
    backgroundColor: "#192230",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  roleBtnActive: {
    backgroundColor: "#CCFF00",
    borderColor: "#CCFF00",
    shadowColor: "#CCFF00",
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  roleBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#94A3B8",
  },
  roleBtnTextActive: {
    color: "#000000",
    fontWeight: "800",
  },
  formWrap: {
    gap: 16,
  },
  fieldGroup: {
    gap: 6,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#94A3B8",
  },
  input: {
    height: 48,
    backgroundColor: "#131923",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    paddingHorizontal: 16,
    fontSize: 14,
    color: "#FFFFFF",
  },
  passwordWrap: {
    position: "relative",
    justifyContent: "center",
  },
  passwordInput: {
    paddingRight: 46,
  },
  eyeBtn: {
    position: "absolute",
    right: 14,
    height: "100%",
    justifyContent: "center",
  },
  submitBtn: {
    backgroundColor: "#CCFF00",
    height: 50,
    borderRadius: 9999,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    shadowColor: "#CCFF00",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  submitBtnText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#000000",
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  footerText: {
    fontSize: 13,
    color: "#94A3B8",
  },
  footerLink: {
    fontSize: 13,
    fontWeight: "800",
    color: "#CCFF00",
  },
});

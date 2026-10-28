import React, { useState } from "react";
import {
  Alert,
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
import GlassCard from "../../components/GlassCard";
import CustomButton from "../../components/CustomButton";
import CertificateModal from "../../components/CertificateModal";
import { darkColors, lightColors, theme, useThemeMode } from "../../theme";

const ACCENTS = ["#CCFF00", "#4FD1C5", "#8B8CF7", "#F97C7C", "#F7C948", "#5AC8FA"];

const INITIAL_PORTFOLIO = {
  slug: "alex-chen",
  headline: "Product engineer & designer",
  bio: "I build fast, considered interfaces and the systems behind them with React Native, Node.js, and WebGPU.",
  location: "San Francisco, CA",
  website: "https://buildverse.io",
  github: "https://github.com/alexchen",
  accent: "#CCFF00",
  auto_publish: true,
  published: true,
};

const INITIAL_CASE_STUDIES = [
  {
    id: "cs_1",
    title: "Lumina WebGPU Engine",
    summary: "High-performance rendering engine built for the modern web using WebGPU and Rust.",
    role: "Lead Systems Engineer",
    stack: "Rust, WebGPU, WGSL",
    link: "https://github.com/buildverse/lumina-engine",
    published: true,
  },
  {
    id: "cs_2",
    title: "MongoDB Express API Engine",
    summary: "Distributed Express + MongoDB backend with real-time WebSocket messaging and token auth.",
    role: "Backend Architect",
    stack: "Node.js, Express, MongoDB",
    link: "https://github.com/buildverse/nexus-api",
    published: true,
  },
  {
    id: "cs_3",
    title: "BuildVerse Mobile App",
    summary: "Cross-platform developer operating system built in React Native & Expo SDK 57.",
    role: "Frontend Engineer",
    stack: "React Native, Expo, Hermes",
    link: "https://buildverse.io",
    published: true,
  },
];

export default function StudentPortfolioScreen({ navigation }) {
  const themeMode = typeof useThemeMode === "function" ? useThemeMode() : null;
  const isDarkMode = themeMode?.isDarkMode ?? true;
  const colors = themeMode?.themeColors || (isDarkMode ? darkColors : lightColors);

  const [portfolio, setPortfolio] = useState(INITIAL_PORTFOLIO);
  const [items, setItems] = useState(INITIAL_CASE_STUDIES);
  const [notice, setNotice] = useState("");
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showCertModal, setShowCertModal] = useState(false);

  // EDITABLE PROFILE FORM STATE
  const [slug, setSlug] = useState(portfolio.slug);
  const [headline, setHeadline] = useState(portfolio.headline);
  const [bio, setBio] = useState(portfolio.bio);
  const [location, setLocation] = useState(portfolio.location);
  const [website, setWebsite] = useState(portfolio.website);
  const [github, setGithub] = useState(portfolio.github);
  const [accent, setAccent] = useState(portfolio.accent);
  const [autoPublish, setAutoPublish] = useState(portfolio.auto_publish);

  const liveCount = items.filter((i) => i.published).length;

  const handleTogglePublish = () => {
    const nextPublished = !portfolio.published;
    setPortfolio({ ...portfolio, published: nextPublished });
    setNotice(nextPublished ? "Published — your profile is live." : "Profile unpublished (Draft).");
    setTimeout(() => setNotice(""), 3500);
  };

  const handleSaveProfile = () => {
    const updated = {
      ...portfolio,
      slug: slug.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      headline: headline.trim(),
      bio: bio.trim(),
      location: location.trim(),
      website: website.trim(),
      github: github.trim(),
      accent,
      auto_publish: autoPublish,
    };
    setPortfolio(updated);
    setNotice("✓ Saved — public profile updated successfully.");
    setTimeout(() => setNotice(""), 3500);
  };

  const handleAddWork = () => {
    const newWork = {
      id: `cs_${Date.now()}`,
      title: "New Case Study",
      summary: "What you built, for whom, and the outcome.",
      role: "Lead Engineer",
      stack: "TypeScript, React Native",
      link: "https://github.com/...",
      published: autoPublish,
    };
    setItems([newWork, ...items]);
  };

  const handleUpdateItem = (id, key, val) => {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, [key]: val } : it)));
  };

  const handleRemoveItem = (id) => {
    Alert.alert("Remove Case Study", "Are you sure you want to delete this case study from your portfolio?", [
      { text: "Cancel", style: "cancel" },
      { text: "Remove", style: "destructive", onPress: () => setItems(items.filter((i) => i.id !== id)) },
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* PAGE HEAD (EXACT MATCH TO WEB) */}
        <View style={styles.header}>
          <View style={[styles.eyebrowPill, { backgroundColor: "rgba(204, 255, 0, 0.12)", borderColor: "rgba(204, 255, 0, 0.3)" }]}>
            <Text style={[styles.eyebrowText, { color: "#CCFF00" }]}>PORTFOLIO</Text>
          </View>
          <Text style={[styles.title, { color: colors.foreground }]}>Publish your public profile</Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>
            Customize how the world sees your work. Turn on auto-publish and every new case study goes live the moment you add it.
          </Text>

          {/* ACTION BUTTONS: PREVIEW & PUBLISH PORTFOLIO */}
          <View style={styles.actionRow}>
            <TouchableOpacity
              activeOpacity={0.8}
              style={[styles.previewBtn, { backgroundColor: colors.elevated, borderColor: colors.border }]}
              onPress={() => setShowPreviewModal(true)}
            >
              <Ionicons name="eye-outline" size={14} color={colors.foreground} />
              <Text style={[styles.previewBtnText, { color: colors.foreground }]}>Preview</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              style={[
                styles.publishBtn,
                {
                  backgroundColor: portfolio.published ? colors.elevated : "#CCFF00",
                  borderColor: portfolio.published ? colors.border : "#CCFF00",
                },
              ]}
              onPress={handleTogglePublish}
            >
              <Text
                style={[
                  styles.publishBtnText,
                  { color: portfolio.published ? colors.muted : "#000000" },
                ]}
              >
                {portfolio.published ? "Unpublish" : "Publish portfolio 🚀"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* STATUS METRICS BAR */}
        <View style={styles.statusMetaRow}>
          <View
            style={[
              styles.liveBadge,
              {
                backgroundColor: portfolio.published ? "rgba(204, 255, 0, 0.15)" : colors.elevated,
                borderColor: portfolio.published ? "#CCFF00" : colors.border,
              },
            ]}
          >
            <View
              style={[
                styles.pulsingDot,
                { backgroundColor: portfolio.published ? "#CCFF00" : colors.muted },
              ]}
            />
            <Text
              style={[
                styles.liveBadgeText,
                { color: portfolio.published ? "#CCFF00" : colors.muted },
              ]}
            >
              {portfolio.published ? "Live" : "Draft"}
            </Text>
          </View>

          <Text style={[styles.visibleCountText, { color: colors.muted }]}>
            {liveCount} of {items.length} projects visible
          </Text>
        </View>

        {/* NOTICE ALERT */}
        {notice ? (
          <View style={[styles.noticeBar, { backgroundColor: "rgba(204, 255, 0, 0.15)", borderColor: "#CCFF00" }]}>
            <Text style={[styles.noticeText, { color: "#CCFF00" }]}>{notice}</Text>
          </View>
        ) : null}

        {/* SECTION 1: PUBLIC PROFILE EDITOR */}
        <GlassCard elevated style={styles.sectionCard}>
          <Text style={[styles.sectionHeading, { color: colors.foreground }]}>Public profile</Text>

          {/* PROFILE URL */}
          <Text style={[styles.fieldLabel, { color: colors.muted }]}>Profile URL</Text>
          <View style={[styles.urlPrefixBox, { backgroundColor: colors.elevated, borderColor: colors.border }]}>
            <Text style={[styles.urlPrefixText, { color: colors.muted }]}>nexus.dev/u/</Text>
            <TextInput
              style={[styles.urlInput, { color: colors.foreground }]}
              value={slug}
              onChangeText={setSlug}
              autoCapitalize="none"
            />
          </View>

          {/* HEADLINE */}
          <Text style={[styles.fieldLabel, { color: colors.muted }]}>Headline</Text>
          <TextInput
            style={[styles.inputBox, { backgroundColor: colors.elevated, borderColor: colors.border, color: colors.foreground }]}
            value={headline}
            onChangeText={setHeadline}
            placeholder="Product engineer & designer"
            placeholderTextColor={colors.subtle}
          />

          {/* BIO */}
          <Text style={[styles.fieldLabel, { color: colors.muted }]}>Bio</Text>
          <TextInput
            style={[styles.inputBox, styles.bioArea, { backgroundColor: colors.elevated, borderColor: colors.border, color: colors.foreground }]}
            value={bio}
            onChangeText={setBio}
            multiline
            numberOfLines={3}
          />

          {/* LOCATION & WEBSITE ROW */}
          <View style={styles.formRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.fieldLabel, { color: colors.muted }]}>Location</Text>
              <TextInput
                style={[styles.inputBox, { backgroundColor: colors.elevated, borderColor: colors.border, color: colors.foreground }]}
                value={location}
                onChangeText={setLocation}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.fieldLabel, { color: colors.muted }]}>Website</Text>
              <TextInput
                style={[styles.inputBox, { backgroundColor: colors.elevated, borderColor: colors.border, color: colors.foreground }]}
                value={website}
                onChangeText={setWebsite}
              />
            </View>
          </View>

          {/* GITHUB */}
          <Text style={[styles.fieldLabel, { color: colors.muted }]}>GitHub</Text>
          <TextInput
            style={[styles.inputBox, { backgroundColor: colors.elevated, borderColor: colors.border, color: colors.foreground }]}
            value={github}
            onChangeText={setGithub}
          />

          {/* ACCENT COLOR PICKER */}
          <Text style={[styles.fieldLabel, { color: colors.muted }]}>Accent color</Text>
          <View style={styles.accentColorsRow}>
            {ACCENTS.map((c) => (
              <TouchableOpacity
                key={c}
                style={[
                  styles.accentCircle,
                  { backgroundColor: c },
                  accent === c && { borderColor: colors.foreground, borderWidth: 2.5, transform: [{ scale: 1.15 }] },
                ]}
                onPress={() => setAccent(c)}
              />
            ))}
          </View>

          {/* AUTO PUBLISH TOGGLE */}
          <View style={[styles.autoPublishBox, { backgroundColor: colors.elevated, borderColor: colors.border }]}>
            <View style={{ flex: 1, paddingRight: 10 }}>
              <Text style={[styles.autoPublishTitle, { color: colors.foreground }]}>Auto-publish new work</Text>
              <Text style={[styles.autoPublishSub, { color: colors.muted }]}>
                New case studies go live automatically.
              </Text>
            </View>
            <Switch
              value={autoPublish}
              onValueChange={setAutoPublish}
              trackColor={{ false: "#334155", true: "#CCFF00" }}
              thumbColor="#000000"
            />
          </View>

          {/* SAVE PROFILE BUTTON */}
          <TouchableOpacity
            activeOpacity={0.85}
            style={[styles.saveProfileBtn, { backgroundColor: "#CCFF00" }]}
            onPress={handleSaveProfile}
          >
            <Text style={styles.saveProfileBtnText}>Save profile ✓</Text>
          </TouchableOpacity>
        </GlassCard>

        {/* SECTION 2: WORK ON YOUR PROFILE */}
        <GlassCard elevated style={styles.sectionCard}>
          <View style={styles.workHeaderRow}>
            <Text style={[styles.sectionHeading, { color: colors.foreground }]}>Work on your profile</Text>
            <TouchableOpacity
              activeOpacity={0.8}
              style={[styles.addWorkBtn, { backgroundColor: colors.elevated, borderColor: colors.border }]}
              onPress={handleAddWork}
            >
              <Ionicons name="add" size={14} color="#CCFF00" />
              <Text style={[styles.addWorkBtnText, { color: colors.foreground }]}>+ Add work</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.itemsList}>
            {items.map((it) => (
              <View key={it.id} style={[styles.caseStudyBox, { backgroundColor: colors.elevated, borderColor: colors.border }]}>
                {/* TITLE */}
                <TextInput
                  style={[styles.itemTitleInput, { color: colors.foreground }]}
                  value={it.title}
                  onChangeText={(val) => handleUpdateItem(it.id, "title", val)}
                  placeholder="Case study title"
                  placeholderTextColor={colors.subtle}
                />

                {/* SUMMARY */}
                <TextInput
                  style={[styles.itemSummaryInput, { color: colors.muted }]}
                  value={it.summary}
                  onChangeText={(val) => handleUpdateItem(it.id, "summary", val)}
                  placeholder="Project summary..."
                  placeholderTextColor={colors.subtle}
                  multiline
                  numberOfLines={2}
                />

                {/* ROLE & STACK */}
                <View style={styles.formRow}>
                  <TextInput
                    style={[styles.itemSmallInput, { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground }]}
                    value={it.role}
                    onChangeText={(val) => handleUpdateItem(it.id, "role", val)}
                    placeholder="Role (e.g. Lead Dev)"
                    placeholderTextColor={colors.subtle}
                  />
                  <TextInput
                    style={[styles.itemSmallInput, { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground }]}
                    value={it.stack}
                    onChangeText={(val) => handleUpdateItem(it.id, "stack", val)}
                    placeholder="Stack (e.g. Rust, Go)"
                    placeholderTextColor={colors.subtle}
                  />
                </View>

                {/* LINK */}
                <TextInput
                  style={[styles.itemLinkInput, { backgroundColor: colors.card, borderColor: colors.border, color: "#3B82F6" }]}
                  value={it.link}
                  onChangeText={(val) => handleUpdateItem(it.id, "link", val)}
                  placeholder="https://github.com/..."
                  placeholderTextColor={colors.subtle}
                />

                {/* VISIBLE ON PROFILE SWITCH & REMOVE */}
                <View style={[styles.itemFooterRow, { borderTopColor: colors.border }]}>
                  <TouchableOpacity
                    style={styles.visibleRow}
                    onPress={() => handleUpdateItem(it.id, "published", !it.published)}
                  >
                    <Ionicons
                      name={it.published ? "checkbox" : "square-outline"}
                      size={18}
                      color={it.published ? "#CCFF00" : colors.muted}
                    />
                    <Text style={[styles.visibleText, { color: colors.muted }]}>Visible on profile</Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => handleRemoveItem(it.id)}>
                    <Text style={[styles.removeText, { color: colors.danger }]}>Remove</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        </GlassCard>

        {/* SECTION 3: VERIFIED ACADEMY DIPLOMA */}
        <GlassCard elevated style={[styles.certCard, { borderColor: "#CCFF00" }]}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <Text style={{ fontSize: 32 }}>🏆</Text>
            <View style={{ flex: 1 }}>
              <Text style={[styles.certBadgeText, { color: "#CCFF00" }]}>OFFICIAL BUILDVERSE DIPLOMA</Text>
              <Text style={[styles.certTitleText, { color: colors.foreground }]}>
                Full-Stack Systems Architecture
              </Text>
              <Text style={[styles.certIdText, { color: colors.muted }]}>
                Certificate ID: BV-CERT-9042 • Issued Nov 2026
              </Text>
            </View>
          </View>

          <CustomButton
            title="🎓 View Verified PDF Diploma"
            variant="primary"
            size="sm"
            style={{ marginTop: 14 }}
            onPress={() => setShowCertModal(true)}
          />
        </GlassCard>
      </ScrollView>

      {/* PUBLIC PORTFOLIO PREVIEW MODAL */}
      <Modal visible={showPreviewModal} animationType="slide" transparent onRequestClose={() => setShowPreviewModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.previewCard, { backgroundColor: isDarkMode ? "#121216" : "#FFFFFF", borderColor: colors.border }]}>
            <View style={styles.previewHeader}>
              <View>
                <Text style={[styles.previewBrand, { color: "#CCFF00" }]}>nexus.dev/u/{portfolio.slug}</Text>
                <Text style={[styles.previewTitle, { color: colors.foreground }]}>{portfolio.headline}</Text>
              </View>
              <TouchableOpacity onPress={() => setShowPreviewModal(false)}>
                <Ionicons name="close-circle" size={24} color={colors.muted} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={[styles.previewBio, { color: colors.muted }]}>{portfolio.bio}</Text>

              <View style={[styles.previewMetaRow, { borderTopColor: colors.border, borderBottomColor: colors.border }]}>
                <Text style={{ fontSize: 11, color: colors.muted }}>📍 {portfolio.location}</Text>
                <Text style={{ fontSize: 11, color: "#3B82F6" }}>🌐 {portfolio.website}</Text>
                <Text style={{ fontSize: 11, color: colors.foreground }}>🐙 {portfolio.github}</Text>
              </View>

              <Text style={[styles.sectionHeading, { color: colors.foreground, marginTop: 14, marginBottom: 8 }]}>
                Featured Case Studies ({liveCount})
              </Text>

              {items.filter((i) => i.published).map((cs) => (
                <GlassCard key={cs.id} elevated style={styles.previewItemCard}>
                  <Text style={[styles.previewItemTitle, { color: colors.foreground }]}>{cs.title}</Text>
                  <Text style={[styles.previewItemSummary, { color: colors.muted }]}>{cs.summary}</Text>
                  <View style={styles.previewItemFooter}>
                    <Text style={{ fontSize: 10, color: "#CCFF00", fontWeight: "700" }}>{cs.role}</Text>
                    <Text style={{ fontSize: 10, color: colors.muted }}>{cs.stack}</Text>
                  </View>
                </GlassCard>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* VERIFIED DIPLOMA MODAL */}
      <CertificateModal
        visible={showCertModal}
        course={{
          id: "bv_cert_1",
          title: "Full-Stack Systems Architecture",
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
  header: { marginBottom: 14 },
  eyebrowPill: { alignSelf: "flex-start", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 9999, borderWidth: 1, marginBottom: 6 },
  eyebrowText: { fontSize: 9, fontWeight: "900", letterSpacing: 0.8 },
  title: { fontSize: 22, fontWeight: "900", letterSpacing: -0.5 },
  subtitle: { fontSize: 12, marginTop: 4, lineHeight: 17 },
  actionRow: { flexDirection: "row", gap: 10, marginTop: 14 },
  previewBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 16, paddingVertical: 9, borderRadius: 9999, borderWidth: 1 },
  previewBtnText: { fontSize: 12, fontWeight: "800" },
  publishBtn: { paddingHorizontal: 18, paddingVertical: 9, borderRadius: 9999, borderWidth: 1 },
  publishBtnText: { fontSize: 12, fontWeight: "900" },
  statusMetaRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 14 },
  liveBadge: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 9999, borderWidth: 1 },
  pulsingDot: { width: 6, height: 6, borderRadius: 3 },
  liveBadgeText: { fontSize: 11, fontWeight: "800" },
  visibleCountText: { fontSize: 12 },
  noticeBar: { padding: 10, borderRadius: 12, borderWidth: 1, marginBottom: 14 },
  noticeText: { fontSize: 12, fontWeight: "800" },
  sectionCard: { padding: 18, borderRadius: 22, borderWidth: 1, marginBottom: 16, gap: 10 },
  sectionHeading: { fontSize: 16, fontWeight: "800" },
  fieldLabel: { fontSize: 11, fontWeight: "800", textTransform: "uppercase", letterSpacing: 0.6, marginTop: 4 },
  urlPrefixBox: { flexDirection: "row", alignItems: "center", borderRadius: 12, borderWidth: 1, paddingHorizontal: 10 },
  urlPrefixText: { fontSize: 12 },
  urlInput: { flex: 1, paddingVertical: 8, paddingHorizontal: 4, fontSize: 12, fontWeight: "700" },
  inputBox: { borderRadius: 12, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 8, fontSize: 13 },
  bioArea: { height: 64, textAlignVertical: "top" },
  formRow: { flexDirection: "row", gap: 8 },
  accentColorsRow: { flexDirection: "row", gap: 10, marginVertical: 4 },
  accentCircle: { width: 28, height: 28, borderRadius: 14 },
  autoPublishBox: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 12, borderRadius: 14, borderWidth: 1, marginVertical: 6 },
  autoPublishTitle: { fontSize: 13, fontWeight: "700" },
  autoPublishSub: { fontSize: 11, marginTop: 1 },
  saveProfileBtn: { alignItems: "center", justifyContent: "center", paddingVertical: 12, borderRadius: 9999, marginTop: 6 },
  saveProfileBtnText: { fontSize: 12, fontWeight: "900", color: "#000000" },
  workHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  addWorkBtn: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 9999, borderWidth: 1 },
  addWorkBtnText: { fontSize: 11, fontWeight: "800" },
  itemsList: { gap: 12 },
  caseStudyBox: { padding: 14, borderRadius: 16, borderWidth: 1, gap: 8 },
  itemTitleInput: { fontSize: 14, fontWeight: "800" },
  itemSummaryInput: { fontSize: 12, lineHeight: 17 },
  itemSmallInput: { flex: 1, borderRadius: 10, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 6, fontSize: 11 },
  itemLinkInput: { borderRadius: 10, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 6, fontSize: 11 },
  itemFooterRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderTopWidth: 1, paddingTop: 8, marginTop: 2 },
  visibleRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  visibleText: { fontSize: 11 },
  removeText: { fontSize: 11, fontWeight: "700" },
  certCard: { padding: 16, borderRadius: 20, borderWidth: 1.5, marginBottom: 16 },
  certBadgeText: { fontSize: 9, fontWeight: "900", letterSpacing: 0.8 },
  certTitleText: { fontSize: 15, fontWeight: "800", marginTop: 2 },
  certIdText: { fontSize: 11, marginTop: 2 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.8)", justifyContent: "center", padding: 18 },
  previewCard: { borderRadius: 24, borderWidth: 1.5, padding: 18, maxHeight: "85%" },
  previewHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 },
  previewBrand: { fontSize: 11, fontWeight: "900", letterSpacing: 0.5 },
  previewTitle: { fontSize: 17, fontWeight: "900", marginTop: 2 },
  previewBio: { fontSize: 12, lineHeight: 18, marginBottom: 10 },
  previewMetaRow: { flexDirection: "row", flexWrap: "wrap", gap: 10, paddingVertical: 8, borderTopWidth: 1, borderBottomWidth: 1 },
  previewItemCard: { padding: 12, borderRadius: 14, borderWidth: 1, marginBottom: 8, gap: 4 },
  previewItemTitle: { fontSize: 13, fontWeight: "800" },
  previewItemSummary: { fontSize: 11, lineHeight: 16 },
  previewItemFooter: { flexDirection: "row", justifyContent: "space-between", marginTop: 4 },
});

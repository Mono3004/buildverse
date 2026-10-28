import React, { useState } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import GlassCard from "../../components/GlassCard";
import { approveReview, fetchReviews, getReviews } from "../../lib/workspaceData";
import { darkColors, lightColors, theme, useThemeMode } from "../../theme";

export default function MentorReviewsScreen({ navigation }) {
  const themeMode = typeof useThemeMode === "function" ? useThemeMode() : null;
  const isDarkMode = themeMode?.isDarkMode ?? true;
  const colors = themeMode?.themeColors || (isDarkMode ? darkColors : lightColors);

  const [reviews, setReviews] = useState(() => {
    try {
      const data = typeof getReviews === "function" ? getReviews() : [];
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  });
  const [filter, setFilter] = useState("all"); // all | pending | approved

  // INSPECTOR MODAL STATE
  const [inspectingReview, setInspectingReview] = useState(null);
  const [selectedFileIdx, setSelectedFileIdx] = useState(0);
  const [activeInspectTab, setActiveInspectTab] = useState("files"); // "files" | "commits" | "members"

  useEffect(() => {
    try {
      if (typeof fetchReviews === "function") {
        fetchReviews()
          .then((data) => {
            if (Array.isArray(data) && data.length > 0) setReviews(data);
          })
          .catch(() => {});
      }
    } catch (_e) {}
  }, []);

  const defaultSampleFiles = [
    {
      path: "src/controllers/auth.controller.js",
      content: `// 🛡️ Authentication & 2FA Controller\nconst jwt = require('jsonwebtoken');\n\nexports.verifySession = async (req, res) => {\n  const token = req.headers.authorization?.split(' ')[1];\n  if (!token) return res.status(401).json({ error: 'Unauthorized' });\n  \n  const decoded = jwt.verify(token, process.env.JWT_SECRET);\n  return res.json({ status: 'active', userId: decoded.id });\n};`,
    },
    {
      path: "src/models/Project.js",
      content: `// 📦 Project Telemetry Model\nconst mongoose = require('mongoose');\n\nconst ProjectSchema = new mongoose.Schema({\n  name: { type: String, required: true },\n  gitPoints: { type: Number, default: 0 },\n  mentorApproval: { type: Boolean, default: false }\n});\n\nmodule.exports = mongoose.model('Project', ProjectSchema);`,
    },
    {
      path: "src/services/scoreEngine.js",
      content: `// ⚡ GitPoints Dynamic Scoring Engine\nexport function calculatePRScore(stars, approved) {\n  const basePoints = stars * 20;\n  const approvalBonus = approved ? 50 : 10;\n  return basePoints + approvalBonus;\n}`,
    },
    {
      path: "package.json",
      content: `{\n  "name": "buildverse-engineering-repo",\n  "version": "1.0.0",\n  "dependencies": {\n    "express": "^4.19.2",\n    "mongoose": "^8.3.1"\n  }\n}`,
    },
  ];

  const handleApprove = (id) => {
    try {
      let updated;
      if (typeof approveReview === "function") {
        updated = approveReview(id);
      }
      if (Array.isArray(updated)) {
        setReviews(updated);
      } else {
        setReviews((prev) =>
          (Array.isArray(prev) ? prev : []).map((r) =>
            r && r.id === id ? { ...r, status: "Approved" } : r
          )
        );
      }
      Alert.alert("PR Approved ✓", "Pull Request has been approved and merged to main!", [{ text: "Great" }]);
    } catch (_err) {
      console.log("handleApprove err:", _err);
    }
  };

  const safeReviews = Array.isArray(reviews) ? reviews : [];
  const filtered = safeReviews.filter((r) => {
    if (!r) return false;
    if (filter === "pending") return r.status === "Pending";
    if (filter === "approved") return r.status === "Approved";
    return true;
  });

  const pendingCount = safeReviews.filter((r) => r && r.status === "Pending").length;

  return (
    <View style={[styles.container, { backgroundColor: "#08090A" }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.badgePill}>
            <Text style={styles.badgePillText}>CODE REVIEW QUEUE</Text>
          </View>
          <Text style={[styles.title, { color: "#F8FAFC" }]}>Student Pull Requests</Text>
          <Text style={[styles.subtitle, { color: "#94A3B8" }]}>
            {pendingCount} reviews waiting for mentor sign-off
          </Text>
        </View>

        {/* FILTER CHIPS */}
        <View style={styles.filterRow}>
          {["all", "pending", "approved"].map((f) => {
            const isSelected = filter === f;
            return (
              <TouchableOpacity
                key={f}
                activeOpacity={0.8}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: isSelected ? "#CCFF00" : "#141720",
                    borderColor: isSelected ? "#CCFF00" : "rgba(255, 255, 255, 0.08)",
                  },
                ]}
                onPress={() => setFilter(f)}
              >
                <Text
                  style={[
                    styles.filterText,
                    { color: isSelected ? "#08090A" : "#94A3B8" },
                    isSelected && { fontWeight: "900" },
                  ]}
                >
                  {f === "all" ? `All (${safeReviews.length})` : f === "pending" ? `Pending (${pendingCount})` : "Approved"}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* REVIEWS LIST */}
        <View style={styles.reviewList}>
          {filtered.map((r, rIdx) => {
            const isApproved = r?.status === "Approved";
            const studentName = r?.student || "Student Engineer";
            return (
              <GlassCard
                key={r?.id || `rev_${rIdx}`}
                elevated
                style={[
                  styles.reviewCard,
                  {
                    backgroundColor: "#0E1015",
                    borderColor: isApproved ? "rgba(204, 255, 0, 0.25)" : "rgba(255, 255, 255, 0.08)",
                  },
                ]}
              >
                <View style={styles.cardTopRow}>
                  <View style={styles.studentInfo}>
                    <View style={[styles.avatarCircle, { backgroundColor: "#141720" }]}>
                      <Text style={[styles.avatarInitial, { color: "#CCFF00" }]}>{studentName.charAt(0)}</Text>
                    </View>
                    <View style={{ marginLeft: 10 }}>
                      <Text style={[styles.studentName, { color: "#F8FAFC" }]}>{studentName}</Text>
                      <Text style={[styles.projectScope, { color: "#94A3B8" }]}>{r?.project || "Project"}</Text>
                    </View>
                  </View>

                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor: isApproved ? "rgba(204, 255, 0, 0.12)" : "rgba(255, 255, 255, 0.06)",
                        borderColor: isApproved ? "rgba(204, 255, 0, 0.25)" : "rgba(255, 255, 255, 0.12)",
                      },
                    ]}
                  >
                    <Text style={[styles.statusText, { color: isApproved ? "#CCFF00" : "#94A3B8" }]}>
                      {(r?.status || "Pending").toUpperCase()}
                    </Text>
                  </View>
                </View>

                {/* PR TITLE & BRANCH */}
                <View style={[styles.prBox, { backgroundColor: "#141720", borderColor: "rgba(204, 255, 0, 0.18)" }]}>
                  <Ionicons name="git-pull-request" size={14} color="#CCFF00" />
                  <Text style={[styles.prTitle, { color: "#F8FAFC" }]}>{r.PR}</Text>
                </View>

                <View style={styles.metaRow}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                    <Ionicons name="time-outline" size={11} color="#64748B" />
                    <Text style={[styles.timeText, { color: "#64748B" }]}>{r.time}</Text>
                  </View>
                  <Text style={[styles.branchText, { color: "#64748B" }]}>
                    branch: <Text style={{ color: "#F8FAFC" }}>main</Text>
                  </Text>
                </View>

                {/* ACTION BUTTONS */}
                <View style={styles.actionBtnRow}>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    style={[styles.inspectBtn, { backgroundColor: "#141720", borderColor: "rgba(204, 255, 0, 0.25)" }]}
                    onPress={() => {
                      setInspectingReview(r);
                      setSelectedFileIdx(0);
                      setActiveInspectTab("files");
                    }}
                  >
                    <Ionicons name="code-slash-outline" size={13} color="#CCFF00" />
                    <Text style={styles.inspectBtnText}>Files</Text>
                  </TouchableOpacity>

                  {!isApproved ? (
                    <>
                      <TouchableOpacity
                        activeOpacity={0.8}
                        style={[styles.approveBtn, { backgroundColor: "#CCFF00" }]}
                        onPress={() => handleApprove(r.id)}
                      >
                        <Ionicons name="checkmark-circle" size={14} color="#08090A" />
                        <Text style={styles.approveBtnText}>Approve PR ✓</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        activeOpacity={0.8}
                        style={[styles.chatBtn, { backgroundColor: "#141720", borderColor: "rgba(255, 255, 255, 0.1)" }]}
                        onPress={() => navigation.navigate("ChatTab", { recipient: r.student })}
                      >
                        <Ionicons name="chatbubble-ellipses-outline" size={14} color="#F8FAFC" />
                      </TouchableOpacity>
                    </>
                  ) : (
                    <View style={styles.approvedNotice}>
                      <Ionicons name="checkmark-done" size={14} color="#CCFF00" />
                      <Text style={styles.approvedNoticeText}>Merged to main</Text>
                    </View>
                  )}
                </View>
              </GlassCard>
            );
          })}
        </View>
      </ScrollView>

      {/* READ-ONLY PROJECT CODE INSPECTOR MODAL */}
      {inspectingReview && (
        <Modal
          visible={!!inspectingReview}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setInspectingReview(null)}
        >
          <View style={[styles.modalRoot, { backgroundColor: "#08090A" }]}>
            {/* MODAL HEADER */}
            <View style={styles.modalHeader}>
              <View style={{ flex: 1, marginRight: 10 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                  <Text style={[styles.modalTitle, { color: "#F8FAFC" }]} numberOfLines={1}>
                    {inspectingReview.student} / {inspectingReview.project}
                  </Text>
                  <View style={styles.readOnlyBadge}>
                    <Ionicons name="lock-closed" size={9} color="#CCFF00" />
                    <Text style={styles.readOnlyText}>READ-ONLY</Text>
                  </View>
                </View>
                <Text style={[styles.modalSub, { color: "#94A3B8" }]} numberOfLines={1}>
                  PR: {inspectingReview.PR} · Branch: main
                </Text>
              </View>

              <TouchableOpacity
                style={styles.closeBtn}
                onPress={() => setInspectingReview(null)}
              >
                <Ionicons name="close" size={18} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            {/* SUB-TABS (FILES / COMMITS / TEAM) */}
            <View style={styles.tabRow}>
              {["files", "commits", "members"].map((tab) => {
                const isActive = activeInspectTab === tab;
                return (
                  <TouchableOpacity
                    key={tab}
                    activeOpacity={0.8}
                    style={[
                      styles.tabBtn,
                      {
                        backgroundColor: isActive ? "#CCFF00" : "#141720",
                        borderColor: isActive ? "#CCFF00" : "rgba(255, 255, 255, 0.08)",
                      },
                    ]}
                    onPress={() => setActiveInspectTab(tab)}
                  >
                    <Text
                      style={[
                        styles.tabBtnText,
                        { color: isActive ? "#08090A" : "#94A3B8" },
                        isActive && { fontWeight: "900" },
                      ]}
                    >
                      {tab === "files" ? "Code Files" : tab === "commits" ? "Git Commits" : "Team"}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* TAB CONTENT: CODE FILES */}
            {activeInspectTab === "files" && (
              <View style={{ flex: 1 }}>
                {/* HORIZONTAL FILE SELECTOR PILLS */}
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.filesScroll}
                >
                  {defaultSampleFiles.map((f, idx) => {
                    const isSelected = selectedFileIdx === idx;
                    return (
                      <TouchableOpacity
                        key={f.path || idx}
                        activeOpacity={0.8}
                        style={[
                          styles.fileChip,
                          {
                            backgroundColor: isSelected ? "rgba(204, 255, 0, 0.15)" : "#141720",
                            borderColor: isSelected ? "#CCFF00" : "rgba(255, 255, 255, 0.08)",
                          },
                        ]}
                        onPress={() => setSelectedFileIdx(idx)}
                      >
                        <Ionicons
                          name="document-text-outline"
                          size={12}
                          color={isSelected ? "#CCFF00" : "#94A3B8"}
                        />
                        <Text
                          style={[
                            styles.fileName,
                            { color: isSelected ? "#CCFF00" : "#F8FAFC" },
                            isSelected && { fontWeight: "800" },
                          ]}
                        >
                          {f.path}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>

                {/* CODE VIEWER BOX */}
                <View style={styles.codeContainer}>
                  <View style={styles.codeHeader}>
                    <Text style={styles.codePath}>
                      {defaultSampleFiles[selectedFileIdx]?.path}
                    </Text>
                    <View style={styles.protectedPill}>
                      <Text style={styles.protectedPillText}>Protected Source</Text>
                    </View>
                  </View>

                  <ScrollView style={styles.codeScroll} showsVerticalScrollIndicator>
                    {(defaultSampleFiles[selectedFileIdx]?.content || "").split("\n").map((line, lIdx) => (
                      <View key={lIdx} style={styles.codeLineRow}>
                        <Text style={styles.lineNumber}>{lIdx + 1}</Text>
                        <Text style={[
                          styles.codeLineText,
                          line.startsWith("//") && { color: "#64748B", fontStyle: "italic" },
                          (line.includes("const ") || line.includes("export ") || line.includes("require")) && { color: "#CCFF00", fontWeight: "700" }
                        ]}>
                          {line}
                        </Text>
                      </View>
                    ))}
                  </ScrollView>
                </View>
              </View>
            )}

            {/* TAB CONTENT: GIT COMMITS */}
            {activeInspectTab === "commits" && (
              <ScrollView contentContainerStyle={styles.commitsList} showsVerticalScrollIndicator={false}>
                {[
                  { hash: "a8f31b2", message: `feat: ${inspectingReview.PR}`, time: "32 mins ago", author: inspectingReview.student },
                  { hash: "f9c04e1", message: "refactor: optimize database query execution plan", time: "2 hours ago", author: inspectingReview.student },
                  { hash: "c2d99a0", message: "feat: telemetry event handlers and metrics pipeline", time: "Yesterday", author: inspectingReview.student },
                  { hash: "e1b43d7", message: "initial project scaffolding and config", time: "3 days ago", author: inspectingReview.student },
                ].map((cm, cIdx) => (
                  <View key={cIdx} style={styles.commitCard}>
                    <View style={{ flex: 1, marginRight: 8 }}>
                      <Text style={styles.commitMsg}>{cm.message}</Text>
                      <Text style={styles.commitMeta}>by {cm.author} · {cm.time}</Text>
                    </View>
                    <View style={styles.commitHashPill}>
                      <Text style={styles.commitHashText}>{cm.hash}</Text>
                    </View>
                  </View>
                ))}
              </ScrollView>
            )}

            {/* TAB CONTENT: TEAM MEMBERS */}
            {activeInspectTab === "members" && (
              <ScrollView contentContainerStyle={styles.membersList} showsVerticalScrollIndicator={false}>
                {[
                  { name: inspectingReview.student, role: "Lead Student Contributor (Owner)", commits: 14 },
                  { name: "Elena Rostova", role: "Supervising Lead Mentor (Reviewer)", commits: 2 },
                ].map((mem, mIdx) => (
                  <View key={mIdx} style={styles.memberCard}>
                    <View style={styles.memberAvatar}>
                      <Text style={styles.memberInitial}>{(mem?.name || "M").charAt(0)}</Text>
                    </View>
                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <Text style={styles.memberName}>{mem?.name || "Team Member"}</Text>
                      <Text style={styles.memberRole}>{mem?.role || "Contributor"}</Text>
                    </View>
                    <Text style={styles.memberCommits}>{mem?.commits || 0} commits</Text>
                  </View>
                ))}
              </ScrollView>
            )}

            {/* MODAL FOOTER */}
            <View style={styles.modalFooter}>
              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.modalCloseBtn}
                onPress={() => setInspectingReview(null)}
              >
                <Text style={styles.modalCloseBtnText}>Close Viewer</Text>
              </TouchableOpacity>

              {inspectingReview.status !== "Approved" && (
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={styles.modalApproveBtn}
                  onPress={() => {
                    handleApprove(inspectingReview.id);
                    setInspectingReview(null);
                  }}
                >
                  <Ionicons name="checkmark-circle" size={14} color="#08090A" />
                  <Text style={styles.modalApproveBtnText}>Approve & Merge</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 14, paddingBottom: 32 },
  header: { marginBottom: 14 },
  badgePill: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 9999,
    backgroundColor: "rgba(204, 255, 0, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(204, 255, 0, 0.25)",
    marginBottom: 6,
  },
  badgePillText: { fontSize: 9, fontWeight: "900", letterSpacing: 0.8, color: "#CCFF00" },
  title: { fontSize: 22, fontWeight: "900", letterSpacing: -0.5 },
  subtitle: { fontSize: 12, marginTop: 2 },
  filterRow: { flexDirection: "row", gap: 8, marginBottom: 14 },
  filterChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 9999, borderWidth: 1 },
  filterText: { fontSize: 11, fontWeight: "700" },
  reviewList: { gap: 10 },
  reviewCard: { padding: 14, borderRadius: 14, borderWidth: 1 },
  cardTopRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  studentInfo: { flexDirection: "row", alignItems: "center" },
  avatarCircle: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  avatarInitial: { fontSize: 13, fontWeight: "800" },
  studentName: { fontSize: 13, fontWeight: "800" },
  projectScope: { fontSize: 11 },
  statusBadge: { paddingHorizontal: 7, paddingVertical: 2.5, borderRadius: 9999, borderWidth: 1 },
  statusText: { fontSize: 9, fontWeight: "900" },
  prBox: { flexDirection: "row", alignItems: "center", gap: 7, padding: 9, borderRadius: 10, borderWidth: 1, marginBottom: 8 },
  prTitle: { fontSize: 12, fontWeight: "700", flex: 1 },
  metaRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  timeText: { fontSize: 10 },
  branchText: { fontSize: 10 },
  actionBtnRow: { flexDirection: "row", gap: 8, alignItems: "center" },
  inspectBtn: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 8, borderRadius: 10, borderWidth: 1 },
  inspectBtnText: { fontSize: 11, fontWeight: "800", color: "#CCFF00" },
  approveBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5, paddingVertical: 8, borderRadius: 10 },
  approveBtnText: { fontSize: 12, fontWeight: "900", color: "#08090A" },
  chatBtn: { width: 36, height: 36, borderRadius: 10, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  approvedNotice: { flex: 1, flexDirection: "row", alignItems: "center", gap: 5, paddingVertical: 4 },
  approvedNoticeText: { fontSize: 11, fontWeight: "700", color: "#CCFF00" },
  // MODAL STYLES
  modalRoot: { flex: 1, paddingTop: 14 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: "rgba(255, 255, 255, 0.08)" },
  modalTitle: { fontSize: 14, fontWeight: "900" },
  modalSub: { fontSize: 11, marginTop: 2 },
  readOnlyBadge: { flexDirection: "row", alignItems: "center", gap: 3, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, backgroundColor: "rgba(204, 255, 0, 0.12)", borderWidth: 1, borderColor: "rgba(204, 255, 0, 0.25)" },
  readOnlyText: { fontSize: 8, fontWeight: "900", color: "#CCFF00" },
  closeBtn: { width: 30, height: 30, borderRadius: 8, backgroundColor: "#141720", alignItems: "center", justifyContent: "center" },
  tabRow: { flexDirection: "row", paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
  tabBtn: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 8, borderWidth: 1 },
  tabBtnText: { fontSize: 11, fontWeight: "700" },
  filesScroll: { paddingHorizontal: 16, gap: 8, paddingBottom: 8 },
  fileChip: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 1 },
  fileName: { fontSize: 11, fontFamily: "monospace" },
  codeContainer: { flex: 1, marginHorizontal: 14, marginBottom: 10, borderRadius: 12, borderWidth: 1, borderColor: "rgba(255, 255, 255, 0.08)", backgroundColor: "#050608", overflow: "hidden" },
  codeHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 12, paddingVertical: 8, backgroundColor: "#0A0C10", borderBottomWidth: 1, borderBottomColor: "rgba(255, 255, 255, 0.06)" },
  codePath: { fontSize: 11, color: "#F8FAFC", fontFamily: "monospace" },
  protectedPill: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, backgroundColor: "rgba(204, 255, 0, 0.1)" },
  protectedPillText: { fontSize: 9, color: "#CCFF00", fontWeight: "700" },
  codeScroll: { flex: 1, padding: 10 },
  codeLineRow: { flexDirection: "row", marginBottom: 3 },
  lineNumber: { width: 28, fontSize: 10, color: "#475569", fontFamily: "monospace", textAlign: "right", marginRight: 10 },
  codeLineText: { flex: 1, fontSize: 11, color: "#E2E8F0", fontFamily: "monospace" },
  commitsList: { padding: 16, gap: 10 },
  commitCard: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 12, borderRadius: 12, backgroundColor: "#0E1015", borderWidth: 1, borderColor: "rgba(255, 255, 255, 0.08)" },
  commitMsg: { fontSize: 12, fontWeight: "700", color: "#F8FAFC", fontFamily: "monospace" },
  commitMeta: { fontSize: 10, color: "#94A3B8", marginTop: 2 },
  commitHashPill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, backgroundColor: "#141720", borderWidth: 1, borderColor: "rgba(255, 255, 255, 0.08)" },
  commitHashText: { fontSize: 10, color: "#CCFF00", fontWeight: "700", fontFamily: "monospace" },
  membersList: { padding: 16, gap: 10 },
  memberCard: { flexDirection: "row", alignItems: "center", padding: 12, borderRadius: 12, backgroundColor: "#0E1015", borderWidth: 1, borderColor: "rgba(255, 255, 255, 0.08)" },
  memberAvatar: { width: 32, height: 32, borderRadius: 8, backgroundColor: "#141720", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "rgba(255, 255, 255, 0.1)" },
  memberInitial: { fontSize: 13, fontWeight: "900", color: "#CCFF00" },
  memberName: { fontSize: 12, fontWeight: "800", color: "#F8FAFC" },
  memberRole: { fontSize: 10, color: "#94A3B8", marginTop: 1 },
  memberCommits: { fontSize: 11, fontWeight: "800", color: "#CCFF00", fontFamily: "monospace" },
  modalFooter: { flexDirection: "row", justifyContent: "flex-end", gap: 8, paddingHorizontal: 16, paddingVertical: 12, borderTopWidth: 1, borderTopColor: "rgba(255, 255, 255, 0.08)", backgroundColor: "#0A0C10" },
  modalCloseBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, backgroundColor: "#141720", borderWidth: 1, borderColor: "rgba(255, 255, 255, 0.08)" },
  modalCloseBtnText: { fontSize: 11, fontWeight: "700", color: "#94A3B8" },
  modalApproveBtn: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, backgroundColor: "#CCFF00" },
  modalApproveBtnText: { fontSize: 11, fontWeight: "900", color: "#08090A" },
});

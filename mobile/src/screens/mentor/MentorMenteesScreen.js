import React, { useState, useEffect } from "react";
import {
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import GlassCard from "../../components/GlassCard";
import { fetchMentees, getMentees, createReview } from "../../lib/workspaceData";
import { darkColors, lightColors, theme, useThemeMode } from "../../theme";

export default function MentorMenteesScreen({ navigation }) {
  const themeMode = typeof useThemeMode === "function" ? useThemeMode() : null;
  const colors = themeMode?.themeColors || darkColors;
  const isDarkMode = themeMode?.isDarkMode ?? true;

  const [mentees, setMentees] = useState(getMentees());
  const [loading, setLoading] = useState(true);

  // CODE FILE INSPECTION MODAL STATE
  const [inspectingMentee, setInspectingMentee] = useState(null);
  const [selectedFileIdx, setSelectedFileIdx] = useState(0);
  const [activeInspectTab, setActiveInspectTab] = useState("files"); // "files" | "commits" | "members"

  // PROJECT REVIEW MODAL STATE
  const [reviewingMentee, setReviewingMentee] = useState(null);
  const [reviewStatus, setReviewStatus] = useState("Approved");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewQuery, setReviewQuery] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const reloadMentees = async () => {
    const data = await fetchMentees();
    if (Array.isArray(data) && data.length > 0) {
      setMentees(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    reloadMentees();
    const interval = setInterval(reloadMentees, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleOpenInspect = (m) => {
    setInspectingMentee(m);
    setSelectedFileIdx(0);
    setActiveInspectTab("files");
  };

  const handleOpenReview = (m) => {
    setReviewingMentee(m);
    setReviewStatus("Approved");
    setReviewRating(5);
    setReviewComment("Excellent architecture and modular code structure. Approved for merge.");
    setReviewQuery("");
  };

  const handleSubmitReview = async () => {
    if (!reviewingMentee) return;
    setIsSubmittingReview(true);
    const projectName =
      typeof reviewingMentee.project === "object"
        ? reviewingMentee.project?.name
        : reviewingMentee.project || "Full Stack Architecture";

    await createReview({
      student: reviewingMentee.name,
      studentId: reviewingMentee.id,
      project: projectName,
      PR: `PR #1: ${projectName} Initial Implementation`,
      status: reviewStatus,
      rating: reviewRating,
      query: reviewQuery.trim(),
      comment: reviewComment.trim(),
      mentor: "Elena Rostova (Lead Mentor)",
    });

    setIsSubmittingReview(false);
    setReviewingMentee(null);
    Alert.alert(
      "Project Reviewed ✓",
      `Review submitted! ${reviewingMentee.name} was awarded ${
        reviewRating * 20 + (reviewStatus === "Approved" ? 50 : 10)
      } GitPoints.`
    );
    await reloadMentees();
  };

  const defaultSampleFiles = [
    {
      path: "src/App.jsx",
      content: `// Main Application Component\nimport React from 'react';\n\nexport default function App() {\n  return (\n    <div className="app-container">\n      <h1>BuildVerse Engineering Project</h1>\n      <p>Status: Active Deployment</p>\n    </div>\n  );\n}`,
    },
    {
      path: "src/config/database.js",
      content: `// Database configuration\nconst mongoose = require('mongoose');\n\nconst connectDB = async () => {\n  try {\n    await mongoose.connect(process.env.MONGO_URI);\n    console.log('MongoDB Connected');\n  } catch (err) {\n    console.error(err.message);\n  }\n};\n\nmodule.exports = connectDB;`,
    },
    {
      path: "package.json",
      content: `{\n  "name": "buildverse-mentee-project",\n  "version": "1.0.0",\n  "dependencies": {\n    "react": "^18.3.1",\n    "mongoose": "^8.0.0"\n  }\n}`,
    },
    {
      path: "README.md",
      content: `# Project Workspace\n\nBuilt under BuildVerse mentorship guidance.\n- 100% test coverage\n- Monitored microservices`,
    },
  ];

  return (
    <View style={[styles.safeArea, { backgroundColor: "#08090A" }]}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* SUBTLE CLEAN HEADER */}
        <View style={styles.header}>
          <View style={styles.badgeRow}>
            <View style={[styles.badgePill, { backgroundColor: "rgba(204, 255, 0, 0.1)", borderColor: "rgba(204, 255, 0, 0.25)" }]}>
              <Text style={[styles.badgePillText, { color: "#CCFF00" }]}>STUDENT PORTFOLIO AUDIT</Text>
            </View>
          </View>
          <Text style={[styles.headerTitle, { color: "#F8FAFC" }]}>Assigned Mentees</Text>
          <Text style={[styles.headerSub, { color: "#94A3B8" }]}>
            Inspect mentee project code repositories, audit commits, and evaluate pull requests.
          </Text>
        </View>

        {/* MENTEES LIST / EMPTY STATE */}
        <View style={styles.menteeList}>
          {mentees.length === 0 ? (
            <GlassCard elevated style={[styles.emptyCard, { backgroundColor: "#0E1015", borderColor: "rgba(204, 255, 0, 0.2)" }]}>
              <Ionicons name="people-outline" size={40} color="#CCFF00" />
              <Text style={[styles.emptyTitle, { color: "#F8FAFC" }]}>No Assigned Mentees Yet</Text>
              <Text style={[styles.emptySub, { color: "#94A3B8" }]}>
                Students registered in your engineering tracks will appear here with live project code trees.
              </Text>
            </GlassCard>
          ) : (
            mentees.map((m) => {
              const project = typeof m.project === "object" ? m.project : {};
              const projectName = project?.name || m.project || "Full Stack Systems Architecture";
              const progressPct = project?.progress || m.progress || 45;
              const files = project?.files && project.files.length > 0 ? project.files : defaultSampleFiles;
              const commits = project?.commits && project.commits.length > 0 ? project.commits : [
                { hash: "8f4a1c2", author: m.name, message: "feat: initial system architecture setup", timestamp: "Yesterday" },
                { hash: "3e9b0d1", author: m.name, message: "fix: token refresh race condition", timestamp: "2 days ago" },
              ];

              return (
                <GlassCard key={m.id} style={[styles.menteeCard, { backgroundColor: "#0E1015", borderColor: "rgba(204, 255, 0, 0.18)" }]} elevated>
                  {/* STUDENT IDENTITY HEADER */}
                  <View style={styles.cardHeader}>
                    <Image
                      source={{ uri: m.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150" }}
                      style={styles.avatar}
                    />
                    <View style={styles.headerText}>
                      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                        <Text style={[styles.name, { color: "#F8FAFC" }]}>{m.name}</Text>
                        <View style={[styles.gitPointsBadge, { backgroundColor: "rgba(204, 255, 0, 0.12)", borderColor: "rgba(204, 255, 0, 0.3)" }]}>
                          <Ionicons name="flash" size={10} color="#CCFF00" />
                          <Text style={[styles.gitPointsText, { color: "#CCFF00" }]}>{m.gitPoints || 150} pts</Text>
                        </View>
                      </View>
                      <Text style={[styles.email, { color: "#94A3B8" }]}>{m.email}</Text>
                    </View>
                  </View>

                  {/* PROJECT REPO SUMMARY */}
                  <View style={[styles.projectSection, { borderTopColor: "rgba(255, 255, 255, 0.08)" }]}>
                    <View style={styles.projectInfoRow}>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 6, flex: 1 }}>
                        <Ionicons name="folder-outline" size={14} color="#CCFF00" />
                        <Text style={[styles.projectName, { color: "#F8FAFC" }]} numberOfLines={1}>
                          {projectName}
                        </Text>
                      </View>
                      <View style={[styles.branchPill, { backgroundColor: "#141720", borderColor: "#1E2638" }]}>
                        <Ionicons name="git-branch-outline" size={10} color="#94A3B8" />
                        <Text style={[styles.branchText, { color: "#94A3B8" }]}>{project?.branch || "main"}</Text>
                      </View>
                    </View>

                    {/* SUBTLE PROGRESS BAR */}
                    <View style={styles.progressBarWrap}>
                      <View style={styles.progressTextRow}>
                        <Text style={[styles.progressTitle, { color: "#64748B" }]}>Sprint Velocity</Text>
                        <Text style={[styles.progressPct, { color: "#CCFF00" }]}>{progressPct}%</Text>
                      </View>
                      <View style={[styles.progressTrack, { backgroundColor: "#141720" }]}>
                        <View
                          style={[
                            styles.progressFill,
                            { width: `${progressPct}%`, backgroundColor: "#CCFF00" },
                          ]}
                        />
                      </View>
                    </View>

                    {/* SOURCE FILES & COMMITS META COUNT */}
                    <View style={styles.metaCountsRow}>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                        <Ionicons name="document-text-outline" size={12} color="#94A3B8" />
                        <Text style={[styles.metaCountText, { color: "#94A3B8" }]}>{files.length} Source Files</Text>
                      </View>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                        <Ionicons name="git-commit-outline" size={12} color="#94A3B8" />
                        <Text style={[styles.metaCountText, { color: "#94A3B8" }]}>{commits.length} Commits</Text>
                      </View>
                    </View>
                  </View>

                  {/* ACTION BUTTONS (SUBTLE, PROPER PADDING) */}
                  <View style={styles.cardFooter}>
                    <TouchableOpacity
                      activeOpacity={0.8}
                      style={[styles.inspectBtn, { backgroundColor: "#141720", borderColor: "rgba(204, 255, 0, 0.3)" }]}
                      onPress={() => handleOpenInspect(m)}
                    >
                      <Ionicons name="code-slash" size={13} color="#CCFF00" />
                      <Text style={[styles.inspectBtnText, { color: "#CCFF00" }]}>Inspect Code</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      activeOpacity={0.8}
                      style={[styles.reviewBtn, { backgroundColor: "#CCFF00" }]}
                      onPress={() => handleOpenReview(m)}
                    >
                      <Ionicons name="star" size={13} color="#08090A" />
                      <Text style={[styles.reviewBtnText, { color: "#08090A" }]}>Review</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      activeOpacity={0.8}
                      style={[styles.chatBtn, { backgroundColor: "#141720", borderColor: "#1E2638" }]}
                      onPress={() => navigation.navigate("ChatTab", { recipient: m.name })}
                    >
                      <Ionicons name="chatbubbles-outline" size={14} color="#F8FAFC" />
                    </TouchableOpacity>
                  </View>
                </GlassCard>
              );
            })
          )}
        </View>
      </ScrollView>

      {/* 📁 FULL PROJECT CODE INSPECTOR MODAL */}
      <Modal
        visible={!!inspectingMentee}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setInspectingMentee(null)}
      >
        <SafeAreaView style={[styles.inspectModalRoot, { backgroundColor: "#08090A" }]}>
          {/* MODAL HEADER */}
          <View style={[styles.inspectHeader, { backgroundColor: "#0E1015", borderBottomColor: "rgba(204, 255, 0, 0.2)" }]}>
            <TouchableOpacity
              onPress={() => setInspectingMentee(null)}
              style={styles.inspectBackBtn}
            >
              <Ionicons name="close" size={22} color="#F8FAFC" />
            </TouchableOpacity>

            <View style={{ flex: 1, marginLeft: 10 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <Text style={[styles.inspectProjectTitle, { color: "#F8FAFC" }]} numberOfLines={1}>
                  {typeof inspectingMentee?.project === "object"
                    ? inspectingMentee.project?.name
                    : inspectingMentee?.project || "Project"}
                </Text>
                <View style={[styles.lockPill, { backgroundColor: "rgba(204, 255, 0, 0.1)", borderColor: "rgba(204, 255, 0, 0.3)" }]}>
                  <Ionicons name="lock-closed" size={9} color="#CCFF00" />
                  <Text style={[styles.lockPillText, { color: "#CCFF00" }]}>READ-ONLY</Text>
                </View>
              </View>
              <Text style={[styles.inspectSub, { color: "#94A3B8" }]}>
                {inspectingMentee?.name} • git: {inspectingMentee?.project?.branch || "main"}
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.inspectReviewAction, { backgroundColor: "#CCFF00" }]}
              onPress={() => {
                const target = inspectingMentee;
                setInspectingMentee(null);
                handleOpenReview(target);
              }}
            >
              <Ionicons name="star" size={13} color="#08090A" />
              <Text style={{ fontSize: 11, fontWeight: "900", color: "#08090A", marginLeft: 4 }}>Review</Text>
            </TouchableOpacity>
          </View>

          {/* INSPECT SUB-TABS (FILES, COMMITS, MEMBERS) */}
          <View style={[styles.inspectTabBar, { backgroundColor: "#0E1015", borderBottomColor: "#1E2638" }]}>
            {[
              { id: "files", label: "Files", icon: "document-text-outline" },
              { id: "commits", label: "Commits", icon: "git-commit-outline" },
              { id: "members", label: "Team", icon: "people-outline" },
            ].map((tab) => {
              const active = activeInspectTab === tab.id;
              return (
                <TouchableOpacity
                  key={tab.id}
                  style={[
                    styles.inspectTabBtn,
                    active && { borderBottomColor: "#CCFF00", borderBottomWidth: 2 },
                  ]}
                  onPress={() => setActiveInspectTab(tab.id)}
                >
                  <Ionicons name={tab.icon} size={14} color={active ? "#CCFF00" : "#94A3B8"} />
                  <Text style={[styles.inspectTabText, { color: active ? "#CCFF00" : "#94A3B8", fontWeight: active ? "800" : "600" }]}>
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* TAB CONTENT: 1. SOURCE FILES */}
          {activeInspectTab === "files" && (
            <View style={{ flex: 1 }}>
              {/* FILE SELECTOR PILL BAR */}
              <View style={[styles.filePillsBar, { backgroundColor: "#0C0E12", borderBottomColor: "#141720" }]}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 12, gap: 6, alignItems: "center" }}>
                  {(inspectingMentee?.project?.files && inspectingMentee.project.files.length > 0
                    ? inspectingMentee.project.files
                    : defaultSampleFiles
                  ).map((f, idx) => {
                    const isSelected = selectedFileIdx === idx;
                    return (
                      <TouchableOpacity
                        key={idx}
                        activeOpacity={0.8}
                        onPress={() => setSelectedFileIdx(idx)}
                        style={[
                          styles.fileSelectorPill,
                          {
                            backgroundColor: isSelected ? "#141720" : "transparent",
                            borderColor: isSelected ? "#CCFF00" : "rgba(255,255,255,0.08)",
                          },
                        ]}
                      >
                        <Ionicons
                          name={f.path.endsWith(".jsx") || f.path.endsWith(".js") ? "logo-javascript" : "document-text-outline"}
                          size={12}
                          color={isSelected ? "#CCFF00" : "#94A3B8"}
                        />
                        <Text style={[styles.fileSelectorPillText, { color: isSelected ? "#F8FAFC" : "#94A3B8", fontWeight: isSelected ? "800" : "600" }]}>
                          {f.path.split("/").pop()}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>

              {/* ACTIVE FILE CODE VIEWER */}
              {(() => {
                const currentFiles =
                  inspectingMentee?.project?.files && inspectingMentee.project.files.length > 0
                    ? inspectingMentee.project.files
                    : defaultSampleFiles;
                const activeFile = currentFiles[selectedFileIdx] || currentFiles[0];
                const lines = (activeFile?.content || "// Empty file").split("\n");

                return (
                  <View style={styles.codeViewerContainer}>
                    {/* BREADCRUMB / PATH BAR */}
                    <View style={[styles.codeViewerPathBar, { backgroundColor: "#0E1015", borderBottomColor: "#141720" }]}>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                        <Ionicons name="code-working" size={13} color="#CCFF00" />
                        <Text style={{ fontSize: 11, fontFamily: "monospace", color: "#F8FAFC", fontWeight: "700" }}>
                          {activeFile?.path}
                        </Text>
                      </View>
                      <Text style={{ fontSize: 10, color: "#64748B" }}>{lines.length} lines</Text>
                    </View>

                    {/* CODE LINES SCROLLER */}
                    <ScrollView style={styles.codeScroll} showsVerticalScrollIndicator contentContainerStyle={{ paddingVertical: 12 }}>
                      {lines.map((line, lIdx) => (
                        <View key={lIdx} style={styles.codeLineRow}>
                          <Text style={styles.codeLineNumber}>{lIdx + 1}</Text>
                          <Text style={[styles.codeLineText, { color: line.startsWith("//") ? "#64748B" : line.includes("import") || line.includes("export") || line.includes("function") ? "#CCFF00" : "#F8FAFC" }]}>
                            {line}
                          </Text>
                        </View>
                      ))}
                    </ScrollView>
                  </View>
                );
              })()}
            </View>
          )}

          {/* TAB CONTENT: 2. COMMITS */}
          {activeInspectTab === "commits" && (
            <ScrollView style={{ flex: 1, padding: 14 }} showsVerticalScrollIndicator={false}>
              {(inspectingMentee?.project?.commits && inspectingMentee.project.commits.length > 0
                ? inspectingMentee.project.commits
                : [
                    { hash: "8f4a1c2", author: inspectingMentee?.name, message: "feat: initial system architecture setup", timestamp: "Yesterday" },
                    { hash: "3e9b0d1", author: inspectingMentee?.name, message: "fix: token refresh race condition", timestamp: "2 days ago" },
                  ]
              ).map((c, idx) => (
                <View key={idx} style={[styles.commitCard, { backgroundColor: "#0E1015", borderColor: "#1E2638" }]}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                    <View style={[styles.hashPill, { backgroundColor: "rgba(204, 255, 0, 0.12)", borderColor: "rgba(204, 255, 0, 0.3)" }]}>
                      <Text style={[styles.hashText, { color: "#CCFF00" }]}>{c.hash}</Text>
                    </View>
                    <Text style={{ fontSize: 10, color: "#64748B" }}>
                      {typeof c.timestamp === "object" ? "Recent" : c.timestamp}
                    </Text>
                  </View>
                  <Text style={[styles.commitMsg, { color: "#F8FAFC" }]}>{c.message}</Text>
                  <Text style={[styles.commitAuthor, { color: "#94A3B8" }]}>Committed by {c.author}</Text>
                </View>
              ))}
            </ScrollView>
          )}

          {/* TAB CONTENT: 3. TEAM MEMBERS */}
          {activeInspectTab === "members" && (
            <ScrollView style={{ flex: 1, padding: 14 }} showsVerticalScrollIndicator={false}>
              {(inspectingMentee?.project?.members && inspectingMentee.project.members.length > 0
                ? inspectingMentee.project.members
                : [
                    { name: inspectingMentee?.name, role: "Lead Developer", email: inspectingMentee?.email },
                    { name: "Elena Rostova", role: "Mentor Advisor", email: "elena@buildverse.io" },
                  ]
              ).map((m, idx) => (
                <View key={idx} style={[styles.memberCard, { backgroundColor: "#0E1015", borderColor: "#1E2638" }]}>
                  <View style={styles.memberAvatarCircle}>
                    <Text style={{ fontSize: 14, fontWeight: "900", color: "#CCFF00" }}>{m.name?.[0] || "U"}</Text>
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={[styles.memberName, { color: "#F8FAFC" }]}>{m.name}</Text>
                    <Text style={[styles.memberEmail, { color: "#94A3B8" }]}>{m.email}</Text>
                  </View>
                  <View style={[styles.rolePill, { backgroundColor: "#141720", borderColor: "#1E2638" }]}>
                    <Text style={[styles.rolePillText, { color: "#CCFF00" }]}>{m.role}</Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          )}
        </SafeAreaView>
      </Modal>

      {/* ⭐️ INTERACTIVE PROJECT REVIEW MODAL */}
      <Modal
        visible={!!reviewingMentee}
        animationType="slide"
        transparent
        onRequestClose={() => setReviewingMentee(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: "#0E1015", borderColor: "rgba(204, 255, 0, 0.25)" }]}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={[styles.modalTitle, { color: "#F8FAFC" }]}>Review Project</Text>
                <Text style={{ fontSize: 11, color: "#94A3B8", marginTop: 2 }}>
                  {reviewingMentee?.name} •{" "}
                  {typeof reviewingMentee?.project === "object"
                    ? reviewingMentee.project?.name
                    : reviewingMentee?.project}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setReviewingMentee(null)}>
                <Ionicons name="close-circle" size={22} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 10 }}>
              {/* STAR RATING PICKER */}
              <Text style={{ fontSize: 11, fontWeight: "800", color: "#94A3B8", textTransform: "uppercase", marginBottom: 6 }}>
                Architecture Quality Rating:
              </Text>
              <View style={{ flexDirection: "row", gap: 8, marginBottom: 14 }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity
                    key={star}
                    activeOpacity={0.8}
                    onPress={() => setReviewRating(star)}
                    style={{
                      padding: 8,
                      borderRadius: 12,
                      backgroundColor: reviewRating >= star ? "rgba(204, 255, 0, 0.15)" : "#141720",
                      borderWidth: 1,
                      borderColor: reviewRating >= star ? "#CCFF00" : "#1E2638",
                    }}
                  >
                    <Ionicons
                      name={reviewRating >= star ? "star" : "star-outline"}
                      size={22}
                      color={reviewRating >= star ? "#CCFF00" : "#64748B"}
                    />
                  </TouchableOpacity>
                ))}
              </View>

              {/* REVIEW STATUS PICKER */}
              <Text style={{ fontSize: 11, fontWeight: "800", color: "#94A3B8", textTransform: "uppercase", marginBottom: 6 }}>
                Merge Status:
              </Text>
              <View style={{ flexDirection: "row", gap: 8, marginBottom: 14 }}>
                {["Approved", "Changes Requested", "Pending"].map((st) => (
                  <TouchableOpacity
                    key={st}
                    activeOpacity={0.8}
                    onPress={() => setReviewStatus(st)}
                    style={{
                      flex: 1,
                      paddingVertical: 9,
                      borderRadius: 12,
                      alignItems: "center",
                      backgroundColor: reviewStatus === st ? "#CCFF00" : "#141720",
                      borderWidth: 1,
                      borderColor: reviewStatus === st ? "#CCFF00" : "#1E2638",
                    }}
                  >
                    <Text style={{ fontSize: 10, fontWeight: "800", color: reviewStatus === st ? "#08090A" : "#F8FAFC" }}>
                      {st}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* CRITIQUE COMMENT */}
              <Text style={{ fontSize: 11, fontWeight: "800", color: "#94A3B8", textTransform: "uppercase", marginBottom: 6 }}>
                Mentor Feedback & Code Critique:
              </Text>
              <TextInput
                style={[styles.modalInput, { backgroundColor: "#141720", borderColor: "#1E2638", color: "#F8FAFC", height: 72, textAlignVertical: "top" }]}
                value={reviewComment}
                onChangeText={setReviewComment}
                multiline
                placeholder="Provide architectural critique or merge approvals..."
                placeholderTextColor="#64748B"
              />

              {/* ARCHITECTURE QUERY */}
              <Text style={{ fontSize: 11, fontWeight: "800", color: "#94A3B8", textTransform: "uppercase", marginTop: 10, marginBottom: 6 }}>
                Query for Mentee (Optional):
              </Text>
              <TextInput
                style={[styles.modalInput, { backgroundColor: "#141720", borderColor: "#1E2638", color: "#F8FAFC" }]}
                value={reviewQuery}
                onChangeText={setReviewQuery}
                placeholder="e.g. How does this handle connection retries?"
                placeholderTextColor="#64748B"
              />

              <TouchableOpacity
                activeOpacity={0.8}
                disabled={isSubmittingReview}
                style={[styles.saveBtn, { backgroundColor: "#CCFF00", marginTop: 16 }]}
                onPress={handleSubmitReview}
              >
                <Text style={{ color: "#08090A", fontWeight: "900", fontSize: 12 }}>
                  {isSubmittingReview
                    ? "Recording Review..."
                    : `Award +${reviewRating * 20 + (reviewStatus === "Approved" ? 50 : 10)} GitPoints & Submit ✓`}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  scrollContainer: { padding: 16, paddingBottom: 40 },
  header: { marginBottom: 16 },
  badgeRow: { flexDirection: "row", marginBottom: 6 },
  badgePill: { paddingHorizontal: 8, paddingVertical: 2.5, borderRadius: 9999, borderWidth: 1 },
  badgePillText: { fontSize: 9, fontWeight: "800", letterSpacing: 0.8 },
  headerTitle: { fontSize: 22, fontWeight: "900", letterSpacing: -0.5 },
  headerSub: { fontSize: 12, marginTop: 3, lineHeight: 16 },
  menteeList: { gap: 12 },
  menteeCard: { padding: 15, borderRadius: 16, borderWidth: 1 },
  cardHeader: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  avatar: { width: 42, height: 42, borderRadius: 21, borderWidth: 1.5, borderColor: "rgba(204, 255, 0, 0.4)", marginRight: 10 },
  headerText: { flex: 1 },
  name: { fontSize: 15, fontWeight: "800" },
  email: { fontSize: 11, marginTop: 1 },
  gitPointsBadge: { flexDirection: "row", alignItems: "center", gap: 3, paddingHorizontal: 7, paddingVertical: 2.5, borderRadius: 9999, borderWidth: 1 },
  gitPointsText: { fontSize: 10, fontWeight: "800" },
  projectSection: { borderTopWidth: 1, paddingTop: 10, marginBottom: 12 },
  projectInfoRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 },
  projectName: { fontSize: 13, fontWeight: "700" },
  branchPill: { flexDirection: "row", alignItems: "center", gap: 3, paddingHorizontal: 7, paddingVertical: 2.5, borderRadius: 6, borderWidth: 1 },
  branchText: { fontSize: 10, fontFamily: "monospace", fontWeight: "700" },
  progressBarWrap: { marginTop: 2 },
  progressTextRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  progressTitle: { fontSize: 10, fontWeight: "600" },
  progressPct: { fontSize: 11, fontWeight: "800" },
  progressTrack: { height: 5, borderRadius: 2.5, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 2.5 },
  metaCountsRow: { flexDirection: "row", gap: 14, marginTop: 8 },
  metaCountText: { fontSize: 10 },
  cardFooter: { flexDirection: "row", gap: 8 },
  inspectBtn: { flex: 2, flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 8, borderRadius: 10, borderWidth: 1, gap: 5 },
  inspectBtnText: { fontSize: 11, fontWeight: "800" },
  reviewBtn: { flex: 2, flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 8, borderRadius: 10, gap: 5 },
  reviewBtnText: { fontSize: 11, fontWeight: "900" },
  chatBtn: { width: 36, height: 34, alignItems: "center", justifyContent: "center", borderRadius: 10, borderWidth: 1 },
  emptyCard: { padding: 28, alignItems: "center", justifyContent: "center", borderRadius: 18, borderWidth: 1, borderStyle: "dashed" },
  emptyTitle: { fontSize: 15, fontWeight: "800", marginTop: 10, textAlign: "center" },
  emptySub: { fontSize: 11, lineHeight: 16, marginTop: 4, textAlign: "center", maxWidth: 260 },
  inspectModalRoot: { flex: 1 },
  inspectHeader: { flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingVertical: 10, borderBottomWidth: 1 },
  inspectBackBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: "#141720", alignItems: "center", justifyContent: "center" },
  inspectProjectTitle: { fontSize: 14, fontWeight: "800" },
  inspectSub: { fontSize: 10, marginTop: 1 },
  lockPill: { flexDirection: "row", alignItems: "center", gap: 3, paddingHorizontal: 5, paddingVertical: 1.5, borderRadius: 4, borderWidth: 1 },
  lockPillText: { fontSize: 8, fontWeight: "900", letterSpacing: 0.5 },
  inspectReviewAction: { flexDirection: "row", alignItems: "center", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  inspectTabBar: { flexDirection: "row", borderBottomWidth: 1, paddingHorizontal: 10 },
  inspectTabBtn: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 12, paddingVertical: 10 },
  inspectTabText: { fontSize: 12 },
  filePillsBar: { height: 42, borderBottomWidth: 1 },
  fileSelectorPill: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, borderWidth: 1 },
  fileSelectorPillText: { fontSize: 11 },
  codeViewerContainer: { flex: 1, backgroundColor: "#060709" },
  codeViewerPathBar: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 14, paddingVertical: 8, borderBottomWidth: 1 },
  codeScroll: { flex: 1, paddingHorizontal: 10 },
  codeLineRow: { flexDirection: "row", alignItems: "flex-start", paddingVertical: 1.5 },
  codeLineNumber: { width: 28, fontSize: 11, fontFamily: "monospace", color: "#475569", textAlign: "right", marginRight: 12 },
  codeLineText: { flex: 1, fontSize: 11, fontFamily: "monospace", lineHeight: 17 },
  commitCard: { padding: 12, borderRadius: 12, borderWidth: 1, marginBottom: 8 },
  hashPill: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, borderWidth: 1 },
  hashText: { fontSize: 10, fontFamily: "monospace", fontWeight: "800" },
  commitMsg: { fontSize: 12, fontWeight: "700", marginTop: 6 },
  commitAuthor: { fontSize: 10, marginTop: 2 },
  memberCard: { flexDirection: "row", alignItems: "center", padding: 12, borderRadius: 12, borderWidth: 1, marginBottom: 8 },
  memberAvatarCircle: { width: 34, height: 34, borderRadius: 17, backgroundColor: "#141720", alignItems: "center", justifyContent: "center" },
  memberName: { fontSize: 13, fontWeight: "800" },
  memberEmail: { fontSize: 11, marginTop: 1 },
  rolePill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, borderWidth: 1 },
  rolePillText: { fontSize: 9, fontWeight: "800" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.85)", justifyContent: "center", alignItems: "center", padding: 16 },
  modalCard: { width: "100%", maxHeight: "90%", borderRadius: 20, borderWidth: 1, padding: 18 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  modalTitle: { fontSize: 16, fontWeight: "900" },
  modalInput: { borderRadius: 10, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 8, fontSize: 12, marginBottom: 8 },
  saveBtn: { paddingVertical: 11, borderRadius: 10, alignItems: "center" },
});

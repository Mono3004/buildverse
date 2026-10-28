import React, { useState, useEffect } from "react";
import {
  Image,
  Linking,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import GlassCard from "../../components/GlassCard";
import CustomButton from "../../components/CustomButton";
import CertificateModal from "../../components/CertificateModal";
import { getCourses, fetchCourses, getReviews, fetchReviews } from "../../lib/workspaceData";
import { darkColors, lightColors, theme, useThemeMode } from "../../theme";

export default function StudentDashboardScreen({ navigation }) {
  const themeMode = typeof useThemeMode === "function" ? useThemeMode() : null;
  const isDarkMode = themeMode?.isDarkMode ?? true;
  const colors = themeMode?.themeColors || (isDarkMode ? darkColors : lightColors);

  const [courses, setCourses] = useState(() => {
    try {
      const data = typeof getCourses === "function" ? getCourses() : [];
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  });
  const [reviews, setReviews] = useState(() => {
    try {
      const data = typeof getReviews === "function" ? getReviews() : [];
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  });
  const [certCourse, setCertCourse] = useState(null);

  // PROJECT FILES INSPECTION STATE FOR STUDENT
  const [inspectingReview, setInspectingReview] = useState(null);
  const [selectedFileIdx, setSelectedFileIdx] = useState(0);

  useEffect(() => {
    try {
      if (typeof fetchCourses === "function") {
        fetchCourses().then((c) => {
          if (c && c.length) setCourses(c);
        }).catch(() => {});
      }
      if (typeof fetchReviews === "function") {
        fetchReviews().then((r) => {
          if (r && r.length) setReviews(r);
        }).catch(() => {});
      }
    } catch (_e) {}
  }, []);

  const defaultSampleFiles = [
    {
      path: "src/App.jsx",
      content: `// Main Application Component\nimport React from 'react';\n\nexport default function App() {\n  return (\n    <div className="app-container">\n      <h1>BuildVerse Engineering Workspace</h1>\n      <p>Status: Active Deployment</p>\n    </div>\n  );\n}`,
    },
    {
      path: "src/config/database.js",
      content: `// Database configuration\nconst mongoose = require('mongoose');\n\nconst connectDB = async () => {\n  try {\n    await mongoose.connect(process.env.MONGO_URI);\n    console.log('MongoDB Connected successfully');\n  } catch (err) {\n    console.error(err.message);\n  }\n};\n\nmodule.exports = connectDB;`,
    },
    {
      path: "package.json",
      content: `{\n  "name": "buildverse-mentee-project",\n  "version": "1.0.0",\n  "dependencies": {\n    "react": "^18.3.1",\n    "mongoose": "^8.0.0"\n  }\n}`,
    },
    {
      path: "README.md",
      content: `# Project Workspace\n\nBuilt under BuildVerse mentorship guidance.\n- 100% test coverage\n- Monitored microservices\n- Clean architecture`,
    },
  ];

  // STATS MATCHING WEB DASHBOARD IN SUBTLE NEON GREEN & BLACK
  const stats = [
    { label: "Active Projects", value: "2", icon: "folder-open" },
    { label: "Issues Resolved", value: "14", icon: "checkmark-done-circle" },
    { label: "Masterclasses", value: "3", icon: "school" },
    { label: "Cumulative GPA", value: "3.92", icon: "ribbon" },
  ];

  const completedCourse = courses.find((c) => c.progress === 100) || courses[0];
  const inProgressCourse = courses.find((c) => c.progress < 100) || courses[1];

  const handleOpenVideo = (videoUrl) => {
    if (videoUrl) {
      Linking.openURL(videoUrl).catch(() => {});
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: "#08090A" }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* STUDENT WELCOME HEADER */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.badgePill}>
              <Text style={styles.badgePillText}>STUDENT WORKSPACE</Text>
            </View>
            <Text style={[styles.title, { color: "#F8FAFC" }]}>Welcome back, Alex Chen</Text>
            <Text style={[styles.subtitle, { color: "#94A3B8" }]}>
              Full Stack Systems Track • 24 / 30 Credits Earned
            </Text>
          </View>
          <Image
            source={{ uri: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150" }}
            style={styles.profileAvatar}
          />
        </View>

        {/* 4 WORKSPACE TELEMETRY BENTO CARDS */}
        <View style={styles.statsGrid}>
          {stats.map((s, idx) => (
            <GlassCard key={idx} elevated style={styles.statCard}>
              <View style={styles.statTop}>
                <Text style={styles.statLabel}>{s.label}</Text>
                <View style={styles.statIconWrap}>
                  <Ionicons name={s.icon} size={14} color="#CCFF00" />
                </View>
              </View>
              <Text style={styles.statVal}>{s.value}</Text>
            </GlassCard>
          ))}
        </View>

        {/* FAST MODULE LAUNCHER BUTTONS */}
        <View style={styles.fastActionRow}>
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.fastActionBtn}
            onPress={() => navigation.navigate("CoursesTab")}
          >
            <Ionicons name="school" size={16} color="#CCFF00" />
            <Text style={styles.fastActionText}>Masterclasses</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.fastActionBtn}
            onPress={() => navigation.navigate("PortfolioTab")}
          >
            <Ionicons name="ribbon" size={16} color="#CCFF00" />
            <Text style={styles.fastActionText}>Diplomas</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.fastActionBtn}
            onPress={() => navigation.navigate("ProjectsTab")}
          >
            <Ionicons name="folder" size={16} color="#CCFF00" />
            <Text style={styles.fastActionText}>Projects</Text>
          </TouchableOpacity>
        </View>

        {/* ENROLLED CLASSROOM (VIDEO LECTURE & MILESTONES) */}
        <View style={styles.sectionTitleRow}>
          <Text style={[styles.sectionHeading, { color: "#F8FAFC" }]}>Enrolled Classroom</Text>
          <TouchableOpacity onPress={() => navigation.navigate("CoursesTab")}>
            <Text style={styles.seeAllText}>View All →</Text>
          </TouchableOpacity>
        </View>

        {/* IN-PROGRESS COURSE CARD */}
        {inProgressCourse && (
          <GlassCard elevated style={styles.courseCard}>
            <View style={styles.courseHeader}>
              <View style={styles.courseLevelPill}>
                <Text style={styles.courseLevelText}>{inProgressCourse.level || "Core"}</Text>
              </View>
              <View style={styles.durationRow}>
                <Ionicons name="time-outline" size={12} color="#94A3B8" />
                <Text style={styles.durationText}>{inProgressCourse.duration}</Text>
              </View>
            </View>

            <Text style={styles.courseTitle}>{inProgressCourse.title}</Text>
            <Text style={styles.courseDesc} numberOfLines={2}>
              {inProgressCourse.description}
            </Text>

            {/* PROGRESS BAR */}
            <View style={styles.progressSection}>
              <View style={styles.progressLabels}>
                <Text style={styles.progressLabelText}>Curriculum Completion</Text>
                <Text style={styles.progressPercent}>{inProgressCourse.progress}%</Text>
              </View>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${inProgressCourse.progress}%` }]} />
              </View>
            </View>

            {/* LECTURE VIDEO LAUNCHER */}
            <View style={styles.courseFooter}>
              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.watchVideoBtn}
                onPress={() => handleOpenVideo(inProgressCourse.videoUrl)}
              >
                <Ionicons name="play" size={13} color="#08090A" />
                <Text style={styles.watchVideoBtnText}>Watch Next Video Lecture</Text>
              </TouchableOpacity>
            </View>
          </GlassCard>
        )}

        {/* OFFICIAL DIPLOMA EARNED CARD */}
        {completedCourse && (
          <GlassCard elevated style={styles.diplomaCard}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Text style={{ fontSize: 24, marginRight: 10 }}>🏆</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.diplomaBadge}>OFFICIAL CREDENTIAL ISSUED</Text>
                <Text style={styles.diplomaTitle}>{completedCourse.title}</Text>
                <Text style={styles.diplomaSub}>
                  All modules complete • Certificate ID: BV-CERT-9042
                </Text>
              </View>
            </View>
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.viewDiplomaBtn}
              onPress={() => setCertCourse(completedCourse)}
            >
              <Text style={styles.viewDiplomaBtnText}>🎓 View Verified Diploma</Text>
            </TouchableOpacity>
          </GlassCard>
        )}

        {/* ASSIGNED LEAD MENTOR CARD */}
        <View style={styles.sectionTitleRow}>
          <Text style={[styles.sectionHeading, { color: "#F8FAFC" }]}>Assigned Lead Mentor</Text>
        </View>
        <GlassCard elevated style={styles.mentorCard}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Image
              source={{ uri: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150" }}
              style={styles.mentorImg}
            />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                <Text style={styles.mentorName}>Elias Thorne</Text>
                <View style={styles.officeHourBadge}>
                  <View style={styles.onlineDot} />
                  <Text style={styles.officeHourText}>OFFICE HOURS</Text>
                </View>
              </View>
              <Text style={styles.mentorTrack}>Principal Systems Architect</Text>
              <Text style={styles.mentorSub}>12 Students • 4.9 Rating</Text>
              <TouchableOpacity
                style={styles.chatLinkRow}
                onPress={() => navigation.navigate("ChatTab")}
              >
                <Ionicons name="chatbubble-ellipses" size={13} color="#CCFF00" />
                <Text style={styles.chatLinkText}>Request PR Review / Message →</Text>
              </TouchableOpacity>
            </View>
          </View>
        </GlassCard>

        {/* ACTIVE ENGINEERING PROJECTS */}
        <View style={styles.sectionTitleRow}>
          <Text style={[styles.sectionHeading, { color: "#F8FAFC" }]}>Active Projects</Text>
          <TouchableOpacity onPress={() => navigation.navigate("ProjectsTab")}>
            <Text style={styles.seeAllText}>View All →</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.projectList}>
          <GlassCard style={styles.projectCard} elevated>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <View style={styles.projectIconBox}>
                  <Ionicons name="terminal" size={14} color="#CCFF00" />
                </View>
                <View style={{ marginLeft: 10 }}>
                  <Text style={styles.projectName}>Project Phoenix</Text>
                  <Text style={styles.projectSub}>Cloud Infrastructure V2</Text>
                </View>
              </View>
              <Text style={styles.projectProgress}>85%</Text>
            </View>
          </GlassCard>

          <GlassCard style={styles.projectCard} elevated>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <View style={styles.projectIconBox}>
                  <Ionicons name="rocket" size={14} color="#CCFF00" />
                </View>
                <View style={{ marginLeft: 10 }}>
                  <Text style={styles.projectName}>Aero Engine</Text>
                  <Text style={styles.projectSub}>High Perf Logic API • 12 Tasks</Text>
                </View>
              </View>
              <Text style={styles.projectProgress}>Active</Text>
            </View>
          </GlassCard>
        </View>

        {/* MENTOR PR REVIEWS & CODE EVALUATIONS */}
        <View style={[styles.sectionTitleRow, { marginTop: 18 }]}>
          <View>
            <Text style={[styles.sectionHeading, { color: "#F8FAFC" }]}>Mentor PR Reviews & GitPoints</Text>
            <Text style={{ fontSize: 11, color: "#94A3B8", marginTop: 2 }}>Real-time code evaluations from your lead mentor</Text>
          </View>
          <View style={styles.badgePill}>
            <Text style={styles.badgePillText}>{reviews.length} REVIEWS</Text>
          </View>
        </View>

        <View style={{ gap: 10 }}>
          {reviews.length === 0 ? (
            <GlassCard elevated style={{ padding: 14, alignItems: "center", borderRadius: 12 }}>
              <Ionicons name="code-working-outline" size={24} color="#94A3B8" />
              <Text style={{ color: "#94A3B8", fontSize: 11, marginTop: 4, textAlign: "center" }}>
                No active PR reviews yet. Push changes from Projects tab to request mentor code evaluation.
              </Text>
            </GlassCard>
          ) : (
            reviews.map((rev, idx) => {
              const isApproved = rev.status === "Approved";

              return (
                <GlassCard key={rev.id || idx} elevated style={styles.reviewCard}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <View style={{ flex: 1, paddingRight: 8 }}>
                      <Text style={styles.reviewPR}>{rev.PR}</Text>
                      <Text style={styles.reviewProject}>
                        📁 {rev.project} • Evaluated by {rev.mentor || "Elena Rostova"}
                      </Text>
                    </View>
                    <View style={[
                      styles.statusBadge,
                      {
                        backgroundColor: isApproved ? "rgba(204, 255, 0, 0.12)" : "rgba(255, 255, 255, 0.06)",
                        borderColor: isApproved ? "rgba(204, 255, 0, 0.25)" : "rgba(255, 255, 255, 0.1)",
                      }
                    ]}>
                      <Text style={[styles.statusBadgeText, { color: isApproved ? "#CCFF00" : "#94A3B8" }]}>
                        {rev.status || "Pending"}
                      </Text>
                    </View>
                  </View>

                  {/* RATING & GITPOINTS REWARD ROW */}
                  <View style={styles.reviewMetaRow}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 3 }}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Ionicons
                          key={star}
                          name={star <= (rev.rating || 0) ? "star" : "star-outline"}
                          size={13}
                          color={star <= (rev.rating || 0) ? "#CCFF00" : "#475569"}
                        />
                      ))}
                      <Text style={{ fontSize: 11, fontWeight: "800", color: "#F8FAFC", marginLeft: 4 }}>
                        {rev.rating ? `${rev.rating}.0 / 5.0` : "Pending Rating"}
                      </Text>
                    </View>

                    {rev.gitPoints > 0 && (
                      <View style={styles.gitPointsBadge}>
                        <Ionicons name="flash" size={10} color="#CCFF00" />
                        <Text style={styles.gitPointsText}>+{rev.gitPoints} GitPoints</Text>
                      </View>
                    )}
                  </View>

                  {/* COMMENTS / QUERY */}
                  {rev.query ? (
                    <View style={styles.queryBox}>
                      <Text style={styles.queryLabel}>Mentor Query:</Text>
                      <Text style={styles.queryText}>"{rev.query}"</Text>
                    </View>
                  ) : null}

                  {rev.comments && rev.comments.length > 0 ? (
                    <View style={styles.feedbackBox}>
                      <Text style={styles.feedbackLabel}>Mentor Critique:</Text>
                      <Text style={styles.feedbackText}>
                        "{rev.comments[rev.comments.length - 1].text}"
                      </Text>
                    </View>
                  ) : null}

                  {/* INSPECT FILES ACTION FOR STUDENT */}
                  <TouchableOpacity
                    activeOpacity={0.8}
                    style={styles.inspectBtn}
                    onPress={() => {
                      setInspectingReview(rev);
                      setSelectedFileIdx(0);
                    }}
                  >
                    <Ionicons name="code-slash" size={12} color="#CCFF00" />
                    <Text style={styles.inspectBtnText}>Inspect Project Code & Commits</Text>
                  </TouchableOpacity>
                </GlassCard>
              );
            })
          )}
        </View>
      </ScrollView>

      {/* VERIFIED DIPLOMA MODAL */}
      <CertificateModal
        visible={!!certCourse}
        course={certCourse}
        onClose={() => setCertCourse(null)}
      />

      {/* STUDENT PROJECT FILES VIEWER MODAL */}
      {inspectingReview && (
        <Modal
          visible={!!inspectingReview}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setInspectingReview(null)}
        >
          <View style={[styles.modalRoot, { backgroundColor: "#08090A" }]}>
            <View style={styles.modalHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalTitle} numberOfLines={1}>
                  {inspectingReview.project} / Source Files
                </Text>
                <Text style={styles.modalSub} numberOfLines={1}>
                  {inspectingReview.PR} · Branch: main
                </Text>
              </View>
              <TouchableOpacity style={styles.closeBtn} onPress={() => setInspectingReview(null)}>
                <Ionicons name="close" size={16} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            {/* FILE SELECTOR */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filesScroll}>
              {defaultSampleFiles.map((f, idx) => {
                const isSelected = selectedFileIdx === idx;
                return (
                  <TouchableOpacity
                    key={idx}
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
                    <Ionicons name="document-text-outline" size={11} color={isSelected ? "#CCFF00" : "#94A3B8"} />
                    <Text style={[styles.fileName, { color: isSelected ? "#CCFF00" : "#F8FAFC" }]}>
                      {f.path}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* CODE VIEWER */}
            <View style={styles.codeContainer}>
              <View style={styles.codeHeader}>
                <Text style={styles.codePath}>{defaultSampleFiles[selectedFileIdx]?.path}</Text>
                <Text style={styles.codeTag}>Read-Only</Text>
              </View>
              <ScrollView style={styles.codeScroll}>
                {(defaultSampleFiles[selectedFileIdx]?.content || "").split("\n").map((line, lIdx) => (
                  <View key={lIdx} style={styles.codeLineRow}>
                    <Text style={styles.lineNumber}>{lIdx + 1}</Text>
                    <Text style={[
                      styles.codeLineText,
                      line.startsWith("//") && { color: "#64748B", fontStyle: "italic" },
                      (line.includes("const ") || line.includes("import ") || line.includes("export ")) && { color: "#CCFF00" }
                    ]}>
                      {line}
                    </Text>
                  </View>
                ))}
              </ScrollView>
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setInspectingReview(null)}>
                <Text style={styles.modalCloseBtnText}>Close Source Viewer</Text>
              </TouchableOpacity>
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
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
  headerLeft: { flex: 1, paddingRight: 10 },
  badgePill: { alignSelf: "flex-start", paddingHorizontal: 8, paddingVertical: 2.5, borderRadius: 9999, borderWidth: 1, borderColor: "rgba(204, 255, 0, 0.25)", backgroundColor: "rgba(204, 255, 0, 0.1)", marginBottom: 6 },
  badgePillText: { fontSize: 9, fontWeight: "900", letterSpacing: 0.8, color: "#CCFF00" },
  title: { fontSize: 20, fontWeight: "900", letterSpacing: -0.5 },
  subtitle: { fontSize: 11, marginTop: 2 },
  profileAvatar: { width: 42, height: 42, borderRadius: 21, borderWidth: 1.5, borderColor: "rgba(204, 255, 0, 0.3)" },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", gap: 8, marginBottom: 14 },
  statCard: { width: "48%", padding: 10, borderRadius: 12, borderWidth: 1, borderColor: "rgba(255, 255, 255, 0.08)", backgroundColor: "#0E1015" },
  statTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  statLabel: { fontSize: 9, fontWeight: "800", textTransform: "uppercase", color: "#94A3B8" },
  statIconWrap: { width: 24, height: 24, borderRadius: 6, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(204, 255, 0, 0.1)" },
  statVal: { fontSize: 18, fontWeight: "900", marginTop: 4, color: "#F8FAFC" },
  fastActionRow: { flexDirection: "row", justifyContent: "space-between", gap: 8, marginBottom: 14 },
  fastActionBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 8, paddingHorizontal: 6, borderRadius: 10, borderWidth: 1, borderColor: "rgba(255, 255, 255, 0.08)", backgroundColor: "#0E1015", gap: 5 },
  fastActionText: { fontSize: 11, fontWeight: "700", color: "#F8FAFC" },
  sectionTitleRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8, marginTop: 6 },
  sectionHeading: { fontSize: 14, fontWeight: "900" },
  seeAllText: { fontSize: 11, fontWeight: "700", color: "#CCFF00" },
  courseCard: { padding: 12, borderRadius: 12, borderWidth: 1, borderColor: "rgba(255, 255, 255, 0.08)", backgroundColor: "#0E1015", marginBottom: 12 },
  courseHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  courseLevelPill: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, backgroundColor: "rgba(204, 255, 0, 0.1)" },
  courseLevelText: { fontSize: 9, fontWeight: "800", color: "#CCFF00" },
  durationRow: { flexDirection: "row", alignItems: "center", gap: 3 },
  durationText: { fontSize: 10, color: "#94A3B8" },
  courseTitle: { fontSize: 14, fontWeight: "800", marginTop: 6, color: "#F8FAFC" },
  courseDesc: { fontSize: 11, lineHeight: 15, marginTop: 3, color: "#94A3B8" },
  progressSection: { marginTop: 10 },
  progressLabels: { flexDirection: "row", justifyContent: "space-between", marginBottom: 3 },
  progressLabelText: { fontSize: 10, color: "#94A3B8" },
  progressPercent: { fontSize: 10, fontWeight: "800", color: "#CCFF00" },
  progressTrack: { height: 4, borderRadius: 2, backgroundColor: "#141720", overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 2, backgroundColor: "#CCFF00" },
  courseFooter: { marginTop: 10 },
  watchVideoBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5, paddingVertical: 7, borderRadius: 8, backgroundColor: "#CCFF00" },
  watchVideoBtnText: { fontSize: 11, fontWeight: "900", color: "#08090A" },
  diplomaCard: { padding: 12, borderRadius: 12, borderWidth: 1, borderColor: "rgba(204, 255, 0, 0.25)", backgroundColor: "#0E1015", marginBottom: 12 },
  diplomaBadge: { fontSize: 8, fontWeight: "900", letterSpacing: 0.8, color: "#CCFF00" },
  diplomaTitle: { fontSize: 13, fontWeight: "900", marginTop: 2, color: "#F8FAFC" },
  diplomaSub: { fontSize: 10, marginTop: 2, color: "#94A3B8" },
  viewDiplomaBtn: { marginTop: 10, paddingVertical: 6, borderRadius: 8, backgroundColor: "rgba(204, 255, 0, 0.12)", borderWidth: 1, borderColor: "rgba(204, 255, 0, 0.25)", alignItems: "center" },
  viewDiplomaBtnText: { fontSize: 11, fontWeight: "800", color: "#CCFF00" },
  mentorCard: { padding: 12, borderRadius: 12, borderWidth: 1, borderColor: "rgba(255, 255, 255, 0.08)", backgroundColor: "#0E1015", marginBottom: 14 },
  mentorImg: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: "rgba(204, 255, 0, 0.3)" },
  mentorName: { fontSize: 13, fontWeight: "800", color: "#F8FAFC" },
  officeHourBadge: { flexDirection: "row", alignItems: "center", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 9999, backgroundColor: "rgba(204, 255, 0, 0.1)" },
  onlineDot: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: "#CCFF00", marginRight: 4 },
  officeHourText: { fontSize: 8, fontWeight: "900", color: "#CCFF00" },
  mentorTrack: { fontSize: 10, marginTop: 1, color: "#94A3B8" },
  mentorSub: { fontSize: 9, marginTop: 1, color: "#64748B" },
  chatLinkRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 6 },
  chatLinkText: { fontSize: 10, fontWeight: "800", color: "#CCFF00" },
  projectList: { gap: 8 },
  projectCard: { padding: 10, borderRadius: 10, borderWidth: 1, borderColor: "rgba(255, 255, 255, 0.08)", backgroundColor: "#0E1015" },
  projectIconBox: { width: 28, height: 28, borderRadius: 6, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(204, 255, 0, 0.1)" },
  projectName: { fontSize: 12, fontWeight: "800", color: "#F8FAFC" },
  projectSub: { fontSize: 9, marginTop: 1, color: "#94A3B8" },
  projectProgress: { fontSize: 11, fontWeight: "800", color: "#CCFF00" },
  reviewCard: { padding: 12, borderRadius: 12, borderWidth: 1, borderColor: "rgba(255, 255, 255, 0.08)", backgroundColor: "#0E1015" },
  reviewPR: { fontSize: 12, fontWeight: "800", color: "#F8FAFC" },
  reviewProject: { fontSize: 10, marginTop: 2, color: "#94A3B8" },
  statusBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 9999, borderWidth: 1 },
  statusBadgeText: { fontSize: 8, fontWeight: "900" },
  reviewMetaRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 8 },
  gitPointsBadge: { flexDirection: "row", alignItems: "center", gap: 2, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 9999, borderWidth: 1, borderColor: "rgba(204, 255, 0, 0.3)", backgroundColor: "rgba(204, 255, 0, 0.1)" },
  gitPointsText: { fontSize: 9, fontWeight: "900", color: "#CCFF00" },
  queryBox: { padding: 8, borderRadius: 8, marginTop: 8, backgroundColor: "#141720", borderWidth: 1, borderColor: "rgba(255, 255, 255, 0.06)" },
  queryLabel: { fontSize: 8, fontWeight: "800", textTransform: "uppercase", marginBottom: 2, color: "#CCFF00" },
  queryText: { fontSize: 11, fontStyle: "italic", color: "#E2E8F0" },
  feedbackBox: { padding: 8, borderRadius: 8, marginTop: 6, backgroundColor: "rgba(204, 255, 0, 0.04)", borderWidth: 1, borderColor: "rgba(204, 255, 0, 0.2)" },
  feedbackLabel: { fontSize: 8, fontWeight: "800", textTransform: "uppercase", marginBottom: 2, color: "#CCFF00" },
  feedbackText: { fontSize: 11, fontWeight: "600", color: "#F8FAFC" },
  inspectBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5, marginTop: 8, paddingVertical: 6, borderRadius: 8, backgroundColor: "#141720", borderWidth: 1, borderColor: "rgba(204, 255, 0, 0.2)" },
  inspectBtnText: { fontSize: 10, fontWeight: "800", color: "#CCFF00" },
  // MODAL STYLES
  modalRoot: { flex: 1, paddingTop: 14 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 14, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: "rgba(255, 255, 255, 0.08)" },
  modalTitle: { fontSize: 13, fontWeight: "900", color: "#F8FAFC" },
  modalSub: { fontSize: 10, color: "#94A3B8", marginTop: 1 },
  closeBtn: { width: 28, height: 28, borderRadius: 6, backgroundColor: "#141720", alignItems: "center", justifyContent: "center" },
  filesScroll: { paddingHorizontal: 14, paddingVertical: 8, gap: 6 },
  fileChip: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 5, borderRadius: 6, borderWidth: 1 },
  fileName: { fontSize: 10, fontFamily: "monospace" },
  codeContainer: { flex: 1, marginHorizontal: 12, marginBottom: 8, borderRadius: 10, borderWidth: 1, borderColor: "rgba(255, 255, 255, 0.08)", backgroundColor: "#050608", overflow: "hidden" },
  codeHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 10, paddingVertical: 6, backgroundColor: "#0A0C10", borderBottomWidth: 1, borderBottomColor: "rgba(255, 255, 255, 0.06)" },
  codePath: { fontSize: 10, color: "#F8FAFC", fontFamily: "monospace" },
  codeTag: { fontSize: 8, color: "#CCFF00", fontWeight: "700" },
  codeScroll: { flex: 1, padding: 8 },
  codeLineRow: { flexDirection: "row", marginBottom: 2 },
  lineNumber: { width: 24, fontSize: 9, color: "#475569", fontFamily: "monospace", textAlign: "right", marginRight: 8 },
  codeLineText: { flex: 1, fontSize: 10, color: "#E2E8F0", fontFamily: "monospace" },
  modalFooter: { paddingHorizontal: 14, paddingVertical: 10, borderTopWidth: 1, borderTopColor: "rgba(255, 255, 255, 0.08)", backgroundColor: "#0A0C10", alignItems: "flex-end" },
  modalCloseBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: "#141720", borderWidth: 1, borderColor: "rgba(255, 255, 255, 0.08)" },
  modalCloseBtnText: { fontSize: 10, fontWeight: "700", color: "#94A3B8" },
});

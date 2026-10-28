import React, { useEffect, useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import GlassCard from "../components/GlassCard";
import CustomButton from "../components/CustomButton";
import IssueItem from "../components/IssueItem";
import { fetchIssues, fetchProjects, toggleIssueStatusApi } from "../lib/api";
import { darkColors, lightColors, useThemeMode } from "../theme";

const ACTIVE_PROJECTS = [
  { id: "p1", name: "Project Phoenix", subtitle: "Cloud Infrastructure V2", tag: "GitHub Sync", progress: 85, icon: "terminal" },
  { id: "p2", name: "Aero Engine", subtitle: "High Perf Logic API", tag: "Linear Tasks", pendingTasks: 12, icon: "rocket-outline" },
];

const RECENT_ACTIVITIES = [
  {
    id: "a1",
    user: "Sarah",
    action: "pushed 4 commits to main",
    time: "2 HOURS AGO",
    icon: "git-commit-outline",
    repo: "BuildVerse / Core Engine",
    branch: "main",
    commits: [
      "feat(auth): add JWT token refresh mechanism",
      "fix(ui): responsive card spacing for tablet layout",
      "refactor(db): Mongoose connection pooling optimization",
      "docs: update API endpoints documentation",
    ],
    stats: "+142 lines, -18 lines",
  },
  {
    id: "a2",
    user: "Alex",
    action: 'opened a new issue: "Auth redirect loop on OAuth login"',
    time: "5 HOURS AGO",
    icon: "alert-circle-outline",
    isError: true,
    repo: "BuildVerse / Web Auth",
    issueId: "#342",
    description: "OAuth callback handler enters infinite loop when token cookie expires during active session.",
    priority: "HIGH",
  },
  {
    id: "a3",
    user: "Community",
    action: "New event in 'React Delhi' community",
    time: "YESTERDAY",
    icon: "calendar-outline",
    isEvent: true,
    eventTitle: "React & Next.js 14 Ecosystem Deep Dive",
    location: "Connaught Place, Delhi & YouTube Live",
    attendees: 142,
  },
];

export default function DashboardScreen({ navigation }) {
  const themeMode = typeof useThemeMode === "function" ? useThemeMode() : null;
  const colors = themeMode?.themeColors || (themeMode?.isDarkMode ? darkColors : lightColors) || darkColors;

  const [streakCount, setStreakCount] = useState(14);
  const [toastMessage, setToastMessage] = useState("");
  const [issues, setIssues] = useState([]);
  const [projects, setProjects] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const [selectedActivity, setSelectedActivity] = useState(null);

  useEffect(() => {
    fetchIssues().then(setIssues);
    fetchProjects().then(setProjects);
  }, []);

  const handleToggleIssue = async (id, currentStatus) => {
    const nextStatus = currentStatus === "resolved" ? "open" : "resolved";
    
    setIssues((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: nextStatus } : item))
    );

    if (nextStatus === "resolved") {
      setStreakCount((prev) => prev + 1);
      setToastMessage("🔥 Issue resolved! +1 Streak Day Added!");
      setTimeout(() => setToastMessage(""), 3000);
    }

    try {
      await toggleIssueStatusApi(id, nextStatus);
    } catch (err) {
      console.log("[Dashboard] Issue Toggle Error:", err.message);
    }
  };

  const filteredIssues = issues.filter((issue) => {
    if (activeTab === "pending") return issue.status !== "resolved";
    if (activeTab === "resolved") return issue.status === "resolved";
    return true;
  });

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* BRAND TOP BAR */}
        <View style={styles.brandRow}>
          <Text style={[styles.brandTitle, { color: colors.foreground }]}>
            BuildVerse<Text style={{ color: colors.amber }}>.</Text>
          </Text>
          <View style={styles.liveSyncPill}>
            <View style={[styles.liveSyncDot, { backgroundColor: colors.success }]} />
            <Text style={[styles.liveSyncText, { color: colors.success }]}>MongoDB Live</Text>
          </View>
        </View>

        {/* TOAST BANNER FOR STREAK INCREMENT */}
        {toastMessage ? (
          <GlassCard elevated glowing style={styles.toastCard}>
            <Ionicons name="flame" size={18} color={colors.amber} />
            <Text style={[styles.toastText, { color: colors.foreground }]}>{toastMessage}</Text>
          </GlassCard>
        ) : null}

        {/* STITCH HERO SECTION */}
        <View style={styles.heroSection}>
          <Text style={[styles.dashboardBadge, { color: colors.amber }]}>DASHBOARD</Text>
          <Text style={[styles.heroTitle, { color: colors.foreground }]}>Welcome back, Developer</Text>
          <Text style={[styles.heroSub, { color: colors.muted }]}>
            You have 3 shipping goals today. Let's build something remarkable.
          </Text>
        </View>

        {/* ACTIVE PROJECTS HORIZONTAL SCROLL */}
        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Active Projects</Text>
          <TouchableOpacity onPress={() => navigation.navigate("ProjectsTab")}>
            <Text style={[styles.viewAllText, { color: colors.amber }]}>View All ›</Text>
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
          {ACTIVE_PROJECTS.map((proj) => (
            <GlassCard key={proj.id} elevated style={styles.activeProjectCard}>
              <View style={styles.cardHeaderRow}>
                <View style={[styles.iconBox, { backgroundColor: colors.primary }]}>
                  <Ionicons name={proj.icon} size={20} color={isDarkMode ? "#000" : "#FFF"} />
                </View>
                <View style={[styles.tagBadge, { backgroundColor: colors.elevated }]}>
                  <Text style={[styles.tagBadgeText, { color: colors.muted }]}>{proj.tag}</Text>
                </View>
              </View>

              <Text style={[styles.projectName, { color: colors.foreground }]}>{proj.name}</Text>
              <Text style={[styles.projectSubtitle, { color: colors.muted }]}>{proj.subtitle}</Text>

              {proj.progress !== undefined ? (
                <View style={styles.progressBox}>
                  <View style={styles.progressLabelRow}>
                    <Text style={[styles.progressLabel, { color: colors.muted }]}>Progress</Text>
                    <Text style={[styles.progressVal, { color: colors.foreground }]}>{proj.progress}%</Text>
                  </View>
                  <View style={[styles.progressTrack, { backgroundColor: colors.elevated }]}>
                    <View style={[styles.progressFill, { width: `${proj.progress}%`, backgroundColor: colors.amber }]} />
                  </View>
                </View>
              ) : (
                <View style={styles.pendingRow}>
                  <Ionicons name="alert-circle" size={16} color={colors.amber} />
                  <Text style={[styles.pendingText, { color: colors.foreground }]}>{proj.pendingTasks} pending tasks</Text>
                </View>
              )}
            </GlassCard>
          ))}
        </ScrollView>

        {/* DEVELOPER METRICS (3-CARD ROW) */}
        <View style={styles.metricsRow}>
          <GlassCard style={styles.metricCard}>
            <Text style={[styles.metricNum, { color: colors.foreground }]}>42</Text>
            <Text style={[styles.metricLabel, { color: colors.muted }]}>Commits Week</Text>
          </GlassCard>

          <GlassCard style={styles.metricCard}>
            <Text style={[styles.metricNum, { color: colors.foreground }]}>12</Text>
            <Text style={[styles.metricLabel, { color: colors.muted }]}>PRs Merged</Text>
          </GlassCard>

          <GlassCard style={styles.metricCard}>
            <Text style={[styles.metricNum, { color: colors.foreground }]}>8</Text>
            <Text style={[styles.metricLabel, { color: colors.muted }]}>Communities</Text>
          </GlassCard>
        </View>

        {/* DYNAMIC STREAK HEATMAP COUNTER */}
        <GlassCard elevated glowing style={styles.streakCard}>
          <View style={styles.streakHeader}>
            <View style={styles.streakTitleRow}>
              <Ionicons name="flame" size={24} color={colors.amber} />
              <Text style={[styles.streakCountText, { color: colors.foreground }]}>{streakCount} Day Streak</Text>
            </View>
            <Text style={[styles.streakSub, { color: colors.muted }]}>32 Days Longest • 142 Commits</Text>
          </View>

          {/* DYNAMIC HEATMAP CELLS */}
          <View style={styles.heatmapRow}>
            {Array.from({ length: 14 }).map((_, idx) => {
              const active = idx < streakCount;
              return (
                <View
                  key={idx}
                  style={[
                    styles.cell,
                    { backgroundColor: colors.elevated },
                    active && { backgroundColor: "rgba(245, 158, 11, 0.4)" },
                    idx === streakCount - 1 && { backgroundColor: colors.amber },
                  ]}
                />
              );
            })}
          </View>
        </GlassCard>

        {/* RECENT ACTIVITY FEED (INTERACTIVE CLICKABLE ITEMS) */}
        <Text style={[styles.sectionTitle, { color: colors.foreground, marginTop: 16 }]}>Recent Activity</Text>
        <GlassCard elevated style={styles.activityFeedCard}>
          {RECENT_ACTIVITIES.map((act, index) => (
            <TouchableOpacity
              key={act.id}
              activeOpacity={0.7}
              onPress={() => setSelectedActivity(act)}
              style={[styles.activityItem, index < RECENT_ACTIVITIES.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border }]}
            >
              <View style={[styles.actIconBox, { backgroundColor: colors.elevated }, act.isError && styles.errorIconBox, act.isEvent && styles.eventIconBox]}>
                <Ionicons
                  name={act.icon}
                  size={18}
                  color={act.isError ? colors.danger : act.isEvent ? colors.amber : colors.foreground}
                />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={[styles.actUserText, { color: colors.foreground }]}>
                  <Text style={{ fontWeight: "700" }}>{act.user}</Text> {act.action}
                </Text>
                <Text style={[styles.actTimeText, { color: colors.subtle }]}>{act.time}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.subtle} />
            </TouchableOpacity>
          ))}
        </GlassCard>

        {/* WORKSPACE ISSUES CHECKLIST */}
        <View style={styles.issuesHeaderRow}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Workspace Issues</Text>
          <View style={styles.tabsRow}>
            {["all", "pending", "resolved"].map((tab) => (
              <TouchableOpacity
                key={tab}
                activeOpacity={0.7}
                onPress={() => setActiveTab(tab)}
                style={[styles.tabChip, { backgroundColor: colors.elevated }, activeTab === tab && { backgroundColor: colors.primary }]}
              >
                <Text style={[styles.tabText, { color: colors.muted }, activeTab === tab && { color: isDarkMode ? "#000" : "#FFF" }]}>
                  {tab.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {filteredIssues.map((issue) => (
          <IssueItem key={issue.id} issue={issue} onToggle={handleToggleIssue} />
        ))}
      </ScrollView>

      {/* RECENT ACTIVITY DETAIL MODAL */}
      <Modal visible={!!selectedActivity} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <GlassCard elevated style={[styles.activityModalCard, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.actModalBadge, { color: colors.amber }]}>{selectedActivity?.time}</Text>
                <Text style={[styles.actModalTitle, { color: colors.foreground }]}>{selectedActivity?.user}</Text>
              </View>
              <TouchableOpacity onPress={() => setSelectedActivity(null)}>
                <Ionicons name="close-circle" size={26} color={colors.muted} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.actModalActionText, { color: colors.muted }]}>{selectedActivity?.action}</Text>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            {selectedActivity?.commits ? (
              <View>
                <Text style={[styles.subHeading, { color: colors.foreground }]}>Repo: {selectedActivity.repo}</Text>
                <Text style={[styles.branchBadge, { color: colors.amber }]}>Branch: {selectedActivity.branch} ({selectedActivity.stats})</Text>
                <Text style={[styles.subHeading, { color: colors.foreground, marginTop: 12 }]}>Commit History:</Text>
                {selectedActivity.commits.map((c, idx) => (
                  <View key={idx} style={styles.commitRow}>
                    <Ionicons name="git-commit" size={16} color={colors.amber} />
                    <Text style={[styles.commitText, { color: colors.foreground }]}>{c}</Text>
                  </View>
                ))}
              </View>
            ) : null}

            {selectedActivity?.issueId ? (
              <View>
                <Text style={[styles.subHeading, { color: colors.foreground }]}>Issue {selectedActivity.issueId} • {selectedActivity.repo}</Text>
                <View style={styles.priorityBadge}>
                  <Text style={[styles.priorityText, { color: colors.danger }]}>Priority: {selectedActivity.priority}</Text>
                </View>
                <Text style={[styles.issueDescText, { color: colors.muted }]}>{selectedActivity.description}</Text>
              </View>
            ) : null}

            {selectedActivity?.eventTitle ? (
              <View>
                <Text style={[styles.eventTitleText, { color: colors.foreground }]}>{selectedActivity.eventTitle}</Text>
                <Text style={[styles.eventLocText, { color: colors.muted }]}>📍 {selectedActivity.location}</Text>
                <Text style={[styles.eventAttendeesText, { color: colors.amber }]}>👥 {selectedActivity.attendees} Developers Registered</Text>
              </View>
            ) : null}

            <CustomButton
              title="Close Details"
              variant="primary"
              size="lg"
              style={{ marginTop: 20 }}
              onPress={() => setSelectedActivity(null)}
            />
          </GlassCard>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { padding: 20, paddingBottom: 48 },
  brandRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 8, marginBottom: 16 },
  brandTitle: { fontSize: 22, fontWeight: "900", letterSpacing: -0.5 },
  liveSyncPill: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(16, 185, 129, 0.12)", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 9999, borderWidth: 1, borderColor: "rgba(16, 185, 129, 0.3)" },
  liveSyncDot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
  liveSyncText: { fontSize: 10, fontWeight: "700" },
  toastCard: { flexDirection: "row", alignItems: "center", padding: 12, marginBottom: 16, backgroundColor: "rgba(245, 158, 11, 0.12)", borderColor: "rgba(245, 158, 11, 0.3)" },
  toastText: { fontSize: 13, fontWeight: "700", marginLeft: 8 },
  heroSection: { marginBottom: 20 },
  dashboardBadge: { fontSize: 11, fontWeight: "700", letterSpacing: 1.5, marginBottom: 4 },
  heroTitle: { fontSize: 26, fontWeight: "800", letterSpacing: -0.5, marginBottom: 4 },
  heroSub: { fontSize: 13, lineHeight: 18 },
  sectionHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: "800" },
  viewAllText: { fontSize: 12, fontWeight: "600" },
  horizontalScroll: { marginLeft: -20, paddingLeft: 20, marginBottom: 20 },
  activeProjectCard: { width: 250, marginRight: 12, padding: 18 },
  cardHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  iconBox: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  tagBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4 },
  tagBadgeText: { fontSize: 9, fontWeight: "700", textTransform: "uppercase" },
  projectName: { fontSize: 16, fontWeight: "800", marginBottom: 2 },
  projectSubtitle: { fontSize: 12, marginBottom: 14 },
  progressBox: { marginTop: 4 },
  progressLabelRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  progressLabel: { fontSize: 11 },
  progressVal: { fontSize: 11, fontWeight: "800" },
  progressTrack: { height: 6, borderRadius: 3, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 3 },
  pendingRow: { flexDirection: "row", alignItems: "center", marginTop: 4 },
  pendingText: { fontSize: 12, fontWeight: "600", marginLeft: 6 },
  metricsRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 20 },
  metricCard: { flex: 1, marginHorizontal: 3, padding: 12, alignItems: "center" },
  metricNum: { fontSize: 20, fontWeight: "800" },
  metricLabel: { fontSize: 10, marginTop: 2, textAlign: "center" },
  streakCard: { padding: 16, marginBottom: 20 },
  streakHeader: { marginBottom: 12 },
  streakTitleRow: { flexDirection: "row", alignItems: "center" },
  streakCountText: { fontSize: 18, fontWeight: "800", marginLeft: 6 },
  streakSub: { fontSize: 11, marginTop: 2 },
  heatmapRow: { flexDirection: "row", justifyContent: "space-between" },
  cell: { width: 16, height: 16, borderRadius: 4 },
  activityFeedCard: { padding: 0, marginBottom: 20, overflow: "hidden" },
  activityItem: { flexDirection: "row", alignItems: "center", padding: 14 },
  actIconBox: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  errorIconBox: { backgroundColor: "rgba(220, 38, 38, 0.12)" },
  eventIconBox: { backgroundColor: "rgba(245, 158, 11, 0.12)" },
  actUserText: { fontSize: 13, lineHeight: 18 },
  actTimeText: { fontSize: 9, fontWeight: "700", marginTop: 2 },
  issuesHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  tabsRow: { flexDirection: "row" },
  tabChip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 9999, marginLeft: 4 },
  tabText: { fontSize: 10, fontWeight: "700" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0, 0, 0, 0.8)", justifyContent: "center", alignItems: "center", padding: 20 },
  activityModalCard: { width: "100%", padding: 20 },
  actModalBadge: { fontSize: 11, fontWeight: "700", marginBottom: 2 },
  actModalTitle: { fontSize: 22, fontWeight: "800" },
  actModalActionText: { fontSize: 14, marginTop: 4 },
  divider: { height: 1, marginVertical: 14 },
  subHeading: { fontSize: 14, fontWeight: "700", marginBottom: 6 },
  branchBadge: { fontSize: 12, fontWeight: "600", marginBottom: 8 },
  commitRow: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  commitText: { fontSize: 12, marginLeft: 8, flex: 1 },
  priorityBadge: { backgroundColor: "rgba(220, 38, 38, 0.12)", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, alignSelf: "flex-start", marginBottom: 8 },
  priorityText: { fontSize: 10, fontWeight: "700" },
  issueDescText: { fontSize: 13, lineHeight: 18 },
  eventTitleText: { fontSize: 16, fontWeight: "800", marginBottom: 6 },
  eventLocText: { fontSize: 13, marginBottom: 4 },
  eventAttendeesText: { fontSize: 12, fontWeight: "600" },
});

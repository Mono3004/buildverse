import React, { useState } from "react";
import {
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import GlassCard from "../components/GlassCard";
import CustomButton from "../components/CustomButton";
import { deleteProjectApi } from "../lib/api";
import { darkColors, lightColors, theme, useThemeMode } from "../theme";

const INITIAL_PROJECT_ISSUES = [
  { id: "todo_1", code: "PHX-102", title: "Database Migration", desc: "Transitioning core clusters to PostgreSQL 16", status: "In Progress", isDone: false, priority: "HIGH" },
  { id: "todo_2", code: "PHX-103", title: "Edge Function Refactor", desc: "Optimizing cold starts for global deployments", status: "Backlog", isDone: false, priority: "MEDIUM" },
  { id: "todo_3", code: "PHX-098", title: "API Documentation", desc: "v1.2 OpenAPI specifications finalized", status: "Completed", isDone: true, priority: "LOW" },
  { id: "todo_4", code: "PHX-105", title: "JWT Auth Cookie Refresh", desc: "Handle expired token refresh loops gracefully", status: "In Progress", isDone: false, priority: "HIGH" },
];

const DEFAULT_TEAM_MEMBERS = [
  { id: "tm1", name: "Erik Solberg", role: "Lead Architect", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120", status: "Joined ✓" },
  { id: "tm2", name: "Astrid Lind", role: "DevOps Lead", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120", status: "Joined ✓" },
  { id: "tm3", name: "Sarah Chen", role: "Frontend Specialist", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120", status: "Joined ✓" },
];

export default function ProjectDetailsScreen({ route, navigation }) {
  const themeMode = typeof useThemeMode === "function" ? useThemeMode() : null;
  const isDarkMode = themeMode?.isDarkMode ?? true;
  const colors = themeMode?.themeColors || (isDarkMode ? darkColors : lightColors);

  const initialProject = route.params?.project || {
    id: "p1",
    name: "Project Phoenix",
    description: "Next-generation serverless architecture for automated infrastructure provisioning. Syncing real-time state with distributed edge clusters.",
    status: "In Development",
    progress: 74,
    tag: "Active",
  };

  const [project, setProject] = useState(initialProject);
  const [issues, setIssues] = useState(INITIAL_PROJECT_ISSUES);
  const [teamMembers, setTeamMembers] = useState(route.params?.project?.members || DEFAULT_TEAM_MEMBERS);
  const [synced, setSynced] = useState(false);

  // NEW TODO / ISSUE CREATION MODAL STATE WITH PRIORITY SELECTOR
  const [showAddTodoModal, setShowAddTodoModal] = useState(false);
  const [newTodoTitle, setNewTodoTitle] = useState("");
  const [newTodoDesc, setNewTodoDesc] = useState("");
  const [selectedPriority, setSelectedPriority] = useState("HIGH"); // HIGH | MEDIUM | LOW

  // PROJECT SETTINGS MODAL STATE (WITH DELETE)
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [editProjectName, setEditProjectName] = useState(project.name);
  const [editProjectDesc, setEditProjectDesc] = useState(project.description);
  const [isPublic, setIsPublic] = useState(true);
  const [autoSync, setAutoSync] = useState(true);

  // INVITE COLLABORATOR MODAL STATE
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("Collaborator");

  const isCompleted =
    project.status === "Completed" ||
    project.status === "completed" ||
    project.progress === 100 ||
    project.tag === "Completed";

  const handleSync = () => {
    setSynced(true);
    setTimeout(() => setSynced(false), 2500);
  };

  // COMPLETE PROJECT BUTTON HANDLER — FILLS PROGRESS LINE 100% GREEN
  const handleCompleteProject = () => {
    const updatedProj = {
      ...project,
      status: "Completed",
      progress: 100,
      tag: "Completed",
    };

    setProject(updatedProj);

    // Mark all issues resolved
    setIssues((prev) =>
      prev.map((i) => ({ ...i, isDone: true, status: "Completed" }))
    );

    // Notify ProjectsScreen to update project status & progress bar in real-time
    navigation.navigate("ProjectsTab", { updatedProject: updatedProj });
  };

  const handleToggleTodo = (id) => {
    setIssues((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, isDone: !item.isDone, status: !item.isDone ? "Completed" : "In Progress" }
          : item
      )
    );
  };

  const handleAddTodoSubmit = () => {
    if (!newTodoTitle.trim()) return;
    const createdTodo = {
      id: `todo_${Date.now()}`,
      code: `PHX-${Math.floor(100 + Math.random() * 900)}`,
      title: newTodoTitle.trim(),
      desc: newTodoDesc.trim() || "New project task milestone",
      status: "In Progress",
      isDone: false,
      priority: selectedPriority,
    };
    setIssues((prev) => [createdTodo, ...prev]);
    setNewTodoTitle("");
    setNewTodoDesc("");
    setShowAddTodoModal(false);
  };

  const handleSaveSettings = () => {
    const updatedProj = {
      ...project,
      name: editProjectName.trim() || project.name,
      description: editProjectDesc.trim() || project.description,
    };
    setProject(updatedProj);
    setShowSettingsModal(false);
  };

  const handleDeleteProject = async () => {
    const targetId = project.id || "p1";
    setShowSettingsModal(false);
    deleteProjectApi(targetId);
    navigation.navigate("ProjectsTab", { deletedProjectId: targetId });
  };

  const handleInviteSubmit = () => {
    if (!inviteEmail.trim()) return;
    const newMember = {
      id: `tm_${Date.now()}`,
      name: inviteEmail.split("@")[0],
      role: inviteRole,
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120",
      status: "Pending Accept",
    };
    setTeamMembers((prev) => [...prev, newMember]);
    setInviteEmail("");
    setShowInviteModal(false);
  };

  const handleAcceptInvite = (id) => {
    setTeamMembers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, status: "Joined ✓" } : m))
    );
  };

  const completedCount = issues.filter((i) => i.isDone).length;
  const pendingCount = issues.length - completedCount;
  const currentProgress = isCompleted ? 100 : project.progress || 0;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={styles.container}>
        {/* HEADER BAR WITH BACK BUTTON */}
        <View style={styles.headerBar}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={colors.foreground} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>BuildVerse Project Details</Text>
          <TouchableOpacity style={styles.iconBtn} onPress={() => setShowSettingsModal(true)}>
            <Ionicons name="settings-outline" size={20} color={colors.foreground} />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* PROJECT HERO SECTION WITH 100% GREEN PROGRESS BAR LINE */}
          <GlassCard elevated style={styles.heroCard}>
            <View style={styles.badgeRow}>
              <Text style={[styles.activeTag, { color: colors.subtle }]}>ACTIVE PROJECT</Text>
              <View style={[styles.statusPill, { backgroundColor: isCompleted ? "rgba(16,185,129,0.15)" : colors.elevated }]}>
                <View style={[styles.pulseDot, { backgroundColor: isCompleted ? colors.success : colors.amber }]} />
                <Text style={[styles.statusText, { color: isCompleted ? colors.success : colors.foreground }]}>
                  {isCompleted ? "Completed ✓" : project.status || "In Development"}
                </Text>
              </View>
            </View>

            <Text style={[styles.projectTitle, { color: colors.foreground }]}>{project.name}</Text>
            <Text style={[styles.projectDesc, { color: colors.muted }]}>{project.description}</Text>

            {/* VISUAL PROGRESS BAR LINE IN HERO CARD */}
            <View style={styles.heroProgressBox}>
              <View style={styles.heroProgressLabelRow}>
                <Text style={[styles.heroProgressLabel, { color: colors.muted }]}>Overall Completion Progress</Text>
                <Text style={[styles.heroProgressPercent, { color: isCompleted ? colors.success : colors.foreground }]}>
                  {isCompleted ? "100% (Completed)" : `${currentProgress}%`}
                </Text>
              </View>
              <View style={[styles.heroTrack, { backgroundColor: colors.elevated }]}>
                <View
                  style={[
                    styles.heroFill,
                    {
                      width: `${currentProgress}%`,
                      backgroundColor: isCompleted ? colors.success : colors.amber,
                    },
                  ]}
                />
              </View>
            </View>

            <View style={styles.actionButtonsRow}>
              <CustomButton
                title={synced ? "Synced!" : "Sync GitHub"}
                variant="primary"
                size="sm"
                icon={<Ionicons name="sync" size={14} color={isDarkMode ? "#000" : "#FFF"} />}
                onPress={handleSync}
              />

              {/* COMPLETE PROJECT BUTTON NEXT TO SETTINGS */}
              <CustomButton
                title={isCompleted ? "Completed ✓" : "Complete Project"}
                variant={isCompleted ? "secondary" : "outline"}
                size="sm"
                style={{ marginLeft: 8 }}
                icon={<Ionicons name="checkmark-done-circle-outline" size={14} color={isCompleted ? "#000" : colors.success} />}
                onPress={handleCompleteProject}
              />

              <CustomButton
                title="Settings"
                variant="outline"
                size="sm"
                style={{ marginLeft: 8 }}
                icon={<Ionicons name="settings-outline" size={14} color={colors.foreground} />}
                onPress={() => {
                  setEditProjectName(project.name);
                  setEditProjectDesc(project.description);
                  setShowSettingsModal(true);
                }}
              />
            </View>
          </GlassCard>

          {/* PROJECT ISSUES & TO-DO TRACKER STATS */}
          <View style={styles.todoStatsRow}>
            <GlassCard style={styles.todoStatCard}>
              <Text style={[styles.todoStatNum, { color: colors.foreground }]}>{issues.length}</Text>
              <Text style={[styles.todoStatLabel, { color: colors.muted }]}>Total Issues</Text>
            </GlassCard>

            <GlassCard style={styles.todoStatCard}>
              <Text style={[styles.todoStatNum, { color: colors.warning }]}>{pendingCount}</Text>
              <Text style={[styles.todoStatLabel, { color: colors.muted }]}>Pending Tasks</Text>
            </GlassCard>

            <GlassCard style={styles.todoStatCard}>
              <Text style={[styles.todoStatNum, { color: colors.success }]}>{completedCount}</Text>
              <Text style={[styles.todoStatLabel, { color: colors.muted }]}>Resolved</Text>
            </GlassCard>
          </View>

          {/* TO-DO & ISSUES LIST SECTION */}
          <GlassCard elevated style={styles.milestonesCard}>
            <View style={styles.cardTitleRow}>
              <View>
                <Text style={[styles.cardTitle, { color: colors.foreground }]}>Project To-Do & Issues List</Text>
                <Text style={[styles.taskSubText, { color: colors.muted }]}>Click any issue to resolve/complete</Text>
              </View>
              <TouchableOpacity onPress={() => setShowAddTodoModal(true)}>
                <Text style={[styles.addTodoBtnText, { color: colors.amber }]}>+ Add Issue</Text>
              </TouchableOpacity>
            </View>

            {issues.map((m, idx) => (
              <TouchableOpacity
                key={m.id}
                activeOpacity={0.7}
                onPress={() => handleToggleTodo(m.id)}
                style={[styles.taskRow, idx < issues.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border }]}
              >
                <Ionicons
                  name={m.isDone ? "checkmark-circle" : "ellipse-outline"}
                  size={22}
                  color={m.isDone ? colors.success : colors.amber}
                />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={[styles.taskTitle, { color: colors.foreground }, m.isDone && styles.taskTitleDone]}>
                    {m.code} — {m.title}
                  </Text>
                  <Text style={[styles.taskDesc, { color: colors.muted }]}>{m.desc}</Text>
                </View>

                {/* PRIORITY BADGES WITH COLORED HIGH/MEDIUM/LOW */}
                <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor:
                        m.priority === "HIGH"
                          ? "rgba(239,68,68,0.15)"
                          : m.priority === "MEDIUM"
                          ? "rgba(245,158,11,0.15)"
                          : "rgba(16,185,129,0.15)",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusBadgeText,
                      {
                        color:
                          m.priority === "HIGH"
                            ? colors.danger
                            : m.priority === "MEDIUM"
                            ? colors.amber
                            : colors.success,
                      },
                    ]}
                  >
                    {m.priority}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </GlassCard>

          {/* TEAM MEMBERS SECTION WITH ACCEPT INVITATION */}
          <View style={styles.sectionTitleRow}>
            <Text style={[styles.sectionHeading, { color: colors.foreground }]}>Team Members & Invites ({teamMembers.length})</Text>
            <TouchableOpacity onPress={() => setShowInviteModal(true)}>
              <Text style={[styles.inviteLinkText, { color: colors.amber }]}>+ Invite Member</Text>
            </TouchableOpacity>
          </View>

          <GlassCard elevated style={styles.teamCard}>
            {teamMembers.map((tm, idx) => (
              <View key={tm.id} style={[styles.teamMemberRow, idx < teamMembers.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border }]}>
                <Image source={{ uri: tm.avatar }} style={[styles.teamAvatar, { borderColor: colors.cardBorder }]} />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={[styles.tmName, { color: colors.foreground }]}>{tm.name}</Text>
                  <Text style={[styles.tmRole, { color: colors.muted }]}>{tm.role}</Text>
                </View>

                {tm.status === "Pending Accept" ? (
                  <TouchableOpacity onPress={() => handleAcceptInvite(tm.id)} style={[styles.acceptBtnPill, { backgroundColor: colors.primary }]}>
                    <Text style={[styles.acceptBtnText, { color: isDarkMode ? "#000" : "#FFF" }]}>Accept Invite ✓</Text>
                  </TouchableOpacity>
                ) : (
                  <Ionicons name="checkmark-circle" size={18} color={colors.success} />
                )}
              </View>
            ))}
          </GlassCard>
        </ScrollView>
      </View>

      {/* ADD ISSUE MODAL WITH PRIORITY SELECTOR BUTTONS (HIGH, MEDIUM, LOW) */}
      <Modal visible={showAddTodoModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <GlassCard elevated style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.foreground }]}>Add New Project Issue</Text>
              <TouchableOpacity onPress={() => setShowAddTodoModal(false)}>
                <Ionicons name="close" size={24} color={colors.muted} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.inputLabel, { color: colors.muted }]}>Issue Title</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.elevated, borderColor: colors.border, color: colors.foreground }]}
              placeholder="e.g. Fix OAuth callback loop"
              placeholderTextColor={colors.subtle}
              value={newTodoTitle}
              onChangeText={setNewTodoTitle}
            />

            <Text style={[styles.inputLabel, { color: colors.muted }]}>Task Description</Text>
            <TextInput
              style={[styles.input, styles.textArea, { backgroundColor: colors.elevated, borderColor: colors.border, color: colors.foreground }]}
              placeholder="Describe issue requirement..."
              placeholderTextColor={colors.subtle}
              multiline
              numberOfLines={3}
              value={newTodoDesc}
              onChangeText={setNewTodoDesc}
            />

            {/* PRIORITY SELECTOR BUTTONS */}
            <Text style={[styles.inputLabel, { color: colors.muted, marginTop: 4 }]}>Select Priority Level</Text>
            <View style={styles.prioritySelectorRow}>
              {["HIGH", "MEDIUM", "LOW"].map((prio) => (
                <TouchableOpacity
                  key={prio}
                  activeOpacity={0.8}
                  onPress={() => setSelectedPriority(prio)}
                  style={[
                    styles.priorityPillBtn,
                    { backgroundColor: colors.elevated },
                    selectedPriority === prio && {
                      backgroundColor:
                        prio === "HIGH" ? colors.danger : prio === "MEDIUM" ? colors.amber : colors.success,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.priorityPillText,
                      { color: colors.foreground },
                      selectedPriority === prio && { color: "#FFFFFF" },
                    ]}
                  >
                    {prio}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalActions}>
              <CustomButton title="Cancel" variant="outline" size="md" onPress={() => setShowAddTodoModal(false)} />
              <CustomButton title="Create Task Issue" variant="primary" size="md" style={{ marginLeft: 12 }} onPress={handleAddTodoSubmit} />
            </View>
          </GlassCard>
        </View>
      </Modal>

      {/* WORKING PROJECT SETTINGS MODAL */}
      <Modal visible={showSettingsModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <GlassCard elevated style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.foreground }]}>Project Settings & CRUD</Text>
              <TouchableOpacity onPress={() => setShowSettingsModal(false)}>
                <Ionicons name="close" size={24} color={colors.muted} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.inputLabel, { color: colors.muted }]}>Project Title</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.elevated, borderColor: colors.border, color: colors.foreground }]}
              value={editProjectName}
              onChangeText={setEditProjectName}
            />

            <Text style={[styles.inputLabel, { color: colors.muted }]}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea, { backgroundColor: colors.elevated, borderColor: colors.border, color: colors.foreground }]}
              value={editProjectDesc}
              onChangeText={setEditProjectDesc}
              multiline
              numberOfLines={3}
            />

            <View style={styles.toggleSettingRow}>
              <Text style={[styles.toggleSettingText, { color: colors.foreground }]}>Public Workspace Repository</Text>
              <Switch value={isPublic} onValueChange={setIsPublic} trackColor={{ false: "#ECECEC", true: colors.amber }} thumbColor="#FFF" />
            </View>

            <View style={styles.toggleSettingRow}>
              <Text style={[styles.toggleSettingText, { color: colors.foreground }]}>Auto-Sync GitHub Commits</Text>
              <Switch value={autoSync} onValueChange={setAutoSync} trackColor={{ false: "#ECECEC", true: colors.amber }} thumbColor="#FFF" />
            </View>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <CustomButton
              title="Delete Project Permanently"
              variant="outline"
              size="md"
              style={{ borderColor: colors.danger, marginBottom: 12 }}
              textStyle={{ color: colors.danger }}
              icon={<Ionicons name="trash-outline" size={16} color={colors.danger} />}
              onPress={handleDeleteProject}
            />

            <View style={styles.modalActions}>
              <CustomButton title="Cancel" variant="outline" size="md" onPress={() => setShowSettingsModal(false)} />
              <CustomButton title="Save Changes" variant="primary" size="md" style={{ marginLeft: 12 }} onPress={handleSaveSettings} />
            </View>
          </GlassCard>
        </View>
      </Modal>

      {/* INVITE COLLABORATOR MODAL */}
      <Modal visible={showInviteModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <GlassCard elevated style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.foreground }]}>Invite Collaborator</Text>
              <TouchableOpacity onPress={() => setShowInviteModal(false)}>
                <Ionicons name="close" size={24} color={colors.muted} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.inputLabel, { color: colors.muted }]}>GitHub Username / Email</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.elevated, borderColor: colors.border, color: colors.foreground }]}
              placeholder="e.g. dev@github.com"
              placeholderTextColor={colors.subtle}
              value={inviteEmail}
              onChangeText={setInviteEmail}
            />

            <View style={styles.modalActions}>
              <CustomButton title="Cancel" variant="outline" size="md" onPress={() => setShowInviteModal(false)} />
              <CustomButton title="Send Invite" variant="primary" size="md" style={{ marginLeft: 12 }} onPress={handleInviteSubmit} />
            </View>
          </GlassCard>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flex: 1, padding: 20 },
  headerBar: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16, marginTop: 8 },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: "800" },
  iconBtn: { padding: 4 },
  scrollContent: { paddingBottom: 48 },
  heroCard: { padding: 20, marginBottom: 20 },
  badgeRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  activeTag: { fontSize: 10, fontWeight: "800", letterSpacing: 1 },
  statusPill: { flexDirection: "row", alignItems: "center", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 9999 },
  pulseDot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
  statusText: { fontSize: 11, fontWeight: "700" },
  projectTitle: { fontSize: 26, fontWeight: "800", marginBottom: 8 },
  projectDesc: { fontSize: 13, lineHeight: 18, marginBottom: 16 },
  heroProgressBox: { marginBottom: 16 },
  heroProgressLabelRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  heroProgressLabel: { fontSize: 11 },
  heroProgressPercent: { fontSize: 11, fontWeight: "700" },
  heroTrack: { height: 8, borderRadius: 4, overflow: "hidden" },
  heroFill: { height: "100%", borderRadius: 4 },
  actionButtonsRow: { flexDirection: "row", alignItems: "center" },
  todoStatsRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 20 },
  todoStatCard: { flex: 1, marginHorizontal: 3, padding: 12, alignItems: "center" },
  todoStatNum: { fontSize: 20, fontWeight: "800" },
  todoStatLabel: { fontSize: 10, marginTop: 2 },
  milestonesCard: { padding: 20, marginBottom: 20 },
  cardTitleRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  cardTitle: { fontSize: 18, fontWeight: "800" },
  taskSubText: { fontSize: 11, marginTop: 2 },
  addTodoBtnText: { fontSize: 12, fontWeight: "700" },
  taskRow: { flexDirection: "row", alignItems: "center", paddingVertical: 12 },
  taskTitle: { fontSize: 14, fontWeight: "700" },
  taskTitleDone: { textDecorationLine: "line-through", opacity: 0.6 },
  taskDesc: { fontSize: 11, marginTop: 2 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  statusBadgeText: { fontSize: 10, fontWeight: "700" },
  sectionTitleRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  sectionHeading: { fontSize: 16, fontWeight: "700" },
  inviteLinkText: { fontSize: 12, fontWeight: "700" },
  teamCard: { padding: 14, marginBottom: 20 },
  teamMemberRow: { flexDirection: "row", alignItems: "center", paddingVertical: 10 },
  teamAvatar: { width: 40, height: 40, borderRadius: 20, borderWidth: 1 },
  tmName: { fontSize: 14, fontWeight: "700" },
  tmRole: { fontSize: 11, marginTop: 2 },
  acceptBtnPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 9999 },
  acceptBtnText: { fontSize: 10, fontWeight: "700" },
  prioritySelectorRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 16 },
  priorityPillBtn: { flex: 1, marginHorizontal: 4, paddingVertical: 8, borderRadius: 8, alignItems: "center" },
  priorityPillText: { fontSize: 12, fontWeight: "800" },
  divider: { height: 1, marginVertical: 12 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0, 0, 0, 0.75)", justifyContent: "center", padding: 20 },
  modalContent: { padding: 24 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  modalTitle: { fontSize: 20, fontWeight: "800" },
  inputLabel: { fontSize: 12, fontWeight: "600", marginBottom: 6 },
  input: { borderRadius: 12, borderWidth: 1, paddingHorizontal: 16, paddingVertical: 12, fontSize: 14, marginBottom: 12 },
  textArea: { height: 70, textAlignVertical: "top" },
  toggleSettingRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginVertical: 8 },
  toggleSettingText: { fontSize: 13, fontWeight: "600" },
  modalActions: { flexDirection: "row", justifyContent: "flex-end", marginTop: 16 },
});

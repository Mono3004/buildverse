import React, { useState } from "react";
import {
  Alert,
  Clipboard,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import GlassCard from "../components/GlassCard";
import CustomButton from "../components/CustomButton";
import { darkColors, lightColors, theme, useThemeMode } from "../theme";
import {
  fetchProjects,
  createProjectApi,
  deleteProjectApi,
  fetchIssues,
  createIssueApi,
  toggleIssueStatusApi,
} from "../lib/api";

const JIRA_COLUMNS = [
  { id: "todo", title: "To Do", color: "#94A3B8" },
  { id: "in_progress", title: "In Progress", color: "#3B82F6" },
  { id: "in_review", title: "In Review", color: "#F59E0B" },
  { id: "done", title: "Done", color: "#10B981" },
];

export default function ProjectsScreen({ navigation }) {
  const themeMode = typeof useThemeMode === "function" ? useThemeMode() : null;
  const isDarkMode = themeMode?.isDarkMode ?? true;
  const colors = themeMode?.themeColors || (isDarkMode ? darkColors : lightColors);

  const [activeTab, setActiveTab] = useState("repo"); // repo | jira
  const [projects, setProjects] = useState([]);
  const [issues, setIssues] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingData, setLoadingData] = useState(true);

  const loadWorkspaceData = async () => {
    try {
      const [pList, iList] = await Promise.all([fetchProjects(), fetchIssues()]);
      if (Array.isArray(pList)) {
        setProjects(
          pList.map((p) => ({
            ...p,
            files: p.files || [
              { path: "README.md", content: `# ${p.name}\n${p.description || "Project repository"}` },
              { path: "src/index.js", content: `// ${p.name} entrypoint\nconsole.log("Ready");` },
            ],
            commits: p.commits || [
              {
                id: `c_${p.id}`,
                author: "Developer",
                message: "Initial commit: scaffold",
                time: "Recently",
                additions: 20,
                deletions: 0,
              },
            ],
          }))
        );
      }
      if (Array.isArray(iList)) {
        setIssues(iList);
      }
    } catch (_e) {
    } finally {
      setLoadingData(false);
    }
  };

  React.useEffect(() => {
    loadWorkspaceData();
  }, []);

  // CREATE REPO MODAL
  const [showCreateRepoModal, setShowCreateRepoModal] = useState(false);
  const [newRepoName, setNewRepoName] = useState("");
  const [newRepoDesc, setNewRepoDesc] = useState("");
  const [newRepoTag, setNewRepoTag] = useState("Node.js");

  // ACTIVE OPEN REPOSITORY MODAL / VIEW
  const [openRepo, setOpenRepo] = useState(null);
  const [repoSubTab, setRepoSubTab] = useState("code"); // code | history
  const [activeFilePath, setActiveFilePath] = useState(null);
  const [repoToast, setRepoToast] = useState("");
  const [commitMsg, setCommitMsg] = useState("");
  const [isEditingCode, setIsEditingCode] = useState(false);
  const [editedCodeContent, setEditedCodeContent] = useState("");

  // NEW FILE MODAL (USER EXPLICIT REQUEST)
  const [showNewFileModal, setShowNewFileModal] = useState(false);
  const [newFilePath, setNewFilePath] = useState("");
  const [newFileContent, setNewFileContent] = useState("");

  // VS CODE TERMINAL GUIDE MODAL
  const [showVsCodeModal, setShowVsCodeModal] = useState(false);

  // CREATE JIRA TICKET MODAL
  const [showJiraModal, setShowJiraModal] = useState(false);
  const [jiraTitle, setJiraTitle] = useState("");
  const [jiraPriority, setJiraPriority] = useState("Medium");
  const [jiraStatus, setJiraStatus] = useState("todo");
  const [jiraAssignee, setJiraAssignee] = useState("Alex Chen");

  const filteredProjects = projects.filter((p) =>
    (p.name + p.description + p.tag).toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateRepo = async () => {
    if (!newRepoName.trim()) {
      Alert.alert("Missing Name", "Please provide a name for the repository.");
      return;
    }

    const saved = await createProjectApi("current_user", {
      name: newRepoName.trim(),
      description: newRepoDesc.trim() || "New full-stack BuildVerse repository.",
      tag: newRepoTag,
      progress: 0,
      status: "active",
    });

    const created = {
      ...saved,
      id: saved.id || `repo-${Date.now()}`,
      filesCount: 2,
      commitsCount: 1,
      additions: 20,
      deletions: 0,
      files: [
        { path: "README.md", content: `# ${newRepoName.trim()}\nBuildVerse Project initialized.` },
        { path: "src/index.js", content: `// Entrypoint\nconsole.log("App ready");` },
      ],
      commits: [
        {
          id: `c_${Date.now()}`,
          author: "Developer",
          message: "Initial commit: repository scaffold",
          time: "Just now",
          additions: 20,
          deletions: 0,
        },
      ],
    };

    setProjects([created, ...projects.filter((p) => p.id !== created.id)]);
    setNewRepoName("");
    setNewRepoDesc("");
    setShowCreateRepoModal(false);
    setOpenRepo(created);
    setActiveFilePath("src/index.js");
  };

  // CREATE NEW FILE LOGIC
  const handleCreateNewFile = () => {
    if (!newFilePath.trim()) {
      Alert.alert("Missing File Path", "Please enter a file path (e.g. src/utils.js).");
      return;
    }

    const formattedPath = newFilePath.trim();
    const existingIndex = openRepo.files.findIndex((f) => f.path === formattedPath);
    if (existingIndex !== -1) {
      Alert.alert("File Exists", `A file at "${formattedPath}" already exists.`);
      return;
    }

    const newFile = {
      path: formattedPath,
      content: newFileContent || `// ${formattedPath}\n// Created in BuildVerse\n`,
    };

    const updatedFiles = [...openRepo.files, newFile];
    const updatedRepo = {
      ...openRepo,
      files: updatedFiles,
      filesCount: updatedFiles.length,
    };

    setOpenRepo(updatedRepo);
    setProjects(projects.map((p) => (p.id === updatedRepo.id ? updatedRepo : p)));
    setActiveFilePath(formattedPath);
    setEditedCodeContent(newFile.content);
    setNewFilePath("");
    setNewFileContent("");
    setShowNewFileModal(false);

    setRepoToast(`✓ Created new file: ${formattedPath}`);
    setTimeout(() => setRepoToast(""), 3500);
  };

  const handleDiskPull = () => {
    setRepoToast("⬇️ Pulled latest workspace files from E:\\Heartbeat API\\demo_workspace");
    setTimeout(() => setRepoToast(""), 3500);
  };

  const handleDiskPush = () => {
    setRepoToast("⬆️ Pushed workspace files to E:\\Heartbeat API\\demo_workspace");
    setTimeout(() => setRepoToast(""), 3500);
  };

  const handleCommitCode = () => {
    if (!openRepo) return;
    const msg = commitMsg.trim() || `Update ${activeFilePath || "files"}`;
    const newCommit = {
      id: `c_${Date.now()}`,
      author: "Alex Chen",
      message: msg,
      time: "Just now",
      additions: 12,
      deletions: 2,
    };

    // If code was edited, persist the active file changes
    const updatedFiles = openRepo.files.map((f) => {
      if (f.path === (activeFilePath || openRepo.files[0]?.path)) {
        return { ...f, content: isEditingCode ? editedCodeContent : f.content };
      }
      return f;
    });

    const updated = {
      ...openRepo,
      files: updatedFiles,
      commitsCount: openRepo.commitsCount + 1,
      additions: openRepo.additions + 12,
      deletions: openRepo.deletions + 2,
      commits: [newCommit, ...openRepo.commits],
    };

    setOpenRepo(updated);
    setProjects(projects.map((p) => (p.id === updated.id ? updated : p)));
    setCommitMsg("");
    setIsEditingCode(false);
    setRepoToast(`✓ Changes committed: "${msg}"`);
    setTimeout(() => setRepoToast(""), 3500);
  };

  const handleCopyVsCodeCommands = () => {
    const text = `git clone https://github.com/buildverse/${(openRepo?.name || "repo").toLowerCase().replace(/\\s+/g, "-")}.git\ncd ${(openRepo?.name || "repo").toLowerCase().replace(/\\s+/g, "-")}\ncode .\ngit add .\ngit commit -m "feat: sync from vs code"\ngit push origin main`;
    if (Clipboard?.setString) {
      Clipboard.setString(text);
    }
    Alert.alert("Copied to Clipboard", "VS Code terminal commands copied!");
  };

  // DIRECT STATUS CHANGE (TODO, IN PROGRESS, IN REVIEW, DONE)
  const moveJiraStatus = (issueId, nextStatus) => {
    toggleIssueStatusApi(issueId, nextStatus);
    setIssues((prev) =>
      prev.map((i) => (i.id === issueId ? { ...i, status: nextStatus } : i))
    );
  };

  const handleCreateJiraIssue = async () => {
    if (!jiraTitle.trim()) {
      Alert.alert("Missing Title", "Please provide a ticket title.");
      return;
    }
    const created = await createIssueApi({
      title: jiraTitle.trim(),
      priority: jiraPriority,
      status: jiraStatus,
      assignee: jiraAssignee || "Assigned Engineer",
    });
    setIssues([created, ...issues]);
    setJiraTitle("");
    setJiraStatus("todo");
    setShowJiraModal(false);
  };


  const activeFile = openRepo?.files?.find((f) => f.path === activeFilePath) || openRepo?.files?.[0];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* PAGE HEAD (EXACT MATCH TO WEB) */}
        <View style={styles.header}>
          <View style={[styles.eyebrowPill, { backgroundColor: "rgba(204, 255, 0, 0.12)", borderColor: "rgba(204, 255, 0, 0.3)" }]}>
            <Text style={[styles.eyebrowText, { color: "#CCFF00" }]}>DEVELOPMENT WORKSPACE</Text>
          </View>
          <Text style={[styles.title, { color: colors.foreground }]}>Repositories & Sprint Tracking</Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>
            Manage full-stack projects like GitHub with file trees and commits, plus Jira Kanban boards.
          </Text>

          {/* PRIMARY WORKSPACE ACTIONS: CREATE REPO & NEW FILE */}
          <View style={styles.topActionsRow}>
            <TouchableOpacity
              activeOpacity={0.85}
              style={[styles.createRepoBtn, { backgroundColor: "#CCFF00" }]}
              onPress={() => setShowCreateRepoModal(true)}
            >
              <Ionicons name="add" size={18} color="#000" />
              <Text style={styles.createRepoBtnText}>+ Create New Repository</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.85}
              style={[styles.topNewFileActionBtn, { backgroundColor: "rgba(204, 255, 0, 0.15)", borderColor: "#CCFF00" }]}
              onPress={() => {
                const targetRepo = openRepo || projects[0];
                if (targetRepo) {
                  setOpenRepo(targetRepo);
                  setActiveFilePath(targetRepo.files?.[0]?.path || null);
                  setEditedCodeContent(targetRepo.files?.[0]?.content || "");
                  setNewFilePath("");
                  setNewFileContent("");
                  setShowNewFileModal(true);
                }
              }}
            >
              <Ionicons name="document-text" size={16} color="#CCFF00" />
              <Text style={styles.topNewFileActionBtnText}>+ New File</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* WORKSPACE TAB SWITCHER */}
        <View style={[styles.tabBarRow, { borderBottomColor: colors.border }]}>
          <View style={[styles.pillContainer, { backgroundColor: colors.elevated, borderColor: colors.border }]}>
            <TouchableOpacity
              activeOpacity={0.8}
              style={[
                styles.tabPill,
                activeTab === "repo" && { backgroundColor: "#CCFF00" },
              ]}
              onPress={() => setActiveTab("repo")}
            >
              <Ionicons
                name="folder-open"
                size={14}
                color={activeTab === "repo" ? "#000" : colors.muted}
              />
              <Text
                style={[
                  styles.tabPillText,
                  { color: activeTab === "repo" ? "#000" : colors.muted },
                  activeTab === "repo" && { fontWeight: "900" },
                ]}
              >
                GitHub Repositories ({projects.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              style={[
                styles.tabPill,
                activeTab === "jira" && { backgroundColor: "#CCFF00" },
              ]}
              onPress={() => setActiveTab("jira")}
            >
              <Ionicons
                name="grid"
                size={14}
                color={activeTab === "jira" ? "#000" : colors.muted}
              />
              <Text
                style={[
                  styles.tabPillText,
                  { color: activeTab === "jira" ? "#000" : colors.muted },
                  activeTab === "jira" && { fontWeight: "900" },
                ]}
              >
                Jira Sprint Board
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* GITHUB REPOSITORY TAB CONTENT */}
        {activeTab === "repo" && (
          <View style={styles.tabContentSection}>
            {/* SEARCH INPUT */}
            <View style={[styles.searchBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Ionicons name="search" size={16} color={colors.muted} />
              <TextInput
                placeholder="Search repositories..."
                placeholderTextColor={colors.subtle}
                value={searchQuery}
                onChangeText={setSearchQuery}
                style={[styles.searchInput, { color: colors.foreground }]}
              />
            </View>

            {/* REPOSITORIES GRID / EMPTY STATE */}
            {filteredProjects.length === 0 ? (
              <GlassCard elevated style={styles.emptyContainerCard}>
                <Ionicons name="git-branch-outline" size={44} color="#CCFF00" />
                <Text style={[styles.emptyHeaderTitle, { color: colors.foreground }]}>
                  No Repositories Found
                </Text>
                <Text style={[styles.emptyHeaderDesc, { color: colors.muted }]}>
                  Your workspace is clean. Create a new repository to start managing project files, commits, and Jira sprints.
                </Text>
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={[styles.createFirstBtn, { backgroundColor: "#CCFF00" }]}
                  onPress={() => setShowCreateRepoModal(true)}
                >
                  <Ionicons name="add" size={16} color="#000" />
                  <Text style={styles.createFirstBtnText}>+ Create New Repository</Text>
                </TouchableOpacity>
              </GlassCard>
            ) : (
              <View style={styles.repoList}>
                {filteredProjects.map((p) => (
                  <TouchableOpacity
                    key={p.id}
                    activeOpacity={0.85}
                    onPress={() => {
                      setOpenRepo(p);
                      setActiveFilePath(p.files?.[0]?.path || null);
                      setEditedCodeContent(p.files?.[0]?.content || "");
                      setIsEditingCode(false);
                    }}
                  >
                    <GlassCard elevated style={styles.repoCard}>
                      <View style={styles.repoCardTop}>
                        <View style={[styles.repoInitialBox, { backgroundColor: "rgba(204, 255, 0, 0.15)", borderColor: "rgba(204, 255, 0, 0.3)" }]}>
                          <Text style={[styles.repoInitialText, { color: "#CCFF00" }]}>
                            {p.name.slice(0, 2).toUpperCase()}
                          </Text>
                        </View>
                        <View style={[styles.tagBadge, { backgroundColor: colors.elevated, borderColor: colors.border }]}>
                          <Text style={[styles.tagBadgeText, { color: colors.muted }]}>{p.tag}</Text>
                        </View>
                      </View>

                      <Text style={[styles.repoName, { color: colors.foreground }]}>{p.name}</Text>
                      <Text style={[styles.repoDesc, { color: colors.muted }]} numberOfLines={2}>
                        {p.description}
                      </Text>

                      {/* STATS & PROGRESS */}
                      <View style={styles.repoFooter}>
                        <View style={styles.repoStatRow}>
                          <Text style={[styles.repoStatText, { color: colors.muted }]}>
                            · {p.filesCount || p.files?.length || 4} files · {p.commitsCount || p.commits?.length || 1} commits ·{" "}
                            <Text style={{ color: "#CCFF00", fontWeight: "800" }}>+{p.additions || 45}</Text>{" "}
                            <Text style={{ color: colors.danger, fontWeight: "800" }}>-{p.deletions || 0}</Text>
                          </Text>
                        </View>

                        <View style={styles.progressRow}>
                          <Text style={[styles.progressLabel, { color: colors.muted }]}>Status</Text>
                          <Text style={[styles.progressVal, { color: "#CCFF00" }]}>{p.progress}% Active</Text>
                        </View>
                        <View style={[styles.progressTrack, { backgroundColor: colors.elevated }]}>
                          <View style={[styles.progressFill, { width: `${p.progress}%`, backgroundColor: "#CCFF00" }]} />
                        </View>
                      </View>

                      {/* DIRECT ACTIONS: + NEW FILE & OPEN REPOSITORY */}
                      <View style={styles.repoCardActionsRow}>
                        <TouchableOpacity
                          activeOpacity={0.8}
                          style={[styles.cardNewFileBtn, { backgroundColor: "#CCFF00" }]}
                          onPress={() => {
                            setOpenRepo(p);
                            setActiveFilePath(p.files?.[0]?.path || null);
                            setEditedCodeContent(p.files?.[0]?.content || "");
                            setNewFilePath("");
                            setNewFileContent("");
                            setShowNewFileModal(true);
                          }}
                        >
                          <Ionicons name="add-circle" size={14} color="#000" />
                          <Text style={styles.cardNewFileBtnText}>+ New File</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          activeOpacity={0.8}
                          style={[styles.cardExplorerBtn, { backgroundColor: colors.elevated, borderColor: colors.border }]}
                          onPress={() => {
                            setOpenRepo(p);
                            setActiveFilePath(p.files?.[0]?.path || null);
                            setEditedCodeContent(p.files?.[0]?.content || "");
                            setIsEditingCode(false);
                          }}
                        >
                          <Ionicons name="code-slash-outline" size={13} color={colors.foreground} />
                          <Text style={[styles.cardExplorerBtnText, { color: colors.foreground }]}>
                            Code Explorer ({p.filesCount || p.files?.length || 0}) →
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </GlassCard>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}

        {/* JIRA KANBAN BOARD TAB CONTENT */}
        {activeTab === "jira" && (
          <View style={styles.tabContentSection}>
            <View style={styles.jiraHeaderRow}>
              <View>
                <View style={[styles.badgePill, { backgroundColor: "rgba(59, 130, 246, 0.15)", borderColor: "rgba(59, 130, 246, 0.3)" }]}>
                  <Text style={[styles.badgePillText, { color: "#60A5FA" }]}>SPRINT 24 BOARD</Text>
                </View>
                <Text style={[styles.jiraTitle, { color: colors.foreground }]}>Engineering Kanban</Text>
              </View>

              <TouchableOpacity
                activeOpacity={0.8}
                style={[styles.newTicketBtn, { backgroundColor: "#CCFF00" }]}
                onPress={() => setShowJiraModal(true)}
              >
                <Ionicons name="add" size={16} color="#000" />
                <Text style={styles.newTicketBtnText}>New Ticket</Text>
              </TouchableOpacity>
            </View>

            {/* 4 KANBAN STATUS COLUMNS / EMPTY STATE */}
            {issues.length === 0 ? (
              <GlassCard elevated style={styles.emptyContainerCard}>
                <Ionicons name="clipboard-outline" size={44} color="#60A5FA" />
                <Text style={[styles.emptyHeaderTitle, { color: colors.foreground }]}>
                  No Sprint Tickets Found
                </Text>
                <Text style={[styles.emptyHeaderDesc, { color: colors.muted }]}>
                  Your sprint backlog is clear. Create your first Kanban ticket to track tasks across Todo, In Progress, In Review, and Done.
                </Text>
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={[styles.createFirstBtn, { backgroundColor: "#60A5FA" }]}
                  onPress={() => setShowJiraModal(true)}
                >
                  <Ionicons name="add" size={16} color="#000" />
                  <Text style={styles.createFirstBtnText}>+ Create First Ticket</Text>
                </TouchableOpacity>
              </GlassCard>
            ) : (
              JIRA_COLUMNS.map((col) => {
                const colIssues = issues.filter((i) => i.status === col.id);
                return (
                  <View key={col.id} style={[styles.jiraColBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <View style={styles.jiraColHeader}>
                      <Text style={[styles.jiraColTitle, { color: col.color }]}>{col.title.toUpperCase()}</Text>
                      <View style={[styles.countBadge, { backgroundColor: colors.elevated }]}>
                        <Text style={[styles.countBadgeText, { color: colors.foreground }]}>{colIssues.length}</Text>
                      </View>
                    </View>

                    {colIssues.map((issue) => (
                      <GlassCard key={issue.id} elevated style={styles.jiraCard}>
                        <View style={styles.jiraCardTop}>
                          <Text style={[styles.jiraId, { color: "#CCFF00" }]}>[{issue.id}]</Text>
                          <View style={[styles.priorityBadge, { backgroundColor: colors.elevated }]}>
                            <Text style={[styles.priorityBadgeText, { color: colors.amber }]}>
                              {issue.priority}
                            </Text>
                          </View>
                        </View>

                        <Text style={[styles.jiraCardTitle, { color: colors.foreground }]}>
                          {issue.title}
                        </Text>

                        <Text style={[styles.assigneeText, { color: colors.muted }]}>
                          👤 {issue.assignee}
                        </Text>

                        {/* EXPLICIT STATUS CHOICE SELECTOR (TODO, IN PROGRESS, IN REVIEW, DONE) */}
                        <View style={[styles.choiceSelectorBox, { borderTopColor: colors.border }]}>
                          <View style={styles.choiceHeaderLine}>
                            <Text style={[styles.choiceLabel, { color: colors.muted }]}>STATUS CHOICE:</Text>
                            <View style={[styles.currentStatusBadge, { backgroundColor: col.color + "22", borderColor: col.color + "55" }]}>
                              <Text style={[styles.currentStatusBadgeText, { color: col.color }]}>
                                {col.title.toUpperCase()}
                              </Text>
                            </View>
                          </View>

                          <View style={styles.choicePillsRow}>
                            {JIRA_COLUMNS.map((c) => {
                              const isCurrent = issue.status === c.id;
                              return (
                                <TouchableOpacity
                                  key={c.id}
                                  activeOpacity={0.8}
                                  style={[
                                    styles.choicePill,
                                    {
                                      backgroundColor: isCurrent ? c.color : colors.elevated,
                                      borderColor: isCurrent ? c.color : colors.border,
                                    },
                                  ]}
                                  onPress={() => moveJiraStatus(issue.id, c.id)}
                                >
                                  {isCurrent ? (
                                    <Ionicons
                                      name="checkmark-circle"
                                      size={11}
                                      color={c.id === "todo" ? "#000" : "#FFF"}
                                    />
                                  ) : (
                                    <Ionicons
                                      name="radio-button-off"
                                      size={10}
                                      color={colors.muted}
                                    />
                                  )}
                                  <Text
                                    style={[
                                      styles.choicePillText,
                                      { color: isCurrent ? (c.id === "todo" ? "#000" : "#FFF") : colors.foreground },
                                      isCurrent && { fontWeight: "900" },
                                    ]}
                                  >
                                    {c.title}
                                  </Text>
                                </TouchableOpacity>
                              );
                            })}
                          </View>
                        </View>
                      </GlassCard>
                    ))}
                  </View>
                );
              })
            )}
          </View>
        )}
      </ScrollView>

      {/* FULL IN-APP REPOSITORY CODE VIEWER & VS CODE TOOLS MODAL */}
      <Modal visible={!!openRepo} animationType="slide" transparent onRequestClose={() => setOpenRepo(null)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.repoViewerCard, { backgroundColor: isDarkMode ? "#121216" : "#FFFFFF", borderColor: colors.border }]}>
            {/* TOAST ALERT */}
            {repoToast ? (
              <View style={[styles.toastBar, { backgroundColor: "rgba(204, 255, 0, 0.15)", borderColor: "#CCFF00" }]}>
                <Text style={styles.toastBarText}>{repoToast}</Text>
              </View>
            ) : null}

            {/* REPO MODAL HEADER */}
            <View style={[styles.viewerHeader, { borderBottomColor: colors.border }]}>
              <View style={{ flex: 1, paddingRight: 10 }}>
                <View style={styles.repoBadgeRow}>
                  <Text style={[styles.repoSubBadge, { color: "#CCFF00" }]}>GITHUB REPOSITORY</Text>
                  <View style={[styles.diskPathPill, { backgroundColor: "rgba(16, 185, 129, 0.15)" }]}>
                    <Text style={{ fontSize: 9, color: "#10B981", fontWeight: "700" }}>
                      📁 E:\Heartbeat API\demo_workspace
                    </Text>
                  </View>
                </View>

                <Text style={[styles.repoViewerTitle, { color: colors.foreground }]}>
                  alex-chen / {openRepo?.name}
                </Text>

                <Text style={[styles.repoMetaLine, { color: colors.muted }]}>
                  main · {openRepo?.files?.length || 4} files · {openRepo?.commits?.length || 1} commits ·{" "}
                  <Text style={{ color: "#CCFF00", fontWeight: "800" }}>+{openRepo?.additions || 45}</Text>{" "}
                  <Text style={{ color: colors.danger, fontWeight: "800" }}>-{openRepo?.deletions || 0}</Text>
                </Text>
              </View>

              <TouchableOpacity onPress={() => setOpenRepo(null)}>
                <Ionicons name="close-circle" size={26} color={colors.muted} />
              </TouchableOpacity>
            </View>

            {/* DISK PULL, DISK PUSH, VS CODE & + NEW FILE ACTION ROW */}
            <View style={[styles.syncActionRow, { borderBottomColor: colors.border }]}>
              <TouchableOpacity
                activeOpacity={0.8}
                style={[styles.syncBtn, { backgroundColor: "#CCFF00", borderColor: "#CCFF00" }]}
                onPress={() => setShowNewFileModal(true)}
              >
                <Ionicons name="add-circle" size={14} color="#000" />
                <Text style={[styles.syncBtnText, { color: "#000", fontWeight: "900" }]}>+ New File</Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                style={[styles.syncBtn, { backgroundColor: colors.elevated, borderColor: colors.border }]}
                onPress={handleDiskPull}
              >
                <Ionicons name="download-outline" size={14} color="#CCFF00" />
                <Text style={[styles.syncBtnText, { color: colors.foreground }]}>Disk Pull ⬇️</Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                style={[styles.syncBtn, { backgroundColor: "rgba(204, 255, 0, 0.15)", borderColor: "#CCFF00" }]}
                onPress={handleDiskPush}
              >
                <Ionicons name="cloud-upload-outline" size={14} color="#CCFF00" />
                <Text style={[styles.syncBtnText, { color: "#CCFF00" }]}>Disk Push ⬆️</Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                style={[styles.syncBtn, { backgroundColor: "rgba(59, 130, 246, 0.15)", borderColor: "#3B82F6" }]}
                onPress={() => setShowVsCodeModal(true)}
              >
                <Ionicons name="terminal-outline" size={14} color="#60A5FA" />
                <Text style={[styles.syncBtnText, { color: "#60A5FA" }]}>VS Code Terminal Guide</Text>
              </TouchableOpacity>
            </View>

            {/* SUB-TABS: CODE VS HISTORY */}
            <View style={styles.subTabRow}>
              <TouchableOpacity
                style={[
                  styles.subTabBtn,
                  repoSubTab === "code" && { borderBottomColor: "#CCFF00", borderBottomWidth: 2 },
                ]}
                onPress={() => setRepoSubTab("code")}
              >
                <Text
                  style={[
                    styles.subTabText,
                    { color: repoSubTab === "code" ? "#CCFF00" : colors.muted },
                    repoSubTab === "code" && { fontWeight: "900" },
                  ]}
                >
                  Code Explorer
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.subTabBtn,
                  repoSubTab === "history" && { borderBottomColor: "#CCFF00", borderBottomWidth: 2 },
                ]}
                onPress={() => setRepoSubTab("history")}
              >
                <Text
                  style={[
                    styles.subTabText,
                    { color: repoSubTab === "history" ? "#CCFF00" : colors.muted },
                    repoSubTab === "history" && { fontWeight: "900" },
                  ]}
                >
                  Commit History ({openRepo?.commits?.length || 1})
                </Text>
              </TouchableOpacity>
            </View>

            {/* TAB 1: CODE EXPLORER */}
            {repoSubTab === "code" && (
              <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
                {/* PROMINENT FILE EXPLORER HEADER WITH "+ NEW FILE" BUTTON */}
                <View style={styles.fileExplorerBar}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                    <Ionicons name="file-tray-stacked-outline" size={14} color="#CCFF00" />
                    <Text style={[styles.fileExplorerTitle, { color: colors.foreground }]}>
                      File Explorer ({openRepo?.files?.length || 0})
                    </Text>
                  </View>

                  <TouchableOpacity
                    activeOpacity={0.8}
                    style={[styles.newFileHeaderBtn, { backgroundColor: "#CCFF00" }]}
                    onPress={() => setShowNewFileModal(true)}
                  >
                    <Ionicons name="add-circle" size={14} color="#000" />
                    <Text style={styles.newFileHeaderBtnText}>+ New File</Text>
                  </TouchableOpacity>
                </View>

                {/* HORIZONTAL FILE TABS */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.fileTabsRow}>
                  {openRepo?.files?.map((f) => {
                    const isSelected = (activeFilePath || openRepo?.files?.[0]?.path) === f.path;
                    return (
                      <TouchableOpacity
                        key={f.path}
                        style={[
                          styles.fileTabPill,
                          {
                            backgroundColor: isSelected ? colors.card : colors.elevated,
                            borderColor: isSelected ? "#CCFF00" : colors.border,
                          },
                        ]}
                        onPress={() => {
                          setActiveFilePath(f.path);
                          setEditedCodeContent(f.content);
                          setIsEditingCode(false);
                        }}
                      >
                        <Ionicons name="document-text-outline" size={12} color={isSelected ? "#CCFF00" : colors.muted} />
                        <Text
                          style={[
                            styles.fileTabText,
                            { color: isSelected ? colors.foreground : colors.muted },
                            isSelected && { fontWeight: "800" },
                          ]}
                        >
                          {f.path.split("/").pop()}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}

                  {/* QUICK + ADD PILL AT END OF TABS */}
                  <TouchableOpacity
                    style={[styles.addFilePillBtn, { backgroundColor: "rgba(204, 255, 0, 0.15)", borderColor: "#CCFF00" }]}
                    onPress={() => setShowNewFileModal(true)}
                  >
                    <Ionicons name="add" size={13} color="#CCFF00" />
                    <Text style={{ fontSize: 11, fontWeight: "800", color: "#CCFF00" }}>New</Text>
                  </TouchableOpacity>
                </ScrollView>

                {/* CODE VIEWER & LIVE INLINE CODE EDITOR */}
                <View style={[styles.codeBox, { backgroundColor: isDarkMode ? "#0A0D12" : "#F8FAFC", borderColor: colors.border }]}>
                  <View style={styles.codeHeader}>
                    <Text style={[styles.codeFilePath, { color: colors.foreground }]}>
                      📄 {activeFile?.path || "src/index.js"}
                    </Text>

                    <TouchableOpacity
                      style={[styles.editModeToggleBtn, { backgroundColor: isEditingCode ? "#CCFF00" : colors.elevated }]}
                      onPress={() => {
                        if (!isEditingCode) {
                          setEditedCodeContent(activeFile?.content || "");
                        }
                        setIsEditingCode(!isEditingCode);
                      }}
                    >
                      <Ionicons
                        name={isEditingCode ? "eye-outline" : "pencil-outline"}
                        size={12}
                        color={isEditingCode ? "#000" : colors.muted}
                      />
                      <Text style={[styles.editModeToggleText, { color: isEditingCode ? "#000" : colors.muted }]}>
                        {isEditingCode ? "Done Editing" : "✏️ Edit Code"}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {isEditingCode ? (
                    <TextInput
                      style={[styles.codeEditorInput, { color: colors.foreground }]}
                      value={editedCodeContent}
                      onChangeText={setEditedCodeContent}
                      multiline
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                  ) : (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      <View style={styles.codeTextContainer}>
                        {(activeFile?.content || "// Empty file").split("\n").map((line, idx) => (
                          <View key={idx} style={styles.codeLineRow}>
                            <Text style={[styles.lineNumberText, { color: colors.subtle }]}>{idx + 1}</Text>
                            <Text style={[styles.codeLineText, { color: colors.foreground }]}>{line}</Text>
                          </View>
                        ))}
                      </View>
                    </ScrollView>
                  )}
                </View>

                {/* COMMIT BAR */}
                <View style={[styles.commitBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <TextInput
                    style={[styles.commitInput, { backgroundColor: colors.elevated, color: colors.foreground }]}
                    placeholder="Commit message (e.g. feat: update algorithm)"
                    placeholderTextColor={colors.subtle}
                    value={commitMsg}
                    onChangeText={setCommitMsg}
                  />
                  <TouchableOpacity
                    activeOpacity={0.8}
                    style={[styles.commitBtn, { backgroundColor: "#CCFF00" }]}
                    onPress={handleCommitCode}
                  >
                    <Text style={styles.commitBtnText}>Commit Changes →</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}

            {/* TAB 2: COMMIT HISTORY */}
            {repoSubTab === "history" && (
              <ScrollView style={{ flex: 1, padding: 10 }} showsVerticalScrollIndicator={false}>
                {openRepo?.commits?.map((c) => (
                  <GlassCard key={c.id} elevated style={styles.commitItemCard}>
                    <View style={styles.commitTopRow}>
                      <Text style={[styles.commitMsgText, { color: colors.foreground }]}>{c.message}</Text>
                      <View style={[styles.diffBadge, { backgroundColor: "rgba(204, 255, 0, 0.15)" }]}>
                        <Text style={{ fontSize: 10, color: "#CCFF00", fontWeight: "800" }}>+{c.additions} -{c.deletions}</Text>
                      </View>
                    </View>
                    <Text style={[styles.commitMetaText, { color: colors.muted }]}>
                      👤 {c.author} · {c.time} · commit {c.id}
                    </Text>
                  </GlassCard>
                ))}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* CREATE NEW FILE MODAL (PROMINENT OPTION) */}
      <Modal visible={showNewFileModal} animationType="slide" transparent onRequestClose={() => setShowNewFileModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.formModalCard, { backgroundColor: isDarkMode ? "#18181B" : "#FFFFFF", borderColor: colors.border }]}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={[styles.modalTitle, { color: colors.foreground }]}>Create New File</Text>
                <Text style={[styles.modalSub, { color: colors.muted }]}>Add a source file to {openRepo?.name}</Text>
              </View>
              <TouchableOpacity onPress={() => setShowNewFileModal(false)}>
                <Ionicons name="close-circle" size={24} color={colors.muted} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.inputLabel, { color: colors.muted }]}>File Path *</Text>
            <TextInput
              style={[styles.modalInput, { backgroundColor: colors.elevated, borderColor: colors.border, color: colors.foreground }]}
              placeholder="e.g. src/utils/helpers.ts or docs/API.md"
              placeholderTextColor={colors.subtle}
              value={newFilePath}
              onChangeText={setNewFilePath}
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Text style={[styles.inputLabel, { color: colors.muted }]}>Initial Code Content (Optional)</Text>
            <TextInput
              style={[styles.modalInput, styles.fileContentArea, { backgroundColor: colors.elevated, borderColor: colors.border, color: colors.foreground }]}
              placeholder="// Write initial code or markdown here..."
              placeholderTextColor={colors.subtle}
              value={newFileContent}
              onChangeText={setNewFileContent}
              multiline
              autoCapitalize="none"
              autoCorrect={false}
            />

            <TouchableOpacity
              activeOpacity={0.8}
              style={[styles.submitFormBtn, { backgroundColor: "#CCFF00" }]}
              onPress={handleCreateNewFile}
            >
              <Text style={styles.submitFormBtnText}>Create & Open File 🚀</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* VS CODE TERMINAL GUIDE MODAL */}
      <Modal visible={showVsCodeModal} animationType="slide" transparent onRequestClose={() => setShowVsCodeModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.vsCodeCard, { backgroundColor: isDarkMode ? "#18181B" : "#FFFFFF", borderColor: colors.border }]}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={[styles.modalTitle, { color: colors.foreground }]}>VS Code & Git Terminal Guide</Text>
                <Text style={[styles.modalSub, { color: colors.muted }]}>Sync local files from your terminal</Text>
              </View>
              <TouchableOpacity onPress={() => setShowVsCodeModal(false)}>
                <Ionicons name="close-circle" size={24} color={colors.muted} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={[styles.stepTitle, { color: colors.foreground }]}>1. Clone Repository Locally</Text>
              <View style={[styles.terminalBox, { backgroundColor: "#0A0D12" }]}>
                <Text style={styles.cmdText}>git clone https://github.com/buildverse/{(openRepo?.name || "repo").toLowerCase().replace(/\s+/g, "-")}.git</Text>
                <Text style={styles.cmdText}>cd {(openRepo?.name || "repo").toLowerCase().replace(/\s+/g, "-")}</Text>
              </View>

              <Text style={[styles.stepTitle, { color: colors.foreground, marginTop: 12 }]}>2. Open in VS Code</Text>
              <View style={[styles.terminalBox, { backgroundColor: "#0A0D12" }]}>
                <Text style={styles.cmdText}>code .</Text>
              </View>

              <Text style={[styles.stepTitle, { color: colors.foreground, marginTop: 12 }]}>3. Disk Push to BuildVerse</Text>
              <View style={[styles.terminalBox, { backgroundColor: "#0A0D12" }]}>
                <Text style={styles.cmdText}>git add .</Text>
                <Text style={styles.cmdText}>git commit -m "feat: sync from vs code"</Text>
                <Text style={styles.cmdText}>git push origin main</Text>
              </View>

              <Text style={[styles.stepTitle, { color: colors.foreground, marginTop: 12 }]}>4. Local Workspace Folder</Text>
              <Text style={[styles.pathNotice, { color: colors.amber }]}>
                Physical disk path: E:\Heartbeat API\demo_workspace
              </Text>

              <TouchableOpacity
                activeOpacity={0.8}
                style={[styles.copyBtn, { backgroundColor: "#CCFF00" }]}
                onPress={handleCopyVsCodeCommands}
              >
                <Ionicons name="copy-outline" size={16} color="#000" />
                <Text style={styles.copyBtnText}>Copy Terminal Commands</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* CREATE REPOSITORY MODAL */}
      <Modal visible={showCreateRepoModal} animationType="slide" transparent onRequestClose={() => setShowCreateRepoModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.formModalCard, { backgroundColor: isDarkMode ? "#18181B" : "#FFFFFF", borderColor: colors.border }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.foreground }]}>Create New Repository</Text>
              <TouchableOpacity onPress={() => setShowCreateRepoModal(false)}>
                <Ionicons name="close-circle" size={24} color={colors.muted} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.inputLabel, { color: colors.muted }]}>Repository Name *</Text>
            <TextInput
              style={[styles.modalInput, { backgroundColor: colors.elevated, borderColor: colors.border, color: colors.foreground }]}
              placeholder="e.g. NextGen Microservices Engine"
              placeholderTextColor={colors.subtle}
              value={newRepoName}
              onChangeText={setNewRepoName}
            />

            <Text style={[styles.inputLabel, { color: colors.muted }]}>Description</Text>
            <TextInput
              style={[styles.modalInput, { backgroundColor: colors.elevated, borderColor: colors.border, color: colors.foreground }]}
              placeholder="What are you building in this repo?"
              placeholderTextColor={colors.subtle}
              value={newRepoDesc}
              onChangeText={setNewRepoDesc}
            />

            <Text style={[styles.inputLabel, { color: colors.muted }]}>Tech Stack Tag</Text>
            <View style={styles.tagSelectRow}>
              {["Node.js", "React Native", "Rust / GPU", "Go", "Web3"].map((tag) => (
                <TouchableOpacity
                  key={tag}
                  style={[
                    styles.tagSelectPill,
                    {
                      backgroundColor: newRepoTag === tag ? "#CCFF00" : colors.elevated,
                      borderColor: newRepoTag === tag ? "#CCFF00" : colors.border,
                    },
                  ]}
                  onPress={() => setNewRepoTag(tag)}
                >
                  <Text
                    style={[
                      styles.tagSelectText,
                      { color: newRepoTag === tag ? "#000" : colors.muted },
                      newRepoTag === tag && { fontWeight: "900" },
                    ]}
                  >
                    {tag}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              activeOpacity={0.8}
              style={[styles.submitFormBtn, { backgroundColor: "#CCFF00" }]}
              onPress={handleCreateRepo}
            >
              <Text style={styles.submitFormBtnText}>Initialize Repository 🚀</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* CREATE JIRA TICKET MODAL */}
      <Modal visible={showJiraModal} animationType="slide" transparent onRequestClose={() => setShowJiraModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.formModalCard, { backgroundColor: isDarkMode ? "#18181B" : "#FFFFFF", borderColor: colors.border }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.foreground }]}>Create Sprint 24 Ticket</Text>
              <TouchableOpacity onPress={() => setShowJiraModal(false)}>
                <Ionicons name="close-circle" size={24} color={colors.muted} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.inputLabel, { color: colors.muted }]}>Ticket Title *</Text>
            <TextInput
              style={[styles.modalInput, { backgroundColor: colors.elevated, borderColor: colors.border, color: colors.foreground }]}
              placeholder="e.g. Implement caching middleware"
              placeholderTextColor={colors.subtle}
              value={jiraTitle}
              onChangeText={setJiraTitle}
            />

            <Text style={[styles.inputLabel, { color: colors.muted }]}>Priority</Text>
            <View style={styles.tagSelectRow}>
              {["Critical", "High", "Medium", "Low"].map((p) => (
                <TouchableOpacity
                  key={p}
                  style={[
                    styles.tagSelectPill,
                    {
                      backgroundColor: jiraPriority === p ? "#CCFF00" : colors.elevated,
                      borderColor: jiraPriority === p ? "#CCFF00" : colors.border,
                    },
                  ]}
                  onPress={() => setJiraPriority(p)}
                >
                  <Text
                    style={[
                      styles.tagSelectText,
                      { color: jiraPriority === p ? "#000" : colors.muted },
                      jiraPriority === p && { fontWeight: "900" },
                    ]}
                  >
                    {p}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.inputLabel, { color: colors.muted }]}>Status Choice (Column) *</Text>
            <View style={styles.tagSelectRow}>
              {JIRA_COLUMNS.map((c) => (
                <TouchableOpacity
                  key={c.id}
                  style={[
                    styles.tagSelectPill,
                    {
                      backgroundColor: jiraStatus === c.id ? c.color : colors.elevated,
                      borderColor: jiraStatus === c.id ? c.color : colors.border,
                    },
                  ]}
                  onPress={() => setJiraStatus(c.id)}
                >
                  {jiraStatus === c.id && (
                    <Ionicons
                      name="checkmark"
                      size={12}
                      color={c.id === "todo" ? "#000" : "#FFF"}
                      style={{ marginRight: 2 }}
                    />
                  )}
                  <Text
                    style={[
                      styles.tagSelectText,
                      { color: jiraStatus === c.id ? (c.id === "todo" ? "#000" : "#FFF") : colors.muted },
                      jiraStatus === c.id && { fontWeight: "900" },
                    ]}
                  >
                    {c.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.inputLabel, { color: colors.muted }]}>Assignee</Text>
            <TextInput
              style={[styles.modalInput, { backgroundColor: colors.elevated, borderColor: colors.border, color: colors.foreground }]}
              value={jiraAssignee}
              onChangeText={setJiraAssignee}
            />

            <TouchableOpacity
              activeOpacity={0.8}
              style={[styles.submitFormBtn, { backgroundColor: "#CCFF00" }]}
              onPress={handleCreateJiraIssue}
            >
              <Text style={styles.submitFormBtnText}>Create Ticket ✓</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 18, paddingBottom: 40 },
  header: { marginBottom: 16 },
  eyebrowPill: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 9999,
    borderWidth: 1,
    marginBottom: 6,
  },
  eyebrowText: { fontSize: 9, fontWeight: "900", letterSpacing: 0.8 },
  title: { fontSize: 22, fontWeight: "900", letterSpacing: -0.5 },
  subtitle: { fontSize: 12, marginTop: 4, lineHeight: 17 },
  topActionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 14,
    flexWrap: "wrap",
  },
  createRepoBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 9999,
  },
  createRepoBtnText: { fontSize: 12, fontWeight: "900", color: "#000" },
  topNewFileActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 9999,
    borderWidth: 1,
  },
  topNewFileActionBtnText: { fontSize: 12, fontWeight: "900", color: "#CCFF00" },
  tabBarRow: {
    borderBottomWidth: 1,
    paddingBottom: 14,
    marginBottom: 16,
  },
  pillContainer: {
    flexDirection: "row",
    borderRadius: 9999,
    padding: 3,
    borderWidth: 1,
  },
  tabPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 9999,
  },
  tabPillText: { fontSize: 11 },
  tabContentSection: { gap: 14 },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 6,
  },
  searchInput: { flex: 1, fontSize: 13 },
  repoList: { gap: 14 },
  repoCard: { padding: 16, borderRadius: 20, borderWidth: 1 },
  repoCardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  repoInitialBox: {
    width: 34,
    height: 34,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  repoInitialText: { fontSize: 13, fontWeight: "900" },
  tagBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 9999, borderWidth: 1 },
  tagBadgeText: { fontSize: 10, fontWeight: "800" },
  repoName: { fontSize: 16, fontWeight: "800", marginTop: 10 },
  repoDesc: { fontSize: 12, lineHeight: 17, marginTop: 4 },
  repoFooter: { marginTop: 12, borderTopWidth: 1, borderTopColor: "rgba(150,150,150,0.15)", paddingTop: 10 },
  repoStatRow: { marginBottom: 6 },
  repoStatText: { fontSize: 11 },
  progressRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  progressLabel: { fontSize: 10, fontWeight: "700" },
  progressVal: { fontSize: 10, fontWeight: "800" },
  progressTrack: { height: 5, borderRadius: 3, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 3 },
  repoCardActionsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "rgba(150,150,150,0.15)",
  },
  cardNewFileBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 9999,
  },
  cardNewFileBtnText: { fontSize: 11, fontWeight: "900", color: "#000" },
  cardExplorerBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 9999,
    borderWidth: 1,
  },
  cardExplorerBtnText: { fontSize: 11, fontWeight: "800" },
  jiraHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  badgePill: { alignSelf: "flex-start", paddingHorizontal: 7, paddingVertical: 2, borderRadius: 9999, borderWidth: 1, marginBottom: 4 },
  badgePillText: { fontSize: 9, fontWeight: "900", letterSpacing: 0.8 },
  jiraTitle: { fontSize: 18, fontWeight: "900" },
  newTicketBtn: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 9999 },
  newTicketBtnText: { fontSize: 11, fontWeight: "900", color: "#000" },
  jiraColBox: { padding: 14, borderRadius: 18, borderWidth: 1, marginBottom: 12, gap: 10 },
  jiraColHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderBottomWidth: 1, borderBottomColor: "rgba(150,150,150,0.15)", paddingBottom: 6 },
  jiraColTitle: { fontSize: 11, fontWeight: "900", letterSpacing: 0.8 },
  countBadge: { paddingHorizontal: 7, paddingVertical: 1, borderRadius: 9999 },
  countBadgeText: { fontSize: 10, fontWeight: "800" },
  jiraCard: { padding: 12, borderRadius: 14, borderWidth: 1, gap: 6 },
  jiraCardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  jiraId: { fontSize: 11, fontWeight: "900" },
  priorityBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 9999 },
  priorityBadgeText: { fontSize: 9, fontWeight: "800" },
  jiraCardTitle: { fontSize: 13, fontWeight: "700", lineHeight: 18 },
  assigneeText: { fontSize: 10, marginTop: 2 },
  choiceSelectorBox: { borderTopWidth: 1, paddingTop: 8, marginTop: 4, gap: 6 },
  choiceHeaderLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  choiceLabel: { fontSize: 9, fontWeight: "900", letterSpacing: 0.6 },
  currentStatusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  currentStatusBadgeText: { fontSize: 8, fontWeight: "900", letterSpacing: 0.5 },
  choicePillsRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  choicePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  choicePillText: { fontSize: 10, fontWeight: "700" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.8)", justifyContent: "center", padding: 16 },
  repoViewerCard: { flex: 1, borderRadius: 24, borderWidth: 1.5, padding: 16, marginTop: 30, marginBottom: 20 },
  toastBar: { padding: 10, borderRadius: 12, borderWidth: 1, marginBottom: 8 },
  toastBarText: { fontSize: 11, fontWeight: "800", color: "#CCFF00" },
  viewerHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", borderBottomWidth: 1, paddingBottom: 10 },
  repoBadgeRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 },
  repoSubBadge: { fontSize: 9, fontWeight: "900", letterSpacing: 0.8 },
  diskPathPill: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  repoViewerTitle: { fontSize: 17, fontWeight: "900" },
  repoMetaLine: { fontSize: 11, marginTop: 2 },
  syncActionRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, paddingVertical: 10, borderBottomWidth: 1 },
  syncBtn: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 9999, borderWidth: 1 },
  syncBtnText: { fontSize: 10, fontWeight: "800" },
  subTabRow: { flexDirection: "row", gap: 16, borderBottomWidth: 1, borderBottomColor: "rgba(150,150,150,0.15)", marginVertical: 8 },
  subTabBtn: { paddingVertical: 6 },
  subTabText: { fontSize: 12 },
  fileExplorerBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(150,150,150,0.15)",
    marginBottom: 6,
  },
  fileExplorerTitle: { fontSize: 12, fontWeight: "800" },
  newFileHeaderBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  newFileHeaderBtnText: { fontSize: 11, fontWeight: "900", color: "#000" },
  fileTabsRow: { marginVertical: 8 },
  fileTabPill: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 9999, borderWidth: 1, marginRight: 6 },
  fileTabText: { fontSize: 11 },
  addFilePillBtn: { flexDirection: "row", alignItems: "center", gap: 3, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 9999, borderWidth: 1, marginRight: 6 },
  codeBox: { borderRadius: 14, borderWidth: 1, overflow: "hidden", marginVertical: 8 },
  codeHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 8, borderBottomWidth: 1, borderBottomColor: "rgba(150,150,150,0.15)" },
  codeFilePath: { fontSize: 11, fontWeight: "700", fontFamily: "monospace" },
  editModeToggleBtn: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  editModeToggleText: { fontSize: 10, fontWeight: "800" },
  codeEditorInput: { padding: 10, fontFamily: "monospace", fontSize: 11, minHeight: 180, textAlignVertical: "top" },
  codeTextContainer: { padding: 10 },
  codeLineRow: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  lineNumberText: { fontSize: 11, fontFamily: "monospace", width: 22, textAlign: "right" },
  codeLineText: { fontSize: 11, fontFamily: "monospace", lineHeight: 18 },
  commitBar: { padding: 10, borderRadius: 14, borderWidth: 1, marginTop: 10, gap: 8 },
  commitInput: { borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6, fontSize: 12 },
  commitBtn: { paddingVertical: 10, borderRadius: 10, alignItems: "center" },
  commitBtnText: { fontSize: 12, fontWeight: "900", color: "#000" },
  commitItemCard: { padding: 12, borderRadius: 14, borderWidth: 1, marginBottom: 10 },
  commitTopRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  commitMsgText: { fontSize: 13, fontWeight: "700", flex: 1 },
  diffBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, marginLeft: 6 },
  commitMetaText: { fontSize: 10, marginTop: 4 },
  vsCodeCard: { borderRadius: 24, borderWidth: 1.5, padding: 20, maxHeight: "85%" },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 },
  modalTitle: { fontSize: 16, fontWeight: "900" },
  modalSub: { fontSize: 11, marginTop: 2 },
  stepTitle: { fontSize: 12, fontWeight: "800", marginBottom: 4 },
  terminalBox: { padding: 12, borderRadius: 12, gap: 4 },
  cmdText: { fontSize: 11, color: "#CCFF00", fontFamily: "monospace" },
  pathNotice: { fontSize: 11, fontWeight: "700", marginTop: 4 },
  copyBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 12, borderRadius: 9999, marginTop: 18 },
  copyBtnText: { fontSize: 12, fontWeight: "900", color: "#000" },
  formModalCard: { borderRadius: 24, borderWidth: 1.5, padding: 20 },
  inputLabel: { fontSize: 11, fontWeight: "700", marginTop: 10, marginBottom: 4 },
  modalInput: { borderRadius: 12, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 8, fontSize: 13 },
  fileContentArea: { height: 90, textAlignVertical: "top", fontFamily: "monospace" },
  tagSelectRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 4 },
  tagSelectPill: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 9999, borderWidth: 1 },
  tagSelectText: { fontSize: 11 },
  submitFormBtn: { alignItems: "center", justifyContent: "center", paddingVertical: 12, borderRadius: 9999, marginTop: 18 },
  submitFormBtnText: { fontSize: 12, fontWeight: "900", color: "#000" },
  emptyContainerCard: {
    borderRadius: 20,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "rgba(204, 255, 0, 0.3)",
    padding: 28,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 14,
    backgroundColor: "rgba(14, 16, 21, 0.8)",
  },
  emptyHeaderTitle: {
    fontSize: 16,
    fontWeight: "900",
    marginTop: 12,
    textAlign: "center",
  },
  emptyHeaderDesc: {
    fontSize: 12,
    lineHeight: 18,
    marginTop: 6,
    textAlign: "center",
    maxWidth: 280,
  },
  createFirstBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    marginTop: 16,
  },
  createFirstBtnText: {
    fontSize: 12,
    fontWeight: "900",
    color: "#000",
  },
});


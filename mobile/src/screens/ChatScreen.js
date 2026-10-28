import React, { useState, useEffect } from "react";
import {
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
import GlassCard from "../components/GlassCard";
import CustomButton from "../components/CustomButton";
import { fetchUsersApi } from "../lib/api";
import { fetchMentees } from "../lib/workspaceData";
import { darkColors, lightColors, theme, useThemeMode } from "../theme";

export default function ChatScreen({ route, navigation }) {
  const themeMode = typeof useThemeMode === "function" ? useThemeMode() : null;
  const isDarkMode = themeMode?.isDarkMode ?? true;
  const colors = themeMode?.themeColors || (isDarkMode ? darkColors : lightColors);

  const [activeTab, setActiveTab] = useState("chats");
  const [registeredUsers, setRegisteredUsers] = useState([]);
  const [directMessages, setDirectMessages] = useState([]);
  const [groups, setGroups] = useState([
    {
      id: "general_squad",
      name: "General Workspace Squad",
      members: "Workspace Room",
      icon: "terminal-outline",
      desc: "Default collaborative engineering squad room for all students and mentors.",
      joined: true,
    },
  ]);

  // ACTIVE CHAT SCREEN MODAL STATE
  const [activeChatRoom, setActiveChatRoom] = useState(null);
  const [roomMessages, setRoomMessages] = useState([]);
  const [chatInputText, setChatInputText] = useState("");

  // START & MANAGE GROUP MODAL STATE
  const [showStartGroupModal, setShowStartGroupModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDesc, setNewGroupDesc] = useState("");
  const [selectedGroupMembers, setSelectedGroupMembers] = useState([]);
  const [showGroupSettingsModal, setShowGroupSettingsModal] = useState(false);
  const [editGroupName, setEditGroupName] = useState("");

  // FETCH REAL USERS & MENTEES FROM MONGODB
  useEffect(() => {
    let isMounted = true;

    async function loadRealUsers() {
      try {
        const [usersData, menteesData] = await Promise.all([
          fetchUsersApi(),
          fetchMentees(),
        ]);

        if (!isMounted) return;

        const combinedUsers = [];
        const seenEmails = new Set();

        if (Array.isArray(usersData)) {
          usersData.forEach((u) => {
            if (u.email && !seenEmails.has(u.email)) {
              seenEmails.add(u.email);
              combinedUsers.push(u);
            }
          });
        }

        if (Array.isArray(menteesData)) {
          menteesData.forEach((m) => {
            if (m.email && !seenEmails.has(m.email)) {
              seenEmails.add(m.email);
              combinedUsers.push({
                id: m.id,
                name: m.name,
                email: m.email,
                role: "student",
                avatar: m.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
              });
            }
          });
        }

        setRegisteredUsers(combinedUsers);

        // Map into direct messages
        const dms = combinedUsers.map((u, idx) => ({
          id: u.id || `u_${idx}`,
          name: u.name,
          email: u.email,
          time: "LIVE",
          text: u.role === "mentor" ? "Lead Mentor • Ready for PR code review" : "Student Engineer in workspace",
          online: true,
          avatar: u.avatar || `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150`,
          isGroup: false,
          role: u.role || "member",
        }));

        setDirectMessages(dms);
      } catch (_e) {}
    }

    loadRealUsers();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleOpenChat = (dm) => {
    setActiveChatRoom(dm);
    setRoomMessages([
      {
        id: "msg_init_1",
        sender: dm.name,
        text: dm.isGroup
          ? `Welcome to #${dm.name} squad room! Start collaborating with your team.`
          : `Hello! Let's connect and review code on BuildVerse.`,
        time: "Just now",
        isMe: false,
      },
      {
        id: "msg_init_2",
        sender: "You",
        text: "Hey! Ready to discuss the project architecture.",
        time: "Just now",
        isMe: true,
      },
    ]);
  };

  const handleSendChatMessage = () => {
    if (!chatInputText.trim()) return;
    const sentText = chatInputText.trim();
    const newMsg = {
      id: `m_${Date.now()}`,
      sender: "You",
      text: sentText,
      time: "Just now",
      isMe: true,
    };

    setRoomMessages((prev) => [...prev, newMsg]);
    setChatInputText("");

    // Simulate realistic recipient response for interactive testing
    if (activeChatRoom && !activeChatRoom.isGroup) {
      setTimeout(() => {
        const replyMsg = {
          id: `reply_${Date.now()}`,
          sender: activeChatRoom.name,
          text: `Got your message: "${sentText.slice(0, 30)}${sentText.length > 30 ? "..." : ""}". Reviewing the commit now!`,
          time: "Just now",
          isMe: false,
        };
        setRoomMessages((prev) => [...prev, replyMsg]);
      }, 700);
    }
  };

  // CREATE NEW GROUP
  const handleCreateGroupSubmit = () => {
    if (!newGroupName.trim()) return;

    const chosenMembers = registeredUsers.filter((u) =>
      selectedGroupMembers.includes(u.id)
    );

    const groupChatId = `group_${Date.now()}`;
    const newGroupObj = {
      id: groupChatId,
      name: newGroupName.trim(),
      time: "NOW",
      text: `Squad created with ${chosenMembers.length + 1} workspace members`,
      online: true,
      selected: false,
      avatar: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=120",
      isGroup: true,
      members: chosenMembers,
    };

    setDirectMessages((prev) => [newGroupObj, ...prev]);

    const newHubGroup = {
      id: groupChatId,
      name: newGroupName.trim(),
      members: `${chosenMembers.length + 1} Members`,
      icon: "people-outline",
      desc: newGroupDesc.trim() || "Collaborative engineering squad created by workspace team.",
      joined: true,
    };
    setGroups((prev) => [newHubGroup, ...prev]);

    setNewGroupName("");
    setNewGroupDesc("");
    setSelectedGroupMembers([]);
    setShowStartGroupModal(false);

    handleOpenChat(newGroupObj);
  };

  // UPDATE GROUP NAME
  const handleUpdateGroupSubmit = () => {
    if (!editGroupName.trim() || !activeChatRoom) return;
    const updatedName = editGroupName.trim();
    setDirectMessages((prev) =>
      prev.map((dm) => (dm.id === activeChatRoom.id ? { ...dm, name: updatedName } : dm))
    );
    setGroups((prev) =>
      prev.map((g) => (g.id === activeChatRoom.id ? { ...g, name: updatedName } : g))
    );
    setActiveChatRoom((prev) => ({ ...prev, name: updatedName }));
    setShowGroupSettingsModal(false);
  };

  // DELETE GROUP CHAT
  const handleDeleteGroupChat = () => {
    if (!activeChatRoom) return;
    const targetId = activeChatRoom.id;
    setDirectMessages((prev) => prev.filter((dm) => dm.id !== targetId));
    setGroups((prev) => prev.filter((g) => g.id !== targetId));
    setShowGroupSettingsModal(false);
    setActiveChatRoom(null);
  };

  const toggleGroupMemberSelection = (id) => {
    setSelectedGroupMembers((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleJoinGroup = (group) => {
    const nextJoined = !group.joined;
    setGroups((prev) =>
      prev.map((g) => (g.id === group.id ? { ...g, joined: nextJoined } : g))
    );

    if (nextJoined) {
      const newGroupChat = {
        id: group.id,
        name: group.name,
        time: "NOW",
        text: `Welcome to #${group.name} squad chat!`,
        online: true,
        selected: false,
        avatar: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=120",
        isGroup: true,
      };

      setDirectMessages((prev) => {
        if (prev.some((d) => d.id === group.id)) return prev;
        return [newGroupChat, ...prev];
      });
      setActiveTab("chats");
      handleOpenChat(newGroupChat);
    }
  };

  return (
    <View style={[styles.safeArea, { backgroundColor: "#08090A" }]}>
      <View style={styles.container}>
        {/* BRAND HEADER & TOP NAV */}
        <View style={styles.headerRow}>
          <View>
            <Text style={[styles.brandTitle, { color: "#F8FAFC" }]}>
              buildverse<Text style={{ color: "#CCFF00" }}>.</Text>
            </Text>
            <Text style={{ fontSize: 11, color: "#94A3B8", marginTop: 2 }}>
              Workspace Realtime Chat & Squads
            </Text>
          </View>
          <View style={styles.headerRightRow}>
            <TouchableOpacity
              style={[styles.iconHeaderBtn, { backgroundColor: "#141720", borderColor: "rgba(204, 255, 0, 0.3)" }]}
              onPress={() => setShowStartGroupModal(true)}
            >
              <Ionicons name="add" size={20} color="#CCFF00" />
            </TouchableOpacity>
          </View>
        </View>

        {/* TAB TOGGLE */}
        <View style={[styles.tabToggleBox, { backgroundColor: "#0E1015", borderColor: "#1E2638" }]}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setActiveTab("chats")}
            style={[
              styles.toggleBtn,
              activeTab === "chats" && { backgroundColor: "#CCFF00" },
            ]}
          >
            <Text
              style={[
                styles.toggleText,
                { color: activeTab === "chats" ? "#000000" : "#94A3B8" },
              ]}
            >
              Direct Messages & Groups ({directMessages.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setActiveTab("hub")}
            style={[
              styles.toggleBtn,
              activeTab === "hub" && { backgroundColor: "#CCFF00" },
            ]}
          >
            <Text
              style={[
                styles.toggleText,
                { color: activeTab === "hub" ? "#000000" : "#94A3B8" },
              ]}
            >
              Squad Rooms ({groups.length})
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === "chats" ? (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {/* MESSAGES LIST CARD */}
            <GlassCard elevated style={[styles.messagesListCard, { backgroundColor: "#0E1015", borderColor: "rgba(204, 255, 0, 0.25)" }]}>
              <View style={styles.messagesHeaderRow}>
                <View>
                  <Text style={[styles.messagesHeading, { color: "#F8FAFC" }]}>Active Conversations</Text>
                  <Text style={{ fontSize: 11, color: "#94A3B8", marginTop: 2 }}>
                    Real registered members & created squads
                  </Text>
                </View>
                <TouchableOpacity
                  style={[styles.editPillBtn, { backgroundColor: "#CCFF00" }]}
                  onPress={() => setShowStartGroupModal(true)}
                >
                  <Ionicons name="people" size={15} color="#000000" />
                  <Text style={{ fontSize: 11, fontWeight: "900", color: "#000000", marginLeft: 4 }}>+ Squad</Text>
                </TouchableOpacity>
              </View>

              {directMessages.length === 0 ? (
                <View style={{ padding: 24, alignItems: "center" }}>
                  <Ionicons name="chatbubbles-outline" size={32} color="#94A3B8" />
                  <Text style={{ color: "#94A3B8", fontSize: 13, marginTop: 8, textAlign: "center" }}>
                    No other registered members yet. Tap "+ Squad" to create a new group chat.
                  </Text>
                </View>
              ) : (
                directMessages.map((dm) => (
                  <TouchableOpacity
                    key={dm.id}
                    activeOpacity={0.7}
                    onPress={() => handleOpenChat(dm)}
                    style={styles.dmRowItem}
                  >
                    <View style={styles.dmAvatarWrapper}>
                      <Image source={{ uri: dm.avatar }} style={styles.dmAvatarImg} />
                      {dm.online && <View style={[styles.onlineDot, { backgroundColor: "#CCFF00" }]} />}
                    </View>
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <View style={styles.dmNameRow}>
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                          <Text style={[styles.dmNameText, { color: "#F8FAFC" }]}>{dm.name}</Text>
                          {dm.isGroup ? (
                            <View style={[styles.roleBadge, { backgroundColor: "rgba(204, 255, 0, 0.15)", borderColor: "#CCFF00" }]}>
                              <Text style={[styles.roleBadgeText, { color: "#CCFF00" }]}>SQUAD</Text>
                            </View>
                          ) : (
                            <View style={[styles.roleBadge, { backgroundColor: "#141720", borderColor: "#1E2638" }]}>
                              <Text style={[styles.roleBadgeText, { color: dm.role === "mentor" ? "#CCFF00" : "#94A3B8" }]}>
                                {dm.role?.toUpperCase() || "DEV"}
                              </Text>
                            </View>
                          )}
                        </View>
                        <Text style={[styles.dmTimeText, { color: "#64748B" }]}>{dm.time}</Text>
                      </View>
                      <Text style={[styles.dmSnippetText, { color: "#94A3B8" }]} numberOfLines={1}>
                        {dm.text}
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color="#64748B" style={{ marginLeft: 6 }} />
                  </TouchableOpacity>
                ))
              )}
            </GlassCard>
          </ScrollView>
        ) : (
          /* SQUAD ROOMS HUB */
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            <View style={[styles.heroBox, { backgroundColor: "#0E1015", borderColor: "rgba(204, 255, 0, 0.25)" }]}>
              <Text style={[styles.heroTitle, { color: "#F8FAFC" }]}>Collaborative Engineering Squads</Text>
              <Text style={[styles.heroSub, { color: "#94A3B8" }]}>
                Only actual created squads and real registered members appear here. Build together with your mentors and peers.
              </Text>
              <CustomButton
                title="+ Create New Squad"
                variant="primary"
                size="md"
                style={{ alignSelf: "flex-start", marginTop: 12, backgroundColor: "#CCFF00" }}
                textStyle={{ color: "#000000", fontWeight: "900" }}
                onPress={() => setShowStartGroupModal(true)}
              />
            </View>

            {/* SQUAD CARDS */}
            {groups.map((group) => (
              <GlassCard key={group.id} elevated style={[styles.groupCard, { backgroundColor: "#0E1015", borderColor: "#1E2638" }]}>
                <View style={styles.groupHeaderRow}>
                  <View style={[styles.groupIconBox, { backgroundColor: "#141720" }]}>
                    <Ionicons name={group.icon || "people"} size={20} color="#CCFF00" />
                  </View>
                  <CustomButton
                    title={group.joined ? "Joined ✓" : "Join Squad"}
                    variant={group.joined ? "outline" : "primary"}
                    size="sm"
                    style={group.joined ? { borderColor: "#CCFF00" } : { backgroundColor: "#CCFF00" }}
                    textStyle={group.joined ? { color: "#CCFF00" } : { color: "#000000", fontWeight: "900" }}
                    onPress={() => handleJoinGroup(group)}
                  />
                </View>
                <Text style={[styles.groupName, { color: "#F8FAFC" }]}>{group.name}</Text>
                <Text style={[styles.groupDesc, { color: "#94A3B8" }]}>{group.desc}</Text>
              </GlassCard>
            ))}
          </ScrollView>
        )}
      </View>

      {/* FULL ACTIVE CHAT ROOM MODAL */}
      <Modal visible={!!activeChatRoom} transparent animationType="slide">
        <SafeAreaView style={[styles.modalSafeArea, { backgroundColor: "#08090A" }]}>
          <View style={[styles.chatModalHeader, { backgroundColor: "#0E1015", borderBottomColor: "rgba(204, 255, 0, 0.25)" }]}>
            <TouchableOpacity onPress={() => setActiveChatRoom(null)} style={{ padding: 4 }}>
              <Ionicons name="arrow-back" size={24} color="#F8FAFC" />
            </TouchableOpacity>

            <Image
              source={{ uri: activeChatRoom?.avatar }}
              style={{ width: 36, height: 36, borderRadius: 18, marginLeft: 8, borderWidth: 1, borderColor: "#CCFF00" }}
            />

            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={[styles.modalChatName, { color: "#F8FAFC" }]}>{activeChatRoom?.name}</Text>
              <Text style={[styles.modalOnlineSub, { color: "#CCFF00" }]}>● Active Realtime • BuildVerse Encrypted</Text>
            </View>

            {activeChatRoom?.isGroup && (
              <TouchableOpacity
                onPress={() => {
                  setEditGroupName(activeChatRoom.name);
                  setShowGroupSettingsModal(true);
                }}
                style={{ padding: 6 }}
              >
                <Ionicons name="settings-outline" size={20} color="#CCFF00" />
              </TouchableOpacity>
            )}
          </View>

          <ScrollView style={{ flex: 1, padding: 16 }}>
            <View style={{ alignItems: "center", marginVertical: 12 }}>
              <View style={[styles.dateBadge, { backgroundColor: "#141720", borderColor: "#1E2638", borderWidth: 1 }]}>
                <Text style={[styles.dateText, { color: "#94A3B8" }]}>ACTIVE SESSION</Text>
              </View>
            </View>

            {roomMessages.map((msg) => (
              <View
                key={msg.id}
                style={[
                  styles.msgBubble,
                  msg.isMe
                    ? { backgroundColor: "#CCFF00", alignSelf: "flex-end" }
                    : { backgroundColor: "#141720", borderColor: "rgba(204, 255, 0, 0.2)", borderWidth: 1, alignSelf: "flex-start" },
                ]}
              >
                {!msg.isMe && (
                  <Text style={{ fontSize: 10, fontWeight: "900", color: "#CCFF00", marginBottom: 2 }}>
                    {msg.sender}
                  </Text>
                )}
                <Text style={[styles.msgText, { color: msg.isMe ? "#000000" : "#F8FAFC" }]}>
                  {msg.text}
                </Text>
                <Text
                  style={{
                    fontSize: 9,
                    color: msg.isMe ? "rgba(0,0,0,0.6)" : "#64748B",
                    alignSelf: "flex-end",
                    marginTop: 4,
                    fontWeight: "600",
                  }}
                >
                  {msg.time}
                </Text>
              </View>
            ))}
          </ScrollView>

          {/* CHAT INPUT BAR */}
          <View style={[styles.chatInputBarModal, { backgroundColor: "#0E1015", borderTopColor: "rgba(204, 255, 0, 0.25)" }]}>
            <TextInput
              style={[styles.chatTextInputModal, { backgroundColor: "#141720", color: "#F8FAFC", borderColor: "#1E2638", borderWidth: 1 }]}
              placeholder={`Message ${activeChatRoom?.name}...`}
              placeholderTextColor="#64748B"
              value={chatInputText}
              onChangeText={setChatInputText}
              onSubmitEditing={handleSendChatMessage}
            />
            <TouchableOpacity onPress={handleSendChatMessage} style={[styles.sendBtnModal, { backgroundColor: "#CCFF00" }]}>
              <Ionicons name="send" size={16} color="#000000" />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>

      {/* MANAGE / DELETE GROUP CHAT MODAL */}
      <Modal visible={showGroupSettingsModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <GlassCard elevated style={[styles.modalContent, { backgroundColor: "#0E1015", borderColor: "#1E2638" }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: "#F8FAFC" }]}>Squad Settings</Text>
              <TouchableOpacity onPress={() => setShowGroupSettingsModal(false)}>
                <Ionicons name="close" size={24} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            <Text style={[styles.inputLabel, { color: "#94A3B8" }]}>Squad Name</Text>
            <TextInput
              style={[styles.input, { backgroundColor: "#141720", borderColor: "#1E2638", color: "#F8FAFC" }]}
              value={editGroupName}
              onChangeText={setEditGroupName}
            />

            <CustomButton
              title="Save Squad Changes"
              variant="primary"
              size="md"
              style={{ marginBottom: 12, backgroundColor: "#CCFF00" }}
              textStyle={{ color: "#000000", fontWeight: "900" }}
              onPress={handleUpdateGroupSubmit}
            />

            <CustomButton
              title="Delete Squad Room"
              variant="outline"
              size="md"
              style={{ borderColor: "#EF4444" }}
              textStyle={{ color: "#EF4444" }}
              icon={<Ionicons name="trash-outline" size={16} color="#EF4444" />}
              onPress={handleDeleteGroupChat}
            />
          </GlassCard>
        </View>
      </Modal>

      {/* START NEW GROUP MODAL WITH REAL USER SELECTION */}
      <Modal visible={showStartGroupModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <GlassCard elevated style={[styles.createGroupModalCard, { backgroundColor: "#0E1015", borderColor: "rgba(204, 255, 0, 0.3)" }]}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.modalHeader}>
                <View>
                  <Text style={[styles.modalTitle, { color: "#F8FAFC" }]}>Create Engineering Squad</Text>
                  <Text style={{ fontSize: 11, color: "#94A3B8", marginTop: 2 }}>
                    Add real registered members to a new collaborative room
                  </Text>
                </View>
                <TouchableOpacity onPress={() => setShowStartGroupModal(false)}>
                  <Ionicons name="close" size={24} color="#94A3B8" />
                </TouchableOpacity>
              </View>

              <Text style={[styles.inputLabel, { color: "#94A3B8", marginTop: 14 }]}>Squad Name</Text>
              <TextInput
                style={[styles.input, { backgroundColor: "#141720", borderColor: "#1E2638", color: "#F8FAFC" }]}
                placeholder="e.g. Distributed Core Systems"
                placeholderTextColor="#64748B"
                value={newGroupName}
                onChangeText={setNewGroupName}
              />

              <Text style={[styles.inputLabel, { color: "#94A3B8" }]}>Description / Topic</Text>
              <TextInput
                style={[styles.input, styles.textArea, { backgroundColor: "#141720", borderColor: "#1E2638", color: "#F8FAFC" }]}
                placeholder="Topic or project goals..."
                placeholderTextColor="#64748B"
                multiline
                numberOfLines={2}
                value={newGroupDesc}
                onChangeText={setNewGroupDesc}
              />

              <Text style={[styles.subHeading, { color: "#F8FAFC", marginTop: 12, marginBottom: 8 }]}>
                Select Workspace Members to Add ({selectedGroupMembers.length} selected):
              </Text>

              {registeredUsers.length === 0 ? (
                <Text style={{ color: "#94A3B8", fontSize: 12, marginVertical: 8 }}>
                  No other members registered yet.
                </Text>
              ) : (
                registeredUsers.map((u) => {
                  const isSelected = selectedGroupMembers.includes(u.id);
                  return (
                    <TouchableOpacity
                      key={u.id}
                      activeOpacity={0.7}
                      onPress={() => toggleGroupMemberSelection(u.id)}
                      style={[styles.memberSelectRow, isSelected && { backgroundColor: "#141720", borderColor: "#CCFF00" }]}
                    >
                      <View
                        style={[
                          styles.checkbox,
                          isSelected && { backgroundColor: "#CCFF00", borderColor: "#CCFF00" },
                        ]}
                      >
                        {isSelected && <Ionicons name="checkmark" size={14} color="#000000" />}
                      </View>
                      <Image source={{ uri: u.avatar }} style={{ width: 28, height: 28, borderRadius: 14, marginLeft: 8 }} />
                      <View style={{ flex: 1, marginLeft: 8 }}>
                        <Text style={[styles.memberNameText, { color: "#F8FAFC" }]}>{u.name}</Text>
                        <Text style={[styles.memberRoleText, { color: "#94A3B8" }]}>{u.role || "Developer"}</Text>
                      </View>
                    </TouchableOpacity>
                  );
                })
              )}

              <View style={styles.modalActions}>
                <CustomButton title="Cancel" variant="outline" size="md" onPress={() => setShowStartGroupModal(false)} />
                <CustomButton
                  title="Create Squad Chat"
                  variant="primary"
                  size="md"
                  style={{ marginLeft: 12, backgroundColor: "#CCFF00" }}
                  textStyle={{ color: "#000000", fontWeight: "900" }}
                  onPress={handleCreateGroupSubmit}
                />
              </View>
            </ScrollView>
          </GlassCard>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flex: 1, paddingHorizontal: 16, paddingTop: 10 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
  brandTitle: { fontSize: 24, fontWeight: "900", letterSpacing: -0.5 },
  headerRightRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  iconHeaderBtn: { width: 36, height: 36, borderRadius: 12, alignItems: "center", justifyContent: "center", borderWidth: 1 },
  tabToggleBox: { flexDirection: "row", padding: 4, borderRadius: 14, borderWidth: 1 },
  toggleBtn: { flex: 1, paddingVertical: 8, alignItems: "center", borderRadius: 10 },
  toggleText: { fontSize: 11, fontWeight: "800" },
  scrollContent: { paddingBottom: 40 },
  messagesListCard: { padding: 16, borderRadius: 20, borderWidth: 1 },
  messagesHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  messagesHeading: { fontSize: 16, fontWeight: "900" },
  editPillBtn: { flexDirection: "row", alignItems: "center", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 9999 },
  dmRowItem: { flexDirection: "row", alignItems: "center", paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#141720" },
  dmAvatarWrapper: { position: "relative" },
  dmAvatarImg: { width: 44, height: 44, borderRadius: 22, borderWidth: 1.5, borderColor: "rgba(204, 255, 0, 0.3)" },
  onlineDot: { width: 10, height: 10, borderRadius: 5, position: "absolute", bottom: 0, right: 0, borderWidth: 2, borderColor: "#08090A" },
  dmNameRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 3 },
  dmNameText: { fontSize: 14, fontWeight: "800" },
  dmTimeText: { fontSize: 10, fontWeight: "700" },
  dmSnippetText: { fontSize: 12, lineHeight: 16 },
  roleBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 9999, borderWidth: 1 },
  roleBadgeText: { fontSize: 8, fontWeight: "900", letterSpacing: 0.5 },
  heroBox: { padding: 18, borderRadius: 20, borderWidth: 1, marginBottom: 16 },
  heroTitle: { fontSize: 18, fontWeight: "900" },
  heroSub: { fontSize: 12, lineHeight: 17, marginTop: 4 },
  groupCard: { padding: 16, borderRadius: 18, borderWidth: 1, marginBottom: 12 },
  groupHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  groupIconBox: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  groupName: { fontSize: 15, fontWeight: "800" },
  groupDesc: { fontSize: 12, lineHeight: 16, marginTop: 4 },
  modalSafeArea: { flex: 1 },
  chatModalHeader: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1 },
  modalChatName: { fontSize: 15, fontWeight: "800" },
  modalOnlineSub: { fontSize: 10, marginTop: 1, fontWeight: "700" },
  dateBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 9999 },
  dateText: { fontSize: 9, fontWeight: "800", letterSpacing: 1 },
  msgBubble: { maxWidth: "80%", padding: 12, borderRadius: 16, marginBottom: 10 },
  msgText: { fontSize: 13, lineHeight: 18, fontWeight: "500" },
  chatInputBarModal: { flexDirection: "row", alignItems: "center", padding: 12, borderTopWidth: 1, gap: 10 },
  chatTextInputModal: { flex: 1, height: 42, borderRadius: 21, paddingHorizontal: 16, fontSize: 13 },
  sendBtnModal: { width: 42, height: 42, borderRadius: 21, alignItems: "center", justifyContent: "center" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.85)", justifyContent: "center", alignItems: "center", padding: 18 },
  modalContent: { width: "100%", padding: 20, borderRadius: 24, borderWidth: 1 },
  createGroupModalCard: { width: "100%", maxHeight: "85%", padding: 20, borderRadius: 24, borderWidth: 1 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  modalTitle: { fontSize: 17, fontWeight: "900" },
  inputLabel: { fontSize: 11, fontWeight: "800", textTransform: "uppercase", marginBottom: 4 },
  input: { height: 42, borderRadius: 12, borderWidth: 1, paddingHorizontal: 12, fontSize: 13, marginBottom: 12 },
  textArea: { height: 60, paddingTop: 10 },
  subHeading: { fontSize: 13, fontWeight: "800" },
  memberSelectRow: { flexDirection: "row", alignItems: "center", padding: 10, borderRadius: 12, marginBottom: 6, borderWidth: 1, borderColor: "transparent" },
  checkbox: { width: 20, height: 20, borderRadius: 6, borderWidth: 1.5, borderColor: "#64748B", alignItems: "center", justifyContent: "center" },
  memberNameText: { fontSize: 13, fontWeight: "800" },
  memberRoleText: { fontSize: 10, textTransform: "capitalize" },
  modalActions: { flexDirection: "row", justifyContent: "flex-end", marginTop: 16 },
});

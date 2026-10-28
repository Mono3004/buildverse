import React, { useState } from "react";
import {
  Alert,
  Linking,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import GlassCard from "../../components/GlassCard";
import CustomButton from "../../components/CustomButton";
import { darkColors, lightColors, theme, useThemeMode } from "../../theme";

const TAGS = ["All", "Showcase", "Feedback", "Question", "Resource"];

const INITIAL_POSTS = [
  {
    id: "p1",
    author_name: "Sarah Lin",
    author_color: "#3B82F6",
    tag: "Showcase",
    title: "Shipped Lumina WebGPU Engine v2.4 with Metal shaders! ⚡",
    body: "Rewrote the pipeline bindings in WGSL and saw a 3x frame-rate bump on Apple Silicon. Check out the demo repo below!",
    link: "https://github.com/buildverse/lumina-engine",
    created_at: "2h ago",
    likes: 18,
    likedByMe: false,
    author_id: "u_sarah",
  },
  {
    id: "p2",
    author_name: "Alex Chen",
    author_color: "#CCFF00",
    tag: "Feedback",
    title: "Request for critique: React Native bottom sheet gesture handling",
    body: "Looking for best practices around nested scroll views inside bottom sheets without stuttering. Any recommendations?",
    link: "",
    created_at: "5h ago",
    likes: 9,
    likedByMe: true,
    author_id: "u_alex",
  },
  {
    id: "p3",
    author_name: "Marcus Thorne",
    author_color: "#10B981",
    tag: "Resource",
    title: "Interactive WebAssembly & Go Architecture Guide",
    body: "Compiled our internal benchmark notes into an open cheatsheet. Covers memory allocation patterns between JS and WASM runtimes.",
    link: "https://buildverse.io/docs/wasm-cheatsheet",
    created_at: "1d ago",
    likes: 34,
    likedByMe: false,
    author_id: "u_marcus",
  },
  {
    id: "p4",
    author_name: "Elena Rostova",
    author_color: "#F59E0B",
    tag: "Question",
    title: "Microservices vs Modular Monolith in early SaaS stage?",
    body: "For our upcoming Sprint 30 team: how do you balance container orchestration overhead with developer velocity?",
    link: "",
    created_at: "2d ago",
    likes: 21,
    likedByMe: false,
    author_id: "u_elena",
  },
];

export default function StudentCommunityScreen({ navigation }) {
  const themeMode = typeof useThemeMode === "function" ? useThemeMode() : null;
  const isDarkMode = themeMode?.isDarkMode ?? true;
  const colors = themeMode?.themeColors || (isDarkMode ? darkColors : lightColors);

  const [posts, setPosts] = useState(INITIAL_POSTS);
  const [selectedTag, setSelectedTag] = useState("All");

  // CREATE POST MODAL STATE
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [postTag, setPostTag] = useState("Showcase");
  const [link, setLink] = useState("");

  const handleToggleLike = (postId) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const nextLiked = !p.likedByMe;
          return {
            ...p,
            likedByMe: nextLiked,
            likes: nextLiked ? p.likes + 1 : p.likes - 1,
          };
        }
        return p;
      })
    );
  };

  const handleCreatePost = () => {
    if (!title.trim()) {
      Alert.alert("Missing Title", "Please provide a title for your post.");
      return;
    }

    const newPost = {
      id: `p_${Date.now()}`,
      author_name: "Alex Chen",
      author_color: "#CCFF00",
      tag: postTag,
      title: title.trim(),
      body: body.trim(),
      link: link.trim(),
      created_at: "Just now",
      likes: 1,
      likedByMe: true,
      author_id: "u_alex",
    };

    setPosts([newPost, ...posts]);
    setTitle("");
    setBody("");
    setLink("");
    setPostTag("Showcase");
    setShowCreateModal(false);
  };

  const handleDeletePost = (postId) => {
    Alert.alert("Delete Post", "Are you sure you want to remove this post from the community?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => setPosts(posts.filter((p) => p.id !== postId)),
      },
    ]);
  };

  const handleOpenLink = (url) => {
    if (url) {
      Linking.openURL(url).catch(() => {
        Alert.alert("Cannot Open URL", url);
      });
    }
  };

  const visiblePosts = posts.filter(
    (p) => selectedTag === "All" || p.tag === selectedTag
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* EYEBROW & TITLE HEADER */}
        <View style={styles.header}>
          <View style={[styles.eyebrowPill, { backgroundColor: "rgba(204, 255, 0, 0.12)", borderColor: "rgba(204, 255, 0, 0.3)" }]}>
            <Text style={[styles.eyebrowText, { color: "#CCFF00" }]}>COMMUNITY FEED</Text>
          </View>
          <Text style={[styles.title, { color: colors.foreground }]}>What the crew is shipping</Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>
            Post your work, ask for a critique, and drop useful engineering resources.
          </Text>
        </View>

        {/* FAST ACTION: CREATE POST BUTTON */}
        <TouchableOpacity
          activeOpacity={0.85}
          style={[styles.createPostBar, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => setShowCreateModal(true)}
        >
          <View style={styles.createPostLeft}>
            <View style={[styles.userInitialsDot, { backgroundColor: "#CCFF00" }]}>
              <Text style={{ fontSize: 11, fontWeight: "900", color: "#000" }}>AC</Text>
            </View>
            <Text style={[styles.createPlaceholder, { color: colors.muted }]}>
              Share something with the community…
            </Text>
          </View>
          <View style={[styles.postButtonPill, { backgroundColor: "#CCFF00" }]}>
            <Ionicons name="add" size={16} color="#000" />
            <Text style={styles.postButtonPillText}>Post</Text>
          </View>
        </TouchableOpacity>

        {/* FILTER TAG CHIPS */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {TAGS.map((t) => {
            const isActive = selectedTag === t;
            return (
              <TouchableOpacity
                key={t}
                activeOpacity={0.8}
                onPress={() => setSelectedTag(t)}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: isActive ? "#CCFF00" : colors.elevated,
                    borderColor: isActive ? "#CCFF00" : colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    {
                      color: isActive ? "#000000" : colors.muted,
                      fontWeight: isActive ? "900" : "600",
                    },
                  ]}
                >
                  {t}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* POSTS LIST */}
        <View style={styles.postsList}>
          {visiblePosts.map((post) => {
            const isMine = post.author_id === "u_alex";
            return (
              <GlassCard key={post.id} elevated style={styles.postCard}>
                {/* AUTHOR ROW */}
                <View style={styles.postAuthorRow}>
                  <View style={styles.authorInfo}>
                    <View
                      style={[
                        styles.avatarCircle,
                        { backgroundColor: `${post.author_color}22`, borderColor: post.author_color },
                      ]}
                    >
                      <Text style={[styles.avatarInitial, { color: post.author_color }]}>
                        {post.author_name.slice(0, 2).toUpperCase()}
                      </Text>
                    </View>
                    <View style={{ marginLeft: 10 }}>
                      <Text style={[styles.authorName, { color: colors.foreground }]}>
                        {post.author_name}
                      </Text>
                      <Text style={[styles.postTime, { color: colors.muted }]}>
                        {post.created_at} • <Text style={{ color: colors.amber }}>{post.tag}</Text>
                      </Text>
                    </View>
                  </View>

                  {isMine && (
                    <TouchableOpacity
                      onPress={() => handleDeletePost(post.id)}
                      style={styles.deleteBtn}
                    >
                      <Ionicons name="trash-outline" size={15} color={colors.danger} />
                    </TouchableOpacity>
                  )}
                </View>

                {/* POST CONTENT */}
                <Text style={[styles.postTitle, { color: colors.foreground }]}>{post.title}</Text>

                {post.body ? (
                  <Text style={[styles.postBody, { color: colors.muted }]}>{post.body}</Text>
                ) : null}

                {/* CLICKABLE RESOURCE LINK */}
                {post.link ? (
                  <TouchableOpacity
                    activeOpacity={0.8}
                    style={[styles.linkBox, { backgroundColor: colors.elevated, borderColor: colors.border }]}
                    onPress={() => handleOpenLink(post.link)}
                  >
                    <Ionicons name="link-outline" size={14} color="#3B82F6" />
                    <Text style={styles.linkText} numberOfLines={1}>
                      {post.link}
                    </Text>
                  </TouchableOpacity>
                ) : null}

                {/* FOOTER ACTIONS: BOOST & SHARE */}
                <View style={[styles.postFooter, { borderTopColor: colors.border }]}>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    style={[
                      styles.boostBtn,
                      {
                        backgroundColor: post.likedByMe ? "rgba(204, 255, 0, 0.15)" : colors.elevated,
                        borderColor: post.likedByMe ? "#CCFF00" : colors.border,
                      },
                    ]}
                    onPress={() => handleToggleLike(post.id)}
                  >
                    <Text style={{ fontSize: 13, color: post.likedByMe ? "#CCFF00" : colors.muted }}>
                      ▲
                    </Text>
                    <Text
                      style={[
                        styles.boostText,
                        { color: post.likedByMe ? "#CCFF00" : colors.muted },
                      ]}
                    >
                      {post.likes} {post.likes === 1 ? "boost" : "boosts"}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.shareBtn, { backgroundColor: colors.elevated }]}
                    onPress={() => Alert.alert("Post Shared", "Link copied to clipboard.")}
                  >
                    <Ionicons name="share-social-outline" size={15} color={colors.muted} />
                  </TouchableOpacity>
                </View>
              </GlassCard>
            );
          })}

          {visiblePosts.length === 0 && (
            <View style={styles.emptyWrap}>
              <Ionicons name="planet-outline" size={40} color={colors.muted} />
              <Text style={[styles.emptyText, { color: colors.muted }]}>
                No posts found under "{selectedTag}". Be the first to share!
              </Text>
            </View>
          )}
        </View>

        {/* COMMUNITY RULES CARD */}
        <GlassCard elevated style={styles.rulesCard}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <Ionicons name="shield-checkmark-outline" size={18} color={colors.amber} />
            <Text style={[styles.rulesTitle, { color: colors.foreground }]}>Community Guidelines</Text>
          </View>
          <Text style={[styles.ruleItem, { color: colors.muted }]}>• Give technical feedback you would want to receive.</Text>
          <Text style={[styles.ruleItem, { color: colors.muted }]}>• Share your build process, not just screenshots.</Text>
          <Text style={[styles.ruleItem, { color: colors.muted }]}>• Always credit open-source collaborators & inspirations.</Text>
        </GlassCard>
      </ScrollView>

      {/* CREATE POST MODAL */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: isDarkMode ? "#18181B" : "#FFFFFF", borderColor: colors.border }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.foreground }]}>Create Community Post</Text>
              <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                <Ionicons name="close-circle" size={24} color={colors.muted} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={[styles.inputLabel, { color: colors.muted }]}>Post Title *</Text>
              <TextInput
                style={[styles.modalInput, { backgroundColor: colors.elevated, borderColor: colors.border, color: colors.foreground }]}
                placeholder="What are you shipping or discussing?"
                placeholderTextColor={colors.subtle}
                value={title}
                onChangeText={setTitle}
              />

              <Text style={[styles.inputLabel, { color: colors.muted }]}>Category Tag</Text>
              <View style={styles.tagPickerRow}>
                {["Showcase", "Feedback", "Question", "Resource"].map((t) => (
                  <TouchableOpacity
                    key={t}
                    style={[
                      styles.tagPickerChip,
                      {
                        backgroundColor: postTag === t ? "#CCFF00" : colors.elevated,
                        borderColor: postTag === t ? "#CCFF00" : colors.border,
                      },
                    ]}
                    onPress={() => setPostTag(t)}
                  >
                    <Text
                      style={[
                        styles.tagPickerText,
                        { color: postTag === t ? "#000000" : colors.muted },
                        postTag === t && { fontWeight: "900" },
                      ]}
                    >
                      {t}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[styles.inputLabel, { color: colors.muted }]}>Details / Code Snippet</Text>
              <TextInput
                style={[styles.modalInput, styles.textArea, { backgroundColor: colors.elevated, borderColor: colors.border, color: colors.foreground }]}
                placeholder="Share more context, technical stack, or question..."
                placeholderTextColor={colors.subtle}
                multiline
                numberOfLines={3}
                value={body}
                onChangeText={setBody}
              />

              <Text style={[styles.inputLabel, { color: colors.muted }]}>Project or GitHub Link (Optional)</Text>
              <TextInput
                style={[styles.modalInput, { backgroundColor: colors.elevated, borderColor: colors.border, color: colors.foreground }]}
                placeholder="https://github.com/..."
                placeholderTextColor={colors.subtle}
                value={link}
                onChangeText={setLink}
              />

              <TouchableOpacity
                activeOpacity={0.8}
                style={[styles.submitPostBtn, { backgroundColor: "#CCFF00" }]}
                onPress={handleCreatePost}
              >
                <Text style={styles.submitPostBtnText}>Publish to Feed 🚀</Text>
              </TouchableOpacity>
            </ScrollView>
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
  createPostBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 16,
  },
  createPostLeft: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
  userInitialsDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  createPlaceholder: { fontSize: 12 },
  postButtonPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 9999,
  },
  postButtonPillText: { fontSize: 12, fontWeight: "900", color: "#000" },
  filterRow: { gap: 8, paddingBottom: 16 },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 9999,
    borderWidth: 1,
  },
  filterChipText: { fontSize: 12 },
  postsList: { gap: 14, marginBottom: 20 },
  postCard: { padding: 16, borderRadius: 20, borderWidth: 1 },
  postAuthorRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  authorInfo: { flexDirection: "row", alignItems: "center" },
  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitial: { fontSize: 13, fontWeight: "900" },
  authorName: { fontSize: 14, fontWeight: "800" },
  postTime: { fontSize: 11, marginTop: 1 },
  deleteBtn: { padding: 4 },
  postTitle: { fontSize: 15, fontWeight: "800", lineHeight: 21, marginBottom: 6 },
  postBody: { fontSize: 13, lineHeight: 19, marginBottom: 10 },
  linkBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  linkText: { fontSize: 12, color: "#3B82F6", fontWeight: "700", flex: 1 },
  postFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    paddingTop: 10,
  },
  boostBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 9999,
    borderWidth: 1,
  },
  boostText: { fontSize: 11, fontWeight: "800" },
  shareBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyWrap: { alignItems: "center", justifyContent: "center", paddingVertical: 40 },
  emptyText: { fontSize: 13, textAlign: "center", marginTop: 10 },
  rulesCard: { padding: 16, borderRadius: 20, borderWidth: 1, gap: 6 },
  rulesTitle: { fontSize: 14, fontWeight: "800" },
  ruleItem: { fontSize: 12, lineHeight: 17 },
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
  inputLabel: { fontSize: 12, fontWeight: "700", marginBottom: 6, marginTop: 10 },
  modalInput: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
  },
  textArea: { height: 70, textAlignVertical: "top" },
  tagPickerRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 4 },
  tagPickerChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 9999,
    borderWidth: 1,
  },
  tagPickerText: { fontSize: 11 },
  submitPostBtn: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 13,
    borderRadius: 9999,
    marginTop: 20,
    marginBottom: 10,
  },
  submitPostBtnText: { fontSize: 13, fontWeight: "900", color: "#000000" },
});

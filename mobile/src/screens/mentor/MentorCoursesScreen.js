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
import { createCourse, deleteCourse, fetchCourses, getCourses } from "../../lib/workspaceData";
import { darkColors, lightColors, theme, useThemeMode } from "../../theme";

export default function MentorCoursesScreen({ navigation }) {
  const themeMode = typeof useThemeMode === "function" ? useThemeMode() : null;
  const isDarkMode = themeMode?.isDarkMode ?? true;
  const colors = themeMode?.themeColors || (isDarkMode ? darkColors : lightColors);

  const [courses, setCourses] = useState(getCourses());
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState("");
  const [level, setLevel] = useState("Core");
  const [summary, setSummary] = useState("");
  const [videoUrl, setVideoUrl] = useState("");

  const levelOptions = ["Core", "Advanced", "Mastery"];

  const reloadCourses = async () => {
    setLoading(true);
    const data = await fetchCourses();
    if (Array.isArray(data)) {
      setCourses(data);
    }
    setLoading(false);
  };

  React.useEffect(() => {
    reloadCourses();
    const timer = setInterval(reloadCourses, 5000);
    return () => clearInterval(timer);
  }, []);

  const handleCreate = async () => {
    if (!title.trim()) {
      Alert.alert("Missing Title", "Please provide a title for the course.");
      return;
    }

    await createCourse({
      title: title.trim(),
      level,
      summary: summary.trim() || "Advanced masterclass curriculum in software architecture.",
      videoUrl: videoUrl.trim() || "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      mentor: "Elias Thorne (Lead Mentor)",
    });

    await reloadCourses();
    setTitle("");
    setSummary("");
    setVideoUrl("");
    setShowAddModal(false);
    Alert.alert("Course Created", "New masterclass curriculum published to BuildVerse Academy!");
  };

  const handleDelete = (courseId) => {
    Alert.alert("Delete Course", "Are you sure you want to remove this masterclass from the Academy?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteCourse(courseId);
          await reloadCourses();
        },
      },
    ]);
  };

  const handleOpenVideo = (url) => {
    if (url) Linking.openURL(url);
  };

  return (
    <View style={[styles.safeArea, { backgroundColor: "#08090A" }]}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.badgePill}>
            <Text style={styles.badgePillText}>ACADEMY CURRICULUM</Text>
          </View>
          <Text style={[styles.headerTitle, { color: "#F8FAFC" }]}>Mentor Academy Management</Text>
          <Text style={[styles.headerSub, { color: "#94A3B8" }]}>
            Author technical curriculums, video lectures, and student diplomas.
          </Text>
        </View>

        {/* CREATE BUTTON */}
        <TouchableOpacity
          style={[styles.createCourseBtn, { backgroundColor: "#CCFF00" }]}
          activeOpacity={0.8}
          onPress={() => setShowAddModal(true)}
        >
          <Ionicons name="add-circle" size={16} color="#08090A" />
          <Text style={styles.createCourseBtnText}>+ Create Masterclass Course</Text>
        </TouchableOpacity>

        {/* COURSES LIST / EMPTY STATE */}
        <View style={styles.coursesList}>
          {courses.length === 0 ? (
            <GlassCard elevated style={styles.emptyCard}>
              <Ionicons name="school-outline" size={40} color="#CCFF00" />
              <Text style={[styles.emptyTitle, { color: "#F8FAFC" }]}>No Courses Published Yet</Text>
              <Text style={[styles.emptySub, { color: "#94A3B8" }]}>
                Share your technical expertise with students across the platform. Create and publish your first masterclass curriculum.
              </Text>
              <TouchableOpacity
                style={[styles.emptyActionBtn, { backgroundColor: "#CCFF00" }]}
                onPress={() => setShowAddModal(true)}
              >
                <Ionicons name="add" size={15} color="#08090A" />
                <Text style={styles.emptyActionBtnText}>Create First Course</Text>
              </TouchableOpacity>
            </GlassCard>
          ) : (
            courses.map((course) => (
              <GlassCard
                key={course.id}
                style={[styles.courseCard, { backgroundColor: "#0E1015", borderColor: "rgba(255, 255, 255, 0.08)" }]}
                elevated
              >
                <View style={styles.cardTopRow}>
                  <View style={[styles.levelBadge, { backgroundColor: "rgba(204, 255, 0, 0.12)", borderColor: "rgba(204, 255, 0, 0.25)" }]}>
                    <Text style={[styles.levelBadgeText, { color: "#CCFF00" }]}>{course.level.toUpperCase()}</Text>
                  </View>
                  <TouchableOpacity onPress={() => handleDelete(course.id)} style={styles.deleteBtn}>
                    <Ionicons name="trash-outline" size={15} color="#EF4444" />
                  </TouchableOpacity>
                </View>

                <Text style={[styles.courseTitle, { color: "#F8FAFC" }]}>{course.title}</Text>
                <Text style={[styles.courseSummary, { color: "#94A3B8" }]}>{course.summary}</Text>

                {/* STATS & METRIC CHIPS */}
                <View style={[styles.statsRow, { borderTopColor: "rgba(255, 255, 255, 0.06)" }]}>
                  <View style={styles.statChip}>
                    <Ionicons name="people-outline" size={13} color="#64748B" />
                    <Text style={[styles.statChipText, { color: "#94A3B8" }]}>
                      {course.enrolledCount || 0} Students
                    </Text>
                  </View>
                  <View style={styles.statChip}>
                    <Ionicons name="document-text-outline" size={13} color="#64748B" />
                    <Text style={[styles.statChipText, { color: "#94A3B8" }]}>
                      {course.lessons?.length || 0} Lessons
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.statChip}
                    onPress={() => handleOpenVideo(course.videoUrl)}
                  >
                    <Ionicons name="play-circle-outline" size={14} color="#CCFF00" />
                    <Text style={[styles.statChipText, { color: "#CCFF00", fontWeight: "700" }]}>
                      Watch Lecture
                    </Text>
                  </TouchableOpacity>
                </View>
              </GlassCard>
            ))
          )}
        </View>
      </ScrollView>

      {/* CREATE COURSE MODAL */}
      <Modal visible={showAddModal} animationType="slide" transparent onRequestClose={() => setShowAddModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: "#0E1015", borderColor: "rgba(204, 255, 0, 0.25)" }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: "#F8FAFC" }]}>Create Masterclass Course</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Ionicons name="close" size={20} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={[styles.label, { color: "#F8FAFC" }]}>Course Title *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: "#141720", borderColor: "rgba(255, 255, 255, 0.08)", color: "#F8FAFC" }]}
                placeholder="e.g. Distributed Consensus in Go"
                placeholderTextColor="#64748B"
                value={title}
                onChangeText={setTitle}
              />

              <Text style={[styles.label, { color: "#F8FAFC" }]}>Difficulty Level</Text>
              <View style={styles.levelPickerRow}>
                {levelOptions.map((opt) => {
                  const isSelected = level === opt;
                  return (
                    <TouchableOpacity
                      key={opt}
                      style={[
                        styles.levelOptPill,
                        {
                          backgroundColor: isSelected ? "#CCFF00" : "#141720",
                          borderColor: isSelected ? "#CCFF00" : "rgba(255, 255, 255, 0.08)",
                        },
                      ]}
                      onPress={() => setLevel(opt)}
                    >
                      <Text
                        style={[
                          styles.levelOptText,
                          { color: isSelected ? "#08090A" : "#94A3B8" },
                          isSelected && { fontWeight: "800" },
                        ]}
                      >
                        {opt}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={[styles.label, { color: "#F8FAFC" }]}>Curriculum Summary</Text>
              <TextInput
                style={[styles.input, styles.textArea, { backgroundColor: "#141720", borderColor: "rgba(255, 255, 255, 0.08)", color: "#F8FAFC" }]}
                placeholder="Brief description of the masterclass and learning outcomes..."
                placeholderTextColor="#64748B"
                multiline
                numberOfLines={3}
                value={summary}
                onChangeText={setSummary}
              />

              <Text style={[styles.label, { color: "#F8FAFC" }]}>Video Lecture URL (YouTube or MP4)</Text>
              <TextInput
                style={[styles.input, { backgroundColor: "#141720", borderColor: "rgba(255, 255, 255, 0.08)", color: "#F8FAFC" }]}
                placeholder="https://www.youtube.com/watch?v=..."
                placeholderTextColor="#64748B"
                value={videoUrl}
                onChangeText={setVideoUrl}
              />

              <TouchableOpacity style={[styles.submitBtn, { backgroundColor: "#CCFF00" }]} onPress={handleCreate}>
                <Text style={styles.submitBtnText}>Publish Course to Academy 🚀</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContainer: {
    padding: 14,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 14,
  },
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
  badgePillText: {
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.8,
    color: "#CCFF00",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: -0.5,
  },
  headerSub: {
    fontSize: 12,
    marginTop: 3,
    lineHeight: 17,
  },
  createCourseBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
    marginBottom: 16,
  },
  createCourseBtnText: {
    fontSize: 13,
    fontWeight: "900",
    color: "#08090A",
  },
  coursesList: {
    gap: 12,
  },
  courseCard: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  cardTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  levelBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 6,
    borderWidth: 1,
  },
  levelBadgeText: {
    fontSize: 9,
    fontWeight: "800",
  },
  deleteBtn: {
    padding: 4,
  },
  courseTitle: {
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  courseSummary: {
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 10,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: 1,
    paddingTop: 10,
  },
  statChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statChipText: {
    fontSize: 11,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.85)",
    justifyContent: "center",
    padding: 16,
  },
  modalCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    maxHeight: "85%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "800",
  },
  label: {
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 5,
    marginTop: 8,
  },
  input: {
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
  },
  textArea: {
    height: 60,
    textAlignVertical: "top",
  },
  levelPickerRow: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 6,
  },
  levelOptPill: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 9999,
    borderWidth: 1,
    alignItems: "center",
  },
  levelOptText: {
    fontSize: 11,
  },
  submitBtn: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 16,
    marginBottom: 8,
  },
  submitBtnText: {
    fontSize: 13,
    fontWeight: "900",
    color: "#08090A",
  },
  emptyCard: {
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "rgba(204, 255, 0, 0.25)",
    backgroundColor: "#0E1015",
    marginVertical: 10,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: "900",
    marginTop: 10,
    textAlign: "center",
  },
  emptySub: {
    fontSize: 11,
    lineHeight: 16,
    marginTop: 4,
    textAlign: "center",
    maxWidth: 260,
  },
  emptyActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 9999,
    marginTop: 12,
  },
  emptyActionBtnText: {
    fontSize: 11,
    fontWeight: "900",
    color: "#08090A",
  },
});

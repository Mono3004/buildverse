import React, { useState } from "react";
import {
  Linking,
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
import CertificateModal from "../../components/CertificateModal";
import { fetchCourses, getCourses, toggleCourseEnrollment, toggleLessonCompleted } from "../../lib/workspaceData";
import { darkColors, lightColors, theme, useThemeMode } from "../../theme";

export default function StudentCoursesScreen({ navigation }) {
  const themeMode = typeof useThemeMode === "function" ? useThemeMode() : null;
  const isDarkMode = themeMode?.isDarkMode ?? true;
  const colors = themeMode?.themeColors || (isDarkMode ? darkColors : lightColors);

  const [courses, setCourses] = useState(getCourses());
  const [loading, setLoading] = useState(true);
  const [selectedLevel, setSelectedLevel] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [certificateCourse, setCertificateCourse] = useState(null);

  const reloadCourses = async () => {
    const data = await fetchCourses();
    if (Array.isArray(data)) {
      setCourses(data);
    }
    setLoading(false);
  };

  React.useEffect(() => {
    reloadCourses();
    const interval = setInterval(reloadCourses, 5000);
    return () => clearInterval(interval);
  }, []);

  const levels = ["All", "Core", "Advanced", "New"];

  const filteredCourses = courses.filter((course) => {
    const matchesLevel = selectedLevel === "All" || course.level === selectedLevel;
    const matchesSearch =
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.summary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesLevel && matchesSearch;
  });

  const handleToggleLesson = (courseId, lessonId) => {
    const updated = toggleLessonCompleted(courseId, lessonId);
    setCourses(getCourses());
    if (selectedCourse?.id === courseId) {
      setSelectedCourse(updated);
    }
  };

  const handleToggleEnroll = (courseId) => {
    const updated = toggleCourseEnrollment(courseId);
    setCourses(getCourses());
    if (selectedCourse?.id === courseId) {
      setSelectedCourse(updated);
    }
  };

  const handleOpenVideo = (videoUrl) => {
    if (videoUrl) {
      Linking.openURL(videoUrl);
    }
  };

  return (
    <View style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>BuildVerse Academy</Text>
          <Text style={[styles.headerSub, { color: colors.muted }]}>
            Masterclass engineering tracks, hands-on lessons, and verified diplomas.
          </Text>
        </View>

        {/* SEARCH BAR */}
        <View style={[styles.searchBox, { backgroundColor: colors.elevated, borderColor: colors.border }]}>
          <Ionicons name="search-outline" size={18} color={colors.muted} />
          <TextInput
            style={[styles.searchInput, { color: colors.foreground }]}
            placeholder="Search masterclasses..."
            placeholderTextColor={colors.subtle}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={18} color={colors.muted} />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* FILTER PILLS */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
          {levels.map((lvl) => {
            const isSelected = selectedLevel === lvl;
            return (
              <TouchableOpacity
                key={lvl}
                activeOpacity={0.8}
                onPress={() => setSelectedLevel(lvl)}
                style={[
                  styles.filterPill,
                  { backgroundColor: colors.elevated, borderColor: colors.border },
                  isSelected && { backgroundColor: colors.amber, borderColor: colors.amber },
                ]}
              >
                <Text
                  style={[
                    styles.filterText,
                    { color: isSelected ? "#000000" : colors.muted },
                    isSelected && { fontWeight: "800" },
                  ]}
                >
                  {lvl}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* COURSES LIST / EMPTY STATE */}
        <View style={styles.coursesList}>
          {filteredCourses.length === 0 ? (
            <GlassCard elevated style={styles.emptyCard}>
              <Ionicons name="book-outline" size={44} color={colors.amber} />
              <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No Courses Available</Text>
              <Text style={[styles.emptySub, { color: colors.muted }]}>
                No engineering courses match your current filter. Check back shortly as mentors publish new curriculum modules.
              </Text>
            </GlassCard>
          ) : (
            filteredCourses.map((course) => {
              const completedCount = course.lessons.filter((l) => l.completed).length;
              const progressPct = Math.round((completedCount / course.lessons.length) * 100);
              const isCompleted = progressPct === 100;

              return (
                <GlassCard key={course.id} style={styles.courseCard} elevated>
                  <View style={styles.cardTopRow}>
                    <View style={[styles.levelTag, { backgroundColor: "rgba(245, 158, 11, 0.15)", borderColor: colors.amber }]}>
                      <Text style={[styles.levelTagText, { color: colors.amber }]}>{course.level.toUpperCase()}</Text>
                    </View>
                    <Text style={[styles.mentorTag, { color: colors.muted }]}>Mentor: {course.mentor}</Text>
                  </View>

                  <Text style={[styles.courseTitle, { color: colors.foreground }]}>{course.title}</Text>
                  <Text style={[styles.courseSummary, { color: colors.muted }]}>{course.summary}</Text>

                  {/* PROGRESS BAR */}
                  {course.isEnrolled && (
                    <View style={styles.progressWrap}>
                      <View style={styles.progressInfoRow}>
                        <Text style={[styles.progressLabel, { color: colors.muted }]}>
                          {completedCount} / {course.lessons.length} Lessons Completed
                        </Text>
                        <Text style={[styles.progressPctText, { color: isCompleted ? colors.success : colors.amber }]}>
                          {progressPct}%
                        </Text>
                      </View>
                      <View style={[styles.progressBarTrack, { backgroundColor: colors.elevated }]}>
                        <View
                          style={[
                            styles.progressBarFill,
                            {
                              width: `${progressPct}%`,
                              backgroundColor: isCompleted ? colors.success : colors.amber,
                            },
                          ]}
                        />
                      </View>
                    </View>
                  )}

                  {/* CARD ACTIONS */}
                  <View style={styles.cardFooter}>
                    <TouchableOpacity
                      style={[
                        styles.enrollBtn,
                        {
                          backgroundColor: course.isEnrolled ? colors.elevated : colors.primary,
                          borderColor: colors.border,
                        },
                      ]}
                      onPress={() => handleToggleEnroll(course.id)}
                    >
                      <Ionicons
                        name={course.isEnrolled ? "checkmark-circle" : "add-circle-outline"}
                        size={15}
                        color={course.isEnrolled ? colors.success : isDarkMode ? "#000" : "#FFF"}
                      />
                      <Text
                        style={[
                          styles.enrollBtnText,
                          { color: course.isEnrolled ? colors.success : isDarkMode ? "#000" : "#FFF" },
                        ]}
                      >
                        {course.isEnrolled ? "Enrolled" : "Enroll"}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.lessonsBtn, { backgroundColor: colors.elevated, borderColor: colors.border }]}
                      onPress={() => setSelectedCourse(course)}
                    >
                      <Ionicons name="list-outline" size={15} color={colors.foreground} />
                      <Text style={[styles.lessonsBtnText, { color: colors.foreground }]}>Curriculum</Text>
                    </TouchableOpacity>

                    {isCompleted && (
                      <TouchableOpacity
                        style={[styles.certBtn, { backgroundColor: colors.amber }]}
                        onPress={() => setCertificateCourse(course)}
                      >
                        <Ionicons name="ribbon" size={15} color="#000" />
                        <Text style={styles.certBtnText}>Diploma</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </GlassCard>
              );
            })
          )}
        </View>
      </ScrollView>

      {/* CURRICULUM MODAL */}
      {selectedCourse && (
        <Modal visible={true} animationType="slide" transparent onRequestClose={() => setSelectedCourse(null)}>
          <View style={styles.modalOverlay}>
            <View style={[styles.curriculumCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.modalHeader}>
                <View style={{ flex: 1, paddingRight: 10 }}>
                  <Text style={[styles.curriculumTitle, { color: colors.foreground }]}>{selectedCourse.title}</Text>
                  <Text style={[styles.curriculumSub, { color: colors.muted }]}>
                    Tap a lesson to mark complete or watch the lecture.
                  </Text>
                </View>
                <TouchableOpacity onPress={() => setSelectedCourse(null)} style={styles.modalCloseBtn}>
                  <Ionicons name="close" size={24} color={colors.foreground} />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.lessonsScroll}>
                {selectedCourse.lessons.map((lesson, idx) => (
                  <View
                    key={lesson.id}
                    style={[
                      styles.lessonRow,
                      { backgroundColor: colors.elevated, borderColor: colors.border },
                      lesson.completed && { borderColor: "rgba(16, 185, 129, 0.4)" },
                    ]}
                  >
                    <TouchableOpacity
                      style={styles.checkboxTouch}
                      onPress={() => handleToggleLesson(selectedCourse.id, lesson.id)}
                    >
                      <Ionicons
                        name={lesson.completed ? "checkbox" : "square-outline"}
                        size={22}
                        color={lesson.completed ? colors.success : colors.muted}
                      />
                    </TouchableOpacity>

                    <View style={styles.lessonInfo}>
                      <Text
                        style={[
                          styles.lessonTitle,
                          { color: colors.foreground },
                          lesson.completed && { textDecorationLine: "line-through", color: colors.muted },
                        ]}
                      >
                        {lesson.title}
                      </Text>
                      <View style={styles.lessonMeta}>
                        <Ionicons name="time-outline" size={12} color={colors.subtle} />
                        <Text style={[styles.lessonDuration, { color: colors.subtle }]}>{lesson.duration}</Text>
                      </View>
                    </View>

                    <TouchableOpacity
                      style={[styles.playBtn, { backgroundColor: "rgba(245, 158, 11, 0.15)" }]}
                      onPress={() => handleOpenVideo(lesson.videoUrl)}
                    >
                      <Ionicons name="play" size={14} color={colors.amber} />
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>

              {selectedCourse.lessons.every((l) => l.completed) && (
                <TouchableOpacity
                  style={[styles.claimCertBtn, { backgroundColor: colors.amber }]}
                  onPress={() => {
                    setCertificateCourse(selectedCourse);
                    setSelectedCourse(null);
                  }}
                >
                  <Ionicons name="ribbon" size={18} color="#000" />
                  <Text style={styles.claimCertText}>View Official Diploma 🎓</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </Modal>
      )}

      {/* DIPLOMA / CERTIFICATE MODAL */}
      <CertificateModal
        visible={!!certificateCourse}
        course={certificateCourse}
        studentName="Alex Chen"
        onClose={() => setCertificateCourse(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContainer: {
    padding: 18,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "900",
    letterSpacing: -0.5,
  },
  headerSub: {
    fontSize: 13,
    marginTop: 4,
    lineHeight: 18,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 9999,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 14,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    marginLeft: 8,
  },
  filterRow: {
    flexDirection: "row",
    marginBottom: 18,
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 9999,
    borderWidth: 1,
    marginRight: 8,
  },
  filterText: {
    fontSize: 12,
  },
  coursesList: {
    gap: 16,
  },
  courseCard: {
    padding: 18,
  },
  cardTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  levelTag: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  levelTagText: {
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  mentorTag: {
    fontSize: 12,
    fontWeight: "600",
  },
  courseTitle: {
    fontSize: 17,
    fontWeight: "800",
    letterSpacing: -0.3,
    marginBottom: 6,
  },
  courseSummary: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 14,
  },
  progressWrap: {
    marginBottom: 14,
  },
  progressInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  progressLabel: {
    fontSize: 12,
    fontWeight: "600",
  },
  progressPctText: {
    fontSize: 12,
    fontWeight: "800",
  },
  progressBarTrack: {
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 3,
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(150, 150, 150, 0.15)",
    paddingTop: 12,
    flexWrap: "wrap",
  },
  enrollBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 9999,
    borderWidth: 1,
    gap: 5,
  },
  enrollBtnText: {
    fontSize: 12,
    fontWeight: "700",
  },
  lessonsBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 9999,
    borderWidth: 1,
    gap: 5,
  },
  lessonsBtnText: {
    fontSize: 12,
    fontWeight: "700",
  },
  certBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 9999,
    gap: 5,
  },
  certBtnText: {
    fontSize: 12,
    fontWeight: "900",
    color: "#000",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "flex-end",
  },
  curriculumCard: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderBottomWidth: 0,
    maxHeight: "85%",
    padding: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  curriculumTitle: {
    fontSize: 18,
    fontWeight: "800",
  },
  curriculumSub: {
    fontSize: 12,
    marginTop: 4,
  },
  modalCloseBtn: {
    padding: 4,
  },
  lessonsScroll: {
    marginBottom: 16,
  },
  lessonRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 8,
  },
  checkboxTouch: {
    paddingRight: 10,
  },
  lessonInfo: {
    flex: 1,
  },
  lessonTitle: {
    fontSize: 13,
    fontWeight: "700",
  },
  lessonMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 3,
    gap: 4,
  },
  lessonDuration: {
    fontSize: 11,
  },
  playBtn: {
    padding: 8,
    borderRadius: 9999,
  },
  claimCertBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 9999,
    gap: 8,
  },
  claimCertText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#000",
  },
  emptyCard: {
    padding: 32,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "rgba(245, 158, 11, 0.3)",
    marginVertical: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "900",
    marginTop: 12,
    textAlign: "center",
  },
  emptySub: {
    fontSize: 12,
    lineHeight: 18,
    marginTop: 6,
    textAlign: "center",
    maxWidth: 280,
  },
});

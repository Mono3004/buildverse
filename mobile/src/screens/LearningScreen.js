import React, { useState } from "react";
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
import { theme } from "../theme";

const INITIAL_LECTURES = [
  {
    id: "l1",
    title: "1. Token Architecture & Color Scaling",
    duration: "12:40",
    watchProgress: 60, // 60% watched -> Unlocks Lecture 2!
    completed: true,
    locked: false,
    notes: "Design tokens are the atomic building blocks of a design system...",
  },
  {
    id: "l2",
    title: "2. Component Spec API & Variant Design",
    duration: "15:20",
    watchProgress: 55, // 55% watched -> Unlocks Lecture 3!
    completed: true,
    locked: false,
    notes: "Define explicit prop signatures for cards, buttons, and inputs...",
  },
  {
    id: "l3",
    title: "3. Dark Mode Elevation & Shadow Tokens",
    duration: "18:10",
    watchProgress: 50, // 50% watched -> Unlocks Lecture 4!
    completed: true,
    locked: false,
    notes: "In dark mode, depth is represented using surface brightness rather than drop shadows...",
  },
  {
    id: "l4",
    title: "4. Syncing Design Tokens to React Native",
    duration: "14:30",
    watchProgress: 0,
    completed: false,
    locked: false, // Unlocked because Lecture 3 is >= 50%!
    notes: "Use automated script pipelines to publish JSON design tokens directly to npm...",
  },
];

export default function LearningScreen({ navigation, route }) {
  const moduleTitle = route?.params?.title || "Design Systems & Production Architecture";
  const [lectures, setLectures] = useState(INITIAL_LECTURES);
  const [activeLecture, setActiveLecture] = useState(INITIAL_LECTURES[0]);
  const [activeTab, setActiveTab] = useState("lectures"); // lectures | notes
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Modals state
  const [showCelebration, setShowCelebration] = useState(false);
  const [showCertModal, setShowCertModal] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Calculate course completion percentage
  const completedLectures = lectures.filter((l) => l.watchProgress >= 50).length;
  const progressPercent = Math.round((completedLectures / lectures.length) * 100);

  // Lecture Select Handler with 50% Watch Gate Validation
  const handleSelectLecture = (lecture, index) => {
    if (index > 0) {
      const prevLecture = lectures[index - 1];
      if (prevLecture.watchProgress < 50) {
        alert(`🔒 Lecture Locked!\n\nYou must complete at least 50% of "${prevLecture.title}" to unlock this lecture.`);
        return;
      }
    }
    setActiveLecture(lecture);
  };

  // Complete Active Lecture
  const handleCompleteActiveLecture = () => {
    setLectures((prev) => {
      const updated = prev.map((l) =>
        l.id === activeLecture.id ? { ...l, watchProgress: 100, completed: true } : l
      );
      // Check if all lectures completed
      const allDone = updated.every((l) => l.watchProgress >= 50);
      if (allDone) {
        setTimeout(() => setShowCelebration(true), 300);
      }
      return updated;
    });
  };

  const handleDownloadPdf = () => {
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 4000);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={theme.colors.foreground} />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.headerSubtitle}>BuildVerse Classroom Player</Text>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {moduleTitle}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => setShowCertModal(true)}
          style={[styles.certBadgeBtn, progressPercent >= 80 && styles.certBadgeBtnActive]}
        >
          <Ionicons
            name="ribbon"
            size={16}
            color={progressPercent >= 80 ? "#000" : theme.colors.primary}
          />
          <Text
            style={[styles.certBadgeText, progressPercent >= 80 && styles.certBadgeTextActive]}
          >
            {progressPercent >= 80 ? "Claim Cert" : `${progressPercent}%`}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* VIDEO PLAYER CONTAINER WITH FULLSCREEN TOGGLE */}
        <GlassCard elevated style={styles.videoPlayerCard}>
          <View style={styles.videoCanvas}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setIsFullscreen(true)}
              style={styles.fullscreenBtn}
            >
              <Ionicons name="expand-outline" size={20} color="#ffffff" />
            </TouchableOpacity>

            <Ionicons
              name={isPlaying ? "pause-circle" : "play-circle"}
              size={64}
              color={theme.colors.primary}
            />
            <Text style={styles.videoCanvasTitle}>{activeLecture.title}</Text>

            <View style={styles.videoControlsRow}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setIsPlaying(!isPlaying)}
                style={styles.playToggleBtn}
              >
                <Text style={styles.playToggleText}>
                  {isPlaying ? "PAUSE LECTURE" : "PLAY LECTURE"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleCompleteActiveLecture}
                style={styles.completeBtn}
              >
                <Ionicons name="checkmark-done" size={16} color="#000" />
                <Text style={styles.completeBtnText}>Mark 100% Watched</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* PLAYER CONTROLS SCRUBBER */}
          <View style={styles.playerControlsRow}>
            <Text style={styles.timeText}>06:20</Text>
            <View style={styles.scrubberTrack}>
              <View
                style={[
                  styles.scrubberFill,
                  { width: `${activeLecture.watchProgress}%` },
                ]}
              />
            </View>
            <Text style={styles.timeText}>{activeLecture.duration}</Text>
          </View>
        </GlassCard>

        {/* PROGRESS BAR & 50% UNLOCK NOTICE */}
        <GlassCard style={styles.progressCard}>
          <View style={styles.progressHeaderRow}>
            <Text style={styles.progressTitle}>Course Completion</Text>
            <Text style={styles.progressPercentText}>{progressPercent}% Complete</Text>
          </View>
          <View style={styles.progressBarTrack}>
            <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
          </View>
          {progressPercent >= 80 ? (
            <TouchableOpacity
              onPress={() => setShowCertModal(true)}
              style={styles.claimCertBanner}
            >
              <Ionicons name="sparkles" size={16} color={theme.colors.primary} />
              <Text style={styles.claimCertText}>
                Congratulations! Claim your Verified QR Certificate
              </Text>
            </TouchableOpacity>
          ) : (
            <Text style={styles.progressHint}>
              💡 Watch at least 50% of each lecture to unlock the next lecture.
            </Text>
          )}
        </GlassCard>

        {/* TAB NAVIGATION: LECTURES vs NOTES */}
        <View style={styles.tabRow}>
          <TouchableOpacity
            onPress={() => setActiveTab("lectures")}
            style={[styles.tabBtn, activeTab === "lectures" && styles.tabBtnActive]}
          >
            <Text
              style={[styles.tabText, activeTab === "lectures" && styles.tabTextActive]}
            >
              Lectures ({lectures.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab("notes")}
            style={[styles.tabBtn, activeTab === "notes" && styles.tabBtnActive]}
          >
            <Text style={[styles.tabText, activeTab === "notes" && styles.tabTextActive]}>
              Lecture Notes
            </Text>
          </TouchableOpacity>
        </View>

        {/* LECTURES LIST WITH 50% LOCK GATES */}
        {activeTab === "lectures" ? (
          <View style={styles.lecturesList}>
            {lectures.map((lecture, idx) => {
              const isActive = activeLecture.id === lecture.id;
              const isLocked = idx > 0 && lectures[idx - 1].watchProgress < 50;

              return (
                <TouchableOpacity
                  key={lecture.id}
                  activeOpacity={isLocked ? 1 : 0.8}
                  onPress={() => handleSelectLecture(lecture, idx)}
                >
                  <GlassCard
                    elevated={isActive}
                    style={[
                      styles.lectureCard,
                      isActive && styles.lectureCardActive,
                      isLocked && styles.lectureCardLocked,
                    ]}
                  >
                    <Ionicons
                      name={
                        isLocked
                          ? "lock-closed"
                          : lecture.watchProgress >= 50
                          ? "checkmark-circle"
                          : "ellipse-outline"
                      }
                      size={22}
                      color={
                        isLocked
                          ? theme.colors.muted
                          : lecture.watchProgress >= 50
                          ? theme.colors.primary
                          : theme.colors.muted
                      }
                    />
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text
                        style={[
                          styles.lectureTitle,
                          isActive && styles.lectureTitleActive,
                          isLocked && styles.lectureTitleLocked,
                        ]}
                      >
                        {lecture.title}
                      </Text>
                      <Text style={styles.lectureDuration}>
                        {isLocked ? "🔒 Requires 50% completion of previous video" : `${lecture.duration} • ${lecture.watchProgress}% watched`}
                      </Text>
                    </View>
                    {isActive && (
                      <View style={styles.nowPlayingPill}>
                        <Text style={styles.nowPlayingText}>PLAYING</Text>
                      </View>
                    )}
                  </GlassCard>
                </TouchableOpacity>
              );
            })}
          </View>
        ) : (
          /* NOTES TAB */
          <GlassCard elevated style={styles.notesCard}>
            <Text style={styles.notesTitle}>{activeLecture.title} — Notes</Text>
            <Text style={styles.notesBody}>{activeLecture.notes}</Text>
            <View style={styles.codeSnippetBox}>
              <Text style={styles.codeSnippetText}>
                {`// Production Design Spec\nexport const tokens = {\n  colors: { primary: "#10b981", bg: "#09090b" }\n};`}
              </Text>
            </View>
          </GlassCard>
        )}
      </ScrollView>

      {/* FULLSCREEN VIDEO PLAYER MODAL */}
      <Modal visible={isFullscreen} transparent animationType="fade">
        <View style={styles.fullscreenModalContainer}>
          <TouchableOpacity
            onPress={() => setIsFullscreen(false)}
            style={styles.fullscreenCloseBtn}
          >
            <Ionicons name="close" size={26} color="#ffffff" />
            <Text style={styles.fullscreenCloseText}>Exit Fullscreen</Text>
          </TouchableOpacity>

          <View style={styles.fullscreenCanvas}>
            <Ionicons name="play-circle" size={80} color={theme.colors.primary} />
            <Text style={styles.fullscreenTitle}>{activeLecture.title}</Text>
            <Text style={styles.fullscreenSub}>1080p Fullscreen Playback • {moduleTitle}</Text>
          </View>
        </View>
      </Modal>

      {/* COURSE COMPLETION CELEBRATION MODAL */}
      <Modal visible={showCelebration} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <GlassCard elevated style={styles.celebrationCard}>
            <Text style={styles.partyEmoji}>🎉 🏆 🚀</Text>
            <Text style={styles.celebrationTitle}>Course Completed!</Text>
            <Text style={styles.celebrationBody}>
              You have completed 100% of "{moduleTitle}". Your official scannable QR Certificate is now unlocked!
            </Text>
            <CustomButton
              title="View & Download Certificate"
              variant="primary"
              size="lg"
              style={{ marginTop: 16 }}
              onPress={() => {
                setShowCelebration(false);
                setShowCertModal(true);
              }}
            />
          </GlassCard>
        </View>
      </Modal>

      {/* VERIFIED QR CERTIFICATE MODAL WITH PDF DOWNLOAD */}
      <Modal visible={showCertModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <GlassCard elevated style={styles.certCard}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Ionicons name="ribbon" size={24} color={theme.colors.primary} />
                <Text style={styles.certModalTitle}> Verified Certificate</Text>
              </View>
              <TouchableOpacity onPress={() => setShowCertModal(false)}>
                <Ionicons name="close-circle" size={26} color={theme.colors.muted} />
              </TouchableOpacity>
            </View>

            {downloadSuccess ? (
              <View style={styles.downloadSuccessBox}>
                <Ionicons name="checkmark-circle" size={20} color={theme.colors.primary} />
                <Text style={styles.downloadSuccessText}>
                  📄 Certificate PDF downloaded to your device!
                </Text>
              </View>
            ) : null}

            <View style={styles.certBorderBox}>
              <Text style={styles.certHeaderLogo}>BUILDVERSE ACADEMY</Text>
              <Text style={styles.certSubText}>Certificate of Craft Completion</Text>
              <Text style={styles.studentName}>BuildVerse Engineer</Text>
              <Text style={styles.certCourseName}>{moduleTitle}</Text>
              <Text style={styles.certId}>ID: CERT-BUILDVERSE-982415 • Issued Aug 2026</Text>

              {/* SCANNABLE QR CODE SIMULATION */}
              <View style={styles.qrContainer}>
                <View style={styles.qrBox}>
                  <Ionicons name="qr-code-sharp" size={90} color="#000000" />
                </View>
                <Text style={styles.qrScanText}>
                  Scan QR code to verify certificate authenticity on BuildVerse Server
                </Text>
              </View>
            </View>

            <CustomButton
              title="Download Certificate PDF"
              variant="primary"
              size="lg"
              style={{ marginTop: 16 }}
              icon={<Ionicons name="download" size={18} color="#000" />}
              onPress={handleDownloadPdf}
            />
          </GlassCard>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: theme.spacing(2.5),
    paddingVertical: theme.spacing(1.5),
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.card,
    alignItems: "center",
    justifyContent: "center",
  },
  headerSubtitle: { fontSize: 11, color: theme.colors.muted },
  headerTitle: { fontSize: 16, fontWeight: "700", color: theme.colors.foreground },
  certBadgeBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.radius.pill,
    backgroundColor: "rgba(16, 185, 129, 0.15)",
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  certBadgeBtnActive: { backgroundColor: theme.colors.primary },
  certBadgeText: { fontSize: 12, fontWeight: "700", color: theme.colors.primary, marginLeft: 4 },
  certBadgeTextActive: { color: "#000" },
  container: { padding: theme.spacing(2.5), paddingBottom: theme.spacing(6) },
  videoPlayerCard: { padding: theme.spacing(2), marginBottom: theme.spacing(2) },
  videoCanvas: {
    position: "relative",
    height: 190,
    backgroundColor: "#000000",
    borderRadius: theme.radius.md,
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing(2),
  },
  fullscreenBtn: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    padding: 6,
    borderRadius: 6,
  },
  videoCanvasTitle: { fontSize: 14, fontWeight: "700", color: "#ffffff", marginTop: 8, textAlign: "center" },
  videoControlsRow: { flexDirection: "row", marginTop: 12 },
  playToggleBtn: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: theme.radius.pill,
    marginRight: 8,
  },
  playToggleText: { fontSize: 11, fontWeight: "800", color: "#000" },
  completeBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.radius.pill,
  },
  completeBtnText: { fontSize: 11, fontWeight: "700", color: "#000", marginLeft: 4 },
  playerControlsRow: { flexDirection: "row", alignItems: "center", marginTop: 12 },
  timeText: { fontSize: 11, color: theme.colors.muted, marginHorizontal: 8 },
  scrubberTrack: { flex: 1, height: 4, backgroundColor: theme.colors.elevated, borderRadius: 2 },
  scrubberFill: { height: "100%", backgroundColor: theme.colors.primary, borderRadius: 2 },
  progressCard: { padding: theme.spacing(2), marginBottom: theme.spacing(2.5) },
  progressHeaderRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  progressTitle: { fontSize: 13, fontWeight: "700", color: theme.colors.foreground },
  progressPercentText: { fontSize: 13, fontWeight: "700", color: theme.colors.primary },
  progressBarTrack: { height: 8, backgroundColor: theme.colors.elevated, borderRadius: 4, overflow: "hidden" },
  progressBarFill: { height: "100%", backgroundColor: theme.colors.primary, borderRadius: 4 },
  claimCertBanner: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    backgroundColor: "rgba(16, 185, 129, 0.15)",
    padding: 8,
    borderRadius: theme.radius.sm,
  },
  claimCertText: { fontSize: 11, fontWeight: "700", color: theme.colors.primary, marginLeft: 6 },
  progressHint: { fontSize: 11, color: theme.colors.subtle, marginTop: 8 },
  tabRow: { flexDirection: "row", marginBottom: theme.spacing(2) },
  tabBtn: { flex: 1, paddingVertical: 10, alignItems: "center", borderBottomWidth: 2, borderBottomColor: "transparent" },
  tabBtnActive: { borderBottomColor: theme.colors.primary },
  tabText: { fontSize: 13, fontWeight: "600", color: theme.colors.muted },
  tabTextActive: { color: theme.colors.primary },
  lecturesList: {},
  lectureCard: { flexDirection: "row", alignItems: "center", padding: theme.spacing(1.8), marginBottom: 10 },
  lectureCardActive: { borderColor: theme.colors.primary, borderWidth: 1 },
  lectureCardLocked: { opacity: 0.5 },
  lectureTitle: { fontSize: 14, fontWeight: "600", color: theme.colors.foreground },
  lectureTitleActive: { color: theme.colors.primary },
  lectureTitleLocked: { color: theme.colors.muted },
  lectureDuration: { fontSize: 11, color: theme.colors.muted, marginTop: 2 },
  nowPlayingPill: { backgroundColor: "rgba(16, 185, 129, 0.15)", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  nowPlayingText: { fontSize: 9, fontWeight: "800", color: theme.colors.primary },
  notesCard: { padding: theme.spacing(2.5) },
  notesTitle: { fontSize: 16, fontWeight: "700", color: theme.colors.foreground, marginBottom: 8 },
  notesBody: { fontSize: 13, color: theme.colors.muted, lineHeight: 20, marginBottom: 12 },
  codeSnippetBox: { backgroundColor: "#000", padding: 12, borderRadius: 8 },
  codeSnippetText: { fontSize: 12, color: theme.colors.primary, fontFamily: "monospace" },
  fullscreenModalContainer: { flex: 1, backgroundColor: "#000000", justifyContent: "center", alignItems: "center" },
  fullscreenCloseBtn: { position: "absolute", top: 40, left: 20, flexDirection: "row", alignItems: "center", zIndex: 10 },
  fullscreenCloseText: { color: "#ffffff", marginLeft: 6, fontWeight: "600" },
  fullscreenCanvas: { alignItems: "center" },
  fullscreenTitle: { fontSize: 20, fontWeight: "800", color: "#ffffff", marginTop: 12 },
  fullscreenSub: { fontSize: 13, color: theme.colors.muted, marginTop: 4 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0, 0, 0, 0.8)", justifyContent: "center", alignItems: "center", padding: 20 },
  celebrationCard: { width: "100%", padding: 24, alignItems: "center" },
  partyEmoji: { fontSize: 40, marginBottom: 12 },
  celebrationTitle: { fontSize: 22, fontWeight: "800", color: theme.colors.foreground, marginBottom: 8 },
  celebrationBody: { fontSize: 13, color: theme.colors.muted, textAlign: "center", lineHeight: 20 },
  certCard: { width: "100%", padding: 20 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  certModalTitle: { fontSize: 18, fontWeight: "700", color: theme.colors.foreground },
  downloadSuccessBox: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(16, 185, 129, 0.15)", padding: 10, borderRadius: 8, marginBottom: 12 },
  downloadSuccessText: { fontSize: 12, fontWeight: "700", color: theme.colors.primary, marginLeft: 8 },
  certBorderBox: { alignItems: "center", padding: 16, borderWidth: 2, borderColor: theme.colors.primary, borderRadius: 12, backgroundColor: theme.colors.elevated },
  certHeaderLogo: { fontSize: 12, fontWeight: "900", color: theme.colors.primary, letterSpacing: 2 },
  certSubText: { fontSize: 11, color: theme.colors.muted, marginTop: 2, marginBottom: 12 },
  studentName: { fontSize: 22, fontWeight: "800", color: theme.colors.foreground, marginBottom: 4 },
  certCourseName: { fontSize: 13, fontWeight: "600", color: theme.colors.indigo, marginBottom: 12 },
  certId: { fontSize: 10, color: theme.colors.subtle, marginBottom: 16 },
  qrContainer: { alignItems: "center" },
  qrBox: { padding: 8, backgroundColor: "#ffffff", borderRadius: 12, marginBottom: 8 },
  qrScanText: { fontSize: 10, color: theme.colors.muted, textAlign: "center" },
});

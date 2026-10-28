import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import GlassCard from "../../components/GlassCard";
import { approveReview, getReviews } from "../../lib/workspaceData";
import { darkColors, lightColors, theme, useThemeMode } from "../../theme";

export default function MentorOverviewScreen({ navigation }) {
  const themeMode = typeof useThemeMode === "function" ? useThemeMode() : null;
  const isDarkMode = themeMode?.isDarkMode ?? true;
  const colors = themeMode?.themeColors || (isDarkMode ? darkColors : lightColors);

  const [reviews, setReviews] = useState(() => {
    try {
      const data = typeof getReviews === "function" ? getReviews() : [];
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  });

  const handleApprove = (reviewId) => {
    try {
      let updated;
      if (typeof approveReview === "function") {
        updated = approveReview(reviewId);
      }
      if (Array.isArray(updated)) {
        setReviews(updated);
      } else {
        setReviews((prev) =>
          (Array.isArray(prev) ? prev : []).map((r) =>
            r && r.id === reviewId ? { ...r, status: "Approved" } : r
          )
        );
      }
    } catch (_e) {}
    Alert.alert("Pull Request Approved", "The code review has been marked as Approved and merged to main!", [
      { text: "Done" },
    ]);
  };

  const safeReviews = Array.isArray(reviews) ? reviews : [];
  const pendingCount = safeReviews.filter((r) => r && r.status === "Pending").length;

  return (
    <View style={[styles.safeArea, { backgroundColor: "#08090A" }]}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.badgePill}>
            <Text style={styles.badgePillText}>MENTOR TELEMETRY</Text>
          </View>
          <Text style={[styles.headerTitle, { color: "#F8FAFC" }]}>Mentor Command Center</Text>
          <Text style={[styles.headerSub, { color: "#94A3B8" }]}>
            Monitor assigned student mentees, code reviews, and live engineering workshops.
          </Text>
        </View>

        {/* 4 BENTO STAT CARDS */}
        <View style={styles.statsGrid}>
          <GlassCard style={styles.statCard} elevated>
            <View style={styles.statTop}>
              <Text style={[styles.statLabel, { color: "#94A3B8" }]}>ASSIGNED MENTEES</Text>
              <View style={[styles.statIconCircle, { backgroundColor: "rgba(204, 255, 0, 0.1)" }]}>
                <Ionicons name="people" size={15} color="#CCFF00" />
              </View>
            </View>
            <Text style={[styles.statNumber, { color: "#F8FAFC" }]}>12</Text>
            <Text style={[styles.statFoot, { color: "#CCFF00" }]}>3 active projects</Text>
          </GlassCard>

          <GlassCard style={styles.statCard} elevated>
            <View style={styles.statTop}>
              <Text style={[styles.statLabel, { color: "#94A3B8" }]}>PENDING REVIEWS</Text>
              <View style={[styles.statIconCircle, { backgroundColor: "rgba(204, 255, 0, 0.1)" }]}>
                <Ionicons name="git-pull-request" size={15} color="#CCFF00" />
              </View>
            </View>
            <Text style={[styles.statNumber, { color: "#F8FAFC" }]}>{pendingCount}</Text>
            <Text style={[styles.statFoot, { color: "#CCFF00" }]}>Requires attention</Text>
          </GlassCard>

          <GlassCard style={styles.statCard} elevated>
            <View style={styles.statTop}>
              <Text style={[styles.statLabel, { color: "#94A3B8" }]}>LIVE WORKSHOPS</Text>
              <View style={[styles.statIconCircle, { backgroundColor: "rgba(204, 255, 0, 0.1)" }]}>
                <Ionicons name="videocam" size={15} color="#CCFF00" />
              </View>
            </View>
            <Text style={[styles.statNumber, { color: "#F8FAFC" }]}>2</Text>
            <Text style={[styles.statFoot, { color: "#CCFF00" }]}>Scheduled today</Text>
          </GlassCard>

          <GlassCard style={styles.statCard} elevated>
            <View style={styles.statTop}>
              <Text style={[styles.statLabel, { color: "#94A3B8" }]}>MENTOR RATING</Text>
              <View style={[styles.statIconCircle, { backgroundColor: "rgba(204, 255, 0, 0.1)" }]}>
                <Ionicons name="star" size={15} color="#CCFF00" />
              </View>
            </View>
            <Text style={[styles.statNumber, { color: "#F8FAFC" }]}>4.9</Text>
            <Text style={[styles.statFoot, { color: "#64748B" }]}>From 85 reviews</Text>
          </GlassCard>
        </View>

        {/* CODE REVIEW QUEUE SECTION */}
        <View style={styles.sectionWrap}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={[styles.sectionTitle, { color: "#F8FAFC" }]}>Code Review Queue</Text>
              <Text style={[styles.sectionSub, { color: "#94A3B8" }]}>
                {pendingCount} pull requests awaiting your review
              </Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate("MentorMenteesTab")}>
              <Text style={[styles.viewAllText, { color: "#CCFF00" }]}>View Mentees →</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.reviewList}>
            {reviews.map((r) => {
              const isApproved = r.status === "Approved";
              return (
                <GlassCard key={r.id} style={styles.reviewCard} elevated>
                  <View style={styles.reviewCardHeader}>
                    <View>
                      <Text style={[styles.studentName, { color: "#F8FAFC" }]}>{r.student}</Text>
                      <Text style={[styles.projectScope, { color: "#94A3B8" }]}>Project: {r.project}</Text>
                    </View>
                    <View
                      style={[
                        styles.statusPill,
                        {
                          backgroundColor: isApproved ? "rgba(204, 255, 0, 0.12)" : "rgba(255, 255, 255, 0.06)",
                          borderColor: isApproved ? "rgba(204, 255, 0, 0.3)" : "rgba(255, 255, 255, 0.12)",
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusPillText,
                          { color: isApproved ? "#CCFF00" : "#94A3B8" },
                        ]}
                      >
                        {r.status.toUpperCase()}
                      </Text>
                    </View>
                  </View>

                  <View style={[styles.prBox, { backgroundColor: "#141720", borderColor: "rgba(204, 255, 0, 0.2)" }]}>
                    <Ionicons name="git-commit-outline" size={14} color="#CCFF00" />
                    <Text style={[styles.prTitle, { color: "#F8FAFC" }]}>{r.PR}</Text>
                  </View>

                  <View style={styles.reviewFooter}>
                    <Text style={[styles.reviewTime, { color: "#64748B" }]}>Submitted {r.time}</Text>

                    <View style={styles.reviewActionsRow}>
                      <TouchableOpacity
                        activeOpacity={0.8}
                        style={[styles.inspectCodeBtn, { backgroundColor: "#141720", borderColor: "rgba(204, 255, 0, 0.3)" }]}
                        onPress={() => navigation.navigate("MentorReviewsTab")}
                      >
                        <Ionicons name="code-slash" size={12} color="#CCFF00" />
                        <Text style={[styles.inspectCodeBtnText, { color: "#CCFF00" }]}>Files & Code</Text>
                      </TouchableOpacity>

                      {!isApproved ? (
                        <TouchableOpacity
                          activeOpacity={0.8}
                          style={[styles.approveBtn, { backgroundColor: "#CCFF00" }]}
                          onPress={() => handleApprove(r.id)}
                        >
                          <Ionicons name="checkmark-circle-outline" size={13} color="#08090A" />
                          <Text style={styles.approveBtnText}>Approve ✓</Text>
                        </TouchableOpacity>
                      ) : (
                        <View style={styles.approvedBadge}>
                          <Ionicons name="checkmark-done" size={14} color="#CCFF00" />
                          <Text style={[styles.approvedBadgeText, { color: "#CCFF00" }]}>Merged</Text>
                        </View>
                      )}
                    </View>
                  </View>
                </GlassCard>
              );
            })}
          </View>
        </View>

        {/* QUICK ACTIONS BANNER */}
        <GlassCard style={styles.quickActionsCard} elevated>
          <Text style={[styles.quickTitle, { color: "#F8FAFC" }]}>Mentorship Actions</Text>
          <View style={styles.quickButtonsRow}>
            <TouchableOpacity
              activeOpacity={0.8}
              style={[styles.actionButton, { backgroundColor: "#141720", borderColor: "rgba(204, 255, 0, 0.25)" }]}
              onPress={() => navigation.navigate("MentorCoursesTab")}
            >
              <Ionicons name="add-circle" size={16} color="#CCFF00" />
              <Text style={[styles.actionButtonText, { color: "#F8FAFC" }]}>+ Masterclass</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              style={[styles.actionButton, { backgroundColor: "#141720", borderColor: "rgba(255, 255, 255, 0.1)" }]}
              onPress={() => navigation.navigate("ChatTab")}
            >
              <Ionicons name="chatbubbles" size={16} color="#CCFF00" />
              <Text style={[styles.actionButtonText, { color: "#F8FAFC" }]}>Office Hours Chat</Text>
            </TouchableOpacity>
          </View>
        </GlassCard>
      </ScrollView>
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
    marginBottom: 8,
  },
  badgePillText: {
    fontSize: 9,
    fontWeight: "900",
    color: "#CCFF00",
    letterSpacing: 0.8,
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
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 18,
  },
  statCard: {
    width: "48%",
    padding: 12,
    borderRadius: 14,
    backgroundColor: "#0E1015",
    borderWidth: 1,
    borderColor: "rgba(204, 255, 0, 0.15)",
  },
  statTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  statLabel: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  statIconCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "900",
    letterSpacing: -0.5,
  },
  statFoot: {
    fontSize: 10,
    fontWeight: "700",
    marginTop: 4,
  },
  sectionWrap: {
    marginBottom: 18,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
  },
  sectionSub: {
    fontSize: 11,
    marginTop: 1,
  },
  viewAllText: {
    fontSize: 11,
    fontWeight: "800",
  },
  reviewList: {
    gap: 10,
  },
  reviewCard: {
    padding: 14,
    borderRadius: 14,
    backgroundColor: "#0E1015",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  reviewCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  studentName: {
    fontSize: 14,
    fontWeight: "800",
  },
  projectScope: {
    fontSize: 11,
    marginTop: 2,
  },
  statusPill: {
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 6,
    borderWidth: 1,
  },
  statusPillText: {
    fontSize: 9,
    fontWeight: "900",
  },
  prBox: {
    flexDirection: "row",
    alignItems: "center",
    padding: 9,
    borderRadius: 10,
    borderWidth: 1,
    gap: 7,
    marginBottom: 10,
  },
  prTitle: {
    fontSize: 11,
    fontWeight: "700",
    fontFamily: "monospace",
    flex: 1,
  },
  reviewFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.06)",
    paddingTop: 8,
  },
  reviewTime: {
    fontSize: 10,
  },
  reviewActionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  inspectCodeBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    gap: 4,
  },
  inspectCodeBtnText: {
    fontSize: 10,
    fontWeight: "800",
  },
  approveBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 9999,
    gap: 4,
  },
  approveBtnText: {
    fontSize: 11,
    fontWeight: "900",
    color: "#08090A",
  },
  approvedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  approvedBadgeText: {
    fontSize: 11,
    fontWeight: "700",
  },
  quickActionsCard: {
    padding: 14,
    borderRadius: 14,
    backgroundColor: "#0E1015",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  quickTitle: {
    fontSize: 14,
    fontWeight: "800",
    marginBottom: 10,
  },
  quickButtonsRow: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
  },
  actionButtonText: {
    fontSize: 11,
    fontWeight: "700",
  },
});

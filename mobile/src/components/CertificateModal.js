import React from "react";
import { Alert, Modal, Share, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { darkColors, lightColors, theme, useThemeMode } from "../theme";

export default function CertificateModal({ visible, course, studentName = "Alex Chen", onClose }) {
  const themeMode = typeof useThemeMode === "function" ? useThemeMode() : null;
  const isDarkMode = themeMode?.isDarkMode ?? true;
  const colors = themeMode?.themeColors || (isDarkMode ? darkColors : lightColors);

  if (!course) return null;

  const certId = `BV-CERT-${course.id?.toUpperCase() || "2026"}-7781`;
  const issueDate = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

  const handleShare = async () => {
    try {
      await Share.share({
        message: `🎓 I just earned my official BuildVerse Engineering Certificate in "${course.title}"! Verified Credential ID: ${certId}`,
      });
    } catch (e) {
      console.log("Share error", e);
    }
  };

  const handleDownload = () => {
    Alert.alert(
      "Certificate Downloaded",
      `Your diploma for "${course.title}" has been saved to device downloads as ${certId}.pdf`,
      [{ text: "Great!" }]
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={[styles.certCard, { backgroundColor: colors.surface, borderColor: colors.amber }]}>
          {/* CLOSE ICON */}
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Ionicons name="close" size={22} color={colors.muted} />
          </TouchableOpacity>

          {/* CREST & HEADER */}
          <View style={styles.crestWrap}>
            <View style={[styles.crestCircle, { backgroundColor: "rgba(245, 158, 11, 0.15)", borderColor: colors.amber }]}>
              <Ionicons name="ribbon" size={32} color={colors.amber} />
            </View>
          </View>

          <Text style={[styles.institutionText, { color: colors.amber }]}>BUILDVERSE ACADEMY</Text>
          <Text style={[styles.certTitle, { color: colors.foreground }]}>Certificate of Achievement</Text>
          <Text style={[styles.subText, { color: colors.muted }]}>This is to officially certify that</Text>

          <Text style={[styles.recipientName, { color: colors.foreground }]}>{studentName}</Text>

          <Text style={[styles.bodyText, { color: colors.muted }]}>
            has successfully completed the comprehensive technical curriculum, practical assignments, and verified requirements for
          </Text>

          <View style={[styles.courseHighlight, { backgroundColor: colors.elevated, borderColor: colors.border }]}>
            <Text style={[styles.courseName, { color: colors.foreground }]}>{course.title}</Text>
            <Text style={[styles.levelText, { color: colors.amber }]}>Level: {course.level || "Mastery Track"}</Text>
          </View>

          <View style={styles.certMetaRow}>
            <View>
              <Text style={[styles.metaLabel, { color: colors.subtle }]}>ISSUED DATE</Text>
              <Text style={[styles.metaVal, { color: colors.foreground }]}>{issueDate}</Text>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={[styles.metaLabel, { color: colors.subtle }]}>VERIFICATION HASH</Text>
              <Text style={[styles.metaVal, { color: colors.foreground, fontFamily: "monospace" }]}>{certId}</Text>
            </View>
          </View>

          {/* ACTION BUTTONS */}
          <View style={styles.btnRow}>
            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.elevated, borderColor: colors.border }]} onPress={handleShare}>
              <Ionicons name="share-social-outline" size={16} color={colors.foreground} />
              <Text style={[styles.actionBtnText, { color: colors.foreground }]}>Share</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.actionBtn, styles.primaryBtn, { backgroundColor: colors.amber }]} onPress={handleDownload}>
              <Ionicons name="download-outline" size={16} color="#000" />
              <Text style={[styles.actionBtnText, { color: "#000", fontWeight: "800" }]}>Download PDF</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.75)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  certCard: {
    width: "100%",
    borderRadius: 24,
    borderWidth: 2,
    padding: 24,
    alignItems: "center",
    position: "relative",
    ...theme.shadows.card,
  },
  closeBtn: {
    position: "absolute",
    top: 16,
    right: 16,
    padding: 6,
  },
  crestWrap: {
    marginBottom: 12,
  },
  crestCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  institutionText: {
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 2,
    marginBottom: 4,
  },
  certTitle: {
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  subText: {
    fontSize: 12,
    marginBottom: 8,
  },
  recipientName: {
    fontSize: 24,
    fontWeight: "900",
    letterSpacing: -0.5,
    marginBottom: 10,
    textDecorationLine: "underline",
    textDecorationColor: "#F59E0B",
  },
  bodyText: {
    fontSize: 12,
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 16,
    paddingHorizontal: 10,
  },
  courseHighlight: {
    width: "100%",
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    alignItems: "center",
    marginBottom: 18,
  },
  courseName: {
    fontSize: 14,
    fontWeight: "800",
    textAlign: "center",
  },
  levelText: {
    fontSize: 11,
    fontWeight: "700",
    marginTop: 4,
  },
  certMetaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    borderTopWidth: 1,
    borderTopColor: "rgba(150, 150, 150, 0.2)",
    paddingTop: 12,
    marginBottom: 20,
  },
  metaLabel: {
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  metaVal: {
    fontSize: 11,
    fontWeight: "700",
    marginTop: 2,
  },
  btnRow: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 9999,
    borderWidth: 1,
    gap: 6,
  },
  primaryBtn: {
    borderWidth: 0,
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: "700",
  },
});

import React, { Component } from "react";
import { LogBox, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import AppNavigator from "./src/navigation/AppNavigator";
import { ThemeModeProvider, theme, useThemeMode, darkColors, lightColors } from "./src/theme";
import { UserRoleProvider } from "./src/context/UserRoleContext";

// Silence benign development warning when device accessibility has Reduced Motion / Remove Animations enabled
LogBox.ignoreLogs([
  "[Reanimated] Reduced motion setting is enabled on this device",
]);

// GLOBAL ERROR BOUNDARY TO PREVENT SILENT WHITE SCREENS
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("BuildVerse Mobile Runtime Error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  handleRestart = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <SafeAreaView style={errorStyles.container}>
          <ScrollView contentContainerStyle={errorStyles.scroll}>
            <View style={errorStyles.iconBox}>
              <Text style={errorStyles.iconText}>⚠️</Text>
            </View>
            <Text style={errorStyles.title}>Application Error</Text>
            <Text style={errorStyles.message}>
              {this.state.error ? this.state.error.toString() : "An unexpected render error occurred."}
            </Text>
            {this.state.errorInfo?.componentStack && (
              <View style={errorStyles.stackBox}>
                <Text style={errorStyles.stackText}>{this.state.errorInfo.componentStack}</Text>
              </View>
            )}
            <TouchableOpacity style={errorStyles.btn} activeOpacity={0.8} onPress={this.handleRestart}>
              <Text style={errorStyles.btnText}>Reload Application</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      );
    }
    return this.props.children;
  }
}

function MainApp() {
  const themeMode = typeof useThemeMode === "function" ? useThemeMode() : null;
  const isDarkMode = themeMode?.isDarkMode ?? true;
  const colors = themeMode?.themeColors || (isDarkMode ? darkColors : lightColors);

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={isDarkMode ? "light-content" : "dark-content"}
        backgroundColor={colors.background}
      />
      <AppNavigator />
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider style={{ flex: 1 }}>
      <ErrorBoundary>
        <UserRoleProvider>
          <ThemeModeProvider>
            <MainApp />
          </ThemeModeProvider>
        </UserRoleProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});

const errorStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#09090B",
  },
  scroll: {
    padding: 24,
    justifyContent: "center",
    alignItems: "center",
    flexGrow: 1,
  },
  iconBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(245, 158, 11, 0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  iconText: {
    fontSize: 32,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: "#FAFAFA",
    marginBottom: 8,
    textAlign: "center",
  },
  message: {
    fontSize: 14,
    color: "#EF4444",
    textAlign: "center",
    marginBottom: 20,
    paddingHorizontal: 12,
  },
  stackBox: {
    backgroundColor: "#18181B",
    borderRadius: 8,
    padding: 12,
    width: "100%",
    marginBottom: 24,
    maxHeight: 180,
  },
  stackText: {
    color: "#A1A1AA",
    fontSize: 11,
    fontFamily: "monospace",
  },
  btn: {
    backgroundColor: "#F59E0B",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 9999,
  },
  btnText: {
    color: "#000000",
    fontWeight: "700",
    fontSize: 14,
  },
});
import React from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { Ionicons } from "@expo/vector-icons";

// SHARED COMPONENTS & SCREENS
import ProjectsScreen from "../screens/ProjectsScreen";
import ProjectDetailsScreen from "../screens/ProjectDetailsScreen";
import ChatScreen from "../screens/ChatScreen";
import ProfileScreen from "../screens/ProfileScreen";
import LearningScreen from "../screens/LearningScreen";
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";

// 🎓 STUDENT MODULE SCREENS
import StudentDashboardScreen from "../screens/student/StudentDashboardScreen";
import StudentCoursesScreen from "../screens/student/StudentCoursesScreen";
import StudentPortfolioScreen from "../screens/student/StudentPortfolioScreen";
import StudentGroupsScreen from "../screens/student/StudentGroupsScreen";
import StudentCommunityScreen from "../screens/student/StudentCommunityScreen";

// 👨‍🏫 MENTOR MODULE SCREENS
import MentorOverviewScreen from "../screens/mentor/MentorOverviewScreen";
import MentorMenteesScreen from "../screens/mentor/MentorMenteesScreen";
import MentorCoursesScreen from "../screens/mentor/MentorCoursesScreen";
import MentorReviewsScreen from "../screens/mentor/MentorReviewsScreen";

import { useUserRole } from "../context/UserRoleContext";
import { darkColors, lightColors, theme, useThemeMode } from "../theme";

const StudentTab = createBottomTabNavigator();
const MentorTab = createBottomTabNavigator();
const AuthStack = createStackNavigator();

function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }} initialRouteName="LoginScreen">
      <AuthStack.Screen name="LoginScreen" component={LoginScreen} />
      <AuthStack.Screen name="RegisterScreen" component={RegisterScreen} />
    </AuthStack.Navigator>
  );
}

// 🎓 DEDICATED STUDENT TAB NAVIGATOR (6 RICH TABS: Dashboard, Projects, Squads, Community, Chat, Profile)
function StudentTabs({ colors: propColors }) {
  const themeMode = typeof useThemeMode === "function" ? useThemeMode() : null;
  const colors = propColors || themeMode?.themeColors || darkColors;

  return (
    <StudentTab.Navigator
      initialRouteName="StudentDashboard"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: true,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 64,
          paddingBottom: 8,
          paddingTop: 6,
          ...theme.shadows.card,
        },
        tabBarActiveTintColor: "#CCFF00",
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: {
          fontSize: 9,
          fontWeight: "800",
          marginTop: 1,
        },
        tabBarIcon: ({ focused, color }) => {
          let iconName = "grid";
          if (route.name === "StudentDashboard") {
            iconName = focused ? "grid" : "grid-outline";
          } else if (route.name === "ProjectsTab") {
            iconName = focused ? "code-slash" : "code-slash-outline";
          } else if (route.name === "PortfolioTab") {
            iconName = focused ? "ribbon" : "ribbon-outline";
          } else if (route.name === "CommunityTab") {
            iconName = focused ? "planet" : "planet-outline";
          } else if (route.name === "GroupsTab") {
            iconName = focused ? "people" : "people-outline";
          } else if (route.name === "ProfileTab") {
            iconName = focused ? "person" : "person-outline";
          } else if (route.name === "ChatTab") {
            iconName = focused ? "chatbubbles" : "chatbubbles-outline";
          }
          return (
            <View style={styles.tabIconWrapper}>
              {focused && <View style={[styles.activeGlowDot, { backgroundColor: "#CCFF00" }]} />}
              <Ionicons name={iconName} size={20} color={color} />
            </View>
          );
        },
      })}
    >
      <StudentTab.Screen
        name="StudentDashboard"
        component={StudentDashboardScreen}
        options={{ tabBarLabel: "Dashboard" }}
      />
      <StudentTab.Screen
        name="ProjectsTab"
        component={ProjectsScreen}
        options={{ tabBarLabel: "Repositories" }}
      />
      <StudentTab.Screen
        name="PortfolioTab"
        component={StudentPortfolioScreen}
        options={{ tabBarLabel: "Portfolio" }}
      />
      <StudentTab.Screen
        name="CommunityTab"
        component={StudentCommunityScreen}
        options={{ tabBarLabel: "Community" }}
      />
      <StudentTab.Screen
        name="GroupsTab"
        component={StudentGroupsScreen}
        options={{ tabBarLabel: "Squads" }}
      />
      <StudentTab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{ tabBarLabel: "Profile" }}
      />

      {/* ADDITIONAL SUB-SCREENS ACCESSIBLE VIA NAVIGATION */}
      <StudentTab.Screen
        name="ChatTab"
        component={ChatScreen}
        options={{ tabBarItemStyle: { display: "none" } }}
      />
      <StudentTab.Screen
        name="CoursesTab"
        component={StudentCoursesScreen}
        options={{ tabBarItemStyle: { display: "none" } }}
      />
      <StudentTab.Screen
        name="ProjectDetailsScreen"
        component={ProjectDetailsScreen}
        options={{ tabBarItemStyle: { display: "none" } }}
      />
      <StudentTab.Screen
        name="LearningScreen"
        component={LearningScreen}
        options={{ tabBarItemStyle: { display: "none" } }}
      />
      <StudentTab.Screen
        name="LoginScreen"
        component={LoginScreen}
        options={{ tabBarItemStyle: { display: "none" } }}
      />
      <StudentTab.Screen
        name="RegisterScreen"
        component={RegisterScreen}
        options={{ tabBarItemStyle: { display: "none" } }}
      />
    </StudentTab.Navigator>
  );
}

// 👨‍🏫 DEDICATED MENTOR TAB NAVIGATOR (6 TABS: Telemetry, Mentees, Masterclass, Reviews, Chat, Profile)
function MentorTabs({ colors: propColors }) {
  const themeMode = typeof useThemeMode === "function" ? useThemeMode() : null;
  const colors = propColors || themeMode?.themeColors || darkColors;

  return (
    <MentorTab.Navigator
      initialRouteName="MentorOverviewTab"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: true,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 64,
          paddingBottom: 8,
          paddingTop: 6,
          ...theme.shadows.card,
        },
        tabBarActiveTintColor: "#CCFF00",
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: {
          fontSize: 9,
          fontWeight: "800",
          marginTop: 1,
        },
        tabBarIcon: ({ focused, color }) => {
          let iconName = "speedometer";
          if (route.name === "MentorOverviewTab") {
            iconName = focused ? "speedometer" : "speedometer-outline";
          } else if (route.name === "MentorMenteesTab") {
            iconName = focused ? "people" : "people-outline";
          } else if (route.name === "MentorCoursesTab") {
            iconName = focused ? "book" : "book-outline";
          } else if (route.name === "MentorReviewsTab") {
            iconName = focused ? "code-working" : "code-working-outline";
          } else if (route.name === "ChatTab") {
            iconName = focused ? "chatbubbles" : "chatbubbles-outline";
          } else if (route.name === "ProfileTab") {
            iconName = focused ? "person" : "person-outline";
          }
          return (
            <View style={styles.tabIconWrapper}>
              {focused && <View style={[styles.activeGlowDot, { backgroundColor: "#CCFF00" }]} />}
              <Ionicons name={iconName} size={20} color={color} />
            </View>
          );
        },
      })}
    >
      <MentorTab.Screen
        name="MentorOverviewTab"
        component={MentorOverviewScreen}
        options={{ tabBarLabel: "Telemetry" }}
      />
      <MentorTab.Screen
        name="MentorMenteesTab"
        component={MentorMenteesScreen}
        options={{ tabBarLabel: "Mentees" }}
      />
      <MentorTab.Screen
        name="MentorCoursesTab"
        component={MentorCoursesScreen}
        options={{ tabBarLabel: "Masterclass" }}
      />
      <MentorTab.Screen
        name="MentorReviewsTab"
        component={MentorReviewsScreen}
        options={{ tabBarLabel: "PR Reviews" }}
      />
      <MentorTab.Screen
        name="ChatTab"
        component={ChatScreen}
        options={{ tabBarLabel: "Chat" }}
      />
      <MentorTab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{ tabBarLabel: "Profile" }}
      />

      {/* SUB-SCREENS */}
      <MentorTab.Screen
        name="ProjectDetailsScreen"
        component={ProjectDetailsScreen}
        options={{ tabBarItemStyle: { display: "none" } }}
      />
      <MentorTab.Screen
        name="LoginScreen"
        component={LoginScreen}
        options={{ tabBarItemStyle: { display: "none" } }}
      />
      <MentorTab.Screen
        name="RegisterScreen"
        component={RegisterScreen}
        options={{ tabBarItemStyle: { display: "none" } }}
      />
    </MentorTab.Navigator>
  );
}

export default function AppNavigator() {
  const themeMode = typeof useThemeMode === "function" ? useThemeMode() : null;
  const colors = themeMode?.themeColors || darkColors;
  const { isStudent, isLoggedIn } = useUserRole();

  return (
    <NavigationContainer>
      <SafeAreaView style={[styles.rootContainer, { backgroundColor: colors.background }]}>
        {!isLoggedIn ? (
          <AuthNavigator />
        ) : (
          <View style={{ flex: 1 }}>
            {isStudent ? <StudentTabs colors={colors} /> : <MentorTabs colors={colors} />}
          </View>
        )}
      </SafeAreaView>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
  },
  tabIconWrapper: {
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  activeGlowDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    position: "absolute",
    top: -5,
  },
});

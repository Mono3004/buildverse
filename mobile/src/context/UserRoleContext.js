import React, { createContext, useContext, useState } from "react";

export const UserRoleContext = createContext({
  role: "student", // "student" | "mentor"
  switchRole: () => {},
  isStudent: true,
  isMentor: false,
  userProfile: null,
  isLoggedIn: true,
  login: () => {},
  logout: () => {},
});

export function UserRoleProvider({ children }) {
  const [role, setRole] = useState("student");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [customProfile, setCustomProfile] = useState(null);

  const switchRole = (newRole) => {
    if (newRole === "student" || newRole === "mentor") {
      setRole(newRole);
    } else {
      setRole((prev) => (prev === "student" ? "mentor" : "student"));
    }
  };

  const login = (chosenRole = "student", profileData = null) => {
    setRole(chosenRole);
    if (profileData) {
      setCustomProfile(profileData);
    }
    setIsLoggedIn(true);
  };

  const logout = () => {
    setIsLoggedIn(false);
  };

  const defaultStudent = {
    id: "u_student_1",
    name: "Alex Chen",
    email: "alex@buildverse.io",
    roleTitle: "Student Software Engineer",
    track: "Full Stack Systems",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300",
    completedCredits: 24,
    gpa: "3.9 / 4.0",
  };

  const defaultMentor = {
    id: "u_mentor_1",
    name: "Elias Thorne",
    email: "elias.thorne@buildverse.io",
    roleTitle: "Principal Architect & Lead Mentor",
    track: "Distributed Systems & Cloud Architecture",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300",
    rating: "4.9 / 5.0",
    activeMenteesCount: 12,
  };

  const baseProfile = role === "mentor" ? defaultMentor : defaultStudent;
  const userProfile = customProfile ? { ...baseProfile, ...customProfile } : baseProfile;

  return (
    <UserRoleContext.Provider
      value={{
        role,
        switchRole,
        isStudent: role === "student",
        isMentor: role === "mentor",
        userProfile,
        isLoggedIn,
        login,
        logout,
      }}
    >
      {children}
    </UserRoleContext.Provider>
  );
}

export function useUserRole() {
  return useContext(UserRoleContext);
}

import React from "react";
import { createFileRoute } from "@tanstack/react-router";
import UserProfile from "@/components/user/UserProfile";
import { AppShell } from "@/components/app/AppShell";
import { useSessionUser } from "@/lib/session";

export const Route = createFileRoute("/_authenticated/profile")({
  component: ProfilePage,
});

function ProfilePage() {
  const { profile } = useSessionUser();

  const userObj = profile
    ? {
        name: profile.display_name,
        username: `@${profile.display_name.toLowerCase().replace(/\s+/g, "")}`,
        email: profile.email || "alex@buildverse.io",
        role: "Student Engineer",
        bio: "Full-stack web & mobile developer building scalable microservices with React Native, Node.js, and MongoDB.",
        location: "San Francisco, CA",
        website: "https://buildverse.io",
        joined: "November 2026",
        avatar: profile.avatar_url || "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300",
        skills: ["React Native", "Node.js", "MongoDB", "Express", "Tailwind CSS", "WebSockets"],
      }
    : null;

  return (
    <AppShell profile={profile || { id: "demo", display_name: "Alex Chen", color: "#F59E0B" }}>
      <UserProfile initialUser={userObj} />
    </AppShell>
  );
}

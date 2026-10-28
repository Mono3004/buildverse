import React, { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import {
  User,
  Mail,
  Shield,
  FolderGit2,
  CheckCircle2,
  Award,
  Edit3,
  Share2,
  Code2,
  Sparkles,
  Save,
  Check,
  Calendar,
  MapPin,
  Globe,
  Github,
  Twitter,
  Plus,
  X,
  Camera,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const PROFILE_STORAGE_KEY = "buildverse_user_profile";

export default function UserProfile({ initialUser }) {
  // Load saved profile from localStorage if exists
  const getInitialState = () => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(PROFILE_STORAGE_KEY);
        if (stored) return JSON.parse(stored);
        const nexusUser = localStorage.getItem("nexus_user");
        if (nexusUser) {
          const parsed = JSON.parse(nexusUser);
          return {
            name: parsed.display_name || parsed.name || "Alex Chen",
            username: `@${(parsed.display_name || "alexchen").toLowerCase().replace(/\s+/g, "")}`,
            email: parsed.email || "alex@buildverse.io",
            role: parsed.role || "Senior Full-Stack Engineer",
            bio: parsed.bio || "Full-stack web & mobile developer building scalable microservices with React Native, Node.js, and MongoDB.",
            location: parsed.location || "San Francisco, CA",
            website: parsed.website || "https://buildverse.io",
            joined: "November 2026",
            avatar: parsed.avatar_url || "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300",
            skills: ["React Native", "Node.js", "MongoDB", "Express", "Tailwind CSS", "WebSockets", "TypeScript"],
          };
        }
      } catch {
        /* fallback */
      }
    }
    return (
      initialUser || {
        name: "Alex Chen",
        username: "@alexchen",
        email: "alex@buildverse.io",
        role: "Senior Full-Stack Engineer",
        bio: "Full-stack web & mobile developer building scalable microservices with React Native, Node.js, and MongoDB.",
        location: "San Francisco, CA",
        website: "https://buildverse.io",
        joined: "November 2026",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300",
        skills: ["React Native", "Node.js", "MongoDB", "Express", "Tailwind CSS", "WebSockets", "TypeScript"],
      }
    );
  };

  const [user, setUser] = useState(getInitialState);
  const [activeTab, setActiveTab] = useState("overview");
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);

  // EDITABLE FORM FIELDS
  const [name, setName] = useState(user.name);
  const [username, setUsername] = useState(user.username);
  const [email, setEmail] = useState(user.email);
  const [role, setRole] = useState(user.role);
  const [bio, setBio] = useState(user.bio);
  const [location, setLocation] = useState(user.location);
  const [website, setWebsite] = useState(user.website);
  const [avatar, setAvatar] = useState(user.avatar);
  const [skills, setSkills] = useState(user.skills || []);
  const [newSkill, setNewSkill] = useState("");

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    const updatedUser = {
      ...user,
      name,
      username: username.startsWith("@") ? username : `@${username}`,
      email,
      role,
      bio,
      location,
      website,
      avatar,
      skills,
    };

    setUser(updatedUser);

    // Save to LocalStorage
    try {
      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(updatedUser));
      const nexusUserRaw = localStorage.getItem("nexus_user");
      if (nexusUserRaw) {
        const parsed = JSON.parse(nexusUserRaw);
        localStorage.setItem(
          "nexus_user",
          JSON.stringify({ ...parsed, display_name: name, email, avatar_url: avatar, bio, location })
        );
      }
    } catch {
      /* ignore */
    }

    // Attempt Supabase Sync
    try {
      const { data: authData } = await supabase.auth.getUser();
      if (authData?.user) {
        await supabase
          .from("profiles")
          .update({ display_name: name, avatar_url: avatar })
          .eq("id", authData.user.id);
      }
    } catch {
      /* ignore */
    }

    setSaved(true);
    setEditing(false);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleAddSkill = (e) => {
    e.preventDefault();
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill("");
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const userProjects = [
    { id: "p1", name: "MongoDB Express API", role: "Lead Dev", progress: 60, tag: "Node.js" },
    { id: "p2", name: "Mobile App Redesign", role: "UI Contributor", progress: 85, tag: "React Native" },
    { id: "p3", name: "Lumina WebGPU Engine", role: "Core Contributor", progress: 90, tag: "Rust / GPU" },
  ];

  return (
    <div className="space-y-8 max-w-6xl mx-auto py-6 px-4 sm:px-6">
      {/* SAVED TOAST ALERT */}
      {saved && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center justify-between shadow-lg animate-fade-in">
          <span className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Profile successfully updated and saved locally!</span>
          </span>
          <button onClick={() => setSaved(false)} className="text-xs hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {/* COVER BANNER & AVATAR PROFILE HEADER */}
      <div className="relative rounded-3xl overflow-hidden border border-border bg-card shadow-2xl">
        {/* GRADIENT COVER */}
        <div className="h-44 sm:h-52 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-300 relative">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px]" />
          <div className="absolute top-4 right-4 flex space-x-2">
            <button
              onClick={() => {
                setEditing(!editing);
                setName(user.name);
                setUsername(user.username);
                setEmail(user.email);
                setRole(user.role);
                setBio(user.bio);
                setLocation(user.location);
                setWebsite(user.website);
                setAvatar(user.avatar);
                setSkills(user.skills || []);
              }}
              className="px-4 py-2 rounded-2xl bg-black/60 hover:bg-black text-white text-xs font-bold backdrop-blur-md border border-white/10 transition-all flex items-center space-x-2 shadow-lg"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{editing ? "Cancel Editing" : "✏️ Edit Profile"}</span>
            </button>
          </div>
        </div>

        {/* PROFILE IDENTITY INFO */}
        <div className="px-6 pb-6 pt-0 relative flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 -mt-16 sm:-mt-20">
          <div className="flex flex-col sm:flex-row items-start sm:items-end space-y-3 sm:space-y-0 sm:space-x-5">
            <div className="relative group">
              <img
                src={user.avatar}
                alt={user.name}
                className="w-28 h-28 sm:w-36 sm:h-36 rounded-3xl border-4 border-card object-cover shadow-2xl bg-surface-elevated"
              />
              <button
                onClick={() => setEditing(true)}
                className="absolute inset-0 bg-black/50 rounded-3xl opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity"
                title="Change Avatar"
              >
                <Camera className="w-6 h-6" />
              </button>
              <span className="absolute bottom-2 right-2 w-4 h-4 rounded-full bg-emerald-500 border-2 border-card" title="Online" />
            </div>

            <div className="space-y-1 pb-1">
              <div className="flex items-center space-x-3">
                <h1 className="text-2xl sm:text-3xl font-black text-foreground font-display">{user.name}</h1>
                <span className="px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-extrabold uppercase tracking-wider">
                  {user.role}
                </span>
              </div>
              <p className="text-xs font-semibold text-muted-foreground">{user.username} • {user.email}</p>
            </div>
          </div>

          {/* QUICK LINKS & METRICS */}
          <div className="flex items-center space-x-3 text-xs text-muted-foreground pt-2">
            <div className="flex items-center space-x-1">
              <MapPin className="w-3.5 h-3.5 text-primary" />
              <span>{user.location}</span>
            </div>
            <span className="text-border">•</span>
            <div className="flex items-center space-x-1">
              <Calendar className="w-3.5 h-3.5 text-primary" />
              <span>Joined {user.joined}</span>
            </div>
          </div>
        </div>
      </div>

      {/* EDIT PROFILE MODAL / FORM */}
      {editing && (
        <form onSubmit={handleSaveProfile} className="p-6 rounded-3xl bg-card border-2 border-primary/50 space-y-5 shadow-2xl animate-scale-in">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center space-x-2">
              <Edit3 className="w-5 h-5 text-primary" />
              <h3 className="text-base font-bold text-foreground font-display">Edit User Profile Information</h3>
            </div>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="text-xs text-muted-foreground hover:text-foreground font-bold"
            >
              ✕ Close
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-muted-foreground mb-1 block">Full Display Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl bg-surface-elevated border border-border text-xs text-foreground focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-muted-foreground mb-1 block">Username</label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl bg-surface-elevated border border-border text-xs text-foreground focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-muted-foreground mb-1 block">Primary Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl bg-surface-elevated border border-border text-xs text-foreground focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-muted-foreground mb-1 block">Role / Title</label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl bg-surface-elevated border border-border text-xs text-foreground focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-muted-foreground mb-1 block">Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl bg-surface-elevated border border-border text-xs text-foreground focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-muted-foreground mb-1 block">Website / Portfolio Link</label>
              <input
                type="text"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl bg-surface-elevated border border-border text-xs text-foreground focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-muted-foreground mb-1 block">Profile Avatar Image URL</label>
            <input
              type="text"
              value={avatar}
              onChange={(e) => setAvatar(e.target.value)}
              placeholder="https://..."
              className="w-full px-4 py-2.5 rounded-2xl bg-surface-elevated border border-border text-xs text-foreground focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-muted-foreground mb-1 block">Bio / Summary</label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl bg-surface-elevated border border-border text-xs text-foreground focus:outline-none focus:border-primary"
            />
          </div>

          {/* EDIT SKILLS TAGS */}
          <div className="space-y-2 pt-2 border-t border-border">
            <label className="text-xs font-bold text-muted-foreground block">Engineering Skills & Technologies</label>
            <div className="flex flex-wrap gap-2">
              {skills.map((s, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-bold flex items-center space-x-1.5"
                >
                  <span>{s}</span>
                  <button type="button" onClick={() => handleRemoveSkill(s)} className="hover:text-rose-400">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
            </div>

            <div className="flex space-x-2 pt-1 max-w-sm">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="e.g. Next.js, Rust, Docker"
                className="flex-1 px-3 py-1.5 rounded-xl bg-surface-elevated border border-border text-xs text-foreground outline-none focus:border-primary"
              />
              <button
                type="button"
                onClick={handleAddSkill}
                className="px-3 py-1.5 rounded-xl bg-surface-elevated border border-border text-xs font-bold hover:border-primary"
              >
                + Add Skill
              </button>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-3 border-t border-border">
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="px-4 py-2.5 rounded-2xl bg-surface-elevated border border-border text-xs font-bold text-muted-foreground"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-2xl bg-primary text-primary-foreground text-xs font-black shadow-lg shadow-primary/20 flex items-center space-x-2 hover:scale-105 transition-transform"
            >
              <Save className="w-4 h-4" />
              <span>Save Profile Changes</span>
            </button>
          </div>
        </form>
      )}

      {/* STATS BENTO CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-card border border-border flex items-center justify-between">
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">Active Projects</p>
            <p className="text-3xl font-black text-foreground font-display mt-1">6</p>
          </div>
          <div className="p-3 rounded-2xl bg-primary/10 text-primary border border-primary/20">
            <FolderGit2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-card border border-border flex items-center justify-between">
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">Issues Solved</p>
            <p className="text-3xl font-black text-foreground font-display mt-1">24</p>
          </div>
          <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-card border border-border flex items-center justify-between">
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">Build Rate</p>
            <p className="text-3xl font-black text-foreground font-display mt-1">98.4%</p>
          </div>
          <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Code2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-card border border-border flex items-center justify-between">
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">Community Rank</p>
            <p className="text-3xl font-black text-foreground font-display mt-1">Top 5%</p>
          </div>
          <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Award className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* NAVIGATION TABS */}
      <div className="flex items-center space-x-2 border-b border-border pb-3 overflow-x-auto">
        {[
          { id: "overview", label: "Overview & Skills" },
          { id: "projects", label: "Contributed Projects" },
          { id: "activity", label: "Activity Log" },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`px-5 py-2 rounded-2xl text-xs font-bold transition-all ${
              activeTab === t.id
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                : "text-muted-foreground hover:text-foreground hover:bg-surface-elevated"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* TAB CONTENT */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 p-6 rounded-3xl bg-card border border-border space-y-4">
            <h3 className="text-base font-bold text-foreground font-display">About Me</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">{user.bio}</p>

            <h4 className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground pt-4">Engineering Stack & Skills</h4>
            <div className="flex flex-wrap gap-2 pt-1">
              {(user.skills || []).map((skill, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 rounded-full bg-surface-elevated border border-border text-xs font-semibold text-foreground"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-card border border-border space-y-4">
            <h3 className="text-base font-bold text-foreground font-display">Account Telemetry</h3>
            <div className="space-y-3 text-xs text-muted-foreground">
              <div className="flex justify-between py-1 border-b border-border">
                <span>Account Role</span>
                <span className="font-bold text-primary">{user.role}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border">
                <span>Primary Email</span>
                <span className="font-bold text-foreground">{user.email}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border">
                <span>Location</span>
                <span className="font-bold text-foreground">{user.location}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border">
                <span>Website</span>
                <a href={user.website} target="_blank" rel="noreferrer" className="font-bold text-primary hover:underline truncate max-w-[150px]">
                  {user.website}
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "projects" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {userProjects.map((proj) => (
            <div key={proj.id} className="p-5 rounded-3xl bg-card border border-border space-y-4 hover:border-primary/40 transition-all">
              <div className="flex justify-between items-start">
                <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-[10px] font-extrabold uppercase">
                  {proj.tag}
                </span>
                <span className="text-xs font-bold text-muted-foreground">{proj.role}</span>
              </div>

              <h3 className="text-base font-bold text-foreground font-display">{proj.name}</h3>

              <div className="space-y-1.5 pt-2">
                <div className="flex justify-between text-xs font-extrabold">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="text-primary">{proj.progress}%</span>
                </div>
                <div className="h-2 rounded-full bg-surface-elevated overflow-hidden border border-border">
                  <div className="h-full bg-primary rounded-full" style={{ width: `${proj.progress}%` }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

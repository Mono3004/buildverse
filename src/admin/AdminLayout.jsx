import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Users,
  FolderGit2,
  Bug,
  GraduationCap,
  Settings,
  Bell,
  Search,
  LogOut,
  ArrowLeftRight,
} from "lucide-react";
import { fetchProjects, fetchIssues, fetchCourses, fetchUsersApi } from "@/lib/workspace";
import { supabase } from "@/integrations/supabase/client";

export default function AdminLayout({ children, activeTab = "overview", setActiveTab }) {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [counts, setCounts] = useState({
    projects: 0,
    issues: 0,
    courses: 0,
    users: 0,
  });

  useEffect(() => {
    async function loadTelemetryCounts() {
      try {
        const [pList, iList, cList, uList] = await Promise.all([
          fetchProjects("admin"),
          fetchIssues("admin"),
          fetchCourses(),
          fetchUsersApi("all"),
        ]);
        const openI = iList.filter((i) => !i.resolved);
        setCounts({
          projects: pList.length,
          issues: openI.length,
          courses: cList.length,
          users: uList.length,
        });
      } catch (e) {
        console.log("Telemetry counts note:", e);
      }
    }

    loadTelemetryCounts();
  }, [activeTab]);

  const handleLogout = async () => {
    localStorage.removeItem("nexus_auth_token");
    localStorage.removeItem("nexus_user");
    document.cookie = "nexus_session_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    try {
      await supabase.auth.signOut();
    } catch {
      /* ignore */
    }
    navigate({ to: "/login", replace: true });
  };

  const navItems = [
    { id: "overview", label: "Overview Telemetry", icon: LayoutDashboard, badge: null },
    { id: "users", label: "User Directory", icon: Users, badge: `${counts.users} Users` },
    { id: "projects", label: "Project Progress", icon: FolderGit2, badge: `${counts.projects} Repos` },
    { id: "issues", label: "Bug Tickets", icon: Bug, badge: `${counts.issues} Open` },
    { id: "courses", label: "Course Curriculum", icon: GraduationCap, badge: `${counts.courses} Tracks` },
    { id: "settings", label: "System Config", icon: Settings, badge: null },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground font-sans flex flex-col md:flex-row">
      {/* ADMIN SIDEBAR */}
      <aside className="w-full md:w-64 border-r border-border bg-card/70 backdrop-blur-xl p-5 flex flex-col justify-between shrink-0">
        <div>
          {/* BRAND LOGO HEADER */}
          <div className="flex items-center space-x-3 px-2 py-3 mb-6 border-b border-border">
            <Link to="/" className="font-display text-xl font-bold tracking-tight">
              buildverse<span className="text-primary">.</span>
            </Link>
            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
              Admin
            </span>
          </div>

          {/* SYSTEM HEALTH BADGE */}
          <div className="mb-6 p-3 rounded-2xl bg-surface-elevated border border-border flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-semibold text-muted-foreground">MongoDB Status</span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              LIVE
            </span>
          </div>

          {/* SIDEBAR NAVIGATION LINKS */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab && setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-primary text-primary-foreground font-extrabold shadow-md shadow-primary/20 scale-[1.02]"
                      : "text-muted-foreground hover:text-foreground hover:bg-surface-elevated"
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? "text-primary-foreground" : "text-muted-foreground"}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                        isActive ? "bg-black/20 text-primary-foreground" : "bg-border text-muted-foreground"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* BOTTOM USER PROFILE & LOGOUT FOOTER */}
        <div className="pt-4 border-t border-border space-y-3">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center space-x-2.5">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100"
                alt="Admin Avatar"
                className="w-8 h-8 rounded-full border border-primary/40 object-cover"
              />
              <div>
                <p className="text-xs font-bold text-foreground leading-none font-display">Elena Rostova</p>
                <p className="text-[10px] font-semibold text-muted-foreground mt-0.5">Super Admin</p>
              </div>
            </div>
          </div>

          <Link
            to="/dashboard"
            className="w-full flex items-center justify-center space-x-2 px-3 py-2 rounded-2xl bg-surface-elevated border border-border text-muted-foreground hover:text-primary text-xs font-bold transition-colors"
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            <span>Switch to User Workspace</span>
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 px-3 py-2 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white text-xs font-bold transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT WRAPPER */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* TOP HEADER BAR */}
        <header className="h-16 border-b border-border bg-card/40 backdrop-blur-md px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-4">
            <div className="relative w-64 hidden sm:block">
              <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search system telemetry..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 rounded-full bg-surface-elevated border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button className="p-2 rounded-xl bg-surface-elevated border border-border text-muted-foreground hover:text-foreground relative">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 size-2 rounded-full bg-primary" />
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white text-xs font-bold transition-all"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </header>

        {/* MAIN BODY CHILD NODES */}
        <main className="flex-1 p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}

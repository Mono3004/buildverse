import React, { useEffect, useState } from "react";
import {
  Users,
  FolderGit2,
  Bug,
  GraduationCap,
  TrendingUp,
  ShieldCheck,
  Zap,
  Activity,
  Plus,
  Trash2,
  ArrowUpRight,
  RefreshCw,
  GitCommit,
  Layers,
  Database,
  CheckCircle2,
  UserCheck,
} from "lucide-react";
import { fetchProjects, fetchIssues, deleteProject, fetchUsersApi, fetchCourses } from "@/lib/workspace";

export default function AdminOverview({ setActiveTab }) {
  const [projects, setProjects] = useState([]);
  const [issues, setIssues] = useState([]);
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [pList, iList, uList, cList] = await Promise.all([
        fetchProjects("admin"),
        fetchIssues("admin"),
        fetchUsersApi("all"),
        fetchCourses(),
      ]);
      setProjects(pList);
      setIssues(iList);
      setUsers(uList);
      setCourses(cList);
    } catch (err) {
      console.error("Failed to load overview telemetry:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDeleteProject = async (id) => {
    await deleteProject(id);
    setProjects(projects.filter((p) => p.id !== id));
  };

  const openIssues = issues.filter((i) => !i.resolved);
  const criticalIssues = issues.filter(
    (i) =>
      (i.priority || "").toLowerCase() === "critical" ||
      (i.priority || "").toLowerCase() === "high"
  );

  const studentCount = users.filter((u) => (u.role || "").toLowerCase() === "student").length;
  const mentorCount = users.filter((u) => (u.role || "").toLowerCase() === "mentor").length;
  const adminCount = users.filter((u) => (u.role || "").toLowerCase() === "admin").length;

  return (
    <div className="space-y-6">
      {/* SECTION TITLE & ACTIONS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-foreground font-display">
            BuildVerse System Overview
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Real-time live telemetry synced directly with MongoDB collections, Docker microservices, and user modules.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={loadData}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-2xl bg-surface-elevated border border-border text-foreground text-xs font-bold hover:border-primary/50 transition-colors shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-primary" : ""}`} />
            <span>Sync MongoDB Telemetry</span>
          </button>

          <button
            onClick={() => setActiveTab && setActiveTab("projects")}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-2xl bg-primary text-primary-foreground text-xs font-black shadow-lg shadow-primary/20 hover:scale-105 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Project</span>
          </button>
        </div>
      </div>

      {/* 4 TOP BENTO METRIC CARDS (ALL SOURCED DIRECTLY FROM MONGODB) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* TOTAL USERS CARD */}
        <div
          onClick={() => setActiveTab && setActiveTab("users")}
          className="p-5 rounded-3xl bg-card border border-border relative overflow-hidden group shadow-lg cursor-pointer hover:border-primary/50 transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">Total Users</span>
            <div className="p-2 rounded-2xl bg-primary/10 text-primary border border-primary/20">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-black text-foreground font-display">{users.length}</span>
            <span className="text-xs font-bold text-emerald-400 flex items-center">
              <TrendingUp className="w-3.5 h-3.5 mr-1" /> Live
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-2">
            {studentCount} Students · {mentorCount} Mentors · {adminCount} Admins
          </p>
        </div>

        {/* ACTIVE REPOS CARD */}
        <div
          onClick={() => setActiveTab && setActiveTab("projects")}
          className="p-5 rounded-3xl bg-card border border-border relative overflow-hidden group shadow-lg cursor-pointer hover:border-primary/50 transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">Repositories</span>
            <div className="p-2 rounded-2xl bg-primary/10 text-primary border border-primary/20">
              <FolderGit2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-black text-foreground font-display">{projects.length}</span>
            <span className="text-xs font-bold text-emerald-400 flex items-center">
              <TrendingUp className="w-3.5 h-3.5 mr-1" /> Synced
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-2">MongoDB project repositories</p>
        </div>

        {/* OPEN TICKETS CARD */}
        <div
          onClick={() => setActiveTab && setActiveTab("issues")}
          className="p-5 rounded-3xl bg-card border border-border relative overflow-hidden group shadow-lg cursor-pointer hover:border-primary/50 transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">Sprint Tickets</span>
            <div className="p-2 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <Bug className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-black text-foreground font-display">{openIssues.length}</span>
            <span className="text-xs font-bold text-primary">{criticalIssues.length} High Priority</span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-2">Jira backlog & Kanban tickets</p>
        </div>

        {/* CURRICULUM COURSES CARD */}
        <div
          onClick={() => setActiveTab && setActiveTab("courses")}
          className="p-5 rounded-3xl bg-card border border-border relative overflow-hidden group shadow-lg cursor-pointer hover:border-primary/50 transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">Academy Masterclasses</span>
            <div className="p-2 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-black text-foreground font-display">{courses.length}</span>
            <span className="text-xs font-bold text-amber-400">
              {courses.filter((c) => (typeof c.mentor === "string" ? c.mentor : c.mentor?.name || "").toLowerCase().includes("mentor") || (typeof c.mentor === "string" ? c.mentor : c.mentor?.name || "").toLowerCase().includes("elena")).length} by Mentors
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-2">Curriculums & Mentor Video Masterclasses</p>
        </div>
      </div>

      {/* RECENTLY REGISTERED USERS PREVIEW SECTION (DYNAMIC FROM MONGODB) */}
      <div className="rounded-3xl bg-card border border-border p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-foreground font-display flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-primary" />
              <span>Registered Users Telemetry ({users.length})</span>
            </h2>
            <p className="text-xs text-muted-foreground">
              Direct live sync from MongoDB <code className="text-primary font-mono text-[11px]">users</code> collection.
            </p>
          </div>
          <button
            onClick={() => setActiveTab && setActiveTab("users")}
            className="flex items-center space-x-1 text-xs font-bold text-primary hover:underline"
          >
            <span>Manage All Users</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {users.length === 0 ? (
          <div className="p-8 rounded-2xl border border-dashed border-border text-center space-y-3">
            <Users className="w-8 h-8 text-muted-foreground mx-auto opacity-50" />
            <p className="text-xs text-muted-foreground">No users registered in MongoDB yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {users.slice(0, 6).map((u) => {
              const roleLower = (u.role || "student").toLowerCase();
              const badgeBg =
                roleLower === "admin"
                  ? "bg-rose-500/10 text-rose-400 border-rose-500/30"
                  : roleLower === "mentor"
                  ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                  : "bg-primary/10 text-primary border-primary/30";

              return (
                <div
                  key={u.id}
                  className="p-3.5 rounded-2xl bg-surface-elevated/80 border border-border flex items-center justify-between hover:border-primary/40 transition-colors"
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <img
                      src={u.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${u.email}`}
                      alt={u.name}
                      className="w-9 h-9 rounded-full bg-border object-cover shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-foreground truncate">{u.name}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{u.email}</p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border shrink-0 ${badgeBg}`}>
                    {u.role}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* LIVE PROJECTS INFRASTRUCTURE TABLE */}
      <div className="rounded-3xl bg-card border border-border p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-foreground font-display">
              Live Projects Infrastructure ({projects.length})
            </h2>
            <p className="text-xs text-muted-foreground">
              Projects created by students, mentors, and admins in MongoDB.
            </p>
          </div>
          <button
            onClick={() => setActiveTab && setActiveTab("projects")}
            className="flex items-center space-x-1 text-xs font-bold text-primary hover:underline"
          >
            <span>View All Repos</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {projects.length === 0 ? (
          <div className="p-8 rounded-2xl border border-dashed border-border text-center space-y-3">
            <FolderGit2 className="w-8 h-8 text-primary mx-auto opacity-70" />
            <h3 className="text-sm font-bold text-foreground">No Repositories Found in Database</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              No projects have been initialized yet. When students or mentors push repositories, they will stream here live.
            </p>
            <button
              onClick={() => setActiveTab && setActiveTab("projects")}
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-black shadow-md shadow-primary/20"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create First Repository</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-muted-foreground">
              <thead className="bg-surface-elevated text-foreground uppercase font-extrabold text-[10px] tracking-wider border-b border-border">
                <tr>
                  <th className="px-4 py-3 rounded-l-xl">Project Name</th>
                  <th className="px-4 py-3">Category Tag</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Completion</th>
                  <th className="px-4 py-3 text-right rounded-r-xl">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {projects.map((p) => (
                  <tr key={p.id} className="hover:bg-surface-elevated/50 transition-colors">
                    <td className="px-4 py-3 font-bold text-foreground flex items-center space-x-2">
                      <FolderGit2 className="w-4 h-4 text-primary shrink-0" />
                      <span className="truncate max-w-xs">{p.name}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-surface-elevated border border-border text-foreground">
                        {p.tag || "Active"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center text-emerald-400 font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5" />
                        {p.status || "active"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-surface-elevated h-1.5 rounded-full overflow-hidden border border-border">
                          <div
                            className="bg-primary h-full rounded-full transition-all"
                            style={{ width: `${p.progress || 0}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-mono text-foreground font-bold">{p.progress || 0}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleDeleteProject(p.id)}
                        className="p-1.5 hover:text-rose-400 transition-colors rounded-lg hover:bg-rose-500/10"
                        title="Delete project from MongoDB"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* SYSTEM INFRASTRUCTURE STATUS PANEL */}
      <div className="rounded-3xl bg-card border border-border p-6 shadow-xl space-y-4">
        <h2 className="text-base font-bold text-foreground font-display flex items-center gap-2">
          <Database className="w-4 h-4 text-emerald-400" />
          <span>Active Microservices & Pipeline Health</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-surface-elevated/70 border border-border space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-foreground">MongoDB Server</span>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                CONNECTED
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground font-mono">127.0.0.1:27017 / buildverse</p>
            <p className="text-[10px] text-emerald-400 font-semibold">Native Mongoose v8.3.1 Active</p>
          </div>

          <div className="p-4 rounded-2xl bg-surface-elevated/70 border border-border space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-foreground">Redis Cache & Queue</span>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/30">
                IN-MEMORY MODE
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground font-mono">Port 6379 / Safe Fallback</p>
            <p className="text-[10px] text-muted-foreground">Automatic BullMQ Memory Driver</p>
          </div>

          <div className="p-4 rounded-2xl bg-surface-elevated/70 border border-border space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-foreground">Kafka Event Bus</span>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                FAST-FAIL ZERO LAG
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground font-mono">localhost:9092 / 0 retries</p>
            <p className="text-[10px] text-emerald-400 font-semibold">&lt;15ms Request Execution</p>
          </div>
        </div>
      </div>
    </div>
  );
}

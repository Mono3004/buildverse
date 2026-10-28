import React, { useCallback, useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell, Loading, PageHead } from "@/components/app/AppShell";
import { useSessionUser } from "@/lib/session";
import { CollabWorkspace } from "@/components/app/CollabWorkspace";
import { ContributionGraph } from "@/components/app/ContributionGraph";
import {
  createIssue,
  createProject,
  deleteIssue,
  deleteProject,
  fetchIssues,
  fetchMemberships,
  fetchProjects,
  fetchEnrolledCourses,
  fetchMentorReviews,
  setIssueResolved,
  updateProject,
} from "@/lib/workspace";
import { GraduationCap, Play, Award, BookOpen, UserCheck, Sparkles, X, Clock, RefreshCw, Star, Code2, CheckCircle2, MessageSquare, FolderGit2, FileCode, Lock, History } from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — BuildVerse collaborative workspace" },
      {
        name: "description",
        content:
          "Your BuildVerse dashboard: live cursors, shared comments, team presence, active projects, issues and enrolled academy classroom.",
      },
    ],
  }),
  component: DashboardRoute,
});

function DashboardRoute() {
  const { profile, ready } = useSessionUser();
  if (!ready || !profile) return <Loading />;
  return (
    <AppShell profile={profile}>
      <Dashboard profile={profile} />
    </AppShell>
  );
}

const emptyDraft = { name: "", description: "", tag: "Active", progress: 10 };

function Dashboard({ profile }) {
  const [projects, setProjects] = useState([]);
  const [issues, setIssues] = useState([]);
  const [groups, setGroups] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [draft, setDraft] = useState(emptyDraft);
  const [issueDraft, setIssueDraft] = useState({});
  const [openIssuesFor, setOpenIssuesFor] = useState(null);
  const [activeVideoUrl, setActiveVideoUrl] = useState(null);
  const [activeVideoTitle, setActiveVideoTitle] = useState("");

  // PROJECT FILES INSPECTION STATE
  const [inspectingReview, setInspectingReview] = useState(null);
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const [showSubmitReview, setShowSubmitReview] = useState(false);
  const [reviewDraft, setReviewDraft] = useState({ PR: "", project: "", query: "" });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewNotice, setReviewNotice] = useState("");

  const defaultSampleFiles = [
    {
      path: "src/App.jsx",
      content: `// Main Application Component\nimport React from 'react';\n\nexport default function App() {\n  return (\n    <div className="app-container">\n      <h1>BuildVerse Engineering Workspace</h1>\n      <p>Status: Active Deployment</p>\n    </div>\n  );\n}`,
    },
    {
      path: "src/config/database.js",
      content: `// Database configuration\nconst mongoose = require('mongoose');\n\nconst connectDB = async () => {\n  try {\n    await mongoose.connect(process.env.MONGO_URI);\n    console.log('MongoDB Connected successfully');\n  } catch (err) {\n    console.error(err.message);\n  }\n};\n\nmodule.exports = connectDB;`,
    },
    {
      path: "package.json",
      content: `{\n  "name": "buildverse-mentee-project",\n  "version": "1.0.0",\n  "dependencies": {\n    "react": "^18.3.1",\n    "mongoose": "^8.0.0"\n  }\n}`,
    },
    {
      path: "README.md",
      content: `# Project Workspace\n\nBuilt under BuildVerse mentorship guidance.\n- 100% test coverage\n- Monitored microservices\n- Clean architecture`,
    },
  ];

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [p, i, g, c, r] = await Promise.all([
        fetchProjects(profile.id),
        fetchIssues(profile.id),
        fetchMemberships(profile.id),
        fetchEnrolledCourses(),
        fetchMentorReviews(profile.id),
      ]);
      setProjects(p);
      setIssues(i);
      setGroups(g);
      setEnrolledCourses(c);
      setReviews(r || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load your workspace.");
    }
    setLoading(false);
  }, [profile.id]);

  useEffect(() => {
    void load();
  }, [load]);

  const resolvedDates = useMemo(
    () => issues.filter((i) => i.resolved && i.resolved_at).map((i) => i.resolved_at),
    [issues]
  );

  const openIssues = issues.filter((i) => !i.resolved);
  const resolvedThisWeek = resolvedDates.filter(
    (d) => Date.now() - new Date(d).getTime() < 7 * 864e5
  ).length;

  const stats = [
    ["Active projects", String(projects.filter((p) => p.status === "active").length)],
    ["Issues resolved", String(resolvedDates.length)],
    ["Open issues", String(openIssues.length)],
    ["Enrolled Masterclasses", String(enrolledCourses.length)],
  ];

  async function handleCreateProject(e) {
    e.preventDefault();
    if (!draft.name.trim()) return;
    try {
      const row = await createProject(profile.id, {
        name: draft.name.trim(),
        description: draft.description.trim() || "New workspace project",
        tag: draft.tag || "Active",
        progress: Number(draft.progress) || 10,
      });
      setProjects((prev) => [row, ...prev.filter((p) => p.name !== row.name)]);
      setDraft(emptyDraft);
      setShowNew(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not create project.");
    }
  }

  async function removeProject(id) {
    await deleteProject(id);
    setProjects((prev) => prev.filter((p) => p.id !== id));
  }

  async function bumpProgress(p, delta) {
    const next = Math.max(0, Math.min(100, (p.progress || 0) + delta));
    await updateProject(p.id, { progress: next });
    setProjects((prev) => prev.map((item) => (item.id === p.id ? { ...item, progress: next } : item)));
  }

  async function handleAddIssue(projectId, e) {
    e.preventDefault();
    const text = (issueDraft[projectId] || "").trim();
    if (!text) return;
    try {
      const created = await createIssue(profile.id, { project_id: projectId, title: text });
      setIssues((prev) => [created, ...prev]);
      setIssueDraft((prev) => ({ ...prev, [projectId]: "" }));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not add issue.");
    }
  }

  async function toggleIssue(issue) {
    const nextResolved = !issue.resolved;
    await setIssueResolved(issue.id, nextResolved);
    setIssues((prev) =>
      prev.map((i) => (i.id === issue.id ? { ...i, resolved: nextResolved, resolved_at: nextResolved ? new Date().toISOString() : null } : i))
    );
  }

  async function removeIssue(id) {
    await deleteIssue(id);
    setIssues((prev) => prev.filter((i) => i.id !== id));
  }

  return (
    <>
      <PageHead
        eyebrow={`Workspace of ${profile.name}`}
        title="Engineering Dashboard & Classroom"
        subtitle="Track active repos, live collaborative cursors, Jira issues, and your enrolled Academy Masterclasses."
        action={
          <div className="flex items-center space-x-3">
            <button
              onClick={() => void load()}
              className="flex items-center space-x-1.5 rounded-full bg-surface-elevated border border-border px-4 py-2 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors shadow-sm"
              title="Refresh Workspace"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-primary" : ""}`} />
              <span>Sync</span>
            </button>

            <button
              onClick={() => setShowNew(true)}
              className="flex items-center space-x-2 rounded-full bg-primary px-5 py-2 text-xs font-black text-primary-foreground shadow-lg shadow-primary/20 hover:scale-105 transition-all"
            >
              <span>+ New project</span>
            </button>
          </div>
        }
      />

      {error && (
        <div className="mt-4 rounded-2xl border border-destructive/40 bg-destructive/10 p-4 text-xs font-bold text-destructive">
          {error}
        </div>
      )}

      {showNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm">
          <form
            onSubmit={handleCreateProject}
            className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-2xl space-y-4"
          >
            <h2 className="text-lg font-bold font-display">Create new repository</h2>
            <div className="space-y-3">
              <input
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                required
                placeholder="Project name"
                className="h-11 w-full rounded-2xl border border-input bg-surface-elevated px-4 text-xs outline-none focus:border-primary"
              />
              <input
                value={draft.description}
                onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                placeholder="Short description"
                className="h-11 w-full rounded-2xl border border-input bg-surface-elevated px-4 text-xs outline-none focus:border-primary"
              />
              <div className="flex gap-3">
                <input
                  value={draft.tag}
                  onChange={(e) => setDraft({ ...draft, tag: e.target.value })}
                  placeholder="Tag"
                  className="h-11 flex-1 rounded-2xl border border-input bg-surface-elevated px-4 text-xs outline-none focus:border-primary"
                />
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={draft.progress}
                  onChange={(e) => setDraft({ ...draft, progress: Number(e.target.value) })}
                  className="h-11 w-28 rounded-2xl border border-input bg-surface-elevated px-4 text-xs outline-none focus:border-primary"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowNew(false)}
                className="rounded-2xl border border-border px-4 py-2 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-2xl bg-primary px-5 py-2 text-xs font-black text-primary-foreground shadow-lg shadow-primary/20"
              >
                Create project
              </button>
            </div>
          </form>
        </div>
      )}

      {/* METRIC STATS */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(([label, value]) => (
          <div key={label} className="rounded-3xl border border-border bg-card p-5 shadow-lg">
            <p className="text-[10px] tracking-widest text-muted-foreground uppercase font-black">{label}</p>
            <p className="mt-3 font-display text-3xl font-black text-foreground">
              {value}
              <span className="text-primary">.</span>
            </p>
          </div>
        ))}
      </div>

      {/* ENROLLED ACADEMY CLASSROOM SECTION */}
      <div className="mt-8 rounded-3xl border border-border bg-card p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <GraduationCap className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-bold font-display text-foreground">My Enrolled Classroom Masterclasses</h2>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Launch video lessons, track completion progress, and view verified certificates directly from your classroom.
            </p>
          </div>

          <Link
            to="/courses"
            className="px-4 py-2 rounded-2xl bg-primary/10 border border-primary/20 text-primary text-xs font-black hover:bg-primary hover:text-primary-foreground transition-all"
          >
            Browse Academy Catalog →
          </Link>
        </div>

        {enrolledCourses.length === 0 ? (
          <div className="p-8 rounded-2xl border border-dashed border-border text-center space-y-2">
            <p className="text-xs text-muted-foreground">No classroom courses enrolled yet.</p>
            <Link to="/courses" className="text-xs font-bold text-primary hover:underline inline-block">
              + Enroll in your first Masterclass
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {enrolledCourses.map((c) => {
              const lessons = c.lessons || [];
              const doneCount = lessons.filter((l) => l.completed).length;
              const totalCount = lessons.length || c.lessonsCount || 1;
              const percent = Math.round((doneCount / totalCount) * 100);

              return (
                <div
                  key={c.id}
                  className="p-5 rounded-2xl bg-surface-elevated border border-border space-y-4 hover:border-primary/50 transition-all shadow-md"
                >
                  <div className="flex items-start justify-between">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-primary/15 text-primary border border-primary/30">
                      {c.level || "Core"}
                    </span>
                    {percent === 100 && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center space-x-1">
                        <Award className="w-3 h-3" />
                        <span>Certified</span>
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-bold text-foreground font-display leading-snug">{c.title}</h3>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-mono text-primary">{percent}%</span>
                    </div>
                    <div className="w-full bg-card h-2 rounded-full overflow-hidden border border-border">
                      <div className="bg-primary h-full rounded-full transition-all duration-300" style={{ width: `${percent}%` }} />
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between border-t border-border/60">
                    <div className="flex items-center space-x-1 text-[11px] text-muted-foreground font-semibold">
                      <UserCheck className="w-3.5 h-3.5 text-primary" />
                      <span>{c.mentor || "Elias Thorne"}</span>
                    </div>

                    <button
                      onClick={() => {
                        const firstL = lessons[0];
                        setActiveVideoUrl(firstL?.videoUrl || c.videoUrl || "https://www.youtube.com/embed/g2nMKzhkvxA");
                        setActiveVideoTitle(firstL?.title || c.title);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-black flex items-center space-x-1 shadow-md shadow-primary/20 hover:scale-105 transition-all"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>Watch Lesson</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      {/* MENTOR PR REVIEWS & CODE EVALUATIONS */}
      <div className="mt-6 rounded-2xl border border-white/[0.08] bg-[#0E1015] p-4 sm:p-5 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.06] pb-3">
          <div>
            <div className="flex items-center space-x-2">
              <Code2 className="w-4 h-4 text-primary" />
              <h2 className="text-base font-bold font-display text-foreground">
                Mentor PR Reviews &amp; Code Evaluations ({reviews.length})
              </h2>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Live code evaluations, architectural queries, quality ratings, and GitPoints awarded by your mentors.
            </p>
          </div>

          <div className="flex items-center space-x-2 self-start sm:self-auto">
            <span className="px-3 py-1 rounded-full bg-primary/10 border border-primary/25 text-primary text-xs font-black tracking-wide">
              +{reviews.reduce((acc, r) => acc + (r.gitPoints || 0), 0)} Total GitPoints Earned
            </span>
            <button
              onClick={() => { setShowSubmitReview((v) => !v); setReviewNotice(""); }}
              className="px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-bold hover:scale-105 transition-transform"
            >
              {showSubmitReview ? "Cancel" : "+ Submit PR"}
            </button>
          </div>
        </div>

        {/* SUBMIT PR REVIEW FORM */}
        {showSubmitReview && (
          <form
            className="rounded-xl border border-white/[0.08] bg-[#141720] p-4 space-y-3"
            onSubmit={async (e) => {
              e.preventDefault();
              if (!reviewDraft.PR.trim()) return;
              setSubmittingReview(true);
              setReviewNotice("");
              try {
                const storedUser = (() => { try { return JSON.parse(localStorage.getItem("nexus_user") || "{}"); } catch { return {}; } })();
                const res = await fetch("http://localhost:5000/api/v1/mentorship/reviews", {
                  method: "POST",
                  headers: { "Content-Type": "application/json", ...(localStorage.getItem("nexus_auth_token") ? { Authorization: `Bearer ${localStorage.getItem("nexus_auth_token")}` } : {}) },
                  body: JSON.stringify({
                    student: storedUser.name || profile.display_name || "Student",
                    studentId: storedUser._id || storedUser.id || profile.id,
                    project: reviewDraft.project.trim() || projects[0]?.title || "My Project",
                    PR: reviewDraft.PR.trim(),
                    query: reviewDraft.query.trim(),
                  }),
                });
                const json = await res.json();
                if (json.success) {
                  setReviews((prev) => [json.data, ...prev]);
                  setReviewDraft({ PR: "", project: "", query: "" });
                  setShowSubmitReview(false);
                  setReviewNotice("✅ PR submitted for mentor review!");
                } else {
                  setReviewNotice(json.message || "Submission failed.");
                }
              } catch {
                setReviewNotice("Could not reach backend.");
              }
              setSubmittingReview(false);
            }}
          >
            <p className="text-xs font-bold text-primary uppercase tracking-widest">Submit Pull Request for Review</p>
            <input
              value={reviewDraft.PR}
              onChange={(e) => setReviewDraft((d) => ({ ...d, PR: e.target.value }))}
              placeholder="PR title, e.g. PR #12: Add OAuth2 login flow"
              required
              className="w-full rounded-lg border border-white/[0.1] bg-[#0E1015] px-3 py-2 text-sm text-foreground outline-none focus:border-primary/60"
            />
            <input
              value={reviewDraft.project}
              onChange={(e) => setReviewDraft((d) => ({ ...d, project: e.target.value }))}
              placeholder={`Project name (default: ${projects[0]?.title || "My Project"})`}
              className="w-full rounded-lg border border-white/[0.1] bg-[#0E1015] px-3 py-2 text-sm text-foreground outline-none focus:border-primary/60"
            />
            <textarea
              value={reviewDraft.query}
              onChange={(e) => setReviewDraft((d) => ({ ...d, query: e.target.value }))}
              placeholder="Questions or context for your mentor (optional)"
              rows={2}
              className="w-full resize-none rounded-lg border border-white/[0.1] bg-[#0E1015] px-3 py-2 text-sm text-foreground outline-none focus:border-primary/60"
            />
            <button
              type="submit"
              disabled={submittingReview}
              className="w-full rounded-lg bg-primary py-2 text-sm font-bold text-primary-foreground disabled:opacity-60"
            >
              {submittingReview ? "Submitting…" : "Submit for Review"}
            </button>
          </form>
        )}
        {reviewNotice && <p className="text-xs font-bold text-primary">{reviewNotice}</p>}

        {reviews.length === 0 ? (
          <div className="p-6 rounded-xl border border-dashed border-white/[0.08] text-center space-y-1">
            <p className="text-xs text-muted-foreground">No mentor reviews submitted for your repositories yet.</p>
            <p className="text-[11px] text-muted-foreground">
              When mentors review your Pull Requests, their feedback, star ratings, and awarded GitPoints will appear here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {reviews.map((r) => {
              const isApproved = r.status === "Approved";
              const stars = r.rating || 5;

              return (
                <div
                  key={r.id || r._id}
                  className="p-4 rounded-xl bg-[#141720] border border-white/[0.06] space-y-3 hover:border-primary/40 transition-all shadow-sm flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border flex items-center space-x-1 ${
                          isApproved
                            ? "bg-primary/15 text-primary border-primary/30"
                            : "bg-white/[0.06] text-zinc-400 border-white/[0.1]"
                        }`}
                      >
                        {isApproved && <CheckCircle2 className="w-2.5 h-2.5" />}
                        <span>{r.status || "Approved"}</span>
                      </span>

                      <span className="text-[11px] font-mono font-black text-primary">
                        +{r.gitPoints || (stars * 20 + (isApproved ? 50 : 10))} pts
                      </span>
                    </div>

                    <h3 className="text-xs font-bold text-foreground font-display leading-snug">
                      {r.PR || "PR #1: Implementation"}
                    </h3>
                    <p className="text-[10px] text-muted-foreground font-mono">
                      Project: {r.project || "Full Stack Systems"}
                    </p>

                    {/* STAR RATING */}
                    <div className="flex items-center space-x-1 pt-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-3 h-3 ${
                            stars >= s
                              ? "fill-primary text-primary"
                              : "text-zinc-600"
                          }`}
                        />
                      ))}
                      <span className="text-[10px] font-bold text-foreground ml-1">{stars}.0 / 5.0</span>
                    </div>

                    {/* MENTOR QUERY / GUIDANCE */}
                    {r.query ? (
                      <div className="p-2 rounded-lg bg-[#0E1015] border border-white/[0.06] text-[11px] text-foreground/90 space-y-0.5">
                        <span className="text-[9px] font-black uppercase tracking-wider text-primary block">
                          Architecture Query:
                        </span>
                        <p className="italic text-zinc-300">"{r.query}"</p>
                      </div>
                    ) : null}

                    {/* COMMENTS LIST */}
                    {Array.isArray(r.comments) && r.comments.length > 0 && (
                      <div className="space-y-1 pt-0.5">
                        {r.comments.slice(0, 2).map((c, i) => (
                          <div key={i} className="text-[10px] text-muted-foreground bg-[#0E1015] p-2 rounded-lg border border-white/[0.04]">
                            <span className="font-bold text-foreground">{c.author || "Elena Rostova"}: </span>
                            <span>{c.text}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 pt-1 border-t border-white/[0.06]">
                    {/* INSPECT FILES SHORTCUT */}
                    <button
                      type="button"
                      onClick={() => {
                        setInspectingReview(r);
                        setActiveFileIndex(0);
                      }}
                      className="w-full flex items-center justify-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-[#0E1015] border border-white/[0.08] hover:border-primary/40 text-primary text-[11px] font-bold transition-all"
                    >
                      <FolderGit2 className="w-3 h-3" />
                      <span>Inspect Files & Code</span>
                    </button>

                    <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                      <span className="flex items-center space-x-1">
                        <UserCheck className="w-3 h-3 text-primary" />
                        <span>{r.mentor || "Elena Rostova (Mentor)"}</span>
                      </span>
                      <Link
                        to="/chat"
                        className="text-primary hover:underline font-bold flex items-center space-x-0.5"
                      >
                        <MessageSquare className="w-3 h-3" />
                        <span>Discuss</span>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <ContributionGraph resolvedDates={resolvedDates} />

      <CollabWorkspace profile={profile} />

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <section>
          <h2 className="text-lg font-semibold font-display text-foreground">Active projects</h2>
          {loading ? (
            <p className="mt-4 text-sm text-muted-foreground">Loading projects…</p>
          ) : projects.length === 0 ? (
            <div className="mt-4 rounded-2xl border border-dashed border-border p-8 text-center">
              <p className="text-sm text-muted-foreground">
                No projects yet. Create your first one with “+ New project”.
              </p>
            </div>
          ) : (
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {projects.map((p) => {
                const pIssues = issues.filter((i) => i.project_id === p.id);
                const open = pIssues.filter((i) => !i.resolved).length;
                const expanded = openIssuesFor === p.id;
                return (
                  <article
                    key={p.id}
                    className="rounded-2xl border border-border bg-card p-5 transition-all hover:border-primary/50 shadow-md"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="rounded-full border border-border px-2.5 py-0.5 text-[10px] tracking-wide text-muted-foreground uppercase font-bold">
                        {p.tag}
                      </span>
                      <button
                        onClick={() => void removeProject(p.id)}
                        aria-label={`Delete ${p.name}`}
                        className="text-xs text-muted-foreground transition-colors hover:text-destructive font-semibold"
                      >
                        Delete
                      </button>
                    </div>
                    <h3 className="mt-4 font-semibold text-foreground font-display">{p.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{p.description}</p>
                    <div className="mt-4 flex items-center justify-between text-[11px] tracking-widest text-muted-foreground uppercase font-bold">
                      <span>Progress</span>
                      <span className="flex items-center gap-2 font-mono">
                        <button
                          onClick={() => void bumpProgress(p, -10)}
                          aria-label="Decrease progress"
                          className="rounded-full border border-border px-2 leading-5 hover:border-primary/60"
                        >
                          −
                        </button>
                        {p.progress}%
                        <button
                          onClick={() => void bumpProgress(p, 10)}
                          aria-label="Increase progress"
                          className="rounded-full border border-border px-2 leading-5 hover:border-primary/60"
                        >
                          +
                        </button>
                      </span>
                    </div>
                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-surface-elevated border border-border">
                      <div
                        className="h-full bg-primary transition-all duration-300"
                        style={{ width: `${p.progress}%` }}
                      />
                    </div>

                    <div className="mt-4 border-t border-border/60 pt-3">
                      <button
                        onClick={() => setOpenIssuesFor(expanded ? null : p.id)}
                        className="flex w-full items-center justify-between text-xs text-muted-foreground hover:text-foreground font-bold"
                      >
                        <span>Issues ({open} open)</span>
                        <span>{expanded ? "Hide" : "Show"}</span>
                      </button>

                      {expanded && (
                        <div className="mt-3 space-y-2">
                          <form onSubmit={(e) => void handleAddIssue(p.id, e)} className="flex gap-2">
                            <input
                              value={issueDraft[p.id] || ""}
                              onChange={(e) =>
                                setIssueDraft({ ...issueDraft, [p.id]: e.target.value })
                              }
                              placeholder="New issue title…"
                              className="h-8 flex-1 rounded-xl border border-input bg-surface-elevated px-3 text-xs outline-none focus:border-primary"
                            />
                            <button
                              type="submit"
                              className="rounded-xl bg-primary px-3 text-xs font-bold text-primary-foreground"
                            >
                              Add
                            </button>
                          </form>

                          {pIssues.length === 0 ? (
                            <p className="text-[11px] text-muted-foreground">No issues for this project.</p>
                          ) : (
                            <ul className="space-y-1.5">
                              {pIssues.map((i) => (
                                <li
                                  key={i.id}
                                  className="flex items-center justify-between rounded-xl bg-surface-elevated p-2 text-xs"
                                >
                                  <label className="flex items-center gap-2 cursor-pointer truncate pr-2">
                                    <input
                                      type="checkbox"
                                      checked={i.resolved}
                                      onChange={() => void toggleIssue(i)}
                                      className="rounded border-border accent-primary"
                                    />
                                    <span className={i.resolved ? "line-through text-muted-foreground" : "text-foreground font-medium"}>
                                      {i.title}
                                    </span>
                                  </label>
                                  <button
                                    onClick={() => void removeIssue(i.id)}
                                    className="text-[10px] text-muted-foreground hover:text-destructive font-bold"
                                  >
                                    Remove
                                  </button>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <aside className="space-y-6">
          <section className="rounded-3xl border border-border bg-card p-6 shadow-xl space-y-4">
            <h2 className="text-base font-bold font-display text-foreground">Team & Group Memberships</h2>
            <div className="space-y-2">
              {groups.map((g) => (
                <div key={g.id} className="p-3 rounded-2xl bg-surface-elevated border border-border flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground">{g.group_name}</span>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                    Active
                  </span>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </div>

      {/* DASHBOARD VIDEO PLAYER MODAL */}
      {activeVideoUrl && (
        <div className="fixed inset-0 bg-background/90 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-card border border-border rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl space-y-4 p-6">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <h3 className="text-sm font-bold text-foreground font-display">Classroom Video Masterclass</h3>
                <p className="text-xs text-primary font-semibold">{activeVideoTitle}</p>
              </div>
              <button
                onClick={() => setActiveVideoUrl(null)}
                className="p-2 rounded-xl bg-surface-elevated text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black border border-border">
              <iframe
                src={activeVideoUrl}
                title={activeVideoTitle}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}

      {/* READ-ONLY PROJECT CODE INSPECTOR MODAL */}
      {inspectingReview && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-150">
          <div className="bg-[#0E1015] border border-primary/30 rounded-2xl w-full max-w-4xl h-[75vh] flex flex-col shadow-2xl overflow-hidden">
            {/* INSPECTOR HEADER */}
            <div className="px-4 py-2.5 border-b border-white/[0.08] bg-[#0A0C10] flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#141720] border border-primary/30 flex items-center justify-center text-primary font-bold text-xs font-mono">
                  <FolderGit2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-xs font-bold text-foreground font-display">
                      {inspectingReview.project} / Source Files
                    </h3>
                    <span className="flex items-center space-x-1 px-1.5 py-0.5 rounded bg-primary/10 border border-primary/25 text-primary text-[9px] font-black uppercase">
                      <Lock className="w-2.5 h-2.5" />
                      <span>Read-Only</span>
                    </span>
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    PR: <span className="text-zinc-300 font-mono">{inspectingReview.PR}</span> · Evaluated by {inspectingReview.mentor || "Lead Mentor"}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setInspectingReview(null)}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-[#141720] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* INSPECTOR CONTENT BODY */}
            <div className="flex-1 flex overflow-hidden">
              {/* FILE TREE SIDEBAR */}
              <div className="w-52 border-r border-white/[0.08] bg-[#0A0C10] p-3 space-y-1.5 overflow-y-auto shrink-0">
                <p className="text-[9px] font-black uppercase tracking-wider text-muted-foreground px-2">
                  Project Files
                </p>
                <div className="space-y-1">
                  {defaultSampleFiles.map((file, idx) => (
                    <button
                      key={file.path || idx}
                      onClick={() => setActiveFileIndex(idx)}
                      className={`w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-lg text-xs font-mono text-left transition-all ${
                        activeFileIndex === idx
                          ? "bg-primary/15 text-primary border border-primary/30 font-bold"
                          : "text-muted-foreground hover:text-foreground hover:bg-[#141720]"
                      }`}
                    >
                      <FileCode className="w-3 h-3 shrink-0" />
                      <span className="truncate">{file.path}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* CODE VIEWER (READ-ONLY) */}
              <div className="flex-1 flex flex-col bg-[#050608] overflow-hidden">
                <div className="px-3 py-1.5 bg-[#0A0C10] border-b border-white/[0.06] flex items-center justify-between text-xs font-mono text-muted-foreground">
                  <span className="text-foreground text-[11px]">
                    {defaultSampleFiles[activeFileIndex]?.path || "source.js"}
                  </span>
                  <span className="text-[10px] text-primary bg-primary/10 px-1.5 py-0.5 rounded border border-primary/20">
                    Verified
                  </span>
                </div>

                <div className="flex-1 overflow-auto p-3 font-mono text-xs text-zinc-300 leading-relaxed select-text">
                  <table className="w-full border-collapse">
                    <tbody>
                      {(defaultSampleFiles[activeFileIndex]?.content || "").split("\n").map((line, lIdx) => (
                        <tr key={lIdx} className="hover:bg-white/[0.02]">
                          <td className="w-10 pr-3 text-right text-zinc-600 select-none font-mono text-[11px]">
                            {lIdx + 1}
                          </td>
                          <td className="pl-2 text-zinc-300 whitespace-pre font-mono text-[11px]">
                            {line.startsWith("//") ? (
                              <span className="text-zinc-500 italic">{line}</span>
                            ) : line.includes("import") || line.includes("export") || line.includes("const") || line.includes("require") ? (
                              <span className="text-primary font-semibold">{line}</span>
                            ) : (
                              line
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* MODAL FOOTER */}
            <div className="p-3 border-t border-white/[0.08] bg-[#0A0C10] flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-2">
                <span className="text-xs text-muted-foreground">Mentor Score:</span>
                <span className="px-2 py-0.5 rounded bg-primary/15 text-primary text-xs font-black font-mono">
                  +{inspectingReview.gitPoints || 50} GitPoints
                </span>
              </div>
              <button
                type="button"
                onClick={() => setInspectingReview(null)}
                className="px-3 py-1.5 rounded-xl bg-[#141720] border border-white/[0.08] text-xs font-bold text-foreground hover:bg-[#1a1f2c]"
              >
                Close Viewer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

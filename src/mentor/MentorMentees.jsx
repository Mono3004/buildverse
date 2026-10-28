import React, { useState, useEffect } from "react";
import {
  Users,
  Code2,
  GitBranch,
  MessageSquare,
  RefreshCw,
  FolderGit2,
  FileCode,
  Lock,
  X,
  History,
  CheckCircle2,
  Search,
  Star,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { fetchMentorMentees, createMentorReview } from "@/lib/workspace";

export default function MentorMentees() {
  const [mentees, setMentees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [inspectingMentee, setInspectingMentee] = useState(null);
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const [inspectorTab, setInspectorTab] = useState("code"); // 'code' | 'commits' | 'members'

  // REVIEW MODAL STATE
  const [reviewingMentee, setReviewingMentee] = useState(null);
  const [reviewStatus, setReviewStatus] = useState("Approved");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("Solid architecture and modular code structure. Approved for merge.");
  const [reviewQuery, setReviewQuery] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewToast, setReviewToast] = useState("");

  const loadMentees = async () => {
    setLoading(true);
    try {
      const data = await fetchMentorMentees();
      setMentees(data);
    } catch (e) {
      console.error("Failed to load mentees:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMentees();
    const interval = setInterval(loadMentees, 4000);
    return () => clearInterval(interval);
  }, []);

  const filteredMentees = mentees.filter((m) => {
    const q = searchQuery.toLowerCase();
    return (
      m.name?.toLowerCase().includes(q) ||
      m.email?.toLowerCase().includes(q) ||
      m.project?.name?.toLowerCase().includes(q)
    );
  });

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

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!reviewingMentee) return;
    setSubmittingReview(true);
    const projectName = typeof reviewingMentee.project === "object" ? reviewingMentee.project?.name : (reviewingMentee.project || "Full Stack Architecture");

    await createMentorReview({
      student: reviewingMentee.name,
      studentId: reviewingMentee.id,
      project: projectName,
      PR: `PR #1: ${projectName} Architecture Implementation`,
      status: reviewStatus,
      rating: reviewRating,
      query: reviewQuery.trim(),
      comment: reviewComment.trim(),
      mentor: "Elena Rostova (Lead Mentor)",
    });

    setSubmittingReview(false);
    setReviewToast(`Review recorded! ${reviewingMentee.name} awarded ${reviewRating * 20 + (reviewStatus === "Approved" ? 50 : 10)} GitPoints.`);
    setReviewingMentee(null);
    setTimeout(() => setReviewToast(""), 4000);
    await loadMentees();
  };

  return (
    <div className="space-y-4">
      {/* TOAST ALERT */}
      {reviewToast && (
        <div className="p-3 rounded-xl bg-primary/10 border border-primary/30 text-primary text-xs font-bold flex items-center justify-between animate-in fade-in">
          <span>{reviewToast}</span>
          <button onClick={() => setReviewToast("")} className="text-primary hover:opacity-75">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-white/[0.06]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-foreground font-display tracking-tight">
              Assigned Student Mentees
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-primary/10 text-primary border border-primary/20">
              {mentees.length} Active
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Audit student project code trees, inspect commit histories, and publish code reviews.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative w-56 hidden sm:block">
            <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search mentees & repos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-[#0E1015] border border-white/[0.08] text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
            />
          </div>

          <button
            onClick={loadMentees}
            className="px-3 py-1.5 rounded-xl bg-[#0E1015] border border-white/[0.08] text-foreground hover:border-primary/50 transition-colors flex items-center space-x-1 text-xs font-semibold"
            title="Sync Mentees"
          >
            <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin text-primary" : "text-muted-foreground"}`} />
            <span>Sync</span>
          </button>
        </div>
      </div>

      {/* MENTEES GRID / EMPTY STATE */}
      {filteredMentees.length === 0 ? (
        <div className="p-8 text-center rounded-2xl bg-[#0E1015] border border-white/[0.08] border-dashed space-y-3">
          <Users className="w-8 h-8 text-primary/40 mx-auto" />
          <div>
            <h3 className="text-sm font-bold text-foreground font-display">No Mentees Found</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
              When new student engineers register for the BuildVerse workspace, their live repositories and code files appear here.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMentees.map((m) => {
            const project = m.project || {};
            const files = project.files && project.files.length > 0 ? project.files : defaultSampleFiles;
            const commits = project.commits && project.commits.length > 0 ? project.commits : [
              { hash: "8f4a1c2", author: m.name, message: "feat: initial system architecture setup", timestamp: "Yesterday" },
              { hash: "3e9b0d1", author: m.name, message: "fix: token refresh race condition", timestamp: "2 days ago" },
            ];

            return (
              <div
                key={m.id}
                className="p-4 rounded-2xl bg-[#0E1015] border border-white/[0.08] hover:border-primary/30 space-y-3.5 transition-all shadow-md flex flex-col justify-between"
              >
                {/* STUDENT INFO HEADER */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2.5">
                      <img
                        src={m.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150"}
                        alt={m.name}
                        className="w-10 h-10 rounded-xl border border-primary/25 object-cover"
                      />
                      <div>
                        <h3 className="text-xs font-bold text-foreground font-display">{m.name}</h3>
                        <p className="text-[11px] text-muted-foreground">{m.email}</p>
                        <span className="inline-flex items-center gap-1 mt-0.5 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                          {m.gitPoints || 150} GitPoints
                        </span>
                      </div>
                    </div>

                    <Link
                      to="/chat"
                      className="p-1.5 rounded-lg bg-[#141720] border border-white/[0.08] text-muted-foreground hover:text-primary hover:border-primary/40 transition-all"
                      title="Direct Message Mentee"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                    </Link>
                  </div>

                  {/* PROJECT SUMMARY CARD */}
                  <div className="p-3 rounded-xl bg-[#141720] border border-white/[0.06] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center space-x-1.5 text-xs font-bold text-foreground">
                        <FolderGit2 className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span className="truncate">{project.name || "Engineering Track"}</span>
                      </span>
                      <span className="text-[10px] font-mono text-zinc-400 bg-white/[0.04] px-1.5 py-0.5 rounded border border-white/[0.06]">
                        {project.branch || "main"}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] font-semibold">
                        <span className="text-muted-foreground">Sprint Velocity</span>
                        <span className="text-primary font-bold">{project.progress || 45}%</span>
                      </div>
                      <div className="h-1 rounded-full bg-black/60 overflow-hidden border border-white/[0.06]">
                        <div
                          className="h-full bg-primary rounded-full transition-all"
                          style={{ width: `${project.progress || 45}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1.5 border-t border-white/[0.06]">
                      <span className="flex items-center space-x-1">
                        <FileCode className="w-3 h-3 text-muted-foreground" />
                        <span>{files.length} Source Files</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <History className="w-3 h-3 text-muted-foreground" />
                        <span>{commits.length} Commits</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* ACTIONS: READ-ONLY CODE INSPECTION, REVIEW & MESSAGE */}
                <div className="pt-1 flex items-center gap-2">
                  <button
                    onClick={() => {
                      setInspectingMentee(m);
                      setActiveFileIndex(0);
                      setInspectorTab("code");
                    }}
                    className="flex-1 flex items-center justify-center space-x-1.5 py-2 px-2.5 rounded-xl bg-[#141720] border border-white/[0.08] text-foreground text-xs font-semibold hover:border-primary/40 hover:text-primary transition-all"
                  >
                    <Code2 className="w-3.5 h-3.5 text-primary" />
                    <span>Inspect Code</span>
                  </button>

                  <button
                    onClick={() => {
                      setReviewingMentee(m);
                      setReviewStatus("Approved");
                      setReviewRating(5);
                    }}
                    className="flex items-center justify-center space-x-1 py-2 px-3 rounded-xl bg-primary text-[#08090A] text-xs font-black shadow-sm shadow-primary/20 hover:opacity-90 transition-all"
                    title="Review and rate mentee project"
                  >
                    <Star className="w-3 h-3 fill-[#08090A]" />
                    <span>Review</span>
                  </button>

                  <Link
                    to="/chat"
                    className="flex items-center justify-center px-2.5 py-2 rounded-xl border border-white/[0.08] bg-[#141720] text-muted-foreground text-xs font-semibold hover:border-primary/40 hover:text-primary transition-all"
                    title="Send Direct Message"
                  >
                    <span>Chat</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* QUICK PROJECT REVIEW MODAL */}
      {reviewingMentee && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0E1015] border border-primary/30 rounded-2xl w-full max-w-md p-5 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <div className="flex items-center space-x-2">
                <Star className="w-4 h-4 text-primary fill-primary" />
                <div>
                  <h3 className="text-sm font-bold text-foreground font-display">
                    Review: {reviewingMentee.name}
                  </h3>
                  <p className="text-[11px] text-muted-foreground">
                    {typeof reviewingMentee.project === "object" ? reviewingMentee.project?.name : reviewingMentee.project}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setReviewingMentee(null)}
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-[#141720]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitReview} className="space-y-3">
              {/* STAR RATING PICKER */}
              <div>
                <label className="text-xs font-bold text-foreground block mb-1">
                  Rating & Quality Score (⭐ 1 to 5 Stars):
                </label>
                <div className="flex items-center space-x-1.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setReviewRating(s)}
                      className={`p-1.5 rounded-lg border transition-all ${
                        reviewRating >= s
                          ? "bg-primary/20 border-primary text-primary"
                          : "bg-[#141720] border-white/[0.08] text-muted-foreground hover:border-primary/40"
                      }`}
                    >
                      <Star className={`w-4 h-4 ${reviewRating >= s ? "fill-primary" : ""}`} />
                    </button>
                  ))}
                  <span className="text-xs font-black text-primary ml-2">
                    +{reviewRating * 20} GitPoints
                  </span>
                </div>
              </div>

              {/* STATUS TOGGLE */}
              <div>
                <label className="text-xs font-bold text-foreground block mb-1">PR Status:</label>
                <div className="grid grid-cols-3 gap-2">
                  {["Approved", "Changes Requested", "Pending"].map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setReviewStatus(st)}
                      className={`py-1.5 px-2 text-center text-xs font-bold rounded-xl border transition-all ${
                        reviewStatus === st
                          ? "bg-primary text-[#08090A] border-primary"
                          : "bg-[#141720] border-white/[0.08] text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* CRITIQUE COMMENT */}
              <div>
                <label className="text-xs font-bold text-foreground block mb-1">
                  Mentor Feedback & Architecture Critique:
                </label>
                <textarea
                  rows={2}
                  required
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Leave actionable guidance or merge approvals..."
                  className="w-full p-2.5 rounded-xl bg-[#141720] border border-white/[0.08] text-xs text-foreground outline-none focus:border-primary resize-none"
                />
              </div>

              {/* ARCHITECTURE QUERY */}
              <div>
                <label className="text-xs font-bold text-foreground block mb-1">
                  Architecture Query for Student (Optional):
                </label>
                <input
                  type="text"
                  value={reviewQuery}
                  onChange={(e) => setReviewQuery(e.target.value)}
                  placeholder="e.g. Please explain connection retry backoff logic."
                  className="w-full px-3 py-2 rounded-xl bg-[#141720] border border-white/[0.08] text-xs text-foreground outline-none focus:border-primary"
                />
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setReviewingMentee(null)}
                  className="px-3.5 py-1.5 rounded-xl bg-[#141720] border border-white/[0.08] text-xs font-semibold text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="px-4 py-1.5 rounded-xl bg-primary text-[#08090A] text-xs font-black shadow-sm shadow-primary/20 hover:opacity-90 transition-all disabled:opacity-50"
                >
                  {submittingReview ? "Submitting..." : `Submit Review (+${reviewRating * 20 + (reviewStatus === "Approved" ? 50 : 10)} GitPoints) →`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* READ-ONLY CODE INSPECTOR MODAL */}
      {inspectingMentee && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
          <div className="bg-[#0E1015] border border-primary/30 rounded-2xl w-full max-w-4xl h-[80vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* INSPECTOR HEADER WITH STRICT READ-ONLY BADGE */}
            <div className="px-4 py-3 border-b border-white/[0.08] bg-[#0A0C10] flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-2.5">
                <img
                  src={inspectingMentee.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150"}
                  alt={inspectingMentee.name}
                  className="w-8 h-8 rounded-lg border border-primary/30 object-cover"
                />
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-xs font-bold text-foreground font-display">
                      {inspectingMentee.name} / {inspectingMentee.project?.name || "Repository"}
                    </h3>
                    <span className="flex items-center space-x-1 px-1.5 py-0.5 rounded bg-primary/10 border border-primary/25 text-primary text-[9px] font-black uppercase">
                      <Lock className="w-2.5 h-2.5" />
                      <span>Read-Only</span>
                    </span>
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    Branch: <span className="text-zinc-300 font-mono">{inspectingMentee.project?.branch || "main"}</span> · Student files are protected
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {/* TABS SELECTOR */}
                <div className="flex items-center p-0.5 rounded-lg bg-[#141720] border border-white/[0.08] text-xs font-semibold">
                  <button
                    onClick={() => setInspectorTab("code")}
                    className={`px-2.5 py-1 rounded-md transition-all text-xs ${
                      inspectorTab === "code"
                        ? "bg-primary text-[#08090A] font-black"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Files
                  </button>
                  <button
                    onClick={() => setInspectorTab("commits")}
                    className={`px-2.5 py-1 rounded-md transition-all text-xs ${
                      inspectorTab === "commits"
                        ? "bg-primary text-[#08090A] font-black"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Commits
                  </button>
                  <button
                    onClick={() => setInspectorTab("members")}
                    className={`px-2.5 py-1 rounded-md transition-all text-xs ${
                      inspectorTab === "members"
                        ? "bg-primary text-[#08090A] font-black"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Team
                  </button>
                </div>

                <button
                  onClick={() => setInspectingMentee(null)}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-[#141720] transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* INSPECTOR BODY */}
            <div className="flex-1 flex overflow-hidden">
              {inspectorTab === "code" && (
                <>
                  {/* FILE TREE SIDEBAR */}
                  <div className="w-56 border-r border-white/[0.08] bg-[#0A0C10] p-3 space-y-1.5 overflow-y-auto shrink-0">
                    <p className="text-[9px] font-black uppercase tracking-wider text-muted-foreground px-2">
                      Project Files
                    </p>
                    <div className="space-y-1">
                      {(inspectingMentee.project?.files && inspectingMentee.project.files.length > 0
                        ? inspectingMentee.project.files
                        : defaultSampleFiles
                      ).map((file, idx) => (
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
                        {((inspectingMentee.project?.files && inspectingMentee.project.files.length > 0
                          ? inspectingMentee.project.files
                          : defaultSampleFiles)[activeFileIndex] || defaultSampleFiles[0]).path}
                      </span>
                      <span className="text-[9px] text-primary bg-primary/10 px-1.5 py-0.5 rounded border border-primary/20">
                        🔒 Read-Only Mode
                      </span>
                    </div>

                    <div className="flex-1 p-3 overflow-auto font-mono text-[11px] text-zinc-100 leading-relaxed">
                      {(() => {
                        const curFiles = inspectingMentee.project?.files && inspectingMentee.project.files.length > 0
                          ? inspectingMentee.project.files
                          : defaultSampleFiles;
                        const activeF = curFiles[activeFileIndex] || curFiles[0];
                        const lines = (activeF?.content || "// Empty file").split("\n");

                        return (
                          <div className="space-y-0.5">
                            {lines.map((line, lIdx) => (
                              <div key={lIdx} className="flex">
                                <span className="w-8 select-none text-zinc-600 text-right pr-3 shrink-0">
                                  {lIdx + 1}
                                </span>
                                <span className={line.startsWith("//") ? "text-zinc-500" : line.includes("import") || line.includes("export") || line.includes("function") ? "text-primary" : "text-zinc-200"}>
                                  {line}
                                </span>
                              </div>
                            ))}
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                </>
              )}

              {inspectorTab === "commits" && (
                <div className="flex-1 p-4 overflow-y-auto space-y-2.5">
                  <h4 className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider mb-2">
                    Git Commit History
                  </h4>
                  {(inspectingMentee.project?.commits && inspectingMentee.project.commits.length > 0
                    ? inspectingMentee.project.commits
                    : [
                        { hash: "8f4a1c2", author: inspectingMentee.name, message: "feat: initial system architecture setup", timestamp: "Yesterday" },
                        { hash: "3e9b0d1", author: inspectingMentee.name, message: "fix: token refresh race condition", timestamp: "2 days ago" },
                      ]
                  ).map((c, i) => (
                    <div
                      key={c.hash || i}
                      className="p-3 rounded-xl bg-[#141720] border border-white/[0.06] flex items-center justify-between"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-xs text-primary font-bold">{c.hash}</span>
                          <span className="text-xs font-bold text-foreground">{c.message}</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground">
                          Committed by <span className="text-foreground font-semibold">{c.author}</span>
                        </p>
                      </div>
                      <span className="text-[10px] text-muted-foreground font-mono">
                        {typeof c.timestamp === "object" ? "Recent" : c.timestamp}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {inspectorTab === "members" && (
                <div className="flex-1 p-4 overflow-y-auto space-y-2.5">
                  <h4 className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider mb-2">
                    Project Collaborators & Members
                  </h4>
                  {(inspectingMentee.project?.members && inspectingMentee.project.members.length > 0
                    ? inspectingMentee.project.members
                    : [
                        { name: inspectingMentee.name, role: "Lead Developer", email: inspectingMentee.email },
                        { name: "Elena Rostova", role: "Mentor Advisor", email: "elena@buildverse.io" },
                      ]
                  ).map((m, i) => (
                    <div
                      key={m.email || i}
                      className="p-3 rounded-xl bg-[#141720] border border-white/[0.06] flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-2.5">
                        <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center font-bold text-primary text-xs">
                          {m.name?.[0]}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-foreground">{m.name}</p>
                          <p className="text-[10px] text-muted-foreground">{m.email}</p>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-primary/10 text-primary border border-primary/20">
                        {m.role}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* MODAL FOOTER */}
            <div className="px-4 py-2.5 border-t border-white/[0.08] bg-[#0A0C10] flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-1.5 text-[11px] text-muted-foreground">
                <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                <span>Mentee code verified against MongoDB cloud cluster</span>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    const target = inspectingMentee;
                    setInspectingMentee(null);
                    setReviewingMentee(target);
                    setReviewStatus("Approved");
                    setReviewRating(5);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-primary text-[#08090A] text-xs font-black shadow-sm shadow-primary/20 hover:opacity-90 transition-all flex items-center space-x-1"
                >
                  <Star className="w-3 h-3 fill-[#08090A]" />
                  <span>Review Project</span>
                </button>

                <button
                  onClick={() => setInspectingMentee(null)}
                  className="px-3 py-1.5 rounded-xl bg-[#141720] border border-white/[0.08] text-xs font-semibold text-foreground hover:bg-[#1E2638] transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

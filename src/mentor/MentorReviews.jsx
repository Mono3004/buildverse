import React, { useState, useEffect } from "react";
import {
  Code2,
  Star,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  Clock,
  Send,
  Plus,
  RefreshCw,
  HelpCircle,
  Sparkles,
  FolderGit2,
  FileCode,
  Lock,
  X,
  History,
  Users,
} from "lucide-react";
import {
  fetchMentorReviews,
  createMentorReview,
  updateMentorReviewStatus,
  setMentorReviewQuery,
  addMentorReviewComment,
  rateMentorReview,
} from "@/lib/workspace";

export default function MentorReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedReview, setSelectedReview] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Read-only project inspection state
  const [inspectingReview, setInspectingReview] = useState(null);
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const [inspectorTab, setInspectorTab] = useState("code"); // 'code' | 'commits' | 'members'

  // Form states
  const [studentName, setStudentName] = useState("");
  const [prTitle, setPrTitle] = useState("");
  const [projectName, setProjectName] = useState("");
  const [queryInput, setQueryInput] = useState("");

  // Comment input
  const [commentDraft, setCommentDraft] = useState("");

  const loadReviews = async () => {
    setLoading(true);
    try {
      const data = await fetchMentorReviews();
      setReviews(data);
      if (selectedReview) {
        const refreshed = data.find((r) => r.id === selectedReview.id);
        if (refreshed) setSelectedReview(refreshed);
      }
    } catch (e) {
      console.error("Failed to load reviews:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
    const interval = setInterval(loadReviews, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    await updateMentorReviewStatus(id, newStatus);
    setReviews(reviews.map((r) => (r.id === id ? { ...r, status: newStatus } : r)));
    if (selectedReview?.id === id) {
      setSelectedReview({ ...selectedReview, status: newStatus });
    }
  };

  const handleRate = async (id, stars) => {
    await rateMentorReview(id, stars);
    const updated = reviews.map((r) =>
      r.id === id ? { ...r, rating: stars, gitPoints: (r.gitPoints || 0) + stars * 20 } : r
    );
    setReviews(updated);
    if (selectedReview?.id === id) {
      setSelectedReview({ ...selectedReview, rating: stars, gitPoints: (selectedReview.gitPoints || 0) + stars * 20 });
    }
  };

  const handleSetQuery = async (id, query) => {
    await setMentorReviewQuery(id, query);
    setReviews(reviews.map((r) => (r.id === id ? { ...r, query } : r)));
    if (selectedReview?.id === id) {
      setSelectedReview({ ...selectedReview, query });
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentDraft.trim() || !selectedReview) return;

    const res = await addMentorReviewComment(selectedReview.id, {
      author: "Elena Rostova (Mentor)",
      text: commentDraft.trim(),
      isMentor: true,
    });

    if (res && res.comments) {
      const updated = {
        ...selectedReview,
        comments: res.comments,
        gitPoints: res.gitPoints,
      };
      setSelectedReview(updated);
      setReviews(reviews.map((r) => (r.id === selectedReview.id ? updated : r)));
    }
    setCommentDraft("");
  };

  const handleCreateReview = async (e) => {
    e.preventDefault();
    if (!studentName.trim() || !prTitle.trim()) return;

    const created = await createMentorReview({
      student: studentName.trim(),
      PR: prTitle.trim(),
      project: projectName.trim() || "Full-Stack Project",
      query: queryInput.trim() || undefined,
    });

    if (created) {
      setReviews([created, ...reviews]);
    }
    setStudentName("");
    setPrTitle("");
    setProjectName("");
    setQueryInput("");
    setShowAddModal(false);
  };

  const defaultSampleFiles = [
    {
      path: "src/controllers/auth.controller.js",
      content: `// 🛡️ Authentication & 2FA Controller\nconst jwt = require('jsonwebtoken');\nconst bcrypt = require('bcryptjs');\n\nexports.verifySession = async (req, res) => {\n  const token = req.headers.authorization?.split(' ')[1];\n  if (!token) return res.status(401).json({ error: 'Unauthorized' });\n  \n  const decoded = jwt.verify(token, process.env.JWT_SECRET);\n  return res.json({ status: 'active', userId: decoded.id });\n};`,
    },
    {
      path: "src/models/Project.js",
      content: `// 📦 Project Telemetry Model\nconst mongoose = require('mongoose');\n\nconst ProjectSchema = new mongoose.Schema({\n  name: { type: String, required: true },\n  gitPoints: { type: Number, default: 0 },\n  mentorReviewStatus: { type: String, enum: ['Pending', 'Approved', 'Changes Requested'], default: 'Pending' },\n  lastCommit: { hash: String, message: String, timestamp: Date }\n});\n\nmodule.exports = mongoose.model('Project', ProjectSchema);`,
    },
    {
      path: "src/services/scoreEngine.js",
      content: `// ⚡ GitPoints Dynamic Scoring Engine\nexport function calculatePRScore(stars, approved) {\n  const basePoints = stars * 20;\n  const approvalBonus = approved ? 50 : 10;\n  return basePoints + approvalBonus;\n}`,
    },
    {
      path: "package.json",
      content: `{\n  "name": "buildverse-engineering-repo",\n  "version": "1.0.0",\n  "dependencies": {\n    "express": "^4.19.2",\n    "mongoose": "^8.3.1",\n    "jsonwebtoken": "^9.0.2"\n  }\n}`,
    },
  ];

  const filtered = reviews.filter((r) => {
    if (filterStatus === "all") return true;
    return r.status.toLowerCase() === filterStatus.toLowerCase();
  });

  return (
    <div className="space-y-4">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-white/[0.06]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-foreground font-display tracking-tight">
              Code Review & PR Evaluation Queue
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-primary/10 text-primary border border-primary/20">
              {reviews.length} Total
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Audit student pull requests, set queries, award 1-5 star ratings, and distribute GitPoints.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-primary text-[#08090A] text-xs font-black shadow-sm shadow-primary/20 hover:opacity-90 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Queue PR Review</span>
          </button>

          <button
            onClick={loadReviews}
            className="p-2 rounded-xl bg-[#0E1015] border border-white/[0.08] text-foreground hover:border-primary/40 transition-colors flex items-center space-x-1 text-xs font-semibold"
          >
            <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin text-primary" : "text-muted-foreground"}`} />
            <span>Sync</span>
          </button>
        </div>
      </div>

      {/* FILTER TABS & METRICS */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center p-0.5 rounded-xl bg-[#0E1015] border border-white/[0.08] text-xs font-semibold">
          {["all", "Pending", "Approved", "Changes Requested"].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1 rounded-lg capitalize transition-all text-xs ${
                filterStatus === st
                  ? "bg-primary text-[#08090A] font-black"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <span className="flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-[#0E1015] border border-white/[0.08] text-muted-foreground text-[11px]">
            <Sparkles className="w-3 h-3 text-primary" />
            <span>Approval: <strong className="text-foreground">+50 GitPoints</strong></span>
          </span>
          <span className="flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-[#0E1015] border border-white/[0.08] text-muted-foreground text-[11px]">
            <Star className="w-3 h-3 text-primary fill-primary" />
            <span>Rating: <strong className="text-foreground">+20 GitPoints/★</strong></span>
          </span>
        </div>
      </div>

      {/* REVIEWS GRID / DETAIL SPLIT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* REVIEWS LIST (2 COLS ON DESKTOP) */}
        <div className="lg:col-span-2 space-y-3">
          {filtered.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-[#0E1015] border border-dashed border-white/[0.08] space-y-2">
              <Code2 className="w-8 h-8 text-primary/40 mx-auto" />
              <h3 className="text-xs font-bold text-foreground font-display">No Pull Requests in this Filter</h3>
              <p className="text-[11px] text-muted-foreground max-w-sm mx-auto">
                Select another filter status or queue a new code review request from the button above.
              </p>
            </div>
          ) : (
            filtered.map((r) => {
              const isSelected = selectedReview?.id === r.id;
              return (
                <div
                  key={r.id}
                  onClick={() => setSelectedReview(r)}
                  className={`p-4 rounded-2xl bg-[#0E1015] border transition-all cursor-pointer shadow-sm space-y-3 ${
                    isSelected
                      ? "border-primary ring-1 ring-primary/30"
                      : "border-white/[0.08] hover:border-primary/40"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono text-zinc-400 font-bold uppercase tracking-wider">
                        {r.project}
                      </span>
                      <h3 className="text-xs font-bold text-foreground font-display mt-0.5">{r.PR}</h3>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        Author: <strong className="text-foreground">{r.student}</strong>
                      </p>
                    </div>

                    <div className="flex flex-col items-end space-y-1">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase border ${
                          r.status === "Approved"
                            ? "bg-primary/15 text-primary border-primary/30"
                            : "bg-white/[0.06] text-zinc-400 border-white/[0.1]"
                        }`}
                      >
                        {r.status}
                      </span>

                      <span className="text-[9px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
                        {r.gitPoints || 0} GitPoints
                      </span>
                    </div>
                  </div>

                  {/* QUERY NOTE IF ANY */}
                  {r.query && (
                    <div className="p-2.5 rounded-xl bg-[#141720] border border-white/[0.06] text-xs space-y-0.5">
                      <div className="flex items-center space-x-1.5 text-primary font-bold text-[10px]">
                        <HelpCircle className="w-3 h-3" />
                        <span>Query / Review Question</span>
                      </div>
                      <p className="text-muted-foreground text-[11px] leading-relaxed">{r.query}</p>
                    </div>
                  )}

                  {/* STAR RATING & ACTIONS FOOTER */}
                  <div className="pt-2.5 border-t border-white/[0.06] flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center space-x-1">
                      <span className="text-[11px] text-muted-foreground mr-1 font-semibold">Rating:</span>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRate(r.id, star);
                          }}
                          className="p-0.5 hover:scale-110 transition-transform"
                          title={`Rate ${star} Stars (+${star * 20} GitPoints)`}
                        >
                          <Star
                            className={`w-3.5 h-3.5 ${
                              star <= (r.rating || 0)
                                ? "fill-primary text-primary"
                                : "text-zinc-600 hover:text-primary"
                            }`}
                          />
                        </button>
                      ))}
                      <span className="text-[11px] font-bold text-foreground ml-1">
                        {r.rating ? `${r.rating}.0` : "Unrated"}
                      </span>
                    </div>

                    <div className="flex items-center space-x-1.5">
                      {/* INSPECT PROJECT FILES SHORTCUT BUTTON */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setInspectingReview(r);
                          setActiveFileIndex(0);
                          setInspectorTab("code");
                        }}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-[#141720] text-muted-foreground border border-white/[0.08] hover:text-foreground hover:border-primary/40 transition-all flex items-center space-x-1"
                        title="Inspect student code files & commits"
                      >
                        <FolderGit2 className="w-3 h-3 text-primary" />
                        <span>Inspect Files</span>
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStatusChange(r.id, "Approved");
                        }}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                          r.status === "Approved"
                            ? "bg-primary text-[#08090A]"
                            : "bg-primary/10 text-primary border border-primary/25 hover:bg-primary hover:text-[#08090A]"
                        }`}
                      >
                        Approve ✓
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStatusChange(r.id, "Changes Requested");
                        }}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                          r.status === "Changes Requested"
                            ? "bg-rose-500 text-white"
                            : "bg-rose-500/10 text-rose-400 border border-rose-500/25 hover:bg-rose-500 hover:text-white"
                        }`}
                      >
                        Changes
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* DETAILS & COMMENT THREAD PANEL (1 COL) */}
        <div className="space-y-3">
          {selectedReview ? (
            <div className="p-4 rounded-2xl bg-[#0E1015] border border-primary/30 shadow-md space-y-3.5 flex flex-col h-full">
              <div className="border-b border-white/[0.06] pb-3 space-y-1.5">
                <span className="text-[10px] font-mono text-zinc-400 font-bold uppercase">
                  {selectedReview.project}
                </span>
                <h3 className="text-sm font-bold text-foreground font-display">{selectedReview.PR}</h3>
                <p className="text-[11px] text-muted-foreground">
                  Student: <strong className="text-foreground">{selectedReview.student}</strong>
                </p>
                <div className="flex items-center justify-between pt-0.5">
                  <span className="text-[11px] text-muted-foreground">Score contribution:</span>
                  <span className="text-xs font-extrabold text-primary">
                    +{selectedReview.gitPoints || 0} GitPoints
                  </span>
                </div>

                {/* INSPECT PROJECT FILES ACTION */}
                <button
                  onClick={() => {
                    setInspectingReview(selectedReview);
                    setActiveFileIndex(0);
                    setInspectorTab("code");
                  }}
                  className="w-full mt-2 flex items-center justify-center space-x-1.5 px-3 py-1.5 rounded-xl bg-primary/10 border border-primary/25 text-primary text-xs font-bold hover:bg-primary hover:text-[#08090A] transition-all"
                >
                  <FolderGit2 className="w-3.5 h-3.5" />
                  <span>Inspect Project Source & Commits</span>
                </button>
              </div>

              {/* SET / EDIT QUERY FORM */}
              <div className="p-2.5 rounded-xl bg-[#141720] border border-white/[0.06] space-y-1.5">
                <label className="text-[10px] font-bold text-foreground flex items-center space-x-1.5">
                  <HelpCircle className="w-3 h-3 text-primary" />
                  <span>Set Query / Question to Student</span>
                </label>
                <input
                  type="text"
                  defaultValue={selectedReview.query || ""}
                  placeholder="e.g. Please verify latency benchmark under high load..."
                  onBlur={(e) => handleSetQuery(selectedReview.id, e.target.value)}
                  className="w-full px-2.5 py-1 rounded-lg bg-[#0E1015] border border-white/[0.08] text-xs text-foreground outline-none focus:border-primary"
                />
              </div>

              {/* COMMENT THREAD */}
              <div className="space-y-2.5 flex-1 flex flex-col">
                <h4 className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider flex items-center justify-between">
                  <span>Comments ({(selectedReview.comments || []).length})</span>
                  <span className="text-[9px] text-primary lowercase">+10 pts per note</span>
                </h4>

                <div className="space-y-2 max-h-56 overflow-y-auto pr-1 flex-1">
                  {(selectedReview.comments || []).length === 0 ? (
                    <div className="p-4 text-center rounded-xl border border-dashed border-white/[0.08] text-muted-foreground text-xs">
                      No critique comments yet. Leave feedback below.
                    </div>
                  ) : (
                    selectedReview.comments.map((c, i) => (
                      <div
                        key={i}
                        className={`p-2.5 rounded-xl text-xs space-y-0.5 ${
                          c.isMentor
                            ? "bg-primary/10 border border-primary/20 text-foreground"
                            : "bg-[#141720] border border-white/[0.06] text-foreground"
                        }`}
                      >
                        <div className="flex items-center justify-between text-[9px] font-bold">
                          <span className={c.isMentor ? "text-primary" : "text-zinc-300"}>{c.author}</span>
                          <span className="text-muted-foreground font-normal">
                            {new Date(c.createdAt || Date.now()).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <p className="text-[11px] leading-relaxed">{c.text}</p>
                      </div>
                    ))
                  )}
                </div>

                {/* POST COMMENT FORM */}
                <form onSubmit={handleAddComment} className="flex gap-1.5 pt-2 border-t border-white/[0.06]">
                  <input
                    type="text"
                    value={commentDraft}
                    onChange={(e) => setCommentDraft(e.target.value)}
                    placeholder="Add architectural feedback..."
                    className="flex-1 px-3 py-1.5 rounded-xl bg-[#141720] border border-white/[0.08] text-xs text-foreground outline-none focus:border-primary"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 rounded-xl bg-primary text-[#08090A] text-xs font-bold hover:opacity-90 transition-opacity flex items-center"
                  >
                    <Send className="w-3 h-3" />
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <div className="p-6 rounded-2xl bg-[#0E1015] border border-white/[0.08] text-center space-y-2">
              <MessageSquare className="w-8 h-8 text-primary/30 mx-auto" />
              <h3 className="text-xs font-bold text-foreground font-display">Select a Pull Request</h3>
              <p className="text-[11px] text-muted-foreground">
                Click any pull request from the queue to view its comment discussion thread, update queries, and award stars.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* QUEUE REVIEW MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0E1015] border border-white/[0.08] rounded-2xl p-5 w-full max-w-md space-y-3 shadow-2xl">
            <h3 className="text-sm font-bold text-foreground font-display border-b border-white/[0.06] pb-2.5">
              Queue Pull Request for Review
            </h3>

            <form onSubmit={handleCreateReview} className="space-y-2.5">
              <div>
                <label className="text-[10px] font-bold text-muted-foreground mb-1 block">Student Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-[#141720] border border-white/[0.08] text-xs text-foreground outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-muted-foreground mb-1 block">Pull Request Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. PR #15: Sharded Database Query Optimization"
                  value={prTitle}
                  onChange={(e) => setPrTitle(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-[#141720] border border-white/[0.08] text-xs text-foreground outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-muted-foreground mb-1 block">Project Scope</label>
                <input
                  type="text"
                  placeholder="e.g. Core Banking Microservices"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-[#141720] border border-white/[0.08] text-xs text-foreground outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-muted-foreground mb-1 block">Initial Query / Note</label>
                <textarea
                  rows={2}
                  placeholder="Initial question or scope validation..."
                  value={queryInput}
                  onChange={(e) => setQueryInput(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[#141720] border border-white/[0.08] text-xs text-foreground outline-none focus:border-primary resize-none"
                />
              </div>

              <div className="flex gap-2 pt-1.5">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-1.5 rounded-xl bg-[#141720] border border-white/[0.08] text-xs font-semibold text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-1.5 rounded-xl bg-primary text-[#08090A] text-xs font-black shadow-sm shadow-primary/20 hover:opacity-90"
                >
                  Queue Review →
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* READ-ONLY PROJECT CODE INSPECTOR MODAL */}
      {inspectingReview && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-150">
          <div className="bg-[#0E1015] border border-primary/30 rounded-2xl w-full max-w-4xl h-[80vh] flex flex-col shadow-2xl overflow-hidden">
            {/* INSPECTOR HEADER */}
            <div className="px-4 py-2.5 border-b border-white/[0.08] bg-[#0A0C10] flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#141720] border border-primary/30 flex items-center justify-center text-primary font-bold text-xs font-mono">
                  {inspectingReview.student?.charAt(0) || "S"}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-xs font-bold text-foreground font-display">
                      {inspectingReview.student} / {inspectingReview.project || "Repository"}
                    </h3>
                    <span className="flex items-center space-x-1 px-1.5 py-0.5 rounded bg-primary/10 border border-primary/25 text-primary text-[9px] font-black uppercase">
                      <Lock className="w-2.5 h-2.5" />
                      <span>Read-Only</span>
                    </span>
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    PR: <span className="text-zinc-300 font-mono">{inspectingReview.PR}</span> · Student source files are protected
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {/* SUB-TABS SELECTOR */}
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
                  onClick={() => setInspectingReview(null)}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-[#141720] transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* INSPECTOR CONTENT BODY */}
            <div className="flex-1 flex overflow-hidden">
              {inspectorTab === "code" && (
                <>
                  {/* FILE TREE SIDEBAR */}
                  <div className="w-56 border-r border-white/[0.08] bg-[#0A0C10] p-3 space-y-1.5 overflow-y-auto shrink-0">
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
                        Protected
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
                </>
              )}

              {inspectorTab === "commits" && (
                <div className="flex-1 p-4 overflow-y-auto space-y-2 bg-[#050608]">
                  <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-2">
                    Git Commit History (Branch: main)
                  </p>
                  {[
                    { hash: "a8f31b2", message: `feat: ${inspectingReview.PR}`, time: "32 mins ago", author: inspectingReview.student },
                    { hash: "f9c04e1", message: "refactor: optimize database query execution plan", time: "2 hours ago", author: inspectingReview.student },
                    { hash: "c2d99a0", message: "feat: telemetry event handlers and metrics pipeline", time: "Yesterday", author: inspectingReview.student },
                    { hash: "e1b43d7", message: "initial project scaffolding and config", time: "3 days ago", author: inspectingReview.student },
                  ].map((cm, cIdx) => (
                    <div
                      key={cIdx}
                      className="p-3 rounded-xl bg-[#0E1015] border border-white/[0.08] flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-3">
                        <History className="w-3.5 h-3.5 text-primary" />
                        <div>
                          <p className="text-xs font-bold text-foreground font-mono">{cm.message}</p>
                          <p className="text-[10px] text-muted-foreground">
                            by {cm.author} · {cm.time}
                          </p>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-[#141720] border border-white/[0.08] text-[10px] font-mono text-primary font-bold">
                        {cm.hash}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {inspectorTab === "members" && (
                <div className="flex-1 p-4 overflow-y-auto space-y-2 bg-[#050608]">
                  <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-2">
                    Repository Contributors & Team
                  </p>
                  {[
                    { name: inspectingReview.student, role: "Lead Student Contributor (Owner)", commits: 14 },
                    { name: "Elena Rostova", role: "Supervising Lead Mentor (Reviewer)", commits: 2 },
                  ].map((mem, mIdx) => (
                    <div
                      key={mIdx}
                      className="p-3 rounded-xl bg-[#0E1015] border border-white/[0.08] flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-2.5">
                        <div className="w-7 h-7 rounded-lg bg-[#141720] border border-white/[0.1] flex items-center justify-center text-xs font-bold text-primary font-mono">
                          {mem.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-foreground">{mem.name}</p>
                          <p className="text-[10px] text-muted-foreground">{mem.role}</p>
                        </div>
                      </div>
                      <span className="text-[11px] font-mono text-primary font-bold">
                        {mem.commits} commits
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* QUICK REVIEW BAR AT BOTTOM OF INSPECTOR */}
            <div className="p-3 border-t border-white/[0.08] bg-[#0A0C10] flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-2">
                <span className="text-xs text-muted-foreground font-medium">Mentor Evaluation:</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase border ${
                  inspectingReview.status === "Approved"
                    ? "bg-primary/15 text-primary border-primary/30"
                    : "bg-white/[0.06] text-zinc-400 border-white/[0.1]"
                }`}>
                  {inspectingReview.status}
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    handleStatusChange(inspectingReview.id, "Approved");
                    setInspectingReview({ ...inspectingReview, status: "Approved" });
                  }}
                  className="px-3 py-1.5 rounded-xl bg-primary text-[#08090A] text-xs font-black hover:opacity-90 transition-all flex items-center space-x-1"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Approve & Merge PR (+50 pts)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

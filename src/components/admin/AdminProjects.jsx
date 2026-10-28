import React, { useEffect, useState } from "react";
import {
  FolderGit2, Plus, Trash2, Search, RefreshCw, GitCommit,
  UserCheck, Users, X, ChevronDown,
} from "lucide-react";
import { fetchProjects, createProject, deleteProject } from "@/lib/workspace";

const API_BASE = "http://localhost:5000/api/v1";

export default function AdminProjects() {
  const [projects, setProjects] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [assignModal, setAssignModal] = useState(null); // { project }

  // Form State
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [tag, setTag] = useState("Active");

  // Assign form state
  const [selectedMentor, setSelectedMentor] = useState("");
  const [selectedStudent, setSelectedStudent] = useState("");
  const [assigning, setAssigning] = useState(false);
  const [assignMsg, setAssignMsg] = useState("");

  const loadProjects = async () => {
    setLoading(true);
    try {
      const list = await fetchProjects("admin");
      setProjects(list);
    } catch {
      /* fallback */
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const res = await fetch(`${API_BASE}/users`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setMentors(json.data.filter((u) => u.role === "mentor"));
          setStudents(json.data.filter((u) => u.role === "student" || u.role === "user"));
        }
      }
    } catch {
      /* fallback */
    }
  };

  useEffect(() => {
    loadProjects();
    loadUsers();
  }, []);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newP = await createProject("admin", {
      name: name.trim(),
      description: desc.trim() || "Building high-performance infrastructure.",
      progress: 25,
      tag: tag || "Active",
    });

    setProjects([newP, ...projects]);
    setName("");
    setDesc("");
    setShowAddModal(false);
  };

  const handleDelete = async (id) => {
    await deleteProject(id);
    setProjects(projects.filter((p) => p.id !== id));
  };

  const handleAssignMentor = async (e) => {
    e.preventDefault();
    if (!assignModal || !selectedMentor) return;
    setAssigning(true);
    setAssignMsg("");

    try {
      const mentor = mentors.find((m) => m._id === selectedMentor || m.id === selectedMentor);
      const student = students.find((s) => s._id === selectedStudent || s.id === selectedStudent);

      const res = await fetch(`${API_BASE}/projects/${assignModal.project.id}/assign-mentor`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mentorId: mentor?._id || mentor?.id,
          mentorName: mentor?.name,
          mentorEmail: mentor?.email,
          studentId: student?._id || student?.id,
          studentName: student?.name,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setAssignMsg(`✅ ${mentor?.name || "Mentor"} assigned successfully! Notification sent.`);
        await loadProjects();
        setTimeout(() => {
          setAssignModal(null);
          setAssignMsg("");
          setSelectedMentor("");
          setSelectedStudent("");
        }, 2000);
      } else {
        setAssignMsg(`❌ ${data.message || "Assignment failed."}`);
      }
    } catch {
      setAssignMsg("❌ Could not connect to backend.");
    } finally {
      setAssigning(false);
    }
  };

  const filteredProjects = projects.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.description || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-foreground font-display">
            Project Workspace Management
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Manage repositories, assign mentors to students, and track active workspaces.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={loadProjects}
            className="p-2.5 rounded-2xl bg-surface-elevated border border-border text-muted-foreground hover:text-foreground transition-colors flex items-center space-x-1.5 text-xs font-bold"
            title="Refresh Projects"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-primary" : ""}`} />
            <span>Sync</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 rounded-2xl bg-primary text-primary-foreground text-xs font-black flex items-center space-x-2 shadow-lg shadow-primary/20 hover:scale-105 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>New Repository</span>
          </button>
        </div>
      </div>

      {/* FILTER SEARCH BAR */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Filter repositories by name or description..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2 rounded-2xl bg-card border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary shadow-sm"
        />
      </div>

      {/* PROJECTS GRID / EMPTY STATE */}
      {filteredProjects.length === 0 ? (
        <div className="p-12 rounded-3xl bg-card border border-dashed border-border text-center space-y-3 shadow-xl">
          <FolderGit2 className="w-12 h-12 text-primary mx-auto opacity-70" />
          <h3 className="text-base font-bold text-foreground font-display">No Repositories Found in Database</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            No projects currently match your search. Create a new repository to start tracking files, commits, and Kanban sprints.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-2xl bg-primary text-primary-foreground text-xs font-black shadow-lg shadow-primary/20 hover:scale-105 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Repository</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProjects.map((proj) => (
            <div
              key={proj.id}
              className="p-6 rounded-3xl bg-card border border-border space-y-4 hover:border-primary/50 transition-all shadow-xl group flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-[10px] font-extrabold uppercase tracking-wider">
                    {proj.tag || "Active"}
                  </span>

                  <button
                    onClick={() => handleDelete(proj.id)}
                    className="p-1.5 rounded-xl text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    title="Delete Repository"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <h3 className="text-base font-bold text-foreground font-display group-hover:text-primary transition-colors flex items-center space-x-2">
                  <FolderGit2 className="w-4 h-4 text-primary shrink-0" />
                  <span className="truncate">{proj.name}</span>
                </h3>

                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                  {proj.description || "Active engineering project repository."}
                </p>

                {/* Mentor Badge */}
                {proj.mentorName && (
                  <div className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                    <UserCheck className="w-3 h-3" />
                    <span>Mentor: {proj.mentorName}</span>
                  </div>
                )}
              </div>

              <div className="space-y-3 pt-3 border-t border-border/60">
                {/* PROGRESS BAR */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-muted-foreground">Completion Status</span>
                    <span className="font-mono text-primary">{proj.progress || 50}%</span>
                  </div>
                  <div className="w-full bg-surface-elevated h-2 rounded-full overflow-hidden border border-border">
                    <div
                      className="bg-primary h-full rounded-full transition-all duration-500"
                      style={{ width: `${proj.progress || 50}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="flex items-center space-x-1 text-[11px] text-muted-foreground font-medium">
                    <GitCommit className="w-3.5 h-3.5 text-primary" />
                    <span>MongoDB Synced</span>
                  </span>
                  <button
                    onClick={() => {
                      setAssignModal({ project: proj });
                      setSelectedMentor(proj.mentorId || "");
                      setSelectedStudent("");
                      setAssignMsg("");
                    }}
                    className="flex items-center space-x-1 px-2.5 py-1 rounded-xl bg-primary/10 text-primary border border-primary/20 text-[10px] font-bold hover:bg-primary/20 transition-colors"
                  >
                    <Users className="w-3 h-3" />
                    <span>Assign Mentor</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ASSIGN MENTOR MODAL */}
      {assignModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-card border border-border rounded-3xl w-full max-w-md p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="text-base font-bold text-foreground font-display flex items-center space-x-2">
                  <UserCheck className="w-5 h-5 text-primary" />
                  <span>Assign Mentor to Project</span>
                </h3>
                <p className="text-[11px] text-muted-foreground mt-0.5">{assignModal.project.name}</p>
              </div>
              <button
                onClick={() => { setAssignModal(null); setAssignMsg(""); }}
                className="p-1.5 rounded-xl text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAssignMentor} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-muted-foreground mb-1 block">Select Mentor</label>
                <select
                  required
                  value={selectedMentor}
                  onChange={(e) => setSelectedMentor(e.target.value)}
                  className="w-full h-11 px-4 rounded-2xl bg-surface-elevated border border-input text-xs text-foreground focus:border-primary outline-none"
                >
                  <option value="">— Choose a mentor —</option>
                  {mentors.map((m) => (
                    <option key={m._id || m.id} value={m._id || m.id}>
                      {m.name} ({m.email})
                    </option>
                  ))}
                  {mentors.length === 0 && (
                    <option disabled>No mentors found in MongoDB</option>
                  )}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-muted-foreground mb-1 block">Notify Student (optional)</label>
                <select
                  value={selectedStudent}
                  onChange={(e) => setSelectedStudent(e.target.value)}
                  className="w-full h-11 px-4 rounded-2xl bg-surface-elevated border border-input text-xs text-foreground focus:border-primary outline-none"
                >
                  <option value="">— Select a student —</option>
                  {students.map((s) => (
                    <option key={s._id || s.id} value={s._id || s.id}>
                      {s.name} ({s.email})
                    </option>
                  ))}
                </select>
              </div>

              {assignMsg && (
                <div className={`p-3 rounded-2xl text-xs font-bold ${
                  assignMsg.startsWith("✅")
                    ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                    : "bg-rose-500/10 border border-rose-500/20 text-rose-400"
                }`}>
                  {assignMsg}
                </div>
              )}

              <div className="pt-2 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => { setAssignModal(null); setAssignMsg(""); }}
                  className="px-4 py-2 rounded-2xl border border-border text-xs font-bold text-muted-foreground"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={assigning || !selectedMentor}
                  className="px-5 py-2 rounded-2xl bg-primary text-primary-foreground text-xs font-black shadow-lg shadow-primary/20 disabled:opacity-50 flex items-center space-x-2"
                >
                  {assigning && <RefreshCw className="w-3 h-3 animate-spin" />}
                  <span>{assigning ? "Assigning..." : "Assign & Notify"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE REPOSITORY MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-card border border-border rounded-3xl w-full max-w-md p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-bold text-foreground font-display">Create New Repository</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-xs font-bold text-muted-foreground hover:text-foreground"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-muted-foreground mb-1 block">Project / Repository Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mobile App Redesign"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-11 px-4 rounded-2xl bg-surface-elevated border border-input text-xs text-foreground focus:border-primary outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-muted-foreground mb-1 block">Description</label>
                <textarea
                  rows={3}
                  placeholder="Short repository summary..."
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  className="w-full p-3 rounded-2xl bg-surface-elevated border border-input text-xs text-foreground focus:border-primary outline-none resize-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-muted-foreground mb-1 block">Category Tag</label>
                <select
                  value={tag}
                  onChange={(e) => setTag(e.target.value)}
                  className="w-full h-11 px-4 rounded-2xl bg-surface-elevated border border-input text-xs text-foreground focus:border-primary outline-none"
                >
                  <option value="Active">Active</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Core">Core</option>
                  <option value="Maintenance">Maintenance</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-2xl border border-border text-xs font-bold text-muted-foreground"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-2xl bg-primary text-primary-foreground text-xs font-black shadow-lg shadow-primary/20"
                >
                  Create & Sync
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

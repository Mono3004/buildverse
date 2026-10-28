import React, { useEffect, useState } from "react";
import { FolderGit2, Plus, Trash2, Search, ExternalLink, RefreshCw, GitCommit, CheckCircle2, AlertCircle } from "lucide-react";
import { fetchProjects, createProject, deleteProject } from "@/lib/workspace";

export default function AdminProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [tag, setTag] = useState("Active");

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

  useEffect(() => {
    loadProjects();
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

  const filteredProjects = projects.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase())
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
            Manual data sync, repository states, and active user workspaces.
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

                <div className="flex items-center justify-between pt-2 text-[11px] text-muted-foreground font-medium">
                  <span className="flex items-center space-x-1">
                    <GitCommit className="w-3.5 h-3.5 text-primary" />
                    <span>MongoDB Synced</span>
                  </span>
                  <span className="font-mono text-[10px]">{new Date(proj.created_at || Date.now()).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
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

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AppShell, Loading, PageHead } from "@/components/app/AppShell";
import { useSessionUser } from "@/lib/session";
import { createProject, fetchIssues, fetchProjects } from "@/lib/workspace";
import { RepoPanel } from "@/components/app/RepoPanel";
import { JiraBoard } from "@/components/app/JiraBoard";
import { FilePlus, FolderGit2, Kanban, Plus, Search } from "lucide-react";

export const Route = createFileRoute("/_authenticated/projects")({
  head: () => ({
    meta: [
      { title: "Projects & Repositories — BuildVerse" },
      {
        name: "description",
        content:
          "Browse GitHub-style code repositories, commits, and manage sprint tasks with the Jira Kanban board.",
      },
    ],
  }),
  component: ProjectsPage,
});

function ProjectsPage() {
  const { profile, ready } = useSessionUser();
  if (!ready || !profile) return <Loading />;
  return (
    <AppShell profile={profile}>
      <ProjectsBoard profile={profile} />
    </AppShell>
  );
}

function ProjectsBoard({ profile }) {
  const [activeTab, setActiveTab] = useState("repo");
  const [projects, setProjects] = useState([]);
  const [issues, setIssues] = useState([]);
  const [filter, setFilter] = useState("All");
  const [query, setQuery] = useState("");
  const [openProject, setOpenProject] = useState(null);
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    try {
      const [p, i] = await Promise.all([fetchProjects(profile.id), fetchIssues(profile.id)]);
      setProjects(p);
      setIssues(i);
      if (p.length > 0) setOpenProject(p[0]);
    } catch {
      /* Fallback default projects */
    }
  }, [profile.id]);

  useEffect(() => {
    void load();
  }, [load]);

  const filteredProjects = useMemo(
    () =>
      projects
        .filter((p) => (filter === "All" ? true : p.tag === filter))
        .filter((p) =>
          (p.name + (p.description || "") + (p.tag || "")).toLowerCase().includes(query.toLowerCase())
        ),
    [projects, filter, query]
  );

  const handleCreateNewProject = async (newProj) => {
    try {
      const created = await createProject(profile.id, newProj);
      const updatedProjects = [created, ...projects];
      setProjects(updatedProjects);
      setOpenProject(created);
      setActiveTab("repo");
      setCreating(false);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <>
      <PageHead
        eyebrow="Development Workspace"
        title="Repositories & Sprint Tracking"
        subtitle="Manage full-stack projects like GitHub with file trees and commits, plus Jira Kanban boards."
        action={
          <div className="flex items-center space-x-3">
            <button
              onClick={() => {
                if (projects[0]) {
                  setOpenProject(projects[0]);
                  setTimeout(() => {
                    const addBtn = document.getElementById("add-file-btn");
                    if (addBtn) addBtn.click();
                  }, 150);
                }
              }}
              className="flex items-center space-x-2 rounded-full border border-primary/40 bg-primary/10 px-4 py-2 text-xs font-black text-primary transition-transform hover:scale-105 hover:bg-primary hover:text-primary-foreground"
            >
              <FilePlus className="w-3.5 h-3.5" />
              <span>+ New File</span>
            </button>
            <button
              onClick={() => setCreating(true)}
              className="flex items-center space-x-2 rounded-full bg-primary px-5 py-2.5 text-xs font-black text-primary-foreground shadow-lg shadow-primary/20 transition-transform hover:scale-105"
            >
              <Plus className="w-4 h-4" />
              <span>+ Create New Repository</span>
            </button>
          </div>
        }
      />

      {/* TOP WORKSPACE TAB SWITCHER */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
        <div className="flex items-center space-x-2 bg-surface-elevated p-1 rounded-2xl border border-border">
          <button
            onClick={() => setActiveTab("repo")}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "repo"
                ? "bg-primary text-primary-foreground shadow-md"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <FolderGit2 className="w-4 h-4" />
            <span>GitHub Repositories ({projects.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("jira")}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "jira"
                ? "bg-primary text-primary-foreground shadow-md"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Kanban className="w-4 h-4" />
            <span>Jira Sprint Board</span>
          </button>
        </div>

        {/* SEARCH BAR */}
        {activeTab === "repo" && (
          <div className="relative w-full max-w-xs">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search repositories..."
              className="w-full pl-9 pr-4 py-2 rounded-2xl bg-card border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
            />
          </div>
        )}
      </div>

      {/* TAB CONTENT: GITHUB REPO OR JIRA KANBAN */}
      {activeTab === "jira" ? (
        <div className="mt-6">
          <JiraBoard />
        </div>
      ) : (
        <div className="mt-6 space-y-6">
          {/* PROJECT REPOSITORY CARDS GRID */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProjects.map((p) => {
              const isSelected = openProject?.id === p.id;
              return (
                <article
                  key={p.id}
                  onClick={() => setOpenProject(p)}
                  className={`cursor-pointer rounded-3xl border p-5 transition-all ${
                    isSelected
                      ? "border-primary bg-surface-elevated shadow-lg shadow-primary/10 scale-[1.02]"
                      : "border-border bg-card hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <span className="grid size-10 place-items-center rounded-2xl bg-primary/10 text-primary font-black font-display text-sm border border-primary/20">
                      {p.name.slice(0, 2).toUpperCase()}
                    </span>
                    <span className="rounded-full border border-border px-2.5 py-0.5 text-[10px] font-black tracking-wider uppercase text-muted-foreground">
                      {p.tag}
                    </span>
                  </div>
                  <h2 className="mt-4 font-bold text-foreground font-display text-base">{p.name}</h2>
                  <p className="line-clamp-2 text-xs text-muted-foreground mt-1">
                    {p.description || "High-craft software repository."}
                  </p>
                  <div className="mt-4 flex items-center justify-between text-[11px] font-bold text-muted-foreground uppercase">
                    <span>Repository Status</span>
                    <span className="text-primary">{p.progress}% Active</span>
                  </div>
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-surface-elevated">
                    <div
                      className="h-full rounded-full transition-[width] duration-700"
                      style={{ width: `${p.progress}%`, background: "var(--gradient-primary)" }}
                    />
                  </div>

                  {/* QUICK ACTIONS: + NEW FILE & EXPLORER */}
                  <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenProject(p);
                        setTimeout(() => {
                          const addBtn = document.getElementById("add-file-btn");
                          if (addBtn) addBtn.click();
                        }, 150);
                      }}
                      className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-primary/15 text-primary border border-primary/30 text-xs font-black hover:bg-primary hover:text-primary-foreground transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ New File</span>
                    </button>

                    <span className="text-[11px] font-bold text-muted-foreground flex items-center space-x-1">
                      <span>Code Explorer</span>
                      <span>→</span>
                    </span>
                  </div>
                </article>
              );
            })}
          </div>

          {/* ACTIVE REPOSITORY CODE VIEWER & COMMIT HISTORY */}
          {openProject && (
            <div className="pt-4 border-t border-border">
              <RepoPanel profile={profile} project={openProject} onClose={() => setOpenProject(null)} />
            </div>
          )}
        </div>
      )}

      {/* CREATE NEW REPOSITORY MODAL */}
      {creating && (
        <CreateProjectModal
          onClose={() => setCreating(false)}
          onCreate={handleCreateNewProject}
        />
      )}
    </>
  );
}

function CreateProjectModal({ onClose, onCreate }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [tag, setTag] = useState("Active");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onCreate({
      name: name.trim(),
      description: description.trim() || "New BuildVerse Repository",
      tag,
      progress: 10,
    });
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-card border border-border rounded-3xl p-6 space-y-4 shadow-2xl"
      >
        <h2 className="text-base font-bold text-foreground font-display border-b border-border pb-3">
          Create New Repository
        </h2>

        <div>
          <label className="text-xs font-bold text-muted-foreground mb-1 block">Repository Name</label>
          <input
            autoFocus
            type="text"
            required
            placeholder="e.g. NextGen Microservices Engine"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2.5 rounded-2xl bg-surface-elevated border border-border text-xs text-foreground outline-none focus:border-primary"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-muted-foreground mb-1 block">Description</label>
          <textarea
            rows={3}
            placeholder="Repository description..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-2.5 rounded-2xl bg-surface-elevated border border-border text-xs text-foreground outline-none focus:border-primary"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-muted-foreground mb-1 block">Tag / Status</label>
          <select
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            className="w-full px-4 py-2.5 rounded-2xl bg-surface-elevated border border-border text-xs text-foreground outline-none focus:border-primary"
          >
            <option value="Active">Active</option>
            <option value="In Progress">In Progress</option>
            <option value="Shipped">Shipped</option>
          </select>
        </div>

        <div className="flex space-x-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-2xl bg-surface-elevated border border-border text-muted-foreground text-xs font-bold"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 py-2.5 rounded-2xl bg-primary text-primary-foreground text-xs font-bold shadow-lg shadow-primary/20"
          >
            Create Repository →
          </button>
        </div>
      </form>
    </div>
  );
}

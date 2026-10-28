import { useEffect, useMemo, useState } from "react";
import { CodeEditor } from "@/components/app/CodeEditor";
import { FileTree } from "@/components/app/FileTree";
import { lineDiff } from "@/lib/highlight";
import {
  createCommit,
  deleteFile,
  fetchCommits,
  fetchFiles,
  languageFor,
  upsertFile,
  syncVsCodeGit,
} from "@/lib/repo";
import { Terminal, Download, Upload, Copy, Check, ExternalLink, Code2, FolderCheck } from "lucide-react";

export function RepoPanel({
  profile,
  project,
  onClose,
}) {
  const userProfile = profile || { display_name: "Developer", color: "#C9F227", id: "user_default" };
  const [files, setFiles] = useState([]);
  const [commits, setCommits] = useState([]);
  const [openTabs, setOpenTabs] = useState([]);
  const [activePath, setActivePath] = useState(null);
  const [drafts, setDrafts] = useState({});
  const [message, setMessage] = useState("");
  const [tab, setTab] = useState("code");
  const [openCommit, setOpenCommit] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  // VS Code Sync States
  const [vsCodeModal, setVsCodeModal] = useState(false);
  const [vsCodeStatus, setVsCodeStatus] = useState("");
  const [copiedCmd, setCopiedCmd] = useState(false);

  const active = files.find((f) => f.path === activePath) ?? null;
  const draft = activePath ? (drafts[activePath] ?? active?.content ?? "") : "";

  const dirtyPaths = useMemo(() => {
    const set = new Set();
    for (const f of files) if (drafts[f.path] !== undefined && drafts[f.path] !== f.content) set.add(f.path);
    return set;
  }, [files, drafts]);

  const localWorkspaceFolder = "E:\\Heartbeat API\\demo_workspace";
  const repoSlug = (project?.id || "workspace-repo").toLowerCase().replace(/\s+/g, "-");
  const gitCloneUrl = `https://github.com/buildverse/${repoSlug}.git`;

  useEffect(() => {
    let on = true;
    if (!project?.id) return;
    void (async () => {
      try {
        const [f, c] = await Promise.all([fetchFiles(project.id), fetchCommits(project.id)]);
        if (!on) return;
        setFiles(f);
        setCommits(c);
        if (f.length) {
          setOpenTabs([f[0].path]);
          setActivePath(f[0].path);
        }
      } catch (e) {
        if (on) setErr(e instanceof Error ? e.message : "Could not load the repository.");
      }
    })();
    return () => {
      on = false;
    };
  }, [project?.id]);

  function openFile(f) {
    setTab("code");
    setActivePath(f.path);
    setOpenTabs((prev) => (prev.includes(f.path) ? prev : [...prev, f.path]));
  }

  function closeTab(path) {
    setOpenTabs((prev) => {
      const next = prev.filter((p) => p !== path);
      if (activePath === path) setActivePath(next[next.length - 1] ?? null);
      return next;
    });
  }

  async function commit() {
    if (!active || !project?.id) return;
    setBusy(true);
    setErr("");
    try {
      const rows = lineDiff(active.content, draft);
      const additions = rows.filter((r) => r.type === "add").length;
      const deletions = rows.filter((r) => r.type === "del").length;
      const patch = rows
        .filter((r) => r.type !== "same")
        .map((r) => (r.type === "add" ? "+" : "-") + r.text)
        .slice(0, 200)
        .join("\n");
      const saved = await upsertFile(userProfile.id, project.id, active.path, draft);
      setFiles((prev) => prev.map((f) => (f.path === saved.path ? saved : f)));
      setDrafts((prev) => ({ ...prev, [saved.path]: saved.content }));
      const c = await createCommit(userProfile.id, project.id, {
        author_name: userProfile.display_name,
        message: message.trim() || `Update ${active.path}`,
        additions,
        deletions,
        path: active.path,
        patch,
      });
      setCommits((prev) => [c, ...prev]);
      setMessage("");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Commit failed.");
    }
    setBusy(false);
  }

  async function handleVsCodePush() {
    setBusy(true);
    try {
      const res = await syncVsCodeGit(project?.id, "push", {
        author: userProfile.display_name,
        files: files.map((f) => ({ ...f, content: drafts[f.path] !== undefined ? drafts[f.path] : f.content })),
        message: `VS Code Push: Synchronized workspace files to ${localWorkspaceFolder}`,
      });
      setVsCodeStatus(res.message);
      if (res.commit) {
        setCommits((prev) => [res.commit, ...prev]);
      }
    } catch {
      setVsCodeStatus(`Pushed workspace files to ${localWorkspaceFolder}`);
    } finally {
      setBusy(false);
    }
  }

  async function handleVsCodePull() {
    setBusy(true);
    try {
      const res = await syncVsCodeGit(project?.id, "pull");
      if (res.files && res.files.length > 0) {
        setFiles(res.files);
        if (!activePath && res.files[0]) {
          setOpenTabs([res.files[0].path]);
          setActivePath(res.files[0].path);
        }
      }
      if (res.commits) setCommits(res.commits);
      setVsCodeStatus(res.message);
    } catch {
      setVsCodeStatus(`Pulled latest workspace files from ${localWorkspaceFolder}`);
    } finally {
      setBusy(false);
    }
  }

  async function addFile() {
    if (!project?.id) return;
    const path = window.prompt("New file path", "src/index.js");
    if (!path) return;
    setErr("");
    try {
      const f = await upsertFile(userProfile.id, project.id, path.trim(), "");
      setFiles((prev) =>
        [...prev.filter((x) => x.path !== f.path), f].sort((a, b) => a.path.localeCompare(b.path)),
      );
      openFile(f);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not create the file.");
    }
  }

  async function removeFile(f) {
    if (!window.confirm(`Delete ${f.path}?`)) return;
    await deleteFile(f.id);
    setFiles((prev) => prev.filter((x) => x.id !== f.id));
    closeTab(f.path);
  }

  const totals = commits.reduce(
    (acc, c) => ({ add: acc.add + c.additions, del: acc.del + c.deletions }),
    { add: 0, del: 0 },
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-background/95 p-4 backdrop-blur-xl md:p-8">
      <div className="mx-auto max-w-6xl space-y-4">
        {/* GITHUB-STYLE REPOSITORY HEADER */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs tracking-widest text-primary uppercase font-bold">GitHub Repository</span>
              <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center space-x-1">
                <FolderCheck className="w-3 h-3 text-emerald-400" />
                <span>Local Disk: E:\Heartbeat API\demo_workspace</span>
              </span>
            </div>
            <h2 className="mt-1 text-2xl font-bold font-display">
              {(userProfile.display_name || "user").toLowerCase().replace(/\s+/g, "-")} / {project?.name || "Repository"}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              main · {files.length} files · {commits.length} commits ·{" "}
              <span className="text-primary font-bold">+{totals.add}</span>{" "}
              <span className="text-rose-400 font-bold">-{totals.del}</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* VS CODE & DISK PUSH/PULL BUTTONS */}
            <button
              onClick={handleVsCodePull}
              disabled={busy}
              className="px-3.5 py-1.5 rounded-full border border-border bg-surface-elevated text-xs font-bold text-foreground hover:border-primary/50 flex items-center space-x-1.5 transition-all shadow-sm"
              title="Pull physical files from E:\Heartbeat API\demo_workspace"
            >
              <Download className="w-3.5 h-3.5 text-primary" />
              <span>Disk Pull ⬇️</span>
            </button>

            <button
              onClick={handleVsCodePush}
              disabled={busy}
              className="px-3.5 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-xs font-bold text-primary hover:bg-primary hover:text-primary-foreground flex items-center space-x-1.5 transition-all shadow-sm"
              title="Push physical files to E:\Heartbeat API\demo_workspace"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Disk Push ⬆️</span>
            </button>

            <button
              onClick={() => setVsCodeModal(true)}
              className="px-3 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-xs font-bold text-blue-400 hover:bg-blue-500 hover:text-white flex items-center space-x-1.5 transition-all"
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>VS Code Terminal Guide</span>
            </button>

            <div className="flex rounded-full border border-border bg-surface-elevated p-1 text-xs font-bold ml-2">
              {(["code", "history"]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`rounded-full px-4 py-1.5 capitalize transition-all ${
                    tab === t ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            {onClose && (
              <button
                onClick={onClose}
                className="rounded-full border border-border px-4 py-2 text-xs font-bold transition-all hover:border-primary/60 hover:bg-surface-elevated"
              >
                Close Repository ✕
              </button>
            )}
          </div>
        </div>

        {/* STATUS ALERT NOTIFICATION */}
        {vsCodeStatus && (
          <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center justify-between shadow-md">
            <span className="flex items-center space-x-2">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>{vsCodeStatus}</span>
            </span>
            <button onClick={() => setVsCodeStatus("")} className="text-xs hover:underline">
              Dismiss
            </button>
          </div>
        )}

        {err && <p className="mt-3 text-xs font-bold text-rose-400">{err}</p>}

        {tab === "code" ? (
          <div className="grid gap-4 lg:grid-cols-[260px_1fr]">
            {/* FILE TREE SIDEBAR */}
            <aside className="max-h-[70vh] overflow-y-auto rounded-3xl border border-border bg-card p-4">
              <div className="flex items-center justify-between px-2 pb-3 border-b border-border mb-2">
                <p className="text-[10px] font-black tracking-widest text-muted-foreground uppercase">File Explorer</p>
                <button
                  id="add-file-btn"
                  onClick={() => void addFile()}
                  className="flex items-center space-x-1 px-2.5 py-1 rounded-xl bg-primary text-primary-foreground text-xs font-black shadow-md hover:scale-105 transition-all"
                >
                  <Plus className="w-3 h-3" />
                  <span>+ New File</span>
                </button>
              </div>
              <FileTree
                files={files}
                activePath={activePath}
                dirtyPaths={dirtyPaths}
                onOpen={openFile}
                onDelete={(f) => void removeFile(f)}
              />
              {files.length === 0 && (
                <p className="px-2 text-xs text-muted-foreground mt-3">Empty repository — click '+ New File' to start.</p>
              )}
            </aside>

            {/* MAIN CODE EDITOR PANEL */}
            <section className="overflow-hidden rounded-3xl border border-border bg-card flex flex-col shadow-2xl">
              <div className="hide-scrollbar flex items-stretch gap-1 overflow-x-auto border-b border-border bg-surface-elevated/40 px-2 pt-2">
                {openTabs.map((path) => (
                  <div
                    key={path}
                    className={`flex items-center gap-2 rounded-t-xl border-t border-r border-l px-3.5 py-2 font-mono text-xs transition-colors ${
                      activePath === path
                        ? "border-border bg-card text-foreground font-bold"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <button onClick={() => setActivePath(path)} className="whitespace-nowrap">
                      {path.split("/").pop()}
                      {dirtyPaths.has(path) && <span className="ml-1.5 text-primary">•</span>}
                    </button>
                    <button
                      onClick={() => closeTab(path)}
                      aria-label={`Close ${path}`}
                      className="text-muted-foreground hover:text-destructive text-xs ml-1"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                {openTabs.length === 0 && (
                  <span className="px-3 py-2 text-xs text-muted-foreground">No file open</span>
                )}
              </div>

              <header className="flex items-center justify-between border-b border-border px-4 py-2.5 text-xs">
                <span className="truncate font-mono text-muted-foreground">
                  {active ? active.path : "Select a file from the tree"}
                </span>
                <span className="shrink-0 text-muted-foreground font-mono">
                  {active ? languageFor(active.path) : ""}
                  {active && dirtyPaths.has(active.path) ? " · unsaved changes" : ""}
                </span>
              </header>

              {active ? (
                <CodeEditor
                  path={active.path}
                  value={draft}
                  onChange={(next) => setDrafts((prev) => ({ ...prev, [active.path]: next }))}
                />
              ) : (
                <div className="grid h-64 place-items-center text-xs text-muted-foreground">
                  Select a file from the left sidebar to start editing.
                </div>
              )}

              {/* COMMIT MESSAGE & SAVE BAR */}
              <div className="flex flex-wrap items-center gap-2 border-t border-border p-3 bg-surface-elevated/20">
                <input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Commit message (e.g., Update auth handler)"
                  aria-label="Commit message"
                  className="min-w-0 flex-1 rounded-2xl border border-border bg-surface-elevated px-4 py-2 text-xs outline-none focus:border-primary"
                />
                <button
                  onClick={() => void commit()}
                  disabled={!active || busy}
                  className="rounded-2xl bg-primary px-5 py-2 text-xs font-black text-primary-foreground disabled:opacity-50 shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform"
                >
                  {busy ? "Committing…" : "Commit changes →"}
                </button>
              </div>
            </section>
          </div>
        ) : (
          /* COMMIT HISTORY TAB */
          <div className="space-y-3">
            {commits.map((c) => {
              const open = openCommit === c.id;
              return (
                <article key={c.id} className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                  <button
                    onClick={() => setOpenCommit(open ? null : c.id)}
                    aria-expanded={open}
                    className="flex w-full flex-wrap items-center gap-3 px-5 py-4 text-left hover:bg-surface-elevated/50 transition-colors"
                  >
                    <span className="grid size-9 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary border border-primary/20 text-xs font-black">
                      {c.author_name ? c.author_name.slice(0, 2).toUpperCase() : "US"}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-xs font-bold text-foreground font-display">{c.message}</span>
                      <span className="block text-[11px] text-muted-foreground mt-0.5">
                        {c.author_name} committed {new Date(c.created_at).toLocaleString()}
                        {c.path ? ` · ${c.path}` : ""}
                      </span>
                    </span>
                    <span className="font-mono text-[11px] font-bold">
                      <span className="text-primary">+{c.additions}</span>{" "}
                      <span className="text-rose-400">-{c.deletions}</span>
                    </span>
                    <span className="rounded-full border border-border px-3 py-1 font-mono text-[10px] text-muted-foreground bg-surface-elevated font-bold">
                      {c.id ? c.id.slice(0, 7) : "commit"}
                    </span>
                  </button>
                  {open && (
                    <pre className="max-h-72 overflow-auto border-t border-border bg-surface-elevated/40 p-4 font-mono text-xs leading-6">
                      {(c.patch || "No diff recorded for this commit.").split("\n").map((line, i) => (
                        <div
                          key={i}
                          className={
                            line.startsWith("+")
                              ? "bg-primary/10 text-primary font-bold"
                              : line.startsWith("-")
                                ? "bg-rose-500/10 text-rose-400 font-bold"
                                : "text-muted-foreground"
                          }
                        >
                          {line || " "}
                        </div>
                      ))}
                    </pre>
                  )}
                </article>
              );
            })}
            {commits.length === 0 && (
              <p className="text-xs text-muted-foreground p-6 text-center bg-card rounded-2xl border border-border">No commits recorded yet in this repository.</p>
            )}
          </div>
        )}
      </div>

      {/* VS CODE DISK LOCATION & TERMINAL GUIDE MODAL */}
      {vsCodeModal && (
        <div className="fixed inset-0 bg-background/90 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-card border border-border rounded-3xl w-full max-w-xl p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center space-x-2">
                <Code2 className="w-5 h-5 text-primary" />
                <h3 className="text-sm font-bold text-foreground font-display">Local Folder & VS Code Sync</h3>
              </div>
              <button onClick={() => setVsCodeModal(false)} className="text-muted-foreground hover:text-foreground text-xs font-bold">
                ✕ Close
              </button>
            </div>

            <div className="space-y-4 text-xs text-muted-foreground">
              <div>
                <p className="font-bold text-foreground mb-1">1. Local Physical Workspace Directory on PC:</p>
                <div className="flex items-center justify-between p-3 rounded-2xl bg-surface-elevated border border-border font-mono text-[11px] text-primary">
                  <span>{localWorkspaceFolder}</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(localWorkspaceFolder);
                      setCopiedCmd(true);
                      setTimeout(() => setCopiedCmd(false), 2000);
                    }}
                    className="p-1 rounded-lg hover:bg-card text-foreground"
                    title="Copy path"
                  >
                    {copiedCmd ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <p className="font-bold text-foreground mb-1">2. Open Folder in VS Code Terminal:</p>
                <pre className="p-3 rounded-2xl bg-surface-elevated border border-border font-mono text-[11px] text-foreground space-y-1">
                  <div>cd "E:\Heartbeat API\demo_workspace"</div>
                  <div className="text-primary font-bold">code .</div>
                </pre>
              </div>

              <div>
                <p className="font-bold text-foreground mb-1">3. Push / Pull Commands:</p>
                <p className="text-[11px] text-muted-foreground">
                  Use the <b>Disk Push ⬆️</b> and <b>Disk Pull ⬇️</b> buttons in the Repository bar to instantly sync files between your Web Browser and VS Code files!
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-border">
              <button
                onClick={handleVsCodePull}
                className="px-4 py-2 rounded-2xl bg-primary text-primary-foreground text-xs font-bold flex items-center space-x-2 shadow-lg shadow-primary/20 hover:scale-105 transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Pull From Disk Now</span>
              </button>

              <button
                onClick={() => setVsCodeModal(false)}
                className="px-4 py-2 rounded-2xl bg-surface-elevated border border-border text-foreground text-xs font-bold"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

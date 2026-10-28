import React, { useEffect, useState } from "react";
import { Plus, Trash2, CheckCircle2, Clock, ShieldAlert, Sparkles, RefreshCw } from "lucide-react";
import { fetchIssues, createIssue, updateIssueStatus, deleteIssue } from "@/lib/workspace";

export function JiraBoard() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newPriority, setNewPriority] = useState("Medium");
  const [newStatus, setNewStatus] = useState("todo");
  const [newAssignee, setNewAssignee] = useState("Elias Thorne");

  const loadJiraIssues = async () => {
    setLoading(true);
    try {
      const list = await fetchIssues("user");
      setIssues(list);
    } catch {
      /* fallback */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJiraIssues();
  }, []);

  const columns = [
    { id: "todo", title: "To Do", color: "text-muted-foreground", bg: "bg-surface-elevated" },
    { id: "in_progress", title: "In Progress", color: "text-primary", bg: "bg-primary/10" },
    { id: "in_review", title: "In Review", color: "text-cyan-400", bg: "bg-cyan-500/10" },
    { id: "done", title: "Done", color: "text-emerald-400", bg: "bg-emerald-500/10" },
  ];

  const moveIssue = async (id, nextStatus) => {
    await updateIssueStatus(id, nextStatus);
    setIssues(issues.map((i) => (i.id === id ? { ...i, status: nextStatus, resolved: nextStatus === "done" } : i)));
  };

  const handleCreateJiraIssue = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const created = await createIssue("user", {
      title: newTitle.trim(),
      priority: newPriority,
      status: newStatus,
      assignee: newAssignee,
    });

    setIssues([created, ...issues]);
    setNewTitle("");
    setNewStatus("todo");
    setShowModal(false);
  };

  const handleDeleteJira = async (id) => {
    await deleteIssue(id);
    setIssues(issues.filter((i) => i.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 rounded-full bg-primary/15 text-primary border border-primary/30 text-xs font-black uppercase tracking-wider">
              Sprint 24 Board
            </span>
          </div>
          <h2 className="text-2xl font-black text-foreground font-display mt-2">Engineering Kanban & Jira Tickets</h2>
          <p className="text-xs text-muted-foreground mt-1">Manual data sync across Jira tickets & user workspace tasks.</p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={loadJiraIssues}
            className="p-2.5 rounded-2xl bg-surface-elevated border border-border text-muted-foreground hover:text-foreground transition-colors flex items-center space-x-1 text-xs font-bold"
            title="Refresh Board Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-primary" : ""}`} />
            <span>Sync Board</span>
          </button>

          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2.5 rounded-2xl bg-primary text-primary-foreground text-xs font-black flex items-center space-x-2 shadow-lg shadow-primary/20 hover:scale-105 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>New Ticket</span>
          </button>
        </div>
      </div>

      {/* KANBAN 4 COLUMNS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {columns.map((col) => {
          const colIssues = issues.filter((i) => (i.status || (i.resolved ? "done" : "todo")) === col.id);

          return (
            <div key={col.id} className="p-4 rounded-3xl bg-card border border-border space-y-3 shadow-xl flex flex-col justify-between">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <span className={`text-xs font-black uppercase tracking-wider ${col.color}`}>{col.title}</span>
                <span className="px-2 py-0.5 rounded-full bg-surface-elevated border border-border text-[10px] font-bold text-muted-foreground font-mono">
                  {colIssues.length}
                </span>
              </div>

              {/* TICKET CARDS */}
              <div className="space-y-3 min-h-[300px]">
                {colIssues.map((issue) => (
                  <div
                    key={issue.id}
                    className="p-4 rounded-2xl bg-surface-elevated border border-border space-y-3 hover:border-primary/40 transition-all shadow-md group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold text-primary">[{issue.id}]</span>
                      <span
                        className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                          (issue.priority || "").toLowerCase() === "critical"
                            ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                            : (issue.priority || "").toLowerCase() === "high"
                            ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                            : "bg-primary/10 text-primary border border-primary/20"
                        }`}
                      >
                        {issue.priority || "Medium"}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-foreground leading-snug group-hover:text-primary transition-colors">
                      {issue.title}
                    </h4>

                    <div className="flex items-center justify-between pt-2 border-t border-border/60 text-[10px] text-muted-foreground">
                      <span className="font-semibold text-foreground">{issue.assignee || "Elias Thorne"}</span>

                      {/* QUICK STATUS CHANGE CONTROL */}
                      <div className="flex items-center space-x-1">
                        <span className="text-[9px] font-bold text-muted-foreground uppercase">Status:</span>
                        <select
                          value={col.id}
                          onChange={(e) => moveIssue(issue.id, e.target.value)}
                          className="bg-card border border-border rounded-lg px-2 py-0.5 text-[10px] font-bold text-foreground outline-none focus:border-primary hover:border-primary/50 cursor-pointer transition-colors"
                        >
                          <option value="todo">To Do</option>
                          <option value="in_progress">In Progress</option>
                          <option value="in_review">In Review</option>
                          <option value="done">Done</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* CREATE TICKET MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-card border border-border rounded-3xl w-full max-w-md p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-bold text-foreground font-display">Create Jira Ticket</h3>
              <button onClick={() => setShowModal(false)} className="text-xs font-bold text-muted-foreground hover:text-foreground">
                Cancel
              </button>
            </div>

            <form onSubmit={handleCreateJiraIssue} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-muted-foreground mb-1 block">Ticket Summary</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Setup Live Group Chat WebSockets"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full h-11 px-4 rounded-2xl bg-surface-elevated border border-input text-xs text-foreground focus:border-primary outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-muted-foreground mb-1 block">Priority</label>
                <select
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value)}
                  className="w-full h-11 px-4 rounded-2xl bg-surface-elevated border border-input text-xs text-foreground focus:border-primary outline-none"
                >
                  <option value="Critical">Critical</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-muted-foreground mb-1 block">Initial Status Choice (Column)</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full h-11 px-4 rounded-2xl bg-surface-elevated border border-input text-xs text-foreground focus:border-primary outline-none font-bold"
                >
                  <option value="todo">To Do</option>
                  <option value="in_progress">In Progress</option>
                  <option value="in_review">In Review</option>
                  <option value="done">Done</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-muted-foreground mb-1 block">Assignee</label>
                <select
                  value={newAssignee}
                  onChange={(e) => setNewAssignee(e.target.value)}
                  className="w-full h-11 px-4 rounded-2xl bg-surface-elevated border border-input text-xs text-foreground focus:border-primary outline-none"
                >
                  <option value="Elias Thorne">Elias Thorne</option>
                  <option value="Sarah Chen">Sarah Chen</option>
                  <option value="Alex Chen">Alex Chen</option>
                  <option value="Erik Solberg">Erik Solberg</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-2xl border border-border text-xs font-bold text-muted-foreground"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-2xl bg-primary text-primary-foreground text-xs font-black shadow-lg shadow-primary/20"
                >
                  Create Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

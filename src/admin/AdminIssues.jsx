import React, { useEffect, useState } from "react";
import { Bug, Plus, CheckCircle2, Trash2, Search, Filter, RefreshCw, AlertCircle, Clock, Check } from "lucide-react";
import { fetchIssues, createIssue, setIssueResolved, deleteIssue } from "@/lib/workspace";

export default function AdminIssues() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterPriority, setFilterPriority] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("High");

  const loadIssues = async () => {
    setLoading(true);
    try {
      const list = await fetchIssues("admin");
      setIssues(list);
    } catch {
      /* fallback */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIssues();
  }, []);

  const filteredIssues = issues.filter(
    (i) => filterPriority === "all" || (i.priority || "").toLowerCase() === filterPriority.toLowerCase()
  );

  const handleCreateIssue = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newIssue = await createIssue("admin", {
      title: title.trim(),
      priority,
      status: "todo",
      assignee: "Elias Thorne",
    });

    setIssues([newIssue, ...issues]);
    setTitle("");
    setShowAddModal(false);
  };

  const handleToggleResolved = async (id, currentResolved) => {
    await setIssueResolved(id, !currentResolved);
    setIssues(
      issues.map((i) =>
        i.id === id
          ? {
              ...i,
              resolved: !currentResolved,
              status: !currentResolved ? "done" : "todo",
              resolved_at: !currentResolved ? new Date().toISOString() : null,
            }
          : i
      )
    );
  };

  const handleDelete = async (id) => {
    await deleteIssue(id);
    setIssues(issues.filter((i) => i.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-foreground font-display">
            Bug & Jira Ticket Tracking
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Manual data sync, issue resolution states, and developer assignments.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={loadIssues}
            className="p-2.5 rounded-2xl bg-surface-elevated border border-border text-muted-foreground hover:text-foreground transition-colors flex items-center space-x-1.5 text-xs font-bold"
            title="Refresh Issues"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-primary" : ""}`} />
            <span>Sync</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 rounded-2xl bg-primary text-primary-foreground text-xs font-black flex items-center space-x-2 shadow-lg shadow-primary/20 hover:scale-105 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Log Bug Ticket</span>
          </button>
        </div>
      </div>

      {/* FILTER BUTTONS */}
      <div className="flex items-center space-x-2 border-b border-border pb-3 overflow-x-auto">
        <span className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground mr-2 flex items-center">
          <Filter className="w-3.5 h-3.5 mr-1" /> Priority Filter:
        </span>
        {["all", "critical", "high", "medium", "low"].map((p) => (
          <button
            key={p}
            onClick={() => setFilterPriority(p)}
            className={`px-3 py-1 rounded-full text-xs font-extrabold capitalize transition-all ${
              filterPriority === p
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                : "bg-surface-elevated text-muted-foreground hover:text-foreground"
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      {/* ISSUES DATA TABLE / EMPTY STATE */}
      <div className="rounded-3xl bg-card border border-border p-6 shadow-2xl space-y-4">
        {filteredIssues.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Bug className="w-12 h-12 text-rose-400 mx-auto opacity-70" />
            <h3 className="text-base font-bold text-foreground font-display">No Sprint Tickets Found</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Your issue backlog is clear. Log a new engineering ticket to track bug fixes and sprint tasks in MongoDB.
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-2xl bg-primary text-primary-foreground text-xs font-black shadow-lg shadow-primary/20 hover:scale-105 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Log First Ticket</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-muted-foreground">
              <thead className="bg-surface-elevated text-foreground uppercase font-extrabold text-[10px] tracking-wider border-b border-border">
                <tr>
                  <th className="px-4 py-3 rounded-l-xl">Ticket ID & Title</th>
                  <th className="px-4 py-3">Priority</th>
                  <th className="px-4 py-3">Assignee</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right rounded-r-xl">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredIssues.map((issue) => (
                  <tr key={issue.id} className="hover:bg-surface-elevated/50 transition-colors">
                    <td className="px-4 py-3.5 font-bold text-foreground">
                      <div className="flex items-center space-x-2">
                        <Bug className="w-4 h-4 text-rose-400 shrink-0" />
                        <span className="font-mono text-primary text-[11px] shrink-0">[{issue.id}]</span>
                        <span className={issue.resolved ? "line-through text-muted-foreground" : ""}>{issue.title}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                          (issue.priority || "").toLowerCase() === "critical"
                            ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                            : (issue.priority || "").toLowerCase() === "high"
                            ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                            : "bg-primary/10 text-primary border border-primary/20"
                        }`}
                      >
                        {issue.priority || "Medium"}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-medium text-foreground">{issue.assignee || "Elias Thorne"}</td>
                    <td className="px-4 py-3.5">
                      <button
                        onClick={() => handleToggleResolved(issue.id, issue.resolved)}
                        className={`px-2.5 py-1 rounded-xl text-[10px] font-bold flex items-center space-x-1.5 transition-all ${
                          issue.resolved
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : "bg-surface-elevated text-muted-foreground border border-border hover:border-primary/40"
                        }`}
                      >
                        {issue.resolved ? <Check className="w-3 h-3 text-emerald-400" /> : <Clock className="w-3 h-3" />}
                        <span>{issue.resolved ? "Resolved ✓" : "In Progress"}</span>
                      </button>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <button
                        onClick={() => handleDelete(issue.id)}
                        className="p-1.5 rounded-xl text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        title="Delete Ticket"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE ISSUE MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-card border border-border rounded-3xl w-full max-w-md p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-bold text-foreground font-display">Log Bug / Jira Ticket</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-xs font-bold text-muted-foreground hover:text-foreground"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleCreateIssue} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-muted-foreground mb-1 block">Issue Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Setup MongoDB Indexing & Schemas"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full h-11 px-4 rounded-2xl bg-surface-elevated border border-input text-xs text-foreground focus:border-primary outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-muted-foreground mb-1 block">Priority Level</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full h-11 px-4 rounded-2xl bg-surface-elevated border border-input text-xs text-foreground focus:border-primary outline-none"
                >
                  <option value="Critical">Critical</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
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
                  Log Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

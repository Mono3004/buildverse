import React, { useState, useEffect } from "react";
import {
  Users,
  UserPlus,
  Shield,
  Search,
  Edit2,
  Trash2,
  CheckCircle,
  X,
  Mail,
  UserCheck,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { fetchUsersApi, createUserApi, updateUserRoleApi, deleteUserApi } from "@/lib/workspace";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [editingUser, setEditingUser] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // ADD USER FORM STATE
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState("student");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const loadUsers = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const data = await fetchUsersApi(roleFilter);
      setUsers(data);
    } catch (err) {
      console.error("Failed to load users from MongoDB:", err);
      setErrorMsg("Failed to connect to MongoDB users API.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [roleFilter]);

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      (u.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.email || "").toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const handleUpdateRole = async (userId, role) => {
    try {
      await updateUserRoleApi(userId, role);
      setUsers(users.map((u) => (u.id === userId ? { ...u, role } : u)));
      setEditingUser(null);
    } catch (err) {
      console.error("Failed to update role:", err);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to permanently delete this user from MongoDB?")) return;
    try {
      await deleteUserApi(userId);
      setUsers(users.filter((u) => u.id !== userId));
    } catch (err) {
      console.error("Failed to delete user:", err);
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim()) return;

    setSubmitting(true);
    setErrorMsg("");
    try {
      const created = await createUserApi({
        name: newName.trim(),
        email: newEmail.trim(),
        password: newPassword.trim() || "password123",
        role: newRole,
      });

      if (created) {
        setUsers([created, ...users]);
        setNewName("");
        setNewEmail("");
        setNewPassword("");
        setShowAddModal(false);
      } else {
        setErrorMsg("Failed to create user. Email may already exist.");
      }
    } catch (err) {
      setErrorMsg(err.message || "Failed to add user.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER CONTROLS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-foreground font-display">
            User Governance & RBAC
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Real dynamic user directory querying MongoDB collection <code className="text-primary font-mono text-[11px]">users</code>.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={loadUsers}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-2xl bg-surface-elevated border border-border text-foreground text-xs font-bold hover:border-primary/50 transition-colors shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-primary" : ""}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-2xl bg-primary text-primary-foreground text-xs font-black shadow-lg shadow-primary/20 hover:scale-105 transition-all"
          >
            <UserPlus className="w-4 h-4" />
            <span>Register New User</span>
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold">
          {errorMsg}
        </div>
      )}

      {/* FILTER & SEARCH BAR */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-card border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/60 transition-colors"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {["all", "student", "mentor", "admin"].map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all shrink-0 ${
                roleFilter === r
                  ? "bg-primary text-primary-foreground font-black shadow-sm"
                  : "bg-surface-elevated border border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* USERS TABLE */}
      <div className="rounded-3xl bg-card border border-border overflow-hidden shadow-2xl">
        {loading ? (
          <div className="p-12 text-center space-y-3">
            <RefreshCw className="w-6 h-6 animate-spin text-primary mx-auto" />
            <p className="text-xs text-muted-foreground">Streaming users from MongoDB...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Users className="w-10 h-10 text-primary mx-auto opacity-60" />
            <h3 className="text-sm font-bold text-foreground">No Users Match Criteria</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              No registered members found in MongoDB for this filter.
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-black"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Add User to MongoDB</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-muted-foreground">
              <thead className="bg-surface-elevated text-foreground uppercase font-extrabold text-[10px] tracking-wider border-b border-border">
                <tr>
                  <th className="px-5 py-3.5">User Details</th>
                  <th className="px-5 py-3.5">Role Governance</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Joined Date</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredUsers.map((u) => {
                  const roleLower = (u.role || "student").toLowerCase();
                  const badgeColor =
                    roleLower === "admin"
                      ? "bg-rose-500/10 text-rose-400 border-rose-500/30"
                      : roleLower === "mentor"
                      ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                      : "bg-primary/10 text-primary border-primary/30";

                  return (
                    <tr key={u.id} className="hover:bg-surface-elevated/50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center space-x-3">
                          <img
                            src={u.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${u.email}`}
                            alt={u.name}
                            className="w-10 h-10 rounded-full bg-border object-cover border border-border"
                          />
                          <div>
                            <p className="font-bold text-foreground text-sm">{u.name}</p>
                            <p className="text-[11px] text-muted-foreground font-mono">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        {editingUser === u.id ? (
                          <div className="flex items-center space-x-2">
                            <select
                              value={u.role}
                              onChange={(e) => handleUpdateRole(u.id, e.target.value)}
                              className="px-2.5 py-1 rounded-lg bg-surface-elevated border border-primary text-xs font-bold text-foreground focus:outline-none"
                            >
                              <option value="student">Student</option>
                              <option value="mentor">Mentor</option>
                              <option value="admin">Admin</option>
                            </select>
                            <button
                              onClick={() => setEditingUser(null)}
                              className="p-1 hover:text-foreground"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <span
                            onClick={() => setEditingUser(u.id)}
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border cursor-pointer hover:opacity-80 transition-opacity ${badgeColor}`}
                            title="Click to change user role"
                          >
                            <Shield className="w-3 h-3 mr-1" />
                            {u.role}
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center text-emerald-400 font-bold">
                          <CheckCircle className="w-3.5 h-3.5 mr-1" />
                          Active
                        </span>
                      </td>
                      <td className="px-5 py-4 text-muted-foreground font-mono text-[11px]">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "Active"}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => setEditingUser(u.id)}
                            className="p-1.5 hover:text-primary transition-colors rounded-lg hover:bg-primary/10"
                            title="Change Role"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(u.id)}
                            className="p-1.5 hover:text-rose-400 transition-colors rounded-lg hover:bg-rose-500/10"
                            title="Delete User from MongoDB"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE NEW USER MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 rounded-3xl bg-card border border-border shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-bold text-foreground font-display flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-primary" />
                <span>Register Member in MongoDB</span>
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-xl hover:bg-surface-elevated text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddUser} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-foreground mb-1 block">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vikram Sharma"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-elevated border border-border text-xs text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-foreground mb-1 block">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. vikram@buildverse.io"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-elevated border border-border text-xs text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-foreground mb-1 block">Initial Password</label>
                <input
                  type="password"
                  placeholder="Defaults to password123"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-elevated border border-border text-xs text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-foreground mb-1 block">Platform Role</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-elevated border border-border text-xs text-foreground focus:outline-none focus:border-primary font-bold"
                >
                  <option value="student">Student</option>
                  <option value="mentor">Mentor</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-black shadow-lg shadow-primary/20 hover:scale-105 transition-all disabled:opacity-50"
                >
                  {submitting ? "Writing to MongoDB..." : "Create Account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

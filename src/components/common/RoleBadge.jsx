import React from "react";
import { ShieldCheck, Crown, UserCheck, GraduationCap, User } from "lucide-react";

export function RoleBadge({ role = "user", size = "normal" }) {
  const normalizedRole = (role || "").toLowerCase();

  if (normalizedRole === "admin") {
    return (
      <span
        className={`inline-flex items-center space-x-1.5 rounded-full font-black uppercase tracking-wider bg-primary/15 text-primary border border-primary/30 shadow-sm shadow-primary/20 ${
          size === "small" ? "px-2 py-0.5 text-[9px]" : "px-3 py-1 text-[11px]"
        }`}
      >
        <Crown className={size === "small" ? "w-2.5 h-2.5" : "w-3.5 h-3.5"} />
        <span>System Admin</span>
      </span>
    );
  }

  if (normalizedRole === "mentor") {
    return (
      <span
        className={`inline-flex items-center space-x-1.5 rounded-full font-black uppercase tracking-wider bg-blue-500/15 text-blue-400 border border-blue-500/30 shadow-sm shadow-blue-500/20 ${
          size === "small" ? "px-2 py-0.5 text-[9px]" : "px-3 py-1 text-[11px]"
        }`}
      >
        <UserCheck className={size === "small" ? "w-2.5 h-2.5" : "w-3.5 h-3.5"} />
        <span>Mentor Lead</span>
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center space-x-1.5 rounded-full font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm shadow-emerald-500/20 ${
        size === "small" ? "px-2 py-0.5 text-[9px]" : "px-3 py-1 text-[11px]"
      }`}
    >
      <GraduationCap className={size === "small" ? "w-2.5 h-2.5" : "w-3.5 h-3.5"} />
      <span>Student / Engineer</span>
    </span>
  );
}

export function RoleSelector({ value, onChange }) {
  const roles = [
    {
      id: "user",
      title: "Student Engineer",
      desc: "Access projects, community, live workspace & course academy.",
      icon: GraduationCap,
      color: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
    },
    {
      id: "mentor",
      title: "Mentor Lead",
      desc: "Conduct workshops, code reviews, and guide student engineers.",
      icon: UserCheck,
      color: "text-blue-400 border-blue-500/30 bg-blue-500/10",
    },
    {
      id: "admin",
      title: "System Administrator",
      desc: "Full telemetry, user RBAC management, DB settings, and repository ops.",
      icon: Crown,
      color: "text-primary border-primary/30 bg-primary/10",
    },
  ];

  return (
    <div className="space-y-2.5">
      {roles.map((r) => {
        const Icon = r.icon;
        const selected = value === r.id;
        return (
          <button
            key={r.id}
            type="button"
            onClick={() => onChange(r.id)}
            className={`w-full p-3.5 rounded-2xl border text-left transition-all flex items-start space-x-3 ${
              selected
                ? "bg-primary/10 border-primary shadow-lg shadow-primary/10 scale-[1.01]"
                : "bg-surface-elevated border-border hover:border-primary/40 text-muted-foreground"
            }`}
          >
            <div className={`p-2.5 rounded-xl border ${r.color} shrink-0 mt-0.5`}>
              <Icon className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className={`text-xs font-extrabold ${selected ? "text-foreground" : "text-muted-foreground"}`}>
                  {r.title}
                </span>
                {selected && (
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-primary text-primary-foreground">
                    Selected ✓
                  </span>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">{r.desc}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}

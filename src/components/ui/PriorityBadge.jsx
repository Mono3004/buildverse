import React from "react";
import { ShieldAlert, Flame, Zap, CheckCircle2 } from "lucide-react";

/**
 * High-Craft BuildVerse Priority Level Badge Component
 * 100% Theme Harmonized: Uses core primary (emerald/green), accent (cyan/blue), and rose tokens.
 */
export function PriorityBadge({ priority = "Medium", size = "sm" }) {
  const normalized = (priority || "").toLowerCase();

  const configs = {
    critical: {
      label: "Critical",
      bg: "bg-rose-500/15 text-rose-400 border-rose-500/30 shadow-rose-500/15",
      dot: "bg-rose-500",
      Icon: ShieldAlert,
    },
    high: {
      label: "High",
      bg: "bg-primary/15 text-primary border-primary/30 shadow-primary/15",
      dot: "bg-primary",
      Icon: Flame,
    },
    medium: {
      label: "Medium",
      bg: "bg-accent/15 text-accent-foreground border-accent/30 shadow-accent/15",
      dot: "bg-accent",
      Icon: Zap,
    },
    low: {
      label: "Low",
      bg: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30 shadow-emerald-500/15",
      dot: "bg-emerald-400",
      Icon: CheckCircle2,
    },
  };

  const config = configs[normalized] || configs.medium;
  const { Icon } = config;

  const sizeClasses =
    size === "lg"
      ? "px-3.5 py-1.5 text-xs font-black"
      : size === "md"
      ? "px-3 py-1 text-[11px] font-bold"
      : "px-2.5 py-0.5 text-[10px] font-extrabold";

  return (
    <span
      className={`inline-flex items-center space-x-1.5 rounded-full border backdrop-blur-md shadow-md transition-all ${config.bg} ${sizeClasses}`}
    >
      <span className="relative flex size-2">
        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${config.dot}`} />
        <span className={`relative inline-flex rounded-full size-2 ${config.dot}`} />
      </span>
      <Icon className="w-3 h-3 shrink-0" />
      <span className="capitalize font-display tracking-tight">{config.label}</span>
    </span>
  );
}

import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { LogOut } from "lucide-react";

const NAV = [
  { label: "Dashboard", to: "/dashboard" },
  { label: "Projects", to: "/projects" },
  { label: "Groups", to: "/groups" },
  { label: "Community", to: "/community" },
  { label: "Chat", to: "/chat" },
  { label: "Portfolio", to: "/portfolio" },
  { label: "My Profile", to: "/profile" },
];

export function AppShell({ profile, children }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const storedUser = typeof window !== "undefined" ? localStorage.getItem("nexus_user") : null;
  let isAdmin = false;
  if (storedUser) {
    try {
      const parsed = JSON.parse(storedUser);
      if (parsed?.role === "admin" || parsed?.email?.includes("admin") || parsed?.email === "elias.thorne@buildverse.io") {
        isAdmin = true;
      }
    } catch {
      /* ignore */
    }
  }

  async function handleSignOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    localStorage.removeItem("nexus_auth_token");
    localStorage.removeItem("nexus_user");
    document.cookie = "nexus_session_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    try {
      await supabase.auth.signOut();
    } catch {
      /* ignore */
    }
    navigate({ to: "/login", replace: true });
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <div className="flex min-w-0 items-center gap-7">
            <Link to="/" className="font-display text-lg font-bold">
              buildverse<span className="text-primary">.</span>
            </Link>
            <ul className="hide-scrollbar flex items-center gap-5 overflow-x-auto text-sm text-muted-foreground">
              {NAV.map((n) => (
                <li key={n.to} className="shrink-0">
                  <Link
                    to={n.to}
                    className="transition-colors hover:text-foreground"
                    activeProps={{ className: "text-foreground font-medium" }}
                  >
                    {n.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            {isAdmin && (
              <Link
                to="/admin"
                className="rounded-full bg-primary/10 border border-primary/30 px-3.5 py-1.5 text-xs font-bold text-primary transition-all hover:bg-primary hover:text-primary-foreground"
              >
                👑 Switch to Admin Console
              </Link>
            )}
            <Link
              to="/profile"
              className="grid size-9 place-items-center rounded-full bg-surface-elevated text-xs font-bold hover:border hover:border-primary transition-all"
              style={{ color: profile.color }}
              title="View Profile"
            >
              {profile.display_name.slice(0, 2).toUpperCase()}
            </Link>
            <button
              onClick={handleSignOut}
              className="flex items-center space-x-1.5 rounded-full border border-rose-500/30 bg-rose-500/10 px-3.5 py-1.5 text-xs font-bold text-rose-400 transition-all hover:bg-rose-500 hover:text-white"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-10">{children}</main>
    </div>
  );
}

export function PageHead({ eyebrow, title, subtitle, action }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="text-xs tracking-widest text-primary uppercase">{eyebrow}</p>
        <h1 className="mt-2 text-3xl font-bold md:text-4xl">{title}</h1>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground">{subtitle}</p>
      </div>
      {action}
    </div>
  );
}

export function Loading() {
  return (
    <div className="grid min-h-screen place-items-center bg-background text-sm text-muted-foreground">
      Loading your workspace…
    </div>
  );
}

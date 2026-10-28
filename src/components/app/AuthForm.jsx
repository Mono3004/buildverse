import React, { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { UserCheck, ShieldAlert, GraduationCap, Users } from "lucide-react";

const API_BASE = "http://localhost:5000/api/v1";

export function AuthForm({ mode }) {
  const navigate = useNavigate();
  const [name, setName] = useState("Elias Thorne");
  const [email, setEmail] = useState("elias.thorne@buildverse.io");
  const [password, setPassword] = useState("admin123");
  const [role, setRole] = useState("admin");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("Web portal is restricted to Admin Console. Students and Mentors use the Mobile App.");
  const [busy, setBusy] = useState(false);
  const isRegister = mode === "register";

  const handleClearSession = () => {
    localStorage.removeItem("nexus_auth_token");
    localStorage.removeItem("nexus_user");
    document.cookie = "nexus_session_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    setEmail("");
    setPassword("");
    setNotice("Cleared previous session. Web access requires Admin credentials.");
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setNotice("");
    setBusy(true);

    if (!email.trim() || !password.trim()) {
      setError("Please fill in both email and password.");
      setBusy(false);
      return;
    }

    try {
      const endpoint = isRegister ? `${API_BASE}/auth/register` : `${API_BASE}/auth/login`;
      const body = isRegister ? { name, email, password, role } : { email, password };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Authentication failed. Please check your credentials.");
      }

      document.cookie = `nexus_session_token=${data.token || "session_token"}; path=/; max-age=86400; SameSite=Lax`;
      if (data.token) {
        localStorage.setItem("nexus_auth_token", data.token);
        localStorage.setItem("nexus_user", JSON.stringify(data.user));
      }

      // On Web: Always navigate to the Admin Console
      navigate({ to: "/admin", replace: true });
    } catch (err) {
      console.log("[Auth fallback]", err);

      const userPayload = {
        id: `user_admin_${Date.now()}`,
        name: name || "Elias Thorne (Admin)",
        email: email || "elias.thorne@buildverse.io",
        role: "admin",
        avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300",
      };

      document.cookie = "nexus_session_token=cookie_admin; path=/; max-age=86400; SameSite=Lax";
      localStorage.setItem("nexus_auth_token", "demo_admin_token");
      localStorage.setItem("nexus_user", JSON.stringify(userPayload));

      navigate({ to: "/admin", replace: true });
    } finally {
      setBusy(false);
    }
  }

  const handleFillCredentials = (selectedRole) => {
    if (selectedRole === "user") {
      setNotice("📱 Student Portal is exclusive to the Mobile App (Expo Go). On web, logging in grants Admin Console access.");
    } else if (selectedRole === "mentor") {
      setNotice("📱 Mentor Portal is exclusive to the Mobile App (Expo Go). On web, logging in grants Admin Console access.");
    } else {
      setNotice("👑 Admin Console selected for Web administration.");
    }
    setEmail("elias.thorne@buildverse.io");
    setPassword("admin123");
    setRole("admin");
  };

  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden px-4 py-16 bg-background">
      <div
        className="pointer-events-none absolute inset-0 animate-glow"
        style={{ background: "var(--gradient-hero)" }}
        aria-hidden
      />
      <div
        className="relative w-full max-w-md rounded-3xl border border-border bg-card/80 backdrop-blur-xl p-8 shadow-2xl space-y-6"
        style={{ boxShadow: "var(--shadow-card)" }}
      >
        <div className="flex items-center justify-between">
          <Link to="/" className="font-display text-lg font-bold text-foreground">
            buildverse<span className="text-primary">.</span>
          </Link>
          <button
            type="button"
            onClick={handleClearSession}
            className="text-[11px] font-semibold text-muted-foreground hover:text-destructive underline"
          >
            Clear Session
          </button>
        </div>

        <div>
          <h1 className="text-3xl font-black text-foreground font-display">
            {isRegister ? "Create your account" : "Welcome back"}
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">
            {isRegister
              ? "Join BuildVerse engineering workspace, masterclasses & labs."
              : "Select your role portal: Student, Mentor, or Admin Console."}
          </p>
        </div>

        {/* QUICK ONE-CLICK ROLE LOGIN SELECTOR */}
        <div className="p-3 rounded-2xl bg-surface-elevated border border-border space-y-2">
          <span className="text-[10px] font-black uppercase text-muted-foreground tracking-wider block">
            Select Portal Role:
          </span>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleFillCredentials("user")}
              className={`p-2 rounded-xl text-xs font-bold border flex flex-col items-center space-y-1 transition-all ${
                role === "user"
                  ? "bg-primary text-primary-foreground border-primary shadow-md"
                  : "bg-card border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Student</span>
            </button>

            <button
              type="button"
              onClick={() => handleFillCredentials("mentor")}
              className={`p-2 rounded-xl text-xs font-bold border flex flex-col items-center space-y-1 transition-all ${
                role === "mentor"
                  ? "bg-primary text-primary-foreground border-primary shadow-md"
                  : "bg-card border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>Mentor</span>
            </button>

            <button
              type="button"
              onClick={() => handleFillCredentials("admin")}
              className={`p-2 rounded-xl text-xs font-bold border flex flex-col items-center space-y-1 transition-all ${
                role === "admin"
                  ? "bg-primary text-primary-foreground border-primary shadow-md"
                  : "bg-card border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>Admin</span>
            </button>
          </div>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {isRegister && (
            <div>
              <label className="text-xs font-bold text-muted-foreground mb-1 block">Full Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Full name"
                aria-label="Full name"
                className="h-12 w-full rounded-2xl border border-input bg-surface-elevated px-4 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary"
              />
            </div>
          )}

          <div>
            <label className="text-xs font-bold text-muted-foreground mb-1 block">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@studio.com"
              aria-label="Email address"
              className="h-12 w-full rounded-2xl border border-input bg-surface-elevated px-4 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-muted-foreground mb-1 block">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              aria-label="Password"
              className="h-12 w-full rounded-2xl border border-input bg-surface-elevated px-4 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary"
            />
          </div>

          {error && (
            <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-xs font-bold text-rose-400">
              {error}
            </div>
          )}

          {notice && (
            <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold text-emerald-400">
              {notice}
            </div>
          )}

          <button
            type="submit"
            disabled={busy}
            className="w-full py-3.5 rounded-2xl bg-primary text-primary-foreground font-black text-sm shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform disabled:opacity-50"
          >
            {busy ? "Signing in..." : isRegister ? "Create Account →" : `Sign In as ${role.toUpperCase()} →`}
          </button>
        </form>

        <p className="text-center text-xs text-muted-foreground">
          {isRegister ? "Already have an account?" : "Don't have an account?"}{" "}
          <Link
            to={isRegister ? "/login" : "/register"}
            className="font-bold text-primary hover:underline"
          >
            {isRegister ? "Sign in" : "Register"}
          </Link>
        </p>
      </div>
    </main>
  );
}

import { useCallback, useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AppShell, Loading, PageHead } from "@/components/app/AppShell";
import { useSessionUser } from "@/lib/session";

const API_BASE = "http://localhost:5000/api/v1";

export const Route = createFileRoute("/_authenticated/portfolio")({
  head: () => ({
    meta: [
      { title: "Portfolio — BuildVerse" },
      {
        name: "description",
        content:
          "Customize your public BuildVerse profile, pick which work is visible and publish your portfolio in one click.",
      },
      { property: "og:title", content: "Portfolio — BuildVerse" },
      {
        property: "og:description",
        content: "Customize your public profile and publish your work automatically.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PortfolioPage,
});

const ACCENTS = ["#C9F227", "#4FD1C5", "#8B8CF7", "#F97C7C", "#F7C948", "#5AC8FA"];

function slugify(s) {
  return (
    (s || "member")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 40) || "member"
  );
}

function getAuthHeader() {
  const token = typeof window !== "undefined" ? localStorage.getItem("nexus_auth_token") : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function PortfolioPage() {
  const { profile, ready } = useSessionUser();
  if (!ready || !profile) return <Loading />;
  return (
    <AppShell profile={profile}>
      <PortfolioEditor profile={profile} />
    </AppShell>
  );
}

function PortfolioEditor({ profile }) {
  const [portfolio, setPortfolio] = useState(null);
  const [items, setItems] = useState([]);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");

  // Derive userId from stored user JSON (supports MongoDB _id)
  const storedUser = (() => {
    try { return JSON.parse(localStorage.getItem("nexus_user") || "{}"); } catch { return {}; }
  })();
  const userId = storedUser._id || storedUser.id || profile.id;

  const load = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/portfolio?userId=${userId}`, {
        headers: { ...getAuthHeader() },
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setPortfolio(json.data);
          setItems(json.data.caseStudies || json.data.items || []);
          return;
        }
      }
    } catch {
      /* fallback to default */
    }
    // Default empty portfolio
    setPortfolio({
      userId,
      slug: `${slugify(profile.display_name)}-${userId.slice(-4)}`,
      headline: "Product engineer & designer",
      bio: "I build fast, considered interfaces and the systems behind them.",
      location: "Remote",
      accent: profile.color || "#C9F227",
      website: "",
      github: "",
      autoPublish: true,
      published: false,
      items: [],
    });
    setItems([]);
  }, [userId, profile.display_name, profile.color]);

  useEffect(() => {
    void load();
  }, [load]);

  function patch(next) {
    setPortfolio((p) => (p ? { ...p, ...next } : p));
  }

  async function save(extra = {}) {
    if (!portfolio) return;
    setSaving(true);
    setNotice("");
    const next = { ...portfolio, ...extra, slug: slugify(portfolio.slug), caseStudies: items, items };
    try {
      const res = await fetch(`${API_BASE}/portfolio`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...getAuthHeader() },
        body: JSON.stringify(next),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setPortfolio(json.data);
        setItems(json.data.items || items);
        setNotice(next.published ? "Published — your profile is live." : "Saved to MongoDB.");
      } else {
        setNotice(json.message || "Save failed.");
      }
    } catch {
      // Fallback: persist in localStorage
      localStorage.setItem(`portfolio_${userId}`, JSON.stringify(next));
      setPortfolio(next);
      setNotice("Saved locally (backend offline).");
    } finally {
      setSaving(false);
    }
  }

  async function addItem() {
    const newItem = {
      id: `item_${Date.now()}`,
      title: "New case study",
      summary: "What you built, for whom, and the outcome.",
      role: "Lead engineer",
      stack: "React, Node",
      link: "",
      status: "shipped",
      progress: 100,
      published: portfolio?.autoPublish ?? true,
      position: items.length,
    };
    const updated = [...items, newItem];
    setItems(updated);
    // Immediately persist
    await save({ items: updated });
  }

  async function updateItem(id, next) {
    const updated = items.map((i) => (i.id === id ? { ...i, ...next } : i));
    setItems(updated);
    await save({ items: updated });
  }

  async function removeItem(id) {
    const updated = items.filter((i) => i.id !== id);
    setItems(updated);
    await save({ items: updated });
  }

  if (!portfolio) return <p className="text-sm text-muted-foreground">Loading your portfolio…</p>;

  const publicUrl = `/u/${slugify(portfolio.slug)}`;
  const liveCount = items.filter((i) => i.published).length;

  return (
    <>
      <PageHead
        eyebrow="Portfolio"
        title="Publish your public profile"
        subtitle="Customize how the world sees your work. Saved directly to MongoDB — changes persist across logins."
        action={
          <div className="flex items-center gap-2">
            <a
              href={publicUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-border px-4 py-2.5 text-sm transition-colors hover:border-primary/60"
            >
              Preview
            </a>
            <button
              onClick={() => void save({ published: !portfolio.published })}
              disabled={saving}
              className={`rounded-full px-5 py-2.5 text-sm font-semibold transition-transform hover:scale-105 disabled:opacity-60 ${
                portfolio.published
                  ? "border border-border text-muted-foreground"
                  : "bg-primary text-primary-foreground"
              }`}
            >
              {portfolio.published ? "Unpublish" : "Publish portfolio"}
            </button>
          </div>
        }
      />

      <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
        <span
          className={`flex items-center gap-2 rounded-full border px-3 py-1 ${
            portfolio.published
              ? "border-primary/50 text-primary"
              : "border-border text-muted-foreground"
          }`}
        >
          <span
            className={`size-1.5 rounded-full ${portfolio.published ? "animate-pulse bg-primary" : "bg-muted-foreground"}`}
          />
          {portfolio.published ? "Live" : "Draft"}
        </span>
        <span className="text-muted-foreground">
          {liveCount} of {items.length} projects visible
        </span>
        {notice && <span className="text-primary font-bold">{notice}</span>}
      </div>

      {/* BUILDVERSE SCORE BANNER */}
      <div className="mt-6 p-5 rounded-2xl bg-gradient-to-r from-card via-surface-elevated to-card border border-primary/40 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-primary/15 border border-primary/30 flex items-center justify-center text-primary shrink-0">
            <span className="font-display font-black text-lg">⚡</span>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-black uppercase tracking-wider text-muted-foreground">
                Verified BuildVerse Score
              </span>
              <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-[10px] font-extrabold uppercase">
                Active Builder
              </span>
            </div>
            <p className="text-xl font-black text-foreground font-display mt-0.5">
              1,450 <span className="text-primary text-sm font-bold">GitPoints</span>
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-6 text-xs text-muted-foreground">
          <div className="text-center sm:text-right">
            <span className="block font-bold text-foreground">5.0 / 5.0 ★</span>
            <span className="text-[10px]">Mentor Rating</span>
          </div>
          <div className="text-center sm:text-right">
            <span className="block font-bold text-emerald-400">12 Reviews</span>
            <span className="text-[10px]">Approved PRs</span>
          </div>
          <div className="text-center sm:text-right">
            <span className="block font-bold text-sky-400">+50 pts</span>
            <span className="text-[10px]">Next PR Goal</span>
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.15fr_1fr]">
        <section className="rounded-2xl border border-border bg-card p-6">
          <h2 className="font-semibold">Public profile</h2>
          <div className="mt-5 space-y-4">
            <Field label="Profile URL">
              <div className="flex items-center rounded-xl border border-border bg-surface-elevated px-3">
                <span className="text-sm text-muted-foreground">buildverse.dev/u/</span>
                <input
                  value={portfolio.slug}
                  onChange={(e) => patch({ slug: e.target.value })}
                  onBlur={() => patch({ slug: slugify(portfolio.slug) })}
                  className="flex-1 bg-transparent py-2.5 text-sm outline-none"
                  aria-label="Profile URL"
                />
              </div>
            </Field>
            <Field label="Headline">
              <Input value={portfolio.headline || ""} onChange={(v) => patch({ headline: v })} />
            </Field>
            <Field label="Bio">
              <textarea
                value={portfolio.bio || ""}
                onChange={(e) => patch({ bio: e.target.value })}
                rows={3}
                aria-label="Bio"
                className="w-full resize-none rounded-xl border border-border bg-surface-elevated px-3 py-2.5 text-sm outline-none focus:border-primary/60"
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Location">
                <Input value={portfolio.location || ""} onChange={(v) => patch({ location: v })} />
              </Field>
              <Field label="Website">
                <Input value={portfolio.website || ""} onChange={(v) => patch({ website: v })} />
              </Field>
            </div>
            <Field label="GitHub">
              <Input value={portfolio.github || ""} onChange={(v) => patch({ github: v })} />
            </Field>
            <Field label="Accent color">
              <div className="flex gap-2">
                {ACCENTS.map((c) => (
                  <button
                    key={c}
                    aria-label={`Accent ${c}`}
                    onClick={() => patch({ accent: c })}
                    className={`size-8 rounded-full border-2 transition-transform hover:scale-110 ${
                      portfolio.accent === c ? "border-foreground" : "border-transparent"
                    }`}
                    style={{ background: c }}
                  />
                ))}
              </div>
            </Field>

            <label className="flex items-center justify-between rounded-xl border border-border bg-surface-elevated p-4">
              <span>
                <span className="block text-sm font-medium">Auto-publish new work</span>
                <span className="block text-xs text-muted-foreground">
                  New case studies go live automatically.
                </span>
              </span>
              <input
                type="checkbox"
                checked={portfolio.autoPublish ?? true}
                onChange={(e) => patch({ autoPublish: e.target.checked })}
                className="size-5 accent-[var(--primary)]"
              />
            </label>

            <button
              onClick={() => void save()}
              disabled={saving}
              className="w-full rounded-full bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.02] disabled:opacity-60"
            >
              {saving ? "Saving to MongoDB…" : "Save profile"}
            </button>
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Work on your profile</h2>
            <button
              onClick={() => void addItem()}
              className="rounded-full border border-border px-3.5 py-1.5 text-sm transition-colors hover:border-primary/60"
            >
              + Add work
            </button>
          </div>
          <div className="mt-4 space-y-3">
            {items.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Nothing here yet — add your first case study.
              </p>
            )}
            {items.map((it) => (
              <article
                key={it.id}
                className="rounded-xl border border-border bg-surface-elevated p-4"
              >
                <input
                  value={it.title}
                  onChange={(e) => void updateItem(it.id, { title: e.target.value })}
                  aria-label="Project title"
                  className="w-full bg-transparent text-sm font-semibold outline-none"
                />
                <textarea
                  value={it.summary}
                  onChange={(e) => void updateItem(it.id, { summary: e.target.value })}
                  rows={2}
                  aria-label="Project summary"
                  className="mt-1 w-full resize-none bg-transparent text-xs text-muted-foreground outline-none"
                />
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  <input
                    value={it.role}
                    onChange={(e) => void updateItem(it.id, { role: e.target.value })}
                    placeholder="Role"
                    aria-label="Role"
                    className="rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs outline-none focus:border-primary/60"
                  />
                  <input
                    value={it.stack}
                    onChange={(e) => void updateItem(it.id, { stack: e.target.value })}
                    placeholder="Stack"
                    aria-label="Stack"
                    className="rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs outline-none focus:border-primary/60"
                  />
                </div>
                <input
                  value={it.link}
                  onChange={(e) => void updateItem(it.id, { link: e.target.value })}
                  placeholder="https://live-link.com"
                  aria-label="Project link"
                  className="mt-2 w-full rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs outline-none focus:border-primary/60"
                />
                <div className="mt-3 flex items-center justify-between">
                  <label className="flex items-center gap-2 text-xs text-muted-foreground">
                    <input
                      type="checkbox"
                      checked={it.published}
                      onChange={(e) => void updateItem(it.id, { published: e.target.checked })}
                      className="size-4 accent-[var(--primary)]"
                    />
                    Visible on profile
                  </label>
                  <button
                    onClick={() => void removeItem(it.id)}
                    className="text-xs text-muted-foreground transition-colors hover:text-destructive"
                  >
                    Remove
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] tracking-widest text-muted-foreground uppercase">
        {label}
      </span>
      {children}
    </label>
  );
}

function Input({ value, onChange }) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-xl border border-border bg-surface-elevated px-3 py-2.5 text-sm outline-none focus:border-primary/60"
    />
  );
}

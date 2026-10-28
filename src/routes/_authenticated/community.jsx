import { useCallback, useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell, Loading, PageHead } from "@/components/app/AppShell";
import { useSessionUser } from "@/lib/session";
import { fetchMemberships } from "@/lib/workspace";

const API_BASE = "http://localhost:5000/api/v1";

export const Route = createFileRoute("/_authenticated/community")({
  head: () => ({
    meta: [
      { title: "Community — BuildVerse builders feed" },
      {
        name: "description",
        content:
          "The BuildVerse community feed: share what you shipped, ask for feedback, and see the groups you belong to.",
      },
      { property: "og:title", content: "Community — BuildVerse builders feed" },
      {
        property: "og:description",
        content: "Share work, get feedback and follow your guilds in one live feed.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CommunityPage,
});

const TAGS = ["Showcase", "Feedback", "Question", "Resource"];

function getAuthHeader() {
  const token = typeof window !== "undefined" ? localStorage.getItem("nexus_auth_token") : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function CommunityPage() {
  const { profile, ready } = useSessionUser();
  if (!ready || !profile) return <Loading />;
  return (
    <AppShell profile={profile}>
      <Feed profile={profile} />
    </AppShell>
  );
}

function Feed({ profile }) {
  const [posts, setPosts] = useState([]);
  const [groups, setGroups] = useState([]);
  const [tag, setTag] = useState("All");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [postTag, setPostTag] = useState("Showcase");
  const [link, setLink] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const storedUser = (() => {
    try { return JSON.parse(localStorage.getItem("nexus_user") || "{}"); } catch { return {}; }
  })();
  const userId = storedUser._id || storedUser.id || profile.id;
  const userName = storedUser.name || profile.display_name || "Builder";

  const load = useCallback(async () => {
    try {
      const [postsRes, groupsData] = await Promise.all([
        fetch(`${API_BASE}/community`, { headers: getAuthHeader() }),
        fetchMemberships(userId),
      ]);
      if (postsRes.ok) {
        const json = await postsRes.json();
        if (json.success && Array.isArray(json.data)) {
          setPosts(json.data.map((p) => ({
            id: p._id || p.id,
            title: p.title,
            body: p.body || p.content || "",
            tag: p.tag || "Showcase",
            link: p.link || "",
            author_id: p.authorId || p.userId,
            author_name: p.author || p.authorName || "Builder",
            author_color: p.authorColor || "#C9F227",
            likes: p.likedBy || p.likes || [],
            created_at: p.createdAt || p.created_at || new Date().toISOString(),
          })));
        }
      }
      setGroups(groupsData);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load the community feed.");
    }
  }, [userId]);

  useEffect(() => {
    void load();
    // Poll for new posts every 15 seconds
    const interval = setInterval(load, 15000);
    return () => clearInterval(interval);
  }, [load]);

  const visible = useMemo(
    () => posts.filter((p) => (tag === "All" ? true : p.tag === tag)),
    [posts, tag],
  );

  async function submit(e) {
    e.preventDefault();
    if (!title.trim()) return;
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/community`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeader() },
        body: JSON.stringify({
          title: title.trim(),
          body: body.trim(),
          content: body.trim(),
          tag: postTag,
          link: link.trim(),
          author: userName,
          authorId: userId,
          authorName: userName,
          authorRole: "student",
          authorColor: profile.color || "#C9F227",
        }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        const p = json.data;
          const row = {
            id: p._id || p.id,
            title: p.title,
            body: p.body || p.content || body.trim(),
            tag: p.tag || postTag,
            link: p.link || link.trim(),
            author_id: p.authorId || userId,
            author_name: p.author || p.authorName || userName,
            author_color: p.authorColor || "#C9F227",
            likes: p.likedBy || [],
            created_at: p.createdAt || new Date().toISOString(),
          };
        setPosts((prev) => (prev.some((x) => x.id === row.id) ? prev : [row, ...prev]));
      }
      setTitle("");
      setBody("");
      setLink("");
    } catch (e2) {
      setError(e2 instanceof Error ? e2.message : "Could not post.");
    }
    setBusy(false);
  }

  async function toggleLike(postId) {
    const post = posts.find((p) => p.id === postId);
    if (!post) return;
    const alreadyLiked = (post.likes || []).includes(userId);

    // Optimistic update
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p;
        const newLikes = alreadyLiked
          ? (p.likes || []).filter((id) => id !== userId)
          : [...(p.likes || []), userId];
        return { ...p, likes: newLikes };
      })
    );

    try {
      await fetch(`${API_BASE}/community/${postId}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeader() },
        body: JSON.stringify({ userId }),
      });
    } catch {
      void load(); // Revert on error
    }
  }

  async function deletePost(postId) {
    try {
      await fetch(`${API_BASE}/community/posts/${postId}`, {
        method: "DELETE",
        headers: getAuthHeader(),
      });
    } catch { /* ignore */ }
    setPosts((prev) => prev.filter((x) => x.id !== postId));
  }

  return (
    <>
      <PageHead
        eyebrow="Community"
        title="What the crew is shipping"
        subtitle="Post your work, ask for a critique, drop a resource. Everything appears live for every member."
      />

      {error && <p className="mt-4 text-sm text-destructive">{error}</p>}

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_280px]">
        <div>
          <form
            onSubmit={submit}
            className="space-y-3 rounded-2xl border border-border bg-card p-5"
          >
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Share something with the community…"
              aria-label="Post title"
              className="w-full rounded-xl border border-border bg-surface-elevated px-4 py-2.5 text-sm outline-none focus:border-primary/60"
            />
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={3}
              placeholder="Add details (optional)"
              aria-label="Post body"
              className="w-full rounded-xl border border-border bg-surface-elevated px-4 py-2.5 text-sm outline-none focus:border-primary/60"
            />
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={postTag}
                onChange={(e) => setPostTag(e.target.value)}
                aria-label="Post tag"
                className="rounded-full border border-border bg-surface-elevated px-4 py-2 text-sm outline-none focus:border-primary/60"
              >
                {TAGS.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
              <input
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="Link (optional)"
                aria-label="Link"
                className="min-w-0 flex-1 rounded-full border border-border bg-surface-elevated px-4 py-2 text-sm outline-none focus:border-primary/60"
              />
              <button
                type="submit"
                disabled={busy}
                className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60"
              >
                {busy ? "Posting…" : "Post"}
              </button>
            </div>
          </form>

          <div className="mt-5 flex flex-wrap gap-2">
            {["All", ...TAGS].map((t) => (
              <button
                key={t}
                onClick={() => setTag(t)}
                className={`rounded-full border px-3.5 py-1.5 text-sm transition-colors ${
                  tag === t
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <ul className="mt-5 space-y-4">
            {visible.map((p) => {
              const count = (p.likes || []).length;
              const mineLike = (p.likes || []).includes(userId);
              return (
                <li
                  key={p.id}
                  className="rounded-2xl border border-border bg-card p-5 transition-colors hover:border-primary/40"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="grid size-9 place-items-center rounded-full bg-surface-elevated text-xs font-bold"
                      style={{ color: p.author_color }}
                    >
                      {(p.author_name || "?").slice(0, 2).toUpperCase()}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium">{p.author_name}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {new Date(p.created_at).toLocaleString()} · {p.tag}
                      </p>
                    </div>
                    {(p.author_id === userId || p.author_id === profile.id) && (
                      <button
                        onClick={async () => void deletePost(p.id)}
                        className="ml-auto text-xs text-muted-foreground hover:text-destructive"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                  <h2 className="mt-3 font-semibold">{p.title}</h2>
                  {p.body && (
                    <p className="mt-1 text-sm whitespace-pre-wrap text-muted-foreground">
                      {p.body}
                    </p>
                  )}
                  {p.link && (
                    <a
                      href={p.link}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 inline-block text-sm text-primary hover:underline"
                    >
                      {p.link}
                    </a>
                  )}
                  <button
                    onClick={() => void toggleLike(p.id)}
                    className={`mt-4 rounded-full border px-3.5 py-1.5 text-xs transition-colors ${
                      mineLike
                        ? "border-primary text-primary"
                        : "border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    ▲ {count} {count === 1 ? "boost" : "boosts"}
                  </button>
                </li>
              );
            })}
            {visible.length === 0 && (
              <li className="text-sm text-muted-foreground">
                Nothing here yet — be the first to post.
              </li>
            )}
          </ul>
        </div>

        <aside className="space-y-4">
          <section className="rounded-2xl border border-border bg-card p-5">
            <h2 className="font-semibold">Your groups</h2>
            {groups.length === 0 ? (
              <p className="mt-2 text-sm text-muted-foreground">
                You haven&apos;t joined a group yet.
              </p>
            ) : (
              <ul className="mt-3 space-y-2">
                {groups.map((g) => (
                  <li key={g.group_key || g.id} className="flex items-center gap-2 text-sm">
                    <span className="size-1.5 rounded-full bg-primary" />
                    {g.group_name}
                  </li>
                ))}
              </ul>
            )}
            <Link
              to="/groups"
              className="mt-4 inline-block text-xs text-primary hover:underline"
            >
              Browse all groups →
            </Link>
          </section>
          <section className="rounded-2xl border border-border bg-card p-5 text-sm text-muted-foreground">
            <h2 className="font-semibold text-foreground">Community rules</h2>
            <ul className="mt-2 space-y-1.5">
              <li>Give feedback you would want to receive.</li>
              <li>Show the process, not just the pixels.</li>
              <li>Credit collaborators and sources.</li>
            </ul>
          </section>
        </aside>
      </div>
    </>
  );
}

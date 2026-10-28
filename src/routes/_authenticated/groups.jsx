import React, { useCallback, useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell, Loading, PageHead } from "@/components/app/AppShell";
import { useSessionUser } from "@/lib/session";
import { fetchMemberships, joinGroup, leaveGroup } from "@/lib/workspace";
import { Users, MessageSquare, Check, Sparkles } from "lucide-react";

export const Route = createFileRoute("/_authenticated/groups")({
  head: () => ({
    meta: [
      { title: "Groups — BuildVerse Communities" },
      {
        name: "description",
        content:
          "Join BuildVerse groups: design systems, motion, backend guilds, and study circles. Joined groups automatically appear as live channels in Chat.",
      },
    ],
  }),
  component: GroupsPage,
});

const GROUPS = [
  { name: "React Native Guild", members: 1284, topic: "Mobile UI, animations, gestures", active: 42, key: "react-native-guild" },
  { name: "MongoDB Architecture", members: 1907, topic: "Indexing, Mongoose schemas, replication", active: 61, key: "mongodb-architecture" },
  { name: "WebGPU Engine Masters", members: 863, topic: "Rust, WGSL shaders, WebGL2", active: 27, key: "webgpu-engines" },
  { name: "Design Systems Guild", members: 742, topic: "Dark glassmorphism tokens & Figma specs", active: 15, key: "design-systems-guild" },
  { name: "Microservices & Go", members: 2310, topic: "gRPC, Kafka streams, Docker orchestration", active: 88, key: "microservices-go" },
  { name: "Ship-30 Sprint Club", members: 519, topic: "30 days, 30 shipped software features", active: 34, key: "ship-30-sprint" },
];

function GroupsPage() {
  const { profile, ready } = useSessionUser();
  if (!ready || !profile) return <Loading />;
  return (
    <AppShell profile={profile}>
      <GroupsBoard profile={profile} />
    </AppShell>
  );
}

function GroupsBoard({ profile }) {
  const [joined, setJoined] = useState([]);
  const [busy, setBusy] = useState(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      setJoined(await fetchMemberships(profile.id));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load your groups.");
    }
  }, [profile.id]);

  useEffect(() => {
    void load();
  }, [load]);

  async function toggle(g) {
    const key = g.key || g.name.toLowerCase().replace(/\s+/g, "-");
    const isIn = joined.some((j) => j.group_key === key || j.group_name === g.name);
    setBusy(key);
    setError("");
    try {
      if (isIn) {
        await leaveGroup(profile.id, key);
        setJoined((prev) => prev.filter((j) => j.group_key !== key && j.group_name !== g.name));
      } else {
        const row = await joinGroup(profile.id, key, g.name);
        setJoined((prev) => [...prev, row]);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    }
    setBusy(null);
  }

  return (
    <>
      <PageHead
        eyebrow="Groups & Guilds"
        title="Find Your Engineering Squad"
        subtitle="Join tech guilds that meet weekly and review code together. Every joined group unlocks a live chat channel in /chat."
      />

      {error && <p className="mt-4 text-sm text-destructive">{error}</p>}

      <section className="mt-6 rounded-3xl border border-border bg-card p-6 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-bold text-foreground font-display text-base">Your Active Squad Channels ({joined.length})</h2>
          <Link to="/chat" className="text-xs font-bold text-primary hover:underline flex items-center space-x-1">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Open Chat Channels →</span>
          </Link>
        </div>

        {joined.length === 0 ? (
          <p className="mt-3 text-xs text-muted-foreground">
            You haven&apos;t joined any squad yet. Click “Join Squad” below — it automatically creates a live channel in your Chat sidebar.
          </p>
        ) : (
          <ul className="mt-4 flex flex-wrap gap-2.5">
            {joined.map((j) => (
              <li
                key={j.id}
                className="flex items-center gap-2 rounded-full border border-primary/40 bg-surface-elevated px-4 py-1.5 text-xs font-bold text-foreground shadow-sm"
              >
                <span className="size-2 rounded-full bg-primary" />
                <span>#{j.group_name}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {GROUPS.map((g) => {
          const key = g.key || g.name.toLowerCase().replace(/\s+/g, "-");
          const isIn = joined.some((j) => j.group_key === key || j.group_name === g.name);
          return (
            <article
              key={g.name}
              className="rounded-3xl border border-border bg-card p-6 transition-all hover:-translate-y-1 hover:border-primary/50 shadow-md flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="p-3 rounded-2xl bg-primary/10 text-primary border border-primary/20">
                    <Users className="w-5 h-5" />
                  </div>
                  <span className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                    <span className="size-1.5 animate-pulse rounded-full bg-emerald-400" />
                    {g.active} online now
                  </span>
                </div>
                <h2 className="mt-4 text-base font-bold text-foreground font-display">{g.name}</h2>
                <p className="text-xs text-muted-foreground mt-1">{g.topic}</p>
                <p className="mt-3 text-[11px] font-extrabold tracking-widest text-muted-foreground uppercase">
                  {g.members.toLocaleString()} engineers enrolled
                </p>
              </div>

              <button
                onClick={() => void toggle(g)}
                disabled={busy === key}
                className={`mt-6 w-full rounded-2xl py-2.5 text-xs font-bold transition-all shadow-md ${
                  isIn
                    ? "border border-border bg-surface-elevated text-muted-foreground hover:text-foreground"
                    : "bg-primary text-primary-foreground hover:scale-[1.02] shadow-primary/20"
                }`}
              >
                {busy === key ? "Syncing..." : isIn ? "Joined ✓ (Unlock Chat)" : "Join Squad →"}
              </button>
            </article>
          );
        })}
      </div>
    </>
  );
}

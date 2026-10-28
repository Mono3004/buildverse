import React, { useEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AppShell, Loading, PageHead } from "@/components/app/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { useSessionUser } from "@/lib/session";
import {
  fetchMemberships,
  fetchMentorMentees,
  fetchWorkspaceUsers,
  getCustomChannels,
  createCustomChannel,
} from "@/lib/workspace";
import { MessageSquare, Users, Sparkles, Send, Plus, Hash, UserCheck } from "lucide-react";

export const Route = createFileRoute("/_authenticated/chat")({
  head: () => ({
    meta: [
      { title: "Chat — BuildVerse Realtime Channels" },
      {
        name: "description",
        content:
          "Realtime team chat inside BuildVerse: shared rooms, live presence, and instant message delivery.",
      },
    ],
  }),
  component: ChatPage,
});

function Room({ profile, room, roomTitle }) {
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [online, setOnline] = useState(1);
  const bottom = useRef(null);

  const localKey = `bv_chat_${room}`;

  useEffect(() => {
    let active = true;

    // 1. First load from local storage
    try {
      const saved = localStorage.getItem(localKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
        }
      }
    } catch {}

    // 2. Fetch from Supabase
    void supabase
      .from("chat_messages")
      .select("*")
      .eq("room", room)
      .order("created_at", { ascending: true })
      .limit(100)
      .then(({ data }) => {
        if (active && data && data.length > 0) {
          setMessages(data);
          try {
            localStorage.setItem(localKey, JSON.stringify(data));
          } catch {}
        }
      });

    const channel = supabase
      .channel(`chat:${room}`, { config: { presence: { key: profile.id } } })
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "chat_messages", filter: `room=eq.${room}` },
        (payload) => {
          const next = payload.new;
          setMessages((prev) => {
            if (prev.some((m) => m.id === next.id)) return prev;
            const updated = [...prev, next];
            try {
              localStorage.setItem(localKey, JSON.stringify(updated));
            } catch {}
            return updated;
          });
        }
      )
      .on("presence", { event: "sync" }, () => {
        setOnline(Object.keys(channel.presenceState()).length || 1);
      })
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          void channel.track({ name: profile.display_name });
        }
      });

    return () => {
      active = false;
      void supabase.removeChannel(channel);
    };
  }, [room, profile.id, profile.display_name]);

  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  async function send(e) {
    e.preventDefault();
    const body = draft.trim();
    if (!body) return;
    setDraft("");

    const newMsg = {
      id: Math.random().toString(36).substring(2, 9),
      room,
      body,
      author_id: profile.id,
      author_name: profile.display_name || "Engineer",
      author_color: "#ccff00",
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => {
      const updated = [...prev, newMsg];
      try {
        localStorage.setItem(localKey, JSON.stringify(updated));
      } catch {}
      return updated;
    });

    try {
      await supabase.from("chat_messages").insert({
        room,
        body,
        author_id: profile.id,
        author_name: profile.display_name || "Engineer",
        author_color: "#ccff00",
      });
    } catch {
      /* Fallback local message sync */
    }
  }

  return (
    <section className="flex h-[620px] flex-col rounded-3xl border border-primary/20 bg-card shadow-2xl overflow-hidden">
      <header className="flex items-center justify-between border-b border-border/80 px-6 py-4 bg-surface-elevated/40">
        <div>
          <h2 className="text-base font-bold text-foreground font-display flex items-center space-x-2">
            <span className="text-primary font-black">#</span>
            <span>{roomTitle || room}</span>
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">Realtime persistent chat • Active sync</p>
        </div>
        <span className="flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/30 px-3.5 py-1 text-xs font-bold text-primary">
          <span className="size-2 animate-pulse rounded-full bg-primary" />
          {online} online
        </span>
      </header>

      <div className="flex-1 space-y-3 overflow-y-auto p-6">
        {messages.length === 0 && (
          <div className="p-8 text-center rounded-2xl border border-dashed border-primary/25 bg-surface-elevated/20">
            <Sparkles className="w-6 h-6 text-primary mx-auto mb-2" />
            <p className="text-xs font-bold text-foreground">Welcome to #{roomTitle || room}!</p>
            <p className="text-[11px] text-muted-foreground mt-1">
              Start the discussion. All messages sync in real time across the workspace.
            </p>
          </div>
        )}

        {messages.map((m) => {
          const mine = m.author_id === profile.id;
          return (
            <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-3 shadow-md ${
                  mine
                    ? "bg-primary text-black font-semibold shadow-primary/20"
                    : "border border-border bg-surface-elevated text-foreground"
                }`}
              >
                {!mine && (
                  <p className="text-[11px] font-black uppercase tracking-wider mb-1 text-primary">
                    {m.author_name}
                  </p>
                )}
                <p className="text-xs leading-relaxed break-words">{m.body}</p>
                <p className={`mt-1.5 text-[10px] ${mine ? "text-black/60 text-right font-bold" : "text-muted-foreground"}`}>
                  {new Date(m.created_at || Date.now()).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottom} />
      </div>

      <form onSubmit={send} className="flex gap-2 border-t border-border p-4 bg-surface-elevated/40">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={`Message #${roomTitle || room}...`}
          aria-label="Message"
          className="flex-1 rounded-2xl border border-primary/20 bg-background px-4 py-2.5 text-xs text-foreground outline-none focus:border-primary transition-colors"
        />
        <button
          type="submit"
          className="rounded-2xl bg-primary px-5 py-2.5 text-xs font-black text-black transition-transform hover:scale-105 flex items-center space-x-1.5 shadow-lg shadow-primary/20"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Send</span>
        </button>
      </form>
    </section>
  );
}

function ChatPage() {
  const { profile, ready } = useSessionUser();
  const [room, setRoom] = useState("general");
  const [roomTitle, setRoomTitle] = useState("general");
  const [groups, setGroups] = useState([]);
  const [customChannels, setCustomChannels] = useState(getCustomChannels());
  const [mentees, setMentees] = useState([]);
  const [registeredUsers, setRegisteredUsers] = useState([]);

  // CREATE CHANNEL MODAL STATE
  const [isCreatingChannel, setIsCreatingChannel] = useState(false);
  const [newChannelName, setNewChannelName] = useState("");

  useEffect(() => {
    if (!profile) return;
    void fetchMemberships(profile.id).then(setGroups);
    fetchMentorMentees().then((m) => {
      if (Array.isArray(m)) setMentees(m);
    });
    fetchWorkspaceUsers().then((users) => {
      if (Array.isArray(users)) {
        // Filter out current user from direct messages list
        const others = users.filter((u) => u.email !== profile.email && u.id !== profile.id);
        setRegisteredUsers(others);
      }
    });
  }, [profile?.id, profile?.email]);

  const handleCreateChannelSubmit = (e) => {
    e.preventDefault();
    if (!newChannelName.trim()) return;
    const created = createCustomChannel(newChannelName.trim());
    if (created) {
      setCustomChannels(getCustomChannels());
      setRoom(created);
      setRoomTitle(newChannelName.trim());
      setNewChannelName("");
      setIsCreatingChannel(false);
    }
  };

  if (!ready || !profile) return <Loading />;

  return (
    <AppShell profile={profile}>
      <PageHead
        eyebrow="Realtime Channels"
        title="Squad Rooms & Direct Chat"
        subtitle="Chat exclusively with real registered users, mentors, and squads created in your workspace."
      />

      <div className="mt-8 grid gap-6 lg:grid-cols-[260px_1fr]">
        <aside className="rounded-3xl border border-primary/20 bg-card p-4 space-y-4">
          {/* GLOBAL WORKSPACE ROOM */}
          <div>
            <p className="px-2 pb-2 text-[10px] font-black tracking-widest text-muted-foreground uppercase">
              Global Workspace
            </p>
            <button
              onClick={() => {
                setRoom("general");
                setRoomTitle("general");
              }}
              className={`w-full rounded-2xl px-3.5 py-2.5 text-left text-xs font-bold transition-all flex items-center space-x-2 ${
                room === "general"
                  ? "bg-primary text-black shadow-md scale-[1.02] font-black"
                  : "text-muted-foreground hover:text-foreground hover:bg-surface-elevated"
              }`}
            >
              <Hash className="w-3.5 h-3.5" />
              <span>general</span>
            </button>
          </div>

          {/* CREATED CHANNELS / SQUADS */}
          <div className="pt-2 border-t border-border">
            <div className="flex items-center justify-between px-2 pb-2">
              <p className="text-[10px] font-black tracking-widest text-muted-foreground uppercase">
                Created Channels ({customChannels.length + groups.length})
              </p>
              <button
                onClick={() => setIsCreatingChannel(true)}
                className="p-1 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 transition-colors"
                title="Create New Channel"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>

            {customChannels.length === 0 && groups.length === 0 ? (
              <div className="px-2 py-3 text-center rounded-2xl bg-surface-elevated/30 border border-border/50">
                <p className="text-[11px] text-muted-foreground">No custom channels created yet.</p>
                <button
                  onClick={() => setIsCreatingChannel(true)}
                  className="mt-2 text-xs font-bold text-primary hover:underline"
                >
                  + Create First Channel
                </button>
              </div>
            ) : (
              <ul className="space-y-1">
                {customChannels.map((c) => (
                  <li key={c}>
                    <button
                      onClick={() => {
                        setRoom(c);
                        setRoomTitle(c);
                      }}
                      className={`w-full truncate rounded-2xl px-3.5 py-2 text-left text-xs font-bold transition-all flex items-center space-x-2 ${
                        room === c
                          ? "bg-primary text-black shadow-md scale-[1.02] font-black"
                          : "text-muted-foreground hover:text-foreground hover:bg-surface-elevated"
                      }`}
                    >
                      <Hash className="w-3 h-3 shrink-0" />
                      <span className="truncate">{c}</span>
                    </button>
                  </li>
                ))}
                {groups.map((g) => {
                  const key = g.group_key || g.group_name?.toLowerCase().replace(/\s+/g, "-");
                  return (
                    <li key={g.id || key}>
                      <button
                        onClick={() => {
                          setRoom(key);
                          setRoomTitle(g.group_name);
                        }}
                        className={`w-full truncate rounded-2xl px-3.5 py-2 text-left text-xs font-bold transition-all flex items-center space-x-2 ${
                          room === key
                            ? "bg-primary text-black shadow-md scale-[1.02] font-black"
                            : "text-muted-foreground hover:text-foreground hover:bg-surface-elevated"
                        }`}
                      >
                        <Hash className="w-3 h-3 shrink-0" />
                        <span className="truncate">{g.group_name}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* REGISTERED USERS DIRECT 1:1 MESSAGES */}
          <div className="pt-2 border-t border-border">
            <p className="px-2 pb-2 text-[10px] font-black tracking-widest text-primary uppercase">
              Direct Messages ({registeredUsers.length + mentees.length})
            </p>

            {registeredUsers.length === 0 && mentees.length === 0 ? (
              <p className="px-2 text-xs text-muted-foreground">No other users registered yet.</p>
            ) : (
              <ul className="space-y-1">
                {registeredUsers.map((u) => {
                  const dmRoom = `dm-${u.id || u.name.toLowerCase().replace(/\s+/g, "-")}`;
                  return (
                    <li key={u.id}>
                      <button
                        onClick={() => {
                          setRoom(dmRoom);
                          setRoomTitle(u.name);
                        }}
                        className={`w-full truncate rounded-2xl px-3 py-2 text-left text-xs font-bold transition-all flex items-center space-x-2.5 ${
                          room === dmRoom
                            ? "bg-primary text-black shadow-md scale-[1.02] font-black"
                            : "text-muted-foreground hover:text-foreground hover:bg-surface-elevated"
                        }`}
                      >
                        <div className="relative shrink-0">
                          <img
                            src={u.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=60"}
                            alt={u.name}
                            className="w-5 h-5 rounded-full object-cover border border-primary/30"
                          />
                          <span className="absolute -bottom-0.5 -right-0.5 size-1.5 rounded-full bg-emerald-400 ring-1 ring-card" />
                        </div>
                        <div className="truncate flex-1">
                          <span className="truncate block">{u.name}</span>
                        </div>
                        <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-surface-elevated border border-border text-muted-foreground">
                          {u.role || "Dev"}
                        </span>
                      </button>
                    </li>
                  );
                })}

                {/* If mentees exist and are not already in users list */}
                {mentees
                  .filter((m) => !registeredUsers.some((u) => u.id === m.id || u.name === m.name))
                  .map((m) => {
                    const menteeRoom = `mentee-${m.name?.toLowerCase().replace(/\s+/g, "-") || m.id}`;
                    return (
                      <li key={m.id}>
                        <button
                          onClick={() => {
                            setRoom(menteeRoom);
                            setRoomTitle(m.name);
                          }}
                          className={`w-full truncate rounded-2xl px-3 py-2 text-left text-xs font-bold transition-all flex items-center space-x-2.5 ${
                            room === menteeRoom
                              ? "bg-primary text-black shadow-md scale-[1.02] font-black"
                              : "text-muted-foreground hover:text-foreground hover:bg-surface-elevated"
                          }`}
                        >
                          <div className="relative shrink-0">
                            <span className="size-2 rounded-full bg-emerald-400 block" />
                          </div>
                          <span className="truncate flex-1">{m.name}</span>
                          <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                            Mentee
                          </span>
                        </button>
                      </li>
                    );
                  })}
              </ul>
            )}
          </div>
        </aside>

        <Room key={room} profile={profile} room={room} roomTitle={roomTitle} />
      </div>

      {/* CREATE CHANNEL MODAL */}
      {isCreatingChannel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl border border-primary/30 bg-card p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-foreground font-display flex items-center space-x-2">
              <Hash className="w-5 h-5 text-primary" />
              <span>Create New Squad Channel</span>
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Create a real discussion room for your team or specific project topic.
            </p>

            <form onSubmit={handleCreateChannelSubmit} className="mt-5 space-y-4">
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                  Channel Name
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground font-bold text-sm">
                    #
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="e.g. distributed-systems"
                    value={newChannelName}
                    onChange={(e) => setNewChannelName(e.target.value)}
                    className="w-full rounded-2xl border border-primary/30 bg-background pl-8 pr-4 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreatingChannel(false)}
                  className="px-4 py-2 rounded-2xl text-xs font-bold text-muted-foreground hover:text-foreground bg-surface-elevated transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-2xl text-xs font-black text-black bg-primary hover:scale-105 shadow-md shadow-primary/25 transition-all"
                >
                  Create Channel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}

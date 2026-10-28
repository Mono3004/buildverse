import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const CHANNEL = "workspace:board";

export function CollabWorkspace({ profile }) {
  const boardRef = useRef(null);
  const channelRef = useRef(null);
  const lastSent = useRef(0);

  const [members, setMembers] = useState([]);
  const [cursors, setCursors] = useState({});
  const [comments, setComments] = useState([]);
  const [placing, setPlacing] = useState(false);
  const [draft, setDraft] = useState(null);
  const [openId, setOpenId] = useState(null);
  const [status, setStatus] = useState("connecting");

  // Realtime presence + cursor broadcast
  useEffect(() => {
    const channel = supabase.channel(CHANNEL, {
      config: { presence: { key: profile.id }, broadcast: { self: false } },
    });
    channelRef.current = channel;

    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();
        setMembers(
          Object.entries(state).map(([id, entries]) => ({
            id,
            name: entries[0]?.name ?? "Teammate",
            color: entries[0]?.color ?? "#C9F227",
          })),
        );
      })
      .on("presence", { event: "leave" }, ({ key }) => {
        setCursors((prev) => {
          const next = { ...prev };
          delete next[key];
          return next;
        });
      })
      .on("broadcast", { event: "cursor" }, ({ payload }) => {
        const c = payload;
        if (c.id === profile.id) return;
        setCursors((prev) => ({ ...prev, [c.id]: { ...c, at: Date.now() } }));
      })
      .subscribe(async (state) => {
        if (state === "SUBSCRIBED") {
          setStatus("live");
          await channel.track({ name: profile.display_name, color: profile.color });
        } else if (state === "CHANNEL_ERROR" || state === "TIMED_OUT" || state === "CLOSED") {
          setStatus("offline");
        }
      });

    return () => {
      channelRef.current = null;
      void supabase.removeChannel(channel);
    };
  }, [profile.id, profile.display_name, profile.color]);

  // Drop cursors that went quiet
  useEffect(() => {
    const t = setInterval(() => {
      const cutoff = Date.now() - 8000;
      setCursors((prev) => {
        const next = Object.fromEntries(Object.entries(prev).filter(([, c]) => c.at > cutoff));
        return Object.keys(next).length === Object.keys(prev).length ? prev : next;
      });
    }, 3000);
    return () => clearInterval(t);
  }, []);

  // Comments: initial load + realtime stream
  useEffect(() => {
    let active = true;
    void supabase
      .from("workspace_comments")
      .select("*")
      .order("created_at", { ascending: true })
      .then(({ data }) => {
        if (active && data) setComments(data);
      });

    const channel = supabase
      .channel("workspace:comments")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "workspace_comments" },
        (payload) => {
          setComments((prev) => {
            if (payload.eventType === "INSERT") {
              const row = payload.new;
              return prev.some((c) => c.id === row.id) ? prev : [...prev, row];
            }
            if (payload.eventType === "UPDATE") {
              const row = payload.new;
              return prev.map((c) => (c.id === row.id ? row : c));
            }
            const removed = payload.old;
            return prev.filter((c) => c.id !== removed.id);
          });
        },
      )
      .subscribe();

    return () => {
      active = false;
      void supabase.removeChannel(channel);
    };
  }, []);

  const toPercent = useCallback((e) => {
    const box = boardRef.current?.getBoundingClientRect();
    if (!box) return { x: 50, y: 50 };
    return {
      x: Math.min(100, Math.max(0, ((e.clientX - box.left) / box.width) * 100)),
      y: Math.min(100, Math.max(0, ((e.clientY - box.top) / box.height) * 100)),
    };
  }, []);

  const handlePointerMove = (e) => {
    const now = Date.now();
    if (now - lastSent.current < 45) return;
    lastSent.current = now;
    const { x, y } = toPercent(e);
    void channelRef.current?.send({
      type: "broadcast",
      event: "cursor",
      payload: { id: profile.id, name: profile.display_name, color: profile.color, x, y },
    });
  };

  const handleBoardClick = (e) => {
    if (!placing) return;
    setDraft({ ...toPercent(e), body: "" });
    setPlacing(false);
  };

  async function saveDraft() {
    if (!draft || !draft.body.trim()) return setDraft(null);
    const { data, error } = await supabase
      .from("workspace_comments")
      .insert({
        author_id: profile.id,
        author_name: profile.display_name,
        author_color: profile.color,
        body: draft.body.trim(),
        x: draft.x,
        y: draft.y,
      })
      .select()
      .single();
    if (!error && data) {
      setComments((prev) =>
        prev.some((c) => c.id === data.id) ? prev : [...prev, data],
      );
    }
    setDraft(null);
  }

  async function toggleResolved(c) {
    await supabase.from("workspace_comments").update({ resolved: !c.resolved }).eq("id", c.id);
  }

  async function removeComment(c) {
    setComments((prev) => prev.filter((x) => x.id !== c.id));
    await supabase.from("workspace_comments").delete().eq("id", c.id);
  }

  const liveCursors = useMemo(() => Object.values(cursors), [cursors]);
  const openComments = comments.filter((c) => !c.resolved);

  return (
    <section className="mt-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs tracking-widest text-primary uppercase">Live workspace</p>
          <h2 className="mt-1 text-xl font-semibold">Collaborative board</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Move your pointer — teammates see your cursor. Drop a comment anywhere; everyone gets it
            instantly.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground">
            <span
              className={`size-2 rounded-full ${status === "live" ? "animate-pulse bg-primary" : "bg-muted-foreground"}`}
            />
            {status === "live" ? `${members.length} online` : status}
          </span>
          <div className="flex -space-x-2">
            {members.slice(0, 6).map((m) => (
              <span
                key={m.id}
                title={m.name}
                className="grid size-8 place-items-center rounded-full border border-background bg-surface-elevated text-[11px] font-bold"
                style={{ color: m.color }}
              >
                {m.name.slice(0, 2).toUpperCase()}
              </span>
            ))}
          </div>
          <button
            onClick={() => {
              setPlacing((p) => !p);
              setDraft(null);
            }}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition-transform hover:scale-105 ${
              placing ? "bg-accent text-primary-foreground" : "bg-primary text-primary-foreground"
            }`}
          >
            {placing ? "Click the board…" : "+ Comment"}
          </button>
        </div>
      </div>

      <div className="mt-5 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div
          ref={boardRef}
          onPointerMove={handlePointerMove}
          onClick={handleBoardClick}
          className={`relative h-[420px] overflow-hidden rounded-3xl border border-border bg-card ${
            placing ? "cursor-crosshair" : "cursor-default"
          }`}
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-40"
            style={{
              backgroundImage:
                "linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)",
              backgroundSize: "48px 48px",
            }}
            aria-hidden
          />
          <p className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 text-center text-sm text-muted-foreground">
            {comments.length === 0
              ? "Nothing pinned yet — drop the first comment."
              : `${openComments.length} open · ${comments.length - openComments.length} resolved`}
          </p>

          {liveCursors.map((c) => (
            <div
              key={c.id}
              className="pointer-events-none absolute z-20 transition-[left,top] duration-75 ease-linear"
              style={{ left: `${c.x}%`, top: `${c.y}%` }}
            >
              <svg width="18" height="18" viewBox="0 0 16 16" fill={c.color} aria-hidden>
                <path d="M0 0l5.6 15.2 2-6.1 6.1-2z" />
              </svg>
              <span
                className="mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold text-primary-foreground"
                style={{ backgroundColor: c.color }}
              >
                {c.name}
              </span>
            </div>
          ))}

          {comments.map((c) => (
            <div
              key={c.id}
              className="absolute z-10"
              style={{ left: `${c.x}%`, top: `${c.y}%` }}
              onClick={(e) => {
                e.stopPropagation();
                setOpenId(openId === c.id ? null : c.id);
              }}
            >
              <button
                className={`grid size-7 place-items-center rounded-full rounded-bl-none border text-[10px] font-bold text-primary-foreground transition-transform hover:scale-110 ${
                  c.resolved ? "opacity-40" : ""
                }`}
                style={{ backgroundColor: c.author_color, borderColor: c.author_color }}
                aria-label={`Comment by ${c.author_name}`}
              >
                {c.author_name.slice(0, 1).toUpperCase()}
              </button>
              {openId === c.id && (
                <div className="absolute left-8 top-0 w-56 rounded-2xl border border-border bg-surface-elevated p-3 text-left">
                  <p className="text-xs" style={{ color: c.author_color }}>
                    {c.author_name}
                  </p>
                  <p className="mt-1 text-sm">{c.body}</p>
                  {c.author_id === profile.id && (
                    <div className="mt-3 flex gap-2 text-[11px]">
                      <button
                        onClick={() => toggleResolved(c)}
                        className="rounded-full border border-border px-2 py-1 hover:border-primary/60"
                      >
                        {c.resolved ? "Reopen" : "Resolve"}
                      </button>
                      <button
                        onClick={() => removeComment(c)}
                        className="rounded-full border border-border px-2 py-1 text-destructive hover:border-destructive/60"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {draft && (
            <div
              className="absolute z-30 w-60 rounded-2xl border border-primary/50 bg-surface-elevated p-3"
              style={{ left: `${draft.x}%`, top: `${draft.y}%` }}
              onClick={(e) => e.stopPropagation()}
            >
              <textarea
                autoFocus
                value={draft.body}
                onChange={(e) => setDraft({ ...draft, body: e.target.value })}
                placeholder="Leave a comment…"
                aria-label="New comment"
                className="h-20 w-full resize-none rounded-xl border border-input bg-card p-2 text-sm outline-none focus:border-primary"
              />
              <div className="mt-2 flex justify-end gap-2 text-xs">
                <button onClick={() => setDraft(null)} className="rounded-full px-3 py-1.5">
                  Cancel
                </button>
                <button
                  onClick={saveDraft}
                  className="rounded-full bg-primary px-3 py-1.5 font-semibold text-primary-foreground"
                >
                  Post
                </button>
              </div>
            </div>
          )}
        </div>

        <aside className="rounded-3xl border border-border bg-card p-5">
          <h3 className="font-semibold">Comment thread</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Synced live across everyone on the board.
          </p>
          <ul className="mt-4 max-h-[330px] space-y-3 overflow-y-auto pr-1">
            {comments.length === 0 && (
              <li className="text-sm text-muted-foreground">No comments yet.</li>
            )}
            {comments.map((c) => (
              <li
                key={c.id}
                onClick={() => setOpenId(c.id)}
                className={`cursor-pointer rounded-2xl border border-border bg-surface-elevated p-3 transition-colors hover:border-primary/50 ${
                  c.resolved ? "opacity-50" : ""
                }`}
              >
                <p className="text-xs" style={{ color: c.author_color }}>
                  {c.author_name}
                  <span className="text-muted-foreground">
                    {" · "}
                    {new Date(c.created_at).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </p>
                <p className={`mt-1 text-sm ${c.resolved ? "line-through" : ""}`}>{c.body}</p>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </section>
  );
}

import { Reveal, Tag } from "./Reveal";

const perks = [
  ["End-to-end encrypted secrets", "Vault-grade storage with per-environment scoping."],
  ["Native GitHub & GitLab sync", "Two-way sync for issues, PRs and branches."],
  ["Realtime collab across teams", "Socket.IO presence, cursors and threaded chat."],
  ["Portfolio publishing built in", "Turn shipped projects into a live portfolio."],
];

const messages = [
  { name: "Anya", time: "2m", text: "Merged the auth refactor — ready for review 🚀" },
  { name: "Kai", time: "14m", text: "Roadmap for Q3 is up. Take a look?" },
  { name: "Priya", time: "1h", text: "Uploaded new brand assets to Figma." },
];

export function Craft() {
  return (
    <section id="craft" className="px-4 py-24">
      <div className="mx-auto grid max-w-5xl items-center gap-12 lg:grid-cols-2">
        <Reveal>
          <Tag>Built for craftspeople</Tag>
          <h2 className="mt-5 text-3xl font-bold md:text-5xl">
            A workspace that feels as good as the{" "}
            <span className="text-gradient">code you write</span>
          </h2>
          <p className="mt-4 max-w-md text-muted-foreground">
            Every pixel is considered. Every interaction, smoothed. The anti-template — editorial,
            opinionated, and made for people who care about their tools.
          </p>
          <ul className="mt-8 space-y-3">
            {perks.map(([title, body], i) => (
              <Reveal key={title} delay={i * 80}>
                <li className="flex gap-3 rounded-2xl border border-border bg-card p-4 transition-colors hover:border-primary/50">
                  <span className="mt-1 size-2 shrink-0 rounded-full bg-primary" />
                  <div>
                    <p className="text-sm font-semibold">{title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{body}</p>
                  </div>
                </li>
              </Reveal>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={140}>
          <div
            className="rounded-3xl border border-border bg-card p-6"
            style={{ boxShadow: "var(--shadow-card)" }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-display text-lg font-semibold">Nova Team</p>
                <p className="text-xs text-muted-foreground">12 members · Active now</p>
              </div>
              <div className="flex -space-x-2">
                {["A", "K", "P", "M"].map((c) => (
                  <span
                    key={c}
                    className="grid size-8 place-items-center rounded-full border border-background bg-surface-elevated text-xs font-bold text-accent"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>
            <div className="mt-6 space-y-3">
              {messages.map((m) => (
                <div
                  key={m.name}
                  className="rounded-2xl border border-border bg-surface-elevated p-4 transition-transform hover:-translate-y-0.5"
                >
                  <p className="text-xs text-accent">
                    {m.name} <span className="text-muted-foreground">· {m.time}</span>
                  </p>
                  <p className="mt-1.5 text-sm">{m.text}</p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

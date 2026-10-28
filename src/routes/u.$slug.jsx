import { createFileRoute, Link } from "@tanstack/react-router";
import { getPublicPortfolio } from "@/lib/portfolio.functions";

export const Route = createFileRoute("/u/$slug")({
  loader: ({ params }) => getPublicPortfolio({ data: { slug: params.slug } }),
  head: ({ loaderData, params }) => {
    if (!loaderData?.portfolio) {
      return {
        meta: [{ title: "Profile not found — Nexus" }, { name: "robots", content: "noindex" }],
      };
    }
    const name = loaderData.name || params.slug;
    const title = `${name} — ${loaderData.portfolio.headline}`;
    const description = loaderData.portfolio.bio.slice(0, 155) || `${name}'s work on Nexus.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "profile" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  errorComponent: () => <Shell title="Something went wrong" body="Try refreshing this profile." />,
  notFoundComponent: () => (
    <Shell title="Profile not found" body="This portfolio isn't published." />
  ),
  component: PublicPortfolio,
});

function Shell({ title, body }) {
  return (
    <div className="grid min-h-screen place-items-center bg-background px-6 text-center">
      <div>
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{body}</p>
        <Link to="/" className="mt-6 inline-block text-sm text-primary underline">
          Back to Nexus
        </Link>
      </div>
    </div>
  );
}

function PublicPortfolio() {
  const { portfolio, items, name } = Route.useLoaderData();
  const { slug } = Route.useParams();

  if (!portfolio) {
    return <Shell title="Profile not found" body="This portfolio isn't published yet." />;
  }

  const display = name || slug;

  return (
    <div className="min-h-screen bg-background">
      <div
        className="h-56 w-full"
        style={{
          background: `radial-gradient(60% 120% at 50% 0%, ${portfolio.accent}33, transparent 70%)`,
        }}
      />
      <div className="mx-auto -mt-32 max-w-4xl px-4 pb-20">
        <header className="rounded-3xl border border-border bg-card p-8">
          <span
            className="grid size-16 place-items-center rounded-2xl text-xl font-bold"
            style={{ background: `${portfolio.accent}22`, color: portfolio.accent }}
          >
            {display.slice(0, 2).toUpperCase()}
          </span>
          <h1 className="mt-5 text-3xl font-bold md:text-4xl">{display}</h1>
          <p className="mt-1 text-lg" style={{ color: portfolio.accent }}>
            {portfolio.headline}
          </p>
          {portfolio.bio && <p className="mt-4 max-w-2xl text-muted-foreground">{portfolio.bio}</p>}
          <div className="mt-5 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            {portfolio.location && <span>{portfolio.location}</span>}
            {portfolio.website && (
              <a href={portfolio.website} target="_blank" rel="noreferrer" className="underline">
                Website
              </a>
            )}
            {portfolio.github && (
              <a href={portfolio.github} target="_blank" rel="noreferrer" className="underline">
                GitHub
              </a>
            )}
          </div>

          {/* VERIFIED BUILDVERSE SCORE & GITPOINTS */}
          <div className="mt-6 pt-5 border-t border-border/80 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center text-primary font-black">
                ⚡
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  BuildVerse Score
                </p>
                <p className="text-xl font-black text-foreground font-display">
                  1,450 <span className="text-primary text-xs font-bold">GitPoints</span>
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4 text-xs font-mono">
              <span className="px-3 py-1 rounded-full bg-surface-elevated border border-border text-amber-400 font-bold flex items-center space-x-1">
                <span>★ 5.0 Rating</span>
              </span>
              <span className="px-3 py-1 rounded-full bg-surface-elevated border border-border text-emerald-400 font-bold flex items-center space-x-1">
                <span>✓ 12 Verified Audits</span>
              </span>
            </div>
          </div>
        </header>

        <h2 className="mt-10 text-lg font-semibold">Selected work</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {items.length === 0 && (
            <p className="text-sm text-muted-foreground">No published work yet.</p>
          )}
          {items.map((it) => (
            <article
              key={it.id}
              className="rounded-2xl border border-border bg-card p-5 transition-all hover:-translate-y-1 hover:border-primary/50"
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-semibold">{it.title}</h3>
                <span className="rounded-full border border-border px-2.5 py-0.5 text-[10px] tracking-wide text-muted-foreground uppercase">
                  {it.status}
                </span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{it.summary}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {it.stack
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean)
                  .map((s) => (
                    <span
                      key={s}
                      className="rounded-md bg-surface-elevated px-2 py-0.5 text-[10px] text-accent"
                    >
                      {s}
                    </span>
                  ))}
              </div>
              <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                <span>{it.role}</span>
                {it.link && (
                  <a
                    href={it.link}
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary underline"
                  >
                    View
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>

        <footer className="mt-12 text-center text-xs text-muted-foreground">
          Published with{" "}
          <Link to="/" className="text-primary underline">
            Nexus
          </Link>
        </footer>
      </div>
    </div>
  );
}

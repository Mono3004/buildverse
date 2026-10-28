import React, { useState } from "react";
import { Reveal, Tag } from "./Reveal";
import { Link } from "@tanstack/react-router";
import { Scene3D } from "./Scene3D";
import communityApp from "@/assets/community-app.jpg";
import {
  Check,
  Terminal,
  Code2,
  GitBranch,
  Zap,
  ShieldCheck,
  HelpCircle,
  ChevronDown,
  ArrowRight,
  Sparkles,
  Database,
  Cpu,
  Layers,
} from "lucide-react";

export function Nav() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4">
      <nav className="flex w-full max-w-6xl items-center justify-between rounded-full border border-border bg-card/80 px-6 py-3 backdrop-blur-xl shadow-2xl">
        <Link to="/" className="font-display text-lg font-bold tracking-tight text-foreground flex items-center space-x-1">
          <span>buildverse</span><span className="text-primary">.</span>
        </Link>

        {/* PUBLIC NAV LINKS */}
        <ul className="hidden items-center gap-7 text-xs font-bold text-muted-foreground md:flex">
          <li>
            <Link to="/features" className="transition-colors hover:text-foreground">Features</Link>
          </li>
          <li>
            <Link to="/pricing" className="transition-colors hover:text-foreground">Pricing</Link>
          </li>
          <li>
            <Link to="/templates" className="transition-colors hover:text-foreground">Templates</Link>
          </li>
          <li>
            <Link to="/docs" className="transition-colors hover:text-foreground">Docs</Link>
          </li>
          <li>
            <Link to="/about" className="transition-colors hover:text-foreground">About</Link>
          </li>
        </ul>

        {/* PREMIUM SIGN IN & JOIN BUTTONS */}
        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="hidden rounded-full border border-border px-5 py-2 text-xs font-bold text-foreground transition-all hover:border-primary hover:text-primary sm:inline-flex"
          >
            Sign in
          </Link>
          <Link
            to="/register"
            className="rounded-full bg-primary px-5 py-2 text-xs font-black text-primary-foreground transition-all hover:scale-105 shadow-lg shadow-primary/20"
          >
            Join now →
          </Link>
        </div>
      </nav>
    </header>
  );
}

export function Hero() {
  return (
    <section
      id="top"
      className="relative min-h-[92vh] overflow-hidden px-4 pt-36 pb-28 md:pt-44 md:pb-36"
    >
      <div
        className="pointer-events-none absolute inset-0 animate-glow"
        style={{ background: "var(--gradient-hero)" }}
        aria-hidden
      />
      <Scene3D />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: "radial-gradient(55% 40% at 50% 45%, var(--background) 15%, transparent 78%)",
        }}
        aria-hidden
      />
      <div className="relative z-10 mx-auto max-w-3xl text-center">
        <Reveal>
          <Tag>Cohort 12 — open</Tag>
          <h1 className="mt-6 text-5xl leading-[0.95] font-bold md:text-7xl font-display">
            Where developers <span className="text-gradient">never stop</span> building
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-base text-muted-foreground md:text-lg">
            Lessons, live critiques and a community of 10,000+ engineers. Learn the craft
            from the people already shipping it.
          </p>
        </Reveal>
        <Reveal delay={140}>
          <form
            onSubmit={(e) => e.preventDefault()}
            className="mx-auto mt-9 flex max-w-md flex-col gap-3 sm:flex-row"
          >
            <input
              type="email"
              required
              placeholder="you@studio.com"
              aria-label="Email address"
              className="h-12 flex-1 rounded-full border border-input bg-card px-5 text-sm outline-none placeholder:text-muted-foreground focus:border-primary"
            />
            <button
              type="submit"
              className="h-12 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground transition-transform hover:scale-105"
            >
              Start building
            </button>
          </form>
        </Reveal>
      </div>
    </section>
  );
}

const skills = [
  {
    title: "Design systems",
    level: "Core",
    body: "Tokens, components and the discipline to keep them alive.",
  },
  { title: "Web design", level: "Core", body: "Layout, type and rhythm that feels effortless." },
  {
    title: "Product thinking",
    level: "Advanced",
    body: "Frame the problem before you open the canvas.",
  },
  { title: "Motion", level: "Advanced", body: "Timing and easing that reads as quality." },
  { title: "Brand identity", level: "Core", body: "Marks and voice that survive reality." },
  { title: "AI workflows", level: "New", body: "Ship faster without looking generated." },
];

export function Skills() {
  return (
    <section id="curriculum" className="px-4 py-24">
      <div className="mx-auto max-w-5xl">
        <Reveal className="text-center">
          <h2 className="text-3xl font-bold md:text-5xl font-display">Expand your skillset</h2>
          <p className="mx-auto mt-3 max-w-lg text-muted-foreground">
            Six tracks, built as a single curriculum. Start anywhere, finish everywhere.
          </p>
        </Reveal>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {skills.map((s, i) => (
            <Reveal key={s.title} delay={i * 70}>
              <article className="group h-full rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/50">
                <div className="flex items-center justify-between">
                  <span className="size-8 rounded-lg bg-surface-elevated transition-colors group-hover:bg-primary" />
                  <span className="rounded-full border border-border px-2.5 py-0.5 text-[11px] text-muted-foreground">
                    {s.level}
                  </span>
                </div>
                <h3 className="mt-5 text-lg font-semibold font-display">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.body}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

{/* NEW HIGH-CRAFT VS CODE TERMINAL SYNC SHOWCASE SECTION */}
export function TerminalSyncSection() {
  return (
    <section className="px-4 py-24 relative overflow-hidden bg-card/40 border-y border-border/60">
      <div className="mx-auto max-w-5xl space-y-12">
        <Reveal className="text-center">
          <Tag>Bi-Directional Git Sync</Tag>
          <h2 className="mt-4 text-3xl font-bold md:text-5xl font-display">
            Code in <span className="text-gradient">VS Code</span>, ship to BuildVerse
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
            Run simple terminal commands from any folder on your machine. Pushed code and commits sync live to your team&apos;s cloud repository in real time.
          </p>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Reveal delay={80}>
            <div className="p-6 rounded-3xl bg-card border border-border space-y-4 shadow-xl">
              <div className="flex items-center space-x-2 text-xs font-extrabold text-primary">
                <Terminal className="w-4 h-4" />
                <span>PUSH FROM LOCAL VS CODE</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Scans all new files, changes, and commit logs from your terminal and pushes them directly to BuildVerse DB.
              </p>
              <div className="p-4 rounded-2xl bg-[#09090B] font-mono text-xs text-emerald-400 border border-border">
                <code>npm run sync:commit "feat: add user auth" -- --project="Mobile App"</code>
              </div>
            </div>
          </Reveal>

          <Reveal delay={160}>
            <div className="p-6 rounded-3xl bg-card border border-border space-y-4 shadow-xl">
              <div className="flex items-center space-x-2 text-xs font-extrabold text-emerald-400">
                <GitBranch className="w-4 h-4" />
                <span>PULL FROM BUILDVERSE REMOTE</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Fetches all latest cloud code files and writes them directly into any local VS Code folder on disk.
              </p>
              <div className="p-4 rounded-2xl bg-[#09090B] font-mono text-xs text-emerald-400 border border-border">
                <code>npm run sync:pull -- --project="Mobile App"</code>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

const stats = [
  ["30+", "Lessons"],
  ["26+", "Workshops"],
  ["14+", "Nationalities"],
  ["10k+", "Members"],
  ["9+", "Challenges"],
];

export function Community() {
  return (
    <section id="community" className="relative overflow-hidden px-4 py-24">
      <div className="mx-auto max-w-5xl text-center">
        <Reveal>
          <h2 className="text-3xl font-bold md:text-5xl font-display">
            Become part of our <span className="text-gradient">community</span>
          </h2>
        </Reveal>
        <Reveal delay={120}>
          <img
            src={communityApp}
            alt="BuildVerse community app dashboard"
            loading="lazy"
            width={1408}
            height={912}
            className="mx-auto mt-10 w-full rounded-3xl border border-border"
            style={{ boxShadow: "var(--shadow-card)" }}
          />
        </Reveal>
        <div className="mt-14 grid grid-cols-2 gap-8 sm:grid-cols-5">
          {stats.map(([value, label], i) => (
            <Reveal key={label} delay={i * 60}>
              <p className="font-display text-3xl font-bold md:text-4xl">{value}</p>
              <p className="mt-1 text-sm text-muted-foreground">{label}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

const mentors = [
  { name: "Elena Rostova", topic: "Microservices & Go" },
  { name: "Erik Solberg", topic: "Rust & WebGPU" },
  { name: "Elias Thorne", topic: "Design Systems & Architecture" },
  { name: "Grace Walker", topic: "React Native Mobile" },
  { name: "Alex Chen", topic: "MongoDB & Node.js APIs" },
  { name: "James McDonald", topic: "Web Performance" },
];

export function Mentors() {
  return (
    <section id="mentors" className="px-4 py-24">
      <div className="mx-auto max-w-5xl">
        <Reveal>
          <h2 className="text-3xl font-bold md:text-5xl font-display">Learn from lead mentors</h2>
          <p className="mt-3 max-w-md text-muted-foreground">
            Every session unlocks the working knowledge of engineers leading today&apos;s best teams.
          </p>
        </Reveal>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {mentors.map((m, i) => (
            <Reveal key={m.name} delay={i * 70}>
              <div className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-5 transition-colors hover:border-primary/60">
                <span className="grid size-14 shrink-0 place-items-center rounded-full bg-surface-elevated font-display text-sm font-bold text-primary transition-transform group-hover:scale-110">
                  {m.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </span>
                <div>
                  <p className="text-xs text-primary font-bold">{m.name}</p>
                  <p className="font-display text-base font-semibold">{m.topic}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

const quotes = [
  ["The code reviews alone paid for the year. I ship twice as fast.", "Ana R., Full-Stack Engineer"],
  ["Best engineering community on the internet, and it's not even close.", "Kyle B., Founder"],
  ["I stopped guessing at architecture and state management.", "Marco T., Lead Engineer"],
  ["Six weeks in and my portfolio landed me three interviews.", "Priya S., Mobile Developer"],
];

export function Testimonials() {
  const row = [...quotes, ...quotes];
  return (
    <section className="overflow-hidden py-24">
      <Reveal className="px-4 text-center">
        <Tag>Reviews</Tag>
        <h2 className="mt-5 text-3xl font-bold md:text-5xl font-display">What engineers say about us</h2>
      </Reveal>
      <div className="mt-12 flex w-max animate-marquee gap-4 hover:[animation-play-state:paused]">
        {row.map(([quote, author], i) => (
          <figure
            key={`${author}-${i}`}
            className="w-[320px] shrink-0 rounded-2xl border border-border bg-card p-6"
          >
            <blockquote className="text-sm leading-relaxed">&ldquo;{quote}&rdquo;</blockquote>
            <figcaption className="mt-4 text-xs text-muted-foreground">{author}</figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

{/* CLEAN PRICING TIER WITH NO DUMMY DASHES & SLEEK GREEN CHECKMARKS */}
const plans = [
  {
    name: "Free",
    price: "$0",
    featured: false,
    perks: [
      "Access to starter curriculum",
      "Public community read permissions",
      "Weekly developer newsletter",
      "Standard repository viewer",
    ],
  },
  {
    name: "Pro",
    price: "$19",
    featured: true,
    perks: [
      "Full engineering curriculum & tracks",
      "Live bi-directional VS Code Git sync",
      "Live mentor workshops & code reviews",
      "Private Discord & team channels",
      "Unlimited project commits & history",
    ],
  },
  {
    name: "Ultimate",
    price: "$99",
    featured: false,
    perks: [
      "Everything included in Pro plan",
      "1:1 dedicated mentor advisory sessions",
      "Custom MongoDB database integration",
      "Career coaching & portfolio reviews",
      "Lifetime platform & updates access",
    ],
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="px-4 py-24">
      <div className="mx-auto max-w-5xl">
        <Reveal className="text-center">
          <Tag>Flexible Plans</Tag>
          <h2 className="mt-4 text-3xl font-bold md:text-5xl font-display">
            Start your journey <span className="text-gradient">today</span>
          </h2>
          <p className="mt-3 text-sm text-muted-foreground max-w-md mx-auto">
            Choose the plan that fits your engineering goals. Upgrade or cancel anytime.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-6 md:grid-cols-3 md:items-center">
          {plans.map((p, i) => (
            <Reveal key={p.name} delay={i * 90}>
              <div
                className={`rounded-3xl border p-7 transition-all duration-300 hover:-translate-y-1.5 ${
                  p.featured
                    ? "border-primary/80 bg-surface-elevated md:scale-105 shadow-2xl shadow-primary/15 relative"
                    : "border-border/80 bg-card"
                }`}
              >
                {p.featured && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-wider shadow-md">
                    Most Popular
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <p className="font-display text-base font-bold text-foreground">{p.name}</p>
                </div>

                <div className="mt-5 flex items-baseline space-x-1">
                  <span className="font-display text-5xl font-bold text-foreground">{p.price}</span>
                  <span className="text-xs font-semibold text-muted-foreground">/ month</span>
                </div>

                <div className="my-6 border-t border-border/60" />

                <ul className="space-y-3 text-xs font-medium text-foreground">
                  {p.perks.map((perk) => (
                    <li key={perk} className="flex items-center space-x-3">
                      <div className="p-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shrink-0">
                        <Check className="w-3 h-3" />
                      </div>
                      <span className="leading-snug">{perk}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  to="/register"
                  className={`mt-8 h-11 w-full rounded-2xl text-xs font-extrabold flex items-center justify-center transition-all hover:scale-[1.02] ${
                    p.featured
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                      : "border border-border bg-card text-foreground hover:border-primary"
                  }`}
                >
                  Get Started with {p.name} →
                </Link>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

{/* INTERACTIVE FAQ ACCORDION SECTION */}
export function FAQSection() {
  const [openIndex, setOpenIndex] = useState(0);

  const faqs = [
    {
      q: "How does the VS Code Bi-Directional Git Sync work?",
      a: "You simply run `npm run sync:commit` from any folder in VS Code. It automatically scans your newly created files and pushes them to your BuildVerse cloud repository in real time. Running `npm run sync:pull` downloads the latest files onto your local disk.",
    },
    {
      q: "Is there any manual setup required for MongoDB?",
      a: "No! BuildVerse connects to your local MongoDB server on port 27017 or Cloud Atlas. Your project schemas, commits, and user profiles are synchronized seamlessly.",
    },
    {
      q: "Can I collaborate with my team on private projects?",
      a: "Yes. All Pro and Ultimate members can create private repositories, invite collaborators, and stream live code changes across multiple team workstations.",
    },
    {
      q: "Can I cancel or upgrade my subscription anytime?",
      a: "Absolutely. You can change your plan or cancel at any time directly from your user dashboard with zero lock-in contracts.",
    },
  ];

  return (
    <section className="px-4 py-24 bg-card/30 border-t border-border">
      <div className="mx-auto max-w-3xl space-y-10">
        <Reveal className="text-center">
          <Tag>Questions & Answers</Tag>
          <h2 className="mt-4 text-3xl font-bold md:text-5xl font-display">
            Frequently Asked <span className="text-gradient">Questions</span>
          </h2>
        </Reveal>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <Reveal key={idx} delay={idx * 60}>
              <div className="rounded-2xl border border-border/80 bg-card overflow-hidden transition-all">
                <button
                  onClick={() => setOpenIndex(openIndex === idx ? -1 : idx)}
                  className="w-full p-5 text-left flex items-center justify-between font-display font-bold text-sm text-foreground hover:text-primary transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${openIndex === idx ? "rotate-180 text-primary" : ""}`} />
                </button>
                {openIndex === idx && (
                  <div className="px-5 pb-5 text-xs text-muted-foreground leading-relaxed border-t border-border/40 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

{/* CALL TO ACTION BANNER SECTION */}
export function CtaBanner() {
  return (
    <section className="px-4 py-20 relative overflow-hidden">
      <div className="mx-auto max-w-5xl p-10 rounded-3xl bg-gradient-to-r from-primary/10 via-card to-card border border-primary/30 text-center space-y-6 shadow-2xl relative">
        <Reveal>
          <h2 className="text-3xl font-bold md:text-5xl font-display leading-tight">
            Ready to ship software <span className="text-gradient">faster than ever</span>?
          </h2>
          <p className="mt-3 text-sm text-muted-foreground max-w-lg mx-auto">
            Join over 10,000 engineers building real-world applications with BuildVerse.
          </p>
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="px-8 py-3.5 rounded-full bg-primary text-primary-foreground font-black text-xs shadow-xl shadow-primary/25 hover:scale-105 transition-all"
            >
              Start Free Trial Now →
            </Link>
            <Link
              to="/docs"
              className="px-8 py-3.5 rounded-full bg-surface-elevated border border-border text-foreground font-bold text-xs hover:border-primary transition-all"
            >
              Read Documentation
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-border px-4 py-14">
      <div className="mx-auto flex max-w-5xl flex-col gap-8 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-display text-2xl font-bold">
            buildverse<span className="text-primary">.</span>
          </p>
          <p className="mt-2 max-w-xs text-sm text-muted-foreground">
            A software platform for developers who never stop building.
          </p>
        </div>
        <div className="flex gap-10 text-sm text-muted-foreground">
          <ul className="space-y-2">
            <li className="text-foreground font-bold">Learn</li>
            <li>
              <Link to="/features" className="hover:text-foreground transition-colors">Features</Link>
            </li>
            <li>
              <Link to="/templates" className="hover:text-foreground transition-colors">Templates</Link>
            </li>
          </ul>
          <ul className="space-y-2">
            <li className="text-foreground font-bold">Company</li>
            <li>
              <Link to="/about" className="hover:text-foreground transition-colors">About</Link>
            </li>
            <li>
              <Link to="/pricing" className="hover:text-foreground transition-colors">Pricing</Link>
            </li>
            <li>
              <Link to="/docs" className="hover:text-foreground transition-colors">Docs</Link>
            </li>
          </ul>
        </div>
      </div>
      <p className="mx-auto mt-10 max-w-5xl text-xs text-muted-foreground">
        © {new Date().getFullYear()} BuildVerse. All rights reserved.
      </p>
    </footer>
  );
}

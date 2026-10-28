import React, { useState, useEffect } from "react";
import { Reveal, Tag } from "./Reveal";
import {
  Sparkles,
  Star,
  Award,
  GitPullRequest,
  CheckCircle2,
  TrendingUp,
  MessageSquare,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { fetchLeaderboard, fetchMentorReviews } from "@/lib/workspace";

export function BuildverseScoreSection() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [leaders, revs] = await Promise.all([
          fetchLeaderboard(),
          fetchMentorReviews(),
        ]);
        setLeaderboard(leaders);
        setReviews(revs);
      } catch {
        /* Fallback */
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const totalPoints = reviews.reduce((sum, r) => sum + (r.gitPoints || 0), 0) + 1250;
  const approvedCount = reviews.filter((r) => r.status === "Approved").length;

  const defaultLeaderboard = [
    {
      rank: 1,
      name: "Aarav Patel",
      score: 1840,
      badge: "Grandmaster Architect",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
      rating: 5.0,
      approvedPRs: 14,
    },
    {
      rank: 2,
      name: "Priya Sharma",
      score: 1620,
      badge: "Lead Systems Engineer",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
      rating: 4.9,
      approvedPRs: 11,
    },
    {
      rank: 3,
      name: "Rohan Varma",
      score: 1410,
      badge: "Senior Full-Stack Builder",
      avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150",
      rating: 4.8,
      approvedPRs: 9,
    },
  ];

  const displayLeaders = leaderboard.length > 0 ? leaderboard : defaultLeaderboard;

  return (
    <section id="buildverse-score" className="px-4 py-24 border-t border-border bg-gradient-to-b from-background via-[#08090A] to-background relative overflow-hidden">
      {/* GLOW EFFECT */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-primary/10 rounded-full blur-3xl opacity-50" />

      <div className="mx-auto max-w-5xl relative z-10 space-y-14">
        {/* SECTION HEADER */}
        <Reveal className="text-center">
          <Tag>Live Telemetry & Evaluation</Tag>
          <h2 className="mt-4 text-3xl font-bold md:text-5xl font-display text-white">
            BuildVerse Score & <span className="text-primary font-black">GitPoints</span>
          </h2>
          <p className="mt-3 max-w-xl mx-auto text-sm text-muted-foreground">
            Earned through rigorous mentor code reviews, architectural critique comments, and 5-star evaluations.
            Your score directly proves your ability to ship production software.
          </p>
        </Reveal>

        {/* 3 SCORING ENGINE PILLARS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Reveal delay={60}>
            <div className="p-6 rounded-3xl bg-card border border-border space-y-3 hover:border-primary/50 transition-all shadow-xl">
              <div className="w-12 h-12 rounded-2xl bg-primary/15 border border-primary/30 flex items-center justify-center text-primary">
                <GitPullRequest className="w-6 h-6" />
              </div>
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white font-display">PR Review Approval</h3>
                <span className="text-xs font-black text-primary bg-primary/10 px-2.5 py-0.5 rounded-full border border-primary/20">
                  +50 pts
                </span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                When a verified mentor audits your repository and stamps your pull request as approved.
              </p>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <div className="p-6 rounded-3xl bg-card border border-border space-y-3 hover:border-amber-500/50 transition-all shadow-xl">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Star className="w-6 h-6 fill-amber-400" />
              </div>
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white font-display">Star Rating Quality</h3>
                <span className="text-xs font-black text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                  +20 pts / ★
                </span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Mentors award 1 to 5 stars based on code cleanliness, typing, test coverage, and documentation.
              </p>
            </div>
          </Reveal>

          <Reveal delay={180}>
            <div className="p-6 rounded-3xl bg-card border border-border space-y-3 hover:border-sky-500/50 transition-all shadow-xl">
              <div className="w-12 h-12 rounded-2xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400">
                <MessageSquare className="w-6 h-6" />
              </div>
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white font-display">Critique Engagement</h3>
                <span className="text-xs font-black text-sky-400 bg-sky-500/10 px-2.5 py-0.5 rounded-full border border-sky-500/20">
                  +10 pts
                </span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Every architectural comment, query clarification, and performance feedback note awards active points.
              </p>
            </div>
          </Reveal>
        </div>

        {/* LIVE LEADERBOARD SHOWCASE */}
        <Reveal delay={200}>
          <div className="p-7 rounded-3xl bg-card border border-primary/30 shadow-2xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-primary">
                  Leaderboard Telemetry
                </span>
                <h3 className="text-xl font-black text-white font-display mt-0.5">
                  Top Student Engineers by BuildVerse Score
                </h3>
              </div>

              <div className="flex items-center space-x-4 text-xs font-mono">
                <div className="flex items-center space-x-1.5 text-primary">
                  <Zap className="w-4 h-4" />
                  <span><strong>{totalPoints.toLocaleString()}</strong> GitPoints Circulating</span>
                </div>
                <div className="flex items-center space-x-1.5 text-sky-400">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Verified Mentors</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {displayLeaders.map((leader, i) => (
                <div
                  key={leader.id || i}
                  className="p-4 rounded-2xl bg-surface-elevated border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-primary/40 transition-all"
                >
                  <div className="flex items-center space-x-4">
                    <span
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs shrink-0 ${
                        i === 0
                          ? "bg-amber-400 text-black shadow-md shadow-amber-400/30"
                          : i === 1
                          ? "bg-zinc-300 text-black"
                          : i === 2
                          ? "bg-amber-700 text-white"
                          : "bg-surface text-muted-foreground"
                      }`}
                    >
                      #{leader.rank || i + 1}
                    </span>

                    <img
                      src={leader.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150"}
                      alt={leader.name}
                      className="w-10 h-10 rounded-2xl border border-primary/30 object-cover"
                    />

                    <div>
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-bold text-white font-display">{leader.name}</p>
                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                          {leader.badge || "Verified Builder"}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">{leader.email || "Active Engineer"}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-5 self-end sm:self-center">
                    <div className="text-right">
                      <div className="flex items-center space-x-1 justify-end">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span className="text-xs font-bold text-white">5.0</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground">Mentor Rating</p>
                    </div>

                    <div className="text-right min-w-[110px]">
                      <span className="text-lg font-black text-primary font-display">
                        {(leader.score || leader.gitPoints || 150).toLocaleString()}
                      </span>
                      <p className="text-[10px] text-muted-foreground uppercase font-mono">GitPoints</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
              <span className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Score dynamically recalculates with every code review, rating, and PR submission.</span>
              </span>

              <Link
                to="/register"
                className="text-sky-400 font-bold hover:underline inline-flex items-center space-x-1"
              >
                <span>Join workspace & earn your score →</span>
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

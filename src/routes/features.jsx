import React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Nav, Footer } from "@/components/landing/Sections";
import {
  Sparkles,
  Zap,
  ShieldCheck,
  Cpu,
  Layers,
  Terminal,
  Globe2,
  Workflow,
  Code2,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

export const Route = createFileRoute("/features")({
  component: FeaturesPage,
});

function FeaturesPage() {
  const featureList = [
    {
      title: "Lumina WebGPU Engine",
      desc: "Zero-latency 3D & 2D rendering pipeline built in Rust for high-throughput browser experiences.",
      icon: Cpu,
      badge: "High Performance",
    },
    {
      title: "Synapse Microservices CLI",
      desc: "Automated container orchestration and local development environment management in Go.",
      icon: Terminal,
      badge: "DevOps First",
    },
    {
      title: "Design System 2.0 Tokens",
      desc: "Atomic design primitives, fluid typography, dark mode tokens, and accessible component specs.",
      icon: Layers,
      badge: "UI / UX Craft",
    },
    {
      title: "MongoDB Live Data Persistence",
      desc: "Real-time Mongoose schemas with indexed collection queries and seamless Express API integration.",
      icon: ShieldCheck,
      badge: "Database",
    },
    {
      title: "WebSocket Live Sync",
      desc: "Real-time collaborative workspace channels and instant telemetry feed for distributed teams.",
      icon: Workflow,
      badge: "Real-Time",
    },
    {
      title: "Cross-Platform React Native",
      desc: "Shared design tokens and responsive UI architecture running natively on Android, iOS, and Web.",
      icon: Globe2,
      badge: "Mobile & Web",
    },
  ];

  return (
    <main className="min-h-screen bg-[#09090B] text-foreground">
      <Nav />

      {/* HERO BANNER */}
      <section className="relative pt-32 pb-20 px-6 max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold mb-6">
          <Sparkles className="w-4 h-4" />
          <span>System Capabilities & Architecture</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white max-w-4xl mx-auto leading-tight">
          Engineered for developers who never compromise on craft.
        </h1>

        <p className="mt-6 text-base text-zinc-400 max-w-2xl mx-auto leading-relaxed">
          Explore the full ecosystem of tools powering BuildVerse — from high-throughput Rust WebGPU graphics to live MongoDB telemetry.
        </p>
      </section>

      {/* FEATURE GRID */}
      <section className="py-12 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featureList.map((f, idx) => {
            const Icon = f.icon;
            return (
              <div
                key={idx}
                className="p-8 rounded-3xl bg-[#121215] border border-[#27272A] hover:border-amber-500/40 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-black transition-colors">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-[#18181B] text-zinc-300 border border-[#27272A]">
                      {f.badge}
                    </span>
                  </div>

                  <h3 className="text-xl font-extrabold text-white mb-3">{f.title}</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">{f.desc}</p>
                </div>

                <div className="mt-8 pt-4 border-t border-[#27272A] flex items-center text-xs font-bold text-amber-500 group-hover:translate-x-1 transition-transform">
                  <span>Explore Architecture</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA FOOTER BANNER */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="p-10 rounded-3xl bg-gradient-to-r from-amber-500 to-amber-400 text-black flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl shadow-amber-500/20">
          <div>
            <h2 className="text-3xl font-black tracking-tight">Ready to build your next release?</h2>
            <p className="text-sm font-semibold text-black/80 mt-2">
              Launch into the BuildVerse console and start shipping high-craft applications.
            </p>
          </div>

          <Link
            to="/register"
            className="px-6 py-3 rounded-2xl bg-black text-white text-xs font-extrabold hover:bg-zinc-900 transition-colors shadow-lg"
          >
            Create Account Free →
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}

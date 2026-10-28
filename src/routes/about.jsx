import React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Nav, Footer } from "@/components/landing/Sections";
import { Sparkles, Heart, Shield, Code, Rocket, Award } from "lucide-react";

export const Route = createFileRoute("/about")({
  component: AboutPage,
});

function AboutPage() {
  return (
    <main className="min-h-screen bg-[#09090B] text-foreground">
      <Nav />

      {/* HERO BANNER */}
      <section className="relative pt-32 pb-20 px-6 max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold mb-6">
          <Sparkles className="w-4 h-4" />
          <span>Our Story & Philosophy</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white max-w-4xl mx-auto leading-tight">
          Built for builders who care about the details.
        </h1>

        <p className="mt-6 text-base text-zinc-400 max-w-2xl mx-auto leading-relaxed">
          BuildVerse (Nexus) was born from a passion for ultra-fast, high-craft web software. We empower engineers to ship production systems without sacrificing visual rhythm or performance.
        </p>
      </section>

      {/* VALUES GRID */}
      <section className="py-12 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 rounded-3xl bg-[#121215] border border-[#27272A]">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center mb-6">
              <Rocket className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-extrabold text-white mb-3">Speed Without Rot</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              We design software architectures that stay fast as you scale — from Rust WebGPU pipelines to MongoDB database indexes.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-[#121215] border border-[#27272A]">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center mb-6">
              <Heart className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-extrabold text-white mb-3">High Craft Aesthetic</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Aesthetics matter. Dark modes, subtle glassmorphism, fluid micro-animations, and clean typography elevate user trust.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-[#121215] border border-[#27272A]">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center mb-6">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-extrabold text-white mb-3">Open Ecosystem</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Full transparency with open REST APIs, WebSocket events, and customizable design token standards.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

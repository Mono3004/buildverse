import React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Nav, Footer } from "@/components/landing/Sections";
import { Sparkles, Layers, ArrowRight, Star } from "lucide-react";

export const Route = createFileRoute("/templates")({
  component: TemplatesPage,
});

function TemplatesPage() {
  const templateList = [
    {
      title: "Lumina WebGPU Engine",
      category: "Graphics & 3D",
      desc: "A high-performance rendering engine built for the modern web using WebGPU and Rust.",
      stars: "7.6k",
      tag: "Rust / WebGPU",
    },
    {
      title: "Synapse Microservices CLI",
      category: "DevOps & CLI",
      desc: "An intelligent command-line interface for managing distributed microservices with ease.",
      stars: "842",
      tag: "Go / Docker",
    },
    {
      title: "Design System 2.0 Template",
      category: "Design System",
      desc: "Full component library specs, tokens, fluid typography, and dark mode tokens.",
      stars: "3.2k",
      tag: "React / Tailwind",
    },
  ];

  return (
    <main className="min-h-screen bg-[#09090B] text-foreground">
      <Nav />

      <section className="relative pt-32 pb-16 px-6 max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold mb-6">
          <Sparkles className="w-4 h-4" />
          <span>Showcase & Starter Repositories</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white max-w-4xl mx-auto leading-tight">
          Jumpstart your stack with high-craft templates.
        </h1>
      </section>

      <section className="py-12 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {templateList.map((t, idx) => (
            <div key={idx} className="p-6 rounded-3xl bg-[#121215] border border-[#27272A] flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
                    {t.tag}
                  </span>
                  <span className="flex items-center text-xs font-bold text-amber-500">
                    <Star className="w-3.5 h-3.5 mr-1 fill-amber-500" />
                    {t.stars}
                  </span>
                </div>

                <h3 className="text-xl font-extrabold text-white mt-4">{t.title}</h3>
                <p className="text-xs text-zinc-400 mt-2 leading-relaxed">{t.desc}</p>
              </div>

              <div className="pt-4 border-t border-[#27272A]">
                <Link
                  to="/register"
                  className="w-full block text-center py-2.5 rounded-xl bg-[#18181B] text-white border border-[#27272A] text-xs font-bold hover:border-amber-500/40 transition-all"
                >
                  Use Template →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </main>
  );
}

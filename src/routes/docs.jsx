import React, { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Nav, Footer } from "@/components/landing/Sections";
import { Terminal, Code2, Server, Database, Sparkles, BookOpen } from "lucide-react";

export const Route = createFileRoute("/docs")({
  component: DocsPage,
});

function DocsPage() {
  const [activeSection, setActiveSection] = useState("quickstart");

  return (
    <main className="min-h-screen bg-[#09090B] text-foreground">
      <Nav />

      <div className="pt-28 pb-20 px-6 max-w-7xl mx-auto flex flex-col md:flex-row gap-8">
        {/* DOCS NAVIGATION SIDEBAR */}
        <aside className="w-full md:w-64 bg-[#121215] border border-[#27272A] p-4 rounded-2xl shrink-0 h-fit">
          <div className="flex items-center space-x-2 px-3 py-2 mb-4 border-b border-[#27272A] text-white font-bold text-sm">
            <BookOpen className="w-4 h-4 text-amber-500" />
            <span>Documentation</span>
          </div>

          <nav className="space-y-1">
            {[
              { id: "quickstart", label: "Quick Start Guide" },
              { id: "architecture", label: "System Architecture" },
              { id: "rest-api", label: "REST API Endpoints" },
              { id: "websockets", label: "WebSocket Events" },
              { id: "database", label: "MongoDB Schemas" },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeSection === item.id
                    ? "bg-amber-500 text-black shadow-md shadow-amber-500/20"
                    : "text-zinc-400 hover:text-white hover:bg-[#18181B]"
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* DOCS CONTENT */}
        <div className="flex-1 bg-[#121215] border border-[#27272A] p-8 rounded-3xl space-y-6">
          {activeSection === "quickstart" && (
            <div className="space-y-4">
              <h1 className="text-2xl font-black text-white">BuildVerse Quick Start Guide</h1>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Learn how to connect your React Native mobile app or frontend to the BuildVerse Express & MongoDB API server.
              </p>

              <div className="p-4 rounded-2xl bg-[#18181B] border border-[#27272A] space-y-2">
                <p className="text-xs font-bold text-amber-400 font-mono">1. Start Backend API Server</p>
                <pre className="text-xs font-mono text-zinc-300 bg-black/50 p-3 rounded-xl overflow-x-auto">
                  cd backend && npm run dev
                </pre>
              </div>

              <div className="p-4 rounded-2xl bg-[#18181B] border border-[#27272A] space-y-2">
                <p className="text-xs font-bold text-amber-400 font-mono">2. Start React Native Mobile App</p>
                <pre className="text-xs font-mono text-zinc-300 bg-black/50 p-3 rounded-xl overflow-x-auto">
                  cd mobile && npx expo start
                </pre>
              </div>
            </div>
          )}

          {activeSection === "rest-api" && (
            <div className="space-y-4">
              <h1 className="text-2xl font-black text-white">REST API Endpoints Reference</h1>
              <p className="text-xs text-zinc-400">All requests are prefixed with base URL <code className="text-amber-400">/api/v1</code>.</p>

              <div className="space-y-3 text-xs font-mono">
                <div className="p-3 rounded-xl bg-[#18181B] border border-[#27272A]">
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold mr-2">GET</span>
                  <span className="text-white">/api/v1/projects</span>
                  <p className="text-zinc-500 font-sans text-xs mt-1">Fetches all projects from MongoDB buildverse DB.</p>
                </div>

                <div className="p-3 rounded-xl bg-[#18181B] border border-[#27272A]">
                  <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 font-bold mr-2">POST</span>
                  <span className="text-white">/api/v1/projects</span>
                  <p className="text-zinc-500 font-sans text-xs mt-1">Creates a new project document.</p>
                </div>
              </div>
            </div>
          )}

          {activeSection !== "quickstart" && activeSection !== "rest-api" && (
            <div className="space-y-4">
              <h1 className="text-2xl font-black text-white capitalize">{activeSection.replace("-", " ")}</h1>
              <p className="text-xs text-zinc-400">
                Detailed architecture specifications and code references for {activeSection}.
              </p>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </main>
  );
}

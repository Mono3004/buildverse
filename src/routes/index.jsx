import React from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Community,
  Footer,
  Hero,
  Mentors,
  Nav,
  Pricing,
  Skills,
  Testimonials,
  TerminalSyncSection,
  FAQSection,
  CtaBanner,
} from "@/components/landing/Sections";
import { Craft } from "@/components/landing/Craft";
import { BuildverseScoreSection } from "@/components/landing/BuildverseScoreSection";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "BuildVerse — Software & Engineering Architecture Platform" },
      {
        name: "description",
        content:
          "Lessons, live workshops, bi-directional VS Code Git sync, mentors and a developer community.",
      },
      { property: "og:title", content: "BuildVerse — Engineering school for people who ship" },
      {
        property: "og:description",
        content: "Lessons, live workshops, mentors and a live developer community.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <main className="min-h-screen bg-background">
      <Nav />
      <Hero />
      <Skills />
      <BuildverseScoreSection />
      <TerminalSyncSection />
      <Craft />
      <Community />
      <Mentors />
      <Testimonials />
      <Pricing />
      <FAQSection />
      <CtaBanner />
      <Footer />
    </main>
  );
}

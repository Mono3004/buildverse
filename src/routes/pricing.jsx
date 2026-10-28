import React, { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Nav, Footer } from "@/components/landing/Sections";
import { Check, Sparkles, Zap, Shield, HelpCircle } from "lucide-react";

export const Route = createFileRoute("/pricing")({
  component: PricingPage,
});

function PricingPage() {
  const [billingCycle, setBillingCycle] = useState("annual");

  const plans = [
    {
      name: "Student Creator",
      price: "₹0",
      period: "/forever",
      desc: "For student developers, solo builders, and engineering enthusiasts building foundational projects.",
      features: [
        "Up to 3 Active Projects",
        "Community Support Channel",
        "MongoDB Free Sandbox Cluster",
        "Basic Design Tokens & Icons",
        "Public Developer Portfolio",
      ],
      popular: false,
      cta: "Get Started Free",
    },
    {
      name: "Pro Engineer",
      price: billingCycle === "annual" ? "₹1,199" : "₹1,499",
      period: "/month",
      desc: "For aspiring software architects and teams requiring full API access, mentor reviews, and WebSockets.",
      features: [
        "Unlimited Active Projects",
        "Lumina WebGPU Engine Access",
        "Synapse Microservices CLI",
        "Real-Time WebSocket Channels",
        "Priority 1-on-1 Mentor Reviews",
        "Custom Domain & SSL",
      ],
      popular: true,
      cta: "Start 14-Day Free Trial",
    },
    {
      name: "Campus & Enterprise",
      price: billingCycle === "annual" ? "₹5,999" : "₹7,999",
      period: "/month",
      desc: "For colleges, bootcamps, and organizations demanding dedicated infrastructure, SLA, and custom roles.",
      features: [
        "Everything in Pro Engineer",
        "Dedicated MongoDB Instance",
        "Custom RBAC & Admin Governance",
        "99.99% Uptime SLA Guarantee",
        "Dedicated Account Engineer",
        "SOC2 & GDPR Compliance",
      ],
      popular: false,
      cta: "Contact Enterprise Sales",
    },
  ];

  return (
    <main className="min-h-screen bg-[#08090A] text-foreground">
      <Nav />

      {/* HERO BANNER */}
      <section className="relative pt-32 pb-16 px-6 max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-[#CCFF00]/10 border border-[#CCFF00]/30 text-[#CCFF00] text-xs font-bold mb-6 shadow-lg shadow-[#CCFF00]/10">
          <Sparkles className="w-4 h-4 text-[#CCFF00]" />
          <span>India Tier Pricing & Plans</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white max-w-4xl mx-auto leading-tight font-display">
          Invest in craft. <span className="text-[#CCFF00]">Scale without limits.</span>
        </h1>

        <p className="mt-6 text-base text-zinc-400 max-w-2xl mx-auto leading-relaxed">
          Choose the tier that fits your engineering scope in Indian Rupees (₹). No hidden fees, instant activation.
        </p>

        {/* BILLING TOGGLE */}
        <div className="mt-10 inline-flex items-center p-1.5 rounded-2xl bg-[#0D1117] border border-[#1F2937]">
          <button
            onClick={() => setBillingCycle("monthly")}
            className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
              billingCycle === "monthly" ? "bg-[#CCFF00] text-black shadow-md shadow-[#CCFF00]/20 font-extrabold" : "text-zinc-400 hover:text-white"
            }`}
          >
            Monthly Billing
          </button>
          <button
            onClick={() => setBillingCycle("annual")}
            className={`px-5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
              billingCycle === "annual" ? "bg-[#CCFF00] text-black shadow-md shadow-[#CCFF00]/20 font-extrabold" : "text-zinc-400 hover:text-white"
            }`}
          >
            <span>Annual Billing</span>
            <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-black/30 text-black">Save 20%</span>
          </button>
        </div>
      </section>

      {/* PRICING CARDS */}
      <section className="py-12 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, idx) => (
            <div
              key={idx}
              className={`p-8 rounded-3xl bg-[#0D1117] border transition-all flex flex-col justify-between relative ${
                plan.popular
                  ? "border-[#CCFF00] shadow-2xl shadow-[#CCFF00]/15"
                  : "border-[#1F2937] hover:border-zinc-700"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[#CCFF00] text-black text-[10px] font-black uppercase tracking-wider shadow-md">
                  Most Popular Choice
                </div>
              )}

              <div>
                <h3 className="text-xl font-extrabold text-white font-display">{plan.name}</h3>
                <p className="text-xs text-zinc-400 mt-2 min-h-[36px]">{plan.desc}</p>

                <div className="mt-6 mb-8 flex items-baseline">
                  <span className="text-5xl font-black text-white font-display tracking-tight">{plan.price}</span>
                  {plan.period && <span className="text-xs text-zinc-400 ml-1.5">{plan.period}</span>}
                </div>

                <div className="space-y-3 pt-6 border-t border-[#1F2937]">
                  {plan.features.map((feat, i) => (
                    <div key={i} className="flex items-center space-x-3 text-xs text-zinc-300">
                      <div className="p-0.5 rounded-full bg-[#CCFF00]/20 text-[#CCFF00]">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8">
                <Link
                  to="/register"
                  className={`w-full block text-center py-3 rounded-2xl text-xs font-black transition-all ${
                    plan.popular
                      ? "bg-[#CCFF00] text-black shadow-lg shadow-[#CCFF00]/25 hover:bg-[#b8e600] hover:scale-105"
                      : "bg-[#161B26] text-white border border-[#1F2937] hover:border-[#CCFF00]/40"
                  }`}
                >
                  {plan.cta} →
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

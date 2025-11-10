"use client";

import { useRouter } from "next/navigation";
import {
  ArrowRight,
  DollarSign,
  Lock,
  Shield,
  Sparkles,
  TrendingUp,
  Zap,
} from "lucide-react";

export default function Home() {
  const router = useRouter();

  const stats = [
    { value: "$10M+", label: "Total Volume" },
    { value: "5,000+", label: "Active Users" },
    { value: "98%", label: "Success Rate" },
  ];

  const borrowerFeatures = [
    "NFT-based collateral from remittance history",
    "Interest rates as low as 4.5% APR",
    "Automatic loan repayments",
    "Instant approval with verified history",
  ];

  const lenderFeatures = [
    "Up to 12.5% APY on deposits",
    "Real-time pool analytics",
    "Withdraw anytime with liquidity",
    "Automated diversification",
  ];

  const steps = [
    {
      number: "01",
      title: "Verify History",
      description:
        "Connect your remittance provider to verify your payment history securely.",
      icon: Shield,
      color: "from-blue-500 to-blue-600",
      glow: "shadow-blue-500/50",
    },
    {
      number: "02",
      title: "Mint NFT",
      description:
        "Receive your Remittance NFT with a reliability score as collateral.",
      icon: Zap,
      color: "from-purple-500 to-purple-600",
      glow: "shadow-purple-500/50",
    },
    {
      number: "03",
      title: "Get Funded",
      description: "Apply for loans with competitive rates based on your NFT score.",
      icon: TrendingUp,
      color: "from-emerald-500 to-emerald-600",
      glow: "shadow-emerald-500/50",
    },
    {
      number: "04",
      title: "Auto-Repay",
      description:
        "Automated repayments from your remittance flow—set it and forget it.",
      icon: Lock,
      color: "from-orange-500 to-orange-600",
      glow: "shadow-orange-500/50",
    },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden  text-white">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-24 -top-24 h-96 w-96 rounded-full bg-indigo-400/15 blur-3xl animate-float" />
        <div
          className="absolute -right-20 top-1/4 h-[26rem] w-[26rem] rounded-full bg-purple-400/15 blur-[150px] animate-float"
          style={{ animationDelay: "2s" }}
        />
        <div
          className="absolute -left-10 bottom-0 h-[24rem] w-[24rem] rounded-full bg-cyan-400/15 blur-[140px] animate-float"
          style={{ animationDelay: "4s" }}
        />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col px-4 pb-20 pt-24 sm:px-6 lg:px-8">
        <header className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/40 bg-slate-900/70 px-6 py-3 text-white shadow-lg shadow-indigo-600/20 backdrop-blur">
            <Sparkles className="h-5 w-5 text-indigo-200" />
            <span className="text-sm font-semibold text-gradient-cyber">
              Powered by Arbitrum One
            </span>
          </div>

          <h1 className="mt-10 text-4xl font-bold leading-tight sm:text-6xl md:text-7xl">
            <span className="block text-white">Turn</span>
            <span className="block text-gradient-cyber">Remittance</span>
            <span className="block text-white">Into Capital</span>
          </h1>

          <p className="mx-auto mt-6 max-w-3xl text-lg leading-relaxed text-slate-200 sm:text-xl">
            The first decentralized lending platform where your remittance history becomes your
            credit score.
          </p>

          <p className="mt-4 text-base font-medium text-cyan-300 sm:text-lg">
            No traditional credit check • Instant verification • Automatic repayments
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <button
              type="button"
              onClick={() => router.push("/verify")}
              className="group relative inline-flex items-center gap-2 overflow-hidden rounded-2xl bg-linear-to-r from-indigo-600 via-purple-600 to-cyan-600 px-10 py-5 text-lg font-semibold text-white shadow-2xl shadow-indigo-500/40 transition-transform duration-300 hover:scale-105"
            >
              <span className="relative z-10 flex items-center gap-2">
                Get Started Free
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </span>
              <span className="absolute inset-0 bg-linear-to-r from-indigo-500 via-purple-500 to-cyan-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            </button>

            <button
              type="button"
              onClick={() => router.push("/borrow")}
              className="inline-flex items-center rounded-2xl border border-white/30 bg-slate-900/70 px-10 py-5 text-lg font-semibold text-white shadow-lg shadow-indigo-500/30 transition-all duration-300 hover:border-white/50 hover:bg-slate-900/80 hover:shadow-indigo-500/50"
            >
              View Dashboard
            </button>
          </div>

          <div className="mt-16 grid gap-6 sm:grid-cols-3">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="glass rounded-2xl border border-white/20 bg-slate-900/70 p-6 text-left shadow-lg shadow-indigo-500/40"
              >
                <div className="text-4xl font-bold text-gradient-cyber">{stat.value}</div>
                <div className="mt-2 text-sm text-slate-200/70">{stat.label}</div>
              </div>
            ))}
          </div>
        </header>

        <main className="mt-24 space-y-24">
          <section className="grid gap-8 md:grid-cols-2">
            <div className="group relative overflow-hidden rounded-3xl border border-indigo-500/20 bg-slate-900/80 p-10 shadow-xl shadow-indigo-500/40 transition-transform duration-300 hover:-translate-y-2">
              <div className="absolute right-10 top-10 h-32 w-32 rounded-full bg-linear-to-br from-indigo-500 to-purple-500 opacity-20 blur-3xl transition-opacity group-hover:opacity-40" />
              <div className="relative z-10 space-y-6">
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-linear-to-br from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-300/50 transition-transform group-hover:scale-110 group-hover:rotate-3">
                  <DollarSign className="h-10 w-10" />
                </div>
                <h2 className="text-3xl font-bold text-white">For Borrowers</h2>
                <p className="text-base leading-relaxed text-slate-200">
                  Transform your remittance history into instant collateral. No credit checks, no
                  paperwork.
                </p>
                <ul className="space-y-4">
                  {borrowerFeatures.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-sm text-slate-200">
                      <span className="mt-0.5 inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-200">
                        ✓
                      </span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={() => router.push("/verify")}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-linear-to-r from-indigo-600 to-purple-600 px-6 py-4 text-base font-semibold text-white shadow-lg shadow-indigo-300/50 transition-transform hover:scale-105"
                >
                  Start Borrowing
                  <ArrowRight className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-3xl border border-cyan-500/20 bg-slate-900/80 p-10 shadow-xl shadow-cyan-500/40 transition-transform duration-300 hover:-translate-y-2">
              <div className="absolute right-10 top-10 h-32 w-32 rounded-full bg-linear-to-br from-cyan-500 to-emerald-500 opacity-20 blur-3xl transition-opacity group-hover:opacity-40" />
              <div className="relative z-10 space-y-6">
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-linear-to-br from-cyan-500 to-emerald-500 text-white shadow-lg shadow-cyan-300/50 transition-transform group-hover:scale-110 group-hover:rotate-3">
                  <TrendingUp className="h-10 w-10" />
                </div>
                <h2 className="text-3xl font-bold text-white">For Lenders</h2>
                <p className="text-base leading-relaxed text-slate-200">
                  Earn competitive yields by providing liquidity to verified borrowers.
                </p>
                <ul className="space-y-4">
                  {lenderFeatures.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-sm text-slate-200">
                      <span className="mt-0.5 inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-200">
                        ✓
                      </span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={() => router.push("/lend")}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-linear-to-r from-cyan-600 to-emerald-600 px-6 py-4 text-base font-semibold text-white shadow-lg shadow-cyan-300/50 transition-transform hover:scale-105"
                >
                  Start Lending
                  <ArrowRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-white/10 bg-slate-900/80 p-16 shadow-2xl shadow-indigo-500/30">
            <div className="text-center">
              <h2 className="text-4xl font-bold text-white sm:text-5xl">
                How It <span className="text-gradient-cyber">Works</span>
              </h2>
              <p className="mt-4 text-lg text-slate-200/80">
                Four simple steps to financial freedom
              </p>
            </div>

            <div className="mt-14 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              {steps.map((step) => {
                const Icon = step.icon;
                return (
                  <div
                    key={step.number}
                    className="group rounded-2xl border border-white/10 bg-slate-900/70 p-8 shadow-lg shadow-indigo-500/20 transition-transform duration-300 hover:-translate-y-2"
                  >
                    <div
                      className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-linear-to-br ${step.color} text-white shadow-lg ${step.glow} transition-transform group-hover:scale-110 group-hover:rotate-6`}
                    >
                      <Icon className="h-8 w-8" />
                    </div>
                    <div
                      className={`mt-6 text-4xl font-bold bg-linear-to-br ${step.color} bg-clip-text text-transparent`}
                    >
                      {step.number}
                    </div>
                    <h3 className="mt-4 text-xl font-semibold text-white">
                      {step.title}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-slate-200/80">
                      {step.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900/80 px-10 py-16 text-center shadow-2xl shadow-indigo-500/30">
            <div className="absolute inset-0 bg-linear-to-r from-indigo-500/20 via-purple-500/20 to-cyan-500/20 animate-gradient" />
            <div className="relative z-10 space-y-6">
              <h2 className="text-4xl font-bold text-white sm:text-5xl">
                Ready to <span className="text-gradient-cyber">Transform</span> Your Future?
              </h2>
              <p className="mx-auto max-w-2xl text-lg text-slate-200/80">
                Join thousands leveraging their remittance history for instant capital.
              </p>
              <button
                type="button"
                onClick={() => router.push("/verify")}
                className="inline-flex items-center gap-3 rounded-2xl bg-linear-to-r from-indigo-600 via-purple-600 to-cyan-600 px-12 py-5 text-lg font-semibold text-white shadow-2xl shadow-indigo-500/50 transition-transform hover:scale-105"
              >
                Start Verification Now
                <ArrowRight className="h-6 w-6" />
              </button>
            </div>
          </section>
        </main>

        <footer className="mt-24">
          <div className="rounded-2xl border border-white/10 bg-slate-900/80 px-8 py-6 text-sm text-slate-200/80 shadow-lg shadow-indigo-500/20 sm:px-12">
            <p>© 2025 RemitLend. All rights reserved. Built on Arbitrum.</p>
            <div className="mt-4 flex justify-center gap-6 text-xs uppercase tracking-[0.35em] text-indigo-200">
              <a className="transition-colors hover:text-indigo-100" href="#">
                Privacy
              </a>
              <a className="transition-colors hover:text-indigo-100" href="#">
                Terms
              </a>
              <a className="transition-colors hover:text-indigo-100" href="#">
                Docs
              </a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

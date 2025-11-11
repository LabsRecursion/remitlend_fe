"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import {
  AlertCircle,
  Award,
  CheckCircle,
  Clock,
  Loader2,
} from "lucide-react";

type VerificationStep = "connect" | "processing" | "complete" | "failed";

interface VerificationData {
  provider: string;
  accountId: string;
  monthlyAmount: number;
  historyMonths: number;
  totalSent: number;
  reliabilityScore: number;
  nftTokenId: number;
  txHash: string;
}

const providers = [
  { id: "wise", name: "Wise (TransferWise)", emoji: "💳" },
  { id: "western_union", name: "Western Union", emoji: "🌍" },
  { id: "paypal", name: "PayPal", emoji: "💰" },
  { id: "remitly", name: "Remitly", emoji: "📱" },
];

const steps = [
  { id: "connect", label: "Connect Arbitrum Oracle" },
  { id: "processing", label: "Verification" },
  { id: "complete", label: "NFT Minted" },
] as const;

const scoreColor = (score: number) => {
  if (score >= 90) return "text-emerald-400 border-emerald-400";
  if (score >= 80) return "text-amber-300 border-amber-300";
  if (score >= 70) return "text-orange-300 border-orange-300";
  return "text-rose-400 border-rose-400";
};

const scoreMeaning = (score: number) => {
  if (score >= 90) return "Excellent – unlocks the best liquidity terms.";
  if (score >= 80) return "Very good – qualifies for premium APY tiers.";
  if (score >= 70) return "Good – access standard credit lines immediately.";
  return "Fair – continue building remittance history to unlock more.";
};

const createFakeHash = () => {
  const alphabet = "abcdef0123456789";
  let hash = "0x";
  for (let i = 0; i < 64; i += 1) {
    hash += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return hash;
};

export default function VerifyPage() {
  const { address } = useAccount();
  const connected = Boolean(address);

  const [currentStep, setCurrentStep] = useState<VerificationStep>("connect");
  const [selectedProvider, setSelectedProvider] = useState<string>("");
  const [accountId, setAccountId] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verificationData, setVerificationData] = useState<VerificationData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleVerification = async () => {
    if (!selectedProvider || !accountId) return;

    setError(null);
    setIsSubmitting(true);
    setCurrentStep("processing");

    try {
      // Mimic oracle verification delay
      await new Promise((resolve) => {
        setTimeout(resolve, 2200);
      });

      const mockData = {
        provider: selectedProvider,
        accountId,
        monthlyAmount: 2500,
        historyMonths: 18,
        totalSent: 45000,
        reliabilityScore: 92,
        nftTokenId: Math.floor(Math.random() * 9000 + 1000),
        txHash: createFakeHash(),
      };

      setVerificationData(mockData);
      setCurrentStep("complete");
    } catch (err) {
      console.error(err);
      setError("We couldn’t complete verification. Please try again.");
      setCurrentStep("failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetFlow = () => {
    setCurrentStep("connect");
    setSelectedProvider("");
    setAccountId("");
    setVerificationData(null);
    setError(null);
  };

  if (!connected) {
    return (
      <div className="relative flex min-h-[70vh] items-center justify-center">
        <div className="glass max-w-md rounded-3xl border border-white/10 bg-slate-950/70 px-10 py-12 text-center shadow-2xl shadow-indigo-500/20">
          <AlertCircle className="mx-auto mb-6 h-16 w-16 text-amber-300" />
          <h2 className="text-3xl font-semibold text-white">Connect your wallet</h2>
          <p className="mt-3 text-sm text-slate-300">
            You’ll need to connect an Arbitrum-compatible wallet to start the remittance
            verification flow.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative mx-auto max-w-5xl px-4 pb-24 pt-20 sm:px-6 lg:px-8">
      <header className="text-center">
        <h1 className="text-4xl font-semibold text-white sm:text-5xl">
          Remittance Verification
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base text-slate-300 sm:text-lg">
          Verify off-chain history, mint an Arbitrum-native collateral NFT, and unlock liquidity in
          minutes.
        </p>
      </header>

      <div className="mt-14 flex flex-wrap items-center justify-center gap-6 text-sm font-semibold uppercase tracking-[0.35em] text-indigo-200">
        {steps.map((step, index) => {
          const isCompleted =
            currentStep === "complete" || (currentStep === "processing" && index < 2);
          const isActive = currentStep === step.id;

          return (
            <div key={step.id} className="flex items-center gap-6">
              <div className="flex flex-col items-center gap-3">
                <div
                  className={`flex h-14 w-14 items-center justify-center rounded-full border-2 text-base shadow-lg transition-all duration-300 ${
                    isCompleted
                      ? "border-emerald-400 bg-emerald-500 text-white shadow-emerald-500/40"
                      : isActive
                      ? "border-indigo-400 bg-indigo-500 text-white shadow-indigo-500/40"
                      : "border-white/20 bg-white/10 text-slate-300"
                  }`}
                >
                  {isCompleted ? <CheckCircle className="h-6 w-6" /> : index + 1}
                </div>
                <span
                  className={`text-xs font-semibold ${
                    isCompleted
                      ? "text-emerald-300"
                      : isActive
                      ? "text-indigo-300"
                      : "text-slate-400"
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className="h-1 w-20 overflow-hidden rounded-full bg-white/10">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 transition-all duration-500 ${
                      isCompleted ? "w-full" : "w-0"
                    }`}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {currentStep === "connect" && (
        <div className="glass mt-12 rounded-3xl border border-white/10 bg-slate-950/70 p-10 shadow-[0_25px_80px_-40px_rgba(79,70,229,0.65)]">
          <h2 className="text-2xl font-semibold text-white">Choose a provider</h2>
          <p className="mt-3 text-sm text-slate-300">
            RemitLend connects to major remittance partners to generate your credit NFT.
          </p>

          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {providers.map((provider) => {
              const isSelected = selectedProvider === provider.id;
              return (
                <button
                  key={provider.id}
                  type="button"
                  onClick={() => setSelectedProvider(provider.id)}
                  className={`group flex flex-col items-center gap-3 rounded-2xl border-2 px-8 py-10 text-white transition-all duration-300 ${
                    isSelected
                      ? "border-indigo-400 bg-indigo-500/20 shadow-lg shadow-indigo-500/30"
                      : "border-white/10 bg-white/5 hover:border-indigo-400 hover:bg-white/10"
                  }`}
                >
                  <span className="text-4xl">{provider.emoji}</span>
                  <span className="text-sm font-semibold tracking-wide">{provider.name}</span>
                </button>
              );
            })}
          </div>

          {selectedProvider && (
            <div className="mt-8">
              <label className="block text-xs font-semibold uppercase tracking-[0.35em] text-indigo-200">
                Account ID / Email
              </label>
              <input
                value={accountId}
                onChange={(event) => setAccountId(event.target.value)}
                placeholder="Enter the identifier you use with this provider"
                className="mt-3 w-full rounded-2xl border border-white/10 bg-slate-900/60 px-5 py-4 text-sm text-white shadow-inner focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/30"
              />
              <p className="mt-2 text-xs text-slate-400">
                We use this only to request your remittance report from the oracle network.
              </p>
            </div>
          )}

          <button
            type="button"
            onClick={() => void handleVerification()}
            disabled={!selectedProvider || !accountId || isSubmitting}
            className="mt-10 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500 px-8 py-4 text-sm font-semibold uppercase tracking-[0.35em] text-white transition-all duration-300 hover:scale-105 disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-slate-400"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Initialising oracle...
              </>
            ) : (
              "Start verification"
            )}
          </button>

          <div className="mt-6 rounded-2xl border border-indigo-500/30 bg-indigo-500/10 px-5 py-4 text-xs text-indigo-200/80">
            🔒 Encrypted end-to-end. RemitLend never stores your credentials—only the oracle does.
          </div>
        </div>
      )}

      {currentStep === "processing" && (
        <div className="glass mt-12 flex flex-col items-center gap-8 rounded-3xl border border-white/10 bg-slate-950/70 px-10 py-12 text-white shadow-2xl shadow-indigo-500/30">
          <Clock className="h-20 w-20 text-indigo-300" />
          <h2 className="text-3xl font-semibold">Verifying remittance history</h2>
          <p className="max-w-xl text-center text-sm text-slate-300">
            The oracle network is fetching statements from{" "}
            <span className="font-semibold text-indigo-200">
              {providers.find((p) => p.id === selectedProvider)?.name}
            </span>{" "}
            and compiling an on-chain credit score. This should take about two minutes.
          </p>
          <div className="w-full space-y-3">
            <div className="flex items-center gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
              <CheckCircle className="h-5 w-5" />
              Connected to provider successfully
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-200">
              <Loader2 className="h-5 w-5 animate-spin" />
              Fetching payment history...
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-200">
              <Loader2 className="h-5 w-5 animate-spin" />
              Computing reliability score...
            </div>
          </div>
        </div>
      )}

      {currentStep === "complete" && verificationData && (
        <div className="glass mt-12 space-y-10 rounded-3xl border border-white/10 bg-slate-950/70 p-10 shadow-[0_35px_120px_-50px_rgba(79,70,229,0.85)]">
          <div className="text-center">
            <CheckCircle className="mx-auto h-16 w-16 text-emerald-400" />
            <h2 className="mt-4 text-3xl font-semibold text-white">Verification complete!</h2>
            <p className="mt-3 text-sm text-slate-300">
              Your Arbitrum credit NFT has been minted and is ready to use as collateral.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-indigo-600/30 via-purple-600/30 to-cyan-500/30 p-8 shadow-xl">
            <div className="flex flex-col items-center gap-8 lg:flex-row lg:items-start lg:justify-between">
              <div className="text-left">
                <div className="flex items-center gap-3">
                  <Award className="h-8 w-8 text-indigo-200" />
                  <h3 className="text-xl font-semibold text-white">
                    Remit NFT #{verificationData.nftTokenId}
                  </h3>
                </div>
                <p className="mt-2 text-sm text-indigo-100/80">
                  {providers.find((p) => p.id === verificationData.provider)?.name} •{" "}
                  {verificationData.historyMonths} month history
                </p>
              </div>

              <div
                className={`relative flex h-40 w-40 flex-col items-center justify-center rounded-full border-8 bg-white/10 text-4xl font-semibold ${scoreColor(
                  verificationData.reliabilityScore,
                )}`}
              >
                {verificationData.reliabilityScore}
                <span className="mt-1 text-xs uppercase tracking-[0.35em] text-white/70">
                  score
                </span>
              </div>
            </div>

            <div className="mt-8 grid gap-4 text-center text-sm text-white sm:grid-cols-3">
              <div className="rounded-2xl bg-white/10 py-4">
                <div className="text-xs uppercase text-white/70">Monthly remittance</div>
                <div className="mt-2 text-xl font-semibold">
                  ${verificationData.monthlyAmount.toLocaleString()}
                </div>
              </div>
              <div className="rounded-2xl bg-white/10 py-4">
                <div className="text-xs uppercase text-white/70">Total sent</div>
                <div className="mt-2 text-xl font-semibold">
                  ${verificationData.totalSent.toLocaleString()}
                </div>
              </div>
              <div className="rounded-2xl bg-white/10 py-4">
                <div className="text-xs uppercase text-white/70">History</div>
                <div className="mt-2 text-xl font-semibold">
                  {verificationData.historyMonths} months
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 px-6 py-6 text-sm text-white">
            <h4 className="text-lg font-semibold text-white">What this means</h4>
            <p className="mt-2 text-indigo-100">{scoreMeaning(verificationData.reliabilityScore)}</p>
            <p className="mt-3 text-slate-200/80">
              Keep submitting on-time remittances to maintain your score and unlock deeper Arbitrum
              liquidity pools. Your NFT collateral is live and can be referenced by any dApp that
              integrates RemitLend’s credit oracle.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-indigo-500/30 via-purple-500/30 to-cyan-500/30 px-6 py-6 text-sm text-white">
            <h4 className="text-lg font-semibold text-white">Next steps</h4>
            <ul className="mt-3 space-y-2 text-indigo-50">
              <li>✓ Your NFT is stored in your wallet.</li>
              <li>✓ Use it as collateral when requesting loans.</li>
              <li>✓ Score refreshes automatically every remittance cycle.</li>
            </ul>
            <div className="mt-4 text-xs text-indigo-100/80">
              Transaction hash:{" "}
              <a
                href={`https://arbiscan.io/tx/${verificationData.txHash}`}
                target="_blank"
                rel="noreferrer"
                className="font-mono text-indigo-200 underline"
              >
                {verificationData.txHash}
              </a>
            </div>
          </div>

          <button
            type="button"
            onClick={() => resetFlow()}
            className="w-full rounded-2xl border border-white/20 px-8 py-4 text-sm font-semibold uppercase tracking-[0.35em] text-white transition-all duration-300 hover:bg-white/10"
          >
            Run another verification
          </button>
        </div>
      )}

      {currentStep === "failed" && (
        <div className="glass mt-12 rounded-3xl border border-white/10 bg-slate-950/70 px-10 py-12 text-center text-white shadow-2xl shadow-rose-500/20">
          <AlertCircle className="mx-auto h-16 w-16 text-rose-300" />
          <h2 className="mt-6 text-3xl font-semibold">Verification failed</h2>
          <p className="mt-3 text-sm text-slate-300">
            {error ?? "The oracle could not verify your remittance history. Please try again."}
          </p>
          <div className="mt-6 space-y-4 text-sm text-slate-200">
            <div className="rounded-2xl border border-rose-400/30 bg-rose-400/10 px-5 py-3">
              Double-check the ID you entered and ensure your provider has remittance data available.
            </div>
          </div>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => resetFlow()}
              className="flex-1 rounded-2xl border border-white/20 px-6 py-4 text-sm font-semibold uppercase tracking-[0.35em] transition-all hover:bg-white/10"
            >
              Try again
            </button>
            <button
              type="button"
              onClick={() => (window.location.href = "/")}
              className="flex-1 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 text-sm font-semibold uppercase tracking-[0.35em] text-white shadow-lg shadow-indigo-500/40 transition-transform hover:scale-105"
            >
              Return home
            </button>
          </div>
        </div>
      )}
    </div>
  );
}


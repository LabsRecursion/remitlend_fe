"use client";

import { useEffect, useMemo, useState } from "react";
import { useAccount } from "wagmi";
import {
  AlertCircle,
  Award,
  Calendar,
  CreditCard,
  DollarSign,
  Loader2,
  TrendingUp,
} from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type TabKey = "overview" | "request" | "loans" | "nft";

interface Loan {
  id: number;
  amount: number;
  balance: number;
  rate: number;
  monthly: number;
  nextDue: string;
  paymentsMade: number;
  totalPayments: number;
}

interface NftCollateral {
  tokenId: number;
  monthlyFlow: number;
  reliabilityScore: number;
  historyMonths: number;
  totalSent: number;
  staked: boolean;
}

interface RequestStatus {
  type: "success" | "error" | null;
  message: string;
}

const mockLoans: Loan[] = [
  {
    id: 1012,
    amount: 15000,
    balance: 9600,
    rate: 12.5,
    monthly: 690,
    nextDue: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000).toISOString(),
    paymentsMade: 6,
    totalPayments: 24,
  },
  {
    id: 1013,
    amount: 8000,
    balance: 5200,
    rate: 10.2,
    monthly: 420,
    nextDue: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    paymentsMade: 9,
    totalPayments: 18,
  },
];

const mockNft: NftCollateral = {
  tokenId: 7284,
  monthlyFlow: 2450,
  reliabilityScore: 90,
  historyMonths: 20,
  totalSent: 47000,
  staked: true,
};

const paymentHistory = [
  { month: "Jan", amount: 2450 },
  { month: "Feb", amount: 2480 },
  { month: "Mar", amount: 2500 },
  { month: "Apr", amount: 2520 },
  { month: "May", amount: 2550 },
  { month: "Jun", amount: 2575 },
  { month: "Jul", amount: 2590 },
  { month: "Aug", amount: 2620 },
];

const formatCurrency = (value: number) =>
  `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

const truncateAddress = (value?: string) => {
  if (!value) return "";
  return `${value.slice(0, 6)}…${value.slice(-4)}`;
};

const calcProgress = (loan: Loan) =>
  (loan.paymentsMade / loan.totalPayments) * 100;

export default function BorrowPage() {
  const { address } = useAccount();
  const connected = Boolean(address);

  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [isLoading, setIsLoading] = useState(true);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [collateral, setCollateral] = useState<NftCollateral | null>(null);
  const [requestStatus, setRequestStatus] = useState<RequestStatus>({
    type: null,
    message: "",
  });

  const [form, setForm] = useState({
    nftId: "",
    amount: "",
    duration: "12",
    rate: "10.5",
  });

  useEffect(() => {
    if (!connected) return;
    setIsLoading(true);
    const timer = setTimeout(() => {
      setLoans(mockLoans);
      setCollateral(mockNft);
      setIsLoading(false);
    }, 600);

    return () => clearTimeout(timer);
  }, [connected]);

  const aggregated = useMemo(() => {
    const totalBorrowed = loans.reduce((sum, loan) => sum + loan.amount, 0);
    const outstanding = loans.reduce((sum, loan) => sum + loan.balance, 0);
    const nextDue =
      loans.length > 0
        ? loans
            .slice()
            .sort(
              (a, b) =>
                new Date(a.nextDue).getTime() - new Date(b.nextDue).getTime(),
            )[0].nextDue
        : null;
    const monthly =
      loans.length > 0 ? loans[0].monthly : 0;

    return { totalBorrowed, outstanding, nextDue, monthly };
  }, [loans]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setRequestStatus({ type: null, message: "" });

    if (!form.nftId || !form.amount) {
      setRequestStatus({
        type: "error",
        message: "Please provide collateral NFT ID and loan amount.",
      });
      return;
    }

    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 900));

    const requestedAmount = Number(form.amount);
    const newLoan: Loan = {
      id: Math.floor(Math.random() * 9000 + 1000),
      amount: requestedAmount,
      balance: requestedAmount,
      rate: Number(form.rate),
      monthly: Number(requestedAmount * 0.08),
      nextDue: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      paymentsMade: 0,
      totalPayments: Number(form.duration),
    };

    setLoans((prev) => [newLoan, ...prev]);
    setRequestStatus({
      type: "success",
      message: `Loan request for ${requestedAmount.toLocaleString()} USDC submitted.`,
    });
    setForm({ nftId: "", amount: "", duration: "12", rate: form.rate });
    setActiveTab("loans");
    setIsLoading(false);
  };

  if (!connected) {
    return (
      <div className="relative flex min-h-[70vh] items-center justify-center">
        <div className="glass max-w-md rounded-3xl border border-white/10 bg-slate-950/70 px-10 py-12 text-center shadow-2xl shadow-indigo-500/20">
          <AlertCircle className="mx-auto mb-6 h-16 w-16 text-amber-300" />
          <h2 className="text-3xl font-semibold text-white">
            Connect your wallet
          </h2>
          <p className="mt-3 text-sm text-slate-300">
            Link an Arbitrum-compatible wallet to access remittance-backed
            credit lines.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative mx-auto max-w-6xl px-4 pb-24 pt-20 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-14 top-0 h-80 w-80 rounded-full bg-indigo-500/10 blur-3xl" />
        <div
          className="absolute right-0 top-1/3 h-96 w-96 rounded-full bg-purple-500/10 blur-3xl"
          style={{ animationDelay: "2s" }}
        />
        <div
          className="absolute bottom-0 left-1/4 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl"
          style={{ animationDelay: "4s" }}
        />
      </div>

      <header className="rounded-3xl border border-indigo-500/30 bg-gradient-to-br from-indigo-600/30 via-purple-600/25 to-cyan-500/25 px-8 py-10 shadow-[0_35px_120px_-60px_rgba(79,70,229,0.65)]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <span className="inline-flex items-center gap-3 rounded-full border border-indigo-400/40 bg-indigo-500/10 px-5 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-indigo-100/80">
              Borrower Console
            </span>
            <h1 className="mt-6 text-4xl font-semibold text-white sm:text-5xl">
              Remittance Credit Hub
            </h1>
            <p className="mt-3 text-sm text-indigo-100/80 sm:text-base">
              Monitor Arbitrum-native loan balances, manage repayments, and
              deploy your RemitLend NFT collateral in one place.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-right text-xs font-semibold uppercase tracking-[0.35em] text-white/70">
            Connected wallet
            <div className="mt-2 text-sm font-mono text-white">
              {truncateAddress(address)}
            </div>
          </div>
        </div>
      </header>

      <div className="mt-10 flex flex-wrap items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-2 text-sm font-semibold uppercase tracking-[0.35em] text-white/70">
        {(["overview", "request", "loans", "nft"] as TabKey[]).map((tab) => (
          <button
            type="button"
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 rounded-2xl px-5 py-3 transition-all duration-200 sm:flex-none sm:px-7 ${
              activeTab === tab
                ? "bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 text-white shadow-lg shadow-indigo-500/30"
                : "text-white/70 hover:bg-white/10"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "overview" && (
        <div className="mt-10 space-y-10">
          {isLoading ? (
            <div className="glass flex flex-col items-center rounded-3xl border border-white/10 bg-slate-950/70 px-10 py-14 text-white shadow-2xl shadow-indigo-500/20">
              <Loader2 className="h-12 w-12 animate-spin text-indigo-300" />
              <p className="mt-4 text-sm text-slate-300">
                Loading borrower telemetry…
              </p>
            </div>
          ) : (
            <>
              <section className="glass rounded-3xl border border-white/10 bg-slate-950/70 p-10 shadow-[0_25px_80px_-50px_rgba(79,70,229,0.65)]">
                <h2 className="text-2xl font-semibold text-white">Loan summary</h2>
                <p className="mt-2 text-sm text-slate-300">
                  Snapshot of your active remittance-backed loans.
                </p>
                <div className="mt-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
                  {[
                    {
                      label: "Total borrowed",
                      value: formatCurrency(aggregated.totalBorrowed),
                      icon: DollarSign,
                    },
                    {
                      label: "Outstanding balance",
                      value: formatCurrency(aggregated.outstanding),
                      icon: TrendingUp,
                    },
                    {
                      label: "Next payment due",
                      value: aggregated.nextDue
                        ? new Date(aggregated.nextDue).toLocaleDateString()
                        : "None",
                      icon: Calendar,
                    },
                    {
                      label: "Monthly payment",
                      value: formatCurrency(aggregated.monthly),
                      icon: CreditCard,
                    },
                  ].map((card) => {
                    const Icon = card.icon;
                    return (
                      <div
                        key={card.label}
                        className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 transition-transform duration-300 hover:-translate-y-1"
                      >
                        <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-cyan-500 opacity-30 blur-2xl transition-opacity duration-300 group-hover:opacity-50" />
                        <div className="relative flex items-center gap-5">
                          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-cyan-500 text-white shadow-lg shadow-indigo-500/30">
                            <Icon className="h-6 w-6" />
                          </div>
                          <div>
                            <span className="text-xs font-semibold uppercase tracking-[0.35em] text-white/60">
                              {card.label}
                            </span>
                            <p className="mt-3 text-2xl font-semibold text-white">
                              {card.value}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              <section className="glass rounded-3xl border border-white/10 bg-slate-950/70 p-10 shadow-[0_30px_100px_-60px_rgba(79,70,229,0.65)]">
                <h3 className="text-xl font-semibold text-white">
                  Remittance inflow trend
                </h3>
                <p className="mt-2 text-sm text-slate-300">
                  Historical monthly remittance totals powering your NFT score.
                </p>
                <div className="mt-10 h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={paymentHistory}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="month" stroke="#94a3b8" />
                      <YAxis stroke="#94a3b8" />
                      <Tooltip
                        formatter={(value: number) => formatCurrency(value)}
                        contentStyle={{
                          backgroundColor: "#0f172a",
                          border: "1px solid rgba(255,255,255,0.1)",
                          borderRadius: "12px",
                          color: "#e2e8f0",
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="amount"
                        stroke="#818cf8"
                        strokeWidth={3}
                        dot={{ fill: "#818cf8", r: 5 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </section>
            </>
          )}
        </div>
      )}

      {activeTab === "request" && (
        <section className="mt-14 glass rounded-3xl border border-white/10 bg-slate-950/70 p-10 shadow-[0_30px_100px_-60px_rgba(79,70,229,0.65)]">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-semibold text-white">Request a loan</h2>
            <p className="mt-3 text-sm text-slate-300">
              Use your RemitLend NFT collateral to unlock instant Arbitrum liquidity.
            </p>
            {requestStatus.type && (
              <div
                className={`mt-6 rounded-2xl border px-5 py-4 text-sm ${
                  requestStatus.type === "success"
                    ? "border-emerald-400/40 bg-emerald-500/10 text-emerald-200"
                    : "border-rose-400/40 bg-rose-500/10 text-rose-200"
                }`}
              >
                {requestStatus.message}
              </div>
            )}
            <form className="mt-10 space-y-6" onSubmit={(event) => void handleSubmit(event)}>
              <div>
                <label className="text-xs font-semibold uppercase tracking-[0.35em] text-white/60">
                  NFT collateral ID
                </label>
                <input
                  value={form.nftId}
                  onChange={(event) => setForm((prev) => ({ ...prev, nftId: event.target.value }))}
                  type="number"
                  placeholder="Enter NFT ID"
                  className="mt-3 w-full rounded-2xl border border-white/10 bg-slate-900/60 px-6 py-4 text-sm text-white shadow-inner focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/30"
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-[0.35em] text-white/60">
                  Loan amount (USDC)
                </label>
                <input
                  value={form.amount}
                  onChange={(event) => setForm((prev) => ({ ...prev, amount: event.target.value }))}
                  type="number"
                  min="0"
                  step="100"
                  placeholder="Enter amount"
                  className="mt-3 w-full rounded-2xl border border-white/10 bg-slate-900/60 px-6 py-4 text-sm text-white shadow-inner focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/30"
                />
              </div>
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-[0.35em] text-white/60">
                    Duration (months)
                  </label>
                  <select
                    value={form.duration}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, duration: event.target.value }))
                    }
                    className="mt-3 w-full rounded-2xl border border-white/10 bg-slate-900/60 px-6 py-4 text-sm text-white shadow-inner focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/30"
                  >
                    <option value="6">6 months</option>
                    <option value="12">12 months</option>
                    <option value="18">18 months</option>
                    <option value="24">24 months</option>
                    <option value="36">36 months</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-[0.35em] text-white/60">
                    Indicative APR
                  </label>
                  <select
                    value={form.rate}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, rate: event.target.value }))
                    }
                    className="mt-3 w-full rounded-2xl border border-white/10 bg-slate-900/60 px-6 py-4 text-sm text-white shadow-inner focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/30"
                  >
                    <option value="8.5">8.5% • Elite</option>
                    <option value="10.5">10.5% • Prime</option>
                    <option value="13.2">13.2% • Standard</option>
                    <option value="17.9">17.9% • Growth</option>
                  </select>
                </div>
              </div>
              <div className="rounded-3xl border border-indigo-400/30 bg-indigo-500/10 px-5 py-4 text-xs text-indigo-100">
                💡 Your RemitLend NFT is locked until the loan is fully repaid. Repayments reduce
                utilization instantly on Arbitrum.
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="flex w-full items-center justify-center gap-2 rounded-3xl bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 px-8 py-5 text-sm font-semibold uppercase tracking-[0.35em] text-white shadow-lg shadow-indigo-500/30 transition-transform duration-300 hover:scale-[1.02] disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-white/40 disabled:shadow-none"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Submitting request…
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4" />
                    Submit request
                  </>
                )}
              </button>
            </form>
          </div>
        </section>
      )}

      {activeTab === "loans" && (
        <section className="mt-14 space-y-8">
          {isLoading ? (
            <div className="glass flex flex-col items-center rounded-3xl border border-white/10 bg-slate-950/70 px-10 py-14 text-white shadow-2xl shadow-indigo-500/20">
              <Loader2 className="h-12 w-12 animate-spin text-indigo-300" />
              <p className="mt-4 text-sm text-slate-300">Fetching loan positions…</p>
            </div>
          ) : loans.length === 0 ? (
            <div className="glass rounded-3xl border border-white/10 bg-slate-950/70 px-10 py-14 text-center text-white shadow-[0_25px_80px_-50px_rgba(79,70,229,0.65)]">
              <CreditCard className="mx-auto h-16 w-16 text-indigo-300" />
              <h3 className="mt-4 text-2xl font-semibold">No active loans</h3>
              <p className="mt-3 text-sm text-slate-300">
                You haven’t drawn any credit lines yet. Request a loan to get started.
              </p>
              <button
                type="button"
                onClick={() => setActiveTab("request")}
                className="mt-6 inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 px-6 py-3 text-sm font-semibold uppercase tracking-[0.35em] text-white shadow-lg shadow-indigo-500/30 transition-transform hover:scale-[1.03]"
              >
                Request a loan
              </button>
            </div>
          ) : (
            loans.map((loan) => (
              <div
                key={loan.id}
                className="glass space-y-6 rounded-3xl border border-white/10 bg-slate-950/70 p-10 shadow-[0_25px_80px_-50px_rgba(79,70,229,0.65)]"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-2xl font-semibold text-white">Loan #{loan.id}</h3>
                    <p className="mt-2 text-sm text-slate-300">
                      Next payment due{" "}
                      <span className="text-white">
                        {new Date(loan.nextDue).toLocaleDateString()}
                      </span>
                    </p>
                  </div>
                  <span className="inline-flex items-center rounded-full border border-emerald-400/40 bg-emerald-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-emerald-200">
                    Active
                  </span>
                </div>

                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  {[
                    { label: "Loan amount", value: formatCurrency(loan.amount) },
                    { label: "Outstanding balance", value: formatCurrency(loan.balance) },
                    { label: "APR", value: `${loan.rate.toFixed(1)}%` },
                    { label: "Monthly payment", value: formatCurrency(loan.monthly) },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-white"
                    >
                      <span className="text-xs font-semibold uppercase tracking-[0.35em] text-white/50">
                        {item.label}
                      </span>
                      <p className="mt-3 text-xl font-semibold text-white">{item.value}</p>
                    </div>
                  ))}
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/50">
                    Repayment progress
                  </p>
                  <div className="mt-4 h-4 w-full overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 transition-all duration-500"
                      style={{ width: `${calcProgress(loan)}%` }}
                    />
                  </div>
                  <p className="mt-2 text-xs text-white/70">
                    {loan.paymentsMade} of {loan.totalPayments} payments complete (
                    {calcProgress(loan).toFixed(1)}%)
                  </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
                  <button
                    type="button"
                    className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 px-6 py-3 text-xs font-semibold uppercase tracking-[0.35em] text-white shadow-lg shadow-indigo-500/30 transition-transform hover:scale-[1.03]"
                  >
                    Make payment
                  </button>
                  <button
                    type="button"
                    className="inline-flex items-center justify-center rounded-2xl border border-white/10 px-6 py-3 text-xs font-semibold uppercase tracking-[0.35em] text-white transition-colors hover:bg-white/10"
                  >
                    View schedule
                  </button>
                </div>
              </div>
            ))
          )}
        </section>
      )}

      {activeTab === "nft" && (
        <section className="mt-14 space-y-8">
          {isLoading ? (
            <div className="glass flex flex-col items-center rounded-3xl border border-white/10 bg-slate-950/70 px-10 py-14 text-white shadow-2xl shadow-indigo-500/20">
              <Loader2 className="h-12 w-12 animate-spin text-indigo-300" />
              <p className="mt-4 text-sm text-slate-300">Fetching NFT collateral…</p>
            </div>
          ) : !collateral ? (
            <div className="glass rounded-3xl border border-white/10 bg-slate-950/70 px-10 py-14 text-center text-white shadow-[0_25px_80px_-50px_rgba(79,70,229,0.65)]">
              <Award className="mx-auto h-16 w-16 text-indigo-300" />
              <h3 className="mt-4 text-2xl font-semibold">No RemitLend NFT detected</h3>
              <p className="mt-3 text-sm text-slate-300">
                Verify your remittance history to mint collateral and unlock borrowing power.
              </p>
              <button
                type="button"
                onClick={() => (window.location.href = "/verify")}
                className="mt-6 inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 px-6 py-3 text-sm font-semibold uppercase tracking-[0.35em] text-white shadow-lg shadow-indigo-500/30 transition-transform hover:scale-[1.03]"
              >
                Start verification
              </button>
            </div>
          ) : (
            <>
              <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-indigo-600/40 via-purple-600/30 to-cyan-500/30 p-10 text-white shadow-[0_35px_120px_-60px_rgba(79,70,229,0.85)]">
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5 opacity-50" />
                <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <Award className="h-8 w-8 text-indigo-100" />
                      <h3 className="text-3xl font-semibold">
                        Remittance NFT #{collateral.tokenId}
                      </h3>
                    </div>
                    {collateral.staked && (
                      <div className="mt-4 inline-flex items-center rounded-full border border-amber-200/40 bg-amber-200/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-amber-100">
                        Staked as collateral
                      </div>
                    )}
                  </div>
                  <div className="relative flex h-44 w-44 items-center justify-center rounded-full border-8 border-white/20 bg-white/10 shadow-[0_0_40px_rgba(129,140,248,0.45)]">
                    <div className="text-5xl font-semibold">{collateral.reliabilityScore}</div>
                    <span className="absolute bottom-5 text-xs uppercase tracking-[0.35em] text-white/70">
                      Score
                    </span>
                  </div>
                </div>
                <div className="relative z-10 mt-10 grid gap-6 sm:grid-cols-3 text-sm">
                  {[
                    { label: "Monthly remittance", value: formatCurrency(collateral.monthlyFlow) },
                    { label: "History length", value: `${collateral.historyMonths} months` },
                    { label: "Total sent", value: formatCurrency(collateral.totalSent) },
                  ].map((item) => (
                    <div key={item.label} className="rounded-2xl border border-white/20 bg-white/10 p-5">
                      <span className="text-xs font-semibold uppercase tracking-[0.35em] text-white/60">
                        {item.label}
                      </span>
                      <p className="mt-3 text-xl font-semibold text-white">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass rounded-3xl border border-white/10 bg-slate-950/70 p-8 text-white shadow-[0_30px_100px_-60px_rgba(79,70,229,0.65)]">
                <h4 className="text-xl font-semibold">How your score works</h4>
                <p className="mt-3 text-sm text-slate-300">
                  Reliability scales with consistent remittance flows, verified by the RemitLend
                  oracle network. Each on-time repayment increases your standing across Arbitrum
                  lending pools.
                </p>
                <div className="mt-6 rounded-2xl border border-indigo-400/30 bg-indigo-500/10 px-5 py-4 text-sm text-indigo-100">
                  💡 Keep sending remittances through linked providers to unlock better APR bands and
                  higher credit limits.
                </div>
              </div>
            </>
          )}
        </section>
      )}
    </div>
  );
}


"use client";

import { useEffect, useMemo, useState } from "react";
import { useAccount } from "wagmi";
import {
  AlertCircle,
  ArrowDownCircle,
  ArrowUpCircle,
  DollarSign,
  Loader2,
  Percent,
  TrendingUp,
  Wallet,
} from "lucide-react";

type TabKey = "overview" | "deposit" | "withdraw";

interface PoolStats {
  totalValueLocked: number;
  utilizationRate: number;
  currentAPY: number;
  totalBorrowed: number;
  availableLiquidity: number;
}

interface UserPosition {
  depositAmount: number;
  sharePercentage: number;
  earnedInterest: number;
  totalValue: number;
}

const initialPool: PoolStats = {
  totalValueLocked: 1_250_000,
  utilizationRate: 63.4,
  currentAPY: 11.4,
  totalBorrowed: 786_000,
  availableLiquidity: 464_000,
};

const initialPosition: UserPosition = {
  depositAmount: 54_000,
  sharePercentage: 4.2,
  earnedInterest: 3_180,
  totalValue: 57_180,
};

const performanceData = [
  { month: "May", value: 50000 },
  { month: "Jun", value: 50420 },
  { month: "Jul", value: 50860 },
  { month: "Aug", value: 51310 },
  { month: "Sep", value: 51780 },
  { month: "Oct", value: 52260 },
  { month: "Nov", value: 52340 },
];

const activeLoans = [
  { id: 1, borrower: "0x9da3...41c2", amount: 15000, rate: 18 },
  { id: 2, borrower: "0x73bf...aa91", amount: 8500, rate: 22 },
  { id: 3, borrower: "0x1a4f...9b7d", amount: 12000, rate: 16 },
];

const formatCurrency = (value: number) =>
  `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

const truncateAddress = (value?: string) => {
  if (!value) return "";
  return `${value.slice(0, 6)}…${value.slice(-4)}`;
};

export default function LendPage() {
  const { address } = useAccount();
  const connected = Boolean(address);

  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [poolStats, setPoolStats] = useState<PoolStats>(initialPool);
  const [userPosition, setUserPosition] = useState<UserPosition>(initialPosition);
  const [isFetching, setIsFetching] = useState(false);

  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [depositStatus, setDepositStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });
  const [withdrawStatus, setWithdrawStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });
  const [isDepositing, setIsDepositing] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  useEffect(() => {
    if (!connected) return;

    setIsFetching(true);
    const timer = setTimeout(() => {
      setPoolStats(initialPool);
      setUserPosition(initialPosition);
      setIsFetching(false);
    }, 600);

    return () => clearTimeout(timer);
  }, [connected]);

  useEffect(() => {
    setDepositStatus({ type: null, message: "" });
    setWithdrawStatus({ type: null, message: "" });
  }, [activeTab]);

  const maxPerformance = useMemo(
    () => Math.max(...performanceData.map((item) => item.value)),
    [],
  );

  const portfolioSplit = useMemo(() => {
    const { depositAmount: deposit, earnedInterest: interest } = userPosition;
    const total = deposit + interest || 1;
    return [
      { label: "Principal", value: deposit, percent: (deposit / total) * 100 },
      { label: "Interest", value: interest, percent: (interest / total) * 100 },
    ];
  }, [userPosition]);

  const handleDeposit = async () => {
    const amount = Number(depositAmount);
    if (!amount || Number.isNaN(amount) || amount <= 0) {
      setDepositStatus({ type: "error", message: "Enter a valid amount to deposit." });
      return;
    }

    setDepositStatus({ type: null, message: "" });
    setIsDepositing(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 900));

      setUserPosition((prev) => {
        const depositTotal = prev.depositAmount + amount;
        const totalValue = depositTotal + prev.earnedInterest;
        return {
          ...prev,
          depositAmount: parseFloat(depositTotal.toFixed(2)),
          totalValue: parseFloat(totalValue.toFixed(2)),
          sharePercentage: parseFloat(((depositTotal / (poolStats.totalValueLocked + amount)) * 100).toFixed(2)),
        };
      });

      setPoolStats((prev) => {
        const availableLiquidity = prev.availableLiquidity + amount;
        const totalValueLocked = availableLiquidity + prev.totalBorrowed;
        return {
          ...prev,
          availableLiquidity: parseFloat(availableLiquidity.toFixed(2)),
          totalValueLocked: parseFloat(totalValueLocked.toFixed(2)),
        };
      });

      setDepositStatus({
        type: "success",
        message: `Deposited ${amount.toLocaleString()} USDC into the pool.`,
      });
      setDepositAmount("");
    } catch (error) {
      console.error(error);
      setDepositStatus({ type: "error", message: "Unable to complete deposit. Try again." });
    } finally {
      setIsDepositing(false);
    }
  };

  const handleWithdraw = async () => {
    const amount = Number(withdrawAmount);
    if (!amount || Number.isNaN(amount) || amount <= 0) {
      setWithdrawStatus({ type: "error", message: "Enter a valid amount to withdraw." });
      return;
    }

    if (amount > userPosition.totalValue) {
      setWithdrawStatus({
        type: "error",
        message: "Withdrawal amount exceeds your available balance.",
      });
      return;
    }

    setWithdrawStatus({ type: null, message: "" });
    setIsWithdrawing(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 900));

      setUserPosition((prev) => {
        const totalValue = prev.totalValue - amount;
        const interest = Math.max(0, prev.earnedInterest - amount * 0.1);
        const deposit = Math.max(0, totalValue - interest);
        return {
          depositAmount: parseFloat(deposit.toFixed(2)),
          earnedInterest: parseFloat(interest.toFixed(2)),
          totalValue: parseFloat(totalValue.toFixed(2)),
          sharePercentage: parseFloat(((deposit / poolStats.totalValueLocked) * 100).toFixed(2)),
        };
      });

      setPoolStats((prev) => {
        const availableLiquidity = Math.max(0, prev.availableLiquidity - amount);
        const totalValueLocked = availableLiquidity + prev.totalBorrowed;
        return {
          ...prev,
          availableLiquidity: parseFloat(availableLiquidity.toFixed(2)),
          totalValueLocked: parseFloat(totalValueLocked.toFixed(2)),
        };
      });

      setWithdrawStatus({
        type: "success",
        message: `Withdrew ${amount.toLocaleString()} USDC from the pool.`,
      });
      setWithdrawAmount("");
    } catch (error) {
      console.error(error);
      setWithdrawStatus({
        type: "error",
        message: "Unable to complete withdrawal. Try again.",
      });
    } finally {
      setIsWithdrawing(false);
    }
  };

  if (!connected) {
    return (
      <div className="relative flex min-h-[70vh] items-center justify-center">
        <div className="glass max-w-md rounded-3xl border border-white/10 bg-slate-950/70 px-10 py-12 text-center shadow-2xl shadow-indigo-500/20">
          <AlertCircle className="mx-auto mb-6 h-16 w-16 text-amber-300" />
          <h2 className="text-3xl font-semibold text-white">Connect your wallet</h2>
          <p className="mt-3 text-sm text-slate-300">
            Link an Arbitrum-compatible wallet to manage pool deposits and liquidity.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative mx-auto max-w-6xl px-4 pb-24 pt-20 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-20 top-0 h-80 w-80 rounded-full bg-emerald-500/10 blur-3xl" />
        <div
          className="absolute right-0 top-1/3 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl"
          style={{ animationDelay: "2s" }}
        />
        <div
          className="absolute bottom-0 left-1/4 h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl"
          style={{ animationDelay: "4s" }}
        />
      </div>

      <header className="rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-emerald-600/30 via-cyan-500/20 to-indigo-600/20 px-8 py-10 shadow-[0_35px_120px_-60px_rgba(16,185,129,0.6)]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <span className="inline-flex items-center gap-3 rounded-full border border-emerald-400/40 bg-emerald-500/10 px-5 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-emerald-200/80">
              <Wallet className="h-4 w-4" />
              Lender Console
            </span>
            <h1 className="mt-6 text-4xl font-semibold text-white sm:text-5xl">
              Liquidity Operations
            </h1>
            <p className="mt-3 text-sm text-indigo-100/80 sm:text-base">
              Deploy capital into permissionless remittance pools on Arbitrum. Track utilization,
              APY movements, and loan performance in real time.
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

      <div className="mt-10 flex flex-wrap items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-2 text-sm font-semibold uppercase tracking-[0.35em] text-slate-300">
        {(["overview", "deposit", "withdraw"] as TabKey[]).map((tab) => (
          <button
            type="button"
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 rounded-2xl px-5 py-3 transition-all duration-200 sm:flex-none sm:px-7 ${
              activeTab === tab
                ? "bg-gradient-to-r from-emerald-500 via-cyan-500 to-indigo-500 text-white shadow-lg shadow-emerald-500/30"
                : "text-white/70 hover:bg-white/10"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "overview" && (
        <div className="mt-10 space-y-10">
          {isFetching && (
            <div className="glass flex flex-col items-center rounded-3xl border border-white/10 bg-slate-950/70 px-10 py-14 text-white shadow-2xl shadow-emerald-500/20">
              <Loader2 className="h-12 w-12 animate-spin text-emerald-300" />
              <p className="mt-4 text-sm text-slate-300">Refreshing pool telemetry…</p>
            </div>
          )}

          {!isFetching && (
            <>
              <section className="glass rounded-3xl border border-white/10 bg-slate-950/70 p-10 shadow-[0_25px_80px_-50px_rgba(16,185,129,0.65)]">
                <h2 className="text-2xl font-semibold text-white">Pool Statistics</h2>
                <p className="mt-2 text-sm text-slate-300">
                  Real-time metrics derived from current Arbitrum remittance borrowing demand.
                </p>

                <div className="mt-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
                  {[
                    {
                      icon: Wallet,
                      label: "Total value locked",
                      value: formatCurrency(poolStats.totalValueLocked),
                      accent: "from-emerald-500 to-cyan-500",
                    },
                    {
                      icon: Percent,
                      label: "Utilization rate",
                      value: `${poolStats.utilizationRate.toFixed(1)}%`,
                      accent: "from-cyan-500 to-indigo-500",
                    },
                    {
                      icon: TrendingUp,
                      label: "Current APY",
                      value: `${poolStats.currentAPY.toFixed(2)}%`,
                      accent: "from-indigo-500 to-purple-500",
                    },
                    {
                      icon: DollarSign,
                      label: "Available liquidity",
                      value: formatCurrency(poolStats.availableLiquidity),
                      accent: "from-purple-500 to-emerald-500",
                    },
                  ].map((stat) => {
                    const Icon = stat.icon;
                    return (
                      <div
                        key={stat.label}
                        className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 transition-transform duration-300 hover:-translate-y-1"
                      >
                        <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-gradient-to-br opacity-30 blur-2xl transition-opacity duration-300 group-hover:opacity-50" />
                        <div className="relative flex items-center gap-5">
                          <div
                            className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${stat.accent} text-white shadow-lg shadow-emerald-500/30`}
                          >
                            <Icon className="h-6 w-6" />
                          </div>
                          <div>
                            <span className="text-xs font-semibold uppercase tracking-[0.35em] text-white/60">
                              {stat.label}
                            </span>
                            <p className="mt-3 text-2xl font-semibold text-white">{stat.value}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              <section className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
                <div className="glass rounded-3xl border border-white/10 bg-slate-950/70 p-10 shadow-[0_30px_100px_-60px_rgba(79,70,229,0.65)]">
                  <h3 className="text-xl font-semibold text-white">Your Position</h3>
                  <p className="mt-2 text-sm text-slate-300">
                    Earnings update with every oracle settlement on Arbitrum.
                  </p>
                  <div className="mt-8 grid gap-5 sm:grid-cols-2">
                    {([
                      {
                        label: "Total value",
                        value: formatCurrency(userPosition.totalValue),
                        highlight: true,
                      },
                      { label: "Principal", value: formatCurrency(userPosition.depositAmount) },
                      {
                        label: "Interest earned",
                        value: `+${formatCurrency(userPosition.earnedInterest)}`,
                      },
                      {
                        label: "Share of pool",
                        value: `${userPosition.sharePercentage.toFixed(2)}%`,
                      },
                    ] as const).map((item, index) => (
                      <div
                        key={item.label}
                        className={`rounded-2xl border border-white/10 bg-white/5 p-5 ${
                          index === 0 ? "col-span-full sm:col-span-2" : ""
                        }`}
                      >
                        <span className="text-xs font-semibold uppercase tracking-[0.35em] text-white/60">
                          {item.label}
                        </span>
                        <p className="mt-4 text-3xl font-semibold text-white">{item.value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="glass rounded-3xl border border-white/10 bg-slate-950/70 p-8 text-white shadow-[0_30px_100px_-60px_rgba(6,182,212,0.65)]">
                  <h3 className="text-lg font-semibold">Portfolio breakdown</h3>
                  <div className="mt-6 flex h-48 items-center justify-center">
                    <div className="relative flex h-36 w-36 items-center justify-center rounded-full border border-white/10">
                      <div className="absolute inset-6 rounded-full border border-white/10 opacity-40" />
                      <div className="absolute inset-0 animate-spin-slow rounded-full border-4 border-transparent border-t-emerald-400/80" />
                      <div className="absolute inset-3 animate-spin-slower rounded-full border-4 border-transparent border-b-cyan-400/80" />
                      <div className="relative text-center">
                        <p className="text-3xl font-semibold text-white">
                          {userPosition.sharePercentage.toFixed(1)}%
                        </p>
                        <span className="text-xs uppercase tracking-[0.35em] text-white/60">
                          Pool share
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-8 space-y-3">
                    {portfolioSplit.map((slice) => (
                      <div key={slice.label}>
                        <div className="flex items-center justify-between text-xs text-white/70">
                          <span>{slice.label}</span>
                          <span>{slice.percent.toFixed(1)}%</span>
                        </div>
                        <div className="mt-2 h-2 rounded-full bg-white/10">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-indigo-400"
                            style={{ width: `${slice.percent}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              <section className="grid gap-8 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
                <div className="glass rounded-3xl border border-white/10 bg-slate-950/70 p-10 shadow-[0_30px_100px_-60px_rgba(59,130,246,0.65)]">
                  <h3 className="text-xl font-semibold text-white">Historical performance</h3>
                  <p className="mt-2 text-sm text-slate-300">
                    Simulated APY compounding assuming reinvested earnings.
                  </p>
                  <div className="mt-8 flex h-52 items-end gap-4">
                    {performanceData.map((point) => (
                      <div key={point.month} className="flex w-full flex-col items-center gap-3">
                        <div className="relative flex h-full w-full items-end justify-center rounded-2xl bg-white/5 px-2">
                          <div
                            className="w-full rounded-2xl bg-gradient-to-t from-emerald-400 via-cyan-400 to-indigo-500"
                            style={{ height: `${(point.value / maxPerformance) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs font-semibold uppercase tracking-[0.35em] text-white/60">
                          {point.month}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="glass rounded-3xl border border-white/10 bg-slate-950/70 p-10 shadow-[0_30px_100px_-60px_rgba(37,99,235,0.65)]">
                  <h3 className="text-xl font-semibold text-white">Active loans</h3>
                  <p className="mt-2 text-sm text-slate-300">
                    Exposure across remittance-backed credit lines.
                  </p>
                  <div className="mt-6 space-y-4">
                    {activeLoans.map((loan) => (
                      <div
                        key={loan.id}
                        className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-5 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div>
                          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-white/60">
                            Loan #{loan.id}
                          </p>
                          <p className="mt-2 font-mono text-white">{loan.borrower}</p>
                        </div>
                        <div className="flex items-center gap-6 text-sm text-white">
                          <div>
                            <span className="text-xs uppercase tracking-[0.35em] text-white/50">
                              Amount
                            </span>
                            <p className="mt-2 text-lg font-semibold">
                              {formatCurrency(loan.amount)}
                            </p>
                          </div>
                          <div>
                            <span className="text-xs uppercase tracking-[0.35em] text-white/50">
                              Rate
                            </span>
                            <p className="mt-2 text-lg font-semibold">{loan.rate}%</p>
                          </div>
                          <span className="rounded-full border border-emerald-400/40 bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-emerald-200">
                            Active
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            </>
          )}
        </div>
      )}

      {activeTab === "deposit" && (
        <section className="mt-14 glass rounded-3xl border border-white/10 bg-slate-950/70 p-10 shadow-[0_30px_100px_-60px_rgba(16,185,129,0.65)]">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 text-white shadow-lg shadow-emerald-500/30">
                <ArrowUpCircle className="h-7 w-7" />
              </div>
              <div>
                <h2 className="text-3xl font-semibold text-white">Deposit USDC</h2>
                <p className="mt-2 text-sm text-slate-300">
                  Add liquidity to the Arbitrum pool and start accruing remittance yield instantly.
                </p>
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-xs text-white/70">
              Current APY
              <div className="text-2xl font-semibold text-emerald-300">
                {poolStats.currentAPY.toFixed(2)}%
              </div>
            </div>
          </div>

          <div className="mt-10 space-y-6">
            {depositStatus.type && (
              <div
                className={`rounded-2xl border px-5 py-4 text-sm ${
                  depositStatus.type === "success"
                    ? "border-emerald-400/40 bg-emerald-500/10 text-emerald-200"
                    : "border-rose-400/40 bg-rose-500/10 text-rose-200"
                }`}
              >
                {depositStatus.message}
              </div>
            )}

            <div>
              <label className="text-xs font-semibold uppercase tracking-[0.35em] text-white/60">
                Amount (USDC)
              </label>
              <input
                value={depositAmount}
                onChange={(event) => setDepositAmount(event.target.value)}
                placeholder="0.00"
                type="number"
                min="0"
                className="mt-3 w-full rounded-3xl border border-white/10 bg-slate-900/60 px-6 py-5 text-3xl font-semibold text-white shadow-inner focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/40"
              />
              <p className="mt-2 text-xs text-slate-400">Cap table balance: 100,000 USDC</p>
            </div>

            <div className="rounded-3xl border border-emerald-400/30 bg-emerald-500/10 px-5 py-6 text-sm text-emerald-100">
              <div className="flex justify-between">
                <span>Estimated monthly yield</span>
                <span>
                  $
                  {(
                    ((Number(depositAmount) || 0) * poolStats.currentAPY) /
                    100 /
                    12
                  ).toFixed(2)}
                </span>
              </div>
              <div className="mt-3 flex justify-between text-emerald-200/70">
                <span>Utilization impact</span>
                <span>
                  {((Number(depositAmount) || 0) / (poolStats.totalValueLocked || 1) * 100).toFixed(
                    2,
                  )}
                  %
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => void handleDeposit()}
              disabled={isDepositing || !depositAmount}
              className="flex w-full items-center justify-center gap-2 rounded-3xl bg-gradient-to-r from-emerald-500 via-cyan-500 to-indigo-500 px-8 py-5 text-sm font-semibold uppercase tracking-[0.35em] text-white shadow-lg shadow-emerald-500/30 transition-transform duration-300 hover:scale-[1.02] disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-white/40 disabled:shadow-none"
            >
              {isDepositing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing deposit…
                </>
              ) : (
                "Confirm deposit"
              )}
            </button>

            <div className="rounded-3xl border border-white/10 bg-white/5 px-5 py-4 text-xs text-slate-300">
              🔐 You will be prompted to approve USDC spending before the transaction is submitted to
              Arbitrum.
            </div>
          </div>
        </section>
      )}

      {activeTab === "withdraw" && (
        <section className="mt-14 glass rounded-3xl border border-white/10 bg-slate-950/70 p-10 shadow-[0_30px_100px_-60px_rgba(79,70,229,0.65)]">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/30">
                <ArrowDownCircle className="h-7 w-7" />
              </div>
              <div>
                <h2 className="text-3xl font-semibold text-white">Withdraw USDC</h2>
                <p className="mt-2 text-sm text-slate-300">
                  Exit your position instantly, subject to existing liquidity buffers.
                </p>
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-xs text-white/70">
              Available balance
              <div className="text-2xl font-semibold text-white">
                {formatCurrency(userPosition.totalValue)}
              </div>
            </div>
          </div>

          <div className="mt-10 space-y-6">
            {withdrawStatus.type && (
              <div
                className={`rounded-2xl border px-5 py-4 text-sm ${
                  withdrawStatus.type === "success"
                    ? "border-emerald-400/40 bg-emerald-500/10 text-emerald-200"
                    : "border-rose-400/40 bg-rose-500/10 text-rose-200"
                }`}
              >
                {withdrawStatus.message}
              </div>
            )}

            <div>
              <label className="text-xs font-semibold uppercase tracking-[0.35em] text-white/60">
                Amount (USDC)
              </label>
              <input
                value={withdrawAmount}
                onChange={(event) => setWithdrawAmount(event.target.value)}
                placeholder="0.00"
                type="number"
                min="0"
                className="mt-3 w-full rounded-3xl border border-white/10 bg-slate-900/60 px-6 py-5 text-3xl font-semibold text-white shadow-inner focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/40"
              />
              <p className="mt-2 text-xs text-slate-400">
                Withdrawals execute instantly while utilization stays below 90%.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 px-5 py-6 text-sm text-white/80">
              <div className="flex justify-between border-b border-white/10 pb-3">
                <span>Principal</span>
                <span>{formatCurrency(userPosition.depositAmount)}</span>
              </div>
              <div className="flex justify-between border-b border-white/10 py-3">
                <span>Interest earned</span>
                <span className="text-emerald-300">
                  +{formatCurrency(userPosition.earnedInterest)}
                </span>
              </div>
              <div className="flex justify-between pt-3 font-semibold text-white">
                <span>Total available</span>
                <span>{formatCurrency(userPosition.totalValue)}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => void handleWithdraw()}
              disabled={isWithdrawing || !withdrawAmount}
              className="flex w-full items-center justify-center gap-2 rounded-3xl bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 px-8 py-5 text-sm font-semibold uppercase tracking-[0.35em] text-white shadow-lg shadow-indigo-500/30 transition-transform duration-300 hover:scale-[1.02] disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-white/40 disabled:shadow-none"
            >
              {isWithdrawing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing withdrawal…
                </>
              ) : (
                "Confirm withdrawal"
              )}
            </button>

            <div className="rounded-3xl border border-indigo-400/30 bg-indigo-500/10 px-5 py-4 text-xs text-indigo-100">
              ℹ️ Requests may queue briefly when pool utilization exceeds the configured threshold.
            </div>
          </div>
        </section>
      )}
    </div>
  );
}


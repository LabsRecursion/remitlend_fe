"use client";

import { useEffect, useState } from "react";
import { appKit } from "@/lib/appkit";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAccount, useDisconnect } from "wagmi";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/borrow", label: "Borrow" },
  { href: "/lend", label: "Lend" },
  { href: "/verify", label: "Verify" },
];

function truncateAddress(address?: string) {
  if (!address) return "";
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

export default function Navbar() {
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  const { address, isConnecting } = useAccount();
  const { disconnect } = useDisconnect();

  useEffect(() => {
    let tries = 0;
    const interval = setInterval(() => {
      if (window.__REMITLEND_APPKIT_INITIALISED__ || tries > 20) {
        setReady(true);
        clearInterval(interval);
      }
      tries += 1;
    }, 50);

    return () => clearInterval(interval);
  }, []);

  const handleConnect = () => {
    if (!ready) return;
    void appKit?.open();
  };

  return (
    <nav className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-slate-950/70 px-6 py-4 backdrop-blur-xl md:flex-row md:items-center md:justify-between">
      <Link href="/" className="flex items-center gap-3">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 text-sm font-semibold text-white">
          RL
        </span>
        <div className="flex flex-col">
          <span className="text-base font-semibold text-white">RemitLend</span>
          <span className="text-xs uppercase tracking-[0.35em] text-indigo-200/70">
            Arbitrum collateral rails
          </span>
        </div>
      </Link>

      <div className="flex flex-wrap items-center gap-3 text-sm font-medium text-slate-200/80">
        {navLinks.map(({ href, label }) => {
          const isActive =
            href === "/"
              ? pathname === href
              : pathname === href || pathname.startsWith(`${href}/`);

          return (
            <Link
              key={href}
              href={href}
              className={`rounded-xl px-4 py-2 transition-all ${
                isActive ? "bg-white/10 text-white shadow-lg shadow-indigo-500/20" : "hover:bg-white/5 hover:text-white"
              }`}
            >
              {label}
            </Link>
          );
        })}
      </div>

      <div className="flex items-center gap-3">
        {address ? (
          <>
            <span className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white">
              {truncateAddress(address)}
            </span>
            <button
              type="button"
              onClick={() => disconnect()}
              className="rounded-xl border border-white/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white transition-colors hover:border-white/40 hover:bg-white/10"
            >
              Disconnect
            </button>
          </>
        ) : (
          <button
            type="button"
            disabled={isConnecting || !ready}
            onClick={handleConnect}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 px-5 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-indigo-500/30 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isConnecting ? "Connecting…" : "Connect Wallet"}
          </button>
        )}
      </div>
    </nav>
  );
}


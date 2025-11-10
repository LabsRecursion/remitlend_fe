"use client";

import { createAppKit, type AppKit } from "@reown/appkit";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { arbitrum, mainnet, polygon, sepolia, type Chain } from "wagmi/chains";

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;

if (!projectId) {
  throw new Error(
    "NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is not defined. Please add it to your environment before using the wallet connect button.",
  );
}

const networks: [Chain, ...Chain[]] = [mainnet, polygon, arbitrum, sepolia];

const metadata =
  typeof window === "undefined"
    ? {
        name: "RemitLend",
        description: "RemitLend turns remittance history into on-chain collateral.",
        url: "http://localhost",
        icons: ["https://walletconnect.com/_next/static/media/appkit.44704b60.svg"],
      }
    : {
        name: "RemitLend",
        description: "RemitLend turns remittance history into on-chain collateral.",
        url: window.location.origin,
        icons: ["https://walletconnect.com/_next/static/media/appkit.44704b60.svg"],
      };

export const wagmiAdapter = new WagmiAdapter({
  projectId,
  networks,
  ssr: true,
});

declare global {
  interface Window {
    __REMITLEND_APPKIT_INITIALISED__?: boolean;
    __REMITLEND_APPKIT_INSTANCE__?: AppKit;
  }
}

export let appKit: AppKit | undefined =
  typeof window !== "undefined" ? window.__REMITLEND_APPKIT_INSTANCE__ : undefined;

if (typeof window !== "undefined" && !window.__REMITLEND_APPKIT_INITIALISED__) {
  appKit = createAppKit({
    adapters: [wagmiAdapter],
    projectId,
    networks,
    metadata,
    themeMode: "dark",
  });

  window.__REMITLEND_APPKIT_INITIALISED__ = true;
  window.__REMITLEND_APPKIT_INSTANCE__ = appKit;
}

export { projectId, networks, metadata };

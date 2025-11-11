import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import Navbar from "@/components/Navbar";
import { Web3ModalProvider } from "@/providers/Web3ModalProvider";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

export const metadata: Metadata = {
  title: "RemitLend",
  description:
    "RemitLend turns remittance history into on-chain collateral so capital flows responsibly across borders.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${spaceGrotesk.variable} min-h-screen bg-slate-950 text-white antialiased`}>
        <Web3ModalProvider>
          <div className="relative min-h-screen">
            <div
              aria-hidden
              className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.25)_0%,_transparent_55%)]"
            />
            <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 pb-16 sm:px-6 lg:px-8">
              <header className="sticky top-6 z-30">
                <Navbar />
              </header>
              <main className="flex-1 pt-14">{children}</main>
            </div>
          </div>
        </Web3ModalProvider>
      </body>
    </html>
  );
}

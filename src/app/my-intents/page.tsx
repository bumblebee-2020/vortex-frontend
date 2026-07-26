"use client";

import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { useWalletStore } from "@/store/wallet";

export default function MyIntentsPage() {
  const address = useWalletStore((s) => s.address);
  const isConnected = useWalletStore((s) => s.isConnected);

  return (
    <div className="min-h-screen">
      <Nav variant="breadcrumb" label="My Intents" />

      <main id="main-content" className="max-w-5xl mx-auto px-5 py-12">
        <div className="mb-8">
          <div className="eyebrow mb-3">Swap History</div>
          <h1 className="text-3xl font-bold text-vx-text mb-3">My Intents</h1>
          <p className="text-vx-muted text-sm max-w-lg leading-relaxed">
            All swap intents submitted from your connected wallet.
          </p>
        </div>

        {!isConnected ? (
          <div className="card p-8 text-center text-sm text-vx-muted">
            Connect your wallet to view your swap history.
          </div>
        ) : (
          <div data-address={address} data-testid="intents-list">
            {/* Intent list will be filled in by a follow-up issue */}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

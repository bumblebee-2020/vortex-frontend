"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { IntentStatusBadge } from "@/components/IntentStatusBadge";
import { ConnectWalletButton } from "@/components/ConnectWalletButton";
import { useWalletStore } from "@/store/wallet";
import { useMyIntents } from "@/hooks/useMyIntents";
import { CHAINS } from "@/lib/marketData";
import type { IntentStatus } from "@/lib/types";

const STATUS_OPTIONS: Array<IntentStatus | "all"> = ["all", "pending", "accepted", "filled", "failed"];

export default function MyIntentsPage() {
  const address = useWalletStore((s) => s.address);
  const isConnected = useWalletStore((s) => s.isConnected);

  const { intents, isLoading, error } = useMyIntents(address);

  const [statusFilter, setStatusFilter] = useState<IntentStatus | "all">("all");
  const [chainFilter, setChainFilter] = useState<string>("all");

  const filtered = useMemo(() => {
    let result = intents;
    if (statusFilter !== "all") result = result.filter((i) => i.status === statusFilter);
    if (chainFilter !== "all") result = result.filter((i) => i.srcChain === chainFilter);
    return result;
  }, [intents, statusFilter, chainFilter]);

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
          <div className="card p-8 text-center">
            <p className="text-sm text-vx-muted mb-4">
              Connect your wallet to view your swap history.
            </p>
            <ConnectWalletButton />
          </div>
        ) : (
          <>
            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2 mb-6">
              <label htmlFor="my-status-filter" className="sr-only">Filter by status</label>
              <select
                id="my-status-filter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as IntentStatus | "all")}
                className="bg-vx-surface border border-vx-border rounded-lg px-3 py-2 text-sm text-vx-text"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s === "all" ? "All statuses" : s.charAt(0).toUpperCase() + s.slice(1)}
                  </option>
                ))}
              </select>

              <label htmlFor="my-chain-filter" className="sr-only">Filter by chain</label>
              <select
                id="my-chain-filter"
                value={chainFilter}
                onChange={(e) => setChainFilter(e.target.value)}
                className="bg-vx-surface border border-vx-border rounded-lg px-3 py-2 text-sm text-vx-text"
              >
                <option value="all">All chains</option>
                {CHAINS.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>

              <span className="text-xs text-vx-muted ml-auto">
                {filtered.length} intent{filtered.length === 1 ? "" : "s"}
              </span>
            </div>

            {/* List */}
            {isLoading ? (
              <div className="space-y-2">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="h-14 bg-vx-surface/40 rounded-lg border border-vx-line animate-pulse" />
                ))}
              </div>
            ) : error ? (
              <div className="card p-8 text-center text-sm text-vx-muted">
                Couldn&apos;t load intents right now. Try again shortly.
              </div>
            ) : intents.length === 0 ? (
              <div className="card p-8 text-center text-sm text-vx-muted">
                <p className="mb-4">You haven&apos;t submitted any swaps yet.</p>
                <Link
                  href="/"
                  className="inline-block px-4 py-2 rounded-lg border border-vx-sage/40 text-vx-text text-sm hover:border-vx-sage/70 transition-colors"
                >
                  Make your first swap
                </Link>
              </div>
            ) : filtered.length === 0 ? (
              <div className="card p-8 text-center text-sm text-vx-muted">
                No intents match your filters.
              </div>
            ) : (
              <div data-address={address} data-testid="intents-list" className="space-y-2">
                {filtered.map((item) => (
                  <Link
                    key={item.id}
                    href={`/explore/${item.id}`}
                    className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 bg-vx-surface/40 rounded-lg border border-vx-line hover:border-vx-sage/40 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-vx-text truncate">
                        {item.srcAmount} {item.srcToken} → {item.dstToken}
                      </div>
                      <div className="text-xs text-vx-muted capitalize">
                        {item.srcChain} · via {item.solver}
                      </div>
                    </div>
                    <div className="self-start sm:self-center">
                      <IntentStatusBadge status={item.status} />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}

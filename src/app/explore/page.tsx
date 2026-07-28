"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { IntentStatusBadge } from "@/components/IntentStatusBadge";
import { useLiveIntents } from "@/hooks/useLiveIntents";
import { timeAgo } from "@/lib/time";
import { CHAINS } from "@/lib/marketData";
import type { IntentStatus } from "@/lib/types";

const STATUS_OPTIONS: Array<IntentStatus | "all"> = ["all", "pending", "accepted", "filled", "failed"];
const SORT_OPTIONS = ["newest", "oldest", "largest"] as const;
type SortOption = (typeof SORT_OPTIONS)[number];

/** Height of a single intent row in pixels (matches the p-4 + border row). */
const ROW_HEIGHT = 64;

/** Height of the virtualized scroll container. */
const LIST_HEIGHT = 480;

export default function ExplorePage() {
  const { intents, isLoading, error, isLive } = useLiveIntents();
  const [statusFilter, setStatusFilter] = useState<IntentStatus | "all">("all");
  const [chainFilter, setChainFilter] = useState<string>("all");
  const [sort, setSort] = useState<SortOption>("newest");

  // Reset scroll to top whenever filters change.
  const scrollRef = useRef<HTMLDivElement>(null);

  /**
   * Stable callbacks for filter controls. Prevents unnecessary re-renders of
   * child components that receive these as props (e.g. if selects were extracted).
   */
  const handleStatusChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) =>
      setStatusFilter(e.target.value as IntentStatus | "all"),
    [],
  );
  const handleChainChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => setChainFilter(e.target.value),
    [],
  );
  const handleSortChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => setSort(e.target.value as SortOption),
    [],
  );

  const filtered = useMemo(() => {
    let result = intents;

    if (statusFilter !== "all") {
      result = result.filter((i) => i.status === statusFilter);
    }
    if (chainFilter !== "all") {
      result = result.filter((i) => i.srcChain === chainFilter);
    }

    result = [...result].sort((a, b) => {
      if (sort === "newest") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sort === "oldest") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      return parseFloat(b.srcAmount) - parseFloat(a.srcAmount);
    });

    return result;
  }, [intents, statusFilter, chainFilter, sort]);

  // Scroll back to top when filtered list changes.
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [statusFilter, chainFilter, sort]);

  const virtualizer = useVirtualizer({
    count: filtered.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 5,
  });

  const virtualItems = virtualizer.getVirtualItems();

  return (
    <div className="min-h-screen">
      <Nav variant="breadcrumb" label="Explore" />

      <main id="main-content" className="max-w-5xl mx-auto px-5 py-12">
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <div className="eyebrow mb-3">Intent Explorer</div>
            <h1 className="text-3xl font-bold text-vx-text mb-3">Browse all intents</h1>
            <p className="text-vx-muted text-sm max-w-lg leading-relaxed">
              Every swap intent submitted to Vortex, from open auctions to completed fills.
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-vx-muted px-1 pt-1 flex-shrink-0">
            <span aria-hidden="true" className={`state-dot ${isLive ? "bg-vx-sage" : "bg-vx-dim"}`} />
            {isLive ? "Live" : "Polling"}
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <label htmlFor="status-filter" className="sr-only">Filter by status</label>
          <select
            id="status-filter"
            value={statusFilter}
            onChange={handleStatusChange}
            className="bg-vx-surface border border-vx-border rounded-lg px-3 py-2 text-sm text-vx-text"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s === "all" ? "All statuses" : s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>

          <label htmlFor="chain-filter" className="sr-only">Filter by chain</label>
          <select
            id="chain-filter"
            value={chainFilter}
            onChange={handleChainChange}
            className="bg-vx-surface border border-vx-border rounded-lg px-3 py-2 text-sm text-vx-text"
          >
            <option value="all">All chains</option>
            {CHAINS.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <label htmlFor="sort-order" className="sr-only">Sort order</label>
          <select
            id="sort-order"
            value={sort}
            onChange={handleSortChange}
            className="bg-vx-surface border border-vx-border rounded-lg px-3 py-2 text-sm text-vx-text"
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="largest">Largest amount</option>
          </select>

          <span className="text-xs text-vx-muted ml-auto">
            {filtered.length} intent{filtered.length === 1 ? "" : "s"}
          </span>
        </div>

        {/* Results */}
        {isLoading && intents.length === 0 ? (
          <div className="space-y-2">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-14 bg-vx-surface/40 rounded-lg border border-vx-line animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="card p-8 text-center text-sm text-vx-muted">
            Couldn&apos;t load intents right now. Try again shortly.
          </div>
        ) : filtered.length === 0 ? (
          <div className="card p-8 text-center text-sm text-vx-muted">
            No intents match your filters.
          </div>
        ) : (
          /* Virtualized list */
          <div
            ref={scrollRef}
            style={{ height: LIST_HEIGHT }}
            className="overflow-y-auto rounded-lg"
            aria-label="Intent list"
          >
            {/* Total height spacer so the scrollbar reflects the full list */}
            <div
              style={{ height: virtualizer.getTotalSize(), position: "relative" }}
            >
              {virtualItems.map((virtualRow) => {
                const item = filtered[virtualRow.index];
                return (
                  <div
                    key={virtualRow.key}
                    data-index={virtualRow.index}
                    ref={virtualizer.measureElement}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      transform: `translateY(${virtualRow.start}px)`,
                    }}
                    className="pb-2"
                  >
                    <Link
                      href={`/explore/${item.id}`}
                      className="flex items-center gap-4 p-4 bg-vx-surface/40 rounded-lg border border-vx-line
                                 hover:border-vx-border transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-vx-text truncate">
                          {item.srcAmount} {item.srcToken} → {item.dstToken}
                        </div>
                        <div className="text-xs text-vx-muted capitalize">
                          {item.srcChain} · via {item.solver}
                        </div>
                      </div>
                      <IntentStatusBadge status={item.status} />
                      <span className="text-xs text-vx-muted num flex-shrink-0 w-16 text-right">
                        {timeAgo(item.createdAt)}
                      </span>
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

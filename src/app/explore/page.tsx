"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { IntentStatusBadge } from "@/components/IntentStatusBadge";
import { IntentListSkeleton } from "@/components/Skeleton";
import { useLiveIntents } from "@/hooks/useLiveIntents";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
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

  const debouncedSearch = useDebouncedValue(search, SEARCH_DEBOUNCE_MS);

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
  }, [intents, debouncedSearch, statusFilter, chainFilter, sort]);

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
        <div className="mb-8">
          <div className="h-3 w-24 bg-vx-surface/40 rounded animate-pulse mb-3" />
          <div className="h-8 w-52 bg-vx-surface/40 rounded animate-pulse mb-3" />
          <div className="h-4 w-80 bg-vx-surface/40 rounded animate-pulse" />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <label htmlFor="intent-search" className="sr-only">Search intents</label>
          <input
            id="intent-search"
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by id, token, chain or solver"
            className="bg-vx-surface border border-vx-border rounded-lg px-3 py-2 text-sm text-vx-text
                       placeholder-vx-dim/60 focus:outline-none focus:border-vx-sage/50 transition-colors"
          />

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
          <IntentListSkeleton count={4} />
        ) : error ? (
          <div className="card p-8 text-center text-sm text-vx-muted">
            Couldn&apos;t load intents right now. Try again shortly.
          </div>
        ) : filtered.length === 0 ? (
          <div className="card p-8 text-center text-sm text-vx-muted">
            No intents match your filters.
          </div>
        ) : (
          <>
            <div role="row" className="flex items-center gap-4 px-4 pb-2 text-[10px] uppercase tracking-wide text-vx-dim">
              <div role="columnheader" aria-sort={sort === "largest" ? "descending" : "none"} className="flex-1 min-w-0">
                <button
                  type="button"
                  onClick={() => setSort("largest")}
                  className="flex items-center gap-1 text-left hover:text-vx-text transition-colors"
                >
                  Amount
                  {sort === "largest" && <span aria-hidden="true">↓</span>}
                </button>
              </div>
              <div
                role="columnheader"
                aria-sort={sort === "newest" ? "descending" : sort === "oldest" ? "ascending" : "none"}
                className="w-16 flex-shrink-0"
              >
                <button
                  type="button"
                  onClick={() => setSort(sort === "newest" ? "oldest" : "newest")}
                  className="flex items-center justify-end gap-1 w-full text-right hover:text-vx-text transition-colors"
                >
                  Time
                  {sort === "newest" && <span aria-hidden="true">↓</span>}
                  {sort === "oldest" && <span aria-hidden="true">↑</span>}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              {paginated.map((item) => (
                <Link
                  key={item.id}
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
                );
              })}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  ),
  ssr: false,
});

export default function ExplorePage() {
  return <ExplorePageClient />;
}

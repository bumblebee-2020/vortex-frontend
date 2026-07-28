import { clsx } from "clsx";

// ── Base ──────────────────────────────────────────────────────────────────────

interface SkeletonProps {
  className?: string;
}

/**
 * Base skeleton block — a pulse-animated, surface-tinted rectangle.
 * All variant components are built on top of this.
 */
export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={clsx(
        "animate-pulse bg-vx-surface/40 rounded-lg border border-vx-line",
        className
      )}
    />
  );
}

// ── Variants ──────────────────────────────────────────────────────────────────

/**
 * Matches a single row in the ActivityFeed (h-[52px] with icon + two text lines).
 */
export function FeedItemSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="flex items-center gap-3 px-3 h-[52px] bg-vx-surface/40 rounded-lg border border-vx-line animate-pulse"
    >
      {/* chain colour dot */}
      <div className="w-6 h-6 rounded-full bg-vx-line flex-shrink-0" />
      {/* text lines */}
      <div className="flex-1 space-y-1.5">
        <div className="h-2.5 w-2/3 bg-vx-line rounded" />
        <div className="h-2 w-1/3 bg-vx-line/60 rounded" />
      </div>
      {/* timestamp */}
      <div className="h-2 w-8 bg-vx-line/60 rounded flex-shrink-0" />
    </div>
  );
}

/**
 * Matches a single row in the intent list on /explore and /solve → intents tab
 * (h-14 with amount + badge + timestamp).
 */
export function IntentRowSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="flex items-center gap-4 px-4 h-14 bg-vx-surface/40 rounded-lg border border-vx-line animate-pulse"
    >
      {/* main text block */}
      <div className="flex-1 space-y-1.5">
        <div className="h-2.5 w-1/2 bg-vx-line rounded" />
        <div className="h-2 w-1/3 bg-vx-line/60 rounded" />
      </div>
      {/* status badge placeholder */}
      <div className="h-5 w-14 bg-vx-line/60 rounded-full flex-shrink-0" />
      {/* timestamp */}
      <div className="h-2 w-10 bg-vx-line/60 rounded flex-shrink-0" />
    </div>
  );
}

/**
 * Matches a single row in the solver leaderboard (h-16 with rank + name/address
 * + stats grid).
 */
export function SolverRowSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="flex items-center gap-3 px-5 h-16 bg-vx-surface/40 rounded-lg border border-vx-line animate-pulse"
    >
      {/* rank number */}
      <div className="h-5 w-6 bg-vx-line rounded flex-shrink-0" />
      {/* name + address */}
      <div className="flex-1 space-y-1.5">
        <div className="h-2.5 w-1/3 bg-vx-line rounded" />
        <div className="h-2 w-1/2 bg-vx-line/60 rounded" />
      </div>
      {/* stat pills */}
      <div className="hidden sm:flex gap-4 flex-shrink-0">
        {[40, 48, 36, 32].map((w, i) => (
          <div key={i} className={`h-2 bg-vx-line/60 rounded`} style={{ width: w }} />
        ))}
      </div>
    </div>
  );
}

// ── Convenience list components ───────────────────────────────────────────────

/** 3-item ActivityFeed placeholder (mirrors the real feed's initial render). */
export function FeedSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-2" aria-busy="true" aria-label="Loading feed…">
      {Array.from({ length: count }, (_, i) => (
        <FeedItemSkeleton key={i} />
      ))}
    </div>
  );
}

/** N-item intent list placeholder. */
export function IntentListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-2" aria-busy="true" aria-label="Loading intents…">
      {Array.from({ length: count }, (_, i) => (
        <IntentRowSkeleton key={i} />
      ))}
    </div>
  );
}

/** N-item solver leaderboard placeholder. */
export function SolverListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3" aria-busy="true" aria-label="Loading leaderboard…">
      {Array.from({ length: count }, (_, i) => (
        <SolverRowSkeleton key={i} />
      ))}
    </div>
  );
}

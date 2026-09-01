"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useIntentFeed } from "@/hooks/useIntentFeed";
import { FeedSkeleton } from "@/components/Skeleton";
import { timeAgo } from "@/lib/time";
import { useTranslation } from "@/lib/i18n/I18nProvider";
import type { FeedItem } from "@/lib/types";

const CHAIN_COLOR: Record<string, string> = {
  ethereum: "#627EEA", base: "#0052FF", polygon: "#8247E5",
  arbitrum: "#12AAFF", optimism: "#FF0420", avalanche: "#E84142",
};

/** Maximum number of activity items shown in the feed. */
const FEED_LIMIT = 6;

type ActivityFeedViewProps = ReturnType<typeof useIntentFeed>;

export function ActivityFeedView({ items, isLoading, error, isLive }: ActivityFeedViewProps) {
  const { t } = useTranslation();
  const [announcement, setAnnouncement] = useState("");
  const previousCount = useRef(items.length);
  const pendingCount = useRef(0);
  const announcementTimer = useRef<number | null>(null);

  /**
   * Memoized slice of the most recent feed items.
   * Avoids recreating the array on every render when `items` reference is stable.
   */
  const visibleItems = useMemo(() => items.slice(0, FEED_LIMIT), [items]);

  useEffect(() => {
    if (items.length > previousCount.current && previousCount.current > 0) {
      pendingCount.current += items.length - previousCount.current;
      if (announcementTimer.current !== null) {
        window.clearTimeout(announcementTimer.current);
      }
      announcementTimer.current = window.setTimeout(() => {
        const newCount = pendingCount.current;
        pendingCount.current = 0;
        announcementTimer.current = null;
        setAnnouncement(`${newCount} new fill${newCount === 1 ? "" : "s"}`);
      }, 1500);
      previousCount.current = items.length;
      return undefined;
    }
    previousCount.current = items.length;
    return undefined;
  }, [items.length]);

  if (isLoading && items.length === 0) {
    return (
      <div className="space-y-2">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-[52px] bg-vx-surface/40 rounded-lg border border-vx-line animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5 text-[10px] text-vx-muted px-1">
        <span aria-hidden="true" className={`state-dot ${isLive ? "bg-vx-sage" : "bg-vx-dim"}`} />
        {isLive ? "Live" : "Polling"}
      </div>
      {error && items.length === 0 ? (
        <div className="p-4 text-center text-xs text-vx-muted bg-vx-surface/40 rounded-lg border border-vx-line">
          Live feed unavailable right now.
        </div>
      ) : items.length === 0 ? (
        <div className="p-4 text-center text-xs text-vx-muted bg-vx-surface/40 rounded-lg border border-vx-line">
          No fills yet.
        </div>
      ) : null}
      {visibleItems.map((item) => {
        const color = CHAIN_COLOR[item.srcChain] ?? "#8B8B93";
        return (
          <div key={item.id} className="flex items-center gap-3 p-3 bg-vx-surface/40 rounded-lg
                                  border border-vx-line hover:border-vx-border transition-colors">
            <div aria-hidden="true" className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                 style={{ background: `${color}20`, border: `1px solid ${color}30` }}>
              <div className="w-2 h-2 rounded-full" style={{ background: color }} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-vx-text truncate">
                {item.srcAmount} {item.srcToken} → {item.dstToken}
              </div>
              <div className="text-[10px] text-vx-muted capitalize">
                {item.srcChain} · via {item.solver}
              </div>
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <span aria-hidden="true" className="state-dot bg-vx-sage" />
              <span
                className="text-[10px] text-vx-muted"
                title={new Date(item.createdAt).toLocaleString()}
                tabIndex={0}
              >
                {timeAgo(item.createdAt)}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

import useSWR from "swr";
import { fetcher } from "@/lib/api";
import type { FeedItem } from "@/lib/types";

export function useActivityFeed() {
  const { data, error, isLoading } = useSWR<FeedItem[]>("/intents/feed", fetcher, {
    refreshInterval: 8000,
    onErrorRetry(error, _key, _config, revalidate, { retryCount }) {
      if (error?.status >= 400 && error?.status < 500) return;
      if (retryCount >= 3) return;
      setTimeout(() => revalidate({ retryCount }), 1000 * 2 ** retryCount);
    },
  });

  return { items: data ?? [], isLoading, error };
}

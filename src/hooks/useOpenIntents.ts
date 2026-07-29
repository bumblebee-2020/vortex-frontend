import useSWR from "swr";
import { fetcher } from "@/lib/api";
import type { OpenIntent } from "@/lib/types";

export function useOpenIntents() {
  const { data, error, isLoading } = useSWR<OpenIntent[]>("/intents/open", fetcher, {
    refreshInterval: 5000,
    onErrorRetry(error, _key, _config, revalidate, { retryCount }) {
      if (error?.status >= 400 && error?.status < 500) return;
      if (retryCount >= 3) return;
      setTimeout(() => revalidate({ retryCount }), 1000 * 2 ** retryCount);
    },
  });

  return { intents: data ?? [], isLoading, error };
}

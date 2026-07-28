import useSWR from "swr";
import { fetcher } from "@/lib/api";
import type { FeedItem } from "@/lib/types";

// The /intents endpoint does not currently support an address filter, so we
// fetch all intents and filter client-side. Once the backend exposes
// GET /intents?address=<addr> this key can be swapped to that URL.
export function useMyIntents(address: string | null) {
  const { data, error, isLoading, mutate } = useSWR<FeedItem[]>(
    address ? "/intents" : null,
    fetcher,
  );

  const intents = (data ?? []).filter((i) => {
    // FeedItem does not yet expose a userAddress field; when the backend adds
    // it we can filter on i.userAddress === address. For now return all items
    // so the hook is already wired and the page shell can render them.
    return true;
  });

  return { intents, isLoading: address ? isLoading : false, error, mutate };
}

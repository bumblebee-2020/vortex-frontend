import useSWR from "swr";
import { fetcher } from "@/lib/api";
import type { Quote, QuoteRequest } from "@/lib/types";

function quoteKey(params: QuoteRequest | null): string | null {
  if (!params || !params.srcAmount || parseFloat(params.srcAmount) <= 0) return null;
  const search = new URLSearchParams({
    srcChain: params.srcChain,
    srcToken: params.srcToken,
    srcAmount: params.srcAmount,
    dstToken: params.dstToken,
  });
  return `/quote?${search.toString()}`;
}

export function useQuote(params: QuoteRequest | null) {
  const { data, error, isLoading } = useSWR<Quote>(quoteKey(params), fetcher, {
    revalidateOnFocus: false,
    onErrorRetry(error, _key, _config, revalidate, { retryCount }) {
      // Do not retry on 4xx client errors — they won't self-heal.
      if (error?.status >= 400 && error?.status < 500) return;
      // Cap at 3 retries with exponential back-off: 1s, 2s, 4s.
      if (retryCount >= 3) return;
      setTimeout(() => revalidate({ retryCount }), 1000 * 2 ** retryCount);
    },
  });

  return { quote: data, isLoading, error };
}

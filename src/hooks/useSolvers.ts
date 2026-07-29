import useSWR from "swr";
import { fetcher } from "@/lib/api";
import type { Solver } from "@/lib/types";

export function useSolvers() {
  const { data, error, isLoading } = useSWR<Solver[]>("/solvers", fetcher, {
    onErrorRetry(error, _key, _config, revalidate, { retryCount }) {
      if (error?.status >= 400 && error?.status < 500) return;
      if (retryCount >= 3) return;
      setTimeout(() => revalidate({ retryCount }), 1000 * 2 ** retryCount);
    },
  });

  return { solvers: data ?? [], isLoading, error };
}

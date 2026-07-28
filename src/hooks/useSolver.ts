import useSWR from "swr";
import { fetcher } from "@/lib/api";
import type { Solver } from "@/lib/types";

// Fetches a single solver by address. Currently uses the /solvers endpoint
// client-side filtering; this should be replaced with GET /solvers/:address
// once the backend exposes a per-solver endpoint.
export function useSolver(address: string | null) {
  const { data, error, isLoading } = useSWR<Solver[]>(address ? "/solvers" : null, fetcher);

  const solver = (data ?? []).find((s) => s.address === address) ?? null;

  return { solver, isLoading, error };
}

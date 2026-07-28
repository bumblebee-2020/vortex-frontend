import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { SWRConfig } from "swr";
import { createElement, type ReactNode } from "react";
import { useSolver } from "./useSolver";
import type { Solver } from "@/lib/types";

const wrapper = ({ children }: { children: ReactNode }) =>
  createElement(SWRConfig, { value: { provider: () => new Map(), dedupingInterval: 0 } }, children);

const solvers: Solver[] = [
  {
    name: "Alpha Solver",
    address: "GABC123DEF456GHI789JKL012MNO345PQR678STU",
    bondUsd: 50000,
    fills: 152,
    failed: 3,
    volumeUsd: 2500000,
    avgFillTimeSeconds: 45,
    successRatePct: 98.05,
    chains: ["ethereum", "stellar"],
  },
  {
    name: "Beta Market",
    address: "GXYZ789ABC456DEF012GHI345JKL678MNO901PQR",
    bondUsd: 75000,
    fills: 298,
    failed: 5,
    volumeUsd: 4200000,
    avgFillTimeSeconds: 52,
    successRatePct: 98.34,
    chains: ["ethereum"],
  },
];

describe("useSolver", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("does not fetch when address is null", () => {
    renderHook(() => useSolver(null), { wrapper });
    expect(fetch).not.toHaveBeenCalled();
  });

  it("fetches and returns the solver by address", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => solvers,
    });

    const { result } = renderHook(() => useSolver(solvers[0].address), { wrapper });

    await waitFor(() => expect(result.current.solver).toEqual(solvers[0]));
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining("/solvers"), expect.anything());
  });

  it("returns null when solver address is not found", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => solvers,
    });

    const { result } = renderHook(() => useSolver("GNOT_A_VALID_ADDRESS_1234567890123456789"), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.solver).toBeNull();
    expect(result.current.error).toBeUndefined();
  });

  it("surfaces a fetch failure as an error", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: false,
      status: 500,
      statusText: "Internal Server Error",
      text: async () => "",
    });

    const { result } = renderHook(() => useSolver(solvers[0].address), { wrapper });

    await waitFor(() => expect(result.current.error).toBeDefined());
    expect(result.current.solver).toBeNull();
  });

  it("returns empty state while loading", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => solvers,
    });

    const { result } = renderHook(() => useSolver(solvers[0].address), { wrapper });
    expect(result.current.solver).toBeNull();
    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isLoading).toBe(false));
  });
});

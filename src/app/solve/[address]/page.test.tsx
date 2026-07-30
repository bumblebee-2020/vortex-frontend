import { describe, expect, it, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import SolverDetailPage from "./page";

// Mock the hooks
vi.mock("@/hooks/useSolvers", () => ({
  useSolvers: vi.fn(() => ({
    solvers: [
      {
        name: "AlphaMax",
        address: "GBRPYHIL2CI3WHZDTOOQFC6EB4CGQOFN4QO5JTJVSXBLEDSOMETHING",
        bondUsd: 500,
        fills: 42,
        failed: 1,
        volumeUsd: 125000,
        avgFillTimeSeconds: 12,
        successRatePct: 97.67,
        chains: ["ethereum", "polygon"],
        status: "active",
      },
    ],
    isLoading: false,
    error: undefined,
  })),
}));

vi.mock("@/hooks/useIntentFeed", () => ({
  useIntentFeed: vi.fn(() => ({
    items: [
      {
        id: "intent-1",
        srcChain: "ethereum",
        srcToken: "USDC",
        srcAmount: "500",
        dstToken: "XLM",
        solver: "GBRPYHIL2CI3WHZDTOOQFC6EB4CGQOFN4QO5JTJVSXBLEDSOMETHING",
        status: "filled" as const,
        createdAt: new Date().toISOString(),
      },
    ],
    isLoading: false,
    error: undefined,
    isLive: false,
  })),
}));

vi.mock("@/components/Nav", () => ({
  Nav: () => <div data-testid="nav">Nav</div>,
}));

vi.mock("@/components/Footer", () => ({
  Footer: () => <div data-testid="footer">Footer</div>,
}));

vi.mock("@/components/IntentStatusBadge", () => ({
  IntentStatusBadge: ({ status }: { status: string }) => (
    <div data-testid="status-badge">{status}</div>
  ),
}));

describe("SolverDetailPage", () => {
  it("renders solver information with proper headings", () => {
    render(
      <SolverDetailPage params={{ address: "GBRPYHIL2CI3WHZDTOOQFC6EB4CGQOFN4QO5JTJVSXBLEDSOMETHING" }} />
    );

    expect(screen.getByRole("main")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("AlphaMax");
  });

  it("displays solver status with proper ARIA label", () => {
    render(
      <SolverDetailPage params={{ address: "GBRPYHIL2CI3WHZDTOOQFC6EB4CGQOFN4QO5JTJVSXBLEDSOMETHING" }} />
    );

    const statusBadge = screen.getByLabelText(/Solver status:/);
    expect(statusBadge).toBeInTheDocument();
  });

  it("displays solver metrics in proper structure", () => {
    render(
      <SolverDetailPage params={{ address: "GBRPYHIL2CI3WHZDTOOQFC6EB4CGQOFN4QO5JTJVSXBLEDSOMETHING" }} />
    );

    expect(screen.getByText("Fills")).toBeInTheDocument();
    expect(screen.getByText("42")).toBeInTheDocument();
    expect(screen.getByText("Success Rate")).toBeInTheDocument();
  });

  describe("chain coverage section", () => {
    it("displays the Supported Chains heading", () => {
      render(
        <SolverDetailPage params={{ address: "GBRPYHIL2CI3WHZDTOOQFC6EB4CGQOFN4QO5JTJVSXBLEDSOMETHING" }} />
      );

      expect(screen.getByText("Supported Chains")).toBeInTheDocument();
    });

    it("displays chain full names from marketData for a solver with multiple chains", () => {
      render(
        <SolverDetailPage params={{ address: "GBRPYHIL2CI3WHZDTOOQFC6EB4CGQOFN4QO5JTJVSXBLEDSOMETHING" }} />
      );

      // AlphaMax has chains: ["ethereum", "polygon"]
      // Should render the full names from CHAINS metadata, not the raw IDs
      expect(screen.getByText("Ethereum")).toBeInTheDocument();
      expect(screen.getByText("Polygon")).toBeInTheDocument();
      // Raw chain IDs should NOT be visible (replaced by names)
      expect(screen.queryByText("ethereum")).not.toBeInTheDocument();
      expect(screen.queryByText("polygon")).not.toBeInTheDocument();
    });

    it("applies chain-specific colors from marketData as inline styles", () => {
      render(
        <SolverDetailPage params={{ address: "GBRPYHIL2CI3WHZDTOOQFC6EB4CGQOFN4QO5JTJVSXBLEDSOMETHING" }} />
      );

      const ethereumBadge = screen.getByText("Ethereum");
      const polygonBadge = screen.getByText("Polygon");

      // Ethereum color is #627EEA, Polygon color is #8247E5
      expect(ethereumBadge).toHaveStyle({ backgroundColor: "#627EEA" });
      expect(polygonBadge).toHaveStyle({ backgroundColor: "#8247E5" });
    });

    it("displays chain name for a solver with a single chain", async () => {
      const { useSolvers } = await import("@/hooks/useSolvers");
      vi.mocked(useSolvers).mockReturnValueOnce({
        solvers: [
          {
            name: "SingleChainSolver",
            address: "SINGLECHAIN000000000000000000000000000000000000000000",
            bondUsd: 100,
            fills: 5,
            failed: 0,
            volumeUsd: 5000,
            avgFillTimeSeconds: 8,
            successRatePct: 100,
            chains: ["base"],
            status: "active",
          },
        ],
        isLoading: false,
        error: undefined,
      });

      render(
        <SolverDetailPage params={{ address: "SINGLECHAIN000000000000000000000000000000000000000000" }} />
      );

      // Should display the full name "Base", not the id "base"
      expect(screen.getByText("Base")).toBeInTheDocument();
      expect(screen.queryByText("base")).not.toBeInTheDocument();

      // Should not show "No chains supported yet"
      expect(screen.queryByText("No chains supported yet")).not.toBeInTheDocument();
    });

    it("falls back to chain id and default color for unknown chains", async () => {
      const { useSolvers } = await import("@/hooks/useSolvers");
      vi.mocked(useSolvers).mockReturnValueOnce({
        solvers: [
          {
            name: "UnknownChainSolver",
            address: "UNKNOWNCHAIN00000000000000000000000000000000000000000",
            bondUsd: 100,
            fills: 2,
            failed: 0,
            volumeUsd: 2000,
            avgFillTimeSeconds: 15,
            successRatePct: 100,
            chains: ["solana"],
            status: "active",
          },
        ],
        isLoading: false,
        error: undefined,
      });

      render(
        <SolverDetailPage params={{ address: "UNKNOWNCHAIN00000000000000000000000000000000000000000" }} />
      );

      // "solana" is not in CHAINS, so falls back to rendering the raw id
      expect(screen.getByText("solana")).toBeInTheDocument();
    });

    it("shows empty state when solver has no chains", async () => {
      const { useSolvers } = await import("@/hooks/useSolvers");
      vi.mocked(useSolvers).mockReturnValueOnce({
        solvers: [
          {
            name: "NoChainsYet",
            address: "NOCHAINS000000000000000000000000000000000000000000000",
            bondUsd: 50,
            fills: 0,
            failed: 0,
            volumeUsd: 0,
            avgFillTimeSeconds: 0,
            successRatePct: 0,
            chains: [],
            status: "inactive",
          },
        ],
        isLoading: false,
        error: undefined,
      });

      render(
        <SolverDetailPage params={{ address: "NOCHAINS000000000000000000000000000000000000000000000" }} />
      );

      expect(screen.getByText("No chains supported yet")).toBeInTheDocument();
    });
  });

  it("displays fill history with proper section heading", () => {
    render(
      <SolverDetailPage params={{ address: "GBRPYHIL2CI3WHZDTOOQFC6EB4CGQOFN4QO5JTJVSXBLEDSOMETHING" }} />
    );

    expect(screen.getByText("Recent Fills by Solver")).toBeInTheDocument();
  });

  it("has back link with proper styling for focus", () => {
    render(
      <SolverDetailPage params={{ address: "GBRPYHIL2CI3WHZDTOOQFC6EB4CGQOFN4QO5JTJVSXBLEDSOMETHING" }} />
    );

    const backLink = screen.getByText("← Back to solvers");
    expect(backLink).toBeInTheDocument();
    expect(backLink.closest("a")).toHaveClass("focus:outline-none");
  });

  it("uses alert role for error messages", () => {
    render(
      <SolverDetailPage params={{ address: "INVALID" }} />
    );

    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent("No solver found at that address.");
  });
});

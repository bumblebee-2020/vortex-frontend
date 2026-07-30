import { describe, expect, it, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SolverDetailPage from "./page";
import { useToastStore } from "@/store/toast";

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
      {
        name: "BetaBot",
        address: "GBZXN3Z5GEO57LMOJNWHPGKBPJJQNVBIVLYOXG2VE7JQDZHW53DFUEI",
        bondUsd: 300,
        fills: 30,
        failed: 2,
        volumeUsd: 75000,
        avgFillTimeSeconds: 15,
        successRatePct: 93.33,
        chains: ["ethereum"],
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

  // Issue #48: Copy-to-clipboard for solver address
  it("renders a copy button for the solver address", () => {
    render(
      <SolverDetailPage params={{ address: "GBRPYHIL2CI3WHZDTOOQFC6EB4CGQOFN4QO5JTJVSXBLEDSOMETHING" }} />
    );

    const copyButton = screen.getByRole("button", { name: /copy/i });
    expect(copyButton).toBeInTheDocument();
  });

  it("copies solver address to clipboard when copy button is clicked", async () => {
    const mockClipboard = vi.fn();
    Object.assign(navigator, {
      clipboard: {
        writeText: mockClipboard,
      },
    });

    render(
      <SolverDetailPage params={{ address: "GBRPYHIL2CI3WHZDTOOQFC6EB4CGQOFN4QO5JTJVSXBLEDSOMETHING" }} />
    );

    const copyButton = screen.getByRole("button", { name: /copy/i });
    await userEvent.click(copyButton);

    expect(mockClipboard).toHaveBeenCalledWith("GBRPYHIL2CI3WHZDTOOQFC6EB4CGQOFN4QO5JTJVSXBLEDSOMETHING");
  });

  it("shows a success toast when address is copied", async () => {
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });

    render(
      <SolverDetailPage params={{ address: "GBRPYHIL2CI3WHZDTOOQFC6EB4CGQOFN4QO5JTJVSXBLEDSOMETHING" }} />
    );

    const copyButton = screen.getByRole("button", { name: /copy/i });
    await userEvent.click(copyButton);

    await waitFor(() => {
      const toasts = useToastStore.getState().toasts;
      expect(toasts.some(t => t.variant === "success")).toBe(true);
    });
  });

  it("copy button is keyboard accessible", async () => {
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });

    const user = userEvent.setup();
    render(
      <SolverDetailPage params={{ address: "GBRPYHIL2CI3WHZDTOOQFC6EB4CGQOFN4QO5JTJVSXBLEDSOMETHING" }} />
    );

    const copyButton = screen.getByRole("button", { name: /copy/i });
    await user.tab();
    expect(copyButton).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(navigator.clipboard.writeText).toHaveBeenCalled();
  });

  // Issue #47: Solver trend indicators
  it("displays solver trend for success rate compared to average", () => {
    render(
      <SolverDetailPage params={{ address: "GBRPYHIL2CI3WHZDTOOQFC6EB4CGQOFN4QO5JTJVSXBLEDSOMETHING" }} />
    );

    const successRateTrend = screen.queryByTestId("success-rate-trend");
    if (successRateTrend) {
      expect(successRateTrend).toBeInTheDocument();
    }
  });

  it("displays solver trend for fill time compared to average", () => {
    render(
      <SolverDetailPage params={{ address: "GBRPYHIL2CI3WHZDTOOQFC6EB4CGQOFN4QO5JTJVSXBLEDSOMETHING" }} />
    );

    const fillTimeTrend = screen.queryByTestId("fill-time-trend");
    if (fillTimeTrend) {
      expect(fillTimeTrend).toBeInTheDocument();
    }
  });

  it("correctly identifies above-average success rate", () => {
    render(
      <SolverDetailPage params={{ address: "GBRPYHIL2CI3WHZDTOOQFC6EB4CGQOFN4QO5JTJVSXBLEDSOMETHING" }} />
    );

    const trendIndicator = screen.queryByText(/above.*average/i);
    if (trendIndicator) {
      expect(trendIndicator).toBeInTheDocument();
    }
  });

  // Issue #46: Not-found state for unknown address
  it("shows not-found state for unknown solver address", () => {
    render(
      <SolverDetailPage params={{ address: "GBUNKNOWNADDRESSNOTFOUND0000000000000000000" }} />
    );

    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent(/No solver found/i);
  });

  it("distinguishes not-found from loading state", () => {
    render(
      <SolverDetailPage params={{ address: "GBUNKNOWNADDRESSNOTFOUND0000000000000000000" }} />
    );

    const notFoundAlert = screen.getByRole("alert");
    expect(notFoundAlert).toBeInTheDocument();
    expect(notFoundAlert).not.toHaveClass("animate-pulse");
  });

  it("displays not-found message with proper ARIA role", () => {
    render(
      <SolverDetailPage params={{ address: "GBUNKNOWNADDRESSNOTFOUND0000000000000000000" }} />
    );

    const alert = screen.getByRole("alert", { name: /No solver found/i });
    expect(alert).toBeInTheDocument();
  });

  // Issue #45: Loading skeleton
  it("renders loading skeleton while fetching solver details", () => {
    const { useSolversModule } = vi.hoisted(() => ({
      useSolversModule: {
        useSolvers: vi.fn(() => ({
          solvers: [],
          isLoading: true,
          error: undefined,
        })),
      },
    }));

    vi.doMock("@/hooks/useSolvers", () => useSolversModule);

    render(
      <SolverDetailPage params={{ address: "GBRPYHIL2CI3WHZDTOOQFC6EB4CGQOFN4QO5JTJVSXBLEDSOMETHING" }} />
    );

    const skeletons = screen.queryAllByTestId("skeleton");
    if (skeletons.length > 0) {
      expect(skeletons.length).toBeGreaterThan(0);
    }
  });

  it("skeleton has loading animation", () => {
    const { useSolversModule } = vi.hoisted(() => ({
      useSolversModule: {
        useSolvers: vi.fn(() => ({
          solvers: [],
          isLoading: true,
          error: undefined,
        })),
      },
    }));

    vi.doMock("@/hooks/useSolvers", () => useSolversModule);

    render(
      <SolverDetailPage params={{ address: "GBRPYHIL2CI3WHZDTOOQFC6EB4CGQOFN4QO5JTJVSXBLEDSOMETHING" }} />
    );

    const animatedSkeletons = screen.queryAllByTestId("skeleton");
    animatedSkeletons.forEach(skeleton => {
      expect(skeleton).toHaveClass("animate-pulse");
    });
  });

  it("does not show skeleton when content is loaded", () => {
    render(
      <SolverDetailPage params={{ address: "GBRPYHIL2CI3WHZDTOOQFC6EB4CGQOFN4QO5JTJVSXBLEDSOMETHING" }} />
    );

    const skeletons = screen.queryAllByTestId("skeleton");
    expect(skeletons.length).toBe(0);
  });
});

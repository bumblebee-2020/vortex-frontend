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

  it("displays chain coverage with heading", () => {
    render(
      <SolverDetailPage params={{ address: "GBRPYHIL2CI3WHZDTOOQFC6EB4CGQOFN4QO5JTJVSXBLEDSOMETHING" }} />
    );

    expect(screen.getByText("Supported Chains")).toBeInTheDocument();
    expect(screen.getByText("ethereum")).toBeInTheDocument();
    expect(screen.getByText("polygon")).toBeInTheDocument();
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
    const { rerender } = render(
      <SolverDetailPage params={{ address: "INVALID" }} />
    );

    const alert = screen.getByRole("alert", {
      name: /No solver found/,
    });
    expect(alert).toBeInTheDocument();
  });
});

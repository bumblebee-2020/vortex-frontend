import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import SolverDetailPage from "./page";

const solverData = {
  name: "AlphaMax",
  address: "GDW4UXK66PDDK4CDDUJGNPFZHBZDWAJNNUE5ZEQYN5S3DISNGXZIVAIV",
  bondUsd: 500,
  fills: 42,
  failed: 1,
  volumeUsd: 125000,
  avgFillTimeSeconds: 12,
  successRatePct: 97.67,
  chains: ["ethereum", "polygon"],
};

const { useSolverMock } = vi.hoisted(() => ({
  useSolverMock: vi.fn(),
}));

vi.mock("@/hooks/useSolver", () => ({
  useSolver: useSolverMock,
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
        solver: "GDW4UXK66PDDK4CDDUJGNPFZHBZDWAJNNUE5ZEQYN5S3DISNGXZIVAIV",
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
  it("rejects an invalid address format", () => {
    useSolverMock.mockReturnValue({ solver: null, isLoading: false, error: undefined });
    render(<SolverDetailPage params={{ address: "INVALID_ADDRESS" }} />);

    expect(screen.getByText("Invalid solver address format.")).toBeInTheDocument();
  });

  it("does not fetch when address is invalid", () => {
    useSolverMock.mockReturnValue({ solver: null, isLoading: false, error: undefined });
    render(<SolverDetailPage params={{ address: "INVALID" }} />);

    expect(useSolverMock).toHaveBeenCalledWith(null);
  });

  it("fetches solver when address is valid", () => {
    useSolverMock.mockReturnValue({ solver: solverData, isLoading: false, error: undefined });
    render(
      <SolverDetailPage params={{ address: "GDW4UXK66PDDK4CDDUJGNPFZHBZDWAJNNUE5ZEQYN5S3DISNGXZIVAIV" }} />
    );

    expect(useSolverMock).toHaveBeenCalledWith("GDW4UXK66PDDK4CDDUJGNPFZHBZDWAJNNUE5ZEQYN5S3DISNGXZIVAIV");
  });

  it("renders loading state", () => {
    useSolverMock.mockReturnValue({ solver: null, isLoading: true, error: undefined });
    const { container } = render(
      <SolverDetailPage params={{ address: "GDW4UXK66PDDK4CDDUJGNPFZHBZDWAJNNUE5ZEQYN5S3DISNGXZIVAIV" }} />
    );

    expect(container.querySelectorAll(".animate-pulse").length).toBeGreaterThan(0);
  });

  it("renders error state when fetch fails", () => {
    useSolverMock.mockReturnValue({ solver: null, isLoading: false, error: new Error("Network error") });
    render(
      <SolverDetailPage params={{ address: "GDW4UXK66PDDK4CDDUJGNPFZHBZDWAJNNUE5ZEQYN5S3DISNGXZIVAIV" }} />
    );

    expect(screen.getByRole("alert")).toHaveTextContent(/Couldn't load solver/);
  });

  it("renders not found state when solver is null", () => {
    useSolverMock.mockReturnValue({ solver: null, isLoading: false, error: undefined });
    render(
      <SolverDetailPage params={{ address: "GDW4UXK66PDDK4CDDUJGNPFZHBZDWAJNNUE5ZEQYN5S3DISNGXZIVAIV" }} />
    );

    expect(screen.getByRole("alert")).toHaveTextContent(/No solver found/);
  });

  it("renders solver information when found", () => {
    useSolverMock.mockReturnValue({ solver: solverData, isLoading: false, error: undefined });
    render(
      <SolverDetailPage params={{ address: "GDW4UXK66PDDK4CDDUJGNPFZHBZDWAJNNUE5ZEQYN5S3DISNGXZIVAIV" }} />
    );

    expect(screen.getByRole("main")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("AlphaMax");
  });

  it("displays solver metrics in proper structure", () => {
    useSolverMock.mockReturnValue({ solver: solverData, isLoading: false, error: undefined });
    render(
      <SolverDetailPage params={{ address: "GDW4UXK66PDDK4CDDUJGNPFZHBZDWAJNNUE5ZEQYN5S3DISNGXZIVAIV" }} />
    );

    expect(screen.getByText("Fills")).toBeInTheDocument();
    expect(screen.getByText("42")).toBeInTheDocument();
    expect(screen.getByText("Success Rate")).toBeInTheDocument();
  });

  it("displays chain coverage", () => {
    useSolverMock.mockReturnValue({ solver: solverData, isLoading: false, error: undefined });
    render(
      <SolverDetailPage params={{ address: "GDW4UXK66PDDK4CDDUJGNPFZHBZDWAJNNUE5ZEQYN5S3DISNGXZIVAIV" }} />
    );

    expect(screen.getByText("Supported Chains")).toBeInTheDocument();
    expect(screen.getByText("ethereum")).toBeInTheDocument();
    expect(screen.getByText("polygon")).toBeInTheDocument();
  });

  it("displays fill history heading", () => {
    useSolverMock.mockReturnValue({ solver: solverData, isLoading: false, error: undefined });
    render(
      <SolverDetailPage params={{ address: "GDW4UXK66PDDK4CDDUJGNPFZHBZDWAJNNUE5ZEQYN5S3DISNGXZIVAIV" }} />
    );

    expect(screen.getByText("Recent Fills by Solver")).toBeInTheDocument();
  });

  it("has back link to solvers list", () => {
    useSolverMock.mockReturnValue({ solver: solverData, isLoading: false, error: undefined });
    render(
      <SolverDetailPage params={{ address: "GDW4UXK66PDDK4CDDUJGNPFZHBZDWAJNNUE5ZEQYN5S3DISNGXZIVAIV" }} />
    );

    const backLink = screen.getByText("← Back to solvers");
    expect(backLink).toHaveAttribute("href", "/solve");
  });
});

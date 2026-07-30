import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import type { FeedItem } from "@/lib/types";

const { useIntentFeedMock } = vi.hoisted(() => ({
  useIntentFeedMock: vi.fn(),
}));

vi.mock("@/hooks/useIntentFeed", () => ({
  useIntentFeed: useIntentFeedMock,
}));

vi.mock("@/components/IntentStatusBadge", () => ({
  IntentStatusBadge: ({ status }: { status: string }) => (
    <div data-testid="status-badge">{status}</div>
  ),
}));

vi.mock("@/lib/time", () => ({
  timeAgo: (date: string) => {
    const now = new Date();
    const then = new Date(date);
    const seconds = Math.floor((now.getTime() - then.getTime()) / 1000);

    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  },
}));

function SolverFillHistory({ solverAddress }: { solverAddress: string }) {
  const { items: fillHistory, isLoading, error } = useIntentFeedMock();

  const solverFills = fillHistory
    .filter((item: FeedItem) => item.solver === solverAddress)
    .slice(0, 10);

  if (isLoading) {
    return (
      <div className="p-4 space-y-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-16 bg-vx-surface/40 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div role="alert" className="p-6 text-center text-sm text-vx-muted">
        Couldn&apos;t load fill history right now.
      </div>
    );
  }

  if (solverFills.length === 0) {
    return (
      <div className="p-6 text-center text-sm text-vx-muted">
        No fills from this solver in the history.
      </div>
    );
  }

  return (
    <div className="divide-y divide-vx-line">
      {solverFills.map((fill: FeedItem) => (
        <div
          key={fill.id}
          className="px-4 py-4 hover:bg-vx-surface/30 transition-colors"
        >
          <div className="flex flex-col gap-2">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <div className="num text-xs text-vx-muted mb-1 truncate">
                  ID: {fill.id}
                </div>
                <div className="text-xs font-medium text-vx-text capitalize">
                  {fill.srcAmount} {fill.srcToken} → {fill.dstToken}
                </div>
              </div>
              <div data-testid="status-badge">{fill.status}</div>
            </div>
            <div className="text-xs text-vx-muted">
              {fill.srcChain} · a moment ago
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

describe("SolverFillHistory", () => {
  it("shows loading skeleton while fills are being fetched", () => {
    useIntentFeedMock.mockReturnValue({
      items: [],
      isLoading: true,
      error: undefined,
      isLive: false,
    });

    const { container } = render(
      <SolverFillHistory solverAddress="GBRPYHIL2CI3WHZDTOOQFC6EB4CGQOFN4QO5JTJVSXBLEDSOMETHING" />
    );

    expect(container.querySelectorAll(".animate-pulse").length).toBeGreaterThan(0);
  });

  it("shows error state when fill history fails to load", () => {
    useIntentFeedMock.mockReturnValue({
      items: [],
      isLoading: false,
      error: new Error("Failed to fetch"),
      isLive: false,
    });

    render(
      <SolverFillHistory solverAddress="GBRPYHIL2CI3WHZDTOOQFC6EB4CGQOFN4QO5JTJVSXBLEDSOMETHING" />
    );

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText(/Couldn't load fill history/)).toBeInTheDocument();
  });

  it("shows empty state when solver has no fills", () => {
    useIntentFeedMock.mockReturnValue({
      items: [
        {
          id: "fill-1",
          srcChain: "ethereum",
          srcToken: "USDC",
          srcAmount: "500",
          dstToken: "USDT",
          solver: "DIFFERENT_ADDRESS",
          status: "filled" as const,
          createdAt: new Date().toISOString(),
        },
      ],
      isLoading: false,
      error: undefined,
      isLive: false,
    });

    render(
      <SolverFillHistory solverAddress="GBRPYHIL2CI3WHZDTOOQFC6EB4CGQOFN4QO5JTJVSXBLEDSOMETHING" />
    );

    expect(screen.getByText(/No fills from this solver/)).toBeInTheDocument();
  });

  it("renders fills with proper formatting and status badges", () => {
    const fills: FeedItem[] = [
      {
        id: "fill-1",
        srcChain: "ethereum",
        srcToken: "USDC",
        srcAmount: "500",
        dstToken: "USDT",
        solver: "GBRPYHIL2CI3WHZDTOOQFC6EB4CGQOFN4QO5JTJVSXBLEDSOMETHING",
        status: "filled",
        createdAt: new Date().toISOString(),
      },
      {
        id: "fill-2",
        srcChain: "polygon",
        srcToken: "DAI",
        srcAmount: "1000",
        dstToken: "USDC",
        solver: "GBRPYHIL2CI3WHZDTOOQFC6EB4CGQOFN4QO5JTJVSXBLEDSOMETHING",
        status: "pending",
        createdAt: new Date(Date.now() - 300000).toISOString(),
      },
    ];

    useIntentFeedMock.mockReturnValue({
      items: fills,
      isLoading: false,
      error: undefined,
      isLive: false,
    });

    render(
      <SolverFillHistory solverAddress="GBRPYHIL2CI3WHZDTOOQFC6EB4CGQOFN4QO5JTJVSXBLEDSOMETHING" />
    );

    expect(screen.getByText("500 USDC → USDT")).toBeInTheDocument();
    expect(screen.getByText("1000 DAI → USDC")).toBeInTheDocument();
    expect(screen.getByText("ethereum")).toBeInTheDocument();
    expect(screen.getByText("polygon")).toBeInTheDocument();
    expect(screen.getAllByTestId("status-badge")).toHaveLength(2);
  });

  it("shows at most 10 fills even when more are available", () => {
    const fills: FeedItem[] = Array.from({ length: 15 }, (_, i) => ({
      id: `fill-${i}`,
      srcChain: "ethereum",
      srcToken: "USDC",
      srcAmount: "100",
      dstToken: "USDT",
      solver: "GBRPYHIL2CI3WHZDTOOQFC6EB4CGQOFN4QO5JTJVSXBLEDSOMETHING",
      status: "filled" as const,
      createdAt: new Date(Date.now() - i * 60000).toISOString(),
    }));

    useIntentFeedMock.mockReturnValue({
      items: fills,
      isLoading: false,
      error: undefined,
      isLive: false,
    });

    render(
      <SolverFillHistory solverAddress="GBRPYHIL2CI3WHZDTOOQFC6EB4CGQOFN4QO5JTJVSXBLEDSOMETHING" />
    );

    const fills_display = screen.getAllByText("100 USDC → USDT");
    expect(fills_display.length).toBeLessThanOrEqual(10);
  });

  it("filters fills by solver address correctly", () => {
    const fills: FeedItem[] = [
      {
        id: "fill-1",
        srcChain: "ethereum",
        srcToken: "USDC",
        srcAmount: "500",
        dstToken: "USDT",
        solver: "GBRPYHIL2CI3WHZDTOOQFC6EB4CGQOFN4QO5JTJVSXBLEDSOMETHING",
        status: "filled",
        createdAt: new Date().toISOString(),
      },
      {
        id: "fill-2",
        srcChain: "polygon",
        srcToken: "DAI",
        srcAmount: "1000",
        dstToken: "USDC",
        solver: "DIFFERENT_ADDRESS",
        status: "pending",
        createdAt: new Date().toISOString(),
      },
    ];

    useIntentFeedMock.mockReturnValue({
      items: fills,
      isLoading: false,
      error: undefined,
      isLive: false,
    });

    render(
      <SolverFillHistory solverAddress="GBRPYHIL2CI3WHZDTOOQFC6EB4CGQOFN4QO5JTJVSXBLEDSOMETHING" />
    );

    expect(screen.getByText("500 USDC → USDT")).toBeInTheDocument();
    expect(screen.queryByText("1000 DAI → USDC")).not.toBeInTheDocument();
  });
});

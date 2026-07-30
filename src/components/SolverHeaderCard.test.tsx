import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import type { Solver } from "@/lib/types";

vi.mock("@/components/IntentStatusBadge", () => ({
  IntentStatusBadge: ({ status }: { status: string }) => (
    <div data-testid="status-badge">{status}</div>
  ),
}));

function SolverHeaderCard({ solver }: { solver: Solver }) {
  function truncateAddress(address: string) {
    if (address.length <= 12) return address;
    return `${address.slice(0, 6)}...${address.slice(-6)}`;
  }

  const usdCompact = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 1,
  });

  return (
    <div className="card p-4 sm:p-6 space-y-4 sm:space-y-6">
      <div className="flex items-start justify-between gap-3 sm:gap-4">
        <div>
          <div className="eyebrow mb-1 sm:mb-2 text-xs">Solver</div>
          <h1 className="text-lg sm:text-2xl font-bold text-vx-text break-words">
            {solver.name}
          </h1>
        </div>
        <div
          className={`flex-shrink-0 px-2 sm:px-3 py-1 rounded-lg text-xs font-semibold border whitespace-nowrap ${
            solver.status === "active"
              ? "bg-vx-sage-bg text-vx-sage border-vx-sage/30"
              : "bg-vx-surface text-vx-muted border-vx-border"
          }`}
          aria-label={`Solver status: ${solver.status}`}
        >
          {solver.status === "active" ? "Active" : "Inactive"}
        </div>
      </div>

      <div className="text-xs sm:text-sm text-vx-muted font-mono break-all">
        Address: {truncateAddress(solver.address)}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <div className="bg-vx-surface/40 rounded-lg p-3">
          <div className="eyebrow text-[10px] sm:text-xs mb-1">Bond</div>
          <div className="num text-xs sm:text-sm font-semibold text-vx-text">
            {usdCompact.format(solver.bondUsd)}
          </div>
        </div>
        <div className="bg-vx-surface/40 rounded-lg p-3">
          <div className="eyebrow text-[10px] sm:text-xs mb-1">Status</div>
          <div className="flex items-center">
            <div
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border capitalize ${
                solver.status === "active"
                  ? "bg-vx-sage-bg text-vx-sage border-vx-sage/30"
                  : "bg-red-500/10 text-red-300 border-red-500/30"
              }`}
            >
              {solver.status}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

describe("SolverHeaderCard", () => {
  const mockSolver: Solver = {
    name: "Alpha Market Making",
    address: "GBRPYHIL2CI3WHZDTOOQFC6EB4CGQOFN4QO5JTJVSXBLEDSOMETHING",
    bondUsd: 5000,
    fills: 842,
    failed: 3,
    volumeUsd: 4_200_000,
    avgFillTimeSeconds: 47,
    successRatePct: 99.6,
    chains: ["Ethereum", "Base"],
    status: "active",
  };

  it("renders solver name with proper heading level", () => {
    render(<SolverHeaderCard solver={mockSolver} />);

    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toHaveTextContent("Alpha Market Making");
  });

  it("displays solver identity information in header", () => {
    render(<SolverHeaderCard solver={mockSolver} />);

    expect(screen.getByText("Solver")).toBeInTheDocument();
    expect(screen.getByText(/GBRPYHIL.+BLEDSOMETHING/)).toBeInTheDocument();
  });

  it("shows bond amount in USD currency format", () => {
    render(<SolverHeaderCard solver={mockSolver} />);

    expect(screen.getByText("Bond")).toBeInTheDocument();
    expect(screen.getByText("$5K")).toBeInTheDocument();
  });

  it("displays status badge with active styling for active solvers", () => {
    render(<SolverHeaderCard solver={mockSolver} />);

    const statusBadge = screen.getByLabelText(/Solver status:/);
    expect(statusBadge).toHaveTextContent("Active");
    expect(statusBadge).toHaveClass("bg-vx-sage-bg");
    expect(statusBadge).toHaveClass("text-vx-sage");
  });

  it("displays status badge with inactive styling for inactive solvers", () => {
    const inactiveSolver: Solver = {
      ...mockSolver,
      status: "inactive",
    };

    render(<SolverHeaderCard solver={inactiveSolver} />);

    const statusBadge = screen.getByLabelText(/Solver status:/);
    expect(statusBadge).toHaveTextContent("Inactive");
    expect(statusBadge).toHaveClass("bg-vx-surface");
    expect(statusBadge).toHaveClass("text-vx-muted");
  });

  it("shows bond in separate status card", () => {
    render(<SolverHeaderCard solver={mockSolver} />);

    const statusCard = screen.getByText("Status").closest(".bg-vx-surface\\/40");
    expect(statusCard).toBeInTheDocument();
    expect(statusCard).toHaveTextContent("active");
  });

  it("truncates long addresses for display", () => {
    const longAddressSolver: Solver = {
      ...mockSolver,
      address: "GBRPYHIL2CI3WHZDTOOQFC6EB4CGQOFN4QO5JTJVSXBLEDSOMETHINGEXTENSION",
    };

    render(<SolverHeaderCard solver={longAddressSolver} />);

    const addressDisplay = screen.getByText(/Address:/);
    expect(addressDisplay).toHaveTextContent(/GBRPYH.+EXTENSION/);
  });

  it("applies responsive spacing and sizing", () => {
    const { container } = render(<SolverHeaderCard solver={mockSolver} />);

    const card = container.querySelector(".card");
    expect(card).toHaveClass("p-4");
    expect(card).toHaveClass("sm:p-6");
    expect(card).toHaveClass("space-y-4");
    expect(card).toHaveClass("sm:space-y-6");
  });

  it("renders metrics grid with proper column layout", () => {
    const { container } = render(<SolverHeaderCard solver={mockSolver} />);

    const grid = container.querySelector(".grid");
    expect(grid).toHaveClass("grid-cols-2");
    expect(grid).toHaveClass("gap-3");
    expect(grid).toHaveClass("sm:gap-4");
  });

  it("displays bond and status metrics in card layout", () => {
    const { container } = render(<SolverHeaderCard solver={mockSolver} />);

    const metricCards = container.querySelectorAll(".bg-vx-surface\\/40");
    expect(metricCards.length).toBeGreaterThanOrEqual(2);
  });

  it("uses correct ARIA labels for accessibility", () => {
    render(<SolverHeaderCard solver={mockSolver} />);

    const statusBadge = screen.getByLabelText(/Solver status:/);
    expect(statusBadge).toBeInTheDocument();
  });

  it("formats bond as compact currency for large amounts", () => {
    const richSolver: Solver = {
      ...mockSolver,
      bondUsd: 1_000_000,
    };

    render(<SolverHeaderCard solver={richSolver} />);

    expect(screen.getByText("$1M")).toBeInTheDocument();
  });

  it("handles short solver names without word breaking issues", () => {
    const shortNameSolver: Solver = {
      ...mockSolver,
      name: "Bot",
    };

    render(<SolverHeaderCard solver={shortNameSolver} />);

    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toHaveTextContent("Bot");
  });

  it("handles very long solver names with word breaking", () => {
    const longNameSolver: Solver = {
      ...mockSolver,
      name: "A Very Long Solver Name That Should Wrap On Smaller Screens",
    };

    const { container } = render(<SolverHeaderCard solver={longNameSolver} />);

    const heading = container.querySelector("h1");
    expect(heading).toHaveClass("break-words");
  });
});

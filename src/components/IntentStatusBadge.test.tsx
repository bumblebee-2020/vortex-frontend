import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { IntentStatusBadge } from "./IntentStatusBadge";
import type { IntentStatus } from "@/lib/types";

const CASES: { status: IntentStatus; colorClass: string }[] = [
  { status: "pending", colorClass: "text-vx-lav" },
  { status: "accepted", colorClass: "text-blue-300" },
  { status: "filled", colorClass: "text-vx-sage" },
  { status: "failed", colorClass: "text-red-300" },
];

describe("IntentStatusBadge", () => {
  it.each(CASES)("renders the $status status with its label and color", ({ status, colorClass }) => {
    render(<IntentStatusBadge status={status} />);
    const badge = screen.getByText(status);
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass(colorClass);
  });

  it("applies the capitalize class so the status text is capitalized visually", () => {
    render(<IntentStatusBadge status="pending" />);
    expect(screen.getByText("pending")).toHaveClass("capitalize");
  });

  it("does not mix styles between different statuses", () => {
    const { rerender } = render(<IntentStatusBadge status="pending" />);
    expect(screen.getByText("pending")).toHaveClass("text-vx-lav");

    rerender(<IntentStatusBadge status="failed" />);
    expect(screen.getByText("failed")).toHaveClass("text-red-300");
    expect(screen.queryByText("pending")).not.toBeInTheDocument();
  });
});

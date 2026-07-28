import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import RootLayout from "./layout";

describe("RootLayout", () => {
  it("renders its children", () => {
    render(
      <RootLayout>
        <p>Child content</p>
      </RootLayout>
    );

    expect(screen.getByText("Child content")).toBeInTheDocument();
  });

  it("renders a skip-to-content link targeting main content", () => {
    render(
      <RootLayout>
        <div />
      </RootLayout>
    );

    expect(screen.getByText("Skip to main content")).toHaveAttribute("href", "#main-content");
  });
});

import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Nav } from "./Nav";

describe("Nav", () => {
  it("renders the full link nav for the home variant", () => {
    render(<Nav variant="home" />);
    expect(screen.getByText("Explore")).toBeInTheDocument();
    expect(screen.getByText("Become a Solver")).toBeInTheDocument();
    expect(screen.getByText("Connect Freighter")).toBeInTheDocument();
  });

  it("renders a breadcrumb for non-home variants", () => {
    render(<Nav variant="breadcrumb" label="Solver Portal" />);
    expect(screen.getByText("Solver Portal")).toBeInTheDocument();
    expect(screen.queryByText("Explore")).not.toBeInTheDocument();
  });

  it("does not render a mobile menu toggle for the breadcrumb variant", () => {
    render(<Nav variant="breadcrumb" label="Solver Portal" />);
    expect(screen.queryByLabelText("Open menu")).not.toBeInTheDocument();
  });

  describe("mobile menu (home variant)", () => {
    it("is closed by default and opens on toggle", async () => {
      const user = userEvent.setup();
      render(<Nav variant="home" />);

      const toggle = screen.getByLabelText("Open menu");
      expect(toggle).toHaveAttribute("aria-expanded", "false");
      expect(screen.getAllByText("Explore")).toHaveLength(1);

      await user.click(toggle);

      expect(screen.getByLabelText("Close menu")).toHaveAttribute("aria-expanded", "true");
      expect(screen.getAllByText("Explore")).toHaveLength(2);
    });

    it("closes when a link in the panel is clicked", async () => {
      const user = userEvent.setup();
      render(<Nav variant="home" />);

      await user.click(screen.getByLabelText("Open menu"));
      const links = screen.getAllByText("Explore");
      await user.click(links[links.length - 1]);

      expect(screen.getByLabelText("Open menu")).toBeInTheDocument();
      expect(screen.getAllByText("Explore")).toHaveLength(1);
    });

    it("moves focus into the panel when opened", async () => {
      const user = userEvent.setup();
      render(<Nav variant="home" />);

      await user.click(screen.getByLabelText("Open menu"));
      const links = screen.getAllByText("Explore");

      expect(links[links.length - 1].closest("a")).toHaveFocus();
    });

    it("traps focus within the panel while open", async () => {
      const user = userEvent.setup();
      render(<Nav variant="home" />);

      await user.click(screen.getByLabelText("Open menu"));

      const panelLinks = [
        screen.getAllByText("Explore")[1].closest("a"),
        screen.getAllByText("Become a Solver")[1].closest("a"),
        screen.getAllByText("Docs")[1].closest("a"),
      ];

      expect(panelLinks[0]).toHaveFocus();

      await user.tab();
      expect(panelLinks[1]).toHaveFocus();

      await user.tab();
      expect(panelLinks[2]).toHaveFocus();

      // Tabbing past the last item wraps back to the first.
      await user.tab();
      expect(panelLinks[0]).toHaveFocus();

      // Shift+Tab from the first item wraps to the last.
      await user.tab({ shift: true });
      expect(panelLinks[2]).toHaveFocus();
    });

    it("returns focus to the toggle button when closed via Escape", async () => {
      const user = userEvent.setup();
      render(<Nav variant="home" />);

      const toggle = screen.getByLabelText("Open menu");
      await user.click(toggle);
      expect(screen.getByLabelText("Close menu")).toBeInTheDocument();

      await user.keyboard("{Escape}");

      expect(screen.getByLabelText("Open menu")).toBeInTheDocument();
      expect(screen.getByLabelText("Open menu")).toHaveFocus();
      expect(screen.getAllByText("Explore")).toHaveLength(1);
    });

    it("returns focus to the toggle button when closed by clicking it again", async () => {
      const user = userEvent.setup();
      render(<Nav variant="home" />);

      const toggle = screen.getByLabelText("Open menu");
      await user.click(toggle);
      await user.click(screen.getByLabelText("Close menu"));

      expect(screen.getByLabelText("Open menu")).toHaveFocus();
    });
  });
});

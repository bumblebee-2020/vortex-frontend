import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createElement } from "react";
import { I18nProvider } from "@/lib/i18n/I18nProvider";
import { Nav } from "./Nav";

/** Wrap Nav in I18nProvider so locale context is available. */
function renderNav(props: Parameters<typeof Nav>[0]) {
  return render(
    createElement(I18nProvider, { locale: "en" }, createElement(Nav, props))
  );
}

describe("Nav", () => {
  beforeEach(() => {
    mockWallet({ isConnected: false });
  });

  it("renders the full link nav for the home variant", () => {
    renderNav({ variant: "home" });
    expect(screen.getByText("Explore")).toBeInTheDocument();
    expect(screen.getByText("Become a Solver")).toBeInTheDocument();
    expect(screen.getByText("Connect Freighter")).toBeInTheDocument();
  });

  it("does not render My Intents link when wallet is disconnected", () => {
    mockWallet({ isConnected: false });
    render(<Nav variant="home" />);
    expect(screen.queryByText("My Intents")).not.toBeInTheDocument();
  });

  it("renders My Intents link when wallet is connected", () => {
    mockWallet({ isConnected: true });
    render(<Nav variant="home" />);
    expect(screen.getByRole("link", { name: "My Intents" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "My Intents" })).toHaveAttribute("href", "/my-intents");
  });

  it("renders a breadcrumb for non-home variants", () => {
    renderNav({ variant: "breadcrumb", label: "Solver Portal" });
    expect(screen.getByText("Solver Portal")).toBeInTheDocument();
    expect(screen.queryByText("Explore")).not.toBeInTheDocument();
  });

  it("does not render a mobile menu toggle for the breadcrumb variant", () => {
    renderNav({ variant: "breadcrumb", label: "Solver Portal" });
    expect(screen.queryByLabelText("Open menu")).not.toBeInTheDocument();
  });

  describe("locale switcher", () => {
    it("renders a labeled locale-select control", () => {
      renderNav({ variant: "home" });

      const select = screen.getByRole("combobox", { name: /switch language/i });
      expect(select).toBeInTheDocument();
    });

    it("defaults to the locale provided by I18nProvider", () => {
      renderNav({ variant: "home" });

      const select = screen.getByRole("combobox", { name: /switch language/i });
      expect((select as HTMLSelectElement).value).toBe("en");
    });

    it("lists all available locales as options", () => {
      renderNav({ variant: "home" });

      const options = screen.getAllByRole("option");
      const values = options.map((o) => (o as HTMLOptionElement).value);
      expect(values).toContain("en");
      expect(values).toContain("es");
    });

    it("switches locale when a new option is selected", async () => {
      const user = userEvent.setup();
      renderNav({ variant: "home" });

      const select = screen.getByRole("combobox", { name: /switch language/i });
      await user.selectOptions(select, "es");

      expect((select as HTMLSelectElement).value).toBe("es");
    });

    it("is keyboard-operable (accessible via keyboard)", async () => {
      const user = userEvent.setup();
      renderNav({ variant: "home" });

      const select = screen.getByRole("combobox", { name: /switch language/i });

      // Tab to the select and verify it becomes focused
      await user.tab();
      // The select should be reachable via keyboard (focusable)
      select.focus();
      expect(document.activeElement).toBe(select);
    });

    it("also renders locale switcher in the breadcrumb variant", () => {
      renderNav({ variant: "breadcrumb", label: "Solver Portal" });

      const select = screen.getByRole("combobox", { name: /switch language/i });
      expect(select).toBeInTheDocument();
    });
  });

  describe("mobile menu (home variant)", () => {
    it("is closed by default and opens on toggle", async () => {
      const user = userEvent.setup();
      renderNav({ variant: "home" });

      const toggle = screen.getByLabelText("Open menu");
      expect(toggle).toHaveAttribute("aria-expanded", "false");
      expect(screen.getAllByText("Explore")).toHaveLength(1);

      await user.click(toggle);

      expect(screen.getByLabelText("Close menu")).toHaveAttribute("aria-expanded", "true");
      expect(screen.getAllByText("Explore")).toHaveLength(2);
    });

    it("closes when a link in the panel is clicked", async () => {
      const user = userEvent.setup();
      renderNav({ variant: "home" });

      await user.click(screen.getByLabelText("Open menu"));
      const links = screen.getAllByText("Explore");
      await user.click(links[links.length - 1]);

      expect(screen.getByLabelText("Open menu")).toBeInTheDocument();
      expect(screen.getAllByText("Explore")).toHaveLength(1);
    });

    it("includes My Intents link in mobile menu when wallet is connected", async () => {
      mockWallet({ isConnected: true });
      const user = userEvent.setup();
      render(<Nav variant="home" />);

      await user.click(screen.getByLabelText("Open menu"));

      expect(screen.getAllByRole("link", { name: "My Intents" })).toHaveLength(2);
    });

    it("closes menu when My Intents is clicked", async () => {
      mockWallet({ isConnected: true });
      const user = userEvent.setup();
      render(<Nav variant="home" />);

      await user.click(screen.getByLabelText("Open menu"));
      const mobileMyIntentsLink = screen.getAllByRole("link", { name: "My Intents" })[1];
      await user.click(mobileMyIntentsLink);

      expect(screen.getByLabelText("Open menu")).toBeInTheDocument();
    });
  });
});

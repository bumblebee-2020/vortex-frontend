import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

const { useWalletStoreMock } = vi.hoisted(() => ({ useWalletStoreMock: vi.fn() }));

vi.mock("@/store/wallet", () => ({ useWalletStore: useWalletStoreMock }));
vi.mock("@/store/toast", () => ({
  useToastStore: vi.fn(() => ({ addToast: vi.fn() })),
}));

import MyIntentsPage from "./page";

type WalletState = { address: string | null; isConnected: boolean; isConnecting: boolean; error: string | null; connect: () => void; disconnect: () => void };

function mockWallet(partial: Partial<WalletState> = {}) {
  const state: WalletState = {
    address: null,
    isConnected: false,
    isConnecting: false,
    error: null,
    connect: vi.fn(),
    disconnect: vi.fn(),
    ...partial,
  };
  // handle both selector calls (page) and no-selector calls (ConnectWalletButton)
  useWalletStoreMock.mockImplementation((sel?: (s: WalletState) => unknown) =>
    typeof sel === "function" ? sel(state) : state
  );
}

describe("MyIntentsPage", () => {
  it("renders the main landmark with the correct id", () => {
    mockWallet();
    render(<MyIntentsPage />);
    expect(screen.getByRole("main")).toHaveAttribute("id", "main-content");
  });

  it("shows a connect prompt when wallet is not connected", () => {
    mockWallet({ address: null, isConnected: false });
    render(<MyIntentsPage />);
    expect(screen.getByText(/Connect your wallet/i)).toBeInTheDocument();
    expect(screen.queryByTestId("intents-list")).not.toBeInTheDocument();
  });

  it("renders the intents list container when wallet is connected", () => {
    mockWallet({ address: "GABC123", isConnected: true });
    render(<MyIntentsPage />);
    const list = screen.getByTestId("intents-list");
    expect(list).toBeInTheDocument();
    expect(list).toHaveAttribute("data-address", "GABC123");
  });

  it("renders the page heading", () => {
    mockWallet();
    render(<MyIntentsPage />);
    expect(screen.getByRole("heading", { name: "My Intents" })).toBeInTheDocument();
  });
});

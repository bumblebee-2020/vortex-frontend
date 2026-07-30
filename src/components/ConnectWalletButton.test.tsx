import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { I18nProvider } from "@/lib/i18n/I18nProvider";
import type { Locale } from "@/lib/i18n";

const { isConnectedMock, requestAccessMock, getNetworkMock, addToastMock } = vi.hoisted(() => ({
  isConnectedMock: vi.fn(),
  requestAccessMock: vi.fn(),
  getNetworkMock: vi.fn(),
  addToastMock: vi.fn(),
}));

vi.mock("@stellar/freighter-api", () => ({
  default: {
    isConnected: isConnectedMock,
    requestAccess: requestAccessMock,
    getNetwork: getNetworkMock,
  },
}));

vi.mock("@/store/toast", () => ({
  useToastStore: { getState: () => ({ addToast: addToastMock }) },
}));

import { useWalletStore } from "@/store/wallet";
import { ConnectWalletButton } from "./ConnectWalletButton";

const initialState = useWalletStore.getState();

function renderButton(locale: Locale = "en") {
  return render(
    <I18nProvider locale={locale}>
      <ConnectWalletButton />
    </I18nProvider>
  );
}

describe("ConnectWalletButton", () => {
  beforeEach(() => {
    useWalletStore.setState(initialState, true);
    vi.clearAllMocks();
  });

  afterEach(() => {
    useWalletStore.setState(initialState, true);
  });

  it("shows a Connect Freighter prompt when disconnected", () => {
    renderButton();
    expect(screen.getByText("Connect Freighter")).toBeInTheDocument();
  });

  it("connects the wallet and shows the truncated address on click", async () => {
    isConnectedMock.mockResolvedValue(true);
    requestAccessMock.mockResolvedValue("GABCDEFGHIJKLMNOPQRSTUVWXYZ23456");
    getNetworkMock.mockResolvedValue("TESTNET");

    const user = userEvent.setup();
    renderButton();

    await user.click(screen.getByText("Connect Freighter"));

    await waitFor(() => {
      expect(screen.getByText("GABC...3456")).toBeInTheDocument();
    });
  });

  it("disconnects when the connected button is clicked", async () => {
    isConnectedMock.mockResolvedValue(true);
    requestAccessMock.mockResolvedValue("GABCDEFGHIJKLMNOPQRSTUVWXYZ23456");
    getNetworkMock.mockResolvedValue("TESTNET");

    const user = userEvent.setup();
    renderButton();
    await user.click(screen.getByText("Connect Freighter"));
    await waitFor(() => screen.getByText("GABC...3456"));

    await user.click(screen.getByText("GABC...3456"));

    expect(useWalletStore.getState().isConnected).toBe(false);
  });

  it("shows a toast when a direct connect attempt fails", async () => {
    isConnectedMock.mockResolvedValue(false);

    const user = userEvent.setup();
    renderButton();
    await user.click(screen.getByText("Connect Freighter"));

    await waitFor(() => {
      expect(addToastMock).toHaveBeenCalledWith(
        "Freighter extension is not installed or enabled.",
        "error"
      );
    });
  });

  it("translates wallet controls and known wallet errors for the active locale", async () => {
    isConnectedMock.mockResolvedValue(false);

    const user = userEvent.setup();
    renderButton("es");
    await user.click(screen.getByText("Conectar Freighter"));

    await waitFor(() => {
      expect(screen.getByText("Reintentar conexión")).toBeInTheDocument();
      expect(addToastMock).toHaveBeenCalledWith(
        "La extensión Freighter no está instalada o habilitada.",
        "error"
      );
    });
  });
});

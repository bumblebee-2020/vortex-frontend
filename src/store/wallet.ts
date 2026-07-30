import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import freighterApi from "@stellar/freighter-api";
import { DEFAULT_LOCALE, translate } from "@/lib/i18n";

export type WalletErrorKey =
  | "wallet.error.freighterUnavailable"
  | "wallet.error.connectFailed";

export type WalletState = {
  address: string | null;
  network: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  errorKey: WalletErrorKey | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  hydrate: () => Promise<void>;
};

export const useWalletStore = create<WalletState>()(
  persist(
    (set, get) => ({
      address: null,
      network: null,
      isConnected: false,
      isConnecting: false,
      error: null,
      errorKey: null,

      connect: async () => {
        let errorKey: WalletErrorKey | null = null;
        set({ isConnecting: true, error: null, errorKey: null });
        try {
          const isAppConnected = await freighterApi.isConnected();
          if (!isAppConnected) {
            errorKey = "wallet.error.freighterUnavailable";
            throw new Error(translate(DEFAULT_LOCALE, errorKey));
          }

          const address = await freighterApi.requestAccess();
          const network = await freighterApi.getNetwork();

          set({
            address,
            network,
            isConnected: true,
            isConnecting: false,
            error: null,
            errorKey: null,
          });
        } catch (err) {
          const externalError = err instanceof Error ? err.message : null;
          if (!externalError) {
            errorKey = "wallet.error.connectFailed";
          }
          set({
            address: null,
            network: null,
            isConnected: false,
            isConnecting: false,
            error: errorKey ? translate(DEFAULT_LOCALE, errorKey) : externalError,
            errorKey,
          });
        }
      },

      disconnect: () => {
        set({
          address: null,
          network: null,
          isConnected: false,
          isConnecting: false,
          error: null,
          errorKey: null,
        });
      },

      // Silently restores a previously-connected session on app load, without
      // prompting the Freighter popup. Only re-populates state if the
      // extension still recognizes this site as allowed; otherwise clears
      // the stale persisted session.
      hydrate: async () => {
        if (!get().isConnected) return;
        try {
          const isAppConnected = await freighterApi.isConnected();
          const allowed = isAppConnected && (await freighterApi.isAllowed());
          if (!allowed) {
            set({ address: null, network: null, isConnected: false, error: null, errorKey: null });
            return;
          }

          const address = await freighterApi.getPublicKey();
          const network = await freighterApi.getNetwork();
          set({ address, network, isConnected: true, error: null, errorKey: null });
        } catch {
          set({ address: null, network: null, isConnected: false, error: null, errorKey: null });
        }
      },
    }),
    {
      name: "vortex-wallet",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        address: state.address,
        network: state.network,
        isConnected: state.isConnected,
      }),
    }
  )
);

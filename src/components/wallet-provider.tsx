"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { createAccount, generatePrivateKey } from "genlayer-js";
import { createGeneratedClient, createInjectedClient } from "@/lib/genlayer/client";
import { acknowledgeGeneratedWallet, hasAcknowledgedGeneratedWallet, readGeneratedKey, writeGeneratedKey } from "@/lib/storage";
import { shortenAddress } from "@/lib/format";

type WalletMode = "none" | "generated" | "injected";

type WalletContextValue = {
  mode: WalletMode;
  address?: `0x${string}`;
  warningAccepted: boolean;
  connectInjected: () => Promise<void>;
  useGenerated: () => void;
  importGenerated: (privateKey: `0x${string}`) => void;
  disconnect: () => void;
  exportPrivateKey: () => `0x${string}` | null;
  getWriteClient: () => Promise<Awaited<ReturnType<typeof createInjectedClient>>>;
};

const WalletContext = createContext<WalletContextValue | null>(null);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<WalletMode>("none");
  const [address, setAddress] = useState<`0x${string}` | undefined>(undefined);
  const [privateKey, setPrivateKey] = useState<`0x${string}` | null>(null);
  const [warningAccepted, setWarningAccepted] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      const stored = readGeneratedKey();
      if (stored) {
        const account = createAccount(stored);
        setMode("generated");
        setAddress(account.address);
        setPrivateKey(stored);
        setWarningAccepted(hasAcknowledgedGeneratedWallet());
        return;
      }
      setWarningAccepted(hasAcknowledgedGeneratedWallet());
    });
  }, []);

  const connectInjected = useCallback(async () => {
    if (!window.ethereum) throw new Error("No injected wallet was found.");
    const accounts = (await window.ethereum.request({ method: "eth_requestAccounts" })) as `0x${string}`[];
    if (!accounts?.[0]) throw new Error("No wallet account returned.");
    setAddress(accounts[0]);
    setMode("injected");
  }, []);

  const useGenerated = useCallback(() => {
    let key = readGeneratedKey();
    if (!key) {
      key = generatePrivateKey();
      writeGeneratedKey(key);
    }
    acknowledgeGeneratedWallet();
    const account = createAccount(key);
    setPrivateKey(key);
    setAddress(account.address);
    setWarningAccepted(true);
    setMode("generated");
  }, []);

  const importGenerated = useCallback((key: `0x${string}`) => {
    writeGeneratedKey(key);
    acknowledgeGeneratedWallet();
    const account = createAccount(key);
    setPrivateKey(key);
    setAddress(account.address);
    setWarningAccepted(true);
    setMode("generated");
  }, []);

  const disconnect = useCallback(() => {
    setMode("none");
    setAddress(undefined);
    setPrivateKey(null);
  }, []);

  const exportPrivateKey = useCallback(() => privateKey, [privateKey]);

  const getWriteClient = useCallback(async () => {
    if (mode === "injected" && address) return createInjectedClient(address);
    if (mode === "generated" && privateKey) return createGeneratedClient(privateKey);
    throw new Error("Connect or create a wallet before writing.");
  }, [address, mode, privateKey]);

  const value = useMemo(
    () => ({ mode, address, warningAccepted, connectInjected, useGenerated, importGenerated, disconnect, exportPrivateKey, getWriteClient }),
    [address, connectInjected, disconnect, exportPrivateKey, getWriteClient, importGenerated, mode, useGenerated, warningAccepted],
  );

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet() {
  const value = useContext(WalletContext);
  if (!value) throw new Error("useWallet must be used inside WalletProvider");
  return value;
}

export function WalletPlate() {
  const wallet = useWallet();
  return (
    <div className="manuscript-border bg-coal-800 px-3 py-2 text-sm">
      <div className="dossier-label">{wallet.mode === "injected" ? "Injected Wallet" : wallet.mode === "generated" ? "Browser Wallet" : "Read Only"}</div>
      <div className="mono text-ivory">{shortenAddress(wallet.address)}</div>
    </div>
  );
}

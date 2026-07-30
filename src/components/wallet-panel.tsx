"use client";

import { useState } from "react";
import { Copy, Download, KeyRound, PlugZap } from "lucide-react";
import { useWallet } from "./wallet-provider";
import { shortenAddress } from "@/lib/format";

export function WalletPanel() {
  const wallet = useWallet();
  const [open, setOpen] = useState(false);
  const [importValue, setImportValue] = useState("");
  const [message, setMessage] = useState("");

  async function connectInjected() {
    try {
      await wallet.connectInjected();
      setMessage("Injected wallet connected.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not connect wallet.");
    }
  }

  function copyKey() {
    const key = wallet.exportPrivateKey();
    if (!key) return setMessage("No generated key is active.");
    navigator.clipboard.writeText(key);
    setMessage("Private key copied. Store it carefully.");
  }

  return (
    <div className="relative">
      <button className="btn-primary px-3 py-2 text-xs" onClick={() => setOpen((value) => !value)}>
        <KeyRound size={14} /> {wallet.mode === "none" ? "Connect Wallet" : shortenAddress(wallet.address)}
      </button>
      {open ? (
        <div className="panel absolute right-0 z-20 mt-3 w-80 p-4 shadow-xl">
          <div className="label">Active Identity</div>
          <div className="mono mt-1 break-all text-sm text-text">{wallet.address ?? "Read-only visitor"}</div>
          <div className="mt-4 grid gap-2">
            <button className="btn-secondary justify-center" onClick={connectInjected}><PlugZap size={14} /> Use injected wallet</button>
            <button className="btn-secondary justify-center" onClick={wallet.useGenerated}><KeyRound size={14} /> Use browser wallet</button>
            <button className="btn-secondary justify-center" onClick={copyKey}><Download size={14} /> Export browser key</button>
          </div>
          <div className="mt-4 border border-amber-500/40 bg-amber-500/10 p-3 text-xs text-amber-100">
            Browser wallets store a private key in this browser. Clearing site data destroys it. Export before relying on it.
          </div>
          <label className="label mt-4 block" htmlFor="import-key">Import browser key</label>
          <div className="mt-2 flex gap-2">
            <input
              id="import-key"
              className="input"
              value={importValue}
              onChange={(event) => setImportValue(event.target.value)}
              placeholder="0x..."
            />
            <button
              className="btn-secondary px-3"
              onClick={() => {
                wallet.importGenerated(importValue as `0x${string}`);
                setMessage("Imported.");
              }}
              title="Import"
            >
              <Copy size={16} />
            </button>
          </div>
          {message ? <p className="mt-3 text-xs text-muted" aria-live="polite">{message}</p> : null}
        </div>
      ) : null}
    </div>
  );
}

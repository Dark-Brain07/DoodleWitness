"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { StoredTransaction, TxStage } from "@/lib/types";
import { readTransactions, writeTransactions } from "@/lib/storage";
import { createReadClient } from "@/lib/genlayer/read-client";

type TransactionContextValue = {
  transactions: StoredTransaction[];
  clear: () => void;
  track: (tx: StoredTransaction) => void;
  update: (hash: StoredTransaction["hash"], status: TxStage) => void;
};

const TransactionContext = createContext<TransactionContextValue | null>(null);
const COMPLETE_STATUSES = ["ACCEPTED", "FINALIZED", "CANCELED", "UNDETERMINED"] as const;
const ACTIVE_STATUSES = ["PENDING", "PROPOSING", "COMMITTING", "REVEALING", "READY_TO_FINALIZE"] as const;
const STALE_AFTER_MS = 2 * 60 * 60 * 1000;

function shouldRefresh(tx: StoredTransaction) {
  if (!ACTIVE_STATUSES.includes(tx.status as never)) return false;
  const created = Date.parse(tx.createdAt);
  return Number.isNaN(created) || Date.now() - created < STALE_AFTER_MS;
}

function normalizeStoredTransactions(items: StoredTransaction[]) {
  return items.map((tx) => (
    COMPLETE_STATUSES.includes(tx.status as never) || shouldRefresh(tx) ? tx : { ...tx, status: "UNDETERMINED" as TxStage }
  ));
}

export function TransactionProvider({ children }: { children: React.ReactNode }) {
  const [transactions, setTransactions] = useState<StoredTransaction[]>(() =>
    typeof window === "undefined" ? [] : normalizeStoredTransactions(readTransactions()),
  );

  const persist = useCallback((items: StoredTransaction[]) => {
    setTransactions(items);
    writeTransactions(items);
  }, []);

  const track = useCallback((tx: StoredTransaction) => {
    persist([tx, ...readTransactions().filter((item) => item.hash !== tx.hash)]);
  }, [persist]);

  const update = useCallback((hash: StoredTransaction["hash"], status: TxStage) => {
    persist(readTransactions().map((item) => (item.hash === hash ? { ...item, status } : item)));
  }, [persist]);

  const clear = useCallback(() => persist([]), [persist]);

  useEffect(() => {
    const staleMarked = normalizeStoredTransactions(readTransactions());
    writeTransactions(staleMarked);
    const pending = staleMarked.filter(shouldRefresh);
    if (pending.length === 0) return;
    const client = createReadClient();
    let cancelled = false;
    async function refresh() {
      const refreshed = await Promise.all(pending.map(async (tx) => {
        try {
          const onchain = await client.getTransaction({ hash: tx.hash });
          const status = String(onchain?.statusName ?? tx.status).toUpperCase() as TxStage;
          return { ...tx, status };
        } catch {
          const created = Date.parse(tx.createdAt);
          if (!Number.isNaN(created) && Date.now() - created >= STALE_AFTER_MS) {
            return { ...tx, status: "UNDETERMINED" as TxStage };
          }
          return tx;
        }
      }));
      if (cancelled) return;
      const current = readTransactions();
      const byHash = new Map(refreshed.map((tx) => [tx.hash, tx]));
      persist(current.map((tx) => byHash.get(tx.hash) ?? tx));
    }
    refresh();
    const interval = window.setInterval(refresh, 15000);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [persist]);

  const value = useMemo(() => ({ transactions, clear, track, update }), [clear, track, transactions, update]);
  return <TransactionContext.Provider value={value}>{children}</TransactionContext.Provider>;
}

export function useTransactions() {
  const value = useContext(TransactionContext);
  if (!value) throw new Error("useTransactions must be used inside TransactionProvider");
  return value;
}

export function TransactionRail() {
  const { clear, transactions } = useTransactions();
  const stages = ["PENDING", "PROPOSING", "COMMITTING", "REVEALING", "ACCEPTED", "FINALIZED"];
  return (
    <aside className="panel p-5">
      <div className="label">Wallet Activity</div>
      <div className="mt-1 flex items-center justify-between gap-3">
        <h2 className="text-2xl font-semibold text-text">Recent transactions</h2>
        {transactions.length > 0 ? <button className="btn-secondary px-3 py-2 text-xs" onClick={clear}>Clear</button> : null}
      </div>
      <p className="mt-2 text-xs text-muted">Local transaction history from this browser, refreshed from GenLayer when available.</p>
      <div className="mt-5 space-y-4">
        {transactions.length === 0 ? (
          <p className="text-sm text-muted">Writes you send from this browser will appear here.</p>
        ) : (
          transactions.map((tx) => (
            <div key={tx.hash} className="panel-soft p-3">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm text-text">{tx.label}</span>
                <span className="pill">{tx.status}</span>
              </div>
              <div className="mt-3 grid grid-cols-6 gap-1" aria-label={`Transaction stage ${tx.status}`}>
                {stages.map((stage) => (
                  <div
                    key={stage}
                    className={`h-1.5 ${stages.indexOf(stage) <= stages.indexOf(tx.status) ? "bg-brand" : "bg-gray-700"}`}
                    title={stage}
                  />
                ))}
              </div>
              <div className="mono mt-2 truncate text-xs text-muted">{tx.hash}</div>
            </div>
          ))
        )}
      </div>
    </aside>
  );
}

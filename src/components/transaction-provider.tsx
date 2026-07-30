"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { StoredTransaction, TxStage } from "@/lib/types";
import { readTransactions, writeTransactions } from "@/lib/storage";

type TransactionContextValue = {
  transactions: StoredTransaction[];
  track: (tx: StoredTransaction) => void;
  update: (hash: StoredTransaction["hash"], status: TxStage) => void;
};

const TransactionContext = createContext<TransactionContextValue | null>(null);

export function TransactionProvider({ children }: { children: React.ReactNode }) {
  const [transactions, setTransactions] = useState<StoredTransaction[]>(() =>
    typeof window === "undefined" ? [] : readTransactions(),
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

  const value = useMemo(() => ({ transactions, track, update }), [track, transactions, update]);
  return <TransactionContext.Provider value={value}>{children}</TransactionContext.Provider>;
}

export function useTransactions() {
  const value = useContext(TransactionContext);
  if (!value) throw new Error("useTransactions must be used inside TransactionProvider");
  return value;
}

export function TransactionRail() {
  const { transactions } = useTransactions();
  const stages = ["PENDING", "PROPOSING", "COMMITTING", "REVEALING", "ACCEPTED", "FINALIZED"];
  return (
    <aside className="panel p-5">
      <div className="label">Consensus Ledger</div>
      <h2 className="mt-1 text-2xl font-semibold text-text">Live transactions</h2>
      <div className="mt-5 space-y-4">
        {transactions.length === 0 ? (
          <p className="text-sm text-muted">Writes will appear here and survive refresh.</p>
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

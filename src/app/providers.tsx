"use client";

import { WalletProvider } from "@/components/wallet-provider";
import { TransactionProvider } from "@/components/transaction-provider";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WalletProvider>
      <TransactionProvider>{children}</TransactionProvider>
    </WalletProvider>
  );
}

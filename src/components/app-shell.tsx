import Image from "next/image";
import Link from "next/link";
import { WalletPanel } from "./wallet-panel";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-bg text-text">
      <header className="border-b border-line bg-bg/95">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/webwitness-mark.svg" alt="WebWitness" width={40} height={40} className="rounded-xl" priority />
            <span className="hidden text-xl font-bold tracking-tight sm:inline">WebWitness</span>
          </Link>
          <nav className="hidden items-center gap-3 md:flex">
            <Link className="btn-secondary" href="/cases">Cases</Link>
            <Link className="btn-secondary" href="/cases/new">New Case</Link>
            <Link className="btn-secondary" href="/dashboard">Dashboard</Link>
          </nav>
          <WalletPanel />
        </div>
      </header>
      {children}
      <footer className="mx-auto max-w-7xl px-5 py-10 text-sm text-muted">
        WebWitness stores bonded public web claims, validator witness decisions, challenges, and settlement state in a GenLayer intelligent contract.
      </footer>
    </div>
  );
}

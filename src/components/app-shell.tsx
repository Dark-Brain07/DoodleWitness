"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { WalletPanel } from "./wallet-panel";

const NAV_LINKS = [
  { href: "/cases", label: "Cases" },
  { href: "/cases/new", label: "New Case" },
  { href: "/dashboard", label: "Dashboard" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="min-h-screen bg-bg text-text">
      <header className="border-b border-line bg-bg/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-5 py-4">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/doodlewitness-mark.svg" alt="DoodleWitness" width={40} height={40} className="rounded-xl" priority />
            <span className="hidden text-xl font-bold tracking-tight sm:inline">DoodleWitness</span>
          </Link>
          <nav className="hidden items-center gap-3 md:flex" aria-label="Primary">
            {NAV_LINKS.map((link) => (
              <Link key={link.href} className="btn-secondary" href={link.href}>{link.label}</Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <WalletPanel />
            <button
              type="button"
              className="btn-secondary px-2.5 py-2 md:hidden"
              onClick={() => setMobileNavOpen((value) => !value)}
              aria-expanded={mobileNavOpen}
              aria-controls="mobile-primary-nav"
              aria-label={mobileNavOpen ? "Close menu" : "Open menu"}
            >
              {mobileNavOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
        {mobileNavOpen ? (
          <nav id="mobile-primary-nav" aria-label="Primary" className="mx-auto flex max-w-7xl flex-col gap-2 border-t border-line px-5 py-4 md:hidden">
            {NAV_LINKS.map((link) => (
              <Link key={link.href} className="btn-secondary justify-start" href={link.href} onClick={() => setMobileNavOpen(false)}>
                {link.label}
              </Link>
            ))}
          </nav>
        ) : null}
      </header>
      {children}
      <footer className="mx-auto max-w-7xl px-5 py-10 text-sm text-muted">
        DoodleWitness stores bonded public image claims, validator witness decisions, challenges, and settlement state in a GenLayer intelligent contract.
      </footer>
    </div>
  );
}

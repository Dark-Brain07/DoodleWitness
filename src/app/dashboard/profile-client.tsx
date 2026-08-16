"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertTriangle, FileCheck2, RefreshCw, ShieldCheck, WalletCards } from "lucide-react";
import { getProfile } from "@/lib/genlayer/contract";
import { formatAttoGen, shortenAddress, statusTone } from "@/lib/format";
import type { Profile, WitnessCase } from "@/lib/types";
import { useWallet } from "@/components/wallet-provider";

type LoadState = "idle" | "loading" | "ready" | "error";

export function DashboardClient() {
  const wallet = useWallet();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [state, setState] = useState<LoadState>("idle");
  const [error, setError] = useState("");

  const loadProfile = useCallback(async () => {
    if (!wallet.address) return;
    setState("loading");
    setError("");
    try {
      const next = await getProfile(wallet.address);
      setProfile(next ?? null);
      setState("ready");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Profile read failed.");
      setState("error");
    }
  }, [wallet.address]);

  useEffect(() => {
    queueMicrotask(() => {
      void loadProfile();
    });
  }, [loadProfile]);

  const witnessed = useMemo(
    () => profile?.submitted_cases.filter((item) => item.status === "WITNESSED" || item.status === "RELEASED").length ?? 0,
    [profile],
  );

  if (!wallet.address) {
    return (
      <main className="mx-auto max-w-7xl px-5 py-10">
        <div className="panel p-6">
          <div className="label">Witness Profile</div>
          <h1 className="section-title mt-2">Connect a wallet to read your DoodleWitness profile</h1>
          <p className="mt-4 max-w-2xl leading-7 text-muted">
            Profiles are assembled from contract state: bonded cases, witness results, challenge work, and bond settlement totals.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-5 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="label">Witness Profile</div>
          <h1 className="section-title mt-2">{shortenAddress(wallet.address)}</h1>
        </div>
        <button className="btn-secondary" onClick={loadProfile} disabled={state === "loading"}>
          <RefreshCw size={14} />
          {state === "loading" ? "Reading" : "Refresh"}
        </button>
      </div>

      {error ? <div className="callout callout-bad mt-6" role="alert">{error}</div> : null}

      <section className="mt-8 grid gap-4 md:grid-cols-3 lg:grid-cols-6">
        <Stat label="Cases" value={profile?.case_count ?? "0"} />
        <Stat label="Witnessed" value={String(witnessed)} />
        <Stat label="Challenges" value={profile?.challenged_count ?? "0"} />
        <Stat label="Bonded" value={formatAttoGen(profile?.bond_total ?? "0")} wide />
        <Stat label="Released" value={formatAttoGen(profile?.released_total ?? "0")} wide />
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-2">
        <CaseSection title="Submitted Cases" icon={<FileCheck2 size={18} />} cases={profile?.submitted_cases ?? []} />
        <CaseSection title="Open Challenge Work" icon={<AlertTriangle size={18} />} cases={profile?.open_challenges ?? []} />
      </section>

      <section className="mt-8 panel p-5">
        <div className="flex items-center gap-2 text-brand">
          <ShieldCheck size={18} />
          <div className="label text-brand">Why this profile matters</div>
        </div>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-gray-300">
          A DoodleWitness profile is not an off-chain account page. It is read from the intelligent contract, so the bond totals, witness results, challenges, and settlements reflect the same state reviewers and counterparties can inspect.
        </p>
      </section>
    </main>
  );
}

function Stat({ label, value, wide }: { label: string; value: string; wide?: boolean }) {
  return (
    <div className={`panel p-4 ${wide ? "md:col-span-2 lg:col-span-1" : ""}`}>
      <div className="label">{label}</div>
      <div className="mono mt-2 text-lg">{value}</div>
    </div>
  );
}

function CaseSection({ title, icon, cases }: { title: string; icon: React.ReactNode; cases: WitnessCase[] }) {
  return (
    <div className="panel p-5">
      <div className="flex items-center gap-2 text-brand">
        {icon}
        <div className="label text-brand">{title}</div>
      </div>
      <div className="mt-4 grid gap-3">
        {cases.length === 0 ? <Empty text="No cases in this section yet." /> : cases.map((item) => (
          <Link key={item.id} href={`/cases/${item.id}`} className="block panel-soft p-4 hover:bg-panel-soft">
            <div className="flex items-center justify-between gap-3">
              <span className="label">{item.id}</span>
              <span className={`pill ${statusTone(item.status)}`}>{item.status}</span>
            </div>
            <h2 className="mt-2 text-xl font-semibold">{item.claim}</h2>
            <div className="mt-3 flex items-center gap-2 text-sm text-muted">
              <WalletCards size={14} />
              <span>{formatAttoGen(item.bond)}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <div className="panel-soft p-4 text-sm text-muted">{text}</div>;
}

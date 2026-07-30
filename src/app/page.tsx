import Link from "next/link";
import { ArrowUpRight, Eye, FileCheck2, Scale, WalletCards } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { getSummary, listCases, verifyContractSchema } from "@/lib/genlayer/contract";
import { formatAttoGen, statusTone } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [summary, cases, schema] = await Promise.all([getSummary(), listCases(), verifyContractSchema()]);

  return (
    <main className="mx-auto max-w-7xl px-5 py-8">
      <section className="border-b border-line pb-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-4xl">
            <div className="label">Public Web Evidence Desk</div>
            <h1 className="mt-4 max-w-5xl text-4xl font-black leading-[0.98] tracking-0 text-text md:text-6xl">
              A contract-side witness log for claims the public web can prove.
            </h1>
          </div>
          <div className="flex shrink-0 flex-wrap gap-3">
            <Link href="/cases/new" className="btn-primary">Open Case <ArrowUpRight size={15} /></Link>
            <Link href="/cases" className="btn-secondary">Browse Ledger</Link>
          </div>
        </div>
        <div className="mt-7 grid gap-3 md:grid-cols-3 lg:grid-cols-6">
          <Stat label="Cases" value={String(summary.case_count)} />
          <Stat label="Profiles" value={String(summary.profile_count)} />
          <Stat label="Witnessed" value={summary.witnessed_count} />
          <Stat label="Challenged" value={summary.challenged_count} />
          <Stat label="Balance" value={formatAttoGen(summary.balance)} />
          <Stat label="Schema" value={schema.ok ? "Verified" : schema.configured ? "Mismatch" : "Not configured"} />
        </div>
      </section>

      <section className="grid gap-5 py-8 lg:grid-cols-[280px_1fr]">
        <aside className="space-y-3">
          <div className="label">Consensus Route</div>
          {features.map(([title, copy, Icon], index) => (
            <div className="panel-soft p-4" key={title}>
              <div className="flex items-center gap-3">
                <span className="mono text-xs text-brand">0{index + 1}</span>
                <Icon className="text-brand" size={18} />
                <h2 className="text-sm font-semibold">{title}</h2>
              </div>
              <p className="mt-3 text-xs leading-5 text-muted">{copy}</p>
            </div>
          ))}
        </aside>

        <div>
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="label">Recent Cases</div>
              <h2 className="section-title mt-2">Live witness ledger</h2>
            </div>
            <Link href="/cases" className="btn-secondary">View All</Link>
          </div>
          <p className="mt-4 max-w-3xl text-sm leading-6 text-gray-300">
            WebWitness does not ask validators to grade a user-written story. Each case points them at public evidence, then the contract stores the resulting verdict, challenge record, and bond settlement path.
          </p>
          <div className="mt-6 divide-y divide-line overflow-hidden rounded-xl border border-line bg-panel/60">
            {cases.length === 0 ? (
              <div className="p-6 text-muted">No cases have been read from the configured contract yet.</div>
            ) : cases.slice(0, 6).map((item) => (
              <Link key={item.id} href={`/cases/${item.id}`} className="grid gap-4 p-5 transition hover:bg-panel-soft md:grid-cols-[160px_1fr_150px] md:items-center">
                <div>
                  <div className="label">{item.id}</div>
                  <div className="mono mt-2 text-xs text-muted">{formatAttoGen(item.bond)}</div>
                </div>
                <div>
                  <h3 className="text-base font-semibold leading-6">{item.claim}</h3>
                  <p className="mt-2 break-all text-xs text-brand">{item.url}</p>
                </div>
                <div className="md:text-right">
                  <span className={`pill ${statusTone(item.status)}`}>{item.status}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return <div className="panel-soft p-4"><div className="label">{label}</div><div className="mono mt-2 text-lg">{value}</div></div>;
}

const features: Array<[string, string, LucideIcon]> = [
  ["Bonded claims", "Every case locks GEN so requests have skin in the game.", WalletCards],
  ["Contract fetch", "Validators fetch the cited URL inside consensus.", Eye],
  ["Semantic witness", "The verdict asks what the public evidence actually shows.", FileCheck2],
  ["Challenge path", "Disputed outcomes can add new evidence before settlement.", Scale],
];

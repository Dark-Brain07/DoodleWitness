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
      {/* The desk, not a hero banner: a docket-number opener, then the register
          strip reads like a bound ledger line rather than a stat-tile grid. */}
      <section className="border-b border-line pb-8" aria-labelledby="hero-heading">
        <span className="docket-number">DESK NO. WW-01</span>
        <div className="mt-5 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <h1 id="hero-heading" className="max-w-5xl text-4xl font-black leading-[0.98] tracking-0 text-text md:text-6xl">
            A contract-side witness log for claims the public web can prove.
          </h1>
          <div className="flex shrink-0 flex-wrap gap-3">
            <Link href="/cases/new" className="btn-primary">
              Open Case <ArrowUpRight size={15} aria-hidden />
            </Link>
            <Link href="/cases" className="btn-secondary">Read the Docket</Link>
          </div>
        </div>

        <dl className="register-strip mt-7">
          <RegisterItem label="Cases" value={String(summary.case_count)} />
          <RegisterItem label="Profiles" value={String(summary.profile_count)} />
          <RegisterItem label="Witnessed" value={summary.witnessed_count} />
          <RegisterItem label="Challenged" value={summary.challenged_count} />
          <RegisterItem label="Balance" value={formatAttoGen(summary.balance)} mono />
          <RegisterItem
            label="Schema"
            value={schema.ok ? "Verified" : schema.configured ? "Mismatch" : "Not configured"}
            tone={schema.ok ? "good" : schema.configured ? "bad" : "warn"}
          />
        </dl>
      </section>

      <section className="grid gap-5 py-8 lg:grid-cols-[280px_1fr]" aria-labelledby="ledger-heading">
        <aside aria-labelledby="route-heading" className="space-y-3">
          <p id="route-heading" className="label">How a case is stamped</p>
          <ol className="space-y-3">
            {features.map(([title, copy, Icon], index) => (
              <li className="panel-soft p-4" key={title}>
                <div className="flex items-center gap-3">
                  <span className="mono text-xs text-brand" aria-hidden>0{index + 1}</span>
                  <Icon className="text-brand" size={18} aria-hidden />
                  <h2 className="text-sm font-semibold">{title}</h2>
                </div>
                <p className="mt-3 text-xs leading-5 text-muted">{copy}</p>
              </li>
            ))}
          </ol>
        </aside>

        <div>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="label">Open the Docket</p>
              <h2 id="ledger-heading" className="section-title mt-2">Recent entries</h2>
            </div>
            <Link href="/cases" className="btn-secondary">View all cases</Link>
          </div>
          <p className="mt-4 max-w-3xl text-sm leading-6 text-gray-300">
            WebWitness does not ask validators to grade a user-written story. Each case points them at public
            evidence, then the contract stores the resulting verdict, challenge record, and bond settlement path.
          </p>
          {cases.length === 0 ? (
            <div className="callout callout-info mt-6">
              No entries have been read from the configured contract yet. <Link className="underline" href="/cases/new">Open the first one</Link>.
            </div>
          ) : (
            <ul className="mt-6 space-y-3">
              {cases.slice(0, 6).map((item) => (
                <li key={item.id} className="docket-entry">
                  <Link
                    href={`/cases/${item.id}`}
                    className="grid gap-4 p-5 md:grid-cols-[140px_1fr_auto] md:items-center"
                  >
                    <div>
                      <span className="docket-number">{item.id}</span>
                      <p className="mono mt-2 text-xs text-muted">{formatAttoGen(item.bond)} bond</p>
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-base font-semibold leading-6">{item.claim}</h3>
                      <p className="mt-2 truncate text-xs text-brand" title={item.url}>{item.url}</p>
                    </div>
                    <div className="md:text-right">
                      <span className={`stamp ${statusTone(item.status)}`}>{item.status}</span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </main>
  );
}

function RegisterItem({ label, value, mono, tone }: { label: string; value: string; mono?: boolean; tone?: "good" | "warn" | "bad" }) {
  return (
    <div className="register-item">
      <dt className="label">{label}</dt>
      <dd
        className={`mt-2 truncate text-lg ${mono ? "mono" : ""}`}
        style={tone ? { color: `var(--${tone})` } : undefined}
        title={value}
      >
        {value}
      </dd>
    </div>
  );
}

const features: Array<[string, string, LucideIcon]> = [
  ["Bonded claims", "Every case locks GEN so requests have skin in the game.", WalletCards],
  ["Contract fetch", "Validators fetch the cited URL inside consensus.", Eye],
  ["Semantic witness", "The verdict asks what the public evidence actually shows.", FileCheck2],
  ["Challenge path", "Disputed outcomes can add new evidence before settlement.", Scale],
];

import Link from "next/link";
import { Eye, FileCheck2, Scale, WalletCards } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { getSummary, listCases, verifyContractSchema } from "@/lib/genlayer/contract";
import { formatAttoGen, statusTone } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [summary, cases, schema] = await Promise.all([getSummary(), listCases(), verifyContractSchema()]);

  return (
    <main>
      <section className="mx-auto grid max-w-7xl gap-8 px-5 py-12 lg:grid-cols-[1fr_420px]">
        <div>
          <div className="label">Public Web Event Notary</div>
          <h1 className="title mt-4 max-w-4xl">Bond a claim. Let validators witness the web.</h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-gray-300">
            WebWitness lets teams create bonded certificates for public URLs. GenLayer validators fetch the page, judge whether it supports a natural-language claim, and store the witness result with challenge and settlement state.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/cases/new" className="btn-primary">Open Case</Link>
            <Link href="/cases" className="btn-secondary">Browse Cases</Link>
          </div>
        </div>
        <div className="panel p-6">
          <div className="label">Live Contract</div>
          <div className="mt-5 grid grid-cols-2 gap-4">
            <Stat label="Cases" value={String(summary.case_count)} />
            <Stat label="Profiles" value={String(summary.profile_count)} />
            <Stat label="Witnessed" value={summary.witnessed_count} />
            <Stat label="Challenged" value={summary.challenged_count} />
            <Stat label="Balance" value={formatAttoGen(summary.balance)} wide />
            <Stat label="Schema" value={schema.ok ? "Verified" : schema.configured ? "Mismatch" : "Not configured"} wide />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-8">
        <div className="grid gap-4 md:grid-cols-4">
          {features.map(([title, copy, Icon]) => (
            <div className="panel p-5" key={title}>
              <Icon className="text-brand" size={22} />
              <h2 className="mt-4 text-lg font-semibold">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-muted">{copy}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-12">
        <div className="flex items-end justify-between gap-4">
          <div>
            <div className="label">Recent Cases</div>
            <h2 className="section-title mt-2">Witness ledger</h2>
          </div>
          <Link href="/cases" className="btn-secondary">View All</Link>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {cases.length === 0 ? (
            <div className="panel p-6 text-muted md:col-span-2">No cases have been read from the configured contract yet.</div>
          ) : cases.slice(0, 4).map((item) => (
            <Link key={item.id} href={`/cases/${item.id}`} className="panel block p-5 hover:bg-panel-soft">
              <div className="flex items-center justify-between gap-3">
                <span className="label">{item.id}</span>
                <span className={`pill ${statusTone(item.status)}`}>{item.status}</span>
              </div>
              <h3 className="mt-3 text-xl font-semibold">{item.claim}</h3>
              <p className="mt-3 break-all text-sm text-brand">{item.url}</p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}

function Stat({ label, value, wide }: { label: string; value: string; wide?: boolean }) {
  return <div className={`panel-soft p-4 ${wide ? "col-span-2" : ""}`}><div className="label">{label}</div><div className="mono mt-2 text-lg">{value}</div></div>;
}

const features: Array<[string, string, LucideIcon]> = [
  ["Bonded claims", "Every case locks GEN so requests have skin in the game.", WalletCards],
  ["Contract fetch", "Validators fetch the cited URL inside consensus.", Eye],
  ["Semantic witness", "The verdict asks what the public evidence actually shows.", FileCheck2],
  ["Challenge path", "Disputed outcomes can add new evidence before settlement.", Scale],
];

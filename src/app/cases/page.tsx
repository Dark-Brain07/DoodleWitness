import Link from "next/link";
import { listCases } from "@/lib/genlayer/contract";
import { formatAttoGen, statusTone } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function CasesPage() {
  const cases = await listCases();
  return (
    <main className="mx-auto max-w-7xl px-5 py-10">
      <div className="flex items-end justify-between gap-4 border-b border-line pb-8">
        <div>
          <span className="docket-number">FULL DOCKET</span>
          <h1 className="section-title mt-3">Public witness cases</h1>
        </div>
        <Link href="/cases/new" className="btn-primary">New Case</Link>
      </div>

      {cases.length === 0 ? (
        <div className="callout callout-info mt-6">
          No entries have been read from the configured contract yet. <Link className="underline" href="/cases/new">Open the first one</Link>.
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {cases.map((item) => (
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
                  <h2 className="text-base font-semibold leading-6">{item.claim}</h2>
                  <p className="mt-2 truncate text-xs text-brand" title={item.url}>{item.url}</p>
                  <div className="mt-3 grid max-w-md grid-cols-2 gap-2 text-sm">
                    <Mini label="Verdict" value={item.verdict} />
                    <Mini label="Confidence" value={item.confidence_band} />
                  </div>
                </div>
                <div className="md:text-right">
                  <span className={`stamp ${statusTone(item.status)}`}>{item.status}</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return <div className="panel-soft p-3"><div className="label">{label}</div><div className="mono mt-1 break-all text-text">{value}</div></div>;
}

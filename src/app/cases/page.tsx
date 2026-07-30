import Link from "next/link";
import { listCases } from "@/lib/genlayer/contract";
import { formatAttoGen, statusTone } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function CasesPage() {
  const cases = await listCases();
  return (
    <main className="mx-auto max-w-7xl px-5 py-10">
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="label">Case Registry</div>
          <h1 className="section-title mt-2">Public witness cases</h1>
        </div>
        <Link href="/cases/new" className="btn-primary">New Case</Link>
      </div>
      <div className="mt-8 grid gap-5 md:grid-cols-2">
        {cases.length === 0 ? (
          <div className="panel p-6 text-muted md:col-span-2">No witness cases were returned by the contract.</div>
        ) : cases.map((item) => (
          <Link key={item.id} href={`/cases/${item.id}`} className="panel p-5 hover:bg-panel-soft">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="label">{item.id}</div>
                <h2 className="mt-2 text-2xl font-semibold">{item.claim}</h2>
              </div>
              <span className={`pill ${statusTone(item.status)}`}>{item.status}</span>
            </div>
            <p className="mt-4 line-clamp-2 break-all text-sm text-brand">{item.url}</p>
            <div className="mt-5 grid grid-cols-3 gap-2 text-sm">
              <Mini label="Bond" value={formatAttoGen(item.bond)} />
              <Mini label="Verdict" value={item.verdict} />
              <Mini label="Confidence" value={item.confidence_band} />
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return <div className="panel-soft p-3"><div className="label">{label}</div><div className="mono mt-1 break-all text-text">{value}</div></div>;
}

import Link from "next/link";
import { notFound } from "next/navigation";
import { CaseActionButtons, ChallengeForm } from "@/components/write-actions";
import { TransactionRail } from "@/components/transaction-provider";
import { getCase, getSummary } from "@/lib/genlayer/contract";
import { displayTime, formatAttoGen, statusTone } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function CaseDetail({ params }: { params: Promise<{ caseId: string }> }) {
  const { caseId } = await params;
  const [item, summary] = await Promise.all([getCase(caseId), getSummary()]);
  if (!item) notFound();

  return (
    <main className="mx-auto grid max-w-7xl gap-8 px-5 py-10 lg:grid-cols-[1fr_360px]">
      <section>
        <Link href="/cases" className="btn-secondary">Back to cases</Link>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <span className="docket-number">{item.id}</span>
          <span className={`stamp ${statusTone(item.status)}`}>{item.status}</span>
          <span className={`stamp ${statusTone(item.verdict)}`}>{item.verdict}</span>
        </div>
        <h1 className="section-title mt-3">{item.claim}</h1>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <Panel label="Bond" value={formatAttoGen(item.bond)} />
          <Panel label="Confidence" value={item.confidence_band} />
          <Panel label="Created" value={displayTime(item.created_at)} />
        </div>
        <div className="panel mt-8 p-5">
          <div className="label">Public URL</div>
          <a className="mono mt-3 block break-all text-brand underline" href={item.url} target="_blank" rel="noreferrer">{item.url}</a>
        </div>
        <div className="panel mt-6 p-5">
          <div className="label">Requester Context</div>
          <p className="mt-3 leading-7 text-gray-300">{item.context}</p>
        </div>
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div className="panel p-5">
            <div className="label">Evidence Summary</div>
            <p className="mt-3 text-sm leading-7 text-gray-300">{item.evidence_summary || "Consensus has not stored evidence notes yet."}</p>
          </div>
          <div className="panel p-5">
            <div className="label">Rationale</div>
            <p className="mt-3 text-sm leading-7 text-gray-300">{item.rationale || "Run witness consensus to store a validator-backed rationale."}</p>
          </div>
        </div>
        {item.snapshot_digest ? (
          <div className="panel mt-6 p-5">
            <div className="label">Snapshot Digest</div>
            <p className="mono mt-3 break-all text-sm text-brand">{item.snapshot_digest}</p>
          </div>
        ) : null}
        {item.challenge_url ? (
          <div className="panel mt-6 p-5">
            <div className="label">Challenge Evidence</div>
            <a className="mono mt-3 block break-all text-brand underline" href={item.challenge_url} target="_blank" rel="noreferrer">{item.challenge_url}</a>
            <p className="mt-3 text-sm leading-7 text-gray-300">{item.challenge_summary}</p>
            <p className="mono mt-3 text-xs text-muted">Submitted {displayTime(item.challenged_at)}</p>
          </div>
        ) : null}
        {item.released_to !== "0x0000000000000000000000000000000000000000" ? (
          <div className="panel mt-6 p-5">
            <div className="label">Settlement</div>
            <p className="mono mt-3 break-all text-brand">Released to {item.released_to}</p>
          </div>
        ) : null}
      </section>
      <aside className="space-y-6">
        <CaseActionButtons caseId={item.id} status={item.status} requester={item.requester} steward={summary.steward} />
        <ChallengeForm caseId={item.id} status={item.status} requester={item.requester} steward={summary.steward} />
        <TransactionRail />
      </aside>
    </main>
  );
}

function Panel({ label, value }: { label: string; value: string }) {
  return <div className="panel p-4"><div className="label">{label}</div><div className="mono mt-2 break-all text-sm text-text">{value}</div></div>;
}

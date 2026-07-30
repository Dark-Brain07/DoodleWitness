import { CaseForm } from "@/components/write-actions";
import { TransactionRail } from "@/components/transaction-provider";

export default function NewCasePage() {
  return (
    <main className="mx-auto grid max-w-7xl gap-8 px-5 py-10 lg:grid-cols-[1fr_360px]">
      <section>
        <div className="label">New Witness Case</div>
        <h1 className="section-title mt-2">Ask validators to witness a public URL</h1>
        <p className="mt-4 max-w-2xl leading-7 text-muted">
          Bond a precise claim about a public web page. The consensus transaction later fetches that source and records whether it supports, contradicts, or cannot prove the claim.
        </p>
        <div className="mt-8">
          <CaseForm />
        </div>
      </section>
      <aside>
        <TransactionRail />
      </aside>
    </main>
  );
}

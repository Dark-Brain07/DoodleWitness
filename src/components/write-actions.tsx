"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { waitAccepted, writeContract } from "@/lib/genlayer/contract";
import { parseGen } from "@/lib/format";
import { useTransactions } from "./transaction-provider";
import { useWallet } from "./wallet-provider";

export function CaseForm() {
  const router = useRouter();
  const wallet = useWallet();
  const txs = useTransactions();
  const [state, setState] = useState({
    id: "",
    url: "",
    claim: "",
    context: "",
    bond: "1",
  });
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setMessage("");
    setBusy(true);
    try {
      const client = await wallet.getWriteClient();
      const hash = await writeContract(client, "open_case", [state.id, state.url, state.claim, state.context], parseGen(state.bond));
      txs.track({ hash, label: `Open witness ${state.id}`, createdAt: new Date().toISOString(), status: "PENDING", functionName: "open_case" });
      const receipt = await waitAccepted(client, hash);
      txs.update(hash, String(receipt.statusName ?? receipt.status ?? "ACCEPTED") as never);
      router.push(`/cases/${state.id}`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Open case failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="panel p-6">
      <div className="grid gap-4">
        <Field label="Case ID" value={state.id} onChange={(id) => setState({ ...state, id })} placeholder="xz-backdoor-disclosure" />
        <Field label="Public URL" value={state.url} onChange={(url) => setState({ ...state, url })} placeholder="https://..." />
        <Area label="Claim To Witness" value={state.claim} onChange={(claim) => setState({ ...state, claim })} />
        <Area label="Context" value={state.context} onChange={(context) => setState({ ...state, context })} />
        <Field label="Witness Bond (GEN)" value={state.bond} onChange={(bond) => setState({ ...state, bond })} />
      </div>
      {message ? <p className="mt-4 border border-red-500/50 bg-red-950/30 p-3 text-sm text-red-100">{message}</p> : null}
      <button className="btn-primary mt-6" disabled={busy}>{busy ? "Opening..." : "Open Witness Case"}</button>
    </form>
  );
}

export function CaseActionButtons({ caseId, status }: { caseId: string; status: string }) {
  const wallet = useWallet();
  const txs = useTransactions();
  const [message, setMessage] = useState("");

  async function run(functionName: "witness_case" | "review_challenge" | "release_bond" | "refund_unclear" | "forfeit_false_case") {
    try {
      setMessage("Waiting for wallet signature...");
      const client = await wallet.getWriteClient();
      const hash = await writeContract(client, functionName, [caseId], 0n);
      txs.track({ hash, label: `${functionName} ${caseId}`, createdAt: new Date().toISOString(), status: "PENDING", functionName });
      setMessage("Transaction sent. Consensus stages may take several minutes.");
      const receipt = await waitAccepted(client, hash);
      txs.update(hash, String(receipt.statusName ?? receipt.status ?? "ACCEPTED") as never);
      setMessage(`Reached ${String(receipt.statusName ?? receipt.status)}.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Write failed.");
    }
  }

  return (
    <div className="panel p-5">
      <div className="label">Actions</div>
      <div className="mt-4 flex flex-wrap gap-3">
        {(status === "OPEN" || status === "UNCLEAR") ? <button className="btn-primary" onClick={() => run("witness_case")}>Witness by Consensus</button> : null}
        {status === "CHALLENGED" ? <button className="btn-primary" onClick={() => run("review_challenge")}>Review Challenge</button> : null}
        {status === "WITNESSED" ? <button className="btn-secondary" onClick={() => run("release_bond")}>Release Bond</button> : null}
        {status === "UNCLEAR" ? <button className="btn-secondary" onClick={() => run("refund_unclear")}>Refund Unclear</button> : null}
        {status === "CONTRADICTED" ? <button className="btn-secondary" onClick={() => run("forfeit_false_case")}>Forfeit False Case</button> : null}
      </div>
      {message ? <p className="mt-4 text-sm text-gray-300" aria-live="polite">{message}</p> : null}
    </div>
  );
}

export function ChallengeForm({ caseId, status }: { caseId: string; status: string }) {
  const wallet = useWallet();
  const txs = useTransactions();
  const [state, setState] = useState({ url: "", summary: "" });
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const canChallenge = status === "WITNESSED" || status === "CONTRADICTED" || status === "UNCLEAR";

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setMessage("");
    setBusy(true);
    try {
      const client = await wallet.getWriteClient();
      const hash = await writeContract(client, "open_challenge", [caseId, state.url, state.summary], 0n);
      txs.track({ hash, label: `Challenge ${caseId}`, createdAt: new Date().toISOString(), status: "PENDING", functionName: "open_challenge" });
      setMessage("Challenge opened. Run challenge review after finalization.");
      const receipt = await waitAccepted(client, hash);
      txs.update(hash, String(receipt.statusName ?? receipt.status ?? "ACCEPTED") as never);
      setMessage(`Challenge reached ${String(receipt.statusName ?? receipt.status)}.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Challenge failed.");
    } finally {
      setBusy(false);
    }
  }

  if (!canChallenge) return null;

  return (
    <form onSubmit={submit} className="panel p-5">
      <div className="label">Challenge Witness</div>
      <div className="mt-4 grid gap-4">
        <Field label="Challenge URL" value={state.url} onChange={(url) => setState({ ...state, url })} placeholder="https://..." />
        <Area label="Challenge Summary" value={state.summary} onChange={(summary) => setState({ ...state, summary })} />
      </div>
      <button className="btn-secondary mt-5" disabled={busy}>{busy ? "Submitting..." : "Open Challenge"}</button>
      {message ? <p className="mt-4 text-sm text-gray-300" aria-live="polite">{message}</p> : null}
    </form>
  );
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string }) {
  return (
    <label>
      <span className="label">{label}</span>
      <input className="input mt-2" value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} required />
    </label>
  );
}

function Area({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label>
      <span className="label">{label}</span>
      <textarea className="input mt-2 min-h-32" value={value} onChange={(event) => onChange(event.target.value)} required />
    </label>
  );
}

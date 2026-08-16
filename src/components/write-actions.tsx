"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { waitAccepted, writeContract } from "@/lib/genlayer/contract";
import { parseGen } from "@/lib/format";
import { useTransactions } from "./transaction-provider";
import { useWallet } from "./wallet-provider";

const DEMO_CASE = {
  id: "case-nist-csf-2-public-record",
  url: "https://www.nist.gov/news-events/news/2024/02/nist-releases-version-20-landmark-cybersecurity-framework",
  claim: "NIST announced version 2.0 of the Cybersecurity Framework in February 2024.",
  context: "Create a public evidence certificate for a governance and security training workflow.",
  bond: "2",
};

const DEMO_CHALLENGE = {
  url: "https://www.nist.gov/cyberframework",
  summary: "This official NIST Cybersecurity Framework page provides additional public context validators can use to confirm the release announcement's relevance.",
};

function demoSuffix() {
  return Date.now().toString().slice(-6);
}

function writeErrorMessage(error: unknown, fallback: string) {
  const message = error instanceof Error ? error.message : String(error);
  if (message.includes("Failed to fetch Version") || message.includes("unknown RPC error")) {
    return "Injected wallet RPC is not compatible with this GenLayer StudioNet write. Use the browser wallet, or import a browser key, then try again.";
  }
  return error instanceof Error ? error.message : fallback;
}

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
      setMessage(writeErrorMessage(error, "Open case failed."));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="panel p-6">
      <button
        type="button"
        className="btn-secondary mb-5"
        onClick={() => setState({ ...DEMO_CASE, id: `${DEMO_CASE.id}-${demoSuffix()}` })}
      >
        Use demo data
      </button>
      <p className="callout callout-info mb-5 text-sm">
        Use a requester wallet here, not the steward wallet. After consensus, settlement is callable by anyone and paid to the contract-selected recipient.
      </p>
      <div className="grid gap-4">
        <Field label="Case ID" value={state.id} onChange={(id) => setState({ ...state, id })} placeholder="xz-backdoor-disclosure" />
        <Field label="Public URL" value={state.url} onChange={(url) => setState({ ...state, url })} placeholder="https://..." />
        <Area label="Claim To Witness" value={state.claim} onChange={(claim) => setState({ ...state, claim })} />
        <Area label="Context" value={state.context} onChange={(context) => setState({ ...state, context })} />
        <Field label="Witness Bond (GEN)" value={state.bond} onChange={(bond) => setState({ ...state, bond })} />
      </div>
      {message ? <p className="callout callout-bad mt-4 text-sm" role="alert">{message}</p> : null}
      <button className="btn-primary mt-6" disabled={busy} aria-busy={busy}>{busy ? "Opening case..." : "Open Witness Case"}</button>
    </form>
  );
}

export function CaseActionButtons({ caseId, status, requester, steward }: { caseId: string; status: string; requester: string; steward: string }) {
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
      setMessage(writeErrorMessage(error, "Write failed."));
    }
  }

  return (
    <div className="panel p-5">
      <div className="label">Actions</div>
      <p className="mt-3 text-xs leading-5 text-muted">
        Requester: {requester}. Steward: {steward}. Settlement is permissionless after consensus; the contract still fixes the payout destination.
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        {(status === "OPEN" || status === "UNCLEAR") ? <button className="btn-primary" onClick={() => run("witness_case")}>Witness by Consensus</button> : null}
        {status === "CHALLENGED" ? <button className="btn-primary" onClick={() => run("review_challenge")}>Review Challenge</button> : null}
        {status === "WITNESSED" ? <button className="btn-secondary" onClick={() => run("release_bond")}>Release Bond</button> : null}
        {status === "UNCLEAR" ? <button className="btn-secondary" onClick={() => run("refund_unclear")}>Refund Unclear</button> : null}
        {status === "CONTRADICTED" ? <button className="btn-secondary" onClick={() => run("forfeit_false_case")}>Forfeit False Case</button> : null}
      </div>
      {message ? <p className="mt-4 text-sm text-muted" aria-live="polite">{message}</p> : null}
    </div>
  );
}

export function ChallengeForm({ caseId, status, requester, steward }: { caseId: string; status: string; requester: string; steward: string }) {
  const wallet = useWallet();
  const txs = useTransactions();
  const [state, setState] = useState({ url: "", summary: "" });
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const canChallenge = status === "WITNESSED" || status === "CONTRADICTED" || status === "UNCLEAR";
  const connected = wallet.address?.toLowerCase();
  const canConnectedChallenge = Boolean(connected && (connected === requester.toLowerCase() || connected === steward.toLowerCase()));

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
      setMessage(writeErrorMessage(error, "Challenge failed."));
    } finally {
      setBusy(false);
    }
  }

  if (!canChallenge) return null;

  return (
    <form onSubmit={submit} className="panel p-5">
      <div className="label">Challenge Witness</div>
      <button
        type="button"
        className="btn-secondary mt-4"
        onClick={() => setState(DEMO_CHALLENGE)}
      >
        Use demo data
      </button>
      <div className="mt-4 grid gap-4">
        <Field label="Challenge URL" value={state.url} onChange={(url) => setState({ ...state, url })} placeholder="https://..." />
        <Area label="Challenge Summary" value={state.summary} onChange={(summary) => setState({ ...state, summary })} />
      </div>
      {!canConnectedChallenge ? (
        <p className="callout callout-warn mt-4">
          Switch to the requester or steward wallet to open a challenge.
        </p>
      ) : null}
      <button className="btn-secondary mt-5" disabled={busy || !canConnectedChallenge} aria-busy={busy}>{busy ? "Submitting..." : "Open Challenge"}</button>
      {message ? <p className="mt-4 text-sm text-muted" aria-live="polite">{message}</p> : null}
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

export type WitnessCase = {
  id: string;
  requester: string;
  url: string;
  claim: string;
  context: string;
  bond: string;
  status: "OPEN" | "WITNESSED" | "CONTRADICTED" | "UNCLEAR" | "CHALLENGED" | "RELEASED" | "REFUNDED" | "FORFEITED";
  created_at: string;
  reviewed_at: string;
  verdict: "UNREVIEWED" | "WITNESSED" | "CONTRADICTED" | "UNCLEAR";
  confidence_band: "HIGH" | "MEDIUM" | "LOW" | "UNKNOWN";
  evidence_summary: string;
  rationale: string;
  snapshot_digest: string;
  challenge_url: string;
  challenge_summary: string;
  challenged_at: string;
  released_to: string;
};

export type Summary = {
  steward: string;
  case_count: number | string;
  profile_count: number | string;
  witnessed_count: string;
  challenged_count: string;
  balance: string;
};

export type Profile = {
  account: string;
  case_count: string;
  witnessed_count: string;
  challenged_count: string;
  bond_total: string;
  released_total: string;
  submitted_cases: WitnessCase[];
  open_challenges: WitnessCase[];
};

export type TxStage =
  | "UNINITIALIZED"
  | "PENDING"
  | "PROPOSING"
  | "COMMITTING"
  | "REVEALING"
  | "ACCEPTED"
  | "UNDETERMINED"
  | "FINALIZED"
  | "CANCELED"
  | "APPEAL_REVEALING"
  | "APPEAL_COMMITTING"
  | "READY_TO_FINALIZE"
  | "VALIDATORS_TIMEOUT"
  | "LEADER_TIMEOUT";

export type StoredTransaction = {
  hash: `0x${string}` & { length?: 66 };
  label: string;
  createdAt: string;
  status: TxStage;
  functionName: string;
};

import { TransactionStatus } from "genlayer-js/types";
import type { CalldataEncodable, GenLayerClient, TransactionHash } from "genlayer-js/types";
import { CONTRACT_ADDRESS, REQUIRED_METHODS } from "./config";
import { createReadClient } from "./read-client";
import type { Profile, Summary, WitnessCase } from "../types";

type Client = GenLayerClient<typeof import("./config").chain>;

export async function verifyContractSchema() {
  if (!CONTRACT_ADDRESS) return { ok: false, missing: REQUIRED_METHODS, configured: false };
  const address = CONTRACT_ADDRESS;
  const client = createReadClient();
  const schema = await readMaybe<{ methods: Record<string, unknown> }>(() => client.getContractSchema(address));
  if (!schema) return { ok: false, missing: REQUIRED_METHODS, configured: true };
  const missing = REQUIRED_METHODS.filter((method) => !schema.methods[method]);
  return { ok: missing.length === 0, missing, configured: true };
}

export async function getSummary() {
  if (!CONTRACT_ADDRESS) return emptySummary();
  const address = CONTRACT_ADDRESS;
  const client = createReadClient();
  return (await readMaybe<Summary>(() => client.readContract({ address, functionName: "get_summary", args: [] }))) ?? emptySummary();
}

export async function listCases(): Promise<WitnessCase[]> {
  if (!CONTRACT_ADDRESS) return [];
  const address = CONTRACT_ADDRESS;
  const client = createReadClient();
  return (await readMaybe<WitnessCase[]>(() => client.readContract({
    address,
    functionName: "list_cases",
    args: [0n, 100n],
  }))) ?? [];
}

export async function getCase(id: string): Promise<WitnessCase | undefined> {
  if (!CONTRACT_ADDRESS) return undefined;
  const address = CONTRACT_ADDRESS;
  const client = createReadClient();
  return readMaybe<WitnessCase>(() => client.readContract({ address, functionName: "get_case", args: [id] }));
}

export async function getProfile(account: `0x${string}`): Promise<Profile | undefined> {
  if (!CONTRACT_ADDRESS) return undefined;
  const address = CONTRACT_ADDRESS;
  const client = createReadClient();
  return readMaybe<Profile>(() => client.readContract({ address, functionName: "get_profile", args: [account] }));
}

export async function writeContract(
  client: Client,
  functionName: string,
  args: CalldataEncodable[],
  value: bigint,
) {
  if (!CONTRACT_ADDRESS) throw new Error("No deployed contract address is configured.");
  const hash = await client.writeContract({
    address: CONTRACT_ADDRESS,
    functionName,
    args,
    value,
    consensusMaxRotations: 3,
  });
  return hash as TransactionHash;
}

function emptySummary(): Summary {
  return {
    steward: "",
    case_count: 0,
    profile_count: 0,
    witnessed_count: "0",
    challenged_count: "0",
    balance: "0",
  };
}

async function readMaybe<T>(read: () => Promise<unknown>): Promise<T | undefined> {
  try {
    return (await read()) as T;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (
      message.includes("execution failed") ||
      message.includes("Missing or invalid parameters") ||
      message.includes("Rate limit exceeded") ||
      message.includes("QueuePool limit") ||
      message.includes("Unexpected token")
    ) {
      return undefined;
    }
    throw error;
  }
}

export async function waitAccepted(client: Client, hash: TransactionHash) {
  const receipt = await client.waitForTransactionReceipt({
    hash,
    status: TransactionStatus.FINALIZED,
    interval: 5000,
    retries: 90,
  });
  const finalized = await client.getTransaction({ hash });
  const result = finalized?.consensus_data?.leader_receipt?.[0]?.execution_result;
  if (result && result !== "SUCCESS") {
    throw new Error(`GenLayer contract execution failed (${result}). Transaction: ${hash}`);
  }

  // The SDK's own wait can resolve on a transient/stale status read (e.g. UNDETERMINED)
  // moments before the network actually settles the same transaction to FINALIZED --
  // observed directly against StudioNet: a witness_case round reported UNDETERMINED by
  // waitForTransactionReceipt, while the contract had already stored a real WITNESSED
  // verdict and the transaction's own receipt was FINALIZED on re-read. Trust the fresh
  // `finalized` read over the wait's own receipt, and give a genuinely unsettled result a
  // short second look before accepting it as final, so the UI never reports "nothing was
  // written, retry" for a write that actually succeeded.
  if (finalized?.statusName === TransactionStatus.FINALIZED && receipt.statusName !== TransactionStatus.FINALIZED) {
    return { ...receipt, statusName: finalized.statusName };
  }
  if (receipt.statusName !== TransactionStatus.FINALIZED) {
    for (let attempt = 0; attempt < 6; attempt += 1) {
      await new Promise((resolve) => setTimeout(resolve, 5000));
      const recheck = await client.getTransaction({ hash });
      if (recheck?.statusName === TransactionStatus.FINALIZED) {
        return { ...receipt, statusName: recheck.statusName };
      }
    }
  }
  return receipt;
}

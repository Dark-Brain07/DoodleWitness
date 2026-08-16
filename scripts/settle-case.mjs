import { createAccount, createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";
import { TransactionStatus } from "genlayer-js/types";
import { existsSync, readFileSync } from "node:fs";

if (existsSync(".env.local")) {
  for (const line of readFileSync(".env.local", "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
    const [key, ...value] = trimmed.split("=");
    process.env[key] ??= value.join("=");
  }
}

const address = process.env.NEXT_PUBLIC_DoodleWitness_CONTRACT;
const caseId = process.argv[2];
const method = process.argv[3]; // release_bond | refund_unclear | forfeit_false_case
const privateKey = process.argv[4];
if (!address || !caseId || !method || !privateKey) {
  throw new Error("usage: node settle-case.mjs <case_id> <method> <private_key>");
}

const account = createAccount(privateKey);
const client = createClient({
  chain: studionet,
  account,
  endpoint: process.env.NEXT_PUBLIC_GENLAYER_ENDPOINT ?? "https://studio.genlayer.com/api",
});

console.log(`Caller: ${account.address}`);
const hash = await client.writeContract({
  address,
  functionName: method,
  args: [caseId],
  value: 0n,
  consensusMaxRotations: 3,
});
console.log(`${method}: ${hash}`);
const receipt = await client.waitForTransactionReceipt({ hash, status: TransactionStatus.ACCEPTED, interval: 5000, retries: 90 });
console.log(`${method} reached ${receipt.statusName ?? receipt.status}`);

const item = await client.readContract({ address, functionName: "get_case", args: [caseId] });
console.log("case after settlement:", JSON.stringify(item, null, 2));
const summary = await client.readContract({ address, functionName: "get_summary", args: [] });
console.log("summary:", JSON.stringify(summary, null, 2));

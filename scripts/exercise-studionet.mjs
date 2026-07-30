import { createAccount, createClient, generatePrivateKey } from "genlayer-js";
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

const address = process.env.NEXT_PUBLIC_WEBWITNESS_CONTRACT;
if (!address) throw new Error("NEXT_PUBLIC_WEBWITNESS_CONTRACT is not set");

const requesterPrivateKey = process.env.WEBWITNESS_REQUESTER_PRIVATE_KEY || generatePrivateKey();
const stewardPrivateKey = process.env.WEBWITNESS_STEWARD_PRIVATE_KEY;
const requester = createAccount(requesterPrivateKey);
const steward = stewardPrivateKey ? createAccount(stewardPrivateKey) : null;
const requesterClient = createClient({
  chain: studionet,
  account: requester,
  endpoint: process.env.NEXT_PUBLIC_GENLAYER_ENDPOINT ?? "https://studio.genlayer.com/api",
});
const stewardClient = stewardPrivateKey ? createClient({
  chain: studionet,
  account: steward,
  endpoint: process.env.NEXT_PUBLIC_GENLAYER_ENDPOINT ?? "https://studio.genlayer.com/api",
}) : null;

const suffix = String(Date.now()).slice(-6);
const caseId = `case-${suffix}`;
const transactions = [];

console.log(`Requester account: ${requester.address}`);
console.log(`Requester private key for reproduction: ${requesterPrivateKey}`);
if (steward) console.log(`Steward account: ${steward.address}`);
else console.log("WEBWITNESS_STEWARD_PRIVATE_KEY not set; steward-only settlement will be skipped.");
console.log(`Contract: ${address}`);

async function write(client, label, functionName, args, value = 0n, status = TransactionStatus.ACCEPTED) {
  const hash = await client.writeContract({
    address,
    functionName,
    args,
    value,
    consensusMaxRotations: 3,
  });
  transactions.push({ label, hash });
  console.log(`${label}: ${hash}`);
  const receipt = await client.waitForTransactionReceipt({ hash, status, interval: 5000, retries: 90 });
  console.log(`${label} reached ${receipt.statusName ?? receipt.status}`);
  return hash;
}

await write(requesterClient, "open_case", "open_case", [
  caseId,
  "https://www.openwall.com/lists/oss-security/2024/03/29/4",
  "The public oss-security disclosure states that a backdoor was discovered in XZ Utils release artifacts in March 2024.",
  "WebWitness is recording a public evidence certificate for a security timeline and maintainer education artifact.",
], 1_000_000_000_000_000_000n);

await write(requesterClient, "witness_case", "witness_case", [caseId], 0n, TransactionStatus.ACCEPTED);

let item = await requesterClient.readContract({ address, functionName: "get_case", args: [caseId] });
console.log("case after witness:", JSON.stringify(item, null, 2));

if (item?.status === "WITNESSED" || item?.status === "CONTRADICTED" || item?.status === "UNCLEAR") {
  await write(requesterClient, "open_challenge", "open_challenge", [
    caseId,
    "https://research.swtch.com/xz-script",
    "This additional public analysis explains the build-script and social-engineering dimensions of the XZ incident, giving validators a second source before settlement.",
  ]);
  await write(requesterClient, "review_challenge", "review_challenge", [caseId], 0n, TransactionStatus.ACCEPTED);
}

item = await requesterClient.readContract({ address, functionName: "get_case", args: [caseId] });
console.log("case after challenge:", JSON.stringify(item, null, 2));

if (stewardClient && item?.status === "WITNESSED") {
  await write(stewardClient, "release_bond", "release_bond", [caseId]);
} else if (stewardClient && item?.status === "UNCLEAR") {
  await write(stewardClient, "refund_unclear", "refund_unclear", [caseId]);
} else if (stewardClient && item?.status === "CONTRADICTED") {
  await write(stewardClient, "forfeit_false_case", "forfeit_false_case", [caseId]);
} else {
  console.log("settlement skipped because final status is not settleable or steward key is unavailable");
}

const summary = await requesterClient.readContract({ address, functionName: "get_summary", args: [] });
const profile = await requesterClient.readContract({ address, functionName: "get_profile", args: [requester.address] });
console.log("summary:", JSON.stringify(summary, null, 2));
console.log("profile:", JSON.stringify(profile, null, 2));
console.log("transactions:", JSON.stringify(transactions, null, 2));

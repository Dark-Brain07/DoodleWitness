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

const privateKey = generatePrivateKey();
const account = createAccount(privateKey);
const client = createClient({
  chain: studionet,
  account,
  endpoint: process.env.NEXT_PUBLIC_GENLAYER_ENDPOINT ?? "https://studio.genlayer.com/api",
});

const suffix = String(Date.now()).slice(-6);
const caseId = `case-${suffix}`;
const transactions = [];

console.log(`Account: ${account.address}`);
console.log(`Private key for reproduction: ${privateKey}`);
console.log(`Contract: ${address}`);

async function write(label, functionName, args, value = 0n, status = TransactionStatus.ACCEPTED) {
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

await write("open_case", "open_case", [
  caseId,
  "https://www.openwall.com/lists/oss-security/2024/03/29/4",
  "The public oss-security disclosure states that a backdoor was discovered in XZ Utils release artifacts in March 2024.",
  "WebWitness is recording a public evidence certificate for a security timeline and maintainer education artifact.",
], 1_000_000_000_000_000_000n);

await write("witness_case", "witness_case", [caseId], 0n, TransactionStatus.ACCEPTED);

let item = await client.readContract({ address, functionName: "get_case", args: [caseId] });
console.log("case after witness:", JSON.stringify(item, null, 2));

if (item?.status === "WITNESSED" || item?.status === "CONTRADICTED" || item?.status === "UNCLEAR") {
  await write("open_challenge", "open_challenge", [
    caseId,
    "https://research.swtch.com/xz-script",
    "This additional public analysis explains the build-script and social-engineering dimensions of the XZ incident, giving validators a second source before settlement.",
  ]);
  await write("review_challenge", "review_challenge", [caseId], 0n, TransactionStatus.ACCEPTED);
}

item = await client.readContract({ address, functionName: "get_case", args: [caseId] });
console.log("case after challenge:", JSON.stringify(item, null, 2));

if (item?.status === "WITNESSED") {
  await write("release_bond", "release_bond", [caseId]);
} else if (item?.status === "UNCLEAR") {
  await write("refund_unclear", "refund_unclear", [caseId]);
}

const summary = await client.readContract({ address, functionName: "get_summary", args: [] });
const profile = await client.readContract({ address, functionName: "get_profile", args: [account.address] });
console.log("summary:", JSON.stringify(summary, null, 2));
console.log("profile:", JSON.stringify(profile, null, 2));
console.log("transactions:", JSON.stringify(transactions, null, 2));

import type { StoredTransaction } from "./types";

const TX_KEY = "doodlewitness.transactions.v1";
const GENERATED_KEY = "doodlewitness.generated-wallet.v1";
const ACK_KEY = "doodlewitness.generated-wallet-ack.v1";

export function readTransactions(): StoredTransaction[] {
  if (typeof localStorage === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(TX_KEY) || "[]") as StoredTransaction[];
  } catch {
    return [];
  }
}

export function writeTransactions(items: StoredTransaction[]) {
  localStorage.setItem(TX_KEY, JSON.stringify(items.slice(0, 20)));
}

export function readGeneratedKey() {
  return localStorage.getItem(GENERATED_KEY) as `0x${string}` | null;
}

export function writeGeneratedKey(key: `0x${string}`) {
  localStorage.setItem(GENERATED_KEY, key);
}

export function hasAcknowledgedGeneratedWallet() {
  return localStorage.getItem(ACK_KEY) === "yes";
}

export function acknowledgeGeneratedWallet() {
  localStorage.setItem(ACK_KEY, "yes");
}

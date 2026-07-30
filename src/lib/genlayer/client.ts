"use client";

import { createAccount, createClient } from "genlayer-js";
import { chain, CHAIN_NAME, GENLAYER_ENDPOINT } from "./config";

export async function createInjectedClient(address: `0x${string}`) {
  const provider = typeof window !== "undefined" ? window.ethereum : undefined;
  const client = createClient({ chain, endpoint: GENLAYER_ENDPOINT, account: address, provider });
  await client.connect(CHAIN_NAME);
  return client;
}

export function createGeneratedClient(privateKey: `0x${string}`) {
  const account = createAccount(privateKey);
  return createClient({ chain, endpoint: GENLAYER_ENDPOINT, account });
}

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      on?: (event: string, listener: (...args: unknown[]) => void) => void;
      removeListener?: (event: string, listener: (...args: unknown[]) => void) => void;
    };
  }
}

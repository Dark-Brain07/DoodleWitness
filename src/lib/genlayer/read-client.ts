import { createAccount, createClient } from "genlayer-js";
import { chain, GENLAYER_ENDPOINT } from "./config";

export function createReadClient() {
  return createClient({ chain, endpoint: GENLAYER_ENDPOINT, account: createAccount() });
}

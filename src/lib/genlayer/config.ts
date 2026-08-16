import { localnet, studionet, testnetAsimov, testnetBradbury } from "genlayer-js/chains";

export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_DOODLEWITNESS_CONTRACT as `0x${string}` | undefined;
export const GENLAYER_ENDPOINT = process.env.NEXT_PUBLIC_GENLAYER_ENDPOINT ?? "https://studio.genlayer.com/api";

export const CHAIN_NAME = (process.env.NEXT_PUBLIC_GENLAYER_CHAIN ?? "studionet") as
  | "studionet"
  | "localnet"
  | "testnetAsimov"
  | "testnetBradbury";

const CHAINS = { studionet, localnet, testnetAsimov, testnetBradbury } as const;

export const chain = CHAINS[CHAIN_NAME];

export const EXPLORER_BASE = chain.blockExplorers?.default.url ?? "https://studio.genlayer.com";

export const REQUIRED_METHODS = [
  "open_case",
  "witness_case",
  "open_challenge",
  "review_challenge",
  "release_bond",
  "refund_unclear",
  "forfeit_false_case",
  "get_summary",
  "list_cases",
  "get_case",
  "get_profile",
];

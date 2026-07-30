export function shortenAddress(address?: string) {
  if (!address) return "No address";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatAttoGen(value?: string | bigint | number) {
  const raw = BigInt(value || 0);
  const whole = raw / 1_000_000_000_000_000_000n;
  const fraction = (raw % 1_000_000_000_000_000_000n).toString().padStart(18, "0").slice(0, 3);
  return `${whole}.${fraction} GEN`;
}

export function parseGen(value: string) {
  const trimmed = value.trim();
  if (!/^\d+(\.\d+)?$/.test(trimmed)) {
    throw new Error("Enter a valid GEN amount.");
  }
  const [whole = "0", fraction = ""] = trimmed.split(".");
  const cleanFraction = fraction.padEnd(18, "0").slice(0, 18);
  return BigInt(whole || "0") * 1_000_000_000_000_000_000n + BigInt(cleanFraction || "0");
}

export function displayTime(iso?: string) {
  if (!iso) return "Not yet";
  const normalized = iso.endsWith("Z") ? iso : iso.includes("+") ? iso : `${iso}Z`;
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function statusTone(status: string) {
  if (status === "WITNESSED" || status === "RELEASED") return "tone-good";
  if (status === "CONTRADICTED" || status === "FORFEITED") return "tone-bad";
  if (status === "UNCLEAR" || status === "CHALLENGED" || status === "UNDETERMINED") return "tone-warn";
  if (status === "OPEN" || status === "UNREVIEWED") return "tone-info";
  return "";
}

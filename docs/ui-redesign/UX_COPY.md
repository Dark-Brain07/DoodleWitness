# UX Copy — DoodleWitness

Copy changes are wording-only; no legal, contractual, transaction, or
verification meaning was altered. Contract-derived values (status strings,
verdicts, amounts) are rendered exactly as returned — never rewritten.

## Changes made
| Location | Before | After | Why |
| --- | --- | --- | --- |
| `CaseForm` submit button | "Opening..." | "Opening case..." | Specific over generic ellipsis-only label. |
| `CaseSection` empty state (dashboard) | "No cases in this section." | "No cases in this section yet." | "Yet" signals this is a temporal/empty state, not a dead end. |
| Wallet menu trigger | icon-only semantics | added `aria-label`/`aria-expanded` | Screen-reader users get an accurate state announcement; no visible copy changed. |
| Mobile nav button | n/a (didn't exist) | "Open menu" / "Close menu" | New control needed a clear accessible name. |

## Copy left unchanged (and why)
- All contract status/verdict words (`OPEN`, `WITNESSED`, `CONTRADICTED`,
  `UNCLEAR`, `CHALLENGED`, `RELEASED`, `FORFEITED`, `UNREVIEWED`,
  `UNDETERMINED`) are rendered verbatim from `item.status`/`item.verdict` —
  rewriting these would change verification meaning.
- Transaction status messaging ("Waiting for wallet signature...",
  "Transaction sent. Consensus stages may take several minutes.", "Reached
  {status}.") is left exactly as-is: it is accurate to GenLayer's real
  multi-stage consensus timing and already honest about pending state.
- Wallet compatibility warning ("Injected wallet RPC is not compatible with
  this GenLayer StudioNet write...") is a functional diagnostic message —
  unchanged.
- Demo-data button labels ("Use demo data") unchanged — they truthfully
  describe pre-filling a real, working demo case (NIST CSF 2.0 announcement),
  not a simulated/fake feature.

## Voice guidelines applied going forward
- Prefer specific verbs over "..." alone ("Opening case..." not "Loading...").
- Never claim a pending/consensus action is instant or guaranteed.
- Keep on-chain terms (bond, verdict, confidence band, settlement) exactly
  as the contract exposes them — DoodleWitness's audience expects precision,
  not marketing softening.

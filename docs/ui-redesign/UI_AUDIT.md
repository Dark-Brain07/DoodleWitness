# UI Audit — WebWitness (pre-redesign baseline)

## Product summary
See `UI_BRIEF.md`. WebWitness is a five-route Next.js App Router app: home
(`/`), case registry (`/cases`), case detail (`/cases/[caseId]`), new case
(`/cases/new`), and a wallet-gated dashboard (`/dashboard`).

## Current screens (as found)
1. **Home (`src/app/page.tsx`)** — hero, 6-stat strip (cases, profiles,
   witnessed, challenged, balance, schema status), a 4-item "consensus
   route" explainer rail, and a recent-cases list.
2. **Cases (`src/app/cases/page.tsx`)** — a 2-column grid of case cards with
   status pill, bond/verdict/confidence mini-stats.
3. **Case detail (`src/app/cases/[caseId]/page.tsx`)** — claim header with
   status + verdict pills, bond/confidence/created panels, URL, context,
   evidence summary, rationale, optional snapshot digest / challenge /
   settlement panels, plus an actions rail (witness/challenge/settle
   buttons) and a live transaction rail.
4. **New case (`src/app/cases/new/page.tsx`)** — case-open form + demo-data
   fill + transaction rail.
5. **Dashboard (`src/app/dashboard/*`)** — wallet-gated profile: stat strip,
   submitted cases, open challenge work, and an explainer panel.

## Navigation
Top app shell (`src/components/app-shell.tsx`): logo/home link, 3 nav links
(Cases, New Case, Dashboard), wallet panel on the right. No mobile nav
variant existed — nav links were hidden below `md` with no replacement
(`hidden md:flex`), so mobile users had no way to reach Cases/New
Case/Dashboard except the wallet menu and homepage links.

## Existing visual strengths
- Consistent use of a `label`/mono-uppercase eyebrow pattern gives the UI a
  "ledger/record" feel already appropriate to a notary product.
- Status pills (`statusTone` in `src/lib/format.ts`) give at-a-glance
  verdict/status reading.
- Real data-driven states throughout (no placeholder content); empty states
  already exist for zero-case lists.

## Usability / hierarchy problems found
- Generic dark-slate/blue palette (`#3b82f6` brand blue on `#030712`
  background) reads as a stock developer-tool template, not something
  purpose-built for an evidence/notary product.
- Inline ad-hoc alert styling duplicated per callout (`border-amber-500/40
  bg-amber-500/10`, `border-red-500/50 bg-red-950/30`, `border-blue-500/40
  bg-blue-500/10`) instead of a shared component — inconsistent radii and
  padding between them.
- No mobile navigation affordance (nav links simply disappear at `<md`).
- No visible-focus styling beyond the browser default outline color swap;
  no `:focus-visible` treatment, no skip link.
- Buttons/inputs had no explicit minimum touch-target height.
- Loading state for the dashboard profile read existed only as disabled
  button label ("Reading"); no skeleton/placeholder for the stat/case grid
  while `state === "loading"`.
- Alerts didn't use `role="alert"`/`aria-live` consistently, and busy
  buttons had no `aria-busy`.

## Accessibility problems found
- No `:focus-visible` outline offset/consistency; only `outline-color` was
  set on raw elements, so keyboard focus was hard to see against dark
  panels.
- No `role="alert"` on error callouts (write failure, profile read error).
- No `aria-expanded`/`aria-haspopup` on the wallet menu trigger.
- No `prefers-reduced-motion` handling for the (limited) existing
  transitions.

## Responsive problems found
- Nav collapses to nothing under `md` — see above.
- Home page 6-stat grid at `md:grid-cols-3 lg:grid-cols-6` was reasonable
  but had no mobile-specific priority order.

## Generic design patterns present
- Default blue accent color indistinguishable from countless dashboard
  templates.
- Pill-shaped fully-rounded status badges with no other shape language.
- No motion/empty-state personality specific to "evidence/witnessing."

## Logic-sensitive boundaries (must not change)
- `src/lib/genlayer/*` (client, config, contract, read-client) — all
  contract read/write logic, ABI, endpoint/env var names.
- `src/components/wallet-provider.tsx` — wallet connection, key
  import/export, signing.
- `src/components/transaction-provider.tsx` — transaction tracking,
  polling, local storage keys.
- `src/components/write-actions.tsx` — `submit`/`run` handlers, contract
  function names (`open_case`, `witness_case`, `review_challenge`,
  `release_bond`, `refund_unclear`, `forfeit_false_case`,
  `open_challenge`), demo data values, validation, routing after write.
- `src/lib/format.ts` — `formatAttoGen`, `parseGen`, `statusTone`,
  `displayTime`, `shortenAddress` (all business-relevant formatting/parsing
  math and status-tone mapping).
- `src/lib/storage.ts`, `src/lib/types.ts` — storage keys and data shapes.
- `.env.local` variable names (`NEXT_PUBLIC_GENLAYER_CHAIN`,
  `NEXT_PUBLIC_GENLAYER_ENDPOINT`, `NEXT_PUBLIC_WEBWITNESS_CONTRACT`).
- `contracts/`, `scripts/verify-schema.mjs`, `gltest.config.yaml`.

## Files safe for visual refactoring
- `src/app/globals.css` (design tokens/utility classes).
- `src/app/page.tsx`, `src/app/cases/page.tsx`,
  `src/app/cases/[caseId]/page.tsx`, `src/app/cases/new/page.tsx`,
  `src/app/dashboard/profile-client.tsx` — markup/className/copy only; all
  data-fetching calls (`getSummary`, `listCases`, `getCase`, `getProfile`,
  `verifyContractSchema`) preserved as-is.
- `src/components/app-shell.tsx`, `src/components/wallet-panel.tsx` —
  presentation only; `useWallet()` calls and handlers preserved as-is.
- `src/components/write-actions.tsx` — className/copy/aria only; every
  handler, contract function name, and demo dataset preserved byte-for-byte.

## Baseline commands (see LOGIC_PRESERVATION_REPORT.md for full output)
- `npm run build` — passed before and after changes.
- `npm run lint` — passed (no output/errors) before and after changes.
- No `test`/`typecheck` script exists in `package.json`; TypeScript checking
  runs as part of `next build` and passed both times.

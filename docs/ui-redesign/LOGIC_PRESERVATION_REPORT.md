# Logic Preservation Report — DoodleWitness

## Logic-sensitive files identified (see UI_AUDIT.md for detail)
`src/lib/genlayer/*`, `src/components/wallet-provider.tsx`,
`src/components/transaction-provider.tsx`, `src/lib/format.ts`,
`src/lib/storage.ts`, `src/lib/types.ts`, `.env.local`, `contracts/`,
`scripts/verify-schema.mjs`, `gltest.config.yaml`.

## Files modified in this redesign (presentation only)
- `src/app/globals.css` — token/palette/utility-class rewrite (colors,
  radii-consistency, new `.callout`/`.skeleton` classes, focus/reduced-motion
  rules). No class *names* consumed elsewhere were removed; `.panel`,
  `.panel-soft`, `.label`, `.title`, `.section-title`, `.mono`,
  `.btn-primary`, `.btn-secondary`, `.input`, `.pill`, `.tone-*` all still
  exist with the same names.
- `src/components/app-shell.tsx` — converted to a client component to add a
  mobile nav disclosure button; the three `Link` destinations
  (`/cases`, `/cases/new`, `/dashboard`) and the `WalletPanel` mount point
  are unchanged. No route, no prop, no exported symbol name changed
  (`AppShell` export signature identical).
- `src/components/wallet-panel.tsx` — added `aria-*` attributes and swapped
  one inline alert style for `.callout callout-warn`; every handler call
  (`wallet.connectInjected`, `wallet.exportPrivateKey`, `wallet.disconnect`,
  `wallet.useGenerated`, `wallet.importGenerated`) is untouched, same
  arguments, same order.
- `src/components/write-actions.tsx` — swapped three inline alert styles for
  `.callout` variants, added `aria-busy`/`role="alert"`, changed the busy
  button label text ("Opening..." → "Opening case..."). All function
  bodies (`submit`, `run`, `writeErrorMessage`, demo data objects, contract
  function name strings) are byte-identical to baseline.
- `src/app/dashboard/profile-client.tsx` — swapped the error box's inline
  style for `.callout callout-bad` with `role="alert"`, and changed one
  empty-state string ("No cases in this section." → "...yet."). All hooks,
  the `loadProfile` callback, `useMemo` computation, and conditional render
  branches are unchanged.
- `.claude/launch.json` — added only to enable local dev-server preview
  during this task; not part of the shipped product.

## Files intentionally left untouched
All files under `src/lib/genlayer/`, `wallet-provider.tsx`,
`transaction-provider.tsx`, `format.ts`, `storage.ts`, `types.ts`,
`contracts/`, `scripts/`, `gltest.config.yaml`, `.env.local`,
`next.config.ts`, `tsconfig.json`, `eslint.config.mjs`,
`package.json`/`package-lock.json` (no dependency changes were made or
needed).

## Handlers preserved
`connectInjected`, `copyKey`/`exportPrivateKey`, `disconnect`,
`useGenerated`, `importGenerated`, `CaseForm.submit` (`open_case`),
`CaseActionButtons.run` (`witness_case`, `review_challenge`,
`release_bond`, `refund_unclear`, `forfeit_false_case`),
`ChallengeForm.submit` (`open_challenge`), `DashboardClient.loadProfile`.
All preserved with identical arguments, call order, and side effects.

## Integrations preserved
GenLayer RPC client construction (`src/lib/genlayer/client.ts`,
`read-client.ts`), contract read/write wrapper (`contract.ts`), env-driven
config (`config.ts`) — no lines changed.

## Routes preserved
`/`, `/cases`, `/cases/[caseId]`, `/cases/new`, `/dashboard` — identical
file locations, identical `Link href` targets, identical
`router.push('/cases/${state.id}')` redirect after case creation.

## API / contract behaviour preserved
No change to `writeContract`, `waitAccepted`, `getSummary`, `listCases`,
`getCase`, `getProfile`, `verifyContractSchema`, or the ABI/contract address
config. `parseGen`/`formatAttoGen`/`statusTone`/`displayTime` math and
mappings are unchanged.

## State behaviour preserved
No React state machine, reducer, or transition condition was changed;
only presentational branches (`.callout` class chosen by the same boolean
conditions that already existed) and one new local `useState` in
`AppShell` (`mobileNavOpen`) purely for the new disclosure UI, with no
interaction with any existing state.

## Tests run
- No dedicated unit/e2e test runner exists in `package.json` beyond
  `verify:schema` (a contract-ABI check against a live/local network, not
  runnable without a configured GenLayer node in this environment — not
  invoked, since it exercises contract infrastructure, not UI).
- `npm run lint` — ESLint, ran before and after all changes.
- `npm run build` — Next.js production build (includes TypeScript check),
  ran before and after all changes.

## Before vs after results
| Command | Baseline | After redesign |
| --- | --- | --- |
| `npm run lint` | passed, no output | passed, no output |
| `npm run build` | succeeded, 5 routes generated (`/`, `/cases`, `/cases/[caseId]` dynamic; `/_not-found`, `/cases/new`, `/dashboard` static) | succeeded, identical route table |

## Manual verification
Ran `npm run dev` locally against the real configured StudioNet contract
(`.env.local`) and loaded `/`, `/cases`, `/cases/new` in a browser session:
home page correctly showed live network stats (schema "Verified", live
case count) and no console errors were present
(`read_console_messages` returned none). Mobile viewport (375×812) verified
the new nav disclosure opens and lists the same three destinations.

## Unavoidable risk
- The `AppShell` conversion from a server component to a client component
  (`"use client"`) is a structural change required to hold the mobile-nav
  open/closed state. It does not change any data fetching (all page-level
  data fetching remains in server components/`page.tsx` files), routing,
  or auth logic, but it is the one file in this pass with a component-type
  change rather than a pure styling/markup edit. Documented here for
  reviewer awareness.
- Contrast and full assistive-technology behaviour were checked manually,
  not via automated tooling (see `ACCESSIBILITY_REVIEW.md` — no axe/
  Lighthouse run was available in this environment).

# Information Architecture — DoodleWitness

## Routes (unchanged — all preserved exactly)
- `/` — Evidence desk home: network stats + recent cases + how-it-works rail.
- `/cases` — Full case registry.
- `/cases/[caseId]` — Case detail + actions + challenge form + tx rail.
- `/cases/new` — Open a new witness case.
- `/dashboard` — Wallet-gated witness profile.

## Navigation model
- Persistent top app shell: brand mark/home link, primary nav (Cases, New
  Case, Dashboard), wallet identity control (top-right, always reachable).
- Redesign change (presentation only): the primary nav is now reachable on
  mobile through a disclosure control in the app shell header instead of
  disappearing under `md`; the destinations and `href`s are unchanged.
- Breadcrumb-equivalent: case detail keeps a "Back to cases" link at the top
  of the content column.

## Content grouping
- **Evidence** (URL, claim, context, snapshot digest) is grouped separately
  from **consensus outcome** (status, verdict, confidence, evidence summary,
  rationale) and from **settlement** (bond, released-to), matching the
  contract's own lifecycle: open → witness → (challenge → review) → settle.
- Wallet identity is deliberately isolated in its own header control, never
  mixed into page content, since it is a session concern, not case data.

## Unchanged destinations
No link target, route parameter, or query shape was changed. `Link href`
values in `app-shell.tsx`, `page.tsx`, `cases/page.tsx`,
`cases/[caseId]/page.tsx`, and `write-actions.tsx`'s post-submit
`router.push('/cases/${state.id}')` are identical to baseline.

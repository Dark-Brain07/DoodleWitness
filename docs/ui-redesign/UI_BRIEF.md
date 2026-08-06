# UI Brief — WebWitness

## What WebWitness is
WebWitness is a bonded public-web-event notary built on GenLayer. A requester
opens a case with a public URL, a precise claim, context, and a GEN bond.
Validators fetch the live URL inside consensus, form a semantic verdict
(witnessed / contradicted / cannot establish), and the contract stores the
decision, evidence summary, rationale, and settlement path. Decisions can be
challenged with a second public source and re-reviewed.

## Users
- **Requesters**: submit and bond a claim about a public page.
- **Reviewers / counterparties**: read case outcomes to settle disputes,
  compliance, or accountability questions.
- **Stewards**: the contract-designated party who can review challenges.
- **Anyone**: settlement calls (release/refund/forfeit) are permissionless
  after consensus decides an outcome.

## Primary user goal
Trust that a specific public claim was actually checked against live
evidence by consensus, and be able to point at a durable, on-chain record of
that check.

## Redesign scope
Visual/presentation redesign only: layout, typography, color system,
component states, copy clarity, accessibility, and responsiveness. No
change to contract calls, RPC clients, wallet logic, routes, or state
transitions. See `LOGIC_PRESERVATION_REPORT.md` for the exact boundary.

## Framework snapshot (from repo inspection)
- Next.js 16.2.12 (App Router, Turbopack), React 19.2.4, TypeScript 5.
- Tailwind CSS v4 via `@theme inline` tokens in `src/app/globals.css`.
- No component library beyond `lucide-react` icons.
- GenLayer chain integration via `genlayer-js`, contract calls in
  `src/lib/genlayer/*`.
- No test runner is wired into `package.json` beyond `verify:schema`
  (contract ABI check) — see baseline results in
  `LOGIC_PRESERVATION_REPORT.md`.

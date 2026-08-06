# UI Handoff — WebWitness

## Completed screens
Home (`/`), Cases (`/cases`), Case detail (`/cases/[caseId]`), New case
(`/cases/new`), Dashboard (`/dashboard`) — all restyled onto the new
"Notary Ledger" token set; markup structure, data fetching, and handlers
unchanged (see `LOGIC_PRESERVATION_REPORT.md`).

## Reusable components / classes
`.panel`, `.panel-soft`, `.label`, `.title`, `.section-title`, `.mono`,
`.btn-primary`, `.btn-secondary`, `.input`, `.pill` + `.tone-good|warn|bad|info`,
new `.callout` + `.callout-info|warn|bad`, new `.skeleton` shimmer utility —
all defined once in `src/app/globals.css`.

## Design tokens
See `DESIGN_SYSTEM.md` for the full token table
(`--bg`, `--panel`, `--panel-soft`, `--line`, `--text`, `--muted`,
`--brand`, `--brand-soft`, `--brand-ink`, `--good`, `--warn`, `--bad`,
`--focus`).

## Responsive rules
See `RESPONSIVE_BEHAVIOUR.md`. Notable: new mobile nav disclosure in
`src/components/app-shell.tsx` (`mobileNavOpen` state, `#mobile-primary-nav`
landmark) replaces the previous "nav simply disappears under `md`" gap.

## Interaction / state notes
- Write buttons show `aria-busy` + explicit busy copy while pending.
- Error states use `.callout-bad` with `role="alert"`.
- Wallet popover exposes `aria-expanded`/`aria-haspopup`/`role="dialog"`.
- Status/verdict pills always pair colour with the literal contract status
  word — never colour-only.

## Accessibility notes
See `ACCESSIBILITY_REVIEW.md` for what was fixed and what remains
(no automated contrast tool run, no skip link, no focus trap on the wallet
popover — flagged, not silently dropped).

## Mock / simulated elements
None introduced. The existing "Use demo data" buttons pre-fill a real
example case (NIST CSF 2.0 announcement) and a real example challenge
source — this was already true before the redesign and is unchanged; the
UI does not claim any simulated data is a live verification result.

## Files changed
- `src/app/globals.css` — full token/utility rewrite (art direction).
- `src/components/app-shell.tsx` — mobile nav disclosure (client component).
- `src/components/wallet-panel.tsx` — a11y attributes + callout class.
- `src/components/write-actions.tsx` — callout classes, `aria-busy`,
  `role="alert"`, one busy-label copy tweak.
- `src/app/dashboard/profile-client.tsx` — callout class, `role="alert"`,
  one empty-state copy tweak.
- `.claude/launch.json` — added for local dev-server preview only.
- `docs/ui-redesign/*.md` — this documentation set (new).

## Commands to run
- `npm run dev` — local dev server (Turbopack).
- `npm run lint` — ESLint.
- `npm run build` — production build + TypeScript check.
- `npm run verify:schema` — contract ABI check (requires a reachable
  GenLayer endpoint; not part of the UI change surface).

## Testing instructions
1. `npm run build && npm run lint` — both must pass with no new errors.
2. `npm run dev`, visit `/`, `/cases`, `/cases/new`, `/cases/[any-real-id]`,
   `/dashboard` — confirm real contract data still loads (case counts,
   schema status) and no console errors appear.
3. Resize to a mobile width (≤768px) and confirm the header's "Open menu"
   button reveals Cases/New Case/Dashboard links, and that they close the
   menu and navigate correctly.
4. Tab through the New Case form and the wallet popover with keyboard only
   — confirm visible focus rings and that Enter/Space activate controls.

## Unresolved design decisions
- Whether to add a persistent skip-link and full focus-trap behaviour to
  the wallet popover in a follow-up pass (flagged in
  `ACCESSIBILITY_REVIEW.md`, not implemented here to avoid expanding scope
  around existing open/close state logic).
- Whether product wants an automated visual-regression/contrast CI step
  added going forward — no such tooling existed in the repo prior to this
  task.

## Functionality intentionally left unchanged
Every contract call, wallet flow, transaction tracking, validation rule,
route, and data shape — see `LOGIC_PRESERVATION_REPORT.md` for the complete
list and the before/after `lint`/`build` results proving no regression.

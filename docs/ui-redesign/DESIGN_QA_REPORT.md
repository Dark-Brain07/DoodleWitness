# Design QA Report — DoodleWitness

## Product appropriateness
The verdigris/ink-green "Notary Ledger" palette and mono-for-record-data
convention read as purpose-built for an evidence/witnessing product, and are
verified distinct from sibling projects `permamission` (coal/gold) and
`rainline` (storm-slate/amber) — checked directly in their `globals.css`.

## Visual hierarchy
Eyebrow labels → section titles → body copy pattern is applied consistently
across all five routes. Primary actions (`Open Case`, `Open Witness Case`,
status-conditional consensus actions) use `.btn-primary`; everything else
uses `.btn-secondary` — a single unambiguous "what's the main action here"
signal per screen.

## Consistency / component reuse
All screens reuse the same six primitives (`panel`, `panel-soft`, `pill`,
`input`, `btn-primary`, `btn-secondary`) plus the new `callout` family —
no screen introduces a one-off pattern. Previously-duplicated inline alert
styling (three different ad-hoc `border-*/bg-*` combinations) is now one
shared component with three tone variants.

## Alignment / spacing
No spacing scale changes were made beyond what already existed in Tailwind
utility usage; radius was unified to the `0.55–0.75rem` family across
buttons/inputs/panels/callouts (previously `0.55rem` buttons vs `0.6rem`
inputs vs `0.75rem` panels vs fully-round pills — now a coherent, still
slightly varied but intentional scale).

## Typography / colour
Verified via source: mono is used only for on-chain values/labels, sans for
prose — unchanged convention, now reinforced by the palette. Status colours
are lightened/tinted for both legibility on dark backgrounds and to avoid
pure hue clashes with the verdigris brand colour.

## Responsiveness
Checked at 375×812 (mobile) and default desktop width against the live dev
server. Mobile nav disclosure confirmed functional (opens, lists all three
destinations, closes on link click). No horizontal overflow observed on the
routes checked (`/`, `/cases/new`).

## Accessibility
See `ACCESSIBILITY_REVIEW.md` for the full checklist and the honestly-listed
remaining gaps (no automated contrast tool, no skip link, no focus trap on
the wallet popover).

## Copy
See `UX_COPY.md`. No verification/contractual meaning changed.

## Visual distinctiveness (interface-distinctiveness-critic pass)
- Removed: generic blue accent, mismatched alert-box styling, fully-round
  pill-only shape language, missing mobile nav (a "could be any unfinished
  template" gap).
- Retained/strengthened: the ledger/record identity already present in the
  mono-label convention, now paired with an evidence-appropriate palette
  instead of a default dashboard blue.
- No decorative charts, no fake metrics, no oversized hero, no
  three-column marketing card grid were introduced — none existed before,
  none were added.

## Route / screen completeness
All 5 routes and all listed component states in `SCREEN_INVENTORY.md` were
reviewed and, where touched, rebuilt/lint-checked successfully.

## Preservation of functionality
Confirmed via `LOGIC_PRESERVATION_REPORT.md`: `npm run build` and
`npm run lint` pass identically before and after, and manual browsing
against the live configured contract showed correct real data (case counts,
schema status) with zero console errors.

## Outstanding before ship
1. Run an automated accessibility/contrast tool (axe or Lighthouse) — not
   available in this execution environment.
2. Add a skip-to-content link and Escape/focus-trap handling on the wallet
   popover (flagged, not blocking).
3. Manual screen-reader pass (NVDA/VoiceOver) was not performed.

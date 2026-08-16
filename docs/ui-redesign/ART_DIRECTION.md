# Art Direction — DoodleWitness: "Notary Ledger"

## Sibling-project check (read-only)
- `permamission` uses a dark coal/gold palette.
- `rainline` uses a storm/amber palette.
DoodleWitness intentionally avoids both: no coal-black + gold, no storm-grey +
amber-only accent. It uses an **ink-green + verdigris + rust** system below.

## Visual concept
DoodleWitness notarizes public evidence — it fetches a real page and records a
consensus judgment on-chain, the way a notary stamps a document after
witnessing it. The concept is an **archival notary desk / evidence ledger**:
deep ink-green "paper under lamplight" backgrounds, a verdigris accent (the
oxidized-copper green of old official seals) for primary actions and links,
and a warm rust/amber reserved strictly for attention states — never
decorative.

## Personality & mood
Precise, calm, procedural, trustworthy. Not playful, not alarmist. The UI
should feel like reading a well-kept public record, not a trading dashboard.

## Typography
- Sans (Geist Sans) for prose and headings; weight 750–800 for section
  titles gives them a stamped, official density.
- Mono (Geist Mono) reserved for eyebrows/labels, addresses, hashes, GEN
  amounts, and IDs — anything that is literally on-chain data reads in mono,
  reinforcing "this is a record," while ordinary prose stays sans.

## Colour system
- Background `#0a1210` (ink-green, not pure black/navy).
- Panel `#10201d`, panel-soft `#16302b`, line `#234238` — a tight tonal
  ladder so panels read as "paper stacked on the desk," not floating cards.
- Brand `#4fd8c4` (verdigris) for links/primary actions; `--brand-ink`
  `#06211d` as the on-brand text color for solid buttons (ink-on-verdigris,
  not white-on-blue — a deliberate departure from generic SaaS buttons).
- Status: good `#6bc98f` (sage — witnessed/released), warn `#d9a441`
  (weathered brass — unclear/challenged), bad `#e07a6b` (rust —
  contradicted/forfeited), info `#4fd8c4` (verdigris — open/unreviewed).
  Colour is always paired with the status word text, never colour-only.

## Spacing & layout
- Content stays in the existing `max-w-7xl` desk-width column; panels use
  consistent `0.75rem` radii family-wide (no mixed pill/square/rounded
  chaos).
- Two-column "form + transaction rail" layout on case/new-case pages
  reinforces "the case file + the ledger of what's happened to it."

## Shape language & elevation
- Rectangular, slightly rounded panels (never full pill except true status
  badges) — evokes stamped forms rather than app "cards."
- No glassmorphism, no drop shadows except a single soft shadow under the
  wallet popover (functional elevation cue, not decoration).
- Subtle dual radial-gradient wash in the page background (verdigris top
  left, rust top right, both under 6% opacity) — atmosphere, not glow.

## Icon direction
`lucide-react` icons retained (already appropriate: wallet, eye, scale,
shield, file-check) — no new icon set introduced.

## Data-visualisation style
Stat tiles remain plain mono numerals in labeled panels — accurate,
unembellished network figures, not decorative sparkline/donut charts that
would imply data DoodleWitness doesn't compute.

## Motion principles
Short (140–160ms) ease transitions on hover/press only; `1px` lift on
primary-button hover; full `prefers-reduced-motion` opt-out implemented in
`globals.css`.

## Density
Desktop: comfortable multi-column panels. Mobile: single column, same
panel components, nav collapses into a disclosure control rather than
being hidden with no replacement.

## Patterns avoided
No purple/blue glow, no glassmorphism, no oversized empty hero, no fake
metrics/decorative charts, no repetitive 3-column marketing-style card
grids, no pill-everything, no generic SaaS blue.

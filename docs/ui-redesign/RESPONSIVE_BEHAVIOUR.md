# Responsive Behaviour — DoodleWitness

Breakpoints follow Tailwind defaults already in use in the codebase (`md`
768px, `lg` 1024px) — no new breakpoint system introduced.

## Home (`/`)
- Desktop: hero + 6-stat grid (`lg:grid-cols-6`), 280px explainer rail +
  case list side by side (`lg:grid-cols-[280px_1fr]`).
- Tablet: stats wrap to 3 columns (`md:grid-cols-3`); rail stacks above the
  case list below `lg`.
- Mobile: single column throughout; case list items collapse from the
  3-column row layout to stacked (`md:grid-cols-[160px_1fr_150px]` already
  falls back to block layout below `md`).

## Cases / Case detail / New case
- Case grid: `md:grid-cols-2` → single column under `md`.
- Case detail + New case: `lg:grid-cols-[1fr_360px]` (content + action/tx
  rail) → single column under `lg`, with the rail rendering after the main
  content in DOM order (already true, preserved) so tab order stays
  logical.

## Dashboard
- Stat strip `md:grid-cols-3 lg:grid-cols-6` → single/double column on
  small screens; wide stat tiles (`Bonded`, `Released`) get `md:col-span-2
  lg:col-span-1` to avoid orphaned narrow numerals on tablet.
- Submitted/challenge sections: `lg:grid-cols-2` → stacked under `lg`.

## Navigation
- Previously: primary nav links were `hidden md:flex` with **no mobile
  replacement** — a real gap. Redesign keeps the same three `Link`
  destinations but exposes them through a disclosure control in the header
  on small screens so no destination is unreachable on mobile.
- Wallet control remains reachable at all widths (it was already visible).

## Tables / dense data
DoodleWitness has no literal `<table>` elements; case listings are card-based,
which already degrades gracefully to mobile without a responsive-table
pattern being needed.

## Overflow safety
Long values (addresses, URLs, hashes) already use `break-all` in the
source; retained. No horizontal scroll was introduced by any of the token
or class changes — verified via `npm run build` (no new fixed-width
utilities added) and manual route review in a local browser session.

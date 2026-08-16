# Design System — DoodleWitness

All tokens live in `src/app/globals.css` under `:root` and are mapped into
Tailwind v4 via `@theme inline`. Components are plain utility classes (no
component library) kept consistent through the shared classes below.

## Tokens
| Token | Value | Use |
| --- | --- | --- |
| `--bg` | `#0a1210` | Page background |
| `--panel` | `#10201d` | Primary card/panel surface |
| `--panel-soft` | `#16302b` | Secondary/nested surface |
| `--line` / `--line-soft` | `#234238` / `#1a2f29` | Borders |
| `--text` | `#eef5f1` | Primary text |
| `--muted` | `#8fa89e` | Secondary text |
| `--brand` / `--brand-soft` | `#4fd8c4` / `#2fb9a6` | Accent / solid-button fill |
| `--brand-ink` | `#06211d` | Text on solid brand buttons |
| `--good` / `--warn` / `--bad` | `#6bc98f` / `#d9a441` / `#e07a6b` | Status semantics |
| `--focus` | `#4fd8c4` | Focus ring colour |

## Typography
- Section titles: `.section-title` (750 weight, clamp 1.5–2.25rem).
- Hero title: `.title` (800 weight, clamp 2–4.5rem).
- Eyebrow/meta: `.label` (mono, uppercase, 0.72rem, 0.12em tracking).
- On-chain data (addresses, hashes, GEN amounts, IDs): `.mono`.

## Components (shared classes)
- **Buttons**: `.btn-primary` (solid verdigris, ink text, disabled/hover/active
  states), `.btn-secondary` (outlined panel-soft, hover/active states). Both
  enforce `min-height: 2.5rem` for touch-target size.
- **Inputs**: `.input` — hover border shift, `:focus-visible` ring
  (`box-shadow` halo, not just outline swap), placeholder colour token.
- **Panels**: `.panel` / `.panel-soft` — the two surface levels used
  everywhere (stat tiles, case cards, forms, action rails).
- **Status pills**: `.pill` + `.tone-good|warn|bad|info` — square-ish
  radius (not full pill) with matching border/text/background tint, always
  paired with the literal status word.
- **Callouts**: new shared `.callout` + `.callout-info|warn|bad` — replaces
  the previously duplicated inline `border-*/bg-*` Tailwind combinations in
  `wallet-panel.tsx` and `write-actions.tsx` with one consistent component.
- **Skeleton**: new `.skeleton` shimmer utility, available for future
  loading placeholders (reduced-motion safe).

## States implemented
Default, hover, focus-visible, active, disabled (`:disabled` opacity +
cursor), loading (`aria-busy` + label swap on write buttons), empty (case
lists, dashboard sections), error (`.callout-bad`, `role="alert"`), success
(status pill tone-good / redirect), selected (status-conditional action
button visibility already encodes "current state").

## Responsive rules
See `RESPONSIVE_BEHAVIOUR.md`.

## Accessibility baked into tokens
- `:focus-visible` global rule (2px outline + 2px offset) instead of relying
  on browser default outline colour alone.
- Text/background contrast pairs chosen to meet WCAG AA at normal text
  sizes (light `#eef5f1` on `#0a1210`/`#10201d`, tone colours lightened
  against dark tints — see `ACCESSIBILITY_REVIEW.md` for the checked pairs).
- `prefers-reduced-motion` kill-switch for all transitions/animations.

## Reused vs. newly introduced
Reused: `.panel`, `.panel-soft`, `.label`, `.title`, `.section-title`,
`.mono`, `.btn-primary`, `.btn-secondary`, `.input`, `.pill`, `.tone-*`
(restyled in place, same class names — zero markup churn required in
consumers beyond the callout replacements).
Newly introduced: `.callout` family, `.skeleton`, global `:focus-visible`
and `::selection` rules, reduced-motion rule.

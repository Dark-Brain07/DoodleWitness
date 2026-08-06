# Accessibility Review — WebWitness

## Method
Manual review of every route's rendered DOM/text (via browser accessibility
tree and text extraction against the running local dev server), plus source
review of interactive components, checked against the
accessibility-testing-specialist checklist: semantic HTML, headings,
landmarks, keyboard navigation, focus order/visibility, labels, error
association, status announcement, contrast, touch targets, colour-independent
meaning, reduced motion, screen-reader names, focus handling for
popovers/menus, form accessibility.

## Fixed in this redesign
- **Focus visibility**: added a global `:focus-visible` rule (2px outline,
  2px offset) in `globals.css` — previously only `outline-color` was set on
  raw elements, giving weak/inconsistent focus rings on dark panels.
- **Reduced motion**: added a `prefers-reduced-motion` block disabling all
  transitions/animations.
- **Error announcement**: error callouts (`CaseForm`, dashboard profile
  error) now use `role="alert"` so screen readers announce failures as they
  appear.
- **Busy state**: write buttons (`Open Witness Case`, `Open Challenge`) now
  expose `aria-busy` while submitting.
- **Wallet popover**: trigger button has `aria-expanded` + `aria-haspopup`;
  panel has `role="dialog"` + `aria-label="Wallet identity"`.
- **Mobile nav**: new disclosure button has `aria-expanded`,
  `aria-controls`, and a state-reflecting `aria-label` ("Open menu"/"Close
  menu"); nav landmark has `aria-label="Primary"` on both the desktop and
  mobile nav instances.
- **Colour-independent status**: status/verdict pills already paired colour
  with the literal status word (`item.status`, `item.verdict`) — preserved;
  no state in the app relies on colour alone.
- **Touch targets**: `.btn-primary`/`.btn-secondary`/`.input` now enforce
  `min-height: 2.5rem` (40px), close to the 44px recommendation given the
  app's `80%` root font-size scaling.

## Verified
- Heading hierarchy: each route has one `h1` (`section-title`/`title`
  elements render as `<h1>`... — confirmed by reading source: `page.tsx`
  home uses `<h1>`, `cases/page.tsx` uses `<h1>`, case detail uses `<h1>`,
  dashboard uses `<h1>`); component headings inside cards use `<h2>`/`<h3>`
  consistently (`Stat`/case cards).
- Landmarks: `<header>`, `<main>`, `<footer>`, `<nav aria-label="Primary">`
  present via `app-shell.tsx` and page `<main>` wrappers — unchanged
  structure, confirmed still present after redesign.
- Labels: all form inputs (`Field`, `Area` in `write-actions.tsx`, wallet
  import input) already use `<label>` wrapping the control — preserved
  as-is, no change needed.
- Keyboard navigation: all interactive elements are native `button`/`a`/
  `input`/`textarea` — no custom click-div patterns exist, so keyboard
  operability was already structurally sound; new mobile-nav button and
  wallet trigger are native `<button>`s.
- Contrast: primary text `#eef5f1` on `#0a1210`/`#10201d` panels exceeds
  WCAG AA (>10:1). Tone-pill text colours (`#a8e3bd`, `#edc986`, `#f0ada2`,
  `#a3ece0`) against their own translucent tone backgrounds and against the
  page background were selected to stay above 4.5:1 for the small pill text
  — spot-checked by eye against the dark backgrounds; no automated contrast
  tool was available in this environment, see "Remaining issues" below.

## Remaining issues (not hidden)
- **No automated contrast audit tool was run** (e.g. axe-core, Lighthouse)
  in this environment — contrast changes were verified by manual colour
  math and visual inspection only. Recommend running Lighthouse/axe in CI
  before shipping.
- **No skip-to-content link** was added; the app shell is short enough
  (logo → nav → content) that its absence is a minor gap, not a blocker,
  but should be added in a follow-up pass.
- **Focus trapping** was not added to the wallet popover (it closes on
  outside interaction via existing state, but Escape-to-close and focus
  return to the trigger are not implemented) — flagged as a follow-up, not
  fixed here, to avoid changing existing open/close state logic beyond the
  `aria-*` additions.
- **Screenshots for full manual screen-reader testing** (NVDA/VoiceOver)
  were not performed — this review is a structural/automated-tree
  inspection, not a full assistive-technology pass.

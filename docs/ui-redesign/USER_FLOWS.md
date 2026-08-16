# User Flows — DoodleWitness

## Flow 1: Open a witness case
- **Entry point**: `/`, `/cases`, or nav → "New Case".
- **Intent**: Bond a claim about a public URL for consensus review.
- **Steps (unchanged)**: fill Case ID, Public URL, Claim, Context, Bond →
  (optional "Use demo data") → submit → `open_case` write via
  `writeContract` → track in `TransactionRail` → `waitAccepted` → redirect to
  `/cases/[caseId]`.
- **Redesigned presentation**: form fields grouped in one panel with a
  clearer "why a requester wallet" callout using the shared `.callout`
  style; primary submit button now shows `aria-busy` and a busier verb
  ("Opening case...") while pending.
- **Logic unchanged**: `writeContract`, `parseGen`, `waitAccepted`, redirect
  target, and validation (`required` fields) are byte-identical.
- **Loading state**: submit button disabled + "Opening case..." label.
- **Error state**: red `.callout-bad` box with `role="alert"`, same
  `writeErrorMessage` text.
- **Success state**: redirect to case detail page.
- **Responsive**: form and transaction rail stack on mobile
  (`lg:grid-cols-[1fr_360px]` collapses to single column below `lg`).

## Flow 2: Witness / settle a case
- **Entry point**: `/cases/[caseId]`.
- **Intent**: run the applicable consensus/settlement action for the case's
  current status.
- **Steps (unchanged)**: status-conditional buttons
  (`witness_case`/`review_challenge`/`release_bond`/`refund_unclear`/
  `forfeit_false_case`) call `writeContract`, track, poll, then show the
  reached status.
- **Redesigned presentation**: action panel keeps the same conditional
  button set; status message area unchanged in behavior, restyled to match
  the new token set.
- **Loading/pending state**: "Waiting for wallet signature..." then
  "Transaction sent. Consensus stages may take several minutes." — copy
  unchanged (accurate to real multi-stage consensus timing).
- **Error state**: inline message text (same `writeErrorMessage` mapping).

## Flow 3: Challenge a witnessed case
- **Entry point**: `/cases/[caseId]`, visible only when
  `status` is WITNESSED/CONTRADICTED/UNCLEAR.
- **Steps (unchanged)**: fill Challenge URL + Summary (or demo data) →
  `open_challenge` write → track → poll.
- **Permission gate (unchanged)**: only requester/steward wallets can
  submit; others see the same warning, now in `.callout-warn` styling.

## Flow 4: Read profile / dashboard
- **Entry point**: nav → Dashboard.
- **Steps (unchanged)**: if no wallet connected, show connect prompt; else
  `getProfile(wallet.address)` on mount and on manual "Refresh".
- **States**: idle/loading/ready/error drive the same conditional render;
  redesign adds a `role="alert"` error box and keeps the refresh button's
  spinning icon behavior.

## Flow 5: Wallet connect/disconnect
- **Entry point**: header wallet control, any page.
- **Steps (unchanged)**: `useGenerated` / `connectInjected` / `exportPrivateKey`
  / `importGenerated` / `disconnect` — all calls preserved.
- **Redesigned presentation**: popover now has `role="dialog"`,
  `aria-label`, and the trigger button exposes `aria-expanded`/
  `aria-haspopup` for screen readers; no behavior change.

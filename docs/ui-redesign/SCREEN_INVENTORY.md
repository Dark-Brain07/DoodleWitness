# Screen Inventory — WebWitness

| Route | File | Purpose | Key states covered |
| --- | --- | --- | --- |
| `/` | `src/app/page.tsx` | Evidence desk home, network stats, recent cases | empty ledger, populated ledger, schema verified/mismatch/not-configured |
| `/cases` | `src/app/cases/page.tsx` | Full case registry | empty, 1 card, many cards, long claim text (`line-clamp`) |
| `/cases/[caseId]` | `src/app/cases/[caseId]/page.tsx` | Case detail, evidence, actions, challenge, settlement | not-found (404 via `notFound()`), pre-witness, witnessed, contradicted, unclear, challenged, settled |
| `/cases/new` | `src/app/cases/new/page.tsx` + `CaseForm` | Open a bonded case | default, demo-filled, submitting, error |
| `/dashboard` | `src/app/dashboard/page.tsx` + `profile-client.tsx` | Wallet-gated witness profile | disconnected, loading, ready (0/1/many cases), error |
| Global | `src/components/app-shell.tsx` | Header/nav/footer shell | desktop nav, mobile disclosure nav |
| Global overlay | `src/components/wallet-panel.tsx` | Wallet identity popover | none/generated/injected mode, message feedback |
| Global rail | `src/components/transaction-provider.tsx` | Local transaction activity | empty, pending, accepted/failed |

All five routes and every component above were inspected in source and
exercised via a local dev server (`npm run dev`) reading the live configured
StudioNet contract (`NEXT_PUBLIC_WEBWITNESS_CONTRACT` in `.env.local`);
rendered text was captured via the browser tooling's accessibility/text
extraction (see `DESIGN_QA_REPORT.md` for what was verified this way).

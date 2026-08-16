# DoodleWitness

DoodleWitness is a GenLayer project for bonded public evidence certificates. A user submits a public URL, a specific claim, context, and a bond. The Intelligent Contract fetches the source during consensus, decides whether the evidence witnesses or contradicts the claim, and records the result on-chain.

## Why It Exists

Public claims often spread faster than verification. DoodleWitness gives teams a reusable primitive for recording source-backed facts: security disclosures, protocol incidents, published reports, governance notices, grant deliverables, public commitments, and corrections.

The important part is that the contract does not trust the submitter's summary. Validators fetch the source themselves and compare semantic judgments over the evidence.

## What GenLayer Does

- Fetches live public evidence with `gl.nondet.web.render`.
- Uses an LLM inside consensus to judge natural-language claims against the fetched source.
- Applies a comparative equivalence principle so validators agree on verdict, confidence, and decisive evidence.
- Stores cases, challenges, profiles, and settlement state on-chain.
- Requires a payable bond for every case.
- Releases, refunds, or forfeits the bond depending on the witnessed result.

## Contract

StudioNet contract:

```text
0xcE85A028f783E0F8bA8677993FEd5F870eE71e36
```

Deployment transaction:

```text
0x18352b9fa21ac3852526d468e37c33054abd358eb53fa0dd3ccdd9c9661c6407
```

Explorer:

```text
https://explorer-studio.genlayer.com/address/0xcE85A028f783E0F8bA8677993FEd5F870eE71e36
```

Main methods:

| Method | Type | Purpose |
| --- | --- | --- |
| `open_case(case_id, url, claim, context)` | payable write | Creates a bonded evidence case. |
| `witness_case(case_id)` | consensus write | Fetches evidence and decides `WITNESSED`, `CONTRADICTED`, or `UNCLEAR`. |
| `open_challenge(case_id, challenge_url, challenge_summary)` | write | Opens a dispute using another public source. |
| `review_challenge(case_id)` | consensus write | Re-fetches primary and challenge evidence and records the updated outcome. |
| `release_bond(case_id)` | write | Permissionlessly sends the bond back after a witnessed claim. |
| `refund_unclear(case_id)` | write | Permissionlessly refunds the requester when evidence is unclear. |
| `forfeit_false_case(case_id)` | write | Permissionlessly forfeits a contradicted case bond to the steward. |
| `get_summary()` | view | Reads platform totals. |
| `list_cases(offset, limit)` | view | Reads the public case ledger. |
| `get_case(case_id)` | view | Reads one case. |
| `get_profile(account)` | view | Reads wallet-level case and challenge history. |

## Live App

```text
https://doodle-witness.vercel.app/
```


## App Flow

1. Connect a requester wallet.
2. Open a case with a public URL, precise claim, context, and bond.
3. Run witness review. GenLayer validators fetch the source and agree on the result.
4. If the result is wrong or incomplete, open a challenge with the requester or steward wallet.
5. Run challenge review. The contract re-evaluates the case with both sources.
6. Settle the case from any wallet. The contract chooses the destination from the consensus result: requester for witnessed or unclear, steward for contradicted.

## Environment

Create `.env.local`:

```bash
NEXT_PUBLIC_GENLAYER_CHAIN=studionet
NEXT_PUBLIC_GENLAYER_ENDPOINT=https://studio.genlayer.com/api
NEXT_PUBLIC_DoodleWitness_CONTRACT=0xcE85A028f783E0F8bA8677993FEd5F870eE71e36
```

## Local Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Verification

The project includes direct contract tests, schema verification, and frontend checks.

```bash
python -m pytest tests/direct
python -m pytest tests/integration/ -v -s --network studionet
npm run lint
npm run build
npm run verify:schema
```

Current local verification (all real, run this session):

```text
genvm-lint check contracts/DoodleWitness.py --json -> ok: true, lint passed 3, 11 methods (4 view, 7 write)
29 direct contract tests passing (pytest tests/direct/ -v, 2.65s)
5 StudioNet integration tests passing (gltest tests/integration/ -v -s --network studionet, 337.22s)
Next.js lint passing (eslint, zero warnings)
Next.js production build passing (next build, Turbopack)
tsc --noEmit passing, zero errors
StudioNet schema verification passing
```

Integration tests cover: contract deploy, a real payable `open_case`, a rejected zero-bond `open_case`, a real `witness_case` live consensus round, and a full `open_challenge` -> `review_challenge` live consensus cycle -- each against a fresh deploy on StudioNet, not mocks. Both live-consensus tests returned a real `WITNESSED` verdict from validators.

The current contract enforces role separation without creating a settlement bottleneck: the steward cannot open requester cases, while any wallet can execute the final settlement once consensus has made the outcome valid.

## Demo Data

Use public sources that are different from seeded examples:

- URL: `https://blog.cloudflare.com/inside-the-pagerduty-outage-on-june-5-2026/`
- Claim: `Cloudflare published a public incident writeup about a PagerDuty outage on June 5, 2026.`
- Context: `DoodleWitness is recording a public operations timeline certificate for incident-response review.`

Or:

- URL: `https://www.cisa.gov/news-events/alerts`
- Claim: `CISA maintains a public alerts page for cybersecurity advisories and notices.`
- Context: `DoodleWitness is recording a source-backed public evidence certificate for a security education artifact.`

## Honest Limits

DoodleWitness is a public web evidence primitive. It does not verify private documents, paywalled content, or sources that block validator fetching. It records the consensus decision and evidence digest from the transaction, not a permanent full-page archive.

Observed while proving out the on-chain surface and the integration suite this session:

- `gltest`'s default `get_accounts()` on StudioNet mints fresh, unfunded ephemeral keys every run. Payable calls fail with an opaque `execution_result: ERROR` and no `error_description` when the sending account has no GEN. `gltest.config.yaml` now pins two funded accounts under `networks.studionet.accounts` (read via `${DoodleWitness_TEST_STEWARD_KEY}` / `${DoodleWitness_TEST_REQUESTER_KEY}` from the gitignored `.env`, resolved by gltest's own `${VAR}` substitution) so the integration suite runs against real balances instead of empty ones.
- The same deployer account cannot also be the case requester: `open_case` explicitly rejects `gl.message.sender_address == self.steward`, and the deploying account becomes `steward`. The integration tests deploy from `accounts[0]` and always act as the requester from `accounts[1]`.
- Both live-consensus rounds proven this session (`witness_case` in isolation, and the `witness_case` -> `open_challenge` -> `review_challenge` cycle) returned a clean `WITNESSED` verdict with `HIGH` confidence on the first attempt -- no `UNDETERMINED`/`VALIDATORS_TIMEOUT`/`LEADER_TIMEOUT` retries were needed, though the integration tests still wrap consensus writes in a retry helper since GenLayer's own docs treat those statuses as expected/retryable, not exceptional.
- The `genlayer` CLI's `write` command hardcodes `value: 0n` and cannot exercise the payable `open_case` path, so the on-chain proof above uses a standalone `genlayer-js` script (`scripts/exercise-studionet.mjs` plus `scripts/settle-case.mjs` for permissionless settlement) instead of the CLI.
- The `genvm-lint` and `gltest` executables are not on `PATH` in this environment; both live under the Python install's `Scripts/` directory (e.g. `...\Python\pythoncore-3.14-64\Scripts\gltest.exe`) and were invoked by absolute path.

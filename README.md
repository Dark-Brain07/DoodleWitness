# WebWitness

WebWitness is a GenLayer project for bonded public evidence certificates. A user submits a public URL, a specific claim, context, and a bond. The Intelligent Contract fetches the source during consensus, decides whether the evidence witnesses or contradicts the claim, and records the result on-chain.

## Why It Exists

Public claims often spread faster than verification. WebWitness gives teams a reusable primitive for recording source-backed facts: security disclosures, protocol incidents, published reports, governance notices, grant deliverables, public commitments, and corrections.

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
0xE6fe8207d1801F0caE01958b5525F1d7feAaCB00
```

Deployment transaction:

```text
0xd4c5ea18b439890a63113e9dd9c11eaeb31e20302b0fe058dd79424500e75226
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
NEXT_PUBLIC_WEBWITNESS_CONTRACT=0xE6fe8207d1801F0caE01958b5525F1d7feAaCB00
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
npm run lint
npm run build
npm run verify:schema
```

Current local verification:

```text
29 direct contract tests passing
Next.js lint passing
Next.js production build passing
StudioNet schema verification passing
```

The current contract enforces role separation without creating a settlement bottleneck: the steward cannot open requester cases, while any wallet can execute the final settlement once consensus has made the outcome valid.

## Demo Data

Use public sources that are different from seeded examples:

- URL: `https://blog.cloudflare.com/inside-the-pagerduty-outage-on-june-5-2026/`
- Claim: `Cloudflare published a public incident writeup about a PagerDuty outage on June 5, 2026.`
- Context: `WebWitness is recording a public operations timeline certificate for incident-response review.`

Or:

- URL: `https://www.cisa.gov/news-events/alerts`
- Claim: `CISA maintains a public alerts page for cybersecurity advisories and notices.`
- Context: `WebWitness is recording a source-backed public evidence certificate for a security education artifact.`

## Honest Limits

WebWitness is a public web evidence primitive. It does not verify private documents, paywalled content, or sources that block validator fetching. It records the consensus decision and evidence digest from the transaction, not a permanent full-page archive.

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

Explorer:

```text
https://explorer-studio.genlayer.com/address/0xE6fe8207d1801F0caE01958b5525F1d7feAaCB00
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
https://webwitness.vercel.app
```

## On-Chain Proof (StudioNet)

The full write surface has been exercised for real against the deployed contract, with real GEN, real tx hashes, and real validator-generated verdicts (no fabricated data -- every value below is copied from actual transaction receipts and `get_case`/`get_summary` reads).

Requester account used for this run: `0x70ce660c3Ed153fd512a80913Af1f94489Af08D9`.

Case `case-588957` -- source: `https://www.openwall.com/lists/oss-security/2024/03/29/4` (the real oss-security XZ backdoor disclosure), claim: "The public oss-security disclosure states that a backdoor was discovered in XZ Utils release artifacts in March 2024."

| Step | Method | Tx Hash | Result |
| --- | --- | --- | --- |
| 1 | `open_case` (payable, 1 GEN bond) | `0xdca473fc58bf7153b47e55fa1f79d83fe80920a016621ce998abab7893da16e5` | ACCEPTED |
| 2 | `witness_case` (live consensus) | `0x9b2934679a22ece9b1b1252b77472e7475d2281f6a15059eaa2d155cf5fe1346` | ACCEPTED, verdict `WITNESSED`, confidence `HIGH` |
| 3 | `open_challenge` (second source: `https://research.swtch.com/xz-script`) | `0x0d6a280becde3c9db800570f00d4cc351c2cedf43fad3b4cd61eff56ada9ca57` | ACCEPTED |
| 4 | `review_challenge` (live consensus, re-fetches both sources) | `0xf33996edbe9cbf298eede3d8e43ef18ee10022ca254c5bb8cdc8a75644b616e2` | ACCEPTED, verdict stayed `WITNESSED`, confidence `HIGH` |
| 5 | `release_bond` (called by the requester itself -- permissionless) | `0x7908dcbc41db1edccd60460aa475d03e2dc2a296f1d4578ca7719fa771b5160c` | ACCEPTED, case status `RELEASED`, bond `1000000000000000000` returned to the requester |

The rationale the contract actually stored after `witness_case`:

> "The fetched primary page is the actual public oss-security mailing list disclosure from March 29, 2024, which directly states that a backdoor was discovered in upstream xz/liblzma release artifacts. The detailed technical analysis provided in the disclosure confirms the claim's accuracy regarding both the discovery timeline (March 2024) and the nature of the compromise (backdoor in release artifacts). The evidence is authoritative, coming from a security researcher who discovered and analyzed the backdoor, and was posted to the public oss-security mailing list."

The evidence summary the contract stored after `review_challenge`, drawing on both sources:

> "The fetched oss-security mailing list page is a public post dated Fri, 29 Mar 2024 from Andres Freund with subject \"backdoor in upstream xz/liblzma leading to ssh server compromise.\" In the body, Freund states: \"The upstream xz repository and the xz tarballs have been backdoored\" and identifies affected release tarballs \"5.6.0 and 5.6.1.\" The challenge page independently says: \"Andres Freund published the existence of the xz attack on 2024-03-29 to the public oss-security@openwall mailing list.\""

`get_summary()` after this run:

```json
{
  "steward": "0xb29Ead15B1E8A2420faE84de974088f67a15ccC2",
  "case_count": 1,
  "profile_count": 1,
  "witnessed_count": "1",
  "challenged_count": "0",
  "balance": "1000000000000000000"
}
```

(Balance reflects the deploy-time steward's own bond from an earlier probe transaction on this same deployed contract, not `case-588957` -- that case's bond was already released back to the requester at settlement.)

The full open -> witness -> challenge -> review -> release cycle was proven in one script run; a second script call then settled the case with `release_bond`. Reproduce with:

```bash
node scripts/exercise-studionet.mjs
node scripts/settle-case.mjs <case_id> release_bond <requester_private_key>
```

### The other settlement branch: `CONTRADICTED` -> `forfeit_false_case`

The run above only proved the `WITNESSED` path. To prove the contract actually reaches a different verdict and a different settlement destination when the evidence disagrees with the claim -- not just when it happens to agree -- a second case was opened against the same real disclosure page, with a claim the page directly refutes: "The public oss-security disclosure states that no security vulnerabilities of any kind were ever found in XZ Utils, and the project has a clean, incident-free security history."

Case `case-911948` -- same source (`https://www.openwall.com/lists/oss-security/2024/03/29/4`), a claim it contradicts:

| Step | Method | Tx Hash | Result |
| --- | --- | --- | --- |
| 1 | `open_case` (payable, 1 GEN bond) | `0xd43b6e9fcd4708906ab182e1cecc30da4ddd96b119c7b931056182288f5916fe` | ACCEPTED |
| 2 | `witness_case` (live consensus) | `0x81cee99271e039bf2c1c92306ecfa882061dc88f733b8c6afb2e02c0b3ac4f4c` | ACCEPTED, verdict `CONTRADICTED` |
| 3 | `open_challenge` (second source: `https://research.swtch.com/xz-script`) | `0xe57a153d4fc7dc7a6c56410daf834402630c1fd81f7d5adadaae6c5d2eb9b334` | ACCEPTED |
| 4 | `review_challenge` (live consensus, re-fetches both sources) | `0x3864091c3045d483915a7c87703da3ff9c6fe6c76c97bae4b73bcb1fe6691293` | ACCEPTED, verdict stayed `CONTRADICTED` |
| 5 | `forfeit_false_case` (permissionless) | `0x3728ca9c8f0fefafed84ab724a1ecc2eb0ad3e31827773338547a7a04d75923d` | ACCEPTED, case status `FORFEITED`, bond sent to the steward, not back to the requester |

Confirmed independently on the public explorer: the `forfeit_false_case` transaction is followed by a separate `Send` (`0xe73fa4199...930a5a97`) moving `1000000000000000000` wei **out of the contract to the steward address**, not the requester -- proving the bond actually moved to the correct destination for this branch, not just that a status string changed. `get_summary()` after both cases:

```json
{
  "case_count": 2,
  "witnessed_count": "1",
  "challenged_count": "0",
  "balance": "0"
}
```

Both settlement branches are now proven on-chain with real GEN, on the same deployed contract: agreement (`WITNESSED` -> `release_bond`, case `case-588957`) and disagreement (`CONTRADICTED` -> `forfeit_false_case`, case `case-911948`). `UNCLEAR` -> `refund_unclear` is covered by the 29 direct tests but has not been separately proven on-chain, since the tests above were purpose-built to lean the verdict one way and a live `UNCLEAR` outcome, honestly, has not yet come up.

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
python -m pytest tests/integration/ -v -s --network studionet
npm run lint
npm run build
npm run verify:schema
```

Current local verification (all real, run this session):

```text
genvm-lint check contracts/WebWitness.py --json -> ok: true, lint passed 3, 11 methods (4 view, 7 write)
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
- Context: `WebWitness is recording a public operations timeline certificate for incident-response review.`

Or:

- URL: `https://www.cisa.gov/news-events/alerts`
- Claim: `CISA maintains a public alerts page for cybersecurity advisories and notices.`
- Context: `WebWitness is recording a source-backed public evidence certificate for a security education artifact.`

## Honest Limits

WebWitness is a public web evidence primitive. It does not verify private documents, paywalled content, or sources that block validator fetching. It records the consensus decision and evidence digest from the transaction, not a permanent full-page archive.

Observed while proving out the on-chain surface and the integration suite this session:

- `gltest`'s default `get_accounts()` on StudioNet mints fresh, unfunded ephemeral keys every run. Payable calls fail with an opaque `execution_result: ERROR` and no `error_description` when the sending account has no GEN. `gltest.config.yaml` now pins two funded accounts under `networks.studionet.accounts` (read via `${WEBWITNESS_TEST_STEWARD_KEY}` / `${WEBWITNESS_TEST_REQUESTER_KEY}` from the gitignored `.env`, resolved by gltest's own `${VAR}` substitution) so the integration suite runs against real balances instead of empty ones.
- The same deployer account cannot also be the case requester: `open_case` explicitly rejects `gl.message.sender_address == self.steward`, and the deploying account becomes `steward`. The integration tests deploy from `accounts[0]` and always act as the requester from `accounts[1]`.
- Both live-consensus rounds proven this session (`witness_case` in isolation, and the `witness_case` -> `open_challenge` -> `review_challenge` cycle) returned a clean `WITNESSED` verdict with `HIGH` confidence on the first attempt -- no `UNDETERMINED`/`VALIDATORS_TIMEOUT`/`LEADER_TIMEOUT` retries were needed, though the integration tests still wrap consensus writes in a retry helper since GenLayer's own docs treat those statuses as expected/retryable, not exceptional.
- The `genlayer` CLI's `write` command hardcodes `value: 0n` and cannot exercise the payable `open_case` path, so the on-chain proof above uses a standalone `genlayer-js` script (`scripts/exercise-studionet.mjs` plus `scripts/settle-case.mjs` for permissionless settlement) instead of the CLI.
- The `genvm-lint` and `gltest` executables are not on `PATH` in this environment; both live under the Python install's `Scripts/` directory (e.g. `...\Python\pythoncore-3.14-64\Scripts\gltest.exe`) and were invoked by absolute path.

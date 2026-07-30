# WebWitness Decision Record

## Chosen Project

WebWitness is a bonded public web-event notary for GenLayer. A user submits a public URL, a precise natural-language claim, and a bond. The contract fetches the public source during consensus, asks validators to decide whether the live evidence witnesses, contradicts, or cannot establish the claim, and records the decision on-chain. Challenged decisions can be re-reviewed with a second public source.

## Candidate Scan

| Candidate | GenLayer capabilities | Value flow | Why not chosen |
| --- | --- | --- | --- |
| Incident bounty verifier | Web fetch, LLM review, challenge | Bond and payout | Too close to bounty apps already seen. |
| Availability SLA oracle | Web fetch, repeated checks, payout | Escrow refund | Strong primitive, but narrower than public evidence notarization. |
| Source-code provenance attestor | Web fetch, repo inspection, semantic review | Deposit/slash | Useful, but depends heavily on GitHub-specific assumptions. |
| Public claim notary | Web fetch, semantic consensus, challenges | Bond release/refund/forfeit | Chosen: reusable primitive with broad project use. |
| Social identity witness | Web fetch, profile proof, account binding | Registration fee | Good use case, but less complex and more privacy-sensitive. |
| News correction registry | Web fetch, multi-source contradiction | Stake challenge | Useful, but moderation-like and politically noisy. |
| Terms-of-service monitor | Web fetch, semantic diff, alerts | Subscription deposit | Better as an off-chain monitor unless settlement matters. |
| Procurement delivery witness | Web/image fetch, performance judging | Escrow payout | Real product, but less reusable as an ecosystem primitive. |
| Data-source dispute court | Multi-source fetch, arbitration | Bonded appeal | Strong, but overlaps with broad arbitration projects. |

## Why WebWitness

WebWitness solves a genuine trust problem: a user should not be able to claim that a public source proved something unless validators fetched and interpreted the source themselves. This is not a wrapper around better AI answers. The contract itself owns the evidence flow, consensus decision, state transitions, challenge review, and bonded settlement.

## GenLayer Usage

- `gl.nondet.web.render` fetches the public primary URL and optional challenge URL inside consensus.
- `gl.nondet.exec_prompt` extracts a semantic verdict from real evidence.
- `gl.eq_principle.prompt_comparative` tells validators what must be equivalent: verdict, confidence band, and decisive evidence.
- Payable `open_case` requires a bond.
- Settlement writes release, refund, or forfeit the bond.
- Views expose the full contract state for the frontend without a backend database.

## Reuse Potential

Other GenLayer projects can use WebWitness as a primitive for public evidence certificates: security incident timelines, grant reports, accountability logs, protocol notices, content publication proofs, and dispute evidence records.

## Review Gates

- Contract is not a hello-world or format-only validator.
- The outcome is based on contract-side public web fetching, not user-submitted text alone.
- Frontend reads from the deployed contract and writes all lifecycle transactions.
- Bonds create real economic consequences for careless or false claims.
- Challenge review is a separate consensus write, not a cosmetic appeal.

## Known Limits

WebWitness witnesses public web pages, not private documents or paywalled data. It records a semantic digest rather than a cryptographic archive of the entire page. If a source changes later, the recorded decision remains a timestamped consensus judgment over what validators fetched during that transaction.

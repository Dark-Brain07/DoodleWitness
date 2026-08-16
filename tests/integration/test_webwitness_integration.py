"""StudioNet integration tests for DoodleWitness.

Run with:
    python -m pytest tests/integration/ -v -s --network studionet

These exercise the real deployed-contract lifecycle against StudioNet: deploy, a real payable
open_case, a rejected zero-bond case, a real witness_case consensus round (live web fetch +
LLM judgment), and a real open_challenge/review_challenge cycle. witness_case and
review_challenge genuinely trigger live consensus rounds on StudioNet, so those tests are
slower and tolerate the documented retryable statuses (UNDETERMINED / VALIDATORS_TIMEOUT /
LEADER_TIMEOUT) by retrying rather than failing outright.

Note on the installed gltest API (genlayer-test): contract methods return a `ContractFunction`
object, not a result directly. Reads are performed with `.call()`; writes are performed with
`.transact(value=...)`, which returns the transaction receipt. To send from a specific account,
`.connect(account)` returns a new Contract bound to that signer.
"""

import time

from gltest import get_contract_factory, get_accounts
from gltest.assertions import tx_execution_succeeded, tx_execution_failed

GEN = 10**18


def _retryable(fn, attempts=3, delay_seconds=8):
    last_exc = None
    for _ in range(attempts):
        try:
            return fn()
        except Exception as exc:  # noqa: BLE001 - deliberately broad for retry classification
            message = str(exc)
            if any(status in message for status in ("UNDETERMINED", "VALIDATORS_TIMEOUT", "LEADER_TIMEOUT")):
                last_exc = exc
                time.sleep(delay_seconds)
                continue
            raise
    raise last_exc


def _deploy():
    """Deploy from accounts[0] (the steward). Requester actions must use a different
    account -- the contract forbids the steward from opening its own case."""
    accounts = get_accounts()
    factory = get_contract_factory("DoodleWitness")
    return factory.deploy(args=[], account=accounts[0])


def _open_case(as_requester, case_id, value_gen=1):
    receipt = as_requester.open_case(
        args=[
            case_id,
            "https://www.openwall.com/lists/oss-security/2024/03/29/4",
            "The public oss-security disclosure states that a backdoor was discovered in XZ Utils release artifacts in March 2024.",
            "Integration test recording a public evidence certificate for a security timeline artifact.",
        ]
    ).transact(value=value_gen * GEN)
    assert tx_execution_succeeded(receipt), receipt.get("consensus_data")
    return receipt


def test_deploy_succeeds():
    contract = _deploy()
    summary = contract.get_summary().call()
    assert summary["case_count"] == 0
    assert summary["witnessed_count"] == "0"


def test_open_case_payable_succeeds():
    accounts = get_accounts()
    requester = accounts[1]
    contract = _deploy().connect(requester)
    _open_case(contract, "case-int-open", value_gen=1)
    case = contract.get_case(args=["case-int-open"]).call()
    assert case["status"] == "OPEN"
    assert case["bond"] == str(1 * GEN)
    summary = contract.get_summary().call()
    assert summary["case_count"] == 1


def test_open_case_rejects_zero_bond():
    accounts = get_accounts()
    requester = accounts[1]
    contract = _deploy().connect(requester)
    receipt = contract.open_case(
        args=[
            "case-int-zero",
            "https://www.openwall.com/lists/oss-security/2024/03/29/4",
            "The public oss-security disclosure states that a backdoor was discovered in XZ Utils release artifacts in March 2024.",
            "Integration test attempting to open a case without a bond, which the contract must reject.",
        ]
    ).transact(value=0)
    assert tx_execution_failed(receipt), receipt.get("consensus_data")


def test_witness_case_live_consensus():
    accounts = get_accounts()
    requester = accounts[1]
    contract = _deploy().connect(requester)
    _open_case(contract, "case-int-witness", value_gen=1)

    def _witness():
        receipt = contract.witness_case(args=["case-int-witness"]).transact()
        assert tx_execution_succeeded(receipt), receipt.get("consensus_data")
        return receipt

    _retryable(_witness)
    case = contract.get_case(args=["case-int-witness"]).call()
    assert case["status"] in ("WITNESSED", "CONTRADICTED", "UNCLEAR")
    assert case["verdict"] in ("WITNESSED", "CONTRADICTED", "UNCLEAR")
    print(f"\nwitness_case verdict: {case['verdict']} ({case['confidence_band']})")
    print(f"rationale: {case['rationale']}")


def test_challenge_and_review_live_consensus():
    accounts = get_accounts()
    requester = accounts[1]
    contract = _deploy().connect(requester)
    _open_case(contract, "case-int-challenge", value_gen=1)

    def _witness():
        receipt = contract.witness_case(args=["case-int-challenge"]).transact()
        assert tx_execution_succeeded(receipt), receipt.get("consensus_data")
        return receipt

    _retryable(_witness)
    case = contract.get_case(args=["case-int-challenge"]).call()
    assert case["status"] in ("WITNESSED", "CONTRADICTED", "UNCLEAR")

    challenge_receipt = contract.open_challenge(
        args=[
            "case-int-challenge",
            "https://research.swtch.com/xz-script",
            "This additional public analysis explains the build-script and social-engineering dimensions of the XZ incident, giving validators a second source before settlement.",
        ]
    ).transact()
    assert tx_execution_succeeded(challenge_receipt), challenge_receipt.get("consensus_data")

    case = contract.get_case(args=["case-int-challenge"]).call()
    assert case["status"] == "CHALLENGED"

    def _review():
        receipt = contract.review_challenge(args=["case-int-challenge"]).transact()
        assert tx_execution_succeeded(receipt), receipt.get("consensus_data")
        return receipt

    _retryable(_review)
    case = contract.get_case(args=["case-int-challenge"]).call()
    assert case["status"] in ("WITNESSED", "CONTRADICTED", "UNCLEAR")
    print(f"\nreview_challenge verdict: {case['verdict']} ({case['confidence_band']})")
    print(f"evidence_summary: {case['evidence_summary']}")

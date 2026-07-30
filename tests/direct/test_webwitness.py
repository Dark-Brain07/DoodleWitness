GEN = 10**18


def open_case(contract, direct_vm, requester, case_id="case-alpha", value=GEN):
    direct_vm.sender = requester
    direct_vm.value = value
    contract.open_case(
        case_id,
        "https://example.com/evidence",
        "The public advisory states that a supply-chain backdoor was disclosed in the referenced open-source project.",
        "The requester needs a bonded witness certificate for a public incident timeline and maintainer training record.",
    )
    direct_vm.value = 0
    return case_id


def mock_witness(direct_vm, verdict="WITNESSED", confidence="HIGH"):
    direct_vm.mock_web(r".*example\.com/evidence.*", {"status": 200, "body": "public advisory disclosed supply-chain backdoor"})
    direct_vm.mock_web(r".*example\.com/challenge.*", {"status": 200, "body": "additional public analysis confirms the disclosure"})
    direct_vm.mock_llm(
        r".*WebWitness, an evidence notary.*",
        f'{{"verdict":"{verdict}","confidence_band":"{confidence}","snapshot_digest":"advisory:backdoor","evidence_summary":"The page supports the claim.","rationale":"The cited source describes the disclosure."}}',
    )


def test_open_case_requires_bond(contract, direct_vm, direct_alice):
    direct_vm.sender = direct_alice
    direct_vm.value = 0
    with direct_vm.expect_revert("witness bond"):
        contract.open_case("case-alpha", "https://example.com/evidence", "x" * 40, "y" * 40)


def test_open_case_records_case(contract, direct_vm, direct_alice):
    cid = open_case(contract, direct_vm, direct_alice, value=2 * GEN)
    item = contract.get_case(cid)
    assert item["status"] == "OPEN"
    assert item["bond"] == str(2 * GEN)
    assert contract.get_summary()["case_count"] == 1


def test_open_case_rejects_duplicate(contract, direct_vm, direct_alice):
    open_case(contract, direct_vm, direct_alice)
    direct_vm.sender = direct_alice
    direct_vm.value = GEN
    with direct_vm.expect_revert("already exists"):
        contract.open_case("case-alpha", "https://example.com/evidence", "x" * 40, "y" * 40)


def test_open_case_rejects_short_claim(contract, direct_vm, direct_alice):
    direct_vm.sender = direct_alice
    direct_vm.value = GEN
    with direct_vm.expect_revert("claim"):
        contract.open_case("case-alpha", "https://example.com/evidence", "too short", "y" * 40)


def test_steward_cannot_open_requester_case(contract, direct_vm):
    direct_vm.sender = contract.steward
    direct_vm.value = GEN
    with direct_vm.expect_revert("Steward cannot open"):
        contract.open_case(
            "case-alpha",
            "https://example.com/evidence",
            "The public advisory states that a supply-chain backdoor was disclosed in the referenced open-source project.",
            "The requester needs a bonded witness certificate for a public incident timeline and maintainer training record.",
        )
    direct_vm.value = 0


def test_profile_records_opened_case(contract, direct_vm, direct_alice):
    open_case(contract, direct_vm, direct_alice, value=3 * GEN)
    profile = contract.get_profile(direct_alice)
    assert profile["case_count"] == "1"
    assert profile["bond_total"] == str(3 * GEN)
    assert profile["submitted_cases"][0]["id"] == "case-alpha"


def test_list_cases_paginates(contract, direct_vm, direct_alice):
    first = open_case(contract, direct_vm, direct_alice, "case-alpha")
    second = open_case(contract, direct_vm, direct_alice, "case-beta")
    assert contract.list_cases(0, 1)[0]["id"] == first
    assert contract.list_cases(1, 1)[0]["id"] == second


def test_witness_sets_witnessed(contract, direct_vm, direct_alice):
    cid = open_case(contract, direct_vm, direct_alice)
    mock_witness(direct_vm, "WITNESSED", "HIGH")
    contract.witness_case(cid)
    item = contract.get_case(cid)
    assert item["status"] == "WITNESSED"
    assert item["verdict"] == "WITNESSED"


def test_witness_sets_contradicted(contract, direct_vm, direct_alice):
    cid = open_case(contract, direct_vm, direct_alice)
    mock_witness(direct_vm, "CONTRADICTED", "LOW")
    contract.witness_case(cid)
    assert contract.get_case(cid)["status"] == "CONTRADICTED"


def test_witness_sets_unclear(contract, direct_vm, direct_alice):
    cid = open_case(contract, direct_vm, direct_alice)
    mock_witness(direct_vm, "UNCLEAR", "UNKNOWN")
    contract.witness_case(cid)
    assert contract.get_case(cid)["status"] == "UNCLEAR"


def test_witness_clamps_bad_verdict(contract, direct_vm, direct_alice):
    cid = open_case(contract, direct_vm, direct_alice)
    mock_witness(direct_vm, "ABSOLUTELY", "HIGH")
    contract.witness_case(cid)
    assert contract.get_case(cid)["status"] == "UNCLEAR"


def test_witness_clamps_bad_confidence(contract, direct_vm, direct_alice):
    cid = open_case(contract, direct_vm, direct_alice)
    mock_witness(direct_vm, "WITNESSED", "CERTAIN")
    contract.witness_case(cid)
    assert contract.get_case(cid)["confidence_band"] == "UNKNOWN"


def test_witness_requires_open_or_unclear(contract, direct_vm, direct_alice):
    cid = open_case(contract, direct_vm, direct_alice)
    mock_witness(direct_vm, "WITNESSED", "HIGH")
    contract.witness_case(cid)
    with direct_vm.expect_revert("not witnessable"):
        contract.witness_case(cid)


def test_open_challenge_records_challenge(contract, direct_vm, direct_alice):
    cid = open_case(contract, direct_vm, direct_alice)
    mock_witness(direct_vm, "WITNESSED", "HIGH")
    contract.witness_case(cid)
    contract.open_challenge(
        cid,
        "https://example.com/challenge",
        "Additional public evidence should be reviewed before settling the witness bond.",
    )
    item = contract.get_case(cid)
    assert item["status"] == "CHALLENGED"
    assert item["challenge_url"] == "https://example.com/challenge"


def test_only_requester_or_steward_can_challenge(contract, direct_vm, direct_alice, direct_bob):
    cid = open_case(contract, direct_vm, direct_alice)
    mock_witness(direct_vm, "WITNESSED", "HIGH")
    contract.witness_case(cid)
    direct_vm.sender = direct_bob
    with direct_vm.expect_revert("requester or steward"):
        contract.open_challenge(
            cid,
            "https://example.com/challenge",
            "Additional public evidence should be reviewed before settling the witness bond.",
        )


def test_review_challenge_requires_challenged(contract, direct_vm, direct_alice):
    cid = open_case(contract, direct_vm, direct_alice)
    with direct_vm.expect_revert("not reviewable"):
        contract.review_challenge(cid)


def test_review_challenge_updates_status(contract, direct_vm, direct_alice):
    cid = open_case(contract, direct_vm, direct_alice)
    mock_witness(direct_vm, "CONTRADICTED", "LOW")
    contract.witness_case(cid)
    contract.open_challenge(
        cid,
        "https://example.com/challenge",
        "Additional public evidence should be reviewed before settling the witness bond.",
    )
    contract.review_challenge(cid)
    assert contract.get_case(cid)["status"] == "CONTRADICTED"


def test_review_challenge_does_not_double_count_witnessed(contract, direct_vm, direct_alice):
    cid = open_case(contract, direct_vm, direct_alice)
    mock_witness(direct_vm, "WITNESSED", "HIGH")
    contract.witness_case(cid)
    contract.open_challenge(
        cid,
        "https://example.com/challenge",
        "Additional public evidence should be reviewed before settling the witness bond.",
    )
    contract.review_challenge(cid)
    profile = contract.get_profile(direct_alice)
    assert profile["witnessed_count"] == "1"


def test_release_requires_witnessed(contract, direct_vm, direct_alice):
    cid = open_case(contract, direct_vm, direct_alice)
    direct_vm.sender = contract.steward
    with direct_vm.expect_revert("not witnessed"):
        contract.release_bond(cid)


def test_requester_can_release_witnessed_bond_to_self(contract, direct_vm, direct_alice):
    cid = open_case(contract, direct_vm, direct_alice, value=2 * GEN)
    mock_witness(direct_vm, "WITNESSED", "HIGH")
    contract.witness_case(cid)
    direct_vm.sender = direct_alice
    contract.release_bond(cid)
    item = contract.get_case(cid)
    assert item["status"] == "RELEASED"
    assert item["released_to"] == str(direct_alice)


def test_release_bond_returns_to_requester(contract, direct_vm, direct_alice):
    cid = open_case(contract, direct_vm, direct_alice, value=2 * GEN)
    mock_witness(direct_vm, "WITNESSED", "HIGH")
    contract.witness_case(cid)
    direct_vm.sender = contract.steward
    contract.release_bond(cid)
    item = contract.get_case(cid)
    assert item["status"] == "RELEASED"
    assert item["bond"] == "0"
    assert item["released_to"] == str(direct_alice)


def test_refund_requires_unclear(contract, direct_vm, direct_alice):
    cid = open_case(contract, direct_vm, direct_alice)
    direct_vm.sender = contract.steward
    with direct_vm.expect_revert("not unclear"):
        contract.refund_unclear(cid)


def test_requester_can_refund_unclear_bond_to_self(contract, direct_vm, direct_alice):
    cid = open_case(contract, direct_vm, direct_alice, value=2 * GEN)
    mock_witness(direct_vm, "UNCLEAR", "UNKNOWN")
    contract.witness_case(cid)
    direct_vm.sender = direct_alice
    contract.refund_unclear(cid)
    item = contract.get_case(cid)
    assert item["status"] == "REFUNDED"
    assert item["released_to"] == str(direct_alice)


def test_refund_unclear_returns_to_requester(contract, direct_vm, direct_alice):
    cid = open_case(contract, direct_vm, direct_alice, value=2 * GEN)
    mock_witness(direct_vm, "UNCLEAR", "UNKNOWN")
    contract.witness_case(cid)
    direct_vm.sender = contract.steward
    contract.refund_unclear(cid)
    assert contract.get_case(cid)["status"] == "REFUNDED"


def test_anyone_can_trigger_false_case_forfeit_to_steward(contract, direct_vm, direct_alice, direct_bob):
    cid = open_case(contract, direct_vm, direct_alice)
    mock_witness(direct_vm, "CONTRADICTED", "LOW")
    contract.witness_case(cid)
    direct_vm.sender = direct_bob
    contract.forfeit_false_case(cid)
    item = contract.get_case(cid)
    assert item["status"] == "FORFEITED"
    assert item["released_to"] == str(contract.steward)


def test_forfeit_false_case(contract, direct_vm, direct_alice):
    cid = open_case(contract, direct_vm, direct_alice)
    mock_witness(direct_vm, "CONTRADICTED", "LOW")
    contract.witness_case(cid)
    direct_vm.sender = contract.steward
    contract.forfeit_false_case(cid)
    assert contract.get_case(cid)["status"] == "FORFEITED"


def test_profile_tracks_witnessed_and_released(contract, direct_vm, direct_alice):
    cid = open_case(contract, direct_vm, direct_alice, value=2 * GEN)
    mock_witness(direct_vm, "WITNESSED", "HIGH")
    contract.witness_case(cid)
    direct_vm.sender = contract.steward
    contract.release_bond(cid)
    profile = contract.get_profile(direct_alice)
    assert profile["witnessed_count"] == "1"
    assert profile["released_total"] == str(2 * GEN)
    assert profile["submitted_cases"][0]["id"] == cid
    assert profile["submitted_cases"][0]["status"] == "RELEASED"


def test_summary_tracks_statuses(contract, direct_vm, direct_alice):
    cid = open_case(contract, direct_vm, direct_alice)
    mock_witness(direct_vm, "WITNESSED", "HIGH")
    contract.witness_case(cid)
    summary = contract.get_summary()
    assert summary["witnessed_count"] == "1"


def test_missing_case_reverts(contract, direct_vm):
    with direct_vm.expect_revert("does not exist"):
        contract.get_case("missing")

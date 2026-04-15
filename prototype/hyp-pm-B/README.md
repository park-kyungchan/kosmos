# H-B Prototype: Snapshot-based + StaleObject Optimistic Concurrency

## Summary

This PoC empirically validates the simulator's defeat of Hypothesis B.

## Architecture

H-B uses a single `state.json` per project with a `version` field. Writers
read the current version, check it matches their expected version, then write
an updated snapshot. This is the Palantir StaleObject pattern applied to a
filesystem state file.

## Empirical Results

### Happy path (Tests 1-2): PASS
Round-trip read/write and sequential in-place updates work correctly.

### StaleObject detection (Test 3): PASS
When Writer A and Writer B both read version 1, Writer A commits first,
and Writer B correctly receives `StaleObjectError` (expected=1, actual=2).

### No lineage (Test 4): PASS — WEAKNESS CONFIRMED
After v1 -> v2 -> v3, the data at v1 and v2 is irrecoverably LOST from disk.
H-B has no append-only log. BackwardProp and drift detection are impossible.

### Adversarial 2-writer race (Test 5): PASS — WEAKNESS CONFIRMED
Two OS-level subprocesses racing with 1000 writes each:
- Expected counter: 2000
- Actual counter: ~1600-1977 (varies per run)
- Lost updates: ~23-400 per run (TOCTOU window)
- StaleObjectErrors: 12-200 per run

The TOCTOU gap (read version -> check -> write) allows concurrent writers
to both pass the version check before either commits, producing silent
overwrite — updates are lost without any error. H-A (atomic JSONL append)
has zero such losses.

## Empirical Verdict

H-B is architecturally defeated: the snapshot model has an unresolvable TOCTOU
window that causes silent update loss under concurrent writers, and the absence
of an append-only log means lineage, BackwardProp, and drift detection are
structurally unavailable. The simulator's verdict (avg 2.88 vs H-A 3.64) is confirmed.

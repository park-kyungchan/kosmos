// H-B Eval Suite — eval-runner T9
// 5 additional test cases covering: DATA schema, LOGIC derivation, ACTION conflict, LEARN lineage gap
// These complement the 5 existing tests in snapshot.test.ts
// Failure mode classification: DATA / LOGIC / ACTION / LEARN

import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import { mkdirSync, rmSync, existsSync, readFileSync } from "fs";
import { join } from "path";
import { readSnapshot } from "../lib/snapshot/read";
import { writeSnapshot } from "../lib/snapshot/write";
import { StaleObjectError } from "../lib/snapshot/types";
import type { Snapshot } from "../lib/snapshot/types";

const TMP_DIR = "/tmp/hyp-pm-B-eval-test";

beforeEach(() => {
  mkdirSync(TMP_DIR, { recursive: true });
});

afterEach(() => {
  rmSync(TMP_DIR, { recursive: true, force: true });
});

// ─────────────────────────────────────────────────────────────────────────────
// Eval Case B1 (deterministic): Snapshot schema field invariants
// Domain: DATA — version, lastModified, data fields must be populated correctly
//   on initial write (expectedVersion=0 bootstrap)
// ─────────────────────────────────────────────────────────────────────────────
describe("Eval B1 (deterministic): Snapshot schema field invariants on bootstrap", () => {
  it("writeSnapshot(v0) produces version=1, ISO lastModified, data preserved exactly", () => {
    const p = join(TMP_DIR, "b1.json");
    const data = { key: "value", nested: { count: 99 } };

    const result = writeSnapshot(p, data, 0);

    // DATA domain: schema correctness
    expect(result.version).toBe(1);
    expect(typeof result.lastModified).toBe("string");
    // lastModified must be a valid ISO8601 date
    expect(() => new Date(result.lastModified)).not.toThrow();
    expect(new Date(result.lastModified).toISOString()).toBe(result.lastModified);

    // DATA preserved exactly
    expect(result.data.key).toBe("value");
    expect(result.data.nested.count).toBe(99);

    // On-disk JSON must be parseable and match
    const raw = readFileSync(p, "utf-8");
    const onDisk = JSON.parse(raw) as Snapshot<typeof data>;
    expect(onDisk.version).toBe(1);
    expect(onDisk.data.key).toBe("value");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Eval Case B2 (deterministic): StaleObjectError fields are populated correctly
// Domain: LOGIC — error must carry expectedVersion + actualVersion for caller retry logic
// ─────────────────────────────────────────────────────────────────────────────
describe("Eval B2 (deterministic): StaleObjectError carries correct version metadata", () => {
  it("StaleObjectError.expectedVersion and actualVersion match the conflict state", () => {
    const p = join(TMP_DIR, "b2.json");

    writeSnapshot(p, { x: 1 }, 0); // disk is now v1
    writeSnapshot(p, { x: 2 }, 1); // disk is now v2

    // Caller with stale v1 reference tries to write
    let caught: StaleObjectError | null = null;
    try {
      writeSnapshot(p, { x: 99 }, 1); // expects v1, disk is v2
    } catch (err) {
      caught = err as StaleObjectError;
    }

    expect(caught).not.toBeNull();
    expect(caught instanceof StaleObjectError).toBe(true);
    expect(caught!.expectedVersion).toBe(1);
    expect(caught!.actualVersion).toBe(2);
    expect(caught!.name).toBe("StaleObjectError");
    expect(caught!.message).toContain("expected version 1");
    expect(caught!.message).toContain("version 2");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Eval Case B3 (integration): read-modify-write seam — single-writer sequential correctness
// Domain: LOGIC + ACTION — without concurrency, a read-modify-write loop must be correct
//   (this is the best case for H-B; failures under concurrency are exposed in B4/Test5)
// ─────────────────────────────────────────────────────────────────────────────
describe("Eval B3 (integration): sequential read-modify-write is correct (single writer)", () => {
  it("10 sequential increments via read-modify-write produce counter=10", () => {
    const p = join(TMP_DIR, "b3.json");
    writeSnapshot(p, { counter: 0 }, 0);

    for (let i = 0; i < 10; i++) {
      const snap = readSnapshot<{ counter: number }>(p);
      writeSnapshot(p, { counter: snap.data.counter + 1 }, snap.version);
    }

    const final = readSnapshot<{ counter: number }>(p);
    expect(final.version).toBe(11);
    expect(final.data.counter).toBe(10);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Eval Case B4 (heuristic): no-retry on StaleObjectError — writes silently lost
// Domain: ACTION — H-B exposes that StaleObjectError is detected but callers have
//   no built-in retry. The write is permanently lost unless the application layer retries.
//   This is an ACTION-domain failure: writes that should have committed are dropped.
// ─────────────────────────────────────────────────────────────────────────────
describe("Eval B4 (heuristic): StaleObjectError is thrown but writes are silently discarded without retry", () => {
  it("a losing writer's data is irrecoverably lost if the caller does not retry", () => {
    const p = join(TMP_DIR, "b4.json");

    writeSnapshot(p, { counter: 0 }, 0); // disk v1

    // Both writers capture the same snapshot (v1)
    const readerA = readSnapshot<{ counter: number }>(p);
    const readerB = readSnapshot<{ counter: number }>(p);

    // Writer A commits — disk is now v2
    writeSnapshot(p, { counter: readerA.data.counter + 100 }, readerA.version);

    // Writer B's write fails (stale) — update +200 is PERMANENTLY LOST
    let staleThrown = false;
    try {
      writeSnapshot(p, { counter: readerB.data.counter + 200 }, readerB.version);
    } catch (e) {
      if (e instanceof StaleObjectError) staleThrown = true;
    }

    expect(staleThrown).toBe(true);

    const final = readSnapshot<{ counter: number }>(p);
    // Only Writer A's +100 survived — Writer B's +200 is gone with no trace
    expect(final.data.counter).toBe(100);
    // Counter should be 300 if both writes committed — it is 100 (200 lost)
    expect(final.data.counter).not.toBe(300);
    // The lost write (+200) leaves NO lineage record — LEARN domain cannot reconstruct it
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Eval Case B5 (heuristic): LEARN lineage gap — prior versions are irrecoverable
// Domain: LEARN — H-B has NO append-only record. History is destroyed by each write.
//   BackwardProp from H-B snapshots to ontology is structurally impossible: there is
//   no event log to replay, no sequence counter, no causality chain.
// ─────────────────────────────────────────────────────────────────────────────
describe("Eval B5 (heuristic): LEARN domain failure — version history is irreversible destroyed", () => {
  it("after v1->v2->v3 overwrites, prior state cannot be recovered from disk", () => {
    const p = join(TMP_DIR, "b5.json");

    const STATES = ["initial", "after-edit-1", "after-edit-2"];

    writeSnapshot(p, { state: STATES[0] }, 0);
    const v1 = readSnapshot<{ state: string }>(p);
    writeSnapshot(p, { state: STATES[1] }, v1.version);
    const v2 = readSnapshot<{ state: string }>(p);
    writeSnapshot(p, { state: STATES[2] }, v2.version);

    // Only v3 exists on disk
    const onDisk = readSnapshot<{ state: string }>(p);
    expect(onDisk.version).toBe(3);
    expect(onDisk.data.state).toBe("after-edit-2");

    // There is no file, no log, no sidecar that preserves v1 or v2
    // An H-A append-only log would have 3 lines: initial, after-edit-1, after-edit-2
    // H-B has exactly 1 line — the current snapshot
    const raw = readFileSync(p, "utf-8");
    // The raw file must NOT contain v1 or v2 state values
    expect(raw).not.toContain(STATES[0]); // "initial" is gone
    expect(raw).not.toContain(STATES[1]); // "after-edit-1" is gone
    expect(raw).toContain(STATES[2]);     // only "after-edit-2" survives

    // LEARN domain verdict: BackwardProp from H-B snapshots to ontology is broken.
    // prim-learn-01 (AppendOnlyEventLog) requires full causal history — H-B provides none.
  });
});

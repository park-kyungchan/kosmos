import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import { mkdirSync, rmSync, existsSync, writeFileSync } from "fs";
import { join } from "path";
import { readSnapshot } from "../lib/snapshot/read";
import { writeSnapshot } from "../lib/snapshot/write";
import { StaleObjectError } from "../lib/snapshot/types";

const TMP_DIR = "/tmp/hyp-pm-B-test";

beforeEach(() => {
  mkdirSync(TMP_DIR, { recursive: true });
});

afterEach(() => {
  rmSync(TMP_DIR, { recursive: true, force: true });
});

// ─────────────────────────────────────────────────────────────────────────────
// Test 1: round-trip — write snapshot v1, read v1, verify content + version
// ─────────────────────────────────────────────────────────────────────────────
describe("Test 1 — round-trip", () => {
  it("writes v1 and reads back with correct content and version", () => {
    const path = join(TMP_DIR, "rt.json");
    const data = { counter: 42, label: "hello" };

    const written = writeSnapshot(path, data, 0);
    expect(written.version).toBe(1);

    const snap = readSnapshot<typeof data>(path);
    expect(snap.version).toBe(1);
    expect(snap.data.counter).toBe(42);
    expect(snap.data.label).toBe("hello");
    expect(typeof snap.lastModified).toBe("string");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Test 2: in-place update — write v1, read v1, modify, write v2 with expectedVersion=1
// ─────────────────────────────────────────────────────────────────────────────
describe("Test 2 — in-place update", () => {
  it("updates snapshot from v1 to v2 when expectedVersion matches", () => {
    const path = join(TMP_DIR, "update.json");

    writeSnapshot(path, { counter: 1 }, 0);
    const v1 = readSnapshot<{ counter: number }>(path);
    expect(v1.version).toBe(1);

    const v2 = writeSnapshot(path, { counter: 2 }, v1.version);
    expect(v2.version).toBe(2);
    expect(v2.data.counter).toBe(2);

    const onDisk = readSnapshot<{ counter: number }>(path);
    expect(onDisk.version).toBe(2);
    expect(onDisk.data.counter).toBe(2);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Test 3: StaleObject detection — two writers, one loses
// ─────────────────────────────────────────────────────────────────────────────
describe("Test 3 — StaleObject detection", () => {
  it("throws StaleObjectError when a concurrent writer has already committed", () => {
    const path = join(TMP_DIR, "stale.json");

    // Initial write
    writeSnapshot(path, { counter: 0 }, 0);

    // Writer A reads v1
    const snapA = readSnapshot<{ counter: number }>(path);
    // Writer B reads v1
    const snapB = readSnapshot<{ counter: number }>(path);

    expect(snapA.version).toBe(1);
    expect(snapB.version).toBe(1);

    // Writer A commits — disk is now v2
    writeSnapshot(path, { counter: snapA.data.counter + 1 }, snapA.version);

    // Writer B tries to commit with expectedVersion=1 (stale) → should throw
    expect(() => {
      writeSnapshot(path, { counter: snapB.data.counter + 1 }, snapB.version);
    }).toThrow(StaleObjectError);

    // Verify final state is Writer A's commit (counter=1, not counter=1 from B)
    const final = readSnapshot<{ counter: number }>(path);
    expect(final.version).toBe(2);
    expect(final.data.counter).toBe(1);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Test 4: no lineage — H-B loses history on overwrite
// ─────────────────────────────────────────────────────────────────────────────
describe("Test 4 — no lineage (H-B weakness)", () => {
  it("confirms that v1 and v2 data are LOST after v1->v2->v3 overwrites", () => {
    const path = join(TMP_DIR, "lineage.json");

    // Write v1, v2, v3 sequentially
    writeSnapshot(path, { value: "state-at-v1" }, 0);
    const v1 = readSnapshot<{ value: string }>(path);
    writeSnapshot(path, { value: "state-at-v2" }, v1.version);
    const v2 = readSnapshot<{ value: string }>(path);
    writeSnapshot(path, { value: "state-at-v3" }, v2.version);

    // Only v3 survives on disk
    const onDisk = readSnapshot<{ value: string }>(path);
    expect(onDisk.version).toBe(3);
    expect(onDisk.data.value).toBe("state-at-v3");

    // V1 and V2 states are irrecoverably LOST — no append-only log exists
    // An append-only log (H-A) would have: v1-entry, v2-entry, v3-entry all readable
    // H-B has only the current snapshot — BackwardProp is broken by design
    const historyEntries = [v1.data.value, v2.data.value]; // only preserved in memory — NOT on disk
    expect(historyEntries.includes("state-at-v1")).toBe(true); // was in memory
    expect(historyEntries.includes("state-at-v2")).toBe(true); // was in memory
    // But neither can be recovered from the file — empirical evidence of lineage loss
    expect(onDisk.data.value).not.toBe("state-at-v1");
    expect(onDisk.data.value).not.toBe("state-at-v2");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Test 5: CRITICAL — adversarial 2-writer race
// 2 true OS-level concurrent subprocesses, 1000 updates each, measuring lost updates.
// Uses Bun.spawn to get real parallelism — JavaScript Promise.all is single-threaded
// and would not expose the TOCTOU window in writeSnapshot's read-check-write sequence.
// ─────────────────────────────────────────────────────────────────────────────
describe("Test 5 — adversarial 2-writer race (CRITICAL)", () => {
  it("measures lost updates from true concurrent OS processes — confirms H-B defeat", async () => {
    const path = join(TMP_DIR, "race.json");
    const UPDATES_PER_WRITER = 1000;
    const TOTAL_EXPECTED = UPDATES_PER_WRITER * 2;
    const WORKER_PATH = "/home/palantirkc/kosmos/prototype/hyp-pm-B/lib/snapshot/race-worker.ts";

    // Initialize snapshot at v0 with counter=0
    writeSnapshot(path, { counter: 0 }, 0);

    // Spawn 2 true OS-level subprocesses that race against each other
    const spawnWriter = () =>
      Bun.spawn(
        ["bun", "run", WORKER_PATH, path, String(UPDATES_PER_WRITER)],
        { stdout: "pipe", stderr: "pipe" }
      );

    const [w1, w2] = [spawnWriter(), spawnWriter()];

    // Wait for both to complete
    const [exit1, exit2] = await Promise.all([w1.exited, w2.exited]);
    expect(exit1).toBe(0);
    expect(exit2).toBe(0);

    const out1 = await new Response(w1.stdout).text();
    const out2 = await new Response(w2.stdout).text();

    const r1 = JSON.parse(out1.trim()) as { successfulWrites: number; staleErrors: number };
    const r2 = JSON.parse(out2.trim()) as { successfulWrites: number; staleErrors: number };

    const workerReportedWrites = r1.successfulWrites + r2.successfulWrites;
    const staleErrors = r1.staleErrors + r2.staleErrors;
    const finalSnap = readSnapshot<{ counter: number }>(path);
    const actualCounter = finalSnap.data.counter;
    // TOCTOU lost updates: two writers can both pass the version-check window simultaneously
    // and then overwrite each other. The winner's write "wins" but both count as "success".
    // True measure of H-B weakness: TOTAL_EXPECTED - actualCounter (not workerReportedWrites)
    const lostUpdates = TOTAL_EXPECTED - actualCounter;

    // Report metrics for eval-results.json
    console.log("=== H-B ADVERSARIAL RACE RESULTS ===");
    console.log(`  Total expected writes        : ${TOTAL_EXPECTED}`);
    console.log(`  Worker-reported writes       : ${workerReportedWrites}`);
    console.log(`  StaleObjectErrors detected   : ${staleErrors}`);
    console.log(`  Final counter (actual)       : ${actualCounter}`);
    console.log(`  Lost updates (2000-counter)  : ${lostUpdates}`);
    console.log(`  Verdict                      : ${lostUpdates > 0 ? "H-B WEAKNESS CONFIRMED" : "H-B surprisingly robust"}`);

    // Test assertions:
    // 1. StaleObjectErrors MUST have been thrown — H-B does detect SOME conflicts
    expect(staleErrors).toBeGreaterThan(0);

    // 2. The TOCTOU window allows concurrent writers to slip through the version check.
    //    Both writers can read version N, both check "N == N" (pass!), one writes N+1,
    //    then the other also writes N+1 — overwriting without throwing StaleObjectError.
    //    The result: actualCounter < TOTAL_EXPECTED even though workers think they succeeded.
    expect(actualCounter).toBeLessThan(TOTAL_EXPECTED);

    // 3. Lost updates are REAL — writes that workers thought succeeded but were silently overwritten
    expect(lostUpdates).toBeGreaterThan(0);

    // 4. H-A contrast: atomic append to JSONL has zero such losses because appends are
    //    serialized by the OS without a read-check-write window. H-B requires a lockfile
    //    (which it explicitly chose NOT to use) to prevent these silent lost updates.
  });
});

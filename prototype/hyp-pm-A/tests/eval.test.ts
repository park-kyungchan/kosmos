// H-A Eval Suite — eval-runner T9
// 5 additional test cases covering: deterministic fold, integration seam, heuristic edge cases
// These complement the 5 existing tests in event-log.test.ts
// Failure mode classification: DATA / LOGIC / ACTION / LEARN

import { test, expect, describe } from "bun:test";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import { appendEventAtomic } from "../lib/event-log/append";
import { readEvents, foldToSnapshot } from "../lib/event-log/read";
import { isEditProposed, isEditCommitted, isSessionStarted } from "../lib/event-log/types";
import type { EventEnvelope } from "../lib/event-log/types";

function tmpPath(label: string): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), `eval-ha-${label}-`));
  return path.join(dir, "events.jsonl");
}

function makeEnvelope(type: "edit_proposed" | "edit_committed" | "session_started", i: number): Omit<EventEnvelope, "sequence"> {
  const base = {
    eventId: `eval-evt-${i}` as any,
    when: new Date().toISOString(),
    atopWhich: "sha-eval" as any,
    throughWhich: { sessionId: `sess-eval` as any, toolName: "eval", cwd: "/tmp" },
    byWhom: { identity: "eval-agent" },
  };
  if (type === "edit_proposed") return { ...base, type, payload: { functionName: "f", params: { i }, hypotheticalEdits: [] } };
  if (type === "edit_committed") return { ...base, type, payload: { actionTypeRid: "rid", appliedEdits: [], submissionCriteriaPassed: [] } };
  return { ...base, type, payload: { model: "claude", effort: "max" } };
}

// ─────────────────────────────────────────────────────────────────────────────
// Eval Case A1 (deterministic): foldToSnapshot on empty log returns zero counters
// Domain: LOGIC — reducer must handle empty input without error
// ─────────────────────────────────────────────────────────────────────────────
describe("Eval A1 (deterministic): foldToSnapshot on empty event list", () => {
  test("empty event array yields all-zero snapshot with lastSequence=0", () => {
    const snapshot = foldToSnapshot([]);
    expect(snapshot.edit_proposed).toBe(0);
    expect(snapshot.edit_committed).toBe(0);
    expect(snapshot.session_started).toBe(0);
    expect(snapshot.totalEvents).toBe(0);
    expect(snapshot.lastSequence).toBe(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Eval Case A2 (deterministic): type guard discriminants are exhaustive and correct
// Domain: DATA — type guards (isEditProposed, isEditCommitted, isSessionStarted) must
//   cover exactly the 3 variants without overlap
// ─────────────────────────────────────────────────────────────────────────────
describe("Eval A2 (deterministic): type guard exhaustiveness", () => {
  test("each variant resolves to exactly one guard, no false positives", async () => {
    const eventsPath = tmpPath("guards");
    await appendEventAtomic(eventsPath, makeEnvelope("edit_proposed", 1));
    await appendEventAtomic(eventsPath, makeEnvelope("edit_committed", 2));
    await appendEventAtomic(eventsPath, makeEnvelope("session_started", 3));

    const events = readEvents(eventsPath);
    expect(events).toHaveLength(3);

    const [ep, ec, ss] = events;

    // Positive guards
    expect(isEditProposed(ep)).toBe(true);
    expect(isEditCommitted(ec)).toBe(true);
    expect(isSessionStarted(ss)).toBe(true);

    // Cross-guards must all return false (no leakage between variants)
    expect(isEditCommitted(ep)).toBe(false);
    expect(isSessionStarted(ep)).toBe(false);
    expect(isEditProposed(ec)).toBe(false);
    expect(isSessionStarted(ec)).toBe(false);
    expect(isEditProposed(ss)).toBe(false);
    expect(isEditCommitted(ss)).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Eval Case A3 (integration): append + readEvents + foldToSnapshot pipeline seam
// Domain: LEARN — full BackwardProp path: ACTION (append) -> DATA (read) -> LOGIC (fold)
//   must round-trip without semantic loss
// ─────────────────────────────────────────────────────────────────────────────
describe("Eval A3 (integration): ACTION->DATA->LOGIC pipeline seam", () => {
  test("appended events round-trip through read->fold with correct aggregates", async () => {
    const eventsPath = tmpPath("pipeline");

    // ACTION layer: 3 session_started, 7 edit_proposed, 4 edit_committed = 14 total
    for (let i = 0; i < 3; i++) await appendEventAtomic(eventsPath, makeEnvelope("session_started", i));
    for (let i = 0; i < 7; i++) await appendEventAtomic(eventsPath, makeEnvelope("edit_proposed", i));
    for (let i = 0; i < 4; i++) await appendEventAtomic(eventsPath, makeEnvelope("edit_committed", i));

    // DATA layer: deserialize NDJSON
    const events = readEvents(eventsPath);
    expect(events).toHaveLength(14);

    // LOGIC layer: fold into snapshot
    const snap = foldToSnapshot(events);
    expect(snap.session_started).toBe(3);
    expect(snap.edit_proposed).toBe(7);
    expect(snap.edit_committed).toBe(4);
    expect(snap.totalEvents).toBe(14);
    expect(snap.lastSequence).toBe(14);

    // Verify sequence coverage — all 1..14 present (no gaps from integration bug)
    const seqs = events.map(e => e.sequence).sort((a, b) => a - b);
    for (let i = 0; i < 14; i++) expect(seqs[i]).toBe(i + 1);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Eval Case A4 (heuristic): non-existent file path returns empty array, not throw
// Domain: DATA — readEvents must gracefully handle missing file (cold-start path)
// ─────────────────────────────────────────────────────────────────────────────
describe("Eval A4 (heuristic): missing file path is idempotent (cold-start)", () => {
  test("readEvents on a non-existent path returns [] without throwing", () => {
    const eventsPath = "/tmp/eval-ha-nonexistent-" + Date.now() + "/events.jsonl";
    // Must not throw — this is the cold-start path for any new session
    let result: EventEnvelope[] = [];
    expect(() => {
      result = readEvents(eventsPath);
    }).not.toThrow();
    expect(result).toHaveLength(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Eval Case A5 (heuristic): lock retry exhaustion — stale lock directory
// Domain: ACTION — if a previous writer crashed without releasing the lock,
//   appendEventAtomic must fail with a clear error rather than deadlock
// ─────────────────────────────────────────────────────────────────────────────
describe("Eval A5 (heuristic): stale lock directory causes retry exhaustion", () => {
  test("appendEventAtomic throws after MAX_RETRIES when lock dir is orphaned", async () => {
    const eventsPath = tmpPath("stalelock");
    const lockDir = eventsPath + ".lock";

    // Simulate a crashed writer by leaving the lock directory in place
    fs.mkdirSync(lockDir, { recursive: true });

    // appendEventAtomic must fail (not hang forever) — retry limit enforced
    let threw = false;
    try {
      await appendEventAtomic(eventsPath, makeEnvelope("session_started", 0));
    } catch (err: unknown) {
      threw = true;
      const msg = (err as Error).message;
      // Must cite the retry limit — confirms MAX_RETRIES path is reachable
      expect(msg).toContain("appendEventAtomic");
      expect(msg).toContain("lock");
    }
    expect(threw).toBe(true);

    // Cleanup
    fs.rmdirSync(lockDir);
  }, 30000); // up to 30s for backoff retries (MAX_RETRIES=20, MAX_DELAY=200ms)
});

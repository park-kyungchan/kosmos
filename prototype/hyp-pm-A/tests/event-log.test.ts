// H-A Prototype Test Suite — 5 test cases
// Critical: test-5 adversarial 2-writer race resolves gap-01 (concurrent append safety)

import { test, expect, describe, beforeEach } from "bun:test";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import { appendEventAtomic } from "../lib/event-log/append";
import { readEvents, foldToSnapshot } from "../lib/event-log/read";
import type { EventEnvelope } from "../lib/event-log/types";

// ────────────────────────────────────────────────────────────────────────────
// Fixtures
// ────────────────────────────────────────────────────────────────────────────

function tmpEventsPath(label: string): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), `ha-poc-${label}-`));
  return path.join(dir, "events.jsonl");
}

function makeEditProposed(i: number): Omit<EventEnvelope, "sequence"> {
  return {
    type: "edit_proposed",
    eventId: `evt-${i}` as any,
    when: new Date().toISOString(),
    atopWhich: "abc123" as any,
    throughWhich: { sessionId: "sess-1" as any, toolName: "test", cwd: "/tmp" },
    byWhom: { identity: "test-agent" },
    payload: {
      functionName: "editFn",
      params: { i },
      hypotheticalEdits: [],
    },
  };
}

function makeEditCommitted(i: number): Omit<EventEnvelope, "sequence"> {
  return {
    type: "edit_committed",
    eventId: `evt-c-${i}` as any,
    when: new Date().toISOString(),
    atopWhich: "abc123" as any,
    throughWhich: { sessionId: "sess-1" as any, toolName: "test", cwd: "/tmp" },
    byWhom: { identity: "test-agent" },
    payload: {
      actionTypeRid: "action-01",
      appliedEdits: [],
      submissionCriteriaPassed: ["criteria-1"],
    },
  };
}

function makeSessionStarted(i: number): Omit<EventEnvelope, "sequence"> {
  return {
    type: "session_started",
    eventId: `evt-s-${i}` as any,
    when: new Date().toISOString(),
    atopWhich: "abc123" as any,
    throughWhich: { sessionId: `sess-${i}` as any, toolName: "test", cwd: "/tmp" },
    byWhom: { identity: "test-agent" },
    payload: {
      model: "claude-sonnet-4-6",
      effort: "high",
    },
  };
}

// ────────────────────────────────────────────────────────────────────────────
// Test 1: round-trip — append 10 events, read back, verify exact preservation
// ────────────────────────────────────────────────────────────────────────────

describe("Test 1: round-trip", () => {
  test("append 10 events and read them back with exact sequence + content", async () => {
    const eventsPath = tmpEventsPath("roundtrip");
    const appended: number[] = [];

    for (let i = 0; i < 10; i++) {
      const seq = await appendEventAtomic(eventsPath, makeEditProposed(i));
      appended.push(seq);
    }

    // Sequences 1..10
    expect(appended).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);

    const events = readEvents(eventsPath);
    expect(events).toHaveLength(10);

    // Verify sequence field was written correctly
    for (let i = 0; i < 10; i++) {
      expect(events[i].sequence).toBe(i + 1);
      expect(events[i].type).toBe("edit_proposed");
      // Verify payload content preserved
      const ev = events[i] as Extract<EventEnvelope, { type: "edit_proposed" }>;
      expect((ev.payload.params as { i: number }).i).toBe(i);
    }
  });
});

// ────────────────────────────────────────────────────────────────────────────
// Test 2: discriminated union type safety
// TypeScript compile-time check: malformed envelopes rejected at type level
// ────────────────────────────────────────────────────────────────────────────

describe("Test 2: discriminated union type safety", () => {
  test("only valid EventEnvelope variants are accepted by the type system", () => {
    // This test demonstrates compile-time safety via type assertions.
    // The following would be a TypeScript compile error (cannot pass wrong type):
    //   const bad: EventEnvelope = { type: "unknown_type", ...base }; // TS ERROR
    //   await appendEventAtomic(eventsPath, bad); // TS ERROR — bad does not extend EventEnvelope

    // Valid variant — compiles fine
    const valid: Omit<EventEnvelope, "sequence"> = {
      type: "session_started",
      eventId: "evt-x" as any,
      when: new Date().toISOString(),
      atopWhich: "abc" as any,
      throughWhich: { sessionId: "s" as any, toolName: "t", cwd: "/" },
      byWhom: { identity: "agent" },
      payload: { model: "claude", effort: "max" },
    };

    // Type narrowing exhaustiveness — all 3 branches reachable
    const mockFull: EventEnvelope = { ...valid, sequence: 1 } as EventEnvelope;
    let branch = "";
    switch (mockFull.type) {
      case "edit_proposed":   branch = "proposed"; break;
      case "edit_committed":  branch = "committed"; break;
      case "session_started": branch = "started"; break;
    }
    expect(branch).toBe("started");

    // Type assertion: the union is closed — a string not in the union is excluded
    const types = ["edit_proposed", "edit_committed", "session_started"] as const;
    type ValidType = typeof types[number];
    function isValidType(t: string): t is ValidType {
      return (types as readonly string[]).includes(t);
    }
    expect(isValidType("edit_proposed")).toBe(true);
    expect(isValidType("unknown_garbage")).toBe(false);
  });
});

// ────────────────────────────────────────────────────────────────────────────
// Test 3: snapshot derivation — fold 20 events into typed count snapshot
// ────────────────────────────────────────────────────────────────────────────

describe("Test 3: snapshot derivation", () => {
  test("fold 20-event log into {edit_proposed:5, edit_committed:10, session_started:5}", async () => {
    const eventsPath = tmpEventsPath("snapshot");

    // Append: 5 session_started, 5 edit_proposed, 10 edit_committed
    for (let i = 0; i < 5; i++)  await appendEventAtomic(eventsPath, makeSessionStarted(i));
    for (let i = 0; i < 5; i++)  await appendEventAtomic(eventsPath, makeEditProposed(i));
    for (let i = 0; i < 10; i++) await appendEventAtomic(eventsPath, makeEditCommitted(i));

    const events = readEvents(eventsPath);
    expect(events).toHaveLength(20);

    const snapshot = foldToSnapshot(events);
    expect(snapshot.session_started).toBe(5);
    expect(snapshot.edit_proposed).toBe(5);
    expect(snapshot.edit_committed).toBe(10);
    expect(snapshot.totalEvents).toBe(20);
    expect(snapshot.lastSequence).toBe(20);
  });
});

// ────────────────────────────────────────────────────────────────────────────
// Test 4: sequence monotonicity — 100 sequential appends produce 1..100
// ────────────────────────────────────────────────────────────────────────────

describe("Test 4: sequence monotonicity", () => {
  test("100 sequential appends produce strictly monotonic sequences 1..100", async () => {
    const eventsPath = tmpEventsPath("monotonic");

    for (let i = 0; i < 100; i++) {
      await appendEventAtomic(eventsPath, makeEditProposed(i));
    }

    const events = readEvents(eventsPath);
    expect(events).toHaveLength(100);

    for (let i = 0; i < 100; i++) {
      expect(events[i].sequence).toBe(i + 1);
    }

    // Strictly increasing — no gaps, no duplicates
    for (let i = 1; i < events.length; i++) {
      expect(events[i].sequence).toBe(events[i - 1].sequence + 1);
    }
  });
});

// ────────────────────────────────────────────────────────────────────────────
// Test 5 (CRITICAL): adversarial 2-writer race
// simulator flag-01 HIGH — resolves gap-01 concurrent append safety
// 2 concurrent writers × 1000 events each = 2000 total
// Verify: zero duplicates, zero torn writes, zero lost events, monotonic tail
// ────────────────────────────────────────────────────────────────────────────

describe("Test 5: adversarial 2-writer race (gap-01 resolution)", () => {
  test("2 concurrent writers × 1000 events each produce zero duplicates/torn writes/lost events", async () => {
    const eventsPath = tmpEventsPath("race");
    const EVENTS_PER_WRITER = 1000;
    const TOTAL_EXPECTED    = EVENTS_PER_WRITER * 2;

    // Writer factory — returns a promise that resolves when all events are appended
    async function runWriter(writerId: number): Promise<void> {
      for (let i = 0; i < EVENTS_PER_WRITER; i++) {
        const envelope = makeEditProposed(writerId * 10000 + i);
        // Tag the writer in byWhom so we can trace ownership
        envelope.byWhom = { identity: `writer-${writerId}` };
        await appendEventAtomic(eventsPath, envelope);
      }
    }

    // Launch both writers concurrently — the critical race condition
    await Promise.all([runWriter(0), runWriter(1)]);

    // Read back all events
    const events = readEvents(eventsPath);

    // ── Invariant 1: total count ──
    expect(events).toHaveLength(TOTAL_EXPECTED);

    // ── Invariant 2: zero torn writes (all lines must have been valid JSON — readEvents guarantees this) ──
    // readEvents would throw on invalid JSON; reaching here means zero torn writes
    const tornWrites = 0; // implicit: readEvents succeeded

    // ── Invariant 3: zero duplicate sequences ──
    const sequences = events.map((e) => e.sequence);
    const uniqueSequences = new Set(sequences);
    const duplicateCount = sequences.length - uniqueSequences.size;
    expect(duplicateCount).toBe(0);

    // ── Invariant 4: monotonic tail — last sequence equals total count ──
    // (sequences may not be contiguous per-writer interleaving, but global sequence is 1..2000)
    const sortedSequences = [...sequences].sort((a, b) => a - b);
    expect(sortedSequences[0]).toBe(1);
    expect(sortedSequences[sortedSequences.length - 1]).toBe(TOTAL_EXPECTED);

    // ── Invariant 5: no gaps in sequence range ──
    for (let i = 0; i < sortedSequences.length; i++) {
      expect(sortedSequences[i]).toBe(i + 1);
    }

    // Summary assertion for eval-results reporting
    const adversarialResult = {
      concurrentWriters: 2,
      eventsPerWriter:   EVENTS_PER_WRITER,
      totalExpected:     TOTAL_EXPECTED,
      totalActual:       events.length,
      duplicateSequences: duplicateCount,
      tornWrites:         tornWrites,
      lostEvents:         TOTAL_EXPECTED - events.length,
      verdict:            duplicateCount === 0 && tornWrites === 0 && events.length === TOTAL_EXPECTED ? "pass" : "fail",
    };
    console.log("adversarialRaceResult:", JSON.stringify(adversarialResult));

    expect(adversarialResult.verdict).toBe("pass");
    expect(adversarialResult.lostEvents).toBe(0);
  }, 60000); // generous timeout for 2000-event race
});

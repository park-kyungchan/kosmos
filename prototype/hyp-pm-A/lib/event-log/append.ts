// Atomic append — Gap fill 3 implementation (zero-dep mkdir fallback)
// fs.mkdir({ recursive: false }) is atomic on all POSIX filesystems — throws EEXIST on race.
// Retry loop with exponential backoff + try/finally rmdir cleanup.
// Domain: ACTION (prim-action-03 AtomicCommit)

import * as fs from "fs";
import * as path from "path";
import type { EventEnvelope } from "./types";

const LOCK_SUFFIX  = ".lock";
const MAX_RETRIES  = 20;
const BASE_DELAY   = 5;   // ms
const MAX_DELAY    = 200; // ms

function lockPath(eventsPath: string): string {
  return eventsPath + LOCK_SUFFIX;
}

async function acquireLock(lockDir: string): Promise<void> {
  let delay = BASE_DELAY;
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      // mkdir with recursive:false is atomic — only one caller succeeds on race
      fs.mkdirSync(lockDir);
      return; // lock acquired
    } catch (err: unknown) {
      const e = err as NodeJS.ErrnoException;
      if (e.code !== "EEXIST") throw err; // unexpected error — rethrow
      // EEXIST = another writer holds lock, back off and retry
      await new Promise((resolve) => setTimeout(resolve, delay));
      delay = Math.min(delay * 2, MAX_DELAY);
    }
  }
  throw new Error(`appendEventAtomic: failed to acquire lock after ${MAX_RETRIES} retries: ${lockDir}`);
}

function releaseLock(lockDir: string): void {
  try {
    fs.rmdirSync(lockDir);
  } catch {
    // best-effort release — ignore errors (lock already cleaned up)
  }
}

/**
 * Atomically appends an EventEnvelope as a single NDJSON line to eventsPath.
 * The sequence field in the envelope is set to (lastSequence + 1) under the lock,
 * ensuring monotonic ordering with no duplicates even under concurrent writers.
 *
 * @param eventsPath - absolute path to the events.jsonl file
 * @param envelope   - envelope to append (sequence field will be overwritten)
 * @returns the sequence number assigned to this event
 */
export async function appendEventAtomic(
  eventsPath: string,
  envelope: Omit<EventEnvelope, "sequence">
): Promise<number> {
  const lockDir = lockPath(eventsPath);

  // Ensure parent directory exists
  fs.mkdirSync(path.dirname(eventsPath), { recursive: true });

  await acquireLock(lockDir);
  try {
    // Read current last sequence under lock
    let lastSequence = 0;
    if (fs.existsSync(eventsPath)) {
      const content = fs.readFileSync(eventsPath, "utf8");
      const lines = content.split("\n").filter((l) => l.trim().length > 0);
      if (lines.length > 0) {
        const last = JSON.parse(lines[lines.length - 1]) as { sequence: number };
        lastSequence = last.sequence;
      }
    }

    const nextSequence = lastSequence + 1;
    const sealed: EventEnvelope = { ...envelope, sequence: nextSequence } as EventEnvelope;
    const line = JSON.stringify(sealed) + "\n";

    // Atomic append — single write syscall
    fs.appendFileSync(eventsPath, line, "utf8");

    return nextSequence;
  } finally {
    releaseLock(lockDir);
  }
}

/**
 * Race worker: spawned as a subprocess to create true OS-level concurrency.
 * Usage: bun run race-worker.ts <snapshotPath> <updatesCount>
 * Outputs JSON: { successfulWrites, staleErrors, finalRead }
 */
import { readSnapshot } from "./read";
import { writeSnapshot } from "./write";
import { StaleObjectError } from "./types";

const [, , snapshotPath, updatesCountStr] = process.argv;
if (!snapshotPath || !updatesCountStr) {
  process.stderr.write("Usage: race-worker.ts <snapshotPath> <updatesCount>\n");
  process.exit(1);
}

const UPDATES = parseInt(updatesCountStr, 10);
let successfulWrites = 0;
let staleErrors = 0;

let updatesCommitted = 0;
while (updatesCommitted < UPDATES) {
  try {
    const snap = readSnapshot<{ counter: number }>(snapshotPath);
    writeSnapshot(snapshotPath, { counter: snap.data.counter + 1 }, snap.version);
    successfulWrites++;
    updatesCommitted++;
  } catch (err) {
    if (err instanceof StaleObjectError) {
      staleErrors++;
      // Do NOT retry — we want to measure how many writes are dropped
      // This is the H-B weakness: under contention, updates are simply lost
      // H-A (atomic append) has zero such losses
    } else {
      throw err;
    }
  }
}

process.stdout.write(
  JSON.stringify({ successfulWrites, staleErrors }) + "\n"
);

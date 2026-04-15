import { readFileSync, writeFileSync, existsSync } from "fs";
import type { Snapshot } from "./types";
import { StaleObjectError } from "./types";

/**
 * Write a new snapshot to disk with optimistic concurrency check.
 *
 * Protocol (Palantir StaleObject pattern):
 *   1. Re-read current version from disk
 *   2. If current version !== expectedVersion → throw StaleObjectError
 *   3. Otherwise write new snapshot with version = expectedVersion + 1
 *
 * NOTE: This is NOT atomic on the filesystem — there is a TOCTOU window
 * between the version check (step 1) and the write (step 3). Under concurrent
 * writers this produces lost updates. This is H-B's empirical weakness.
 */
export function writeSnapshot<T>(
  path: string,
  newData: T,
  expectedVersion: number
): Snapshot<T> {
  // Re-read from disk to check current version (optimistic concurrency check)
  if (existsSync(path)) {
    const raw = readFileSync(path, "utf-8");
    const current = JSON.parse(raw) as Snapshot<T>;
    if (current.version !== expectedVersion) {
      throw new StaleObjectError(expectedVersion, current.version);
    }
  } else if (expectedVersion !== 0) {
    // File doesn't exist but caller expects a specific version — stale reference
    throw new StaleObjectError(expectedVersion, 0);
  }

  const next: Snapshot<T> = {
    version: expectedVersion + 1,
    lastModified: new Date().toISOString(),
    data: newData,
  };

  writeFileSync(path, JSON.stringify(next, null, 2), "utf-8");
  return next;
}

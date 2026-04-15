import { readFileSync } from "fs";
import type { Snapshot } from "./types";

/**
 * Read a snapshot from disk.
 * Returns the versioned snapshot including version number for optimistic concurrency.
 */
export function readSnapshot<T>(path: string): Snapshot<T> {
  const raw = readFileSync(path, "utf-8");
  const parsed = JSON.parse(raw) as Snapshot<T>;
  if (typeof parsed.version !== "number") {
    throw new Error(`Invalid snapshot at ${path}: missing version field`);
  }
  return parsed;
}

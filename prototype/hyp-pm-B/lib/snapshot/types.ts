/**
 * H-B Prototype: Snapshot-based + StaleObject optimistic concurrency
 * D/L/A: DATA domain — versioned per-project state file
 */

export interface Snapshot<T> {
  version: number;
  lastModified: string; // ISO timestamp
  data: T;
}

export class StaleObjectError extends Error {
  public readonly expectedVersion: number;
  public readonly actualVersion: number;

  constructor(expectedVersion: number, actualVersion: number) {
    super(
      `StaleObject: expected version ${expectedVersion}, but disk has version ${actualVersion}. ` +
      `Another writer committed first — re-read and retry.`
    );
    this.name = "StaleObjectError";
    this.expectedVersion = expectedVersion;
    this.actualVersion = actualVersion;
  }
}

// Read and fold events.jsonl — LEARN domain (prim-learn-01 AppendOnlyEventLog)
// readEvents: deserializes all lines into EventEnvelope[]
// foldToSnapshot: reduces event log into count-per-type snapshot

import * as fs from "fs";
import type { EventEnvelope, EventSnapshot } from "./types";

/**
 * Reads all events from an NDJSON event log file.
 * Returns events in append order (sequence ascending).
 */
export function readEvents(eventsPath: string): EventEnvelope[] {
  if (!fs.existsSync(eventsPath)) return [];
  const content = fs.readFileSync(eventsPath, "utf8");
  const lines = content.split("\n").filter((l) => l.trim().length > 0);
  return lines.map((line) => JSON.parse(line) as EventEnvelope);
}

/**
 * Folds an event log into a typed snapshot by counting events per type.
 * Demonstrates the Reducer LOGIC primitive pattern (prim-logic-05).
 * Only the 3 PoC variants are counted; extend for full 10-variant schema.
 */
export function foldToSnapshot(events: EventEnvelope[]): EventSnapshot {
  const snapshot: EventSnapshot = {
    edit_proposed:   0,
    edit_committed:  0,
    session_started: 0,
    totalEvents:     events.length,
    lastSequence:    0,
  };

  for (const ev of events) {
    switch (ev.type) {
      case "edit_proposed":   snapshot.edit_proposed++;   break;
      case "edit_committed":  snapshot.edit_committed++;  break;
      case "session_started": snapshot.session_started++; break;
      default: {
        // exhaustive check — TypeScript will error if a new variant is added without updating this
        const _exhaustive: never = ev;
        void _exhaustive;
        break;
      }
    }
    if (ev.sequence > snapshot.lastSequence) {
      snapshot.lastSequence = ev.sequence;
    }
  }

  return snapshot;
}

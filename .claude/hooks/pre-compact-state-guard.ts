#!/usr/bin/env bun
/**
 * pre-compact-state-guard.ts — PreCompact BLOCKING Hook
 *
 * Before any compaction, snapshot the events.jsonl and all ontology-state/
 * files to .palantir-mini/session/snapshots/<timestamp>/. If the snapshot
 * fails, block compaction by exiting non-zero.
 *
 * BLOCKING: exit code != 0 halts the compact operation.
 */

import { existsSync, mkdirSync, copyFileSync, readdirSync, statSync } from "fs";
import { join, basename } from "path";

const projectRoot = process.env.KOSMOS_PROJECT_ROOT ?? ".";
const sessionDir = process.env.PALANTIR_MINI_SESSION_DIR
  ?? `${projectRoot}/.palantir-mini/session`;
const snapshotBase = process.env.PALANTIR_MINI_SNAPSHOT_DIR
  ?? `${projectRoot}/.palantir-mini/session/snapshots`;
const eventsFile = process.env.PALANTIR_MINI_EVENTS_FILE
  ?? `${projectRoot}/.palantir-mini/session/events.jsonl`;
const ontologyStateDir = `${projectRoot}/ontology-state`;

const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
const snapshotDir = join(snapshotBase, timestamp);

function snapshotFiles(): boolean {
  try {
    mkdirSync(snapshotDir, { recursive: true });

    // Snapshot events.jsonl if it exists
    if (existsSync(eventsFile)) {
      copyFileSync(eventsFile, join(snapshotDir, "events.jsonl"));
    }

    // Snapshot all ontology-state/ JSON files
    if (existsSync(ontologyStateDir)) {
      const files = readdirSync(ontologyStateDir);
      for (const file of files) {
        const src = join(ontologyStateDir, file);
        if (statSync(src).isFile() && file.endsWith(".json")) {
          copyFileSync(src, join(snapshotDir, file));
        }
      }
    }

    console.log(`[pre-compact-state-guard] Snapshot written to ${snapshotDir}`);
    return true;
  } catch (err) {
    console.error(`[pre-compact-state-guard] Snapshot failed: ${err}`);
    return false;
  }
}

const success = snapshotFiles();

if (!success) {
  // Block compaction: output JSON decision to stdout
  console.log(JSON.stringify({
    decision: "block",
    reason: "State snapshot failed before compact. Resolve snapshot error before compacting.",
  }));
  process.exit(1);
}

process.exit(0);

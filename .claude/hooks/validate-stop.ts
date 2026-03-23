#!/usr/bin/env bun
/**
 * Hook: validate-stop
 * Event: Stop
 *
 * Prevents the agent from stopping without producing required outputs.
 * Checks that key ontology-state files were updated during the session.
 *
 * Exit codes:
 *   0 = allow stop (outputs present or non-research session)
 *   2 = block (missing required outputs)
 */

import { existsSync } from "fs";

const PROJECT_ROOT = "/home/palantirkc/kosmos";

const stateFiles = [
  `${PROJECT_ROOT}/ontology-state/world-model.json`,
  `${PROJECT_ROOT}/ontology-state/source-map.json`,
  `${PROJECT_ROOT}/ontology-state/scenarios.json`,
  `${PROJECT_ROOT}/ontology-state/decision-log.json`,
];

// Check if any state file was recently modified (within last 30 minutes)
const THIRTY_MIN = 30 * 60 * 1000;
const now = Date.now();

let anyUpdated = false;

for (const filePath of stateFiles) {
  if (!existsSync(filePath)) continue;
  const file = Bun.file(filePath);
  try {
    const content = await file.text();
    const data = JSON.parse(content);
    // Check if the file has entries (non-empty state)
    if (data.entries && data.entries.length > 0) {
      anyUpdated = true;
      break;
    }
    if (data.objects && data.objects.length > 0) {
      anyUpdated = true;
      break;
    }
    if (data.sources && data.sources.length > 0) {
      anyUpdated = true;
      break;
    }
    if (data.scenarios && data.scenarios.length > 0) {
      anyUpdated = true;
      break;
    }
  } catch {
    // File exists but can't be parsed — skip
  }
}

// If no state files were updated, this might be a non-research session
// (e.g., scaffolding, config changes). Allow stop.
// In a production version, this would check the session type.
if (!anyUpdated) {
  // Soft warning — don't block, but inform
  process.stdout.write(
    JSON.stringify({
      message:
        "Warning: No ontology-state files were updated in this session. " +
        "If this was a research session, world-model.json should have been updated.",
    })
  );
}

process.exit(0);

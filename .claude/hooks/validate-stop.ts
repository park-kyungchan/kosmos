#!/usr/bin/env bun
/**
 * Hook: validate-stop (Phase 2 — BLOCKING for research sessions)
 * Event: Stop
 *
 * For substantial research sessions, blocks stop if no state files were updated.
 * Detects research sessions by checking if any research questions or sources exist.
 *
 * Exit codes:
 *   0 = allow stop
 *   2 = block (research session without state updates)
 */

export {};

import { existsSync } from "fs";

// Guard against infinite loops — if this hook already fired once, allow stop
const input = await Bun.stdin.text();
let hookPayload: Record<string, unknown> = {};
try { hookPayload = JSON.parse(input); } catch { /* ignore */ }
if (hookPayload.stop_hook_active === true) {
  process.exit(0); // Second call — always allow
}

const PROJECT_ROOT = "/home/palantirkc/kosmos";

const stateFiles = {
  worldModel: `${PROJECT_ROOT}/ontology-state/world-model.json`,
  sourceMap: `${PROJECT_ROOT}/ontology-state/source-map.json`,
  scenarios: `${PROJECT_ROOT}/ontology-state/scenarios.json`,
  decisionLog: `${PROJECT_ROOT}/ontology-state/decision-log.json`,
};

let isResearchSession = false;
let anyStateUpdated = false;

// Check decision-log for research questions (indicates research session)
try {
  const logFile = Bun.file(stateFiles.decisionLog);
  const logContent = await logFile.text();
  const logData = JSON.parse(logContent);
  if (
    (logData.questions && logData.questions.length > 0) ||
    (logData.entries && logData.entries.length > 0)
  ) {
    isResearchSession = true;
  }
} catch {
  // File doesn't exist or can't be parsed — not a research session
}

if (!isResearchSession) {
  // Not a research session — allow stop (scaffolding, config changes, etc.)
  process.exit(0);
}

// For research sessions, check if any state file has real content
for (const [key, filePath] of Object.entries(stateFiles)) {
  if (!existsSync(filePath)) continue;
  try {
    const file = Bun.file(filePath);
    const content = await file.text();
    const data = JSON.parse(content);

    // Check for non-empty state
    const hasContent =
      (data.objects && data.objects.length > 0) ||
      (data.sources && data.sources.length > 0) ||
      (data.scenarios && data.scenarios.length > 0) ||
      (data.entries && data.entries.length > 0) ||
      (data.questions && data.questions.length > 0);

    if (hasContent) {
      anyStateUpdated = true;
      break;
    }
  } catch {
    // Skip unparseable files
  }
}

if (!anyStateUpdated) {
  process.stderr.write(
    "BLOCKED: Research session detected (questions in decision-log) but no state files were updated.\n" +
    "A research session must update at least one of:\n" +
    "  - ontology-state/world-model.json (ontologist)\n" +
    "  - ontology-state/source-map.json (researcher)\n" +
    "  - ontology-state/scenarios.json (simulator)\n" +
    "If this is not a research session, clear the decision-log questions first."
  );
  process.exit(2);
}

process.exit(0);

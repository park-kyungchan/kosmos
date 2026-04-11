#!/usr/bin/env bun
/**
 * Hook: validate-stop (Phase 3 — BLOCKING for research sessions, portable)
 * Event: Stop
 *
 * Environment: KOSMOS_PROJECT_ROOT (fallback: cwd)
 *
 * Exit codes:
 *   0 = allow stop
 *   2 = block (research session without state updates)
 */

export {};

import { existsSync, statSync } from "fs";

// Guard against infinite loops
const input = await Bun.stdin.text();
let hookPayload: Record<string, unknown> = {};
try { hookPayload = JSON.parse(input); } catch { /* ignore */ }
if (hookPayload.stop_hook_active === true) {
  process.exit(0);
}

const PROJECT_ROOT =
  process.env.KOSMOS_PROJECT_ROOT || process.cwd();

const stateFiles = {
  worldModel: `${PROJECT_ROOT}/ontology-state/world-model.json`,
  sourceMap: `${PROJECT_ROOT}/ontology-state/source-map.json`,
  scenarios: `${PROJECT_ROOT}/ontology-state/scenarios.json`,
  decisionLog: `${PROJECT_ROOT}/ontology-state/decision-log.json`,
  evalResults: `${PROJECT_ROOT}/ontology-state/eval-results.json`,
};

// Detect research session: decision-log.json must have been modified
// within the last 2 hours (current session scope, not stale from prior runs)
const TWO_HOURS = 2 * 60 * 60 * 1000;
let isResearchSession = false;
let anyStateUpdated = false;

try {
  if (existsSync(stateFiles.decisionLog)) {
    const { mtimeMs } = statSync(stateFiles.decisionLog);
    const isRecent = Date.now() - mtimeMs < TWO_HOURS;

    if (isRecent) {
      const logData = JSON.parse(await Bun.file(stateFiles.decisionLog).text());
      if (
        (logData.questions && logData.questions.length > 0) ||
        (logData.entries && logData.entries.length > 0)
      ) {
        isResearchSession = true;
      }
    }
  }
} catch { /* not a research session */ }

if (!isResearchSession) {
  process.exit(0);
}

for (const filePath of Object.values(stateFiles)) {
  if (!existsSync(filePath)) continue;
  try {
    const data = JSON.parse(await Bun.file(filePath).text());
    const hasContent =
      (data.objects && data.objects.length > 0) ||
      (data.sources && data.sources.length > 0) ||
      (data.scenarios && data.scenarios.length > 0) ||
      (data.entries && data.entries.length > 0) ||
      (data.questions && data.questions.length > 0) ||
      (data.prototypes && data.prototypes.length > 0) ||
      (data.evalSuites && data.evalSuites.length > 0);
    if (hasContent) { anyStateUpdated = true; break; }
  } catch { /* skip */ }
}

if (!anyStateUpdated) {
  process.stderr.write(
    "BLOCKED: Research session detected but no state files updated.\n" +
    "Update at least one of: world-model.json, source-map.json, scenarios.json"
  );
  process.exit(2);
}

// Check blueprint.json exists for research sessions
const blueprintPath = `${PROJECT_ROOT}/ontology-state/blueprint.json`;
let blueprintValid = false;
if (existsSync(blueprintPath)) {
  try {
    const bpData = JSON.parse(await Bun.file(blueprintPath).text());
    // Accept both nested ({ blueprint: {...} }) and flat ({ projectScope: {...} }) formats
    if (
      (bpData.blueprint !== null && bpData.blueprint !== undefined) ||
      (bpData.projectScope !== null && bpData.projectScope !== undefined)
    ) {
      blueprintValid = true;
    }
  } catch { /* malformed — treat as invalid */ }
}

if (!blueprintValid) {
  process.stderr.write(
    "BLOCKED: Research session without blueprint output. " +
    "Run reporter agent to generate blueprint."
  );
  process.exit(2);
}

process.exit(0);

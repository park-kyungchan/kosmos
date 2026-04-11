#!/usr/bin/env bun
/**
 * Hook: inject-prior-state (SessionStart — Advisory)
 * Event: SessionStart
 *
 * At session start, outputs a summary of ontology-state/ files to stdout
 * so Claude gets prior session context.
 *
 * Environment: KOSMOS_PROJECT_ROOT (fallback: cwd)
 *
 * Exit codes:
 *   0 = allow (always — advisory, never blocks)
 */

export {};

import { existsSync } from "fs";

const PROJECT_ROOT =
  process.env.KOSMOS_PROJECT_ROOT || process.cwd();

const STATE_DIR = `${PROJECT_ROOT}/ontology-state`;

interface PriorStateSummary {
  hasPriorState: boolean;
  decisionLog: {
    lastSessionId: string | null;
    stageCount: number;
    questionCount: number;
  };
  worldModel: {
    objectCountByDomain: Record<string, number>;
  };
  blueprint: {
    exists: boolean;
    evaluatorGateStatus: string | null;
  };
  sourceMap: {
    sourceCount: number;
  };
  scenarios: {
    scenarioCount: number;
  };
}

const summary: PriorStateSummary = {
  hasPriorState: false,
  decisionLog: { lastSessionId: null, stageCount: 0, questionCount: 0 },
  worldModel: { objectCountByDomain: {} },
  blueprint: { exists: false, evaluatorGateStatus: null },
  sourceMap: { sourceCount: 0 },
  scenarios: { scenarioCount: 0 },
};

// --- decision-log.json ---
try {
  const path = `${STATE_DIR}/decision-log.json`;
  if (existsSync(path)) {
    const data = JSON.parse(await Bun.file(path).text());
    summary.hasPriorState = true;
    summary.decisionLog.lastSessionId = data.sessionId || null;
    summary.decisionLog.stageCount =
      (data.entries ? data.entries.length : 0);
    summary.decisionLog.questionCount =
      (data.questions ? data.questions.length : 0);
  }
} catch { /* missing or malformed — new session */ }

// --- world-model.json ---
try {
  const path = `${STATE_DIR}/world-model.json`;
  if (existsSync(path)) {
    const data = JSON.parse(await Bun.file(path).text());
    summary.hasPriorState = true;
    const counts: Record<string, number> = {};
    if (data.objects && Array.isArray(data.objects)) {
      for (const obj of data.objects) {
        const domain = (obj.domain || "unknown").toLowerCase();
        counts[domain] = (counts[domain] || 0) + 1;
      }
    }
    summary.worldModel.objectCountByDomain = counts;
  }
} catch { /* missing or malformed */ }

// --- blueprint.json ---
try {
  const path = `${STATE_DIR}/blueprint.json`;
  if (existsSync(path)) {
    const data = JSON.parse(await Bun.file(path).text());
    summary.hasPriorState = true;
    summary.blueprint.exists = true;
    summary.blueprint.evaluatorGateStatus =
      data.evaluatorGate?.status ||
      data.evaluatorGateStatus ||
      null;
  }
} catch { /* missing or malformed */ }

// --- source-map.json ---
try {
  const path = `${STATE_DIR}/source-map.json`;
  if (existsSync(path)) {
    const data = JSON.parse(await Bun.file(path).text());
    summary.hasPriorState = true;
    summary.sourceMap.sourceCount =
      data.sources ? data.sources.length : 0;
  }
} catch { /* missing or malformed */ }

// --- scenarios.json ---
try {
  const path = `${STATE_DIR}/scenarios.json`;
  if (existsSync(path)) {
    const data = JSON.parse(await Bun.file(path).text());
    summary.hasPriorState = true;
    summary.scenarios.scenarioCount =
      data.scenarios ? data.scenarios.length : 0;
  }
} catch { /* missing or malformed */ }

process.stdout.write(JSON.stringify(summary, null, 2));
process.exit(0);

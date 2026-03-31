#!/usr/bin/env bun
/**
 * Hook: reinject-state-after-compact (PostCompact — Advisory)
 * Event: PostCompact
 *
 * After context compaction, re-injects critical ontology state summary
 * to stdout so Claude retains awareness of current pipeline position.
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

interface CompactStateSummary {
  currentStage: string;
  objectCountByDomain: Record<string, number>;
  scenarioCount: number;
  sourceCount: number;
  questionCount: number;
  blueprintStatus: string;
  lastSessionId: string | null;
}

const summary: CompactStateSummary = {
  currentStage: "unknown",
  objectCountByDomain: {},
  scenarioCount: 0,
  sourceCount: 0,
  questionCount: 0,
  blueprintStatus: "missing",
  lastSessionId: null,
};

// --- decision-log.json: determine current stage and question count ---
try {
  const path = `${STATE_DIR}/decision-log.json`;
  if (existsSync(path)) {
    const data = JSON.parse(await Bun.file(path).text());
    summary.lastSessionId = data.sessionId || null;
    summary.questionCount =
      data.questions ? data.questions.length : 0;

    // Infer current stage from entries
    const entries = data.entries || [];
    if (entries.length === 0) {
      summary.currentStage = "intake";
    } else {
      const lastEntry = entries[entries.length - 1];
      summary.currentStage = lastEntry.type || "in-progress";
    }
  }
} catch { /* missing or malformed */ }

// --- world-model.json: object counts by domain ---
try {
  const path = `${STATE_DIR}/world-model.json`;
  if (existsSync(path)) {
    const data = JSON.parse(await Bun.file(path).text());
    const counts: Record<string, number> = {};
    if (data.objects && Array.isArray(data.objects)) {
      for (const obj of data.objects) {
        const domain = (obj.domain || "unknown").toLowerCase();
        counts[domain] = (counts[domain] || 0) + 1;
      }
    }
    summary.objectCountByDomain = counts;
  }
} catch { /* missing or malformed */ }

// --- source-map.json: source count ---
try {
  const path = `${STATE_DIR}/source-map.json`;
  if (existsSync(path)) {
    const data = JSON.parse(await Bun.file(path).text());
    summary.sourceCount =
      data.sources ? data.sources.length : 0;
  }
} catch { /* missing or malformed */ }

// --- scenarios.json: scenario count ---
try {
  const path = `${STATE_DIR}/scenarios.json`;
  if (existsSync(path)) {
    const data = JSON.parse(await Bun.file(path).text());
    summary.scenarioCount =
      data.scenarios ? data.scenarios.length : 0;
  }
} catch { /* missing or malformed */ }

// --- blueprint.json: status ---
try {
  const path = `${STATE_DIR}/blueprint.json`;
  if (existsSync(path)) {
    const data = JSON.parse(await Bun.file(path).text());
    if (
      Object.keys(data).length === 0 ||
      data.blueprint === null ||
      data.blueprint === undefined
    ) {
      summary.blueprintStatus = "empty";
    } else {
      summary.blueprintStatus = data.evaluatorGate?.status ||
        data.evaluatorGateStatus ||
        "present";
    }
  }
} catch { /* missing or malformed */ }

process.stdout.write(
  "POST-COMPACT STATE SUMMARY:\n" +
  JSON.stringify(summary, null, 2)
);
process.exit(0);

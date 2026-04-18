#!/usr/bin/env bun
/**
 * Hook: post-subagent-worldmodel-check — KOSMOS-SPECIFIC OVERRIDE (Phase A-2 W2-3)
 * Event: PostToolUse (Agent)
 *
 * BLOCKS ontologist agent completion if ontology-state/world-model.json was
 * not updated within the last 5 minutes. Advisory for researcher on source-map.
 *
 * Partial overlap with palantir-mini plugin v1.1 subagent-stop Output Contract
 * validation, but this hook adds mtime freshness semantics (5-min window) that
 * the plugin's contract-schema check does not cover.
 *
 * Environment: KOSMOS_PROJECT_ROOT (fallback: cwd)
 *
 * Exit codes:
 *   0 = allow
 *   2 = block (ontologist did not update world-model.json)
 */

export {};

import { existsSync, statSync } from "fs";

const input = await Bun.stdin.text();

interface HookPayload {
  tool_name: string;
  tool_input: {
    prompt?: string;
    subagent_type?: string;
    description?: string;
  };
}

let payload: HookPayload;
try { payload = JSON.parse(input); } catch { process.exit(0); }

const agentType = payload.tool_input?.subagent_type || "";

// Only match on explicit agent names, not prompt keywords (avoids false positives)
const desc = (payload.tool_input?.description || "").toLowerCase();

const isOntologist =
  agentType === "ontologist" ||
  desc === "ontology normalization" ||
  desc.startsWith("ontologist");

const isResearcher =
  agentType === "researcher" ||
  desc === "evidence retrieval" ||
  desc.startsWith("researcher");

if (!isOntologist && !isResearcher) {
  process.exit(0);
}

const PROJECT_ROOT =
  process.env.KOSMOS_PROJECT_ROOT || process.cwd();

const FIVE_MIN = 5 * 60 * 1000;

if (isOntologist) {
  const path = `${PROJECT_ROOT}/ontology-state/world-model.json`;
  if (!existsSync(path)) {
    process.stderr.write(
      "BLOCKED: Ontologist completed but world-model.json does not exist."
    );
    process.exit(2);
  }
  if (Date.now() - statSync(path).mtimeMs > FIVE_MIN) {
    process.stderr.write(
      "BLOCKED: Ontologist completed but world-model.json was not recently updated."
    );
    process.exit(2);
  }
}

if (isResearcher) {
  const path = `${PROJECT_ROOT}/ontology-state/source-map.json`;
  if (existsSync(path) && Date.now() - statSync(path).mtimeMs > FIVE_MIN) {
    process.stdout.write(JSON.stringify({
      message: "Warning: Researcher completed but source-map.json was not recently updated.",
    }));
  }
}

process.exit(0);

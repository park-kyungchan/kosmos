#!/usr/bin/env bun
/**
 * Hook: post-subagent-worldmodel-check (Phase 3 — BLOCKING for ontologist, portable)
 * Event: PostToolUse (Agent)
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

const prompt = payload.tool_input?.prompt || "";
const agentType = payload.tool_input?.subagent_type || "";

const isOntologist =
  agentType.includes("ontologist") ||
  prompt.toLowerCase().includes("world model") ||
  prompt.toLowerCase().includes("world-model") ||
  prompt.toLowerCase().includes("ontology normalization");

const isResearcher =
  agentType.includes("researcher") ||
  prompt.toLowerCase().includes("retrieve evidence") ||
  prompt.toLowerCase().includes("source-map");

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

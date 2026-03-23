#!/usr/bin/env bun
/**
 * Hook: post-subagent-worldmodel-check (Phase 2 — BLOCKING for ontologist)
 * Event: PostToolUse (Agent)
 *
 * After an ontologist agent completes, BLOCKS if world-model.json was not updated.
 * Advisory for other agent types.
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
  tool_result?: string;
}

let payload: HookPayload;
try {
  payload = JSON.parse(input);
} catch {
  process.exit(0);
}

const prompt = payload.tool_input?.prompt || "";
const agentType = payload.tool_input?.subagent_type || "";

// Determine if this was an ontologist agent
const isOntologist =
  agentType.includes("ontologist") ||
  prompt.toLowerCase().includes("world model") ||
  prompt.toLowerCase().includes("world-model") ||
  prompt.toLowerCase().includes("ontology normalization");

// Determine if this was a researcher agent
const isResearcher =
  agentType.includes("researcher") ||
  prompt.toLowerCase().includes("retrieve evidence") ||
  prompt.toLowerCase().includes("source-map");

if (!isOntologist && !isResearcher) {
  process.exit(0);
}

const FIVE_MIN = 5 * 60 * 1000;

if (isOntologist) {
  const WORLD_MODEL = "/home/palantirkc/kosmos/ontology-state/world-model.json";
  if (!existsSync(WORLD_MODEL)) {
    process.stderr.write(
      "BLOCKED: Ontologist agent completed but world-model.json does not exist.\n" +
      "The ontologist MUST create/update ontology-state/world-model.json with research findings."
    );
    process.exit(2);
  }

  const stat = statSync(WORLD_MODEL);
  if (Date.now() - stat.mtimeMs > FIVE_MIN) {
    process.stderr.write(
      "BLOCKED: Ontologist agent completed but world-model.json was NOT recently updated.\n" +
      "The ontologist MUST update world-model.json with normalized research findings."
    );
    process.exit(2);
  }
}

if (isResearcher) {
  const SOURCE_MAP = "/home/palantirkc/kosmos/ontology-state/source-map.json";
  if (existsSync(SOURCE_MAP)) {
    const stat = statSync(SOURCE_MAP);
    if (Date.now() - stat.mtimeMs > FIVE_MIN) {
      // Advisory only for researcher — warn but don't block
      process.stdout.write(
        JSON.stringify({
          message: "Warning: Researcher agent completed but source-map.json was not recently updated.",
        })
      );
    }
  }
}

process.exit(0);

#!/usr/bin/env bun
/**
 * Hook: post-subagent-worldmodel-check
 * Event: PostToolUse (Agent)
 *
 * After an agent completes, checks whether world-model.json was updated.
 * If the agent was a researcher or ontologist, the world model SHOULD
 * have been modified. Logs a warning if not.
 *
 * Exit codes:
 *   0 = allow (always — advisory only)
 */

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

// Only check for agents that should update the world model
const shouldUpdateWorldModel =
  agentType.includes("ontologist") ||
  prompt.toLowerCase().includes("world model") ||
  prompt.toLowerCase().includes("world-model") ||
  prompt.toLowerCase().includes("ontology normalization");

if (!shouldUpdateWorldModel) {
  process.exit(0);
}

const WORLD_MODEL_PATH = "/home/palantirkc/kosmos/ontology-state/world-model.json";

if (!existsSync(WORLD_MODEL_PATH)) {
  process.stdout.write(
    JSON.stringify({
      message:
        "Warning: world-model.json does not exist after ontologist agent completed. " +
        "The ontologist should have created or updated this file.",
    })
  );
  process.exit(0);
}

// Check if file was modified recently (within last 5 minutes)
const FIVE_MIN = 5 * 60 * 1000;
const stat = statSync(WORLD_MODEL_PATH);
const wasRecentlyModified = Date.now() - stat.mtimeMs < FIVE_MIN;

if (!wasRecentlyModified) {
  process.stdout.write(
    JSON.stringify({
      message:
        "Warning: world-model.json was NOT updated by the ontologist agent. " +
        "If research findings were produced, they should be normalized into the world model.",
    })
  );
}

process.exit(0);

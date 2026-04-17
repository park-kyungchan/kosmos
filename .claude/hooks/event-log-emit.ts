#!/usr/bin/env bun
/**
 * event-log-emit.ts — PostToolUse (Edit|Write) Advisory Hook
 *
 * After any Edit/Write tool call that touches ontology-state/ files,
 * append a structured event to .palantir-mini/session/events.jsonl.
 *
 * Advisory (non-blocking): failures are logged but do not abort the tool.
 */

import { existsSync, mkdirSync, appendFileSync } from "fs";
import { dirname } from "path";

interface HookInput {
  tool_name?: string;
  tool_input?: {
    file_path?: string;
    content?: string;
    new_string?: string;
  };
  session_id?: string;
  agent_name?: string;
}

const input: HookInput = await Bun.stdin.json().catch(() => ({}));

const filePath = input.tool_input?.file_path ?? "";
const projectRoot = process.env.KOSMOS_PROJECT_ROOT ?? ".";
const eventsFile = process.env.PALANTIR_MINI_EVENTS_FILE
  ?? `${projectRoot}/.palantir-mini/session/events.jsonl`;

// Only emit for ontology-state/ file edits
const isOntologyStateEdit =
  filePath.includes("ontology-state/") || filePath.includes("ontology-state\\");

if (!isOntologyStateEdit) {
  process.exit(0);
}

// Ensure directory exists
const eventsDir = dirname(eventsFile);
if (!existsSync(eventsDir)) {
  mkdirSync(eventsDir, { recursive: true });
}

const event = {
  timestamp: new Date().toISOString(),
  type: "ontology_edit",
  agent: input.agent_name ?? "unknown",
  session_id: input.session_id ?? "unknown",
  tool: input.tool_name ?? "unknown",
  file: filePath,
  summary: `${input.tool_name ?? "edit"} on ${filePath.split("/").pop() ?? filePath}`,
};

try {
  appendFileSync(eventsFile, JSON.stringify(event) + "\n", { encoding: "utf-8" });
} catch (err) {
  // Advisory: log to stderr, do not block
  console.error(`[event-log-emit] Failed to write event: ${err}`);
}

process.exit(0);

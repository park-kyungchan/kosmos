#!/usr/bin/env bun
/**
 * Hook: validate-agent-output (SubagentStop — BLOCKING for ontologist/reporter)
 * Event: PostToolUse (Agent)
 *
 * After a subagent completes, verifies it produced expected outputs.
 *
 * Environment: KOSMOS_PROJECT_ROOT (fallback: cwd)
 *
 * Exit codes:
 *   0 = allow (or advisory warning)
 *   2 = block (ontologist or reporter did not produce expected output)
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

// Only match on explicit agent file names in .claude/agents/, not on prompt keywords.
// Prompt keyword matching causes false positives when implementer/researcher agents
// mention these terms in their task descriptions.
const desc = (payload.tool_input?.description || "").toLowerCase();

const isOntologist =
  agentType === "ontologist" ||
  desc === "ontology normalization" ||
  desc.startsWith("ontologist");

const isResearcher =
  agentType === "researcher" ||
  desc === "evidence retrieval" ||
  desc.startsWith("researcher");

const isReporter =
  agentType === "reporter" ||
  desc === "report generation" ||
  desc.startsWith("reporter");

if (!isOntologist && !isResearcher && !isReporter) {
  process.exit(0);
}

const PROJECT_ROOT =
  process.env.KOSMOS_PROJECT_ROOT || process.cwd();

const FIVE_MIN = 5 * 60 * 1000;

// --- Ontologist: world-model.json must be updated within 5 minutes AND have "learn" domain ---
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
      "BLOCKED: Ontologist completed but world-model.json was not recently updated (>5 min ago)."
    );
    process.exit(2);
  }

  try {
    const data = JSON.parse(await Bun.file(path).text());
    const objects = data.objects || [];
    const hasLearnDomain = objects.some(
      (obj: { domain?: string }) =>
        (obj.domain || "").toLowerCase() === "learn"
    );
    if (!hasLearnDomain) {
      process.stderr.write(
        "BLOCKED: Ontologist completed but world-model.json has no objects with domain 'learn'. " +
        "The LEARN domain must be populated — not just data/logic/action."
      );
      process.exit(2);
    }
  } catch {
    process.stderr.write(
      "BLOCKED: Ontologist completed but world-model.json could not be parsed."
    );
    process.exit(2);
  }
}

// --- Researcher: source-map.json should be updated within 5 minutes (advisory) ---
if (isResearcher) {
  const path = `${PROJECT_ROOT}/ontology-state/source-map.json`;

  if (!existsSync(path) || Date.now() - statSync(path).mtimeMs > FIVE_MIN) {
    process.stdout.write(JSON.stringify({
      message:
        "Warning: Researcher completed but source-map.json was not recently updated. " +
        "Ensure retrieved sources are recorded.",
    }));
  }

  process.exit(0);
}

// --- Reporter: blueprint.json must exist and be non-empty ---
if (isReporter) {
  const path = `${PROJECT_ROOT}/ontology-state/blueprint.json`;

  if (!existsSync(path)) {
    process.stderr.write(
      "BLOCKED: Reporter completed but blueprint.json does not exist. " +
      "Reporter must produce ontology-state/blueprint.json."
    );
    process.exit(2);
  }

  try {
    const content = await Bun.file(path).text();
    const data = JSON.parse(content);
    const isEmpty =
      Object.keys(data).length === 0 ||
      data.blueprint === null ||
      data.blueprint === undefined;
    if (isEmpty) {
      process.stderr.write(
        "BLOCKED: Reporter completed but blueprint.json is empty or has null blueprint field. " +
        "Reporter must produce a non-empty blueprint."
      );
      process.exit(2);
    }
  } catch {
    process.stderr.write(
      "BLOCKED: Reporter completed but blueprint.json could not be parsed."
    );
    process.exit(2);
  }
}

process.exit(0);

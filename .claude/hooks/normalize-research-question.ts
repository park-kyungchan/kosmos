#!/usr/bin/env bun
/**
 * Hook: normalize-research-question — KOSMOS-SPECIFIC OVERRIDE (Phase A-2 W2-3)
 * Event: PreToolUse (Agent)
 *
 * Advisory-only check that researcher agents are spawned with structured
 * ResearchQuestion payloads rather than free-form prompts.
 *
 * NOT covered by palantir-mini plugin v1.1 — kosmos-specific research pipeline
 * discipline (retrieves evidence into ontology-state/source-map.json).
 *
 * Exit codes:
 *   0 = allow (always)
 */

export {};

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
const agentType = payload.tool_input?.subagent_type || payload.tool_input?.description || "";

const isResearchAgent =
  agentType.toLowerCase().includes("research") ||
  prompt.toLowerCase().includes("research") ||
  prompt.toLowerCase().includes("retrieve") ||
  prompt.toLowerCase().includes("evidence");

if (!isResearchAgent) {
  process.exit(0);
}

const hasStructuredQuestions =
  prompt.includes("ResearchQuestion") ||
  prompt.includes("QUESTION:") ||
  prompt.includes("question:") ||
  /\d+\.\s+(What|How|Why|Where|When|Which|Is|Are|Can|Does|Should)/i.test(prompt);

if (!hasStructuredQuestions) {
  process.stdout.write(JSON.stringify({
    message:
      "Advisory: Research agent spawned without explicit research questions. " +
      "Consider decomposing into numbered ResearchQuestion objects first.",
  }));
}

process.exit(0);

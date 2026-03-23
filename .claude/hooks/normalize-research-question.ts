#!/usr/bin/env bun
/**
 * Hook: normalize-research-question
 * Event: PreToolUse (Agent)
 *
 * When spawning a research-type agent, verifies that the prompt contains
 * structured research questions (not vague instructions).
 *
 * This hook logs warnings but does not block — it's advisory.
 *
 * Exit codes:
 *   0 = allow (always — advisory only)
 */

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
try {
  payload = JSON.parse(input);
} catch {
  process.exit(0);
}

const { tool_input } = payload;
const prompt = tool_input.prompt || "";
const agentType = tool_input.subagent_type || tool_input.description || "";

// Only check research-related agent spawns
const isResearchAgent =
  agentType.toLowerCase().includes("research") ||
  prompt.toLowerCase().includes("research") ||
  prompt.toLowerCase().includes("retrieve") ||
  prompt.toLowerCase().includes("evidence");

if (!isResearchAgent) {
  process.exit(0);
}

// Check if the prompt contains structured question markers
const hasStructuredQuestions =
  prompt.includes("ResearchQuestion") ||
  prompt.includes("QUESTION:") ||
  prompt.includes("question:") ||
  /\d+\.\s+(What|How|Why|Where|When|Which|Is|Are|Can|Does|Should)/i.test(prompt);

if (!hasStructuredQuestions) {
  process.stdout.write(
    JSON.stringify({
      message:
        "Advisory: Research agent spawned without explicit research questions. " +
        "Consider decomposing the request into numbered ResearchQuestion objects " +
        "before delegating to the researcher agent.",
    })
  );
}

process.exit(0);

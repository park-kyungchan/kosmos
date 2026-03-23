#!/usr/bin/env bun
/**
 * Hook: normalize-research-question (Phase 3 — Advisory, portable)
 * Event: PreToolUse (Agent)
 *
 * Checks that research agents are spawned with structured questions.
 * Advisory only — logs warnings but does not block.
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

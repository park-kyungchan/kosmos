#!/usr/bin/env bun
/**
 * Hook: enforce-browse-protocol (Phase 3 — BLOCKING, portable)
 * Event: PreToolUse (Grep | Read)
 *
 * BLOCKS broad unbounded scanning of the research library.
 * Allows targeted marker-based grep (the correct browse protocol).
 *
 * Environment: KOSMOS_RESEARCH_BASE (fallback: ~/.claude/research)
 *
 * Exit codes:
 *   0 = allow (targeted query or non-research path)
 *   2 = block (broad scan of research library)
 */

export {};

const input = await Bun.stdin.text();

interface HookPayload {
  tool_name: string;
  tool_input: {
    pattern?: string;
    path?: string;
    file_path?: string;
  };
}

let payload: HookPayload;
try {
  payload = JSON.parse(input);
} catch {
  process.exit(0);
}

const { tool_name, tool_input } = payload;

const RESEARCH_BASE =
  process.env.KOSMOS_RESEARCH_BASE ||
  `${process.env.HOME || "~"}/.claude/research`;

const targetPath = tool_input.path || tool_input.file_path || "";
const isResearchTarget = targetPath.includes(".claude/research");

if (!isResearchTarget) {
  process.exit(0);
}

// BROWSE.md and INDEX.md are always allowed — they're the entry point
if (targetPath.endsWith("BROWSE.md") || targetPath.endsWith("INDEX.md")) {
  process.exit(0);
}

if (tool_name === "Grep") {
  const pattern = tool_input.pattern || "";

  const isBroadPattern =
    /^\.\*$/.test(pattern) ||
    /^\.\+$/.test(pattern) ||
    pattern.length <= 2;

  // Check if path targets root (not domain-scoped)
  const normalized = targetPath.replace(/\/+$/, "");
  const isRootScan =
    normalized.endsWith("/research") ||
    normalized.endsWith("/research/palantir");

  if (isBroadPattern && isRootScan) {
    process.stderr.write(
      "BLOCKED: Broad unbounded scan of research library.\n" +
      "Use BROWSE.md protocol: Question -> Recipe -> Grep (specific markers) -> Compose -> Reason.\n" +
      "Required: specific pattern (>2 chars) OR domain-scoped path (e.g., palantir/logic/).\n" +
      "Example: Grep({ pattern: '\\\\[§LOGIC\\\\.FN-15\\\\]', path: '~/.claude/research/palantir/logic/' })"
    );
    process.exit(2);
  }

  if (isRootScan && !pattern.includes("§")) {
    process.stderr.write(
      "BLOCKED: Root-level grep on research library without marker pattern.\n" +
      "Scope your grep to a domain directory (e.g., palantir/data/, palantir/logic/).\n" +
      "Or use §-marker patterns to target specific sections."
    );
    process.exit(2);
  }
}

process.exit(0);

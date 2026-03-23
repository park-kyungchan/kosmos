#!/usr/bin/env bun
/**
 * Hook: enforce-browse-protocol (Phase 2 — BLOCKING)
 * Event: PreToolUse (Grep | Read)
 *
 * BLOCKS broad unbounded scanning of the research library.
 * Allows targeted marker-based grep (the correct browse protocol).
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

const RESEARCH_PATH = "/home/palantirkc/.claude/research";

const targetPath = tool_input.path || tool_input.file_path || "";
const isResearchTarget = targetPath.includes(".claude/research");

if (!isResearchTarget) {
  process.exit(0);
}

// BROWSE.md and INDEX.md are always allowed — they're the entry point
if (
  targetPath.endsWith("BROWSE.md") ||
  targetPath.endsWith("INDEX.md")
) {
  process.exit(0);
}

if (tool_name === "Grep") {
  const pattern = tool_input.pattern || "";

  // Block overly broad patterns on the research library
  const isBroadPattern =
    /^\.\*$/.test(pattern) ||
    /^\.\+$/.test(pattern) ||
    pattern.length <= 2;

  // Check if path is too broad (root of research/ without domain scoping)
  const isRootScan =
    targetPath === RESEARCH_PATH ||
    targetPath === `${RESEARCH_PATH}/` ||
    targetPath === `${RESEARCH_PATH}/palantir` ||
    targetPath === `${RESEARCH_PATH}/palantir/`;

  if (isBroadPattern && isRootScan) {
    process.stderr.write(
      "BLOCKED: Broad unbounded scan of research library.\n" +
      "Use BROWSE.md protocol: Question -> Recipe -> Grep (specific markers) -> Compose -> Reason.\n" +
      "Required: specific pattern (>2 chars) OR domain-scoped path (e.g., palantir/logic/).\n" +
      "Example: Grep({ pattern: '\\\\[§LOGIC\\\\.FN-15\\\\]', path: '~/.claude/research/palantir/logic/' })"
    );
    process.exit(2);
  }

  // Block root-level scan even with specific pattern
  if (isRootScan && !pattern.includes("§")) {
    process.stderr.write(
      "BLOCKED: Root-level grep on research library without marker pattern.\n" +
      "Scope your grep to a domain directory (e.g., palantir/data/, palantir/logic/).\n" +
      "Or use §-marker patterns to target specific sections."
    );
    process.exit(2);
  }
}

// Targeted operations are allowed
process.exit(0);

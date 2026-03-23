#!/usr/bin/env bun
/**
 * Hook: enforce-browse-protocol
 * Event: PreToolUse (Grep | Read)
 *
 * Blocks broad unbounded scanning of the research library.
 * Allows targeted marker-based grep (the correct browse protocol).
 *
 * Exit codes:
 *   0 = allow (targeted query or non-research path)
 *   2 = block (broad scan of research library)
 */

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
  // If we can't parse, allow the tool call
  process.exit(0);
}

const { tool_name, tool_input } = payload;

const RESEARCH_PATH = "/home/palantirkc/.claude/research";

// Check if the tool targets the research library
const targetPath = tool_input.path || tool_input.file_path || "";
const isResearchTarget = targetPath.includes(".claude/research");

if (!isResearchTarget) {
  // Not targeting research library — allow
  process.exit(0);
}

if (tool_name === "Grep") {
  const pattern = tool_input.pattern || "";

  // Block overly broad patterns on the research library
  const broadPatterns = [
    /^\.\*$/,          // match everything
    /^\.\+$/,          // match anything
    /^.{0,3}$/,        // patterns too short to be meaningful
  ];

  const isBroad = broadPatterns.some((re) => re.test(pattern));

  // Check if path is too broad (root of research/ without domain scoping)
  const isRootScan =
    targetPath === RESEARCH_PATH ||
    targetPath === `${RESEARCH_PATH}/` ||
    targetPath === `${RESEARCH_PATH}/palantir` ||
    targetPath === `${RESEARCH_PATH}/palantir/`;

  if (isBroad && isRootScan) {
    process.stderr.write(
      "BLOCKED: Broad unbounded scan of research library.\n" +
      "Use BROWSE.md protocol: Question -> Recipe -> Grep (targeted markers) -> Compose -> Reason.\n" +
      "Example: Grep({ pattern: '\\\\[§LOGIC\\\\.FN-15\\\\]', path: '~/.claude/research/palantir/logic/' })"
    );
    process.exit(2);
  }
}

if (tool_name === "Read") {
  // Reading specific files is fine — the protocol allows it after grep
  // We only block if someone tries to read INDEX.md or BROWSE.md
  // without following up with targeted grep (can't enforce this here)
}

// Allow targeted operations
process.exit(0);

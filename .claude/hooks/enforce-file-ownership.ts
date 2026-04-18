/**
 * enforce-file-ownership.ts — KOSMOS-SPECIFIC OVERRIDE (Phase A-2 W2-3)
 * Event: PreToolUse (Edit|Write)
 *
 * Checks that the teammate writing a file is allowed to write
 * that path per the kosmos-registry.json `writablePaths` contract.
 *
 * NOT covered by palantir-mini plugin v1.1 — path RBAC is kosmos-specific
 * (writablePaths live in kosmos-registry.json, not in agent frontmatter).
 *
 * Exit 0 = allow, Exit 2 = block + stderr feedback.
 */

export {};

import { readFileSync } from "fs";
import { resolve } from "path";

interface HookInput {
  tool_name?: string;
  tool_input?: { file_path?: string };
  teammate_name?: string;
  team_name?: string;
}

interface AgentConfig {
  writablePaths: string[];
  allowedTags: string[];
  [key: string]: unknown;
}

interface KosmosRegistry {
  agents: Record<string, AgentConfig>;
  [key: string]: unknown;
}

const PROJECT_ROOT = process.env.KOSMOS_PROJECT_ROOT || ".";
const REGISTRY_PATH = resolve(PROJECT_ROOT, ".claude/kosmos-registry.json");

function readRegistry(): KosmosRegistry | null {
  try {
    return JSON.parse(readFileSync(REGISTRY_PATH, "utf-8")) as KosmosRegistry;
  } catch {
    return null;
  }
}

function matchesWritablePath(relativePath: string, pattern: string): boolean {
  // Glob pattern like "prototype/**" or "prototype/tests/**"
  if (pattern.endsWith("/**")) {
    const prefix = pattern.slice(0, -3); // strip "/**"
    return relativePath === prefix || relativePath.startsWith(prefix + "/");
  }
  // Exact path match
  return relativePath === pattern;
}

const input = await Bun.stdin.text();
let hookInput: HookInput = {};
try {
  hookInput = JSON.parse(input);
} catch {
  process.exit(0);
}

const { teammate_name, team_name, tool_input } = hookInput;

// Not a team context — allow
if (!teammate_name || !team_name) {
  process.exit(0);
}

const registry = readRegistry();
if (!registry) {
  process.exit(0);
}

const agentConfig = registry.agents[teammate_name];
// Not a registered kosmos agent — allow
if (!agentConfig) {
  process.exit(0);
}

const filePath = tool_input?.file_path;
if (!filePath) {
  process.exit(0);
}

// Make path relative to PROJECT_ROOT
const absoluteRoot = resolve(PROJECT_ROOT);
const absoluteFile = resolve(filePath);
let relativePath = absoluteFile.startsWith(absoluteRoot)
  ? absoluteFile.slice(absoluteRoot.length + 1)
  : filePath;

// Normalize separators
relativePath = relativePath.replace(/\\/g, "/");

const writablePaths = agentConfig.writablePaths || [];
const allowed = writablePaths.some((pattern) =>
  matchesWritablePath(relativePath, pattern)
);

if (!allowed) {
  process.stderr.write(
    `BLOCKED: ${teammate_name} cannot write to ${relativePath}. ` +
    `Allowed: ${writablePaths.join(", ")}`
  );
  process.exit(2);
}

process.exit(0);

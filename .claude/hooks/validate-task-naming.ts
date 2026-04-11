/**
 * validate-task-naming.ts — TaskCreated hook
 *
 * Ensures all tasks in kosmos-research teams have valid [TAG] prefixes
 * drawn from the phases[] list in kosmos-registry.json.
 * Exit 0 = allow, Exit 2 = block + stderr feedback.
 */

export {};

import { readFileSync } from "fs";
import { resolve } from "path";

interface HookInput {
  task_subject?: string;
  team_name?: string;
}

interface PhaseEntry {
  tag: string;
  order: number;
  dependsOn: string[];
}

interface KosmosRegistry {
  phases: PhaseEntry[];
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

const input = await Bun.stdin.text();
let hookInput: HookInput = {};
try {
  hookInput = JSON.parse(input);
} catch {
  process.exit(0);
}

const { task_subject, team_name } = hookInput;

// Only enforce for kosmos teams
if (!team_name || !team_name.toLowerCase().includes("kosmos")) {
  process.exit(0);
}

const registry = readRegistry();
if (!registry) {
  process.exit(0);
}

const phases = registry.phases || [];
const validTags = phases.map((p) => p.tag);

// Extract [TAG] from task subject
const tagMatch = (task_subject || "").match(/\[([A-Z-]+)\]/);
if (!tagMatch) {
  process.stderr.write(
    `BLOCKED: Task must start with [TAG]. Valid tags: ${validTags.join(", ")}\n` +
    `Received: "${task_subject || ""}"`
  );
  process.exit(2);
}

const tag = tagMatch[1];
if (!validTags.includes(tag)) {
  process.stderr.write(
    `BLOCKED: Unknown tag [${tag}]. Valid: ${validTags.join(", ")}`
  );
  process.exit(2);
}

process.exit(0);

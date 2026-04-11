/**
 * idle-cost-guard.ts — TeammateIdle hook for token cost optimization
 *
 * Problem: Idle teammates burn per-turn tokens on every idle notification
 * cycle. An agent blocked for 10+ minutes with nothing to do wastes
 * significant context window and API cost.
 *
 * Solution: Track idle duration per teammate. When a teammate exceeds
 * the cost threshold, inject a shutdown recommendation to Lead.
 * For teammates whose dependencies are far from being met, exit 2
 * to send them a "sleep until signaled" feedback.
 *
 * Hook event: TeammateIdle
 * Exit 0 + stdout = advisory to Lead (context injection)
 * Exit 2 + stderr = feedback to teammate (block idle, send instruction)
 *
 * Hook input fields:
 *   teammate_name: string
 *   team_name: string
 *   agent_id: string
 */

import { existsSync, readFileSync, writeFileSync, mkdirSync } from "fs";
import { resolve, dirname } from "path";

const HOME = process.env.HOME || "/home/palantirkc";
const PROJECT_ROOT = process.env.KOSMOS_PROJECT_ROOT || ".";

interface TeammateIdleInput {
  teammate_name?: string;
  team_name?: string;
  agent_id?: string;
}

interface IdleTracker {
  /** Timestamp of first idle notification this cycle */
  firstIdleAt: string;
  /** Count of consecutive idle notifications */
  idleCount: number;
  /** Last idle timestamp */
  lastIdleAt: string;
}

interface IdleState {
  [agentName: string]: IdleTracker;
}

interface TaskFile {
  id: string;
  subject: string;
  status: string;
  owner?: string;
  blockedBy?: string[];
}

function readJSON<T>(path: string): T | null {
  try {
    return JSON.parse(readFileSync(path, "utf-8")) as T;
  } catch {
    return null;
  }
}

/**
 * Persistent idle tracker — survives across hook invocations
 */
function getIdleStatePath(teamName: string): string {
  return resolve(HOME, `.claude/teams/${teamName}/idle-state.json`);
}

function loadIdleState(teamName: string): IdleState {
  const path = getIdleStatePath(teamName);
  return readJSON<IdleState>(path) || {};
}

function saveIdleState(teamName: string, state: IdleState): void {
  const path = getIdleStatePath(teamName);
  const dir = dirname(path);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  writeFileSync(path, JSON.stringify(state, null, 2));
}

/**
 * Check how many dependency levels separate this agent from actionable work
 */
function getDepthToReady(agentName: string, teamName: string): number {
  const taskDir = resolve(HOME, `.claude/tasks/${teamName}`);
  if (!existsSync(taskDir)) return 999;

  // Load registry to get agent's allowed tags
  const registryPath = resolve(PROJECT_ROOT, ".claude/kosmos-registry.json");
  const registry = readJSON<any>(registryPath);
  if (!registry?.agents?.[agentName]) return 999;

  const allowedTags: string[] = registry.agents[agentName].allowedTags || [];

  // Find tasks matching this agent's tags
  const { readdirSync } = require("fs");
  const taskFiles = readdirSync(taskDir).filter((f: string) => f.endsWith(".json") && f !== ".lock");
  const tasks: TaskFile[] = [];

  for (const file of taskFiles) {
    const task = readJSON<any>(resolve(taskDir, file));
    if (!task) continue;
    tasks.push({
      id: task.id || file.replace(".json", ""),
      subject: task.subject || "",
      status: task.status || "pending",
      owner: task.owner,
      blockedBy: task.blockedBy || [],
    });
  }

  // Find this agent's tasks
  const myTasks = tasks.filter((t) => {
    const tagMatch = t.subject.match(/\[([A-Z_-]+)\]/i);
    return tagMatch && allowedTags.map((at) => at.toUpperCase()).includes(tagMatch[1].toUpperCase());
  });

  if (myTasks.length === 0) return 999;

  // Check if any of my tasks are ready (unblocked)
  for (const task of myTasks) {
    if (task.status === "in_progress") return 0; // Already working
    if (!task.blockedBy || task.blockedBy.length === 0) return 0; // Ready to claim

    // Count depth: how many of my blockers are themselves blocked?
    const blockerStatuses = task.blockedBy.map((bid) => {
      const blocker = tasks.find((t) => t.id === bid);
      return blocker?.status || "pending";
    });

    const allBlockersCompleted = blockerStatuses.every((s) => s === "completed");
    if (allBlockersCompleted) return 0;

    const inProgressBlockers = blockerStatuses.filter((s) => s === "in_progress").length;
    if (inProgressBlockers > 0) return 1; // Close — a blocker is being worked on

    return 2; // Far — blockers are themselves blocked
  }

  return 999;
}

// --- Thresholds ---
/** After this many consecutive idle notifications, warn Lead */
const WARN_IDLE_COUNT = 3;
/** After this many, recommend shutdown to save tokens */
const SHUTDOWN_IDLE_COUNT = 6;
/** If dependency depth >= this, tell teammate to stop polling */
const DEEP_BLOCK_DEPTH = 2;

async function main() {
  let raw = "";
  for await (const chunk of Bun.stdin.stream()) {
    raw += new TextDecoder().decode(chunk);
  }

  let input: TeammateIdleInput;
  try {
    input = JSON.parse(raw);
  } catch {
    process.exit(0);
  }

  const teamName = input.team_name || "kosmos-research";
  const agentName = input.teammate_name || "unknown";
  const now = new Date().toISOString();

  // Load and update idle tracker
  const state = loadIdleState(teamName);
  const tracker = state[agentName] || { firstIdleAt: now, idleCount: 0, lastIdleAt: now };
  tracker.idleCount += 1;
  tracker.lastIdleAt = now;
  state[agentName] = tracker;
  saveIdleState(teamName, state);

  // Check dependency depth
  const depth = getDepthToReady(agentName, teamName);

  // Calculate idle duration in minutes
  const idleMinutes = Math.round(
    (new Date(now).getTime() - new Date(tracker.firstIdleAt).getTime()) / 60000
  );

  // --- Decision Logic ---

  // Case 1: Agent is deeply blocked AND has been idle too long
  // → Tell the agent to stop polling (exit 2 = feedback)
  if (depth >= DEEP_BLOCK_DEPTH && tracker.idleCount >= SHUTDOWN_IDLE_COUNT) {
    process.stderr.write(
      `TOKEN COST GUARD: You have been idle for ${tracker.idleCount} cycles (${idleMinutes}min). ` +
      `Your tasks are ${depth} dependency levels away from being actionable. ` +
      `STOP POLLING: Do not check TaskList again until you receive a SendMessage ` +
      `from the agent that unblocks your dependency. This saves tokens. ` +
      `Simply wait for a message — your inbox will wake you.`
    );
    process.exit(2);
  }

  // Case 2: Agent has been idle for a while — warn Lead
  if (tracker.idleCount >= WARN_IDLE_COUNT) {
    const severity = tracker.idleCount >= SHUTDOWN_IDLE_COUNT ? "HIGH" : "MEDIUM";
    process.stdout.write(
      `[COST-${severity}] ${agentName}: idle ${tracker.idleCount} cycles (${idleMinutes}min), ` +
      `depth-to-ready=${depth}. ` +
      (tracker.idleCount >= SHUTDOWN_IDLE_COUNT
        ? `Consider shutdown_request to ${agentName} — re-spawn when dependency met.`
        : `Monitoring — will auto-throttle at ${SHUTDOWN_IDLE_COUNT} cycles.`)
    );
    process.exit(0);
  }

  // Case 3: Normal idle — no action needed
  process.exit(0);
}

main().catch(() => process.exit(0));

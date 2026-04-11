/**
 * auto-shutdown-completed.ts — TaskCompleted hook for auto-shutdown
 *
 * When a teammate completes a task, check if they have any remaining
 * uncompleted tasks. If not, inject a shutdown recommendation to Lead
 * and instruct the agent to stop.
 *
 * This enables "lazy-spawn + auto-shutdown" architecture:
 * - Agents are spawned only when their dependencies are met
 * - Agents auto-shutdown when all their tasks are done
 * - Zero idle token waste
 *
 * Hook event: TaskCompleted
 * Exit 0 + stdout = context injection to Lead
 */

import { existsSync, readFileSync, readdirSync } from "fs";
import { resolve } from "path";

const HOME = process.env.HOME || "/home/palantirkc";
const PROJECT_ROOT = process.env.KOSMOS_PROJECT_ROOT || ".";

interface TaskCompletedInput {
  task_id?: string;
  task_subject?: string;
  teammate_name?: string;
  team_name?: string;
}

function readJSON<T>(path: string): T | null {
  try {
    return JSON.parse(readFileSync(path, "utf-8")) as T;
  } catch {
    return null;
  }
}

async function main() {
  let raw = "";
  for await (const chunk of Bun.stdin.stream()) {
    raw += new TextDecoder().decode(chunk);
  }

  let input: TaskCompletedInput;
  try {
    input = JSON.parse(raw);
  } catch {
    process.exit(0);
  }

  const teamName = input.team_name || "kosmos-research";
  const agentName = input.teammate_name;
  if (!agentName) process.exit(0);

  // Load registry to get agent's allowed tags
  const registryPath = resolve(PROJECT_ROOT, ".claude/kosmos-registry.json");
  const registry = readJSON<any>(registryPath);
  if (!registry?.agents?.[agentName]) process.exit(0);

  const allowedTags: string[] = registry.agents[agentName].allowedTags || [];

  // Load all tasks
  const taskDir = resolve(HOME, `.claude/tasks/${teamName}`);
  if (!existsSync(taskDir)) process.exit(0);

  const taskFiles = readdirSync(taskDir).filter(
    (f) => f.endsWith(".json") && f !== ".lock"
  );

  let hasRemainingWork = false;

  for (const file of taskFiles) {
    const task = readJSON<any>(resolve(taskDir, file));
    if (!task) continue;

    // Skip completed/deleted tasks
    if (task.status === "completed" || task.status === "deleted") continue;

    // Check if this task belongs to the completing agent
    const tagMatch = (task.subject || "").match(/\[([A-Z_-]+)\]/i);
    if (!tagMatch) continue;

    const tag = tagMatch[1].toUpperCase();
    if (allowedTags.map((t) => t.toUpperCase()).includes(tag)) {
      hasRemainingWork = true;
      break;
    }
  }

  if (!hasRemainingWork) {
    // Agent has no remaining tasks — recommend shutdown
    process.stdout.write(
      `[AUTO-SHUTDOWN] ${agentName} completed all assigned tasks ` +
      `(tags: ${allowedTags.join(", ")}). ` +
      `Send shutdown_request to ${agentName} to free tokens. ` +
      `Re-spawn only if debate loop requires this agent.`
    );
  }

  process.exit(0);
}

main().catch(() => process.exit(0));

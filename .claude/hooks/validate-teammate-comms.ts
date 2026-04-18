/**
 * validate-teammate-comms.ts — KOSMOS-SPECIFIC OVERRIDE (Phase A-2 W2-3)
 * Event: TaskCompleted
 *
 * When a teammate completes a task, verify that they sent the required
 * notification to the downstream agent (per kosmos-registry.json
 * notifyOnComplete). Catches silent completions where an agent marks a task
 * done but forgets to SendMessage the next agent in the pipeline.
 *
 * NOT covered by palantir-mini plugin v1.1 — handoff contract lives in
 * kosmos-registry.json `notifyOnComplete`, not in any generic event schema.
 *
 * Exit 0 + stdout = advisory (communication was verified or no check needed)
 * Exit 2 + stderr = block completion (required notification missing)
 */

import { readFileSync } from "fs";
import { resolve } from "path";

const HOME = process.env.HOME || "/home/palantirkc";
const PROJECT_ROOT = process.env.KOSMOS_PROJECT_ROOT || ".";

interface TaskCompletedInput {
  task_id?: string;
  task_subject?: string;
  teammate_name?: string;
  team_name?: string;
}

interface InboxMessage {
  from: string;
  text: string;
  summary?: string;
  timestamp: string;
  read: boolean;
}

function readJSON<T>(path: string): T | null {
  try {
    return JSON.parse(readFileSync(path, "utf-8")) as T;
  } catch {
    return null;
  }
}

function fail(message: string): never {
  process.stderr.write(message);
  process.exit(2);
}

/**
 * Check if agent A sent a message to agent B's inbox
 * within the last N minutes
 */
function hasRecentMessage(
  teamName: string,
  fromAgent: string,
  toAgent: string,
  withinMinutes: number = 10
): boolean {
  const inboxPath = resolve(HOME, `.claude/teams/${teamName}/inboxes/${toAgent}.json`);
  const messages = readJSON<InboxMessage[]>(inboxPath);
  if (!Array.isArray(messages)) return false;

  const cutoff = Date.now() - withinMinutes * 60 * 1000;

  return messages.some((m) => {
    if (m.from !== fromAgent) return false;
    const msgTime = new Date(m.timestamp).getTime();
    if (isNaN(msgTime)) return false;
    return msgTime > cutoff;
  });
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

  // Load registry
  const registryPath = resolve(PROJECT_ROOT, ".claude/kosmos-registry.json");
  const registry = readJSON<any>(registryPath);
  if (!registry?.agents?.[agentName]) process.exit(0);

  const agent = registry.agents[agentName];
  const notifyTargets: string[] = agent.notifyOnComplete || [];

  if (notifyTargets.length === 0) {
    // No required notifications — pass
    process.exit(0);
  }

  // Check if agent sent messages to all required targets
  const missingNotifications: string[] = [];

  for (const target of notifyTargets) {
    if (!hasRecentMessage(teamName, agentName, target, 15)) {
      missingNotifications.push(target);
    }
  }

  if (missingNotifications.length > 0) {
    fail(
      `Communication BLOCKED: ${agentName} must notify [${missingNotifications.join(", ")}] ` +
      `before marking task complete (per kosmos-registry.json notifyOnComplete). ` +
      `Use SendMessage to notify ${missingNotifications.join(" and ")} with your findings summary, ` +
      `then mark the task complete again.`
    );
  }

  // All notifications verified
  process.stdout.write(
    `[COMMS-OK] ${agentName} → ${notifyTargets.join(", ")}: notifications verified`
  );
  process.exit(0);
}

main().catch(() => process.exit(0));

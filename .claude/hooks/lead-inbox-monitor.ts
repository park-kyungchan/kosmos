/**
 * lead-inbox-monitor.ts — TeammateIdle hook for Lead real-time orchestration
 *
 * Fires every time a teammate goes idle. Reads the team inbox directory
 * and task state to inject a concise orchestration summary into Lead's context.
 *
 * Exit 0 + stdout = context injection (advisory)
 * Exit 2 + stderr = block idle + feedback to teammate (use sparingly)
 *
 * Hook input fields (TeammateIdle):
 *   teammate_name: string — which teammate just went idle
 *   team_name: string — team identifier
 *   agent_id: string — agent instance ID
 */

import { existsSync, readFileSync, readdirSync } from "fs";
import { resolve, basename } from "path";

const HOME = process.env.HOME || "/home/palantirkc";
const PROJECT_ROOT = process.env.KOSMOS_PROJECT_ROOT || ".";

interface TeammateIdleInput {
  teammate_name?: string;
  team_name?: string;
  agent_id?: string;
}

interface InboxMessage {
  from: string;
  text: string;
  summary?: string;
  timestamp: string;
  color?: string;
  read: boolean;
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

function getTeamDir(teamName: string): string {
  return resolve(HOME, ".claude/teams", teamName);
}

function getTaskDir(teamName: string): string {
  return resolve(HOME, ".claude/tasks", teamName);
}

/**
 * Read all inboxes and compute unread counts + latest message per agent
 */
function getInboxSummary(teamName: string): Map<string, { total: number; unread: number; latest: string | null; latestTime: string | null }> {
  const inboxDir = resolve(getTeamDir(teamName), "inboxes");
  const result = new Map<string, { total: number; unread: number; latest: string | null; latestTime: string | null }>();

  if (!existsSync(inboxDir)) return result;

  for (const file of readdirSync(inboxDir)) {
    if (!file.endsWith(".json")) continue;
    const agentName = basename(file, ".json");
    const messages = readJSON<InboxMessage[]>(resolve(inboxDir, file));
    if (!Array.isArray(messages)) continue;

    const unread = messages.filter((m) => !m.read).length;
    const latest = messages.length > 0 ? messages[messages.length - 1] : null;

    result.set(agentName, {
      total: messages.length,
      unread,
      latest: latest?.summary || latest?.text?.slice(0, 80) || null,
      latestTime: latest?.timestamp || null,
    });
  }

  return result;
}

/**
 * Read all task files and compute pipeline progress
 */
function getTaskProgress(teamName: string): { completed: number; inProgress: number; pending: number; blocked: number; total: number; tasks: TaskFile[] } {
  const taskDir = getTaskDir(teamName);
  const tasks: TaskFile[] = [];

  if (!existsSync(taskDir)) return { completed: 0, inProgress: 0, pending: 0, blocked: 0, total: 0, tasks };

  for (const file of readdirSync(taskDir)) {
    if (!file.endsWith(".json") || file === ".lock") continue;
    const task = readJSON<any>(resolve(taskDir, file));
    if (!task) continue;
    tasks.push({
      id: task.id || basename(file, ".json"),
      subject: task.subject || "",
      status: task.status || "pending",
      owner: task.owner || undefined,
      blockedBy: task.blockedBy || [],
    });
  }

  // Sort by ID
  tasks.sort((a, b) => parseInt(a.id) - parseInt(b.id));

  return {
    completed: tasks.filter((t) => t.status === "completed").length,
    inProgress: tasks.filter((t) => t.status === "in_progress").length,
    pending: tasks.filter((t) => t.status === "pending" && (!t.blockedBy || t.blockedBy.length === 0)).length,
    blocked: tasks.filter((t) => t.status === "pending" && t.blockedBy && t.blockedBy.length > 0).length,
    total: tasks.length,
    tasks,
  };
}

/**
 * Read team config for member activity status
 */
function getMemberStatus(teamName: string): Map<string, { isActive: boolean; model: string }> {
  const configPath = resolve(getTeamDir(teamName), "config.json");
  const config = readJSON<any>(configPath);
  const result = new Map<string, { isActive: boolean; model: string }>();

  if (!config?.members) return result;

  for (const member of config.members) {
    if (member.name === "team-lead") continue;
    result.set(member.name, {
      isActive: member.isActive ?? false,
      model: member.model || "unknown",
    });
  }

  return result;
}

/**
 * Check ontology-state files for session freshness
 */
function getStateFreshness(): Record<string, { exists: boolean; sessionId: string | null; updatedAt: string | null }> {
  const files = ["decision-log.json", "source-map.json", "world-model.json", "scenarios.json", "eval-results.json", "blueprint.json"];
  const result: Record<string, { exists: boolean; sessionId: string | null; updatedAt: string | null }> = {};

  for (const file of files) {
    const path = resolve(PROJECT_ROOT, "ontology-state", file);
    if (!existsSync(path)) {
      result[file] = { exists: false, sessionId: null, updatedAt: null };
      continue;
    }
    const data = readJSON<any>(path);
    result[file] = {
      exists: true,
      sessionId: data?.sessionId || null,
      updatedAt: data?.lastUpdated || null,
    };
  }

  return result;
}

/**
 * Detect anomalies that need Lead attention
 */
function detectAnomalies(
  tasks: TaskFile[],
  memberStatus: Map<string, { isActive: boolean; model: string }>,
  inboxes: Map<string, { total: number; unread: number; latest: string | null; latestTime: string | null }>
): string[] {
  const anomalies: string[] = [];

  // 1. Active agent with no in-progress task
  for (const [name, status] of memberStatus) {
    if (status.isActive && !tasks.some((t) => t.owner === name && t.status === "in_progress")) {
      anomalies.push(`${name} is active but has no in_progress task`);
    }
  }

  // 2. In-progress task with inactive agent
  for (const task of tasks) {
    if (task.status === "in_progress" && task.owner) {
      const status = memberStatus.get(task.owner);
      if (status && !status.isActive) {
        anomalies.push(`T${task.id} in_progress but ${task.owner} is inactive — may be stalled`);
      }
    }
  }

  // 3. Unblocked pending tasks with no owner
  for (const task of tasks) {
    if (task.status === "pending" && (!task.blockedBy || task.blockedBy.length === 0) && !task.owner) {
      anomalies.push(`T${task.id} is unblocked and unowned — needs assignment`);
    }
  }

  // 4. Lead inbox has unread messages (non-idle)
  const leadInbox = inboxes.get("team-lead");
  if (leadInbox && leadInbox.unread > 0) {
    anomalies.push(`Lead has ${leadInbox.unread} unread inbox messages`);
  }

  return anomalies;
}

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
  const teammateName = input.teammate_name || "unknown";

  // Gather all runtime state
  const inboxes = getInboxSummary(teamName);
  const taskProgress = getTaskProgress(teamName);
  const memberStatus = getMemberStatus(teamName);
  const stateFreshness = getStateFreshness();
  const anomalies = detectAnomalies(taskProgress.tasks, memberStatus, inboxes);

  // Build concise summary for Lead context injection
  const lines: string[] = [];
  lines.push(`[ORCHESTRATION] ${teammateName} idle | Pipeline: ${taskProgress.completed}/${taskProgress.total} done, ${taskProgress.inProgress} active, ${taskProgress.pending} ready, ${taskProgress.blocked} blocked`);

  // Active agents
  const active = Array.from(memberStatus.entries())
    .filter(([, s]) => s.isActive)
    .map(([n]) => n);
  if (active.length > 0) {
    lines.push(`  Active: ${active.join(", ")}`);
  }

  // In-progress tasks
  const inProgressTasks = taskProgress.tasks.filter((t) => t.status === "in_progress");
  if (inProgressTasks.length > 0) {
    lines.push(`  Working: ${inProgressTasks.map((t) => `T${t.id}(${t.owner})`).join(", ")}`);
  }

  // Ready-to-claim tasks
  const readyTasks = taskProgress.tasks.filter(
    (t) => t.status === "pending" && (!t.blockedBy || t.blockedBy.length === 0)
  );
  if (readyTasks.length > 0) {
    lines.push(`  Ready: ${readyTasks.map((t) => `T${t.id}`).join(", ")}`);
  }

  // Anomalies
  if (anomalies.length > 0) {
    lines.push(`  ⚠ ${anomalies.join(" | ")}`);
  }

  // State file freshness (only show stale or missing)
  const staleFiles = Object.entries(stateFreshness)
    .filter(([, s]) => !s.exists || s.sessionId !== "jsxgraph-sequencer-001")
    .map(([f, s]) => `${f}${s.exists ? "(wrong session)" : "(missing)"}`);
  if (staleFiles.length > 0) {
    lines.push(`  State gaps: ${staleFiles.join(", ")}`);
  }

  // Output to stdout for Lead context injection
  process.stdout.write(lines.join("\n"));
  process.exit(0);
}

main().catch(() => process.exit(0));

/**
 * pipeline-status-inject.ts — UserPromptSubmit hook
 *
 * Every time the user sends a message, reads the native runtime state
 * (~/.claude/teams/ + ~/.claude/tasks/) and injects a formatted pipeline
 * status panel into Lead's context. This gives the user AND Lead a
 * real-time view of the entire pipeline.
 *
 * Hook event: UserPromptSubmit
 * Input: { prompt: string }
 * Output: stdout → additionalContext injected into Lead's next turn
 */

import { existsSync, readFileSync, readdirSync } from "fs";
import { resolve, basename } from "path";

const HOME = process.env.HOME || "/home/palantirkc";
const PROJECT_ROOT = process.env.KOSMOS_PROJECT_ROOT || ".";

function readJSON<T>(path: string): T | null {
  try {
    return JSON.parse(readFileSync(path, "utf-8")) as T;
  } catch {
    return null;
  }
}

interface TaskFile {
  id: string;
  subject: string;
  status: string;
  owner?: string;
  blockedBy?: string[];
  blocks?: string[];
  activeForm?: string;
}

interface InboxMessage {
  from: string;
  text: string;
  summary?: string;
  timestamp: string;
  read: boolean;
}

function loadTasks(teamName: string): TaskFile[] {
  const taskDir = resolve(HOME, `.claude/tasks/${teamName}`);
  if (!existsSync(taskDir)) return [];

  const tasks: TaskFile[] = [];
  for (const file of readdirSync(taskDir)) {
    if (!file.endsWith(".json") || file.startsWith(".")) continue;
    const task = readJSON<any>(resolve(taskDir, file));
    if (!task || !task.id) continue;
    tasks.push({
      id: task.id,
      subject: task.subject || "",
      status: task.status || "pending",
      owner: task.owner || undefined,
      blockedBy: task.blockedBy || [],
      blocks: task.blocks || [],
      activeForm: task.activeForm || undefined,
    });
  }
  return tasks.sort((a, b) => parseInt(a.id) - parseInt(b.id));
}

function loadMembers(teamName: string): { name: string; isActive: boolean; model: string }[] {
  const configPath = resolve(HOME, `.claude/teams/${teamName}/config.json`);
  const config = readJSON<any>(configPath);
  if (!config?.members) return [];

  return config.members
    .filter((m: any) => m.name !== "team-lead")
    .map((m: any) => ({
      name: m.name,
      isActive: m.isActive ?? false,
      model: m.model || "?",
    }));
}

function loadInboxStats(teamName: string): Map<string, { total: number; unread: number; lastFrom: string | null; lastTime: string | null }> {
  const inboxDir = resolve(HOME, `.claude/teams/${teamName}/inboxes`);
  const result = new Map();
  if (!existsSync(inboxDir)) return result;

  for (const file of readdirSync(inboxDir)) {
    if (!file.endsWith(".json")) continue;
    const name = basename(file, ".json");
    const msgs = readJSON<InboxMessage[]>(resolve(inboxDir, file));
    if (!Array.isArray(msgs)) continue;
    const unread = msgs.filter((m) => !m.read).length;
    const last = msgs.length > 0 ? msgs[msgs.length - 1] : null;
    result.set(name, {
      total: msgs.length,
      unread,
      lastFrom: last?.from || null,
      lastTime: last?.timestamp || null,
    });
  }
  return result;
}

function getStateFileStatus(): { file: string; fresh: boolean; session: string | null }[] {
  const files = ["decision-log.json", "source-map.json", "world-model.json", "scenarios.json", "eval-results.json", "blueprint.json"];
  return files.map((f) => {
    const path = resolve(PROJECT_ROOT, "ontology-state", f);
    if (!existsSync(path)) return { file: f, fresh: false, session: null };
    const data = readJSON<any>(path);
    return {
      file: f,
      fresh: !!data?.sessionId,
      session: data?.sessionId || null,
    };
  });
}

function statusIcon(status: string, blockedBy?: string[]): string {
  if (status === "completed") return "done";
  if (status === "in_progress") return "ACTIVE";
  if (status === "pending" && blockedBy && blockedBy.length > 0) return "blocked";
  if (status === "pending") return "READY";
  return status;
}

async function main() {
  let raw = "";
  for await (const chunk of Bun.stdin.stream()) {
    raw += new TextDecoder().decode(chunk);
  }

  // Only activate if a team exists
  const teamDir = resolve(HOME, ".claude/teams/kosmos-research");
  if (!existsSync(teamDir)) {
    process.exit(0);
  }

  const teamName = "kosmos-research";
  const tasks = loadTasks(teamName);
  const members = loadMembers(teamName);
  const inboxes = loadInboxStats(teamName);
  const stateFiles = getStateFileStatus();

  if (tasks.length === 0) {
    process.exit(0);
  }

  // Build status panel
  const lines: string[] = [];
  lines.push("=== KOSMOS PIPELINE STATUS ===");

  // Task progress
  const completed = tasks.filter((t) => t.status === "completed").length;
  const active = tasks.filter((t) => t.status === "in_progress").length;
  const ready = tasks.filter((t) => t.status === "pending" && (!t.blockedBy || t.blockedBy.length === 0)).length;
  const blocked = tasks.filter((t) => t.status === "pending" && t.blockedBy && t.blockedBy.length > 0).length;

  lines.push(`Progress: ${completed}/${tasks.length} done | ${active} active | ${ready} ready | ${blocked} blocked`);
  lines.push("");

  // Task table
  for (const t of tasks) {
    const icon = statusIcon(t.status, t.blockedBy);
    const tag = (t.subject.match(/\[([A-Z_-]+)\]/i) || ["", ""])[1];
    const ownerStr = t.owner ? ` (${t.owner})` : "";
    const blockedStr = t.blockedBy && t.blockedBy.length > 0 && t.status === "pending"
      ? ` [blocked by T${t.blockedBy.join(",T")}]`
      : "";
    const activeStr = t.activeForm && t.status === "in_progress" ? ` — ${t.activeForm}` : "";
    lines.push(`  T${t.id.padStart(2)} [${icon.padEnd(7)}] ${tag}${ownerStr}${blockedStr}${activeStr}`);
  }
  lines.push("");

  // Agent status
  lines.push("Agents:");
  const activeMembers = members.filter((m) => m.isActive);
  const inactiveMembers = members.filter((m) => !m.isActive);

  if (activeMembers.length > 0) {
    lines.push(`  Active: ${activeMembers.map((m) => m.name).join(", ")}`);
  }
  if (inactiveMembers.length > 0) {
    lines.push(`  Shutdown: ${inactiveMembers.map((m) => m.name).join(", ")}`);
  }
  if (members.length === 0) {
    lines.push("  No teammates (pre-spawn or all shutdown)");
  }

  // Communication check — recent inbox activity
  const leadInbox = inboxes.get("team-lead");
  if (leadInbox && leadInbox.unread > 0) {
    lines.push(`  Lead inbox: ${leadInbox.unread} unread`);
  }

  // State files
  const currentSession = stateFiles.find((s) => s.session)?.session || "unknown";
  const staleFiles = stateFiles.filter((s) => !s.fresh || (s.session && s.session !== currentSession));
  if (staleFiles.length > 0) {
    lines.push(`  State gaps: ${staleFiles.map((s) => s.file).join(", ")}`);
  }

  lines.push("=== END STATUS ===");

  process.stdout.write(lines.join("\n"));
  process.exit(0);
}

main().catch(() => process.exit(0));

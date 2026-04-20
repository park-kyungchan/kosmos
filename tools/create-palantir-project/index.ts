#!/usr/bin/env bun
// create-palantir-project — scaffold a palantir-mini v1.0 ready project.
//
// Usage:
//   bun run tools/create-palantir-project/index.ts <target-dir> [--name <project-name>]
//
// Produces a minimum-viable project structure that works with the
// palantir-mini plugin v1.0.0 out-of-the-box:
//   - package.json with @palantirKC/claude-schemas v1.0.0 peerDependency pin
//   - tsconfig.json with bun-compatible settings
//   - CLAUDE.md + AGENTS.md thin overlays
//   - .claude/managed-settings.d/50-palantir-mini.json v1 RBAC fragment
//   - .palantir-mini/session/ append-only event-log substrate
//   - ontology/README.md placeholder for project-owned ontology
//   - src/generated/.gitkeep placeholder for pm-codegen output
//
// After scaffolding, run `/pm-init` in the project directory to emit the
// first session_started event.

import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";

interface Args {
  targetDir: string;
  projectName: string;
  force: boolean;
}

function parseArgs(argv: string[]): Args {
  const args = argv.slice(2);
  if (args.length === 0 || args[0] === "--help" || args[0] === "-h") {
    printUsage();
    process.exit(args[0] === "--help" || args[0] === "-h" ? 0 : 1);
  }
  const targetDir = resolve(args[0]);
  let projectName = targetDir.split("/").pop() || "new-project";
  let force = false;
  for (let i = 1; i < args.length; i++) {
    if (args[i] === "--name" && args[i + 1]) {
      projectName = args[i + 1];
      i++;
    } else if (args[i] === "--force") {
      force = true;
    }
  }
  return { targetDir, projectName, force };
}

function printUsage(): void {
  console.log(`create-palantir-project — scaffold a palantir-mini v1.0 project

Usage:
  bun run tools/create-palantir-project/index.ts <target-dir> [--name <name>] [--force]

Options:
  <target-dir>    Absolute or relative path to the new project directory.
  --name <name>   Project name used in package.json (default: basename of target-dir).
  --force         Scaffold into an existing non-empty directory.

Example:
  bun run tools/create-palantir-project/index.ts ~/projects/my-ontology-app
`);
}

function walkTemplates(templatesRoot: string): string[] {
  const results: string[] = [];
  function walk(dir: string): void {
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry);
      if (statSync(full).isDirectory()) walk(full);
      else results.push(full);
    }
  }
  walk(templatesRoot);
  return results;
}

function render(content: string, vars: Record<string, string>): string {
  return content.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? `{{${key}}}`);
}

function scaffold(args: Args): void {
  const templatesRoot = resolve(import.meta.dirname, "templates");
  if (!existsSync(templatesRoot)) {
    console.error(`error: templates directory not found at ${templatesRoot}`);
    process.exit(1);
  }

  if (existsSync(args.targetDir)) {
    const contents = readdirSync(args.targetDir);
    if (contents.length > 0 && !args.force) {
      console.error(`error: ${args.targetDir} exists and is non-empty. Use --force to scaffold anyway.`);
      process.exit(1);
    }
  } else {
    mkdirSync(args.targetDir, { recursive: true });
  }

  const vars: Record<string, string> = {
    PROJECT_NAME: args.projectName,
    CREATED_AT: new Date().toISOString(),
  };

  const files = walkTemplates(templatesRoot);
  let written = 0;
  for (const source of files) {
    const rel = relative(templatesRoot, source);
    const target = join(args.targetDir, rel.replace(/\.template$/, ""));
    mkdirSync(dirname(target), { recursive: true });
    const raw = readFileSync(source, "utf8");
    writeFileSync(target, render(raw, vars));
    written++;
  }

  const eventsFile = join(args.targetDir, ".palantir-mini/session/events.jsonl");
  mkdirSync(dirname(eventsFile), { recursive: true });
  if (!existsSync(eventsFile)) writeFileSync(eventsFile, "");

  console.log(`scaffolded ${written} files into ${args.targetDir}`);
  console.log("");
  console.log("Next steps:");
  console.log(`  cd ${args.targetDir}`);
  console.log(`  /pm-init                              # emit first session_started event`);
  console.log(`  /pm-ontology-register or /pm-codegen # register or generate ontology artifacts`);
  console.log(`  /pm-verify                            # green-light the 6-phase validation pipeline`);
}

scaffold(parseArgs(process.argv));

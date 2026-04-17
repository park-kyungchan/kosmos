# 05 — Recommended Architecture: H-A++

> The full architecture specification for palantir-mini universalization across `~/kosmos`, `~/palantir-math`, `~/mathcrew`, plus a bootstrap template for new projects.

---

## 5.1 Three-Layer Design

```
                ┌──────────────────────────────────────────────┐
                │  Layer 1 — Plugin Marketplace (global)       │
                │  ~/.claude/plugins/palantir-mini/            │
                │  .claude-plugin/{marketplace,plugin}.json    │
                │  plugin.json.mcpServers → mcp__palantir-mini │
                └───────────────┬──────────────────────────────┘
                                │  /plugin install
                                ▼
            ┌──────────────────────────────────────────────────┐
            │  Layer 2 — Per-Project Bootstrap (pm-init)       │
            │  <project>/.palantir-mini/session/               │
            │  <project>/.claude/managed-settings.d/           │
            │  <project>/ontology/ (if new project)            │
            │  <project>/src/generated/ (codegen target)       │
            └───────────────┬──────────────────────────────────┘
                            │  event emissions + codegen runs
                            ▼
          ┌──────────────────────────────────────────────────────┐
          │  Layer 3 — Cross-Project Propagation                 │
          │  ~/.claude/schemas/ (shared, versioned)              │
          │  <project>/.palantir-mini/session/events.jsonl       │
          │  BackwardProp: events → drift → schema CHANGELOG     │
          │  ForwardProp: schema → pm-codegen → generated/       │
          └──────────────────────────────────────────────────────┘
```

---

## 5.2 Layer 1 — Plugin Marketplace

### Manifest upgrade (v0.1.0 → v0.2.0)

`~/.claude/plugins/palantir-mini/.claude-plugin/plugin.json` must add `mcpServers` block:

```json
{
  "name": "palantir-mini",
  "version": "0.2.0",
  "description": "Cross-project Ontology-First plugin: append-only event log + OSDK 2.0 patterns + 3-phase validation.",
  "author": { "name": "palantirKC" },
  "compatibleSchemaVersions": ">=0.2.0 <1.0.0",
  "mcpServers": {
    "palantir-mini": {
      "command": "bun",
      "args": ["${CLAUDE_PLUGIN_ROOT}/bridge/mcp-server.ts"],
      "env": {
        "PALANTIR_MINI_ROOT": "${CLAUDE_PLUGIN_ROOT}"
      }
    }
  },
  "hooks": "${CLAUDE_PLUGIN_ROOT}/hooks/hooks.json",
  "agents": "${CLAUDE_PLUGIN_ROOT}/agents",
  "skills": "${CLAUDE_PLUGIN_ROOT}/skills",
  "keywords": ["ontology", "event-log", "palantir", "osdk", "codegen", "native-runtime", "two-tier-actions", "edit-functions", "submission-criteria", "decision-lineage"]
}
```

**Evidence** (from section 02): Claim 3 CONFIRMED — Claude Code plugins support declarative `mcpServers` blocks in `plugin.json` that register globally at install time.

### Marketplace entry

`~/.claude/plugins/palantir-mini/.claude-plugin/marketplace.json` already exists (single-plugin marketplace). No change needed at v0.2.0.

### Install UX

```
# One-time (any session, any project):
/plugin marketplace add ~/.claude/plugins/palantir-mini
/plugin install palantir-mini@palantir-mini-marketplace

# After restart, every session has:
#   mcp__palantir-mini__emit_event
#   mcp__palantir-mini__get_ontology
#   mcp__palantir-mini__apply_edit_function
#   mcp__palantir-mini__commit_edits
#   mcp__palantir-mini__replay_lineage
```

---

## 5.3 Layer 2 — Per-Project Bootstrap (`pm-init`)

### pm-init contract

```
Usage: /pm-init [--force] [--project <path>]

Preconditions:
  - palantir-mini plugin installed (check via `/plugin list`)
  - Project is a git repo (warn otherwise)
  - Project has a package.json OR a bun.lock (warn otherwise)

Steps:
  1. Create <project>/.palantir-mini/session/{events.jsonl,snapshots,handoffs,locks}
  2. Write <project>/.claude/managed-settings.d/50-palantir-mini.json (RBAC fragment)
  3. Emit session_started event with reasoning: "pm-init bootstrap"
  4. If ontology/ dir exists, offer to run pm-codegen
  5. If ontology/ dir does not exist, offer to scaffold from ~/.claude/schemas/ontology/
  6. Report success + next-step hints

Idempotency:
  - If files exist AND match expected content, noop
  - If files exist AND diverge, warn and exit (unless --force)
  - If partial install detected, patch missing files only
```

### Idempotency table

| State | Action |
|-------|--------|
| No `.palantir-mini/` + no fragment | Full install |
| `.palantir-mini/` exists + fragment exists + versions match | Noop |
| `.palantir-mini/` exists + fragment missing (palantir-math case) | Patch fragment only |
| `.palantir-mini/` exists + fragment has drift | Warn + require --force |
| `.palantir-mini/` does not exist + fragment exists | Patch dir only |

---

## 5.4 Layer 3 — Cross-Project Propagation

### Shared Schemas (`~/.claude/schemas/`) as versioned interface

Introduce:
- `~/.claude/schemas/CHANGELOG.md` — semver-tracked history
- `~/.claude/schemas/package.json` — declares version (starts at `0.2.0` matching plugin)
- `~/.claude/schemas/.manifest.json` — machine-readable index of axes + files per axis

Consumer projects pin schema version via their own `package.json`:
```json
{
  "peerDependencies": {
    "@palantirKC/claude-schemas": "0.2.x"
  }
}
```

(Implementation option A: actually publish as npm package. Option B: bunx-style path reference with version check in pm-verify.)

### Codegen cross-project propagation

`pm-codegen` skill:
1. Reads `~/.claude/schemas/.manifest.json`
2. Reads `<project>/ontology/` (project-local extensions)
3. Composes shared + local → generates `<project>/src/generated/`
4. Emits `codegen_run` event to local events.jsonl
5. Writes generation header: `// Generated from schema v{X}.{Y}.{Z}, ontology hash {SHA}`

### BackwardProp

When `pm-verify` finds drift (generated file doesn't match current schema+ontology), it:
1. Emits `drift_detected` event
2. Proposes either (a) regenerate (if schema unchanged), or (b) schema CHANGELOG entry + semver bump (if schema needs to evolve)
3. Requires user approval for (b) — schema upgrade is a **user action**, not a subagent action

---

## 5.5 Per-Project Topology (target state)

### `~/kosmos` (already Brain v2 activated)
```
.palantir-mini/session/events.jsonl       (exists, 4 events)
.claude/managed-settings.d/50-palantir-mini.json  (needs verification)
ontology-state/*.json                      (exists; research artifacts)
# Uses plugin MCP server; no local mcp-server.ts reference
```

### `~/palantir-math` (partial — needs fragment)
```
.palantir-mini/session/                    (exists)
.claude/managed-settings.d/50-palantir-mini.json  (MISSING — pm-init patch)
ontology/**                                (exists; project ontology lives here)
src/generated/**                           (exists; pm-codegen target)
```

### `~/mathcrew` (fully activated)
```
.palantir-mini/session/                    (exists)
.claude/managed-settings.d/50-palantir-mini.json  (exists)
# Whatever ontology/codegen pattern currently used
```

### New-project template
```
<new-project>/.palantir-mini/session/      (pm-init creates)
<new-project>/.claude/managed-settings.d/50-palantir-mini.json  (pm-init writes)
<new-project>/ontology/                    (pm-init scaffolds template if missing)
<new-project>/src/generated/               (pm-codegen produces)
```

---

## 5.6 Runtime Behavior (one session, all projects)

A Claude Code session in any of the 3 projects after H-A++ is fully deployed:

```
1. SessionStart hook fires (plugin hook)
   → reads <project>/.palantir-mini/session/events.jsonl
   → injects last N events into context as prior state
   
2. User types a prompt, e.g. "add a new Obj type to ontology"

3. Claude Lead delegates to ontology-verifier subagent (plugin subagent)
   → subagent calls mcp__palantir-mini__emit_event before any edit
   → subagent calls mcp__palantir-mini__apply_edit_function
   
4. PostToolUse hook validates edit against schema version
   → if schema version outdated, blocks with drift signal
   
5. User confirms edit → mcp__palantir-mini__commit_edits
   → event_log appended with atomic commit record
   
6. Stop hook fires
   → pre-compact-state snapshots events.jsonl
   → stop-validate confirms invariants I-01 through I-06
```

All cross-project tooling (events.jsonl semantics, RBAC fragment, codegen rules) is **provided by the plugin** — projects don't carry their own copies.

---

## 5.7 Foundry Parallels (from external research section 02)

| H-A++ Layer | Foundry Parallel | Evidence |
|-------------|------------------|----------|
| Layer 1 plugin marketplace | Foundry Marketplace for ontology products | [S-001, S-002, S-003] |
| Layer 1 `mcpServers` declaration | OSDK package registration | [S-004, S-005] |
| Layer 2 pm-init scaffold | `create-foundry-project` + OSDK install | [S-006] |
| Layer 2 per-project managed-settings | Foundry Policy engine per project | [S-007, inference] |
| Layer 3 events.jsonl | Decision Lineage 5-dim | [S-008] partial |
| Layer 3 codegen propagation | OSDK code regeneration on ontology change | [S-004, S-005] |

The design is structurally identical to Foundry, at filesystem scale.

---

## 5.8 What H-A++ Does NOT Do

To prevent scope creep:

- ❌ No centralized daemon (rejected H-B)
- ❌ No cross-project event log merge (each project's events.jsonl is independent)
- ❌ No automatic schema migration (semver + manual CHANGELOG is the contract)
- ❌ No project-to-project runtime communication (use schema versioning instead)
- ❌ No network-based MCP (all MCP is local stdio to the plugin bridge)
- ❌ No replacement of user-scope skills (plugin skills take priority; user-scope stays for experimentation)

These explicit non-features make reversal clean: remove plugin → per-project state still works, just without the MCP tools.

---

## 5.9 Acceptance Test Plan (abbreviated — full in section 10)

| # | Test | Pass Criterion |
|---|------|----------------|
| AT-01 | Install plugin in empty user scope | `/plugin list` shows palantir-mini@0.2.0 |
| AT-02 | MCP tools in a fresh session | `mcp__palantir-mini__*` tools listed |
| AT-03 | pm-init on `~/palantir-math` | Creates `.palantir-mini/` + `50-palantir-mini.json`; existing state untouched |
| AT-04 | pm-codegen after schema bump | Regenerates `src/generated/`; writes `codegen_run` event |
| AT-05 | pm-verify on clean state | Returns green; no R1-R15 violations |
| AT-06 | pm-replay 5-dim query | Returns matching events from events.jsonl |
| AT-07 | Plugin uninstall | MCP tools disappear; `.palantir-mini/` directories untouched |

---

## 5.10 Go / No-Go

Ship H-A++ if and only if:

- ✅ External research confirms `mcpServers` in plugin.json is fully supported (CONFIRMED in section 02)
- ✅ Foundry Marketplace parallel holds for ontology distribution (CONFIRMED in section 02)
- ✅ OSDK 2.0 package pinning pattern holds (CONFIRMED in section 02)
- ⚠️ Decision Lineage 5-dim is [PARTIAL] — we ship the 5-tuple anyway (our `byWhom`/`withWhat` design is additive, grounded in ontology governance literature).

**Decision: GO.** Proceed to sections 06-10 for spec detail + PR roadmap.

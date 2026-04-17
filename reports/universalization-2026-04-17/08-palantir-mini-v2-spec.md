# 08 — palantir-mini v2 + Universal Adoption Spec

> Version 0.1.0 → 0.2.0. Key upgrade: `mcpServers` block in plugin.json for global MCP registration. Plus: pm-init idempotency, version-pinned schemas, cross-project codegen, new-project template.

---

## 8.1 Version Bump Scope

### From 0.1.0 (brain-v2) → 0.2.0 (universalization)

| Area | 0.1.0 | 0.2.0 | Breaking? |
|------|-------|-------|-----------|
| Plugin manifest | 5 fields | +3 (`mcpServers`, `compatibleSchemaVersions`, `hooks/agents/skills` path declarations) | NO — additive |
| MCP server (bridge/) | stdio, 5 tools | stdio, 5 tools + plugin-root detection | NO |
| Hooks | 7 hooks | 7 hooks + ${CLAUDE_PLUGIN_ROOT} path expansion | NO |
| Subagents (agents/) | 5 agents | 5 agents + plugin-scope awareness | NO |
| Skills (skills/) | 7 skills | 7 skills, user-scope versions deprecated | YES — skill duplication removed |
| managed-settings fragment | v0.1 schema | v0.2 adds MCP tool allowlist | NO — additive |

Net: **one potentially breaking change** (skill deprecation). Mitigation: deprecation notice at user-scope `pm-*` skills; 1 release grace period before removal.

---

## 8.2 plugin.json — Full v0.2.0

```json
{
  "name": "palantir-mini",
  "version": "0.2.0",
  "description": "Cross-project Ontology-First plugin: append-only event log + OSDK 2.0 patterns + Palantir 5 infra patterns + 3-phase validation, built on Claude Code v2.1.110 Native Runtime.",
  "author": { "name": "palantirKC" },

  "compatibleSchemaVersions": ">=0.2.0 <1.0.0",
  "requiresClaudeCodeVersion": ">=2.1.110",

  "mcpServers": {
    "palantir-mini": {
      "command": "bun",
      "args": ["${CLAUDE_PLUGIN_ROOT}/bridge/mcp-server.ts"],
      "env": {
        "PALANTIR_MINI_ROOT": "${CLAUDE_PLUGIN_ROOT}",
        "PALANTIR_MINI_VERSION": "0.2.0"
      }
    }
  },

  "hooks": "${CLAUDE_PLUGIN_ROOT}/hooks/hooks.json",
  "agents": "${CLAUDE_PLUGIN_ROOT}/agents",
  "skills": "${CLAUDE_PLUGIN_ROOT}/skills",

  "keywords": [
    "ontology", "event-log", "palantir", "osdk", "codegen",
    "native-runtime", "two-tier-actions", "edit-functions",
    "submission-criteria", "decision-lineage", "marketplace"
  ]
}
```

Key field: `mcpServers` — after `/plugin install`, every session has `mcp__palantir-mini__*` tools without per-project wiring. **Evidence**: Claim 3 in section 02, CONFIRMED by docs.claude.com.

---

## 8.3 managed-settings.d Fragment — v0.2 Schema

`<project>/.claude/managed-settings.d/50-palantir-mini.json`:

```json
{
  "version": "0.2.0",
  "palantirMini": {
    "enabled": true,
    "projectId": "<project-name>",
    "eventLogPath": ".palantir-mini/session/events.jsonl"
  },
  "permissions": {
    "allow": [
      "mcp__palantir-mini__emit_event",
      "mcp__palantir-mini__get_ontology",
      "mcp__palantir-mini__replay_lineage",
      "mcp__palantir-mini__apply_edit_function",
      "mcp__palantir-mini__commit_edits",

      "Edit(./.palantir-mini/session/events.jsonl:*)",
      "Write(./.palantir-mini/session/events.jsonl:*)",
      "Edit(./ontology-state/*.json)",
      "Write(./ontology-state/*.json)",
      "Edit(./ontology/**)",
      "Write(./ontology/**)"
    ],
    "deny": [
      "Edit(./.palantir-mini/**~events.jsonl)",
      "Write(./.palantir-mini/**~events.jsonl)"
    ]
  }
}
```

---

## 8.4 pm-init Skill — Complete Spec

### Frontmatter

```yaml
---
name: pm-init
description: Bootstrap palantir-mini in a project. Creates <project>/.palantir-mini/session/ and <project>/.claude/managed-settings.d/50-palantir-mini.json. Idempotent.
version: 0.2.0
runtime: plugin-scope  # prefer plugin version over user-scope
---
```

### Algorithm

```
pm-init [--force] [--project <path>] [--scaffold-ontology]:

1. RESOLVE project path
   - Default: cwd
   - If --project, validate directory exists

2. PRECONDITION CHECKS
   - Plugin installed? (check mcp__palantir-mini__get_ontology available)
   - Git repo? (warn if not)
   - package.json present? (warn if not, propose creation)

3. STATE DETECTION
   - Check .palantir-mini/session/ exists
   - Check events.jsonl exists
   - Check 50-palantir-mini.json exists
   - Classify state: FULL, PARTIAL, NONE, DRIFT

4. APPLY CHANGES
   - NONE → full install
   - PARTIAL → patch missing pieces only
   - DRIFT → error unless --force
   - FULL → noop, report "already initialized"

5. SCAFFOLD ONTOLOGY (if --scaffold-ontology)
   - Copy templates from ~/.claude/schemas/ontology/generators/
   - Create <project>/ontology/ with README pointing to schemas

6. EMIT EVENT
   mcp__palantir-mini__emit_event({
     type: "pm_init_run",
     byWhom: "pm-init-skill",
     withWhat: { mode: "full|patch|noop", pluginVersion: "0.2.0" }
   })

7. REPORT
   - Success: list what was created
   - Next steps: /pm-codegen if ontology/ exists, /pm-verify to validate
```

### Idempotency proof

| Run# | State before | State after | Action taken |
|------|--------------|-------------|--------------|
| 1 | NONE | FULL | Full install |
| 2 | FULL | FULL | Noop (exit 0) |
| 3 | PARTIAL (fragment missing) | FULL | Patch fragment only |
| 4 | DRIFT (fragment modified) | DRIFT | Error (require --force) |
| 5 | After --force on drift | FULL (user-modified parts overwritten) | Full overwrite |

---

## 8.5 pm-codegen Skill — v0.2.0 Spec

### Algorithm

```
pm-codegen [--schema-version <pin>]:

1. Read <project>/package.json → peerDependencies.@palantirKC/claude-schemas
2. Read ~/.claude/schemas/package.json → actual version
3. VALIDATE pin satisfies actual version (section 7.11 Option B)
4. Read ~/.claude/schemas/.manifest.json → authoritative axis index
5. Read <project>/ontology/ → project-local extensions
6. Compose: shared + project = complete ontology
7. For each generator in ~/.claude/schemas/ontology/codegen/:
   - Run generator with (shared, project) input
   - Write output to <project>/src/generated/{generator-name}.ts
   - Write header: version + ontology hash + timestamp
8. Emit codegen_run event
9. Validate output compiles (bun tsc --noEmit on generated dir)
```

### Safety

- If compile fails, delete generated output and emit `codegen_fail` event (do not half-write).
- If schema version pin mismatch, refuse to run and prompt user to update pin.

---

## 8.6 pm-verify Skill — v0.2.0 Spec (Design + Compile + Runtime + Post-Write)

### 4-Phase pipeline

#### Phase 1: Design
- Every entity in `<project>/ontology/` has a type declaration in `~/.claude/schemas/ontology/`.
- Every entity has all required fields per schema.
- No undocumented attributes.

#### Phase 2: Compile
- `bun tsc --noEmit` on `<project>/src/generated/`.
- `~/.claude/schemas/validate-all.ts` returns all "ok" axes.
- Generated file headers match current schema+ontology hash.

#### Phase 3: Runtime
- Events.jsonl replay produces consistent state.
- All events have required 5-dim fields (when/atopWhich/throughWhich/byWhom/withWhat).
- No orphan events (no reference to missing ontology RIDs).

#### Phase 4: Post-Write
- Every PR that modified `ontology/` or `schemas/` includes CHANGELOG entry.
- Every generated file regenerates to byte-identical output (reproducibility).
- R1-R15 gate passes.

### Output
`<project>/ontology-state/eval-results.json` — structured result per phase.

---

## 8.7 pm-recap Skill — v0.2.0 Spec

Reads `events.jsonl`, folds to snapshot. Used for cold-start state recovery.

### Algorithm
```
pm-recap [--last N] [--since ISO8601]:

1. Load events.jsonl
2. Filter per --last or --since
3. Fold: for each event, update an in-memory snapshot
4. Write snapshot to <project>/.palantir-mini/session/snapshots/<timestamp>.json
5. Return markdown summary to user (section titles: last session, current state, blockers, next hints)
```

---

## 8.8 pm-replay Skill — v0.2.0 Spec

Deterministic BackwardProp replay filtered by 5-dim query.

### Algorithm
```
pm-replay --when <range> --atopWhich <sha-prefix> --throughWhich <filter> --byWhom <agent> --withWhat <keyword>:

1. Load events.jsonl
2. For each event, check 5-dim match (ALL specified dims must match)
3. Return matching events in order
4. Optionally replay by re-emitting to a scratch state store for inspection
```

---

## 8.9 pm-action Skill — v0.2.0 Spec

Tier-1 / Tier-2 action execution with submission criteria pre-flight.

### Tier-1 (atomic, unbatched)
- Single ontology edit via `apply_edit_function` + `commit_edits`.

### Tier-2 (batched, atomic)
- Multiple edits staged via repeated `apply_edit_function`.
- Single `commit_edits` at end.
- Pre-flight: all submission criteria must pass before first apply.
- Rollback: if any apply fails, discard batch.

---

## 8.10 pm-blueprint Skill — v0.2.0 Spec

Generate a TechBlueprint for a new architecture question. Kosmos-research at project scale.

Unchanged from 0.1.0 except: pulls schema version from pin; emits `blueprint_generated` event.

---

## 8.11 Subagents (agents/) — v0.2.0 Spec

| Agent | Role | v0.2.0 Change |
|-------|------|---------------|
| `action-executor` | Run pm-action Tier-1/2 commits | Now knows plugin root; loads submission criteria from plugin |
| `change-auditor` | Review schema/ontology diff for CHANGELOG accuracy | New: checks `~/.claude/schemas/CHANGELOG.md` |
| `codegen-runner` | Run pm-codegen in isolated worktree | New: reads schema version pin |
| `ontology-verifier` | Run Design+Compile+Runtime+Post-Write of pm-verify | Unchanged |
| `propagation-tracer` | Walk ForwardProp/BackwardProp graph, report drift | New: supports cross-project queries via events.jsonl |

---

## 8.12 Hooks — v0.2.0

| Hook | Event | Mode | Plugin-Scope Aware? |
|------|-------|------|----------------------|
| `session-start.ts` | SessionStart | Advisory | YES — finds events.jsonl relative to cwd |
| `pre-edit-ontology.ts` | PreToolUse(Edit/Write) | **BLOCKING** | YES — validates against plugin-version schema |
| `post-edit-propagate.ts` | PostToolUse(Edit/Write) | Advisory | YES — emits event with plugin version |
| `task-completed-gate.ts` | TaskCompleted | **BLOCKING** | YES — reads phase gates from plugin |
| `pre-compact-state.ts` | PreCompact | **BLOCKING** | YES — snapshots events.jsonl |
| `stop-validate.ts` | Stop | **BLOCKING** | YES — invariant check |
| (new) `plugin-install.ts` | PluginInstalled | Advisory | First-install setup, reminds about pm-init |

All hooks declared in `${CLAUDE_PLUGIN_ROOT}/hooks/hooks.json`.

---

## 8.13 Cross-Project Rollout Plan

### Phase A: Plugin v0.2.0 ready (prerequisite for 3-project activation)

### Phase B: Per-project rollout (sequential)

| Order | Project | Action | Rationale |
|-------|---------|--------|-----------|
| 1 | `~/kosmos` | Upgrade plugin reference; run pm-init --force (ensures 50-palantir-mini.json matches v0.2 schema) | Primary project, best test bed |
| 2 | `~/mathcrew` | Run pm-init (should patch pin + events semantics) | Fully initialized; simplest |
| 3 | `~/palantir-math` | Run pm-init (patches missing fragment + pin) | Partial state; cleanest target |

### Phase C: New-project template

A `create-palantir-project` bun script that scaffolds:
- git init
- package.json with pin
- .claude/managed-settings.d/
- ontology/ with template from ~/.claude/schemas/
- .palantir-mini/session/
- tsconfig.json
- CLAUDE.md with project-local overlay template

---

## 8.14 Acceptance Tests (extended from section 5.9)

| # | Test | Acceptance |
|---|------|------------|
| AT-01 | `/plugin install palantir-mini@0.2.0` | Fresh user scope ends with active plugin |
| AT-02 | Fresh session → `mcp__palantir-mini__*` visible | 5 tools listed |
| AT-03 | `pm-init` on clean project | Creates `.palantir-mini/` + fragment; exit 0 |
| AT-04 | `pm-init` on fully-initialized project | Noop; exit 0; no files changed |
| AT-05 | `pm-init` on partial project (palantir-math) | Fragment created; existing state untouched |
| AT-06 | `pm-init` on drift (user-edited fragment) | Error; no changes |
| AT-07 | `pm-init --force` on drift | Overwrites fragment |
| AT-08 | `pm-codegen` with schema v0.2.0 | Regenerates `src/generated/` with correct header |
| AT-09 | `pm-codegen` with mismatched pin | Refuses; suggests pin update |
| AT-10 | `pm-verify` all 4 phases | All green on valid state |
| AT-11 | `pm-verify` with missing CHANGELOG | Phase 4 fails |
| AT-12 | `pm-replay --byWhom Lead` | Returns Lead-initiated events only |
| AT-13 | Plugin uninstall | MCP tools disappear; `.palantir-mini/` untouched |
| AT-14 | Plugin reinstall | No data loss; events.jsonl continues from prior |

---

## 8.15 Summary

palantir-mini v0.2.0 is **one manifest change** (add `mcpServers`) + **skill/hook plugin-root awareness** + **idempotency hardening of pm-init**. The core MCP server, hooks, and subagents carry over from v0.1.0 unchanged. This keeps the PR small (see PR #R3 in section 10) and the reversal path trivial (downgrade to 0.1.0).

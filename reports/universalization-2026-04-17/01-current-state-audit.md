# 01 — Current State Audit

> Inventory of `~/.claude/{research,schemas,rules}/`, existing `palantir-mini` plugin structure, and PR state across 3 projects. Feeds the gap analysis for H-A++.

---

## 1.1 PR State (per project, as of 2026-04-17)

| Repo | Open | Recently Merged | Relevant? |
|------|------|-----------------|-----------|
| `~/kosmos` | **#7 `feat/brain-v2-upgrade`** (Brain v2: palantir-mini activation + Agent Teams v2.1.110) | #6 next-session prompt, #5 palantir-mini deep research, #4 photonicRealism+말풍선, #3 mathcrew content delivery | **YES — universalization layers on top of PR #7** |
| `~/palantir-math` | none visible | (repo uses different workflow; check `git log` for ontology moves) | Indirectly — adopts `pm-init` after PR #7 merges |
| `~/mathcrew` | none visible | — | Indirectly — adopts `pm-init` after PR #7 merges |

**Decision**: PR #7 merges **first**. Universalization PR train layers on the merged brain-v2 foundation. See section 10 for full PR sequencing.

---

## 1.2 `~/.claude/research/` Inventory

Top-level subdirectories:

| Dir | Role | Has BROWSE.md? | Has INDEX.md? | Status |
|-----|------|----------------|---------------|--------|
| `palantir/` | Palantir DevCon 5 evidence library (~61 files, ~1,205 markers) | see subdirs | see subdirs | Rich — v0.8 mature |
| `claude-code/` | Claude Code capabilities + Managed Agents + gap analysis | YES | YES | Current through v2.1.110 |
| `interaction/` | Gesture + interaction primitives | TBD | TBD | Unknown — needs audit |
| `palantir-learn/` | Archived session state from palantir-learn v0.8 | TBD | TBD | **ARCHIVED** — do not touch unless specified |
| `ptc/` | PTC-specific research | TBD | TBD | **DEPRIORITIZED** — no active project refs |
| `skills/` | Reusable internal skills/audits reference | TBD | TBD | Moderate |

### `palantir/` subdirectories (auto-discovered, evidence-rich)

`action`, `architecture`, `cross-cutting`, `data`, `entry`, `logic`, `philosophy`, `platform`, `security`, `ship-os`, `typescript`, `validation`.

**Gaps identified (feed section 06)**:

1. **No `marketplace/` subdirectory** — Foundry Marketplace evidence is scattered across `ship-os/` and `platform/`.
2. **No `osdk/` subdirectory** — OSDK 2.0 evidence is scattered across `data/`, `logic/`, `typescript/`.
3. **No `decision-lineage/` subdirectory** — DevCon 5 5-dim event log evidence mixed into `cross-cutting/` and `architecture/`.
4. **Top-level `BROWSE.md` does not route to `palantir-mini`** — plugin is referenced nowhere in evidence library despite being the production artifact.
5. **Provenance tags inconsistent** — some markers use `[Official]`/`[Synthesis]`/`[Inference]`, others untagged.

### `claude-code/` subdirectory (enumerated)

Files: `agent-design-opinion`, `agent-system-design`, `edison-kosmos-analysis`, `features`, `gap-analysis-palantir-math`, `managed-agents`, `mathcrew-agent-blueprint`, `palantir-mini-blueprint`, plus `BROWSE.md` / `INDEX.md`.

**Gaps**:
1. No `plugin-system.md` — v2.1.110 plugin marketplace mechanics not documented.
2. No `mcp-server-registration.md` — global vs per-project MCP server distribution not covered.
3. `features.md` predates v2.1.110 — 27 hook events list likely stale.
4. `managed-agents.md` — Session/Harness/Sandbox virtualization patterns well-covered, good basis for section 08.

---

## 1.3 `~/.claude/schemas/` Inventory

Four axes present:

| Axis | Files | Purpose | Gap for v2 |
|------|-------|---------|------------|
| `ontology/` | BROWSE.md, INDEX.md, CHANGELOG.md, `{action,codegen,data,functions,generators,helpers,lineage,logic,policies,primitives,security}/`, `project-validator.ts`, `semantic-audit.ts`, `semantics.ts`, `types.ts`, `upgrade-apply.ts`, `validate-*.ts`, `visual.html` | Shared ontology schema + codegen runtime | **Not published as a versioned npm package** — cross-project consumers import by relative paths |
| `interaction/` | BROWSE.md, INDEX.md, `{binding,component,element,gesture}/`, `semantics.ts`, `types.ts`, `validator.ts` + tests | Gesture + binding primitives | **Not integrated with ontology/** — interaction binds to components but component RIDs not shared across ontology |
| `meta/` | `types.ts` only | Meta types (likely RIDs, versions) | **No BROWSE.md / INDEX.md** — meta axis needs explicit documentation for cross-project use |
| `rendering/` | BROWSE.md, INDEX.md, `{materials,performance,pipeline,scene}/`, `semantics.ts`, `types.ts`, `rendering.test.ts` | Rendering surface mapping | Healthy — no major gap, minor meta integration needed |

**Cross-axis gap**: No single `~/.claude/schemas/CHANGELOG.md` or version manifest. Three projects consume schemas via relative paths without semver — any breaking change silently propagates.

---

## 1.4 `~/.claude/rules/` Inventory

Four rule files present:

- `01-ontology-first-core.md` — meaning → ontology → contracts → runtime
- `02-research-retrieval.md` — BROWSE/INDEX-first, exact retrieval
- `03-forward-backward-propagation.md` — research → schemas → ontology → contracts → runtime (forward); runtime → lineage → ontology (backward)
- `06-agent-teams.md` — Lead-direct default; teams only on explicit request

**Gaps (feed section 09)**:
- **`04-*.md` missing** — no rule for runtime boundary (Claude vs Codex vs Gemini).
- **`05-*.md` missing** — no rule for skill invocation ordering.
- **`07-*.md` missing** — no rule for plugin system (per project vs global).
- **`08-10*.md` missing** — hypothetical rule numbers implying reserved slots.
- **`11-*.md` missing** — no rule for MEMORY per-project schema.

---

## 1.5 MEMORY State (4 locations)

| Location | Files | Purpose |
|----------|-------|---------|
| `~/.claude/CLAUDE.md` | 1 | Global Claude runtime guardrails |
| `~/.claude/projects/-home-palantirkc-kosmos/memory/MEMORY.md` + items | 11 memory entries (kosmos-agent-teams, feedback-*, brain-v2-upgrade, etc.) | Kosmos auto-memory |
| `~/kosmos/CLAUDE.md` | 1 | Project-local Kosmos guardrails |
| `~/palantir-math/CLAUDE.md`, `~/mathcrew/CLAUDE.md` | Unknown (likely exist) | Per-project guardrails |

**Gap**: No unified per-project MEMORY schema. Each project's `MEMORY.md` grows ad hoc. No cross-project memory (the `edison-kosmos-reference`, `feedback-hook-fields-v2` etc. are kosmos-scoped but universally applicable).

---

## 1.6 Skills Inventory (user scope)

User-scope skills at `~/.claude/skills/`:

```
lsp-audit, orchestrate, palantir-walk, pm-action, pm-blueprint, pm-codegen, pm-init,
pm-recap, pm-replay, pm-verify, ship, tavily-cli
```

Also: `trigger-eval-aggregate.json` (scheduled trigger).

Plugin-bundled skills (`~/.claude/plugins/palantir-mini/skills/`):

```
pm-action, pm-blueprint, pm-codegen, pm-init, pm-recap, pm-replay, pm-verify
```

**Overlap**: All `pm-*` skills exist in BOTH user scope and plugin. User-scope versions predate the plugin. **Gap**: no deduplication strategy — if plugin is installed and user-scope skill also exists, which wins?

---

## 1.7 palantir-mini Plugin Structure

`~/.claude/plugins/palantir-mini/`:

```
README.md, agents/, bridge/, bun.lock, hooks/, lib/, managed-settings.d/,
monitors/, node_modules/, package.json, scripts/, skills/, tests/, tsconfig.json,
.claude-plugin/{marketplace.json, plugin.json}
```

`plugin.json` (current v0.1.0) — **missing `mcpServers` field**. Without it, installing the plugin does NOT automatically register `mcp__palantir-mini__*` tools globally. This is the key gap H-A++ resolves.

`marketplace.json` — single-plugin marketplace already declared. Good.

`bridge/mcp-server.ts` — zero-dep stdio MCP server with 5 tools: `get_ontology`, `emit_event`, `apply_edit_function`, `commit_edits`, `replay_lineage`. Production-ready.

`hooks/hooks.json` + 6 hook scripts — session-start, pre-edit-ontology, post-edit-propagate, pre-compact-state, stop-validate, task-completed-gate. Production-ready.

`agents/` — 5 subagents (`action-executor`, `change-auditor`, `codegen-runner`, `ontology-verifier`, `propagation-tracer`). Production-ready.

---

## 1.8 Per-Project palantir-mini State

| Project | `.palantir-mini/session/` | `.claude/managed-settings.d/50-palantir-mini.json` | Status |
|---------|---------------------------|----------------------------------------------------|--------|
| `~/kosmos` | YES (events.jsonl + handoffs + locks + snapshots) | TBD — check | Brain v2 activated |
| `~/palantir-math` | YES (session dir exists) | **MISSING** | Partial — directory scaffolded, RBAC not wired |
| `~/mathcrew` | YES (session dir exists) | YES | Fully activated |

**Gap**: `~/palantir-math` missing its `managed-settings.d/50-palantir-mini.json` fragment. `pm-init` must idempotently install it.

---

## 1.9 Summary of Audit Findings

1. palantir-mini plugin is **90% done** — missing only the `mcpServers` manifest hook to make MCP tools globally available after `/plugin install`.
2. Research library is rich but **under-indexed** — needs marketplace/osdk/decision-lineage subdirs + top-level BROWSE route to palantir-mini.
3. Schemas have no versioning, no CHANGELOG, and consumer projects use relative paths — fragile for cross-project adoption.
4. Rules cover ontology/retrieval/propagation/agents but **not plugins, runtime boundary, or MEMORY schema**.
5. Skills are duplicated between user scope and plugin without a conflict resolution rule.
6. palantir-math is partially initialized; mathcrew is fully initialized. pm-init must be idempotent.

These findings drive the architecture in section 05 and the PR roadmap in section 10.

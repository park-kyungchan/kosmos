> **HISTORICAL** — Superseded by Phase A-2 close (2026-04-18). Plugin is now at v1.3 (Phase A-3).
> Kept for provenance. Do NOT use as current guidance.

# Phase B Plan — Palantir 4-Pillar Mirror v1.0 Rebuild

**Session**: rebuild-2026-04-17-palantir-mirror-v1  
**Plan author**: Lead (Opus 4.7, 1M ctx)  
**Supersedes**: universalization H-A++ (v0.2.1 shipped)  
**Authoritative inputs**: `~/NEXT_SESSION_ONTOLOGY_REBUILD.md`, `~/kosmos/ontology-state/blueprint.json`, `~/kosmos/ontology-state/decision-log.json`, `~/kosmos/ontology-state/eval-results.json`, `~/kosmos/prototype/h-a/`

---

## Context

**Why**: The three-project fleet (`~` home control plane, `palantir-math`, `mathcrew`) pins `@palantirKC/claude-schemas@0.2.1` and runs `palantir-mini@0.2.0`, but the ForwardProp chain is **structurally broken** (`~/ontology/` missing → each project declares independently, duplicating `ConceptPrimitive`). Kosmos Phase A research produced TechBlueprint H-A (22/22 prototype tests + 15/15 R-gates ACCEPT) which repairs the chain by introducing a **home shared-core ontology layer**, bumping schemas to v1.0 with 9 new primitives, restructuring `palantir-mini` to v1.0 (10+ MCP tools, 15+ hooks, 6-phase validation, L1/L2/L3 RBAC), and rewriting the skills surface to AIP-analog semantic intent dispatch.

**Outcome targeted**: 3 projects end the session ontology-first, Palantir-like (4-pillar mirror: Ontology/AIP/Foundry/Maven), auditable via `events.jsonl`, dynamically composable via `/palantir-dispatch` intent routing.

**Execution model**: Lead orchestrates, teammates implement. 6 Waves, 1 Wave ≥ 1 PR, cross-repo per-PR banned (Wave 5 atomic 3-PR window is the single coordinated exception).

---

## Wave Execution DAG

```
W1 Preconditions   (2 PRs: palantirkc + palantir-math)
       ↓
W2 Schemas v1.0    (1 PR: palantirkc + post-merge tag push to park-kyungchan/claude-schemas#v1.0.0)
       ↓
W3 Home /ontology/ (1 PR: palantirkc)
       ↓
W4 Plugin v1.0     (1 PR: palantirkc; blockedBy W2 ∧ W3)
       ↓
W5 3-consumer migration (3 atomic PRs: palantir-math + mathcrew + palantirkc; 24-48h coordinated)
       ↓
W6 Skills rebuild  (1 PR: palantirkc)
       ↓
Phase D Ship (per project: pm-verify + tsc + test + /ship)
```

Total PRs: **8** across rebuild; cross-repo in single wave only at W5 (atomic window).

---

## W1 — Preconditions (2 PRs)

### W1-A · palantirkc PR "W1 preconditions — plugin reconcile + research cleanup"

**Owner**: preconditions-impl (Sonnet)

**Deliverables**:
1. `~/.claude/plugins/palantir-mini/package.json`: `version: "0.1.0"` → `"0.2.1"` + `description` `"v2.1.108 Native Runtime"` → `"v2.1.110 Native Runtime"` (OBS-01 reconcile)
2. `~/.claude/research/palantir/marketplace/` — **Verdict: delete subdir** (BROWSE+INDEX-only stub, no content references resolvable, no session benefit). Alternative (populate) rejected for scope bloat.
3. `~/.claude/research/palantir/osdk/` — **Verdict: keep + fix INDEX.md**. Rewrite `INDEX.md` to drop 4 missing file references (`osdk-2.0-architecture.md`, `osdk-version-pinning.md`, `osdk-1-to-2-migration.md`, `pm-codegen-vs-osdk.md`) and mark as "stub — populate in future research session". Delete of subdir rejected because OBS-03 elevates typescript/ peer as keep-authoritative and osdk/ is its natural companion.
4. `~/.claude/research/palantir/typescript/INDEX.md` (or BROWSE) — add `verdict: keep-authoritative` metadata entry (OBS-03 upgrade).
5. `~/TAVILY_API_KEY_ROTATION.md` (new, Lead-direct or user-step) — document rotation procedure; settings.json placeholder kept, actual key rotation is user step post-merge.

**Files touched**:
- `~/.claude/plugins/palantir-mini/package.json`
- `~/.claude/research/palantir/marketplace/` (delete)
- `~/.claude/research/palantir/osdk/INDEX.md`
- `~/.claude/research/palantir/typescript/INDEX.md` (or BROWSE)
- `~/TAVILY_API_KEY_ROTATION.md` (new)

**CI**: tsc clean (no code change), managed-settings rules pass, events.jsonl `w1_preconditions_shipped` event emitted at end.

**Tier**: Tier-1 (small, bounded file edits + stub deletion).

---

### W1-B · palantir-math PR "W1 preconditions — F-1 full + D-cont-2 resolution"

**Owner**: pm-preconditions-impl (Sonnet)

**Rationale** (my determination): Blueprint W1.items requires these BEFORE Wave 5 to avoid mid-atomic-window regression. Recent palantir-math PR #153 extracted only `riemannsum/conic/text` cases; `functiongraph` + `parametric-curve` body extraction remains deferred. `useTeachingState.ts` remains unresolved.

**Deliverables**:
1. **F-1 full**: Create `src/rendering/jsxgraph/curveHelpers.ts` extracting `functiongraph` + `parametric-curve` body logic from `jsxGraphRenderer.ts` with 7 module-local symbols (identified by blueprint). Update `jsxGraphRenderer.ts` to import from `curveHelpers.ts`.
2. **D-cont-2**: `src/hooks/useTeachingState.ts` — decide keep/delete/restore. Recommended verdict: **keep + document**. Add JSDoc explaining the hook's role in the teaching flow, mark stable. (Deletion would cascade into `useSequencerState` dependencies; restore not needed if kept.)
3. Preserve all existing tests; add unit test for `curveHelpers.ts` if none exists.

**Files touched**:
- `src/rendering/jsxgraph/curveHelpers.ts` (new)
- `src/rendering/jsxgraph/jsxGraphRenderer.ts` (refactor)
- `src/hooks/useTeachingState.ts` (docs/marker only)
- `tests/curveHelpers.test.ts` (new; if not already covered)

**CI**: `bunx tsc --noEmit` + `bun test` + existing drift scripts. No ontology changes, purely runtime refactor.

**Tier**: Tier-2 (cross-file semantic refactor).

---

## W2 — Schemas v1.0 (1 PR + post-merge tag push)

### W2 · palantirkc PR "W2 schemas v1.0 — 9 new primitives + event registry expansion"

**Owner**: schemas-impl (Sonnet)

**Deliverables**:
1. **9 new primitive files** under `~/.claude/schemas/ontology/primitives/`:
   - `struct.ts` — prim-data-05; follows `~/kosmos/prototype/h-a/struct.ts` pattern (StructRid branded, StructDeclaration, StructRegistry singleton)
   - `value-type.ts` — prim-data-06; follows `~/kosmos/prototype/h-a/value-type.ts` pattern (ValueTypeRid, ValueTypeDeclaration, ValueTypeRegistry, BaseScalarType union)
   - `shared-property-type.ts` — promote from `types.ts` interface to primitive with RID + registry
   - `capability-token.ts` — prim-security-02; L2 RBAC token with expiry + scope + holder
   - `marking-declaration.ts` — prim-security-03; cell/column classification with sensitivity levels
   - `automation-declaration.ts` — prim-action-03; cron/trigger/scheduled action metadata
   - `webhook-declaration.ts` — prim-action-04; external ingress event descriptor
   - `scenario-sandbox.ts` — prim-learn-03; isolated what-if analysis context
   - `aip-logic-function.ts` — prim-logic-03; LLM-backed function distinct from deterministic EditFunction
2. **`ontology/lineage/event-types.ts`** — expand `EVENT_TYPE_REGISTRY` 10→16: add `ontology_registered`, `capability_token_issued`, `schema_locked`, `scenario_created`, `pr_body_generated`, `session_complete`, `drift_detected`, `evaluation_recorded` (blueprint lists these 8 — pick the 6 most canonical + 2 learn-automation variants)
3. **`ontology/CHANGELOG.md`** — v1.0.0 breaking-change manifest (even though additions are non-breaking, major bump signals new canonical surface); per-axis version matrix; deprecation notes for `types.ts` inline interfaces superseded by primitives
4. **`~/.claude/schemas/package.json`**: version `0.2.1` → `1.0.0`, add `breaking-changes` note, preserve all existing exports + add new primitive exports
5. **`~/.claude/schemas/CHANGELOG.md`** — v1.0.0 root aggregator entry
6. **`~/.claude/schemas/index.ts`** — re-export new primitives under existing namespaces

**Post-merge step (Lead-direct, not part of PR)**:
7. Clone `park-kyungchan/claude-schemas` to `/tmp/claude-schemas-push/`, sync from `~/.claude/schemas/`, commit, tag `v1.0.0`, `git push origin main v1.0.0`.
8. Verify `npm install git+https://github.com/park-kyungchan/claude-schemas.git#v1.0.0` in a disposable dir resolves correctly (dry-run validation).

**CI**: `bunx tsc --noEmit` in schemas repo structure; existing `project-test.test.ts` must pass; new primitives must have basic registry round-trip test (adopt P-H-A pattern).

**blockedBy**: W1

**Tier**: Tier-2 (structural, 9 new files + registry expansion).

---

## W3 — Home /ontology/ (1 PR)

### W3 · palantirkc PR "W3 home /ontology/ shared-core namespace (ForwardProp repair)"

**Owner**: home-impl (Sonnet)

**Deliverables**:
1. **NEW directory** `~/ontology/` (palantirkc repo root, NOT under `~/.claude/`). Mirror `~/kosmos/prototype/h-a/home-ontology-shim.ts` pattern.
2. `~/ontology/shared-core/index.ts` — re-export from `@palantirKC/claude-schemas` v1.0:
   - v0.2 primitives: `ObjectType*`, `LinkType*` (via re-export)
   - v1.0 additive: `Struct*`, `ValueType*`, `SharedPropertyType*`, `CapabilityToken*`, `MarkingDeclaration*`, `AutomationDeclaration*`, `WebhookDeclaration*`, `ScenarioSandbox*`, `AIPLogicFunction*`
   - `SHARED_CORE_VERSION = "1.0.0"` constant
3. Home-specific primitives (small, for cross-project concepts):
   - `~/ontology/shared-core/cross-project-teammate.ts` — TeammateRole + capabilities for Agent Teams
   - `~/ontology/shared-core/coordinated-pr-wave.ts` — Wave metadata type for /orchestrate DAG
4. `~/ontology/BROWSE.md` — query routing recipes (Shared Core lookup patterns)
5. `~/ontology/INDEX.md` — structure + authority boundaries (Layer 3 between schemas and per-project)
6. `~/ontology/README.md` — divergence protocol: per-project ontology extends shared-core; divergence requires documented justification
7. Update `~/CLAUDE.md` — add home ontology/ role paragraph to Claude-Native Layers section
8. Update `~/UNIVERSALIZATION.md` — authority chain diagram (research → schemas → **~/ontology/** → project ontology/ → contracts → runtime → artifacts) + consumer pin matrix targeting v1.0

**Files touched**:
- `~/ontology/shared-core/index.ts` (new)
- `~/ontology/shared-core/cross-project-teammate.ts` (new)
- `~/ontology/shared-core/coordinated-pr-wave.ts` (new)
- `~/ontology/BROWSE.md` (new)
- `~/ontology/INDEX.md` (new)
- `~/ontology/README.md` (new)
- `~/CLAUDE.md` (edit)
- `~/UNIVERSALIZATION.md` (edit)

**CI**: `bunx tsc --noEmit` in palantirkc context (resolves imports); home ontology smoke test (STRUCT_REGISTRY identity via shim, mirroring P-H-A C-A-03a).

**blockedBy**: W2 (requires schemas v1.0 primitives to re-export).

**Tier**: Tier-2 (new directory + shim wiring + doc updates).

---

## W4 — Plugin v1.0 (1 PR)

### W4 · palantirkc PR "W4 palantir-mini v1.0 — MCP+hooks+validation+codegen+RBAC"

**Owner**: plugin-impl (Sonnet)

**Deliverables**:
1. **MCP tools 5→10** (`~/.claude/plugins/palantir-mini/bridge/handlers/`):
   - Keep: `apply-edit-function.ts`, `commit-edits.ts`, `emit-event.ts`, `get-ontology.ts`, `replay-lineage.ts`
   - Add: `ontology-schema-get.ts` (retrieve canonical schema snapshot for primitive RID), `project-register.ts` (register new consumer project w/ peerDep pin), `codegen-trigger.ts` (on-demand regeneration with header contract), `scenario-create.ts` (spawn ScenarioSandbox), `capability-token-check.ts` (L2 pre-flight)
   - `bridge/mcp-server.ts` — wire 5 new handlers into tool dispatch
2. **Hooks 6→15** (`~/.claude/plugins/palantir-mini/hooks/hooks.json`):
   - Keep 6: PreToolUse, PostToolUse, PreCompact, TaskCompleted, Stop, SessionStart
   - Add 9: TaskCreated, TeammateIdle, SubagentStop, PostCompact, UserPromptSubmit, MemoryWrite, MemoryRead, AgentStart, AgentStop
   - Each new hook gets a handler script under `hooks/` invoked via `scripts/run.ts` dispatch
3. **Validation pipeline 4→6 phases** (`~/.claude/plugins/palantir-mini/lib/validation/pipeline.ts`):
   - Keep: Design, Compile, Runtime, Post-Write
   - Add: Deploy (verify branch state + CI green before deploy step), Merge (post-merge drift + schema lock + codegen determinism recheck)
4. **Codegen deterministic header** (`~/.claude/plugins/palantir-mini/lib/codegen/manifest.ts`):
   - Header format: `// @generated { schema: v1.0.0 | ontology-hash: <sha256> | generator: pm-codegen@<version> | timestamp: <ISO> }`
   - pm-verify phase 4 enforces byte-identical regeneration
5. **L2/L3 RBAC** (`~/.claude/plugins/palantir-mini/managed-settings.d/50-palantir-mini.json`):
   - L2: CapabilityToken validation for `ship-merge`, `schema-write`, `ontology-register`
   - L3: Marking enforcement for cell/column access
6. **Version bumps**:
   - `.claude-plugin/plugin.json`: `0.2.0` → `1.0.0`, `compatibleSchemaVersions`: `">=1.0.0 <2.0.0"`, `requiresClaudeCodeVersion` unchanged
   - `package.json`: `0.2.1` → `1.0.0`, `description` mentions v1.0 surface
7. Wire `monitors/drift-watch.ts` + `monitors/event-log-tail.ts` to new hooks (TeammateIdle, PostCompact)

**Files touched** (summary):
- `bridge/handlers/*.ts` (5 new)
- `bridge/mcp-server.ts` (edit)
- `hooks/hooks.json` (edit)
- `hooks/*.ts` (9 new handler scripts)
- `lib/validation/pipeline.ts` (edit — add 2 phases)
- `lib/codegen/manifest.ts` (edit — header contract)
- `managed-settings.d/50-palantir-mini.json` (edit — L2/L3 rules)
- `.claude-plugin/plugin.json` (edit)
- `package.json` (edit)

**CI**: plugin's own `bun test` + `/pm-verify` (must pass 6 phases); hook registration smoke test; MCP tool surface contract test (10 handlers respond).

**blockedBy**: W2 (schemas v1.0 MCP tools reference new primitives), W3 (home ontology re-export surface for `ontology-schema-get`).

**Tier**: Tier-2 (large plugin restructure).

---

## W5 — 3-consumer migration (3 atomic PRs)

### W5 · atomic 24-48h window, 3 pre-staged branches, coordinated merge

**Owners**: pm-migrator, mc-migrator, palantirkc-migrator (Sonnet, parallel)

**Strategy**: All 3 PRs pre-staged on feature branches. Lead coordinates atomic merge sequence: palantirkc merges first (control plane update), then palantir-math + mathcrew back-to-back within 2h. Rollback shim v1.0.1 (pure re-export of v0.2.1 symbols) available if CI fails mid-window.

#### W5-A · palantir-math PR "W5 migrate to claude-schemas v1.0 + home shared-core"

**Deliverables**:
1. `package.json` `peerDependencies`: `@palantirKC/claude-schemas` git URL `#v0.2.1` → `#v1.0.0`
2. `ontology/` root files (14 files: schema.ts, data.ts, logic.ts, action.ts, capabilities.ts, changeContracts.ts, runtime.ts, security.ts, frontend.ts, data/, capabilities/, changeContracts/, BROWSE.md, INDEX.md, BEHAVIOR.md): replace direct `@palantirKC/claude-schemas` imports with `import * as SharedCore from "~/ontology/shared-core"` (via relative symlink or tsconfig path mapping)
3. Preserve math-specific: `ConceptPrimitive` (math variant), JSXGraphRenderer, sequencer-specific extensions — these stay local, only the shared primitives get deduplicated
4. Add `.palantir-mini/session/events.jsonl` migration event `schemas_v1_adopted`
5. `CLAUDE.md` + `BROWSE.md` + `INDEX.md` — reflect v1.0 shared-core authority

**CI**: `bunx tsc --noEmit` + `bun test` + `bun run ontology:drift` (if present) + `bun run ontology:drift:runtime` (if present)

#### W5-B · mathcrew PR "W5 migrate to claude-schemas v1.0 + home shared-core"

**Deliverables**:
1. `package.json` `peerDependencies`: same bump. Root `package.json` (monorepo top); `packages/*/package.json` inherit.
2. `ontology/` root (14 files incl. BeatTemplate, TheaterKind, palantir events, concept primitives): same shared-core re-export migration
3. Preserve theater-specific: BeatTemplate runtime wiring, TheaterKind DSL, Playwright primitives — stay local
4. `packages/core` + `packages/client`: update imports if any referenced schema types directly
5. `.palantir-mini/session/events.jsonl` migration event
6. `CLAUDE.md` + `BROWSE.md` + `INDEX.md` updates

**Note**: 4 theater-runtime deferred items (teaching-flow.ts beatTemplate wiring, interactive-beat evaluator bridge, Playwright goldens, FPS-driven tier switch) **NOT included** — PRs #97-99 already progressing independently on this track. W5-B does not touch theater runtime.

**CI**: `bunx tsc --noEmit` + `bun test` + Playwright smoke + existing drift scripts

#### W5-C · palantirkc PR "W5 update home-side control plane for v1.0 migration"

**Deliverables**:
1. No `peerDependencies` bump (palantirkc is the schemas-host repo), but update consumer pin **references** in `~/UNIVERSALIZATION.md` v1.0.0 matrix
2. `~/MEMORY.md` entry documenting the migration
3. `.palantir-mini/session/events.jsonl` migration event (home-side)
4. `~/REBUILD-2026-04.md` (new file) — major version migration record: what changed, why, consumer migration guide (both W5-A and W5-B call this from their CLAUDE.md)

**CI**: tsc (no code change); pm-verify 6-phase

**Atomic gate** (Lead-direct post all 3 merges):
- Run `bunx tsc --noEmit` in all 3 project clones in sequence, must be green
- Run `pm-verify` in all 3, must pass
- If any fails: trigger v1.0.1 shim tag prepare + coordinated revert PRs

**blockedBy**: W4

**Tier**: Tier-2 per PR (cross-file migration).

---

## W6 — Skills rebuild (1 PR)

### W6 · palantirkc PR "W6 skills rebuild — /orchestrate+/ship v1.0, /palantir-dispatch+/ontology-register NEW"

**Owner**: skills-impl (Sonnet)

**Deliverables**:
1. **`~/.claude/skills/orchestrate/SKILL.md` — REWRITE v1.0**:
   - Every phase transition calls `mcp__palantir-mini__emit_event` with phase name + decision lineage
   - Every task dispatch goes through plugin MCP (no bare Agent/TaskCreate — wrapped in plugin action)
   - 6-phase protocol structure preserved, but each phase gate reads events.jsonl for prior session state and writes phase_completed event
   - Decomposition decisions emit `task_decomposed` events with DAG metadata
2. **`~/.claude/skills/ship/SKILL.md` — REWRITE v1.0**:
   - PR body generated from events.jsonl lineage (session_start → phase_completed events → session_complete)
   - Enforces `/pm-verify` 6-phase gate before merge
   - Schema lock + codegen drift pre-flight checks
   - Emits `ship_committed` + `session_complete` events
3. **`~/.claude/plugins/palantir-mini/skills/pm-ontology-register/SKILL.md` — NEW**:
   - Primitive registration: accepts primitive decl → validates against schemas v1.0 → writes to project ontology/ → triggers codegen → emits `ontology_registered` event
   - Replaces manual "edit ontology/ + regenerate + commit" flow
4. **`~/.claude/skills/palantir-dispatch/SKILL.md` — NEW** (user-scope; cross-project):
   - Semantic intent classifier: parses user request → maps to {register, migrate, audit, ship, orchestrate, scenario} intent → routes to correct skill
   - Fallback to `/orchestrate` when intent ambiguous
   - Emits `dispatch_routed` events
5. **Delete user-scope pm-* stubs** (deprecated window closed):
   - `~/.claude/skills/pm-action/`
   - `~/.claude/skills/pm-blueprint/`
   - `~/.claude/skills/pm-codegen/`
   - `~/.claude/skills/pm-init/`
   - `~/.claude/skills/pm-recap/`
   - `~/.claude/skills/pm-replay/`
   - `~/.claude/skills/pm-verify/`
   - Plugin-scope `palantir-mini:pm-*` variants remain authoritative
6. SKILL.md linting: every new/rewritten skill passes `name` + `description` frontmatter check

**Files touched**:
- `~/.claude/skills/orchestrate/SKILL.md` (edit)
- `~/.claude/skills/ship/SKILL.md` (edit)
- `~/.claude/plugins/palantir-mini/skills/pm-ontology-register/` (new dir + SKILL.md)
- `~/.claude/skills/palantir-dispatch/` (new dir + SKILL.md)
- 7 user-scope pm-* dirs (delete)

**CI**: skill linting, plugin-scope + user-scope SKILL.md validity, events.jsonl emission smoke test from each skill

**blockedBy**: W5 (rewritten skills target v1.0 substrate)

**Tier**: Tier-2 (semantic rewrite of 2 large skills + 2 new authors).

---

## Phase D — Ship (per project)

For each of `palantir-math`, `mathcrew`, `palantirkc` (in order):
1. `/pm-verify` — 6-phase validation pipeline (plugin-authoritative post-W4)
2. Native: `bunx tsc --noEmit` + `bun test` + `bun run ontology:drift` + `bun run ontology:drift:runtime` (if present)
3. `/ship` (post-W6 rewrite) — PR body from events.jsonl
4. Emit `session_complete` event to that project's `.palantir-mini/session/events.jsonl`

Ship wraps the rebuild session formally. Final artifact: 3 events.jsonl files carrying complete Phase B+C+D lineage.

---

## Schemas v1.0 — primitive file template

Each of 9 new primitive files follows this shape (P-H-A pattern, proven in 22/22 tests):

```ts
/**
 * @stable — <PrimName> primitive (prim-<domain>-<n>, v1.0)
 * Authority: research/palantir/<subdir>/ → schemas/ontology/primitives/<name>.ts
 *   → home-ontology/shared-core → per-project ontology/
 * D/L/A domain: <DATA|LOGIC|ACTION|SECURITY|LEARN>
 */
export type <Name>Rid = string & { readonly __brand: "<Name>Rid" };
export const <name>Rid = (s: string): <Name>Rid => s as <Name>Rid;
export interface <Name>Declaration { ... fields ... }
export class <Name>Registry {
  private readonly items = new Map<<Name>Rid, <Name>Declaration>();
  register(decl: <Name>Declaration): void { ... }
  get(rid: <Name>Rid): <Name>Declaration | undefined { ... }
  keys(): IterableIterator<<Name>Rid> { ... }
  list(): <Name>Declaration[] { ... }
}
export const <UPPER_NAME>_REGISTRY = new <Name>Registry();
```

Each primitive also exports through `~/.claude/schemas/index.ts` and `~/.claude/schemas/ontology/index.ts` (if exists).

---

## Plugin v1.0 — diff summary

| Surface | v0.2 | v1.0 | Delta |
|---|---|---|---|
| MCP tools | 5 | 10 | +ontology_schema_get, project_register, codegen_trigger, scenario_create, capability_token_check |
| Hooks | 6 | 15 | +TaskCreated, TeammateIdle, SubagentStop, PostCompact, UserPromptSubmit, MemoryWrite, MemoryRead, AgentStart, AgentStop |
| Validation phases | 4 | 6 | +Deploy, Merge |
| RBAC layers | L1 | L1+L2+L3 | +CapabilityToken, +MarkingDeclaration |
| Codegen contract | implicit | deterministic header | schema version + ontology hash + generator version + timestamp |
| Version | 0.2.0 | 1.0.0 | major bump |

---

## Per-project ontology — migration shape

| Project | ontology location | v1.0 changes | Preserved locals |
|---|---|---|---|
| `~/` (palantirkc) | `~/ontology/` **NEW** | Creates shared-core via W3 | CrossProjectTeammate, CoordinatedPRWave |
| `~/palantir-math/` | `ontology/` root (14 files) | peerDep v1.0.0 + shared-core re-export replaces direct schemas imports | ConceptPrimitive math variant, JSXGraphRenderer, sequencer-* |
| `~/mathcrew/` | `ontology/` root (14 files, root-level not packages/core) | peerDep v1.0.0 + shared-core re-export | BeatTemplate, TheaterKind, palantir theater events |

---

## Skills rebuild matrix

| Scope | Skill | Verdict | Notes |
|---|---|---|---|
| user | `lsp-audit` | **keep** | TypeScript-only audit still meaningful for runtime |
| user | `orchestrate` | **rewrite** | W6 v1.0: plugin substrate + events.jsonl emission |
| user | `palantir-walk` | **keep** | ontology pedagogy skill, project-agnostic |
| user | `pm-action` | **delete** | Plugin-scope supersedes |
| user | `pm-blueprint` | **delete** | Plugin-scope supersedes |
| user | `pm-codegen` | **delete** | Plugin-scope supersedes |
| user | `pm-init` | **delete** | Plugin-scope supersedes |
| user | `pm-recap` | **delete** | Plugin-scope supersedes |
| user | `pm-replay` | **delete** | Plugin-scope supersedes |
| user | `pm-verify` | **delete** | Plugin-scope supersedes |
| user | `ship` | **rewrite** | W6 v1.0: events.jsonl-driven PR body + 6-phase gate |
| user | `tavily-cli` | **keep** | External research tool |
| user | `palantir-dispatch` | **NEW** | Semantic intent classifier + router |
| plugin | `pm-action` | **keep-extend** | Add CapabilityToken pre-flight |
| plugin | `pm-blueprint` | **keep-extend** | Extend for 4-pillar blueprint shape |
| plugin | `pm-codegen` | **keep-extend** | Integrate deterministic header contract |
| plugin | `pm-init` | **keep** | Bootstrap project ontology |
| plugin | `pm-recap` | **keep** | Event replay summary |
| plugin | `pm-replay` | **keep** | Decision lineage replay |
| plugin | `pm-verify` | **keep-extend** | 4→6 phase pipeline integration |
| plugin | `pm-ontology-register` | **NEW** | Primitive registration + codegen emission |
| project | `palantir-math/.claude/skills/*` | **defer** | Project-specific; out of rebuild scope |
| project | `mathcrew/.claude/skills/*` | **defer** | Project-specific; out of rebuild scope |
| kosmos | `kosmos-research` | **read-only** | Research runtime, untouched |

---

## Legacy verdict — research library (`~/.claude/research/palantir/`)

| Subdir | Verdict | Reason |
|---|---|---|
| `action/` | keep | canonical action/mutation semantics |
| `architecture/` | keep-partial | `adapter-gap-analysis.md` legacy-maybe; other 2 authoritative |
| `cross-cutting/` | keep | shared semantic patterns |
| `data/` | keep | ObjectType/ValueType/Struct foundation |
| `decision-lineage/` | keep | 5-dim envelope authority |
| `entry/` | keep | skill dispatch patterns |
| `logic/` | keep | link/derived/reducer primitives |
| `marketplace/` | **delete** (W1) | BROWSE+INDEX stub only, no content references |
| `osdk/` | keep + fix INDEX (W1) | stub sub-files; INDEX references 4 missing files → rewrite to drop refs |
| `philosophy/` | keep | digital-twin foundational |
| `platform/` | keep | palantir platform primitives |
| `security/` | keep | RBAC + capability + marking source |
| `ship-os/` | keep | ship pipeline patterns |
| `typescript/` | **upgrade to keep-authoritative** (W1) | 527 LOC substantive content |
| `validation/` | keep | pm-verify pipeline authority |

---

## Legacy verdict — schemas (`~/.claude/schemas/`)

| File/dir | Verdict | Reason |
|---|---|---|
| `ontology/types.ts` | keep-read-only (deprecation-tracked) | existing interfaces aliased; locked by managed-settings deny rules |
| `ontology/semantics.ts` | keep-read-only (deprecation-tracked) | same |
| `ontology/primitives/*` | keep + extend | 9 new files added (W2) |
| `ontology/codegen/*` | keep-extend | deterministic header contract integration (W4) |
| `ontology/functions/*` | keep | existing function registry |
| `ontology/generators/*` | keep | generator manifest pattern reused |
| `ontology/policies/*` | keep | policy registry |
| `ontology/helpers.ts` | keep | utility functions |
| `interaction/*` | keep | no v1.0 changes |
| `meta/*` | keep (review-possibly-deprecate post-session) | no per-project use; not in v1.0 delete scope |
| `rendering/*` | keep | may need extension for mathcrew theater primitives (deferred) |
| `CHANGELOG.md` | update (W2) | v1.0.0 entry |

---

## PR Handling at session start

| Project | Open PRs | Action |
|---|---|---|
| palantirkc | 0 | Direct to rebuild PRs |
| palantir-math | 0 | Direct to rebuild PRs |
| mathcrew | 0 | Direct to rebuild PRs |

No pre-session cleanup needed.

---

## Validation Strategy (per-PR mandatory)

Every rebuild PR MUST pass:
1. `bunx tsc --noEmit` (project root or monorepo)
2. `bun test` (full suite)
3. `pm-verify` (4-phase pre-W4; 6-phase post-W4)
4. Project-specific: `bun run ontology:drift` + `ontology:drift:runtime` if declared
5. CI status check green

Wave-level gate:
- W1 → W2: palantirkc CI green + palantir-math CI green
- W2 → W3: palantirkc CI green + schemas tag v1.0.0 pushed
- W3 → W4: palantirkc CI green + `~/ontology/` smoke test
- W4 → W5: palantirkc CI green + plugin `/pm-verify` passes 6 phases
- W5 → W6: 3 consumer CIs all green + atomic merge complete
- W6 → Phase D: palantirkc CI green + new skills linting passes

Failure → **halt the wave**, root-cause analysis, next wave delayed until resolved.

---

## TeamMate Composition

| Agent | Model | Role | Wave | File-ownership scope |
|---|---|---|---|---|
| planner | Opus | Phase B plan drafting | (this phase — in-progress) | plan file only |
| preconditions-impl | Sonnet | W1-A palantirkc precond | W1 | plugin package.json, research/palantir/ subdirs, tavily doc |
| pm-preconditions-impl | Sonnet | W1-B palantir-math precond | W1 | jsxgraph renderer + curveHelpers + useTeachingState |
| schemas-impl | Sonnet | W2 schemas v1.0 | W2 | ~/.claude/schemas/ontology/primitives/ + CHANGELOG + package.json |
| home-impl | Sonnet | W3 home ontology | W3 | ~/ontology/ + ~/CLAUDE.md + ~/UNIVERSALIZATION.md |
| plugin-impl | Sonnet | W4 plugin v1.0 | W4 | ~/.claude/plugins/palantir-mini/ (bridge, hooks, lib, managed-settings) |
| pm-migrator | Sonnet | W5 palantir-math migration | W5 | palantir-math ontology/ + package.json + docs |
| mc-migrator | Sonnet | W5 mathcrew migration | W5 | mathcrew ontology/ + package.json + packages/*/package.json + docs |
| palantirkc-migrator | Sonnet | W5 home control plane | W5 | UNIVERSALIZATION.md + MEMORY.md + REBUILD-2026-04.md |
| skills-impl | Sonnet | W6 skills rebuild | W6 | ~/.claude/skills/{orchestrate,ship,palantir-dispatch}/ + plugin skills/pm-ontology-register/ |
| shipper | Sonnet | Phase D per-project ship | Phase D | events.jsonl + CLAUDE.md/BROWSE.md/INDEX.md sync per project |

Lead (me) orchestrates TeamCreate/TaskCreate DAG, spawns teammates per wave, monitors phase gates, coordinates W5 atomic merge. Lead does NOT write code — delegates all implementation.

---

## Acceptance Criteria

Session declared complete when ALL true:
- [ ] 8 rebuild PRs merged (W1-A, W1-B, W2, W3, W4, W5-A, W5-B, W5-C, W6)
- [ ] 3 project CIs green on main
- [ ] `bunx tsc --noEmit` passes in all 3 projects
- [ ] `bun test` passes in all 3 projects
- [ ] `/pm-verify` passes in all 3 projects
- [ ] `~/UNIVERSALIZATION.md` reflects v1.0 architecture
- [ ] `~/REBUILD-2026-04.md` documents major version migration
- [ ] 3 `events.jsonl` files contain `session_complete` event for this session
- [ ] `park-kyungchan/claude-schemas` v1.0.0 git tag pushed to GitHub
- [ ] `palantir-mini@1.0.0` plugin shipped (plugin.json + package.json)
- [ ] 3 consumer `peerDependencies` pinned to v1.0.0
- [ ] `~/ontology/shared-core/` exists and re-exports 11+ primitives (2 v0.2 + 9 v1.0)
- [ ] `/palantir-dispatch` + `/pm-ontology-register` skills registered and callable
- [ ] user-scope pm-* stub directories deleted (7 subdirs gone)
- [ ] Phase B plan mirror written to `~/kosmos/reports/phase-b-plan.md` + `~/REBUILD-v1-PLAN-2026-04-17.md` (deliverable of W1-A as Lead-direct followup)

---

## Critical files to modify (by path)

### Schemas (W2)
- `~/.claude/schemas/ontology/primitives/struct.ts` (new)
- `~/.claude/schemas/ontology/primitives/value-type.ts` (new)
- `~/.claude/schemas/ontology/primitives/shared-property-type.ts` (new)
- `~/.claude/schemas/ontology/primitives/capability-token.ts` (new)
- `~/.claude/schemas/ontology/primitives/marking-declaration.ts` (new)
- `~/.claude/schemas/ontology/primitives/automation-declaration.ts` (new)
- `~/.claude/schemas/ontology/primitives/webhook-declaration.ts` (new)
- `~/.claude/schemas/ontology/primitives/scenario-sandbox.ts` (new)
- `~/.claude/schemas/ontology/primitives/aip-logic-function.ts` (new)
- `~/.claude/schemas/ontology/lineage/event-types.ts` (edit — 10→16)
- `~/.claude/schemas/ontology/CHANGELOG.md` (edit — v1.0 entry)
- `~/.claude/schemas/CHANGELOG.md` (edit — v1.0 root)
- `~/.claude/schemas/package.json` (edit — version)
- `~/.claude/schemas/index.ts` (edit — re-exports)

### Home ontology (W3)
- `~/ontology/shared-core/index.ts` (new)
- `~/ontology/shared-core/cross-project-teammate.ts` (new)
- `~/ontology/shared-core/coordinated-pr-wave.ts` (new)
- `~/ontology/BROWSE.md` (new)
- `~/ontology/INDEX.md` (new)
- `~/ontology/README.md` (new)
- `~/CLAUDE.md` (edit)
- `~/UNIVERSALIZATION.md` (edit)

### Plugin (W4)
- `~/.claude/plugins/palantir-mini/bridge/handlers/{ontology-schema-get,project-register,codegen-trigger,scenario-create,capability-token-check}.ts` (new)
- `~/.claude/plugins/palantir-mini/bridge/mcp-server.ts` (edit)
- `~/.claude/plugins/palantir-mini/hooks/hooks.json` (edit)
- `~/.claude/plugins/palantir-mini/hooks/*.ts` (9 new handlers)
- `~/.claude/plugins/palantir-mini/lib/validation/pipeline.ts` (edit)
- `~/.claude/plugins/palantir-mini/lib/codegen/manifest.ts` (edit)
- `~/.claude/plugins/palantir-mini/managed-settings.d/50-palantir-mini.json` (edit)
- `~/.claude/plugins/palantir-mini/.claude-plugin/plugin.json` (edit)
- `~/.claude/plugins/palantir-mini/package.json` (edit)

### Per-project migration (W5)
- `palantir-math/package.json` + `palantir-math/ontology/*.ts` + docs
- `mathcrew/package.json` + `mathcrew/packages/*/package.json` + `mathcrew/ontology/*.ts` + docs
- palantirkc docs: `~/UNIVERSALIZATION.md`, `~/MEMORY.md`, `~/REBUILD-2026-04.md` (new)

### Skills (W6)
- `~/.claude/skills/orchestrate/SKILL.md` (edit)
- `~/.claude/skills/ship/SKILL.md` (edit)
- `~/.claude/skills/palantir-dispatch/SKILL.md` (new)
- `~/.claude/plugins/palantir-mini/skills/pm-ontology-register/SKILL.md` (new)
- 7 user-scope pm-* directories (delete)

### Precondition (W1)
- `~/.claude/plugins/palantir-mini/package.json` (edit — OBS-01)
- `~/.claude/research/palantir/marketplace/` (delete)
- `~/.claude/research/palantir/osdk/INDEX.md` (edit)
- `~/.claude/research/palantir/typescript/INDEX.md` (edit)
- `palantir-math/src/rendering/jsxgraph/curveHelpers.ts` (new)
- `palantir-math/src/rendering/jsxgraph/jsxGraphRenderer.ts` (edit)
- `palantir-math/src/hooks/useTeachingState.ts` (doc edit)

---

## Verification (end-to-end)

After all 8 PRs merged:

```bash
# Schemas tag verification
cd /tmp && rm -rf verify-schemas && mkdir verify-schemas && cd verify-schemas
npm install git+https://github.com/park-kyungchan/claude-schemas.git#v1.0.0
ls node_modules/@palantirKC/claude-schemas/ontology/primitives/  # should show 11+ files

# Plugin version
cat ~/.claude/plugins/palantir-mini/.claude-plugin/plugin.json | jq .version  # "1.0.0"
cat ~/.claude/plugins/palantir-mini/package.json | jq .version  # "1.0.0"

# Home ontology smoke test
cd ~ && bunx tsc --noEmit --project <(echo '{"compilerOptions":{"module":"esnext","moduleResolution":"bundler","allowImportingTsExtensions":true,"noEmit":true},"files":["ontology/shared-core/index.ts"]}')

# Per-project tsc + test + pm-verify
for P in palantir-math mathcrew; do
  cd ~/$P && bunx tsc --noEmit && bun test && /pm-verify  # (Claude Code invocation)
done

# Events.jsonl session_complete presence
for P in . palantir-math mathcrew; do
  tail -1 ~/$P/.palantir-mini/session/events.jsonl | jq .type  # "session_complete"
done

# Skills registration
ls ~/.claude/skills/palantir-dispatch/SKILL.md  # exists
ls ~/.claude/plugins/palantir-mini/skills/pm-ontology-register/SKILL.md  # exists
ls ~/.claude/skills/pm-action 2>/dev/null  # should fail (deleted)
```

Each verification failure → post-merge hot-fix PR, do not declare session complete.

---

## Assumptions made by Lead (6 re-review items, all resolved)

| # | Question | My decision | Rationale |
|---|---|---|---|
| A | W1 에 palantir-math F-1/D-cont-2 포함? | **포함** (W1-B) | Blueprint "BEFORE Wave 5" 요구 + PR #153이 부분만 커버; W5 진입 전 리스크 해소 |
| B | mathcrew 4 deferred items 이번 세션 포함? | **불포함** | PR #97-99 이미 독립 궤도; rebuild primary goal ≠ theater runtime completion; W5-B는 theater runtime 안 건드림 |
| C | Schemas cross-repo PR 규칙 | **palantirkc 단일 PR + 후속 tag push** | Tag push는 PR 아니므로 규칙 위배 없음 |
| D | mathcrew ontology 위치 | **root `ontology/`** | 확인: packages/ 아닌 root 실존 |
| E | Home /ontology/ 권한 | **충돌 없음** | managed-settings 잠금은 `~/.claude/schemas/`만, `~/ontology/`는 repo root로 안전 |
| F | Codex agents sync | **별도 follow-up** | [codex] PR 활발 독립 궤도, 이번 rebuild scope 밖 |

---

## Out of Scope (explicit)

- **kosmos 수정** — read-only 리서치 런타임; `~/kosmos/` 건드리지 않음 (단, reports/phase-b-plan.md mirror는 Phase A 결과물 슬롯으로 허용).
- **mathcrew 4 theater-runtime deferred items** — 별도 세션.
- **Codex agents sync** — 별도 follow-up PR.
- **meta axis deprecation** — "review" 상태 유지; v1.1에서 결정.
- **Project-scope skills (palantir-math/mathcrew)** — rebuild 후속 세션.
- **TAVILY_API_KEY 실제 rotation** — 사용자 수작업; W1에서는 문서만.

---

## Post-Plan Mirror (W1-A Lead-direct followup)

이 파일(`bubbly-tumbling-cocoa.md`)의 내용을 post-PlanMode 시점에:
1. `~/kosmos/reports/phase-b-plan.md` (Phase A 결과물 슬롯)
2. `~/REBUILD-v1-PLAN-2026-04-17.md` (home repo read-only mirror)

두 파일에 동일 내용 복사. 이 작업은 Lead-direct로 PlanMode 해제 직후 실행 (W1-A 시작 전).

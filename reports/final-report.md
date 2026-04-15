# Kosmos Final Research Report

**Session ID:** kosmos-research-2026-04-15-palantir-mini
**Generated:** 2026-04-15
**Evaluator Gate:** ACCEPT (15 rules applied; R11 + R13 triggered on H-B only — pipeline health signal, not defect)
**Debate Rounds Used:** 0 / 2 (evidence chain coherent; no dispute required)
**Machine-readable companion:** `/home/palantirkc/kosmos/ontology-state/blueprint.json`

---

## 1. User Objective

**Primary objective:** Build `palantir-mini` — a Claude Code plugin (`~/.claude/plugins/palantir-mini/`) plus extension to `~/.claude/schemas/ontology/` — that implements Palantir Foundry/AIP/Ontology's real operating mechanisms at small scale within Claude Code Native Runtime (API-Free, Claude Max X20, v2.1.108 maximum utilization). The plugin targets cross-project scope: `~/kosmos`, `~/palantir-math`, `~/mathcrew` plus the global `~/.claude/` layer.

**Full objective statement (from T1 decomposition):** Implement OSDK 2.0 patterns and Palantir's 5 must-include infrastructure patterns (two-tier actions, edit functions returning `Edits[]` without commit, OSDK type codegen, 6-phase validation, submission criteria pre-flight) on an append-only event log foundation, mirroring Anthropic Managed Agents Session/Harness/Sandbox virtualization, within Claude Code Native Runtime.

### WHY this exists: 6 root-cause motivations

1. **3 projects reinvent the same ontology pattern 3x** — `kosmos`, `palantir-math`, `mathcrew` each independently model ontology concepts but learnings do not propagate across projects. The same abstractions are re-derived from scratch each time.

2. **Foundry-shaped silos without Foundry's actual mechanisms** — the projects look like Foundry (they use Palantir vocabulary) but lack Foundry's real mechanisms: no shared schema registry, no propagation enforcement, no change audit, no capability tokens, no OSDK regen.

3. **Multi-runtime fragmentation** — ontology knowledge is trapped in Claude memory blobs. When Codex or Gemini pick up the same codebase, they reinvent because there is no declarative, filesystem-accessible contract.

4. **`~/.claude/research/palantir/` is read-only evidence, not executable contract** — 61 files of high-quality Palantir research exist in the internal library, but code across the 3 projects does not follow the patterns. The research is decorative, not operative.

5. **BackwardProp loop broken** — `kosmos` generates blueprints; `palantir-math` and `mathcrew` generate runtime evidence. Neither feeds back to the other. Each session starts from zero.

6. **`palantir-math` `data.ts` (141KB / 2,190 LOC) is approaching OSDK 1.x failure mode** — a single-file ontology declaration at this size is exactly the pattern Palantir replaced with OSDK 2.0 separated client/generated architecture. If not migrated before it grows further, the pain compounds.

**Pre-pipeline synthesis input:** `~/.claude/research/claude-code/palantir-mini-blueprint.md` — the v0 architecture document created after multi-project survey, v2.1.108 feature inventory, OSDK 2.0 patterns research, Anthropic Managed Agents deep-dive, and Palantir library deep-dive. This document served as the primary input to the 7-agent pipeline.

---

## 2. Research Questions (D/L/A Tags)

Seven research questions were decomposed from the user objective at T1. All carry explicit D/L/A domain tags and priorities.

| ID | Text (abbreviated) | Domains | Priority |
|----|-------------------|---------|----------|
| **RQ-01** | Append-only event log foundation: minimum viable schema and atomic-append mechanism for cross-project ontology state under API-Free constraint? | LEARN, DATA | P0 |
| **RQ-02** | Two-tier action architecture (declarative tier-1 + function-backed tier-2) with read-only edit-function agents enforcing 'returns Edits[] without commit' via disallowedTools? | ACTION, LOGIC | P0 |
| **RQ-03** | OSDK 2.0 type codegen pattern (branded RID, separated client/generated, lazy loading) applied to ontology declarations across kosmos/palantir-math/mathcrew? | DATA, LOGIC | P0 |
| **RQ-04** | MCP bridge as Harness API: which MCP tools to expose for Session/Harness/Sandbox virtualization within Native Runtime? | ACTION, LEARN | P1 |
| **RQ-05** | 6-phase (or 3-phase minimum) validation pipeline using v2.1.108 hooks with managed-settings.d/ fragments per project? | LOGIC, SECURITY | P1 |
| **RQ-06** | Submission criteria pre-flight gates as foundation for progressive autonomy? | ACTION, SECURITY | P1 |
| **RQ-07** | Migration sequencing from existing palantir-math (most mature) to mathcrew to kosmos with backward compatibility? | DATA, ACTION, LEARN | P2 |

**DevCon 5 3-phase journey mapping:**
- Phase I (Golden Tables): RQ-01 (events.jsonl as durable Golden Table) + RQ-03 (OSDK codegen as typed interface)
- Phase II (Operational Decision-Making): RQ-02 (two-tier actions) + RQ-05 (validation pipeline) + RQ-06 (submission criteria)
- Phase III (AI-First): RQ-04 (MCP bridge for agent composability) + RQ-07 (migration + cross-project propagation)

---

## 3. Retrieval Plan

The researcher (T2 + T3) followed the BROWSE.md protocol with the routes specified at T1.

### Internal routes (T2)

| Route | Purpose | Markers Retrieved |
|-------|---------|-------------------|
| `~/.claude/research/palantir/action/mutations.md` | Two-tier action architecture, submission criteria, OSDK $validateOnly/$returnEdits | §ACTION.MU-09..19, §ACTION.MU-24 |
| `~/.claude/research/palantir/logic/functions.md` | Edit functions v2 returning Edits[], createEditBatch pattern | §LOGIC.FN-04, §LOGIC.FN-09, L496 |
| `~/.claude/research/palantir/validation/README.md` | 6-phase validation timeline, StaleObject pattern | §VAL.R-02..R-08 |
| `~/.claude/research/palantir/typescript/type-safety-as-grounding.md` | TypeScript + OSDK as hallucination-proof pipeline | §TS.TSG-03..TSG-06 |
| `~/.claude/research/palantir/cross-cutting/decision-lineage.md` | 5D Decision Lineage schema (WHEN/ATOP_WHICH/THROUGH_WHICH/BY_WHOM/WITH_WHAT) | §DL-02, §DL-09 |
| `~/.claude/research/claude-code/palantir-mini-blueprint.md` | v0 architecture synthesis (pre-pipeline input) | Architecture + OMC + Gap fills |
| `~/.claude/research/claude-code/managed-agents.md` | Anthropic Managed Agents Brain/Session/Hands | §1-19 |
| `~/.claude/research/claude-code/features.md` | v2.1.108 baseline + delta features | Delta section |

### External routes (T3)

| Source | URL | Tier | Key Findings |
|--------|-----|------|-------------|
| Claude Code Hooks Reference | `code.claude.com/docs/en/hooks` | Tier-1 official | `hookSpecificOutput.permissionDecision` (top-level `decision` DEPRECATED); PreCompact `decision:block` confirmed; TaskCreated/TaskCompleted schemas verified |
| Claude Code Plugins Reference | `code.claude.com/docs/en/plugins-reference` | Tier-1 official | Plugin agents CANNOT define hooks/mcpServers/permissionMode; hooks at `hooks/hooks.json`; `${CLAUDE_PLUGIN_DATA}` survives updates; monitors manifest |
| Palantir OSDK TypeScript v2 | `palantir.com/docs/foundry/functions/typescript-v2-ontology-edits` | Tier-1 official | Edits discriminated union: `Edits.Object<T>`, `Edits.Interface<T>`, `Edits.Link<Src,'linkName'>`; `createEditBatch<OntologyEdit>(client)` |
| proper-lockfile npm | `npmjs.com/package/proper-lockfile` | Tier-3 | mkdir-based atomic locking, NFS-safe, 9.27M weekly downloads, last published 2020 |

**Browse protocol compliance:** DC5 markers used for root-level grep; no broad wildcard scanning on research library; provenance tagged throughout.

---

## 4. Internal Findings

All findings from `~/.claude/research/palantir/` are tier-1 official docs with high reliability. Five must-include infrastructure patterns confirmed.

### Pattern 1: Two-Tier Action Architecture

[Official Palantir §ACTION.MU-09..11]

Palantir enforces a strict mutual exclusion between Tier-1 and Tier-2 actions. An ActionType is one or the other — never both.

- **Tier-1 Declarative Action**: Pure CRUD rules. Declarative spec compiled into a fast-path commit handler. Zero custom code.
- **Tier-2 Function-Backed Action**: Wraps an `EditFunction` (LOGIC domain) with an atomic commit. The function computes `Edits[]` without executing; the action executes.

[clm-rq02-01]: "Palantir Two-Tier Action Architecture: Tier 1 declarative CRUD + Tier 2 function-backed, mutually exclusive."

### Pattern 2: Edit Functions Return Edits[] Without Commit

[Official Palantir §LOGIC.FN-04, §LOGIC.FN-09]

> From `logic/functions.md §LOGIC.FN-04`: "Edit functions v2: must return `Edits[]` (not void), `createEditBatch<OntologyEdit>(client)` pattern, `batch.getEdits()` — authoring helper does NOT commit edits."

[clm-rq02-02]: "Edit Functions v2 return `Edits[]` without commit; commit only happens when wrapped as function-backed Action."
[clm-rq02-03]: "Authoring helper executes edit functions without committing edits — explicit test-without-side-effects guarantee."
[clm-ext-18]: "Within function execution, reading a property after `batch.update` does NOT reflect the uncommitted change."

The OSDK v2 Edits discriminated union has 3 variants [clm-rq03-04]: `Edits.Object<T>`, `Edits.Interface<T>`, `Edits.Link<Src,'linkName'>`. The `createEditBatch<OntologyEdit>(client)` returns a batch with `update/create/delete/link/unlink/getEdits` methods [clm-ext-14].

### Pattern 3: OSDK Type Codegen from Ontology

[Official Palantir §TS.TSG-03..TSG-06]

> From `typescript/type-safety-as-grounding.md`: "TypeScript + OSDK codegen creates mechanically hallucination-proof pipeline. 5 schema categories: ObjectType, Property, LinkType, ActionType, Function."

[clm-rq03-01]: "OSDK generates TypeScript types from Ontology metadata — only Ontology-defined concepts compile."
[clm-rq03-02]: "Compile-time validation catches incompatible type changes after OSDK regen."
[clm-rq03-03]: "palantir-math data.ts is 141,618 bytes / 2,190 LOC — exceeds OSDK 1.x single-file threshold." [Official, provenance=official, confidence=1.0]

### Pattern 4: 6-Phase Validation

[Official Palantir §VAL.R-02..R-08]

[clm-rq05-01]: "Palantir 6-phase validation: Design/Compile/Deploy/Merge/Runtime/Post-Write, each catching distinct error classes."

The StaleObject pattern (`§VAL.R-07`) is real and proven in Foundry — but is designed for in-place mutation against an ontology server, not a stateless harness model. This distinction becomes the empirical battleground between H-A and H-B in the simulation phase.

### Pattern 5: Submission Criteria as Pre-Flight

[Official Palantir §ACTION.MU-14..17]

[clm-rq02-04]: "Submission Criteria are independent from edit permissions; ALL must pass for action submission."
[clm-rq02-05]: "Submission criteria support 9 constraint types: Range/ArraySize/StringLength/StringRegexMatch/OneOf/ObjectQueryResult/ObjectPropertyValue/GroupMember/Unevaluable."
[clm-rq04-02]: "OSDK 2.0 supports `$validateOnly:true` — evaluates submission criteria without applying edits."
[clm-rq04-03]: "OSDK 2.0 supports `$returnEdits:true` — executes and returns applied edits for post-commit audit."

### 5-Dimensional Decision Lineage

[Official Palantir §DL-02]

> "5-dimensional Decision Lineage schema: WHEN/ATOP_WHICH/THROUGH_WHICH/BY_WHOM/WITH_WHAT, per Chief Architect Akshay Krishnaswamy blog.palantir.com Jan 2024"

[clm-rq01-01]: "Decision Lineage captures 5 dimensions (WHEN/ATOP_WHICH/THROUGH_WHICH/BY_WHOM/WITH_WHAT) per decision artifact." This becomes the `EventEnvelopeBase` schema — every event carries all 5 dimensions.

---

## 5. External Findings

### (a) Anthropic Managed Agents — Session/Harness/Sandbox Virtualization

[Official, tier-1, src-int-managed-agents]

[clm-rq01-02]: "Anthropic Managed Agents Session = append-only event log; Harness = stateless orchestrator; Sandbox = stateless executor."
[clm-rq01-03]: "Session event log is durable, immutable and persists across disconnects."

The virtualization principle from the Anthropic engineering article (mirrored in `~/.claude/research/claude-code/managed-agents.md §1-19`):

> "We virtualized the components of an agent: a session (the append-only log of everything that happened), a harness (the loop that calls Claude and routes Claude's tool calls to the relevant infrastructure), and a sandbox (an execution environment where Claude can run code and edit files). This allows the implementation of each to be swapped without disturbing the others."

**palantir-mini mapping:**

| Abstraction | Property | palantir-mini equivalent |
|---|---|---|
| Session | Durable append-only event log | `events.jsonl` per project + `${CLAUDE_PLUGIN_DATA}/vault/` |
| Harness | Stateless orchestrator (cattle) | Claude Code session + plugin hooks |
| Sandbox | Stateless executor (cattle) | Worktree + project filesystem |
| Events (SSE) | Bidirectional protocol | SendMessage between Agent Teams + hooks |
| Vault | Credentials never in generated code | `managed-settings.d/` env vars + `${CLAUDE_PLUGIN_DATA}` |

### (b) Palantir OSDK v2 Edits Discriminated Union

[Official, tier-1, src-ext-osdk-v2-edits]

[clm-rq03-04]: "`Edits.Object<T>`, `Edits.Interface<T>`, `Edits.Link<Src,'linkName'>`"
[clm-ext-14]: "`createEditBatch<OntologyEdit>(client)` returns batch with `update/create/delete/link/unlink/getEdits` methods."
[clm-ext-19]: "Edit functions MUST be wrapped as function-backed Actions to have edits applied."

```typescript
// OSDK v2 Edits union (from palantir/docs/foundry/functions/typescript-v2-ontology-edits)
type OntologyEdit =
  | Edits.Object<MyObjectType>
  | Edits.Interface<MyInterfaceType>
  | Edits.Link<MyObjectType, 'linkPropertyKey'>;

// createEditBatch pattern
const batch = createEditBatch<OntologyEdit>(client);
batch.update(myObject, { field: newValue });
batch.link(objectA, 'linkName', objectB);
return batch.getEdits(); // returns Edits[], does NOT commit
```

### (c) Claude Code v2.1.108 Hook and Plugin Mechanics

[Official, tier-1, src-ext-cc-hooks + src-ext-cc-plugins-ref]

**Critical correction surfaced (Correction 2, HIGH severity):**

[clm-ext-01]: "PreToolUse hooks return decision via `hookSpecificOutput.permissionDecision` (NOT top-level); top-level `decision` field DEPRECATED. Supports `allow/deny/ask/defer` with precedence `deny > defer > ask > allow`."

```json
// CORRECT v2.1.108 PreToolUse output format
{
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permissionDecision": "allow|deny|ask|defer",
    "permissionDecisionReason": "shown to Claude for deny",
    "additionalContext": "injected into Claude context — used for lineage injection"
  }
}
```

**Critical restriction surfaced (Correction 1, HIGH severity):**

[clm-ext-08]: "Plugin-shipped agents CANNOT define `hooks`, `mcpServers`, or `permissionMode` (security restriction). Hooks must be at plugin-level `hooks/hooks.json`."

Additional v2.1.108 features confirmed available:

| Feature | Hook/Mechanism | Version Introduced |
|---------|---------------|-------------------|
| Block compaction on invariant failure | PreCompact `decision:block` | v2.1.105 |
| Phase gate on task completion | TaskCompleted hook exit 2 | v2.1.33 |
| Task creation validation | TaskCreated hook | v2.1.84 |
| Background drift detection | Plugin monitors manifest | v2.1.105 |
| Cross-project worktree reuse | EnterWorktree path | v2.1.105 |
| Tool input rewriting | PreToolUse `updatedInput` | v2.1.85 |
| Async hook execution | Hook `async:true` / `asyncRewake` | v2.1.85 |
| Per-Edit failure context injection | PostToolUseFailure `additionalContext` | — |

[clm-ext-07]: "Plugin manifest monitors field auto-arms Monitor streams at session start or skill invoke."
[clm-ext-09]: "`${CLAUDE_PLUGIN_DATA}` persists across plugin updates; `${CLAUDE_PLUGIN_ROOT}` does NOT."

### (d) oh-my-claudecode (OMC) Best Practices

[Synthesis, tier-3-vendor-blogs with independent convergence, src-int-palantir-mini-blueprint]

OMC (`github.com/Yeachan-Heo/oh-my-claudecode`, 28.9k stars) and its sister project `clawhip` (760 stars, "event routing to prevent context pollution") provide independent convergence on the append-only event log architecture. Five patterns adopted, five rejected:

**Adopted from OMC:**
1. MCP bridge as Harness API (`bridge/mcp-server.ts` exposing 5 tools)
2. Thin bootstrapper (`bun run scripts/run.ts <handler>.ts`) for all hooks
3. Read-only enforcement via `disallowedTools` = "edit functions return Edits[] without commit" implementation
4. Plugin manifest + marketplace.json pair for cross-project distribution
5. Namespaced skill invocation (`/palantir-mini:init`, `/palantir-mini:verify`)

**Rejected from OMC:** untyped `.mjs` hook scripts; monolithic `hooks.json`; multiple shadow state dirs; missing v2.1.108 features. palantir-mini will be the first plugin to use the v2.1.108 ontology-guarded compaction pattern.

**Three-source convergence** [clm-rq01-04, Synthesis, confidence=0.92]:

| Concept | Anthropic Managed Agents | Palantir Foundry | OMC clawhip |
|---------|--------------------------|-----------------|-------------|
| State foundation | Session = append-only log | Decision Lineage 5-dim | "event routing" |
| Stateless layer | Harness | Edit Function (compute only) | MCP bridge |
| Compute/execute split | Harness vs Sandbox | Functions vs Actions | Read-only vs writer agents |

---

## 6. Ontology Mapping

T4 (ontologist) produced 28 primitives across all 5 domains. This is the first kosmos session where SECURITY and LEARN are first-class domains, not N/A placeholders.

**Ontologist key insight (world-model.json):** "palantir-mini cleanly maps Anthropic Managed Agents virtualization (Session = append-only log / Harness = stateless MCP bridge / Sandbox = worktree) onto Palantir 5-domain ontology with no fudge. The EventEnvelope discriminated union (10 variants) IS the LEARN-domain Golden Table, and every DATA/LOGIC/ACTION mutation flows through it as events. SECURITY rides on Native Runtime mechanics instead of new runtime code."

### D/L/A/S/L Domain Summary (28 primitives)

| Domain | Count | Primitives |
|--------|-------|-----------|
| **DATA** | 5 | EventEnvelope (Struct, 10-variant discriminated union), ObjectType, PropertyType (24 branded), SnapshotManifest, CommitSha (branded) |
| **LOGIC** | 8 | EditFunction (returns Edits[]), InterfaceType, LinkType/OBLT, DerivedProperty, Reducer, LinkConstraint, SubmissionCriteria (computational), ValidationPhaseEvaluator |
| **ACTION** | 5 | Tier-1 Declarative Action, Tier-2 Function-Backed Action, AtomicCommit, ActionExecutorAgent, CodegenRun |
| **SECURITY** | 3 | Layer-1 RBAC Policy, SubmissionCriteria (gate semantics), CapabilityToken (vault pattern) |
| **LEARN** | 5 | AppendOnlyEventLog (events.jsonl), DecisionLineage5Dim, EvidenceSufficiency, LineageReplay, RefinementProposal |

**DevCon 5 principles applied:** DDD / DRY / OCP / PECS — all four applied with per-primitive documentation. `overallForwardPropStatus = healthy`, `overallBackwardPropStatus = healthy`.

### Notable ontological decisions

**Transition-zone calls (LOGIC not DATA):** InterfaceType and LinkType appear in the T1 decomposition under DATA scope. The ontologist reclassified both to LOGIC per the Transition Zone rule (SH-01: they enable reasoning/traversal across objects, not entity identity). DerivedProperty and Reducer also live in LOGIC. These calls were accepted by the simulator without re-debate.

**SubmissionCriteria dual modeling (intentional):** SubmissionCriteria appears in BOTH LOGIC (prim-logic-07, computational evaluator) and SECURITY (prim-sec-02, gate semantics). This is intentional per DC5 DDD: the computation lives once (LOGIC, testable/replayable without commit), and the gate semantics lives once (SECURITY, policy-reviewable without digging through function bodies). Not a duplication defect — a domain-slice decision.

**EventEnvelope 10-variant schema:**

```typescript
// EventEnvelopeBase — all 5 Decision Lineage dimensions
interface EventEnvelopeBase {
  eventId: EventId;         // branded string
  when: ISO8601;            // WHEN dimension
  atopWhich: CommitSha;     // ATOP_WHICH dimension (git HEAD SHA)
  throughWhich: {           // THROUGH_WHICH dimension
    sessionId: SessionId;
    toolName: string;
    cwd: string;
  };
  byWhom: {                 // BY_WHOM dimension
    identity: string;
    agentName?: string;
    teamName?: string;
  };
  withWhat: {               // WITH_WHAT dimension
    reasoning?: string;
    hypothesis?: string;
  };
  sequence: number;         // monotonic counter = optimistic version vector
}

type EventEnvelope =
  | { type: 'edit_proposed';              base: EventEnvelopeBase; functionName: string; params: unknown; hypotheticalEdits: OntologyEdit[] }
  | { type: 'edit_committed';             base: EventEnvelopeBase; actionTypeRid: string; appliedEdits: OntologyEdit[]; submissionCriteriaPassed: string[] }
  | { type: 'submission_criteria_failed'; base: EventEnvelopeBase; actionTypeRid: string; failedConstraints: ConstraintResult[] }
  | { type: 'validation_phase_completed'; base: EventEnvelopeBase; phase: 'design'|'compile'|'deploy'|'merge'|'runtime'|'post_write'; passed: boolean; errorClass?: string }
  | { type: 'codegen_started';            base: EventEnvelopeBase; targetProject: string; ontologyVersion: string }
  | { type: 'codegen_completed';          base: EventEnvelopeBase; targetProject: string; generatedFiles: string[]; durationMs: number }
  | { type: 'phase_completed';            base: EventEnvelopeBase; phaseTag: string; taskId: string; validations: string[] }
  | { type: 'drift_detected';             base: EventEnvelopeBase; driftType: string; affectedObjectType: string }
  | { type: 'session_started';            base: EventEnvelopeBase; model: string; effort: string }
  | { type: 'session_ended';              base: EventEnvelopeBase; reason: string; eventCount: number };
```

[Composed from: §DL-02 (5D base), OSDK v2 Edits union, §ACTION.MU-14..18 (constraint types), §VAL.R-02..R-08 (6 phases) — blueprint.md Gap fill 1]

### ForwardProp and BackwardProp paths (healthy)

**ForwardProp (6 steps):**
`~/.claude/schemas/ontology/` (declarations) → `bun codegen` → `lib/event-log/types.ts` + `per-project src/generated/` → `plugin runtime emit_event` → `<project>/.palantir-mini/session/events.jsonl`

**BackwardProp (to ontology update):**
`events.jsonl` → `replay_lineage MCP tool` → 5-dim lineage graph → `drift_detected` events → `ontology refinement proposal` → ontologist review → `schemas/ontology/lineage/` update

Steps 4+5 of BackwardProp (refinement proposals persistence) have minor persistence gaps — deferred to post-v0 Phase III.

---

## 7. Competing Options

Three hypotheses were generated at T5 and scored at T6 across 12 scenarios.

### H-A: Append-Only Event Log Foundation (WINNER)

**Domain:** LEARN (central role)
**Statement:** Append-only `events.jsonl` per project with monotonic sequence counter as optimistic version vector is the optimal foundation for palantir-mini's LEARN-centric D/L/A ontology, because every DATA/LOGIC/ACTION mutation flows through a single `EventEnvelope` discriminated union whose 10 variants collectively form the Decision Lineage 5-dim record, and sequence-check-before-append under `proper-lockfile` (or `fs.mkdir` mutex fallback) gives StaleObject-equivalent concurrency without in-place mutation.

**Architecture implications:**
- Every mutation in all 5 domains emits an `EventEnvelope` to `events.jsonl`
- State is derived by folding events via a Reducer (the `foldToSnapshot()` LOGIC primitive)
- No in-place mutation — rollback = append a compensating event
- The LEARN domain IS the substrate, not a side channel
- Three independent references converge on this pattern [clm-rq01-04]

**Pre-prototype confidence:** 0.85

### H-B: Snapshot + StaleObject Optimistic Concurrency (FORMAL COMPETITOR, DEFEATED)

**Domain:** DATA (primary, LEARN demoted to optional)
**Statement:** Versioned per-project `state.json` with a per-read version tag where writers re-read on conflict is simpler, faster, and survives every v2.1.108 corner case without requiring a filesystem lockfile.

**Architecture implications:**
- `state.json` IS truth; `events.jsonl` becomes optional audit side channel
- Writers check version before commit, retry on mismatch (StaleObject pattern)
- LEARN domain is secondary — `LineageReplay` cannot reconstruct history without full event log
- GAIN: Read performance is O(1) vs H-A's O(events) replay (mitigated by H-A's snapshot cache)
- LOSS: BackwardProp path structurally crippled — no history to replay
- LOSS: Decision Lineage 5-dim cannot be captured with per-mutation fidelity

**Pre-prototype confidence:** 0.45. Empirically defeated at T8 with 24.2% update loss rate.

### H-C: 3-Phase Validation Pipeline (CO-WINNER, ORTHOGONAL)

**Domain:** LOGIC (ValidationPhaseEvaluator primitive)
**Statement:** A 3-phase validation pipeline (Design+Compile fused, Runtime, Post-Write) is the right v0 minimum for palantir-mini, because CC v2.1.108 hooks map cleanly to exactly 3 hook-event classes, the remaining 3 Palantir phases (Deploy/Merge-time) presume a Foundry-like branching workflow that Native Runtime does not mirror, and deferring full 6-phase coverage avoids over-engineering hooks that carry no actionable signal.

**Architecture implications:**
- 3 hook entries in `hooks/hooks.json`: SessionStart+PostToolUse (Design+Compile), MCP `commit_edits` pre-flight (Runtime), PostToolUse(Edit) drift check (Post-Write)
- Deploy/Merge phases delegated to git pre-commit/pre-push hooks outside palantir-mini
- ~150 LOC handler code for 3 phases (vs ~300 LOC for full 6-phase)
- H-C is ORTHOGONAL to H-A vs H-B — runs on top of the event-log substrate, not instead of it
- Mitigation for adversarial hook burnout: `async:true` field available in v2.1.108

**Pre-prototype confidence:** 0.70. Co-accepted with H-A.

---

## 8. Simulation Results (11 Dimensions)

The simulator completed 2 revision rounds on all 12 scenarios. After T7+T8 prototype validation, the `prototypeValidation` dimension was updated from the initial score of 3.

### H-A Scenario Scores (after prototype validation)

| Dimension | Base | Best | Worst | Adversarial | Notes |
|-----------|------|------|-------|-------------|-------|
| Evidence Fit | 5 | 4 | 3 | 3 | 3-source convergence on base; A1 inference on others |
| Implementation Difficulty | 4 | 3 | 2 | 3 | Proven patterns; worst case adds schema-bump tooling |
| Risk Severity | 4 | 5 | 2 | 1 | Adversarial race is critical if unmitigated |
| Reversibility | 4 | 4 | 4 | 3 | JSONL portable; adversarial: duplicate sequences require reconciliation |
| Time-to-Value | 4 | 3 | 2 | 3 | 1-2 weeks base; months if schema bumps |
| Governance Compliance | 4 | 4 | 3 | 2 | Adversarial: audit trail integrity at stake |
| Ecosystem Maturity | 4 | 4 | 3 | 3 | proper-lockfile aging on worst/adversarial |
| D/L/A Fit | 5 | 5 | 4 | 4 | All 5 domains; adversarial does not blur classifications |
| ForwardProp Health | 5 | 5 | 4 | 3 | Chain can fail silently if writes lost (adversarial) |
| Agent Composability | 5 | 5 | 4 | 3 | 5 MCP tools compose cleanly |
| Prototype Validation | **5** | **5** | **5** | **5** | T7: 2000/2000 events, 0 lost, 0 torn writes, 0 duplicates |

**H-A prototype validation score updated from 3 → 5 after T7 empirical results.**

### H-B Scenario Scores (after prototype validation)

| Dimension | Base | Best | Worst | Adversarial |
|-----------|------|------|-------|-------------|
| Evidence Fit | 3 | 2 | 3 | 4 |
| Implementation Difficulty | 5 | 5 | 3 | 2 |
| Risk Severity | 3 | 4 | 2 | 1 |
| Reversibility | 3 | 3 | 2 | 2 |
| Time-to-Value | 5 | 5 | 2 | 2 |
| Governance Compliance | 3 | 3 | 2 | 1 |
| Ecosystem Maturity | 5 | 5 | 4 | 3 |
| D/L/A Fit | 3 | 3 | 2 | 2 |
| ForwardProp Health | 3 | 3 | 2 | 2 |
| Agent Composability | 3 | 3 | 2 | 2 |
| Prototype Validation | **1** | **1** | **1** | **1** |

**H-B prototype validation score updated from 3 → 1 after T8 empirical results (484 lost updates / 2000 = 24.2% loss rate).**

### H-C Scenario Scores

| Dimension | Base | Best | Worst | Adversarial |
|-----------|------|------|-------|-------------|
| Evidence Fit | 4 | 3 | 3 | 4 |
| Implementation Difficulty | 5 | 5 | 3 | 3 |
| Risk Severity | 4 | 4 | 3 | 3 |
| Reversibility | 5 | 5 | 4 | 4 |
| Time-to-Value | 5 | 5 | 3 | 4 |
| Governance Compliance | 4 | 4 | 3 | 4 |
| Ecosystem Maturity | 5 | 5 | 4 | 4 |
| D/L/A Fit | 5 | 5 | 4 | 4 |
| ForwardProp Health | 4 | 4 | 4 | 4 |
| Agent Composability | 4 | 4 | 4 | 3 |
| Prototype Validation | 3 | 3 | 3 | 3 |

H-C prototype validation dimension was not updated (H-C is a validation architecture question, not a concurrency question; its empirical validation is deferred to v0 integration).

### Prototype Validation Results Summary

**H-A (prototype-a, T7):**
- 5 original tests + 5 eval suite tests = 10 tests, 10 pass, 2,287 `expect()` calls
- Adversarial 2-writer race: `{ concurrentWriters:2, eventsPerWriter:1000, totalExpected:2000, totalActual:2000, duplicateSequences:0, tornWrites:0, lostEvents:0, verdict:"pass" }`
- Reproducible across 2 independent runs
- `tsc --noEmit`: 0 errors
- Zero failure modes

**H-B (prototype-b, T8):**
- 5 original tests + 5 eval suite tests = 10 tests, 10 pass (tests verify the weakness), 51 `expect()` calls
- Adversarial 2-writer race: `{ lostUpdates:484 (run1) / 353 (run2) / 56 (run3), staleErrors:111/209/45, verdict:"h-b-weakness-confirmed" }`
- TOCTOU variance confirms structural weakness (not load-dependent)
- `tsc --noEmit`: 0 errors
- 4 classified failure modes (2 critical: LEARN + ACTION; 2 high: LOGIC + DATA)

---

## 9. Scenario Matrix

Full 12-scenario matrix (base/best/worst/adversarial × H-A/H-B/H-C). DevCon5 alignment score included.

| Scenario | Hypothesis | Type | Evidence Sufficiency | Contradiction Status | DevCon5 Score | Prototype Validation |
|----------|-----------|------|---------------------|---------------------|---------------|---------------------|
| S-HA-BASE | H-A | base | sufficient | none | 5 | 5 (T7: 0/2000 lost) |
| S-HA-BEST | H-A | best | partial (A1 inference, A2 persistence gap) | none | 5 | 5 |
| S-HA-WORST | H-A | worst | partial | evidence-gap-driven → T7 resolved | 4 | 5 (fallback works) |
| S-HA-ADV | H-A | adversarial | partial | evidence-gap-driven → T7 resolved | 4 | 5 (0 torn writes) |
| S-HB-BASE | H-B | base | partial | **unresolvable** (LEARN centrality violation) | 3 | 1 |
| S-HB-BEST | H-B | best | insufficient | resolved (A2 caveat) | 3 | 1 |
| S-HB-WORST | H-B | worst | partial | resolved (git-as-audit lossy) | 2 | 1 |
| S-HB-ADV | H-B | adversarial | sufficient | none | 2 | 1 |
| S-HC-BASE | H-C | base | sufficient | none | 5 | 3 (deferred) |
| S-HC-BEST | H-C | best | partial (A2 speculative) | none | 5 | 3 |
| S-HC-WORST | H-C | worst | partial | resolved (soft risk) | 4 | 3 |
| S-HC-ADV | H-C | adversarial | partial (A2 no benchmark) | none | 4 | 3 |

**Key observations:**
- S-HB-BASE has `contradictionStatus: "unresolvable"` — the LEARN centrality conflict is architectural, not empirical. H-B either accepts LEARN demotion (breaking ontologist model) or adopts `events.jsonl` as primary (collapsing to H-A).
- All H-A evidence-gap-driven contradictions (S-HA-WORST, S-HA-ADV) were resolved by T7 prototype — gaps filled empirically.
- H-C scenarios have no unresolvable contradictions; the 3-phase vs 6-phase question is a spectrum, not a fork.

---

## 10. Recommended Path

**Evaluator gate: ACCEPT**
**Winner: H-A (Append-Only Event Log Foundation)**
**Co-winner: H-C (3-Phase Validation Pipeline, orthogonal)**
**Formal competitor: H-B (defeated — 484/2000 lost updates, 24.2% loss rate)**
**Debate rounds: 0 / 2**

### Win rationale (3 independent evaluation axes)

1. **Architectural convergence** — three independent references (Anthropic Managed Agents "Session = append-only log" [clm-rq01-02], Palantir Decision Lineage 5-dim [clm-rq01-01], OMC clawhip "event routing to prevent context pollution" [clm-rq01-04]) all converge on the append-only log pattern without coordination. This is the strongest available evidence without API access.

2. **Empirical superiority** — H-A prototype passes 2-writer adversarial race at 2×1000 events with 0 duplicate sequences, 0 torn writes, 0 lost events (reproducible across 2 runs). H-B loses 484/2000 updates (24.2%) with TOCTOU variance across 3 runs confirming the weakness is structural, not load-dependent [eval-results.json comparisonSummary].

3. **Ontology fit** — H-A populates all 5 domains first-class per world-model's 28 primitives (DATA/LOGIC/ACTION/SECURITY/LEARN, `overallForwardPropStatus = healthy`, `overallBackwardPropStatus = healthy`). H-B cannot reliably populate LEARN (R11 trigger: AppendOnlyEventLog prim-learn-01 impossible from lossy substrate) and has structurally broken BackwardProp (R13 trigger: no history to replay from state.json substrate).

### v0 Implementation Steps

**Step (a): Create plugin structure**
```
~/.claude/plugins/palantir-mini/
├── .claude-plugin/
│   ├── plugin.json          # name, version, hooks ref, mcpServers, skills, agents
│   └── marketplace.json     # for /plugin marketplace add
```
Both files required for cross-project distribution per OMC marketplace pattern [blueprint.md Gap fill, clm-ext-08].

**Step (b): Ship hooks at plugin-level `hooks/hooks.json` (NOT agent frontmatter)**

[Correction 1 — clm-ext-08]: Plugin agents CANNOT define hooks. All hooks live at `hooks/hooks.json`. Hook handlers use matchers to target specific events and agents.

Critical hook registrations:
- `PreToolUse(Edit|Write ontology/*)` → append `edit_proposed` event, inject 5-event lineage summary via `hookSpecificOutput.additionalContext`
- `PostToolUse(Edit)` → append `edit_committed` event + trigger `CodegenRun`
- `PreCompact` → check ontology invariants; `decision:block` if failing (v2.1.105)
- `TaskCompleted` → emit `phase_completed` event; `exit 2` if phase gate fails
- `SubagentStop(ontology-verifier)` → validate verifier output before agent shutdown

All `PreToolUse` hooks must use [Correction 2 — clm-ext-01]:
```json
{ "hookSpecificOutput": { "hookEventName": "PreToolUse", "permissionDecision": "allow|deny" } }
```

**Step (c): MCP bridge exposing 5 tools**

```typescript
// bridge/mcp-server.ts — 5 tool registrations
// mirrors Harness API in Session/Harness/Sandbox virtualization
const tools = [
  { name: "get_ontology",          // read derived snapshot
    inputs: "{ domain, project, atSequence? }" },
  { name: "emit_event",            // append to events.jsonl
    inputs: "{ project, envelope: EventEnvelope }",
    outputs: "{ eventId, sequence }" },
  { name: "apply_edit_function",   // execute tier-2 function returning Edits[]
    inputs: "{ project, functionName, params }",
    outputs: "{ edits: OntologyEdit[], provenance: 5D lineage }",
    mirrors: "§LOGIC.FN-04 authoring helper" },
  { name: "commit_edits",          // atomic commit (action wrapper)
    inputs: "{ project, actionTypeRid, edits, submissionCriteria, validateOnly? }",
    outputs: "{ result: VALID|INVALID, committed, appliedEdits?, perCriterionResult }",
    mirrors: "$validateOnly / $returnEdits OSDK 2.0" },
  { name: "replay_lineage",        // BackwardProp via replay
    inputs: "{ project, filter: { fromSequence?, toSequence?, eventTypes?, byWhom?, affectedObjectType? } }",
    outputs: "{ events, derivedState, lineageGraph }",
    mirrors: "Palantir Decision Lineage 5-dim + BackwardProp" }
];
```

Tools appear in Claude Code as `mcp__palantir-mini__get_ontology`, etc. [clm-rq04-01].

**Step (d): `~/.claude/schemas/ontology/` extension**

New directories under the existing schemas directory:
```
~/.claude/schemas/ontology/
├── primitives/        # object-type.ts, link-type.ts, action-type.ts, property-type.ts, interface-type.ts
├── functions/         # function-signature.ts, derived-property.ts, reducer.ts
├── policies/          # submission-criteria.ts, rbac.ts, propagation.ts
├── lineage/           # decision-lineage.ts, event-types.ts (10-variant EventEnvelope union)
├── generators/        # osdk-2.0-config.ts, lazy-loader.ts
├── types.ts           # KEEP — extend with branded RIDs
├── semantics.ts       # KEEP
└── validation/        # KEEP + extend with phase-evaluator tests
```

**Step (e): Per-project session directory**
```
<project>/.palantir-mini/session/
├── events.jsonl       # THE source of truth (append-only)
├── snapshots/         # derived cache (not truth)
│   ├── ontology.json
│   └── manifest.json  # SnapshotManifest: version, atSequence, generatedAt
├── handoffs/          # phase-gate records
└── locks/             # events.lock (advisory)
```

**Step (f): Migration sequence (starting from palantir-math)**

Following [blueprint.md Gap fill 5]:
1. Extract `schema.ts` (2.5KB) first — validate typegen primitives, minimal blast radius
2. Extract `security.ts` (4KB) — exercises policy codegen
3. Refactor `data.ts` (141KB) by ObjectType into `primitives/` — requires OSDK codegen ready
4. Migrate `capabilities.ts` (57KB) to `~/.claude/schemas/ontology/policies/rbac.ts` — cross-project shared
5. Migrate `changeContracts.ts` (66KB) to `lib/actions/tier1-declarative.ts` + `tier2-function.ts`
6. Wire `events.jsonl` emission via `plugin hooks/hooks.json` (NOT agent frontmatter — Correction 1)
7. Parallel old-path support via compat shim (re-export from generated files) during transition

After palantir-math: mathcrew, then kosmos. Each project follows the same 7-step sequence.

---

## 11. Risks and Unknowns

### risk-01: Bun compatibility for proper-lockfile (MEDIUM)

[clm-ext-24, inference, confidence=0.75] proper-lockfile uses standard Node `fs` APIs (graceful-fs); compatibility under Bun is inferred, not empirically proven. H-A prototype-a proved `fs.mkdir` fallback path works (0 lost events / 2000) but did not test proper-lockfile itself under Bun.

**Mitigation:** T7 already proved `fs.mkdir`-only path works. Use that as the production path in v1 and defer proper-lockfile to optional optimization.

### risk-02: Cross-project shared schemas write coordination (MEDIUM)

3 projects share `~/.claude/schemas/ontology/`. Claude Code is declared sole writer (constraint boundary). The gap-03 architectural resolution (git branches coordinate parallel sessions; per-project `events.jsonl` lockfile handles per-project atomic writes) works for v0 — but the assumption that Codex/Gemini remain readers-only must hold at deployment time.

**Mitigation:** gap-03 resolved architecturally — no new mechanism needed for v0. If Codex/Gemini become writers, reintroduce multi-writer coordination.

### risk-03: proper-lockfile last published 2020 (LOW)

5 years old; maintainer activity low. Still 9.27M weekly downloads [contra-01, resolved].

**Mitigation:** `fs.mkdir` zero-dep fallback is already the empirically proven path. Consider making fallback the only path in v1.

### risk-04: BackwardProp persistence gap — Phase III closure (LOW)

world-model `backwardProp.gaps` steps 4+5: refinement proposals persistence not yet implemented. Phase III (AI-First) requires this loop to close.

**Mitigation:** Deferred to post-v0. Phase I + Phase II are self-contained and do not require Phase III closure.

### Deferred open questions (from source-map gapsForOntologist)

These are NOT blocking for v0 but require resolution before Phase III:

1. **K-LLM consensus mechanism** — when multiple agents propose conflicting ontology changes, which one wins? Deferred per blueprint.md open questions section.
2. **Workflow Lineage vs Decision Lineage composition** — the `ATOP_WHICH` dimension captures git SHA but does not fully capture Palantir's Workflow Lineage concept (which spans multiple decisions). Product composition unclear.
3. **Bun empirical compatibility for proper-lockfile** — flagged as `flag-03 MEDIUM` in scenarios.json. `fs.mkdir` fallback mitigates but does not close the question.
4. **Edit function rollback semantics** — in an append-only model, rollback = append a compensating event (never delete). The compensating event schema for partial rollbacks is not yet formalized.

---

## 12. Next Experiments

Phase I and Phase II of the v0 roadmap are defined. After v0 stabilizes, Phase III experiments:

### (a) AIP Logic Functions integration

Palantir AIP Logic Functions (`§LOGIC.FN-09`) exposes computation as a service — functions callable via OSDK without embedding logic in client code. palantir-mini's `apply_edit_function` MCP tool is the native runtime equivalent. Next experiment: validate that the `apply_edit_function` → `Edits[]` → `commit_edits` round-trip is functionally equivalent to AIP Logic Function invocation via OSDK `$returnEdits:true`.

### (b) Workshop frontend ontology bridge

The `code-editor` surface in the frontend ontology (decision-log frontendOntology) includes generated descenders (`src/generated/`) and branded RID types. Next experiment: validate that palantir-math's TypeScript surfaces (its current `data.ts` consumers) continue to compile after migration to generated descenders, with zero breaking changes to existing consumers.

### (c) Multi-runtime adapter for Codex/Gemini read-only consumption

The constraint boundary declares Codex/Gemini as readers of `~/.claude/schemas/ontology/` and `events.jsonl` via filesystem. Next experiment: verify that a Codex session can load the TypeScript declarations, parse them via `tsc --noEmit`, and read `events.jsonl` without conflict. Establish read-only consumption contract before Codex/Gemini gain any write path.

### (d) BackwardProp loop completion — refinement proposals as first-class EventEnvelope variants

Steps 4+5 of the BackwardProp path (world-model `backwardProp.gaps`) require `refinement_proposed` and `refinement_applied` event variants. These would make the full loop — `drift_detected → replay_lineage → refinement proposal → ontologist review → schemas/ontology/ update → new forward propagation cycle` — observable and auditable via `replay_lineage`. This closes the Phase III AI-First loop from decision-log `devCon5Application.phase3_AIFirst`.

### (e) Validate H-C 3-phase pipeline empirically

H-C prototype validation dimension remains at 3 (deferred). After v0 ships with H-A substrate, validate that the 3-phase hook pipeline (Design+Compile / Runtime / Post-Write) actually catches distinct error classes encountered during palantir-math migration. If a real error class escapes all 3 phases, the H-C worst case (S-HC-WORST) materializes and the 6-phase retrofit question reopens.

---

## 13. What Would Change the Decision

Five concrete reversal conditions identified by the evaluator (T10). H-A is the decision; these conditions would force revision.

### Reversal 1: `fs.mkdir` fallback insufficient under 10+ concurrent writers AND proper-lockfile broken under Bun

If a v1 integration test shows:
- `fs.mkdir` fallback is insufficient under 10+ concurrent writers (current empirical test is 2 writers), AND
- `proper-lockfile` is empirically broken under Bun (not just inferred)

Then: revisit H-A's atomic append mechanism. Consider application-level retry-on-conflict (sequence conflict detection + exponential backoff at application layer, above filesystem) or an alternative lockfile strategy. Do NOT revert to H-B — the LEARN centrality violation is structural and independent of locking mechanism.

### Reversal 2: H-C 3-phase validation fails integration due to PostToolUse hook latency burnout

If v1 integration shows that `PostToolUse` hook latency under high-refactor sessions (e.g., migrating `data.ts` 141KB) burns the token budget faster than validation value, and the `async:true` mitigation is insufficient:
- Retreat to 2-phase validation (Design+Compile only at SessionStart; Runtime at `commit_edits` pre-flight)
- OR move all validation to `async:true` mode with `asyncRewake` (v2.1.108 supported)
- The H-C adversarial scenario (S-HC-ADV) predicted this exactly; `async:true` was the proposed mitigation at Round 2.

### Reversal 3: New MCP server pattern emerges making snapshot-based architecture viable for LEARN

If a new MCP server pattern emerges that makes snapshot-based architecture viable for the LEARN domain — specifically, **CRDT-based merging with cross-version history** — then H-B or a H-A+snapshot hybrid becomes worth re-evaluating. The current H-B defeat is structural against the TOCTOU window and the absence of lineage; a CRDT-based substrate would address both.

### Reversal 4: palantir-math migration reveals EventEnvelope variant gaps requiring breaking schema bumps before v0 stabilizes

If migrating `palantir-math`'s `data.ts` (141KB) reveals patterns not covered by the initial 10 `EventEnvelope` variants, and schema bumps are required mid-v0 stabilization (before the migration is complete), then `events.jsonl` migration tooling is needed and the H-A worst case (S-HA-WORST) materializes. In this case, revisit gap-04 and consider versioned `events.jsonl` with explicit schema version in each envelope.

### Reversal 5: Cross-project write coordination proves insufficient (Codex/Gemini become writers)

If the deployment constraint that Codex/Gemini are readers-only does not hold — if either runtime gains a write path to `~/.claude/schemas/ontology/` or project `events.jsonl` files — then the gap-03 architectural resolution (git branches + per-project lockfiles) is insufficient. A multi-writer coordination mechanism (e.g., distributed lock, git merge hooks, or CRDT) must be introduced before H-A's AtomicCommit guarantees can hold cross-runtime.

---

## Appendix: Source Provenance Summary

| Source ID | Title | Provenance | Tier | Domain | Status |
|-----------|-------|-----------|------|--------|--------|
| src-int-decision-lineage | Palantir Decision Lineage (5D schema) | Official | Tier-1 | LEARN | Aging (2024-01) |
| src-int-action-mutations | Palantir Action Mutations — Two-Tier + Submission Criteria | Official | Tier-1 | ACTION | Current |
| src-int-logic-functions | Palantir Logic Functions — Edit Functions v2 | Official | Tier-1 | LOGIC | Current |
| src-int-validation-readme | Palantir 6-Phase Validation Timeline | Official | Tier-1 | LOGIC | Current |
| src-int-ts-grounding | Palantir TypeScript as Grounding | Official | Tier-1 | DATA | Current |
| src-int-managed-agents | Anthropic Managed Agents — Brain/Session/Hands | Official | Tier-1 | LEARN | Current |
| src-int-palantir-mini-blueprint | palantir-mini v0 Blueprint (pipeline synthesis input) | Synthesis | Tier-1 | Cross-cutting | Current |
| src-ext-cc-hooks | Claude Code Hooks Reference (v2.1.108) | Official | Tier-1 | LOGIC | Current |
| src-ext-cc-plugins-ref | Claude Code Plugins Reference (v2.1.108) | Official | Tier-1 | Cross-cutting | Current |
| src-ext-osdk-v2-edits | Palantir OSDK TypeScript v2 Ontology Edits | Official | Tier-1 | LOGIC | Current |
| src-ext-proper-lockfile | proper-lockfile npm package | Official | Tier-3 | ACTION | Aging (2020) |

**Claim distribution:** 30 claims total — 28 official provenance, 1 synthesis, 1 inference. The single inference claim (`clm-ext-24`, confidence=0.75: Bun compatibility for proper-lockfile) is the only non-official claim that touches a critical path. It has been explicitly flagged throughout the pipeline and mitigated by the empirically proven `fs.mkdir` fallback.

**Contradiction resolution:** 6 contradictions identified; 5 resolved; 1 (`contra-06` StaleObject in append-only) was empirically resolved by T7 adversarial race (0 lost events, sequence counter works as version vector).

---

*Machine-readable companion: `/home/palantirkc/kosmos/ontology-state/blueprint.json` (TechBlueprint JSON per schemas/types.ts)*
*Previous session reports archived in git history: `mathcrew-photonic-realism-001`, `mathcrew-content-delivery-001`, `jsxgraph-sequencer-001`*

# Kosmos Research Report — Palantir Ontology/AIP/Foundry/Maven Mirror Rebuild (v1.0)

**Session**: kosmos-rebuild-research-0dff144d
**Date**: 2026-04-17
**Objective**: Ground-up rebuild across ~, palantir-math, mathcrew (kosmos read-only)
**Verdict**: ACCEPT — H-A clean-slate v1.0 (R1-R15: 15/15 pass, 0 debate)
**Prior Blueprint**: universalization-h-a-plus-plus-2026-04-17 (SUPERSEDED)

---

## 1. User Objective

Design a ground-up Palantir Ontology/AIP/Foundry/Maven mirror for Claude Code Native Runtime spanning three in-scope projects (palantirkc home, palantir-math, mathcrew; kosmos read-only). The rebuild permits `@palantirKC/claude-schemas` SemVer major bump v0.2.1 → v1.0.0, palantir-mini plugin full restructure v0.2.0 → v1.0.0, per-project ontology namespace reorganization (critically: new `~/ontology/` shared-core layer), and legacy skills rewrite (/ship + /orchestrate) plus new /palantir-dispatch + /ontology-register skills. User directive from `NEXT_SESSION_ONTOLOGY_REBUILD.md` explicitly permits breaking changes (severity=high, negotiable=false) to escape the current state where 3 projects reinvent ontology patterns with Foundry-shaped silos lacking Foundry mechanisms (shared schema registry, propagation enforcement, change audit, capability tokens, OSDK regen). Implicit goal per decision-log.decomposition: cross the DevCon 5 Phase 1→2 bridge — Phase 1 (Golden Tables, v0.2.1) is partially built; Phase 2 (Operational Decision-Making) needs ontology-as-authority + skills-as-dispatch + validation gates in CI.

## 2. Research Questions (D/L/A-tagged)

| ID | Text | Domains | Priority | Success Criteria |
|----|------|---------|----------|------------------|
| RQ-01 | Minimal Palantir-native ontology primitive set for claude-schemas v1.0 + 3-project peerDep migration | DATA, LOGIC | p0 | v1.0 primitive list + axis version matrix + 3-project migration checklist + breaking-change manifest |
| RQ-02 | palantir-mini v1.0 plugin structure as Foundry-analog (MCP tools, hooks, skills, codegen, validation, RBAC, lineage) | LOGIC, ACTION | p0 | v1.0 plugin file tree + per-file responsibility matrix + MCP tool signature list + hook-to-event mapping |
| RQ-03 | Skill set mirroring AIP semantic-intent dispatch (/palantir-dispatch, /ontology-register, /ship, /orchestrate) | ACTION, LOGIC | p0 | Skills rebuild matrix + new-skill specs + dispatcher design + event contract per skill |
| RQ-04 | Authority chain governing per-project ontology divergence while maintaining shared-core consistency | LOGIC, DATA | p1 | Authority chain diagram + per-project namespace plan + divergence checkpoint rules |
| RQ-05 | Which files in ~/.claude/research/palantir/ + ~/.claude/schemas/ are authoritative vs legacy | DATA | p1 | Per-subdirectory verdict table + primitives-to-preserve list + deprecate/delete queue |
| RQ-06 | Palantir-analog /ship + /orchestrate pipeline with event-emission contract per phase | ACTION | p1 | Pipeline diagram + event contracts + validation gate sequence + PR body template from events.jsonl |
| RQ-07 | Deterministic codegen contract (ontology/*.json → src/generated/*) with pm-verify drift detection | LOGIC, DATA | p2 | Codegen contract spec + ownership decision + pm-verify codegen gate logic + header format spec |

## 3. Retrieval Plan

**Internal-first strategy per user directive** (minimize external). 28 internal sources / 0 external sources consulted.

| RQ | Internal Source Recipe | External |
|----|-------------------|----------|
| RQ-01 | palantir/data/, palantir/osdk/, palantir/logic/, schemas/ontology/ | 0 (claude-schemas@0.2.1 introspection is internal) |
| RQ-02 | palantir/platform/, palantir/architecture/, palantir/ship-os/, palantir/validation/, plugin introspection | 0 |
| RQ-03 | palantir/action/, palantir/entry/, palantir/ship-os/, plugins/palantir-mini/skills/ | 0 |
| RQ-04 | palantir/architecture/, palantir/cross-cutting/, palantir/philosophy/ | 0 |
| RQ-05 | full ~/.claude/research/palantir/ + ~/.claude/schemas/ enumeration | 0 |
| RQ-06 | palantir/ship-os/, palantir/decision-lineage/, palantir/validation/ | 0 |
| RQ-07 | palantir/osdk/, palantir/typescript/, palantir/validation/, plugins/palantir-mini/lib/codegen/ | 0 (context7 budgeted but unused — research library covered) |

**BROWSE.md recipes used**: `schemas/ontology/BROWSE.md` (INT-016), `research/palantir/*/README.md` indexes per subdirectory.

## 4. Internal Findings

Organized by `~/.claude/research/palantir/` subdirectory with marker citations.

**data/** [Official, §DATA.R-01..13] — 15 files — INT-001. 2026-Q1 features (AIP Document Intelligence GA Feb 2026, Core Object Views GA Feb 2026, Derived Properties Beta). Canonical constraints: max 2000 properties per ObjectType, KNN max K=100/dims=2048. Directly grounds RQ-01 (primitive set).

**logic/** [Official, §LOGIC.R-01..07] — 4 files — INT-002. Impact Propagation Graph thesis — Link Types, Interfaces, Queries, Derived Properties, Functions. Explicit propagation only (no automatic cascading). Grounds RQ-01, RQ-02 (LOGIC layer).

**action/** [Official, §ACTION.R-01..11] — INT-003. Two-tier architecture (Tier-1 declarative, Tier-2 function-backed, mutually exclusive). 9 submission criteria constraint classes. Progressive autonomy 3-tier. Action logs as queryable ontology objects. Grounds RQ-02, RQ-03, RQ-06.

**platform/** [Official, §DC5-02..10] — INT-004. DevCon 5 (March 11 2026): 3-stage product journey Golden Tables → Operational Decision-Making → AI-First, 4 design principles DDD/DRY/OCP/PECS, key primitives Interfaces/Structs/Reducers/Derived Properties/Object-Backed Link Types, Embedded Ontology, DC5-10 Scenarios. Most-recent DevCon event. Grounds all 7 RQs.

**architecture/** [Official + Inference, §ARCH-01..10, §ORCH-01..06, §GAP-01..04] — 3 files — INT-005 (ontology-model.md), INT-012 (adapter-gap-analysis.md legacy-maybe per OBS-02-class review), INT-013 (orchestration-map.md). D/L/A 3-domain + SECURITY overlay. 4-stage semantic compilation pipeline. 6-layer orchestration map (Builder / Semantic Core / Digital Twin / Governance / LEARN / Integration) — v0.2 covers ~3, v1.0 closes structurally. Grounds RQ-02, RQ-04.

**security/** [Official, §SEC.R-01..06] — 4 files — INT-011. 4-layer security model (RBAC / Marking-Based / Object-Level / Object+Property cell-level). Grounds RQ-02 + v1.0 CapabilityToken + MarkingDeclaration additions.

**ship-os/** [Official, §SOS-01..05] — 3 files — INT-007. AIPCon 9 Ship OS patterns: Governed Multi-Path Decision Package, Action Log as Queryable Ontology Object, Intelligent Communications Triage. Extraction boundary prevents naval-domain contamination. Grounds RQ-03, RQ-06 (/ship rewrite).

**decision-lineage/** [Official, §DL-01..07] — 3 files — INT-008, INT-009. Workflow Lineage GA Nov 2025 (product) vs Decision Lineage (conceptual 5-dim framework). 5 dimensions WHEN/ATOP_WHICH/THROUGH_WHICH/BY_WHOM/WITH_WHAT bound to palantir-mini emit_event + replay_lineage. Grounds RQ-02, RQ-06.

**validation/** [Official, §VAL.R-01..20] — 5 files — INT-006, INT-021. 6-phase validation timeline (design/compile/deploy/merge/runtime/post-write). Palantir-mini v0.2 pipeline.ts implements 4 of 6 (Deploy + Merge `deferred to v1` per source comment). K-LLM coherence verification. Cross-domain contract triangle (DATA-LOGIC type safety, LOGIC-ACTION verifyOntologyEditFunction, DATA-ACTION StaleObject + PK immutability). Grounds RQ-02, RQ-06, RQ-07.

**osdk/** [Official, OBS-02 stub] — INT-014. INDEX.md references 4 content files that DO NOT exist: osdk-2.0-architecture.md, osdk-version-pinning.md, osdk-1-to-2-migration.md, pm-codegen-vs-osdk.md. Per OBS-02 this is a partial stub — Phase B must populate or delete.

**marketplace/** [Synthesis, OBS-02 stub] — INT-015. 53 LOC total, BROWSE+INDEX only per OBS-02. Plugin distribution architecture stable but content files missing. Phase B must populate or delete.

**philosophy/** [Official, §PHIL.R-01..05] — 4 files — INT-010. 5-level progressive autonomy, K-LLM multi-model consensus, 3 hallucination reduction patterns, Decision Lineage as LEARN mechanism. Grounds RQ-04, RQ-05.

**cross-cutting/** [Official] — INT-009. 5-dim Decision Lineage full spec; Workflow Lineage graph model (Object Types, Object Links, Actions, Functions, AIP Logic Functions, Language Models, Workshop Applications, Automations, Interfaces). Grounds RQ-02, RQ-06.

**entry/** [Official] — Decomposition + requirements intake patterns cited in T1. Grounds RQ-05.

**typescript/** [Official, §TS.TSG-* / §TS.FCL-*] — 2 files (type-safety-as-grounding.md 241 LOC + typescript-first-class-language.md 286 LOC) — OBS-03 upgraded verdict keep-low-priority → keep-authoritative. Grounds RQ-07.

**schemas/ontology/** [Official] — INT-016, INT-017, INT-018, INT-026. v0.2.1 current: 4 axes (ontology@1.12.0, interaction@0.1.2, meta@0.1.0, rendering@0.1.0). 5 primitive types + 3 function types + 3 policy types + 2 lineage types + 2 generator types. 24 OntologyPropertyType members, 4 LinkCardinality, 5 MutationType. 12 subpath exports. All 3 consumers pinned at git+...claude-schemas.git#v0.2.1. Grounds RQ-01, RQ-05, RQ-07.

**plugin introspection** [Official] — INT-019 (mcp-server.ts), INT-020 (hooks.json), INT-021 (validation/pipeline.ts), INT-022 (codegen), INT-023 (managed-settings.d), INT-024 (plugin skills), INT-025 (user-scope /ship+/orchestrate). Confirmed gaps per OBS-01..04: version drift (package.json 0.1.0 vs plugin.json 0.2.0), 6/27 hook coverage, 4/6 validation phases, L1-only RBAC.

**project evidence** [Official] — INT-027 (UNIVERSALIZATION.md W1-W4 distribution), INT-028 (palantir-math + mathcrew session deferred items). 14+16 ontology files exist per-project; home `~/ontology/` missing (OBS-05).

**DevCon 5 principles (DDD/DRY/OCP/PECS) applied**: (a) DDD via bounded contexts per D/L/A/S/LEARN domain + shared core / home / per-project boundaries; (b) DRY via shared ~/ontology/ core (THE primary DRY win — eliminates palantir-math × mathcrew ConceptPrimitive duplication); (c) OCP via SemVer per-axis version gates + additive v1.x minors; (d) PECS via Reducer<In,Out> (In consumer-super, Out producer-extends) + Edits[] contract.

## 5. External Findings

**None identified** — zero external queries consulted. Per user directive minimizing external research (max ~5 queries, tier-1 only), the 28 internal sources provided sufficient evidence coverage for all 7 research questions. Research library currency verified 2026-Q1 (INT-001 AIP Doc Intelligence GA Feb 2026, INT-008 Workflow Lineage GA Nov 2025 + Cross-Ontology viz Feb 2026, INT-004 DevCon 5 March 11 2026, INT-007 AIPCon 9 March 12 2026). Plugin + schemas state introspected directly from repo. mathcrew + palantir-math deferred items sourced from project docs (OBS-08). Per R5 gate: 27/28 sources `currencyVerdict=authoritative`, 1 (INT-012 adapter-gap-analysis.md) legacy-maybe. Stale ratio <10%.

## 6. Ontology Mapping (D/L/A/S/LEARN + 4-pillar)

**Domain counts**: 32 objects across 5 domains per world-model.json `dlaMapping`.

| Domain | Count | Primitives Present | Primitives Missing-for-v1 |
|--------|-------|-------------------|---------------------------|
| DATA (D) | 9 | ObjectType, PropertyType, ClaudeSchemasPackage, PalantirMathOntology, MathcrewOntology | Struct, ValueType, SharedPropertyType, HomeSharedOntology |
| LOGIC (L) | 7 | LinkType, InterfaceType, DerivedProperty, Reducer, EditFunction, ForwardPropPipeline | AIPLogicFunction |
| ACTION (A) | 9 | ActionType, SubmissionCriteria, PalantirMiniPlugin, ShipSkill (rewrite), OrchestrateSkill (rewrite) | AutomationDeclaration, WebhookDeclaration, PalantirDispatchSkill, OntologyRegisterSkill |
| SECURITY (S) | 3 | RBACFragment | CapabilityToken, MarkingDeclaration |
| LEARN | 4 | EventTypeRegistry, DecisionLineage, BackwardPropPipeline | ScenarioSandbox |

**Nine missing v1 primitives** flagged for addition: Struct, ValueType, SharedPropertyType, CapabilityToken, MarkingDeclaration, AutomationDeclaration, WebhookDeclaration, ScenarioSandbox, AIPLogicFunction. All additive (breaking=false per `v1PrimitiveSelection`).

**4-pillar map with DC5 principle application** (per `fourPillarMap.*.dc5PrincipleApplied`):

| Pillar | Current State | v1 Target | DC5 Principles |
|--------|---------------|-----------|----------------|
| **ontology** (schemas + ontology/) | v0.2.1 4 axes; 9 missing primitives; no home ontology | v1.0 canonical + 9 primitives + ~/ontology/ shared layer | DDD (bounded contexts), DRY (home ontology), OCP (per-axis version gates), PECS (Reducer/Edits variance) |
| **aip** (skills) | /ship 465 LOC + /orchestrate 406 LOC user-scope; no dispatcher; no events.jsonl consumption | /palantir-dispatch + /ontology-register NEW; /ship + /orchestrate rewrite; event contract per skill | DDD (intent/skill mapping), DRY (dispatcher), OCP (intent registry), PECS (intent covariant) |
| **foundry** (palantir-mini) | v0.2 — 5 MCP tools, 6/27 hooks, 4/6 validation, L1 RBAC; version drift (OBS-01) | v1.0 — 10+ MCP tools, 15+ hooks, 6/6 validation, L1+L2+L3 RBAC, deterministic codegen | DDD (substrate boundary), DRY (single plugin 3 projects), OCP (additive extension), PECS (MCP tool IO) |
| **maven** (claude-schemas pkg) | v0.2.1 git-tag; peerDep pin across 3 consumers | v1.0.0 SemVer-breaking atomic 3-consumer migration wave | DDD (per-axis boundary), DRY (maven-analog), OCP (additive even in v1.0), PECS (version boundaries) |

Per-project ontology plan: home NEW at `~/ontology/`; palantir-math EXTENDING (14 files, JSXGraph/ConceptPrimitive math-variant); mathcrew EXTENDING (16 files, BeatTemplate/TheaterKind theater DSL).

## 7. Competing Options

Two hypotheses simulated with 4 scenarios each across 11 dimensions on 1-5 rubric.

### H-A — Clean-slate v1.0 rebuild (WINNER, aggregate totalMean 3.50)

**Claim**: Single SemVer-major release landing schemas v1.0 + plugin v1.0 + home ontology/ + new skills together is the only change scope that **structurally repairs ForwardProp** (WMO-031 healthStatus=broken). Home-repo ontology/ cannot be added additively without forcing consumers to change extension point — once you must touch all three, amortize the v1.0 bump in the same wave.

**Supporting Evidence**: INT-013 orchestration map (6-layer, v0.2 covers 3); WMO-031 broken status; NEXT_SESSION_ONTOLOGY_REBUILD.md breaking-changes clause (severity=high, negotiable=false); INT-021 pipeline.ts `deferred to v1` comment; INT-020 21-event hook gap; INT-019 version mismatch.

**Contradicting Evidence**: INT-018 3 consumers pinned v0.2.1 (supply-chain break); INT-027 UNIVERSALIZATION additive pattern already shipped.

**DC5 Principles**: DDD bounded contexts per domain; OCP SemVer-break restricted to legacy retirement; DRY via ~/ontology/; PECS preserved at Reducer + Edits boundaries.

**ForwardProp Impact**: REPAIRED (broken → healthy). Home ~/ontology/ inserted as shared-core layer. Prototype P-H-A confirmed STRUCT_REGISTRY === shim-re-exported singleton identity.

**BackwardProp Impact**: AUTOMATED PATH ENABLED. drift_detected + evaluation_recorded event types auto-feed /ontology-register. Transitions partial → healthy.

### H-B — Incremental v0.3 evolution (aggregate totalMean 3.00)

**Claim**: Additive minor bumps on claude-schemas 0.2.1 → 0.3.x → 0.9.x, preserving legacy types.ts + semantics.ts layout. Home ~/ontology/ added behind feature-flag without breaking consumers. Skill rewrites deferred. Each project upgrades peerDep independently.

**Supporting Evidence**: INT-018 additive v0.2.0 → v0.2.1 pattern proven; INT-027 W1-W4 additive strategy; INT-023 L1 RBAC forward-compatible for L2 layering; rules/08-schema-versioning gate policy.

**Contradicting Evidence**: WMO-031 home ontology cannot be added additively (the moment it exists, consumers must choose to extend or not — feature-flag just defers the decision); INT-021 Deploy+Merge `deferred to v1` marker indicates rewrite planned; INT-019 version mismatch accumulates drift; INT-020 21-event gap has high coupling cost in minor-bump series.

**DC5 Principles**: OCP primary win (additive only); DRY partial (home ontology enables DRY for opt-in consumers but legacy duplication persists); DDD preserved at axis level; PECS maintained.

**ForwardProp Impact**: PARTIALLY REPAIRED. Home ~/ontology/ added but opt-in. WMO-031 stays broken → partial until last consumer opt-in lands.

**BackwardProp Impact**: MANUAL. No new event types that auto-feed refinement. WMO-032 stays partial across 0.x series.

## 8. Simulation Results (11 dimensions)

**8 scenarios × 11 dimensions × 1-5 rubric** (rescaled from 1-7 in Round 3 per OBS-07 + docs/scoring-rubric.md authority). Aggregate means per hypothesis:

| Dimension | H-A mean | H-B mean | Δ |
|-----------|----------|----------|---|
| Evidence Fit | 3.5 | 3.0 | +0.5 |
| Implementation Difficulty | 2.75 | 3.5 | -0.75 (H-B easier) |
| Risk Severity | 2.75 | 3.25 | -0.5 (H-B lower risk) |
| Reversibility | 2.75 | 3.75 | -1.0 (H-B more reversible) |
| Time-to-Value | 3.0 | 2.5 | +0.5 |
| Governance Compliance | 4.25 | 3.0 | +1.25 |
| Ecosystem Maturity | 4.0 | 4.0 | 0 |
| D/L/A Fit | 4.5 | 3.25 | +1.25 |
| **ForwardProp Health** | **4.25** | **2.0** | **+2.25** |
| **Agent Composability** | **3.75** | **1.75** | **+2.0** |
| Prototype Validation | 3.0 | 3.0 | 0 |
| **totalMean** | **3.50** | **3.00** | **+0.50** |

**Strategic dimension breakdown** (user-objective-aligned):
- **ForwardProp Health 4.25 vs 2.0** (2.125x advantage): H-A structural enforcement vs H-B opt-in
- **Agent Composability 3.75 vs 1.75** (2.14x advantage): H-A dispatcher + /ontology-register vs H-B no dispatcher
- **D/L/A Fit 4.5 vs 3.25**: H-A all 5 domains clean; H-B S+LEARN thin
- **Governance Compliance 4.25 vs 3.0**: H-A ships pm-verify 6/6 + L2/L3; H-B stops at L1

**H-B pragmatic wins** (traded off per user directive):
- Reversibility 3.75 vs 2.75: per-bump rollback vs SemVer-major commitment
- Implementation Difficulty 3.5 vs 2.75: additive bumps easy vs large atomic surface
- Risk Severity 3.25 vs 2.75: no SemVer break vs atomic migration window

**Prototype Validation**: Both hypotheses uniformly scored 3 pre-T7/T8 per rubric §11. Post-prototype empirical results (T7/T8 + T9):
- **H-A 22/22 pass** (passRate 1.0), 263 LOC, 6 files, tsc 0 errors
- **H-B 16/16 pass** (passRate 1.0), 238 LOC, 5 files, tsc 0 errors
- Both `buildStatus=pass` → **R14 satisfied**
- Both passRate > 0.5 threshold → **R15 satisfied**
- Combined: 38/38 tests, 0 failure modes, 501 total LOC

## 9. Scenario Matrix + Failure Modes

| Scenario | Hypothesis | Variant | Duration | Key Risks | Evidence Sufficiency |
|----------|-----------|---------|----------|-----------|---------------------|
| S-A1 | H-A | base | 4 weeks, 3 waves | Atomic migration slip, primitive sketches, legacy retirement | sufficient |
| S-A2 | H-A | best | 3 weeks, parallel branches | Inter-branch conflicts, pre-staged consumer PRs stale | partial |
| S-A3 | H-A | worst | 8 weeks, 2 rollback cycles | pm-verify phase 3 fail, palantir-math F-1 conflict, L2 CapabilityToken under-scoped, skill rewrite slip to v1.1 | partial (NE-01 v1.0-rc1 worktree test) |
| S-A4 | H-A | adversarial | mixed | Bisected consumer state, codegen cache drift, schema-lock bypass, /palantir-dispatch mis-routes | partial |
| S-B1 | H-B | base | 6 weeks, 4 bumps | Version drift across 0.3-0.6, home ontology opt-in stall, legacy types.ts production-critical | sufficient |
| S-B2 | H-B | best | 4 weeks, eager adoption | Optimistic assumption on consumer eagerness, experimental /palantir-dispatch unstable | partial |
| S-B3 | H-B | worst | 12 weeks drift | Permanent pin drift, v1.0 ceremony never scheduled, skill rewrite permanently deferred | partial (NE-02 peer-project survey) |
| S-B4 | H-B | adversarial | mixed | Axis version-gate CI ambiguity, types.ts alias runtime identity drift, divergent shared-primitive runtime objects, EVENT_TYPE_REGISTRY replay breaks | partial |

**Formal failure modes**: 0 across both eval suites (ES-H-A and ES-H-B). Evaluator `failureModes=[]`.

**Qualitative failure pattern** (not blocking but architecturally decisive): H-B eval-runner's own notes acknowledge *"H-B's architectural weakness vs H-A where the shim is mandatory"*. Prototype P-H-B adversarial re-export collision test PASSES because Bun module cache guarantees singleton identity — but this also exposes that consumers can **bypass** the ForwardProp chain entirely. H-A's shim is the mandatory single import surface; H-B's is optional.

**Pre-existing cosmetic issue**: TypeScript strict error surfaces on test files where branded RID is passed as plain string; runtime passes, tsc errors are non-blocking. Flagged for Wave 2 cleanup.

## 10. Recommended Path

**H-A clean-slate v1.0 rebuild** — Confidence HIGH (evaluator gate ACCEPT R1-R15 15/15, 0 debate). Selected per 5 strategic dimensions aligned with primary objective: ForwardProp Health +2.25, Agent Composability +2.0, D/L/A Fit +1.25, Governance Compliance +1.25, 4-pillar Fidelity High vs Medium. Critical structural finding: WMO-031 ForwardProp cannot be repaired additively.

### 10.1 Schemas v1.0 structure

**4 axes** (per-axis version gate): ontology 2.0.0 / interaction 0.2.0 / meta 0.2.0 (or deprecate per `legacyAudit.schemasFiles.meta` review verdict) / rendering 0.2.0 (extend for mathcrew theater primitives).

**9 new primitives** (all additive, breaking=false):

| Primitive | Domain | Rationale |
|-----------|--------|-----------|
| Struct | D | DC5-06 nested composite fields; primitives/struct.ts with registry |
| ValueType | D | DC5-06 reusable scalar constraints (Currency, ISO-Date) |
| SharedPropertyType | D | Cross-object property reuse promoted to codegen pipeline |
| CapabilityToken | S | Layer-2 RBAC for sensitive actions |
| MarkingDeclaration | S | Layer-2/3 cell-level classification per §SEC.R-03 |
| AutomationDeclaration | A | cron/trigger/scheduled action first-class |
| WebhookDeclaration | A | External event ingress first-class |
| ScenarioSandbox | LEARN | DC5-10 what-if isolation from production lineage |
| AIPLogicFunction | L | LLM-backed per §DL-04; distinct from deterministic EditFunction |

**EVENT_TYPE_REGISTRY** expands 10 → 16+ variants (+ ontology_registered, capability_token_issued, schema_locked, scenario_created, pr_body_generated, session_complete, drift_detected, evaluation_recorded).

**CHANGELOG.md v1.0 entry** enumerates breaking changes + additive primitives + deprecation notes. pm-verify blocks on peerDep pin incompatibility.

### 10.2 Plugin v1.0 structure

| Layer | v0.2 State | v1.0 Target |
|-------|-----------|-------------|
| bridge/ | 5 MCP tools | 10+ (add ontology_schema_get, project_register, codegen_trigger, scenario_create, capability_token_check) |
| lib/actions/ | Tier1/Tier2 | + CapabilityToken pre-flight + Marking access check |
| lib/codegen/ | AUTO-GENERATED marker | Deterministic header contract (schema version + ontology hash + generator version + timestamp) |
| lib/event-log/ | 2000-writer proven | + 6 event variants |
| lib/validation/pipeline.ts | 4 phases | 6 phases (add Deploy + Merge, fail-fast) |
| hooks/hooks.json | 6/27 events | 15+/27 (add TaskCreated, TeammateIdle, SubagentStop, PostCompact, Agent lifecycle, MemoryWrite/Read, ToolApproval/Denied) |
| skills/pm-* | 7 plugin skills | keep-extend + new pm-ontology-register + pm-dispatch |
| managed-settings.d/ | L1 only | L1+L2+L3 (CapabilityToken enforcement + Marking) |
| monitors/ | not wired | wired to TeammateIdle + PostCompact |

### 10.3 Skills rebuild matrix

| Skill | Scope | v1.0 Verdict | Details |
|-------|-------|--------------|---------|
| /palantir-dispatch | plugin | **NEW** | Intent classifier + skill router; emit_event(dispatch_routed, skill, intent) |
| /ontology-register | plugin | **NEW** | Primitive registration + codegen emission; emit_event(ontology_registered, primitive, schemaVersion) |
| /ship | user-scope → plugin | **REWRITE** | events.jsonl → PR body; pm-verify 6/6; emit_event(session_complete, ship_committed) |
| /orchestrate | user-scope → plugin | **REWRITE** | Every phase transition via plugin MCP calls |
| /lsp-audit | user-scope | keep | TypeScript code analysis |
| /palantir-walk | user-scope | keep | Interactive ontology learning |
| /tavily-cli | user-scope | keep | External research |
| pm-* (pm-action, pm-blueprint, pm-codegen, pm-init, pm-recap, pm-replay, pm-verify) | user-scope | **DELETE DEPRECATED STUBS** | plugin-scope palantir-mini:pm-* supersedes |
| palantir-math + mathcrew per-project skills | per-project | audit per project | 7 + 2 skills to review individually |

### 10.4 Per-project ontology plan

| Project | Path | Status | Notes |
|---------|------|--------|-------|
| home | ~/ontology/ | **NEW v1.0** | Shared core re-exports from claude-schemas; home-specific (CrossProjectTeammate, CoordinatedPRWave) |
| palantir-math | ~/palantir-math/ontology/ | EXISTING (14 files), extend | JSXGraphRenderer + ConceptPrimitive (math variant); F-1 full + D-cont-2 deferred |
| mathcrew | ~/mathcrew/ontology/ | EXISTING (16 files), extend | BeatTemplate + TheaterKind theater DSL; 4 deferred items (OBS-08) |

### 10.5 Execution DAG — 6 waves (one wave = one PR minimum)

| Wave | Name | Duration | Blockers |
|------|------|----------|----------|
| 1 | Preconditions | 3-5 days | OBS-01 version reconcile, OBS-02 stub verdict, TAVILY_API_KEY rotation, palantir-math F-1/D-cont-2 |
| 2 | Schemas v1.0 | 1-2 weeks | 9 primitives + axis matrix + CHANGELOG + v1.0.0 tag |
| 3 | Home ontology/ | 3-5 days | Create ~/ontology/ shared-core namespace |
| 4 | Plugin v1.0 | 2-3 weeks | Hooks 15/27, MCP tools 10, validation 6/6, L2/L3 RBAC, codegen header |
| 5 | 3-consumer migration | 24-48h atomic | Pre-stage peerDep PRs, coordinated merge, rollback plan |
| 6 | Skills rebuild | 1-2 weeks | /palantir-dispatch + /ontology-register NEW; /ship + /orchestrate REWRITE; deprecate user-scope pm-* stubs |

**PR rule**: Each PR passes bunx tsc --noEmit + bun test + pm-verify 4-phase (6-phase post-Wave 4). No wave merges until prior wave CI green.

## 11. Risks / Unknowns

Ordered by severity (H-A winning-hypothesis scenarios) plus project-level blockers.

| ID | Severity | Statement | Mitigation |
|----|----------|-----------|------------|
| OBS-01 | blocker | Plugin version drift (package.json v0.1.0 vs plugin.json v0.2.0) | Precondition Wave 1 before any v1.0 work |
| OBS-05 | high | Home `~/ontology/` creation may conflict with existing palantirkc repo layout or managed-settings.d deny rules | Phase B dry-run proposal validated against deny rules |
| R-A4-01 | high | Bisected consumer state during atomic migration window | Pre-publish merge-window lock protocol; require all 3 CIs green before Wave 5 authorization |
| R-A3-02 | high | palantir-math F-1 deferred items (jsxGraph parametric-curve body extraction) block shared primitive rename | Resolve F-1 full BEFORE Wave 5 |
| R-A3-01 | high | Cascading rollbacks erode team confidence in v1.0 strategy | Pre-publish rollback runbook; treat first failure as learning not blocker |
| OBS-08 | medium | mathcrew 4 deferred items (teaching-flow.ts beatTemplate, interactive-beat evaluator bridge, Playwright goldens, FPS tier switch) | Phase C items; track but do not block Phase A acceptance |
| R-A4-02 | medium | pm-codegen cache invalidation gap → generated file drift | Force-regenerate step mandatory in pm-verify phase 4; emit codegen_regenerated event with schema hash |
| R-A4-03 | medium | Schema-lock deny rule drift across consumer managed-settings.d fragments | Plugin bundles authoritative fragment; consumers merge not override |
| R-A4-04 | medium | /palantir-dispatch mis-routing after EVENT_TYPE_REGISTRY expansion | T9 eval includes intent-classification adversarial test set |
| R-A3-03 | medium | Skill rewrite deferred to v1.1 means legacy 865 LOC (/ship 465 + /orchestrate 406) stays production-critical 4+ weeks longer | Ship /palantir-dispatch with legacy skill fallback path |
| W1-followup | medium | TAVILY_API_KEY flagged in palantirkc settings.json, not rotated (PR #43 follow-up) | Rotate before Wave 1 completion |
| R-A1-01 | medium | 3-consumer atomic migration window slips beyond 48h | Pre-stage feature branches; coordinate via Lead; v1.0.1 shim rollback tag |
| R-A1-02 | medium | 9 new primitives ship as TypeScript sketches without deep business logic | pm-verify phase 3 runtime + T9 eval catch incomplete; v1.0.x patch releases close gaps |
| palantir-math | deferred | F-1 full (curveHelpers.ts with 7 module-local symbols) + D-cont-2 (useTeachingState.ts decision) | Session-memory items; must resolve before plugin v1.0 ships |
| R-A1-03 | low | Legacy types.ts + semantics.ts retirement breaks undocumented consumers | Schema lock rule + grep across 3 consumers before retirement; keep-read-only-until-retire verdict preserves rollback option |

**Unknown unknowns** (evaluator qualitativeCallouts): intent classifier mis-route rate under expanded EVENT_TYPE_REGISTRY (not tested in ES-H-A/B); consumer readiness audit on atomic migration coordination window (S-A2 A2 untested).

## 12. Next Experiments

Prioritized from scenarios.json `newExperiments` + blueprint nextSessionActions.

| ID | Objective | Method | Expected Outcome | Effort |
|----|-----------|--------|------------------|--------|
| NE-01 | v1.0-rc1 isolated-worktree rollback test before production tag | Cut schemas v1.0.0-rc1 in isolated worktree; measure rollback steps + time-to-revert | Baseline rollback readiness for S-A3 worst-case scenario | 1-2 days |
| NE-02 | Peer-project 0.x → 1.0 transition survey | Survey comparable incremental-strategy peer projects (e.g., OSDK, SDK ecosystems); measure drift-to-ceremony likelihood | Empirical evidence for S-B3 forcing-function risk | 3-5 days |
| NE-03 | Codegen regeneration smoke test in Phase B | Run pm-codegen against current v0.2.1 with proposed 9 new primitive shapes; measure regeneration complexity | De-risk `whatWouldChangeDecision` item #3 before architecture commitment | 2-3 days |
| NE-04 | pm-verify 4-phase baseline on v0.2 schemas | Run all 4 current phases against claude-schemas@0.2.1 + 3 consumers; capture metrics | Baseline metrics before v1.0 bump for regression comparison | 1 day |
| NE-05 | Home `~/ontology/` dir layout proposal | Propose directory structure; validate against existing managed-settings.d deny rules + palantirkc repo layout | De-risk OBS-05 before Wave 3 | 1-2 days |
| NE-06 | Intent classifier adversarial eval | Generate adversarial intent corpus; measure /palantir-dispatch mis-route rate under expanded EVENT_TYPE_REGISTRY | Validate `whatWouldChangeDecision` item #7 (5% threshold) | 2-3 days |

## 13. What Would Change the Decision

Explicit conditions under which H-A recommendation reverses or modifies (copied from blueprint.whatWouldChangeDecision):

1. **User revokes breaking-change permission** — reverts to H-B incremental. User directive (decision-log.constraints.breaking-changes severity=high, negotiable=false) is the load-bearing axis.

2. **Home `~/ontology/` creation blocked** by existing palantirkc repo structure or managed-settings.d permission conflict during Phase B dry-run. Mitigation: NE-05 layout proposal.

3. **pm-codegen regeneration complexity exceeds Phase B budget** with 9 new primitives (currently only Struct + ValueType prototyped in P-H-A; remaining 7 primitives unvalidated). Mitigation: NE-03 smoke test.

4. **mathcrew 4 deferred items (OBS-08) expand scope** to block v1.0 coordination — runtime wiring (teaching-flow.ts beatTemplate), interactive-beat evaluator bridge, per-primitive Playwright goldens, FPS-driven adaptive tier auto-switch.

5. **palantir-math F-1 full or D-cont-2 blockers surface** before plugin v1.0 ships. F-1 full: jsxGraph parametric-curve body extraction to curveHelpers.ts with 7 module-local symbols. D-cont-2: useTeachingState.ts keep/delete/restore decision.

6. **Consumer readiness audit reveals any of 3 consumers cannot pre-stage atomic migration PRs within 5 days** (S-A2 A2 assumption fails). Would re-favor H-B staged bumps or H-C hybrid.

7. **Intent classifier mis-route rate > 5%** in T9 prototype eval of /palantir-dispatch. Not currently tested in ES-H-A/B. Mitigation: NE-06.

---

**References**: decision-log.json (7 RQs, 9 lead_observations, evaluator_verdict with R1-R15 PASS and 10-item qualitativeCallouts); source-map.json (28 INT-* internal, 0 external); world-model.json (32 objects across 5 domains, 4-pillar map, v1PrimitiveSelection, legacyAudit, perProjectOntologyPlan); scenarios.json (2 hypotheses, 8 scenarios on 1-5 rubric, aggregate.winner=H-A totalMean 3.50 vs 3.00); eval-results.json (2 prototypes both buildStatus=pass, 38/38 pass, 0 failure modes); events.jsonl sequences 19-32; Lead observations OBS-01..09; prior blueprint universalization-h-a-plus-plus-2026-04-17 (SUPERSEDED by rebuild-2026-04-17-palantir-mirror-v1).

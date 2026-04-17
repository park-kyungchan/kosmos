# 03 — Ontology Mapping (D / L / A / S / LEARN)

> Universalization as an ontology problem. Every artifact in the H-A++ architecture is classified into one of five DevCon 5 domains. ForwardProp + BackwardProp paths are declared.

---

## 3.1 Why D/L/A for a "dev-infrastructure" blueprint?

Universalization is not just "install a plugin on 3 repos." It is a **cross-project ontology propagation** problem:

- **What exists?** (DATA) — append-only event log, ontology schemas, per-project state files.
- **How do we reason?** (LOGIC) — codegen rules, Lineage replay, propagation graph walkers, validators.
- **What changes reality?** (ACTION) — MCP tool invocations, `pm-init` scaffolds, plugin installs, schema upgrades.
- **Who governs access?** (SECURITY) — managed-settings.d RBAC, plugin scopes, per-project event-log write authority.
- **What feedback refines?** (LEARN) — eval aggregates, R1-R15 gate results, adversarial scenarios, post-mortem events.

Mapping into D/L/A ensures no architectural element is accidentally skipped, and every cross-project propagation path is auditable.

---

## 3.2 Entity Table (universalization ontology, Foundry-mirrored)

| # | Entity | Domain | Foundry Analog | Role in H-A++ |
|---|--------|--------|----------------|---------------|
| E-01 | `PalantirMiniPlugin` | **ACTION** (capability bundle) | OSDK Package | Installable unit distributed via marketplace |
| E-02 | `PluginMarketplace` (`~/.claude/plugins/palantir-mini/.claude-plugin/marketplace.json`) | **DATA** | Foundry Marketplace manifest | Index of available plugins |
| E-03 | `PluginManifest` (`plugin.json`) | **DATA** | OSDK package.json | Declares version, mcpServers, hooks, skills |
| E-04 | `McpServerRegistration` (inside plugin.json) | **ACTION** | OSDK client registration | Registers `mcp__palantir-mini__*` globally |
| E-05 | `EventLog` (`<project>/.palantir-mini/session/events.jsonl`) | **DATA + LEARN** | Decision Lineage store | Append-only 5-dim event stream |
| E-06 | `OntologyStateFile` (`<project>/ontology-state/*.json`) | **DATA** | Ontology backing store | Per-project ontology snapshot |
| E-07 | `ManagedSettingsFragment` (`<project>/.claude/managed-settings.d/50-palantir-mini.json`) | **SECURITY** | RBAC policy | Per-project tool allowlist |
| E-08 | `SharedSchema` (`~/.claude/schemas/ontology/*.ts`) | **DATA + LOGIC** | Foundry Ontology Metadata | Shared types, generators, validators |
| E-09 | `CodegenOutput` (`<project>/src/generated/`) | **DATA** (derived) | OSDK typed client | Regenerated from SharedSchema |
| E-10 | `PmInitCli` (skill) | **ACTION** | `create-foundry-project` scaffold | Bootstraps per-project state |
| E-11 | `PmVerifyPipeline` (skill) | **LOGIC** | OSDK build gate | Design + Compile + Runtime + Post-Write validation |
| E-12 | `PmRecapSkill` (skill) | **LEARN** | Workflow Lineage replay | Reads events.jsonl, folds to snapshot |
| E-13 | `PmReplaySkill` (skill) | **LEARN** | Decision Lineage BackwardProp | 5-dim filter over events |
| E-14 | `PmActionSkill` (skill) | **ACTION** | Action Type / Edit Function commit | Executes Tier-1/2 action with submission criteria |
| E-15 | `PmCodegenSkill` (skill) | **ACTION** | OSDK codegen run | Regenerates `<project>/src/generated/` |
| E-16 | `EvaluatorGate` (R1–R15) | **LEARN** | Marketplace quality gate | Blocks blueprint ship on drift |
| E-17 | `Hook` (7 hook scripts) | **ACTION + SECURITY** | Foundry Policy Runtime | Runtime enforcement, per-event |
| E-18 | `Subagent` (5 agents) | **LOGIC** | Foundry Function | Sandboxed reasoning over inputs |
| E-19 | `TechBlueprint` | **DATA** (artifact) | Architecture Decision Record | Output of `kosmos-research` |
| E-20 | `CrossProjectBinding` (project → plugin) | **LOGIC** | Foundry Branch Sync | Per-project wiring to the shared plugin |

---

## 3.3 Link Types

| # | Link | From | To | Direction | Semantic |
|---|------|------|-----|-----------|----------|
| L-01 | `declares` | E-02 PluginMarketplace | E-01 PalantirMiniPlugin | 1→N | Marketplace lists plugins |
| L-02 | `registers` | E-03 PluginManifest | E-04 McpServerRegistration | 1→N | Manifest registers MCP servers |
| L-03 | `produces` | E-04 McpServerRegistration | E-05 EventLog | 1→N | MCP `emit_event` writes to event log |
| L-04 | `governs` | E-07 ManagedSettings | E-04 McpServerRegistration | 1→N | Fragment allows/denies MCP tools |
| L-05 | `imports` | E-08 SharedSchema | E-09 CodegenOutput | 1→N | Schema is source of truth for codegen |
| L-06 | `validates` | E-11 PmVerifyPipeline | E-09 CodegenOutput | 1→1 | Verifies regenerated output |
| L-07 | `scaffolds` | E-10 PmInitCli | E-05, E-07 | 1→N | Creates event log + settings on install |
| L-08 | `triggers` | E-17 Hook | E-14 PmActionSkill | 1→N | Hooks trigger actions |
| L-09 | `bindsTo` | E-20 CrossProjectBinding | E-01 PalantirMiniPlugin | N→1 | Project binds to plugin |
| L-10 | `refinesFromEvents` | E-05 EventLog | E-08 SharedSchema | N→1 | BackwardProp: runtime drives schema evolution |
| L-11 | `gatedBy` | E-19 TechBlueprint | E-16 EvaluatorGate | 1→1 | Blueprint must pass R1-R15 |

---

## 3.4 Action Types (ForwardProp — "what changes reality")

Every mutation in H-A++ goes through one of these action types, each an **idempotent operation with submission criteria** (Foundry Edit Function pattern):

| # | Action Type | Owner | Submission Criteria |
|---|-------------|-------|---------------------|
| A-01 | `InstallPlugin` | User (`/plugin install`) | Marketplace added; plugin not already installed |
| A-02 | `BindProject` (runs `pm-init`) | User | Plugin installed; project dir exists; no existing binding or `--force` |
| A-03 | `EmitEvent` | Subagent (via MCP) | Event envelope valid; project binding exists |
| A-04 | `ApplyEditFunction` | Subagent (via MCP) | Edit function exists; params typecheck; preconditions pass |
| A-05 | `CommitEdits` | Action-executor subagent | Edits atomic; submission criteria pass; no lock held |
| A-06 | `RunCodegen` | `pm-codegen` skill | Schema version changed; no pending lock |
| A-07 | `UpgradeSchema` | Shared schema maintainer | CHANGELOG entry present; semver bump valid |
| A-08 | `UpdateRule` | Global scope only | Rule file in `~/.claude/rules/`; syntactic YAML/MD valid |

---

## 3.5 Policy Types (SECURITY — "who governs access")

| # | Policy | Scope | Enforced By |
|---|--------|-------|-------------|
| P-01 | `PluginScopeAllowlist` | User scope | CC v2.1.110 core (`/plugin` command) |
| P-02 | `McpToolAllowlist` | Per-project | `managed-settings.d/50-palantir-mini.json` |
| P-03 | `FileOwnershipByAgent` | Per-project | `enforce-file-ownership.ts` hook |
| P-04 | `EventLogAppendOnly` | Per-project | MCP server rejects rewrites |
| P-05 | `CodegenWriteAuthority` | Per-project | Only `pm-codegen` may write `src/generated/` |
| P-06 | `SchemaUpgradeConsent` | Global | `pm-verify` blocks on breaking change without CHANGELOG |

---

## 3.6 ForwardProp — research → schemas → ontology → contracts → runtime

```
~/.claude/research/palantir/**                        [evidence]
         │
         ├─→ ~/.claude/schemas/ontology/**            [shared types + validators]
         │            │
         │            ├─→ <project>/ontology/         [project-local ontology]
         │            │          │
         │            │          ├─→ <project>/src/generated/  [OSDK-style typed client]
         │            │          │          │
         │            │          │          ├─→ <project>/src/{backend,frontend}/  [runtime]
         │            │          │          │
         │            │          │          └─→ <project>/tests/  [contract tests]
         │            │          │
         │            │          └─→ <project>/.palantir-mini/session/events.jsonl
         │            │                     [runtime event emission]
         │            │
         │            └─→ ~/.claude/plugins/palantir-mini/bridge/mcp-server.ts
         │                        [MCP server consumes schema types]
         │
         └─→ ~/.claude/rules/                         [rule distillation]
```

**Health signal**: ForwardProp is healthy when (a) every rule cites research, (b) every schema cites a rule, (c) every project ontology extends a schema, (d) every generated file regenerates deterministically from ontology+schema.

---

## 3.7 BackwardProp — runtime events → lineage → evaluations → ontology updates

```
<project>/.palantir-mini/session/events.jsonl        [append-only ground truth]
         │
         ├─→ pm-recap skill                          [fold to snapshot]
         │          │
         │          └─→ <project>/.palantir-mini/session/snapshots/*.json
         │
         ├─→ pm-replay skill                         [5-dim lineage query]
         │          │
         │          └─→ Decision Lineage (in-memory)
         │
         └─→ pm-verify skill                         [R1-R15 + drift gate]
                    │
                    └─→ Evidence of drift
                              │
                              ├─→ <proj>/ontology/ changes
                              └─→ ~/.claude/schemas/ updates (if cross-project drift)
                                         │
                                         └─→ CHANGELOG.md + semver bump
                                                    │
                                                    └─→ Projects rerun pm-codegen
```

**Health signal**: BackwardProp is healthy when (a) every drift event updates at least one ontology file, (b) every schema CHANGELOG entry traces back to an event, (c) pm-recap output is reproducible from events.jsonl.

---

## 3.8 Integrity Invariants (cross-project)

| Invariant | Enforcement |
|-----------|-------------|
| **I-01 Event log is never rewritten** | MCP server append-only API + `EventLogAppendOnly` policy |
| **I-02 Codegen output matches schema version** | `pm-verify` Design phase + schema version in generated header |
| **I-03 Plugin version binds to schema version range** | Plugin manifest `compatibleSchemaVersions` field |
| **I-04 Managed settings fragment always present after pm-init** | Idempotent `pm-init` + post-install verification |
| **I-05 Every Edit Function has submission criteria** | `ApplyEditFunction` rejects functions without criteria |
| **I-06 Every blueprint passes R1-R15** | `pm-verify` final gate |

---

## 3.9 LEARN Surface

LEARN artifacts that feed BackwardProp:

- **Eval aggregates** (per-project) — produced by scheduled trigger `trigger-eval-aggregate.json` at user scope.
- **R1-R15 gate results** — written to `<project>/ontology-state/eval-results.json` by `pm-verify`.
- **Post-mortem events** — emitted via `mcp__palantir-mini__emit_event` with `type: "post_mortem"`.
- **Drift signals** — produced by `pm-replay` when 5-dim query surfaces an unresolved contradiction.

The LEARN surface is the **primary input for schema evolution**. Without it, cross-project schemas would diverge silently.

---

## 3.10 Summary

Universalization is a 20-entity, 11-link ontology problem spread across all five DevCon 5 domains. H-A++ binds every entity to exactly one action type and one policy. The ForwardProp graph is Markdown → TypeScript → JSON → events.jsonl; the BackwardProp graph is events.jsonl → snapshots → drift events → CHANGELOG → codegen. Both graphs are **audit-complete** when `pm-verify` returns green.

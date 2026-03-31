# Kosmos v2 Architecture

## System Overview

Kosmos is a Claude Code research engine that produces TechBlueprints
for ontology-first technical implementation. It runs exclusively in
Claude Code's native runtime using file-based state, subagent delegation,
and enforcement hooks.

```
┌─────────────────────────────────────────────────────┐
│                    User Request                      │
│         "이런 앱 만들어줘" / tech implementation      │
└──────────────────────┬──────────────────────────────┘
                       ▼
┌──────────────────────────────────────────────────────┐
│  Stage 1: INTAKE (orchestrator — opus)                │
│  Decompose → ProjectOntologyScope                     │
│  BackendOntology(D/L/A/Security/Learn)               │
│  FrontendOntology(views/agents/scenarios)             │
└──────────────────────┬───────────────────────────────┘
                       ▼
┌──────────────────────────────────────────────────────┐
│  Stage 2-3: EVIDENCE (researcher — sonnet)            │
│  Internal: §DC5 markers + BROWSE.md protocol          │
│  External: Tech stack via scrapling/context7           │
│  → SourceDocument[] + Claim[] + Evidence[]             │
└──────────────────────┬───────────────────────────────┘
                       ▼
┌──────────────────────────────────────────────────────┐
│  Stage 4: NORMALIZATION (ontologist — opus)           │
│  D/L/A + Security + Learn domain mapping              │
│  DevCon 5 primitives + DDD/DRY/OCP/PECS              │
│  ForwardProp + BackwardProp path design               │
│  → world-model.json update                            │
└──────────────────────┬───────────────────────────────┘
                       ▼
┌──────────────────────────────────────────────────────┐
│  Stage 5-6: REASONING (simulator — opus)              │
│  Hypothesis → Scenario (10 dimensions)                │
│  3-phase implementation simulation                    │
│  ≥4 scenarios × ≥2 revision rounds                   │
└──────────────────────┬───────────────────────────────┘
                       ▼
┌──────────────────────────────────────────────────────┐
│  VERIFICATION (evaluator — opus)                      │
│  R1-R13 hard gates                                    │
│  D/L/A coverage + DevCon 5 compliance + PropHealth    │
└──────────────────────┬───────────────────────────────┘
                       ▼
┌──────────────────────────────────────────────────────┐
│  Stage 7: OUTPUT (reporter — sonnet)                  │
│  Output A: blueprint.json (TechBlueprint)             │
│  Output B: final-report.md (13 sections)              │
└──────────────────────┬───────────────────────────────┘
                       ▼
┌──────────────────────────────────────────────────────┐
│  LEAD SYNTHESIS                                       │
│  Cross-reference → Decision Support to user           │
└──────────────────────────────────────────────────────┘
```

## Ontology Model (D/L/A + Security + Learn)

| Domain | Question | Examples |
|--------|----------|---------|
| **DATA** | What exists? | Entities, properties, value types |
| **LOGIC** | How to reason? | Links, interfaces, derived props, functions |
| **ACTION** | What changes reality? | Mutations, webhooks, automations |
| **SECURITY** | Who governs? | RBAC, OSP, policies, approvals |
| **LEARN** | What feedback is recorded? | Evaluations, lineage, outcomes, drift |

## Agent Architecture

```
         ┌── researcher (sonnet, evidence retrieval)
         │
orchestrator ─┤── ontologist (opus, D/L/A mapping)
(opus, decomposition) │
         ├── simulator (opus, architecture scenarios)
         │
         ├── evaluator (opus, R1-R13 gates)
         │
         └── reporter (sonnet, Blueprint + report)
```

## State Management

### Runtime State (ontology-state/)

| File | Writer | Contains |
|------|--------|----------|
| `world-model.json` | ontologist | D/L/A ontology graph |
| `source-map.json` | researcher | Sources + claims |
| `scenarios.json` | simulator | Scenarios + runs |
| `decision-log.json` | orchestrator | Decisions + routing |
| `blueprint.json` | reporter | TechBlueprint output |

### Claude Code Native Runtime

| Mechanism | Purpose |
|-----------|---------|
| `.claude/agents/*.md` | 6 subagent definitions |
| `.claude/hooks/*.ts` | 7 enforcement hooks |
| `.claude/settings.json` | Hook config + env vars |
| `CLAUDE.md` | Project constitution |
| `ontology-state/*.json` | Cross-session persistence |

## Hook Architecture (7 hooks)

```
SessionStart → inject-prior-state.ts (advisory)
  → Loads prior session state summary

PreToolUse(Grep|Read) → enforce-browse-protocol.ts (BLOCKING)
  → No broad scanning; §DC5 markers allowed

PreToolUse(Agent) → normalize-research-question.ts (advisory)
  → Checks for D/L/A domain tags

PostToolUse(Agent) → post-subagent-worldmodel-check.ts (BLOCKING)
                   → validate-agent-output.ts (BLOCKING)
  → Verifies ontologist/reporter outputs

PostCompact → reinject-state-after-compact.ts (advisory)
  → Re-injects state summary after compaction

Stop → validate-stop.ts (BLOCKING)
  → State files + blueprint.json must exist
```

## Evaluation Dimensions (10)

| # | Dimension | Source |
|---|-----------|--------|
| 1-7 | Evidence, Difficulty, Risk, Reversibility, Time, Governance, Ecosystem | v1 (retained) |
| 8 | D/L/A Fit | v2 (DevCon 5 §DC5-05) |
| 9 | ForwardProp Health | v2 (authority chain) |
| 10 | Agent Composability | v2 (§DC5-02) |

## MCP Tool Integration

| MCP Server | Purpose | Used By |
|-----------|---------|---------|
| scrapling | Web page fetching | researcher |
| context7 | Library documentation | researcher |
| playwright | Runtime verification | evaluator (optional) |

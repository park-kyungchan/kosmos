# Kosmos Architecture

## System Overview

Kosmos is a Claude Code project operating system — not an application,
but a structured environment that transforms how Claude Code sessions
handle research and decision-support tasks.

```
┌─────────────────────────────────────────────────────┐
│                    User Request                      │
└──────────────────────┬──────────────────────────────┘
                       ▼
┌──────────────────────────────────────────────────────┐
│  Stage 1: INTAKE (orchestrator)                       │
│  Decompose → ResearchQuestion[] + UserRequirement[]   │
└──────────────────────┬───────────────────────────────┘
                       ▼
┌──────────────────────────────────────────────────────┐
│  Stage 2-3: EVIDENCE (researcher)                     │
│  Internal Browse (BROWSE.md) + External Fetch          │
│  → SourceDocument[] + Claim[] + Evidence[]             │
└──────────────────────┬───────────────────────────────┘
                       ▼
┌──────────────────────────────────────────────────────┐
│  Stage 4: NORMALIZATION (ontologist)                  │
│  Map findings → ontology concepts                      │
│  Update world-model.json                               │
└──────────────────────┬───────────────────────────────┘
                       ▼
┌──────────────────────────────────────────────────────┐
│  Stage 5-6: REASONING (simulator)                     │
│  Hypothesis generation → Scenario simulation           │
│  ≥4 scenarios × ≥2 revision rounds                    │
└──────────────────────┬───────────────────────────────┘
                       ▼
┌──────────────────────────────────────────────────────┐
│  VERIFICATION (evaluator)                             │
│  Provenance check + Contradiction detection            │
│  + Adversarial testing + Risk identification           │
└──────────────────────┬───────────────────────────────┘
                       ▼
┌──────────────────────────────────────────────────────┐
│  Stage 7: OUTPUT (reporter)                           │
│  13-section report + scenario matrix + tradeoffs       │
└──────────────────────┬───────────────────────────────┘
                       ▼
┌──────────────────────────────────────────────────────┐
│  LEAD SYNTHESIS                                       │
│  Cross-reference all outputs → Decision Support        │
└──────────────────────────────────────────────────────┘
```

## Three-Layer Ontology Model

Findings are organized into three conceptual layers,
inspired by Palantir's ontology architecture:

### Semantic Layer (what exists)
- **Object Types**: entities discovered during research
- **Properties**: attributes of entities (typed, constrained)
- **Shared Properties**: reusable across 3+ object types
- **Value Types**: branded/constrained primitives
- **Link Types**: relationships between objects (→ LOGIC domain)
- **Interfaces**: shared contracts for polymorphic behavior

### Kinetic Layer (what happens)
- **Action Types**: operations that change reality
- **Functions**: computations, derivations, transformations
- **Security**: access control, classification, governance
- **Validation**: cross-domain contract enforcement

### Decision Support Layer (what to do)
- **Scenarios**: base / best / worst / adversarial projections
- **Risks**: identified threats with severity and mitigations
- **Recommendations**: ranked options with confidence levels
- **Experiments**: next steps to reduce uncertainty

## Agent Architecture

Six agents with strictly separated concerns:

```
         ┌── researcher (evidence retrieval)
         │
orchestrator ─┤── ontologist (world model)
(decomposition) │
         ├── simulator (scenarios)
         │
         ├── evaluator (verification)
         │
         └── reporter (output production)
```

### Data Flow Between Agents

| From | To | Data Type |
|------|----|-----------|
| orchestrator | researcher | ResearchQuestion[] |
| researcher | ontologist | SourceDocument[], Claim[], Evidence[] |
| ontologist | simulator | world-model.json (updated) |
| simulator | evaluator | Hypothesis[], Scenario[], SimulationRun[] |
| evaluator | reporter | Risk[], validation report |
| reporter | Lead | final-report.md, scenario-matrix.md |

### Model Assignment

All agents use Opus for maximum reasoning depth. This is a research
system where accuracy matters more than speed.

## State Management

### Runtime State (ontology-state/)

Four JSON files maintain state across the pipeline:

| File | Writer | Reader | Contains |
|------|--------|--------|----------|
| `world-model.json` | ontologist | simulator, evaluator | Ontology graph |
| `source-map.json` | researcher | ontologist, evaluator | All sources + claims |
| `scenarios.json` | simulator | evaluator, reporter | Scenarios + runs |
| `decision-log.json` | orchestrator | all agents | Decisions + reasoning |

### Schema Validation (schemas/)

All state files conform to TypeScript types in `schemas/types.ts`.
Validators in `schemas/validators.ts` provide runtime type guards.

## Hook Architecture

Hooks enforce quality gates at tool boundaries:

```
PreToolUse(Grep|Read) → enforce-browse-protocol.ts
  → Blocks broad scanning of research library

PreToolUse(Agent) → normalize-research-question.ts
  → Advisory: checks for structured research questions

PostToolUse(Agent) → post-subagent-worldmodel-check.ts
  → Advisory: checks world-model.json was updated

Stop → validate-stop.ts
  → Advisory: checks for required report sections
```

## MCP Tool Integration Points

| MCP Server | Purpose | Used By |
|-----------|---------|---------|
| scrapling | Web page fetching | researcher (external) |
| context7 | Library documentation | researcher (external) |
| sequential-thinking | Observable reasoning | orchestrator, Lead |
| playwright | Runtime verification | evaluator (optional) |

## Extension Points

### Future MCP Connections
- **Tavily** `/research` → deep web research for complex queries
- **Database MCP** → persistent state beyond JSON files
- **Slack MCP** → team notification of research findings

### Future Agent Additions
- **strategist** → long-term planning across multiple research sessions
- **archivist** → cross-session knowledge management
- **presenter** → interactive visualization of findings

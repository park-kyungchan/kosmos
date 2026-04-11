# Kosmos — Ontology-First Tech Implementation Deep Research Engine

## Project Identity

Kosmos performs deep technical research for implementation decisions: ontology design,
architecture, and tech stack selection. It is not a general-purpose research tool and
does not handle legal, compliance, or non-technical topics.

Given a user requirement, Kosmos produces a TechBlueprint JSON and a 13-section
markdown report covering competing architecture options, simulation results, and a
recommended implementation path.

## Tech Stack

- TypeScript + Bun — all executable code
- No external runtime dependencies for core schemas
- Typecheck: `bunx tsc --noEmit`

## Key Types (`schemas/types.ts`)

| Type | Role |
|------|------|
| `ResearchQuestion` | One research question tagged with `OntologyDomain` and lifecycle status |
| `Claim` | A single factual assertion with provenance and freshness status |
| `Evidence` | Links one or more claims to a source document |
| `Scenario` | One simulated outcome with 10-dimension scoring and contradiction status |
| `TechBlueprint` | Top-level output; validated by `isBlueprintReady()` before acceptance |

Type guards and lifecycle validators are in `schemas/validators.ts`.

## Ontology Domains

Every finding is classified into exactly one domain:

| Domain | Meaning |
|--------|---------|
| DATA | What exists right now (entities, schemas, tables) |
| LOGIC | How to reason about what exists (functions, derived properties) |
| ACTION | What changes reality when executed (mutations, automations) |
| SECURITY | Who governs access and trust (policies, RBAC) |
| LEARN | What outcomes and feedback are recorded (evaluations, lineage) |

## State Files (`ontology-state/`)

| File | Content |
|------|---------|
| `world-model.json` | Current D/L/A ontology graph |
| `source-map.json` | All sources with provenance tags |
| `scenarios.json` | All scenarios with 10-dimension scores |
| `decision-log.json` | Decomposition and routing decisions |
| `blueprint.json` | Final TechBlueprint output |

All five files must exist and be current before a research session is considered complete.

## Research Pipeline

```
Requirements Intake → Internal Browse → External Research →
Ontology Normalization → Hypothesis Generation →
Simulation Loop → Blueprint + Report Output
```

Each finding must be domain-tagged. Each hypothesis needs >= 2 competing options.
Each option needs >= 4 scenarios. Scenarios are scored on 10 dimensions.

## Output

Two artifacts per research session:
1. `ontology-state/blueprint.json` — structured TechBlueprint (machine-readable)
2. `reports/final-report.md` — 13-section human-readable report

## Constraints

- Technical research only: no legal, compliance, or pricing strategy topics
- Every finding must carry a domain tag (DATA/LOGIC/ACTION/SECURITY/LEARN)
- Every claim must carry a provenance tag: `[Official]`, `[Synthesis]`, or `[Inference]`
- Scenarios with `evidenceSufficiency: "insufficient"` cannot support a recommendation
- Do not write to `ontology-state/` files without completing the relevant pipeline stage

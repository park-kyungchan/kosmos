# Kosmos — Ontology-First Tech Implementation Deep Research Engine

## Project Identity

Kosmos performs deep research for technical implementation decisions: ontology design,
frontend/backend architecture, and tech stack selection. It is NOT a general-purpose
research tool. It does NOT handle legal, compliance, or non-technical topics.

Given a user requirement, Kosmos:
1. Decomposes the request into a structured ontology scope
2. Retrieves and classifies evidence across D/L/A domains
3. Generates competing hypotheses and simulated scenarios
4. Outputs a TechBlueprint JSON + 13-section markdown report

## Tech Stack

- TypeScript + Bun — all executable code
- No external runtime dependencies for core schemas
- Run typecheck: `bunx tsc --noEmit`
- Run tests: `bun test`

## Key Files

| Path | Purpose |
|------|---------|
| `schemas/types.ts` | 17 core types + TechBlueprint |
| `schemas/validators.ts` | Runtime type guards and lifecycle validators |
| `ontology-state/world-model.json` | D/L/A ontology graph (updated per normalization pass) |
| `ontology-state/source-map.json` | All retrieved sources with provenance tags |
| `ontology-state/scenarios.json` | All generated scenarios (10 evaluation dimensions) |
| `ontology-state/decision-log.json` | Decomposition and routing decisions |
| `ontology-state/blueprint.json` | TechBlueprint output (final) |
| `docs/scoring-rubric.md` | Scoring definitions for all 10 evaluation dimensions |
| `reports/final-report.md` | 13-section research report |

## Ontology Domains (D/L/A/S/L)

Every finding must be classified into exactly one domain:

| Domain | Question | Examples |
|--------|----------|---------|
| DATA | What exists right now? | Entities, schemas, source tables |
| LOGIC | How do we reason about what exists? | Derived properties, functions, interfaces |
| ACTION | What changes reality when executed? | Mutations, webhooks, automations |
| SECURITY | Who may access, approve, or govern? | RBAC, policies, trust levels |
| LEARN | What feedback and outcomes are recorded? | Evaluations, lineage, drift signals |

Do not assign domain based on file location. Use semantic heuristics above.

## Research Pipeline (7 Stages)

```
Stage 1: Requirements Intake     — decompose into ProjectOntologyScope
Stage 2: Internal Browse         — retrieve from research library (markers, recipes)
Stage 3: External Research       — tech stack only (official docs preferred)
Stage 4: Ontology Normalization  — map all findings to D/L/A domains
Stage 5: Hypothesis Generation   — >= 2 competing hypotheses per question
Stage 6: Simulation Loop         — >= 4 scenarios (base/best/worst/adversarial)
Stage 7: Blueprint + Report      — TechBlueprint JSON + 13-section report
```

Each stage writes to a specific `ontology-state/` file. Do not skip a stage.

## Output Format

### TechBlueprint (`ontology-state/blueprint.json`)
Follows the `TechBlueprint` type in `schemas/types.ts`. Includes:
- Project scope (BackendOntology + optional FrontendOntology)
- D/L/A mapping for all findings
- Recommended stack with >= 1 alternative
- ForwardPropagation and BackwardPropagation paths
- 3-phase implementation strategy
- Evaluator gate result

### 13-Section Report (`reports/final-report.md`)
Sections: User Objective / Research Questions / Retrieval Plan / Internal Findings /
External Findings / Ontology Mapping / Architecture Options / Simulation Results /
Scenario Matrix / Recommended Path / Risks / Next Experiments / What Would Change Decision

## Provenance Tags

Every claim must carry exactly one provenance tag:
- `[Official]` — from official documentation (tier-1 or tier-2 source)
- `[Synthesis]` — composed from multiple official sources
- `[Inference]` — reasoned from evidence, not directly stated

Never mix tags within a single claim. Never omit tags from evidence records.

## Key Type References

```
ResearchQuestion   — tagged with OntologyDomain, has status (open/answered/deferred)
Claim              — carries freshnessStatus (current/aging/stale) and provenance
Evidence           — links claims to source documents
Scenario           — has evidenceSufficiency and contradictionStatus
TechBlueprint      — top-level output; must pass isBlueprintReady() guard
```

## Constraints

- Technical research only: no legal, regulatory, compliance, or pricing strategy
- Every finding must have a D/L/A domain tag
- Every scenario must be evaluated across all 10 dimensions
- Provenance must never be blurred or omitted
- Do not mark research complete without updating all relevant `ontology-state/` files
- Scenarios with `evidenceSufficiency: "insufficient"` cannot support a recommendation

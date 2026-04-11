# Kosmos — Ontology-First Tech Implementation Deep Research Engine

## Project Identity

Kosmos is a Claude Code research codebase that performs **deep research
for Ontology/Frontend/Backend technical implementation**.

It is NOT a general-purpose research tool. It does NOT handle legal reviews,
compliance questions, or non-technical analysis.

When a user says "this app build it", Kosmos:
1. Gathers and clarifies requirements
2. Deep-researches the optimal D/L/A design, tech stack, and architecture
3. Applies Palantir DevCon 5 design principles throughout
4. Outputs a **TechBlueprint** + **13-section report**

The output feeds downstream tools: ontology-design, writing-plans, or direct implementation.

## Tech Stack

- **TypeScript + Bun** — all executable code
- No external runtime dependencies for core schemas
- MCP tools for external research (scrapling, context7, WebSearch)
- Claude Code Native Runtime: hooks, Agent Teams, file-based state

---

## Research Pipeline (7 Stages)

The pipeline can be launched via the `/kosmos-research` skill.
Every request flows through 7 stages:

```
Requirements Intake -> Internal Browse -> External Research ->
Ontology Normalization -> Hypothesis Generation ->
Simulation Loop -> Blueprint + Report Output
```

### Stage 1: Requirements Intake

Decompose user request into `ProjectOntologyScope` (BackendOntology D/L/A/S/LEARN + optional FrontendOntology). Each research question gets a D/L/A domain tag and follows the DevCon 5 3-phase journey (Golden Tables -> Operational Decision-Making -> AI-First). Write decomposition to `ontology-state/decision-log.json`.

### Stage 2: Internal Browse (Palantir Research Library)

**MANDATORY PROTOCOL — Question -> Recipe -> Grep -> Compose -> Reason**

The internal research library at `~/.claude/research/palantir/` contains:
- **~61 files**, **~1,205 markers**, organized by domain
- `BROWSE.md` / `INDEX.md` — to be created at project level for query routing

#### Browse Protocol Rules

- **NEVER** scan all files. ALWAYS use BROWSE.md recipes first (when available).
- **NEVER** use broad wildcards on the research library.
- DC5 markers are allowed on root-level grep (hook exception).
- **ALWAYS** preserve provenance: `[Official]`, `[Synthesis]`, `[Inference]`.
- **ALWAYS** cite the marker(s) that support each claim.

### Stage 3: External Research

Use external sources for **technology stack decisions only** (library versions, APIs, benchmarks, ecosystem reality). Prefer official docs (tier-1) over blog posts (tier-3+). Use scrapling MCP for web fetching, context7 for library docs. Do NOT research non-technical topics. All findings -> `ontology-state/source-map.json`.

### Stage 4: Ontology Normalization

Map ALL findings into D/L/A domains using semantic heuristics:

| Domain | Question | Heuristic |
|--------|----------|-----------|
| **DATA** | What exists? | SH-02: "Delete LOGIC+ACTION, still describes reality?" |
| **LOGIC** | How to reason? | Links, interfaces, derived properties, functions |
| **ACTION** | What changes reality? | Mutations, webhooks, automations |
| **SECURITY** | Who governs access? | RBAC, policies, approvals |
| **LEARN** | What feedback recorded? | Evaluations, lineage, drift signals |

Select ontology primitives per project (Interfaces, Structs, Reducers, Derived Properties, Object-Backed Link Types). Design ForwardProp (`ontology -> contracts -> backend -> frontend`) and BackwardProp (`runtime events -> lineage -> evaluations -> refinement -> ontology updates`) paths. Update `ontology-state/world-model.json` after every normalization pass.

### Stage 5: Hypothesis Generation

For each architectural question, generate >= 2 competing hypotheses with: claim, supporting/contradicting evidence (with provenance), DevCon 5 principle alignment, and ForwardProp/BackwardProp implications.

### Stage 6: Simulation Loop

For each hypothesis, generate >= 4 scenarios (base/best/worst/adversarial) across 10 evaluation dimensions: Evidence Fit, Implementation Difficulty, Risk Severity, Reversibility, Time-to-Value, Governance Compliance, Ecosystem Maturity, D/L/A Fit, ForwardProp Health, Agent Composability. Scoring definitions in `docs/scoring-rubric.md`. Run >= 2 revision rounds. Update `ontology-state/scenarios.json`.

### Stage 7: Blueprint + Report Output

Every research session produces TWO outputs:

**Output A: TechBlueprint** (`ontology-state/blueprint.json`) — Structured JSON following `TechBlueprint` type in `schemas/types.ts` (scope, principles, primitives, D/L/A mapping, stack recommendation, propagation paths, 3-phase strategy, evaluator gate result).

**Output B: 13-Section Report** (`reports/final-report.md`) — User Objective, Research Questions (D/L/A tags), Retrieval Plan, Internal Findings, External Findings, Ontology Mapping, Competing Options, Simulation Results (10 dims), Scenario Matrix, Recommended Path, Risks/Unknowns, Next Experiments, What Would Change the Decision.

---

## Agent Architecture (Agent Teams)

Five specialized teammates spawned by Lead via Agent Teams:

| Agent | Role | Model | Domain |
|-------|------|-------|--------|
| `researcher` | Retrieves tech stack evidence (internal + external) | sonnet | DATA |
| `ontologist` | Maps findings to D/L/A, selects primitives | opus | LOGIC |
| `simulator` | Generates architecture scenarios (10 dimensions) | opus | LOGIC/ACTION |
| `evaluator` | Validates with R1-R13 gates, adversarial testing | opus | VERIFY |
| `reporter` | Produces Blueprint + 13-section report | sonnet | OUTPUT |

DevCon 5 principles (DDD/DRY/OCP/PECS) are applied per agent protocol — see `.claude/agents/*.md`.

### Agent Teams Coordination

The Lead (Opus) orchestrates the full pipeline:

1. **TeamCreate** "kosmos-research" with 5 teammates
2. **TaskCreate x9** (T1-T9) with DAG dependencies
3. **Spawn x5** teammates begin work on assigned tasks
4. Teammates communicate directly via **SendMessage**
5. **TaskCompleted** hook validates phase gates at each transition
6. Evaluator feedback loop: max 2 reject-and-revise cycles (Edison-inspired)
7. Lead synthesizes final output, then **TeamDelete**

```
User Request
    |
[Lead] -- TeamCreate + TaskCreate x9 + Spawn x5
    | (T1 direct)
[researcher] <-> [ontologist] <-> [simulator]
                                      |
                              [evaluator] --reject-> [researcher] (feedback loop)
                              [evaluator] --accept-> [reporter]
    |
[reporter] -> blueprint.json + final-report.md
    |
[Lead] synthesizes -> shutdown -> TeamDelete
```

### Task DAG (T1-T9)

| Task | Phase | Dependencies | Owner |
|------|-------|-------------|-------|
| T1 | Requirements decomposition | none | Lead |
| T2 | Internal browse | T1 | researcher |
| T3 | External research | T1 | researcher |
| T4 | Ontology normalization | T2, T3 | ontologist |
| T5 | Hypothesis generation | T4 | ontologist |
| T6 | Simulation loop | T5 | simulator |
| T7 | Evaluation gate | T6 | evaluator |
| T8 | Report generation | T7 | reporter |
| T9 | Lead synthesis + shutdown | T8 | Lead |

---

## Behavioral Constraints

- Do NOT research non-technical topics (legal, regulatory, compliance, pricing strategy)
- Do NOT recommend a stack without D/L/A classification
- Do NOT skip DevCon 5 principles (DDD/DRY/OCP/PECS)
- Do NOT produce a Blueprint without ForwardProp/BackwardProp paths
- Do NOT collapse to a single hypothesis before simulation
- Do NOT blur provenance: `[Official]`, `[Synthesis]`, `[Inference]`
- Do NOT mark a research task complete without updating ontology-state/ files
- Do NOT generate scenarios without all 10 evaluation dimensions

---

## Ontology State

The `ontology-state/` directory maintains runtime state across sessions:

| File | Purpose | Updated By |
|------|---------|-----------|
| `world-model.json` | D/L/A ontology graph | ontologist |
| `source-map.json` | All retrieved sources with provenance | researcher |
| `scenarios.json` | All generated scenarios (10 dimensions) | simulator |
| `decision-log.json` | Decomposition + routing decisions | Lead |
| `blueprint.json` | TechBlueprint output | reporter |

---

## Enforcement Hooks (8 hooks)

| Hook | Event | Mode | Enforces |
|------|-------|------|----------|
| `inject-prior-state.ts` | SessionStart | Advisory | Loads prior session state into context |
| `enforce-browse-protocol.ts` | PreToolUse (Grep/Read) | **BLOCKING** | No broad scanning; DC5 markers allowed |
| `normalize-research-question.ts` | PreToolUse (Agent) | Advisory | Structured questions with D/L/A tags |
| `post-subagent-worldmodel-check.ts` | PostToolUse (Agent) | **BLOCKING** (ontologist) | world-model.json must be updated |
| `validate-agent-output.ts` | PostToolUse (Agent) | **BLOCKING** (ontologist/reporter) | D/L/A coverage + blueprint output |
| `team-phase-gate.ts` | TaskCompleted | **BLOCKING** | Phase gate validation for Agent Teams pipeline |
| `reinject-state-after-compact.ts` | PostCompact | Advisory | Re-injects state summary after compaction |
| `validate-stop.ts` | Stop | **BLOCKING** | State files + blueprint.json must exist |

---

## Evaluator Hard Gate (13 rejection criteria)

| # | Rule | Blocks When |
|---|------|-------------|
| R1 | Low-tier dependency | Critical claims on tier-4/5 only |
| R2 | Unresolved contradictions | Scenario has contradictionStatus "detected" |
| R3 | Missing scenario link | scenarioIds < 1 |
| R4 | Missing risk link | riskIds < 1 |
| R5 | Stale evidence | >50% critical claims are "stale" |
| R6 | Blurred provenance | Mixed [Official]/[Synthesis]/[Inference] without tags |
| R7 | Missing win rationale | winRationale empty or generic |
| R8 | No alternatives | alternatives < 1 |
| R9 | Insufficient evidence | Scenario evidenceSufficiency "insufficient" |
| R10 | Missing reversal conditions | whatWouldChangeDecision < 1 |
| R11 | **D/L/A classification missing** | Findings without D/L/A domain tags |
| R12 | **DevCon 5 principles not applied** | No DDD/DRY/OCP/PECS analysis |
| R13 | **ForwardProp/BackwardProp broken** | Propagation path has healthStatus "broken" |

---

## Schema Types

17 core types + TechBlueprint in `schemas/types.ts`.
Runtime validators + lifecycle guards in `schemas/validators.ts`.
Key lifecycle validators:
- `isCompleteRecommendation()` — blocks incomplete recommendations
- `isScenarioReportReady()` — blocks scenarios with unresolved contradictions
- `isBlueprintReady()` — blocks blueprints that failed evaluator gate

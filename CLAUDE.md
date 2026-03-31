# Kosmos — Ontology-First Tech Implementation Deep Research Engine

## Project Identity

Kosmos is a Claude Code research codebase that performs **deep research
for Ontology/Frontend/Backend technical implementation**.

It is NOT a general-purpose research tool. It does NOT handle legal reviews,
compliance questions, or non-technical analysis.

When a user says "이런 앱 만들어줘", Kosmos:
1. Gathers and clarifies requirements
2. Deep-researches the optimal D/L/A design, tech stack, and architecture
3. Applies Palantir DevCon 5 design principles throughout
4. Outputs a **TechBlueprint** + **13-section report**

The output feeds downstream tools: ontology-design, writing-plans, or direct implementation.

## Tech Stack

- **TypeScript + Bun** — all executable code
- No external runtime dependencies for core schemas
- MCP tools for external research (scrapling, context7, WebSearch)
- Claude Code Native Runtime: hooks, subagents, file-based state

---

## Research Pipeline (7 Stages)

Every request flows through 7 stages:

```
Requirements Intake → Internal Browse → External Research →
Ontology Normalization → Hypothesis Generation →
Simulation Loop → Blueprint + Report Output
```

### Stage 1: Requirements Intake

Decompose user request into `ProjectOntologyScope`:

```
BackendOntology:
  - DATA: what entities exist
  - LOGIC: how to reason about them
  - ACTION: what changes reality
  - SECURITY: who governs access/trust
  - LEARN: what feedback/outcomes are recorded

FrontendOntology (optional):
  - views: user-facing pages/dashboards
  - agentSurfaces: agent interaction panels
  - scenarioFlows: what-if planning surfaces
  - interaction: user input contracts
  - rendering: visual/3D/spatial surfaces
```

Each research question gets a D/L/A domain tag and follows the DevCon 5
3-phase journey framework:
1. **Golden Tables** — data integration, source mapping
2. **Operational Decision-Making** — encode kinetics (actions, logic, functions)
3. **AI-First** — layer LLMs and automation atop captured kinetics

Write decomposition to `ontology-state/decision-log.json`.

### Stage 2: Internal Browse (Palantir Research Library)

**MANDATORY PROTOCOL — Question → Recipe → Grep → Compose → Reason**

The internal research library at `~/.claude/research/palantir/` contains:
- **81 files**, **~1,205 markers**, organized by domain
- **BROWSE.md** — AI agent query interface (ALWAYS start here)
- **INDEX.md** — structural reference, marker prefixes, constraints

#### DevCon 5 Markers (Critical for v2)

| Marker Range | Content | Location |
|-------------|---------|----------|
| §DC5-01~10 | DevCon 5 sessions (Human-Agent Leverage, Advanced Ontology, Army SF, AI FDE, DevEx, Foundations) | `palantir/platform/devcon.md` |
| §DC-SIG-01~07 | Significance for our system | `palantir/platform/devcon.md` |
| §DC-EVO-01 | Evolution arcs DC1→DC5 | `palantir/platform/devcon.md` |
| §FDE-01~09 | AI FDE capabilities | `palantir/platform/ai-fde.md` |

#### Design Principles to Search For

| Principle | Source | Application |
|-----------|--------|------------|
| **DDD** (Domain-Driven Design) | §DC5-05 | Objects = real-world things 1:1 |
| **DRY** (Rule of Three) | §DC5-05 | Refactor after 3 duplications |
| **OCP** (Open/Closed) | §DC5-05 | Core locked, extensions open |
| **PECS** (Producer Extends, Consumer Super) | §DC5-05 | Plug-and-play ontology via interfaces |

#### Browse Protocol Rules

- **NEVER** scan all 81 files. ALWAYS use BROWSE.md recipes first.
- **NEVER** use broad wildcards on the research library.
- §DC5 markers are allowed on root-level grep (hook exception).
- **ALWAYS** preserve provenance: `[Official]`, `[Synthesis]`, `[Inference]`.
- **ALWAYS** cite the marker(s) that support each claim.

### Stage 3: External Research

Use external sources for **technology stack decisions only**:
- Library/framework versions, APIs, benchmarks, pricing
- Current ecosystem reality (npm, GitHub, official docs)
- Implementation patterns and deployment options

External source rules:
- Prefer official docs (tier-1) over blog posts (tier-3+)
- Use scrapling MCP for web fetching, context7 for library docs
- Capture: source URL, access date, provenance tier
- **DO NOT** research non-technical topics (legal, regulatory, compliance)

All findings → `ontology-state/source-map.json`.

### Stage 4: Ontology Normalization

Map ALL findings into D/L/A domains using semantic heuristics:

| Domain | Question | Heuristic |
|--------|----------|-----------|
| **DATA** | Does this describe WHAT EXISTS? | SH-02: "Delete LOGIC+ACTION, still describes reality?" → DATA |
| **LOGIC** | Does this describe HOW TO REASON? | Links, interfaces, derived properties, functions |
| **ACTION** | Does this CHANGE REALITY? | Mutations, webhooks, automations |
| **SECURITY** | Who governs access/trust? | RBAC, policies, approvals |
| **LEARN** | What feedback/outcomes are recorded? | Evaluations, lineage, drift signals |

#### Ontology Primitives Selection (DevCon 5 §DC5-06)

For each project, select from these primitives:
- **Interfaces** — polymorphic workflows, multi-inheritance, PECS
- **Structs** — compound properties with metadata
- **Reducers** — collapse multi-value histories to focus value
- **Derived Properties** — semantic business logic without denormalization
- **Object-Backed Link Types** — relationship metadata when semantically meaningful

#### ForwardPropagation Path

Design the compilation chain:
```
ontology definitions → core contracts → backend runtime → frontend runtime
```
Every runtime name must match an ontology name.

#### BackwardPropagation Path

Design the learning chain:
```
runtime events → lineage/audit → evaluations → refinement → ontology updates
```
Every important decision must leave a trace.

Update `ontology-state/world-model.json` after every normalization pass.

### Stage 5: Hypothesis Generation

For each architectural question, generate >= 2 competing hypotheses.
Each hypothesis must specify:
- The claim: "This stack is optimal for this D/L/A structure because..."
- Supporting evidence (with provenance tags)
- Contradicting evidence
- DevCon 5 principle alignment (DDD/DRY/OCP/PECS fit)
- ForwardProp/BackwardProp implications

### Stage 6: Simulation Loop

For each hypothesis, generate >= 4 scenarios (base/best/worst/adversarial).

#### Evaluation Dimensions (10)

| # | Dimension | Question |
|---|-----------|----------|
| 1 | Evidence Fit | How well-supported are assumptions? |
| 2 | Implementation Difficulty | How hard to build? |
| 3 | Risk Severity | How bad is the worst case? |
| 4 | Reversibility | How easy to change course? |
| 5 | Time-to-Value | How quickly does this deliver? |
| 6 | Governance Compliance | Does this satisfy safety/policy needs? |
| 7 | Ecosystem Maturity | How stable is the stack? |
| 8 | **D/L/A Fit** | Is the DATA/LOGIC/ACTION classification clean? |
| 9 | **ForwardProp Health** | Is ontology→contract→backend→frontend propagation healthy? |
| 10 | **Agent Composability** | Can agents compose ontology-based tools? |

Scoring definitions in `docs/scoring-rubric.md`.
Run >= 2 revision rounds. Update `ontology-state/scenarios.json`.

### Stage 7: Blueprint + Report Output

Every research session produces TWO outputs:

#### Output A: TechBlueprint (`ontology-state/blueprint.json`)

Structured JSON following `TechBlueprint` type in `schemas/types.ts`:
- Project scope (BackendOntology + FrontendOntology)
- DevCon 5 principles application
- Ontology primitives selected
- D/L/A mapping
- Recommended stack with alternatives
- ForwardProp/BackwardProp paths
- 3-phase implementation strategy
- Evaluator gate result

#### Output B: 13-Section Report (`reports/final-report.md`)

1. User Objective
2. Research Questions (with D/L/A domain tags)
3. Retrieval Plan
4. Internal Palantir Findings (DevCon 5 principles)
5. External Current Findings (tech stack)
6. Ontology Mapping (D/L/A + primitives)
7. Competing Architecture Options
8. Simulation Results (10 dimensions)
9. Scenario Matrix
10. Recommended Path (3-phase strategy)
11. Risks / Unknowns
12. Next Experiments
13. What Would Change the Decision

---

## Agent Architecture

Six specialized agents in `.claude/agents/`:

| Agent | Role | Model | Domain |
|-------|------|-------|--------|
| `orchestrator` | Decomposes requirements into ProjectOntologyScope | opus | META |
| `researcher` | Retrieves tech stack evidence (internal + external) | sonnet | DATA |
| `ontologist` | Maps findings to D/L/A, selects primitives | opus | LOGIC |
| `simulator` | Generates architecture scenarios (10 dimensions) | opus | LOGIC/ACTION |
| `evaluator` | Validates with R1-R13 gates, adversarial testing | opus | VERIFY |
| `reporter` | Produces Blueprint + 13-section report | sonnet | OUTPUT |

### Agent Coordination Flow

```
User Request
    ↓
[orchestrator] — decomposes → ProjectOntologyScope + ResearchQuestion[]
    ↓
[researcher] — retrieves → SourceDocument[], Claim[], Evidence[]
    ↓
[ontologist] — normalizes → D/L/A mapping, primitives, ForwardProp/BackwardProp
    ↓
[simulator] — generates → Scenario[] (10 dimensions), SimulationRun[]
    ↓
[evaluator] — validates → R1-R13 gates, Risk[]
    ↓
[reporter] — produces → blueprint.json + final-report.md
    ↓
Lead synthesizes → Decision Support Output to user
```

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
| `decision-log.json` | Decomposition + routing decisions | orchestrator |
| `blueprint.json` | TechBlueprint output | reporter |

---

## Enforcement Hooks (7 hooks)

| Hook | Event | Mode | Enforces |
|------|-------|------|----------|
| `inject-prior-state.ts` | SessionStart | Advisory | Loads prior session state into context |
| `enforce-browse-protocol.ts` | PreToolUse (Grep/Read) | **BLOCKING** | No broad scanning; §DC5 markers allowed |
| `normalize-research-question.ts` | PreToolUse (Agent) | Advisory | Structured questions with D/L/A tags |
| `post-subagent-worldmodel-check.ts` | PostToolUse (Agent) | **BLOCKING** (ontologist) | world-model.json must be updated |
| `validate-agent-output.ts` | PostToolUse (Agent) | **BLOCKING** (ontologist/reporter) | D/L/A coverage + blueprint output |
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

---

## DevCon 5 Principles (Mandatory Application)

Every research session must apply these principles from §DC5-05:

### 1. Domain-Driven Design (DDD)
- Objects represent real-world things 1:1 (virtual twin of reality, not datasets)
- API names must make sense to both humans and agents
- Ontology should feel intuitive to navigate

### 2. Don't Repeat Yourself (DRY, Rule of Three)
- If built 3 times, refactor into shared interface or contract
- Helps both human and agent context management

### 3. Open for Extension, Closed for Modification (OCP)
- Core workflows locked; extension points open
- Composition over inheritance (multi-inheritance interfaces)

### 4. Producer Extends, Consumer Super (PECS)
- Plug-and-play ontology through covariant/contravariant interfaces
- Flexibility in workflows and functions

### 3-Phase Implementation Journey (§DC5-04)
1. **Golden Tables** — data integration, get sources right
2. **Operational Decision-Making** — encode kinetics via D/L/A
3. **AI-First** — layer LLMs and automation atop captured kinetics

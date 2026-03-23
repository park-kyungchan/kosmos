# Kosmos — Ontology-Driven AI Research & Decision-Support OS

## Project Identity

Kosmos is a Claude Code project operating system for systematic research,
ontology-based world modeling, multi-hypothesis reasoning, and decision support.

It is NOT a chat interface. It is NOT a summarization tool.

It is a structured reasoning pipeline that:
1. Decomposes user requests into explicit research questions
2. Retrieves evidence from internal (Palantir research library) and external sources
3. Normalizes findings into an ontology-style world model
4. Generates and tests multiple competing hypotheses
5. Simulates scenarios across base/best/worst/adversarial cases
6. Produces decision-support outputs with ranked alternatives

## Tech Stack

- **TypeScript + Bun** — all executable code
- No external runtime dependencies for core schemas
- MCP tools for external research (scrapling, context7, WebSearch)
- Agent Teams for parallel research and verification

---

## Research Pipeline (7 Stages)

Every substantial request flows through 7 stages:

```
Research Intake → Internal Browse → External Research →
Ontology Normalization → Hypothesis Generation →
Simulation Loop → Decision Support Output
```

### Stage 1: Research Intake

Decompose user request into explicit `ResearchQuestion` objects.

- Each question: `{ text, domain, priority, decomposedFrom, status }`
- Questions must be falsifiable or answerable with evidence
- Maximum 3 levels of decomposition depth
- Write decomposed questions to `ontology-state/decision-log.json`

### Stage 2: Internal Browse (Palantir Research Library)

**MANDATORY PROTOCOL — Question → Recipe → Grep → Compose → Reason**

The internal research library at `~/.claude/research/palantir/` contains:
- **81 files**, **~1,205 markers**, organized by domain
- **BROWSE.md** (`~/.claude/research/BROWSE.md`) — AI agent query interface (ALWAYS start here)
- **INDEX.md** (`~/.claude/research/INDEX.md`) — structural reference, marker prefixes, constraints

#### Browse Protocol

1. **Question**: Frame the information need as a specific question
2. **Recipe**: Look up the question in BROWSE.md's Question Recipes table
3. **Grep**: Follow the recipe's marker chain with targeted grep
   ```
   Grep({ pattern: "\\[§LOGIC\\.R-02\\]", path: "~/.claude/research/palantir/logic/" })
   ```
4. **Compose**: Read only the sections the markers point to (150 lines at a time)
5. **Reason**: Synthesize across markers to answer the original question

#### Hard Rules

- **NEVER** scan all 81 files. ALWAYS use BROWSE.md recipes first.
- **NEVER** use `Grep({ pattern: ".*" })` or broad wildcards on the research library.
- **ALWAYS** prefer marker chains and bounded grep over broad reading.
- **ALWAYS** preserve provenance boundaries:
  - `[Official]` = direct Palantir content (from their docs, AIPCon, DevCon)
  - `[Synthesis]` = our analytical synthesis (frameworks, naming, heuristics)
  - `[Inference]` = reasoned conclusion drawn from official evidence
- **NEVER** present `[Synthesis]` or `[Inference]` as `[Official]`.
- **ALWAYS** cite the marker(s) that support each claim.

#### Core Axioms (from BROWSE.md)

| # | Axiom | Provenance |
|---|-------|-----------|
| A1 | Causation, not correlation | [Synthesis] from [Official] |
| A2 | Decisions, not data | [Official] |
| A3 | Explicit over implicit | [Official] substance, [Synthesis] label |
| A4 | Semantic compilation | [Official] concept, [Synthesis] 4-stage model |
| A5 | Twin feedback loop (SENSE-DECIDE-ACT-LEARN) | [Synthesis] loop, [Official] components |

#### Marker System

- Multi-file: `[§PREFIX.ABBREV-NN]` (e.g., `[§DATA.EN-01]`)
- Single-file: `[§PREFIX-NN]` (e.g., `[§ARCH-01]`)
- Cross-refs: `→[§ID]` links to another section
- Use `Grep({ pattern: "\\[§DATA\\." })` for DATA domain scoping

### Stage 3: External Research

Use external sources when:
- Latest stacks, APIs, pricing, benchmarks, deployment tools, vendor capabilities needed
- Implementation decisions depend on current ecosystem reality
- Internal research does not fully answer the question

External source rules:
- Prefer official docs and primary sources over blog posts
- Capture: source URL, access date, and provenance tier
- Distinguish platform facts from design interpretation
- Use scrapling MCP for web fetching, context7 for library docs
- All external findings become `SourceDocument` objects in `ontology-state/source-map.json`

### Stage 4: Ontology Normalization

Map ALL findings into ontology concepts:

| Layer | Concepts |
|-------|----------|
| **Semantic** (what exists) | Object Types, Properties, Value Types, Link Types, Interfaces |
| **Kinetic** (what happens) | Action Types, Functions, Security, Governance, Validation |
| **Decision Support** (what to do) | Scenarios, Risks, Recommendations, Next Experiments |

Update `ontology-state/world-model.json` after every normalization pass.
Every object must have: `id`, `type`, `domain`, `provenance`, `evidenceIds`.

### Stage 5: Hypothesis Generation

For each architectural or strategic question, generate >= 2 competing hypotheses.
Each hypothesis must specify:
- The claim (clear, falsifiable statement)
- Supporting evidence (with provenance tags)
- Contradicting evidence
- Testability criteria
- Architecture implications

Do NOT collapse to a single hypothesis prematurely.
Maintain competing hypotheses until simulation resolves them.

### Stage 6: Simulation Loop

For each hypothesis or decision point, generate >= 4 scenarios:

| Scenario | Description |
|----------|-------------|
| **Base Case** | Most likely outcome given current evidence |
| **Best Case** | Optimistic outcome if favorable conditions hold |
| **Worst Case** | Pessimistic outcome if unfavorable conditions hold |
| **Adversarial** | What breaks? What does an attacker/competitor exploit? |

Each scenario must include:
- Assumptions (numbered, falsifiable)
- Evidence base (source IDs)
- Contradictions (what evidence argues against this scenario)
- Architecture implications
- Implementation difficulty (1-5 scale)
- Deployment implications
- Governance / safety implications
- Recommended next actions

**Revision rounds**: Run >= 2 rounds of scenario revision when contradictions
or missing evidence appear. Each round narrows uncertainty or reveals new questions.

Update `ontology-state/scenarios.json` after each simulation pass.

### Stage 7: Decision Support Output

Every user-facing report follows this 13-section structure:

1. User Objective
2. Research Questions
3. Retrieval Plan
4. Internal Palantir Findings
5. External Current Findings
6. Ontology Mapping
7. Competing Architecture Options
8. Simulation Results
9. Scenario Matrix
10. Recommended Path
11. Risks / Unknowns
12. Next Experiments
13. What Would Change the Decision

Report templates live in `reports/`. Final output written to `reports/final-report.md`.

---

## Agent Architecture

Six specialized agents in `.claude/agents/`:

| Agent | Role | Domain | Model |
|-------|------|--------|-------|
| `orchestrator` | Decomposes requests, coordinates pipeline stages | META | opus |
| `researcher` | Retrieves and synthesizes evidence (internal + external) | DATA | opus |
| `ontologist` | Maps findings to ontology concepts, maintains world model | LOGIC | opus |
| `simulator` | Generates scenarios, runs counterfactual analysis | LOGIC/ACTION | opus |
| `evaluator` | Validates findings, checks contradictions, adversarial testing | VERIFY | opus |
| `reporter` | Produces structured decision-support outputs | OUTPUT | opus |

### Agent Coordination Flow

```
User Request
    ↓
[orchestrator] — decomposes → ResearchQuestion[]
    ↓
[researcher] — retrieves → SourceDocument[], Claim[], Evidence[]
    ↓
[ontologist] — normalizes → world-model.json update
    ↓
[simulator] — generates → Scenario[], SimulationRun[]
    ↓
[evaluator] — validates → verified findings, Risk[]
    ↓
[reporter] — produces → final-report.md, scenario-matrix.md
    ↓
Lead synthesizes → Decision Support Output to user
```

### Agent Spawn Rules

- Orchestrator runs first, always. Other agents wait for its output.
- Researcher and external research can run in parallel.
- Ontologist waits for researcher output.
- Simulator waits for ontologist output.
- Evaluator and reporter can run after simulator.
- Lead synthesizes all agent outputs into the final answer.

---

## Behavioral Constraints

- Do NOT stop at explanation — always produce actionable decision support
- Do NOT return only one answer when multiple viable options exist
- Do NOT collapse uncertainty prematurely — maintain competing hypotheses
- Do NOT recommend a stack without comparing alternatives
- Do NOT skip security, governance, or validation implications
- Do NOT blur `[Official]`, `[Synthesis]`, and `[Inference]` provenance tags
- Do NOT treat the internal research library as something to read exhaustively
- Do NOT start implementation before completing ontology normalization
- Do NOT generate scenarios without evidence base citations
- Do NOT mark a research task complete without updating world-model.json

---

## Ontology State

The `ontology-state/` directory maintains runtime state across sessions:

| File | Purpose | Updated By |
|------|---------|-----------|
| `world-model.json` | Current ontology graph (objects, properties, links) | ontologist |
| `source-map.json` | All retrieved sources with provenance | researcher |
| `scenarios.json` | All generated scenarios | simulator |
| `decision-log.json` | All decisions made with reasoning trace | orchestrator, evaluator |

State files are updated incrementally. Every update must include:
- `timestamp` (ISO 8601)
- `updatedBy` (agent name)
- `sessionId` (current session identifier)

---

## Hooks

Four enforcement hooks in `.claude/hooks/`:

| Hook | Event | Purpose |
|------|-------|---------|
| `enforce-browse-protocol.ts` | PreToolUse (Grep/Read) | Blocks broad scanning of research library |
| `validate-stop.ts` | Stop | Prevents stop without required report sections |
| `normalize-research-question.ts` | PreToolUse (Agent) | Ensures research questions decomposed before agent spawn |
| `post-subagent-worldmodel-check.ts` | PostToolUse (Agent) | Verifies world model updated after research |

---

## Schema Validation

All runtime state must conform to schemas in `schemas/`:
- 14 core types covering the full research-to-decision pipeline
- Type guards for runtime validation
- See `schemas/types.ts` for the complete vocabulary
- See `schemas/validators.ts` for validation functions

---

## Report Templates

Templates in `reports/` provide consistent output structure:

| Template | Purpose |
|----------|---------|
| `final-report.md` | Complete 13-section decision-support output |
| `scenario-matrix.md` | Side-by-side scenario comparison table |
| `tradeoff-analysis.md` | Dimension-by-dimension option comparison |
| `next-experiments.md` | Prioritized list of experiments to reduce uncertainty |

---

## Documentation

Architecture and methodology docs in `docs/`:

| Doc | Covers |
|-----|--------|
| `architecture.md` | System architecture, pipeline flow, agent coordination |
| `browse-workflow.md` | Detailed browse protocol with examples |
| `ontology-mapping-rules.md` | How to map research findings to ontology concepts |
| `simulation-methodology.md` | Scenario generation, revision rounds, scoring |
| `governance-security.md` | Provenance, access control, validation governance |

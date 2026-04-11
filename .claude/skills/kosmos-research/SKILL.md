---
name: kosmos-research
description: "Launch the Kosmos Agent Teams research pipeline for Ontology-First tech implementation deep research. Use this skill when the user wants to research how to build an app, design an architecture, evaluate a tech stack, or says things like '이런 앱 만들어줘', 'research this stack', 'design the ontology for X', or any request that needs a TechBlueprint. This skill orchestrates 5 AI agents that debate, validate, and produce a comprehensive research report."
user-invocable: true
argument-hint: "research objective or app description (e.g., '실시간 협업 문서 편집기')"
model: opus
---

# Kosmos Research — Agent Teams Pipeline

You are launching an Edison Kosmos-inspired autonomous research pipeline.
Five specialized agents will collaborate through a shared world model, debate
findings, and produce a validated TechBlueprint + 13-section report.

The user's research objective: **$ARGUMENTS**

---

## Phase 0: Load Prior State

Read these files to understand any prior session context. If they exist and
contain data from a previous research session, summarize what was already
discovered to avoid redundant work.

- `ontology-state/decision-log.json` — prior decomposition and routing decisions
- `ontology-state/world-model.json` — prior D/L/A classified objects
- `ontology-state/source-map.json` — prior sources and claims
- `ontology-state/scenarios.json` — prior hypothesis testing results
- `ontology-state/blueprint.json` — prior blueprint (if any)

If prior state exists, note what can be reused vs what needs fresh research.

---

## Phase 1: Create Team and Task DAG

### 1.1 Create the team

```
TeamCreate({
  team_name: "kosmos-research",
  description: "Ontology-First deep research for: $ARGUMENTS"
})
```

### 1.2 Create 9 tasks with dependencies

Create all tasks in order. The `[TAG]` prefix in each subject is critical —
the `team-phase-gate.ts` hook uses it to determine which validations to run.

**Wave 1 — Intake (Lead direct):**
- T1: `[INTAKE] Decompose "$ARGUMENTS" into ProjectOntologyScope`
  - Description: Parse the user's objective. Identify BackendOntology domains
    (DATA/LOGIC/ACTION/Security/Learn) and FrontendOntology surfaces
    (views/agentSurfaces/scenarioFlows/interaction/rendering).
    Create 3-7 ResearchQuestions with D/L/A tags and priority.
    Classify against DevCon 5 three-phase journey (§DC5-04).
    Write decomposition to `ontology-state/decision-log.json`.
  - No blockedBy.

**Wave 2 — Research (researcher claims both):**
- T2: `[RESEARCH-INT] Internal browse — Palantir research library`
  - Description: Follow BROWSE.md protocol (Question → Recipe → Grep → Compose → Reason).
    Search for relevant §DC5 markers (DDD, DRY, OCP, PECS patterns).
    Extract atomic claims with [Official]/[Synthesis]/[Inference] provenance.
    Update `ontology-state/source-map.json` with internal SourceDocuments.
  - blockedBy: [T1]

- T3: `[RESEARCH-EXT] External research — tech stack evidence`
  - Description: Use scrapling MCP, context7 MCP, and WebSearch for technology
    stack research (library versions, APIs, benchmarks, deployment options).
    Respect source hierarchy: tier-1 official docs > tier-2 release notes >
    tier-3 vendor blogs > tier-4 benchmarks > tier-5 community.
    Extract atomic claims with retrievedDate and freshnessStatus.
    Update `ontology-state/source-map.json` with external SourceDocuments.
  - blockedBy: [T1]

**Wave 3 — Ontology (ontologist):**
- T4: `[ONTOLOGY] Map findings to D/L/A, select primitives, design propagation`
  - Description: Read source-map.json. Classify ALL findings into 5 domains
    (DATA/LOGIC/ACTION/SECURITY/LEARN) using semantic heuristics SH-01 through SH-05.
    Apply DevCon 5 DC5-06 ontology primitives (Interface, Struct, Reducer, Derived
    Property, Object-Backed Link Type). Check DDD/DRY/OCP/PECS principles.
    Design ForwardProp (ontology→contracts→backend→frontend) and BackwardProp
    (runtime→lineage→evaluation→refinement) paths.
    Update `ontology-state/world-model.json`.
  - blockedBy: [T2, T3]

**Wave 4 — Simulation (simulator):**
- T5: `[HYPOTHESIS] Generate >=2 competing architecture hypotheses`
  - Description: Read world-model.json. Frame >=2 competing architecture hypotheses
    grounded in D/L/A ontology structure. Each hypothesis must specify: statement,
    D/L/A justification, supporting/contradicting evidence IDs, test criteria,
    DevCon 5 alignment. Write to `ontology-state/scenarios.json`.
  - blockedBy: [T4]

- T6: `[SIMULATION] Generate >=4 scenarios per hypothesis, 10-dimension scoring`
  - Description: For each hypothesis, generate base/best/worst/adversarial scenarios.
    Score ALL 10 dimensions (Evidence Fit, Implementation Difficulty, Risk Severity,
    Reversibility, Time-to-Value, Governance Compliance, Ecosystem Maturity,
    D/L/A Fit, ForwardProp Health, Agent Composability). Run >=2 revision rounds.
    Reference `docs/scoring-rubric.md` for dimensions 1-7 definitions.
    Update `ontology-state/scenarios.json`.
  - blockedBy: [T5]

**Wave 5 — Evaluation (evaluator):**
- T7: `[EVALUATE] Apply R1-R13 gates, adversarial validation`
  - Description: Read ALL ontology-state/ files. Apply all 13 rejection criteria
    (R1-R13). Check acceptance checklist (provenance, scenario coverage, risk
    coverage, D/L/A domain coverage, DevCon 5 compliance). If any criterion fails,
    use SendMessage to request re-research (max 2 feedback loops).
    Write gate result to `ontology-state/decision-log.json` as evaluatorGateResult.
  - blockedBy: [T6]

**Wave 6 — Output (reporter, parallel):**
- T8: `[BLUEPRINT] Produce TechBlueprint JSON`
  - Description: Read all ontology-state/ files and evaluator acceptance.
    Write `ontology-state/blueprint.json` conforming to TechBlueprint type
    from schemas/types.ts. Must include: projectScope, designPrinciples,
    primitives, ontologyMapping, recommendedStack, forwardProp, backwardProp,
    implementationStrategy (3 phases), evaluatorGate, scenarioIds, riskIds,
    sourceIds, confidence. Must pass isBlueprintReady() from schemas/validators.ts.
  - blockedBy: [T7]

- T9: `[REPORT] Produce 13-section final report`
  - Description: Read all ontology-state/ files and blueprint.json.
    Write `reports/final-report.md` with ALL 13 sections:
    1-User Objective, 2-Research Questions, 3-Retrieval Plan,
    4-Internal Findings, 5-External Findings, 6-Ontology Mapping,
    7-Competing Options, 8-Simulation Results, 9-Scenario Matrix,
    10-Recommended Path, 11-Risks/Unknowns, 12-Next Experiments,
    13-What Would Change the Decision.
    No section may be omitted. Tag all claims with provenance.
  - blockedBy: [T7]

---

## Phase 2: Execute T1 Directly (Lead Decomposition)

The Lead executes T1 without delegating. This is the orchestrator's job:

1. Read the user's objective: "$ARGUMENTS"
2. Apply the orchestrator agent protocol from `.claude/agents/orchestrator.md`
3. Decompose into ProjectOntologyScope (backend domains + frontend surfaces)
4. Create 3-7 ResearchQuestions with D/L/A tags
5. Classify against DevCon 5 three-phase journey
6. Write to `ontology-state/decision-log.json`
7. Mark T1 as completed

---

## Phase 3: Spawn Teammates

Spawn all 5 teammates in a single message (parallel). Each teammate joins the
"kosmos-research" team and can see the shared task list.

**Researcher** (Sonnet — execution-focused, cost-optimized):
```
Agent({
  description: "Research evidence gathering",
  subagent_type: "researcher",
  name: "researcher",
  team_name: "kosmos-research",
  model: "sonnet",
  run_in_background: true,
  prompt: "You are the researcher for Kosmos Agent Teams.
    Read .claude/agents/researcher.md for your full protocol.
    Your tasks are T2 and T3. Claim them via TaskUpdate, execute
    the research protocol, update ontology-state/source-map.json,
    and notify the ontologist via SendMessage when done.
    The research objective is: $ARGUMENTS"
})
```

**Ontologist** (Opus — deep semantic reasoning):
```
Agent({
  description: "Ontology classification and world model",
  subagent_type: "general-purpose",
  name: "ontologist",
  team_name: "kosmos-research",
  model: "opus",
  run_in_background: true,
  prompt: "You are the ontologist for Kosmos Agent Teams.
    Read .claude/agents/ontologist.md for your full protocol.
    Your task is T4. Wait for researcher findings (via SendMessage
    or when T2+T3 are completed), then classify all findings into
    D/L/A/Security/Learn domains. Update ontology-state/world-model.json
    and notify the simulator via SendMessage.
    The research objective is: $ARGUMENTS"
})
```

**Simulator** (Opus — complex multi-dimensional analysis):
```
Agent({
  description: "Hypothesis testing and scenario generation",
  subagent_type: "general-purpose",
  name: "simulator",
  team_name: "kosmos-research",
  model: "opus",
  run_in_background: true,
  prompt: "You are the simulator for Kosmos Agent Teams.
    Read .claude/agents/simulator.md for your full protocol.
    Your tasks are T5 and T6. Wait for ontologist world model
    update (via SendMessage or when T4 is completed).
    Generate hypotheses, scenarios, and score all 10 dimensions.
    Reference docs/scoring-rubric.md for dimensions 1-7.
    Update ontology-state/scenarios.json and notify evaluator.
    The research objective is: $ARGUMENTS"
})
```

**Evaluator** (Opus — adversarial quality gate):
```
Agent({
  description: "Adversarial quality gate R1-R13",
  subagent_type: "general-purpose",
  name: "evaluator",
  team_name: "kosmos-research",
  model: "opus",
  run_in_background: true,
  prompt: "You are the evaluator for Kosmos Agent Teams.
    Read .claude/agents/evaluator.md for your full protocol.
    Your task is T7. Wait for simulator scenarios (via SendMessage
    or when T6 is completed). Apply ALL 13 rejection criteria.
    If any fail, SendMessage to the responsible agent with
    specific feedback (max 2 loops). On acceptance, SendMessage
    to reporter and write gate result to decision-log.json.
    The research objective is: $ARGUMENTS"
})
```

**Reporter** (Sonnet — structured output production):
```
Agent({
  description: "Blueprint and report production",
  subagent_type: "general-purpose",
  name: "reporter",
  team_name: "kosmos-research",
  model: "sonnet",
  run_in_background: true,
  prompt: "You are the reporter for Kosmos Agent Teams.
    Read .claude/agents/reporter.md for your full protocol.
    Your tasks are T8 and T9. Wait for evaluator acceptance
    (via SendMessage or when T7 is completed). Read ALL
    ontology-state/ files and produce both outputs:
    1. ontology-state/blueprint.json (TechBlueprint type)
    2. reports/final-report.md (all 13 sections)
    The research objective is: $ARGUMENTS"
})
```

---

## Phase 4: Monitor and Coordinate

While teammates work, the Lead:

1. **Polls TaskList** periodically to track progress
2. **Handles messages** from teammates (especially evaluator feedback loops)
3. **Resolves cross-agent conflicts** (e.g., if ontologist and simulator disagree)
4. **Fixes cross-cutting issues** (import errors, shared state inconsistencies)
5. **Does NOT duplicate** teammate work

If a teammate gets stuck (idle for too long with incomplete task), the Lead
can SendMessage with guidance or reassign the task.

---

## Phase 5: Synthesize and Teardown

After all 9 tasks are completed:

1. **Read the final outputs**:
   - `ontology-state/blueprint.json`
   - `reports/final-report.md`
2. **Synthesize** a concise decision-support summary for the user
3. **Shutdown teammates**: SendMessage shutdown_request to each, wait for responses
4. **Clean up**: TeamDelete()
5. **Present to user**: The TechBlueprint summary + link to full report

---

## Key Rules

- The Lead coordinates but does NOT do the agents' work (except T1 decomposition)
- All agent communication happens via SendMessage, not through the Lead
- The evaluator is the ONLY agent that can approve the pipeline — no shortcuts
- Maximum 2 evaluator feedback loops before force-accept with caveats
- All state flows through ontology-state/ files — this is the shared world model
- The TaskCompleted hook (`team-phase-gate.ts`) validates state files at each phase

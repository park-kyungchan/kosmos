---
name: kosmos-research
description: "Launch the Kosmos Agent Teams research pipeline for Ontology-First tech implementation deep research. Use this skill when the user wants to research how to build an app, design an architecture, evaluate a tech stack, or says things like '이런 앱 만들어줘', 'research this stack', 'design the ontology for X', or any request that needs a TechBlueprint. This skill orchestrates 7 AI agents that prototype, test, debate, and produce a validated TechBlueprint + 13-section report."
user-invocable: true
argument-hint: "research objective or app description (e.g., '실시간 협업 문서 편집기')"
model: opus
---

# Kosmos Research v2 — Agent Teams Pipeline

You are launching an Edison Kosmos-inspired autonomous research pipeline.
Seven specialized agents collaborate through a shared world model — and now
**implement, test, and debate** before producing a validated TechBlueprint.

The user's research objective: **$ARGUMENTS**

---

## Phase 0: Load Prior State

Read these files to understand any prior session context:

- `ontology-state/decision-log.json` — prior decomposition and routing decisions
- `ontology-state/world-model.json` — prior D/L/A classified objects
- `ontology-state/source-map.json` — prior sources and claims
- `ontology-state/scenarios.json` — prior hypothesis testing results
- `ontology-state/eval-results.json` — prior prototype + eval results
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

### 1.2 Create 12 tasks with dependencies

The `[TAG]` prefix in each subject is critical — `team-phase-gate.ts`
uses it to determine which validations to run.

**CRITICAL — Strict Dependency Enforcement:**
All agents MUST check TaskList and verify their blockedBy tasks are completed
before claiming a task. Agents that claim blocked tasks will produce incomplete
results and fail phase gates.

**Wave 1 — Intake (Lead direct):**
- T1: `[INTAKE] Decompose "$ARGUMENTS" into ProjectOntologyScope`
  - Description: Parse the user's objective. Identify BackendOntology domains
    (DATA/LOGIC/ACTION/Security/Learn) and FrontendOntology surfaces.
    Create 3-7 ResearchQuestions with D/L/A tags and priority.
    Write decomposition to `ontology-state/decision-log.json`.
  - No blockedBy.

**Wave 2 — Research (researcher claims both):**
- T2: `[RESEARCH-INT] Internal browse — Palantir research library`
  - Description: Follow BROWSE.md protocol. Search for relevant §DC5 markers.
    Update `ontology-state/source-map.json` with internal SourceDocuments.
  - blockedBy: [T1]

- T3: `[RESEARCH-EXT] External research — tech stack evidence`
  - Description: Use scrapling, context7, WebSearch for tech stack research.
    Update `ontology-state/source-map.json` with external SourceDocuments.
  - blockedBy: [T1]

**Wave 3 — Ontology (ontologist):**
- T4: `[ONTOLOGY] Map findings to D/L/A, select primitives, design propagation`
  - Description: Classify ALL findings into 5 domains using semantic heuristics.
    Apply DevCon 5 DC5-06 ontology primitives. Design ForwardProp/BackwardProp.
    Update `ontology-state/world-model.json`.
  - blockedBy: [T2, T3]

**Wave 4 — Simulation (simulator):**
- T5: `[HYPOTHESIS] Generate >=2 competing architecture hypotheses`
  - Description: Frame >=2 competing hypotheses grounded in D/L/A ontology.
    Write to `ontology-state/scenarios.json`.
  - blockedBy: [T4]

- T6: `[SIMULATION] Generate >=4 scenarios per hypothesis, 11-dimension scoring`
  - Description: Generate base/best/worst/adversarial scenarios. Score ALL 11
    dimensions (1-7 from rubric + D/L/A Fit + ForwardProp Health + Agent
    Composability + Prototype Validation [score 3 = "not yet tested"]).
    Reference `docs/scoring-rubric.md`. Update `ontology-state/scenarios.json`.
  - blockedBy: [T5]

**Wave 5 — Prototype + Eval (NEW in v2):**
- T7: `[PROTOTYPE] Implement PoC for hypothesis A`
  - Description: Read scenarios.json for hypothesis A. Implement 50-200 line
    TypeScript PoC in `prototype/` directory. Run `bunx tsc --noEmit`.
    Write PrototypeResult to `ontology-state/eval-results.json`.
    Notify eval-runner when done.
  - blockedBy: [T6]

- T8: `[PROTOTYPE] Implement PoC for hypothesis B`
  - Description: Same as T7 but for hypothesis B. Parallel with T7.
  - blockedBy: [T6]

- T9: `[EVAL-GATE] Generate and run eval suites for all prototypes`
  - Description: Generate 5-10 test cases per prototype (runtime, deterministic,
    integration, heuristic types). Run `bun test`. Classify failure modes by
    D/L/A domain. Write EvalSuite + FailureMode[] to eval-results.json.
    Notify evaluator with pass rates and failure summary.
  - blockedBy: [T7, T8]

**Wave 6 — Evaluation + Debate:**
- T10: `[EVALUATE] Apply R1-R15 gates + debate protocol`
  - Description: Read ALL ontology-state/ files including eval-results.json.
    Apply all 15 rejection criteria (R1-R13 + R14 Prototype Build + R15 Eval Pass Rate).
    If eval results trigger debate conditions (>20% pass rate difference,
    D/L/A misclassification, or new failure type), initiate debate protocol
    via SendMessage to simulator + ontologist. Max 2 debate rounds.
    Write gate result + debate rounds to decision-log.json and eval-results.json.
  - blockedBy: [T9]

**Wave 7 — Output (reporter, parallel):**
- T11: `[BLUEPRINT] Produce TechBlueprint JSON`
  - Description: Read all ontology-state/ files and evaluator acceptance.
    Write `ontology-state/blueprint.json` conforming to TechBlueprint type.
    Must include all required fields + eval results summary.
  - blockedBy: [T10]

- T12: `[REPORT] Produce 13-section final report`
  - Description: Write `reports/final-report.md` with ALL 13 sections.
    Include prototype results and eval findings in sections 8-9.
  - blockedBy: [T10]

---

## Phase 2: Execute T1 Directly (Lead Decomposition)

The Lead executes T1 without delegating:

1. Read the user's objective: "$ARGUMENTS"
2. Apply the orchestrator agent protocol from `.claude/agents/orchestrator.md`
3. Decompose into ProjectOntologyScope (backend domains + frontend surfaces)
4. Create 3-7 ResearchQuestions with D/L/A tags
5. Classify against DevCon 5 three-phase journey
6. Write to `ontology-state/decision-log.json`
7. Mark T1 as completed

---

## Phase 3: Spawn Teammates

Spawn all 7 teammates in a single message (parallel).

**Researcher** (Sonnet):
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
    CRITICAL: Check TaskList — do NOT claim tasks until blockedBy is empty.
    Your tasks are T2 and T3. Update ontology-state/source-map.json.
    Notify ontologist via SendMessage when done.
    The research objective is: $ARGUMENTS"
})
```

**Ontologist** (Sonnet):
```
Agent({
  description: "Ontology classification and world model",
  name: "ontologist",
  team_name: "kosmos-research",
  model: "sonnet",
  run_in_background: true,
  prompt: "You are the ontologist for Kosmos Agent Teams.
    Read .claude/agents/ontologist.md for your full protocol.
    CRITICAL: Check TaskList — do NOT claim T4 until T2+T3 are completed.
    Update ontology-state/world-model.json. Notify simulator when done.
    The research objective is: $ARGUMENTS"
})
```

**Simulator** (Sonnet):
```
Agent({
  description: "Hypothesis testing and scenario generation",
  name: "simulator",
  team_name: "kosmos-research",
  model: "sonnet",
  run_in_background: true,
  prompt: "You are the simulator for Kosmos Agent Teams.
    Read .claude/agents/simulator.md for your full protocol.
    CRITICAL: Check TaskList — do NOT claim T5 until T4 is completed.
    Score all 11 dimensions. Reference docs/scoring-rubric.md.
    Update ontology-state/scenarios.json. Notify prototyper when done.
    The research objective is: $ARGUMENTS"
})
```

**Prototyper** (Sonnet — worktree isolation):
```
Agent({
  description: "Hypothesis prototype implementation",
  name: "prototyper",
  team_name: "kosmos-research",
  model: "sonnet",
  run_in_background: true,
  prompt: "You are the prototyper for Kosmos Agent Teams.
    Read .claude/agents/prototyper.md for your full protocol.
    CRITICAL: Check TaskList — do NOT claim T7/T8 until T6 is completed.
    Implement PoC code in prototype/ directory for each hypothesis.
    Write PrototypeResult to ontology-state/eval-results.json.
    Notify eval-runner when done.
    The research objective is: $ARGUMENTS"
})
```

**Eval Runner** (Sonnet):
```
Agent({
  description: "Eval suite generation and execution",
  name: "eval-runner",
  team_name: "kosmos-research",
  model: "sonnet",
  run_in_background: true,
  prompt: "You are the eval-runner for Kosmos Agent Teams.
    Read .claude/agents/eval-runner.md for your full protocol.
    CRITICAL: Check TaskList — do NOT claim T9 until T7+T8 are completed.
    Generate and run test suites. Classify failure modes by D/L/A domain.
    Write EvalSuite + FailureMode to ontology-state/eval-results.json.
    Notify evaluator when done.
    The research objective is: $ARGUMENTS"
})
```

**Evaluator** (Opus — adversarial quality gate + debate):
```
Agent({
  description: "Adversarial quality gate R1-R15 + debate",
  name: "evaluator",
  team_name: "kosmos-research",
  model: "opus",
  run_in_background: true,
  prompt: "You are the evaluator for Kosmos Agent Teams.
    Read .claude/agents/evaluator.md for your full protocol.
    CRITICAL: Check TaskList — do NOT claim T10 until T9 is completed.
    Apply ALL 15 rejection criteria (R1-R15). If debate conditions
    are triggered, initiate debate via SendMessage to simulator + ontologist.
    Max 2 debate rounds. On acceptance, notify reporter.
    The research objective is: $ARGUMENTS"
})
```

**Reporter** (Sonnet):
```
Agent({
  description: "Blueprint and report production",
  name: "reporter",
  team_name: "kosmos-research",
  model: "sonnet",
  run_in_background: true,
  prompt: "You are the reporter for Kosmos Agent Teams.
    Read .claude/agents/reporter.md for your full protocol.
    CRITICAL: Check TaskList — do NOT claim T11/T12 until T10 is completed.
    Produce ontology-state/blueprint.json and reports/final-report.md.
    Include prototype and eval results in the report.
    The research objective is: $ARGUMENTS"
})
```

---

## Phase 4: Monitor and Coordinate

While teammates work, the Lead:

1. **Polls TaskList** periodically to track progress
2. **Handles messages** from teammates (especially debate and evaluator feedback)
3. **Resolves cross-agent conflicts** (e.g., debate deadlocks)
4. **Fixes cross-cutting issues** (shared state inconsistencies)
5. **Does NOT duplicate** teammate work
6. **Enforces dependency order** — if an agent claims a blocked task,
   SendMessage to stop and wait

---

## Phase 5: Synthesize and Teardown

After all 12 tasks are completed:

1. **Read the final outputs**:
   - `ontology-state/blueprint.json`
   - `ontology-state/eval-results.json`
   - `reports/final-report.md`
2. **Synthesize** a concise decision-support summary including:
   - Which hypothesis won and why (eval evidence, not just theory)
   - Prototype validation results (pass rates, failure modes)
   - Debate outcomes (if any)
3. **Shutdown teammates**: SendMessage shutdown_request to each
4. **Clean up**: TeamDelete()
5. **Present to user**: TechBlueprint summary + eval highlights + link to report

---

## Key Rules

- The Lead coordinates but does NOT do the agents' work (except T1)
- Agents MUST check TaskList before claiming — strict dependency enforcement
- The evaluator is the ONLY agent that can approve the pipeline
- Maximum 2 evaluator feedback loops / 2 debate rounds
- All state flows through ontology-state/ files — this is the shared world model
- The TaskCompleted hook (`team-phase-gate.ts`) validates state files at each phase
- Prototypes are disposable — they prove/disprove, then are deleted
- Every failure mode MUST have a D/L/A domain classification

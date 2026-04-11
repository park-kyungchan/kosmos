# INDEX.md — Kosmos Project Structure Reference

> Structural map for AI agents. For query-based navigation, use BROWSE.md instead.

## Directory Layout

```
kosmos/
├── CLAUDE.md              ← Claude Code per-turn instructions (authority)
├── AGENTS.md              ← Codex-native per-turn instructions
├── GEMINI.md              ← Gemini-native per-turn instructions
├── BROWSE.md              ← AI agent query interface (start here)
├── INDEX.md               ← This file (structural reference)
├── schemas/
│   ├── types.ts           ← 17 core types + TechBlueprint (SSoT for vocabulary)
│   ├── validators.ts      ← Runtime type guards + lifecycle validators
│   └── index.ts           ← Re-exports
├── ontology-state/        ← Shared world model (agents read/write during pipeline)
│   ├── decision-log.json  ← Decomposition, routing, evaluator gate result
│   ├── world-model.json   ← D/L/A/Security/Learn classified objects
│   ├── source-map.json    ← Retrieved sources with provenance + tier
│   ├── scenarios.json     ← Hypothesis testing, 10-dimension scores
│   └── blueprint.json     ← Final TechBlueprint output
├── docs/
│   ├── scoring-rubric.md  ← Evaluation dimensions 1-7 definitions
│   ├── architecture.md    ← System architecture overview
│   ├── ontology-mapping-rules.md  ← D/L/A classification rules
│   ├── simulation-methodology.md  ← Scenario generation protocol
│   ├── browse-workflow.md         ← Internal browse protocol
│   ├── governance-security.md     ← Security/governance model
│   ├── setup.md                   ← Environment setup
│   └── benchmark-workflow.md      ← Research benchmark protocol
├── reports/               ← Generated research outputs
│   ├── final-report.md    ← 13-section research report (latest)
│   └── *.md               ← Scenario matrices, tradeoff analyses
├── .claude/
│   ├── settings.json      ← Hooks (8) + env vars + Agent Teams flag
│   ├── agents/            ← 6 custom agent definitions
│   │   ├── orchestrator.md  (legacy — Lead handles directly)
│   │   ├── researcher.md    (Sonnet — evidence gathering)
│   │   ├── ontologist.md    (Opus — D/L/A classification)
│   │   ├── simulator.md     (Opus — hypothesis testing)
│   │   ├── evaluator.md     (Opus — R1-R13 quality gate)
│   │   └── reporter.md      (Sonnet — blueprint + report)
│   ├── hooks/             ← 8 enforcement hooks (TypeScript + Bun)
│   │   ├── inject-prior-state.ts         (SessionStart)
│   │   ├── enforce-browse-protocol.ts    (PreToolUse: Grep|Read)
│   │   ├── normalize-research-question.ts (PreToolUse: Agent)
│   │   ├── post-subagent-worldmodel-check.ts (PostToolUse: Agent)
│   │   ├── validate-agent-output.ts      (PostToolUse: Agent)
│   │   ├── reinject-state-after-compact.ts (PostCompact)
│   │   ├── validate-stop.ts             (Stop)
│   │   └── team-phase-gate.ts           (TaskCompleted — Agent Teams)
│   └── skills/
│       └── kosmos-research/
│           └── SKILL.md   ← /kosmos-research — launches Agent Teams pipeline
├── package.json           ← TypeScript + Bun only
└── tsconfig.json
```

## Authority Chain

```
schemas/types.ts (type vocabulary — SSoT)
  → schemas/validators.ts (runtime guards)
  → .claude/agents/*.md (agent protocols)
  → ontology-state/*.json (shared runtime state)
  → reports/*.md (generated outputs)
```

Higher layers win when there's a conflict. Types define what exists;
agents define how to reason about it; state captures current reality.

## Agent Teams Pipeline (9-Task DAG)

```
T1: [INTAKE] ──→ T2,T3: [RESEARCH] ──→ T4: [ONTOLOGY]
                                              ↓
                    T5: [HYPOTHESIS] ──→ T6: [SIMULATION]
                                              ↓
                              T7: [EVALUATE] ──→ T8,T9: [BLUEPRINT,REPORT]
```

Each wave is blocked until the previous wave completes.
TaskCompleted hook (`team-phase-gate.ts`) validates state files between waves.

## Provenance Tags

All claims in ontology-state/ and reports/ use these tags:
- `[Official]` — direct from source (Palantir docs, vendor docs, specs)
- `[Synthesis]` — derived from multiple [Official] sources
- `[Inference]` — reasoning chain from evidence to conclusion

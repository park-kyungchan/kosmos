# INDEX.md — Kosmos Project Structure Reference

> Structural map for AI agents. For query routing, start with `BROWSE.md`.

## Directory Layout

```text
kosmos/
├── CLAUDE.md              ← Claude-native thin overlay
├── AGENTS.md              ← Codex-native thin overlay
├── GEMINI.md              ← Gemini-native thin overlay when present
├── BROWSE.md              ← Query router (start here)
├── INDEX.md               ← This file (structure reference)
├── schemas/
│   ├── types.ts           ← Repo-local vocabulary + TechBlueprint schema
│   ├── validators.ts      ← Runtime guards + lifecycle validators
│   └── index.ts           ← Re-exports
├── ontology-state/
│   ├── decision-log.json  ← Decomposition, routing, evaluator verdicts
│   ├── world-model.json   ← D/L/A/S/LEARN classified objects
│   ├── source-map.json    ← Retrieved sources + provenance
│   ├── scenarios.json     ← Hypothesis testing results
│   ├── eval-results.json  ← Prototype + eval outcomes
│   └── blueprint.json     ← Final TechBlueprint output
├── docs/
│   ├── scoring-rubric.md
│   ├── architecture.md
│   ├── ontology-mapping-rules.md
│   ├── simulation-methodology.md
│   ├── browse-workflow.md
│   ├── governance-security.md
│   ├── setup.md
│   └── benchmark-workflow.md
├── reports/
│   ├── final-report.md    ← Current main research report
│   ├── phase-b-plan.md    ← Home-fleet v1 migration plan artifact
│   ├── scenario-matrix.md / tradeoff-analysis.md / next-experiments.md
│   └── benchmark-* / universalization-* outputs
├── prototype/
│   ├── h-a/, h-b/         ← Research prototypes
│   └── tests/             ← Eval suites for prototype claims
├── tools/
│   └── create-palantir-project/
│       ├── index.ts       ← Project scaffolder
│       └── templates/     ← CLAUDE/AGENTS + ontology + RBAC templates
├── .claude/
│   ├── settings.json      ← Hook registration + env
│   ├── agents/            ← 8 project agents
│   │   ├── orchestrator.md
│   │   ├── researcher.md
│   │   ├── ontologist.md
│   │   ├── simulator.md
│   │   ├── prototyper.md
│   │   ├── eval-runner.md
│   │   ├── evaluator.md
│   │   └── reporter.md
│   ├── hooks/             ← 8 project-specific hooks + 6 delegated to palantir-mini plugin v1.3
│   └── skills/
│       └── kosmos-research/
│           └── SKILL.md   ← Main research pipeline entrypoint
├── package.json           ← Current checkout still pins claude-schemas v0.2.1
└── tsconfig.json
```

## Authority Chain

```text
~/.claude/research/palantir/
  -> ~/.claude/schemas/ontology/
  -> ~/ontology/shared-core/
  -> kosmos/schemas/*
  -> ontology-state/*.json
  -> reports/*.md
```

- `~/ontology/shared-core/` is the higher home-layer authority for cross-project primitives.
- `kosmos/schemas/*` is the repo-local vocabulary authority for this checkout.
- `ontology-state/*` and `reports/*` are runtime research artifacts produced by the pipeline.

## Current-vs-Target Distinction

- Current checked-in repo fact: `package.json` still pins `@palantirKC/claude-schemas#v0.2.1`.
- Home control-plane target state: `~/ontology/shared-core/`, `palantir-mini v1.0`, and the W5/W6 migration surface documented in `~/REBUILD-2026-04.md`.
- Historical plans or research outputs may describe the target state before or after implementation. Use them as evidence, not as automatic truth about this checkout.

## Pipeline Surfaces

- Lead entrypoint: `.claude/skills/kosmos-research/SKILL.md`
- Agent protocols: `.claude/agents/*.md`
- Hook enforcement: `.claude/settings.json` + `.claude/hooks/*.ts`
- Primary runtime state: `ontology-state/*.json`
- Final outputs: `reports/*.md`

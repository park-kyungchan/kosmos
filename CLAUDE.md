# CLAUDE.md — Kosmos Runtime Overlay

## Project Role
- Kosmos is the ontology-first technical research engine for producing a `TechBlueprint` plus report artifacts.
- Keep this file thin. Project truth lives in `BROWSE.md`, `INDEX.md`, `schemas/`, `ontology-state/`, `docs/`, and code.
- `ontology-state/*.json` and `reports/*.md` are research outputs, not casual scratch files. Edit them only when rerunning the research pipeline or when the user explicitly asks for output changes.
- Some files, especially `reports/phase-b-plan.md`, describe a target-state migration for the wider home fleet. Treat those as plans, not as the current checked-in runtime of this repo.

## Working Order
- Start with `BROWSE.md`, then `INDEX.md`.
- Read only the minimum local authority files needed for the current question.
- Use `~/.claude/research/BROWSE.md` for Palantir retrieval rather than broad scanning.

## Authority Chain

```text
~/.claude/research/palantir/
  -> ~/.claude/schemas/ontology/
  -> ~/ontology/shared-core/            (home shared layer for cross-project primitives)
  -> kosmos/schemas/*
  -> ontology-state/*.json
  -> reports/*.md
```

- `package.json` still pins `@palantirKC/claude-schemas#v0.2.1`; that is the checked-in consumer state for this repo.
- Cross-project ontology guidance still flows from the higher home layer (`~/ontology/shared-core/`) when the task is alignment or migration work.

## Current Runtime Notes
- `.claude/agents/*.md` and `.claude/hooks/*.ts` are project-local runtime assets. Read them when you need exact pipeline behavior.
- Respect agent frontmatter when spawning or mirroring the pipeline. Do not pass separate model overrides unless the project explicitly changes that contract.
- `kosmos-research` is the main project skill. Plugin-provided palantir-mini skills remain authoritative for init/codegen/verify/register flows.

## Edit Guardrails
- Do not normalize historical Phase A outputs merely to match newer home-repo vocabulary.
- Prefer repairing navigation docs and scaffolding templates before changing stored research outputs.
- Keep runtime-native docs thin and defer detailed semantics to local authority files.

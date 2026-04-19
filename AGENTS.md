# AGENTS.md — Kosmos Runtime Overlay

## Project Role
- Kosmos is the ontology-first research engine that produces `TechBlueprint` JSON plus report artifacts.
- Treat `schemas/types.ts` and `schemas/validators.ts` as the repo-local schema authority for Kosmos vocabulary.
- Treat `ontology-state/*.json` and `reports/*.md` as pipeline artifacts. Update them only when rerunning the research pipeline or when the user explicitly asks to edit research outputs.
- Some files describe target-state migrations for the wider home fleet, especially `reports/phase-b-plan.md` and parts of `ontology-state/`. Do not confuse those plans with the checked-in runtime state of this repo.

## Working Order
- Start with `BROWSE.md`, then `INDEX.md`.
- Read only the minimum local authority files needed next: `schemas/types.ts`, `schemas/validators.ts`, the relevant `ontology-state/*`, and the relevant docs.
- Use `~/.claude/research/BROWSE.md` for Palantir retrieval instead of broad scans.

## Authority Chain

```text
~/.claude/research/palantir/
  -> ~/.claude/schemas/ontology/
  -> ~/ontology/shared-core/            (home shared layer for cross-project primitives)
  -> kosmos/schemas/*
  -> ontology-state/*.json
  -> reports/*.md
```

- `package.json` still pins `@palantirKC/claude-schemas#v0.2.1`; that is a checked-in consumer fact for this repo, not the home control-plane target state.
- When the task is "what is true in this checkout?", the checked-in files win.
- When the task is cross-project ontology alignment, the higher home layer wins.

## Current Runtime Notes
- The current repo contains 8 agent definitions, 8 project-specific hooks + 6 delegated to palantir-mini plugin v1.3, and 1 project skill: `.claude/skills/kosmos-research/SKILL.md`.
- Respect agent frontmatter when reading or mirroring the pipeline. Do not invent separate model overrides; kosmos PR #12 made the `.md` frontmatter authoritative.
- Use installed plugin-provided palantir-mini workflows (`pm-init`, `pm-codegen`, `pm-verify`, `pm-ontology-register`, `palantir-dispatch`) instead of assuming deleted project-local stubs still exist.

## Editing Rules
- Do not rewrite historical Phase A artifacts just to match newer home-repo terminology.
- Prefer fixing browse/index/native-entry docs and templates before touching stored research outputs.
- If a scaffolding change affects Claude-facing instructions, update the Codex-facing template in the same pass so both runtimes stay aligned.

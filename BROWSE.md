# BROWSE.md — Kosmos Project Query Interface

> Start here. Use this file for query routing instead of scanning the repo blindly.

## Quick Recipes

### "What does this project do?"
Read: `AGENTS.md` or `CLAUDE.md` (first 30 lines)

### "How does the research pipeline work?"
Read: `.claude/skills/kosmos-research/SKILL.md`
Then: the relevant `.claude/agents/*.md` files for the phase you are touching

### "What types exist?"
Read: `schemas/types.ts` — repo-local vocabulary + `TechBlueprint`

### "How are types validated?"
Read: `schemas/validators.ts`
Key guards: `isBlueprintReady()`, `isCompleteRecommendation()`, `isScenarioReportReady()`

### "What agents exist and what do they do?"
Read: `.claude/agents/` — 8 agent definitions
Key pipeline agents: `researcher`, `ontologist`, `simulator`, `prototyper`, `eval-runner`, `evaluator`, `reporter`
Lead-facing decomposition contract: `orchestrator`

### "How do agents coordinate?"
Read: `.claude/skills/kosmos-research/SKILL.md` for the task DAG
Then: `.claude/hooks/validate-teammate-comms.ts`, `auto-shutdown-completed.ts`, `lead-inbox-monitor.ts`

### "What hooks enforce quality?"
Read: `.claude/settings.json` — 8 project-specific hooks + 6 delegated to palantir-mini plugin v1.3 (teammate-idle, task-completed-gate, subagent-stop, subagent-start, user-prompt-submit, session-start + new governance hooks)
Note: 5 previously-listed hooks moved into plugin v1.1 and stayed at plugin level (not local).
Key local hooks:
- `enforce-browse-protocol.ts` — blocks bad retrieval flow
- `task-completed-gate.ts` — validates phase transitions (renamed from team-phase-gate in plugin v1.1+)
- `enforce-file-ownership.ts` — guards write scope
- `event-log-emit.ts` — appends lineage events
- `validate-stop.ts` — blocks incomplete session stop

### "What is the current research state?"
Read in order:
1. `ontology-state/decision-log.json`
2. `ontology-state/world-model.json`
3. `ontology-state/source-map.json`
4. `ontology-state/scenarios.json`
5. `ontology-state/eval-results.json`
6. `ontology-state/blueprint.json`

### "What is the current migration context?"
Read: `reports/phase-b-plan.md`
Then: `~/REBUILD-2026-04.md` and `~/ontology/BROWSE.md`
Important: these describe the wider home-fleet target state, not necessarily this repo's checked-in runtime

### "What shared primitives exist outside kosmos?"
Read: `~/ontology/BROWSE.md`
Then: `~/ontology/shared-core/index.ts`

### "What design and scoring rules apply?"
Read: `docs/scoring-rubric.md`, `docs/ontology-mapping-rules.md`, `docs/simulation-methodology.md`

### "How do I launch a research session?"
Use: `/kosmos-research "your objective here"`

## Do NOT

- Do NOT scan all files in `~/.claude/research/palantir/` — use its `BROWSE.md`
- Do NOT treat `reports/phase-b-plan.md` or historical `ontology-state/*` text as the same thing as current checked-in runtime facts
- Do NOT edit `ontology-state/` or `reports/` casually; they are research artifacts
- Do NOT bypass `~/ontology/shared-core` when looking for cross-project primitives
- Do NOT assume deleted user-scope `pm-*` stubs still exist

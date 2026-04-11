# BROWSE.md — Kosmos Project Query Interface

> For AI agents entering this codebase. Start here, not by scanning everything.

## Quick Recipes

### "What does this project do?"
Read: `CLAUDE.md` (first 30 lines)

### "How does the research pipeline work?"
Read: `CLAUDE.md` > Research Pipeline section
Then: `.claude/skills/kosmos-research/SKILL.md` for Agent Teams execution

### "What types exist?"
Read: `schemas/types.ts` — 17 core types + TechBlueprint

### "How are types validated?"
Read: `schemas/validators.ts` — runtime guards + lifecycle validators
Key: `isBlueprintReady()`, `isCompleteRecommendation()`, `isScenarioReportReady()`

### "What agents exist and what do they do?"
Read: `.claude/agents/` directory — 6 agent definitions
Key agents for Agent Teams: researcher, ontologist, simulator, evaluator, reporter
Legacy: orchestrator (Lead now handles this directly)

### "How do agents communicate?"
Read: `.claude/skills/kosmos-research/SKILL.md` > Phase 3: Spawn Teammates
Pattern: researcher → ontologist → simulator → evaluator → reporter via SendMessage

### "What hooks enforce quality?"
Read: `.claude/settings.json` > hooks section — 8 hooks across 6 event types
Key: `team-phase-gate.ts` (TaskCompleted) validates phase gates for Agent Teams

### "What is the current research state?"
Read (in order):
1. `ontology-state/decision-log.json` — decomposition + routing decisions
2. `ontology-state/world-model.json` — D/L/A classified objects
3. `ontology-state/source-map.json` — retrieved sources + claims
4. `ontology-state/scenarios.json` — hypothesis testing results
5. `ontology-state/blueprint.json` — final TechBlueprint output

### "What are the evaluation criteria?"
Read: `docs/scoring-rubric.md` — 7 scoring dimensions (1-7)
Then: `.claude/agents/simulator.md` — dimensions 8-10 (D/L/A Fit, ForwardProp, Agent Composability)
Then: `.claude/agents/evaluator.md` — R1-R13 rejection criteria

### "How do I launch a research session?"
Use: `/kosmos-research "your objective here"`
This spawns 5 Agent Teams teammates with a 9-task DAG pipeline.

### "What design principles apply?"
Grep: `§DC5` in `~/.claude/research/palantir/platform/devcon.md`
Key: DDD, DRY, OCP, PECS — applied per agent protocol in `.claude/agents/*.md`

---

## Do NOT

- Scan all files in `~/.claude/research/palantir/` — use BROWSE.md recipes
- Read `node_modules/` — only `typescript` is installed
- Edit `ontology-state/` files without understanding the pipeline stage ownership
- Skip the evaluator gate — R1-R13 are hard requirements

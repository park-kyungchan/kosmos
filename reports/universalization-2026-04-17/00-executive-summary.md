# Universalization Blueprint — Executive Summary

> Session: `kosmos-research-2026-04-17-universalization`
> Generated: 2026-04-17 | Status: Blueprint-first (implementation deferred)
> Scope: `~/.claude/research/`, `~/.claude/schemas/`, `~/.claude/rules/`, MEMORY, Skills, palantir-mini v2
> Projects: `~/kosmos`, `~/palantir-math`, `~/mathcrew` + new-project template
> Authority chain: `research → schemas → project ontology → contracts → runtime`

---

## User Objective (6 parts)

1. **PR review** across `~/kosmos`, `~/palantir-math`, `~/mathcrew`
2. **Update `~/.claude/research/`** contents + `BROWSE.md`/`INDEX.md` per directory
3. **Improve `~/.claude/schemas/`** (ontology, interaction, meta, rendering)
4. **Mirror Palantir AIP/Foundry/Maven** real implementations
5. **Optimize for Claude Code Native Runtime** (v2.1.110)
6. **palantir-mini v2** — universal adoption across all 3 core projects + bootstrap template for new projects
7. (Added mid-session) **Improve `~/.claude/rules/`**, MEMORY (4 locations), skills via `/skill-creator`

---

## Deliverable Map (this session)

| # | File | Purpose |
|---|------|---------|
| 00 | `00-executive-summary.md` | **YOU ARE HERE** — entry point + decision summary |
| 01 | `01-current-state-audit.md` | PR review + research/schemas/rules/skills/memory inventory |
| 02 | `02-external-research-brief.md` | Palantir AIP/Foundry/Maven 2026 + CC v2.1.110 delta |
| 03 | `03-ontology-mapping-D-L-A.md` | Universalization domain model (DATA/LOGIC/ACTION/SECURITY/LEARN) |
| 04 | `04-competing-hypotheses.md` | 3 hypotheses + 11-dim scoring + adversarial scenarios |
| 05 | `05-recommended-architecture.md` | Winning hypothesis + full architecture (H-A++) |
| 06 | `06-research-BROWSE-INDEX-spec.md` | BROWSE.md/INDEX.md hierarchy spec for `~/.claude/research/` |
| 07 | `07-schemas-v2-spec.md` | `~/.claude/schemas/` v2 upgrade spec (all 4 axes) |
| 08 | `08-palantir-mini-v2-spec.md` | palantir-mini v2 + universal adoption (3 projects + template) |
| 09 | `09-rules-memory-skills-spec.md` | Rules v2 (11 files) + MEMORY schema + skill-creator updates |
| 10 | `10-pr-roadmap.md` | 12-PR executable roadmap for follow-up implementation session |
| 11 | `11-risks-and-reversal.md` | Risks, unknowns, what-would-change-the-decision |
| 12 | `12-blueprint.json` | Machine-readable TechBlueprint (conforms to `schemas/types.ts`) |
| 13 | `13-evaluator-gate.md` | R1–R15 gate result (self-assessed, Lead-direct) |

---

## Recommended Architecture — H-A++ (compound winner)

Three reinforcing layers:

### Layer 1 — `palantir-mini` as Claude Code Plugin Marketplace (Maven-mirror)

- **Package** palantir-mini as an installable Claude Code plugin via `.claude-plugin/marketplace.json`
- Add the palantir-mini marketplace to user scope via `/plugin marketplace add ~/.claude/plugins/palantir-mini`
- Install the plugin via `/plugin install palantir-mini@palantir-mini-marketplace`
- Plugin manifest declares `mcpServers` → registers `palantir-mini` MCP server globally
- Outcome: `mcp__palantir-mini__*` tools available in **every** Claude Code session without per-project setup
- **Foundry parallel**: Foundry Marketplace distributes shared ontology artifacts across customer enterprises. We mirror this for Claude Code plugins.

### Layer 2 — `pm-init` CLI for per-project bootstrap (OSDK codegen mirror)

- `pm-init` skill runs `create-palantir-mini-project` codegen
- Installs `<project>/.palantir-mini/session/` directory tree
- Writes `<project>/.claude/managed-settings.d/50-palantir-mini.json` fragment
- Optionally generates `<project>/src/generated/` OSDK descenders from the project's `ontology/` dir
- **Foundry parallel**: OSDK codegen generates typed client packages from ontology metadata. Same pattern, smaller scale.

### Layer 3 — Event Log + Codegen Cross-Project Propagation

- Every project has `<project>/.palantir-mini/session/events.jsonl` (append-only)
- Plugin hooks emit events on ontology edits → trigger codegen → propagate to generated/
- `~/.claude/schemas/ontology/` becomes the **shared, versioned interface** across projects (versioned like a npm package)
- **Foundry parallel**: Palantir Decision Lineage 5-dim + Workflow Lineage. Same abstraction, filesystem-backed.

---

## Decision: ACCEPT H-A++ for follow-up implementation

**Evidence chain (3 axes)**:

| Axis | Evidence | Strength |
|------|----------|----------|
| Architectural convergence | Foundry Marketplace + OSDK codegen + Decision Lineage + Anthropic Managed Agents Session/Harness/Sandbox + OMC v4.11.6 all converge on the same pattern | HIGH |
| Empirical substrate proven | Prior session: H-A append-only event log won 0 lost / 2000 events at 2-writer race vs H-B 484 / 2000 (24.2%) — same substrate applies here | HIGH (prior art) |
| Reversibility | Plugin removal is single CLI command. No schema corruption. Existing projects continue running. | HIGH |

**Formal competitors preserved**:
- H-B: Global daemon (`~/.palantir-mini/`) — rejected for increased operational complexity
- H-C: Per-project opt-in only (no global marketplace) — rejected because requires repeated manual setup

---

## Risks (summary — full list in section 11)

| Risk | Severity | Mitigation |
|------|----------|------------|
| Plugin update wipes `${CLAUDE_PLUGIN_ROOT}` on `/plugin update` | HIGH | Keep events.jsonl in `${CLAUDE_PLUGIN_DATA}` or per-project | 
| MCP server registration via `mcpServers` in plugin.json not yet verified in v2.1.110 | MEDIUM | External researcher verifying; if broken, fall back to per-project `.mcp.json` |
| PR #7 merge conflict risk if this Blueprint changes brain-v2 wiring | MEDIUM | Merge PR #7 first, then layer universalization on top |
| `~/.claude/schemas/` shared across 3 projects without lockfile | MEDIUM | Git branches coordinate parallel Claude sessions (already decided in prior session) |

---

## Next Steps

1. **User reads this Blueprint** — section 05 for architecture, section 10 for PR roadmap
2. **User approves / redirects** — specific PRs or specs can be cherry-picked
3. **Follow-up session** executes PR roadmap (section 10) — 12 PRs across 4 repos + `~/.claude/`
4. **PR #7** (Brain v2) merged first, then universalization PRs layered on top

---

## Session Accounting

- Lead: Opus 4.7 (1M context), Lead-direct execution mode
- External researcher subagent spawned — gathers Palantir 2026 docs + CC v2.1.110 delta (see section 02)
- Tasks tracked: 14 tasks (T1–T14) — T1–T4 completed, T5–T14 Blueprint-only
- Events emitted: 2 to `kosmos/.palantir-mini/session/events.jsonl`
- Context budget used: well within 1M

---

## Citations

All citations throughout this Blueprint use provenance tags:
- **[Official]** — sourced directly from vendor docs (Anthropic, Palantir) or official git repos
- **[Synthesis]** — combined from multiple official sources into new conclusion
- **[Inference]** — reasoned from official evidence without direct doc confirmation (lowest confidence)

Where a file path is given without a URL, it refers to this repo or the global user config.

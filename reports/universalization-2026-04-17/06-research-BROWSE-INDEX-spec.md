# 06 — `~/.claude/research/` BROWSE.md / INDEX.md Hierarchy Spec

> Every research directory gets `BROWSE.md` (query router) + `INDEX.md` (structural reference). Gaps from section 01 get three new subdirs (`marketplace/`, `osdk/`, `decision-lineage/`) promoted from scattered evidence.

---

## 6.1 Goals

- **Query-first retrieval**: User/Claude opens `BROWSE.md` → picks ≤3 files → reads.
- **Provenance integrity**: Every marker tagged `[Official]` / `[Synthesis]` / `[Inference]`.
- **Route to palantir-mini**: Plugin is the production artifact — research must link to it.
- **Future-proof**: New evidence landing zones pre-declared (marketplace/, osdk/, decision-lineage/).

---

## 6.2 Top-Level `~/.claude/research/BROWSE.md` (patch)

Add the following routing table entries (keep existing content):

```markdown
| Question | Open First |
|----------|------------|
| How does palantir-mini work as a plugin? | `claude-code/plugin-system.md` (new) + `palantir/marketplace/BROWSE.md` (new) |
| What's the OSDK 2.0 pattern? | `palantir/osdk/BROWSE.md` (new) |
| What's the 5-dim Decision Lineage spec? | `palantir/decision-lineage/BROWSE.md` (new) |
| How do managed-settings.d fragments work? | `claude-code/features.md#managed-settings` |
```

Plus an **authority pointer**:

```markdown
## Production Plugin Reference
For the canonical implementation of patterns in this library:
→ `~/.claude/plugins/palantir-mini/` (live plugin)
→ `~/.claude/plugins/palantir-mini/README.md` (entry)
→ `~/.claude/plugins/palantir-mini/.claude-plugin/plugin.json` (manifest)
```

---

## 6.3 `~/.claude/research/palantir/` Structure

### Current (12 subdirs):
```
action  architecture  cross-cutting  data  entry  logic
philosophy  platform  security  ship-os  typescript  validation
```

### Target (15 subdirs — add 3):

| New subdir | Promoted from | Contains |
|------------|---------------|----------|
| `marketplace/` | `ship-os/` + `platform/` | Foundry Marketplace evidence + parallel to CC plugin marketplace |
| `osdk/` | `data/` + `logic/` + `typescript/` | OSDK 2.0 codegen, version pinning, typed client generation |
| `decision-lineage/` | `cross-cutting/` + `architecture/` | 5-dim event log, Workflow Lineage, replay semantics |

### Per-subdir `BROWSE.md` template

Every `palantir/*/BROWSE.md` follows:
```markdown
# {subdir} — Query Router

> Scope: {1-sentence scope statement}
> Authority: Evidence library; defers to ~/.claude/plugins/palantir-mini for production patterns.

## Common Questions

| Question | File | Key Markers |
|----------|------|-------------|
| ... | ... | [Official], [Synthesis], [Inference] |

## File Inventory

- `file1.md` — {one-line purpose} — provenance tags: {counts}
- ...

## Invariants
- Broad grep not allowed; use specific markers.
- Cite provenance on every claim extracted.
```

### Per-subdir `INDEX.md` template

```markdown
# {subdir} — Structural Reference

## Purpose
{why this subdir exists}

## Authority Boundary
{what this subdir does / does not cover}

## Subdirectory Tree
{listing with 1-line descriptions}

## Provenance Summary
{counts of [Official] / [Synthesis] / [Inference] markers}

## Cross-References
- → `sibling-subdir/` for {related topic}
- → `~/.claude/schemas/ontology/` for shared types
- → `~/.claude/plugins/palantir-mini/` for production
```

---

## 6.4 `~/.claude/research/claude-code/` Structure

### Current files:
```
agent-design-opinion  agent-system-design  edison-kosmos-analysis
features  gap-analysis-palantir-math  managed-agents
mathcrew-agent-blueprint  palantir-mini-blueprint
```

### Target — add 3 new files:

| New file | Content |
|----------|---------|
| `plugin-system.md` | Full v2.1.110+ plugin system: marketplace.json, plugin.json, mcpServers declaration, `${CLAUDE_PLUGIN_ROOT}` expansion, install/uninstall lifecycle |
| `mcp-server-registration.md` | Three paths to register MCP server: (a) user `~/.claude/mcp.json`, (b) project `.mcp.json`, (c) plugin-bundled declaration. Comparison table + RBAC implications |
| `hook-events-v2.md` | Full 27-hook-event catalog with signatures + enforcement vs advisory classification |

### Update `claude-code/BROWSE.md`

Add routing entries pointing to new files.

### Update `claude-code/features.md`

Stale — predates v2.1.110. Action: add "v2.1.110 additions" section listing 27 hooks, subagent frontmatter fields (`memory`, `mcpServers`, `initialPrompt`, `isolation`).

---

## 6.5 `~/.claude/research/interaction/` Structure

### Purpose
Gesture primitives, pointer/touch events, component/element interaction semantics.

### Gaps (need audit)
- Whether `BROWSE.md` / `INDEX.md` currently exist (assumed not).
- Whether content is up-to-date with `~/.claude/schemas/interaction/` (assumed partial sync).

### Action
- Create minimal `BROWSE.md` (routes to schemas/interaction if research is thin).
- Create `INDEX.md` declaring authority boundary: evidence source, not contract source.

---

## 6.6 `~/.claude/research/palantir-learn/` Structure

### Status: **ARCHIVED SESSION STATE (v0.8)**

Contains a frozen snapshot from an older session. Do not modify unless user explicitly requests.

### Action
- Add/update `BROWSE.md` with single rule: "This is archived. Do not retrieve for current work."
- Add `INDEX.md` with restoration instructions if archive ever needs to be re-opened.

---

## 6.7 `~/.claude/research/ptc/` Structure

### Status: **DEPRIORITIZED** — no active project references as of 2026-04-16.

### Action
- Add `BROWSE.md` with rule: "Deprioritized. Only retrieve if a PTC project activates."
- Leave content in place; do not delete (may return).

---

## 6.8 `~/.claude/research/skills/` Structure

### Purpose
Reference for internal skills: how they're built, audited, versioned.

### Target content
- `skill-frontmatter.md` — required fields, optional fields, triggers syntax
- `skill-evals.md` — how to run skill-creator evals for benchmarking
- `BROWSE.md` / `INDEX.md` as template

---

## 6.9 New subdirectory detail: `palantir/marketplace/`

### `marketplace/BROWSE.md`

```markdown
# Palantir Marketplace + Claude Code Plugin Marketplace Evidence

## Common Questions
| Question | File |
|----------|------|
| How does Foundry Marketplace package ontology artifacts? | foundry-marketplace.md |
| What's the namespace/prefix rule? | foundry-prefix-install.md |
| How does CC plugin marketplace differ? | claude-plugin-marketplace.md |
| How is palantir-mini marketplace structured? | palantir-mini-marketplace.md |
```

### Files to populate

| File | Source | Provenance |
|------|--------|------------|
| `foundry-marketplace.md` | S-001, S-002 from section 02 | [Official] |
| `foundry-prefix-install.md` | S-003 from section 02 | [Official] |
| `claude-plugin-marketplace.md` | S-006 (code.claude.com docs) | [Official] |
| `palantir-mini-marketplace.md` | Our own plugin manifest | [Synthesis] |

---

## 6.10 New subdirectory detail: `palantir/osdk/`

### `osdk/BROWSE.md`

```markdown
# OSDK 2.0 Codegen + Version Pinning Evidence

## Common Questions
| Question | File |
|----------|------|
| How does OSDK 2.0 separate client from generated? | osdk-2.0-architecture.md |
| How is version pinning done? | osdk-version-pinning.md |
| What's the migration from 1.x? | osdk-1-to-2-migration.md |
| How does our pm-codegen differ? | pm-codegen-vs-osdk.md |
```

### Files

| File | Source | Provenance |
|------|--------|------------|
| `osdk-2.0-architecture.md` | S-004 | [Official] |
| `osdk-version-pinning.md` | S-005 | [Official] |
| `osdk-1-to-2-migration.md` | S-005 | [Official] |
| `pm-codegen-vs-osdk.md` | pm-codegen skill + S-004 | [Synthesis] |

---

## 6.11 New subdirectory detail: `palantir/decision-lineage/`

### `decision-lineage/BROWSE.md`

```markdown
# Decision Lineage + Workflow Lineage Evidence

## Common Questions
| Question | File |
|----------|------|
| What are the confirmed 3 dimensions? | decision-lineage-3-confirmed.md |
| What are the inferred 2 dimensions? | decision-lineage-2-inferred.md |
| How does Workflow Lineage differ? | workflow-lineage.md |
| Our 5-tuple binding | pm-events-5-dim.md |
```

### Files

| File | Source | Provenance |
|------|--------|------------|
| `decision-lineage-3-confirmed.md` | S-008 (Krishnaswamy blog 2024) | [Official] — when / atopWhich / throughWhich |
| `decision-lineage-2-inferred.md` | S-008 + governance inference | [Inference] — byWhom / withWhat |
| `workflow-lineage.md` | [Official] Foundry docs | [Official] |
| `pm-events-5-dim.md` | palantir-mini spec | [Synthesis] |

---

## 6.12 Summary

| Dir | New Files | New Subdirs | BROWSE/INDEX updates | Total Changes |
|-----|-----------|-------------|----------------------|----------------|
| `~/.claude/research/` (top) | 0 | 0 | 1 (patch BROWSE) | 1 |
| `palantir/` | 12 | 3 | 3 BROWSE + 3 INDEX per new subdir + 12 sibling updates | ~24 |
| `claude-code/` | 3 | 0 | 1 (patch BROWSE), 1 (patch features) | 5 |
| `interaction/` | 2 | 0 | 2 (create BROWSE + INDEX) | 2 |
| `palantir-learn/` | 1-2 | 0 | 1-2 (archive marker) | 2 |
| `ptc/` | 1-2 | 0 | 1-2 (deprioritize marker) | 2 |
| `skills/` | 2-3 | 0 | 2-3 (create BROWSE + INDEX + skill-frontmatter) | 3 |
| **Total** | **~22** | **3** | **~14** | **~39 file edits** |

This is the research-library portion of PR #R1 in the roadmap (section 10).

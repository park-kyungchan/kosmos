# 09 — Rules + MEMORY + Skills Overhaul Spec

> `~/.claude/rules/` gains 7 new files (04-05, 07-11). MEMORY gets a per-project schema. `/skill-creator` runs update all existing skills to cite rules + schema versions.

---

## 9.1 `~/.claude/rules/` Evolution

### Current 4 rules (keep, no change)

- `01-ontology-first-core.md` — meaning → ontology → contracts → runtime
- `02-research-retrieval.md` — BROWSE/INDEX-first
- `03-forward-backward-propagation.md` — forward/back propagation paths
- `06-agent-teams.md` — Lead-direct default

### New 7 rules

#### `04-runtime-boundary.md` (reserved slot, now filled)

Purpose: Claude, Codex, Gemini, Cursor are independent native runtimes. No cross-runtime memory, hook, or MCP assumption.

```markdown
# Runtime Boundary

- Claude-local overlay only. Other native runtimes do not inherit this file.
- Each runtime has its own hooks, memory, and tool contracts. Do not conflate.
- Detailed project semantics belong in project-local BROWSE.md / INDEX.md, ontology docs, tests, and code.
- Native runtime docs should stay thin.
- If content is applicable to both Claude and Codex, promote it to project-local docs — do not duplicate across runtime overlays.
```

#### `05-skill-invocation-order.md` (new)

Purpose: When multiple skills match a user utterance, order = plugin-scope > user-scope > repo-scope.

```markdown
# Skill Invocation Order

- Claude-local overlay only.
- When multiple skills match a user utterance:
  1. Plugin-scope skill (installed via /plugin install) wins.
  2. User-scope skill (~/.claude/skills/) is second.
  3. Repo-scope skill (<project>/.claude/skills/) is third.
- Override: user may specify skill explicitly via `/<plugin>:<skill>` form.
- During deprecation windows, user-scope pm-* skills delegate to plugin versions.
```

#### `07-plugins-and-mcp.md` (new)

```markdown
# Plugins and MCP Servers

- Claude-local overlay only.
- Prefer plugin-based distribution for cross-project tooling. Per-project .mcp.json is a fallback.
- Plugin manifest (plugin.json) is authoritative for MCP server registration.
- managed-settings.d/*.json in each project grants or denies MCP tool access.
- Do not register the same MCP server twice (plugin + project) — it confuses tool routing.
```

#### `08-schema-versioning.md` (new)

```markdown
# Schema Versioning

- Claude-local overlay only.
- ~/.claude/schemas/ is a semver-tracked, versioned interface (~npm package).
- Consumer projects pin schema version via peerDependencies.
- pm-verify blocks when consumer pin is incompatible with installed schema version.
- Every schema edit requires CHANGELOG entry + semver bump per 01/04.
```

#### `09-memory-schema.md` (new)

```markdown
# MEMORY Schema

- Claude-local overlay only.
- MEMORY.md is an index, not a memory. Each entry is one line under 150 chars.
- Memory files (user/feedback/project/reference) live as separate files per entry.
- When a memory could apply across projects, promote it to project-local docs — do not re-save in every project.
- Staleness: before acting on a memory that names a specific file/function/flag, verify existence.
```

#### `10-events-jsonl.md` (new)

```markdown
# events.jsonl Append-Only Log

- Claude-local overlay only.
- Every ontology-state edit emits an event BEFORE writing files.
- events.jsonl is append-only; never rewrite, truncate, or reformat.
- Every event has the 5 dimensions: when, atopWhich, throughWhich, byWhom, withWhat.
- PreCompact snapshots events.jsonl before compaction — ensures no events lost.
```

#### `11-codegen-authority.md` (new)

```markdown
# Codegen Authority

- Claude-local overlay only.
- Only pm-codegen (or equivalent generator) writes files under <project>/src/generated/.
- Generated files carry a header with schema version + ontology hash.
- Never edit a generated file by hand; regenerate instead.
- If you must override, add the override to ontology/ and regenerate — the override becomes input, not output.
```

### Rules index update

Top of each project's `CLAUDE.md` should optionally reference the rules:
```markdown
## Runtime Overlays
For runtime-specific rules, see ~/.claude/rules/*.md (Claude-local).
```

---

## 9.2 MEMORY Schema

### Four memory locations (recap from section 01)

1. `~/.claude/CLAUDE.md` — global Claude guardrails
2. `~/.claude/projects/<project>/memory/MEMORY.md` + per-memory files — auto-memory per project
3. `<project>/CLAUDE.md` — project-local guardrails
4. `<project>/.claude/memory/` (optional) — project-local auto-memory (rarely used)

### Schema for per-memory files (existing convention, now codified)

```markdown
---
name: {memory name}
description: {one-line description — used for relevance matching}
type: {user | feedback | project | reference}
---

{memory content}

For feedback/project types:
**Why:** {reason — often incident or preference}
**How to apply:** {when/where rule kicks in}
```

### Promotion rule

If a memory applies across ≥2 projects:
1. Promote the content to shared docs (`~/.claude/rules/` or `~/.claude/research/`)
2. Keep a short reference memory in each project pointing to the promoted location
3. Avoid copy-pasting the same memory into every project's MEMORY.md

### MEMORY.md index format (already codified in CLAUDE.md)

```markdown
# MEMORY.md — {project}

- [title](file.md) — one-line hook
- ...
```

Max 200 lines (truncated after) — forces curation.

---

## 9.3 /skill-creator Updates

### Goal

Run `/skill-creator` on the 12 existing user-scope skills + 7 plugin-scope skills to:

1. Add schema version pin in frontmatter.
2. Add rule citations (which rules this skill enforces).
3. Deduplicate overlapping triggers.
4. Add acceptance tests per skill.

### Affected skills

| Skill | Scope | Update |
|-------|-------|--------|
| `lsp-audit` | user | Add `requires: claude-schemas@0.2.x`, cite rule 08 |
| `orchestrate` | user | Cite rules 06 (teams) + 10 (events) |
| `palantir-walk` | user | Cite rule 02 (research retrieval) |
| `pm-action` | user + plugin | **DEPRECATE user-scope**; plugin wins per rule 05 |
| `pm-blueprint` | user + plugin | **DEPRECATE user-scope** |
| `pm-codegen` | user + plugin | **DEPRECATE user-scope**; add schema version handling |
| `pm-init` | user + plugin | **DEPRECATE user-scope**; harden idempotency |
| `pm-recap` | user + plugin | **DEPRECATE user-scope** |
| `pm-replay` | user + plugin | **DEPRECATE user-scope** |
| `pm-verify` | user + plugin | **DEPRECATE user-scope**; 4-phase pipeline |
| `ship` | user | Add rule 10 (events.jsonl snapshot before ship) |
| `tavily-cli` | user | No change (external tool wrapper) |

### Skill deprecation UX

User-scope pm-* skills stay for one release cycle with a frontmatter note:
```yaml
---
name: pm-init
deprecated: true
replacement: palantir-mini:pm-init
deprecation-note: >
  User-scope pm-init is deprecated. Plugin-scope version wins after /plugin install palantir-mini@0.2.0.
  This file will be removed in the next universalization cycle.
---
```

After plugin install + 1 release cycle, user-scope files can be deleted (PR #R-final in section 10).

---

## 9.4 New skill: `pm-diagnose` (proposed addition)

Not in current inventory but a gap — helps users debug when pm-* skills misbehave.

```yaml
---
name: pm-diagnose
description: Diagnose palantir-mini state across a project. Reports plugin install, RBAC fragment, schema pin, ontology health, event log integrity.
version: 0.2.0
---
```

### Output sections
- Plugin installed? What version?
- Per-project state? Fragment present?
- Schema pin matches installed?
- ontology/ vs generated/ in sync?
- Recent events.jsonl integrity?

Deferred to follow-up release (not part of v0.2.0).

---

## 9.5 /skill-creator Evals

Per `~/.claude/skills/` README: every skill change should run through `skill-creator` evals.

Eval checklist per skill:
- [ ] Trigger phrases cover ≥3 common user utterances
- [ ] Description under 150 chars
- [ ] Acceptance tests run successfully
- [ ] Frontmatter valid per skill-creator schema
- [ ] Deprecation window respected

---

## 9.6 Rules × Skills Cross-Reference

After universalization, every skill must cite ≥1 rule:

| Skill | Rules Cited |
|-------|-------------|
| `pm-init` | 01 (ontology-first), 07 (plugins+MCP), 08 (schema versioning) |
| `pm-codegen` | 01, 08, 11 (codegen authority) |
| `pm-verify` | 01, 03 (propagation), 08, 10 (events) |
| `pm-recap` | 02 (research), 10 |
| `pm-replay` | 10 |
| `pm-action` | 01, 10 |
| `pm-blueprint` | 01, 02, 03 |
| `ship` | 01, 10 |
| `orchestrate` | 06 (agent teams), 10 |
| `palantir-walk` | 02 |
| `lsp-audit` | 08, 11 |

This cross-reference is enforced by `skill-creator` eval.

---

## 9.7 MEMORY.md Sweep (cross-project cleanup)

### ~/.claude/projects/-home-palantirkc-kosmos/memory/MEMORY.md (current, 11 entries)

Actions:
- **Keep**: `brain-v2-upgrade`, `kosmos-agent-teams`, `edison-kosmos-reference` (kosmos-specific).
- **Promote to shared**: `feedback-hook-fields-v2`, `feedback-idle-cost-management`, `feedback-granular-agents-with-definitions`, `feedback-lazy-spawn-architecture`, `feedback-session-cleanup-protocol`, `feedback-research-over-codegen` — these are universally applicable.
- **Replace** promoted entries with a short reference memory: "See ~/.claude/rules/06-agent-teams.md for the canonical version."

### After sweep

Kosmos `MEMORY.md`: ~6 entries (3 kosmos-specific + 3 promoted references).
New `~/.claude/rules/06-agent-teams.md` additions — merge the universal patterns.

---

## 9.8 Summary

| Layer | Changes |
|-------|---------|
| `~/.claude/rules/` | +7 new files (04, 05, 07, 08, 09, 10, 11) |
| MEMORY | Schema codified; cross-project promotion sweep (~6 entries moved to rules) |
| Skills | 7 plugin-scope skills hardened; 7 user-scope pm-* marked deprecated; `pm-diagnose` deferred |
| Cross-ref | Every skill cites ≥1 rule; skill-creator evals enforce |

Bundled into PR #R4 (rules) and PR #R5 (skills) in section 10.

# 10 — Executable PR Roadmap

> 12 PRs across 4 repos + `~/.claude/`. Sequenced for minimum conflict and maximum reversibility.

---

## 10.1 Repo Matrix

| Repo | Branch Prefix | Trust Level |
|------|---------------|-------------|
| `~/kosmos` | `feat/univ-*` | Primary |
| `~/.claude/` (user config) | direct commits (gitfolder if wanted) | Config scope |
| `~/palantir-math` | `feat/univ-*` | Secondary |
| `~/mathcrew` | `feat/univ-*` | Secondary |

---

## 10.2 PR Sequence

### Preamble
**PR #7 (Brain v2) must merge first.** Everything below layers on top of the merged brain-v2 branch.

### PR #R1 — Research library restructuring (~/.claude/research/)

**Scope**: ~39 file edits per section 06.
- Top-level `BROWSE.md` patch
- 3 new subdirs in `palantir/` (`marketplace/`, `osdk/`, `decision-lineage/`)
- 3 new files in `claude-code/` (`plugin-system.md`, `mcp-server-registration.md`, `hook-events-v2.md`)
- Update `features.md` with v2.1.110 additions
- Add minimal BROWSE/INDEX to `interaction/`, `skills/`, archive markers to `palantir-learn/`, `ptc/`

**Files**: ~39 markdown files in `~/.claude/research/`
**Dependencies**: none (pure docs)
**Test criteria**: All BROWSE.md files have valid routing; all markers tagged; all cross-refs resolve.
**Rollback**: revert commit.
**Scope budget**: 1 commit ~800 LOC of markdown.

---

### PR #R2 — Schemas v2.0.0 upgrade (~/.claude/schemas/)

**Scope**: Per section 07.
- Add top-level `package.json`, `CHANGELOG.md`, `.manifest.json`
- `ontology/` — 5 new primitive files + codegen/manifest.ts + lineage/event-envelope.ts
- `interaction/` — RID binding + index.ts
- `meta/` — BROWSE, INDEX, 3 subdirs (identity, version, provenance), 6 files
- `rendering/` — perf envelope + index.ts

**Files**: ~24 files in `~/.claude/schemas/`
**Dependencies**: none (additive only — no v0.1 consumers break)
**Test criteria**: `bun tsc --noEmit` at top-level succeeds; `validate-all.ts` returns all-ok; no circular imports.
**Rollback**: revert (existing v0.1 consumers unaffected).
**Scope budget**: 1 commit ~1500 LOC of TypeScript.

---

### PR #R3 — palantir-mini plugin v0.2.0 (~/.claude/plugins/palantir-mini/)

**Scope**: Per section 08.
- Update `plugin.json` (add `mcpServers`, `compatibleSchemaVersions`, `requiresClaudeCodeVersion`)
- Bump `marketplace.json` plugin entry version to 0.2.0
- Hook scripts — add `${CLAUDE_PLUGIN_ROOT}` expansion tests
- Skill frontmatter — deprecation notes on user-scope duplicates
- New hook: `plugin-install.ts` (advisory, first-install UX)
- Tests: AT-01 through AT-14 from section 8.14

**Files**: ~15 files in `~/.claude/plugins/palantir-mini/`
**Dependencies**: R2 (plugin references schema v0.2.0)
**Test criteria**:
- AT-01/02: Plugin installs + MCP tools appear.
- AT-03–07: pm-init idempotency across 5 state classifications.
- AT-08/09: pm-codegen schema version binding.
- AT-10/11: pm-verify 4-phase pipeline.
- AT-13/14: Plugin uninstall/reinstall safe.
**Rollback**: Downgrade plugin version to 0.1.0; revert plugin.json.
**Scope budget**: 1 commit ~600 LOC.

---

### PR #R4 — Rules v2 (~/.claude/rules/)

**Scope**: Per section 09.
- Add 7 new rule files (04, 05, 07, 08, 09, 10, 11)
- Each under 20 lines, strictly Claude-local

**Files**: 7 new markdown files
**Dependencies**: none (pure policy docs)
**Test criteria**: All rules valid markdown; no rule contradicts existing 01-03/06.
**Rollback**: revert commit.
**Scope budget**: 1 commit ~200 LOC of markdown.

---

### PR #R5 — Skills hardening (~/.claude/skills/ + plugin skills)

**Scope**: Per section 09.3.
- Deprecate user-scope `pm-*` skills (frontmatter notes)
- Update plugin-scope `pm-*` skills with schema version + rule citations
- Update `lsp-audit`, `orchestrate`, `palantir-walk`, `ship` with rule citations

**Files**: ~19 skill files
**Dependencies**: R3 (plugin skills updated in tandem), R4 (rules must exist before skills cite them)
**Test criteria**: `skill-creator` eval passes for every skill; cross-references resolve.
**Rollback**: revert commit; undeprecate user-scope skills.
**Scope budget**: 1 commit ~400 LOC.

---

### PR #R6 — MEMORY.md sweep (~/.claude/projects/*/memory/)

**Scope**: Per section 09.7.
- Promote 6 cross-project memories to `~/.claude/rules/` (already done in R4)
- Replace promoted entries with 1-line reference stubs
- Update `MEMORY.md` index

**Files**: ~7 files in kosmos memory; check other projects for same patterns
**Dependencies**: R4 (rules must exist)
**Test criteria**: `MEMORY.md` index ≤ 200 lines; all pointer files still resolve.
**Rollback**: git restore memory dir.
**Scope budget**: 1 commit, mostly deletions.

---

### PR #K1 — ~/kosmos adopts v0.2.0 (inside ~/kosmos repo)

**Scope**: After plugin 0.2.0 is installed globally.
- `~/kosmos/CLAUDE.md` — update to reference v0.2.0 rules + schemas
- `~/kosmos/package.json` — add `peerDependencies.@palantirKC/claude-schemas: "0.2.x"`
- Run `pm-init --force` to refresh RBAC fragment
- Run `pm-codegen` to regenerate any stale generated files (if applicable)
- Update `.palantir-mini/session/events.jsonl` via pm-init event

**Files**: ~5 files in `~/kosmos/`
**Dependencies**: R2, R3 (schemas + plugin), R4, R5
**Test criteria**: `pm-verify` returns all-green; existing brain-v2 tests still pass.
**Rollback**: revert + re-run pm-init with v0.1.0 fragment.
**Scope budget**: 1 commit ~80 LOC.

---

### PR #M1 — ~/mathcrew adopts v0.2.0

**Scope**: Similar to K1.
- `~/mathcrew/CLAUDE.md` updated
- `~/mathcrew/package.json` schema pin
- Run `pm-init` (patches pin + RBAC schema if needed)
- If mathcrew has ontology/ → run `pm-codegen`

**Files**: ~4 files
**Dependencies**: R2, R3, R4, R5
**Test criteria**: `pm-verify` green; no regression in existing mathcrew tests.
**Rollback**: revert; downgrade pin.
**Scope budget**: 1 commit ~50 LOC.

---

### PR #PM1 — ~/palantir-math adopts v0.2.0

**Scope**: Similar to K1, with extra patching since palantir-math was partial.
- Write missing `.claude/managed-settings.d/50-palantir-mini.json` via pm-init
- Update `~/palantir-math/CLAUDE.md` (if exists)
- Schema pin in package.json
- Run pm-verify → expect fresh clean state

**Files**: ~4 files
**Dependencies**: R2, R3, R4, R5
**Test criteria**: `pm-verify` green; fragment valid; existing palantir-math tests still pass.
**Rollback**: revert; keep partial state (palantir-math falls back to pre-universalization state).
**Scope budget**: 1 commit ~60 LOC.

---

### PR #T1 — New-project template (tools/create-palantir-project/)

**Scope**: Scaffolding tool for any new project.
- `create-palantir-project` bun script
- Template files (package.json, tsconfig.json, ontology/README.md, .claude/managed-settings.d/50-palantir-mini.json, .palantir-mini/session/, CLAUDE.md with overlay template)
- README with usage

**Files**: ~10 template files + script
**Dependencies**: R2, R3, R4
**Test criteria**: Running the script on empty dir produces a working project; `pm-init` on it reports "already initialized".
**Rollback**: revert (script is standalone).
**Scope budget**: 1 commit ~300 LOC.

---

### PR #T2 — Deprecation cleanup (after 1 release cycle)

**Scope**: (Not for this session — for a follow-up after K1/M1/PM1 stabilize.)
- Remove user-scope `pm-*` skills (now deprecated)
- Remove old v0.1 references in any remaining CLAUDE.md files
- Consolidate any orphaned memory entries

**Deferred**: 1+ release cycle after K1/M1/PM1 merge.

---

### PR #T3 — Docs refresh (project-local)

**Scope**: Per-project doc updates that follow H-A++ landing.
- `~/kosmos/CLAUDE.md` — include version pin, reference rules 07–11
- `~/palantir-math/CLAUDE.md`, `~/mathcrew/CLAUDE.md` — same pattern
- Any top-level README updates

**Files**: ~6 files across 3 repos
**Dependencies**: K1, M1, PM1
**Test criteria**: Docs compile in each project; no broken links.
**Rollback**: revert per repo.
**Scope budget**: 1 commit per repo ~40 LOC each.

---

## 10.3 Dependency Graph

```
PR#7 (Brain v2) — merged first, prerequisite
  │
  ├─→ R1 (research restructuring) — parallel with R2/R3/R4
  ├─→ R2 (schemas v0.2) ─────────────────────────┐
  ├─→ R4 (rules)                                  │
  │        │                                      │
  │        └─→ R5 (skills, cites rules) ──┐       │
  │        └─→ R6 (memory sweep) ─────────┤       │
  │                                       │       │
  └─→ R3 (plugin v0.2, needs schemas) ←───┴───────┘
           │
           ├─→ K1 (kosmos adoption)
           ├─→ M1 (mathcrew adoption)
           └─→ PM1 (palantir-math adoption)
                    │
                    ├─→ T1 (new-project template)
                    ├─→ T3 (docs refresh)
                    │
                    └─→ T2 (deprecation cleanup, deferred)
```

Critical path: PR#7 → R2 → R3 → K1/M1/PM1 (4 sequential PRs minimum).

Total: 12 PRs (10 this session + T2, T3 follow-up). Parallelizable pairs: (R1, R4), (R5, R6 after R4).

---

## 10.4 Sequencing Table

| Wave | PRs | Can be parallel? |
|------|-----|------------------|
| 0 | PR #7 (brain v2) | — |
| 1 | R1 | parallel start |
| 1 | R2 | parallel start |
| 1 | R4 | parallel start |
| 2 | R3 (needs R2) | — |
| 2 | R5 (needs R3+R4) | — |
| 2 | R6 (needs R4) | parallel with R5 |
| 3 | K1 (needs R3+R5) | parallel with M1, PM1 |
| 3 | M1 | parallel |
| 3 | PM1 | parallel |
| 4 | T1 (needs K1/M1/PM1) | — |
| 4 | T3 (needs K1/M1/PM1) | parallel with T1 |
| 5+ | T2 (deferred) | — |

---

## 10.5 PR-by-PR Rollback Table

| PR | Rollback Command | Data Loss Risk |
|----|------------------|----------------|
| R1 | `git revert <R1>` | NO — pure docs |
| R2 | `git revert <R2>` | NO — v0.1 still valid; no consumers break |
| R3 | `git revert <R3>; /plugin install palantir-mini@0.1.0 --force` | NO — v0.1.0 still works; plugin root files preserved |
| R4 | `git revert <R4>` | NO — rules are advisory overlays |
| R5 | `git revert <R5>` | NO — deprecation-only; no delete yet |
| R6 | `git restore memory/` | LOW — promoted memories duplicated in rules |
| K1 | `git revert <K1>; pm-init --force (with v0.1 fragment)` | NO — `.palantir-mini/session/events.jsonl` preserved |
| M1 | Same as K1 | NO |
| PM1 | Same as K1 (partial state resumes) | NO |
| T1 | `git revert <T1>` | NO — standalone script |
| T2 | N/A — deferred | — |
| T3 | `git revert <T3>` | NO — docs |

---

## 10.6 Time Budget Estimate

| PR | Dev Time | Review Time |
|----|----------|-------------|
| R1 | 2h | 1h |
| R2 | 4h | 1h |
| R3 | 3h | 1h |
| R4 | 1h | 30min |
| R5 | 2h | 1h |
| R6 | 1h | 30min |
| K1 | 1h | 30min |
| M1 | 30min | 20min |
| PM1 | 45min | 20min |
| T1 | 2h | 1h |
| T3 | 1h | 30min |
| **Total** | **~18h** | **~8h** |

Can be compressed with parallel work: 3-4 sessions if Lead delegates to subagents via Agent Teams.

---

## 10.7 Acceptance Summary

After all 12 PRs land (excluding deferred T2):

- ✅ `/plugin install palantir-mini@0.2.0` registers MCP tools globally
- ✅ `pm-init` is idempotent across 5 state classifications
- ✅ `~/kosmos`, `~/palantir-math`, `~/mathcrew` all pass `pm-verify`
- ✅ Research library BROWSE.md-routable with ≤3-click depth
- ✅ Schemas v0.2 consumed by all 3 projects via peer pin
- ✅ Rules 04/05/07-11 exist and are cited by every skill
- ✅ Memory sweep reduces cross-project duplication by ~6 entries
- ✅ New project can be bootstrapped with `create-palantir-project`
- ✅ Every PR has a one-command rollback with no data loss

This is the follow-up session's deliverable.

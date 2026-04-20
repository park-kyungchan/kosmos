# Kosmos events.jsonl — Orphan Event Reconciliation

**Date**: 2026-04-20
**Phase**: B3 Track D
**Plugin version**: palantir-mini v1.6.1

## Background

During Phase A research pipeline on 2026-04-17 (kosmos session `0dff144d-b4e9-4930-802a-e61934d0d85f`), 13 ontology-state Write/Edit operations were logged by an older tool-level post-hook that wrote short-form event records without 5-dim Decision Lineage envelopes. These records appear in `kosmos/.palantir-mini/session/events.jsonl` at lines 17, 20, 24, 27, 28, 31, 32, 35, 37, 39, 40, 41, 44.

**Orphan shape** (short form — missing `eventId`, `sequence`, `atopWhich`, `throughWhich`, `byWhom`):
```json
{"timestamp":"...","type":"ontology_edit","agent":"unknown","session_id":"0dff144d-...","tool":"Write","file":"...","summary":"..."}
```

## Root cause

`scripts/log.ts#projectRoot()` resolved via `PALANTIR_MINI_PROJECT || process.cwd()` — single-project routing. When the Phase A research Lead orchestrator spawned agents that cd'd into kosmos, a legacy tool post-hook wrote 13 short-form lines to kosmos's events.jsonl bypassing the proper 5-dim `emit()` helper. Parent `/home/palantirkc/.palantir-mini/session/events.jsonl` received zero kosmos references.

## Reconciliation approach

Per rule 10 (append-only immutability), the orphan lines in kosmos events.jsonl are **NOT rewritten**. Instead, an additive `orphan_event_reconciled` event is appended to the PARENT palantirkc events.jsonl for each orphan. Each reconciliation event carries:

- `orphanRef.file`: kosmos events.jsonl relative path
- `orphanRef.line_offset`: 0-indexed line position in kosmos file
- `orphanRef.original_line`: the verbatim JSON string of the orphan
- `reconciled.when`: synthesized from orphan's `timestamp`
- `reconciled.atopWhich`: best-effort git commit SHA active at timestamp
- `reconciled.throughWhich`: `{sessionId: 0dff144d-..., toolName: orphan.tool, cwd: /home/palantirkc/kosmos}`
- `reconciled.byWhom`: `{identity: "claude-code", agentName: "reconciliation"}`

Future replay/audit walks the parent events.jsonl; on encountering an `orphan_event_reconciled`, it joins to the kosmos orphan via `(file, line_offset)` to recover the semantic action.

## Reconciliation event inventory

13 events appended to `/home/palantirkc/.palantir-mini/session/events.jsonl` (sequences 37-49):

| eventId | kosmos line | timestamp |
|---------|-------------|-----------|
| orphan-recon-kosmos-line17 | 16 | 2026-04-17T05:09:37.245Z |
| orphan-recon-kosmos-line20 | 19 | 2026-04-17T05:35:29.321Z |
| orphan-recon-kosmos-line24 | 23 | 2026-04-17T09:19:06.884Z |
| orphan-recon-kosmos-line27 | 26 | 2026-04-17T09:25:37.906Z |
| orphan-recon-kosmos-line28 | 27 | 2026-04-17T09:25:53.152Z |
| orphan-recon-kosmos-line31 | 30 | 2026-04-17T09:26:19.159Z |
| orphan-recon-kosmos-line32 | 31 | 2026-04-17T09:26:23.005Z |
| orphan-recon-kosmos-line35 | 34 | 2026-04-17T09:31:32.368Z |
| orphan-recon-kosmos-line37 | 36 | 2026-04-17T09:33:40.186Z |
| orphan-recon-kosmos-line39 | 38 | 2026-04-17T09:34:56.110Z |
| orphan-recon-kosmos-line40 | 39 | 2026-04-17T09:36:41.456Z |
| orphan-recon-kosmos-line41 | 40 | 2026-04-17T09:36:56.883Z |
| orphan-recon-kosmos-line44 | 43 | 2026-04-17T09:46:36.047Z |

## Forward-fix — projectHierarchy federation (v1.6.0)

Phase B3 introduces `PALANTIR_MINI_PROJECT_HIERARCHY` env var (colon-separated project paths) + `emitToHierarchy(projects[], envelope)` helper + SubagentStart env injection from agent `.md` frontmatter `env:` block. After v1.6 rollout, Lead orchestrators spanning parent↔submodule can declare:

```yaml
# agent .md frontmatter
env:
  PALANTIR_MINI_PROJECT_HIERARCHY: "/home/palantirkc:/home/palantirkc/kosmos"
```

and all emitted events land in BOTH parent and kosmos events.jsonl atomically per-project with independent sequences. No future orphans should arise from this class of cwd-routing ambiguity.

## Invariants preserved

- `kosmos/.palantir-mini/session/events.jsonl`: **47 lines, byte-identical pre/post reconciliation**.
- Parent events.jsonl: grows 36 → 49 (+13 append-only reconciliation events).
- Rule 10 append-only policy: **UPHELD**. No orphan lines rewritten.
- Rule 08 schema versioning: plugin semver bump 1.5.2 → 1.6.1 (MINOR — additive federation API).

## Verification

```bash
wc -l /home/palantirkc/kosmos/.palantir-mini/session/events.jsonl  # 47 (unchanged)
grep -c '"type":"orphan_event_reconciled"' /home/palantirkc/.palantir-mini/session/events.jsonl  # 13
bun /home/palantirkc/.claude/schemas/scripts/reconcile-orphan-events.ts --dry-run 2>&1 | grep "orphan"  # still 13 detected (idempotent: script only flags orphans; real exec already completed)
```

## Cross-refs

- Script: `~/.claude/schemas/scripts/reconcile-orphan-events.ts`
- Event type: `~/.claude/schemas/ontology/lineage/event-types.ts` — `orphan_event_reconciled` (primaryDomain: learn)
- EventEnvelope variant: `~/.claude/plugins/palantir-mini/lib/event-log/types.ts` — `OrphanEventReconciledEnvelope`
- Federation helper: `~/.claude/plugins/palantir-mini/lib/event-log/append.ts` — `emitToHierarchy()`
- Rule 10: `~/.claude/rules/10-events-jsonl.md` (append-only policy)
- Plan: `~/.claude/plans/enchanted-snacking-babbage.md` (Phase B3 Track D §D1-D8)

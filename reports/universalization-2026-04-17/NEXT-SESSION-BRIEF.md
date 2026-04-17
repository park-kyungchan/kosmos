# Next-Session Brief — Universalization Implementation (H-A++)

> For the session that picks this up. Copy-paste-ready, self-contained.

---

## What's DONE (this session 6ac69954)

1. **Blueprint** — 14 sections at `reports/universalization-2026-04-17/00..13` + machine-readable `ontology-state/blueprint.json` + mirrored in kosmos `main` via squash-merged PR #7 (brain-v2-upgrade).
2. **H-A++ architecture accepted** — 15/15 R1-R15 gates PASS. Evidence: 10 Tier-1 sources (Claim 1/2/3 CONFIRMED, Claim 4 PARTIAL).
3. **Implementation plan** — `/home/palantirkc/.claude/plans/fluttering-brewing-donut.md` (approved by user in this session).
4. **18 impl tasks registered** — but marked `deferred` (see "Why deferred" below).
5. **PR #7 merged** — kosmos main at `ad8c42d`.

## Why DEFERRED

Dotfiles repo `/home/palantirkc` has **467 uncommitted WIP files** that need user-directed triage before safe implementation:

- **Secrets**: `.gemini/oauth_creds.json` — must NOT be committed publicly
- **Personal shell config**: `.bash_aliases`, `.bashrc`, `.zshrc`, `.netrc` — typically user-personal, not for shared dotfiles repo
- **Prior-session universalization work** (legitimate, overlaps with our plan):
  - `.claude/research/BROWSE.md` simplified from 315 lines to 38
  - `.claude/research/claude-code/features.md` expanded +592 lines (v2.1.79 → v2.1.108 delta)
  - `.claude/research/ptc/*.md` new placeholder files
  - `.claude/schemas/interaction/BROWSE.md` + `INDEX.md` created
  - `.claude/schemas/rendering/BROWSE.md` + `INDEX.md` created
  - `.claude/skills/pm-*/` duplicate of plugin skills
  - Plugin palantir-mini modifications (hooks, agents, monitors, skills)
  - Auto-memory files across 4 projects
- **Unrelated cleanup**: `.claude/skills/webgpu-threejs-tsl/` deletion

Permission system explicitly blocked stash+branch dance for this reason. Judgment call: do not commit 467 mixed files autonomously.

## What's NEEDED to unblock

User must triage the WIP into 3 buckets:

1. **Commit to public dotfiles** — universalization-related work (≈80% of the 467)
2. **Move to per-user git ignore** — personal shell config (`.bashrc`, `.zshrc`, `.netrc`, `.bash_aliases`)
3. **Rotate + delete** — secrets (`.gemini/oauth_creds.json`) should be rotated then removed from WIP

After triage: clean tree + `git checkout -b feat/universalization-dotfiles-w1 main` unblocks Wave 1.

## Resume Path — Copy-paste-ready prompt

```
이어서 진행. 이전 세션 6ac69954에서 Universalization Blueprint 완료
(reports/universalization-2026-04-17/ 14 섹션 + ontology-state/blueprint.json).
구현은 ~/ dotfiles의 467 WIP 때문에 deferred. 내가 WIP triage 마쳤으니 Wave 1부터 진행해라.
- 먼저 git status 확인
- /home/palantirkc 가 clean하면 feat/universalization-dotfiles-w1 branch 생성
- Wave 1 (R1/R2/R4) 병렬 실행 (3 agents: docs-research-engineer, schema-engineer, rules-writer)
- 이후 W1-GATE → Wave 2 → Wave 3 → Wave 4 순으로 plan 파일 대로
- plan 파일: ~/.claude/plans/fluttering-brewing-donut.md
```

## Critical Files to Re-Read on Resume

| File | Purpose |
|------|---------|
| `~/.claude/plans/fluttering-brewing-donut.md` | Approved implementation plan |
| `~/kosmos/reports/universalization-2026-04-17/00-executive-summary.md` | Architecture decision overview |
| `~/kosmos/reports/universalization-2026-04-17/10-pr-roadmap.md` | 12-PR sequence |
| `~/kosmos/reports/universalization-2026-04-17/08-palantir-mini-v2-spec.md` | Plugin 0.2.0 manifest changes |
| `~/kosmos/ontology-state/blueprint.json` | Machine-readable TechBlueprint |
| `~/kosmos/.palantir-mini/session/events.jsonl` | 7 events from this session |

## Task List State (for TaskList inspection on resume)

| ID | Subject | Status |
|----|---------|--------|
| 15 | [W0] Team + branch setup + PR#7 check | completed (partial — PR#7 merged, branch deferred) |
| 16 | [W1-R1] DEFERRED | completed (deferred — needs WIP triage) |
| 17 | [W1-R2] DEFERRED | completed (deferred) |
| 18 | [W1-R4] DEFERRED | completed (deferred) |
| 19-32 | W1-GATE through W4-CLOSE | completed (all deferred) |

New session should: TaskList → claim tasks 16-32 → mark `in_progress` as each is picked up. Subjects carry `DEFERRED` prefix; remove prefix when picking up.

## Reversal + Safety Notes

- Blueprint alone is valuable even if implementation never runs. Documented architecture can be referenced for future work.
- PR #7 merge is permanent and reviewable at `https://github.com/park-kyungchan/kosmos/pull/7` (though already merged).
- Every deferred PR has a one-command rollback per `11-risks-and-reversal.md#7`.
- If user prefers to NOT implement H-A++ at all: simply do nothing. Current palantir-mini v0.1.0 continues working per-project.

---

**Session 6ac69954 closed at 2026-04-17T01:31:00Z.**
**8 events emitted. 14 sections. 18 tasks. 1 merged PR. 0 WIP corrupted.**

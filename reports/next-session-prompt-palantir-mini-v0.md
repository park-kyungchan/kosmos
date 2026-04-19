> **HISTORICAL** — Superseded by Phase A-2 close (2026-04-18). Plugin is now at v1.3 (Phase A-3).
> Kept for provenance. Do NOT use as current guidance.

# Next Session Prompt — palantir-mini v0 Implementation

> **Purpose**: Copy-paste this prompt into a new Claude Code session to start v0 implementation of palantir-mini based on the research pipeline outputs landed in PR #5.
>
> **Where to start the new session**: `cd ~/kosmos && claude` (the kosmos repo contains the blueprint and pipeline artifacts; `~/.claude/plugins/` is accessible from anywhere since it's a user directory).
>
> **Why kosmos as the start directory**: `ontology-state/blueprint.json` lives there and is the machine-readable source of truth. `reports/final-report.md` is the human-readable companion. You'll cd into `~/.claude/plugins/palantir-mini/` as the first implementation step.

---

## Copy-Paste Prompt (everything below this line)

```
# palantir-mini v0 Implementation Session

## Context

The previous research session produced a validated TechBlueprint for **palantir-mini** — a Claude Code v2.1.108 plugin that implements Palantir Foundry/AIP/Ontology's real operating mechanisms (not cosmetic appearance) at small scale within Claude Code Native Runtime (API-Free, Claude Max X20 subscription only).

The 7-agent Kosmos Agent Teams pipeline ran T1-T12, applied R1-R15 evaluator gates (0 debate rounds), and landed PR #5 on the kosmos repo main branch (commit 767fa10). All pipeline artifacts are now durable and readable.

## Your goal this session

Implement palantir-mini **v0** at `~/.claude/plugins/palantir-mini/` according to the TechBlueprint. v0 is the smallest viable slice that proves the Three-Reference architecture (Anthropic Managed Agents + Palantir 5 patterns + OMC best practices) within Native Runtime.

## Critical inputs (read these first, in order)

1. **`~/kosmos/ontology-state/blueprint.json`** — TechBlueprint JSON (machine-readable). This is the authoritative final decision. Fields to honor: `projectScope`, `designPrinciples`, `primitives` (26 entries), `ontologyMapping`, `recommendedStack`, `forwardProp`, `backwardProp`, `implementationStrategy`, `evaluatorGate=ACCEPT`, `winRationale`, `alternatives`, `whatWouldChangeDecision`.

2. **`~/kosmos/reports/final-report.md`** — 13-section human-readable report. Focus on **Section 10 (Recommended Path)** for the concrete v0 implementation steps. Sections 6 (Ontology Mapping) and 8 (Simulation Results) are also load-bearing.

3. **`~/.claude/research/claude-code/palantir-mini-blueprint.md`** — v0 architecture document with **3 critical corrections** and **5 gap fills** (EventEnvelope TypeScript schema, 5 MCP tool schemas, hook handler bodies, atomic append mechanism, migration sequence). NOTE: this file is uncommitted in the ~/.claude/ repo (the palantirkc dotfiles repo is on a different branch). It exists on disk and is readable.

4. **`~/kosmos/prototype/hyp-pm-A/`** — Reference PoC. 484 LOC. Append-only event log implementation with fs.mkdir atomic lock. 10/10 tests pass including adversarial 2-writer race (0 lost events / 2000). Use this as the starting code for `bridge/` and `lib/event-log/` in the plugin.

5. **`~/kosmos/ontology-state/world-model.json`** — 28 primitives across 5 domains (5 DATA, 8 LOGIC, 5 ACTION, 3 SECURITY, 5 LEARN). Each primitive has forwardPropPath and backwardPropPath documented. Use as the TypeScript type authority for `~/.claude/schemas/ontology/primitives/`.

6. **`~/kosmos/ontology-state/scenarios.json`** — 11-dimension scoring for 3 hypotheses. Useful for understanding WHY H-A won and what trade-offs the implementation must maintain.

## Key architectural decisions (non-negotiable)

### 1. Three-Reference convergence

Every design choice must respect all three references simultaneously:

| Concept | Managed Agents | Palantir | OMC |
|---|---|---|---|
| State | Session = append-only log | Decision Lineage 5-dim | clawhip event routing |
| Compute/execute split | Harness ↔ Sandbox | Edit Functions ↔ Actions | Read-only agents ↔ writer agents |
| Stable interface | "swappable implementation" | OSDK 2.0 separated client/generated | Custom MCP server |

### 2. Palantir 5 must-include patterns

1. **Two-Tier Action Architecture** (declarative tier-1 + function-backed tier-2, mutually exclusive)
2. **Edit Functions return Edits[] without commit** — mechanically enforced by `disallowedTools: [Write, Edit]` on edit-function agents
3. **OSDK Type Codegen** — branded RIDs, exhaustive visitors (NO switch), separated client/generated
4. **6-Phase Validation** (v0 minimum: 3 phases — Design+Compile / Runtime / Post-Write)
5. **Submission Criteria as Pre-Flight** — business logic gates before mutation, independent from edit permissions

### 3. Critical corrections from researcher deep dive

- **Plugin agents CANNOT define `hooks`, `mcpServers`, or `permissionMode`** (plugins-reference security restriction). All hooks live at plugin-level `hooks/hooks.json`. Agents own only `tools`, `disallowedTools`, `model`, `effort`, `maxTurns`, `skills`, `memory`, `background`, `isolation`.
- **PreToolUse uses `hookSpecificOutput.permissionDecision`** (not top-level `decision`). Deprecated mapping: `"approve"→"allow"`, `"block"→"deny"`. Precedence: `deny > defer > ask > allow`.
- **Plugin file locations** (standardized): `.claude-plugin/plugin.json`, `skills/<name>/SKILL.md`, `agents/*.md`, `hooks/hooks.json`, `.mcp.json`, `monitors/monitors.json`, `bin/`. `${CLAUDE_PLUGIN_DATA}` persists across updates; `${CLAUDE_PLUGIN_ROOT}` does NOT.

### 4. v0 substrate decision (H-A winner)

**Append-only event log** (`events.jsonl` per project + monotonic `sequence` counter + `fs.mkdir` atomic lock). **NOT** snapshot-based. H-B empirically loses 484/2000 updates (24.2%) under 2-writer adversarial race; H-A has 0 lost events / 2000. This is the decisive evidence.

### 5. Constraints

- **API-Free** — Claude Max X20 subscription only. No `ANTHROPIC_API_KEY`. No `--bare` flag. No Managed Agents API. All execution within interactive Claude Code sessions.
- **Max v2.1.108 utilization** — use `PreCompact decision:"block"`, plugin `monitors` manifest, `TaskCreated`/`TaskCompleted` hooks, `managed-settings.d/` fragments, `EnterWorktree path`, `/recap`.
- **Cross-project reach** — plugin must work for `~/kosmos/`, `~/palantir-math/`, `~/mathcrew/`.
- **Multi-runtime awareness** — Claude is primary writer. Codex/Gemini are read-only consumers via filesystem.

## v0 directory structure to create

```
~/.claude/plugins/palantir-mini/
├── .claude-plugin/
│   ├── plugin.json              # name, version, description, author, keywords, mcpServers
│   └── marketplace.json         # for /plugin marketplace add
│
├── bridge/                      # MCP server = Harness API (Three-Reference convergence point)
│   ├── mcp-server.ts            # stdio MCP server entry
│   └── handlers/
│       ├── get-ontology.ts      # read derived snapshot
│       ├── emit-event.ts        # atomic append to events.jsonl
│       ├── apply-edit-function.ts  # returns Edits[] WITHOUT commit
│       ├── commit-edits.ts      # atomic commit with submission criteria pre-flight
│       └── replay-lineage.ts    # BackwardProp via event replay
│
├── lib/                         # Stateless harness logic (cattle)
│   ├── event-log/               # Start from prototype/hyp-pm-A/
│   │   ├── types.ts             # EventEnvelope discriminated union (10 variants)
│   │   ├── append.ts            # appendEventAtomic with fs.mkdir mutex
│   │   ├── read.ts              # readEvents + foldToSnapshot
│   │   └── snapshot.ts          # derived snapshot compaction
│   ├── actions/                 # Two-tier action engine
│   │   ├── tier1-declarative.ts
│   │   ├── tier2-function.ts    # executes edit functions returning Edits[]
│   │   ├── submission-criteria.ts  # 9 constraint types pre-flight
│   │   └── commit.ts            # atomic commit wrapper
│   ├── codegen/                 # OSDK 2.0 patterns
│   │   ├── osdk-template.ts     # branded RID, exhaustive visitor
│   │   └── descender-gen.ts     # ontology declarations → src/generated/
│   └── validation/              # 3-phase minimum (Design+Compile / Runtime / Post-Write)
│       ├── design.ts
│       ├── compile.ts
│       ├── runtime.ts
│       └── post-write.ts
│
├── hooks/
│   └── hooks.json               # ALL hooks declared here (NOT in agent frontmatter)
│
├── scripts/                     # Thin bootstrapper (OMC pattern)
│   ├── run.ts                   # entry point all hooks invoke
│   └── log.ts                   # structured event log writer
│
├── agents/
│   ├── ontology-verifier.md     # opus, read-only (disallowedTools: Write, Edit)
│   ├── change-auditor.md        # sonnet, read-only
│   ├── codegen-runner.md        # sonnet, Write/Edit allowlist
│   ├── propagation-tracer.md    # sonnet, read-only
│   └── action-executor.md       # sonnet, Write/Edit allowlist (the only writer)
│
├── skills/
│   ├── pm-init/SKILL.md         # bootstrap new project ontology
│   ├── pm-verify/SKILL.md       # run validation pipeline
│   ├── pm-codegen/SKILL.md      # regenerate descenders
│   ├── pm-blueprint/SKILL.md    # TechBlueprint generator
│   ├── pm-recap/SKILL.md        # /recap + event log replay
│   ├── pm-replay/SKILL.md       # BackwardProp via replay
│   └── pm-action/SKILL.md       # invoke tier-1/2 action
│
├── monitors/
│   └── monitors.json            # drift-watch auto-armed at session start (v2.1.105)
│
├── managed-settings.d/
│   └── 50-palantir-mini.json    # per-project settings fragment
│
└── README.md                    # summary + install instructions
```

## First concrete steps

1. **Read** the 6 critical inputs above in order.
2. **Create** `~/.claude/plugins/palantir-mini/` directory.
3. **Write `.claude-plugin/plugin.json`** — minimal manifest that declares `mcpServers`, `monitors`, and plugin metadata.
4. **Copy `lib/event-log/`** from `~/kosmos/prototype/hyp-pm-A/lib/event-log/` as the v0 event log primitive. It's already proven with 0 lost events / 2000 concurrent writes.
5. **Write `bridge/mcp-server.ts`** — stdio MCP server exposing the 5 Harness API tools. Use the JSON schemas from `palantir-mini-blueprint.md` Gap fill 2.
6. **Write `hooks/hooks.json`** — PreToolUse, PostToolUse, PreCompact, TaskCreated, TaskCompleted events targeting ontology/*.ts files. Use `hookSpecificOutput.permissionDecision` format.
7. **Write minimal `agents/ontology-verifier.md`** — read-only agent with `disallowedTools: [Write, Edit]`, tools: `[Read, Grep, Glob, Bash]`, model: opus.
8. **Extend `~/.claude/schemas/ontology/`** with `primitives/`, `functions/`, `policies/`, `lineage/`, `generators/` subdirectories. Start from the 26 primitives in `world-model.json`.
9. **First migration target**: copy `schema.ts` (2.5KB) from `~/palantir-math/ontology/` into the new plugin's migration test flow. Validate typegen primitives work end-to-end.
10. **Verify**: run `bun test` against the plugin's own test suite + `bunx tsc --noEmit`. Must be clean.

## Success criteria for v0

- [ ] Plugin installs via `claude plugin marketplace add <path>`
- [ ] MCP bridge exposes all 5 tools (verify via `/mcp` in session)
- [ ] `hooks/hooks.json` fires on Edit(ontology/*.ts) — verify with test edit
- [ ] `events.jsonl` appends new event on each action commit
- [ ] `replay_lineage` MCP tool reconstructs state from event log
- [ ] At least 1 agent in `agents/` has `disallowedTools: [Write, Edit]` (enforces edit-function pattern)
- [ ] `palantir-math/schema.ts` successfully regenerates via plugin codegen
- [ ] `bunx tsc --noEmit` clean across all plugin files
- [ ] `bun test` green for plugin unit tests
- [ ] No plugin-shipped agent has `hooks` or `mcpServers` in its frontmatter (Correction 1 enforcement)

## What to leave for v1 (deferred)

- AIP Logic Functions integration
- Workshop frontend ontology bridge
- Multi-runtime Codex/Gemini adapter
- BackwardProp loop completion (refinement proposal events as first-class EventEnvelope variants)
- Full 6-phase validation (v0 uses 3-phase minimum)
- Layer 2+ SECURITY (Markings, ObjectSecurity, Property-level policies)
- K-LLM consensus mechanism
- Workflow Lineage integration
- mathcrew / kosmos migration (only palantir-math in v0)

## Reference commits and PRs

- PR #5 (kosmos): https://github.com/park-kyungchan/kosmos/pull/5 — the research pipeline commit
- Commit 767fa10 — the merge commit on main
- Research library updates (~/.claude/research/claude-code/) are uncommitted in the palantirkc dotfiles repo on branch `feat/ship-skill-upgrade` — files exist on disk and are readable but not yet in git history of that repo

## Start by

Reading `~/kosmos/ontology-state/blueprint.json` (the machine-readable final decision), then `~/kosmos/reports/final-report.md` Section 10 (Recommended Path), then `~/.claude/research/claude-code/palantir-mini-blueprint.md` (the v0 architecture with gap fills). Then create the plugin directory.
```

---

## After you paste the prompt

The new session will:
1. Read the blueprint + final report + v0 architecture doc
2. Create `~/.claude/plugins/palantir-mini/` with the directory structure above
3. Implement `bridge/mcp-server.ts` as the Harness API
4. Copy the proven `event-log` primitive from `prototype/hyp-pm-A/`
5. Write `hooks/hooks.json` at plugin level (not agent frontmatter)
6. Set up the 5 custom agents with correct tools/disallowedTools split
7. Validate with `bunx tsc --noEmit` + `bun test`
8. Commit + push + PR the plugin

## Where to resume if interrupted

Any future session can resume by reading this file (`reports/next-session-prompt-palantir-mini-v0.md`) and the 6 critical inputs it references. The pipeline outputs are durable in git (PR #5 merged to main).

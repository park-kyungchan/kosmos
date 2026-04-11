# Kosmos Setup Guide

## Prerequisites

- **Bun** >= 1.0 (TypeScript runtime)
- **Claude Code** with MCP tools (scrapling, context7)
- Access to `~/.claude/research/` Palantir research library (~61 files)

## Environment Variables

Set these in `.claude/settings.json` `env` section, or export in your shell:

| Variable | Purpose | Default Fallback |
|----------|---------|-----------------|
| `KOSMOS_PROJECT_ROOT` | Absolute path to this repo | `process.cwd()` |
| `KOSMOS_RESEARCH_BASE` | Absolute path to `~/.claude/research/` | `$HOME/.claude/research` |
| `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS` | Enable Agent Teams (set to `"1"`) | disabled |

### Setting env vars

**Option 1: settings.json** (recommended — auto-injected into hooks)
```json
{
  "env": {
    "KOSMOS_PROJECT_ROOT": "/path/to/your/kosmos",
    "KOSMOS_RESEARCH_BASE": "/path/to/your/.claude/research"
  }
}
```

**Option 2: Shell export** (for manual testing)
```bash
export KOSMOS_PROJECT_ROOT="$(pwd)"
export KOSMOS_RESEARCH_BASE="$HOME/.claude/research"
```

## Installation

```bash
git clone https://github.com/park-kyungchan/kosmos.git
cd kosmos
bun install

# Update settings.json env paths to match your machine
# Then verify:
bunx tsc --noEmit  # should pass with 0 errors
```

## Verification

```bash
# TypeScript check (schemas only — hooks are standalone)
bunx tsc --noEmit

# Verify hooks are executable
bun run .claude/hooks/enforce-browse-protocol.ts <<< '{}'
# Should exit 0 (empty payload = allow)
```

## Project Structure

```
kosmos/
├── CLAUDE.md                    # Claude Code per-turn instructions
├── AGENTS.md                    # Codex-native per-turn instructions
├── GEMINI.md                    # Gemini-native per-turn instructions
├── BROWSE.md                    # AI agent query interface (start here)
├── INDEX.md                     # Structural reference
├── .claude/
│   ├── agents/                  # 6 agent definitions (5 active + 1 legacy)
│   ├── hooks/                   # 8 enforcement hooks (TypeScript + Bun)
│   ├── skills/kosmos-research/  # /kosmos-research Agent Teams pipeline skill
│   └── settings.json            # Hook config + env vars + Agent Teams flag
├── schemas/                     # TypeScript type definitions + validators
│   ├── types.ts                 # 17 domain types + TechBlueprint
│   ├── validators.ts            # Runtime type guards + lifecycle validators
│   └── index.ts                 # Public API
├── ontology-state/              # Runtime state (JSON, updated by agents)
│   ├── world-model.json         # D/L/A ontology graph (ontologist)
│   ├── source-map.json          # Sources + claims (researcher)
│   ├── scenarios.json           # Scenarios + runs (simulator)
│   ├── decision-log.json        # Decisions + routing (orchestrator)
│   └── blueprint.json           # TechBlueprint output (reporter)
├── reports/                     # Output templates + benchmark artifacts
├── docs/                        # Architecture, methodology, governance docs
├── package.json
└── tsconfig.json
```

## Portability Notes

- All hooks resolve paths via `KOSMOS_PROJECT_ROOT` env var with `process.cwd()` fallback
- No hardcoded absolute paths in hook logic
- Settings.json `command` fields use `${KOSMOS_PROJECT_ROOT:-.}` shell expansion
- Clone to any directory, update `env` section in settings.json, and hooks work

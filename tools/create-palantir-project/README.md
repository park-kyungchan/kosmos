# create-palantir-project

Scaffolding tool for new palantir-mini v0.2 projects.

## Usage

```bash
bun run tools/create-palantir-project/index.ts <target-dir> [--name <name>] [--force]
```

## What it produces

A minimum-viable project structure that works with the `palantir-mini@0.2.0`
plugin out-of-the-box:

```
<target-dir>/
├── package.json                          # peerDependency pin to @palantirKC/claude-schemas 0.2.x
├── tsconfig.json                         # bun-compatible
├── CLAUDE.md                             # overlay entry pointing at palantir-mini adoption
├── ontology/
│   └── README.md                         # placeholder for project-owned ontology
├── src/
│   └── generated/
│       └── .gitkeep                      # pm-codegen output target
├── .claude/
│   └── managed-settings.d/
│       └── 50-palantir-mini.json         # RBAC fragment granting MCP tools
└── .palantir-mini/
    └── session/
        ├── events.jsonl                  # empty — first event emitted by /pm-init
        ├── snapshots/
        ├── handoffs/
        └── locks/
```

## Template substitution

The scaffolder renders `{{VARIABLE}}` placeholders in template files:

- `{{PROJECT_NAME}}` — from `--name` or the basename of `<target-dir>`
- `{{CREATED_AT}}` — current UTC ISO timestamp

## After scaffolding

```bash
cd <target-dir>
/pm-init       # emits first session_started event
/pm-verify     # runs 4-phase validation (Design + Compile + Runtime + Post-Write)
```

## Idempotency

Running the tool twice into the same directory fails unless `--force` is
passed. Even with `--force`, existing files are overwritten but the
`events.jsonl` is left alone (append-only invariant per rule 10).

## Rollback

`rm -rf <target-dir>` — the scaffolder writes only into the target directory,
never outside.

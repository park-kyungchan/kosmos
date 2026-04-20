# create-palantir-project

Scaffolding tool for new palantir-mini v1.0 projects.

## Usage

```bash
bun run tools/create-palantir-project/index.ts <target-dir> [--name <name>] [--force]
```

## What it produces

A minimum-viable project structure that works with the `palantir-mini@1.0.0`
plugin out-of-the-box:

```
<target-dir>/
├── package.json                          # peerDependency pin to @palantirKC/claude-schemas#v1.0.0
├── tsconfig.json                         # bun-compatible
├── CLAUDE.md                             # Claude-native thin overlay
├── AGENTS.md                             # Codex-native thin overlay
├── ontology/
│   └── README.md                         # placeholder for project-owned ontology
├── src/
│   └── generated/
│       └── .gitkeep                      # pm-codegen output target
├── .claude/
│   └── managed-settings.d/
│       └── 50-palantir-mini.json         # v1 RBAC fragment granting plugin tools
└── .palantir-mini/
    └── session/
        └── events.jsonl                  # empty — first event emitted by /pm-init
```

## Template substitution

The scaffolder renders `{{VARIABLE}}` placeholders in template files:

- `{{PROJECT_NAME}}` — from `--name` or the basename of `<target-dir>`
- `{{CREATED_AT}}` — current UTC ISO timestamp

## After scaffolding

```bash
cd <target-dir>
/pm-init       # emits first session_started event
/pm-codegen    # generates project artifacts from ontology
/pm-verify     # runs 6-phase validation (Design + Compile + Runtime + Post-Write + Deploy + Merge)
```

## Idempotency

Running the tool twice into the same directory fails unless `--force` is
passed. Even with `--force`, existing files are overwritten but the
`events.jsonl` is left alone (append-only invariant per rule 10).

## Rollback

`rm -rf <target-dir>` — the scaffolder writes only into the target directory,
never outside.

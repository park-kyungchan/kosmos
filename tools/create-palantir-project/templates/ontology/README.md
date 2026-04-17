# ontology/

Project-owned ontology declarations for {{PROJECT_NAME}}.

## What goes here

- D/L/A primitives in TypeScript, consuming types from `@palantirKC/claude-schemas`
  (pinned at `0.2.x` in `package.json#peerDependencies`).
- One file per concern (avoid a monolithic `ontology.ts`): data, logic, action,
  security, learn axes as `ontology/{data,logic,action,security,learn}.ts`.
- An optional `schema.ts` aggregator re-exports typed primitives.

## What does NOT go here

- Implementation code → `src/`
- Generated artifacts → `src/generated/` (owned by `pm-codegen`)
- Tests → `tests/` or colocated `*.spec.ts`

## After editing ontology

1. `/pm-codegen` → regenerates `src/generated/` deterministically.
2. `/pm-verify` → runs the 4-phase validation pipeline.
3. Commit ontology + generated together so the state is reproducible.

## References

- `~/.claude/rules/01-ontology-first-core.md` — meaning-first authority chain.
- `~/.claude/rules/11-codegen-authority.md` — never hand-edit generated files.
- `~/.claude/schemas/ontology/` — the shared meta-schema (DO NOT edit from here).

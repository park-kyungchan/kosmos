# ontology/ — {{PROJECT_NAME}}

This directory owns project-local ontology declarations.

## Authority Boundary

- Import shared or cross-project primitives through `~/ontology/shared-core` when that layer exists.
- Project-local ontology extends shared-core. If you must shadow a shared primitive, document the divergence in this directory before doing it.
- Generated artifacts in `src/generated/` are codegen-owned; regenerate them instead of editing them.

## Typical Loop

1. Edit local ontology declarations in this directory.
2. Use `/pm-ontology-register` when introducing a reusable primitive, or `/pm-codegen` when regenerating project artifacts.
3. Run `/pm-verify` to pass the 6-phase validation pipeline.

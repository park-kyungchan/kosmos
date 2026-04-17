# 07 — `~/.claude/schemas/` v2 Upgrade Spec

> Shared schemas become a **versioned, cross-project interface**. Four axes (ontology, interaction, meta, rendering) each receive a targeted upgrade. Schema evolution is governed by a CHANGELOG + semver.

---

## 7.1 Versioning + Manifest

### New top-level files

| File | Purpose |
|------|---------|
| `~/.claude/schemas/package.json` | Declares `"name": "@palantirKC/claude-schemas"`, `"version": "0.2.0"`, workspace packages per axis |
| `~/.claude/schemas/CHANGELOG.md` | Semver history, per-axis change notes |
| `~/.claude/schemas/.manifest.json` | Machine-readable index of axes + files + exports |

### Semver rule

| Change Type | Bump | Example |
|-------------|------|---------|
| New type in any axis | MINOR | `0.2.0 → 0.3.0` |
| Breaking removal / rename | MAJOR | `0.x.x → 1.0.0` |
| Doc-only / comment / test | PATCH | `0.2.0 → 0.2.1` |
| Compile-breaking type change | MAJOR | — |

### Consumer pin contract

Each project declares:
```json
// <project>/package.json
{
  "peerDependencies": {
    "@palantirKC/claude-schemas": "0.2.x"
  }
}
```

`pm-verify` checks consumer pins and blocks if a project uses a range incompatible with the installed schema version.

---

## 7.2 Axis: `ontology/` (DATA + LOGIC)

### Current inventory (audited in section 01)

`BROWSE.md`, `INDEX.md`, `CHANGELOG.md`, subdirs (`action`, `codegen`, `data`, `functions`, `generators`, `helpers`, `lineage`, `logic`, `policies`, `primitives`, `security`), files (`project-validator.ts`, `semantic-audit.ts`, `semantics.ts`, `types.ts`, `upgrade-apply.ts`, `validate-*.ts`, `visual.html`).

### Upgrades for v0.2.0

1. **Mirror OSDK 2.0 primitive split**:
   - `primitives/object-type.ts` — Foundry ObjectType analog
   - `primitives/link-type.ts` — Foundry LinkType analog
   - `primitives/action-type.ts` — Foundry ActionType analog
   - `primitives/function-type.ts` — Foundry FunctionType analog
   - `primitives/policy-type.ts` — Foundry PolicyType analog (SECURITY axis)
   
2. **Formalize codegen contract**:
   - `codegen/manifest.ts` — interface for generators to declare inputs/outputs
   - `codegen/header.ts` — standard generated-file header (version, hash, timestamp)
   
3. **Add lineage types**:
   - `lineage/event-envelope.ts` — 5-dim event shape (when/atopWhich/throughWhich/byWhom/withWhat)
   - `lineage/replay-filter.ts` — replay_lineage tool input type

### Exports (`ontology/index.ts`)

Single entry point exporting all public types + validators:
```typescript
export * from "./primitives/object-type";
export * from "./primitives/link-type";
// ...
export { projectValidate } from "./project-validator";
export { semanticAudit } from "./semantic-audit";
```

---

## 7.3 Axis: `interaction/` (LOGIC)

### Current inventory

`BROWSE.md`, `INDEX.md`, subdirs (`binding`, `component`, `element`, `gesture`), `semantics.ts`, `types.ts`, `validator.ts` + tests.

### Upgrades for v0.2.0

1. **Bind to ontology RIDs**:
   - `component/rid.ts` — component RIDs mirror ontology RID format
   - `binding/ontology-binding.ts` — typed link from component to ontology entity
   
2. **Gesture audit trail**:
   - `gesture/event-envelope.ts` — gesture events reuse ontology event envelope for LEARN feedback
   
3. **Missing `index.ts`** — add it.

---

## 7.4 Axis: `meta/` (META)

### Current inventory

Only `types.ts`. **No BROWSE.md, no INDEX.md, no subdirs.**

### Upgrades for v0.2.0

1. **Create BROWSE.md + INDEX.md** declaring axis purpose: RIDs, version identifiers, cross-axis linking.

2. **Add `rid.ts`**:
   - Palantir-style RID format: `ri.{namespace}.{instance}.{type}.{id}`
   - RID generator + validator
   
3. **Add `version.ts`**:
   - Semver helpers for schema comparison
   - Compatibility check helper
   
4. **Subdirs**:
   - `meta/identity/` — RID types
   - `meta/version/` — semver + compat
   - `meta/provenance/` — provenance tag types (`[Official]` / `[Synthesis]` / `[Inference]`)

---

## 7.5 Axis: `rendering/` (DATA)

### Current inventory

`BROWSE.md`, `INDEX.md`, subdirs (`materials`, `performance`, `pipeline`, `scene`), `semantics.ts`, `types.ts`, `rendering.test.ts`.

### Upgrades for v0.2.0

Minor:
1. Add `index.ts` with public exports.
2. Bind scene objects to ontology RIDs (consistent with interaction/ axis).
3. Performance axis — add event envelope typing for perf lineage events.

### No breaking changes to rendering axis. Pure additions.

---

## 7.6 Cross-Axis Integration

### The meta/ axis as glue

All four axes depend on `meta/` for RIDs + versions + provenance. This is the **smallest axis but the most load-bearing**.

```
ontology/primitives/object-type.ts
    imports → meta/identity/rid.ts (RID format)
    imports → meta/provenance/tag.ts (provenance type)

interaction/binding/ontology-binding.ts
    imports → meta/identity/rid.ts
    imports → ontology/primitives/object-type.ts

rendering/scene/scene-object.ts
    imports → meta/identity/rid.ts
    imports → ontology/primitives/object-type.ts
```

### Avoid circular deps

Rule: `meta/` depends on nothing. Other axes may depend on `meta/` but not on each other except via published interfaces.

---

## 7.7 Validator Contracts

### Per-axis validators

Each axis gets:
- `axis/validate-entity.ts` — validates a single entity
- `axis/validate-manifest.ts` — validates axis manifest
- `axis/validator.test.ts` — unit tests

### Cross-axis validator

Top-level `~/.claude/schemas/validate-all.ts`:
- Runs each axis validator
- Confirms cross-axis RID references resolve
- Confirms manifest matches actual files (no orphans)
- Returns structured result `{ axis, status: "ok" | "warn" | "fail", messages: [...] }[]`

Used by `pm-verify`.

---

## 7.8 Generated File Contract (all axes)

Every file produced by `ontology/codegen/` or `meta/codegen/` (if ever) must carry:

```typescript
// GENERATED FILE — do not edit by hand.
// Schema: @palantirKC/claude-schemas@0.2.0
// Ontology hash: sha256:abc123...
// Generated: 2026-04-17T12:34:56Z
// Generator: pm-codegen@0.2.0
// Regenerate: /pm-codegen
```

`pm-verify` refuses to pass if any generated file lacks this header or if the hash doesn't match.

---

## 7.9 Breaking Changes Avoided

v0.2.0 is **additive only**. All v0.1.0 exports continue to work. New types and subdirs do not remove or rename existing artifacts.

Future v1.0.0 (out of scope) would be the first breaking cut.

---

## 7.10 CHANGELOG Entry Template

Every schema change must add a CHANGELOG entry:

```markdown
## [0.3.0] — YYYY-MM-DD

### Added
- `ontology/primitives/workflow-type.ts` (PR #42)

### Changed
- (none)

### Deprecated
- (none)

### Removed
- (none)

### Breaking
- (none)

### Migration
- N/A — additive release.
```

`pm-verify` blocks if a schema change is committed without a CHANGELOG entry.

---

## 7.11 Publish / Distribution

### Option A (recommended): npm package
- Publish `@palantirKC/claude-schemas@0.2.0` to npm (or private registry).
- Consumer projects install via `bun add @palantirKC/claude-schemas@0.2.x`.
- pm-codegen resolves from `node_modules/`.

### Option B (fallback): filesystem reference
- Consumer pins version via pm-verify schema-version check.
- `pm-codegen` reads from `~/.claude/schemas/` directly, verifies version matches pin.
- Simpler but no registry benefits.

**Decision**: start with Option B for MVP; graduate to Option A when a second user joins the workspace.

---

## 7.12 Summary

| Axis | New Files | Breaking? | Consumer Impact |
|------|-----------|-----------|------------------|
| `ontology/` | ~10 (5 primitives + codegen + lineage types + index.ts) | NO | none |
| `interaction/` | ~3 (RID, binding, index.ts) | NO | none |
| `meta/` | ~6 (BROWSE, INDEX, 3 subdirs, index.ts) | NO (axis was minimal) | none |
| `rendering/` | ~2 (perf envelope, index.ts) | NO | none |
| Top-level | 3 (package.json, CHANGELOG, manifest) | NO | consumer adds pin |
| **Total** | **~24** | | |

All 24 changes are bundled into PR #R2 in section 10.

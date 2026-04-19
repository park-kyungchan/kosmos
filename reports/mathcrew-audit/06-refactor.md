# mathcrew — Refactor Boundaries

> Part of the mathcrew audit series. See [INDEX.md](INDEX.md) for full context.

---

## 6. Refactor Boundaries {#6-refactor-boundaries}

### 6.1 Stable Core (DO NOT TOUCH)

These are sound and tested. Protect them.

| Component | Why Stable |
|-----------|-----------|
| `ontology/*.ts` | SSoT, well-designed, bilingual, LEARN-aware |
| `packages/core/*.ts` | Pure functions, tested, zero deps |
| `packages/core/*.test.ts` | 77+ assertions, all pass |
| `packages/api/src/schemas/` | Match ontology, Mongoose-validated |
| `packages/api/src/*/` (modules) | Clean Nest.js, modular |
| `packages/mcp/tools/` | 37 assertions, working |
| `seed/*.json` | Static data, correct |
| `research/*.md` | Valuable context |

### 6.2 Extraction Targets

| What | From | To | Rationale |
|------|------|----|-----------|
| Player component | MathWorld.tsx | `world/Player.tsx` | Single responsibility, safe NL editing |
| FollowCamera component | MathWorld.tsx | `world/FollowCamera.tsx` | Camera behavior isolated |
| Bridge component | MathWorld.tsx | `world/Bridge.tsx` | Bridge rendering isolated |
| Scene constants | MathWorld.tsx | `world/constants.ts` | ISLANDS, keyboard map, physics params |
| Scene setup (sky, lights, ground) | MathWorld.tsx | `world/SceneEnvironment.tsx` | Environment separate from gameplay |

### 6.3 Rename Targets

| Current | Proposed | Rationale |
|---------|----------|-----------|
| `client/src/world/` | Keep as-is | "world" accurately describes the 3D world mode |
| `api.ts` | Keep as-is | Clear, conventional |

No naming normalization needed — current names are consistent and clear.

### 6.4 Deletion Targets

| Target | Reason |
|--------|--------|
| `ecctrl` from package.json | Dead dependency, never imported |
| `leva` from package.json | Dead dependency, never imported |
| Stale content in handoff doc | Describes non-existent features |

### 6.5 Rewrite Targets

| Target | Issue | Rewrite Scope |
|--------|-------|--------------|
| `docs/handoff-v0.1-2026-03-23.md` | Aspirational, not factual | Correct to match actual state |
| `MathWorld.tsx` | Monolith | Decompose (not rewrite from scratch) |

### 6.6 Temporary Keep-As-Is

| Target | Why Keep | When to Revisit |
|--------|---------|----------------|
| Inline styles | Works for prototype | When adding theming/dark mode |
| No global state manager | Adequate for 2 hooks | When adding world-story state sharing |
| No Docker | Dev-only for now | When deploying to production |
| No CI/CD | Single developer | When adding collaborators |
| LEARN entities (ontology-only) | Correct to declare early | When implementing evaluation pipeline |
| DR-02/DR-03 (unimplemented) | Non-critical for demo | When expanding to 10+ concepts |

### 6.7 Future Extension Seams

| Seam | Purpose | Where to Cut |
|------|---------|-------------|
| `world/scenes/` directory | Per-concept interactive 3D scenes | Each scene is a self-contained R3F component |
| `world/characters/` directory | NPC models and behaviors | Billboard sprites or GLB models |
| `core/difficulty.ts` | DR-02/DR-03 difficulty adjustment | Pure function, tested |
| `api/analytics/` module | Learning analytics endpoints | New Nest.js module |
| `packages/engine/` | Scene state machine (if story mode added) | Pure TS, no rendering deps |

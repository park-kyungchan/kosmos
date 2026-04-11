# mathcrew Implementation Prompt

> Copy-paste this prompt when starting a Claude session in ~/mathcrew/.
> Source: Kosmos deep-dive research session `mathcrew-deep-dive-001` (2026-03-28)
> Full report: ~/kosmos/reports/mathcrew-deep-dive-report.md
> Blueprint: ~/kosmos/ontology-state/blueprint.json

---

## Context

mathcrew is an ontology-first adaptive elementary math learning world (약수/최대공약수, Korean 5th grade 1학기 2단원).

A deep research session produced a TechBlueprint with 13 pedagogical design principles, 5 misconception detectors, and a 3-phase implementation strategy. This prompt captures the actionable decisions.

## Research-Backed Decisions (Do Not Re-Debate)

### Architecture: 3-Layer State
- **Koota** (pmndrs official ECS): entity data, per-frame updates, proximity — `trait()` + `relation()` maps to §DC5-06
- **XState v5**: scene flow, teaching phase state machines, island actors
- **Zustand**: global app state (session, mastery, active island)
- Reference: viber3d starter (Koota + R3F + Rapier + Zustand)

### Rendering: Built-in Toon Pipeline
- **MeshToonNodeMaterial** + **ToonOutlinePassNode** — Three.js built-in, no custom shaders needed
- **detect-gpu** (tier 0-3) + **PerformanceMonitor** — 2-layer adaptive quality
- Tier 0-1 (Chromebook) = WebGL fallback + no effects. Tier 2 = standard. Tier 3 = full toon + bloom + godrays
- **Motion for R3F** — spring-physics animations for math objects

### Pedagogy: Instruction-First (NOT Productive Failure)
- **P5: Productive Failure is CONTRAINDICATED for grades 3-5.** Default = I do → We do → You do
- **P4: High guidance (d=0.90) vs low guidance (d=0.19).** NPC guidance is mandatory, not optional
- **P3: Math-as-Mechanic.** Division/factoring = game interaction, not a quiz gate (Zombie Division: 7x engagement)
- **P1: CRA progression** (Tau-BC = 0.9965). Every concept zone tracks Concrete → Representational → Abstract

### Adaptive Engine
- **ts-fsrs** v4.x: spaced repetition scheduling (replaces simple masteryScore)
- **BKT**: custom TypeScript implementation needed (port from OATutor BKT-brain.js)
- BKT determines WHAT needs review, ts-fsrs determines WHEN

### Learning Records
- **@xapi/xapi**: xAPI statement client (96.8% TypeScript, spec-compliant)
- Embedded LRS in NestJS (same MongoDB, dedicated collection)
- Statement pattern: `Student answered Question:divisor-12-q3 with result {score, success, duration, extensions: {hintCount, attemptNumber, misconceptionCode}}`

### AI Safety (CRITICAL)
- SafeTutors: multi-turn pedagogical harm 17.7% → **77.8%**
- PNAS: unguarded AI access **harms** learning outcomes
- 4-layer architecture: (1) pedagogical prompt (2) input threat detection (3) async moderation (turn count, 8 queries/day) (4) teacher HITL review
- Khanmigo pattern: "3 hints then zoom out", mathjs/SymPy verification, never disclose answers

### 5 Misconception Detectors (MC-01 to MC-05)

| Code | Misconception | Detection | Corrective Visual |
|------|-------------|-----------|-------------------|
| MC-01 | Factors/Multiples 혼동 | lists multiples for factors | Rectangular Arrays |
| MC-02 | GCF/LCM 혼동 | applies LCM procedure for GCF | Venn Diagram |
| MC-03 | 제한적 인수 개념 | only finds factors < 10 | Equal Sharing (larger) |
| MC-04 | 지수 오류 | 3^2 = 6 | Factor Tree |
| MC-05 | 절차적-개념적 괴리 | correct algo, fails transfer | Sharing Model + narrative |

## 3-Phase Implementation Strategy

### Phase 1: Golden Tables (2-3 weeks)
**Goal: Rendering revolution + data normalization**

1. `MeshToonNodeMaterial` + `ToonOutlinePassNode` — replace all island/object materials
2. `detect-gpu` + `PerformanceMonitor` — adaptive quality presets
3. `@xapi/xapi` statement schema — map InteractionEvent/HookEvent to xAPI
4. `InputAbstraction` — unified keyboard/touch/gamepad (extend existing `getLearningWorldInputStrategy`)
5. `@react-three/a11y` — wrap interactive 3D objects with ARIA roles
6. `SceneRegistry` — extract scene dispatch from MathWorld.tsx (first decomposition step)

```bash
# New dependencies for Phase 1
cd ~/mathcrew && bun add @react-three/a11y @xapi/xapi detect-gpu
```

### Phase 2: Operational Decision-Making (3-4 weeks)
**Goal: 3-layer state + adaptive logic + instruction-first pedagogy**

1. Koota + XState v5 + Zustand — 3-layer state (replace useState chains in MathWorld.tsx)
2. `ts-fsrs` — spaced repetition scheduling per concept
3. CRA Progression Tracker — gate criteria per concept zone (P1)
4. Scaffold Engine — 4-tier hint escalation (P6), instruction-first default (P5)
5. 5 Misconception Detectors (MC-01 to MC-05) in `packages/core/`
6. `Motion` R3F — spring animations for math object transitions

```bash
# New dependencies for Phase 2
cd ~/mathcrew && bun add koota xstate zustand ts-fsrs motion
```

### Phase 3: AI-First (4-6 weeks)
**Goal: AI tutoring (with safety) + math animations + environment**

1. Socratic Tutoring Agent — Khanmigo pattern + 4-layer safety
2. `manim-web` — 3Blue1Brown math animations for explain/demonstrate phases
3. `Mafs` — 2D math HUD overlays (number lines, graphs)
4. `MeshPortalMaterial` — diegetic scene transitions between islands
5. TSL procedural water/terrain between islands
6. Korean audio narration (P9: dual-channel, Temporal Contiguity d=0.87)

```bash
# New dependencies for Phase 3
cd ~/mathcrew && bun add manim-web mafs mathjs
```

## Key Files to Create/Modify

### New files (in order of creation):
```
packages/core/koota-traits.ts          # Koota trait definitions from ontology
packages/core/cra-progression.ts       # CRA stage logic (P1)
packages/core/scaffold-engine.ts       # 4-tier hint escalation (P6)
packages/core/fsrs-adapter.ts          # ts-fsrs integration
packages/core/misconception-detector.ts # 5 error types (P10)
packages/core/xapi-statements.ts       # xAPI statement builders
packages/client/src/world/SceneEngine.ts       # Koota world + XState actors
packages/client/src/world/SceneRegistry.ts     # Scene config → component dispatch
packages/client/src/world/InputAbstraction.ts  # Unified input system
packages/client/src/world/ToonMaterials.ts     # MeshToonNodeMaterial library
packages/api/src/modules/xapi/xapi.module.ts   # Embedded LRS (NestJS)
```

### Existing files to modify:
```
ontology/frontend.ts    # Add interaction + rendering + scenarioFlows contracts
packages/client/src/world/MathWorld.tsx     # Decompose into SceneEngine (770 lines → shell)
packages/client/src/world/constants.ts      # Add quality presets with detect-gpu tiers
packages/client/src/hooks/useStepProgression.ts  # Replace with XState actor
```

## Constraints

- **Ontology-first**: Change `ontology/` BEFORE `packages/core/` BEFORE `packages/client/`
- **ForwardProp**: Runtime names must match ontology names
- **BackwardProp**: Every important interaction must emit xAPI statement + HookEvent
- **P5**: Default to instruction-first (I do → We do → You do). Productive failure = optional advanced mode only
- **P4**: No unguided exploration. NPC guidance in every scene
- **P3**: If student can skip math and still progress, the design has failed
- **AI Safety**: Never expose LLM tutoring without all 4 safety layers active

## Validation

```bash
# Ontology validation
ONTOLOGY_PATH=~/mathcrew/ontology/schema.ts bun test ~/.claude/schemas/ontology/project-test.test.ts

# Project tests
cd ~/mathcrew && bun test

# Typecheck
cd ~/mathcrew/packages/client && bunx tsc --noEmit
cd ~/mathcrew/packages/api && bunx tsc --noEmit
```

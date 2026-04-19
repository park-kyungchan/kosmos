# mathcrew — Cold Audit, Decomposition & Refactor Plan

> This file has been split into `mathcrew-audit/` for easier navigation.
> See [mathcrew-audit/INDEX.md](mathcrew-audit/INDEX.md) for the full audit.

> **Date**: 2026-03-23
> **Orchestrator**: Kosmos Research OS v0.3.0
> **Target**: `/home/palantirkc/mathcrew/` (git: `park-kyungchan/mathcrew`, 1 commit)
> **Method**: Cold state inspection → Palantir-style D/L/A decomposition → Feasibility assessment → Refactor design
> **Provenance discipline**: [Repo-Fact] = observed in code | [Doc-Claim] = stated in docs | [Inference] = reasoned from evidence

---

## Table of Contents

1. [Current State of mathcrew](#1-current-state)
2. [Cold Audit Findings](#2-cold-audit-findings)
3. [Palantir-Style Decomposition](#3-palantir-style-decomposition)
4. [External Research Findings](#4-external-research-findings)
5. [Feasibility Assessment](#5-feasibility-assessment)
6. [Refactor Boundaries](#6-refactor-boundaries)
7. [Implemented Changes](#7-implemented-changes)
8. [Risk Register](#8-risk-register)
9. [Recommended Next Build Path](#9-recommended-next-build-path)
10. [What Would Force a Different Architecture Decision](#10-decision-reversal-conditions)

---

## 1. Current State of mathcrew {#1-current-state}

### 1.1 Identity

**Purpose**: Adaptive elementary math learning engine — diagnoses prerequisite knowledge gaps and recommends review paths. Korean 5th grade curriculum (divisors → multiples → GCD).

**Project phase**: v0.1 prototype, single commit (`b97e8b6`), not deployed.

**Stack**: TypeScript + Bun monorepo, Nest.js + MongoDB backend, React 19 + React Three Fiber frontend, MCP server for Claude Code integration.

### 1.2 Measured Dimensions

| Dimension | Value | Source |
|-----------|-------|--------|
| TypeScript files | 65 | [Repo-Fact] `find -name "*.ts" -o -name "*.tsx"` |
| Total lines | 3,634 | [Repo-Fact] `wc -l` |
| Git commits | 1 | [Repo-Fact] `git log --oneline` |
| Packages | 4 (core, api, mcp, client) | [Repo-Fact] `ls packages/` |
| Ontology files | 5 (data, logic, action, security, schema) | [Repo-Fact] |
| Research docs | 7 | [Repo-Fact] `ls research/` |
| Design docs | 3 (blueprint, scope, handoff) | [Repo-Fact] `ls docs/` |
| Seed data files | 4 (curriculum, concepts, questions, students) | [Repo-Fact] |
| Client test files | 0 | [Repo-Fact] |
| Core test files | 4 (77+ assertions) | [Repo-Fact] |
| MCP test files | 1 (37 assertions) | [Repo-Fact] |
| Dead dependencies | 2 (ecctrl, leva) | [Repo-Fact] — in package.json, never imported |
| tsc --noEmit | PASS | [Repo-Fact] |

### 1.3 Actual Directory Tree

```
mathcrew/                          3,634 lines TypeScript
├── ontology/                      5 files, ~798L — D/L/A SSoT
│   ├── data.ts                    8 entities (6 domain + 2 LEARN)
│   ├── logic.ts                   5 links, 3 derived props, 5 decision rules
│   ├── action.ts                  8 mutations
│   ├── security.ts                roles, permissions (declaration-only)
│   └── schema.ts                  root re-export + learn infrastructure
│
├── packages/
│   ├── core/                      10 files — pure TS, zero deps
│   │   ├── types.ts               shared entity types + SceneEvent + MasteryMap
│   │   ├── mastery.ts             calculateMastery() — sliding window
│   │   ├── prerequisite.ts        graph traversal (getPrerequisites, isUnlocked)
│   │   ├── recommend.ts           adaptive engine (DR-01~05)
│   │   ├── grading.ts             auto-grade + error classification
│   │   ├── index.ts               public API
│   │   └── *.test.ts              4 test files (all pass)
│   │
│   ├── api/                       ~27 files — Nest.js + MongoDB
│   │   ├── src/
│   │   │   ├── main.ts            NestFactory, port 3000, CORS
│   │   │   ├── app.module.ts      7 modules
│   │   │   ├── schemas/           5 Mongoose schemas
│   │   │   ├── curriculum/        CRUD controller + service
│   │   │   ├── concepts/          CRUD + prerequisite graph
│   │   │   ├── questions/         CRUD + search
│   │   │   ├── students/          CRUD
│   │   │   ├── attempts/          submit + grading
│   │   │   ├── recommend/         mastery + gap analysis
│   │   │   └── seed/              auto-load on startup
│   │   └── package.json           Nest.js 11, Mongoose 9
│   │
│   ├── mcp/                       ~10 files — MCP server
│   │   ├── server.ts              McpServer + stdio, 5 tools
│   │   ├── tools/                 5 tool files
│   │   ├── server.test.ts         37 assertions (pass)
│   │   └── package.json           @modelcontextprotocol/sdk
│   │
│   └── client/                    17 source files — React + R3F
│       ├── src/
│       │   ├── App.tsx            14 lines — route switch only
│       │   ├── main.tsx           React entry
│       │   ├── api.ts             fetch wrapper, 5 endpoints
│       │   ├── modes/
│       │   │   ├── HomeMode.tsx   concept map + character + nav
│       │   │   └── WorldMode.tsx  wrapper for MathWorld
│       │   ├── world/
│       │   │   ├── MathWorld.tsx  200L MONOLITH (Player+Camera+Bridge+Scene)
│       │   │   └── Island.tsx     119L (single island component)
│       │   ├── components/
│       │   │   ├── ConceptMap.tsx
│       │   │   ├── MasteryGauge.tsx
│       │   │   └── character/
│       │   │       ├── SuriCharacter.tsx  SVG character (5 states)
│       │   │       └── types.ts
│       │   ├── hooks/
│       │   │   ├── useConcepts.ts
│       │   │   └── useMastery.ts
│       │   └── styles/global.css
│       ├── package.json           React 19, R3F 9.5, Drei 10.7, Rapier 2.2
│       │                          DEAD: ecctrl 1.0.97, leva 0.10.1
│       └── vite.config.ts         proxy, @core alias, fs.allow
│
├── seed/                          4 JSON files (1 curriculum, 3 concepts, 3 questions, 1 student)
├── docs/                          3 files (blueprint v2, scope, handoff)
├── research/                      7 files (rendering engines, packaging, competitor, architecture, LLM-native, character, 3D candidates)
└── package.json                   root: workspaces + scripts
```

### 1.4 Dependency Flow (Actual)

```
ontology/  (SSoT, 0 imports)
    ↓ informs type design
core/  (pure TS, 0 deps)
    ↓ imported by (compile-time)
api/  (Nest.js + MongoDB)
    ↓ consumed via HTTP
mcp/  (MCP server, REST client to api/)
    ↓ consumed via fetch
client/  (React + R3F, REST client to api/)
```

**Import boundary violations**: None detected. [Repo-Fact]

---

## 2. Cold Audit Findings {#2-cold-audit-findings}

### 2.1 CRITICAL: Documentation-Reality Gap

**Finding**: The handoff document (`docs/handoff-v0.1-2026-03-23.md`) describes features and structures that DO NOT EXIST on disk. This is the single most dangerous audit finding because it would mislead any future contributor or AI agent.

| Doc Claim | Reality | Impact |
|-----------|---------|--------|
| "App.tsx 270줄" (Issue #1) | App.tsx is 14 lines [Repo-Fact] | Issue #1 is already resolved; doc is stale |
| "Ecctrl 캐릭터 컨트롤러 ✅ 확정" | `ecctrl` never imported anywhere [Repo-Fact: grep found 0 matches] | Dead dependency, misleading claim |
| "packages/story/ 4 files" | `packages/story/` does not exist [Repo-Fact: `ls packages/`] | Phantom package |
| "scenes3d/" in client | `scenes3d/` does not exist [Repo-Fact: glob found no matches] | Phantom directory |
| "CharacterRenderer interface unused" (Issue #6) | No such interface exists in codebase [Repo-Fact] | Phantom issue |
| "checkInterval ref unused" (Issue #7) | No such ref exists in codebase [Repo-Fact] | Phantom issue |
| "86 source files, 4,351 lines" | 65 files, 3,634 lines [Repo-Fact] | Inflated metrics |
| "Ecctrl 키보드 입력 안 됨" (Issue #0, CRITICAL) | Ecctrl is not used; Player uses custom Rapier physics [Repo-Fact] | Issue #0 describes wrong component |

**Root cause** [Inference]: The handoff document was written for a planned or intermediate state that was superseded by the actual implementation. With only 1 git commit, there is no history to trace when the divergence occurred. The document appears to describe an aspirational architecture rather than the delivered code.

**Severity**: HIGH — a future AI agent or developer reading the handoff would waste significant effort debugging Ecctrl integration that doesn't exist, looking for story/ and scenes3d/ directories that were never created, and fixing issues in code that was already refactored.

### 2.2 Dead Dependencies

| Dependency | package.json | Imports Found | Verdict |
|-----------|-------------|--------------|---------|
| `ecctrl` ^1.0.97 | client | 0 | DEAD — remove |
| `leva` ^0.10.1 | client | 0 | DEAD — remove |

Both add bundle size and attack surface for zero benefit.

### 2.3 MathWorld.tsx Monolith

**File**: `packages/client/src/world/MathWorld.tsx` (200 lines)
**Contains**: Player component, FollowCamera component, Bridge component, island data, keyboard map, physics constants, scene setup, UI overlay

This file violates single-responsibility. It mixes:
- **Input handling** (keyboard map, getKeys)
- **Physics** (Player rigid body, capsule collider, velocity setting)
- **Camera** (FollowCamera with lerp follow)
- **Scene construction** (islands, bridges, ground, sky, lighting, fog)
- **UI** (exit button, HUD overlay)
- **Game logic** (isUnlocked callback)

**Risk**: Any change to player physics requires editing the same file as camera behavior, lighting, and UI. This makes terminal-based NL iteration fragile — Claude cannot edit the Player without risk of breaking the Bridge or Camera.

### 2.4 No Client-Side Tests

| Package | Test Files | Assertions |
|---------|-----------|------------|
| core/ | 4 | 77+ |
| mcp/ | 1 | 37 |
| api/ | 0 | 0 |
| client/ | 0 | 0 |

The core adaptive logic is well-tested. The rendering layer has zero test coverage. For an ambitious 3D product, this is a structural risk — regressions in 3D behavior will be caught only by manual inspection.

### 2.5 Keyboard Input Analysis

The handoff claims Issue #0 (CRITICAL): "Ecctrl 키보드 입력 안 됨". However, the actual code does NOT use Ecctrl at all. [Repo-Fact]

The actual player input is in MathWorld.tsx:
```typescript
const [, getKeys] = useKeyboardControls();  // Drei KeyboardControls
useFrame(() => {
  const { forward, backward, leftward, rightward, jump, run } = getKeys();
  // ... velocity setting via Rapier
});
```

This is a standard Drei `KeyboardControls` + `useKeyboardControls` pattern. If keyboard input is actually broken in the browser, the likely causes are:
1. Canvas not receiving focus (user must click the Canvas first)
2. `KeyboardControls` wrapping order — it wraps `Canvas` correctly [Repo-Fact: line 149-199]
3. React StrictMode double-mounting

**Corrected diagnosis**: Issue #0 should be re-described as "KeyboardControls focus/event binding" not "Ecctrl keyboard input". The fix is likely a simple `tabIndex={0}` + `autoFocus` on the Canvas container, or an `onPointerDown` focus handler.

### 2.6 State Management

**Current**: Pure `useState` + custom hooks (useConcepts, useMastery). No global store.

**Assessment**: Adequate for current scope (2 hooks, 1 route state). Would become insufficient when:
- World mode needs to share state with story mode
- Multiple concepts need simultaneous mastery tracking
- Optimistic updates are needed for attempt submission

### 2.7 Styling

**Current**: Inline styles everywhere (`style={{ ... }}`). `global.css` exists but is minimal.

**Assessment**: Not blocking for prototype. Would become painful for:
- Theming (dark mode, accessibility)
- Responsive design
- Design system consistency

### 2.8 API Layer

**Strengths**:
- Clean Nest.js module structure (7 modules, clear separation)
- Mongoose schemas match ontology/data.ts
- Seed service auto-loads on startup
- CORS enabled

**Gaps**:
- No validation beyond class-validator decorators
- No error response standardization
- No rate limiting
- No health check endpoint
- No API versioning

### 2.9 Build & Deployment

| Step | Status |
|------|--------|
| `tsc --noEmit` | ✅ Pass |
| `bun run build` (client) | ✅ Vite builds |
| Docker/Compose | ❌ Not present |
| CI/CD | ❌ Not configured |
| Vercel/Railway | ❌ Not deployed |
| Environment config | ⚠️ .env not tracked, no .env.example |

---

## 3. Palantir-Style Decomposition {#3-palantir-style-decomposition}

### 3.1 Domain Classification

Every component of mathcrew is classified into exactly one domain using semantic heuristics SH-01 (EXISTS vs REASON vs CHANGE), SH-02 (deletion test), SH-03 (Edits[] vs commit).

#### DATA Domain (SENSE) — "What exists"

| Object Type | File(s) | Properties | Dependencies | Risks |
|------------|---------|-----------|--------------|-------|
| **Curriculum** | ontology/data.ts, api/schemas/curriculum.schema.ts | 6 props, PK: curriculumId | None | LOW — static seed data |
| **Concept** | ontology/data.ts, api/schemas/concept.schema.ts, core/types.ts | 9 props, PK: conceptId | FK: curriculumId | LOW — 3 concepts, expandable |
| **Question** | ontology/data.ts, api/schemas/question.schema.ts, core/types.ts | 9 props, PK: questionId | FK: conceptId | MEDIUM — sceneConfig is untyped JSON string |
| **Student** | ontology/data.ts, api/schemas/student.schema.ts, core/types.ts | 5 props, PK: studentId | None | LOW — 1 demo student |
| **Attempt** | ontology/data.ts, api/schemas/attempt.schema.ts, core/types.ts | 9 props, PK: attemptId | FK: studentId, questionId, conceptId | LOW — well-designed, denormalized conceptId |
| **AgentRun** | ontology/data.ts | 8 props, PK: agentRunId | None | LOW — audit trail entity |
| **HookEvent** | ontology/data.ts (LEARN) | 12 props, 5D lineage | FK: targetId | MEDIUM — declared but not implemented in API |
| **EvaluationRecord** | ontology/data.ts (LEARN) | 9 props | FK: targetId, hookEventId | MEDIUM — declared but not implemented in API |

**Observation**: 6 domain entities are implemented in both ontology and API. 2 LEARN entities (HookEvent, EvaluationRecord) are declared in ontology but have NO corresponding Mongoose schemas or API endpoints. [Repo-Fact]

#### LOGIC Domain (DECIDE) — "How to reason"

| Concept | Type | File(s) | Role | Owner |
|---------|------|---------|------|-------|
| **conceptPrerequisite** | Link (M:N) | ontology/logic.ts, core/prerequisite.ts | THE ADAPTIVE CORE — graph traversal | core/ |
| **studentMakesAttempt** | Link (1:M) | ontology/logic.ts, api/attempts/ | Attempt → Student relationship | api/ |
| **conceptTestedByQuestion** | Link (1:M) | ontology/logic.ts, api/questions/ | Question → Concept relationship | api/ |
| **masteryScore** | DerivedProperty | ontology/logic.ts, core/mastery.ts | (correct/total) × 100, window=10 | core/ |
| **weakConcepts** | DerivedProperty | ontology/logic.ts, core/recommend.ts | concepts where mastery < 80% | core/ |
| **prerequisiteGap** | DerivedProperty | ontology/logic.ts, core/recommend.ts | prerequisites below threshold | core/ |
| **DR-01: Review** | DecisionRule | ontology/logic.ts, core/recommend.ts | mastery < threshold → review | core/ |
| **DR-02: Difficulty Down** | DecisionRule | ontology/logic.ts | 3 consecutive incorrect → -1 | NOT IMPLEMENTED |
| **DR-03: Difficulty Up** | DecisionRule | ontology/logic.ts | 5 consecutive correct → +1 | NOT IMPLEMENTED |
| **DR-04: Unlock** | DecisionRule | ontology/logic.ts, core/recommend.ts | all prereqs ≥ threshold → unlock | core/ |
| **DR-05: Error Classify** | DecisionRule | ontology/logic.ts, core/grading.ts | classify error type | core/ |
| **isUnlocked** | Function | MathWorld.tsx (inline!) | Check if island is accessible | client/ (WRONG OWNER) |

**Critical finding**: `isUnlocked` logic is duplicated. `core/prerequisite.ts` has `isConceptUnlocked()` (pure, tested), but `MathWorld.tsx` has its own inline implementation [Repo-Fact: line 124-129] that hardcodes concept IDs ("divisors", "multiples", "gcd") instead of using the graph. This is a **logic-rendering coupling** that violates D/L/A separation.

#### ACTION Domain (ACT) — "What changes reality"

| Mutation | PA Level | Implemented | File |
|----------|----------|-------------|------|
| **submitAttempt** | PA-01 (auto) | ✅ | api/attempts/attempts.service.ts |
| **evaluateAttempt** | PA-01 (auto) | ✅ (inline in submit) | api/attempts/attempts.service.ts |
| **recommendReview** | PA-02 (recommend) | ✅ | api/recommend/recommend.service.ts |
| **unlockConcept** | PA-01 (auto) | ⚠️ PARTIAL — core logic exists, no explicit API mutation | core/recommend.ts |
| **generateQuestions** | PA-03 (teacher approve) | ✅ | mcp/tools/generate-questions.ts |
| **updateQuestion** | PA-01 (teacher) | ⚠️ INFERRED — Nest.js CRUD | api/questions/ |
| **recordHookEvent** | PA-01 (internal) | ❌ NOT IMPLEMENTED | ontology only |
| **recordEvaluation** | PA-01 (teacher) | ❌ NOT IMPLEMENTED | ontology only |

#### SECURITY Domain

| Concept | Declared | Enforced |
|---------|----------|----------|
| student role | ✅ ontology/security.ts | ❌ No auth middleware |
| teacher role | ✅ ontology/security.ts | ❌ No auth middleware |
| admin role | ✅ ontology/security.ts | ❌ No auth middleware |

**Assessment**: Expected for v0.1 prototype with declaration-only security.

#### UI / PRESENTATION Layer

| Component | File | Lines | Responsibility | Coupling Issues |
|-----------|------|-------|----------------|----------------|
| App | App.tsx | 14 | Route switch | None — clean |
| HomeMode | modes/HomeMode.tsx | 45 | Landing page | Hardcoded STUDENT_ID |
| WorldMode | modes/WorldMode.tsx | — | MathWorld wrapper | — |
| MathWorld | world/MathWorld.tsx | 200 | **MONOLITH** | Player+Camera+Bridge+Scene+UI+Logic |
| Island | world/Island.tsx | 119 | Island geometry | Clean, props-only |
| ConceptMap | components/ConceptMap.tsx | — | Concept graph display | — |
| MasteryGauge | components/MasteryGauge.tsx | — | Radial gauge | — |
| SuriCharacter | components/character/SuriCharacter.tsx | 85 | SVG character (5 states) | Clean, props-only |

#### RENDERING Layer

| Concern | Technology | File(s) | Assessment |
|---------|-----------|---------|-----------|
| 3D Scene graph | React Three Fiber 9.5 | MathWorld.tsx | Adequate |
| Physics | @react-three/rapier 2.2 | MathWorld.tsx (Player) | Adequate |
| 3D Helpers | @react-three/drei 10.7 | MathWorld.tsx, Island.tsx | Adequate |
| SVG Rendering | Browser native | SuriCharacter.tsx | Clean |
| WebGL | Three.js r183 | via R3F | Adequate |

#### DEPLOYMENT Layer

| Concern | Status | Files |
|---------|--------|-------|
| Client bundling | Vite 8 | vite.config.ts |
| API server | Nest.js bootstrap | api/src/main.ts |
| Database | MongoDB local | .env (not tracked) |
| MCP transport | stdio | mcp/server.ts |
| Container | ❌ Missing | — |
| CI/CD | ❌ Missing | — |
| Static hosting | ❌ Not deployed | — |

### 3.2 Dependency Map (Ontology-Style)

```
┌─────────────────────────────────────────────────────────────┐
│                    ONTOLOGY (SSoT)                           │
│  data.ts ─── logic.ts ─── action.ts ─── security.ts        │
│     │            │            │              │               │
│     ▼            ▼            ▼              ▼               │
│  8 entities   5 links     8 mutations    3 roles            │
│  (6+2 LEARN)  3 derived   (6 impl'd)    (none enforced)    │
│               5 rules                                        │
│               (3 impl'd)                                     │
└──────────────────────┬──────────────────────────────────────┘
                       │ informs
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                     CORE (Pure TS)                           │
│  types.ts ── mastery.ts ── prerequisite.ts ── recommend.ts  │
│                                              ── grading.ts  │
│  4 test files, 77+ assertions                                │
│  ZERO dependencies                                           │
└──────────────────────┬──────────────────────────────────────┘
                       │ imported by
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                      API (Nest.js)                           │
│  7 modules: curriculum, concepts, questions, students,       │
│             attempts, recommend, seed                        │
│  5 Mongoose schemas (no LEARN schemas)                       │
│  10+ REST endpoints                                          │
└──────────────┬──────────────────────┬───────────────────────┘
               │ HTTP                  │ HTTP
               ▼                      ▼
┌──────────────────────┐  ┌───────────────────────────────────┐
│    MCP (5 tools)     │  │        CLIENT (React + R3F)       │
│  get-curriculum      │  │  App → HomeMode / WorldMode       │
│  search-questions    │  │  WorldMode → MathWorld (MONOLITH) │
│  generate-questions  │  │  MathWorld → Player, Camera,      │
│  get-student-mastery │  │              Bridge, Island        │
│  recommend-review    │  │  HomeMode → ConceptMap, Suri      │
│  37 test assertions  │  │  0 test assertions                │
└──────────────────────┘  └───────────────────────────────────┘
```

### 3.3 Risk Objects

| ID | Risk | Severity | Likelihood | Category | Mitigation |
|----|------|----------|-----------|----------|-----------|
| R-01 | Handoff doc misleads future agents | HIGH | CERTAIN | Operational | Correct or delete stale handoff |
| R-02 | MathWorld monolith blocks NL iteration | HIGH | LIKELY | Technical | Decompose into Player, Camera, Scene, Bridge |
| R-03 | isUnlocked logic duplicated (core vs client) | MEDIUM | CERTAIN | Technical | Client should import from core/ |
| R-04 | No client tests | MEDIUM | LIKELY | Technical | Add Vitest + R3F test utils |
| R-05 | Dead dependencies inflate bundle | LOW | CERTAIN | Technical | Remove ecctrl, leva from package.json |
| R-06 | LEARN entities declared but unimplemented | MEDIUM | POSSIBLE | Completeness | Implement when needed (not for v0.1) |
| R-07 | DR-02/DR-03 declared but unimplemented | LOW | POSSIBLE | Completeness | Implement in recommend.ts |
| R-08 | No deployment pipeline | HIGH | CERTAIN | Deployment | Create Docker + CI/CD |
| R-09 | Single git commit — no history | MEDIUM | CERTAIN | Governance | Commit incrementally going forward |
| R-10 | Hardcoded STUDENT_ID in HomeMode | LOW | CERTAIN | Technical | Parameterize via route/context |

### 3.4 Recommendation Objects

| ID | Recommendation | Priority | Effort | Rationale |
|----|---------------|----------|--------|-----------|
| REC-01 | **Correct handoff document** | P0 | 30min | Prevents cascading misinformation |
| REC-02 | **Decompose MathWorld.tsx** | P0 | 2hr | Enables safe NL iteration on 3D components |
| REC-03 | **Remove dead dependencies** | P0 | 5min | Clean signal, smaller bundle |
| REC-04 | **Fix isUnlocked duplication** | P1 | 30min | Eliminates logic-rendering coupling |
| REC-05 | **Add .env.example** | P1 | 10min | Enables reproducible setup |
| REC-06 | **Add global.css semantic tokens** | P2 | 1hr | Enables theming |
| REC-07 | **Add React error boundary** | P2 | 30min | Prevents white screen of death |
| REC-08 | **Implement DR-02/DR-03** | P2 | 1hr | Completes adaptive logic |

---

## 4. External Research Findings {#4-external-research-findings}

> **Research method**: Parallel external research via web search + official documentation.
> **Provenance**: Sources cited inline. [Official] = vendor/org docs. [Benchmark] = measured data. [Community] = forums/blogs.

### 4.1 React Three Fiber Ecosystem (2025-2026)

**Status**: R3F remains the dominant and ONLY mature React 3D solution. No credible competitor exists.

| Metric | Value | Source |
|--------|-------|--------|
| npm weekly downloads | ~697,714 | [Official: npmjs.com] |
| GitHub stars | 29,110 | [Official: GitHub] |
| Three.js weekly downloads | 5,000,000+ | [Official: npmjs.com] |
| Current version | v9.1.2 (React 19 compatible) | [Official: npm] |
| Ecosystem | drei, rapier, gltfjsx, postprocessing | [Official: pmndrs] |

- R3F v9 is a compatibility release for React 19. V10 is in elongated beta.
- R3F renders components **outside React's reconciliation cycle** and leverages React's scheduling.
- WebGPU renderer available via async `gl` prop.

**Key limitation**: Dual learning curve (React + 3D). For >100 dynamic objects, custom `useFrame` loops outperform declarative JSX.

**Assessment for mathcrew**: 3 islands + 1 player + bridges + decorations ≈ 30 objects. Well within R3F's comfortable range. No performance concern at current scale.

### 4.2 Three.js vs Alternatives

| Engine | npm/week | Stars | Bundle (gz) | React | LLM Gen | Assessment |
|--------|----------|-------|-------------|-------|---------|-----------|
| **Three.js/R3F** | 5M+ | 110K | 168KB | Native | HIGH | ✅ Correct choice |
| Babylon.js | 13K | 25K | 1.4MB | Poor | MEDIUM | Not worth migration |
| PlayCanvas | 15K | 14K | 300KB | None | LOW | Incompatible |
| Galacean | N/A | N/A | N/A | Early | LOW | Chinese market focus |
| Threlte | N/A | N/A | N/A | Svelte | LOW | Wrong framework |
| A-Frame | — | — | — | HTML | MEDIUM | Too limited |

[Sources: npmjs.com, GitHub, Utsubo comparison guide 2026]

**Verdict**: Three.js maintains ~300x higher weekly downloads than nearest competitors. Self-reinforcing ecosystem advantage. Migration cost HIGH, benefit ZERO.

### 4.3 Low-End Device Constraints

| Constraint | Budget | mathcrew Now | Source |
|-----------|--------|-------------|--------|
| Draw calls/frame | **<100** for 60fps | ~30 | [Official: MDN WebGL Best Practices] |
| Triangles | <100K total scene | ~5K | [Benchmark: Codrops Three.js demo] |
| Texture memory | 4K texture = 64MB VRAM | ~0 (procedural) | [Official: Three.js Roadmap] |
| Lights | ≤3 active on mobile | 2 (ambient + directional) | [Community: Utsubo 100 Tips] |
| Shadow map | 512-1024px mobile | Not measured | [Community: Utsubo] |
| DPR cap | 1.5 mobile, 1.0 desktop | Default | [Community: Codrops] |
| Fragment precision | `mediump` for 2x mobile perf | Default (`highp`) | [Official: MDN] |

**WebGPU status (2025-11)**: Universal desktop support (Chrome, Firefox 145, Safari 26, Edge). Mobile fragmented — Android 12+ Chrome only. Three.js r171 provides zero-config WebGPU with automatic WebGL 2 fallback.

**Assessment**: mathcrew's procedural geometry (cylinders, spheres, cones — no GLB/textures) is accidentally optimal for low-end devices. The moment GLB character models or high-poly terrain are added, draw call instancing becomes mandatory.

### 4.4 3D Math Education Landscape

| Tool | Rendering | Status | Approach |
|------|----------|--------|----------|
| **GeoGebra 3D** | Custom WebGL | Production, widely used | Interactive 3D for solids/surfaces |
| **Desmos 3D** | Canvas+WebGL | SIGGRAPH 2025 paper | CPU solver → GPU mesh upload |
| **MathBox** | Three.js + ShaderGraph | Open source, low activity | Declarative math diagrams |
| **Mafs** | React + SVG | Active | 2D math visualization |

[Sources: geogebra.org, Desmos SIGGRAPH paper, GitHub]

**Market gap**: No production R3F-based educational math app exists. GeoGebra and Desmos dominate with custom renderers. mathcrew would be novel in this space.

### 4.5 LLM-Driven 3D Code Generation

**Reliability by complexity** [Synthesis from community benchmarks + skill-file projects]:

| Complexity | Reliability | Notes |
|-----------|-------------|-------|
| Simple scenes (geometry + lighting) | **HIGH** | LLMs generate reliably |
| Medium (GLTF + physics + post-processing) | **MEDIUM** with skill augmentation | 1-2 iterations needed |
| Complex (custom shaders, ECS, perf-critical) | **LOW** | Significant manual work |

**Skill-file ecosystem** (for augmenting LLM 3D generation):
- `r3f-skills` (GitHub: EnzeD): 11 domain skill files for R3F v8.x+
- `threejs-skills` (GitHub: CloudAI-X): 10 domain skill files, audited against r160+
- `threejs-blocks.com`: Machine-readable LLM docs (8KB index + 130KB full API)

**Implication for mathcrew**: The "LLM-Native rendering" philosophy in the blueprint is sound. Critical prerequisite is **component isolation** — Claude can safely edit a 50-line Player.tsx but not a 200-line monolith. Skill files would further improve generation quality.

### 4.6 Monorepo Patterns for 3D Web Apps

**Best practice** [Synthesis from Feature-Sliced Design, monorepo.tools]:
```
packages/
  core/          Pure business logic (0 deps) — domain state owner
  renderer/      3D rendering (Three.js/R3F) — receives data, renders
  math/          Mathematical computations (pure functions)
  ui/            2D React UI (overlays, HUD)
apps/
  web/           Vite entry point, composes packages
```

Key conventions:
- Use **business language** for package names — "domains survive refactors while layers don't"
- `core` must not import from `renderer`; `renderer` imports from `core`
- State management (Zustand/Jotai) lives in `core/`, not `renderer/`

**mathcrew assessment**: Already has core/ separation. Client/ mixes app shell + 3D rendering + (duplicated) business logic. The decomposition done in this session (MathWorld → 5 files) is the first step toward clean renderer isolation.

### 4.7 Scene Graph vs ECS

| Factor | Scene Graph (R3F JSX) | ECS (Koota/Miniplex) |
|--------|----------------------|---------------------|
| Best for | <50 entities, spatial hierarchies | >50 entities, cross-cutting systems |
| LLM generability | HIGH — JSX maps to visual | LOW — entity/system wiring is abstract |
| Debugging | React DevTools | Query world state |
| R3F integration | Native | Via adapter hooks |
| Upgrade path | — | Koota (pmndrs, same org as R3F) |

[Sources: douges.dev ECS blog, webgamedev.com, GitHub: pmndrs/koota]

**Recommendation**: Stay with scene graph. ECS is overkill at current scale. If mathcrew grows to need physics + collision + camera + AI systems operating on overlapping entities, Koota is the natural upgrade path (same pmndrs ecosystem).

### 4.8 Deployment Patterns for 3D Web Apps

| Concern | Best Practice | Source |
|---------|-------------|--------|
| Asset compression | gltfjsx + Draco: **90% size reduction** | [Official: R3F docs] |
| Lazy loading | React `<Suspense>` + `useGLTF` | [Official: R3F docs] |
| Adaptive quality | `<PerformanceMonitor>`: auto-reduce DPR when <30fps | [Official: drei] |
| CDN | Long cache headers for hashed filenames | [Community: Gatsby perf guide] |
| Memory | `dispose()` geometries/materials on unmount | [Community: Utsubo tips] |
| WebGL RAM | 5-50MB initial download, near-zero ongoing | [Community: Ravespace] |

---

## 5. Feasibility Assessment {#5-feasibility-assessment}

### 5.1 Core Question: Can mathcrew become a foundation for ambitious frontend 3D work?

**Answer: YES, conditionally.** [Inference]

The codebase has a clean foundation (ontology, core logic, API, MCP) that is structurally sound. The 3D rendering layer is the weak point — not because R3F is wrong, but because MathWorld.tsx is a monolith that prevents safe iteration.

### 5.2 Hypothesis Matrix

| Hypothesis | Evidence For | Evidence Against | Verdict |
|-----------|-------------|-----------------|---------|
| **H1: R3F is the right rendering choice** | Dominant React 3D solution, best LLM generability, mature ecosystem | None significant | SUPPORTED |
| **H2: Monorepo structure can scale** | Clean import boundaries, pure core logic, tested | Client mixes concerns, no renderer isolation | SUPPORTED after refactor |
| **H3: LLM-native rendering works for this domain** | Blueprint rationale sound, procedural geometry LLM-friendly | Requires component isolation, MathWorld monolith blocks it | SUPPORTED after decomposition |
| **H4: Current rendering is appropriate** | Procedural geometry is perf-optimal for low-end, 30 objects well within budget | No GLB models, no animations, no particles beyond Sparkles | SUPPORTED for current scope |
| **H5: The codebase can support ambitious 3D expansion** | Ontology is expandable, API is modular, MCP tools are extensible | No scene management system, no asset pipeline, no scene-app state bridge | CONDITIONALLY SUPPORTED |

### 5.3 Scenario Matrix

| Scenario | Base Case | Best Case | Worst Case | Adversarial |
|----------|----------|----------|------------|-------------|
| **Scale to 10 concepts** | Works with current arch + decomposed MathWorld | Seamless — data-driven island generation from API | Performance OK but code becomes unwieldy without scene management | Scene transitions break, state leaks between concepts |
| **Add GLB character models** | Works with R3F useGLTF hook, modest perf impact | Smooth — Mixamo characters + animations enhance immersion | Draw call budget exceeded on low-end phones | GLB loading fails on slow connections, no fallback |
| **Add interactive math scenes** | Works if scenes are isolated components | Each scene is a self-contained R3F component, LLM-generable | Scene-app coupling (passing mastery, attempt data) becomes spaghetti | Drag/touch interactions conflict with character controls |
| **Deploy to production** | Vercel (client) + Railway (API) + Atlas (DB) | Fast, cheap, reliable for demo scale | MongoDB free tier limits (512MB), API cold starts | No error tracking, no monitoring, silent failures |

### 5.4 What is Blocking Ambitious 3D Work

| Blocker | Severity | Fix Difficulty |
|---------|----------|---------------|
| MathWorld monolith | HIGH | MEDIUM (2hr refactor) |
| No scene-app state bridge | HIGH | MEDIUM (React context or Zustand) |
| No scene isolation pattern | HIGH | LOW (establish convention) |
| Stale documentation | HIGH | LOW (30min correction) |
| Dead dependencies | LOW | TRIVIAL (5min) |
| No client tests | MEDIUM | MEDIUM (ongoing) |

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

---

## 7. Implemented Changes {#7-implemented-changes}

### 7.1 Dead Dependency Removal

**Files modified**: `packages/client/package.json`
**Change**: Remove `ecctrl` and `leva` from dependencies

### 7.2 MathWorld Decomposition

**Source**: `packages/client/src/world/MathWorld.tsx` (200 lines, 6 concerns)
**Target**: 5 focused files

| New File | Lines | Responsibility |
|----------|-------|----------------|
| `world/Player.tsx` | ~55 | Player physics, input, mesh |
| `world/FollowCamera.tsx` | ~15 | Camera follow logic |
| `world/Bridge.tsx` | ~25 | Bridge geometry between islands |
| `world/constants.ts` | ~20 | ISLANDS data, keyboard map, physics constants |
| `world/MathWorld.tsx` | ~75 | Scene composition only |

### 7.3 Handoff Document Correction

**File**: `docs/handoff-v0.1-2026-03-23.md`
**Change**: Add prominent correction notice at top with actual vs claimed state

### 7.4 Environment Example

**File**: `.env.example`
**Change**: Create with documented environment variables

### 7.5 Summary of Changes

| Change | Type | Risk | Audit Value |
|--------|------|------|-------------|
| Remove ecctrl/leva | Dependency cleanup | ZERO | Eliminates dead weight |
| Decompose MathWorld | Structural refactor | LOW | Enables safe NL iteration |
| Correct handoff doc | Documentation fix | ZERO | Prevents misinformation |
| Add .env.example | Documentation | ZERO | Enables reproducible setup |

---

## 8. Risk Register {#8-risk-register}

### 8.1 Technical Risks

| ID | Risk | Severity | Likelihood | Current Status | Mitigation |
|----|------|----------|-----------|----------------|-----------|
| TR-01 | **MathWorld monolith blocks safe editing** | HIGH | CERTAIN | MITIGATED by decomposition | Decomposed into 5 files |
| TR-02 | **Dead deps inflate bundle** | LOW | CERTAIN | MITIGATED | Removed ecctrl, leva |
| TR-03 | **No client tests → silent regressions** | MEDIUM | LIKELY | OPEN | Add Vitest + @react-three/test-renderer |
| TR-04 | **Keyboard input may not work in browser** | MEDIUM | POSSIBLE | OPEN | Investigate Canvas focus; add tabIndex/autoFocus |
| TR-05 | **isUnlocked duplicated in client** | MEDIUM | CERTAIN | OPEN | Client should use core/prerequisite.ts |
| TR-06 | **sceneConfig is untyped JSON string** | LOW | POSSIBLE | OPEN | Define TypeScript interface for scene configs |
| TR-07 | **Single git commit — no rollback granularity** | MEDIUM | CERTAIN | OPEN | Commit incrementally going forward |

### 8.2 Architectural Risks

| ID | Risk | Severity | Likelihood | Current Status | Mitigation |
|----|------|----------|-----------|----------------|-----------|
| AR-01 | **No scene-app state bridge** | HIGH | LIKELY (when adding story mode) | OPEN | Add shared context when story mode is built |
| AR-02 | **No scene isolation convention** | HIGH | LIKELY (when adding concept scenes) | OPEN | Establish `world/scenes/` pattern |
| AR-03 | **No asset pipeline** | MEDIUM | POSSIBLE (when adding GLB models) | OPEN | Add @react-three/assets or simple public/ convention |
| AR-04 | **No error boundaries** | MEDIUM | POSSIBLE | OPEN | Add React error boundary at mode level |

### 8.3 Operational Risks

| ID | Risk | Severity | Likelihood | Current Status | Mitigation |
|----|------|----------|-----------|----------------|-----------|
| OR-01 | **Stale handoff misleads future work** | HIGH | CERTAIN | MITIGATED | Correction notice added |
| OR-02 | **No deployment pipeline** | HIGH | CERTAIN (for production) | OPEN | Add Docker + Vercel/Railway when ready |
| OR-03 | **No .env documentation** | MEDIUM | CERTAIN | MITIGATED | .env.example created |
| OR-04 | **MongoDB local-only** | MEDIUM | CERTAIN (for production) | OPEN | Migrate to Atlas when deploying |

---

## 9. Recommended Next Build Path {#9-recommended-next-build-path}

### Phase 0: Foundation (this session — DONE)
- [x] Cold audit
- [x] Decompose MathWorld
- [x] Remove dead dependencies
- [x] Correct stale documentation
- [x] Create .env.example

### Phase 1: Rendering Isolation (next session, ~2hr)
1. Fix keyboard input (Canvas focus investigation)
2. Extract isUnlocked from client → use core/prerequisite.ts
3. Establish `world/scenes/` convention for per-concept 3D scenes
4. Create first interactive scene (DivisorScene.tsx — drag cubes to basket)
5. Add proximity detection on islands (Rapier collision events)

### Phase 2: Story Integration (session after, ~3hr)
1. Build `packages/engine/` — pure TS state machine for story/dialogue
2. Add scene-app state bridge (React context or Zustand)
3. Implement island → NPC → dialogue → scene flow
4. Add 수리 as Billboard sprite in 3D world

### Phase 3: Content & Polish (~2 sessions)
1. Expand to 5+ concepts (약분, 통분, 분수 덧셈/뺄셈)
2. Data-drive island generation from API
3. Add mastery visualization in 3D (progress rings, particle effects)
4. Implement DR-02/DR-03 (difficulty adjustment)

### Phase 4: Deployment (~1 session)
1. Docker compose (MongoDB + API)
2. Vercel deploy (client)
3. Railway/Render deploy (API)
4. MongoDB Atlas free tier

### Decision Points (require user input)

| Decision | When | Options |
|----------|------|---------|
| State management | Phase 2 | Zustand (simple) vs Jotai (atomic) vs React Context (built-in) |
| Character model | Phase 2 | Keep primitives vs Mixamo GLB vs commissioned model |
| Scene interaction | Phase 1 | R3F ray-based vs Rapier physics-based vs HTML overlay |
| Deployment target | Phase 4 | Vercel+Railway (fast) vs Docker self-host (control) vs Cloudflare (edge) |

---

## 10. What Would Force a Different Architecture Decision {#10-decision-reversal-conditions}

These are conditions that, if true, would invalidate the current architecture and require significant changes:

| # | Condition | Current Assessment | What Would Change |
|---|-----------|-------------------|-------------------|
| 1 | **>100 simultaneous 3D objects needed** | 30 objects, well under | Switch from declarative R3F to imperative Three.js + custom render loop |
| 2 | **Real-time multiplayer required** | Single-player | Add WebSocket layer, shared physics, conflict resolution |
| 3 | **Native app required (iOS/Android store)** | Web-only | Add Capacitor or React Native with react-native-three |
| 4 | **Complex character animation needed** | Primitive geometry | Add Mixamo + EcctrlAnimation or custom animation system |
| 5 | **Physics-heavy gameplay** | Light physics (walk, jump) | Consider Ammo.js or custom physics for precision |
| 6 | **Must run on pre-2020 devices** | Modern browser assumed | Remove physics, reduce geometry, add Canvas2D fallback |
| 7 | **Must integrate with existing LMS (알공)** | Standalone demo | Add OAuth2, API adapter, data sync layer |
| 8 | **>50 concepts in prerequisite graph** | 3 concepts | Add graph database or specialized traversal, server-side rendering of concept map |
| 9 | **R3F ecosystem dies or stalls** | Active, Vercel-backed | Evaluate Babylon.js or raw Three.js migration |
| 10 | **Nest.js is dropped from job requirements** | JD-required | Consider lighter alternatives (Hono, Elysia) |

**None of these conditions are currently true.** The architecture is appropriate for the current and near-term scope.

---

## Appendix A: Provenance Log

| Claim | Provenance | Verification |
|-------|-----------|-------------|
| 65 TS files, 3,634 lines | [Repo-Fact] | `find + wc -l` |
| ecctrl never imported | [Repo-Fact] | `grep -r "ecctrl" src/` → 0 matches |
| leva never imported | [Repo-Fact] | `grep -r "leva" src/` → 0 matches |
| story/ does not exist | [Repo-Fact] | `ls packages/` → 4 dirs only |
| scenes3d/ does not exist | [Repo-Fact] | `glob src/**/*` → no scenes3d/ |
| App.tsx is 14 lines | [Repo-Fact] | `cat -n App.tsx` |
| R3F is dominant React 3D | [Official] | pmndrs/react-three-fiber GitHub stats |
| Procedural geometry is perf-optimal | [Inference] | From WebGL draw call budgets + no texture overhead |
| Component isolation enables NL iteration | [Synthesis] | From LLM code generation experience + DRY principle |

## Appendix B: Files Read During Audit

```
/home/palantirkc/kosmos/CLAUDE.md
/home/palantirkc/kosmos/schemas/types.ts
/home/palantirkc/kosmos/.claude/agents/*.md
/home/palantirkc/kosmos/.claude/hooks/*.ts
/home/palantirkc/mathcrew/package.json
/home/palantirkc/mathcrew/packages/client/package.json
/home/palantirkc/mathcrew/packages/client/vite.config.ts
/home/palantirkc/mathcrew/packages/client/src/App.tsx
/home/palantirkc/mathcrew/packages/client/src/main.tsx
/home/palantirkc/mathcrew/packages/client/src/api.ts
/home/palantirkc/mathcrew/packages/client/src/modes/HomeMode.tsx
/home/palantirkc/mathcrew/packages/client/src/modes/WorldMode.tsx
/home/palantirkc/mathcrew/packages/client/src/world/MathWorld.tsx
/home/palantirkc/mathcrew/packages/client/src/world/Island.tsx
/home/palantirkc/mathcrew/packages/client/src/components/character/SuriCharacter.tsx
/home/palantirkc/mathcrew/packages/client/src/components/character/types.ts
/home/palantirkc/mathcrew/packages/client/src/hooks/useConcepts.ts
/home/palantirkc/mathcrew/packages/client/src/hooks/useMastery.ts
/home/palantirkc/mathcrew/packages/core/types.ts
/home/palantirkc/mathcrew/packages/core/recommend.ts
/home/palantirkc/mathcrew/packages/core/mastery.ts
/home/palantirkc/mathcrew/packages/core/prerequisite.ts
/home/palantirkc/mathcrew/packages/core/grading.ts
/home/palantirkc/mathcrew/ontology/schema.ts
/home/palantirkc/mathcrew/ontology/data.ts
/home/palantirkc/mathcrew/ontology/logic.ts
/home/palantirkc/mathcrew/ontology/action.ts
/home/palantirkc/mathcrew/docs/blueprint.md
/home/palantirkc/mathcrew/docs/handoff-v0.1-2026-03-23.md
/home/palantirkc/mathcrew/docs/PROJECT-SCOPE.md
```

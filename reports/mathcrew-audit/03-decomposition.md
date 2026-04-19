# mathcrew — Palantir-Style D/L/A Decomposition

> Part of the mathcrew audit series. See [INDEX.md](INDEX.md) for full context.

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

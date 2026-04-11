# mathcrew Deep Dive Research Report

**Session:** `mathcrew-deep-dive-001`
**Date:** 2026-03-28
**Scope:** Ontology/BackendOntology/FrontendOntology audit + revolutionary frontend improvement research
**Provenance:** Mixed — Internal Palantir SSoT [Official/Synthesis], External web research [Tier-1 to Tier-3]

---

## 1. User Objective

mathcrew의 기존 ontology-first 아키텍처를 유지하면서 다음 영역에서 획기적/도전적 변화를 연구:
- 프론트엔드 3D 렌더링 품질 혁신
- 교육 특화 기술스택 도입
- 콘텐츠 전달 방식의 패러다임 전환
- 컴포넌트 아키텍처 혁신

---

## 2. Research Questions (D/L/A Domain Tags)

| ID | Question | Domain | Priority |
|----|----------|--------|----------|
| RQ1 | TSL/WebGPU로 교육용 Pixar-quality 스타일라이즈드 렌더링 달성 방법? | FRONTEND/RENDERING | P0 |
| RQ2 | 키보드 E/Q 넘어서 체화된 인지(embodied cognition) 인터랙션 패러다임? | FRONTEND/INTERACTION | P0 |
| RQ3 | CRA(구체-표상-추상) 진행을 디지털 3D 수학 환경에서 구현하는 방법? | LOGIC/CONTENT | P0 |
| RQ4 | xAPI, BKT, IRT, FSRS 등 교육 특화 기술을 TypeScript/Bun 스택에 통합하는 방법? | DATA/TECH | P1 |
| RQ5 | ECS, 상태 머신, 마이크로씬 등 3D 교육 월드 최적 컴포넌트 아키텍처? | FRONTEND/ARCHITECTURE | P0 |

---

## 3. Retrieval Plan

**Internal (Palantir Research Library):**
- `§DC5-05` 4대 설계 원칙 (DDD/DRY/OCP/PECS) -> 컴포넌트 아키텍처 적용
- `§DC5-06` 온톨로지 프리미티브 -> 인터랙션 프리미티브 플러그인 시스템
- `§DC5-04` 3-phase journey -> 구현 로드맵 (Golden Tables -> Kinetics -> AI-First)
- `§DC-SIG-03` builder scope -> 프론트엔드 온톨로지 확장
- `§FDE-09` expanded builder surfaces -> 에이전트 기반 콘텐츠 생성

**External:**
- Context7: Three.js TSL reference, R3F v9 docs
- Web: CRA research 2024-2025, BKT/FSRS implementations, ECS patterns, accessibility libraries

---

## 4. Internal Palantir Findings (DevCon 5 Principles)

### 4.1 §DC5-05 Four Design Principles -> Component Architecture

| Principle | Current mathcrew Status | Gap | Proposed Application |
|-----------|----------------------|-----|---------------------|
| **DDD** (Objects = real-world 1:1) | Ontology has 12 DATA entities, 7 interaction primitives | Runtime components don't mirror ontology entities 1:1 | Each interaction primitive -> self-contained scene module |
| **DRY** (Rule of Three) | PetShareScene, DualPetShareScene share pickup/drop logic | Duplicated pickup/drop/build across 3+ scenes | Extract `InteractionEngine` with pluggable evaluators |
| **OCP** (Open for extension) | Hardcoded scene dispatch in MathWorld.tsx | Adding new scene requires modifying God component | Scene registry pattern: register scenes, dispatch by config |
| **PECS** (Producer Extends, Consumer Super) | frontendApiBindings satisfies Record<string, FrontendApiBinding> | No polymorphic interaction interface | `InteractionPrimitive<TState, TAction>` generic interface |

### 4.2 §DC5-06 Ontology Primitives -> Interaction System

현재 7개 인터랙션 프리미티브가 `primitiveRegistryDefinitions`에 선언되어 있지만, 런타임에서는 MathWorld.tsx의 switch/if 체인으로 디스패치됨. [Synthesis]

**Proposed:** 온톨로지 프리미티브의 PECS 패턴 적용:
```
Producer: 각 씬이 InteractionPrimitive<TState> 인터페이스를 extends
Consumer: MathWorld가 InteractionPrimitive<unknown>을 super로 소비
```

### 4.3 §DC5-04 3-Phase Journey -> Implementation Roadmap

1. **Golden Tables** (Phase 1): xAPI LRS 통합, 학습 데이터 정규화, 인터랙션 이벤트 표준화
2. **Operational Decision-Making** (Phase 2): BKT 적응형 엔진, CRA 진행 로직, 스캐폴딩 시스템
3. **AI-First** (Phase 3): LLM 기반 소크라틱 튜터링, 자동 문항 생성 개선, 에이전트 기반 콘텐츠 최적화

### 4.4 §DC-SIG-03 Builder Scope Extension

> "Backend ontology alone is insufficient. Builder scope now clearly includes applications, agent surfaces, scenarios, and automations." [Official]

현재 mathcrew FrontendOntology는 views와 agentSurfaces만 선언. scenarioFlows, interaction, rendering이 `satisfies FrontendOntology`에서 optional로 비어 있음.

**Proposed Extension:**
- `interaction`: 인터랙션 프리미티브 레지스트리를 온톨로지 계약으로 승격
- `rendering`: 렌더링 품질 프리셋을 온톨로지 수준에서 선언
- `scenarioFlows`: CRA 진행 시나리오를 what-if 표면으로 선언

---

## 5. External Current Findings (Tech Stack)

### 5.1 3D Rendering (RQ1)

**TSL (Three Shading Language) Complete Reference** [Tier-1, Context7]
- Three.js 0.183+ TSL은 완전한 포스트프로세싱 파이프라인 제공:
  - `bloom`, `fxaa`, `ao` (GTAO), `dof` (Depth of Field)
  - `godrays` (Volumetric light rays), `lensflare`, `motionBlur`
  - `chromaticAberration`, `film` (grain), `dotScreen`
  - Color grading: `lut3D`, `cdl` (Color Decision List), `acesFilmicToneMapping`
  - Blur: `gaussianBlur`, `bilateralBlur` (edge-preserving)
- **Toon Shading**: TSL에서 `step()` + `smoothstep()` 노드 조합으로 cel-shading 구현 가능. `normalView` MRT 출력 + edge detection으로 outline 효과.
- **Water/Ocean**: TSL `texture()` + `time` 노드로 animated normal map 기반 물 표현.

**MeshToonNodeMaterial + ToonOutlinePassNode** [Tier-1, Three.js built-in] **-- NEW**
- Three.js 내장 toon 렌더링: `MeshToonNodeMaterial` (gradientMap 기반 cel-shading) + `ToonOutlinePassNode` (윤곽선 포스트프로세싱)
- 커스텀 셰이더 작성 불필요. WebGPU + WebGL 양쪽 호환.
- outline thickness/color/alpha를 node로 동적 제어 → 학습 포커스 객체에 두꺼운 윤곽선

**manim-web v0.3.16** [Tier-1, npm] **-- NEW**
- TypeScript 3Blue1Brown 스타일 수학 애니메이션, 클라이언트 사이드 WebGL
- React 컴포넌트: `<ManimScene construct={fn} width={800} height={450} />`
- 기하학, MathTex(KaTeX), 그래프(Axes, FunctionGraph), 3D(Sphere, Surface3D), 애니메이션(FadeIn, Transform, Create)
- R3F와 별도 WebGL 컨텍스트 → 듀얼 캔버스 레이어 또는 개념 포팅 필요

**Mafs v0.21.0** [Tier-1, npm] **-- NEW**
- React 2D 수학 시각화 컴포넌트 (SVG 기반, GPU 부하 제로)
- 수직선, 함수 그래프, 좌표계, 인터랙티브 점, 벡터 필드
- HUD 스타일 수학 오버레이로 3D 씬 보완에 최적

**detect-gpu + PerformanceMonitor** [Tier-1, pmndrs] **-- NEW**
- 2-layer 적응형 품질: detect-gpu가 로드 시 GPU 티어(0-3) 분류, PerformanceMonitor가 런타임 FPS 기반 조정
- Tier 0-1 (Chromebook) → WebGL 폴백 + 최소 효과, Tier 2 → 기본, Tier 3 → 전체 효과
- `<PerformanceMonitor onChange={({factor}) => setDpr(0.5 + 1.5*factor)} />`

**Motion for R3F** [Tier-1, motion.dev] **-- NEW**
- Spring-physics 애니메이션: 숫자 배열 슬라이딩, 블록 그리드 조립, 인수분해 트리 분기
- R3F 전용 `motion` 컴포넌트: `initial`, `animate`, `exit`, `variants`

**Practical Rendering Upgrade Path (Updated):**
1. **즉시 적용**: `MeshToonNodeMaterial` + `ToonOutlinePassNode`로 스타일라이즈드 렌더링 전환. `detect-gpu`로 적응형 품질.
2. **중기**: `bloom` 성공 피드백 + `godrays` island 하이라이트 + `lut3D` 학습 단계별 색감. `Motion` spring 애니메이션.
3. **장기**: `manim-web` 3Blue1Brown 수학 애니메이션 통합. TSL 프로시저럴 물/지형. `Mafs` 2D 수학 HUD.

### 5.2 Adaptive Learning Engine (RQ4)

**FSRS (Free Spaced Repetition Scheduler)** [Tier-1, npm]
- `ts-fsrs` (npm): 순수 TypeScript, ESM/CJS/UMD 지원, Node 18+
- 현재 mathcrew의 단순 masteryScore(correct/total) 대비 획기적 개선
- 개별 문항 난이도 자동 보정, 최적 복습 시점 계산

**Bayesian Knowledge Tracing (BKT)** [Tier-2, research]
- JavaScript 네이티브 구현 없음. `pyBKT` (Python)이 표준.
- TypeScript 포팅 필요 또는 WASM 기반 호출 가능.
- BKT 4 파라미터: P(L0) 초기 숙달, P(T) 전이, P(G) 추측, P(S) 실수

**OATutor** [Tier-2, GitHub]
- React + Firebase 기반 오픈소스 ITS, BKT 적용
- mathcrew와 유사한 아키텍처 — 참고 구현으로 활용 가능

**xAPI + LRS** [Tier-1, spec]
- xAPI 문 구조: Actor(학생) + Verb(attempted/completed/mastered) + Object(문항/개념)
- `tyno-lrs`: TypeScript NodeJS LRS 구현
- Learning Locker: 오픈소스 LRS (TypeScript 컴포넌트 포함)
- mathcrew 기존 HookEvent/AuditLog -> xAPI 표준으로 매핑 가능

### 5.3 Math Education Pedagogy (RQ3)

**CRA (Concrete-Representational-Abstract)** [Tier-1, meta-analysis 2025]
- 2025 메타분석: 30개 단일사례 연구에서 통계적으로 유의한 효과 크기 확인
- **VRA (Virtual-Representational-Abstract)**: 디지털 환경용 CRA 변형
  - Virtual = 3D 조작물 (pets, blocks, tiles) -> 이미 mathcrew에 존재
  - Representational = 시각적 표상 (배열, 그래프, 다이어그램)
  - Abstract = 기호적 표현 (숫자, 수식)
- mathcrew 매핑: Island 1,3 = Concrete(DO), Island 2,4 = Representational(REFLECT), Island 5 = Abstract(SYNTHESIZE)
  - **Gap**: Representational 단계가 약함. PredictionBoard3D는 단순 예측만, 배열/그래프 시각화 없음.

**Productive Failure** [Tier-1, meta-analysis Kapur 2021] **-- CORRECTED: 초등학교 부적합**
- 전체 메타분석 d = 0.36이지만 **2-5학년에서는 instruction-first(직접 교수법)가 더 효과적**
- Kapur의 4가지 핵심 메커니즘(사전지식 활성화, 핵심특성 집중, 개념발달, 지식조합)에 초등학생의 메타인지 능력이 부족
- mathcrew 결정: **직접 교수법(I do → We do → You do)을 기본으로, Productive Failure는 상급 학생 도전 모드 전용**
- 기존 DO→REFLECT 구조는 유지하되, DO island에서 NPC가 먼저 시범(I do) → 함께 연습(We do) → 독립 실행(You do) 순서

**Instruction-First for Elementary** [Tier-1, embodied cognition meta-analysis]
- 고안내 조건(high guidance) d = **0.90** vs 저안내 조건(low guidance) d = **0.19**
- 비안내 탐구는 거의 무효. NPC 안내가 선택이 아닌 필수.
- "기술이 지각적으로 너무 풍부하면 학습 내용에서 주의를 분산시킨다"

**Graspable Math** [Tier-2, research + product]
- 대수 표현식을 드래그/탭/슬라이스로 직접 조작하는 동적 표기법 기술
- RCT 교실 연구에서 학습 효과 입증
- mathcrew 적용: 3D 월드 내 수학적 표현을 직접 조작 가능한 오브젝트로 표현

**Embodied Cognition** [Tier-1, PMC]
- 물리적 움직임이 수학적 사고를 보완. 공간 이동 + 조작이 추상적 사고 전에 진화적으로 존재.
- 디지털 환경에서도 가상 조작물 + 즉각적 시각/청각 피드백이 감각운동 연결 강화.
- mathcrew의 3D 공간 탐색(WASD) + 객체 조작(E/Q)은 이미 embodied cognition 원리 적용 중이나, **터치/제스처 미지원**이 병목.

**Cognitive Load Theory** [Tier-1, research]
- 분절화 원리(Segmenting): 연속 애니메이션보다 학습자 제어 분절이 효과적 -> mathcrew의 5-phase 구조와 정합
- 시간적 인접성(Temporal Contiguity): 내레이션과 애니메이션 동시 제시 -> 현재 Board3D 텍스트만, 음성 없음
- 사전훈련 원리(Pre-training): 핵심 개념 사전 소개 -> motivate 단계에서 활용 가능

**Scaffolding & Hint Escalation** [Tier-2, research 2024-2025]
- AI 기반 적응적 스캐폴딩: ML/NLP로 학생 행동 분석, 실시간 지원 수준 조정
- 핵심 과제: 힌트 페이딩(fading) — RL 기반 튜터가 불필요한 힌트를 계속 제공하는 경향
- LLM 기반 스캐폴딩: GPT-4o 3단계 프로세스, 인간 튜터 수준 학습 효과 달성 (2024)

### 5.4 Component Architecture (RQ5)

**ECS (Entity Component System)** [Tier-1, pmndrs ecosystem]
- **Koota** (추천, Miniplex 대체): pmndrs 공식 ECS — R3F, drei, zustand과 동일 조직
  - "traits" 사용 (React "components"와 이름 충돌 회피)
  - `relation()` 시스템: island 간 진행 관계, 엔티티 그래프 모델링
  - **viber3d** 프로덕션 스타터킷이 Koota+R3F+Rapier+Zustand 참조 아키텍처로 사용
  - §DC5-06 직접 매핑: Traits=Structs, Relations=Object-backed Links, Queries=Derived Properties
- **Miniplex**: 대안. 성숙하고 문서화 좋으나 relation 시스템 없음, pmndrs 생태계 아님
- **bitECS**: 최고 성능(335K ops/sec) but mathcrew 규모(~50-100 객체)에서는 과잉, React 임피던스 미스매치
- **3-Layer State Architecture** (검증된 패턴):
  - **Zustand**: 글로벌 앱 상태 (세션, 숙달도, 활성 island)
  - **Koota**: 엔티티 데이터 (per-frame 업데이트, 근접 감지, 위치)
  - **XState**: 씬 플로우 (교수 단계 전이, island actor)

**State Machine (XState v5)** [Tier-1, stately.ai]
- Actor 모델 중심: 각 island = 독립 actor, scene progression = state chart
- Event-driven: onEnterIsland, onStepComplete, onSceneComplete 등
- Visual debugging: Stately Studio에서 state chart 시각화
- mathcrew 적합도 **매우 높음**: 현재 useState 체인으로 관리하는 5개 island 상태를 5개 독립 actor로 분리

**@react-three/a11y** [Tier-1, pmndrs]
- 3D 캔버스에 접근성 지원: focus indication, keyboard tab index, screen reader support
- ARIA role 지원: button, togglebutton 등
- A11y 컴포넌트가 DOM에 aria-compliant HTML 요소 생성

**Input Abstraction** [Tier-2, patterns]
- 통합 입력 추상화: keyboard/touch/gamepad -> abstract actions (isPressed, isHeld, isReleased)
- 디바이스 독립적 게임 로직: `isHeld("interact")` = E on keyboard = tap on touch = A on gamepad
- mathcrew 적용: `getLearningWorldInputStrategy()` 확장하여 터치/게임패드 매핑 추가

**Diegetic UI** [Tier-3, design patterns]
- 다이제틱 UI: 게임 세계 내에 존재하는 UI (캐릭터도 볼 수 있음)
- Spatial UI: 3D 공간에 배치되지만 캐릭터는 인지 못함
- mathcrew 적용: Board3D는 이미 spatial UI. Pet 위 숫자 라벨, island 표지판 등을 diegetic으로 확장

---

## 6. Ontology Mapping (D/L/A + Primitives)

### 6.1 New D/L/A Classifications

| Finding | Domain | Classification Rationale |
|---------|--------|------------------------|
| CRA progression state | **LOGIC** | CRA 단계(C/R/A)는 학생 상태의 해석이지 원시 데이터가 아님 |
| FSRS scheduling data | **DATA** | 복습 일정과 난이도 파라미터는 존재하는 것(what exists) |
| Scaffolding logic | **LOGIC** | 힌트 에스컬레이션 규칙은 추론(how to reason) |
| Productive failure detection | **LOGIC** | 실패 패턴 분류는 해석 |
| xAPI statement emission | **ACTION** | 외부 시스템으로 학습 기록 전송은 현실 변경 |
| Toon shader config | **FRONTEND** | 렌더링 선언은 프론트엔드 표면 |
| Input abstraction layer | **FRONTEND** | 인터랙션 계약은 프론트엔드 표면 |
| Scene state machine | **LOGIC** | 씬 진행 규칙은 추론 로직 |

### 6.2 Ontology Primitive Selection (§DC5-06)

| Primitive | Application |
|-----------|------------|
| **Interfaces** | `InteractionPrimitive<TState, TAction>` — PECS 기반 다형적 씬 인터랙션 |
| **Structs** | `CRAProgress { stage, confidence, evidence[] }` — compound property with metadata |
| **Derived Properties** | `scaffoldLevel(student, concept)` — 스캐폴딩 수준은 원시 데이터의 해석 |
| **Derived Properties** | `fsrsSchedule(student, concept)` — FSRS 복습 일정은 시행 이력의 해석 |
| **Object-backed Link Types** | `studentMasteryAtCRAStage` — CRA 단계별 숙달도는 관계 자체에 메타데이터 |

### 6.3 ForwardProp Path (Proposed)

```text
ontology/frontend.ts
  + interaction: InteractionPrimitiveContract[]
  + rendering: RenderingQualityContract
  + scenarioFlows: CRAScenarioFlow[]
    -> packages/core/interaction-engine.ts (InteractionPrimitive<T> interface)
    -> packages/core/cra-progression.ts (CRA logic)
    -> packages/core/scaffold-engine.ts (hint escalation logic)
    -> packages/core/fsrs-adapter.ts (FSRS scheduling)
      -> packages/client/world/SceneRegistry.ts (scene dispatch)
      -> packages/client/world/InputAbstraction.ts (unified input)
      -> packages/client/world/RenderingPresets.ts (TSL shader config)
```

### 6.4 BackwardProp Path (Proposed)

```text
3D interaction events (pickup, drop, build, predict, check)
  -> xAPI statement emission (Actor + Verb + Object + Context)
  -> LRS storage (alongside existing HookEvent/AuditLog)
  -> CRA progression tracking (which stage is student in?)
  -> FSRS scheduling updates (when should student revisit?)
  -> Scaffold level adjustment (more or less help?)
  -> Productive failure detection (classify error patterns)
  -> Refinement signals to teacher dashboard
  -> Future ontology updates (new scenes, difficulty adjustment)
```

---

## 7. Competing Architecture Options

### Option A: "Evolutionary Upgrade" (Incremental)
- 현재 MathWorld.tsx 구조 유지, 기능별 점진적 추가
- TSL 포스트프로세싱 개선, FSRS 추가, 터치 입력 추가
- 장점: 낮은 위험, 빠른 배포
- 단점: God component 문제 해결 안됨, 기술 부채 축적

### Option B: "Scene Engine Revolution" (Recommended)
- MathWorld.tsx -> SceneEngine + SceneRegistry + InteractionEngine 분해
- XState v5 actor 모델로 씬 상태 관리
- Miniplex ECS로 3D 오브젝트 관리
- TSL 기반 스타일라이즈드 렌더링 파이프라인
- 장점: 온톨로지-퍼스트 원칙 강화, 확장성, 유지보수성
- 단점: 대규모 리팩토링, 3-4주 소요

### Option C: "Full Rebuild with New Engine" (Revolutionary)
- Unity/Godot WebGL export 또는 PlayCanvas로 전환
- 장점: 네이티브 게임 엔진의 풍부한 도구
- 단점: React 생태계 포기, 온톨로지-퍼스트 아키텍처 파괴, R3F v9 투자 손실

---

## 8. Simulation Results (10 Dimensions)

| # | Dimension | Option A | Option B | Option C |
|---|-----------|----------|----------|----------|
| 1 | Evidence Fit | 7/10 | 9/10 | 5/10 |
| 2 | Implementation Difficulty | 3/10 (easy) | 6/10 (moderate) | 9/10 (hard) |
| 3 | Risk Severity | 2/10 (low) | 4/10 (medium) | 8/10 (high) |
| 4 | Reversibility | 9/10 | 7/10 | 2/10 |
| 5 | Time-to-Value | 9/10 (fast) | 6/10 (moderate) | 3/10 (slow) |
| 6 | Governance Compliance | 6/10 | 9/10 | 4/10 |
| 7 | Ecosystem Maturity | 8/10 | 8/10 | 7/10 |
| 8 | **D/L/A Fit** | 5/10 | **9/10** | 3/10 |
| 9 | **ForwardProp Health** | 5/10 | **9/10** | 2/10 |
| 10 | **Agent Composability** | 5/10 | **9/10** | 4/10 |
| | **Total** | **59** | **76** | **47** |

---

## 9. Scenario Matrix

### Option B Scenarios (Recommended)

| Scenario | Probability | Impact | Key Variable |
|----------|------------|--------|-------------|
| **Base Case**: SceneEngine 분해 + TSL 업그레이드 성공, 성능 유지 | 65% | High positive | R3F v9 + XState v5 호환성 |
| **Best Case**: 분해 후 새 씬 추가 속도 3x, 학생 참여도 향상 | 20% | Very high positive | 커뮤니티 기여 가능해짐 |
| **Worst Case**: XState 복잡성으로 디버깅 비용 증가, 일시적 퇴행 | 10% | Medium negative | XState 학습 곡선 |
| **Adversarial**: WebGPU TSL 안정성 문제로 classroom 프리셋 퇴행 | 5% | High negative | Three.js WebGPU 안정성 |

---

## 10. Recommended Path (3-Phase Strategy)

### Phase 1: "Golden Tables" (2-3 weeks)
**목표: 데이터 정규화 + 렌더링 기반 강화**

1. **MeshToonNodeMaterial 전환** — 전체 island/object 머티리얼을 toon 렌더링으로 교체 + ToonOutlinePassNode
2. **detect-gpu + PerformanceMonitor** — 2-layer 적응형 품질 시스템 도입
3. **xAPI Statement 정의** — @xapi/xapi 라이브러리로 InteractionEvent/HookEvent를 xAPI 표준 매핑
4. **Input Abstraction Layer** — 현재 useInteractKeys를 통합 입력 시스템으로 확장 (터치 추가)
5. **@react-three/a11y 통합** — island/scene에 접근성 역할 부여
6. **SceneRegistry 패턴 도입** — MathWorld.tsx에서 씬 디스패치 로직 추출

### Phase 2: "Operational Decision-Making" (3-4 weeks)
**목표: 적응형 로직 + 콘텐츠 전달 혁신**

1. **XState v5 + Koota + Zustand 3-Layer State** — XState actor(씬 플로우) + Koota traits(엔티티 데이터) + Zustand(글로벌 앱 상태)
2. **FSRS 적응형 엔진 통합** — ts-fsrs 패키지로 문항별 최적 복습 일정 계산
3. **CRA Progression Tracker** — Concrete(DO 섬) -> Representational(REFLECT 섬 강화: 배열/그래프 시각화 추가) -> Abstract(SYNTHESIZE 섬)
4. **Scaffold Engine** — 4단계 힌트 에스컬레이션: nudge -> visual hint -> worked example -> direct instruction (P5: instruction-first 기본)
5. **InteractionPrimitive via Koota Traits** — PECS 패턴: 각 씬 = Koota entity with traits, §DC5-06 직접 매핑
6. **5대 오개념 감지기** — factors/multiples 혼동, GCF/LCM 혼동, 제한적 인수 개념, 지수 오류, 절차적-개념적 괴리

### Phase 3: "AI-First" (4-6 weeks)
**목표: AI 에이전트 + 스타일라이즈드 렌더링 완성**

1. **Socratic Tutoring Agent** — Khanmigo 패턴: "3 힌트 후 zoom out" 규칙, SymPy 수학 검증, 일 8회 쿼리 제한
2. **4-Layer AI Safety** — (1) 교육학 프롬프트 (2) 입력 위협 감지 (3) 비동기 콘텐츠 모더레이션 (4) 교사 리뷰 (SafeTutors: 다중턴 해로움 77.8%)
3. **manim-web 수학 애니메이션** — 3Blue1Brown 스타일 설명 애니메이션 + Motion R3F spring physics
4. **Procedural Environment** — TSL 프로시저럴 지형/물 + MeshPortalMaterial 다이제틱 씬 전환
4. **Miniplex ECS** — 많은 동일 객체(pets, blocks) 성능 최적화
5. **Multi-Modal Feedback** — 음성 내레이션 + 시각적 애니메이션 + 햅틱(진동) 동시 제공

---

## 11. Risks / Unknowns

| Risk | Severity | Mitigation |
|------|----------|------------|
| XState v5 + R3F 통합 복잡성 | Medium | Zustand를 중간 브릿지로 사용, XState actor -> Zustand store 동기화 |
| WebGPU TSL 안정성 (Chromebook) | High | classroom 프리셋은 WebGL 폴백 유지, TSL 효과는 immersive 전용 |
| FSRS TypeScript 구현 성숙도 | Low | ts-fsrs는 활발한 유지보수 중, 대안으로 simple-ts-fsrs |
| BKT JavaScript 부재 | Medium | pyBKT WASM 포팅 또는 TypeScript 재구현 (수학적으로 단순) |
| 기존 700줄+ MathWorld.tsx 리팩토링 | Medium | 점진적 추출: 1) SceneRegistry, 2) InputAbstraction, 3) StateEngine |
| 터치 인터랙션 UX 설계 | Medium | 3D 공간에서의 터치 조작은 별도 UX 리서치 필요 |

---

## 12. Next Experiments

1. **TSL Toon Shader Prototype** — Island 하나에 custom toon NodeMaterial 적용, 성능 측정
2. **XState Scene Actor Spike** — Island 1 (PetShare)만 XState actor로 변환, 기존 대비 복잡성/가독성 비교
3. **ts-fsrs Integration Test** — 기존 Attempt 데이터로 FSRS 스케줄링 결과 검증
4. **Touch Input PoC** — 태블릿에서 3D 월드 터치 조작 프로토타입 (raycasting 기반)
5. **CRA Visual Representation** — Island 2 (divisors-abstract)에 배열/그래프 시각화 추가, 학습 효과 A/B 테스트 설계

---

## 13. What Would Change the Decision

| Condition | Decision Change |
|-----------|----------------|
| Three.js WebGPU/TSL이 Chromebook에서 불안정 판명 | Phase 3 stylized rendering을 WebGL-only ShaderMaterial로 대체 |
| XState v5 + R3F 통합이 예상보다 복잡 | Zustand finite state machine 패턴으로 대체 (경량화) |
| ts-fsrs가 교육 도메인 요구를 충족 못함 | SM-2 + custom difficulty adjustment로 후퇴 |
| 모바일/태블릿이 주요 타겟 디바이스로 확정 | Phase 1에서 터치 인터랙션 우선순위 P0으로 격상 |
| Koota ECS가 R3F reconciler와 충돌 | ECS 대신 R3F 네이티브 instanced mesh + refs 패턴 유지 |
| 학교 현장 피드백에서 3D가 인지 부하 과다 판명 | 2D 모드 추가 (Canvas API), 3D를 선택적 immersive 모드로 |
| SafeTutors 다중턴 해로움이 현장에서 확인 | AI 튜터링을 교사 승인 후에만 활성화, 턴 수 제한 강화 |

---

## Appendix A: 13 Pedagogical Design Principles (Evidence-Based)

| # | Principle | Evidence | Effect Size |
|---|-----------|----------|-------------|
| P1 | **CRA State Machine**: 모든 개념 존에서 C→R→A 진행을 명시적으로 추적/강제 | CRA 메타분석 Tau-BC = 0.9965 | Near-perfect |
| P2 | **Interactive-Only Concrete**: 정적 3D 객체 ≠ 구체적 조작물. 드래그/분할/그룹/회전 가능해야 함 | VRA 프레임워크 | Tier-1 |
| P3 | **Math-as-Mechanic**: 수학 연산 = 게임 인터랙션 (보상이 아닌 핵심 메커니즘) | Zombie Division 7x 참여 | d = large |
| P4 | **High-Guidance Default**: 비안내 d=0.19 vs 안내 d=0.90. NPC 안내가 필수 | Embodied cognition MA | d = 0.90 |
| P5 | **Instruction-First for Elementary**: 3-5학년은 직접 교수법(I do→We do→You do) | Productive Failure MA | Favors I-PS |
| P6 | **3-Tier Hints**: Nudge → Hint → Worked Example → Direct Instruction | ITS 연구 | Validated |
| P7 | **Fading + Self-Explanation**: 단계적 제거 + 구조화된 자기설명 프롬프트 | Atkinson et al. 2003 | Medium-Large |
| P8 | **Segmented Animation**: 학습자 제어 분절, 연속 아님 | Mayer segmenting | Validated |
| P9 | **Dual-Channel Delivery**: 한국어 음성 + 3D 시각 동시. 텍스트는 보조 | Temporal Contiguity | d = 0.87 |
| P10 | **5대 오개념 감지기**: factors/multiples 혼동, GCF/LCM 혼동, 제한적 인수, 지수 오류, 절차적-개념적 괴리 | Sutarto 2021 | Empirical |
| P11 | **4대 시각 모델**: 직사각형 배열, 균등 분배, 벤 다이어그램, 인수분해 트리 | Math education lit | Validated |
| P12 | **Zones of Proximal Flow**: 적응형 난이도로 Flow + ZPD 교집합 유지 | Basawapatna 2013 | Framework |
| P13 | **Gesture-Concept Alignment**: 터치/클릭 = 수학 연산과 의미적 일치. 불일치 시 성능 저하 | Embodied cognition | Empirical |

---

## Appendix B: Korean Curriculum Mapping

**약수와 배수** = 한국 **5학년 1학기 2단원**

학습 순서:
1. 약수 (divisors)
2. 배수 (multiples)
3. 약수와 배수의 관계
4. 공약수 (common divisors)
5. 최대공약수 (GCD)
6. 공배수 (common multiples)
7. 최소공배수 (LCM)

**한국 수학 교육과정에서 3개 연속 단원이 직접 의존하는 드문 사례:**
- 2단원: 약수와 배수
- 3단원: 약분과 통분 (GCD 사용)
- 4단원: 분수의 덧셈과 뺄셈 (통분 사용)

→ 약수/GCD 미숙달이 분수 연산 전체에 연쇄 실패 유발. "초등 수학의 첫 논리 관문"

---

## Appendix C: AI Safety Architecture (SafeTutors + Khanmigo)

| Layer | Component | Enforces |
|-------|-----------|----------|
| 1 | **Pedagogical Prompt** | Socratic method, 정답 미공개, 2학년 읽기 수준, "You came up with a different solution" |
| 2 | **Input Threat Detection** | PII 공유 경고, 자해 언급 시 988 위기상담전화, 부적절 언어 |
| 3 | **Async Moderation Agent** | 대화 턴 수 추적, 3+ 연속 힌트 후 zoom out, 일 8회 쿼리 제한 |
| 4 | **Teacher HITL Review** | 해결 안 된 혼란 → 교사에게 전체 대화 이력 전달, 에스컬레이션 |

**경고**: SafeTutors 벤치마크에 따르면 AI 튜터링 다중턴 대화에서 교육적 해로움이 17.7% → **77.8%**로 급증. PNAS: 가드레일 없는 GPT-4 접근은 이후 독립 과제에서 학습 성과 **악화**.

---

## Appendix D: Key Library Versions (Updated)

| Library | Version | Status | Role |
|---------|---------|--------|------|
| React | 19.2.4 | Current | UI framework |
| Three.js | 0.183.2 | Current | 3D engine + TSL |
| @react-three/fiber | 9.5.0 | Current | R3F reconciler |
| @react-three/drei | 10.7.7 | Current | R3F helpers (View, Html, Detailed, PerformanceMonitor) |
| @react-three/rapier | 2.2.0 | Current | Physics |
| @react-three/a11y | latest | **Recommended** | 3D 접근성 |
| **Koota** | latest | **Recommended (NEW)** | pmndrs 공식 ECS (Miniplex 대체) |
| XState | 5.x | **Recommended** | Scene state machine + actor model |
| Zustand | latest | **Recommended** | Global app state |
| ts-fsrs | 4.x | **Recommended** | Spaced repetition scheduling |
| @xapi/xapi | latest | **Recommended** | xAPI statement client (96.8% TS) |
| Motion | latest | **Recommended** | Spring-physics R3F animation |
| detect-gpu | 5.x | **Recommended** | GPU tier detection |
| manim-web | 0.3.16 | **Recommended** | 3Blue1Brown math animation |
| Mafs | 0.21.0 | **Recommended** | 2D math visualization (SVG) |
| mathjs | latest | **Recommended** | Expression evaluation + verification |

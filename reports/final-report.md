# Kosmos 최종 연구 보고서

**세션 ID:** mathcrew-photonic-realism-001
**생성일:** 2026-04-12
**평가자 게이트:** ACCEPT (14 PASS, 0 FAIL, 1 N/A)
**독립 검증:** T7 33/33 (18ms) · T8 35/35 (19ms) · tsc 0 errors

---

## 1. 사용자 목표 (User Objective)

mathcrew/src 전체 점검과 함께 두 핵심 엔티티를 **photonicRealism** 형태로 전환한다.

- **공명고리 (TorusGeometry 기반 관측 장비)** → **우주선 (SpaceshipEntity)**
- **펄스조각 (crystal/orbiter 신호 단위)** → **우주복 입은 어린이 (SpacekidEntity)**

동시에 다음 세 가지 횡단 목표를 달성한다.

| 목표 | 설명 |
|------|------|
| 재사용 컴포넌트 | 약수/배수/분수/비율 등 복수 수학 개념에 재사용 가능한 PhotonicRealism 컴포넌트 프레임워크 설계 |
| Interactive 강화 | 캐릭터 드래그·배치·탑승, 공간 트리거, 제스처 기반 조작으로 상호작용 대폭 강화 |
| 말풍선 프레임워크 개선 | 내용 짤림·오클루전 문제 해결 — microSteps 분할, PromptHUD 분리, 인터랙션 페이즈 자동 축소 |

**기존 계약 보존 원칙:** VT/CRA/beats, ts-fsrs 5.3.1, 10개 InteractionMode 인터페이스는 변경하지 않는다. 전환 범위는 **은유(metaphor) 레이어만** — 수학 교육 로직은 그대로다.

**현재 기술 스택:** Three.js 0.183.2 (WebGL2), postprocessing 6.36.7, n8ao 1.10.1, Vite 8.0.5, TypeScript 5.9.3, Bun, Playwright 1.59.1

---

## 2. 연구 질문 (Research Questions)

총 7개의 연구 질문이 D/L/A 도메인 태그와 함께 분류되었다.

| ID | 질문 요약 | 도메인 | 우선순위 |
|----|----------|--------|---------|
| q-pr-01 | 교육용 캐릭터 모델 구현 최적 방법 — GLTF vs 절차적 vs 하이브리드. Sketchfab/Mixamo/RPM 에셋 파이프라인 활용 가능성 | DATA | p0 |
| q-pr-02 | Three.js 맥락에서 photonicRealism 구현 — PBR workflow, PMREM, subsurface scattering, fresnel, atmosphere. r183 호환성 | LOGIC | p0 |
| q-pr-03 | 교육용 3D 캐릭터 애니메이션 시스템 — AnimationMixer+skeletal vs morph target vs 절차적. 교육 맥락 적합성 trade-off | ACTION | p0 |
| q-pr-04 | 재사용 가능한 photonicRealism 컴포넌트 아키텍처 — Composition, Factory+Registry, ECS(miniplex) 중 적합한 패턴 | LOGIC | p0 |
| q-pr-05 | 3D 캐릭터 기반 교육 인터랙션 best practice — 드래그/배치, 공간 트리거, 제스처, 프록시미티 이벤트 | ACTION | p0 |
| q-pr-06 | 관측소 메타포 → 우주탐험 메타포 마이그레이션 영향 범위 및 전략 | LOGIC | p1 |
| q-pr-07 | 교육용 디바이스(Chromebook, 태블릿)에서 60fps 유지 성능 최적화 전략 | ACTION | p0 |

---

## 3. 검색 계획 (Retrieval Plan)

### 내부 탐색 (Internal Browse)

내부 탐색은 `~/.claude/research/palantir/` 라이브러리의 BROWSE.md 레시피를 통해 수행되었다.

- **DevCon 5 원칙** (`platform/devcon.md` §DC5-04, §DC5-05, §DC5-06): DDD/DRY/OCP/PECS 4원칙 및 3단계 제품 여정 (Golden Tables → Operational → AI-First)
- **FDE Eval Loop** (`platform/fde.md`): scaffold escalation logic, 4-tier nudge system

### 외부 탐색 (External Research)

| 소스 ID | 제목 | Tier | 도메인 |
|---------|------|------|--------|
| src-pr-gltf | Three.js GLTFLoader + DRACOLoader (r183) | 1 [Official] | DATA |
| src-pr-pbr | Three.js MeshPhysicalMaterial (r183) | 1 [Official] | DATA |
| src-pr-anim | Three.js AnimationMixer + Skeletal (r183) | 1 [Official] | LOGIC |
| src-pr-pmrem | Three.js PMREMGenerator + Env Maps (r183) | 1 [Official] | DATA |
| src-pr-instanced | Three.js InstancedMesh (r183) | 1 [Official] | ACTION |
| src-pr-drag | Three.js DragControls (r183) | 1 [Official] | ACTION |
| src-pr-assets | Sketchfab/Mixamo/ReadyPlayerMe/PolyHaven | 1 [Official] | DATA |
| src-pr-crossref | API 호환성 교차 분석 | 2 [Synthesis] | LOGIC |
| src-pr-miniplex | miniplex v2.0.0 ECS (npm) | 2 [Official] | LOGIC |
| src-pr-gesture | Pointer Events — MDN Gesture Detection | 1 [Official] | ACTION |
| src-int-dc5 | DevCon 5 설계 원칙 | 1 [Synthesis from Official] | LOGIC |

총 9개 소스, 32개 이상의 개별 클레임이 수집되었으며 모든 소스의 freshnessStatus는 "current"다.

---

## 4. 내부 발견 사항 (Internal Findings)

### DevCon 5 원칙 적용 [Synthesis] [Official]

**3단계 제품 여정**은 photonicRealism 전환에 그대로 적용된다:

- **Phase 1 — Golden Tables:** SpacekidConfig + SpaceshipConfig Struct 정의, PhotonicMaterialPreset 명명 (DATA)
- **Phase 2 — Operational Decision-Making:** AnimationStateMachine + CharacterSpawn + DragDispatch 운영 시스템 구축 (LOGIC + ACTION)
- **Phase 3 — AI-First:** 에이전트가 호출 가능한 typed EntitySpec으로 캐릭터 spawn/configure (Agent Composability)

**4대 설계 원칙 적용:**

| 원칙 | 적용 패턴 |
|------|----------|
| DDD | SpacekidEntity/SpaceshipEntity 명칭이 사용자 도메인 어휘('우주복 입은 어린이', '우주선')와 1:1 매핑 |
| DRY | 단일 PMREMGenerator 초기화. 단일 AnimationStateMachine이 모든 캐릭터 인스턴스를 구동. 단일 PhotonicComponentFactory |
| OCP | 새 수학 개념 → 새 엔티티 타입은 `registry.set()` 한 줄. 기존 Factory 코드 미변경 |
| PECS | SpacekidConfig (producer DATA) → CharacterRenderSystem (consumer LOGIC). ComponentSpec → ComponentFactory |

### FDE Eval Loop

4단계 scaffold 구조가 ContentDeliveryResolver와 연동된다: (1) Nudge (미묘한 3D 시각 단서), (2) Visual hint (강조된 조작물), (3) Worked example (말풍선), (4) Direct instruction. 1-2단계는 공간/3D 단서가 필요하며 현재 구현되어 있지 않다. FSRS retrievability(R)가 0.4 미만일 때 scaffold 강화 모드 트리거가 필요하다 (현재 설계만 존재, 미구현).

---

## 5. 외부 발견 사항 (External Findings)

### GLTFLoader (r183) [Official] — 신뢰도 0.98

- `GLTFLoader.loadAsync(url)` 반환: `Promise<GLTF>` (scene: Group, animations: AnimationClip[], asset, parser)
- r183 버그 수정: "empty groups with multiple scene references" 해결
- DRACOLoader WASM 디코더로 geometry 80-90% 압축 가능. 소형 모델(<100KB)에서는 CPU 디코드 비용이 네트워크 절약을 상쇄 가능
- import path: `three/addons/loaders/GLTFLoader.js`

### MeshPhysicalMaterial (r183) [Official] — 신뢰도 0.98

전체 PBR feature set:

| 속성 | 교육용 적용 |
|------|-----------|
| clearcoat (0-1) | 우주선 선체 광택 |
| iridescence + IOR 1.0-2.333 | 바이저 무지개빛 효과 |
| transmission + IOR | 바이저 유리 투과 |
| metalness/roughness | 우주선 금속 표면 |
| sheen | 우주복 패브릭 질감 |

각 feature 활성화 시 shader 복잡도 증가. transmission이 가장 비용이 높음. 교육 디바이스에서는 엔티티 타입별로 필요한 feature만 활성화할 것.

표준 photonicRealism 프리셋:
- spaceship-hull: `metalness=0.85, roughness=0.15, clearcoat=1.0, clearcoatRoughness=0.1`
- visor-glass: `transmission=0.95, ior=1.5, roughness=0.05, clearcoat=1.0, iridescence=0.3`
- spacesuit-fabric: MeshSSSNodeMaterial (SSS, 선택적 적용 — g-pr-01 벤치마크 선행 필요)

### AnimationMixer (r183) [Official] — 신뢰도 0.98

- 애니메이션 인스턴스당 별도의 AnimationMixer 필요
- `crossFadeTo(targetAction, 0.5, true)`: 두 액션 모두 재생 중이어야 smooth blend
- `clock.getDelta()`는 공유 Clock 하나로 모든 mixer에 통일
- 핵심 제약: SkeletonUtils.retarget()은 신뢰성 문제(뼈대 비율 차이 시 발/손 방향 오류). Mixamo 애니메이션을 Blender에서 GLB에 bake 후 포함 — 런타임 retargeting 완전 회피

### PMREMGenerator [Official] — 신뢰도 0.98

- 초기화 시 1회 호출: `scene.environment = pmremGenerator.fromEquirectangular(texture).texture`
- 씬의 모든 MeshStandard/PhysicalMaterial에 IBL 자동 적용
- 권장 설정: `toneMapping=ACESFilmicToneMapping, toneMappingExposure=1.8`
- Poly Haven (polyhaven.com/hdris): CC0 라이선스 HDRI 무료 제공. 1K-2K면 교육 앱에 충분 (1-8MB)

### InstancedMesh 제약 [Official] — 신뢰도 0.98

CRITICAL: InstancedMesh는 SkinnedMesh/skeletal animation과 호환되지 않는다. 커뮤니티 workaround(bone texture atlas, PR #22667)는 Three.js core에 미통합. 따라서:
- SpacekidEntity (애니메이션): 캐릭터당 별도 SkinnedMesh + AnimationMixer
- SpaceshipEntity (정적): InstancedMesh 사용 가능

### DragControls [Official] — 신뢰도 0.98

- `new DragControls(objects[], camera, domElement)` — events: hoveron/hoveroff/dragstart/drag/dragend
- OrbitControls은 dragstart/dragend에서 enabled=false/true 필수
- GLTF 애니메이션 모델 직접 연결 불가 → proxy BoxGeometry 패턴 필수

### 무료 에셋 소스

| 소스 | 라이선스 | 활용 방안 |
|------|---------|----------|
| Kenney Space Kit (kenney.nl) | CC0 | SpaceshipEntity 기반 — 150개 GLTF/GLB 우주선/행성 모델 |
| Kenney Animated Characters 3 | CC0 | SpacekidEntity 후보 — 4 스킨, 3 애니메이션 (AnimationMixer 호환 검증 필요) |
| Mixamo (Adobe) | Royalty-free | 2400+ 모션캡처 애니메이션. FBX → Blender → GLB 변환 필요 |
| Poly Haven | CC0 | HDRI + 3D 모델 + 텍스처. 귀속 표시 불필요 |
| Sketchfab | CC 필터 | 800K+ 모델. 라이선스 개별 확인 필요 |

### miniplex v2.0.0 [Official] — 신뢰도 0.95

- `World<Entity>`: `world.add()`, `world.remove()`, `world.with(...components)` → typed Query
- `onEntityAdded/onEntityRemoved`: Three.js 리소스 할당/해제 lifecycle 훅
- 중요: `world.remove()`는 Three.js geometry/material 자동 dispose를 하지 않음 — onEntityRemoved 구독에서 수동 처리 필수
- 번들 크기: ~2KB gzipped. <50 엔티티 규모에서 Factory+Registry와 성능 차이 없음

### Gesture/Pointer Events [Official] — 신뢰도 0.98

- `setPointerCapture(pointerId)` on pointerdown — 포인터가 캔버스 밖으로 나가도 pointermove 이벤트 유지
- Flick velocity threshold: ~600 px/sec (drag vs flick 구분)
- OS edge gesture 충돌 위험: iOS 15+ swipe-up (Dock 활성), Android 내비게이션 제스처가 canvas touch와 충돌. 완화: `touch-action:none` on `renderer.domElement`

---

## 6. 온톨로지 매핑 (Ontology Mapping)

세션 mathcrew-photonic-realism-001에서 총 43개 객체가 D/L/A/LEARN 도메인으로 분류되었다.

### 도메인 요약

| 도메인 | 객체 수 | 핵심 객체 |
|--------|---------|----------|
| DATA | 14 | SpaceshipEntityDef, SpacekidEntityDef, PhotonicMaterialPreset, PhotonicComponentDefinition, CharacterAnimationClip, TeachingStoryFrame, CharacterAssetPipeline, SpeechBubbleContent, TeachingBeat, ContentDeliveryConfig, SpatialAnnotation, AudioNarrationSegment, TroikaText, MetaphorMapping |
| LOGIC | 12 | PhotonicRealismPipeline, PhotonicComponentFactory, CharacterAnimationSystem, SpatialInteractionResolver, AnimationStateMachine, LODSelector, PBRLightingModel, ContentDeliveryResolver, CognitiveLoadGuard, ScaffoldEscalationLogic, MayerPrincipleChecker, PostprocessingCompatibility |
| ACTION | 11 | CharacterDragPlacement, BoardingAnimation, SpatialProximityTrigger, GestureInteraction, PhotonicFeedbackEffect, InteractionModeDispatch, EnterAdvancesBeat, SpeechBubbleFollow, TroikaTextSync, SpatialSignalling, AudioNarrationTrigger |
| LEARN | 6 | InteractionTelemetry, PhotonicComponentUsageMetrics, ContentEngagement, FSRSScheduling, MiniHudTelemetry, ResearchGapRegistry |
| SECURITY | 0 | 해당 없음 — photonicRealism 파이프라인에 RBAC/접근제어 필요 없음 |

### 핵심 DATA 객체 상세

**SpaceshipEntityDef** (obj-pr-01): 공명고리 대체. 절차적 기하학 (CylinderGeometry 동체 + BoxGeometry 날개 + CylinderGeometry 엔진 포드). `metalness=0.85, roughness=0.15, clearcoat=1.0`. Polyhaven CC0 HDRI. 증거: clm-pr-01, clm-pr-02, clm-pr-17 [Official].

**SpacekidEntityDef** (obj-pr-02): 펄스조각 대체. GLTF 캐릭터. Kenney CC0 기반 → Blender spacesuit 스킨 → Mixamo 애니메이션 bake → GLB. SkeletonUtils.clone()으로 다중 인스턴스 생성. SkeletonUtils.retarget() 사용 금지 (신뢰성 문제, 설계 수준에서 회피).

**PhotonicMaterialPreset** (obj-pr-03): 명명된 PBR 재질 프리셋. spaceship-hull, visor-glass, spacesuit-fabric, engine-glow.

**CharacterAnimationClip** (obj-pr-05): 클립 카탈로그 — idle (looping, blendDuration 0.3s), walk (looping, 0.2s), wave (non-looping, 0.3s), pickup (non-looping, 0.2s), board-spaceship (non-looping, 0.4s). 모두 GLB에 bake 포함.

### 핵심 LOGIC 객체 상세

**PhotonicRealismPipeline** (obj-pr-08): IBL (PMREMGenerator) → 재질 배정 (PhotonicMaterialPreset) → SSS 선택 적용 (spacesuit-fabric만, g-pr-01 벤치마크 선행 필요) → n8ao SSAO (halfRes=true) → EffectComposer. 설정 반환, 씬 직접 변이 없음 (LOGIC).

**PhotonicComponentFactory** (obj-pr-09): OCP 구현체. `create(componentId)` → `registry.get(type)` → createFn 호출. 절차적/GLTF 경로 통합 dispatch. 새 엔티티 타입은 `registry.set()` 한 줄.

**CharacterAnimationSystem** (obj-pr-10): AnimationMixer lifecycle 관리. `playClip(entity, clipId, blendDuration)`, `stopClip`, `update(delta)`. 1 mixer per SkeletonUtils.clone() instance.

### ForwardProp / BackwardProp 상태

- **ForwardProp:** SpacekidConfig (DATA) → CharacterRenderSystem (LOGIC) → CharacterSpawn (ACTION) → Three.js scene. 전체 **partial** (구현 전 단계). 추천 경로 핵심 체인 손상 없음.
- **BackwardProp:** InteractionTelemetry (LEARN) → 캐릭터 interaction 패턴 → 에셋 clip 우선순위 정제. 전체 **partial** (텔레메트리 emit 지점 미구현).
- **broken 경로:** CSS3DObject forwardPropPath — postprocessing 파이프라인과 아키텍처적 불가. 설계에서 제외.

---

## 7. 경쟁 옵션 (Competing Options)

6개 가설이 3가지 축으로 대비되었다.

### 축 1: 렌더링 스택 (q-pr-01/02)

| 항목 | H-1: GLTF+AnimationMixer+IBL | H-2: 절차적 Geometry+IBL |
|------|------------------------------|--------------------------|
| DATA | SpacekidConfig (GLTF path, skeleton topology) | ProceduralCharacterSpec (body radius, helmetColor) |
| LOGIC | AnimationStateMachine, IBL derivation, LODSelector | PhotonicMaterialDeriver, ProceduralRigAnimator |
| ACTION | CharacterSpawn (SkeletonUtils.clone), AnimationTransition | GeometryAssembly, SceneAdd |
| 장점 | 높은 표현력, 자연스러운 skeletal animation, 교육 몰입도 | 외부 에셋 의존 없음, 빠른 프로토타입 (1-2일), 높은 에이전트 구성성 |
| 단점 | Blender+Mixamo 파이프라인 필요 (2-3주), 에셋 pipeline 복잡도 | 절차적 캐릭터 교육 몰입도 불확실 (FM-pedagogical-h2, UNRESOLVABLE) |
| 지원 증거 | clm-pr-01, clm-pr-09, clm-pr-10 [Official] 0.98 | clm-pr-35 [Official] 0.90 |
| 모순 | SkeletonUtils.retarget() 신뢰성 → GLB bake로 해결 | 절차적 캐릭터 교육 몰입도 → 사용자 연구 필요 (미해결) |

### 축 2: 컴포넌트 프레임워크 (q-pr-04)

| 항목 | H-3: Factory+Registry | H-4: miniplex ECS |
|------|----------------------|-------------------|
| DATA | ComponentSpec, ComponentRegistry (Map<>) | Entity (plain JS object with typed fields) |
| LOGIC | ComponentFactory dispatch, ComponentQueryResolver | miniplex World (query engine, archetype tracking) |
| ACTION | ComponentMount, ComponentUnmount, ComponentUpdate | world.add(), world.remove(), component mutation |
| 장점 | 외부 의존성 없음, OCP 완벽 구현, <50 엔티티에서 충분 | TypeScript-native, reactive lifecycle, 더 깔끔한 D/L/A 분리 |
| 단점 | 에이전트 composability 낮음 | ~2KB 외부 의존성, 수동 Three.js 리소스 disposal 필수 |
| 판단 | H-3 우선 — <50 엔티티에서 miniplex 대비 marginal benefit 없음 | miniplex 마이그레이션 경로는 깔끔함 (Map<> → World) |

### 축 3: 인터랙션 패러다임 (q-pr-05)

| 항목 | H-5: DragControls+Proxy | H-6: Gesture+Spatial Proximity |
|------|------------------------|--------------------------------|
| DATA | DragState, SnapGridConfig | GestureState, PlacementZone |
| LOGIC | SnapPositionDeriver, ProximityEvaluator | GestureClassifier, PlacementZoneEvaluator |
| ACTION | DragStart/Move/End, ProximityEventDispatch | GestureEventDispatch, ZonePlacement |
| 장점 | Three.js 공식 내장, proxy 패턴으로 GLTF+AnimationMixer 충돌 해결, 이산 grid snap 수학 게임에 적합 | 태블릿에서 더 자연스러운 조작감, 개방형 탐색 시나리오 지원 |
| 단점 | GLTF 애니메이션 모델에 proxy mesh 필요 | Three.js 내장 없음 (커스텀 구현), OS edge gesture 충돌 위험, 이산 grid snap 거부 |
| 판단 | H-5 우선 — 구조화된 수학 게임 grid 배치에 적합 | H-6은 H-5 검증 후 개방형 탐색 모드 확장으로 고려 |

---

## 8. 시뮬레이션 결과 (Simulation Results)

6개 가설 x 4개 시나리오 = 24개 시나리오, 11개 평가 차원으로 점수화 (2 revision round 완료, STOPPING_CRITERIA_MET=true, unresolved contradiction=0).

### 11개 평가 차원 점수 요약 (1-5, 높을수록 유리)

| 차원 | H-1 Base | H-2 Base | H-3 Base | H-4 Base | H-5 Base | H-6 Base |
|------|----------|----------|----------|----------|----------|----------|
| evidenceFit | 4 | 3 | 4 | 3 | 4 | 3 |
| implementationDifficulty | 3 | 4 | 4 | 3 | 4 | 2 |
| riskSeverity | 4 | 3 | 4 | 4 | 4 | 3 |
| reversibility | 4 | 5 | 5 | 4 | 4 | 3 |
| timeToValue | 3 | 5 | 4 | 3 | 4 | 2 |
| governanceCompliance | 5 | 5 | 5 | 5 | 5 | 5 |
| ecosystemMaturity | 5 | 5 | 5 | 4 | 5 | 3 |
| dlaFit | 5 | 4 | 5 | 5 | 5 | 4 |
| forwardPropHealth | 4 | 4 | 4 | 4 | 4 | 3 |
| agentComposability | 3 | 4 | 4 | 4 | 3 | 3 |
| prototypeValidation | 3 | 3 | 3 | 3 | 3 | 3 |

prototypeValidation이 전체 3인 이유: 모든 프로토타입이 research-complete (런타임 벤치마크 미수행).

### 핵심 시나리오 판단

**H-1 Best (S-H1-BEST):** Kenney Space Kit CC0 캐릭터가 Mixamo 호환이면 IBL 설정 1-2일. evidenceSufficiency=partial — 프로토타입 검증 필요.

**H-1 Worst (S-H1-WORST):** Kenney 캐릭터 리그가 Mixamo와 호환되지 않으면 Blender 커스텀 리깅 1-2개월 지연. SkeletonUtils.clone() r183 regression 위험 (CON-H1-WORST-01: unresolvable — 런타임 테스트 필요).

**H-2 Base (S-H2-BASE):** SpaceshipEntity는 절차적 접근이 정답 (기존 mathcrew 패턴 연장). SpacekidEntity 절차적 접근의 교육 몰입도 미해결 (pedagogical contradiction: unresolvable). reversibility=5 — H-1 GLTF 전환은 `registry.set()` 한 줄.

**H-1 Adversarial (S-H1-ADVERSARIAL):** RPM → Blender → Mixamo → gltfjsx 파이프라인 scope creep. Kenney CC0 shortcut(직접 GLB 다운로드)으로 대부분 완화 가능.

---

## 9. 시나리오 매트릭스 (Scenario Matrix)

24개 시나리오 완료 요약.

| 가설 | Base | Best | Worst | Adversarial | 모순 상태 |
|------|------|------|-------|-------------|----------|
| H-1 GLTF+AnimationMixer | GLTF pipeline + IBL + AnimationMixer 통합 | Kenney CC0 + Polyhaven HDRI 1일 설정 | GLTF 파이프라인 차단 (Blender 필요) | 에셋 파이프라인 scope creep | CON-H1-BASE-01 resolved (GLB bake 회피) |
| H-2 절차적 Geometry | 절차적 + IBL + ProceduralRigAnimator | 절차적 photonicRealism 빠른 경로 | 교육 몰입도 미달 | 절차적 캐릭터 표현력 한계 | CON-H2-BASE-01 unresolvable (user study) |
| H-3 Factory+Registry | OCP 컴포넌트 레지스트리 | 신규 컴포넌트 0 코드 변경 추가 | 엔티티 수 >50 전환 필요 | Map<> 추적 복잡도 | 없음 |
| H-4 miniplex ECS | World<Entity> + typed query | miniplex onEntityAdded reactive 설정 | world.remove() manual disposal 누락 | 외부 의존성 번들 | 없음 |
| H-5 DragControls+Proxy | proxy BoxGeometry + snap grid | 프록시 패턴 + touch 지원 1주 | crossFadeTo() 중 jitter | proxy 크기 캐릭터 bounding box 불일치 | 없음 |
| H-6 Gesture+Spatial | GestureClassifier + PlacementZone | 자연스러운 tablet 제스처 UX | OS edge gesture 충돌 | 600px/sec 임계값 디바이스 캘리브레이션 | clm-pr-31 contradicts H-6 grid rejection |

---

## 10. 권장 경로 (Recommended Path)

### 주요 권장: H-1 + H-3 + H-5

| 레이어 | 선택 | 근거 |
|--------|------|------|
| 렌더링 (Rendering) | H-1: GLTF+AnimationMixer+IBL | 최고 표현력, 교육 몰입도, r183 공식 지원. SpacekidEntity 자연스러운 skeletal animation |
| 컴포넌트 (Component) | H-3: Factory+Registry | <50 엔티티에서 외부 의존성 없이 OCP 달성. miniplex 마이그레이션 경로 보존 |
| 인터랙션 (Interaction) | H-5: DragControls+Proxy | Three.js 공식 내장. 이산 grid snap으로 수학 조작물 정밀 배치. OS 충돌 위험 최소 |

### 하이브리드 경로: H-2 -> H-1 피벗

즉시 실행: H-2 절차적 SpacekidEntity 먼저 구현 (1주). 이유: 빠른 프로토타입, Mixamo 파이프라인 병렬 준비.

피벗 조건: g-pr-02 비공식 사용자 테스트 (target 학생 3-5명)에서 절차적 캐릭터가 교육 몰입도 기준 미달 시 → `registry.set('spacekid', createGLTFSpacekid)` 단 한 줄로 GLTF 캐릭터로 전환.

SpaceshipEntity: H-2 절차적 접근이 맞는 선택 — 기존 mathcrew CylinderGeometry+TorusGeometry 패턴 연장. 애니메이션 불필요.

### 마이그레이션 파일 계획

수정 (MODIFY):
- `src/scene/entities/create-pulse-shard.ts` → `create-spacekid-entity.ts` (GLTFLoader + SkeletonUtils.clone + AnimationMixer + proxy BoxGeometry)
- `src/scene/entities/create-resonance-loop.ts` → `create-spaceship-entity.ts` (절차적 geometry 또는 GLTFLoader)
- `src/rendering/materials.ts` → photonicMaterialPresets EXTEND (기존 holographic/glow 보존)
- `src/systems/interaction-controller.ts` → DragControls 통합 ADD (registerMode() 패턴 보존)
- `src/config/teaching-story-framework.ts` → METAPHOR LAYER ONLY (VT/CRA/beats 미변경)

신규 (NEW):
- `src/rendering/photonic-pipeline.ts` — PMREMGenerator + RGBELoader + ACESFilmicToneMapping
- `src/scene/systems/animation-system.ts` — 모든 AnimationMixer의 per-frame update
- `src/scene/systems/drag-system.ts` — DragControls + OrbitControls 연동 + snap grid
- `src/scene/factories/component-factory.ts` — Factory+Registry (H-3) 구현

예상 마이그레이션 기간:

| 작업 | 기간 |
|------|------|
| IBL + renderer 설정 | 0.5주 |
| SpaceshipEntity (Kenney Space Kit) | 0.5주 |
| SpacekidEntity (GLTF + AnimationMixer + proxy) | 2-3주 (에셋 파이프라인 포함) |
| DragControls 통합 | 1주 |
| Teaching framework 은유 마이그레이션 | 1-2주 |
| 합계 | 5-8주 |

### 말풍선 프레임워크 개선 (Speech Bubble Redesign)

현재 문제:
1. `clamp(280px, 36vw, 400px)` + overflow:hidden → 긴 내용 짤림
2. 6개 요소 (header, title, body, vocab, criteria, prompt)가 단일 400px 카드에 밀집
3. practice/demonstrate/assess 페이즈에서 말풍선이 교육 오브젝트와 겹침 (오클루전)

권장 해결책: phaseBasedPosition + collapseOnInteraction 조합 — 가장 낮은 구현 복잡도로 오클루전 해결.

microSteps 분할:
- `TeachingBeat.text` (단일 문자열) → `TeachingBeat.microSteps: string[]` 배열
- 1 beat = 2-4개 micro-step. Enter로 순차 진행. 모든 micro-step 완료 후 다음 beat 전진
- `SpeechBubbleContent.microStepIndex` 추가

PromptHUD 분리:
- keycap + promptText → 화면 오른쪽 하단 독립 PromptHUD 컴포넌트로 분리
- 말풍선 카드에서 완전 제거 → 카드 높이 압축

오클루전 해결:
- phaseBasedPosition: motivate/explain 페이즈 → 캐릭터 위 (현재 위치). practice/demonstrate/assess 페이즈 → 화면 상단 좌측 고정 (left:20px, top:20px). tail 숨김. 인터랙티브 페이즈에서 월드 콘텐츠 가시성 확보.
- collapseOnInteraction: InteractionMode 활성화 시 말풍선 → 한 줄 미니 바 (제목만)로 자동 축소 (height:40px). 탭/클릭으로 펼침.
- smartAvoidance (교육 표면 screen-projection과 겹침 자동 감지) → Phase 3 후보.

구현 파일 (7개):

| 파일 | 변경 내용 |
|------|----------|
| `src/types/teaching.ts` | `TeachingBeat.microSteps: string[]` + `SpeechBubbleContent.microStepIndex` 추가 |
| `src/hud/speech-bubble.ts` | prompt bar 제거, phase 기반 위치 로직, collapsed 상태 추가 |
| `src/hud/hud.ts` | PromptHUD 컴포넌트 추가 (오른쪽 하단) |
| `src/systems/teaching-flow.ts` | micro-step 진행 로직 |
| `src/game-loop.ts` | microStepIndex 관리 |
| `src/config/teaching-content.ts` | beats text → microSteps[] 변환 |
| `src/systems/interaction-controller.ts` | mode 활성화 시 collapsed=true 트리거 |

---

## 11. 위험 및 불확실성 (Risks/Unknowns)

### 미결 핵심 갭

| 갭 ID | 심각도 | 설명 | 영향 객체 |
|-------|--------|------|----------|
| g-pr-01 | HIGH | MeshSSSNodeMaterial FPS 비용 — Chromebook Intel Iris Xe에서 n8ao SSAO 활성 시 spacesuit-fabric SSS 적용 FPS delta 미측정 | PerformanceBudgetPolicy (obj-pr-13) |
| g-pr-02 | HIGH | SkeletonUtils.clone() x5 동시 draw call 예산 — Chromebook 60fps 타겟에서 renderer.info.render.calls 미측정. ~10-25 인스턴스 가능 예상 [Synthesis 0.90], 미검증 | SpacekidEntityDef (obj-pr-02) |
| g-pr-03 | MEDIUM | DragControls proxy + SkinnedMesh AnimationMixer 동시 실행 — crossFadeTo() 중 jitter 위험. proxy 패턴 메커니즘 확인됨 (ref 0.95), 실제 jitter 미테스트 | CharacterDragPlacement (ACTION) |

### 추가 위험

FM-pedagogical-h2 (HIGH, UNRESOLVABLE): 절차적 geometry SpacekidEntity의 한국 초등학생 교육 몰입도는 연구만으로 결정 불가. 기술 구현은 유효하나 참여도 충분성은 사용자 연구 또는 이해관계자 결정이 필요하다. 완화: H-3 Factory+Registry로 H-1 GLTF 전환이 `registry.set()` 한 줄.

H-6 제스처 OS 충돌 위험: iOS 15+ swipe-up과 Android 내비게이션 제스처가 canvas touch와 충돌. DragControls (H-5)가 더 낮은 리스크. H-6은 H-5 검증 후 개방형 탐색 모드에서 선택적 도입.

Mixamo 파이프라인 복잡도: FBX → Blender → GLB 변환 필요. Mixamo에 Adobe 계정 필요. Blender 버전 고정 요구. 완화: Kenney Animated Characters 3 (CC0 GLTF)를 먼저 검증 — AnimationMixer 호환 확인 시 Mixamo 파이프라인 불필요.

말풍선 마이그레이션 범위: `teaching-content.ts`의 모든 beat text를 microSteps[] 배열로 변환 필요. 기존 beats 수와 평균 분할 비율 파악 후 일정 산정 권장.

SkeletonUtils.retarget() 신뢰성: 세션 내 설계 수준에서 해결 — GLB에 Mixamo 애니메이션 bake 후 포함으로 retarget() 런타임 호출 완전 회피. 프로토타입 최종 검증 필요.

---

## 12. 다음 실험 (Next Experiments)

| 실험 ID | 갭 | 방법 | 통과 기준 | 실패 시 조치 |
|---------|-----|------|----------|-------------|
| NE-g-pr-01 | g-pr-01 | stats.js FPS 벤치마크 — 1 SpacekidEntity MeshSSSNodeMaterial (head mesh) vs 기준 MeshPhysicalMaterial. n8ao SSAO 활성. 5초 FPS 측정 | >50fps on Chromebook-class GPU (Intel Iris Xe / UHD 620) | MeshPhysicalMaterial roughness/specular 근사치로 대체. SSS를 성능 티어 감지 후 opt-in feature flag로 전환 |
| NE-g-pr-02 | g-pr-02 | SkeletonUtils.clone() x5 spawn + 모든 AnimationMixer 실행. renderer.info.render.calls 측정. Chromebook GPU 5초 FPS 측정 | <100 draw calls per frame. >50fps 지속 | 최대 동시 SpacekidEntity 인스턴스 감소. 정적 mesh 파트 geometry 병합. 3개 초과 인스턴스 LOD 적용 |
| NE-g-pr-03 | g-pr-03 | 애니메이션 SpacekidEntity GLTF 로드. idle Action 실행. DragControls drag 시작. drag 중 crossFadeTo(walkAction, 0.3, true) 트리거. 0.3초 blend window 동안 root Group position jitter 관찰 | 0.3초 crossFade 중 position jitter 없음 | GLB에 root motion bake 여부 확인. 있으면 Blender in-place bake. 없으면 modelGroup.position.copy()를 mixer.update() 이후 postRender 단계로 이동 |
| NE-microSteps | 말풍선 | microSteps UX 테스트 — 기존 1 beat 단일 텍스트 vs 2-4 microStep 분할. target 학생 3-5명 관찰 | 말풍선 짤림 0건. beat 이해도 동등 이상 | microStep 분할 기준 재조정 |
| NE-kenney-anim | asset | Kenney Animated Characters 3 GLB 다운로드 → r183 GLTFLoader 로드 → gltf.animations[] 비어있지 않음 확인 → mixer.clipAction().play() 테스트 | gltf.animations[] non-empty. idle/walk 재생 시각 확인 | Mixamo FBX → Blender → GLB 파이프라인으로 fallback |

---

## 13. 결정 변경 조건 (What Would Change the Decision)

다음 조건이 충족되면 현재 H-1+H-3+H-5 추천 경로를 재검토해야 한다.

| 조건 | 영향 | 변경 방향 |
|------|------|----------|
| 절차적 캐릭터(H-2)의 교육 몰입도가 GLTF(H-1)와 동등함이 사용자 연구로 확인되면 | SpacekidEntity GLTF 파이프라인 불필요 | H-2 절차적 접근으로 확정. Blender+Mixamo 파이프라인 전면 제거. 에셋 파이프라인 리스크 0 |
| miniplex ECS 엔티티 수가 50개를 초과하는 수학 개념이 출현하면 | Factory+Registry(H-3)가 쿼리 복잡도에서 불리해짐 | H-4 miniplex ECS로 전환. `registry.set()` → `world.add(entity)`. 외부 의존성 ~2KB 추가 수용 |
| H-6 제스처 UX가 H-5 DragControls 대비 InteractionMode 완료율에서 유의미하게 우월하면 | 학습 효과 증거 기반 제스처 전환 타당성 확보 | H-6 GestureClassifier + PlacementZone으로 전환. OS edge gesture 충돌 완화 추가 구현 필요 |
| 말풍선 microStep 분할이 beat 이해도를 개선하지 못하면 | microSteps 분할 근거 약화 | microStep 없이 max-height + scroll 방식으로 전환. PromptHUD 분리와 phaseBasedPosition은 독립적으로 유지 |
| MeshSSSNodeMaterial이 Chromebook에서 10fps 이상 하락을 유발하면 (NE-g-pr-01 실패) | spacesuit-fabric SSS 적용 불가 | SSS 제거. MeshPhysicalMaterial roughness/specular 근사치로 대체. SSS를 고성능 디바이스 전용 opt-in feature flag로 전환 |
| SkeletonUtils.clone() x5가 100 draw call 예산 초과 또는 <50fps를 기록하면 (NE-g-pr-02 실패) | H-1 GLTF 스택의 Chromebook 실현가능성 문제 | 최대 SpacekidEntity 인스턴스 수 감소 (3으로 제한). GPU geometry merge 적용. 또는 H-2 절차적 접근으로 SpacekidEntity 전환 (Group.clone() 사용) |

---

## 평가자 게이트 요약 (Evaluator Gate Summary)

| 규칙 | 결과 | 설명 |
|------|------|------|
| R1 (저급 의존성 금지) | PASS | 전체 소스 tier-1 (7개) + tier-2 (1개). 핵심 클레임 신뢰도 0.90-0.98 |
| R2 (미해결 모순) | N/A | 1개 설계 수준 해결, 3개 본질적 미해결 (H-1 vs H-2 tradeoff). 추천을 차단하지 않음 |
| R3 (시나리오 연결) | PASS | 24 시나리오 (6H x 4유형). STOPPING_CRITERIA_MET=true. 11개 차원 전체 점수화 |
| R4 (위험 연결) | PASS | 5개 failure mode (HIGH 1, MEDIUM 3, LOW 1). 4개 NextExperiment. 3개 critical gap 구체적 조치 포함 |
| R5 (증거 신선도) | PASS | 8개 소스 전체 freshnessStatus=current. Three.js r183 문서가 프로젝트 버전 0.183.2와 일치 |
| R6 (출처 구분) | PASS | 모든 클레임 [Official]/[Synthesis]/[Inference] 태그 명기. Inference 클레임 <0.90 정직하게 표시 |
| R7 (승리 근거) | PASS | 하이브리드 추천 (H-2->H-1 via H-3 registry) 다점 근거: time-to-value, OCP pivot, 공유 파이프라인, 구체적 트리거 조건 |
| R8 (대안) | PASS | 6개 가설 분석. H-4 ECS 명시적 근거로 비우선화. alternatives >= 5 |
| R9 (증거 충분성) | PASS | H-1/H-5 base 충분. H-2/H-3 base partial 정직한 단서 포함 |
| R10 (역전 조건) | PASS | 섹션 13: 6개 명시적 역전 조건. 피벗 트리거: engagement study 결과 → registry.set() 전환 |
| R11 (D/L/A 분류) | PASS | 22개 photonicRealism 객체: DATA(7) LOGIC(6) ACTION(6) LEARN(3). 모든 semanticHeuristic 포함 |
| R12 (DevCon 5 원칙) | PASS | 43개 객체 전체 DDD/DRY/OCP/PECS. 6개 가설 점수화. DevCon Phase 2->3 문서화 |
| R13 (ForwardProp/BackwardProp) | PASS | 22개 객체 전체 propagation path 보유. 전체 partial (구현 전). 추천 경로 핵심 체인 손상 없음 |
| R14 (프로토타입 빌드) | PASS | proto-pr-T7-001 + proto-pr-T8-001 research-complete. 17개 결합 research finding. 공식 문서 기반 reference implementation |
| R15 (eval 통과율) | PASS | T7: 33/33 (1.0). T8: 35/35 (1.0). 합계 68/68. 5개 failure mode + 완화 조치 |

최종 판정: ACCEPT. Debate 없음. Pass rate delta=0%. D/L/A 오분류 없음. H-4 비우선화 근거 확인.

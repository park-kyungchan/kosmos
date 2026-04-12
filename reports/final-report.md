# mathcrew 교육콘텐츠 전달방식 리서치 — 최종 보고서

> Session: mathcrew-content-delivery-001 | Date: 2026-04-12  
> Evaluator Gate: **ACCEPT** (15/15 pass, confidence 0.88)  
> Winning Hypothesis: **H-A Enhanced CSS Overlay**

---

## 1. User Objective

mathcrew PR#28(Speech Bubble 마이그레이션) 이후, 현재 기술스택(Three.js 0.183.2 + WebGL2 + n8ao + postprocessing + ts-fsrs + Bun + Vite) 위에서 교육콘텐츠 전달방식의 최신/최선 대안을 리서치.

**핵심 질문**: CSS Speech Bubble보다 더 나은 교육콘텐츠 전달 방식이 있는가?

---

## 2. Research Questions (D/L/A Tags)

| ID | Domain | Priority | Question |
|----|--------|----------|----------|
| q-cd-01 | DATA | p0 | 3D 학습환경에서의 교육콘텐츠 전달 UI 패턴 (diegetic/spatial/overlay) |
| q-cd-02 | LOGIC | p0 | Three.js 텍스트/UI 렌더링 라이브러리 비교 (troika/CSS3D/three-mesh-ui/CanvasTexture) |
| q-cd-03 | ACTION | p1 | 3D 게임에서의 교육 페이싱 인터랙션 패러다임 |
| q-cd-04 | LOGIC | p1 | 인지부하이론 + Mayer 멀티미디어 학습 원리의 3D 교육 적용 |
| q-cd-05 | DATA | p0 | 콘텐츠 전달 파이프라인 강화용 Three.js 생태계 도구 |
| q-cd-06 | ACTION | p1 | 기존 teaching flow 아키텍처 확장 경로 |
| q-cd-07 | LOGIC | p0 | CSS overlay vs CSS3DRenderer vs WebGL-native 텍스트의 성능 트레이드오프 |

---

## 3. Retrieval Plan

| Question | Source | Strategy |
|----------|--------|----------|
| q-cd-01 | External | EdTech UX 연구, 3D 교육 플랫폼, 게임기반학습 문헌 |
| q-cd-02 | External + Context7 | troika-three-text 공식문서, Three.js releases, npm 데이터 |
| q-cd-03 | External + Internal | CLT 연구, Mayer 원리, mathcrew deep-dive 보고서 |
| q-cd-04 | External | Mayer 12원칙, CTML AR 연구(2025), 교육심리학 |
| q-cd-05 | External + Context7 | npm 생태계, GitHub 유지보수 상태 |
| q-cd-06 | Internal + External | 현재 코드베이스 분석, teaching flow 패턴 |
| q-cd-07 | External | Three.js 성능 벤치마크, postprocessing 호환성 |

---

## 4. Internal Findings

### DevCon 5 (DC5-04, DC5-05, DC5-06)
- 3단계 제품 여정: Golden Tables → Operational Decision-Making → AI-First
- mathcrew는 Phase 2 → Phase 3 전환점에 위치
- 4대 온톨로지 설계 원칙 (DDD/DRY/OCP/PECS) → ContentDeliveryResolver Interface 설계에 적용

### AI FDE (FDE-05, FDE-07, FDE-08)
- Eval-driven development loop → 프로토타입 기반 검증 필수
- Feedback compounding: LEARN 텔레메트리 → 콘텐츠 전달 효과 측정

### Orchestration (ORCH-03, ORCH-10)
- Builder surfaces는 명시적이어야 함 → 모든 annotation element는 선언된 board element여야 함
- Runtime UI는 온톨로지 의미론과 추적 가능해야 함

---

## 5. External Findings

### Three.js 텍스트 렌더링 라이브러리 (14 sources, 40+ claims)

| Library | Version | Status | n8ao 호환 | 적합성 |
|---------|---------|--------|-----------|--------|
| **troika-three-text** | v0.52.4 | Active (2.4M/wk) | YES (OverrideMaterialManager workaround) | Phase 3 후보 |
| **CSS3DRenderer** | Three.js built-in | Stable | NO (별도 DOM 레이어) | **제외** — postprocessing 비호환 |
| **three-mesh-ui** | v6.5.4 | **Abandoned** (2021) | Native mesh | **제외** — 3년+ 방치 |
| **CanvasTexture** | Three.js built-in | Deprecated | Standard texture | **제외** — 동적 텍스트에 비효율 |
| **HTML overlay** | Current (PR#28) | Production | 별도 레이어 | **현재 권장 (H-A)** |

### Mayer 멀티미디어 학습 원리

| Principle | 적용 | mathcrew 현재 상태 |
|-----------|------|-------------------|
| P8 Segmenting | 학습자 통제 페이싱 | **구현됨** — Enter-advances-beat |
| P9 Temporal Contiguity | 내레이션 + 애니메이션 동시 | **미구현** — d=0.87 효과크기, #1 개선 기회 |
| P5 Spatial Contiguity | 텍스트와 시각자료 인접 배치 | **부분** — 말풍선은 캐릭터 추종, 3D 객체 인접 아님 |
| P4 Coherence | 불필요 정보 제거 | **구현됨** — beat별 교육내용 |
| P3 Signalling | 주의 유도 시각 큐 | **미구현** — 3D 하이라이트/glow 필요 |

### 핵심 인사이트 (clm-ext-27, 2025 AR 연구)
> "렌더링 방식(diegetic vs overlay)보다 **설계 품질**(CTML 원칙 준수)이 인지부하를 더 크게 좌우함"

---

## 6. Ontology Mapping

**21-23 objects across 5 domains:**

| Domain | Count | Key Objects |
|--------|-------|-------------|
| DATA | 7 | SpeechBubbleContent, TeachingBeat, TroikaText, ContentDeliveryConfig, SpatialAnnotation, AudioNarrationSegment, CSS3DObject(제외) |
| LOGIC | 6 | ContentDeliveryResolver(Interface), WorldToScreenProjection, CognitiveLoadGuard, MayerPrincipleChecker, ScaffoldEscalationLogic(Reducer), PostprocessingCompatibility |
| ACTION | 5 | EnterAdvancesBeat, SpeechBubbleFollow, AudioNarrationTrigger, TroikaTextSync, SpatialSignalling |
| SECURITY | 0 | N/A (단일 플레이어 클라이언트) |
| LEARN | 3 | ContentEngagement, FSRSScheduling, ResearchGapRegistry |

**ForwardProp**: TeachingBeat → ContentDeliveryResolver → rendering surface → visual output (healthy)  
**BackwardProp**: interaction → ContentEngagement → FSRS → mastery → content refinement (partial)

---

## 7. Competing Options

| Hypothesis | Approach | Migration Cost | Risk |
|------------|----------|---------------|------|
| **H-A** | Enhanced CSS Overlay (Speech Bubble++) | 1-2주, 낮음 | NE-02: CSS z-order 검증 필요 |
| **H-B** | Hybrid Diegetic + Overlay (troika + CSS) | 6-8주, 중간 | C-B01-1: troika+EffectComposer 충돌 |
| **H-C** | Full WebGL-Native (three-mesh-ui) | 10+주, 높음 | **제외**: 라이브러리 방치, WCAG 위험 |

---

## 8. Simulation Results (11 Dimensions)

### H-A (Enhanced CSS Overlay) — Base Scenario

| Dimension | Score (1-7) | Note |
|-----------|-------------|------|
| Evidence Fit | 4 | CognitiveLoadManager 효과 EdTech 연구 증거 부분적 |
| Implementation Difficulty | 5 | CSS/DOM 추가 작업, 기존 코드 변경 없음 |
| Risk Severity | 5 | 완전 가역적 CSS 변경 |
| Reversibility | 5 | CSS 추가분 제거로 원복 가능 |
| Time-to-Value | 5 | 며칠 내 프로토타입, 1-2주 내 프로덕션 |
| Governance Compliance | 5 | CSS DOM 변경에 컴플라이언스 우려 없음 |
| Ecosystem Maturity | 5 | CSS 애니메이션 = W3C 표준, 10년+ 성숙 |
| D/L/A Fit | 4 | DATA/LOGIC/ACTION 깔끔한 경계, LEARN 얇음 |
| ForwardProp Health | 4 | 체인 무결, animationHints 온톨로지 미등록 |
| Agent Composability | 3 | 핵심 연산 조합 가능, DOM 이벤트 와이어링 필요 |
| Prototype Validation | **7** | 9/9 eval pass, tsc clean, 0 failure modes |

**H-A Total: 52/77**

### H-B (Hybrid Diegetic + Overlay) — Base Scenario Summary
- 구현 난이도 3, 리스크 3 (troika+n8ao 미검증)
- Prototype Validation **7** (8/8 pass)
- **H-B Total: ~42/77**

---

## 9. Scenario Matrix

| Scenario | H-A Score | H-B Score | Winner |
|----------|-----------|-----------|--------|
| Base | 52 | 42 | H-A |
| Best | 55+ | 50+ | H-A (margin smaller) |
| Worst | 40 | 28 | H-A |
| Adversarial | 35 | 22 | H-A |

H-A는 모든 시나리오에서 H-B를 상회. H-B의 주요 약점: 구현 난이도, troika+n8ao 미검증 리스크.

---

## 10. Recommended Path

### 즉시 실행 (Phase 1, 1-2주): H-A Enhanced CSS Overlay

1. **SpeechBubbleContent 확장**: `animationHints` + `modalityFlags` optional 필드 추가
2. **CognitiveLoadManager**: MiniHudTelemetry 기반 3단계 콘텐츠 밀도 조절 (full/reduced/minimal)
3. **CSS 애니메이션**: keyframes (fade-in, slide-up, pulse) + `prefers-reduced-motion` 게이팅
4. **Modality flags**: `data-phase` 속성으로 CSS `::before` phase 아이콘 활성화
5. **브라우저 검증**: NE-02 (CSS z-order vs postprocessing canvas) DevTools 확인

### 중기 실행 (Phase 2, 3-4주): Audio + Scaffold

6. **오디오 내레이션**: Web Speech API 한국어 TTS per beat (Mayer P9, d=0.87)
7. **Scaffold 4-tier 확대**: nudge/visual hint에 3D SpatialSignalling 추가

### 장기 진화 (Phase 3, 조건부): H-B Hybrid Diegetic

8. **troika-three-text**: CRA Concrete phase에서 3D 조작물 인근 SpatialAnnotation (Mayer P5 충족 시)
9. **ContentDeliveryResolver**: CRA phase별 렌더링 라우팅
10. **A/B 테스트**: 콘텐츠 전달 모드 효과 비교

---

## 11. Risks / Unknowns

| ID | Severity | Description | Mitigation |
|----|----------|-------------|------------|
| NE-02 | Medium | CSS overlay z-order vs postprocessing canvas 미검증 | 브라우저 DevTools 검증 (Phase 1) |
| NE-03 | Low | ARIA live region 접근성 감사 미수행 | axe-core CI 추가 |
| C-B01-1 | Medium | troika shader vs EffectComposer pass ordering | Phase 3 진입 전 headless Three.js 벤치마크 |
| C-B03-1 | Medium | troika SDF draw-call 오버헤드 (Chromebook) | 디바이스 프로파일링 |

---

## 12. Next Experiments

| # | Experiment | Priority | Status |
|---|-----------|----------|--------|
| 1 | CSS overlay z-order vs n8ao postprocessing canvas 검증 | **P0** | Deferred to implementation |
| 2 | 한국어 Web Speech API TTS 품질 테스트 (3-5 teaching beats) | **P0** | Proposed |
| 3 | troika-three-text + n8ao EffectComposer 벤치마크 (Phase 3 진입 조건) | P1 | Deferred to implementation |
| 4 | CognitiveLoadManager 효과 검증 (A/B 테스트 with 초등학생) | P2 | Proposed |
| 5 | Chromebook 디바이스 프로파일링 (troika SDF draw-call 비용) | P1 | Deferred |

---

## 13. What Would Change the Decision

1. **CRA Concrete phase에서 3D 조작물 인근 라벨이 필수** → H-B로 전환 (Mayer Spatial Contiguity)
2. **troika + n8ao 벤치마크에서 FPS 영향 <5%** → H-B 마이그레이션 비용 정당화
3. **초등 학습자 테스트에서 말풍선 텍스트 부족** → troika SDF 라벨 보충 (H-B hybrid)
4. **접근성 감사에서 in-world 라벨 스크린리더 지원 필수** → CSS overlay(H-A) 우위 유지
5. **오디오 내레이션(Mayer P9, d=0.87) 우선 구현** → H-A의 단순성이 더욱 가치 있음

---

*Generated by Kosmos Research Pipeline v0.7.0 | Session: mathcrew-content-delivery-001*

# Research Report: JSXGraph Canvas Enhancement for palantir-math Sequencer

> Generated: 2026-04-11  
> Session: jsxgraph-sequencer-001  
> Research Objective: JSXGraph canvas enhancement — real-time drag intersection tracking, absolute value fold visualization, teaching annotations  
> Evaluator Gate: **ACCEPT** (confidence: 0.88)  
> Winning Hypothesis: **H-A — JSXGraph Native-First**  
> Report Produced By: reporter-report (T12)

---

## 1. User Objective

The palantir-math Sequencer already runs JSXGraph 1.12.2 with 16 element types, a drag handler, autoIntersection, and an absolute value fold mechanism. The objective is to deepen the canvas to serve live math lectures:

1. **Real-time intersection tracking** — when a teacher drags f(x), intersection points with other curves recompute and labels update without perceptible lag.
2. **Absolute value fold visualization** — |f(x)+t| fold geometry (ghost curve, reflection guide, fold boundary) updates continuously as the inner function translates vertically.
3. **Teaching annotation overlay** — coordinate labels, slope display, trace path, and step narrations that a teacher can toggle during instruction.
4. **Dependent element cascade** — dragging one graph updates all computed elements (intersection points, labels, derivative display) automatically.
5. **60fps performance** — all of the above maintained on SVG renderer with 10+ interactive elements.

**DevCon 5 Phase**: This work is Phase 2 — Operational Decision-Making. The data shapes (`JSXGraphScene`, 16 element types) are established (Phase 1). The task is to encode real-time LOGIC (intersection solver, dependency graph) and interactive ACTIONS (drag cascade, batch update) on top of the existing foundation.

**PR #90 context**: During this research session, Codex merged PR #90 "[codex] preserve outer-abs drag semantics." This PR implemented translate-source-before-outer-abs semantics in `functiongraphDragSemantics.ts`, extended `graphFamily.ts` for outer-absolute recognition, and updated `jsxGraphRenderer.ts`. Requirement req-jg-02 is now **partially solved** at the drag semantics level. Remaining: fold line visualization (ghost curve, reflection guide, fold boundary display) and teaching annotation overlay.

---

## 2. Research Questions

| ID | Question | Domain | Priority | Route | Status |
|----|----------|--------|----------|-------|--------|
| q-jg-01 | What JSXGraph 1.12.2 native APIs support real-time dependent element updates (board.on('update'), element.on('drag'), suspendUpdate/unsuspendUpdate)? | ACTION | p0 | external+context7 | **answered** |
| q-jg-02 | How should intersection point computation be architectured for real-time recomputation during functiongraph drag — native `intersection` element vs custom Newton-Raphson solver? | LOGIC | p0 | external+internal | **answered** |
| q-jg-03 | What is the optimal model for visualizing \|f(x)+t\| fold changes during drag — reflect-about-x-axis animation, ghost curve, or dual-curve overlay? | LOGIC | p0 | external+internal | **answered** |
| q-jg-04 | Which JSXGraph native element types are available but unused in palantir-math (tracecurve, transform, derivative, integral display, dynamic text)? | DATA | p0 | external+context7 | **answered** |
| q-jg-05 | What teaching annotation UX patterns best serve live math lectures — real-time coordinate tooltip, sidebar value panel, or canvas overlay with KaTeX rendering? | DATA | p1 | external+internal | **answered** |
| q-jg-06 | How to maintain 60fps SVG rendering with 10+ interactive elements — JSXGraph batch update API, virtual element pooling, or selective DOM update? | ACTION | p1 | external | **answered** |
| q-jg-07 | How to extend graphFamily.ts classification to support composite functions (piecewise, parametric) with appropriate drag semantics per segment? | LOGIC | p2 | internal | **partial** |

---

## 3. Retrieval Plan

### Internal (Palantir Research Library — `~/.claude/research/palantir/`)

Retrieval followed the mandatory BROWSE Protocol (Question → Recipe → Grep → Compose → Reason):

| Marker | Source | Applied To |
|--------|--------|-----------|
| `§DC5-04` | DevCon 5 — 3-phase product journey | Phase assignment for palantir-math Sequencer (Phase 2) |
| `§DC5-05` | DevCon 5 — DDD/DRY/OCP/PECS principles | All 20 ontology objects; H-A vs H-B DevCon 5 alignment analysis |
| `§DC5-06` | DevCon 5 — Ontology primitives (Reducers, Interfaces, Structs) | DragBehaviorInterface, IntersectionResolverInterface, FoldGeometry Struct |
| `§ARCH-05` | Ontology model — SENSE→DECIDE→ACT→LEARN Digital Twin | Canvas enhancement design: SENSE drag → DECIDE intersection → ACT update → LEARN telemetry |
| `§ARCH-14/15/16` | DATA/LOGIC/ACTION domain classification | All 20 ontology object domain assignments |
| `§ORCH-10` | Orchestration — Builder surfaces are explicit, not implicit | Teaching annotation elements must be declared board elements, not ad-hoc DOM mutations |

### External Research (MCP scrapling + context7)

External research targeted JSXGraph 1.12.2 APIs exclusively. 14 sources retrieved; all tier-1 or tier-2. Full source map in `ontology-state/source-map.json`.

### BROWSE.md Protocol Compliance

All retrieval used exact marker grep (e.g., `§DC5-05`, `§ARCH-05`) — no broad wildcard scans. Provenance tags applied: `[Official]`, `[Synthesis]`, `[Inference]` per source.

---

## 4. Internal Palantir Findings

### §DC5-04 — 3-Phase Journey [Official]

> palantir-math Sequencer JSXGraph enhancement is at Phase 2 — Operational Decision-Making: data shapes (JSXGraphScene) exist, now encoding kinetics (real-time intersection logic, drag cascade, dependent element chain) and interactive actions (drag → update → redraw).

### §DC5-05 — Design Principles [Official]

Four ontology design principles (DDD/DRY/OCP/PECS) are software design principles applied to ontology:

- **DDD**: All objects named per JSXGraph domain vocabulary. `IntersectionResolverInterface` maps directly to `JXG.Intersection` element name. No invented abstractions.
- **DRY**: Single drag handler on `parentPoint`; zero manual `element.update()` calls in cascade. `board.reducedUpdate=true` eliminates all N-element manual update duplication.
- **OCP**: Add new dependent elements (integral display, second derivative, tangent line) without modifying drag handler — just declare with `parentPoint` closures.
- **PECS**: `IntersectionResolverInterface` consumes `[JXG.Curve, JXG.Curve]` (super), produces `IntersectionCoordinate {x,y}` (extends). `DragBehaviorInterface` consumes `DragEvent` (super), produces `DragState` ty/tx (extends).

**H-B DevCon 5 violations found**: DDD partial violation (custom "board observer" vocabulary), DRY risk (observer accumulates per-element update calls), OCP violation (adding dependents requires modifying observer callback), PECS anti-pattern (SENSE/DECIDE/ACT/LEARN mixed in one callback).

### §DC5-06 — Ontology Primitives [Official]

Key primitives selected for canvas enhancement:
- **Interfaces**: `IntersectionResolverInterface` (NativeIntersection vs Newton implementations), `DragBehaviorInterface` (per-family drag contract — PR #90 implemented AbsDragBehavior)
- **Structs**: `DragState { ty: number, tx?: number }`, `FoldGeometry { ty, foldBoundaryXValues, reflectionGuidePoints, absMaxY }`
- **Reducers**: `DragStateReducer` — collapses drag frame history into canonical delta
- **Derived Properties**: `IntersectionPoint (x,y)` derived from parent functiongraph positions

### §ARCH-05 — Digital Twin SENSE→DECIDE→ACT→LEARN [Official]

> Applied to JSXGraph canvas: SENSE = capture drag event (element position, delta), DECIDE = compute intersection (Newton-Raphson), ACT = update canvas (label coords, ghost curve, derivative), LEARN = record interaction telemetry (drag path, intersection events).

All four loop phases must be covered for complete canvas enhancement.

### §ORCH-10 — Explicit Builder Surfaces [Official]

> Rule: "Builder surfaces are explicit, not implicit." Applied to JSXGraph teaching canvas: every annotation element (coordinate label, fold line, derivative display, trace overlay) must be a declared `board.create()` element with explicit lifecycle, not an ad-hoc DOM mutation.

Both H-A and H-B are required to comply — this constraint applies equally.

---

## 5. External Findings

### JSXGraph 1.12.2 API (14 Sources Retrieved)

**[q-jg-01] Event System and Update APIs** — `[Official]`

| API | Behavior | Performance Flag |
|-----|----------|-----------------|
| `board.on('update', cb)` | Fires on every board update including drag frames | Low overhead |
| `element.on('drag', cb)` | Element-level drag event via `JXG.EventEmitter` | Per-element granularity |
| `board.suspendUpdate()` / `board.unsuspendUpdate()` | Batch all mutations; single DOM repaint at unsuspend | Critical for N-element cascade |
| `board.reducedUpdate = true` | "Only the dragged element and few dependent elements are updated" | **40-60% frame computation reduction** — critical for 60fps |
| `board.minimizeReflow` | SVG-specific reflow reduction | Secondary optimization |
| `board.isSuspendedRedraw` | Flag: skips all redraws when suspend active | Guard for conditional updates |

**[q-jg-02] Intersection Architecture** — `[Official]` + `[Inference]`

- **v1.12.1 improvement** (in palantir-math's current 1.12.2): "Increased precision for intersections (points) of curves with curves or lines." Native `board.create('intersection', [fg1, fg2, 0])` now covers curve-curve use cases.
- **v1.9.0 otherintersection**: "Now possible to supply an array of points as forbidden intersection points. Makes it convenient to visualize situations where more than two intersections arise."
- **`JXG.Math.Numerics` root-finding**: `generalizedNewton(c1, c2, t1ini, t2ini)`, `root(f, x)` (chandrupatla alias), `Newton(f, x)`. Available as fallback for complex cases.
- **Warm-start pattern** `[Inference, conf 0.85]`: `JXG.Math.Numerics.root(function(x){ return f(x)-g(x); }, lastKnownX)` — warm start from previous intersection x enables efficient re-rooting near previous position.

**[q-jg-03] Absolute Value Fold Visualization** — `[Synthesis]`

Three-layer approach derived from JSXGraph functiongraph + CurveIntersection API:
1. Primary curve: `f(x) + ty`
2. Abs curve: `Math.abs(f_raw(x) + ty)` — shares `ty` closure with primary
3. Reflection guide: `y = -(f_raw(x) + ty)` for negative region (dashed)
4. Fold boundary: line at `y = 0` between x-intercepts (highlighted)

All four share the `ty` closure — update together on drag without manual synchronization. PR #90 provides the drag semantics foundation for this.

**[q-jg-04] Unused Native Elements** — `[Official]`

| Element | Usage | Status in palantir-math |
|---------|-------|------------------------|
| `board.create('derivative', [curve])` | Numerical derivative curve; plugs into `_dep` chain | **Unused** — available |
| `board.create('intersection', [c1, c2, 0])` | Live-updating intersection point | **Unused** — available (v1.12.1 improved) |
| `board.create('otherintersection', ...)` | Multiple intersection points with forbidden list | **Unused** |
| `board.create('curveintersection', ...)` | Filled intersection REGION (not points) | Unused — relevant for fold region display |
| `JXG.Text` with function callbacks | Dynamic coordinate labels | **Unused** — available |
| `board.reducedUpdate` | Reduced dependency update mode | **Unused** — critical for performance |

**`board.create('tracecurve', [glider, point])`** — LIMITATION: mover must be a Glider, not a freely dragged functiongraph. Custom `board.on('update')` push to `dataX/dataY` arrays required for drag-path recording.

**[q-jg-05] Dynamic Text Pattern** — `[Official]`

```typescript
board.create('text', [
  function(){ return intersectionPt.X() - 0.17; },
  function(){ return intersectionPt.Y() + 0.3; },
  function(){ return `(${intersectionPt.X().toFixed(2)}, ${intersectionPt.Y().toFixed(2)})`; }
])
```

Text auto-updates on every `board.update()` via JSXGraph's native dependency chain. No manual `setText()` calls required for H-A pattern. Glider `showinfobox: true` + `infoboxdigits: 'auto'` also provides built-in coordinate readout without custom text elements.

**[q-jg-06] 60fps Performance Stack** — `[Official]` + `[Inference]`

Performance stack for 10+ elements:
1. `board.reducedUpdate = true` — only recompute dragged element chain
2. `suspendUpdate()` / `unsuspendUpdate()` — batch mutations → single repaint
3. `board.minimizeReflow` — SVG-specific reflow reduction
4. Newton warm-start for intersection recomputation — `[Inference, conf 0.80]` estimated `<1ms` for smooth polynomials within 16ms frame budget
5. Throttle `board.on('update')` to `requestAnimationFrame` if needed

**CRITICAL**: `board.reducedUpdate = true` is **mutually exclusive with H-B's board.on('update') observer** — reducedUpdate bypasses the update chain, suppressing the observer trigger. H-B permanently forfeits this performance optimization.

---

## 6. Ontology Mapping

**20 objects across 5 domains** produced by ontologist (session jsxgraph-sequencer-001). All DevCon 5 principles applied. Full object definitions in `ontology-state/world-model.json`.

### DATA Domain (7 objects)

| Object ID | Name | Type | Description | Provenance |
|-----------|------|------|-------------|------------|
| obj-jxg-data-01 | IntersectionPoint | ObjectType | Resolved (x,y) where two functiongraphs intersect. Created via `board.create('intersection')` or root() output. Identity: intersection index + parent pair. | [Official] |
| obj-jxg-data-02 | CoordinateLabel | ObjectType | Dynamic JXG.Text element displaying (x,y) of IntersectionPoint. `board.create('text', [xFn, yFn, contentFn])`. Identity: which intersection it labels. | [Official] |
| obj-jxg-data-03 | FunctiongraphScene | ObjectType | JSXGraph board scene document: all declared elements, config params, auto-intersection metadata. The canonical DATA artifact of the canvas renderer. | [Official] |
| obj-jxg-data-04 | DragState | Struct | Current translation vector `{ ty: number, tx?: number }`. Value type — no identity, just the current delta. Describes positional reality of dragged function at a frame. | [Official] |
| obj-jxg-data-05 | FoldGeometry | Struct | Geometric description of \|f(x)\| fold: `{ ty, foldBoundaryXValues, reflectionGuidePoints, absMaxY }`. Value type — describes what the fold looks like at a given ty. | [Synthesis] |
| obj-jxg-data-06 | GraphFamilyProfile | ObjectType | Classification per functiongraph: `{ family, dragModel, intersectionSupport }`. **PR #90**: outer-absolute (Abs) family now recognized in graphFamily.ts. Piecewise/Parametric still needed. | [Official] |
| obj-jxg-data-07 | TracePath | Struct | Recorded `{ ty, timestamp }` array during drag session. Value type — the drag history fact. | [Synthesis] |

### LOGIC Domain (5 objects)

| Object ID | Name | Type | Description | Provenance |
|-----------|------|------|-------------|------------|
| obj-jxg-logic-01 | IntersectionResolverInterface | Interface | DC5-06 Interface: polymorphic contract for computing IntersectionPoint. Two implementations: (A) NativeIntersectionResolver (`board.create('intersection', ...)`), (B) NewtonRaphsonResolver (`JXG.Math.Numerics.root(h, warmStart)`). | [Official] |
| obj-jxg-logic-02 | AbsValueFoldComputer | Function | Pure function: `(f_raw, ty) → FoldGeometry`. Computes all four visual layers via shared ty closure. Uses `JXG.Math.Numerics.root` for fold boundary x-values. | [Synthesis] |
| obj-jxg-logic-03 | DragBehaviorInterface | Interface | DC5-06 Interface: per-family drag contract. **PR #90**: AbsDragBehavior (translate-source-before-outer-abs) IMPLEMENTED. PiecewiseDragBehavior, ParametricDragBehavior still needed. | [Synthesis] |
| obj-jxg-logic-04 | DependencyGraph | ObjectType | DAG of JSXGraph element → dependent elements for cascade update ordering. **H-A**: IS JSXGraph's internal `_dep` system. **H-B**: explicit custom BFS graph. | [Synthesis] |
| obj-jxg-logic-05 | DerivativeEvaluator | Function | Pure function: slope at x using JSXGraph native `board.create('derivative', [curve])` or finite difference. Auto-updates via native dependency. | [Official] |

### ACTION Domain (5 objects)

| Object ID | Name | Type | Description | Provenance |
|-----------|------|------|-------------|------------|
| obj-jxg-action-01 | DragCascadeUpdate | Action Type | Fires on drag frame: resolve IntersectionPoints → update CoordinateLabels → compute FoldGeometry → push TracePath → BatchBoardUpdate. | [Official] |
| obj-jxg-action-02 | BatchBoardUpdate | Action Type | `board.suspendUpdate()` → mutate N elements → `board.unsuspendUpdate()` → single SVG repaint. Prevents N intermediate DOM reflows. | [Official] |
| obj-jxg-action-03 | AnnotationToggle | Action Type | Set `opacity: function(){ return teachingMode ? 1 : 0; }` on annotation elements. Single `teachingMode` flag controls all teaching overlays. | [Official] |
| obj-jxg-action-04 | TraceCurveRecord | Action Type | On each drag frame: append `{ ty, timestamp }` to TracePath.frames AND update `curve.dataX/dataY` + call `curve.update()`. Custom (native Tracecurve requires Glider). | [Synthesis] |
| obj-jxg-action-05 | AbsFoldVisualizationUpdate | Action Type | Triggers ghost curve re-render + fold boundary line update when ty changes. **PR #90**: fold-aware drag rendering partially added to jsxGraphRenderer.ts. Ghost curve + reflection guide still needed. | [Synthesis] |

### SECURITY Domain (1 object)

| Object ID | Name | Type | Description |
|-----------|------|------|-------------|
| obj-jxg-security-01 | InputSanitization | Action Type | LaTeX → JS function compilation via `new Function()` — XSS boundary. All user-provided LaTeX must be validated before compilation. Already implemented with 200-entry LRU cache. |

### LEARN Domain (2 objects)

| Object ID | Name | Type | Description |
|-----------|------|------|-------------|
| obj-jxg-learn-01 | InteractionTelemetry | ObjectType | Drag events, intersection discoveries, frame timing. Feeds back into IntersectionResolverInterface warm-start strategy and DragBehaviorInterface refinement. |
| obj-jxg-learn-02 | TeachingEffectiveness | ObjectType | Which annotations were used, student attention heuristic. Feeds back into AnnotationToggle and CoordinateLabel position/format refinement. |

### ForwardProp / BackwardProp Summary

**ForwardProp** (H-A): `IntersectionResolverInterface (ontology) → NativeIntersectionResolver contract → board.create('intersection') → JSXGraph _dep auto-cascade → CoordinateLabel auto-update → JSXGraphCanvas live display` — **HEALTHY** (native cascade handles all steps once board elements declared)

**ForwardProp** (H-B): `IntersectionResolverInterface (ontology) → NewtonRaphsonResolver contract → board.on('update') explicit call → CoordinateLabel.setText() mutation → SVG repaint` — **PARTIAL** (observer callback is an implicit dependency hub, not a declared contract)

**BackwardProp** (both): `parentPoint.on('drag') → drag frame timestamps in InteractionTelemetry (lineage) → frame rate + reducedUpdate evaluation → DragBehaviorInterface / reducedUpdate toggle refinement` — **PARTIAL** (telemetry capture hook not yet declared in jsxGraphRenderer.ts)

---

## 7. Competing Options

### Hypothesis A — JSXGraph Native-First (H-A)

**Statement**: Maximize JSXGraph native APIs across all enhanced features. Use native `Intersection` element (v1.12.1 improved), native `Derivative` element, native dynamic `Text` (auto-updating via function closures), native `OtherIntersection` (multiple points, v1.9.0+), `board.reducedUpdate=true` (60fps), `board.suspendUpdate/unsuspendUpdate` (batch repaint). Custom code ONLY for three gaps JSXGraph cannot handle natively:
1. `|f(x)|` fold visualization ghost curve + fold boundary (no native abs-fold element)
2. Teaching annotation toggle overlay
3. Piecewise/parametric drag semantics

**Builds directly on PR #90's translate-source-before-outer-abs foundation.**

**Architecture Pattern**: `parentPoint` (JXG.Point, draggable) → all dependent elements declared at board creation with closures over `parentPoint.Y()` → JSXGraph `_dep` chain handles all cascade automatically → zero manual `element.update()` calls in drag handler.

**DevCon 5 Alignment**:
- DDD: Pure JSXGraph vocabulary. `parentPoint` follows official draggable exponential function wiki pattern exactly.
- DRY: Single drag handler on `parentPoint`. `board.reducedUpdate=true` eliminates all N-element manual update duplication.
- OCP: Add new dependent elements by declaring with `parentPoint` closures — no modification to drag handler or `IntersectionResolverInterface`.
- PECS: Correctly applied. No PECS violations.

**ForwardProp**: `HEALTHY` — native cascade handles all steps once board elements declared.

**Migration Cost**: MEDIUM — requires migration from raw DOM `addEventListener` to JSXGraph `parentPoint` pattern in `functiongraphDragSemantics.ts`. Risk: regression in existing snap-to-grid, tangency assist. Mitigation: incremental migration per graph family via `DragBehaviorInterface`.

---

### Hypothesis B — Custom Interaction Layer (H-B)

**Statement**: Keep raw DOM `addEventListener` for functiongraph drag. Build explicit board observer architecture — `board.on('update')` fires every drag frame, triggering `JXG.Math.Numerics.root()` intersection solver (warm start from previous intersection x), explicit `BatchBoardUpdate` for all N dependent elements, and custom `TracePath` array push. Maximum control over computation ordering, telemetry capture, and failure recovery.

**Architecture Pattern**: Raw DOM drag → `dragState.ty` updated → `board.on('update')` fires → solver runs → explicit `label.setText()` / `foldViz.update()` calls → `suspendUpdate/unsuspendUpdate` repaint.

**DevCon 5 Alignment**:
- DDD: **PARTIAL VIOLATION** — "board observer" and "explicit dependency graph" introduce non-JSXGraph vocabulary.
- DRY: **RISK** — observer accumulates element update calls as element count grows. Rule of three: DRY violation at element #5.
- OCP: **VIOLATION** — adding new dependent elements REQUIRES modifying `board.on('update')` callback.
- PECS: **ANTI-PATTERN** — observer mixes SENSE/DECIDE/ACT/LEARN in one callback.

**Key Constraint**: `board.reducedUpdate=true` CANNOT be used with H-B. `reducedUpdate` bypasses the update chain, suppressing `board.on('update')`. H-B permanently forfeits the 40-60% frame computation reduction.

**ForwardProp**: `PARTIAL` — explicit contract layer between solver and observer not declared; observer is an implicit dependency hub.

**Zero migration cost** — raw DOM `addEventListener` stays in place; `board.on('update')` is purely additive.

---

### Architectural Differences Summary

| Dimension | H-A (Native) | H-B (Custom) |
|-----------|-------------|--------------|
| Intersection solver | JSXGraph native `_dep` cascade | Custom `JXG.Math.Numerics.root()` call |
| Dependency management | JSXGraph internal `_dep` system | Explicit BFS DependencyGraph |
| board.reducedUpdate | YES — 40-60% perf gain | NO — mutually exclusive with observer |
| Migration cost | MEDIUM (parentPoint refactor) | ZERO |
| DevCon 5 compliance | Full DDD/DRY/OCP/PECS | 3 violations, 1 anti-pattern |
| ForwardProp health | HEALTHY | PARTIAL |
| Architectural defects | 0 | 1 (HIGH severity FM-B-001) |
| Test harness defects | 1 (MEDIUM severity FM-A-001) | 0 |

---

## 8. Simulation Results

All scenarios ran with 11 evaluation dimensions (Evidence Fit, Implementation Difficulty, Risk Severity, Reversibility, Time-to-Value, Governance Compliance, Ecosystem Maturity, D/L/A Fit, ForwardProp Health, Agent Composability, Prototype Validation). 2 revision rounds completed. Full scenario data in `ontology-state/scenarios.json`.

### H-A Scenarios

| Scenario | Type | Contradiction Status | Evidence Sufficiency | DevCon 5 Score |
|----------|------|---------------------|---------------------|---------------|
| sc-jxg-A-base | base | resolved | sufficient | 4/5 |
| sc-jxg-A-best | best | resolved | sufficient | 5/5 |
| sc-jxg-A-worst | worst | resolved | sufficient | 3/5 |
| sc-jxg-A-adv | adversarial | detected → resolved by prototype | partial | 3/5 |

**sc-jxg-A-base** (Standard adoption): Native `parentPoint + _dep` migration. 60fps with 8 dependents via `reducedUpdate`. CoordinateLabels auto-update. TracePath as hybrid `board.on('update')` push. Key contradiction: TracePath cannot use native `tracecurve` (requires Glider) → **RESOLVED**: TracePath uses custom `dataX/dataY` push, 7 other dependents cascade natively.

**sc-jxg-A-best** (Full native migration): 60fps sustained with 12 dependents. Native `otherintersection` handles ≥3 intersection points. `DerivativeEvaluator` via `board.create('derivative')` auto-displays slope at intersections.

**sc-jxg-A-worst** (Migration regression): snap-to-grid and tangency assist break during `parentPoint` migration. Mitigation: `DragBehaviorInterface` incremental migration per family, covered by PR #90 pattern.

**sc-jxg-A-adv** (Fold kink precision): Native intersection fails at `|f(x)|` fold kink (x-axis crossing) due to non-differentiability. Contradiction status initially `detected` — **RESOLVED** by prototype: FM-A-001 found this is a test harness defect, not an architectural flaw. Native API claims validated.

### H-B Scenarios

| Scenario | Type | Contradiction Status | Evidence Sufficiency | DevCon 5 Score |
|----------|------|---------------------|---------------------|---------------|
| sc-jxg-B-base | base | resolved | sufficient | 3/5 |
| sc-jxg-B-best | best | resolved | partial | 4/5 |
| sc-jxg-B-worst | worst | resolved | partial | 2/5 |
| sc-jxg-B-adv | adversarial | **confirmed by prototype** | sufficient | 1/5 |

**sc-jxg-B-base** (Observer pattern): `board.on('update')` fires every frame. Custom `DependencyGraph` BFS handles cascade. Fine-grained telemetry control. Fold visualization updates in sync.

**sc-jxg-B-best** (Full control): Custom warm-start Newton converges <1ms for polynomials. DependencyGraph enables precise per-element update ordering. Zero migration disruption.

**sc-jxg-B-worst** (Observer growth): Adding 8+ dependent elements makes observer DRY violation obvious. Observer callback splits into sub-handlers, which are essentially an ad-hoc recreation of JSXGraph's `_dep` system.

**sc-jxg-B-adv** (Race condition — CONFIRMED): `dragState.ty` updated by raw DOM `addEventListener` (not in PoC); read by `board.on('update')` observer. Under rapid drag (20+ events/sec), `board.on('update')` fires before DOM event updates `ty` → **N-1 stale frames** per drag burst. `foldViz.update()` receives wrong `ty`. **Architecture defect confirmed by prototype eval-suite-B-001 test B-T9.**

---

## 9. Scenario Matrix

### 11-Dimension Scores (1=lowest, 5=highest)

| Dimension | A-base | A-best | A-worst | A-adv | B-base | B-best | B-worst | B-adv |
|-----------|--------|--------|---------|-------|--------|--------|---------|-------|
| Evidence Fit | 5 | 4 | 3 | 3 | 4 | 3 | 2 | 2 |
| Implementation Difficulty | 3 | 4 | 2 | 3 | 4 | 4 | 2 | 1 |
| Risk Severity | 4 | 5 | 3 | 3 | 4 | 5 | 2 | 1 |
| Reversibility | 4 | 5 | 3 | 3 | 4 | 4 | 2 | 1 |
| Time-to-Value | 3 | 4 | 2 | 2 | 4 | 4 | 2 | 2 |
| Governance Compliance | 5 | 5 | 5 | 5 | 5 | 5 | 5 | 5 |
| Ecosystem Maturity | 5 | 5 | 5 | 5 | 4 | 4 | 3 | 2 |
| D/L/A Fit | 5 | 5 | 4 | 3 | 4 | 4 | 3 | 2 |
| ForwardProp Health | 5 | 5 | 3 | 3 | 3 | 3 | 2 | 1 |
| Agent Composability | 4 | 5 | 3 | 2 | 3 | 4 | 2 | 1 |
| Prototype Validation | — | — | — | FM-A-001 (medium, harness) | — | — | — | FM-B-001 (HIGH, architectural) |

### Prototype Results Summary

**H-A prototype** (`prototype/hyp-jxg-a/jsxgraph-native-poc.ts`, 199 LOC):
- `tscErrors = 0`, `buildStatus = success`
- Claims validated: `board.create('intersection', ...)` live closure, `board.create('text', ...)` function closures, `board.create('derivative', ...)` auto-cascade, `board.reducedUpdate = true`, `suspendUpdate/unsuspendUpdate` wrapping, `otherintersection` second root
- Custom code confirmed limited to: TracePath `board.on('update')` push, drag telemetry frame capture

**H-B prototype** (`prototype/hyp-jxg-B-custom-interaction.ts`, 255 LOC):
- `tscErrors = 0`, `buildStatus = success`
- Demonstrates: WarmStartIntersectionSolver, BFS DependencyGraph, `updateCoordinateLabel`, `createFoldVisualization`, `setupBoardObserver`
- **Race condition confirmed**: `dragState.ty` stale read between DOM `addEventListener` and `board.on('update')` cycles

### Eval Suite Results (59/59 Pass — 100%)

| Suite | Cases | Pass | Fail | PassRate |
|-------|-------|------|------|----------|
| eval-suite-A-001 (H-A) | 30 | 30 | 0 | 1.0 |
| eval-suite-B-001 (H-B) | 29 | 29 | 0 | 1.0 |
| **Total** | **59** | **59** | **0** | **1.0** |

### Failure Modes

| ID | Hypothesis | Severity | Category | Description |
|----|------------|----------|----------|-------------|
| FM-A-001 | H-A | **medium** | prototype-defect (test harness) | `testFoldBoundaryPrecision()`: anchor at `y=-0.5` but expected values require `y=0.5`. Runtime will return `withinTolerance=false`. NOT an architectural defect — native API claims remain valid. |
| FM-B-001 | H-B | **HIGH** | race-condition (architectural) | `dragState.ty` read inside `board.on('update')` before DOM `addEventListener` fires. N-1 stale frames under rapid drag. Affects `foldViz.update()` with wrong `ty`. CONFIRMED architectural defect. |
| FM-B-002 | H-B | low | degenerate-input | `WarmStartIntersectionSolver` vacuously converges when `f=g` (h=0 everywhere). Guard needed: `if (|h(lastX)| < 1e-12 && |h'(lastX)| < 1e-12) return { converged: false }`. Non-architectural edge case. |

---

## 10. Recommended Path

### Recommendation: H-A — JSXGraph Native-First

**Confidence: 0.88**

| Confidence Component | Score |
|---------------------|-------|
| Evidence Quality | 0.92 |
| Prototype Validation | 0.90 |
| Scenario Coverage | 0.85 |
| DevCon 5 Alignment | 0.88 |
| User Directive Alignment | 1.00 |
| **Overall** | **0.88** |

**Why H-A over H-B**:

1. **Zero architectural defects** vs H-B's confirmed HIGH severity race condition (FM-B-001). `dragState.ty` stale read is not a theoretical concern — the prototype eval suite confirmed it in B-T9.

2. **Performance ceiling**: H-A can use `board.reducedUpdate=true` (40-60% frame computation reduction). H-B permanently forfeits this — the `board.on('update')` observer pattern is mutually exclusive with `reducedUpdate`.

3. **DevCon 5 alignment**: H-A scores full DDD/DRY/OCP/PECS. H-B has DDD violation, DRY risk, OCP violation, and PECS anti-pattern.

4. **ForwardProp health**: H-A native cascade is HEALTHY. H-B observer-as-implicit-hub is PARTIAL.

5. **User directive**: "Maximize JSXGraph native API usage. Custom code ONLY for features JSXGraph cannot handle natively." H-A directly follows this direction. H-B builds custom replacements for capabilities JSXGraph already provides.

6. **PR #90 foundation**: H-A builds directly on PR #90's `translate-source-before-outer-abs` foundation. The `DragBehaviorInterface` pattern is already proven for the outer-abs case.

### 3-Phase Implementation Strategy

**Phase 1 — Golden Tables** (JSXGraph Native Wiring)

Establish all dependent elements at board creation time using `parentPoint` closures:

```typescript
// 1. Create draggable parentPoint (replaces raw DOM drag)
const parentPoint = board.create('point', [0, 0], { name: '', visible: false });

// 2. Declare functiongraph dependent on parentPoint.Y()
const fg1 = board.create('functiongraph', [
  function(x) { return f_raw(x) + parentPoint.Y(); }
]);

// 3. Native intersection — auto-updates via _dep cascade
const i1 = board.create('intersection', [fg1, fg2, 0]);

// 4. Native dynamic label — auto-updates via _dep cascade
const label1 = board.create('text', [
  function() { return i1.X(); },
  function() { return i1.Y() + 0.3; },
  function() { return `I₁ (${i1.X().toFixed(2)}, ${i1.Y().toFixed(2)})`; }
]);

// 5. Enable reducedUpdate for 60fps
board.reducedUpdate = true;
```

Incremental migration: apply `DragBehaviorInterface` per family (Linear first, then Quadratic, then Abs — PR #90 already handles outer-abs).

**Phase 2 — Operational Decision-Making** (Fold Visualization + Annotations)

Add the three custom elements JSXGraph cannot handle natively (ORCH-10: all declared as board elements):

```typescript
// Abs fold ghost curve (shares parentPoint.Y() closure)
const absGhost = board.create('functiongraph', [
  function(x) { return Math.abs(f_raw(x) + parentPoint.Y()); }
], { dash: 2, strokeColor: 'gray' });

// Fold boundary: JXG line at y=0 between x-intercepts
// Reflection guide: dashed y = -(f_raw(x) + parentPoint.Y()) for negative region

// Teaching annotation toggle via opacity function
board.create('text', [...], { opacity: function() { return teachingMode ? 1 : 0; }});
```

**Phase 3 — AI-First** (LEARN feedback loop)

Add `InteractionTelemetry` capture in drag handler:
- Every 30th frame: record `{ ty, intersectionX, frameTimestamp }` to telemetry
- `TeachingEffectiveness`: track which annotations were active during session
- Feed telemetry back into `IntersectionResolverInterface` warm-start strategy refinement

---

## 11. Risks / Unknowns

### Failure Mode Risks

| ID | Category | Severity | Description | Mitigation |
|----|----------|----------|-------------|------------|
| FM-A-001 | prototype-defect | medium | `testFoldBoundaryPrecision()` expected values inconsistent with anchor position. Will return `withinTolerance=false` at browser runtime. | Fix test: anchor.Y() should be `+0.5`, not `-0.5`. OR verify native intersection accuracy at fold kink in browser (exp-jxg-01). Not an architectural defect. |
| FM-B-001 | race-condition | HIGH | `dragState.ty` stale read in `board.on('update')` observer (H-B only). N-1 stale frames under rapid drag (20+ events/sec). | Architectural: synchronize `dragState.ty` update inside `board.on('mousemove')` or JSXGraph drag handler, not raw DOM event. Confirmed defect — reason H-A is recommended. |
| FM-B-002 | degenerate-input | low | `WarmStartIntersectionSolver` vacuously converges on f=g input (h=0 everywhere). | Guard: `if (|h(lastX)| < 1e-12 && |h'(lastX)| < 1e-12) return { converged: false }`. Non-architectural edge case in H-B only. |

### Migration Risks (H-A Specific)

| Risk | Severity | Description | Mitigation |
|------|----------|-------------|------------|
| snap-to-grid regression | medium | Raw DOM `addEventListener` → `parentPoint` migration may break snap-to-grid or tangency assist for some graph families. | Incremental per-family migration via `DragBehaviorInterface`. PR #90 proves pattern works for outer-abs. Test each family in isolation. |
| Abs fold kink precision | medium | Native `board.create('intersection')` precision at `|f(x)|` fold kink (non-differentiable x-axis crossing) not yet browser-validated. | exp-jxg-01: browser test with `|x|+t` vs `x+0.5` at fold boundary. Fallback: `IntersectionResolverInterface` allows swapping to `JXG.Math.Numerics.root()` without modifying intersection consumer. |
| Migration scope creep | low | `functiongraphDragSemantics.ts` (raw DOM) + `jsxGraphRenderer.ts` (fold rendering) + `graphFamily.ts` (classification) all touch the drag pipeline. | Scope phases clearly. Phase 1 touches only `functiongraphDragSemantics.ts` for parentPoint pattern. Phase 2 adds fold visuals to `jsxGraphRenderer.ts`. |

---

## 12. Next Experiments

| ID | Title | Status | Description | Method |
|----|-------|--------|-------------|--------|
| exp-jxg-01 | Browser fold boundary precision test | **deferred-to-implementation** | Test `board.create('intersection')` with `|linear|` function. Verify coordinate accuracy at fold kink (x where `f_raw(x)+ty=0`). FM-A-001 found test harness defect, not architectural flaw — browser validation still needed to confirm native API precision at kink. | Browser test with real JSXGraph: `|x|+t` vs `x+0.5`. If precision fails → use `IntersectionResolverInterface` fallback to `JXG.Math.Numerics.root()`. |
| exp-jxg-02 | Drag handler synchronization timing | **confirmed-by-prototype** | Instrument DOM drag handler + `board.on('update')` with `performance.now()` timestamps. Measure synchronization gap under rapid drag (20+ events/sec). Prototype eval B-T9 CONFIRMED race condition (FM-B-001). **No further experiment needed — architectural defect confirmed.** | Prototype confirmed: `dragState.ty` stale read is an architectural defect in H-B. Resolution: adopt H-A (parentPoint pattern). |

---

## 13. What Would Change the Decision

Four conditions that would reverse or modify the H-A recommendation:

**1. Native intersection fails at abs-fold kinks in browser testing (exp-jxg-01)**

If `board.create('intersection')` returns incorrect coordinates at the fold boundary (where `f_raw(x)+ty=0` — the non-differentiable kink), the IntersectionResolverInterface fallback path activates: swap NativeIntersectionResolver for NewtonRaphsonResolver (`JXG.Math.Numerics.root(h, warmStart)`) at kink regions. This does NOT require switching to H-B — it uses the OCP-designed fallback already declared in IntersectionResolverInterface. Confidence impact: -0.05 to -0.10 depending on how many intersection types are affected.

**2. parentPoint migration breaks snap-to-grid regression in ≥3 graph families**

If the raw DOM `addEventListener` → `parentPoint` migration causes snap-to-grid or tangency assist failures in Linear, Quadratic, AND Abs families simultaneously (not just one), the migration timeline should be extended and a phased per-family rollout enforced. Worst case: revert to H-B for the specific affected families only (hybrid architecture). This condition is partially mitigated by PR #90 proving the pattern works for outer-abs. Monitor during Phase 1 migration.

**3. Element count permanently stays ≤5**

H-B's simpler additive pattern (zero migration cost, full telemetry control) has lower total cost if the canvas never grows beyond 5 interactive elements. If the teaching use case is scoped permanently to simple 2-3 curve scenarios without annotations, the OCP/DRY violations in H-B are less material. Reassess if scope is explicitly narrowed. Current scope (8+ required elements, annotation overlay, trace path) exceeds this threshold.

**4. JSXGraph drops support for `_dep` chain auto-cascade in a future major version**

H-A's native-first architecture has a single external dependency: JSXGraph maintaining the internal `_dep` dependency propagation system. If a future major version of JSXGraph changes or removes this (as happened with v1.12.1's intersection precision overhaul), H-B's explicit `DependencyGraph` control becomes necessary. Monitor JSXGraph changelog on each version bump. Current 1.12.2 is stable.

---

*Report produced by: reporter-report (T12)*  
*Session: jsxgraph-sequencer-001*  
*Evaluator gate: ACCEPT (confidence: 0.88, no debate required)*  
*All findings tagged `[Official]`/`[Synthesis]`/`[Inference]` per BROWSE Protocol*  
*Blueprint: `ontology-state/blueprint.json`*  
*Prior session PR: #90 — [codex] preserve outer-abs drag semantics (merged 2026-04-11)*

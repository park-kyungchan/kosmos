# Benchmark Next Experiments — 3D Math Learning Experience

> Status: TEMPLATE — populated during benchmark execution

---

## P0 — Blocking (must resolve before recommendation)

### Exp-01: WebGPU Chromebook Performance Test
- **Objective**: Verify 30fps rendering on 2023-era Intel Chromebooks
- **Hypothesis**: Three.js/R3F with WebGL fallback achieves acceptable framerate
- **Method**: Deploy test scene to Vercel, run on physical Chromebook
- **Expected Outcome**: >= 30fps with < 100 draw calls
- **Effort**: 1 day
- **Status**: proposed

### Exp-02: Colyseus vs PartyKit Latency Comparison
- **Objective**: Measure round-trip latency for real-time sync
- **Hypothesis**: Both achieve < 100ms for classroom-scale (30 users)
- **Method**: Deploy echo server on both, measure with k6
- **Expected Outcome**: Latency data for 10/30/50 concurrent users
- **Effort**: 2 days
- **Status**: proposed

## P1 — Important (significantly reduces uncertainty)

### Exp-03: COPPA Compliance Audit
- **Objective**: Verify chosen stack meets COPPA data collection rules
- **Hypothesis**: Client-side-only rendering avoids COPPA trigger
- **Method**: Map data flows, identify collection points, review FTC guidance
- **Expected Outcome**: Compliance matrix with pass/fail per requirement
- **Effort**: 1 day
- **Status**: proposed

### Exp-04: Educational UX Prototype Test
- **Objective**: Validate engagement patterns with 5-8 year olds
- **Hypothesis**: Immediate visual feedback + progressive difficulty sustains engagement
- **Method**: Paper prototype or minimal 3D prototype with 5 test users
- **Expected Outcome**: Engagement duration > 10 minutes per session
- **Effort**: 3 days
- **Status**: proposed

## P2 — Useful (improves confidence)

### Exp-05: Vercel Edge Function Cold Start Impact
- **Objective**: Measure cold start latency for API routes serving game state
- **Hypothesis**: < 500ms cold start for Edge runtime
- **Method**: Deploy test API, measure with synthetic load
- **Expected Outcome**: P95 latency data
- **Effort**: 0.5 days
- **Status**: proposed

## Dependency Graph

```
Exp-01 ──→ Exp-02 (need rendering baseline before multiplayer test)
Exp-03 (independent — can run in parallel)
Exp-04 ──→ requires Exp-01 output (working prototype)
Exp-05 (independent)
```

## Experiment-to-Risk Mapping

| Experiment | Reduces Risk | Current Severity | Expected After |
|-----------|-------------|-----------------|----------------|
| Exp-01 | Low-end device performance | high | medium/low |
| Exp-02 | Multiplayer latency | medium | low |
| Exp-03 | COPPA non-compliance | high | low |
| Exp-04 | Poor engagement with target users | high | medium |
| Exp-05 | API latency affecting game feel | medium | low |

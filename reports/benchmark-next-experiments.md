# Benchmark Next Experiments — 3D Math Learning Experience

> Generated: 2026-03-23
> Session: bench-001
> Total experiments: 5
> Blocking experiments (p0): 3

---

## P0 — Blocking (must resolve before production commitment)

### Exp-01: Chromebook GPU Performance Benchmark
- **Objective**: Verify 30fps rendering with R3F + physics on school Chromebooks
- **Hypothesis**: Three.js r168 with WebGL2 fallback achieves >= 30fps with 50 draw calls
- **Method**: Deploy test scene (100 objects, physics, particles) to Vercel, test on 2023 Intel Celeron and ARM Chromebooks
- **Expected Outcome**: FPS data at 50/100/200 draw calls, memory usage
- **Prerequisites**: None
- **Estimated Effort**: 1 day
- **Status**: proposed
- **Impact if skipped**: Chromebook perf risk remains HIGH — could block project

### Exp-02: Colyseus vs PartyKit Latency Comparison
- **Objective**: Measure round-trip latency for classroom-scale real-time sync
- **Hypothesis**: Both achieve < 100ms RTT for 30 concurrent users
- **Method**: Deploy echo server on Colyseus (Railway) and PartyKit (Cloudflare), measure with k6 load test
- **Expected Outcome**: P50/P95/P99 latency at 10/30/50 users, connection stability
- **Prerequisites**: None (independent)
- **Estimated Effort**: 2 days
- **Status**: proposed
- **Impact if skipped**: Multiplayer choice based on inference, not data

### Exp-03: COPPA Compliance Legal Audit
- **Objective**: Determine whether student progress tracking triggers COPPA
- **Hypothesis**: Client-side-only rendering with no server-stored PII avoids COPPA
- **Method**: Map all data flows, identify collection points, review with education attorney
- **Expected Outcome**: Compliance matrix: pass/fail per COPPA requirement
- **Prerequisites**: Architecture decision (which data is stored where)
- **Estimated Effort**: 1-2 days (internal) + legal review time
- **Status**: proposed
- **Impact if skipped**: COPPA non-compliance = regulatory action, project shutdown (CRITICAL)

---

## P1 — Important (significantly reduces uncertainty)

### Exp-04: Educational UX Prototype Test
- **Objective**: Validate engagement patterns with actual elementary students
- **Hypothesis**: Immediate visual feedback + progressive difficulty sustains > 10 min engagement
- **Method**: Build minimal 3D math scene (addition/multiplication), test with 5 students ages 6-8
- **Expected Outcome**: Session duration, error rate, qualitative feedback
- **Prerequisites**: Exp-01 (need working prototype)
- **Estimated Effort**: 3 days (build) + 1 day (test)
- **Status**: proposed
- **Impact if skipped**: Engagement risk remains HIGH — educational value unvalidated

---

## P2 — Useful (improves confidence in secondary decisions)

### Exp-05: Vercel Edge Function Cold Start Measurement
- **Objective**: Measure cold start latency impact on game feel
- **Hypothesis**: Edge runtime cold start < 500ms for game state API
- **Method**: Deploy test API, measure P50/P95 under cold + warm conditions
- **Expected Outcome**: Latency data for game state read/write operations
- **Prerequisites**: None
- **Estimated Effort**: 0.5 days
- **Status**: proposed
- **Impact if skipped**: Minor — cold start mainly affects first load

---

## Dependency Graph

```
Exp-01 ──→ Exp-04 (need working prototype for UX test)
           Exp-02 (perf baseline informs multiplayer choice)
Exp-03 (independent — parallel with all)
Exp-05 (independent — parallel with all)
```

## Experiment-to-Risk Mapping

| Experiment | Reduces Risk | Current Severity | Expected After |
|-----------|-------------|-----------------|----------------|
| Exp-01 | Chromebook GPU performance | **high** | low (if >= 30fps) |
| Exp-02 | Multiplayer scaling + latency | medium | low |
| Exp-03 | COPPA non-compliance | **critical** | low (if zero-PII confirmed) |
| Exp-04 | Low student engagement | **high** | medium (small sample) |
| Exp-05 | API cold start affecting UX | medium | low |

## Experiment-to-Evidence-Gap Mapping

| Experiment | Resolves Evidence Gap In |
|-----------|------------------------|
| Exp-01 | sc-a-worst (Chromebook perf), sc-a-best (WebGPU on Chromebook) |
| Exp-02 | sc-a-adv (Colyseus scaling), all Option B scenarios (PartyKit latency) |
| Exp-03 | sc-a-adv (COPPA audit), all scenarios (governance dimension) |
| Exp-04 | Q7 (educational UX — currently tier-3/4 only) |
| Exp-05 | Q3 (Vercel cold start — supplementary data) |

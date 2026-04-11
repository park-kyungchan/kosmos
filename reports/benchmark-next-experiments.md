# Benchmark Next Experiments — bench-003 (Red-Team)

> Generated: 2026-03-23
> Session: bench-003 (RED-TEAM)
> Gate Decision: REJECT — experiments below are PREREQUISITES for re-evaluation
> Total experiments: 6
> Blocking experiments: 2 (ABSOLUTE — no re-evaluation possible without these)

---

## BLOCKING — Must Complete Before Re-Running bench-003

### Exp-rt-01: Education Privacy Legal Review (COPPA + FERPA)
- **Objective**: Obtain legal determination on COPPA/FERPA compliance path for THIS specific EdTech app
- **Hypothesis**: School consent mechanism is valid for educational app collecting student scores, OR VPC is required
- **Method**: Engage attorney specializing in COPPA/FERPA for educational technology. Provide: app description, data flow diagram, student data elements, teacher dashboard functionality
- **Expected Outcome**: Legal opinion covering: (1) COPPA applicability determination, (2) school consent validity, (3) VPC requirement, (4) FERPA data use agreement requirements, (5) minimum privacy policy requirements
- **Prerequisites**: None — can start immediately
- **Estimated Effort**: 2-4 weeks + $2,000-$5,000 legal fees
- **Status**: proposed
- **Impact if skipped**: **BENCH-003 CANNOT BE RE-EVALUATED. No technology recommendation possible.**

### Exp-rt-02: Target District Vendor Assessment Requirements
- **Objective**: Determine what compliance certifications and agreements the target school district requires
- **Hypothesis**: District requires some combination of: SOC 2, COPPA certification, FERPA DUA, student privacy pledge
- **Method**: Contact district IT department, request vendor assessment checklist
- **Expected Outcome**: Specific requirements list that constrains BaaS choice (e.g., "SOC 2 required" eliminates self-hosted)
- **Prerequisites**: None — can start immediately
- **Estimated Effort**: 1-2 weeks (depends on district responsiveness)
- **Status**: proposed
- **Impact if skipped**: **Architecture choice may be rejected by district review**

---

## Important — Run After Blocking Experiments

### Exp-rt-03: Convex DPA and Children's Data Documentation
- **Objective**: Determine if Convex offers a Data Processing Agreement suitable for children's educational data
- **Hypothesis**: Convex provides or will negotiate a DPA for EdTech use cases
- **Method**: Contact Convex sales/support, request DPA template, children's data handling documentation
- **Expected Outcome**: DPA availability + terms, or confirmation that no DPA exists
- **Prerequisites**: Exp-rt-01 (need to know what DPA must contain)
- **Estimated Effort**: 1 week
- **Status**: proposed

### Exp-rt-04: Firebase Children's Privacy Scope Verification
- **Objective**: Determine exact scope of Firebase's children's privacy controls for third-party app developers
- **Hypothesis**: Firebase provides some compliance infrastructure but developer remains COPPA operator
- **Method**: Read Firebase ToS in detail, review children's privacy page, contact Firebase support if needed
- **Expected Outcome**: Clear determination of what Firebase provides vs what developer must implement
- **Prerequisites**: Exp-rt-01 (need to know what compliance means specifically)
- **Estimated Effort**: 2-3 days
- **Status**: proposed

---

## Non-Blocking — Can Run In Parallel

### Exp-rt-05: Technology Prototype with Synthetic Data
- **Objective**: Build a working R3F 3D math scene with mock backend, using synthetic (non-real) student data
- **Hypothesis**: The technology layer works regardless of compliance outcome
- **Method**: R3F + selected BaaS (Convex or Firebase), fake student accounts, teacher dashboard with mock data
- **Expected Outcome**: Working demo that demonstrates the 3D experience without touching real student data
- **Prerequisites**: None — synthetic data avoids all compliance triggers
- **Estimated Effort**: 2-3 weeks (1-2 devs)
- **Status**: proposed
- **Note**: This prototype is SAFE to build because it uses no real children's data. It demonstrates technology feasibility for the pilot proposal while legal review proceeds in parallel.

### Exp-rt-06: Chromebook + Tablet WebGL2 Benchmark (carried from bench-002)
- **Objective**: Verify 30fps on target devices
- **Hypothesis**: R3F with WebGL2 achieves >= 30fps on school Chromebooks
- **Method**: Deploy test scene, measure on actual hardware
- **Expected Outcome**: FPS data
- **Prerequisites**: None
- **Estimated Effort**: 1 day
- **Status**: proposed

---

## Experiment Dependency Graph

```
Exp-rt-01 (Legal Review) ─┬──→ Exp-rt-03 (Convex DPA)
                          ├──→ Exp-rt-04 (Firebase Scope)
                          └──→ RE-RUN BENCH-003 with resolved evidence

Exp-rt-02 (District IT) ──→ Constrains BaaS choice → RE-RUN BENCH-003

Exp-rt-05 (Prototype) ────→ Runs in parallel — no compliance dependency
Exp-rt-06 (Perf test) ────→ Runs in parallel — no compliance dependency
```

## Key Difference from Previous Benchmarks

| | bench-001 | bench-002 | bench-003 |
|---|-----------|-----------|-----------|
| Blocking experiments | 3 (tech) | 2 (tech) | **2 (legal/institutional)** |
| Tech experiments | 5 | 5 | 2 (non-blocking) |
| Legal experiments | 0 | 0 | **2 (BLOCKING)** |
| Can prototype proceed? | After perf test | Immediately | **Yes — with synthetic data** |

The fundamental shift: **the blocking work is no longer technical — it is legal and institutional.** Technology prototyping can proceed in parallel with legal review, but no real student data can be used until legal review is complete.

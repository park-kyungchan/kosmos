# Benchmark Scenario Matrix — bench-003 (Red-Team)

> Generated: 2026-03-23
> Session: bench-003 (RED-TEAM)
> Previous: bench-001 (ACCEPT), bench-002 (ACCEPT)
> Scoring rubric: `docs/scoring-rubric.md`
> Revision rounds: 2
> GATE DECISION: **REJECT**

---

## Branch A: R3F + Convex (Managed BaaS)

| Dimension | Base | Best | Worst | Adversarial |
|-----------|:--:|:--:|:--:|:--:|
| Evidence Fit | 2 | 1 | 3 | 3 |
| Impl Difficulty | 3 | 3 | 1 | 1 |
| Risk Severity | **1** | 3 | **1** | **1** |
| Reversibility | 3 | 3 | 2 | 1 |
| Time-to-Value | 3 | 2 | 1 | 1 |
| Governance | **1** | **1** | **1** | **1** |
| Ecosystem | 4 | 4 | 4 | 4 |
| **Total (/35)** | **17** | **17** | **13** | **12** |

**Contradiction Status**: detected / none / none / none
**Evidence Sufficiency**: insufficient / insufficient / partial / partial

---

## Branch B: R3F + Firebase (Google Ecosystem)

| Dimension | Base | Best | Worst | Adversarial |
|-----------|:--:|:--:|:--:|:--:|
| Evidence Fit | 2 | 1 | 3 | 3 |
| Impl Difficulty | 3 | 3 | 1 | 1 |
| Risk Severity | **1** | 2 | **1** | 2 |
| Reversibility | 2 | 2 | 2 | 1 |
| Time-to-Value | 3 | 2 | 1 | 1 |
| Governance | **1** | **1** | **1** | 2 |
| Ecosystem | 5 | 5 | 5 | 5 |
| **Total (/35)** | **17** | **16** | **14** | **15** |

**Contradiction Status**: detected / detected / none / none
**Evidence Sufficiency**: insufficient / insufficient / partial / partial

---

## Branch C: R3F + PocketBase (Self-Hosted)

| Dimension | Base | Best | Worst | Adversarial |
|-----------|:--:|:--:|:--:|:--:|
| Evidence Fit | 2 | 1 | 3 | 3 |
| Impl Difficulty | 2 | 2 | 1 | 1 |
| Risk Severity | **1** | 2 | **1** | 2 |
| Reversibility | 4 | 4 | 1 | 3 |
| Time-to-Value | 2 | 2 | 1 | 1 |
| Governance | **1** | **1** | **1** | **1** |
| Ecosystem | 2 | 2 | 2 | 2 |
| **Total (/35)** | **14** | **14** | **10** | **13** |

**Contradiction Status**: detected / none / none / none
**Evidence Sufficiency**: insufficient / insufficient / partial / partial

---

## Cross-Branch Comparison

| Criterion | A (Convex) | B (Firebase) | C (PocketBase) |
|-----------|:--:|:--:|:--:|
| Best base-case score | 17 | 17 | 14 |
| Worst scenario score | 12 | 14 | 10 |
| Governance (ALL scenarios) | **1** | **1** | **1** |
| Unresolved contradictions | 1 | 2 | 1 |
| Insufficient evidence | 2 | 2 | 2 |

**ALL branches fail the governance gate.** No branch can support a recommendation.

---

## Benchmark Series Comparison

| Metric | bench-001 | bench-002 | bench-003 |
|--------|:--:|:--:|:--:|
| Best base-case score | 29/35 | **33/35** | 17/35 |
| Governance score (best) | 4/5 | **5/5** | **1/5** |
| Gate decision | ACCEPT | ACCEPT | **REJECT** |
| Recommendation | R3F+Colyseus+Vercel | A-Frame+GitHub Pages | **NONE** |
| Key blocker | Chromebook perf | None | **Legal review** |

The 16-point drop from bench-002 (33) to bench-003 (17) is almost entirely driven by Governance (5→1) and Risk Severity (5→1). The technology layer scores are similar across all three benchmarks. **The compliance layer is the sole differentiator.**

---

## Why This Rejection Is Correct

1. bench-002 scored Governance 5/5 because zero-PII = COPPA not triggered
2. bench-003 stores student data = COPPA certainly triggered
3. COPPA compliance determination requires legal counsel, not web research
4. Without legal review, Governance MUST be scored 1/5 under conservative interpretation
5. Governance 1/5 makes ALL scenarios fail `isScenarioReportReady()` validator
6. Therefore no recommendation can be issued

**This is the intended red-team outcome: the evaluator hard gate works correctly.**

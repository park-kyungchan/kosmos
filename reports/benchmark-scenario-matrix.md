# Benchmark Scenario Matrix — 3D Math Learning Experience

> Generated: 2026-03-23
> Session: bench-001
> Scoring rubric: `docs/scoring-rubric.md`
> Revision rounds: 2

---

## Option A: Three.js + R3F + Colyseus

| Dimension (weight) | Base Case | Best Case | Worst Case | Adversarial |
|--------------------|-----------|-----------|------------|-------------|
| Evidence Fit (—) | 4 | 3 | 2 | 3 |
| Impl Difficulty (—) | 4 | 4 | 2 | 2 |
| Risk Severity (—) | 4 | 4 | 2 | 1 |
| Reversibility (—) | 4 | 4 | 3 | 2 |
| Time-to-Value (—) | 4 | 4 | 2 | 2 |
| Governance (—) | 4 | 4 | 3 | 2 |
| Ecosystem (—) | 5 | 5 | 5 | 5 |
| **Total (of 35)** | **29** | **28** | **19** | **17** |

**Contradiction Status**: none / none / resolved / resolved
**Evidence Sufficiency**: sufficient / partial / partial / partial

---

## Option B: PlayCanvas + PartyKit

| Dimension (weight) | Base Case | Best Case | Worst Case | Adversarial |
|--------------------|-----------|-----------|------------|-------------|
| Evidence Fit (—) | 3 | 2 | 2 | 3 |
| Impl Difficulty (—) | 3 | 3 | 2 | 2 |
| Risk Severity (—) | 3 | 4 | 2 | 2 |
| Reversibility (—) | 3 | 3 | 2 | 1 |
| Time-to-Value (—) | 4 | 5 | 2 | 3 |
| Governance (—) | 4 | 3 | 4 | 4 |
| Ecosystem (—) | 3 | 3 | 2 | 3 |
| **Total (of 35)** | **23** | **23** | **16** | **18** |

**Contradiction Status**: resolved / none / resolved / none
**Evidence Sufficiency**: partial / partial / partial / partial

---

## Option C: Babylon.js + PartyKit

| Dimension (weight) | Base Case | Best Case | Worst Case | Adversarial |
|--------------------|-----------|-----------|------------|-------------|
| Evidence Fit (—) | 2 | 1 | 1 | 2 |
| Impl Difficulty (—) | 3 | 3 | 2 | 2 |
| Risk Severity (—) | 3 | 3 | 2 | 2 |
| Reversibility (—) | 3 | 3 | 3 | 3 |
| Time-to-Value (—) | 3 | 3 | 2 | 2 |
| Governance (—) | 4 | 4 | 4 | 3 |
| Ecosystem (—) | 4 | 4 | 3 | 3 |
| **Total (of 35)** | **22** | **21** | **17** | **17** |

**Contradiction Status**: **detected** / **detected** / none / none
**Evidence Sufficiency**: partial / **insufficient** / **insufficient** / partial

---

## Cross-Option Comparison

| Criterion | Option A (R3F) | Option B (PlayCanvas) | Option C (Babylon) |
|-----------|----------|----------|----------|
| Best base-case score | **29** | 23 | 22 |
| Worst adversarial score | 17 | 18 | 17 |
| Unresolved contradictions | **0** | 0 | **2** |
| Evidence gaps | 1 (Chromebook GPU) | 1 (React depth) | **3** (docs, React, benchmark) |
| Evidence sufficiency | all sufficient/partial | all partial | **2 insufficient** |

## Evaluator Gate Status

- R1 (low-tier): **PASS** — critical claims on tier-1
- R2 (contradictions): **PASS** for A+B / **FAIL** for C
- R3-R4 (links): **PASS**
- R5 (staleness): **PASS** — all claims current (2026-03-23)
- R6 (provenance): **PASS**
- R7 (rationale): **PASS**
- R8 (alternatives): **PASS** — 2 alternatives
- R9 (evidence): **PASS** for A+B / **FAIL** for C
- R10 (reversals): **PASS** — 5 conditions specified
- **GATE DECISION**: **ACCEPT** (Option A recommended, B alternative, C excluded)

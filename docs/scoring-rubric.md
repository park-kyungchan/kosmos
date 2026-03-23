# Scoring Rubric — Simulation Policy Layer

This document is the single source of truth for evaluation scoring,
contradiction classification, revision triggers, and stopping criteria.
The simulator agent references this document — it does not embed these rules.

---

## Evaluation Dimensions (7)

### 1. Evidence Fit
How well does available evidence support this scenario's assumptions?

| Score | Definition |
|-------|-----------|
| 5 | All assumptions backed by tier-1/2 evidence with high confidence |
| 4 | Most assumptions backed by tier-1-3 evidence; minor gaps |
| 3 | Core assumptions supported; some rely on tier-4/5 or inference |
| 2 | Significant assumptions unsupported or rely on stale evidence |
| 1 | Majority of assumptions lack evidence; scenario is speculative |

### 2. Implementation Difficulty
How hard is the proposed approach to build?

| Score | Definition |
|-------|-----------|
| 5 | Trivial — well-documented stack, existing templates, < 1 week |
| 4 | Straightforward — proven patterns, clear docs, 1-2 weeks |
| 3 | Moderate — some custom work, integration complexity, 2-4 weeks |
| 2 | Difficult — novel patterns, sparse docs, 1-2 months |
| 1 | Extremely hard — research-grade, unproven at scale, > 2 months |

### 3. Risk Severity
How bad is the worst-case impact if this scenario plays out?

| Score | Definition |
|-------|-----------|
| 5 | Negligible — easy to recover, no user impact |
| 4 | Minor — small delay or workaround needed |
| 3 | Moderate — noticeable impact, mitigation available |
| 2 | Severe — significant rework or user-facing failure |
| 1 | Critical — project failure, safety issue, or compliance violation |

### 4. Reversibility
How easy is it to change course if this path proves wrong?

| Score | Definition |
|-------|-----------|
| 5 | Fully reversible — swap component, no data loss |
| 4 | Mostly reversible — some migration, days of work |
| 3 | Partially reversible — significant refactoring needed |
| 2 | Difficult to reverse — architectural commitment, weeks of rework |
| 1 | Irreversible — vendor lock-in, data format commitment |

### 5. Time-to-Value
How quickly does this approach deliver usable results?

| Score | Definition |
|-------|-----------|
| 5 | Days — quick prototype possible |
| 4 | 1-2 weeks — working demo achievable |
| 3 | 2-4 weeks — MVP timeline |
| 2 | 1-2 months — significant lead time |
| 1 | > 2 months — long development cycle before anything usable |

### 6. Governance Compliance
Does this satisfy safety, regulatory, and policy requirements?

| Score | Definition |
|-------|-----------|
| 5 | Fully compliant — meets all identified regulatory requirements |
| 4 | Mostly compliant — minor gaps easily addressed |
| 3 | Partially compliant — some requirements need additional work |
| 2 | Significant gaps — major compliance work needed |
| 1 | Non-compliant — blocks deployment until resolved |

### 7. Ecosystem Maturity
How stable and well-supported is the technology stack?

| Score | Definition |
|-------|-----------|
| 5 | Mature — LTS releases, large community, 5+ years stable |
| 4 | Stable — regular releases, active maintainers, 2-5 years |
| 3 | Emerging — growing adoption, 1-2 years in production use |
| 2 | Early — limited production use, API may change |
| 1 | Experimental — pre-1.0, no stability guarantees |

---

## Contradiction Classification

### Resolvable
- Existing evidence can resolve the contradiction
- Example: Claim A says "X supports Y", Claim B says "X does not support Y"
  but they reference different versions → check current version documentation
- **Action**: Resolve in current revision round, update `contradictionStatus: "resolved"`

### Evidence-Gap-Driven
- More research is needed to determine which claim is correct
- Example: Both claims are plausible but from different time periods
- **Action**: Flag as evidence gap, create NextExperiment, mark `contradictionStatus: "detected"`
  until resolved

### Irreconcilable
- Fundamental tension that cannot be resolved with more evidence
- Example: Option A optimizes for performance, Option B optimizes for simplicity
  — they cannot both be true simultaneously for the same scenario
- **Action**: Split into separate scenarios, mark `contradictionStatus: "unresolvable"`

---

## Revision Triggers

A revision round is REQUIRED when:

1. **Any** scenario has `contradictionStatus: "detected"` after initial generation
2. **Any** scenario has `evidenceSufficiency: "insufficient"`
3. A **new** contradiction is discovered during scoring
4. **Fewer than 4** scenario types exist for a hypothesis

A revision round SHOULD BE considered when:

5. Evidence fit score is 1 or 2 on any scenario
6. A scenario assumption has no evidence ID
7. Two scenarios share contradictory assumptions without acknowledgment

---

## When to Revise, Split, or Discard a Scenario

### Revise (update in-place, increment revisionRound)
- Contradiction classified as "resolvable"
- New evidence changes an assumption
- Scoring reveals a missing implication

### Split (create new scenario from existing)
- Contradiction classified as "irreconcilable"
- Two valid interpretations of the same evidence
- Scenario covers two distinct failure modes

### Discard (mark as abandoned, do not delete)
- Evidence sufficiency is "insufficient" after 2 revision rounds
- All assumptions proved false by contradicting evidence
- Scenario duplicates another with no meaningful difference

**Never delete a scenario.** Mark it abandoned with a reason.

---

## Evidence Sufficiency Rules

| Status | Condition | Recommendation Impact |
|--------|-----------|----------------------|
| `sufficient` | ALL assumptions have >= 1 evidence ID | Can support recommendation |
| `partial` | >= 50% of assumptions have evidence | Can support with caveats |
| `insufficient` | < 50% of assumptions have evidence | CANNOT support recommendation |

A scenario with `insufficient` evidence MUST NOT be referenced by a
`DecisionRecommendation` unless accompanied by a `NextExperiment` that
would fill the gap.

---

## Stopping Criteria

The simulation loop STOPS when ALL of these are true:

1. No scenarios have `contradictionStatus: "detected"` (all resolved or unresolvable)
2. No scenarios have `evidenceSufficiency: "insufficient"` (all sufficient or partial)
3. All 4 scenario types exist per hypothesis
4. All evidence gaps are documented as `NextExperiment` objects
5. All scenarios are scored on all 7 dimensions
6. >= 2 revision rounds completed (when contradictions were found)

The simulation loop FORCE-STOPS at round 5, with:
- Summary of remaining issues
- All unresolved items flagged for the evaluator
- `STOPPING_CRITERIA_MET: false` in output

---

## Minimum Evidence Requirements

A scenario is considered ACTIVE (eligible for scoring and revision) when:
- It has >= 1 assumption
- It has >= 1 evidence ID
- It has a non-empty description
- It belongs to one of the 4 required types

A scenario that fails these minimums should be flagged for the researcher,
not scored by the simulator.

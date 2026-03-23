# Simulation Methodology

## Purpose

Simulation in Kosmos is NOT execution of code. It is structured
counterfactual reasoning — systematically exploring "what if?"
questions to stress-test hypotheses before making recommendations.

## The Simulation Loop

```
Hypothesis → Scenario Generation (4 types) → Evidence Check →
Contradiction Resolution → Revision (≥2 rounds) → Scored Output
```

## Hypothesis Generation

### Rules
1. For each strategic/architectural question, generate ≥ 2 hypotheses
2. Each hypothesis must be falsifiable (specify what would disprove it)
3. Each must cite supporting AND contradicting evidence
4. Each must specify architecture implications if true

### Example
> Question: "Should we use Three.js or Babylon.js for 3D rendering?"
>
> H1: "Three.js is the better choice because it has a larger ecosystem
>      and better React integration."
>   Supporting: [ev-001 npm downloads], [ev-002 react-three-fiber]
>   Contradicting: [ev-003 Babylon.js native WebGPU support]
>
> H2: "Babylon.js is the better choice because it has native WebGPU
>      and better performance for complex scenes."
>   Supporting: [ev-003 WebGPU], [ev-004 benchmarks]
>   Contradicting: [ev-002 React integration overhead]

## Scenario Types

### Base Case
- **Definition**: Most likely outcome given current evidence
- **Construction**: Use the strongest evidence, most common assumptions
- **Purpose**: Establish the default expectation

### Best Case
- **Definition**: Optimistic outcome if favorable conditions hold
- **Construction**: Assume the supporting evidence is fully correct
- **Purpose**: Understand the upside potential

### Worst Case
- **Definition**: Pessimistic outcome if unfavorable conditions hold
- **Construction**: Assume the contradicting evidence is fully correct
- **Purpose**: Understand the downside risk

### Adversarial Case
- **Definition**: What an intelligent adversary would exploit
- **Construction**: Assume hidden dependencies break, security is tested
- **Purpose**: Find non-obvious failure modes

## Scenario Scoring Dimensions

Each scenario is scored on 7 dimensions:

| Dimension | Scale | Question |
|-----------|-------|----------|
| Implementation Difficulty | 1-5 | How hard is this to build? |
| Evidence Strength | 1-5 | How well-supported are the assumptions? |
| Risk Severity | 1-5 | How bad is the worst-case impact? |
| Reversibility | 1-5 | How easy is it to change course? |
| Time-to-Value | 1-5 | How quickly does this deliver results? |
| Governance Compliance | 1-5 | Does this satisfy regulatory/policy needs? |
| Ecosystem Maturity | 1-5 | How stable is the technology stack? |

## Revision Rounds

### Why Revise?
First-pass scenarios often contain:
- Unsupported assumptions (no evidence cited)
- Internal contradictions (same assumption true and false)
- Missing scenarios (a plausible case not explored)

### Revision Protocol
1. **Round 1**: Check every assumption — does it have evidence?
2. **Round 2**: Cross-reference scenarios — do contradictions resolve?
3. **Additional rounds**: If new evidence gaps are found, flag for researcher

### Stopping Criteria
Stop revising when:
- All assumptions have evidence (even if weak)
- No internal contradictions remain
- All 4 scenario types are populated
- Evidence gaps are documented (for Next Experiments)

## Counterfactual Analysis

For each key assumption:
> "What changes if [assumption] is FALSE?"

Document the cascade:
1. Which scenarios are invalidated?
2. Which hypotheses lose support?
3. Does the recommendation change?
4. What evidence would we need to resolve this?

## Output

Simulation produces:
- `Hypothesis[]` objects (schemas/types.ts)
- `Scenario[]` objects (4 per hypothesis minimum)
- `SimulationRun[]` objects (tracking revision rounds)
- Updates to `ontology-state/scenarios.json`

# Governance & Security Model

## Provenance Governance

The most critical governance concern in Kosmos is **provenance accuracy**.
Misattributing a synthesis as official Palantir doctrine could mislead
decisions. The three-tier provenance system is non-negotiable.

### Provenance Tiers

| Tag | Definition | Verification |
|-----|-----------|-------------|
| `[Official]` | Direct from Palantir docs, AIPCon, DevCon, official blog | Must cite specific source + marker |
| `[Synthesis]` | Our analytical framework combining official sources | Must cite which official sources were combined |
| `[Inference]` | Reasoned conclusion from evidence | Must state the reasoning chain |

### Provenance Rules

1. Every claim in a report MUST have a provenance tag
2. The evaluator agent validates all provenance claims
3. If a claim's provenance is uncertain, default to `[Inference]`
4. Never upgrade provenance (inference → synthesis → official) without new evidence
5. Downgrade provenance immediately when verification fails

### Provenance Audit Trail

All provenance decisions are logged in `ontology-state/decision-log.json`:
```json
{
  "type": "provenance_decision",
  "claimId": "claim-001",
  "assignedProvenance": "synthesis",
  "rationale": "Combines §PHIL.R-01 and §ARCH-06 into A2 axiom",
  "verifiedBy": "evaluator",
  "timestamp": "2026-03-23T..."
}
```

## Access Control Model

### Research Library Access
- The internal Palantir research library is read-only
- The browse protocol (BROWSE.md) is the only approved access method
- Hooks enforce: no broad scanning, no unbounded grep
- All access is logged via hook events

### State File Access

| File | Read | Write |
|------|------|-------|
| world-model.json | all agents | ontologist only |
| source-map.json | all agents | researcher only |
| scenarios.json | all agents | simulator only |
| decision-log.json | all agents | orchestrator + evaluator |

### Agent Capability Boundaries

| Agent | Can Read | Can Write | Cannot |
|-------|----------|-----------|--------|
| orchestrator | all state files | decision-log | evidence, scenarios |
| researcher | research library, web | source-map | world-model, scenarios |
| ontologist | source-map | world-model | source-map, scenarios |
| simulator | world-model | scenarios | source-map, world-model |
| evaluator | all state files | decision-log (risks) | source-map, world-model |
| reporter | all state files | reports/ | state files |

## Validation Governance

### Pre-Report Validation

Before the reporter produces output, the evaluator MUST verify:

1. **Provenance accuracy**: All [Official] tags verified against markers
2. **Contradiction resolution**: No unresolved contradictions remain
3. **Scenario completeness**: All 4 types present for each hypothesis
4. **Evidence coverage**: No claims without supporting evidence
5. **Risk identification**: All technical/security/governance risks documented

### Decision Lineage

Every recommendation in the final report must trace back through:
```
Recommendation → Supporting Scenarios → Underlying Hypotheses →
Supporting Evidence → Source Documents → Research Questions → User Objective
```

If any link in this chain is broken, the recommendation is unsupported.

## Security Considerations for External Research

When fetching external sources:
- Never send internal research content to external services
- Never include internal marker IDs in external queries
- Capture external source URLs but do not assume persistence
- Note when external sources may have bias (vendor docs, marketing)

## Data Retention

- State files (`ontology-state/`) persist across sessions
- Report files (`reports/`) are cumulative (new reports don't delete old ones)
- Decision logs are append-only — never delete entries
- Source maps grow over time — prune only on explicit user request

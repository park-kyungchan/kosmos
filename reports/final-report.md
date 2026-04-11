# Research Report: 3D Math Learning Pilot Proposal — RED-TEAM Benchmark

> Generated: 2026-03-23
> Session: bench-003
> Benchmark Type: RED-TEAM (adversarial validation)
> Previous Benchmarks: bench-001 (ACCEPT), bench-002 (ACCEPT)
> Evaluator Gate: **REJECT** — see Section 15

---

## 1. User Objective

Build a pilot-proposal-level 3D math learning experience for elementary students (6-12), submittable to a school/district for approval. This requires: student data persistence across sessions, teacher dashboard with per-student performance, COPPA/FERPA compliance verified (not inferred), and an architecture extensible to future multiplayer.

## 2. Adversarial Constraints

| # | Constraint | Impact on Previous Benchmarks |
|---|-----------|------|
| 1 | Student progress persisted across sessions | **Destroys** bench-002's zero-PII assumption |
| 2 | Teacher dashboard required | Backend infrastructure now mandatory |
| 3 | Conservative interpretation on regulatory ambiguity | Inference-grade compliance evidence = insufficient |
| 4 | Multiplayer optional but architecture must accommodate | Pure static eliminated |
| 5 | Very limited budget (1-2 devs) | Enterprise solutions eliminated |
| 6 | No claiming "COPPA safe" without legal review | Legal inference cannot support recommendation |
| 7 | Low-tier sources + inference → evaluator can reject | Red-team hard gate engaged |

## 3. Research Questions

| # | Question | Priority | Route | Status | Evidence Quality |
|---|----------|:--:|-------|--------|:--:|
| Q-rt-01 | COPPA 2025 requirements for EdTech | p0 | external | **partial** | tier-1 statute exists, **application to THIS scenario = [Inference]** |
| Q-rt-02 | FERPA applicability | p0 | external | **partial** | tier-1 statute exists, **applicability to solo dev = [Inference]** |
| Q-rt-03 | School consent mechanism validity | p0 | external | **open** | **NO tier-1 evidence for THIS specific use case** |
| Q-rt-04 | COPPA-compliant auth for under-13 | p0 | external | **partial** | Options identified, compliance **not verified** |
| Q-rt-05 | BaaS platforms for EdTech | p1 | external | **partial** | Pricing found, COPPA posture **not verified** |
| Q-rt-06 | Teacher dashboard data minimization | p1 | external | **partial** | Design patterns exist, **legal sufficiency = [Inference]** |
| Q-rt-07 | LEARN loop for education | p1 | internal | **answered** | §PHIL.DT-07 confirmed |
| Q-rt-08 | Security model for roles | p1 | internal | **answered** | §SEC.R-02 confirmed |
| Q-rt-09 | 3D engine comparison | p1 | carried | **answered** | Validated in bench-002 |
| Q-rt-10 | Cost analysis | p1 | external | **partial** | Pricing ranges found |

**Critical observation**: 3 of 4 p0 questions have evidence quality at [Inference] level for the specific compliance determination. This is the red-team trigger.

## 4. Retrieval Plan

### Internal (Palantir Research Library)
- §PHIL.DT-07: LEARN mechanisms → student outcomes as regulated DATA
- §SEC.R-02: Four-layer security → teacher/student RBAC
- Protocol: Question → Recipe → Grep → Compose → Reason ✓

### External
- COPPA 2025 amendment (Federal Register) — tier-1 for statute, [Inference] for application
- FERPA (DOE) — tier-1 for statute, [Inference] for applicability
- BaaS pricing and features — tier-1 for platform facts
- Authentication options — tier-1 for platform facts, [Inference] for compliance

## 5. Internal Palantir Findings

| Finding | Provenance | Markers | Confidence |
|---------|-----------|---------|:--:|
| LEARN-01 (write-back): Student scores written as new DATA entities = **regulated children's data** | [Official] | §PHIL.DT-07 | 0.95 |
| LEARN-02 (eval feedback): Teacher evaluates student progress = **accessing regulated data** | [Official] | §PHIL.DT-07 | 0.95 |
| RBAC Layer 1: Teacher role sees all students, student role sees own data | [Synthesis] | §SEC.R-02 | 0.85 |
| Object-Level Layer 3: Row-level security needed per student | [Synthesis] | §SEC.R-05 | 0.85 |

## 6. External Current Findings

| Finding | Source | Tier | Provenance | Confidence |
|---------|--------|:--:|:--:|:--:|
| COPPA applies when collecting PI from under-13 | FTC (16 CFR 312) | 1 | **[Official]** | 0.99 |
| COPPA 2025 amendment deadline: April 22, 2026 | Federal Register | 1 | **[Official]** | 0.99 |
| Student name + scores + session = personal information | COPPA definition | 1 | **[Official]** | 0.99 |
| Schools MAY act as COPPA consent agent | FTC guidance | 1 | **[Official]** concept; **[Inference]** for THIS app | 0.60 |
| FERPA applies to EdTech storing student records | DOE guidance | 1 | **[Official]** concept; **[Inference]** for THIS scenario | 0.70 |
| Developer is COPPA operator regardless of BaaS | Standard industry pattern | — | **[Inference]** | 0.85 |
| Firebase has children's privacy controls page | firebase.google.com | 1 | **[Official]** page exists; **compliance scope = [Inference]** | 0.50 |

| **School consent was NOT codified** in COPPA 2025 — exists only as informal FTC guidance | Wiley Law / Federal Register | 1+2 | **[Official]** (exclusion is documented) | 0.95 |
| **Both COPPA and FERPA apply simultaneously** — compliance with one does NOT satisfy the other | Multiple legal analyses | 2 | **[Legal Commentary]** confirmed by statute | 0.90 |
| **2025 amendment adds**: mandatory written security program, written retention policy, designated coordinator | Federal Register | 1 | **[Official]** | 0.99 |
| Per-student dashboard **cannot be anonymized** — if teacher identifies student, data is PI | 16 CFR 312.2 | 1 | **[Official]** definition + **[Inference]** logical necessity | 0.95 |
| Clever: **COPPA Safe Harbor** (iKeepSafe certified), FERPA school official | clever.com | 1 | **[Official]** vendor claim | 0.85 |
| Google Workspace: claims COPPA/FERPA for Core Services. **Third-party Firebase apps NOT covered.** | edu.google.com | 1 | **[Official]** vendor docs | 0.90 |
| State laws (CA SOPIPA, NY Ed Law 2-d, IL SOPPA) NOT researched — may impose stricter requirements | — | — | **Evidence Gap** | — |

**Critical provenance analysis**: The statutes are [Official]. The APPLICATION of those statutes to this specific EdTech scenario is [Inference]. The school consent mechanism is NOT codified law — it is informal FTC guidance with lower legal weight. This distinction is THE red-team finding.

## 7. Ontology Mapping

| Concept | Type | Domain | Regulatory Status |
|---------|------|:--:|:--:|
| Student | object-type | DATA | **REGULATED** — personal information |
| ScoreRecord | object-type | DATA | **REGULATED** — education record |
| LearningSession | object-type | DATA | **REGULATED** — session data linked to student |
| Teacher | object-type | DATA | Not regulated (adult) |
| Classroom | object-type | DATA | Organizational — not directly regulated |
| ComputeDifficulty | function | LOGIC | Reads regulated data |
| AggregateClassPerformance | function | LOGIC | Processes regulated data |
| SubmitAnswer | action-type | ACTION | **WRITES** regulated data |
| ViewDashboard | action-type | ACTION | **READS** regulated data |

## 8. Competing Architecture Options

### Branch A: R3F + Convex (Managed BaaS)
- **Pros**: Managed infra, TypeScript-first, potential SOC 2
- **Cons**: Convex COPPA posture unverified, DPA availability unknown
- **Governance**: 1/5 — **unresolvable without legal review**

### Branch B: R3F + Firebase (Google Ecosystem)
- **Pros**: Most mature BaaS, children's privacy page exists, Google Workspace SSO
- **Cons**: Google's COPPA compliance doesn't extend to third-party apps; developer is still operator
- **Governance**: 1/5 — **unresolvable without legal review**

### Branch C: R3F + PocketBase (Self-Hosted)
- **Pros**: Full data control, no vendor DPA needed, cheapest
- **Cons**: Solo dev security risk, no managed certifications, district may reject
- **Governance**: 1/5 — **unresolvable without legal review**

## 9. Simulation Results

12 scenarios generated (3 branches × 4 types). 2 revision rounds completed.

**CRITICAL FINDING**: ALL 12 scenarios score 1/5 on Governance Compliance. This is not a technology failure — it is a structural impossibility. COPPA/FERPA compliance for a specific EdTech app collecting children's data CANNOT be determined by web research. It requires legal counsel.

| Branch | Base | Best | Worst | Adversarial |
|--------|:--:|:--:|:--:|:--:|
| A (Convex) | 17/35 | 17/35 | 13/35 | 12/35 |
| B (Firebase) | 17/35 | 15/35 | 13/35 | 15/35 |
| C (Self-Hosted) | 14/35 | 14/35 | 9/35 | 13/35 |

All scores are dragged down by Governance = 1 and Risk Severity = 1.

## 10. Scenario Matrix

| Dimension | A-Base | A-Best | A-Worst | B-Base | B-Best | B-Worst | C-Base | C-Best | C-Worst |
|-----------|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|
| Evidence Fit | 2 | 1 | 3 | 2 | 1 | 3 | 2 | 1 | 3 |
| Impl Difficulty | 3 | 3 | 1 | 3 | 3 | 1 | 2 | 2 | 1 |
| Risk Severity | **1** | 3 | **1** | **1** | 2 | **1** | **1** | 2 | **1** |
| Reversibility | 3 | 3 | 2 | 2 | 2 | 2 | 4 | 4 | 1 |
| Time-to-Value | 3 | 2 | 1 | 3 | 2 | 1 | 2 | 2 | 1 |
| Governance | **1** | **1** | **1** | **1** | **1** | **1** | **1** | **1** | **1** |
| Ecosystem | 4 | 4 | 4 | 5 | 5 | 5 | 2 | 2 | 2 |

**Governance = 1 across ALL scenarios.** This is not a scoring error — it is the correct result when compliance cannot be verified.

## 11. Recommended Path: **NONE — EXPLICIT REJECTION**

**No technology stack recommendation can be issued.**

The reason is not technological — all three branches are technically feasible. The reason is **regulatory**: COPPA/FERPA compliance for this specific EdTech scenario collecting children's educational data CANNOT be determined without a completed legal review by an education privacy attorney.

**Agent-confirmed finding reinforcing rejection**: The backend research agent verified that **no BaaS provider (Convex, Supabase, Firebase, PocketBase) offers turnkey COPPA compliance**. Firebase comes closest with explicit COPPA configuration documentation, but the Firebase SDK does NOT automatically make an app compliant — the developer must manually disable Analytics, Crashlytics, and Advertising ID collection for child-directed apps. COPPA compliance is always an application-layer responsibility.

Additionally: at the 100-500 student scale, all BaaS options cost $0-25/month. **Cost is not the differentiator — compliance posture is.** The technology choice is straightforward once legal requirements are known.

**What WOULD constitute an acceptable recommendation**:
1. Legal review completed by an attorney specializing in COPPA/FERPA for EdTech
2. School consent mechanism validity confirmed for THIS specific use case
3. Data Processing Agreement template reviewed and approved
4. Privacy policy drafted and reviewed
5. Data retention and deletion policy established

**After these 5 prerequisites are met**, a technology recommendation can proceed. At that point, the tech-layer findings from bench-002 + bench-003 remain valid: R3F for 3D rendering, and the BaaS choice depends on which vendor can provide the compliance infrastructure identified in the legal review.

## 12. Risks / Unknowns

| Risk | Severity | Status |
|------|:--:|--------|
| COPPA violation from collecting children's educational data | **critical** | **UNRESOLVED** — requires legal review |
| FERPA violation from storing student education records | **critical** | **UNRESOLVED** — requires legal review |
| School consent mechanism insufficient for this use case | **critical** | **UNRESOLVED** — [Inference] only |
| Data breach of children's records | **critical** | **UNMITIGATED** — no security program in place |
| District rejects pilot due to missing compliance documentation | **high** | **LIKELY** without legal preparation |
| BaaS vendor ToS assigns COPPA liability to developer | **high** | **UNVERIFIED** per vendor |
| 2025 amendment mandates written security program + designated coordinator | **high** | Solo dev must fulfill all COPPA operator obligations |
| State laws (SOPIPA, Ed Law 2-d, SOPPA) may impose stricter requirements | **high** | **NOT RESEARCHED** — additional compliance layer |
| School consent mechanism is UNCODIFIED — lower legal weight than regulation | **critical** | Confirmed by agent research — FTC deferred codification |
| COPPA + FERPA dual compliance required — independent satisfaction needed | **high** | Confirmed — compliance with one does NOT satisfy the other |

## 13. Next Experiments

| # | Experiment | Priority | Type |
|---|-----------|:--:|:--:|
| Exp-rt-01 | **Engage education privacy attorney for COPPA/FERPA review** | **p0** | **BLOCKING** — no recommendation possible without this |
| Exp-rt-02 | Contact target school district IT for vendor assessment requirements | p0 | BLOCKING |
| Exp-rt-03 | Convex: request DPA and children's data handling documentation | p1 | De-risks Branch A |
| Exp-rt-04 | Firebase: verify exact scope of children's privacy controls for third-party apps | p1 | De-risks Branch B |
| Exp-rt-05 | Prototype R3F + selected BaaS (tech feasibility — can run parallel to legal) | p2 | Non-blocking |
| Exp-rt-06 | Chromebook + tablet WebGL2 benchmark (carried from bench-002) | p2 | Non-blocking |

**Experiments 1-2 are ABSOLUTE PREREQUISITES.** No technology selection should proceed until legal/institutional requirements are known.

## 14. What Would Change the Decision

- If **legal review confirms** school consent is valid for this use case → ACCEPT becomes possible
- If **legal review reveals** VPC (Verifiable Parental Consent) is required → architecture must include VPC flow, significantly increasing complexity and cost
- If **district IT requires** SOC 2 → Branch C (self-hosted) eliminated; Branch B (Firebase) strongest
- If **FERPA DUA** is required → adds contract negotiation timeline to all branches
- If **legal review determines** the app is NOT "directed to children" (e.g., school-administered tool) → may simplify COPPA path

## 15. Evaluator Hard Gate Result

### REJECTION_CRITERIA_CHECK

```
R1  (Low-tier dependency):     **FAIL** — ALL governance claims depend on [Inference] from tier-1 statutes.
    The statutes are tier-1, but their APPLICATION to this specific scenario is inference-grade.
    MOREOVER: Agent research confirmed the school consent mechanism was NOT codified in the
    2025 final rule — it exists ONLY as informal FTC guidance (lower legal weight than regulation).
    The FTC deferred to anticipated DOE FERPA updates that have NOT been finalized.
    A pilot proposal submitted to a school district cannot rely on uncodified guidance.

R2  (Unresolved contradictions): **FAIL** — 3 of 12 scenarios have contradictionStatus="detected"
    - sc-rt-a-base: COPPA school consent + Convex compliance posture
    - sc-rt-b-base: Firebase COPPA scope
    - sc-rt-c-base: Self-hosted compliance simplicity

R3  (Scenario link):           PASS — scenarios exist for all 3 branches

R4  (Risk link):               PASS — 6 risks identified

R5  (Stale evidence):          PASS — all evidence current

R6  (Blurred provenance):      PASS — all claims tagged with provenance
    (This is actually a strength of this run — provenance boundaries are preserved,
    which is WHY the evaluator can detect the inference dependency)

R7  (Win rationale):           **N/A** — no recommendation issued (explicit rejection)

R8  (Alternatives):            **N/A** — no recommendation issued

R9  (Insufficient evidence):   **FAIL** — 4 of 12 scenarios have evidenceSufficiency="insufficient"
    ALL best-case scenarios across ALL branches are "insufficient" because they assume
    legal compliance that has not been verified.

R10 (Reversal conditions):     PASS — 5 reversal conditions specified
```

### ACCEPTANCE_CHECKLIST

```
[x] >= 3 architecture branches generated (A: Convex, B: Firebase, C: PocketBase)
[x] >= 4 scenarios per branch (base/best/worst/adversarial)
[x] All 7 scoring dimensions applied
[x] >= 2 revision rounds completed
[x] Contradictions classified
[x] Evidence sufficiency tracked
[x] Provenance boundaries preserved
[x] Ontology-state artifacts updated
[ ] GOVERNANCE COMPLIANCE >= 2 ON AT LEAST ONE RECOMMENDED SCENARIO — **FAILED**
[ ] NO UNRESOLVED CONTRADICTIONS ON RECOMMENDED SCENARIOS — **FAILED** (no recommendation)
[ ] RECOMMENDATION HAS SUFFICIENT EVIDENCE — **FAILED** (no recommendation)
```

### GATE_DECISION: **REJECT**

**Rejection is the correct red-team outcome.**

The evaluator correctly identifies that:
1. **Governance Compliance = 1/5 across ALL 12 scenarios** — no scenario can support a recommendation
2. **R1 fails** — compliance claims depend on inference, not legal review
3. **R2 fails** — 3 scenarios have unresolved contradictions
4. **R9 fails** — 4 scenarios have insufficient evidence

The rejection is NOT because the technology is bad. It is because:
- **COPPA compliance cannot be determined by web research** — it requires legal counsel
- **FERPA applicability cannot be determined by web research** — it requires legal counsel
- **School consent mechanism validity cannot be determined by web research** — it requires legal counsel

**A rejected run is a successful red-team outcome** when the rejection is well-justified. This rejection IS well-justified: it prevents a pilot proposal from being submitted to a school district with inference-grade compliance claims that would be rejected by any competent district review process.

### Recommendation for Next Steps (NOT a tech stack recommendation)

1. **FIRST**: Engage an education privacy attorney (estimated cost: $2,000-$5,000 for initial COPPA/FERPA review)
2. **SECOND**: Contact target school district IT for vendor requirements
3. **THIRD**: Based on legal + institutional answers, re-run bench-003 with resolved evidence gaps
4. **PARALLEL**: Build a technology prototype (R3F + preferred BaaS) that demonstrates the 3D experience. This can proceed without compliance resolution because it uses synthetic data, not real student data.

The technology layer is ready. The compliance layer is not. Do not conflate the two.

**Technology layer summary (ready for post-legal-review selection)**:
- **Rendering**: R3F v9 (native React reconciler, WebGL2 floor) — validated in bench-001/002
- **BaaS leading candidates**: Convex (free tier 1M calls, SOC 2, TypeScript-first, startup program) or Firebase (explicit COPPA docs, Google ecosystem, 50K auth MAUs free)
- **Auth strategy**: Passwordless magic link to teacher email → teacher creates student accounts (no child PII in auth flow). Compatible with all BaaS options. School SSO (Clever/Google) available as upgrade path.
- **Dashboard**: Role-gated single app (not separate admin), per-student views for teachers, class aggregates
- **Cost**: $0-25/month at 100-500 students across ALL options
- **Architecture**: Extensible to multiplayer (Convex real-time subscriptions, or add WebSocket layer later)

# Benchmark Workflow — 3D Math Learning Experience (Phase 3)

## Benchmark Prompt

> "Research the latest production-viable technology stack for a 3D live demo
> where elementary school students learn mathematics through a Roblox-like
> interactive experience, and evaluate architecture options through prototyping
> feasibility, educational UX, multiplayer implications, child-safety constraints,
> and Vercel deployment suitability."

---

## Stage 1: Research Question Decomposition

| ID | Question | Priority | Route | Scope | Success Criteria |
|----|----------|----------|-------|-------|-----------------|
| Q1 | What 3D rendering engines are production-viable for browser-based educational apps? | p0 | external | WebGL/WebGPU engines with React integration, 2025-2026 releases | >= 3 candidates compared on performance, ecosystem, React support |
| Q2 | What multiplayer frameworks support real-time collaboration for educational 3D? | p1 | external | WebSocket/WebRTC, < 100 concurrent users per session | >= 2 candidates compared on latency, hosting model, Vercel compat |
| Q3 | What are Vercel's deployment constraints for 3D web apps? | p0 | external | Function limits, CDN, edge runtime, WebSocket support | Concrete limits documented: regions, concurrency, /tmp, streaming |
| Q4 | What COPPA/child safety requirements apply to ages 6-12 educational platforms? | p1 | external | US COPPA, EU Age-Appropriate Design Code | Compliance checklist with actionable requirements |
| Q5 | How does ontology-driven architecture map to educational domain entities? | p2 | internal | D/L/A classification: Student, Lesson, Problem, Score, Progress | Complete D/L/A mapping using BROWSE.md recipes |
| Q6 | What is WebGPU browser support status on target devices (school Chromebooks)? | p0 | external | Chrome, Safari, Firefox support matrix, fallback story | Support matrix with dates + WebGL fallback viability |
| Q7 | What educational UX patterns maximize engagement for elementary math? | p1 | external | Gamification, immediate feedback, progressive difficulty, reward systems | >= 3 evidence-backed patterns with implementation implications |

## Stage 2: Retrieval Plan

### Internal Browse (Q5 — Palantir Research Library)

| Recipe | Markers | Purpose |
|--------|---------|---------|
| "How do I model a new entity?" | §DATA.EN-01..06, §DATA.PR-01..02 | Student, Problem entity modeling |
| "How do I decompose requirements into D/L/A?" | §ENTRY.RQ-03..08, §SH-01..03 | Domain classification |
| "What is the Digital Twin feedback loop?" | §PHIL.DT-02..07 | SENSE-DECIDE-ACT-LEARN for learning analytics |
| "How does the type system prevent hallucination?" | §TS.TSG-02..08 | Grounding student interaction model |

### External Research (Q1-Q4, Q6-Q7)

| Question | Tier 1 Sources | Tier 2-3 Sources |
|----------|---------------|-----------------|
| Q1 | three.js docs, babylonjs docs, playcanvas docs | react-three-fiber docs (pmnd.rs) |
| Q2 | colyseus.io docs, partykit docs, liveblocks docs | GitHub repos, benchmarks |
| Q3 | vercel.com/docs (functions, limits, CDN) | Vercel blog, changelog |
| Q4 | ftc.gov/coppa, ico.org.uk/age-appropriate | Academic papers |
| Q6 | caniuse.com/webgpu, chromestatus.com | MDN WebGPU docs |
| Q7 | Khan Academy research, learning science papers | EdTech blog posts |

## Stage 3: Architecture Branches

### Option A: Three.js + R3F + Colyseus + Vercel
- Stack: React 19 + react-three-fiber v9 + @react-three/drei + Colyseus
- Deployment: Vercel (static + API) + external WS server (Railway/Fly.io)
- Maturity: mature ecosystem, largest community

### Option B: Babylon.js + PartyKit + Vercel
- Stack: React + @babylonjs/core + PartyKit (Cloudflare edge)
- Deployment: Vercel (static) + PartyKit (multiplayer, edge)
- Maturity: native WebGPU, smaller React ecosystem

### Option C: PlayCanvas + Custom WS + Vercel
- Stack: PlayCanvas Editor + vanilla JS + custom WebSocket
- Deployment: Vercel (static) + custom WS server
- Maturity: visual editor workflow, no React binding

## Stage 4: Simulation Pipeline

Per `docs/scoring-rubric.md`, each option generates 4 scenarios scored on 7 dimensions.

### Expected Scenario Matrix (12 scenarios)

| Option | Base | Best | Worst | Adversarial |
|--------|------|------|-------|-------------|
| A (R3F) | WebGL fallback, 30fps Chromebook | WebGPU, 60fps, rich ecosystem | Low-end device perf issues | WebGL deprecated before WebGPU ready |
| B (Babylon) | Native WebGPU, edge multiplayer | Full WebGPU + PartyKit perf | PartyKit rate limits at scale | Cloudflare pricing model change |
| C (PlayCanvas) | Visual editor speeds prototyping | Editor + collaborative features | No React = slower UI iteration | Editor dependency = vendor lock |

### Evaluation Dimensions (weighted)

| Dimension | Weight | Rationale |
|-----------|--------|-----------|
| Prototyping Feasibility | 3 | Speed to working demo is critical for validation |
| Educational UX Quality | 3 | Primary success metric for target users |
| Performance (Chromebooks) | 3 | Target devices are low-end |
| Child Safety / COPPA | 3 | Non-negotiable compliance requirement |
| Multiplayer Capability | 2 | Classroom collaboration needed but not primary |
| Vercel Deployment Fit | 2 | Preferred platform but can be worked around |
| Ecosystem Maturity | 1 | Nice-to-have, not blocking |

## Stage 5: Execution Runbook

### Prerequisites
```bash
cd ~/kosmos
# Verify env vars are set (see docs/setup.md)
echo $KOSMOS_PROJECT_ROOT
echo $KOSMOS_RESEARCH_BASE
```

### Step-by-step execution

1. **Orchestrator**: Paste benchmark prompt. Orchestrator decomposes into Q1-Q7.
2. **Researcher (internal)**: Browse BROWSE.md for Q5 markers, compose D/L/A mapping.
3. **Researcher (external)**: Fetch tier-1 docs for Q1-Q4, Q6-Q7 via scrapling/context7.
4. **Ontologist**: Map technology candidates + educational entities to world-model.json.
5. **Simulator**: Generate 12 scenarios (3 options x 4 types), score, revise (>= 2 rounds).
6. **Evaluator**: Validate provenance, run rejection criteria R1-R10, gate decision.
7. **Reporter**: Produce final-report.md + scenario-matrix.md + next-experiments.md.

### Expected outputs
- `ontology-state/world-model.json` — technology + educational domain entities
- `ontology-state/source-map.json` — 15-25 source documents (tier-classified)
- `ontology-state/scenarios.json` — 12+ scenarios with evaluation scores
- `ontology-state/decision-log.json` — Q1-Q7 decomposition + routing
- `reports/benchmark-plan.md` — research plan artifact
- `reports/benchmark-scenario-matrix.md` — side-by-side comparison
- `reports/benchmark-next-experiments.md` — remaining uncertainty

### Success criteria
- All 7 questions answered or documented as gaps with NextExperiments
- All scenarios scored on 7 dimensions per scoring rubric
- >= 2 revision rounds completed
- Evaluator ACCEPT gate passed (R1-R10)
- DecisionRecommendation `isComplete: true`

### MCP connectors needed
| Connector | Used For | Status |
|-----------|---------|--------|
| scrapling (fetch/stealthy_fetch) | External web pages | Available |
| context7 (resolve-library-id, query-docs) | Library documentation | Available |
| WebSearch | Discovery queries | Available |
| Playwright (optional) | Runtime verification of demos | Available |

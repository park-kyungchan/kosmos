# Benchmark Workflow — 3D Math Learning Experience

## Benchmark Prompt

> "Research the latest production-viable technology stack for a 3D live demo
> where elementary school students learn mathematics through a Roblox-like
> interactive experience, and evaluate architecture options through prototyping
> feasibility, educational UX, multiplayer implications, safety constraints,
> and Vercel deployment suitability."

## Stage 1: Research Question Decomposition

| # | Question | Domain | Priority | Route | Scope |
|---|----------|--------|----------|-------|-------|
| Q1 | What 3D rendering engines are production-viable for browser-based educational apps in 2026? | technology | p0 | external | WebGL/WebGPU engines with React integration |
| Q2 | What multiplayer frameworks support real-time collaboration for educational 3D environments? | technology | p1 | external | WebSocket/WebRTC-based, < 100 concurrent users |
| Q3 | What are Vercel's deployment constraints for 3D web applications? | deployment | p0 | external | Function limits, static asset CDN, edge runtime |
| Q4 | What COPPA/child safety requirements apply to educational platforms for ages 6-12? | governance | p1 | external | US COPPA + age-appropriate design principles |
| Q5 | How does the Palantir ontology model map to educational domain entities? | architecture | p2 | internal | D/L/A classification for Student, Lesson, Problem, Score |
| Q6 | What is the state of WebGPU browser support for deployment targeting school Chromebooks? | technology | p0 | external | Chrome, Safari, Firefox WebGPU support matrix |
| Q7 | What educational UX patterns maximize engagement for elementary math? | design | p1 | external | Gamification, immediate feedback, progressive difficulty |

## Stage 2: Retrieval Plan

### Internal (Palantir Browse — Q5)

| Question | BROWSE.md Recipe | Markers |
|----------|-----------------|---------|
| Q5: Ontology mapping | "How do I model a new entity?" | §DATA.EN-01..06, §DATA.PR-01..02, §DATA.EN-22/DH-DATA-01..03 |
| Q5: D/L/A classification | "How do I decompose requirements into D/L/A?" | §ENTRY.RQ-03..08, §SH-01..03 |
| Q5: Digital Twin feedback | "What is the Digital Twin feedback loop?" | §PHIL.DT-02, §PHIL.DT-03, §PHIL.DT-07 |

### External (scrapling + context7 — Q1-Q4, Q6-Q7)

| Question | Sources to Fetch | Tier |
|----------|-----------------|------|
| Q1: 3D engines | three.js docs, Babylon.js docs, PlayCanvas docs | Tier 1 |
| Q1: React integration | react-three-fiber docs (pmnd.rs) | Tier 1 |
| Q2: Multiplayer | Colyseus docs, Liveblocks docs, PartyKit docs | Tier 1 |
| Q3: Vercel deployment | Vercel docs (functions, limits, CDN) | Tier 1 |
| Q4: COPPA | FTC COPPA guidance, Age-Appropriate Design Code | Tier 1 |
| Q6: WebGPU | caniuse.com/webgpu, Chrome Platform Status | Tier 1 |
| Q7: Educational UX | Academic papers, Khan Academy design blog | Tier 3-4 |

## Stage 3: Expected Technology Candidates

Based on preliminary external research (scrapling, 2026-03-23):

### 3D Rendering
| Candidate | Version | Maturity | React Integration | License |
|-----------|---------|----------|-------------------|---------|
| Three.js + R3F | r168 / v9 | mature | Native (react-three-fiber) | MIT |
| Babylon.js | 7.x | mature | React wrapper available | Apache-2.0 |
| PlayCanvas | 2.x | stable | No React binding | MIT |

### Multiplayer
| Candidate | Type | Latency | Max Users | License |
|-----------|------|---------|-----------|---------|
| Colyseus | WebSocket rooms | low | ~100/room | MIT |
| PartyKit | Edge runtime | low | ~100/room | MIT |
| Liveblocks | Managed service | low | ~100/room | Commercial |

### Deployment
| Platform | Static CDN | Functions | Edge | WebSocket |
|----------|-----------|-----------|------|-----------|
| Vercel | Yes (global) | Node/Bun/Python | Yes | No (need external) |

## Stage 4: Expected Architecture Options

### Option A: Three.js + R3F + Colyseus + Vercel
- **Strengths**: Largest ecosystem, React-native 3D, well-documented
- **Weaknesses**: WebSocket server needs separate hosting (not Vercel)
- **Difficulty**: 3/5

### Option B: Babylon.js + PartyKit + Vercel
- **Strengths**: Native WebGPU, PartyKit runs on Cloudflare (edge)
- **Weaknesses**: Smaller React ecosystem, less community content
- **Difficulty**: 3/5

### Option C: PlayCanvas + Custom Backend + Vercel
- **Strengths**: Visual editor, built for games
- **Weaknesses**: No React integration, custom multiplayer needed
- **Difficulty**: 4/5

## Stage 5: Simulation Preview

Each option generates 4 scenarios:

| | Base | Best | Worst | Adversarial |
|---|------|------|-------|-------------|
| **A (R3F)** | Works with WebGL fallback | WebGPU enabled, 60fps on Chromebooks | Performance issues on low-end devices | WebGL deprecated, WebGPU not ready |
| **B (Babylon)** | Native WebGPU advantage | Full WebGPU + edge multiplayer | PartyKit limits hit at scale | Cloudflare pricing change |
| **C (PlayCanvas)** | Visual editor speeds development | Editor + collaborative features | No React = slower UI iteration | Editor dependency = vendor lock-in |

## Stage 6: Evaluation Dimensions

| Dimension | Weight | Applies To |
|-----------|--------|-----------|
| Prototyping Feasibility | 3 | How fast can we build a demo? |
| Educational UX Quality | 3 | Does it support gamification + feedback? |
| Multiplayer Capability | 2 | Real-time collaboration for classrooms |
| Safety/COPPA Compliance | 3 | Age-appropriate, no data collection |
| Vercel Deployment Fit | 2 | Static + edge + serverless compatibility |
| Performance on Chromebooks | 3 | 30fps+ on Intel/ARM Chromebooks |
| Ecosystem Maturity | 1 | Community size, documentation quality |

## Stage 7: Execution Instructions

### To Run This Benchmark

1. **Open a new Claude Code session** in `~/kosmos/`
2. **Paste the benchmark prompt** as the user message
3. The system will:
   a. Orchestrator decomposes into Q1-Q7
   b. Researcher fetches internal (Q5) + external (Q1-Q4, Q6-Q7)
   c. Ontologist maps findings to world-model.json
   d. Simulator generates hypotheses + scenarios + revision rounds
   e. Evaluator validates provenance + completeness
   f. Reporter produces final-report.md + scenario-matrix.md

4. **Expected outputs**:
   - `ontology-state/world-model.json` — populated with technology entities
   - `ontology-state/source-map.json` — 15-25 source documents
   - `ontology-state/scenarios.json` — 12+ scenarios (3 options × 4 types)
   - `ontology-state/decision-log.json` — decomposition + routing decisions
   - `reports/final-report.md` — complete 13-section report
   - `reports/scenario-matrix.md` — side-by-side comparison

5. **Success criteria**:
   - All 7 research questions answered or documented as gaps
   - All scenarios have evaluationScores
   - At least 2 revision rounds completed
   - DecisionRecommendation is `isComplete: true`
   - No unresolved "detected" contradictions

## Preliminary External Research Notes (2026-03-23)

### react-three-fiber (Tier 1, pmnd.rs docs)
- v9 pairs with React 19
- No performance overhead vs plain Three.js
- Rich ecosystem: @react-three/drei (helpers), @react-three/rapier (physics),
  @react-three/xr (VR/AR), @react-three/a11y (accessibility)
- Full TypeScript support via @types/three
- React Native support via @react-three/fiber/native

### Vercel Functions (Tier 1, vercel.com docs, 2026-02-18)
- Runtimes: Node.js, Bun, Python, Go, Rust, Ruby, Wasm, Edge
- Up to 3 regions (Pro), 18 regions (Enterprise)
- 500MB /tmp scratch space per function
- Auto-scaling: up to 30,000 concurrency (Pro)
- Streaming supported on Node.js and Edge
- No native WebSocket support — need external service
- Static assets served via global CDN
- Cron jobs available for scheduled tasks

# Benchmark Research Plan

> Benchmark: 3D Math Learning Experience
> Created: 2026-03-23
> Status: READY FOR EXECUTION

---

## User Objective

Build a production-viable 3D live demo where elementary school students (ages 6-12)
learn mathematics through a Roblox-like interactive experience. Evaluate architecture
options across prototyping feasibility, educational UX, multiplayer, child safety,
and Vercel deployment.

## Research Questions

### P0 — Blocking

| ID | Question | Route | Target Sources |
|----|----------|-------|---------------|
| Q1 | Production-viable 3D rendering engines for browser-based educational apps | External | three.js, babylon.js, playcanvas docs |
| Q3 | Vercel deployment constraints for 3D web applications | External | vercel.com/docs |
| Q6 | WebGPU browser support on school Chromebooks | External | caniuse.com, chromestatus.com |

### P1 — Important

| ID | Question | Route | Target Sources |
|----|----------|-------|---------------|
| Q2 | Multiplayer frameworks for real-time educational 3D collaboration | External | colyseus, partykit, liveblocks docs |
| Q4 | COPPA/child safety requirements for ages 6-12 | External | ftc.gov, ico.org.uk |
| Q7 | Educational UX patterns for elementary math engagement | External | Learning science papers |

### P2 — Architecture

| ID | Question | Route | Target Sources |
|----|----------|-------|---------------|
| Q5 | Ontology-driven architecture mapping for educational domain | Internal | BROWSE.md: §DATA.EN-*, §ENTRY.RQ-*, §PHIL.DT-* |

## Architecture Branches Under Evaluation

| Branch | Core Stack | Multiplayer | Deployment |
|--------|-----------|-------------|-----------|
| A | Three.js + react-three-fiber v9 | Colyseus | Vercel + external WS |
| B | Babylon.js 7.x | PartyKit (edge) | Vercel + PartyKit |
| C | PlayCanvas 2.x | Custom WebSocket | Vercel + custom server |

## Simulation Plan

- 3 architecture options × 4 scenario types = 12 scenarios minimum
- Each scored on 7 weighted dimensions (see `docs/scoring-rubric.md`)
- Minimum 2 revision rounds when contradictions found
- Evidence sufficiency tracked per scenario

## Expected Timeline

| Phase | Agent | Duration |
|-------|-------|----------|
| Decomposition | orchestrator | ~2 min |
| Internal browse | researcher | ~5 min |
| External research | researcher | ~10 min |
| Ontology mapping | ontologist | ~3 min |
| Simulation (2+ rounds) | simulator | ~8 min |
| Evaluation gate | evaluator | ~3 min |
| Report generation | reporter | ~5 min |
| **Total** | — | **~36 min** |

## Risks to Benchmark Execution

| Risk | Severity | Mitigation |
|------|----------|-----------|
| External source unavailable | medium | Fall back to cached/prior knowledge, flag as gap |
| WebGPU data stale | medium | Check caniuse date, flag if > 3 months old |
| COPPA requirements ambiguous | low | Cite FTC guidance directly, flag interpretations as [Inference] |
| Scoring subjectivity | low | Use rubric definitions strictly, cite evidence for each score |

# mathcrew — Cold Audit: Current State

> **Date**: 2026-03-23
> **Orchestrator**: Kosmos Research OS v0.3.0
> **Target**: `/home/palantirkc/mathcrew/` (git: `park-kyungchan/mathcrew`, 1 commit)
> **Method**: Cold state inspection → Palantir-style D/L/A decomposition → Feasibility assessment → Refactor design
> **Provenance discipline**: [Repo-Fact] = observed in code | [Doc-Claim] = stated in docs | [Inference] = reasoned from evidence

---

## 1. Current State of mathcrew {#1-current-state}

### 1.1 Identity

**Purpose**: Adaptive elementary math learning engine — diagnoses prerequisite knowledge gaps and recommends review paths. Korean 5th grade curriculum (divisors → multiples → GCD).

**Project phase**: v0.1 prototype, single commit (`b97e8b6`), not deployed.

**Stack**: TypeScript + Bun monorepo, Nest.js + MongoDB backend, React 19 + React Three Fiber frontend, MCP server for Claude Code integration.

### 1.2 Measured Dimensions

| Dimension | Value | Source |
|-----------|-------|--------|
| TypeScript files | 65 | [Repo-Fact] `find -name "*.ts" -o -name "*.tsx"` |
| Total lines | 3,634 | [Repo-Fact] `wc -l` |
| Git commits | 1 | [Repo-Fact] `git log --oneline` |
| Packages | 4 (core, api, mcp, client) | [Repo-Fact] `ls packages/` |
| Ontology files | 5 (data, logic, action, security, schema) | [Repo-Fact] |
| Research docs | 7 | [Repo-Fact] `ls research/` |
| Design docs | 3 (blueprint, scope, handoff) | [Repo-Fact] `ls docs/` |
| Seed data files | 4 (curriculum, concepts, questions, students) | [Repo-Fact] |
| Client test files | 0 | [Repo-Fact] |
| Core test files | 4 (77+ assertions) | [Repo-Fact] |
| MCP test files | 1 (37 assertions) | [Repo-Fact] |
| Dead dependencies | 2 (ecctrl, leva) | [Repo-Fact] — in package.json, never imported |
| tsc --noEmit | PASS | [Repo-Fact] |

### 1.3 Actual Directory Tree

```
mathcrew/                          3,634 lines TypeScript
├── ontology/                      5 files, ~798L — D/L/A SSoT
│   ├── data.ts                    8 entities (6 domain + 2 LEARN)
│   ├── logic.ts                   5 links, 3 derived props, 5 decision rules
│   ├── action.ts                  8 mutations
│   ├── security.ts                roles, permissions (declaration-only)
│   └── schema.ts                  root re-export + learn infrastructure
│
├── packages/
│   ├── core/                      10 files — pure TS, zero deps
│   │   ├── types.ts               shared entity types + SceneEvent + MasteryMap
│   │   ├── mastery.ts             calculateMastery() — sliding window
│   │   ├── prerequisite.ts        graph traversal (getPrerequisites, isUnlocked)
│   │   ├── recommend.ts           adaptive engine (DR-01~05)
│   │   ├── grading.ts             auto-grade + error classification
│   │   ├── index.ts               public API
│   │   └── *.test.ts              4 test files (all pass)
│   │
│   ├── api/                       ~27 files — Nest.js + MongoDB
│   │   ├── src/
│   │   │   ├── main.ts            NestFactory, port 3000, CORS
│   │   │   ├── app.module.ts      7 modules
│   │   │   ├── schemas/           5 Mongoose schemas
│   │   │   ├── curriculum/        CRUD controller + service
│   │   │   ├── concepts/          CRUD + prerequisite graph
│   │   │   ├── questions/         CRUD + search
│   │   │   ├── students/          CRUD
│   │   │   ├── attempts/          submit + grading
│   │   │   ├── recommend/         mastery + gap analysis
│   │   │   └── seed/              auto-load on startup
│   │   └── package.json           Nest.js 11, Mongoose 9
│   │
│   ├── mcp/                       ~10 files — MCP server
│   │   ├── server.ts              McpServer + stdio, 5 tools
│   │   ├── tools/                 5 tool files
│   │   ├── server.test.ts         37 assertions (pass)
│   │   └── package.json           @modelcontextprotocol/sdk
│   │
│   └── client/                    17 source files — React + R3F
│       ├── src/
│       │   ├── App.tsx            14 lines — route switch only
│       │   ├── main.tsx           React entry
│       │   ├── api.ts             fetch wrapper, 5 endpoints
│       │   ├── modes/
│       │   │   ├── HomeMode.tsx   concept map + character + nav
│       │   │   └── WorldMode.tsx  wrapper for MathWorld
│       │   ├── world/
│       │   │   ├── MathWorld.tsx  200L MONOLITH (Player+Camera+Bridge+Scene)
│       │   │   └── Island.tsx     119L (single island component)
│       │   ├── components/
│       │   │   ├── ConceptMap.tsx
│       │   │   ├── MasteryGauge.tsx
│       │   │   └── character/
│       │   │       ├── SuriCharacter.tsx  SVG character (5 states)
│       │   │       └── types.ts
│       │   ├── hooks/
│       │   │   ├── useConcepts.ts
│       │   │   └── useMastery.ts
│       │   └── styles/global.css
│       ├── package.json           React 19, R3F 9.5, Drei 10.7, Rapier 2.2
│       │                          DEAD: ecctrl 1.0.97, leva 0.10.1
│       └── vite.config.ts         proxy, @core alias, fs.allow
│
├── seed/                          4 JSON files (1 curriculum, 3 concepts, 3 questions, 1 student)
├── docs/                          3 files (blueprint v2, scope, handoff)
├── research/                      7 files (rendering engines, packaging, competitor, architecture, LLM-native, character, 3D candidates)
└── package.json                   root: workspaces + scripts
```

### 1.4 Dependency Flow (Actual)

```
ontology/  (SSoT, 0 imports)
    ↓ informs type design
core/  (pure TS, 0 deps)
    ↓ imported by (compile-time)
api/  (Nest.js + MongoDB)
    ↓ consumed via HTTP
mcp/  (MCP server, REST client to api/)
    ↓ consumed via fetch
client/  (React + R3F, REST client to api/)
```

**Import boundary violations**: None detected. [Repo-Fact]

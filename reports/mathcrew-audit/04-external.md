# mathcrew — External Research Findings

> Part of the mathcrew audit series. See [INDEX.md](INDEX.md) for full context.

---

## 4. External Research Findings {#4-external-research-findings}

> **Research method**: Parallel external research via web search + official documentation.
> **Provenance**: Sources cited inline. [Official] = vendor/org docs. [Benchmark] = measured data. [Community] = forums/blogs.

### 4.1 React Three Fiber Ecosystem (2025-2026)

**Status**: R3F remains the dominant and ONLY mature React 3D solution. No credible competitor exists.

| Metric | Value | Source |
|--------|-------|--------|
| npm weekly downloads | ~697,714 | [Official: npmjs.com] |
| GitHub stars | 29,110 | [Official: GitHub] |
| Three.js weekly downloads | 5,000,000+ | [Official: npmjs.com] |
| Current version | v9.1.2 (React 19 compatible) | [Official: npm] |
| Ecosystem | drei, rapier, gltfjsx, postprocessing | [Official: pmndrs] |

- R3F v9 is a compatibility release for React 19. V10 is in elongated beta.
- R3F renders components **outside React's reconciliation cycle** and leverages React's scheduling.
- WebGPU renderer available via async `gl` prop.

**Key limitation**: Dual learning curve (React + 3D). For >100 dynamic objects, custom `useFrame` loops outperform declarative JSX.

**Assessment for mathcrew**: 3 islands + 1 player + bridges + decorations ≈ 30 objects. Well within R3F's comfortable range. No performance concern at current scale.

### 4.2 Three.js vs Alternatives

| Engine | npm/week | Stars | Bundle (gz) | React | LLM Gen | Assessment |
|--------|----------|-------|-------------|-------|---------|-----------|
| **Three.js/R3F** | 5M+ | 110K | 168KB | Native | HIGH | ✅ Correct choice |
| Babylon.js | 13K | 25K | 1.4MB | Poor | MEDIUM | Not worth migration |
| PlayCanvas | 15K | 14K | 300KB | None | LOW | Incompatible |
| Galacean | N/A | N/A | N/A | Early | LOW | Chinese market focus |
| Threlte | N/A | N/A | N/A | Svelte | LOW | Wrong framework |
| A-Frame | — | — | — | HTML | MEDIUM | Too limited |

[Sources: npmjs.com, GitHub, Utsubo comparison guide 2026]

**Verdict**: Three.js maintains ~300x higher weekly downloads than nearest competitors. Self-reinforcing ecosystem advantage. Migration cost HIGH, benefit ZERO.

### 4.3 Low-End Device Constraints

| Constraint | Budget | mathcrew Now | Source |
|-----------|--------|-------------|--------|
| Draw calls/frame | **<100** for 60fps | ~30 | [Official: MDN WebGL Best Practices] |
| Triangles | <100K total scene | ~5K | [Benchmark: Codrops Three.js demo] |
| Texture memory | 4K texture = 64MB VRAM | ~0 (procedural) | [Official: Three.js Roadmap] |
| Lights | ≤3 active on mobile | 2 (ambient + directional) | [Community: Utsubo 100 Tips] |
| Shadow map | 512-1024px mobile | Not measured | [Community: Utsubo] |
| DPR cap | 1.5 mobile, 1.0 desktop | Default | [Community: Codrops] |
| Fragment precision | `mediump` for 2x mobile perf | Default (`highp`) | [Official: MDN] |

**WebGPU status (2025-11)**: Universal desktop support (Chrome, Firefox 145, Safari 26, Edge). Mobile fragmented — Android 12+ Chrome only. Three.js r171 provides zero-config WebGPU with automatic WebGL 2 fallback.

**Assessment**: mathcrew's procedural geometry (cylinders, spheres, cones — no GLB/textures) is accidentally optimal for low-end devices. The moment GLB character models or high-poly terrain are added, draw call instancing becomes mandatory.

### 4.4 3D Math Education Landscape

| Tool | Rendering | Status | Approach |
|------|----------|--------|----------|
| **GeoGebra 3D** | Custom WebGL | Production, widely used | Interactive 3D for solids/surfaces |
| **Desmos 3D** | Canvas+WebGL | SIGGRAPH 2025 paper | CPU solver → GPU mesh upload |
| **MathBox** | Three.js + ShaderGraph | Open source, low activity | Declarative math diagrams |
| **Mafs** | React + SVG | Active | 2D math visualization |

[Sources: geogebra.org, Desmos SIGGRAPH paper, GitHub]

**Market gap**: No production R3F-based educational math app exists. GeoGebra and Desmos dominate with custom renderers. mathcrew would be novel in this space.

### 4.5 LLM-Driven 3D Code Generation

**Reliability by complexity** [Synthesis from community benchmarks + skill-file projects]:

| Complexity | Reliability | Notes |
|-----------|-------------|-------|
| Simple scenes (geometry + lighting) | **HIGH** | LLMs generate reliably |
| Medium (GLTF + physics + post-processing) | **MEDIUM** with skill augmentation | 1-2 iterations needed |
| Complex (custom shaders, ECS, perf-critical) | **LOW** | Significant manual work |

**Skill-file ecosystem** (for augmenting LLM 3D generation):
- `r3f-skills` (GitHub: EnzeD): 11 domain skill files for R3F v8.x+
- `threejs-skills` (GitHub: CloudAI-X): 10 domain skill files, audited against r160+
- `threejs-blocks.com`: Machine-readable LLM docs (8KB index + 130KB full API)

**Implication for mathcrew**: The "LLM-Native rendering" philosophy in the blueprint is sound. Critical prerequisite is **component isolation** — Claude can safely edit a 50-line Player.tsx but not a 200-line monolith. Skill files would further improve generation quality.

### 4.6 Monorepo Patterns for 3D Web Apps

**Best practice** [Synthesis from Feature-Sliced Design, monorepo.tools]:
```
packages/
  core/          Pure business logic (0 deps) — domain state owner
  renderer/      3D rendering (Three.js/R3F) — receives data, renders
  math/          Mathematical computations (pure functions)
  ui/            2D React UI (overlays, HUD)
apps/
  web/           Vite entry point, composes packages
```

Key conventions:
- Use **business language** for package names — "domains survive refactors while layers don't"
- `core` must not import from `renderer`; `renderer` imports from `core`
- State management (Zustand/Jotai) lives in `core/`, not `renderer/`

**mathcrew assessment**: Already has core/ separation. Client/ mixes app shell + 3D rendering + (duplicated) business logic. The decomposition done in this session (MathWorld → 5 files) is the first step toward clean renderer isolation.

### 4.7 Scene Graph vs ECS

| Factor | Scene Graph (R3F JSX) | ECS (Koota/Miniplex) |
|--------|----------------------|---------------------|
| Best for | <50 entities, spatial hierarchies | >50 entities, cross-cutting systems |
| LLM generability | HIGH — JSX maps to visual | LOW — entity/system wiring is abstract |
| Debugging | React DevTools | Query world state |
| R3F integration | Native | Via adapter hooks |
| Upgrade path | — | Koota (pmndrs, same org as R3F) |

[Sources: douges.dev ECS blog, webgamedev.com, GitHub: pmndrs/koota]

**Recommendation**: Stay with scene graph. ECS is overkill at current scale. If mathcrew grows to need physics + collision + camera + AI systems operating on overlapping entities, Koota is the natural upgrade path (same pmndrs ecosystem).

### 4.8 Deployment Patterns for 3D Web Apps

| Concern | Best Practice | Source |
|---------|-------------|--------|
| Asset compression | gltfjsx + Draco: **90% size reduction** | [Official: R3F docs] |
| Lazy loading | React `<Suspense>` + `useGLTF` | [Official: R3F docs] |
| Adaptive quality | `<PerformanceMonitor>`: auto-reduce DPR when <30fps | [Official: drei] |
| CDN | Long cache headers for hashed filenames | [Community: Gatsby perf guide] |
| Memory | `dispose()` geometries/materials on unmount | [Community: Utsubo tips] |
| WebGL RAM | 5-50MB initial download, near-zero ongoing | [Community: Ravespace] |

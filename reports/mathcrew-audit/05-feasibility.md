# mathcrew — Feasibility Assessment

> Part of the mathcrew audit series. See [INDEX.md](INDEX.md) for full context.

---

## 5. Feasibility Assessment {#5-feasibility-assessment}

### 5.1 Core Question: Can mathcrew become a foundation for ambitious frontend 3D work?

**Answer: YES, conditionally.** [Inference]

The codebase has a clean foundation (ontology, core logic, API, MCP) that is structurally sound. The 3D rendering layer is the weak point — not because R3F is wrong, but because MathWorld.tsx is a monolith that prevents safe iteration.

### 5.2 Hypothesis Matrix

| Hypothesis | Evidence For | Evidence Against | Verdict |
|-----------|-------------|-----------------|---------|
| **H1: R3F is the right rendering choice** | Dominant React 3D solution, best LLM generability, mature ecosystem | None significant | SUPPORTED |
| **H2: Monorepo structure can scale** | Clean import boundaries, pure core logic, tested | Client mixes concerns, no renderer isolation | SUPPORTED after refactor |
| **H3: LLM-native rendering works for this domain** | Blueprint rationale sound, procedural geometry LLM-friendly | Requires component isolation, MathWorld monolith blocks it | SUPPORTED after decomposition |
| **H4: Current rendering is appropriate** | Procedural geometry is perf-optimal for low-end, 30 objects well within budget | No GLB models, no animations, no particles beyond Sparkles | SUPPORTED for current scope |
| **H5: The codebase can support ambitious 3D expansion** | Ontology is expandable, API is modular, MCP tools are extensible | No scene management system, no asset pipeline, no scene-app state bridge | CONDITIONALLY SUPPORTED |

### 5.3 Scenario Matrix

| Scenario | Base Case | Best Case | Worst Case | Adversarial |
|----------|----------|----------|------------|-------------|
| **Scale to 10 concepts** | Works with current arch + decomposed MathWorld | Seamless — data-driven island generation from API | Performance OK but code becomes unwieldy without scene management | Scene transitions break, state leaks between concepts |
| **Add GLB character models** | Works with R3F useGLTF hook, modest perf impact | Smooth — Mixamo characters + animations enhance immersion | Draw call budget exceeded on low-end phones | GLB loading fails on slow connections, no fallback |
| **Add interactive math scenes** | Works if scenes are isolated components | Each scene is a self-contained R3F component, LLM-generable | Scene-app coupling (passing mastery, attempt data) becomes spaghetti | Drag/touch interactions conflict with character controls |
| **Deploy to production** | Vercel (client) + Railway (API) + Atlas (DB) | Fast, cheap, reliable for demo scale | MongoDB free tier limits (512MB), API cold starts | No error tracking, no monitoring, silent failures |

### 5.4 What is Blocking Ambitious 3D Work

| Blocker | Severity | Fix Difficulty |
|---------|----------|---------------|
| MathWorld monolith | HIGH | MEDIUM (2hr refactor) |
| No scene-app state bridge | HIGH | MEDIUM (React context or Zustand) |
| No scene isolation pattern | HIGH | LOW (establish convention) |
| Stale documentation | HIGH | LOW (30min correction) |
| Dead dependencies | LOW | TRIVIAL (5min) |
| No client tests | MEDIUM | MEDIUM (ongoing) |

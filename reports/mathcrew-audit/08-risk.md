# mathcrew — Risk Register

> Part of the mathcrew audit series. See [INDEX.md](INDEX.md) for full context.

---

## 8. Risk Register {#8-risk-register}

### 8.1 Technical Risks

| ID | Risk | Severity | Likelihood | Current Status | Mitigation |
|----|------|----------|-----------|----------------|-----------|
| TR-01 | **MathWorld monolith blocks safe editing** | HIGH | CERTAIN | MITIGATED by decomposition | Decomposed into 5 files |
| TR-02 | **Dead deps inflate bundle** | LOW | CERTAIN | MITIGATED | Removed ecctrl, leva |
| TR-03 | **No client tests → silent regressions** | MEDIUM | LIKELY | OPEN | Add Vitest + @react-three/test-renderer |
| TR-04 | **Keyboard input may not work in browser** | MEDIUM | POSSIBLE | OPEN | Investigate Canvas focus; add tabIndex/autoFocus |
| TR-05 | **isUnlocked duplicated in client** | MEDIUM | CERTAIN | OPEN | Client should use core/prerequisite.ts |
| TR-06 | **sceneConfig is untyped JSON string** | LOW | POSSIBLE | OPEN | Define TypeScript interface for scene configs |
| TR-07 | **Single git commit — no rollback granularity** | MEDIUM | CERTAIN | OPEN | Commit incrementally going forward |

### 8.2 Architectural Risks

| ID | Risk | Severity | Likelihood | Current Status | Mitigation |
|----|------|----------|-----------|----------------|-----------|
| AR-01 | **No scene-app state bridge** | HIGH | LIKELY (when adding story mode) | OPEN | Add shared context when story mode is built |
| AR-02 | **No scene isolation convention** | HIGH | LIKELY (when adding concept scenes) | OPEN | Establish `world/scenes/` pattern |
| AR-03 | **No asset pipeline** | MEDIUM | POSSIBLE (when adding GLB models) | OPEN | Add @react-three/assets or simple public/ convention |
| AR-04 | **No error boundaries** | MEDIUM | POSSIBLE | OPEN | Add React error boundary at mode level |

### 8.3 Operational Risks

| ID | Risk | Severity | Likelihood | Current Status | Mitigation |
|----|------|----------|-----------|----------------|-----------|
| OR-01 | **Stale handoff misleads future work** | HIGH | CERTAIN | MITIGATED | Correction notice added |
| OR-02 | **No deployment pipeline** | HIGH | CERTAIN (for production) | OPEN | Add Docker + Vercel/Railway when ready |
| OR-03 | **No .env documentation** | MEDIUM | CERTAIN | MITIGATED | .env.example created |
| OR-04 | **MongoDB local-only** | MEDIUM | CERTAIN (for production) | OPEN | Migrate to Atlas when deploying |

# mathcrew — Cold Audit Findings

> Part of the mathcrew audit series. See [INDEX.md](INDEX.md) for full context.

---

## 2. Cold Audit Findings {#2-cold-audit-findings}

### 2.1 CRITICAL: Documentation-Reality Gap

**Finding**: The handoff document (`docs/handoff-v0.1-2026-03-23.md`) describes features and structures that DO NOT EXIST on disk. This is the single most dangerous audit finding because it would mislead any future contributor or AI agent.

| Doc Claim | Reality | Impact |
|-----------|---------|--------|
| "App.tsx 270줄" (Issue #1) | App.tsx is 14 lines [Repo-Fact] | Issue #1 is already resolved; doc is stale |
| "Ecctrl 캐릭터 컨트롤러 ✅ 확정" | `ecctrl` never imported anywhere [Repo-Fact: grep found 0 matches] | Dead dependency, misleading claim |
| "packages/story/ 4 files" | `packages/story/` does not exist [Repo-Fact: `ls packages/`] | Phantom package |
| "scenes3d/" in client | `scenes3d/` does not exist [Repo-Fact: glob found no matches] | Phantom directory |
| "CharacterRenderer interface unused" (Issue #6) | No such interface exists in codebase [Repo-Fact] | Phantom issue |
| "checkInterval ref unused" (Issue #7) | No such ref exists in codebase [Repo-Fact] | Phantom issue |
| "86 source files, 4,351 lines" | 65 files, 3,634 lines [Repo-Fact] | Inflated metrics |
| "Ecctrl 키보드 입력 안 됨" (Issue #0, CRITICAL) | Ecctrl is not used; Player uses custom Rapier physics [Repo-Fact] | Issue #0 describes wrong component |

**Root cause** [Inference]: The handoff document was written for a planned or intermediate state that was superseded by the actual implementation. With only 1 git commit, there is no history to trace when the divergence occurred. The document appears to describe an aspirational architecture rather than the delivered code.

**Severity**: HIGH — a future AI agent or developer reading the handoff would waste significant effort debugging Ecctrl integration that doesn't exist, looking for story/ and scenes3d/ directories that were never created, and fixing issues in code that was already refactored.

### 2.2 Dead Dependencies

| Dependency | package.json | Imports Found | Verdict |
|-----------|-------------|--------------|---------|
| `ecctrl` ^1.0.97 | client | 0 | DEAD — remove |
| `leva` ^0.10.1 | client | 0 | DEAD — remove |

Both add bundle size and attack surface for zero benefit.

### 2.3 MathWorld.tsx Monolith

**File**: `packages/client/src/world/MathWorld.tsx` (200 lines)
**Contains**: Player component, FollowCamera component, Bridge component, island data, keyboard map, physics constants, scene setup, UI overlay

This file violates single-responsibility. It mixes:
- **Input handling** (keyboard map, getKeys)
- **Physics** (Player rigid body, capsule collider, velocity setting)
- **Camera** (FollowCamera with lerp follow)
- **Scene construction** (islands, bridges, ground, sky, lighting, fog)
- **UI** (exit button, HUD overlay)
- **Game logic** (isUnlocked callback)

**Risk**: Any change to player physics requires editing the same file as camera behavior, lighting, and UI. This makes terminal-based NL iteration fragile — Claude cannot edit the Player without risk of breaking the Bridge or Camera.

### 2.4 No Client-Side Tests

| Package | Test Files | Assertions |
|---------|-----------|------------|
| core/ | 4 | 77+ |
| mcp/ | 1 | 37 |
| api/ | 0 | 0 |
| client/ | 0 | 0 |

The core adaptive logic is well-tested. The rendering layer has zero test coverage. For an ambitious 3D product, this is a structural risk — regressions in 3D behavior will be caught only by manual inspection.

### 2.5 Keyboard Input Analysis

The handoff claims Issue #0 (CRITICAL): "Ecctrl 키보드 입력 안 됨". However, the actual code does NOT use Ecctrl at all. [Repo-Fact]

The actual player input is in MathWorld.tsx:
```typescript
const [, getKeys] = useKeyboardControls();  // Drei KeyboardControls
useFrame(() => {
  const { forward, backward, leftward, rightward, jump, run } = getKeys();
  // ... velocity setting via Rapier
});
```

This is a standard Drei `KeyboardControls` + `useKeyboardControls` pattern. If keyboard input is actually broken in the browser, the likely causes are:
1. Canvas not receiving focus (user must click the Canvas first)
2. `KeyboardControls` wrapping order — it wraps `Canvas` correctly [Repo-Fact: line 149-199]
3. React StrictMode double-mounting

**Corrected diagnosis**: Issue #0 should be re-described as "KeyboardControls focus/event binding" not "Ecctrl keyboard input". The fix is likely a simple `tabIndex={0}` + `autoFocus` on the Canvas container, or an `onPointerDown` focus handler.

### 2.6 State Management

**Current**: Pure `useState` + custom hooks (useConcepts, useMastery). No global store.

**Assessment**: Adequate for current scope (2 hooks, 1 route state). Would become insufficient when:
- World mode needs to share state with story mode
- Multiple concepts need simultaneous mastery tracking
- Optimistic updates are needed for attempt submission

### 2.7 Styling

**Current**: Inline styles everywhere (`style={{ ... }}`). `global.css` exists but is minimal.

**Assessment**: Not blocking for prototype. Would become painful for:
- Theming (dark mode, accessibility)
- Responsive design
- Design system consistency

### 2.8 API Layer

**Strengths**:
- Clean Nest.js module structure (7 modules, clear separation)
- Mongoose schemas match ontology/data.ts
- Seed service auto-loads on startup
- CORS enabled

**Gaps**:
- No validation beyond class-validator decorators
- No error response standardization
- No rate limiting
- No health check endpoint
- No API versioning

### 2.9 Build & Deployment

| Step | Status |
|------|--------|
| `tsc --noEmit` | ✅ Pass |
| `bun run build` (client) | ✅ Vite builds |
| Docker/Compose | ❌ Not present |
| CI/CD | ❌ Not configured |
| Vercel/Railway | ❌ Not deployed |
| Environment config | ⚠️ .env not tracked, no .env.example |

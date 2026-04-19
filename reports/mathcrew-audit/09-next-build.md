# mathcrew — Recommended Next Build Path

> Part of the mathcrew audit series. See [INDEX.md](INDEX.md) for full context.

---

## 9. Recommended Next Build Path {#9-recommended-next-build-path}

### Phase 0: Foundation (this session — DONE)
- [x] Cold audit
- [x] Decompose MathWorld
- [x] Remove dead dependencies
- [x] Correct stale documentation
- [x] Create .env.example

### Phase 1: Rendering Isolation (next session, ~2hr)
1. Fix keyboard input (Canvas focus investigation)
2. Extract isUnlocked from client → use core/prerequisite.ts
3. Establish `world/scenes/` convention for per-concept 3D scenes
4. Create first interactive scene (DivisorScene.tsx — drag cubes to basket)
5. Add proximity detection on islands (Rapier collision events)

### Phase 2: Story Integration (session after, ~3hr)
1. Build `packages/engine/` — pure TS state machine for story/dialogue
2. Add scene-app state bridge (React context or Zustand)
3. Implement island → NPC → dialogue → scene flow
4. Add 수리 as Billboard sprite in 3D world

### Phase 3: Content & Polish (~2 sessions)
1. Expand to 5+ concepts (약분, 통분, 분수 덧셈/뺄셈)
2. Data-drive island generation from API
3. Add mastery visualization in 3D (progress rings, particle effects)
4. Implement DR-02/DR-03 (difficulty adjustment)

### Phase 4: Deployment (~1 session)
1. Docker compose (MongoDB + API)
2. Vercel deploy (client)
3. Railway/Render deploy (API)
4. MongoDB Atlas free tier

### Decision Points (require user input)

| Decision | When | Options |
|----------|------|---------|
| State management | Phase 2 | Zustand (simple) vs Jotai (atomic) vs React Context (built-in) |
| Character model | Phase 2 | Keep primitives vs Mixamo GLB vs commissioned model |
| Scene interaction | Phase 1 | R3F ray-based vs Rapier physics-based vs HTML overlay |
| Deployment target | Phase 4 | Vercel+Railway (fast) vs Docker self-host (control) vs Cloudflare (edge) |

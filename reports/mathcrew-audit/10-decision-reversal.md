# mathcrew — Architecture Decision Reversal Conditions

> Part of the mathcrew audit series. See [INDEX.md](INDEX.md) for full context.

---

## 10. What Would Force a Different Architecture Decision {#10-decision-reversal-conditions}

These are conditions that, if true, would invalidate the current architecture and require significant changes:

| # | Condition | Current Assessment | What Would Change |
|---|-----------|-------------------|-------------------|
| 1 | **>100 simultaneous 3D objects needed** | 30 objects, well under | Switch from declarative R3F to imperative Three.js + custom render loop |
| 2 | **Real-time multiplayer required** | Single-player | Add WebSocket layer, shared physics, conflict resolution |
| 3 | **Native app required (iOS/Android store)** | Web-only | Add Capacitor or React Native with react-native-three |
| 4 | **Complex character animation needed** | Primitive geometry | Add Mixamo + EcctrlAnimation or custom animation system |
| 5 | **Physics-heavy gameplay** | Light physics (walk, jump) | Consider Ammo.js or custom physics for precision |
| 6 | **Must run on pre-2020 devices** | Modern browser assumed | Remove physics, reduce geometry, add Canvas2D fallback |
| 7 | **Must integrate with existing LMS (알공)** | Standalone demo | Add OAuth2, API adapter, data sync layer |
| 8 | **>50 concepts in prerequisite graph** | 3 concepts | Add graph database or specialized traversal, server-side rendering of concept map |
| 9 | **R3F ecosystem dies or stalls** | Active, Vercel-backed | Evaluate Babylon.js or raw Three.js migration |
| 10 | **Nest.js is dropped from job requirements** | JD-required | Consider lighter alternatives (Hono, Elysia) |

**None of these conditions are currently true.** The architecture is appropriate for the current and near-term scope.

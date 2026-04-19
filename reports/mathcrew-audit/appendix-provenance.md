# mathcrew — Appendix A: Provenance Log

> Part of the mathcrew audit series. See [INDEX.md](INDEX.md) for full context.

---

## Appendix A: Provenance Log

| Claim | Provenance | Verification |
|-------|-----------|-------------|
| 65 TS files, 3,634 lines | [Repo-Fact] | `find + wc -l` |
| ecctrl never imported | [Repo-Fact] | `grep -r "ecctrl" src/` → 0 matches |
| leva never imported | [Repo-Fact] | `grep -r "leva" src/` → 0 matches |
| story/ does not exist | [Repo-Fact] | `ls packages/` → 4 dirs only |
| scenes3d/ does not exist | [Repo-Fact] | `glob src/**/*` → no scenes3d/ |
| App.tsx is 14 lines | [Repo-Fact] | `cat -n App.tsx` |
| R3F is dominant React 3D | [Official] | pmndrs/react-three-fiber GitHub stats |
| Procedural geometry is perf-optimal | [Inference] | From WebGL draw call budgets + no texture overhead |
| Component isolation enables NL iteration | [Synthesis] | From LLM code generation experience + DRY principle |

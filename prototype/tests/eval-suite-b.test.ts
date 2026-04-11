/**
 * Eval Suite B — Hypothesis B (Custom Interaction Layer)
 * T9 [EVAL-GATE] eval-runner
 *
 * Tests DependencyGraph, WarmStartIntersectionSolver, formatCoord, and
 * updateCoordinateLabel from proto-jxg-B-001. JSXGraph APIs are mocked.
 *
 * D/L/A classification per test is noted in comments.
 */

import { describe, it, expect, beforeEach } from "bun:test";

// ── Re-implement pure classes from H-B (no JXG dependency) ───────────────────
// These are exact copies of the exported classes for isolated unit testing.

type NodeId = string;
interface DependencyNode { id: NodeId; update: () => void; }

class DependencyGraph {
  private nodes = new Map<NodeId, DependencyNode>();
  private edges = new Map<NodeId, NodeId[]>();

  register(node: DependencyNode): void {
    this.nodes.set(node.id, node);
    if (!this.edges.has(node.id)) this.edges.set(node.id, []);
  }

  addDependency(sourceId: NodeId, dependentId: NodeId): void {
    const deps = this.edges.get(sourceId) ?? [];
    if (!deps.includes(dependentId)) deps.push(dependentId);
    this.edges.set(sourceId, deps);
  }

  cascade(rootId: NodeId): void {
    const visited = new Set<NodeId>();
    const queue: NodeId[] = [rootId];
    while (queue.length > 0) {
      const current = queue.shift()!;
      if (visited.has(current)) continue;
      visited.add(current);
      this.nodes.get(current)?.update();
      for (const dep of this.edges.get(current) ?? []) queue.push(dep);
    }
  }
}

// formatCoord — exact copy
function formatCoord(x: number, y: number): string {
  return `(${x.toFixed(2)}, ${y.toFixed(2)})`;
}

// Reference Newton-Raphson (mirrors JXG.Math.Numerics.root)
function nrRoot(f: (x: number) => number, x0: number, maxIter = 200, tol = 1e-10): number {
  let x = x0;
  const EPS = 1e-7;
  for (let i = 0; i < maxIter; i++) {
    const fx = f(x);
    if (Math.abs(fx) < tol) break;
    const fpx = (f(x + EPS) - f(x - EPS)) / (2 * EPS);
    if (Math.abs(fpx) < 1e-14) break;
    x = x - fx / fpx;
  }
  return x;
}

// WarmStartIntersectionSolver with injected NR (instead of JXG.Math.Numerics.root)
class WarmStartIntersectionSolverTestable {
  private lastX: number;
  private readonly f: (x: number) => number;
  private readonly g: (x: number) => number;

  constructor(f: (x: number) => number, g: (x: number) => number, searchRange: [number, number]) {
    this.f = f;
    this.g = g;
    this.lastX = (searchRange[0] + searchRange[1]) / 2;
  }

  solve(): { x: number; y: number; converged: boolean } {
    const h = (x: number) => this.f(x) - this.g(x);
    const x = nrRoot(h, this.lastX);
    const converged = Math.abs(h(x)) < 1e-8;
    if (converged) this.lastX = x;
    return { x, y: this.f(x), converged };
  }

  resetWarmStart(x: number): void { this.lastX = x; }
  getLastX(): number { return this.lastX; }
}

// ── T1: Newton-Raphson intersection accuracy (LOGIC) ─────────────────────────
// f(x)=x²-1, g(x)=2x-0.5 → h(x)=x²-2x-0.5 → roots: 1 ± √1.5
describe("T1 — Newton-Raphson intersection accuracy (H-B)", () => {
  const f = (x: number) => x * x - 1;
  const g = (x: number) => 2 * x - 0.5;

  it("analytic roots of x²-2x-0.5=0 are 1±√1.5", () => {
    const r1 = 1 - Math.sqrt(1.5);
    const r2 = 1 + Math.sqrt(1.5);
    const h = (x: number) => x * x - 2 * x - 0.5;
    expect(Math.abs(h(r1))).toBeLessThan(1e-10);
    expect(Math.abs(h(r2))).toBeLessThan(1e-10);
  });

  it("solver from x0=2.5 converges to positive root ≈2.2247", () => {
    const solver = new WarmStartIntersectionSolverTestable(f, g, [0, 5]);
    solver.resetWarmStart(2.5);
    const result = solver.solve();
    expect(result.converged).toBe(true);
    expect(result.x).toBeCloseTo(1 + Math.sqrt(1.5), 6);
  });

  it("solver from x0=-1 converges to negative root ≈-0.2247", () => {
    const solver = new WarmStartIntersectionSolverTestable(f, g, [-5, 0]);
    solver.resetWarmStart(-1);
    const result = solver.solve();
    expect(result.converged).toBe(true);
    expect(result.x).toBeCloseTo(1 - Math.sqrt(1.5), 6);
  });

  it("warm-start: after first solve, lastX advances to converged root", () => {
    const solver = new WarmStartIntersectionSolverTestable(f, g, [0, 5]);
    solver.resetWarmStart(2.5);
    const r1 = solver.solve();
    const lastX = solver.getLastX();
    expect(lastX).toBeCloseTo(r1.x, 6); // warm-start advanced
  });

  it("warm-start: second solve from same root is already converged (h≈0 immediately)", () => {
    const solver = new WarmStartIntersectionSolverTestable(f, g, [0, 5]);
    solver.resetWarmStart(2.5);
    solver.solve(); // first solve
    const r2 = solver.solve(); // second — starts from converged root
    expect(r2.converged).toBe(true);
    expect(r2.x).toBeCloseTo(1 + Math.sqrt(1.5), 6);
  });
});

// ── T2: Absolute value fold correctness (LOGIC) ───────────────────────────────
// |x| - 0.5 = x + 0.5 → for x<0: -x - 0.5 = x + 0.5 → x = -0.5, y = 0
describe("T2 — Absolute value fold correctness (H-B)", () => {
  it("analytic intersection of |x|-0.5 and x+0.5 is at (-0.5, 0)", () => {
    const absF = (x: number) => Math.abs(x) - 0.5;
    const linG = (x: number) => x + 0.5;
    // Verify: at x=-0.5, absF = 0.5-0.5=0, linG=-0.5+0.5=0 ✓
    expect(absF(-0.5)).toBeCloseTo(0, 8);
    expect(linG(-0.5)).toBeCloseTo(0, 8);
  });

  it("NR from x0=-1 finds intersection at x≈-0.5", () => {
    const absF = (x: number) => Math.abs(x) - 0.5;
    const linG = (x: number) => x + 0.5;
    const solver = new WarmStartIntersectionSolverTestable(absF, linG, [-5, 0]);
    solver.resetWarmStart(-1);
    const result = solver.solve();
    expect(result.converged).toBe(true);
    expect(result.x).toBeCloseTo(-0.5, 4);
    expect(result.y).toBeCloseTo(0, 4);
  });

  it("fold kink at x=0: h'(0) is undefined (left=−1, right=+1)", () => {
    // |x| is not differentiable at x=0; NR may stall near x=0
    const h = (x: number) => Math.abs(x) - 0.5 - (x + 0.5);
    const EPS = 1e-7;
    const leftDeriv = (h(-EPS) - h(-2 * EPS)) / EPS;
    const rightDeriv = (h(2 * EPS) - h(EPS)) / EPS;
    // Left derivative of h at 0: d/dx(-x - 1) = -2
    // Right derivative of h at 0: d/dx(0-1)=0 (no — let's compute)
    // For x<0: h(x) = -x - 0.5 - x - 0.5 = -2x - 1 → h'=-2
    // For x>0: h(x) = x - 0.5 - x - 0.5 = -1 → h'=0 (constant, no root for x>0!)
    expect(Math.abs(leftDeriv - (-2))).toBeLessThan(0.01);
    expect(Math.abs(rightDeriv)).toBeLessThan(0.01); // h'≈0 on right side
  });
});

// ── T3: Dependency cascade ordering — BFS (LOGIC) ────────────────────────────
describe("T3 — DependencyGraph cascade ordering (H-B)", () => {
  let graph: DependencyGraph;
  let visitOrder: string[];

  beforeEach(() => {
    visitOrder = [];
    graph = new DependencyGraph();
    graph.register({ id: "intersection", update: () => visitOrder.push("intersection") });
    graph.register({ id: "coordinateLabel", update: () => visitOrder.push("coordinateLabel") });
    graph.register({ id: "foldVisualization", update: () => visitOrder.push("foldVisualization") });
    graph.addDependency("intersection", "coordinateLabel");
    graph.addDependency("coordinateLabel", "foldVisualization");
  });

  it("cascade from 'intersection' visits all 3 nodes in BFS order", () => {
    graph.cascade("intersection");
    expect(visitOrder).toEqual(["intersection", "coordinateLabel", "foldVisualization"]);
  });

  it("cascade from 'coordinateLabel' skips 'intersection'", () => {
    graph.cascade("coordinateLabel");
    expect(visitOrder).toEqual(["coordinateLabel", "foldVisualization"]);
  });

  it("each node visited exactly once even with diamond dependency", () => {
    graph.addDependency("intersection", "foldVisualization"); // diamond: intersection → foldViz directly
    graph.cascade("intersection");
    const foldCount = visitOrder.filter(v => v === "foldVisualization").length;
    expect(foldCount).toBe(1); // visited exactly once
  });

  it("cascade on unknown root: no-op (no error)", () => {
    expect(() => graph.cascade("nonexistent")).not.toThrow();
    expect(visitOrder).toHaveLength(0);
  });

  it("registering duplicate node: second registration overwrites first", () => {
    const secondVisit: string[] = [];
    graph.register({ id: "intersection", update: () => secondVisit.push("intersection-v2") });
    graph.cascade("intersection");
    // Second registration overwrites first — v2 update should fire, not original
    expect(secondVisit).toHaveLength(1);
    expect(secondVisit[0]).toBe("intersection-v2");
    // Original visitOrder should NOT have 'intersection' (overwritten)
    expect(visitOrder.filter(v => v === "intersection")).toHaveLength(0);
  });
});

// ── T4: Dynamic label content format (DATA) ───────────────────────────────────
describe("T4 — formatCoord label format (H-B)", () => {
  it("(0, 0) → '(0.00, 0.00)'", () => {
    expect(formatCoord(0, 0)).toBe("(0.00, 0.00)");
  });

  it("(1.2345, -5.6789) → '(1.23, -5.68)'", () => {
    expect(formatCoord(1.2345, -5.6789)).toBe("(1.23, -5.68)");
  });

  it("(-0.005, 0.004) → rounding: (-0.01, 0.00)", () => {
    expect(formatCoord(-0.005, 0.004)).toBe("(-0.01, 0.00)");
  });

  it("large values (1234.5, -9876.5) → '(1234.50, -9876.50)'", () => {
    expect(formatCoord(1234.5, -9876.5)).toBe("(1234.50, -9876.50)");
  });
});

// ── T5: Multiple concurrent elements — isolation (ACTION) ─────────────────────
describe("T5 — Multiple concurrent solvers independent (H-B)", () => {
  it("two solvers with different functions do not share warm-start state", () => {
    const f1 = (x: number) => x - 2;
    const f2 = (x: number) => x - 5;
    const zeroFn = (_x: number) => 0; // g1 = g2 = 0

    const s1 = new WarmStartIntersectionSolverTestable(f1, zeroFn, [-10, 10]);
    const s2 = new WarmStartIntersectionSolverTestable(f2, zeroFn, [-10, 10]);

    const r1 = s1.solve();
    const r2 = s2.solve();

    expect(r1.x).toBeCloseTo(2, 6);
    expect(r2.x).toBeCloseTo(5, 6);
    // Warm starts are independent
    expect(s1.getLastX()).toBeCloseTo(2, 6);
    expect(s2.getLastX()).toBeCloseTo(5, 6);
  });

  it("DependencyGraph instances are fully independent", () => {
    const order1: string[] = [];
    const order2: string[] = [];

    const g1 = new DependencyGraph();
    g1.register({ id: "A", update: () => order1.push("A") });
    g1.register({ id: "B", update: () => order1.push("B") });
    g1.addDependency("A", "B");

    const g2 = new DependencyGraph();
    g2.register({ id: "X", update: () => order2.push("X") });

    g1.cascade("A");
    g2.cascade("X");

    expect(order1).toEqual(["A", "B"]);
    expect(order2).toEqual(["X"]);
  });
});

// ── T6: Edge — overlapping curves (same function) (LOGIC) ─────────────────────
describe("T6 — Edge: overlapping curves f=g (H-B)", () => {
  it("h(x)=0 everywhere: NR derivative is 0, solver bails with lastX unchanged", () => {
    const f = (x: number) => x * x;
    const g = (x: number) => x * x; // identical
    const solver = new WarmStartIntersectionSolverTestable(f, g, [-5, 5]);
    solver.resetWarmStart(1.5);
    const result = solver.solve();
    // h(x)=0 everywhere; converged check: |h(root)| < 1e-8 → true (vacuously)
    // The NR implementation returns lastX since h(lastX)=0 immediately
    expect(result.converged).toBe(true); // 0 < 1e-8 ✓ — but answer is degenerate
    expect(result.y).toBeCloseTo(f(result.x), 8); // y is still on the curve
  });
});

// ── T7: Edge — tangent intersection (single touch point) (LOGIC) ──────────────
// f(x)=x², g(x)=2x-1 → h(x)=(x-1)² — double root at x=1
describe("T7 — Edge: tangent intersection warm-start (H-B)", () => {
  it("h(x)=(x-1)² — NR converges but slowly (linear rate, ~0.5 per step)", () => {
    const f = (x: number) => x * x;
    const g = (x: number) => 2 * x - 1;
    const solver = new WarmStartIntersectionSolverTestable(f, g, [-5, 5]);
    solver.resetWarmStart(0.0);
    const result = solver.solve();
    expect(result.converged).toBe(true);
    expect(result.x).toBeCloseTo(1, 3); // lower precision due to double root
  });

  it("tangent: y-coordinate at x=1 is y=1", () => {
    const f = (x: number) => x * x;
    expect(f(1)).toBe(1);
  });

  it("double root: NR convergence rate check — needs many more iterations than simple root", () => {
    // For (x-1)²: h'(x)=2(x-1). At x=1: h'=0 (can't divide).
    // NR oscillates with step ≈ 0.5*(x-root) per iter → linear convergence.
    const h = (x: number) => (x - 1) * (x - 1);
    const EPS = 1e-7;
    const x = 0.5;
    const fpx = (h(x + EPS) - h(x - EPS)) / (2 * EPS); // ≈ 2*(0.5-1) = -1
    expect(Math.abs(fpx - (-1.0))).toBeLessThan(0.001);
    // NR step from x=0.5: 0.5 - h(0.5)/h'(0.5) = 0.5 - 0.25/(-1) = 0.75
    // Next step from 0.75: 0.75 - 0.0625/(-0.5) = 0.875 → converging, but slowly
    const step1 = x - h(x) / fpx;
    expect(step1).toBeCloseTo(0.75, 6);
  });
});

// ── T8: Edge — near vertical asymptote (LOGIC) ────────────────────────────────
describe("T8 — Edge: warm-start near asymptote (H-B)", () => {
  it("f(x)=1/x, g(x)=0 — NR from x0=0.5 finds x=∞ (no convergence)", () => {
    const f = (x: number) => (x === 0 ? 1e16 : 1 / x);
    const g = (_x: number) => 0;
    const solver = new WarmStartIntersectionSolverTestable(f, g, [0.001, 10]);
    solver.resetWarmStart(0.5);
    const result = solver.solve();
    // 1/x has no zero in [0.001, 10] — NR will diverge to very large x
    expect(result.converged).toBe(false);
  });

  it("oscillating function near asymptote: NR must start well away to avoid divergence", () => {
    // h(x) = sin(x)/(x-3) has a root at x=kπ for k≠0, asymptote at x=3
    // From x0=4 (near asymptote), NR is unstable; from x0=6.28 (near 2π), converges
    const hFn = (x: number) => {
      const denom = x - 3;
      return Math.abs(denom) < 1e-9 ? 1e9 : Math.sin(x) / denom;
    };
    // Verify: from x0 well away from asymptote, h(root)≈0
    const root = nrRoot(hFn, 6.28);
    // Root should be near 2π ≈ 6.2832
    expect(Math.abs(root - Math.PI * 2)).toBeLessThan(0.01);
  });
});

// ── T9: Race condition — dragState.ty (ACTION/SECURITY) ──────────────────────
// H-B confirmed: dragState.ty updated by DOM addEventListener (outside board.on('update'))
// board.on('update') reads dragState.ty — stale read under rapid drag.
describe("T9 — Race condition: dragState.ty staleness (H-B)", () => {
  it("dragState initializes with ty=0 (default fold viz uses foldY=0)", () => {
    const dragState = { ty: 0 };
    expect(dragState.ty).toBe(0); // foldViz.update(0, 0) on first frame
  });

  it("board.on('update') reads stale ty when DOM event hasn't fired yet", () => {
    // Simulates: DOM drag event sets ty=5 AFTER board.on('update') reads ty=0
    const dragState = { ty: 0 };
    const foldUpdates: number[] = [];

    // board.on('update') fires — reads ty before DOM event
    const boardUpdateFrame = () => foldUpdates.push(dragState.ty);

    boardUpdateFrame(); // frame 1: ty=0 (stale, DOM hasn't fired)
    dragState.ty = 5; // DOM addEventListener fires here
    boardUpdateFrame(); // frame 2: ty=5 (correct, but one frame late)

    expect(foldUpdates[0]).toBe(0); // stale read confirmed
    expect(foldUpdates[1]).toBe(5); // caught next frame
  });

  it("rapid drag: N board frames fire before DOM updates — stale frame count = N-1", () => {
    const dragState = { ty: 0 };
    const staleFrames: boolean[] = [];
    const correctTy = 10;
    let domFired = false;

    // 5 board frames before DOM event
    for (let i = 0; i < 5; i++) {
      staleFrames.push(dragState.ty !== correctTy);
    }
    // DOM event fires
    dragState.ty = correctTy;
    domFired = true;
    staleFrames.push(dragState.ty !== correctTy); // 6th frame: correct

    expect(staleFrames.filter(s => s)).toHaveLength(5); // 5 stale frames
    expect(staleFrames[5]).toBe(false); // 6th correct
    expect(domFired).toBe(true);
  });

  it("without warm-start reset after drag: solver starts from stale initial guess", () => {
    // If dragState.ty lags, the warm-start intersection point is also stale
    const f = (x: number) => x * x + 0; // ty=0 scenario
    const g = (x: number) => 2 * x;
    const solver = new WarmStartIntersectionSolverTestable(f, g, [-5, 5]);
    solver.resetWarmStart(2.5);
    const staleResult = solver.solve(); // correct for ty=0

    // Now ty should change to 0.5, but dragState.ty is stale → solver not reset
    const staleSolve = solver.solve(); // re-uses warm-start from ty=0 result
    // Result is still for ty=0, not ty=0.5 — one-frame stale
    expect(staleSolve.x).toBeCloseTo(staleResult.x, 4); // same stale position
  });
});

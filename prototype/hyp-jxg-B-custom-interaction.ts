// prototype/hyp-jxg-B-custom-interaction.ts
//
// Hypothesis B PoC — Custom Interaction Layer
// Architecture: board.on('update') observer + Newton-Raphson warm-start solver
//               + explicit DependencyGraph cascade + coordinate label management
//               + AbsValue fold visualization (|f(x)+ty| ghost curve + fold line)

// ── JSXGraph API stubs (no runtime import — architecture demonstration) ────────

interface JXGPoint {
  X(): number;
  Y(): number;
  setPosition(method: number, coords: [number, number]): void;
  setAttribute(attrs: Record<string, unknown>): void;
}

interface JXGText {
  setText(text: string): void;
  setAttribute(attrs: Record<string, unknown>): void;
}

interface JXGFunctionGraph {
  Y(x: number): number;
  setAttribute(attrs: Record<string, unknown>): void;
}

interface JXGBoard {
  on(event: string, cb: () => void): void;
  suspendUpdate(): void;
  unsuspendUpdate(): void;
  create(type: "point", coords: [number, number], attrs: Record<string, unknown>): JXGPoint;
  create(type: "text", coords: [number, number, string], attrs: Record<string, unknown>): JXGText;
  create(
    type: "functiongraph",
    def: [(x: number) => number, number, number],
    attrs: Record<string, unknown>
  ): JXGFunctionGraph;
}

declare const JXG: {
  Math: { Numerics: { root(f: (x: number) => number, x0: number): number } };
};

// ── DependencyGraph: explicit DAG for cascade update ordering ─────────────────

type NodeId = string;

interface DependencyNode {
  id: NodeId;
  update: () => void;
}

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

  /** Topological cascade from root — breadth-first, each node visited once */
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

// ── Newton-Raphson intersection solver (warm-start) ───────────────────────────

interface IntersectionSolverConfig {
  f: (x: number) => number;
  g: (x: number) => number;
  searchRange: [number, number];
}

interface IntersectionResult {
  x: number;
  y: number;
  converged: boolean;
}

class WarmStartIntersectionSolver {
  private lastX: number;
  private readonly config: IntersectionSolverConfig;

  constructor(config: IntersectionSolverConfig) {
    this.config = config;
    this.lastX = (config.searchRange[0] + config.searchRange[1]) / 2;
  }

  /** Warm-start Newton-Raphson: reuses lastX as initial guess → fewer iterations */
  solve(): IntersectionResult {
    const { f, g } = this.config;
    const h = (x: number) => f(x) - g(x);
    const x = JXG.Math.Numerics.root(h, this.lastX);
    const converged = Math.abs(h(x)) < 1e-8;
    if (converged) this.lastX = x; // advance warm-start for next frame
    return { x, y: f(x), converged };
  }

  resetWarmStart(x: number): void {
    this.lastX = x;
  }
}

// ── Coordinate label management ───────────────────────────────────────────────

function formatCoord(x: number, y: number): string {
  return `(${x.toFixed(2)}, ${y.toFixed(2)})`;
}

function updateCoordinateLabel(
  pt: JXGPoint,
  label: JXGText,
  result: IntersectionResult
): void {
  const COORDS_BY_USER = 0x0401;
  if (!result.converged) {
    label.setAttribute({ visible: false });
    return;
  }
  pt.setPosition(COORDS_BY_USER, [result.x, result.y]);
  label.setText(formatCoord(result.x, result.y));
  label.setAttribute({ visible: true });
}

// ── AbsValue fold visualization: |f(x)+ty| ghost curve + fold line at y=0 ────

interface FoldVisualization {
  ghostCurve: JXGFunctionGraph;
  foldAnchorL: JXGPoint;
  foldAnchorR: JXGPoint;
  update(ty: number, foldY: number): void;
}

function createFoldVisualization(
  board: JXGBoard,
  f: (x: number) => number
): FoldVisualization {
  // Ghost curve: |f(x) + ty| rendered as faded dashed overlay
  const ghostCurve = board.create(
    "functiongraph",
    [(x: number) => Math.abs(f(x)), -10, 10],
    { strokeColor: "#aaaaaa", dash: 2, strokeWidth: 1.5, visible: false }
  );
  // Fold line anchors at y=foldY
  const COORDS_BY_USER = 0x0401;
  const foldAnchorL = board.create("point", [-10, 0], { visible: false, fixed: true });
  const foldAnchorR = board.create("point", [10, 0], { visible: false, fixed: true });

  return {
    ghostCurve,
    foldAnchorL,
    foldAnchorR,
    update(ty: number, foldY: number): void {
      ghostCurve.setAttribute({ visible: ty !== 0 });
      foldAnchorL.setPosition(COORDS_BY_USER, [-10, foldY]);
      foldAnchorR.setPosition(COORDS_BY_USER, [10, foldY]);
    },
  };
}

// ── Frame telemetry (LEARN layer) ─────────────────────────────────────────────

interface FrameTelemetry {
  frameTs: number;
  solverConverged: boolean;
  cascadeNodeCount: number;
  frameMs: number;
}

// ── Board observer: wires all H-B concerns into board.on('update') ────────────

interface BoardObserverSetup {
  board: JXGBoard;
  solver: WarmStartIntersectionSolver;
  depGraph: DependencyGraph;
  intersectionPt: JXGPoint;
  intersectionLabel: JXGText;
  foldViz: FoldVisualization;
  dragState: { ty: number };
  telemetry: FrameTelemetry[];
}

function setupBoardObserver(ctx: BoardObserverSetup): void {
  ctx.board.on("update", () => {
    const t0 = performance.now();
    ctx.board.suspendUpdate();
    try {
      // 1. Intersection recompute via warm-start Newton-Raphson
      const result = ctx.solver.solve();
      // 2. Cascade DependencyGraph: intersection → coordinateLabel → foldVisualization
      ctx.depGraph.cascade("intersection");
      // 3. Coordinate label update
      updateCoordinateLabel(ctx.intersectionPt, ctx.intersectionLabel, result);
      // 4. Fold visualization update (ghost curve + fold line at y=0)
      ctx.foldViz.update(ctx.dragState.ty, 0);
      // 5. LEARN: push per-frame telemetry
      ctx.telemetry.push({
        frameTs: t0,
        solverConverged: result.converged,
        cascadeNodeCount: 3,
        frameMs: performance.now() - t0,
      });
    } finally {
      ctx.board.unsuspendUpdate();
    }
  });
}

// ── Top-level init: full H-B wiring demonstration ────────────────────────────

export function initHypJxgB(board: JXGBoard): { telemetry: FrameTelemetry[] } {
  const f = (x: number) => x * x - 1;   // f(x) = x² − 1
  const g = (x: number) => 2 * x - 0.5; // g(x) = 2x − 0.5

  const solver = new WarmStartIntersectionSolver({ f, g, searchRange: [-5, 5] });
  const depGraph = new DependencyGraph();
  const intersectionPt = board.create("point", [0, 0], { name: "I" });
  const intersectionLabel = board.create("text", [0.2, 0.2, ""], { visible: false });
  const foldViz = createFoldVisualization(board, f);
  const dragState = { ty: 0 };
  const telemetry: FrameTelemetry[] = [];

  // DAG: intersection → coordinateLabel → foldVisualization
  depGraph.register({ id: "intersection", update: () => {} });
  depGraph.register({ id: "coordinateLabel", update: () => {} });
  depGraph.register({ id: "foldVisualization", update: () => {} });
  depGraph.addDependency("intersection", "coordinateLabel");
  depGraph.addDependency("coordinateLabel", "foldVisualization");

  setupBoardObserver({
    board, solver, depGraph, intersectionPt, intersectionLabel,
    foldViz, dragState, telemetry,
  });

  return { telemetry };
}

export { WarmStartIntersectionSolver, DependencyGraph, formatCoord };
export type { IntersectionResult, FrameTelemetry, FoldVisualization };

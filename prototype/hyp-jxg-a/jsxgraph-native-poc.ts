/// <reference path="./jsxgraph.d.ts" />

/**
 * Hypothesis A — JSXGraph Native Enhancement PoC (hyp-jxg-A)
 * Claims: (1) native intersection auto-update, (2) dynamic text closures,
 * (3) native derivative, (4) reducedUpdate=true 60fps, (5) suspendUpdate batch,
 * (6) otherintersection. Gap: TracePath via board.on('update') array push.
 */

// ── Telemetry types (BackPropagation LEARN boundary) ─────────────────────────
export interface DragFrame {
  frameIndex: number;
  ty: number; // parentPoint.Y() at capture time
  fps: number;
}

export interface InteractionTelemetry {
  dragFrames: DragFrame[];
  totalDragEvents: number;
  reducedUpdateActive: boolean;
}

export interface FoldBoundaryResult {
  intersectionX: number;
  intersectionY: number;
  error: number;
  withinTolerance: boolean;
  verdict: string;
}

// ── Board setup (DATA + ACTION layer wiring) ──────────────────────────────────
export function setupJSXGraphNativeBoard(
  containerId: string,
  telemetry: InteractionTelemetry
): JXGBoard {

  // Board init: bounding box suitable for high-school function graph demo
  const board = JXG.JSXGraph.initBoard(containerId, {
    boundingbox: [-6, 6, 6, -6],
    axis: true,
    keepaspectratio: false,
    showCopyright: false,
    showNavigation: false,
  });

  // CLAIM 4: reducedUpdate=true — JSXGraph redraws only the changed _dep subtree per frame
  board.reducedUpdate = true;

  // CLAIM 5: suspendUpdate — batch-declare all N elements, single DOM repaint at unsuspend
  board.suspendUpdate();

  // ParentPoint: draggable anchor that vertically shifts fg1 (DragBehaviorInterface entry point)
  const parentPoint = board.create("point", [0, 0], {
    name: "P",
    color: "#e74c3c",
    size: 6,
    fixed: false,
    label: { offset: [10, -15] },
  });

  // fg1: f(x) = x² + t where t = parentPoint.Y() — live closure, no manual wiring
  const fg1 = board.create(
    "functiongraph",
    [(x: number) => x * x + parentPoint.Y(), -5.5, 5.5],
    { strokeColor: "#e74c3c", strokeWidth: 2, name: "f" }
  );

  // fg2: g(x) = 2x — reference curve for intersection demos
  const fg2 = board.create(
    "functiongraph",
    [(x: number) => 2 * x, -5.5, 5.5],
    { strokeColor: "#3498db", strokeWidth: 2, name: "g" }
  );

  // CLAIM 1: native IntersectionPoint — auto-updates whenever fg1 shifts with parentPoint
  const i1 = board.create("intersection", [fg1, fg2, 0], {
    name: "I₁",
    color: "#2ecc71",
    size: 5,
  });

  // CLAIM 6: otherintersection — second root, auto-updating, linked to the same _dep chain
  const i2 = board.create("otherintersection", [fg1, fg2, i1], {
    name: "I₂",
    color: "#9b59b6",
    size: 5,
  });

  // CLAIM 3: native Derivative — slope of fg1, live in _dep cascade
  board.create("derivative", [fg1], {
    strokeColor: "#f39c12",
    strokeWidth: 1,
    dash: 2,
    name: "f'",
  });

  // CLAIM 2: dynamic Text — function-valued x/y/content, all three update live on drag
  board.create(
    "text",
    [
      () => i1.X() + 0.3,
      () => i1.Y() + 0.45,
      () => `I₁ (${i1.X().toFixed(2)}, ${i1.Y().toFixed(2)})`,
    ],
    { fontSize: 13, color: "#2ecc71", anchorX: "left" }
  );

  board.create(
    "text",
    [
      () => i2.X() + 0.3,
      () => i2.Y() + 0.45,
      () => `I₂ (${i2.X().toFixed(2)}, ${i2.Y().toFixed(2)})`,
    ],
    { fontSize: 13, color: "#9b59b6", anchorX: "left" }
  );

  board.create(
    "text",
    [
      () => parentPoint.X() + 0.3,
      () => parentPoint.Y() + 0.3,
      () => `t = ${parentPoint.Y().toFixed(2)}`,
    ],
    { fontSize: 12, color: "#e74c3c", anchorX: "left" }
  );

  // CLAIM 5 end: single repaint for all N elements declared above
  board.unsuspendUpdate();

  // GAP (custom): TracePath cannot use native Tracecurve (requires Glider mover).
  // board.on('update') fires every frame — push to dataX/dataY arrays.
  const traceX: number[] = [];
  const traceY: number[] = [];
  board.on("update", () => {
    traceX.push(i1.X());
    traceY.push(i1.Y());
    if (traceX.length > 300) { traceX.shift(); traceY.shift(); }
  });

  // Minimal drag handler: telemetry ONLY — no manual element.update() calls (all native cascade)
  let frameCount = 0;
  let lastT = performance.now();

  parentPoint.on("drag", () => {
    const now = performance.now();
    const fps = 1000 / Math.max(now - lastT, 1);
    lastT = now;
    frameCount++;
    if (frameCount % 30 === 0) {
      telemetry.dragFrames.push({ frameIndex: frameCount, ty: parentPoint.Y(), fps });
    }
    telemetry.totalDragEvents++;
  });

  return board;
}

// ── Adversarial validation: fold boundary precision (exp-jxg-01) ──────────────
export function testFoldBoundaryPrecision(board: JXGBoard): FoldBoundaryResult {
  board.suspendUpdate();

  const anchor = board.create("point", [0, -0.5], { fixed: false, visible: false });
  const absCurve = board.create(
    "functiongraph",
    [(x: number) => Math.abs(x) + anchor.Y(), -5, 5],
    { visible: false }
  );
  const linearCurve = board.create(
    "functiongraph",
    [(x: number) => x + 0.5, -5, 5],
    { visible: false }
  );

  // Intersection at fold kink: |x| + (-0.5) = x + 0.5 → x = 1 for x≥0, expected: (1, 1.5)
  const foldIntersection = board.create("intersection", [absCurve, linearCurve, 0], {
    visible: false,
  });

  board.unsuspendUpdate();
  board.update();

  const ix = foldIntersection.X();
  const iy = foldIntersection.Y();
  const expectedX = 1.0;
  const expectedY = 1.5;
  const error = Math.sqrt((ix - expectedX) ** 2 + (iy - expectedY) ** 2);

  return {
    intersectionX: ix,
    intersectionY: iy,
    error,
    withinTolerance: error < 0.01,
    verdict:
      error < 0.01
        ? "PASS: native intersection stable at fold boundary (tolerance 0.01)"
        : "FAIL: precision error > 0.01 at fold boundary — IntersectionResolverInterface fallback required",
  };
}

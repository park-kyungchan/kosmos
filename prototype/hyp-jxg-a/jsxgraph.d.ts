/**
 * JSXGraph minimal type stubs — Hypothesis A PoC
 * JSXGraph is a browser-only library (no npm package).
 * These stubs cover only the APIs exercised in this PoC.
 * Source: JSXGraph v1.12.1 official docs + release notes.
 */

declare const JXG: {
  JSXGraph: {
    initBoard(containerId: string, options: JXGBoardOptions): JXGBoard;
    freeBoard(board: JXGBoard): void;
  };
  /** Coordinate system constant: user-space [x, y] */
  COORDS_BY_USER: number;
  Math: {
    Numerics: {
      root(f: (x: number) => number, x0: number): number;
    };
  };
};

interface JXGBoardOptions {
  boundingbox?: [number, number, number, number];
  axis?: boolean;
  keepaspectratio?: boolean;
  showCopyright?: boolean;
  showNavigation?: boolean;
}

interface JXGBoard {
  /** v1.10+: only parentPoint + direct _dep chain redrawn per frame (~60fps) */
  reducedUpdate: boolean;
  create(type: "point", parents: [number, number], attrs?: JXGPointAttrs): JXGPoint;
  create(type: "functiongraph", parents: [(x: number) => number, number, number], attrs?: JXGCurveAttrs): JXGCurve;
  create(type: "intersection", parents: [JXGCurve, JXGCurve, number], attrs?: JXGPointAttrs): JXGPoint;
  create(type: "otherintersection", parents: [JXGCurve, JXGCurve, JXGPoint], attrs?: JXGPointAttrs): JXGPoint;
  create(type: "derivative", parents: [JXGCurve], attrs?: JXGCurveAttrs): JXGCurve;
  create(type: "text", parents: [(() => number) | number, (() => number) | number, (() => string) | string], attrs?: JXGTextAttrs): JXGText;
  on(event: "update" | string, handler: () => void): void;
  update(): void;
  /** Pause all redraws — batch element declarations between suspend/unsuspend */
  suspendUpdate(): void;
  /** Resume redraws after batch — triggers single repaint */
  unsuspendUpdate(): void;
}

interface JXGPointAttrs {
  name?: string;
  color?: string;
  size?: number;
  fixed?: boolean;
  visible?: boolean;
  label?: { offset?: [number, number] };
}

interface JXGCurveAttrs {
  strokeColor?: string;
  strokeWidth?: number;
  name?: string;
  dash?: number;
  visible?: boolean;
}

interface JXGTextAttrs {
  fontSize?: number;
  color?: string;
  anchorX?: "left" | "middle" | "right";
  visible?: boolean;
}

interface JXGPoint {
  X(): number;
  Y(): number;
  on(event: "drag" | "up" | "down" | string, handler: () => void): void;
  setPosition(method: number, coords: [number, number]): JXGPoint;
}

interface JXGCurve {
  X(t?: number): number;
  Y(t?: number): number;
}

interface JXGText {
  X(): number;
  Y(): number;
}

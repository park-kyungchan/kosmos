/**
 * Minimal Three.js 0.183.2 type declarations for H-B prototype.
 * Faithful to the public API surface used in mathcrew's speech-bubble.ts.
 */
declare namespace THREE {
  class Vector3 {
    x: number;
    y: number;
    z: number;
    constructor(x?: number, y?: number, z?: number);
    set(x: number, y: number, z: number): this;
    clone(): Vector3;
    project(camera: Camera): Vector3;
  }

  class Object3D {
    position: Vector3;
    add(...objects: Object3D[]): this;
    remove(...objects: Object3D[]): this;
  }

  class Scene extends Object3D {}

  class Camera extends Object3D {
    matrixWorldInverse: unknown;
    projectionMatrix: unknown;
  }

  class BufferGeometry {}
  class MeshBasicMaterial { color: unknown; }

  class Mesh extends Object3D {
    geometry: BufferGeometry;
    material: MeshBasicMaterial;
  }
}

/**
 * Minimal troika-three-text 0.49.x type declarations.
 * Text extends THREE.Mesh — adds text-specific properties + async sync().
 *
 * C-B01-1 note: troika's internal rendering uses a custom shader that
 * may conflict with postprocessing EffectComposer pass ordering.
 * The Text mesh must be added to the scene BEFORE EffectComposer.render()
 * is called, or rendered to a separate render target.
 */
declare class TroikaText extends THREE.Mesh {
  text: string;
  fontSize: number;
  color: number | string;
  anchorX: "left" | "center" | "right";
  anchorY: "top" | "middle" | "bottom";
  maxWidth: number;
  font: string;
  sdfGlyphSize: number;
  outlineWidth: number;
  outlineColor: number | string;
  /** Async font atlas compilation — runs in WebWorker, non-blocking */
  sync(callback?: () => void): void;
  /** Release GPU resources */
  dispose(): void;
}

/**
 * postprocessing EffectComposer — conflict point surface for C-B01-1.
 */
declare class EffectComposer {
  /**
   * C-B01-1: troika content must be composited BEFORE this call
   * to appear in the postprocessed output frame.
   */
  render(deltaTime?: number): void;
  addPass(pass: unknown): void;
}

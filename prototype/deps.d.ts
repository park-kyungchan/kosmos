/**
 * Ambient type declarations for external dependencies referenced by prototypes.
 * These are minimal stubs — not full type definitions.
 * Prototypes reference three, troika-three-text, and postprocessing
 * without installing them in the kosmos workspace.
 */

declare module "three" {
  export class Vector3 {
    x: number; y: number; z: number;
    constructor(x?: number, y?: number, z?: number);
    set(x: number, y: number, z: number): this;
    clone(): Vector3;
    project(camera: Camera): this;
  }
  export class Camera {
    matrixWorldInverse: unknown;
    projectionMatrix: unknown;
  }
  export class PerspectiveCamera extends Camera {
    constructor(fov?: number, aspect?: number, near?: number, far?: number);
  }
  export class Scene {
    add(...objects: Object3D[]): this;
    remove(...objects: Object3D[]): this;
  }
  export class Object3D {
    position: Vector3;
    visible: boolean;
    add(...objects: Object3D[]): this;
    remove(...objects: Object3D[]): this;
  }
  export class BufferGeometry {}
  export class Material {}
  export class MeshBasicMaterial extends Material {}
  export class MeshStandardMaterial extends Material {}
  export class Mesh<G extends BufferGeometry = BufferGeometry, M extends Material = Material> extends Object3D {
    geometry: G;
    material: M;
  }
  export class WebGLRenderer {
    domElement: HTMLCanvasElement;
    render(scene: Scene, camera: Camera): void;
    setSize(width: number, height: number): void;
  }
}

declare module "troika-three-text" {
  import type { Mesh, BufferGeometry, MeshBasicMaterial } from "three";

  export class Text extends Mesh<BufferGeometry, MeshBasicMaterial> {
    text: string;
    fontSize: number;
    color: number | string;
    anchorX: "left" | "center" | "right";
    anchorY: "top" | "middle" | "bottom";
    maxWidth: number;
    font: string;
    outlineWidth: number;
    outlineColor: number | string;
    depthOffset: number;
    clipRect: [number, number, number, number] | null;
    curveRadius: number;
    sync(callback?: () => void): void;
    dispose(): void;
  }

  export function preloadFont(
    options: { font?: string; characters?: string },
    callback?: () => void
  ): void;
}

declare module "postprocessing" {
  import type { WebGLRenderer, Scene, Camera } from "three";

  export class EffectComposer {
    constructor(renderer: WebGLRenderer);
    addPass(pass: Pass): void;
    render(delta?: number): void;
  }
  export class Pass {}
  export class RenderPass extends Pass {
    constructor(scene: Scene, camera: Camera);
  }
  export class OverrideMaterialManager {
    static workaroundEnabled: boolean;
  }
}

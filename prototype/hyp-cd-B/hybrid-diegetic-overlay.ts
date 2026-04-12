/**
 * H-B Prototype: Hybrid Diegetic + Overlay
 *
 * Claims validated:
 *   1. ContentDeliveryResolver routes all 5 TeachingBeat phases correctly with
 *      TypeScript exhaustive never-check (C-B04-1 resolution, A-B04-1)
 *   2. SpatialAnnotation entity extends DATA layer without SpeechBubbleContent breakage
 *   3. troika-three-text integration surface: TroikaText mesh config API shape
 *      validated via local .d.ts — renderBeforeCompositor contract point documented
 *   4. EffectComposer pass ordering conflict (C-B01-1) is a DETECTED gap —
 *      prototype maps the exact integration point for empirical validation
 *   5. Graceful fallback: diegetic renderer falls back to CSS overlay
 *      when troika font atlas not ready (A-B04-3)
 *
 * Gaps confirmed (require real browser/GPU runtime):
 *   C-B01-1: troika shader pass ordering vs EffectComposer — cannot validate
 *            without actual Three.js renderer + postprocessing pipeline.
 *            Prototype identifies the exact integration point (renderBeforeCompositor).
 *   C-B03-1: SDF per-draw-call overhead on low-end GPU — requires device profiling.
 */

// Types sourced from ./three-minimal.d.ts (ambient global declarations)
// TroikaText, THREE.Scene, EffectComposer are declared globally there.

// ---------------------------------------------------------------------------
// Domain types
// ---------------------------------------------------------------------------

type TeachingPhase = "motivate" | "explain" | "demonstrate" | "practice" | "assess";

interface SpeechBubbleContent {
  title: string;
  body: string;
  phase: TeachingPhase;
  vocabularyIntro?: string;
  successCriteria?: string;
  promptText: string;
  promptKey: string;
  beatIndex: number;
  totalBeats: number;
}

/** New DATA entity: 3D-anchored spatial annotation (H-B addition to ontology) */
interface SpatialAnnotation {
  id: string;
  position: { x: number; y: number; z: number };
  anchorObjectId: string;
  label: string;
  labelType: "vocabulary" | "concept" | "instruction";
  visibilityCondition: TeachingPhase[];
}

/** Rendering target classification */
type RenderTarget = "diegetic" | "css-overlay";

/** ContentDeliveryResolver output */
interface ContentDeliveryDecision {
  target: RenderTarget;
  content: SpeechBubbleContent;
  spatialAnnotations: SpatialAnnotation[];
  rationale: string;
}

// ---------------------------------------------------------------------------
// LOGIC: ContentDeliveryResolver
// Routes per TeachingBeat phase with TypeScript exhaustive never-check (C-B04-1).
// ---------------------------------------------------------------------------

function getAnnotationsForPhase(
  phase: TeachingPhase,
  annotations: SpatialAnnotation[]
): SpatialAnnotation[] {
  return annotations.filter((a) => a.visibilityCondition.includes(phase));
}

/**
 * ContentDeliveryResolver: determines rendering target per TeachingBeat phase.
 *
 * - motivate/explain/demonstrate → diegetic (troika-three-text SDF spatial labels
 *   anchored to 3D math objects in scene graph)
 * - practice/assess → css-overlay (reliable interaction surface + readability)
 *
 * TypeScript exhaustive switch: adding a new TeachingPhase without a resolver
 * branch is a COMPILE-TIME ERROR at the never-check. (C-B04-1 resolution)
 */
function resolveContentDelivery(
  content: SpeechBubbleContent,
  availableAnnotations: SpatialAnnotation[]
): ContentDeliveryDecision {
  const phase = content.phase;

  switch (phase) {
    case "motivate":
      return {
        target: "diegetic",
        content,
        spatialAnnotations: getAnnotationsForPhase(phase, availableAnnotations),
        rationale: "motivate: diegetic spatial presence anchors engagement to 3D world",
      };

    case "explain":
      return {
        target: "diegetic",
        content,
        spatialAnnotations: getAnnotationsForPhase(phase, availableAnnotations),
        rationale: "explain: vocabulary labels on 3D objects (troika SDF) — concept in context",
      };

    case "demonstrate":
      return {
        target: "diegetic",
        content,
        spatialAnnotations: getAnnotationsForPhase(phase, availableAnnotations),
        rationale: "demonstrate: 3D annotation overlay shows how, not just what",
      };

    case "practice":
      return {
        target: "css-overlay",
        content,
        spatialAnnotations: [],
        rationale: "practice: CSS overlay for reliable pointer-event interaction + readability",
      };

    case "assess":
      return {
        target: "css-overlay",
        content,
        spatialAnnotations: [],
        rationale: "assess: CSS overlay for critical feedback — no troika async latency risk",
      };

    default: {
      // Exhaustive never-check: compile-time error if TeachingPhase gains a new member
      const _exhaustiveCheck: never = phase;
      throw new Error(`ContentDeliveryResolver: unhandled phase "${_exhaustiveCheck}"`);
    }
  }
}

// ---------------------------------------------------------------------------
// LOGIC: troika-three-text integration surface
// Maps SpatialAnnotation → TroikaText configuration
// ---------------------------------------------------------------------------

interface TroikaLabelConfig {
  text: string;
  fontSize: number;
  color: string;
  position: { x: number; y: number; z: number };
  maxWidth: number;
  /**
   * C-B01-1 contract point: troika Text mesh must be added to scene and
   * rendered BEFORE EffectComposer.render() to appear in postprocessed output.
   * This boolean is a compile-time marker — empirical validation required.
   */
  renderBeforeCompositor: true;
}

function buildTroikaLabelConfig(annotation: SpatialAnnotation): TroikaLabelConfig {
  const fontSizeByType: Record<SpatialAnnotation["labelType"], number> = {
    vocabulary:   0.15, // readable at >=2m distance in scene units
    concept:      0.12,
    instruction:  0.10,
  };

  return {
    text: annotation.label,
    fontSize: fontSizeByType[annotation.labelType],
    color: "#ffffff",
    position: annotation.position,
    maxWidth: 2.0,
    renderBeforeCompositor: true,
  };
}

/** Proof that TroikaText ambient type is structurally compatible with config */
function applyConfigToTroikaText(mesh: TroikaText, config: TroikaLabelConfig): void {
  mesh.text = config.text;
  mesh.fontSize = config.fontSize;
  mesh.color = config.color;
  mesh.maxWidth = config.maxWidth;
  mesh.position.set(config.position.x, config.position.y, config.position.z);
  // mesh.sync() would be called here — triggers async WebWorker font atlas compilation
}

/**
 * Graceful fallback: if troika font atlas not compiled yet, fall back to CSS overlay.
 * (A-B04-3)
 */
type DiegeticRenderResult =
  | { status: "rendered"; meshCount: number }
  | { status: "fallback-css"; reason: string };

function renderDiegeticLabels(
  annotations: SpatialAnnotation[],
  scene: THREE.Scene,
  troikaReady: boolean
): DiegeticRenderResult {
  if (!troikaReady) {
    return {
      status: "fallback-css",
      reason: "troika font atlas not ready — CSS overlay fallback active",
    };
  }

  // In production: instantiate TroikaText, apply config, scene.add(), call sync()
  // Here we validate the config shape only (no GPU runtime available)
  const configs = annotations.map(buildTroikaLabelConfig);

  // Prove structural compatibility: applyConfigToTroikaText type-checks
  // (would be called at runtime with real TroikaText instances)
  const _typeProof: (mesh: TroikaText, cfg: TroikaLabelConfig) => void = applyConfigToTroikaText;
  void _typeProof; // used — prevents lint warning

  // EffectComposer conflict point: configs[*].renderBeforeCompositor === true
  // means the rendering subsystem MUST schedule these BEFORE compositor.render()
  const allMarkedPreCompositor = configs.every((c) => c.renderBeforeCompositor === true);
  if (!allMarkedPreCompositor) {
    throw new Error("C-B01-1 invariant violated: all troika meshes must be pre-compositor");
  }

  // scene.add() calls would happen here in production
  void scene;

  return { status: "rendered", meshCount: configs.length };
}

// ---------------------------------------------------------------------------
// Integration tests
// ---------------------------------------------------------------------------

function runHypBIntegrationTests(): void {
  const mockAnnotations: SpatialAnnotation[] = [
    {
      id: "ann-factor-01",
      position: { x: 1.5, y: 2.0, z: 0 },
      anchorObjectId: "factor-tower-12",
      label: "약수 (divisor)",
      labelType: "vocabulary",
      visibilityCondition: ["explain", "demonstrate"],
    },
    {
      id: "ann-concept-01",
      position: { x: -1.0, y: 1.5, z: 0.5 },
      anchorObjectId: "divisor-ring-6",
      label: "6 = 2 × 3",
      labelType: "concept",
      visibilityCondition: ["motivate", "explain"],
    },
  ];

  const phases: TeachingPhase[] = ["motivate", "explain", "demonstrate", "practice", "assess"];
  let allPassed = true;

  // Test 1: All 5 phases resolve without throwing; routing is correct
  for (const phase of phases) {
    const content: SpeechBubbleContent = {
      title: `Test ${phase}`,
      body: "test body",
      phase,
      promptText: "Enter",
      promptKey: "Enter",
      beatIndex: 0,
      totalBeats: 5,
    };

    try {
      const decision = resolveContentDelivery(content, mockAnnotations);
      const expectsDiegetic = ["motivate", "explain", "demonstrate"].includes(phase);
      const targetCorrect = expectsDiegetic
        ? decision.target === "diegetic"
        : decision.target === "css-overlay";
      const overlayHasNoAnnotations =
        decision.target === "css-overlay" ? decision.spatialAnnotations.length === 0 : true;
      const contentPreserved = decision.content === content;

      if (!targetCorrect || !overlayHasNoAnnotations || !contentPreserved) {
        console.error(`FAIL: phase=${phase}`, { targetCorrect, overlayHasNoAnnotations, contentPreserved });
        allPassed = false;
      } else {
        console.log(`PASS: phase=${phase} → target=${decision.target} annotations=${decision.spatialAnnotations.length}`);
      }
    } catch (e) {
      console.error(`FAIL: phase=${phase} threw: ${e}`);
      allPassed = false;
    }
  }

  // Test 2: troika label config validation
  const ann = mockAnnotations[0];
  const cfg = buildTroikaLabelConfig(ann);
  const configValid =
    cfg.text === ann.label &&
    cfg.fontSize > 0 &&
    cfg.renderBeforeCompositor === true &&
    cfg.position.x === ann.position.x;

  if (!configValid) {
    console.error("FAIL: troika label config invalid", cfg);
    allPassed = false;
  } else {
    console.log(`PASS: troika config "${ann.label}" → fontSize=${cfg.fontSize} renderBeforeCompositor=true`);
  }

  // Test 3: graceful fallback when troika not ready
  const fallbackResult = renderDiegeticLabels(mockAnnotations, {} as THREE.Scene, false);
  if (fallbackResult.status !== "fallback-css") {
    console.error("FAIL: fallback not triggered when troika not ready", fallbackResult);
    allPassed = false;
  } else {
    console.log(`PASS: graceful fallback → ${fallbackResult.status}: "${fallbackResult.reason}"`);
  }

  // Test 4: rendered path returns correct mesh count
  const renderResult = renderDiegeticLabels(mockAnnotations, {} as THREE.Scene, true);
  if (renderResult.status !== "rendered" || renderResult.meshCount !== mockAnnotations.length) {
    console.error("FAIL: render path incorrect", renderResult);
    allPassed = false;
  } else {
    console.log(`PASS: diegetic render → ${renderResult.status} ${renderResult.meshCount} meshes`);
  }

  if (!allPassed) {
    throw new Error("H-B integration test: one or more invariants violated");
  }

  console.log("\n✓ H-B: ContentDeliveryResolver — all 5 phases handled, never-check enforced");
  console.log("✓ H-B: SpatialAnnotation DATA entity — no SpeechBubbleContent contract change");
  console.log("✓ H-B: troika TroikaText config shape — type-checked against .d.ts surface");
  console.log("✓ H-B: renderBeforeCompositor=true — C-B01-1 contract point documented");
  console.log("✓ H-B: Graceful CSS fallback when troika font atlas not ready");
  console.log("\nGAP C-B01-1: troika shader vs EffectComposer pass order — requires live Three.js renderer");
  console.log("GAP C-B03-1: SDF per-draw-call GPU overhead — requires Chromebook device profiling");
}

runHypBIntegrationTests();

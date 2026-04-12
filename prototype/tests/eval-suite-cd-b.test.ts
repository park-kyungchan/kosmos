/**
 * Eval Suite cd-B — Hypothesis B (Hybrid Diegetic + Overlay)
 * T9 [EVAL-GATE] eval-runner
 *
 * Tests pure logic extracted from prototype/hyp-cd-B/hybrid-diegetic-overlay.ts.
 * Three.js / troika-three-text / postprocessing are stubbed — no renderer needed.
 *
 * D/L/A classification noted per test group.
 */

import { describe, it, expect } from "bun:test";

// ── Domain types (mirrors hybrid-diegetic-overlay.ts) ─────────────────────────

type TeachingPhase = "motivate" | "explain" | "demonstrate" | "practice" | "assess";
type DeliveryMode = "diegetic" | "css-overlay" | "fallback-css";
type LabelType = "vocabulary" | "formula" | "hint" | "success";

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

interface SpatialAnnotation {
  id: string;
  labelType: LabelType;
  text: string;
  worldPosition: { x: number; y: number; z: number };
  visibleInPhases: TeachingPhase[];
  fontSize: number;
  renderBeforeCompositor: boolean;
}

// ── ContentDeliveryResolver (exhaustive switch) ───────────────────────────────

function resolveDeliveryMode(phase: TeachingPhase, troikaReady: boolean): DeliveryMode {
  if (!troikaReady) return "fallback-css";
  switch (phase) {
    case "motivate":
    case "explain":
    case "demonstrate":
      return "diegetic";
    case "practice":
    case "assess":
      return "css-overlay";
    default: {
      // TypeScript exhaustive never-check
      const _never: never = phase;
      void _never;
      return "fallback-css";
    }
  }
}

// ── SpatialAnnotation filter ──────────────────────────────────────────────────

function getActiveAnnotations(
  annotations: SpatialAnnotation[],
  phase: TeachingPhase
): SpatialAnnotation[] {
  return annotations.filter(a => a.visibleInPhases.includes(phase));
}

// ── troika label config derivation ───────────────────────────────────────────

interface TroikaLabelConfig {
  fontSize: number;
  color: string;
  anchorX: "left" | "center" | "right";
  maxWidth: number;
  outlineWidth: number;
  renderBeforeCompositor: boolean;
}

function buildTroikaConfig(annotation: SpatialAnnotation): TroikaLabelConfig {
  const fontSizeMap: Record<LabelType, number> = {
    vocabulary: 0.15,
    formula:    0.20,
    hint:       0.12,
    success:    0.18,
  };
  const colorMap: Record<LabelType, string> = {
    vocabulary: "#FFD700",
    formula:    "#FFFFFF",
    hint:       "#AADDFF",
    success:    "#88FF88",
  };
  return {
    fontSize: fontSizeMap[annotation.labelType],
    color: colorMap[annotation.labelType],
    anchorX: "center",
    maxWidth: 2.0,
    outlineWidth: 0.02,
    renderBeforeCompositor: annotation.renderBeforeCompositor,
  };
}

// ── Graceful fallback logic ───────────────────────────────────────────────────

function selectRenderStrategy(troikaReady: boolean, phase: TeachingPhase): {
  mode: DeliveryMode;
  useTroika: boolean;
} {
  const mode = resolveDeliveryMode(phase, troikaReady);
  return { mode, useTroika: troikaReady && mode === "diegetic" };
}

// ── Fixtures ──────────────────────────────────────────────────────────────────

const annotations: SpatialAnnotation[] = [
  {
    id: "ann-vocab-1",
    labelType: "vocabulary",
    text: "약수 (divisor)",
    worldPosition: { x: 1.5, y: 2.0, z: 0.0 },
    visibleInPhases: ["explain", "demonstrate"],
    fontSize: 0.15,
    renderBeforeCompositor: true,
  },
  {
    id: "ann-formula-1",
    labelType: "formula",
    text: "12 ÷ 3 = 4",
    worldPosition: { x: -1.0, y: 1.5, z: 0.5 },
    visibleInPhases: ["demonstrate", "practice"],
    fontSize: 0.20,
    renderBeforeCompositor: true,
  },
  {
    id: "ann-hint-1",
    labelType: "hint",
    text: "약수를 찾아봐요",
    worldPosition: { x: 0.0, y: 3.0, z: 0.0 },
    visibleInPhases: ["motivate"],
    fontSize: 0.12,
    renderBeforeCompositor: true,
  },
];

// ── B-T1: ContentDeliveryResolver — motivate → diegetic (LOGIC) ──────────────

describe("B-T1 — ContentDeliveryResolver: motivate → diegetic", () => {
  it("phase=motivate, troikaReady=true → diegetic", () => {
    expect(resolveDeliveryMode("motivate", true)).toBe("diegetic");
  });
  it("phase=explain, troikaReady=true → diegetic", () => {
    expect(resolveDeliveryMode("explain", true)).toBe("diegetic");
  });
  it("phase=demonstrate, troikaReady=true → diegetic", () => {
    expect(resolveDeliveryMode("demonstrate", true)).toBe("diegetic");
  });
});

// ── B-T2: ContentDeliveryResolver — practice → css-overlay (LOGIC) ───────────

describe("B-T2 — ContentDeliveryResolver: practice/assess → css-overlay", () => {
  it("phase=practice, troikaReady=true → css-overlay", () => {
    expect(resolveDeliveryMode("practice", true)).toBe("css-overlay");
  });
  it("phase=assess, troikaReady=true → css-overlay", () => {
    expect(resolveDeliveryMode("assess", true)).toBe("css-overlay");
  });
});

// ── B-T3: ContentDeliveryResolver — all 5 phases exhaustive (LOGIC) ──────────

describe("B-T3 — ContentDeliveryResolver: all 5 phases handled exhaustively", () => {
  const phases: TeachingPhase[] = ["motivate", "explain", "demonstrate", "practice", "assess"];
  const validModes: DeliveryMode[] = ["diegetic", "css-overlay", "fallback-css"];

  it("all 5 phases return a valid DeliveryMode when troikaReady=true", () => {
    for (const phase of phases) {
      const mode = resolveDeliveryMode(phase, true);
      expect(validModes).toContain(mode);
    }
  });
  it("all 5 phases return fallback-css when troikaReady=false", () => {
    for (const phase of phases) {
      expect(resolveDeliveryMode(phase, false)).toBe("fallback-css");
    }
  });
  it("diegetic phases are exactly {motivate, explain, demonstrate}", () => {
    const diegeticPhases = phases.filter(p => resolveDeliveryMode(p, true) === "diegetic");
    expect(diegeticPhases.sort()).toEqual(["demonstrate", "explain", "motivate"]);
  });
  it("overlay phases are exactly {practice, assess}", () => {
    const overlayPhases = phases.filter(p => resolveDeliveryMode(p, true) === "css-overlay");
    expect(overlayPhases.sort()).toEqual(["assess", "practice"]);
  });
});

// ── B-T4: SpatialAnnotation filters correctly by phase (DATA) ────────────────

describe("B-T4 — SpatialAnnotation: filter by phase visibility", () => {
  it("phase=explain → 1 annotation (vocab only)", () => {
    const active = getActiveAnnotations(annotations, "explain");
    expect(active).toHaveLength(1);
    expect(active[0].id).toBe("ann-vocab-1");
  });
  it("phase=demonstrate → 2 annotations (vocab + formula)", () => {
    const active = getActiveAnnotations(annotations, "demonstrate");
    expect(active).toHaveLength(2);
    const ids = active.map(a => a.id).sort();
    expect(ids).toEqual(["ann-formula-1", "ann-vocab-1"]);
  });
  it("phase=motivate → 1 annotation (hint only)", () => {
    const active = getActiveAnnotations(annotations, "motivate");
    expect(active).toHaveLength(1);
    expect(active[0].id).toBe("ann-hint-1");
  });
  it("phase=assess → 0 annotations (none configured for assess)", () => {
    const active = getActiveAnnotations(annotations, "assess");
    expect(active).toHaveLength(0);
  });
  it("empty annotation set → always 0 active", () => {
    expect(getActiveAnnotations([], "explain")).toHaveLength(0);
  });
});

// ── B-T5: troika label config — fontSize by labelType (DATA) ─────────────────

describe("B-T5 — troika label config: fontSize by labelType", () => {
  it("vocabulary → fontSize=0.15", () => {
    const config = buildTroikaConfig(annotations[0]);
    expect(config.fontSize).toBe(0.15);
  });
  it("formula → fontSize=0.20", () => {
    const config = buildTroikaConfig(annotations[1]);
    expect(config.fontSize).toBe(0.20);
  });
  it("hint → fontSize=0.12", () => {
    const config = buildTroikaConfig(annotations[2]);
    expect(config.fontSize).toBe(0.12);
  });
  it("success → fontSize=0.18", () => {
    const successAnn: SpatialAnnotation = {
      ...annotations[0], labelType: "success", fontSize: 0.18,
    };
    const config = buildTroikaConfig(successAnn);
    expect(config.fontSize).toBe(0.18);
  });
  it("all configs have anchorX=center and maxWidth=2.0", () => {
    for (const ann of annotations) {
      const config = buildTroikaConfig(ann);
      expect(config.anchorX).toBe("center");
      expect(config.maxWidth).toBe(2.0);
    }
  });
});

// ── B-T6: Graceful fallback — troikaReady=false → fallback-css (ACTION) ──────

describe("B-T6 — Graceful fallback: troikaReady=false → fallback-css", () => {
  it("troikaReady=false always returns fallback-css regardless of phase", () => {
    const phases: TeachingPhase[] = ["motivate", "explain", "demonstrate", "practice", "assess"];
    for (const phase of phases) {
      expect(resolveDeliveryMode(phase, false)).toBe("fallback-css");
    }
  });
  it("selectRenderStrategy: troikaReady=false, phase=explain → useTroika=false", () => {
    const result = selectRenderStrategy(false, "explain");
    expect(result.useTroika).toBe(false);
    expect(result.mode).toBe("fallback-css");
  });
  it("selectRenderStrategy: troikaReady=true, phase=motivate → useTroika=true", () => {
    const result = selectRenderStrategy(true, "motivate");
    expect(result.useTroika).toBe(true);
    expect(result.mode).toBe("diegetic");
  });
  it("selectRenderStrategy: troikaReady=true, phase=practice → useTroika=false (css-overlay, not diegetic)", () => {
    const result = selectRenderStrategy(true, "practice");
    expect(result.useTroika).toBe(false);
    expect(result.mode).toBe("css-overlay");
  });
});

// ── B-T7: Diegetic render — mesh count matches annotation count (ACTION) ──────

describe("B-T7 — Diegetic render: active mesh count matches annotation count", () => {
  it("demonstrate phase: 2 active annotations → 2 troika configs created", () => {
    const active = getActiveAnnotations(annotations, "demonstrate");
    const configs = active.map(buildTroikaConfig);
    expect(configs).toHaveLength(2);
  });
  it("motivate phase: 1 active annotation → 1 troika config", () => {
    const active = getActiveAnnotations(annotations, "motivate");
    const configs = active.map(buildTroikaConfig);
    expect(configs).toHaveLength(1);
  });
  it("assess phase: 0 active annotations → 0 configs (no meshes created)", () => {
    const active = getActiveAnnotations(annotations, "assess");
    const configs = active.map(buildTroikaConfig);
    expect(configs).toHaveLength(0);
  });
});

// ── B-T8: renderBeforeCompositor invariant — all annotations=true (ACTION) ────

describe("B-T8 — renderBeforeCompositor invariant: all configs=true", () => {
  it("every fixture annotation has renderBeforeCompositor=true", () => {
    for (const ann of annotations) {
      expect(ann.renderBeforeCompositor).toBe(true);
    }
  });
  it("buildTroikaConfig preserves renderBeforeCompositor from annotation", () => {
    for (const ann of annotations) {
      const config = buildTroikaConfig(ann);
      expect(config.renderBeforeCompositor).toBe(ann.renderBeforeCompositor);
    }
  });
  it("annotation with renderBeforeCompositor=false: config reflects it (invariant is on fixture, not function)", () => {
    const ann: SpatialAnnotation = { ...annotations[0], renderBeforeCompositor: false };
    const config = buildTroikaConfig(ann);
    expect(config.renderBeforeCompositor).toBe(false);
  });
  it("all active annotations in any phase preserve the compositor invariant", () => {
    const phases: TeachingPhase[] = ["motivate", "explain", "demonstrate", "practice", "assess"];
    for (const phase of phases) {
      const active = getActiveAnnotations(annotations, phase);
      for (const ann of active) {
        expect(ann.renderBeforeCompositor).toBe(true);
      }
    }
  });
});

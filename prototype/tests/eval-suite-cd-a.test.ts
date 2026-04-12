/**
 * Eval Suite cd-A — Hypothesis A (Enhanced CSS Overlay)
 * T9 [EVAL-GATE] eval-runner
 *
 * Tests pure logic extracted from prototype/hyp-cd-A/enhanced-css-overlay.ts.
 * No browser runtime needed — all functions are pure TS.
 *
 * D/L/A classification noted per test group.
 */

import { describe, it, expect } from "bun:test";

// ── Re-implement pure functions from H-A (no browser dependency) ──────────────

type TeachingPhase = "motivate" | "explain" | "demonstrate" | "practice" | "assess";
type AnimationVariant = "fade-in" | "slide-up" | "pulse" | "none";
type ModalityFlag = "phase-icon" | "vocabulary-highlight" | "progress-arc";
type ContentDensity = "full" | "reduced" | "minimal";

interface MiniHudTelemetry {
  masteryScore: number;
  attemptCount: number;
  interactionProgress: number;
}

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
  animationHints?: { variant: AnimationVariant; durationMs: number; respectsReducedMotion: true };
  modalityFlags?: ModalityFlag[];
}

interface AdaptedContent {
  title: string;
  body: string;
  showVocabulary: boolean;
  showSuccessCriteria: boolean;
  density: ContentDensity;
}

function computeContentDensity(telemetry: MiniHudTelemetry): ContentDensity {
  const { masteryScore, attemptCount } = telemetry;
  if (masteryScore < 0.3 && attemptCount >= 3) return "minimal";
  if (masteryScore < 0.6 && attemptCount >= 2) return "reduced";
  return "full";
}

function adaptContentForLearner(
  content: SpeechBubbleContent,
  telemetry: MiniHudTelemetry
): AdaptedContent {
  const density = computeContentDensity(telemetry);
  switch (density) {
    case "full":
      return { title: content.title, body: content.body, showVocabulary: true, showSuccessCriteria: true, density };
    case "reduced":
      return { title: content.title, body: content.body, showVocabulary: !!content.vocabularyIntro, showSuccessCriteria: false, density };
    case "minimal":
      return { title: content.title, body: content.body.split(".")[0] + ".", showVocabulary: false, showSuccessCriteria: false, density };
    default: {
      const _never: never = density;
      return _never;
    }
  }
}

function resolveCSSAnimationClass(content: SpeechBubbleContent, prefersReducedMotion: boolean): string {
  if (prefersReducedMotion) return "";
  const variant = content.animationHints?.variant ?? "fade-in";
  if (variant === "none") return "";
  const classMap: Record<Exclude<AnimationVariant, "none">, string> = {
    "fade-in": "sb-anim-fade-in",
    "slide-up": "sb-anim-slide-up",
    "pulse": "sb-anim-pulse",
  };
  return classMap[variant];
}

function resolveModalityAttributes(content: SpeechBubbleContent): Record<string, string> {
  const attrs: Record<string, string> = {};
  const flags = content.modalityFlags ?? [];
  attrs["data-phase"] = content.phase;
  if (flags.includes("vocabulary-highlight") && content.vocabularyIntro) {
    attrs["data-has-vocabulary"] = "true";
  }
  if (flags.includes("progress-arc")) {
    attrs["data-beat-index"] = String(content.beatIndex);
    attrs["data-total-beats"] = String(content.totalBeats);
  }
  return attrs;
}

interface ScreenPosition { left: string; top: string; behindCamera: boolean; }
interface Vector3Like { x: number; y: number; z: number; clone(): Vector3Like; project(c: unknown): Vector3Like; }

function worldToScreen(worldPos: Vector3Like, _camera: unknown, viewportWidth: number, viewportHeight: number): ScreenPosition {
  const projected = worldPos.clone().project(_camera);
  if (projected.z > 1) return { left: "0px", top: "0px", behindCamera: true };
  const left = ((projected.x + 1) / 2) * viewportWidth;
  const top = ((-projected.y + 1) / 2) * viewportHeight;
  return { left: `${left.toFixed(1)}px`, top: `${top.toFixed(1)}px`, behindCamera: false };
}

// ── Fixtures ──────────────────────────────────────────────────────────────────

const baseContent: SpeechBubbleContent = {
  title: "약수란?",
  body: "어떤 수를 나누어 떨어지게 하는 수를 약수라고 해요. 이것이 핵심입니다.",
  phase: "explain",
  vocabularyIntro: "약수 (divisor): 나누어 떨어지게 하는 수",
  promptText: "Enter를 눌러 계속",
  promptKey: "Enter",
  beatIndex: 1,
  totalBeats: 5,
  animationHints: { variant: "slide-up", durationMs: 400, respectsReducedMotion: true },
  modalityFlags: ["phase-icon", "vocabulary-highlight"],
};

// ── A-T1: CognitiveLoadManager — strong learner → full density (LOGIC) ────────

describe("A-T1 — CognitiveLoadManager: strong learner → full density", () => {
  it("mastery=0.9, attempts=1 → full", () => {
    expect(computeContentDensity({ masteryScore: 0.9, attemptCount: 1, interactionProgress: 0.8 })).toBe("full");
  });
  it("full density: showVocabulary=true, showSuccessCriteria=true", () => {
    const adapted = adaptContentForLearner(baseContent, { masteryScore: 0.9, attemptCount: 1, interactionProgress: 0.8 });
    expect(adapted.showVocabulary).toBe(true);
    expect(adapted.showSuccessCriteria).toBe(true);
    expect(adapted.density).toBe("full");
  });
  it("full density: body is unchanged", () => {
    const adapted = adaptContentForLearner(baseContent, { masteryScore: 0.9, attemptCount: 1, interactionProgress: 0.8 });
    expect(adapted.body).toBe(baseContent.body);
  });
});

// ── A-T2: CognitiveLoadManager — struggling learner → minimal density (LOGIC) ─

describe("A-T2 — CognitiveLoadManager: struggling learner → minimal density", () => {
  it("mastery=0.2, attempts=4 → minimal", () => {
    expect(computeContentDensity({ masteryScore: 0.2, attemptCount: 4, interactionProgress: 0.2 })).toBe("minimal");
  });
  it("minimal: showVocabulary=false, showSuccessCriteria=false", () => {
    const adapted = adaptContentForLearner(baseContent, { masteryScore: 0.2, attemptCount: 4, interactionProgress: 0.2 });
    expect(adapted.showVocabulary).toBe(false);
    expect(adapted.showSuccessCriteria).toBe(false);
  });
  it("minimal: body is truncated to first sentence", () => {
    const adapted = adaptContentForLearner(baseContent, { masteryScore: 0.2, attemptCount: 4, interactionProgress: 0.2 });
    expect(adapted.body).toBe("어떤 수를 나누어 떨어지게 하는 수를 약수라고 해요.");
  });
  it("minimal: title is always preserved", () => {
    const adapted = adaptContentForLearner(baseContent, { masteryScore: 0.2, attemptCount: 4, interactionProgress: 0.2 });
    expect(adapted.title).toBe(baseContent.title);
  });
});

// ── A-T3: CognitiveLoadManager — mid learner → reduced density (LOGIC) ────────

describe("A-T3 — CognitiveLoadManager: mid learner → reduced density", () => {
  it("mastery=0.5, attempts=2 → reduced", () => {
    expect(computeContentDensity({ masteryScore: 0.5, attemptCount: 2, interactionProgress: 0.5 })).toBe("reduced");
  });
  it("reduced: showSuccessCriteria=false", () => {
    const adapted = adaptContentForLearner(baseContent, { masteryScore: 0.5, attemptCount: 2, interactionProgress: 0.5 });
    expect(adapted.showSuccessCriteria).toBe(false);
    expect(adapted.density).toBe("reduced");
  });
  it("reduced: showVocabulary=true when vocabularyIntro is present", () => {
    const adapted = adaptContentForLearner(baseContent, { masteryScore: 0.5, attemptCount: 2, interactionProgress: 0.5 });
    expect(adapted.showVocabulary).toBe(true);
  });
  it("reduced: showVocabulary=false when vocabularyIntro is absent", () => {
    const noVocab = { ...baseContent, vocabularyIntro: undefined };
    const adapted = adaptContentForLearner(noVocab, { masteryScore: 0.5, attemptCount: 2, interactionProgress: 0.5 });
    expect(adapted.showVocabulary).toBe(false);
  });
  it("boundary: mastery=0.3 exactly, attempts=2 → reduced (not minimal: mastery not < 0.3)", () => {
    expect(computeContentDensity({ masteryScore: 0.3, attemptCount: 2, interactionProgress: 0.5 })).toBe("reduced");
  });
  it("boundary: mastery=0.6 exactly, attempts=2 → full (not reduced: mastery not < 0.6)", () => {
    expect(computeContentDensity({ masteryScore: 0.6, attemptCount: 2, interactionProgress: 0.5 })).toBe("full");
  });
});

// ── A-T4: CSS animation class resolution (ACTION) ────────────────────────────

describe("A-T4 — CSS animation class resolution", () => {
  it("slide-up → sb-anim-slide-up", () => {
    expect(resolveCSSAnimationClass(baseContent, false)).toBe("sb-anim-slide-up");
  });
  it("fade-in → sb-anim-fade-in", () => {
    const c = { ...baseContent, animationHints: { variant: "fade-in" as const, durationMs: 300, respectsReducedMotion: true as const } };
    expect(resolveCSSAnimationClass(c, false)).toBe("sb-anim-fade-in");
  });
  it("pulse → sb-anim-pulse", () => {
    const c = { ...baseContent, animationHints: { variant: "pulse" as const, durationMs: 200, respectsReducedMotion: true as const } };
    expect(resolveCSSAnimationClass(c, false)).toBe("sb-anim-pulse");
  });
  it("variant=none → empty string (no class)", () => {
    const c = { ...baseContent, animationHints: { variant: "none" as const, durationMs: 0, respectsReducedMotion: true as const } };
    expect(resolveCSSAnimationClass(c, false)).toBe("");
  });
  it("no animationHints → defaults to fade-in class", () => {
    const c = { ...baseContent, animationHints: undefined };
    expect(resolveCSSAnimationClass(c, false)).toBe("sb-anim-fade-in");
  });
});

// ── A-T5: prefers-reduced-motion gating (ACTION) ──────────────────────────────

describe("A-T5 — prefers-reduced-motion → always empty class", () => {
  it("slide-up + reducedMotion=true → empty", () => {
    expect(resolveCSSAnimationClass(baseContent, true)).toBe("");
  });
  it("fade-in + reducedMotion=true → empty", () => {
    const c = { ...baseContent, animationHints: { variant: "fade-in" as const, durationMs: 300, respectsReducedMotion: true as const } };
    expect(resolveCSSAnimationClass(c, true)).toBe("");
  });
  it("pulse + reducedMotion=true → empty", () => {
    const c = { ...baseContent, animationHints: { variant: "pulse" as const, durationMs: 200, respectsReducedMotion: true as const } };
    expect(resolveCSSAnimationClass(c, true)).toBe("");
  });
  it("no animationHints + reducedMotion=true → empty", () => {
    const c = { ...baseContent, animationHints: undefined };
    expect(resolveCSSAnimationClass(c, true)).toBe("");
  });
});

// ── A-T6: Beat sequencing invariant — promptText never stripped (LOGIC) ────────

describe("A-T6 — Beat sequencing invariant: promptText/promptKey never stripped", () => {
  const scenarios: Array<{ label: string; telemetry: MiniHudTelemetry }> = [
    { label: "strong",    telemetry: { masteryScore: 0.9, attemptCount: 1, interactionProgress: 0.8 } },
    { label: "mid",       telemetry: { masteryScore: 0.5, attemptCount: 2, interactionProgress: 0.5 } },
    { label: "struggling", telemetry: { masteryScore: 0.2, attemptCount: 4, interactionProgress: 0.2 } },
  ];
  for (const { label, telemetry } of scenarios) {
    it(`${label} learner: promptText preserved on original content object`, () => {
      adaptContentForLearner(baseContent, telemetry); // must not mutate
      expect(baseContent.promptText).toBe("Enter를 눌러 계속");
      expect(baseContent.promptKey).toBe("Enter");
    });
    it(`${label} learner: beatIndex and totalBeats preserved`, () => {
      adaptContentForLearner(baseContent, telemetry);
      expect(baseContent.beatIndex).toBe(1);
      expect(baseContent.totalBeats).toBe(5);
    });
  }
});

// ── A-T7: Modality attributes — data-phase always set (DATA) ─────────────────

describe("A-T7 — Modality attributes: data-phase always set", () => {
  it("data-phase = content.phase for explain beat", () => {
    const attrs = resolveModalityAttributes(baseContent);
    expect(attrs["data-phase"]).toBe("explain");
  });
  it("data-has-vocabulary present when flag + vocabularyIntro both set", () => {
    const attrs = resolveModalityAttributes(baseContent);
    expect(attrs["data-has-vocabulary"]).toBe("true");
  });
  it("data-has-vocabulary absent when flag set but vocabularyIntro missing", () => {
    const c = { ...baseContent, vocabularyIntro: undefined };
    const attrs = resolveModalityAttributes(c);
    expect(attrs["data-has-vocabulary"]).toBeUndefined();
  });
  it("data-beat-index and data-total-beats set when progress-arc flag present", () => {
    const c = { ...baseContent, modalityFlags: ["progress-arc" as const] };
    const attrs = resolveModalityAttributes(c);
    expect(attrs["data-beat-index"]).toBe("1");
    expect(attrs["data-total-beats"]).toBe("5");
  });
  it("no extra attrs when modalityFlags is empty", () => {
    const c = { ...baseContent, modalityFlags: [] };
    const attrs = resolveModalityAttributes(c);
    expect(Object.keys(attrs)).toEqual(["data-phase"]);
  });
  it("all phases produce a valid data-phase attribute", () => {
    const phases: TeachingPhase[] = ["motivate", "explain", "demonstrate", "practice", "assess"];
    for (const phase of phases) {
      const c = { ...baseContent, phase };
      expect(resolveModalityAttributes(c)["data-phase"]).toBe(phase);
    }
  });
});

// ── A-T8: worldToScreen — behindCamera detection (LOGIC) ──────────────────────

describe("A-T8 — worldToScreen: behindCamera detection (z > 1)", () => {
  function makeVector(px: number, py: number, pz: number): Vector3Like {
    const v: Vector3Like = {
      x: px, y: py, z: pz,
      clone() { return makeVector(this.x, this.y, this.z); },
      project(_c: unknown) { return this; }, // project is identity (already in NDC)
    };
    return v;
  }

  it("projected.z=1.5 → behindCamera=true, left/top='0px'", () => {
    const result = worldToScreen(makeVector(0.5, 0.5, 1.5), null, 1280, 720);
    expect(result.behindCamera).toBe(true);
    expect(result.left).toBe("0px");
    expect(result.top).toBe("0px");
  });
  it("projected.z=0.5 → behindCamera=false, valid pixel position", () => {
    const result = worldToScreen(makeVector(0.0, 0.0, 0.5), null, 1280, 720);
    expect(result.behindCamera).toBe(false);
    expect(result.left).toBe("640.0px");
    expect(result.top).toBe("360.0px");
  });
  it("projected.z=1.0 exactly → behindCamera=false (boundary: z must be > 1)", () => {
    const result = worldToScreen(makeVector(0.0, 0.0, 1.0), null, 1280, 720);
    expect(result.behindCamera).toBe(false);
  });
  it("projected corner (x=-1, y=1, z=0) → left=0px, top=0px", () => {
    const result = worldToScreen(makeVector(-1, 1, 0), null, 1280, 720);
    expect(result.left).toBe("0.0px");
    expect(result.top).toBe("0.0px");
    expect(result.behindCamera).toBe(false);
  });
});

// ── A-T9: Integration — all 3 beats × 3 telemetry scenarios (LOGIC) ──────────

describe("A-T9 — Integration: 3 beats × 3 learner scenarios — all invariants", () => {
  const beats: SpeechBubbleContent[] = [
    {
      title: "별을 관찰해봐요", body: "세 개의 별이 보여요. 몇 개의 그룹으로 나눌 수 있을까요?",
      phase: "motivate", promptText: "Enter를 눌러 계속", promptKey: "Enter",
      beatIndex: 0, totalBeats: 5,
      animationHints: { variant: "fade-in", durationMs: 300, respectsReducedMotion: true },
      modalityFlags: ["phase-icon"],
    },
    {
      title: "약수란?", body: "어떤 수를 나누어 떨어지게 하는 수를 약수라고 해요.",
      phase: "explain", vocabularyIntro: "약수 (divisor)",
      promptText: "Enter를 눌러 계속", promptKey: "Enter",
      beatIndex: 1, totalBeats: 5,
      animationHints: { variant: "slide-up", durationMs: 400, respectsReducedMotion: true },
      modalityFlags: ["phase-icon", "vocabulary-highlight"],
    },
    {
      title: "직접 해봐요", body: "12의 약수를 찾아봐요. 어떤 수들이 12를 나누어 떨어지게 하나요?",
      phase: "practice", successCriteria: "12의 약수를 모두 찾으면 성공!",
      promptText: "약수를 클릭하세요", promptKey: "Click",
      beatIndex: 3, totalBeats: 5,
      modalityFlags: ["progress-arc"],
    },
  ];

  const telemetryScenarios = [
    { label: "strong",    t: { masteryScore: 0.9, attemptCount: 1, interactionProgress: 0.8 } },
    { label: "mid",       t: { masteryScore: 0.5, attemptCount: 2, interactionProgress: 0.5 } },
    { label: "struggling", t: { masteryScore: 0.2, attemptCount: 4, interactionProgress: 0.2 } },
  ];

  for (const beat of beats) {
    for (const { label, t } of telemetryScenarios) {
      it(`beat ${beat.beatIndex} (${beat.phase}) / ${label}: reduced-motion class empty`, () => {
        expect(resolveCSSAnimationClass(beat, true)).toBe("");
      });
      it(`beat ${beat.beatIndex} (${beat.phase}) / ${label}: data-phase set`, () => {
        expect(resolveModalityAttributes(beat)["data-phase"]).toBe(beat.phase);
      });
      it(`beat ${beat.beatIndex} (${beat.phase}) / ${label}: density is valid`, () => {
        const adapted = adaptContentForLearner(beat, t);
        expect(["full", "reduced", "minimal"]).toContain(adapted.density);
      });
      it(`beat ${beat.beatIndex} (${beat.phase}) / ${label}: original promptText unchanged`, () => {
        adaptContentForLearner(beat, t);
        expect(beat.promptText).toBeTruthy();
        expect(beat.promptKey).toBeTruthy();
      });
    }
  }
});

/**
 * team-phase-gate.ts — TaskCompleted hook for Agent Teams phase validation
 *
 * Validates ontology-state files after each pipeline phase completes.
 * Exit 0 = allow completion, Exit 2 = block + feedback to teammate.
 */

import { existsSync, readFileSync } from "fs";
import { resolve } from "path";

const PROJECT_ROOT = process.env.KOSMOS_PROJECT_ROOT || ".";
const STATE_DIR = resolve(PROJECT_ROOT, "ontology-state");

interface HookInput {
  task_subject?: string;
  task_id?: string;
  teammate_name?: string;
}

function readJSON(path: string): unknown {
  try {
    return JSON.parse(readFileSync(path, "utf-8"));
  } catch {
    return null;
  }
}


function fail(message: string): never {
  process.stderr.write(message);
  process.exit(2);
}

async function main() {
  let raw = "";
  for await (const chunk of Bun.stdin.stream()) {
    raw += new TextDecoder().decode(chunk);
  }

  let input: HookInput;
  try {
    input = JSON.parse(raw);
  } catch {
    // Not a structured input — skip validation
    process.exit(0);
  }

  const subject = (input.task_subject || "").toLowerCase();

  // Skip validation for non-pipeline tasks
  if (!subject.includes("[")) {
    process.exit(0);
  }

  // --- REGISTRY: Load registry for role-tag + dependency checks ---
  const registryPath = resolve(PROJECT_ROOT, ".claude/kosmos-registry.json");
  let registry: any = null;
  try {
    registry = JSON.parse(readFileSync(registryPath, "utf-8"));
  } catch { /* registry not found — skip validation */ }

  // --- REGISTRY: Role-tag matching ---
  const teammateName = input.teammate_name;
  if (registry && teammateName) {
    const agent = registry.agents?.[teammateName];
    if (agent) {
      const allowedTags: string[] = agent.allowedTags || [];
      const tagMatch = (input.task_subject || "").match(/\[([A-Z_-]+)\]/i);
      if (tagMatch) {
        const tag = tagMatch[1].toUpperCase();
        if (!allowedTags.map((t: string) => t.toUpperCase()).includes(tag)) {
          fail(
            `Role mismatch: ${teammateName} can only complete [${allowedTags.join(", ")}] tasks, not [${tag}]`
          );
        }
      }
    }
  }

  // --- REGISTRY: Dependency chain verification ---
  if (registry) {
    const tagMatch = (input.task_subject || "").match(/\[([A-Z_-]+)\]/i);
    if (tagMatch) {
      const tag = tagMatch[1].toUpperCase();
      const phase = (registry.phases || []).find(
        (p: any) => p.tag.toUpperCase() === tag
      );
      if (phase && Array.isArray(phase.dependsOn)) {
        const stateFiles = registry.stateFiles || {};
        for (const depTag of phase.dependsOn as string[]) {
          for (const fileInfo of Object.values(stateFiles)) {
            const info = fileInfo as any;
            if (
              Array.isArray(info.requiredAfter) &&
              (info.requiredAfter as string[]).map((t) => t.toUpperCase()).includes(depTag.toUpperCase())
            ) {
              const filePath = resolve(PROJECT_ROOT, info.path);
              if (!existsSync(filePath)) {
                fail(
                  `Dependency chain BLOCKED: [${tag}] depends on [${depTag}], ` +
                  `but required state file "${info.path}" does not exist.`
                );
              }
              const content = readFileSync(filePath, "utf-8").trim();
              if (!content) {
                fail(
                  `Dependency chain BLOCKED: [${tag}] depends on [${depTag}], ` +
                  `but required state file "${info.path}" is empty.`
                );
              }
            }
          }
        }
      }
    }
  }

  // --- RESEARCHER phase gate ---
  if (subject.includes("[research")) {
    const sourceMapPath = resolve(STATE_DIR, "source-map.json");
    const sourceMap = readJSON(sourceMapPath);
    if (!sourceMap || !Array.isArray((sourceMap as any).sources)) {
      fail(
        "Phase gate BLOCKED: source-map.json must contain a 'sources' array " +
        "with at least 1 SourceDocument after research tasks. " +
        "Update ontology-state/source-map.json with your findings before marking complete."
      );
    }
    const sources = (sourceMap as any).sources;
    if (sources.length === 0) {
      fail(
        "Phase gate BLOCKED: source-map.json has 0 sources. " +
        "Add at least 1 SourceDocument entry with provenance and tier."
      );
    }
  }

  // --- ONTOLOGIST phase gate ---
  if (subject.includes("[ontology")) {
    const worldModelPath = resolve(STATE_DIR, "world-model.json");
    const worldModel = readJSON(worldModelPath);
    if (!worldModel) {
      fail(
        "Phase gate BLOCKED: world-model.json must exist and be valid JSON " +
        "after ontology tasks. Update ontology-state/world-model.json with " +
        "D/L/A/Security/Learn classified objects."
      );
    }
    const objects = (worldModel as any).objects;
    if (!Array.isArray(objects) || objects.length === 0) {
      fail(
        "Phase gate BLOCKED: world-model.json must contain an 'objects' array " +
        "with classified OntologyObjects. Each object needs domain, ontologyType, " +
        "and evidenceIds."
      );
    }
  }

  // --- SIMULATOR phase gate ---
  if (subject.includes("[simulation") || subject.includes("[hypothesis")) {
    const scenariosPath = resolve(STATE_DIR, "scenarios.json");
    const scenarios = readJSON(scenariosPath);
    if (!scenarios) {
      fail(
        "Phase gate BLOCKED: scenarios.json must exist after simulation tasks. " +
        "Write hypothesis testing results to ontology-state/scenarios.json."
      );
    }
    const scenarioList = (scenarios as any).scenarios;
    if (Array.isArray(scenarioList)) {
      for (const s of scenarioList) {
        // evaluationScores may be an array [{dimension, score}] (new format)
        // or an object {dimensionKey: score} (legacy format) — accept both
        const scores = s.evaluationScores;
        const scoreCount = Array.isArray(scores)
          ? scores.length
          : scores && typeof scores === "object"
          ? Object.keys(scores).length
          : 0;
        if (scoreCount < 10) {
          fail(
            `Phase gate BLOCKED: Scenario "${s.name || s.id}" has ` +
            `${scoreCount}/10 evaluation dimensions. ` +
            "All 10 dimensions are required (including D/L/A Fit, ForwardProp Health, Agent Composability)."
          );
        }
      }
    }
  }

  // --- EVALUATOR phase gate ---
  if (subject.includes("[evaluate")) {
    const decisionLogPath = resolve(STATE_DIR, "decision-log.json");
    const decisionLog = readJSON(decisionLogPath);
    if (!decisionLog) {
      fail(
        "Phase gate BLOCKED: decision-log.json must exist after evaluation. " +
        "Record gate result (ACCEPT/REJECT) in ontology-state/decision-log.json."
      );
    }
    const gateResult = (decisionLog as any).evaluatorGateResult;
    if (!gateResult || !["ACCEPT", "REJECT"].includes(gateResult)) {
      fail(
        "Phase gate BLOCKED: decision-log.json must have evaluatorGateResult " +
        "set to 'ACCEPT' or 'REJECT'. Run all R1-R13 criteria before completing."
      );
    }
  }

  // --- PROTOTYPER phase gate ---
  if (subject.includes("[prototype")) {
    const evalResultsPath = resolve(STATE_DIR, "eval-results.json");
    const evalResults = readJSON(evalResultsPath);
    if (!evalResults) {
      fail(
        "Phase gate BLOCKED: eval-results.json must exist after prototype tasks. " +
        "Write PrototypeResult entries to ontology-state/eval-results.json."
      );
    }
    const prototypes = (evalResults as any).prototypes;
    if (!Array.isArray(prototypes) || prototypes.length === 0) {
      fail(
        "Phase gate BLOCKED: eval-results.json must have at least 1 prototype entry " +
        "with hypothesisId, buildStatus, and implementedFiles."
      );
    }
    const hasNonFail = prototypes.some((p: any) => p.buildStatus !== "fail");
    if (!hasNonFail) {
      fail(
        "Phase gate BLOCKED: All prototypes have buildStatus='fail'. " +
        "At least 1 prototype must build successfully (status 'success' or 'partial')."
      );
    }
  }

  // --- EVAL-GATE phase gate ---
  if (subject.includes("[eval-gate") || subject.includes("[eval_gate")) {
    const evalResultsPath = resolve(STATE_DIR, "eval-results.json");
    const evalResults = readJSON(evalResultsPath);
    if (!evalResults) {
      fail(
        "Phase gate BLOCKED: eval-results.json must exist after eval tasks. " +
        "Write EvalSuite entries to ontology-state/eval-results.json."
      );
    }
    const suites = (evalResults as any).evalSuites;
    if (!Array.isArray(suites) || suites.length === 0) {
      fail(
        "Phase gate BLOCKED: eval-results.json must have at least 1 evalSuite " +
        "with cases[], passRate, and totalCases."
      );
    }
    for (const suite of suites) {
      if (!suite.totalCases || suite.totalCases < 3) {
        fail(
          `Phase gate BLOCKED: EvalSuite "${suite.id || 'unknown'}" has ` +
          `${suite.totalCases || 0} cases. Minimum 3 test cases required per suite.`
        );
      }
    }
  }

  // --- REPORTER phase gate ---
  if (subject.includes("[blueprint") || subject.includes("[report")) {
    const blueprintPath = resolve(STATE_DIR, "blueprint.json");
    if (!existsSync(blueprintPath)) {
      fail(
        "Phase gate BLOCKED: blueprint.json must exist after reporter tasks. " +
        "Write TechBlueprint to ontology-state/blueprint.json."
      );
    }
    const blueprint = readJSON(blueprintPath);
    if (!blueprint) {
      fail(
        "Phase gate BLOCKED: blueprint.json is not valid JSON. Fix formatting."
      );
    }
    // Check minimal blueprint structure
    const bp = blueprint as any;
    if (!bp.evaluatorGate || !bp.projectScope || !bp.designPrinciples) {
      fail(
        "Phase gate BLOCKED: blueprint.json is incomplete. " +
        "Must have evaluatorGate, projectScope, and designPrinciples at minimum."
      );
    }
  }

  // All checks passed
  process.exit(0);
}

main().catch(() => process.exit(0));

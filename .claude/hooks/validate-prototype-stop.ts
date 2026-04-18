/**
 * validate-prototype-stop.ts — KOSMOS-SPECIFIC OVERRIDE (Phase A-2 W2-3)
 * Event: SubagentStop (matcher: prototyper)
 *
 * When the prototyper agent stops, verify it wrote valid results to
 * ontology-state/eval-results.json (at least 1 non-fail prototype).
 *
 * NOT covered by palantir-mini plugin v1.1 — kosmos-specific prototyper
 * pipeline check (eval-results.json + buildStatus != 'fail' invariant).
 *
 * Exit 0 = allow, Exit 2 = block + stderr feedback.
 */

export {};

import { readFileSync } from "fs";
import { resolve } from "path";

interface HookInput {
  agent_type?: string;
  teammate_name?: string;
}

interface PrototypeResult {
  buildStatus: string;
  [key: string]: unknown;
}

interface EvalResults {
  prototypes?: PrototypeResult[];
  [key: string]: unknown;
}

const PROJECT_ROOT = process.env.KOSMOS_PROJECT_ROOT || ".";
const EVAL_RESULTS_PATH = resolve(PROJECT_ROOT, "ontology-state/eval-results.json");

const BLOCKED_MSG =
  "BLOCKED: prototyper must write PrototypeResult to eval-results.json before stopping. " +
  "At least 1 prototype with buildStatus != 'fail' required.";

const input = await Bun.stdin.text();
let hookInput: HookInput = {};
try {
  hookInput = JSON.parse(input);
} catch {
  process.exit(0);
}

const { teammate_name } = hookInput;

// Only applies to prototyper
if (teammate_name !== "prototyper") {
  process.exit(0);
}

let evalResults: EvalResults | null = null;
try {
  evalResults = JSON.parse(
    readFileSync(EVAL_RESULTS_PATH, "utf-8")
  ) as EvalResults;
} catch {
  // File doesn't exist or is malformed
}

if (
  !evalResults ||
  !Array.isArray(evalResults.prototypes) ||
  evalResults.prototypes.length === 0
) {
  process.stderr.write(BLOCKED_MSG);
  process.exit(2);
}

const hasNonFail = evalResults.prototypes.some((p) => p.buildStatus !== "fail");
if (!hasNonFail) {
  process.stderr.write(BLOCKED_MSG);
  process.exit(2);
}

process.exit(0);

/**
 * Kosmos Research OS — Runtime Validators
 *
 * Type guards and validation functions for all 14 core types.
 * No external dependencies — pure TypeScript runtime checks.
 */

import type {
  Provenance,
  Severity,
  Priority,
  Timestamped,
  ResearchQuestion,
  UserRequirement,
  SourceDocument,
  Claim,
  Evidence,
  Constraint,
  TechnologyCandidate,
  ArchitectureOption,
  Hypothesis,
  SimulationRun,
  Scenario,
  Risk,
  DecisionRecommendation,
  NextExperiment,
  OntologyObject,
  ScenarioType,
} from "./types.ts";

// ─── Primitive Validators ────────────────────────────────────

const PROVENANCES: Provenance[] = ["official", "synthesis", "inference"];
const SEVERITIES: Severity[] = ["critical", "high", "medium", "low"];
const PRIORITIES: Priority[] = ["p0", "p1", "p2", "p3"];
const SCENARIO_TYPES: ScenarioType[] = ["base", "best", "worst", "adversarial"];
const DIFFICULTY_RANGE = [1, 2, 3, 4, 5] as const;

function isString(v: unknown): v is string {
  return typeof v === "string";
}

function isNumber(v: unknown): v is number {
  return typeof v === "number" && !Number.isNaN(v);
}

function isISO8601(v: unknown): boolean {
  return isString(v) && !Number.isNaN(Date.parse(v));
}

function isStringArray(v: unknown): v is string[] {
  return Array.isArray(v) && v.every(isString);
}

function isConfidence(v: unknown): boolean {
  return isNumber(v) && v >= 0 && v <= 1;
}

function isInEnum<T>(v: unknown, allowed: readonly T[]): v is T {
  return (allowed as readonly unknown[]).includes(v);
}

// ─── Base Validator ──────────────────────────────────────────

function hasTimestamped(obj: Record<string, unknown>): obj is Timestamped & Record<string, unknown> {
  return (
    isString(obj.id) &&
    isISO8601(obj.createdAt) &&
    isISO8601(obj.updatedAt) &&
    isString(obj.createdBy)
  );
}

// ─── Type-Specific Validators ────────────────────────────────

export function isResearchQuestion(v: unknown): v is ResearchQuestion {
  if (typeof v !== "object" || v === null) return false;
  const obj = v as Record<string, unknown>;
  return (
    hasTimestamped(obj) &&
    isString(obj.text) &&
    isString(obj.domain) &&
    isInEnum(obj.priority, PRIORITIES) &&
    (obj.decomposedFrom === null || isString(obj.decomposedFrom)) &&
    isInEnum(obj.status, ["open", "answered", "deferred"]) &&
    (obj.answerSummary === null || isString(obj.answerSummary)) &&
    isStringArray(obj.evidenceIds)
  );
}

export function isUserRequirement(v: unknown): v is UserRequirement {
  if (typeof v !== "object" || v === null) return false;
  const obj = v as Record<string, unknown>;
  return (
    hasTimestamped(obj) &&
    isString(obj.description) &&
    isInEnum(obj.category, ["functional", "non-functional", "constraint", "preference"]) &&
    isInEnum(obj.priority, PRIORITIES) &&
    isString(obj.source) &&
    isStringArray(obj.decomposedQuestions)
  );
}

export function isSourceDocument(v: unknown): v is SourceDocument {
  if (typeof v !== "object" || v === null) return false;
  const obj = v as Record<string, unknown>;
  return (
    hasTimestamped(obj) &&
    isString(obj.title) &&
    (obj.url === null || isString(obj.url)) &&
    (obj.filePath === null || isString(obj.filePath)) &&
    isISO8601(obj.retrievedAt) &&
    isInEnum(obj.provenance, PROVENANCES) &&
    isString(obj.domain) &&
    isString(obj.summary) &&
    isStringArray(obj.markers) &&
    isInEnum(obj.reliability, ["high", "medium", "low", "unknown"])
  );
}

export function isClaim(v: unknown): v is Claim {
  if (typeof v !== "object" || v === null) return false;
  const obj = v as Record<string, unknown>;
  return (
    hasTimestamped(obj) &&
    isString(obj.text) &&
    isString(obj.sourceId) &&
    isInEnum(obj.provenance, PROVENANCES) &&
    isConfidence(obj.confidence) &&
    isString(obj.domain) &&
    isStringArray(obj.contradictedBy) &&
    isStringArray(obj.supportedBy)
  );
}

export function isEvidence(v: unknown): v is Evidence {
  if (typeof v !== "object" || v === null) return false;
  const obj = v as Record<string, unknown>;
  return (
    hasTimestamped(obj) &&
    isString(obj.claim) &&
    isString(obj.sourceId) &&
    isInEnum(obj.provenance, PROVENANCES) &&
    isInEnum(obj.direction, ["supports", "contradicts", "neutral"]) &&
    isInEnum(obj.strength, ["strong", "moderate", "weak"]) &&
    (obj.quote === null || isString(obj.quote)) &&
    isString(obj.interpretation)
  );
}

export function isConstraint(v: unknown): v is Constraint {
  if (typeof v !== "object" || v === null) return false;
  const obj = v as Record<string, unknown>;
  return (
    hasTimestamped(obj) &&
    isString(obj.description) &&
    isInEnum(obj.type, ["technical", "business", "regulatory", "resource", "timeline"]) &&
    isInEnum(obj.severity, SEVERITIES) &&
    isString(obj.source) &&
    typeof obj.negotiable === "boolean" &&
    isString(obj.impactIfViolated)
  );
}

export function isTechnologyCandidate(v: unknown): v is TechnologyCandidate {
  if (typeof v !== "object" || v === null) return false;
  const obj = v as Record<string, unknown>;
  return (
    hasTimestamped(obj) &&
    isString(obj.name) &&
    isString(obj.category) &&
    (obj.version === null || isString(obj.version)) &&
    (obj.url === null || isString(obj.url)) &&
    (obj.license === null || isString(obj.license)) &&
    isInEnum(obj.maturity, ["experimental", "emerging", "stable", "mature", "legacy"]) &&
    isStringArray(obj.evidenceIds) &&
    isStringArray(obj.strengths) &&
    isStringArray(obj.weaknesses) &&
    isStringArray(obj.constraintIds)
  );
}

export function isArchitectureOption(v: unknown): v is ArchitectureOption {
  if (typeof v !== "object" || v === null) return false;
  const obj = v as Record<string, unknown>;
  return (
    hasTimestamped(obj) &&
    isString(obj.name) &&
    isString(obj.description) &&
    isStringArray(obj.technologyIds) &&
    (obj.diagram === null || isString(obj.diagram)) &&
    Array.isArray(obj.tradeoffs) &&
    isStringArray(obj.constraintIds) &&
    isStringArray(obj.riskIds) &&
    isInEnum(obj.implementationDifficulty, DIFFICULTY_RANGE) &&
    (obj.estimatedTimeline === null || isString(obj.estimatedTimeline))
  );
}

export function isHypothesis(v: unknown): v is Hypothesis {
  if (typeof v !== "object" || v === null) return false;
  const obj = v as Record<string, unknown>;
  return (
    hasTimestamped(obj) &&
    isString(obj.statement) &&
    isString(obj.domain) &&
    isStringArray(obj.supportingEvidenceIds) &&
    isStringArray(obj.contradictingEvidenceIds) &&
    isStringArray(obj.testCriteria) &&
    isInEnum(obj.status, ["proposed", "testing", "supported", "refuted", "inconclusive"]) &&
    isConfidence(obj.confidence) &&
    isStringArray(obj.architectureImplications)
  );
}

export function isSimulationRun(v: unknown): v is SimulationRun {
  if (typeof v !== "object" || v === null) return false;
  const obj = v as Record<string, unknown>;
  return (
    hasTimestamped(obj) &&
    isString(obj.hypothesisId) &&
    isStringArray(obj.scenarioIds) &&
    typeof obj.parameters === "object" &&
    isString(obj.result) &&
    isNumber(obj.round) &&
    obj.round >= 1 &&
    isStringArray(obj.contradictionsFound) &&
    isStringArray(obj.evidenceGaps) &&
    isStringArray(obj.nextActions)
  );
}

export function isScenario(v: unknown): v is Scenario {
  if (typeof v !== "object" || v === null) return false;
  const obj = v as Record<string, unknown>;
  return (
    hasTimestamped(obj) &&
    isInEnum(obj.type, SCENARIO_TYPES) &&
    isString(obj.name) &&
    isString(obj.description) &&
    isStringArray(obj.assumptions) &&
    isStringArray(obj.evidenceBaseIds) &&
    isStringArray(obj.contradictions) &&
    isStringArray(obj.architectureImplications) &&
    isInEnum(obj.implementationDifficulty, DIFFICULTY_RANGE) &&
    isStringArray(obj.deploymentImplications) &&
    isStringArray(obj.governanceImplications) &&
    isStringArray(obj.safetyImplications) &&
    isStringArray(obj.recommendedActions) &&
    (obj.simulationRunId === null || isString(obj.simulationRunId))
  );
}

export function isRisk(v: unknown): v is Risk {
  if (typeof v !== "object" || v === null) return false;
  const obj = v as Record<string, unknown>;
  return (
    hasTimestamped(obj) &&
    isString(obj.title) &&
    isString(obj.description) &&
    isInEnum(obj.severity, SEVERITIES) &&
    isInEnum(obj.likelihood, ["certain", "likely", "possible", "unlikely", "rare"]) &&
    isInEnum(obj.category, ["technical", "security", "governance", "operational", "strategic"]) &&
    isStringArray(obj.mitigations) &&
    isStringArray(obj.scenarioIds) &&
    (obj.residualRisk === null || isString(obj.residualRisk)) &&
    (obj.owner === null || isString(obj.owner))
  );
}

export function isDecisionRecommendation(v: unknown): v is DecisionRecommendation {
  if (typeof v !== "object" || v === null) return false;
  const obj = v as Record<string, unknown>;
  return (
    hasTimestamped(obj) &&
    isString(obj.question) &&
    isString(obj.recommendedOptionId) &&
    Array.isArray(obj.alternatives) &&
    isConfidence(obj.confidence) &&
    isString(obj.evidenceSummary) &&
    isStringArray(obj.riskIds) &&
    isStringArray(obj.whatWouldChangeDecision) &&
    isStringArray(obj.nextExperimentIds)
  );
}

export function isNextExperiment(v: unknown): v is NextExperiment {
  if (typeof v !== "object" || v === null) return false;
  const obj = v as Record<string, unknown>;
  return (
    hasTimestamped(obj) &&
    isString(obj.title) &&
    isString(obj.objective) &&
    isString(obj.hypothesis) &&
    isString(obj.method) &&
    isString(obj.expectedOutcome) &&
    isInEnum(obj.priority, PRIORITIES) &&
    isStringArray(obj.prerequisiteIds) &&
    isString(obj.estimatedEffort) &&
    isInEnum(obj.status, ["proposed", "in-progress", "completed", "abandoned"]) &&
    (obj.result === null || isString(obj.result))
  );
}

export function isOntologyObject(v: unknown): v is OntologyObject {
  if (typeof v !== "object" || v === null) return false;
  const obj = v as Record<string, unknown>;
  return (
    hasTimestamped(obj) &&
    isString(obj.name) &&
    isInEnum(obj.ontologyType, [
      "object-type", "property", "shared-property", "value-type",
      "link-type", "interface", "action-type", "function",
    ]) &&
    isInEnum(obj.domain, ["data", "logic", "action", "security", "cross-cutting"]) &&
    isString(obj.description) &&
    isInEnum(obj.provenance, PROVENANCES) &&
    isStringArray(obj.evidenceIds) &&
    isStringArray(obj.relatedObjectIds)
  );
}

// ─── Aggregate Validator ─────────────────────────────────────

export type ValidatorMap = {
  ResearchQuestion: typeof isResearchQuestion;
  UserRequirement: typeof isUserRequirement;
  SourceDocument: typeof isSourceDocument;
  Claim: typeof isClaim;
  Evidence: typeof isEvidence;
  Constraint: typeof isConstraint;
  TechnologyCandidate: typeof isTechnologyCandidate;
  ArchitectureOption: typeof isArchitectureOption;
  Hypothesis: typeof isHypothesis;
  SimulationRun: typeof isSimulationRun;
  Scenario: typeof isScenario;
  Risk: typeof isRisk;
  DecisionRecommendation: typeof isDecisionRecommendation;
  NextExperiment: typeof isNextExperiment;
  OntologyObject: typeof isOntologyObject;
};

export const validators: ValidatorMap = {
  ResearchQuestion: isResearchQuestion,
  UserRequirement: isUserRequirement,
  SourceDocument: isSourceDocument,
  Claim: isClaim,
  Evidence: isEvidence,
  Constraint: isConstraint,
  TechnologyCandidate: isTechnologyCandidate,
  ArchitectureOption: isArchitectureOption,
  Hypothesis: isHypothesis,
  SimulationRun: isSimulationRun,
  Scenario: isScenario,
  Risk: isRisk,
  DecisionRecommendation: isDecisionRecommendation,
  NextExperiment: isNextExperiment,
  OntologyObject: isOntologyObject,
};

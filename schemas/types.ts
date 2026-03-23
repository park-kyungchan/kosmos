/**
 * Kosmos Research OS — Core Type Vocabulary
 *
 * 14 domain types covering the full research-to-decision pipeline.
 * Organized by pipeline stage:
 *   Intake:    ResearchQuestion, UserRequirement
 *   Evidence:  SourceDocument, Claim, Evidence, Constraint
 *   Reasoning: TechnologyCandidate, ArchitectureOption, Hypothesis
 *   Simulation: SimulationRun, Scenario
 *   Decision:  Risk, DecisionRecommendation, NextExperiment
 */

// ─── Shared Types ────────────────────────────────────────────

export type Provenance = "official" | "synthesis" | "inference";
export type Severity = "critical" | "high" | "medium" | "low";
export type Priority = "p0" | "p1" | "p2" | "p3";

export type OntologyDomain =
  | "data"
  | "logic"
  | "action"
  | "security"
  | "cross-cutting";

export interface Timestamped {
  id: string;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  createdBy: string; // agent name
}

// ─── Stage 1: Intake ─────────────────────────────────────────

export interface ResearchQuestion extends Timestamped {
  text: string;
  domain: string;
  priority: Priority;
  decomposedFrom: string | null; // parent question ID
  status: "open" | "answered" | "deferred";
  answerSummary: string | null;
  evidenceIds: string[];
}

export interface UserRequirement extends Timestamped {
  description: string;
  category: "functional" | "non-functional" | "constraint" | "preference";
  priority: Priority;
  source: string; // who stated this
  decomposedQuestions: string[]; // ResearchQuestion IDs
}

// ─── Stage 2-3: Evidence ─────────────────────────────────────

export interface SourceDocument extends Timestamped {
  title: string;
  url: string | null;
  filePath: string | null; // for internal research library sources
  retrievedAt: string; // ISO 8601
  provenance: Provenance;
  domain: string;
  summary: string;
  markers: string[]; // grep-visible markers (e.g., "§LOGIC.FN-15")
  reliability: "high" | "medium" | "low" | "unknown";
}

export interface Claim extends Timestamped {
  text: string;
  sourceId: string; // SourceDocument ID
  provenance: Provenance;
  confidence: number; // 0.0 - 1.0
  domain: string;
  contradictedBy: string[]; // other Claim IDs
  supportedBy: string[]; // Evidence IDs
}

export interface Evidence extends Timestamped {
  claim: string; // what this evidence supports or contradicts
  sourceId: string; // SourceDocument ID
  provenance: Provenance;
  direction: "supports" | "contradicts" | "neutral";
  strength: "strong" | "moderate" | "weak";
  quote: string | null; // direct quote if available
  interpretation: string;
}

export interface Constraint extends Timestamped {
  description: string;
  type: "technical" | "business" | "regulatory" | "resource" | "timeline";
  severity: Severity;
  source: string;
  negotiable: boolean;
  impactIfViolated: string;
}

// ─── Stage 4-5: Reasoning ────────────────────────────────────

export interface TechnologyCandidate extends Timestamped {
  name: string;
  category: string; // e.g., "3D engine", "deployment platform", "framework"
  version: string | null;
  url: string | null;
  license: string | null;
  maturity: "experimental" | "emerging" | "stable" | "mature" | "legacy";
  evidenceIds: string[];
  strengths: string[];
  weaknesses: string[];
  constraintIds: string[]; // Constraint IDs
}

export interface ArchitectureOption extends Timestamped {
  name: string;
  description: string;
  technologyIds: string[]; // TechnologyCandidate IDs
  diagram: string | null; // mermaid or ASCII diagram
  tradeoffs: TradeoffDimension[];
  constraintIds: string[];
  riskIds: string[];
  implementationDifficulty: 1 | 2 | 3 | 4 | 5;
  estimatedTimeline: string | null;
}

export interface TradeoffDimension {
  dimension: string;
  rating: number; // 1-5
  rationale: string;
}

export interface Hypothesis extends Timestamped {
  statement: string;
  domain: string;
  supportingEvidenceIds: string[];
  contradictingEvidenceIds: string[];
  testCriteria: string[];
  status: "proposed" | "testing" | "supported" | "refuted" | "inconclusive";
  confidence: number; // 0.0 - 1.0
  architectureImplications: string[];
}

// ─── Stage 6: Simulation ─────────────────────────────────────

export interface SimulationRun extends Timestamped {
  hypothesisId: string;
  scenarioIds: string[];
  parameters: Record<string, unknown>;
  result: string;
  round: number; // revision round (>= 1)
  contradictionsFound: string[];
  evidenceGaps: string[];
  nextActions: string[];
}

export type ScenarioType = "base" | "best" | "worst" | "adversarial";

export interface Scenario extends Timestamped {
  type: ScenarioType;
  name: string;
  description: string;
  assumptions: string[];
  evidenceBaseIds: string[]; // Evidence IDs
  contradictions: string[];
  architectureImplications: string[];
  implementationDifficulty: 1 | 2 | 3 | 4 | 5;
  deploymentImplications: string[];
  governanceImplications: string[];
  safetyImplications: string[];
  recommendedActions: string[];
  simulationRunId: string | null;
}

// ─── Stage 7: Decision ───────────────────────────────────────

export interface Risk extends Timestamped {
  title: string;
  description: string;
  severity: Severity;
  likelihood: "certain" | "likely" | "possible" | "unlikely" | "rare";
  category: "technical" | "security" | "governance" | "operational" | "strategic";
  mitigations: string[];
  scenarioIds: string[];
  residualRisk: string | null;
  owner: string | null;
}

export interface DecisionRecommendation extends Timestamped {
  question: string;
  recommendedOptionId: string; // ArchitectureOption ID
  alternatives: AlternativeOption[];
  confidence: number; // 0.0 - 1.0
  evidenceSummary: string;
  riskIds: string[];
  whatWouldChangeDecision: string[];
  nextExperimentIds: string[];
}

export interface AlternativeOption {
  optionId: string;
  whyNot: string;
}

export interface NextExperiment extends Timestamped {
  title: string;
  objective: string;
  hypothesis: string; // what we're testing
  method: string;
  expectedOutcome: string;
  priority: Priority;
  prerequisiteIds: string[]; // other NextExperiment IDs
  estimatedEffort: string;
  status: "proposed" | "in-progress" | "completed" | "abandoned";
  result: string | null;
}

// ─── Ontology Mapping Types ──────────────────────────────────

export interface OntologyObject extends Timestamped {
  name: string;
  ontologyType:
    | "object-type"
    | "property"
    | "shared-property"
    | "value-type"
    | "link-type"
    | "interface"
    | "action-type"
    | "function";
  domain: OntologyDomain;
  description: string;
  provenance: Provenance;
  evidenceIds: string[];
  relatedObjectIds: string[];
}

// ─── Session State ───────────────────────────────────────────

export interface SessionState {
  id: string;
  objective: string | null;
  startedAt: string; // ISO 8601
  stage: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  questionsCount: number;
  sourcesCount: number;
  claimsCount: number;
  hypothesesCount: number;
  scenariosCount: number;
}

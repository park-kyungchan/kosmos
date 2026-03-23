/**
 * Kosmos Research OS — Schema Public API
 *
 * Re-exports all types and validators for external consumption.
 */

// All 14 core types + supporting types
export type {
  // Shared
  Provenance,
  Severity,
  Priority,
  OntologyDomain,
  SourceTier,
  ContradictionStatus,
  EvidenceSufficiency,
  FreshnessStatus,
  Timestamped,
  // Stage 1: Intake
  ResearchQuestion,
  UserRequirement,
  // Stage 2-3: Evidence
  SourceDocument,
  Claim,
  Evidence,
  Constraint,
  // Stage 4-5: Reasoning
  TechnologyCandidate,
  ArchitectureOption,
  TradeoffDimension,
  Hypothesis,
  // Stage 6: Simulation
  SimulationRun,
  ScenarioType,
  Scenario,
  EvaluationScore,
  RevisionRound,
  // Stage 7: Decision
  Risk,
  DecisionRecommendation,
  AlternativeOption,
  NextExperiment,
  // Ontology mapping
  OntologyObject,
  SessionState,
} from "./types.ts";

// All validators
export {
  isResearchQuestion,
  isUserRequirement,
  isSourceDocument,
  isClaim,
  isEvidence,
  isConstraint,
  isTechnologyCandidate,
  isArchitectureOption,
  isHypothesis,
  isSimulationRun,
  isScenario,
  isRisk,
  isDecisionRecommendation,
  isNextExperiment,
  isOntologyObject,
  isRevisionRound,
  isCompleteRecommendation,
  isScenarioReportReady,
  validators,
} from "./validators.ts";

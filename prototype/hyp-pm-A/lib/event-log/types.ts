// EventEnvelope discriminated union — 3 variants for PoC
// Full 10-variant schema: palantir-mini-blueprint.md Gap fill 1
// Domain: DATA (prim-data-01 EventEnvelope)

type EventId   = string & { readonly __brand: "EventId" };
type SessionId = string & { readonly __brand: "SessionId" };
type CommitSha = string & { readonly __brand: "CommitSha" };

export interface EventEnvelopeBase {
  eventId:     EventId;
  when:        string;       // ISO8601 — WHEN dimension (Decision Lineage 5-dim)
  atopWhich:   CommitSha;   // git HEAD SHA — ATOP_WHICH dimension
  throughWhich: {            // THROUGH_WHICH dimension
    sessionId: SessionId;
    toolName:  string;
    cwd:       string;
  };
  byWhom: {                  // BY_WHOM dimension
    identity:   string;
    agentName?: string;
    teamName?:  string;
  };
  withWhat?: {               // WITH_WHAT dimension (optional)
    reasoning?:  string;
    hypothesis?: string;
  };
  sequence: number;          // monotonic counter — optimistic version vector (gap-01 resolution)
}

// Variant 1: edit_proposed — an EditFunction returned hypothetical edits (LOGIC domain emits this)
export type EditProposedEnvelope = EventEnvelopeBase & {
  type: "edit_proposed";
  payload: {
    functionName:      string;
    params:            unknown;
    hypotheticalEdits: unknown[];
  };
};

// Variant 2: edit_committed — AtomicCommit ACTION applied edits to state
export type EditCommittedEnvelope = EventEnvelopeBase & {
  type: "edit_committed";
  payload: {
    actionTypeRid:            string;
    appliedEdits:             unknown[];
    submissionCriteriaPassed: string[];
  };
};

// Variant 3: session_started — Anthropic Managed Agents Session opened
export type SessionStartedEnvelope = EventEnvelopeBase & {
  type: "session_started";
  payload: {
    model:  string;
    effort: string;
  };
};

// Discriminated union — OCP: new variants extend without modifying existing
export type EventEnvelope =
  | EditProposedEnvelope
  | EditCommittedEnvelope
  | SessionStartedEnvelope;

// Type guard helpers — PECS: consumer uses super type via exhaustive visitor
export function isEditProposed(e: EventEnvelope): e is EditProposedEnvelope {
  return e.type === "edit_proposed";
}
export function isEditCommitted(e: EventEnvelope): e is EditCommittedEnvelope {
  return e.type === "edit_committed";
}
export function isSessionStarted(e: EventEnvelope): e is SessionStartedEnvelope {
  return e.type === "session_started";
}

// Snapshot type produced by foldToSnapshot
export interface EventSnapshot {
  edit_proposed:   number;
  edit_committed:  number;
  session_started: number;
  totalEvents:     number;
  lastSequence:    number;
}

# Ontology Mapping Rules

## Core Principle

Every research finding MUST be mapped to an ontology concept before it
can be used in hypothesis generation or scenario simulation. Unmapped
findings are invisible to the reasoning pipeline.

## The D/L/A Classification

Every concept belongs to exactly one domain:

| Domain | Question | Examples |
|--------|----------|---------|
| **DATA** | Does this describe WHAT EXISTS? | Entities, properties, value types |
| **LOGIC** | Does this describe HOW TO REASON? | Links, interfaces, derived props, functions |
| **ACTION** | Does this CHANGE REALITY? | Mutations, webhooks, automations |

### Semantic Heuristics (from schemas/ontology/semantics.ts)

**SH-01: EXISTS vs REASON vs CHANGE**
The core tiebreaker. Ask all three questions — the concept must satisfy
exactly one.

**SH-02: Deletion Test**
"If I deleted all LOGIC and ACTION, would this still describe reality?"
If yes → DATA. If no → LOGIC or ACTION.

**SH-03: Edits[] vs Commit**
"Does this RETURN Edits[] or COMMIT edits?"
Returns Edits[] → LOGIC (describes change without executing).
Commits edits → ACTION (executes the change).

## Concept Type Mapping

### From Research Findings to Ontology

| Finding Type | Maps To | Domain |
|-------------|---------|--------|
| A new entity/thing discovered | Object Type | DATA |
| An attribute of an entity | Property | DATA |
| A constrained value format | Value Type | DATA |
| A relationship between entities | Link Type | LOGIC |
| A shared contract across types | Interface | LOGIC |
| A computation or derivation | Function | LOGIC |
| An operation that changes state | Action Type | ACTION |
| An access control concern | Security Policy | SECURITY |

### From Technology Candidates to Ontology

| Technology Aspect | Maps To | Example |
|------------------|---------|---------|
| The tool itself | Object Type (DATA) | "Three.js is a 3D rendering library" |
| Tool capabilities | Properties (DATA) | "supports WebGL 2.0, WebGPU" |
| How tools interact | Link Types (LOGIC) | "Three.js renders scenes from React" |
| Tool APIs | Functions (LOGIC) | "scene.add(mesh) computes render graph" |
| Deployment operations | Action Types (ACTION) | "vercel deploy publishes to edge" |

### From Scenarios to Ontology

| Scenario Element | Maps To | Domain |
|-----------------|---------|--------|
| Assumed entity | Object Type | DATA |
| Assumed relationship | Link Type | LOGIC |
| Assumed behavior | Function | LOGIC |
| Proposed action | Action Type | ACTION |
| Risk condition | Security/Governance | SECURITY |

## Transition Zones

These concepts feel DATA-like but belong to LOGIC (per BROWSE.md):

| Concept | Why LOGIC |
|---------|-----------|
| **Link Type** | Enables reasoning/traversal between objects |
| **Interface** | Defines connection polymorphism, not entity definition |
| **Query/ObjectSet** | Graph traversal for reasoning, not API schema |
| **DerivedProperty** | Computation/interpretation, not raw data |

If you're about to put one of these in DATA, stop and reconsider.

## World Model Update Protocol

### Adding New Objects

1. Check for duplicates: does this concept already exist in world-model.json?
2. If new: create OntologyObject with all required fields
3. If existing: update properties, add new evidence IDs
4. Always: increment version, update lastUpdated timestamp

### Required Fields

Every OntologyObject must have:
- `id`: unique identifier (format: `obj-{type}-{sequential}`)
- `name`: human-readable name
- `ontologyType`: one of the 8 concept types
- `domain`: D/L/A/security/cross-cutting
- `provenance`: official/synthesis/inference
- `evidenceIds`: at least one Evidence ID
- `description`: what this concept represents

### Referential Integrity

- Every `evidenceId` must exist in source-map.json
- Every `relatedObjectId` must exist in world-model.json
- No orphaned references allowed

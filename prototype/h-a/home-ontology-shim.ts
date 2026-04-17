/**
 * home-ontology-shim — ~/ontology/ shared-core namespace prototype
 *
 * Demonstrates the ForwardProp authority chain repair (WMO-031):
 *   ~/.claude/schemas/ontology/primitives/   (v0.2 canonical source)
 *       |
 *   ~/ontology/index.ts  (this shim — future home-repo shared core)
 *       |
 *   ~/palantir-math/ontology/  and  ~/mathcrew/ontology/
 *
 * Per-project consumers import SharedCore.* instead of importing from
 * ~/.claude/schemas directly. This makes the home-repo the authority layer
 * between the schema package and per-project namespaces, repairing the
 * broken ForwardProp chain (OBS-05, WMO-031 healthStatus=broken).
 *
 * D/L/A domain: LOGIC (this is a re-export / traversal namespace — per SH-01
 * "delete this file, do objects still describe reality?" YES → LOGIC)
 */

// Re-export v0.2 primitives as SharedCore namespace
export type {
  ObjectTypeRid,
  ObjectTypeDeclaration,
  ObjectTypeRegistry,
} from "/home/palantirkc/.claude/schemas/ontology/primitives/object-type.ts";

export {
  objectTypeRid,
  OBJECT_TYPE_REGISTRY,
} from "/home/palantirkc/.claude/schemas/ontology/primitives/object-type.ts";

export type {
  LinkTypeRid,
  LinkTypeDeclaration,
  PlainLinkTypeDeclaration,
  ObjectBackedLinkTypeDeclaration,
  Cardinality,
} from "/home/palantirkc/.claude/schemas/ontology/primitives/link-type.ts";

export {
  linkTypeRid,
  LINK_TYPE_REGISTRY,
} from "/home/palantirkc/.claude/schemas/ontology/primitives/link-type.ts";

// Re-export v1.0 additive primitives (Struct + ValueType)
export type {
  StructRid,
  StructDeclaration,
  StructFieldDeclaration,
} from "./struct.ts";

export {
  structRid,
  STRUCT_REGISTRY,
  StructRegistry,
} from "./struct.ts";

export type {
  ValueTypeRid,
  ValueTypeDeclaration,
  ValueTypeConstraint,
  BaseScalarType,
} from "./value-type.ts";

export {
  valueTypeRid,
  VALUE_TYPE_REGISTRY,
  ValueTypeRegistry,
} from "./value-type.ts";

/**
 * SharedCore namespace — the single import surface for per-project ontology/.
 *
 * Usage in ~/palantir-math/ontology/math-objects.ts:
 *   import * as SharedCore from "~/ontology/index.ts";
 *   const myObj: SharedCore.ObjectTypeDeclaration = { ... };
 *
 * Usage in ~/mathcrew/ontology/theater-objects.ts:
 *   import * as SharedCore from "~/ontology/index.ts";
 *   const beat: SharedCore.ObjectTypeDeclaration = { ... };
 */
export const SHARED_CORE_VERSION = "1.0.0-prototype";

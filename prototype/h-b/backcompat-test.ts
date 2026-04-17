/**
 * H-B PoC: backcompat-test — v0.2 + v0.3 coexistence in one consumer file
 *
 * Validates claim: "Additive primitives coexist with v0.2 primitives in the
 * same consumer code without TypeScript conflict."
 *
 * A consumer project pinned to 0.2.x continues to import ObjectType + LinkType
 * from their existing paths unchanged. A consumer upgrading to 0.3.x can also
 * import Struct + ValueType from the additive file — both compile in the same
 * module without conflict.
 */

// v0.2 imports (unchanged — simulates existing consumer code)
import {
  objectTypeRid,
  OBJECT_TYPE_REGISTRY,
  type ObjectTypeDeclaration,
} from "/home/palantirkc/.claude/schemas/ontology/primitives/object-type.ts";

import {
  linkTypeRid,
  LINK_TYPE_REGISTRY,
  type PlainLinkTypeDeclaration,
} from "/home/palantirkc/.claude/schemas/ontology/primitives/link-type.ts";

// v0.3 imports (new — no conflict with v0.2 exports above)
import {
  structRid,
  STRUCT_REGISTRY_V3,
  type StructDeclaration,
} from "./struct-additive.ts";

import {
  valueTypeRid,
  VALUE_TYPE_REGISTRY_V3,
  type ValueTypeDeclaration,
} from "./value-type-additive.ts";

// --- v0.2 usage (unchanged consumer pattern) ---
const EMPLOYEE_RID = objectTypeRid("ri.ontology.main.object-type.employee");
const employeeDecl: ObjectTypeDeclaration = {
  rid: EMPLOYEE_RID,
  name: "Employee",
  properties: [{ name: "name", type: "string" }],
};
OBJECT_TYPE_REGISTRY.register(employeeDecl);

const DEPT_RID = objectTypeRid("ri.ontology.main.object-type.department");
OBJECT_TYPE_REGISTRY.register({
  rid: DEPT_RID,
  name: "Department",
  properties: [{ name: "deptName", type: "string" }],
});

const MEMBER_LINK_RID = linkTypeRid("ri.ontology.main.link-type.member-of");
const memberLink: PlainLinkTypeDeclaration = {
  kind: "plain",
  rid: MEMBER_LINK_RID,
  name: "MemberOf",
  src: EMPLOYEE_RID,
  dst: DEPT_RID,
  srcCardinality: "many",
  dstCardinality: "one",
};
LINK_TYPE_REGISTRY.register(memberLink);

// --- v0.3 usage (new consumer additions — no conflict) ---
const ADDRESS_RID = structRid("ri.ontology.main.struct.address");
const addressDecl: StructDeclaration = {
  rid: ADDRESS_RID,
  name: "Address",
  fields: [{ name: "street", type: "string" }, { name: "city", type: "string" }],
  schemaVersion: "0.3.x",
};
STRUCT_REGISTRY_V3.register(addressDecl);

const CURRENCY_RID = valueTypeRid("ri.ontology.main.value-type.currency");
const currencyDecl: ValueTypeDeclaration = {
  rid: CURRENCY_RID,
  name: "Currency",
  baseType: "string",
  constraints: [{ kind: "enum", value: ["USD", "EUR", "KRW"] }],
  schemaVersion: "0.3.x",
};
VALUE_TYPE_REGISTRY_V3.register(currencyDecl);

// --- Backcompat verification ---
const emp = OBJECT_TYPE_REGISTRY.get(EMPLOYEE_RID);
const addr = STRUCT_REGISTRY_V3.get(ADDRESS_RID);
const curr = VALUE_TYPE_REGISTRY_V3.get(CURRENCY_RID);

if (!emp || !addr || !curr) {
  throw new Error("Backcompat test: registry lookup failed");
}

console.log("H-B PoC: v0.2 + v0.3 coexistence validated");
console.log(`  v0.2 ObjectType: ${emp.name}`);
console.log(`  v0.3 Struct:     ${addr.name} (schemaVersion=${addr.schemaVersion})`);
console.log(`  v0.3 ValueType:  ${curr.name} (schemaVersion=${curr.schemaVersion})`);

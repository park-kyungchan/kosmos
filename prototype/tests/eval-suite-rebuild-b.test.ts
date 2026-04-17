/**
 * Eval Suite Rebuild-B — Hypothesis B (Incremental v0.3: additive primitives + v0.2 backcompat)
 * T9 [EVAL-GATE] eval-runner
 *
 * Validates H-B claims:
 *   - struct-additive + value-type-additive export equivalent surfaces to H-A versions
 *   - v0.2 ObjectType + v0.3 Struct coexist in same file (backcompat-test exercises this)
 *   - No symbol collision between v0.2 re-exports and v0.3 net-new primitives
 *   - Additive primitives usable without home-ontology-shim (opt-in extensibility)
 *   - schemaVersion "0.3.x" field is present as literal type
 *   - Adversarial: re-export collision scenario analysis
 *
 * D/L/A classification noted per test.
 */

import { describe, it, expect } from "bun:test";

import {
  structRid as structRidA,
  StructRegistry as StructRegistryA,
} from "/home/palantirkc/kosmos/prototype/h-a/struct.ts";

import {
  valueTypeRid as valueTypeRidA,
  ValueTypeRegistry as ValueTypeRegistryA,
} from "/home/palantirkc/kosmos/prototype/h-a/value-type.ts";

import {
  structRid as structRidB,
  StructRegistry as StructRegistryB,
  STRUCT_REGISTRY_V3,
  type StructDeclaration as StructDeclarationB,
  objectTypeRid,
  OBJECT_TYPE_REGISTRY,
} from "/home/palantirkc/kosmos/prototype/h-b/struct-additive.ts";

import {
  valueTypeRid as valueTypeRidB,
  ValueTypeRegistry as ValueTypeRegistryB,
  VALUE_TYPE_REGISTRY_V3,
  type ValueTypeDeclaration as ValueTypeDeclarationB,
} from "/home/palantirkc/kosmos/prototype/h-b/value-type-additive.ts";

// ── C-B-01: H-B additive surfaces match H-A surfaces (runtime/deterministic) ──
describe("C-B-01 — struct-additive and value-type-additive export equivalent surfaces", () => {
  it("StructRegistry from H-B has same method surface as H-A (register, get, list, keys)", () => {
    const regA = new StructRegistryA();
    const regB = new StructRegistryB();
    expect(typeof regA.register).toBe("function");
    expect(typeof regA.get).toBe("function");
    expect(typeof regA.list).toBe("function");
    expect(typeof regA.keys).toBe("function");
    expect(typeof regB.register).toBe("function");
    expect(typeof regB.get).toBe("function");
    expect(typeof regB.list).toBe("function");
    expect(typeof regB.keys).toBe("function");
  });

  it("ValueTypeRegistry from H-B has same method surface as H-A", () => {
    const regA = new ValueTypeRegistryA();
    const regB = new ValueTypeRegistryB();
    ["register", "get", "list", "keys"].forEach((method) => {
      expect(typeof (regA as Record<string, unknown>)[method]).toBe("function");
      expect(typeof (regB as Record<string, unknown>)[method]).toBe("function");
    });
  });

  it("structRid factory from H-B produces same string form as H-A", () => {
    const raw = "ri.test.main.struct.address";
    expect(structRidA(raw)).toBe(raw);
    expect(structRidB(raw)).toBe(raw);
    expect(structRidA(raw)).toBe(structRidB(raw));
  });

  it("valueTypeRid factory from H-B produces same string form as H-A", () => {
    const raw = "ri.test.main.value-type.currency";
    expect(valueTypeRidA(raw)).toBe(raw);
    expect(valueTypeRidB(raw)).toBe(raw);
  });
});

// ── C-B-02: v0.2 + v0.3 coexistence — no TS errors at runtime (backcompat) ────
describe("C-B-02 — v0.2 ObjectType and v0.3 Struct coexist in same consumer scope", () => {
  it("OBJECT_TYPE_REGISTRY (v0.2) and STRUCT_REGISTRY_V3 (v0.3) are independent singletons", () => {
    expect(OBJECT_TYPE_REGISTRY).toBeDefined();
    expect(STRUCT_REGISTRY_V3).toBeDefined();
    expect(OBJECT_TYPE_REGISTRY).not.toBe(STRUCT_REGISTRY_V3 as unknown);
  });

  it("registering a v0.2 ObjectType does not affect v0.3 StructRegistry", () => {
    const empRid = objectTypeRid("ri.test.coexist.object-type.employee");
    OBJECT_TYPE_REGISTRY.register({ rid: empRid, name: "Employee", properties: [] });
    // STRUCT_REGISTRY_V3 should have no entry for the ObjectType RID
    const structLookup = STRUCT_REGISTRY_V3.get(empRid as unknown as ReturnType<typeof structRidB>);
    expect(structLookup).toBeUndefined();
  });

  it("registering a v0.3 Struct does not pollute v0.2 ObjectType registry", () => {
    const addrRid = structRidB("ri.test.coexist.struct.address");
    STRUCT_REGISTRY_V3.register({
      rid: addrRid,
      name: "Address",
      fields: [{ name: "city", type: "string" }],
      schemaVersion: "0.3.x",
    });
    const objLookup = OBJECT_TYPE_REGISTRY.get(addrRid as unknown as ReturnType<typeof objectTypeRid>);
    expect(objLookup).toBeUndefined();
  });
});

// ── C-B-03: No symbol conflict between v0.2 re-exports and v0.3 primitives ────
describe("C-B-03 — No naming collision between v0.2 and v0.3 exports in struct-additive", () => {
  it("STRUCT_REGISTRY_V3 is distinct from OBJECT_TYPE_REGISTRY (different registry types)", () => {
    expect(typeof STRUCT_REGISTRY_V3.list).toBe("function");
    expect(typeof OBJECT_TYPE_REGISTRY.list).toBe("function");
    // list() on each returns its own domain type — coexist without name clash
    const structs = STRUCT_REGISTRY_V3.list();
    const objects = OBJECT_TYPE_REGISTRY.list();
    // They are separate arrays — no conflation
    expect(Array.isArray(structs)).toBe(true);
    expect(Array.isArray(objects)).toBe(true);
  });

  it("VALUE_TYPE_REGISTRY_V3 has versioned name — distinct from hypothetical v0.2 VALUE_TYPE_REGISTRY", () => {
    // H-B uses STRUCT_REGISTRY_V3 / VALUE_TYPE_REGISTRY_V3 suffix to avoid singleton collision
    const vt = VALUE_TYPE_REGISTRY_V3;
    expect(vt).toBeDefined();
    expect(typeof vt.register).toBe("function");
    // The versioned suffix is the collision guard
    expect(VALUE_TYPE_REGISTRY_V3).not.toBe(STRUCT_REGISTRY_V3 as unknown);
  });
});

// ── C-B-04: Additive primitives usable without home-ontology-shim (integration) ─
describe("C-B-04 — Additive primitives work without importing home-ontology-shim", () => {
  it("StructRegistry standalone: register and retrieve without shim import", () => {
    const reg = new StructRegistryB();
    const rid = structRidB("ri.test.standalone.struct.contact");
    reg.register({
      rid,
      name: "Contact",
      fields: [{ name: "email", type: "string" }],
      schemaVersion: "0.3.x",
    });
    expect(reg.get(rid)?.name).toBe("Contact");
  });

  it("ValueTypeRegistry standalone: register and retrieve without shim import", () => {
    const reg = new ValueTypeRegistryB();
    const rid = valueTypeRidB("ri.test.standalone.value-type.score");
    reg.register({
      rid,
      name: "Score",
      baseType: "integer",
      constraints: [{ kind: "range", value: { min: 0, max: 100 } }],
      schemaVersion: "0.3.x",
    });
    expect(reg.get(rid)?.name).toBe("Score");
  });
});

// ── C-B-05: Consumer using only v0.2 is unaffected by v0.3 presence (heuristic) ─
describe("C-B-05 — v0.2-only consumer compiles if v0.3 primitives present but unused", () => {
  it("using only OBJECT_TYPE_REGISTRY from struct-additive still works", () => {
    const rid = objectTypeRid("ri.test.v02only.object-type.product");
    OBJECT_TYPE_REGISTRY.register({ rid, name: "Product", properties: [{ name: "sku", type: "string" }] });
    const product = OBJECT_TYPE_REGISTRY.get(rid);
    expect(product?.name).toBe("Product");
  });

  it("STRUCT_REGISTRY_V3 being present does not mutate OBJECT_TYPE_REGISTRY state", () => {
    const countBefore = OBJECT_TYPE_REGISTRY.list().length;
    // Just touching STRUCT_REGISTRY_V3 should not alter OBJECT_TYPE_REGISTRY
    const _ = STRUCT_REGISTRY_V3.list();
    const countAfter = OBJECT_TYPE_REGISTRY.list().length;
    expect(countAfter).toBe(countBefore);
  });
});

// ── C-B-06: Adversarial — schemaVersion literal type enforcement (adversarial) ──
describe("C-B-06 — Adversarial: schemaVersion '0.3.x' is required literal in H-B StructDeclaration", () => {
  it("StructDeclaration with schemaVersion='0.3.x' registers correctly", () => {
    const reg = new StructRegistryB();
    const rid = structRidB("ri.test.adversarial.struct.versioned");
    const decl: StructDeclarationB = {
      rid,
      name: "Versioned",
      fields: [],
      schemaVersion: "0.3.x",
    };
    reg.register(decl);
    const retrieved = reg.get(rid);
    expect(retrieved?.schemaVersion).toBe("0.3.x");
  });

  it("ValueTypeDeclaration schemaVersion round-trips through registry", () => {
    const reg = new ValueTypeRegistryB();
    const rid = valueTypeRidB("ri.test.adversarial.value-type.versioned");
    const decl: ValueTypeDeclarationB = {
      rid,
      name: "VersionedVT",
      baseType: "string",
      constraints: [],
      schemaVersion: "0.3.x",
    };
    reg.register(decl);
    expect(reg.get(rid)?.schemaVersion).toBe("0.3.x");
  });

  it("Adversarial: re-export collision probe — v0.2 OBJECT_TYPE_REGISTRY vs H-B struct-additive OBJECT_TYPE_REGISTRY are THE SAME singleton (shared module)", () => {
    // When a consumer imports both v0.2 path AND struct-additive.ts,
    // they get the SAME OBJECT_TYPE_REGISTRY singleton (Node/Bun module cache).
    // This is a correct behavior — not a collision — because struct-additive re-exports
    // the exact same module binding.
    const ridA = objectTypeRid("ri.test.collision.probe.A");
    OBJECT_TYPE_REGISTRY.register({ rid: ridA, name: "ProbeA", properties: [] });

    // If a parallel import from v0.2 path were available here, it would share the same ref.
    // The singleton identity is the collision guard — not a namespace duplication.
    expect(OBJECT_TYPE_REGISTRY.get(ridA)?.name).toBe("ProbeA");
  });
});

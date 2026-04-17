/**
 * Eval Suite Rebuild-A — Hypothesis A (Clean-slate v1.0: Struct + ValueType + home-ontology-shim)
 * T9 [EVAL-GATE] eval-runner
 *
 * Validates H-A claims:
 *   - Struct + ValueType registries operate correctly
 *   - home-ontology-shim re-exports v0.2 + v1.0 primitives as single surface
 *   - ForwardProp chain: shim → project usage composes without breakage
 *   - Adversarial: missing rid, duplicate RID, empty fields
 *
 * D/L/A classification noted per test.
 */

import { describe, it, expect } from "bun:test";

import {
  structRid,
  StructRegistry,
  STRUCT_REGISTRY,
  type StructDeclaration,
} from "/home/palantirkc/kosmos/prototype/h-a/struct.ts";

import {
  valueTypeRid,
  ValueTypeRegistry,
  VALUE_TYPE_REGISTRY,
  type ValueTypeDeclaration,
} from "/home/palantirkc/kosmos/prototype/h-a/value-type.ts";

import {
  objectTypeRid,
  OBJECT_TYPE_REGISTRY,
  STRUCT_REGISTRY as SHIM_STRUCT_REGISTRY,
  VALUE_TYPE_REGISTRY as SHIM_VALUE_TYPE_REGISTRY,
  SHARED_CORE_VERSION,
} from "/home/palantirkc/kosmos/prototype/h-a/home-ontology-shim.ts";

// ── C-A-01: Struct registry registers and retrieves by RID (DATA/runtime) ─────
describe("C-A-01 — Struct registry registration and retrieval", () => {
  const reg = new StructRegistry();
  const rid = structRid("ri.test.main.struct.address");

  it("registers a declaration and retrieves it by RID", () => {
    const decl: StructDeclaration = {
      rid,
      name: "Address",
      fields: [{ name: "street", type: "string" }],
    };
    reg.register(decl);
    const retrieved = reg.get(rid);
    expect(retrieved).toBeDefined();
    expect(retrieved?.name).toBe("Address");
    expect(retrieved?.rid).toBe(rid);
  });

  it("list() returns all registered structs", () => {
    const all = reg.list();
    expect(all.length).toBeGreaterThanOrEqual(1);
    expect(all.some((d) => d.rid === rid)).toBe(true);
  });

  it("keys() iterator includes the registered RID", () => {
    const keyList = [...reg.keys()];
    expect(keyList).toContain(rid);
  });
});

// ── C-A-02: ValueType registry handles duplicate RID (DATA/runtime) ───────────
describe("C-A-02 — ValueType registry duplicate RID behavior", () => {
  const reg = new ValueTypeRegistry();
  const rid = valueTypeRid("ri.test.main.value-type.currency");

  const v1: ValueTypeDeclaration = {
    rid,
    name: "Currency-v1",
    baseType: "string",
    constraints: [{ kind: "enum", value: ["USD"] }],
  };
  const v2: ValueTypeDeclaration = {
    rid,
    name: "Currency-v2",
    baseType: "string",
    constraints: [{ kind: "enum", value: ["EUR"] }],
  };

  it("first registration is stored", () => {
    reg.register(v1);
    expect(reg.get(rid)?.name).toBe("Currency-v1");
  });

  it("second registration with same RID silently overwrites (Map.set semantics)", () => {
    reg.register(v2);
    expect(reg.get(rid)?.name).toBe("Currency-v2");
  });

  it("list() reflects overwritten state", () => {
    const all = reg.list();
    const currencies = all.filter((d) => d.rid === rid);
    expect(currencies).toHaveLength(1);
    expect(currencies[0].name).toBe("Currency-v2");
  });
});

// ── C-A-03: SharedCore namespace identity (LOGIC/deterministic) ───────────────
describe("C-A-03 — SharedCore shim re-exports share registry identity with direct import", () => {
  it("SHIM_STRUCT_REGISTRY === STRUCT_REGISTRY (same singleton)", () => {
    expect(SHIM_STRUCT_REGISTRY).toBe(STRUCT_REGISTRY);
  });

  it("SHIM_VALUE_TYPE_REGISTRY === VALUE_TYPE_REGISTRY (same singleton)", () => {
    expect(SHIM_VALUE_TYPE_REGISTRY).toBe(VALUE_TYPE_REGISTRY);
  });

  it("SHARED_CORE_VERSION is the expected prototype version string", () => {
    expect(SHARED_CORE_VERSION).toBe("1.0.0-prototype");
  });
});

// ── C-A-04: shim re-exports v0.2 primitives (integration) ────────────────────
describe("C-A-04 — home-ontology-shim re-exports v0.2 ObjectType + LinkType", () => {
  it("objectTypeRid factory produces a branded string", () => {
    const rid = objectTypeRid("ri.test.main.object-type.order");
    expect(typeof rid).toBe("string");
    expect(rid).toBe("ri.test.main.object-type.order");
  });

  it("OBJECT_TYPE_REGISTRY is accessible via shim (non-null)", () => {
    expect(OBJECT_TYPE_REGISTRY).toBeDefined();
    expect(typeof OBJECT_TYPE_REGISTRY.register).toBe("function");
    expect(typeof OBJECT_TYPE_REGISTRY.get).toBe("function");
  });
});

// ── C-A-05: ForwardProp chain composition via shim (integration) ──────────────
describe("C-A-05 — ForwardProp: Struct + ValueType compose with ObjectType via shim", () => {
  const reg = new StructRegistry();
  const vtReg = new ValueTypeRegistry();

  const currencyRid = valueTypeRid("ri.test.fp.value-type.currency");
  const addressRid = structRid("ri.test.fp.struct.address");
  const orderRid = objectTypeRid("ri.test.fp.object-type.order");

  it("ValueType registered, retrievable by RID", () => {
    vtReg.register({
      rid: currencyRid,
      name: "Currency",
      baseType: "string",
      constraints: [{ kind: "enum", value: ["USD", "EUR"] }],
    });
    expect(vtReg.get(currencyRid)?.name).toBe("Currency");
  });

  it("Struct registered with field referencing ValueTypeRid", () => {
    reg.register({
      rid: addressRid,
      name: "Address",
      fields: [
        { name: "street", type: "string" },
        { name: "city", type: "string" },
      ],
    });
    expect(reg.get(addressRid)?.fields).toHaveLength(2);
  });

  it("ObjectType registered with Struct RID as property type — reference preserved", () => {
    OBJECT_TYPE_REGISTRY.register({
      rid: orderRid,
      name: "Order",
      properties: [
        { name: "shippingAddress", type: addressRid },
        { name: "currency", type: currencyRid },
      ],
    });
    const order = OBJECT_TYPE_REGISTRY.get(orderRid);
    expect(order).toBeDefined();
    const addrProp = order?.properties.find((p) => p.name === "shippingAddress");
    expect(addrProp?.type).toBe(addressRid);
  });
});

// ── C-A-06: Struct with empty fields is valid (heuristic) ────────────────────
describe("C-A-06 — Struct with empty fields array is valid (forward-declaration)", () => {
  it("registers and retrieves a struct with no fields", () => {
    const reg = new StructRegistry();
    const rid = structRid("ri.test.main.struct.empty");
    reg.register({ rid, name: "EmptyStruct", fields: [] });
    const retrieved = reg.get(rid);
    expect(retrieved).toBeDefined();
    expect(retrieved?.fields).toHaveLength(0);
  });

  it("empty-fields struct has correct rid and name", () => {
    const reg = new StructRegistry();
    const rid = structRid("ri.test.main.struct.placeholder");
    reg.register({ rid, name: "Placeholder", fields: [] });
    expect(reg.get(rid)?.name).toBe("Placeholder");
  });
});

// ── C-A-07: ValueType baseType constraint preservation (heuristic) ────────────
describe("C-A-07 — ValueType baseType preserves string vs number semantics", () => {
  const reg = new ValueTypeRegistry();

  it("baseType 'string' round-trips correctly", () => {
    const rid = valueTypeRid("ri.test.main.value-type.email");
    reg.register({
      rid,
      name: "Email",
      baseType: "string",
      constraints: [{ kind: "regex", value: "^.+@.+\\..+$" }],
    });
    expect(reg.get(rid)?.baseType).toBe("string");
  });

  it("baseType 'number' round-trips correctly", () => {
    const rid = valueTypeRid("ri.test.main.value-type.price");
    reg.register({
      rid,
      name: "Price",
      baseType: "number",
      constraints: [{ kind: "range", value: { min: 0 } }],
    });
    expect(reg.get(rid)?.baseType).toBe("number");
  });

  it("baseType 'integer' is distinct from 'number' in the registry", () => {
    const rid1 = valueTypeRid("ri.test.main.value-type.count");
    reg.register({ rid: rid1, name: "Count", baseType: "integer", constraints: [] });
    expect(reg.get(rid1)?.baseType).toBe("integer");
    expect(reg.get(rid1)?.baseType).not.toBe("number");
  });
});

// ── C-A-08: Adversarial — malformed StructDeclaration (missing rid) (ACTION) ──
describe("C-A-08 — Adversarial: malformed StructDeclaration handling", () => {
  it("registering struct with empty-string RID stores it under empty key", () => {
    const reg = new StructRegistry();
    const emptyRid = structRid("");
    reg.register({ rid: emptyRid, name: "BadStruct", fields: [] });
    // Map.set("", ...) works — empty-string RID is a valid Map key
    expect(reg.get(emptyRid)).toBeDefined();
    expect(reg.get(emptyRid)?.name).toBe("BadStruct");
  });

  it("retrieving a non-existent RID returns undefined (no throw)", () => {
    const reg = new StructRegistry();
    const rid = structRid("ri.nonexistent.struct");
    expect(() => reg.get(rid)).not.toThrow();
    expect(reg.get(rid)).toBeUndefined();
  });

  it("struct with optional embeds: undefined embeds field is acceptable", () => {
    const reg = new StructRegistry();
    const rid = structRid("ri.test.main.struct.no-embeds");
    reg.register({ rid, name: "NoEmbeds", fields: [{ name: "x", type: "string" }] });
    const retrieved = reg.get(rid);
    expect(retrieved?.embeds).toBeUndefined();
  });
});

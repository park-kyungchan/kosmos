/**
 * H-A PoC: ForwardProp chain exercise
 *
 * Demonstrates: schemas primitives -> home-ontology-shim -> project usage.
 * Three registrations: Currency (ValueType), Address (Struct), Order (ObjectType
 * with Struct-typed shippingAddress field).
 *
 * Validates claim: "New Struct + ValueType primitives cleanly extend the
 * existing primitive layer pattern and exercise the ForwardProp chain."
 */

import {
  objectTypeRid,
  OBJECT_TYPE_REGISTRY,
  structRid,
  STRUCT_REGISTRY,
  valueTypeRid,
  VALUE_TYPE_REGISTRY,
} from "./home-ontology-shim.ts";

// --- ValueType: Currency ---
const CURRENCY_RID = valueTypeRid("ri.ontology.main.value-type.currency");
VALUE_TYPE_REGISTRY.register({
  rid: CURRENCY_RID,
  name: "Currency",
  description: "ISO-4217 three-letter currency code",
  baseType: "string",
  constraints: [
    { kind: "enum", value: ["USD", "EUR", "KRW", "JPY", "GBP"] },
    { kind: "length", value: { min: 3, max: 3 } },
  ],
});

// --- Struct: Address ---
const ADDRESS_RID = structRid("ri.ontology.main.struct.address");
STRUCT_REGISTRY.register({
  rid: ADDRESS_RID,
  name: "Address",
  description: "Postal mailing address",
  fields: [
    { name: "street", type: "string" },
    { name: "city", type: "string" },
    { name: "country", type: "string" },
    { name: "postalCode", type: "string", optional: true },
  ],
});

// --- ObjectType: Order ---
const ORDER_RID = objectTypeRid("ri.ontology.main.object-type.order");
OBJECT_TYPE_REGISTRY.register({
  rid: ORDER_RID,
  name: "Order",
  description: "A customer purchase order",
  properties: [
    { name: "orderId", type: "string" },
    { name: "totalAmount", type: "number" },
    // Struct reference by RID — codegen would expand this to the Address shape
    { name: "shippingAddress", type: ADDRESS_RID },
    // ValueType reference — codegen enforces ISO-4217 constraint
    { name: "currency", type: CURRENCY_RID },
  ],
});

// --- Verification: ForwardProp chain is exercised ---
const registeredOrder = OBJECT_TYPE_REGISTRY.get(ORDER_RID);
const registeredAddress = STRUCT_REGISTRY.get(ADDRESS_RID);
const registeredCurrency = VALUE_TYPE_REGISTRY.get(CURRENCY_RID);

if (!registeredOrder || !registeredAddress || !registeredCurrency) {
  throw new Error("ForwardProp chain broken: registry lookup failed");
}

// Type-safe cross-primitive reference: Order.shippingAddress type == Address RID
const addressField = registeredOrder.properties.find(
  (p) => p.name === "shippingAddress",
);
if (addressField?.type !== ADDRESS_RID) {
  throw new Error("Struct RID reference not preserved in ObjectType properties");
}

console.log("H-A PoC: ForwardProp chain validated");
console.log(`  ObjectType: ${registeredOrder.name} (${registeredOrder.rid})`);
console.log(`  Struct:     ${registeredAddress.name} (${registeredAddress.rid})`);
console.log(`  ValueType:  ${registeredCurrency.name} (${registeredCurrency.rid})`);
console.log(`  SharedCore version: 1.0.0-prototype`);

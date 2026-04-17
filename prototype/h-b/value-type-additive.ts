/**
 * H-B PoC: Additive ValueType primitive — v0.3 additive layer
 *
 * Same additive philosophy as struct-additive.ts: net-new file, no modification
 * of v0.2 sources. v0.2 consumers compile unchanged; v0.3 consumers gain
 * scalar constraint types.
 *
 * D/L/A domain: DATA (scalar constraint definition is a stored fact about the
 * data model schema, not a derivation or mutation)
 */

export type ValueTypeRid = string & { readonly __brand: "ValueTypeRid" };

export const valueTypeRid = (s: string): ValueTypeRid => s as ValueTypeRid;

export type BaseScalarType =
  | "string"
  | "number"
  | "boolean"
  | "integer"
  | "timestamp"
  | "date";

export interface ValueTypeConstraint {
  readonly kind: "enum" | "regex" | "range" | "length";
  readonly value: unknown;
}

export interface ValueTypeDeclaration {
  readonly rid: ValueTypeRid;
  readonly name: string;
  readonly description?: string;
  readonly baseType: BaseScalarType;
  readonly constraints: ReadonlyArray<ValueTypeConstraint>;
  /** Marks this as a v0.3 additive primitive */
  readonly schemaVersion: "0.3.x";
}

export class ValueTypeRegistry {
  private readonly types = new Map<ValueTypeRid, ValueTypeDeclaration>();

  register(decl: ValueTypeDeclaration): void {
    this.types.set(decl.rid, decl);
  }

  get(rid: ValueTypeRid): ValueTypeDeclaration | undefined {
    return this.types.get(rid);
  }

  keys(): IterableIterator<ValueTypeRid> {
    return this.types.keys();
  }

  list(): ValueTypeDeclaration[] {
    return [...this.types.values()];
  }
}

export const VALUE_TYPE_REGISTRY_V3 = new ValueTypeRegistry();

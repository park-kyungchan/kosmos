/**
 * H-B PoC: Additive Struct primitive — v0.3 additive layer
 *
 * Demonstrates that Struct can be added to the primitive layer WITHOUT
 * modifying existing v0.2 files (object-type.ts, link-type.ts are untouched).
 * This is the H-B claim: additive minor bumps compose cleanly.
 *
 * v0.2 compatibility layer: existing consumers that import only ObjectType +
 * LinkType from v0.2 paths continue to compile unchanged. Struct is net-new;
 * it does not redefine or shadow any v0.2 export.
 *
 * D/L/A domain: DATA (stored-fact record type — same as H-A struct.ts)
 *
 * Why "additive, not breaking":
 *   - No existing v0.2 export is renamed, removed, or changed in shape.
 *   - StructDeclaration is a wholly new interface; no v0.2 type aliases it.
 *   - Consumers on peerDep 0.2.x never import this file — the caret range
 *     still resolves to 0.2.1; 0.3.x consumers opt in by bumping caret.
 *   - TypeScript structural typing: StructDeclaration shares no field names
 *     with ObjectTypeDeclaration or LinkTypeDeclaration, so there is zero
 *     risk of accidental assignability overlap.
 */

// v0.2 compatibility shim — re-export untouched v0.2 primitives so a
// consumer can upgrade to 0.3.x and still use a single import path.
export type {
  ObjectTypeRid,
  ObjectTypeDeclaration,
} from "/home/palantirkc/.claude/schemas/ontology/primitives/object-type.ts";

export {
  objectTypeRid,
  ObjectTypeRegistry,
  OBJECT_TYPE_REGISTRY,
} from "/home/palantirkc/.claude/schemas/ontology/primitives/object-type.ts";

export type {
  LinkTypeRid,
  LinkTypeDeclaration,
} from "/home/palantirkc/.claude/schemas/ontology/primitives/link-type.ts";

export {
  linkTypeRid,
  LinkTypeRegistry,
  LINK_TYPE_REGISTRY,
} from "/home/palantirkc/.claude/schemas/ontology/primitives/link-type.ts";

// --- v0.3 net-new: StructType ---

export type StructRid = string & { readonly __brand: "StructRid" };

export const structRid = (s: string): StructRid => s as StructRid;

export interface StructFieldDeclaration {
  readonly name: string;
  readonly type: string;
  readonly optional?: boolean;
  readonly description?: string;
}

export interface StructDeclaration {
  readonly rid: StructRid;
  readonly name: string;
  readonly description?: string;
  readonly fields: ReadonlyArray<StructFieldDeclaration>;
  readonly embeds?: ReadonlyArray<StructRid>;
  /** Marks this as a v0.3 additive primitive — allows pm-verify to detect version */
  readonly schemaVersion: "0.3.x";
}

export class StructRegistry {
  private readonly structs = new Map<StructRid, StructDeclaration>();

  register(decl: StructDeclaration): void {
    this.structs.set(decl.rid, decl);
  }

  get(rid: StructRid): StructDeclaration | undefined {
    return this.structs.get(rid);
  }

  keys(): IterableIterator<StructRid> {
    return this.structs.keys();
  }

  list(): StructDeclaration[] {
    return [...this.structs.values()];
  }
}

export const STRUCT_REGISTRY_V3 = new StructRegistry();

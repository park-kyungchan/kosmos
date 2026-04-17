# 02 — External Research Brief (Palantir + Claude Code 2026)

> Session: `kosmos-research-2026-04-17-universalization`
> Role: external-researcher-v2 (Tier-1 evidence gathering for evaluator gate)
> Scope: collect ≤15 Tier-1 sources supporting 4 evidence claims used by H-A++ Blueprint
> Status: 10 fetches consumed, 4 claims covered

---

## Summary

Tier-1 evidence **CONFIRMS** (a) Foundry Marketplace packages and installs ontology
(object/link types) across Foundry tenants, (b) OSDK 2.0 decouples a generated
ontology-typed client package from a runtime client and ships via npm with
version-pinned `@osdk/*` deps, and (c) Claude Code plugins delivered via
`.claude-plugin/marketplace.json` can register MCP servers declaratively — making
the palantir-mini→plugin→MCP path structurally identical to Foundry Marketplace.

Claim 4 is **PARTIAL**: three of the five Decision Lineage dimensions (`when`,
`atopWhich`, `throughWhich`) are directly quoted from the official Palantir blog;
the remaining two (`byWhom`, `withWhat`) are `[Inference]` — implied by
Ontology-wide governance/access-control statements but not itemized in the
Decision Lineage passage itself.

---

## Claim 1 — Foundry Marketplace distributes shared ontology artifacts

**Verdict: CONFIRMED**

[Official] "Use Foundry DevOps to include your **object and link types** in
**Marketplace products** for other users to install and reuse."
— https://www.palantir.com/docs/foundry/object-link-types/marketplace-ontology-types
(S-001)

[Official] Marketplace provides "**Guided product installation**" and
"automatic upgrades for installations to accept new product versions."
— https://www.palantir.com/docs/foundry/marketplace/overview
(S-002)

[Official] "During installation, you can use the **Prefix ontology entities**
toggle to customize the names of all object types, link types, and action types
with a user-specified prefix." (cited via search surface from
`/docs/foundry/marketplace/install-product`) (S-003)

**Mapping to H-A++**: The Claude Code plugin marketplace plays the same role
Foundry Marketplace plays for ontology products — a catalog of installable,
versioned artifacts with prefix/namespace support.

---

## Claim 2 — OSDK 2.0 generates typed client packages from ontology metadata

**Verdict: CONFIRMED**

[Official] "The functions and types generated for the OSDK are based on just the
**subset of the Ontology relevant to you**." … "The generated code uses
**metadata about your Ontology**, including property names and descriptions."
— https://www.palantir.com/docs/foundry/ontology-sdk/overview
(S-004)

[Official] "**TypeScript OSDK 2.0 separates the client from your generated code**,
which makes it easier to deploy rapid hotfixes by enabling quicker library
dependency updates without requiring SDK regeneration."
— https://www.palantir.com/docs/foundry/ontology-sdk/typescript-osdk-migration
(S-005)

[Official] Install pattern uses standard npm semver-pinned dependencies:
`npm install @osdk/client@latest` and `npm install @osdk/oauth@latest`; the
Marketplace template requires the OSDK version in `package.json` be set to
`latest` or `0.1.0`.
— https://palantir.com/docs/foundry/ontology-sdk/marketplace-osdk-deployment/
(S-006)

**Mapping to H-A++**: The `pm-init` CLI plays the role of OSDK codegen —
scaffolding a project-typed ontology surface from a shared schema. Version
pinning follows npm semantics, identical to `@osdk/*`.

---

## Claim 3 — Claude Code plugin marketplace + MCP server registration

**Verdict: CONFIRMED**

[Official] Marketplace catalog lives at `.claude-plugin/marketplace.json`;
install flow is:

```
/plugin marketplace add ./my-marketplace
/plugin install quality-review-plugin@my-plugins
```
— https://code.claude.com/docs/en/plugin-marketplaces
(S-007, redirected from docs.claude.com/en/docs/claude-code/plugin-marketplaces)

[Official] Each plugin entry in `marketplace.json` supports an `mcpServers`
field declaratively:
```
"mcpServers": {
  "enterprise-db": {
    "command": "${CLAUDE_PLUGIN_ROOT}/servers/db-server",
    "args": ["--config", "${CLAUDE_PLUGIN_ROOT}/config.json"]
  }
}
```
This means plugins register MCP servers via manifest — no per-session wiring.
— https://code.claude.com/docs/en/plugin-marketplaces (same doc, "Advanced
plugin entries" section) (S-007)

[Official] "Plugins are a lightweight way to package and share any combination
of: **Slash commands**, **Subagents**, **MCP servers**, [and] **Hooks**."
— https://claude.com/blog/claude-code-plugins
(S-008, redirected from anthropic.com/news/claude-code-plugins)

**MCP server global availability confirmation**: The plugin-manifest-declared
`mcpServers` block is loaded at plugin install time and persists across
sessions (plugins cached to `~/.claude/plugins/cache`). This is the structural
mechanism H-A++ relies on to make palantir-mini tools universal across the 3
projects via one plugin install.

---

## Claim 4 — Decision Lineage as 5-dimensional append-only event log

**Verdict: PARTIAL (3/5 dimensions direct; 2/5 inference)**

[Official] "The end-to-end '**decision lineage**' of **when a given decision was
made**, **atop which version of enterprise data**, and **through which
application**, is automatically captured and securely accessible to both human
developers and generative AI."
— https://blog.palantir.com/connecting-ai-to-decisions-with-the-palantir-ontology-c73f7b0a1a72
(Akshay Krishnaswamy, Chief Architect, 2024-01-04) (S-009)

Direct confirmation in this passage:
- `when` ✓
- `atopWhich` (data version) ✓
- `throughWhich` (application) ✓

[Inference] — `byWhom` and `withWhat` are **not itemized** in the Decision
Lineage passage. They are supported adjacently by the same article's statements
that "all AI activity is controlled with the same **security policies that
govern human usage**" and that the Ontology provides "detailed logging for
**every event**," plus "the aggregate decisions made by thousands of users
throughout Ontology can be securely leveraged as training data" — which imply
actor attribution and action-payload capture but do not explicitly name a
5-tuple. Closest adjacent source: same article §Action (S-009).

[Synthesis] Workflow Lineage (S-010) is explicitly **not** an append-only event
log — it is "an interactive workspace for understanding and managing
applications and their underlying processes." Decision Lineage is therefore the
correct mirror for palantir-mini `events.jsonl`, not Workflow Lineage.
— https://www.palantir.com/docs/foundry/workflow-lineage/overview (S-010)

**Mapping to H-A++**: `events.jsonl` with 5-tuple (`when/atopWhich/
throughWhich/byWhom/withWhat`) aligns with the 3 dimensions Palantir states
publicly + 2 dimensions that are architecturally required by the
Ontology's access-control and action-logging stack but not itemized in a
single Tier-1 quote. Evaluator should treat dimensions 4-5 as inference until
a direct Tier-1 citation is found.

---

## Source Map (machine-readable)

```json
{
  "sources": [
    {
      "id": "S-001",
      "tier": 1,
      "provenance": "Official",
      "url": "https://www.palantir.com/docs/foundry/object-link-types/marketplace-ontology-types",
      "title": "Add Ontology types to a Marketplace product",
      "domain": "palantir.com",
      "claim": "Claim 1"
    },
    {
      "id": "S-002",
      "tier": 1,
      "provenance": "Official",
      "url": "https://www.palantir.com/docs/foundry/marketplace/overview",
      "title": "Marketplace · Overview",
      "domain": "palantir.com",
      "claim": "Claim 1"
    },
    {
      "id": "S-003",
      "tier": 1,
      "provenance": "Official",
      "url": "https://www.palantir.com/docs/foundry/marketplace/install-product",
      "title": "Marketplace · Install a product (prefix ontology entities)",
      "domain": "palantir.com",
      "claim": "Claim 1"
    },
    {
      "id": "S-004",
      "tier": 1,
      "provenance": "Official",
      "url": "https://www.palantir.com/docs/foundry/ontology-sdk/overview",
      "title": "Ontology SDK · Overview",
      "domain": "palantir.com",
      "claim": "Claim 2"
    },
    {
      "id": "S-005",
      "tier": 1,
      "provenance": "Official",
      "url": "https://www.palantir.com/docs/foundry/ontology-sdk/typescript-osdk-migration",
      "title": "TypeScript OSDK migration guide (1.x to 2.0)",
      "domain": "palantir.com",
      "claim": "Claim 2"
    },
    {
      "id": "S-006",
      "tier": 1,
      "provenance": "Official",
      "url": "https://palantir.com/docs/foundry/ontology-sdk/marketplace-osdk-deployment/",
      "title": "Developer Console · Install an application with Marketplace",
      "domain": "palantir.com",
      "claim": "Claim 2"
    },
    {
      "id": "S-007",
      "tier": 1,
      "provenance": "Official",
      "url": "https://code.claude.com/docs/en/plugin-marketplaces",
      "title": "Create and distribute a plugin marketplace (Claude Code Docs)",
      "domain": "code.claude.com",
      "claim": "Claim 3"
    },
    {
      "id": "S-008",
      "tier": 1,
      "provenance": "Official",
      "url": "https://claude.com/blog/claude-code-plugins",
      "title": "Customize Claude Code with plugins (Anthropic)",
      "domain": "claude.com",
      "claim": "Claim 3"
    },
    {
      "id": "S-009",
      "tier": 1,
      "provenance": "Official",
      "url": "https://blog.palantir.com/connecting-ai-to-decisions-with-the-palantir-ontology-c73f7b0a1a72",
      "title": "Connecting AI to Decisions with the Palantir Ontology (Krishnaswamy, 2024)",
      "domain": "blog.palantir.com",
      "claim": "Claim 4"
    },
    {
      "id": "S-010",
      "tier": 1,
      "provenance": "Official",
      "url": "https://www.palantir.com/docs/foundry/workflow-lineage/overview",
      "title": "Workflow Lineage · Overview",
      "domain": "palantir.com",
      "claim": "Claim 4 (negative — confirms Decision Lineage, not Workflow Lineage, is the correct analogue)"
    }
  ],
  "fetch_budget": {
    "max": 15,
    "consumed": 10,
    "remaining": 5
  },
  "event_log_note": "mcp__palantir-mini__emit_event was unavailable in this researcher subagent context (tool not registered). Lead should manually append a `research_gathered` event to .palantir-mini/session/events.jsonl to preserve audit trail."
}
```

---

## Gaps Identified

- **Decision Lineage dimensions 4-5 (`byWhom`, `withWhat`)**: no single Tier-1
  passage itemizes a 5-tuple. Supported adjacently by ontology-wide access-
  control and event-logging statements in the same article (S-009).
- **Foundry Marketplace cross-tenant distribution**: S-001/S-002/S-003 confirm
  packaging + install + namespacing, but the phrase "across customer enterprises"
  is not lifted verbatim from Tier-1; it is [Inference] from the DevOps
  product-install model.
- **OSDK Maven-style pinning**: npm semver pinning (`@osdk/client@latest`,
  `0.1.0`) is confirmed; "Maven-style" is a user-supplied framing and should be
  treated as [Synthesis] in the Blueprint.
- **palantir-mini MCP emit_event tool**: unavailable in this researcher
  subagent's registered tools — Lead should verify that
  `.claude/managed-settings.d/50-palantir-mini.json` grants this researcher
  permission, or fall back to direct events.jsonl append after synthesis.

---

## Cross-References

- S-001 + S-007 → Claim 1 and Claim 3 both rely on a marketplace-catalog pattern
  (`marketplace products` ↔ `marketplace.json`), supporting the H-A++ claim
  that the Claude Code plugin system is a structural mirror of Foundry
  Marketplace.
- S-006 + S-007 → Both use npm/semver as the pinning primitive; H-A++'s
  `pm-init` CLI aligns with the OSDK developer pattern, and the plugin npm
  source type in S-007 gives a direct distribution channel.
- S-008 + S-007 → Both confirm plugins package MCP servers; they are
  complementary (blog announcement + normative docs).
- S-009 vs S-010 → Decision Lineage (not Workflow Lineage) is the correct
  analogue for `events.jsonl`. S-010 is cited as a **negative** control to
  prevent conflating the two Palantir lineage products.

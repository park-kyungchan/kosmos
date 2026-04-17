# 11 — Risks, Unknowns, and What Would Change the Decision

> Honest accounting of what could go wrong, how we'd detect it, and under what conditions we'd reverse H-A++ in favor of H-A or H-B.

---

## 11.1 Risk Register

| # | Risk | Severity | Probability | Mitigation | Detected By |
|---|------|----------|-------------|------------|-------------|
| K-01 | Plugin update (`/plugin update`) wipes `${CLAUDE_PLUGIN_ROOT}` and loses any plugin-local state | HIGH | LOW | Keep events.jsonl in `<project>/.palantir-mini/session/`, NOT in plugin root. Plugin carries only code + manifests + templates. | AT-14 (reinstall test) |
| K-02 | `mcpServers` in plugin.json does not register as expected in user's specific CC v2.1.110 build | MEDIUM | LOW | External research CONFIRMED in section 02. Fallback: H-A per-project `.mcp.json`. | AT-02 (MCP visibility) |
| K-03 | Schema version pin mismatch across 3 projects | MEDIUM | MEDIUM | `pm-verify` blocks on mismatch; `pm-codegen` refuses to run. | pm-verify Phase 2 |
| K-04 | Skill duplication confusion (user-scope vs plugin) | LOW | MEDIUM | Rule 05 (skill invocation order); deprecation notes on user-scope | skill-creator eval |
| K-05 | pm-init not idempotent on palantir-math partial state | MEDIUM | LOW | Section 8.4 algorithm includes 5-state classification + test AT-05 | AT-05 |
| K-06 | events.jsonl corruption (concurrent writes) | HIGH | LOW | MCP server is single writer per session; filesystem append-only semantics on Linux; tested in prior Brain v2 session (0 lost / 2000 events at 2-writer race) | Pre-compact hook snapshot |
| K-07 | User opens multiple Claude Code sessions on same project simultaneously | MEDIUM | MEDIUM | Prior session decided this uses git branches; rule 10 codifies | manual + rule |
| K-08 | Brain v2 PR #7 merge conflicts with universalization PRs | MEDIUM | MEDIUM | Sequence: PR #7 merges first; universalization layers on top | git |
| K-09 | Schemas v0.2 has hidden breaking change despite "additive-only" intent | LOW | LOW | `bun tsc --noEmit` at top; CHANGELOG entry with migration notes; consumer-side `pm-verify` | pm-verify |
| K-10 | New-project template goes stale vs live plugin | LOW | HIGH | Template generated from plugin at release; regenerate every version bump | T1 PR test |
| K-11 | Cross-project event log analytics breaks (each project isolated) | LOW | LOW | Out of scope for H-A++; declared non-feature in 5.8 | design-level |
| K-12 | CC v2.1.110 plugin system sunset / replaced | HIGH | VERY LOW | Reverse to H-A (per-project). Documented in 11.3. | release notes |
| K-13 | Third-party plugin hijacks `mcp__palantir-mini` namespace | HIGH | VERY LOW | Claude Code plugin system scopes by marketplace + name; only our marketplace installs our plugin | CC plugin scope mechanism |
| K-14 | Adversarial plugin install (K-04 scenario) | MEDIUM | LOW | managed-settings.d P-02 allowlist caps per-project tool scope | RBAC fragment |
| K-15 | User-scope `pm-*` skill deprecation breaks existing muscle memory | LOW | HIGH | Grace period (1 release cycle); deprecation warnings on invocation | user feedback |

---

## 11.2 Unknowns (things we don't fully verify in this session)

| # | Unknown | Why It's Unknown | Resolution Plan |
|---|---------|------------------|-----------------|
| U-01 | Whether `mcpServers` in plugin.json works identically for stdio vs http transports | Only stdio used in current build; http path untested | Test AT-02 on stdio only for v0.2.0; http deferred |
| U-02 | Whether Decision Lineage `byWhom` / `withWhat` dimensions precisely match our implementation | Palantir docs confirm 3/5 dimensions directly; 2/5 are [Inference] | Ship our 5-tuple as [Synthesis]; update decision-lineage/ evidence if Palantir publishes details |
| U-03 | Whether skill-creator eval framework works cleanly on plugin-scope skills | User-scope skills tested; plugin-scope untested in eval framework | Test as part of R5 |
| U-04 | Whether schemas-as-npm (Option A in 7.11) is preferred over filesystem reference (Option B) for solo user | Single-user scenario; no need for registry now | Start Option B; graduate if multi-user |
| U-05 | Whether cross-project ontology diff requires a dedicated tool | palantir-math and mathcrew ontologies are small; diff might be manual for now | Defer to pm-diagnose in follow-up |
| U-06 | Whether 50-palantir-mini.json fragment conflicts with any other managed-settings fragments in future | No other fragments exist today | Namespace by file prefix (`50-*` scheme); monitor |
| U-07 | Whether Claude's `/plugin` command suppresses MCP tools during plugin update | Behavior not documented; plugin update may briefly break MCP tools | Test AT-14; document workaround if so |
| U-08 | Whether events.jsonl 5-tuple supports future extensions (e.g., 6th dim) | Current spec is frozen at 5 | Reserve `payload.extras` for forward compat |

---

## 11.3 What Would Change the Decision

### Reverse to H-A (per-project only) if:
1. `mcpServers` in plugin.json fails to register MCP server globally (AT-02 fails on real system)
2. Claude Code plugin marketplace is sunset or deprecated by Anthropic
3. Plugin update lifecycle proves unstable (K-01 materializes)
4. User explicitly prefers decentralized setup

**Reversal cost**: Remove R3/R5/K1/M1/PM1 plugin dependency; each project installs its own `.mcp.json`. ~1h work. No data loss.

### Reverse to H-B (global daemon) if:
1. Cross-project analytics / team audit becomes a hard requirement
2. Single shared event log is needed for compliance
3. >10 users share the same workspace

**Reversal cost**: Replace filesystem event log with daemon-backed log. Schema stays. ~1-2 days work. Migration script reads existing `events.jsonl` files and seeds daemon.

### Escalate to H-A+++ (multi-user distribution) if:
1. Team size grows beyond solo usage
2. Schemas need to be published publicly to npm
3. Plugin marketplace moves to Anthropic-hosted registry

**Escalation cost**: Publish `@palantirKC/claude-schemas` to npm; move plugin to hosted marketplace. No architectural change, just distribution.

---

## 11.4 Post-Implementation Monitoring

Weekly (for 4 weeks after K1/M1/PM1 land):

- [ ] `pm-verify` on each of 3 projects — all green?
- [ ] `pm-recap` cross-checked against `events.jsonl` — consistent?
- [ ] User invocation patterns — which skills most/least used?
- [ ] Any deprecation-warning invocations still happening?
- [ ] Plugin update/uninstall cycle triggered any data concern?
- [ ] New rules (04-11) cited by any errors or user friction?

Monitoring outputs land as `post_implementation_review` events.

---

## 11.5 Adversarial Scenarios (from section 4.3 S4)

### Scenario A: Malicious plugin in marketplace
- Impact: any user who mistakenly installs it gains aggressive MCP tools
- Mitigation: managed-settings.d P-02 caps per-project tool scope
- Detection: `pm-verify` phase 3 scans for unexpected MCP tool invocations
- Response: user removes the malicious plugin; events show any edits attempted

### Scenario B: Compromised `bun` runtime
- Impact: MCP server (bun-executed) could be compromised
- Mitigation: bun version pin; signature verification (future)
- Detection: `pm-verify` phase 2 version check
- Response: roll back to known-good bun version; emit `security_incident` event

### Scenario C: Accidental git push of events.jsonl containing secrets
- Impact: sensitive info leaks
- Mitigation: events.jsonl should never contain raw user input; emit only ontology edits + agent reasoning summaries
- Detection: pre-commit hook scans for keywords (future)
- Response: git history rewrite; revoke secrets

---

## 11.6 Things We Explicitly Chose NOT To Protect Against

- ❌ Solo-user local machine compromise (out of scope; assumed physical security)
- ❌ Cross-project collusion (single user; single tenant)
- ❌ Malicious subagent impersonating Lead (requires plugin-root write access, already protected)
- ❌ DoS via rapid events.jsonl writes (filesystem-level throttling handles; <1% risk)

---

## 11.7 Reversibility Summary

| Axis | Reversibility | Notes |
|------|---------------|-------|
| Plugin install | Single command | `/plugin uninstall` |
| Per-project state | Single command | `rm -rf .palantir-mini/ .claude/managed-settings.d/50-*` |
| Schema upgrade | Version pin downgrade | No data migration needed at additive-only bump |
| Rules | git revert | Advisory; no runtime binding |
| MEMORY sweep | git restore | Promoted content duplicated temporarily |
| PR #7 dependency | Must merge first | Non-negotiable |

---

## 11.8 Final Risk Verdict

Aggregate residual risk across K-01 through K-15 at mitigated severity: **LOW-to-MEDIUM**. No HIGH-severity unmitigated risks. External research resolved the most critical unknown (K-02 / U-02). Reversal paths exist for every layer.

**Recommendation**: proceed to implementation. Monitor K-03, K-05, K-15 closely during rollout.

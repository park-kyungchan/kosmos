# Browse Workflow — Detailed Protocol

## The Protocol

```
Question → Recipe → Grep → Compose → Reason
```

This is the ONLY acceptable way to retrieve information from the
internal Palantir research library. No exceptions.

## Why This Protocol Exists

The research library contains 81 files with ~1,205 grep-visible markers.
Reading all files would consume ~100k+ tokens and most of it would be
irrelevant to any specific question. The browse protocol ensures:

1. **Precision**: Only read what answers the question
2. **Efficiency**: ~5-15k tokens per question vs ~100k+ for full scan
3. **Provenance**: Every finding traces back to specific markers
4. **Reproducibility**: Same question → same marker chain → same answer

## Step-by-Step

### Step 1: Frame the Question

Turn the information need into a specific, answerable question.

Bad: "Tell me about Palantir"
Good: "How does Palantir model cause and effect in the Ontology?"

Bad: "What are the security features?"
Good: "How does the 4-layer security model work?"

### Step 2: Look Up the Recipe

Open `~/.claude/research/BROWSE.md` and find the matching recipe.

BROWSE.md organizes recipes by domain:
- Causality & Architecture (A1, A2, A3)
- Digital Twin & LEARN (A5)
- LLM Grounding & Tools
- DATA Domain
- LOGIC Domain
- ACTION Domain
- Security
- Validation & Provenance

Each recipe provides the exact marker chain to follow.

**Example:**
> Q: How does Palantir model cause and effect?
> Recipe: §LOGIC.R-02 → §LOGIC.R-03 → §LOGIC.FN-15 → §LOGIC.FN-17 → §DATA.DP-11

### Step 3: Grep for Markers

Follow the recipe with targeted grep commands:

```
Grep({ pattern: "\\[§LOGIC\\.R-02\\]", path: "~/.claude/research/palantir/logic/" })
```

This returns the exact file and line number for each marker.

### Step 4: Read Marker Sections

Read 150 lines at a time starting from each marker:

```
Read({ file_path: "~/.claude/research/palantir/logic/README.md", offset: 42, limit: 150 })
```

### Step 5: Compose and Reason

Synthesize across markers to answer the original question.
Tag each finding with provenance:

- `[Official]` — the text directly states this
- `[Synthesis]` — we inferred this by combining official sources
- `[Inference]` — we reasoned to this conclusion from evidence

## Cross-Cutting Themes

For questions that span domains, BROWSE.md provides pre-built
marker chains under "Cross-Cutting Themes":

| Theme | Example Grep |
|-------|-------------|
| Explicit Causality | `"Impact Propagation\|cascading edit"` |
| Decision Lineage | `"Decision Lineage\|5 dimensions\|hookEvents"` |
| LEARN Feedback | `"LEARN-0[123]\|evaluatorResults"` |
| LLM Grounding | `"Semantic Integrity\|Semantic Consistency"` |
| Security Propagation | `"marking.*propagat\|mandatory control"` |
| Progressive Autonomy | `"PA-0[1-5]\|staged review"` |

## When the Recipe Doesn't Exist

If BROWSE.md doesn't have a recipe for your question:

1. Identify the domain (DATA/LOGIC/ACTION/SECURITY/PHILOSOPHY)
2. Use INDEX.md to find the relevant file(s)
3. Grep for domain markers: `Grep({ pattern: "\\[§DATA\\.", path: "~/.claude/research/palantir/data/" })`
4. Read the marker summaries in INDEX.md's Concept Index
5. Construct a custom marker chain

## Anti-Patterns

| Anti-Pattern | Why It's Wrong | Correct |
|-------------|----------------|---------|
| `Grep({ pattern: ".*", path: "research/" })` | Matches everything, huge token cost | Use specific markers |
| Reading all files in `data/` | 15 files, ~419 markers, mostly irrelevant | Use recipe for specific question |
| Starting without a question | Directionless scanning | Frame question first |
| Ignoring provenance | Mixing official and synthesized content | Tag every finding |
| Trusting INDEX.md for depth | INDEX.md is structural reference only | BROWSE.md has the recipes |

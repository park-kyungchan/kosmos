# H-A Prototype: Append-Only Event Log Foundation

**Hypothesis**: EventEnvelope discriminated union + atomic mkdir-lock append is the correct substrate for palantir-mini's LEARN-centric D/L/A ontology.

## What this proves

1. **Atomic correctness under concurrent writes** (gap-01 resolution): 2 writers × 1000 events = 2000 total with zero duplicate sequences, zero torn writes, zero lost events. `fs.mkdirSync` with `recursive:false` is sufficient as a zero-dep lock primitive on Linux/macOS.

2. **Discriminated union type safety**: TypeScript closes the EventEnvelope union at compile time. Invalid variants produce type errors, not runtime surprises.

3. **O(n) fold to snapshot**: `foldToSnapshot()` reduces any event log to a typed count snapshot in a single pass — the Reducer LOGIC primitive pattern.

## Files

- `lib/event-log/types.ts` — EventEnvelope base + 3 variants (edit_proposed, edit_committed, session_started)
- `lib/event-log/append.ts` — Atomic append with mkdir mutex + exponential backoff retry
- `lib/event-log/read.ts` — readEvents() + foldToSnapshot()
- `tests/event-log.test.ts` — 5 test cases including adversarial 2-writer race

## Run

```
bun test        # all 5 tests
bunx tsc --noEmit  # zero type errors
```

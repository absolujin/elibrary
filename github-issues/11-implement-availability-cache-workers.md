## Requirement

As a `Guest or Member`, I need `availability shown from known data while refresh work happens asynchronously` so that `slow external libraries do not block search or detail views`.

## Owner

- Domain: `architecture`
- Owning file: `ARCHITECTURE.md`
- Existing requirement/control/decision ID, if any: `FR-3.3 | FR-3.4 | NFR-1 | SR-015`

## Scope

In scope:

- Implement cache-first availability summary and detail behavior.
- Enqueue stale or missing availability refresh work.
- Use BullMQ through `@nestjs/bullmq` for self-managed Valkey or Redis-compatible availability refresh jobs.
- Use the `availability-refresh` queue with per-library queues, routing, or concurrency limits as bulkheads.
- Store availability snapshots with provenance and last checked time.
- Emit or enqueue availability-change events for the Notification module without blocking availability refresh.
- Ensure worker job payloads carry internal IDs and bounded parameters only.

Out of scope:

- Confirming actual external borrowing completion.
- Overriding external library service terms.

## Acceptance Criteria

- Given cached or persisted availability exists, when search or detail renders, then known availability is shown without waiting on slow external calls.
- Given availability is stale or missing, when detail or search is requested, then refresh work is queued.
- Given availability refresh jobs are inspected, when queue configuration is reviewed, then BullMQ via `@nestjs/bullmq` is used.
- Given an availability state changes for a saved book, when refresh work persists the new state, then a notification event can be queued for eligible Members.
- Given one library integration is degraded, when workers process jobs, then unrelated libraries are not starved.
- Given a worker job is inspected, then it does not contain raw external URLs, credentials, secrets, or adapter configuration blobs.

## Verification

- Test or check: `deferred until implementation workflow exists`
- Evidence required: `Worker and cache tests or manual checks showing cache-first responses, queued refreshes, per-library isolation, and safe job payloads.`

## Dependencies

- `github-issues/10-implement-library-adapter-registry.md`
- `SECURITY.md#sr-015-abuse-and-denial-of-service-resistance`
- `ARCHITECTURE.md#initial-architecture`

## Requirement

As a `System worker and application developer`, I need `a modular monolith skeleton with explicit runtime units and module boundaries` so that `future feature work follows the architecture without premature service splitting`.

## Owner

- Domain: `architecture`
- Owning file: `ARCHITECTURE.md`
- Existing requirement/control/decision ID, if any: `none`

## Scope

In scope:

- Establish runtime units for React Web App, React Admin UI, NestJS Backend API, NestJS-compatible Workers, Library Adapters, self-managed PostgreSQL, PostgreSQL full-text Search Index, self-managed Valkey or Redis-compatible cache, and BullMQ worker queues.
- Establish pnpm workspace structure and root package metadata for JavaScript/TypeScript packages.
- Define root pnpm scripts for `test`, `lint`, `typecheck`, `build`, and `dev`.
- Create module boundaries for Auth, User, Library, Ebook, Holding, Loan, Notification, Admin, Integration, and Audit.
- Ensure modules interact through service interfaces rather than direct cross-module record mutation.

Out of scope:

- Selecting frontend build tooling or routing details beyond the React framework decision.
- Implementing feature-specific endpoints beyond skeleton routes or stubs.

## Acceptance Criteria

- Given the selected implementation stack, when the app skeleton is inspected, then each architecture component from `ARCHITECTURE.md#initial-architecture` has an owned place in the codebase.
- Given the Backend API and worker skeletons are inspected, then NestJS is used for backend runtime structure.
- Given the worker skeleton is inspected, then BullMQ is integrated through `@nestjs/bullmq` for a self-managed Valkey or Redis-compatible worker queue service.
- Given the Web App and Admin UI skeletons are inspected, then React is used for frontend runtime structure.
- Given package metadata is inspected, then pnpm is the selected package manager and `pnpm-lock.yaml` is committed once dependencies exist.
- Given root package scripts are inspected, then `pnpm test`, `pnpm lint`, `pnpm typecheck`, `pnpm build`, and `pnpm dev` are available.
- Given module code exists, when cross-module access is reviewed, then one module does not directly mutate another module's owned records.
- Given workers and adapters are represented, when their boundaries are inspected, then adapter execution is separated from user-facing request handling.

## Verification

- Test or check: `deferred until implementation workflow exists`
- Evidence required: `Module map or code references showing each runtime unit and module boundary.`

## Dependencies

- `github-issues/01-resolve-mvp-implementation-decisions.md`
- `ARCHITECTURE.md#initial-architecture`

# eLibrary

eLibrary is a bootstrap-stage web and API application for finding ebooks across public electronic libraries.

The product goal is to help guests and members search public ebook metadata, see which electronic libraries hold or can lend a title, register the libraries they can use, and continue to the correct external borrowing flow. Admins maintain library records, integration status, duplicate ebook metadata, and audit/integration events.

## Project Status

This repository is in MVP foundation work. The specifications are the source of truth, and implementation should follow the GitHub epic:

- [Epic: Build eLibrary MVP Web and API Foundation](https://github.com/absolujin/elibrary/issues/23)

Known deferred decisions remain visible in the specs and epic. Implementation must not invent answers for deferred library selection, email/Web Push delivery providers or credential ownership, MVP load profile, or crawler policy review.

## Authoritative Documents

- [REQUIREMENTS.md](./REQUIREMENTS.md): product behavior and acceptance criteria.
- [ARCHITECTURE.md](./ARCHITECTURE.md): components, interfaces, data flow, module boundaries, and technology rationale.
- [SECURITY.md](./SECURITY.md): threat model, security requirements, controls, and trust-boundary enforcement.
- [DESIGN.md](./DESIGN.md): UI styling, visual design, layout, accessibility, and light/dark tokens.
- [CLAUDE.md](./CLAUDE.md): agent operating rules and workflow commands.
- [REQUIREMENT_TEMPLATE.md](./REQUIREMENT_TEMPLATE.md): required template for every new GitHub issue.

## Stack

- Package manager: `pnpm@11.8.0`
- Language: TypeScript
- Backend API: NestJS
- Worker runtime: NestJS-compatible workers with BullMQ
- Web App: React
- Admin UI: React
- Primary store: PostgreSQL
- MVP search: PostgreSQL full-text search
- Queue/cache dependency: self-managed Valkey or Redis-compatible service
- MVP/demo deployment target: zero-cost Oracle Cloud Always Free VM with Docker Compose

## Workspace Layout

```text
apps/
  admin/      React Admin UI shell
  api/        NestJS Backend API shell
  web/        React public/member Web App shell
  worker/     NestJS-compatible worker shell with BullMQ queues
packages/
  adapters/   LibraryAdapter contract and registry
  database/   PostgreSQL store and search-index ownership map
  domain/     Runtime components, module boundaries, and queue names
infra/
  local/      Local infrastructure notes and placeholders
tests/        Architecture skeleton tests
```

## Getting Started

Prerequisites:

- Node.js `>=22`
- pnpm `11.8.0`

If `pnpm` is not installed globally, use the pinned version through `npx`:

```sh
npx pnpm@11.8.0 install
```

Run the standard workflow commands:

```sh
npx pnpm@11.8.0 test
npx pnpm@11.8.0 lint
npx pnpm@11.8.0 typecheck
npx pnpm@11.8.0 build
```

Local development command:

```sh
npx pnpm@11.8.0 dev
```

The current `dev` script starts the API and worker skeletons. Frontend build tooling and routing are intentionally not selected yet beyond the React framework decision.

## Architecture Skeleton

The current codebase establishes the component and module boundaries required before feature implementation:

- Runtime units: Web App, Admin UI, Backend API, Workers, Library Adapters, PostgreSQL, PostgreSQL full-text search, Valkey/Redis-compatible cache, BullMQ queues.
- Modules: Auth, User, Library, Ebook, Holding, Loan, Notification, Admin, Integration, Audit.
- Worker queues: `metadata-sync`, `availability-refresh`, `search-indexing`, `notification-dispatch`, `integration-health`.

Feature work should add behavior inside the owning module and interact through service interfaces rather than mutating another module's records directly.

## Security Guardrails

- MVP must not collect, store, proxy, log, or reuse external electronic-library user credentials.
- Admin MFA uses application-managed TOTP compatible with Google Authenticator.
- External redirects, adapter requests, object-level authorization, logging, retention, and provenance must follow [SECURITY.md](./SECURITY.md).
- Crawler-based adapters must remain disabled until crawler policy review requirements are selected and satisfied.
- Email and Web Push delivery providers and provider-specific credentials remain deferred.

## GitHub Workflow

- Work from the main epic task list.
- Create a branch per issue.
- Open a PR with a short summary and verification evidence.
- Merge the PR, close the completed issue, and update the epic task list.
- Every new GitHub issue must use [REQUIREMENT_TEMPLATE.md](./REQUIREMENT_TEMPLATE.md).

## Current Verification

The skeleton currently verifies with:

```sh
npx pnpm@11.8.0 test
npx pnpm@11.8.0 lint
npx pnpm@11.8.0 typecheck
npx pnpm@11.8.0 build
```

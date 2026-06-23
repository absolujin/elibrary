## Requirement

As a `project maintainer`, I need `the unresolved MVP decisions captured and either resolved or explicitly deferred` so that `implementation does not invent framework, provider, deployment, retention, or design choices`.

## Owner

- Domain: `agent-workflow`
- Owning file: `CLAUDE.md`
- Existing requirement/control/decision ID, if any: `none`

## Scope

In scope:

- Review open questions in `REQUIREMENTS.md`, `ARCHITECTURE.md`, `SECURITY.md`, and `DESIGN.md`.
- Record decisions or explicit deferrals for first libraries, metadata source, internal API-based borrowing or future external-library automatic borrowing/account linking, OAuth account-linking model, notification channels, notification delivery providers and credential ownership, backend framework, frontend framework, OAuth providers, search index, queue approach, MVP load profile, deployment target, observability stack, retention periods, admin MFA provider, external API key ownership, crawler policy review, and workflow commands.
- Update the owning spec files with resolved or deferred values.

Out of scope:

- Implementing application code.
- Choosing vendors or providers without a recorded user/project decision.

## Acceptance Criteria

- Given the current specs, when unresolved decisions are reviewed, then each open question is answered or explicitly deferred in the owning file.
- Given a decision is resolved, when the owning file is updated, then the corresponding open question is removed or rewritten as a remaining deferred decision.
- Given a decision is deferred, when implementation work references it, then the relevant issue lists the deferred decision as a dependency.

## Verification

- Test or check: `manual check; deferred until implementation workflow exists`
- Evidence required: `Updated open-question sections and a list of resolved/deferred decisions.`

## Resolved Decisions

- Initial ebook metadata sources are public electronic-library APIs and public ISBN/book metadata sources. Exact source providers and library-specific adapter mappings remain constrained by the deferred first-library decision.
- MVP social/OAuth sign-in providers are Google, Apple, Kakao, and Naver.
- OAuth identities are automatically linked to existing email accounts only when SECURITY.md account-linking conditions are satisfied.
- Internal API-based borrowing and external-library automatic borrowing/account linking are allowed only under SECURITY.md credential-handling and future-linking controls.
- Saved-book and availability-change notifications use email, Web Push, and in-app channels, configurable from account settings.
- Retention periods are recent searches 90 days, loan attempts 1 year, integration events 90 days, audit events 3 years, and in-app notifications/notification delivery records 90 days.
- Backend framework is NestJS.
- Frontend framework is React.
- MVP search index is PostgreSQL full-text search.
- MVP worker queues use BullMQ through `@nestjs/bullmq` on a self-managed Valkey or Redis-compatible service.
- MVP/demo deployment target is zero-cost Oracle Cloud Always Free using a single Arm/Ampere VM, Docker Compose, self-managed PostgreSQL, self-managed Valkey or Redis-compatible cache, and Caddy or Nginx with Let's Encrypt for HTTPS.
- MVP/demo observability uses container/application logs, health checks, and OCI Always Free Logging, Monitoring, Notifications, and Application Performance Monitoring where available; paid observability services are out of scope.
- The zero-cost deployment is not production-grade until backup, patching, monitoring, recovery, and capacity risks are explicitly accepted.
- Admin MFA uses application-managed TOTP compatible with Google Authenticator plus single-use recovery codes.
- Admins register and rotate external library API keys from service settings while creating or editing integrated libraries.
- The MVP home screen includes popular ebook and recent discovery modules below the primary search area.
- Search results default to card layout, and a user's selected card/list layout is reused on later search result visits for the same Member account or browser context when available.
- Missing ebook covers use a default ebook-cover image containing the ebook title.
- MVP typography uses the system UI font stack; non-system brand fonts are out of scope for MVP.
- MVP responsive breakpoints are mobile below 768 px, tablet 768 px and up, and desktop 1024 px and up.
- Admin UI uses the same visual theme as public/member screens; only admin functionality and permissions are separate.
- MVP includes both light and dark modes using the tokens in `DESIGN.md`.
- JavaScript/TypeScript package management uses pnpm with a committed `pnpm-lock.yaml` once package manifests exist.
- Workflow commands are `pnpm test`, `pnpm lint`, `pnpm typecheck`, `pnpm build`, and `pnpm dev`.

## Deferred Decisions

- First supported public electronic libraries and each library's `integrated` or `link-only` classification are deferred by user decision.
- Email and Web Push delivery provider selection is deferred by user decision; implementation must not choose or integrate a delivery provider until this is decided.
- Email and Web Push delivery credential ownership is deferred by user decision; implementation must not create, store, or integrate provider-specific delivery credentials until this is decided.
- Target MVP load profile for `NFR-1.1` is deferred by user decision; implementation must not invent load assumptions for performance verification.
- Crawler policy review requirements are deferred by user decision; implementation must not enable crawler-based adapters until this is decided.

## Dependencies

- `REQUIREMENTS.md#open-questions`
- `ARCHITECTURE.md#open-architecture-questions`
- `SECURITY.md#open-security-questions`
- `DESIGN.md#open-questions`

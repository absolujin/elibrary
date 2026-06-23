# Epic: Build eLibrary MVP Web and API Foundation

## Objective

Build the bootstrap-stage eLibrary web and API application described in `REQUIREMENTS.md`: guests and members can browse public electronic libraries, search ebooks, view ebook details with holdings and availability, register usable libraries, personalize views, and continue to the appropriate external borrowing flow, while admins can manage libraries, integration status, duplicate ebook metadata, and audit/integration events.

## Task List

- [ ] [Resolve MVP implementation decisions before code](./01-resolve-mvp-implementation-decisions.md)
- [ ] [Establish modular monolith app skeleton](./02-establish-modular-monolith-skeleton.md)
- [ ] [Define primary data schema and ownership boundaries](./03-define-primary-data-schema.md)
- [ ] [Implement authentication, sessions, and role model](./04-implement-authentication-sessions-roles.md)
- [ ] [Implement API validation, response allowlists, and object-level authorization](./05-implement-api-validation-authorization.md)
- [ ] [Implement public library directory](./06-implement-public-library-directory.md)
- [ ] [Implement ebook metadata normalization and provenance](./07-implement-ebook-normalization-provenance.md)
- [ ] [Implement ebook search and search index flow](./08-implement-ebook-search.md)
- [ ] [Implement ebook detail and holdings flow](./09-implement-ebook-detail-holdings.md)
- [ ] [Implement LibraryAdapter registry and safe dispatch](./10-implement-library-adapter-registry.md)
- [ ] [Implement availability cache and refresh workers](./11-implement-availability-cache-workers.md)
- [ ] [Implement member library registration and personalization](./12-implement-member-library-registration.md)
- [ ] [Implement borrowing handoff and loan attempts](./13-implement-borrowing-handoff-loan-attempts.md)
- [ ] [Implement member activity and deletion paths](./14-implement-member-activity-deletion.md)
- [ ] [Implement admin library and integration operations](./15-implement-admin-library-integration.md)
- [ ] [Implement duplicate ebook metadata review](./16-implement-duplicate-metadata-review.md)
- [ ] [Implement audit and integration event capture](./17-implement-audit-integration-events.md)
- [ ] [Implement operational visibility indicators](./18-implement-operational-visibility.md)
- [ ] [Implement UI visual system and screen layouts](./19-implement-ui-visual-system.md)
- [ ] [Implement web client safety for external metadata and links](./20-implement-web-client-safety.md)
- [ ] [Implement infrastructure, secrets, and supply-chain baseline](./21-implement-infra-secrets-supply-chain.md)
- [ ] [Implement member notifications and preferences](./22-implement-member-notifications-preferences.md)

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

## Open Questions

- Deferred: first supported public electronic libraries and each library's `integrated` or `link-only` classification are not selected yet.
- Deferred: email and Web Push delivery providers are not selected yet; implementation MUST NOT choose or integrate a delivery provider until this is decided.
- Deferred: email and Web Push delivery credential ownership is not selected yet; implementation MUST NOT create, store, or integrate provider-specific delivery credentials until this is decided.
- Deferred: target MVP load profile for `NFR-1.1` is not defined yet; implementation MUST NOT invent load assumptions for performance verification.
- Deferred: crawler policy review requirements are not selected yet; implementation MUST NOT enable crawler-based adapters until this is decided.
- None beyond deferred decisions above.

## Dependencies

- `REQUIREMENTS.md`
- `ARCHITECTURE.md`
- `SECURITY.md`
- `DESIGN.md`
- `CLAUDE.md`
- `REQUIREMENT_TEMPLATE.md`

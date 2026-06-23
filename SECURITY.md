# eLibrary Security

This file owns the security posture for eLibrary: threat model, security requirements, controls, and trust-boundary enforcement. Product behavior belongs in [REQUIREMENTS.md](./REQUIREMENTS.md). Architecture belongs in [ARCHITECTURE.md](./ARCHITECTURE.md).

## Scope

In scope:

- User accounts, sessions, roles, and member-owned records.
- Public library, ebook, holding, availability, user-preference, saved-book, recent-search, loan-attempt, integration-event, audit-event, and adapter-configuration data.
- Backend API, Web App, Admin UI, workers, adapters, self-managed PostgreSQL, self-managed Valkey or Redis-compatible cache, search index, container logs, OCI no-cost logging/monitoring/notifications/APM where available, backups, and deployment pipeline.
- External electronic-library websites or APIs consumed through `LibraryAdapter`.
- Email sign-in and supported social/OAuth provider callbacks.
- Email and Web Push delivery providers once selected.
- External API keys or service tokens used by eLibrary.

Out of scope for MVP:

- External electronic-library credential handling; see `SR-001`.
- Automated login to external electronic libraries.
- Ebook file handling, DRM viewing, payments, or native mobile-app security.

Reference baseline:

- [OWASP Top 10 Proactive Controls](https://owasp.org/www-project-proactive-controls/) for access control, data protection, input validation, secure identities, browser controls, logging, component safety, and SSRF prevention.
- [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/) for implementation-level web, API, authentication, session, XSS, CSRF, logging, secrets, SSRF, and deployment guidance.
- [OWASP API Security Top 10](https://owasp.org/www-project-api-security/) for object-level authorization, authentication, property-level authorization, resource consumption, function-level authorization, SSRF, misconfiguration, API inventory, and safe third-party API consumption.
- [OWASP REST Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/REST_Security_Cheat_Sheet.html) for HTTPS, access control, token validation, HTTP method allowlisting, input validation, content-type handling, error handling, audit logs, security headers, CORS, and sensitive request data.
- [OWASP Authentication](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html) and [Session Management](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html) guidance for MFA, generic auth errors, session entropy, session renewal, cookie attributes, and TLS-only sessions.
- Backend framework hardening MUST use official NestJS security guidance plus OWASP web/API defaults.
- Frontend hardening MUST use official React documentation plus OWASP XSS/CSP guidance and treat all external metadata as untrusted.
- Zero-cost deployment hardening MUST use Oracle Cloud Infrastructure guidance for Always Free compute, virtual cloud networking, security lists or network security groups, block volume storage, logging, monitoring, notifications, vault where available, plus Docker host hardening and OWASP web/API defaults.

## Data Classification

| Class | Examples | Required handling |
| --- | --- | --- |
| Public | library name, region, homepage URL, public ebook metadata | integrity checks and safe rendering |
| Internal | adapter configuration, integration status, admin notes | admin or system access only |
| Personal | email, display name, user preferences, registered libraries, saved books, notification preferences, push subscriptions | member ownership checks and deletion path |
| Sensitive activity | recent searches, loan attempts, redirect URLs, notification content, notification delivery events, audit events | least disclosure, retention limits, log masking |
| Secret | API keys, OAuth secrets, session signing keys, admin TOTP seeds, admin recovery codes | secret store, rotation, no plaintext logs |
| Prohibited | external electronic-library user credentials or cookies | governed by `SR-001` |

## STRIDE Threat Model

| Category | eLibrary threat | Required controls |
| --- | --- | --- |
| Spoofing | Attacker impersonates a Guest, Member, Admin, System worker, OAuth provider, external library, or approved redirect destination. | SR-001, SR-002, SR-003, SR-004, SR-006, SR-007, SR-009 |
| Tampering | Attacker changes library metadata, availability state, redirect URLs, search index contents, cache entries, worker job payloads, adapter config, or audit records. | SR-003, SR-004, SR-006, SR-009, SR-011, SR-013, SR-014 |
| Repudiation | Actor denies sign-in, OAuth callback, admin change, sync, parser failure, external redirect, or loan-attempt action. | SR-008, SR-009, SR-012, SR-014 |
| Information Disclosure | Personal activity, registered libraries, saved books, recent searches, loan attempts, raw external responses, OAuth data, tokens, secrets, redirect URLs, or referrer data leaks through APIs, logs, redirects, caches, indexes, assets, or analytics. | SR-001, SR-004, SR-005, SR-007, SR-008, SR-010, SR-011, SR-013 |
| Denial of Service | Expensive guest search, sync storms, parser failures, poisoned job queues, queue starvation, external rate limits, cache loss, or admin-triggered syncs degrade service. | SR-004, SR-006, SR-008, SR-011, SR-012, SR-015 |
| Elevation of Privilege | Guest acts as Member, Member accesses another Member's records, non-admin reaches admin APIs, worker job accesses the wrong library config, or OAuth account linking grants the wrong identity. | SR-002, SR-003, SR-009, SR-011, SR-014 |

## Security Requirements

### SR-001 External Library Credentials

- MVP MUST NOT collect, store, proxy, log, or reuse external electronic-library credentials, session cookies, or login forms.
- Future external-library account linking MUST require explicit consent, encrypted storage, managed keys, access audit logs, immediate disconnect/delete, least-privilege access, incident-response coverage, and legal/terms review.
- Internal API-based borrowing is allowed only when eLibrary can perform the flow through an approved library API without collecting, storing, proxying, logging, or reusing external electronic-library user credentials or cookies.
- External-library automatic borrowing is allowed only after credential handling, account linking, consent, auditability, disconnect/delete, incident-response, and legal/terms controls are implemented and reviewed.

### SR-002 Authentication and Sessions

- Email/password auth, if implemented, MUST use a current password hashing algorithm such as Argon2id or bcrypt.
- Password reset tokens MUST be single-use, short-lived, and stored hashed.
- Sign-in, sign-up, and reset flows MUST return generic errors that do not reveal whether an account exists.
- Sign-in, sign-up, password reset, and token/session refresh flows MUST be rate-limited.
- Web sessions MUST use HTTPS-only cookies with `HttpOnly`, `Secure`, and `SameSite=Lax` or stricter.
- Session IDs MUST be high-entropy opaque identifiers with no personal or authorization data embedded.
- Sessions MUST be renewed after sign-in and privilege changes.
- Access tokens, if used, MUST be short-lived and validate issuer, audience, expiry, not-before time, and signature configuration.
- Refresh tokens, if used, MUST be revocable or rotated.
- OAuth providers MUST be allowlisted, and OAuth flows MUST validate fixed redirect URIs, state, nonce where applicable, and PKCE where supported.
- OAuth identity auto-linking MUST occur only when the provider is allowlisted, provider tokens are fully validated, the provider supplies a verified email claim, the normalized email exactly matches an existing email account, and the target account is active.
- OAuth identity auto-linking MUST NOT occur when the provider email is absent, unverified, mismatched, ambiguous, or attached to a disabled or restricted account.
- OAuth identity linking MUST emit an authentication audit event and MUST renew the session after linking.
- Passwords, OAuth codes, access tokens, refresh tokens, and session tokens MUST NOT appear in URLs, logs, analytics, or client-visible error messages.
- Logout MUST invalidate server-side session state or refresh tokens.
- Admin accounts MUST use application-managed TOTP MFA compatible with Google Authenticator.
- Admin TOTP seeds MUST be stored encrypted or otherwise protected as secrets.
- Admin recovery codes MUST be single-use, stored hashed, shown only at generation time, and regenerable after fresh admin authentication.
- SMS MFA and paid MFA providers are out of scope for MVP.

### SR-003 Authorization

- Roles are `guest`, `member`, `admin`, and `system`.
- Authorization MUST be deny-by-default.
- Every API that accepts a member-owned object ID MUST enforce object-level authorization for that object.
- Member-owned IDs include `userLibraryId`, saved-book IDs, search-history IDs, loan-attempt IDs, notification IDs, notification-preference IDs, and push-subscription IDs.
- Admin APIs MUST require admin role checks.
- System workers MUST receive only permissions required for their jobs.
- Admins MUST NOT view passwords, session tokens, or unmasked secrets.

### SR-004 API Input and Response Safety

- All API inputs MUST be schema-validated for type, length, range, format, enum, and allowed values.
- Request body properties MUST be allowlisted per endpoint and role; unknown or unauthorized properties MUST be rejected.
- Search queries, pagination, sorting, filtering, UUIDs, ISBNs, URLs, request body size, and content types MUST have explicit limits.
- HTTP methods MUST be allowlisted per endpoint.
- Cookie-authenticated state-changing requests MUST include CSRF protection.
- CORS MUST allow only approved origins.
- API responses MUST NOT include stack traces, secrets, tokens, raw external responses, or internal parser details.
- API response properties MUST be allowlisted per endpoint and role so member-owned, admin-only, or internal fields are not exposed by default.
- External redirect targets MUST be validated against approved library domains.
- Repeat state-changing requests MUST be idempotent or protected from duplicate-submission side effects where duplicate records could mislead users or operators.

### SR-005 Web Client Safety

- Production traffic MUST use HTTPS with HSTS.
- The Web App and Admin UI MUST use a Content Security Policy that restricts scripts, images, styles, and connection targets.
- User input and external metadata MUST be escaped or sanitized before rendering.
- External links opened in a new context MUST use `rel="noopener noreferrer"`.
- Referrer policy MUST prevent sensitive eLibrary paths or query strings from leaking to external libraries.
- Remote cover images and external assets MUST be constrained by allowlisting, proxying, CSP, or equivalent controls.
- Mixed content MUST be blocked.

### SR-006 Adapter and External Request Safety

- External requests MUST be restricted to configured library domains.
- Redirect following MUST validate the final destination.
- `getLoanUrl` results MUST be validated against the selected holding's configured library before being returned or stored.
- Adapter-driven requests MUST block localhost, private/internal IP ranges, metadata endpoints, and other non-approved destinations.
- User input MUST NOT be directly concatenated into external URLs.
- Worker job payloads MUST use internal IDs and bounded parameters, not raw external URLs, credentials, secrets, or adapter configuration blobs.
- Adapters MUST use per-library timeouts, retry limits, and circuit breakers.
- Adapter jobs MUST be isolated by library so one degraded integration cannot starve unrelated libraries.
- External HTML and JSON MUST be treated as untrusted input.
- Parser failures MUST produce normalized errors and admin-visible events.
- Robots rules and service terms MUST be respected before crawler-based adapters are enabled.
- Crawler-based adapters MUST remain disabled until crawler policy review requirements are selected and satisfied.

### SR-007 Secrets Management

- Secrets MUST NOT be committed to the repository.
- Local `.env` files MUST stay ignored by version control.
- Deployment secrets MUST live outside the repository and container images, using OCI Vault where available at no cost or root-readable environment files with strict host permissions.
- Secrets MUST have a rotation procedure.
- External API keys SHOULD be scoped per library when possible.
- Admins MUST register and rotate external library API keys through service settings while creating or editing integrated libraries.
- External library API key values MUST be write-only after submission, masked in admin screens, and never returned by APIs.
- External library API key creation, update, rotation, and removal MUST emit audit events.
- Email and Web Push delivery credentials MUST be treated as secrets once providers and credential ownership are selected.
- Email and Web Push provider-specific credentials MUST NOT be created, stored, or integrated while provider selection and credential ownership are deferred.

### SR-008 Logging and Monitoring

- Logs MUST NOT include passwords, tokens, session IDs, authorization headers, OAuth codes, refresh tokens, external library credentials, raw external responses, or unnecessary raw search text.
- Container logs, application logs, OCI Logging, OCI Monitoring, OCI Notifications, and OCI Application Performance Monitoring telemetry MUST follow the same data-minimization and secret-masking rules as application logs.
- Logs MAY include request ID, correlation ID, internal or hashed user ID, API path, response status, library ID, adapter error code, notification delivery status code, processing time, and cache hit/miss.
- Traces and custom metrics MUST avoid raw search text, raw external URLs, personal notification content, OAuth data, secrets, tokens, and raw external responses.
- The system MUST monitor login failure spikes, admin permission changes, unusual admin login patterns, integration error spikes, notification delivery failure spikes, rate-limit exhaustion, abnormal search/loan-attempt patterns, secret access/rotation events, and audit-event write failures.
- MVP operator alerts MUST route through OCI Notifications where available within Always Free limits; otherwise a documented manual alert check is required for zero-cost operation.

### SR-009 Admin Security

- Admin console access MUST require admin role checks.
- Admin actions MUST be audited.
- Admin MFA enrollment, recovery-code generation, and MFA reset events MUST be audited.
- Library adapter setting changes, external library API key changes, library deactivation, admin role changes, and manual syncs are high-risk actions.
- High-risk admin actions MUST require fresh admin authentication or documented operator approval.
- Secret values MUST be masked in admin screens.
- Admin privilege grant and revocation MUST require documented operator approval.

### SR-010 Data Protection, Retention, and Deletion

- TLS MUST protect data in transit.
- Databases and backups MUST be encrypted at rest.
- Account deletion MUST delete or anonymize profile, registered libraries, saved books, personalization data, recent searches, and activity.
- Account deletion MUST delete or anonymize notification preferences, push subscriptions, in-app notifications, and notification delivery records tied to the account.
- Analytics aggregates MUST NOT identify a person.
- Search indexes MUST NOT contain member-owned activity, user preferences, registered-library selections, saved books, recent searches, loan attempts, notification preferences, push subscriptions, notification records, emails, or display names.
- Notification payloads sent by email or Web Push MUST minimize personal activity disclosure, MUST NOT include credentials, tokens, raw redirect URLs, or sensitive query strings, and SHOULD link back to authenticated eLibrary views for details.
- Web Push subscriptions MUST be treated as member-owned records and MUST be removable from account settings.
- Backup retention MUST document how deletion requests age out of backups.
- Recent searches MUST be retained for 90 days.
- Loan attempts MUST be retained for 1 year.
- Integration events MUST be retained for 90 days.
- Audit events MUST be retained for 3 years.
- In-app notifications and notification delivery records MUST be retained for 90 days.

### SR-011 Infrastructure and Supply Chain

- MVP/demo deployment target is Oracle Cloud Always Free using a single Arm/Ampere VM with Docker Compose, self-managed PostgreSQL, self-managed Valkey or Redis-compatible cache, and no paid services.
- The zero-cost deployment is not production-grade until backup, patching, monitoring, recovery, and capacity risks are explicitly accepted.
- PostgreSQL and Valkey or Redis-compatible ports MUST NOT be public network targets.
- API, worker, database, cache, and search access MUST be network-restricted to required OCI VCN, subnet, security-list or network-security-group, host firewall, and Docker network paths.
- The VM MUST disable password SSH login, require key-based administration, run automatic security updates where safe, and document a patching cadence.
- Docker services MUST run with least-privilege users, restricted ports, bounded resources, and no unnecessary host mounts.
- Public ingress MUST terminate TLS through Caddy or Nginx with Let's Encrypt before traffic reaches application services.
- Containers MUST run as least-privilege users.
- Production and development data/secrets MUST be separated.
- Production data MUST NOT be copied locally unless anonymized.
- PostgreSQL storage, cache persistence if enabled, logs, OCI observability data, and backups MUST use encryption and access controls appropriate to their data class.
- Runtime dependencies MUST be actively maintained, with a commit or release within the last 12 months.
- Runtime dependencies MUST use the latest stable major version. Deprecated, abandoned, or pre-release packages MUST NOT be used in production.
- Any library with known unpatched CVEs MUST be rejected before adding or updating it.
- Direct and transitive dependencies MUST be reviewed before adding or updating runtime dependencies.
- pnpm is the selected package manager.
- `pnpm-lock.yaml` MUST be committed once package manifests exist, and production dependency versions MUST NOT float.
- The root package manifest MUST pin the pnpm tool version through an exact `packageManager` value once package manifests exist.
- Dependency vulnerability scanning MUST run once CI exists.
- Unused dependencies MUST be removed.
- External CDN scripts SHOULD be avoided; if used, they MUST require CSP and integrity controls.

### SR-012 Backup, Recovery, and Incident Response

- Self-managed PostgreSQL MUST have scheduled encrypted backups and recovery rehearsals before public demo or production use.
- Backups SHOULD be copied off the VM to OCI Always Free Object Storage, Archive Storage, or another no-cost off-host location where available.
- Valkey or Redis-compatible cache or BullMQ operational state loss MUST NOT cause primary data loss.
- Search indexes MUST be rebuildable from primary data.
- `SEV-1` covers possible personal data or secret exposure, authentication bypass, or admin takeover.
- `SEV-2` covers single-user data exposure, admin malfunction, or suspected external integration secret exposure.
- `SEV-3` covers library integration outage, rate-limit issue, or non-sensitive logging problem.
- Incident response MUST include isolation, secret/session rotation or revocation, scope analysis from logs/audit records, required notification, control fixes, and post-incident review.

### SR-013 Data Integrity and Provenance

- External ebook, holding, availability, and redirect data MUST keep source library, external record ID, adapter version, fetched time, and normalized time when available.
- Stored redirect URLs MUST strip credentials, fragments, and sensitive query parameters; if safe storage is unclear, store only normalized destination metadata.
- PostgreSQL MUST remain the authority for persisted records.
- Valkey or Redis-compatible cache, BullMQ operational state, and search indexes MUST be treated as derived stores.
- Derived stores MUST be rebuildable from primary records and external refresh jobs.
- Stale or unknown availability MUST NOT be presented as confirmed current availability.
- Conflicting external records MUST preserve provenance for operator review.

### SR-014 Auditability and Non-Repudiation

- Admin actions, high-risk integration changes, external library API key changes, manual syncs, authentication events, loan attempts, and parser failures MUST emit audit events.
- Audit events MUST include actor or system identity, action, target, outcome, timestamp, and correlation ID.
- Audit timestamps MUST use a consistent server-side clock source.
- Audit events MUST be append-only to application callers.
- Audit retention MUST follow `SR-010` and be long enough to investigate account, admin, integration, and data-integrity incidents.

### SR-015 Abuse and Denial-of-Service Resistance

- Search, detail, auth, notification, admin, and sync endpoints MUST have risk-appropriate rate or workload limits.
- Search queries MUST have bounded length, pagination, and result limits.
- Library sync and availability refresh jobs MUST use per-library BullMQ queues or equivalent bulkheads.
- Failed external jobs MUST use bounded retry with backoff.
- Admin-triggered syncs MUST be limited so they cannot overwhelm workers or external libraries.
- Degraded external integrations MUST fail closed for that integration and MUST NOT block unrelated libraries.

## Trust Boundary Enforcement

| Boundary | Enforcement owner |
| --- | --- |
| Browser to Web App | SR-002, SR-005 |
| Web App to Backend API | SR-002, SR-003, SR-004 |
| Admin UI to Backend API | SR-002, SR-003, SR-009, SR-014 |
| Email/OAuth provider to Backend API | SR-002, SR-004, SR-007, SR-008 |
| Backend API to data stores | SR-003, SR-010, SR-011, SR-013, SR-014 |
| Backend API or Worker to external libraries | SR-001, SR-006, SR-007, SR-013, SR-015 |
| Backend API or Worker to email and Web Push delivery providers | SR-007, SR-008, SR-010, SR-015 |
| External library metadata to normalization pipeline | SR-006, SR-013 |
| Worker to adapters | SR-003, SR-006, SR-015 |
| CI/CD to runtime environments | SR-007, SR-011 |

## Security Verification

- Implementation is blocked until STRIDE findings or explicit no-finding notes exist for Spoofing, Tampering, Repudiation, Information Disclosure, Denial of Service, and Elevation of Privilege.
- MVP release MUST verify SR-001 through SR-015.
- If automated tests are not yet available, each security requirement needs documented manual verification.
- External-library automatic borrowing or account-linking work MUST NOT start until SR-001 future-linking conditions are implemented and reviewed.

## Open Security Questions

- Deferred: email and Web Push delivery credential ownership is not selected yet; implementation MUST NOT create, store, or integrate provider-specific delivery credentials until this is decided.
- Deferred: crawler policy review requirements are not selected yet; implementation MUST NOT enable crawler-based adapters until this is decided.

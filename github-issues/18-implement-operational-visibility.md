## Requirement

As an `operator`, I need `operational visibility into search, detail, loan, notification, integration, and worker health` so that `failing integrations and degraded system behavior can be identified`.

## Owner

- Domain: `requirements`
- Owning file: `REQUIREMENTS.md`
- Existing requirement/control/decision ID, if any: `FR-8.1 | FR-8.2 | FR-8.3 | FR-8.4 | FR-9.6 | SR-008`

## Scope

In scope:

- Expose search volume, detail views, loan attempts, integration failures, and availability-check health to operators.
- Expose stale-data and BullMQ worker-backlog indicators for library integrations.
- Expose notification delivery failure indicators for email, Web Push, and in-app dispatch.
- Emit container/application logs and health-check results for the API, workers, PostgreSQL, Valkey or Redis-compatible cache, and public HTTPS endpoint.
- Use OCI Always Free Logging, Monitoring, Notifications, and Application Performance Monitoring where available without creating paid services.
- Keep paid external observability services out of the zero-cost deployment.
- Allow operators to identify which library integration is failing.
- Allow availability cache and external request policy configuration by library when supported.

Out of scope:

- Selecting a different observability vendor without updating `ARCHITECTURE.md` and `SECURITY.md`.
- Building paid observability, alerting, or tracing integrations.

## Acceptance Criteria

- Given operator metrics exist, when an operator opens the visibility view, then search volume, detail views, loan attempts, integration failures, and availability-check health are visible.
- Given a library integration fails, when the operator investigates, then the failing library can be identified.
- Given notification delivery failures spike, when the operator investigates, then the failing notification channel can be identified.
- Given stale data or BullMQ worker backlog exists, when the visibility view is inspected, then the condition is visible.
- Given API or worker telemetry is emitted, when zero-cost observability is inspected, then logs, health checks, and supported OCI no-cost telemetry are available.
- Given an MVP alert condition occurs, when alert routing is inspected, then OCI Notifications are used where available within Always Free limits or a documented manual alert check exists.
- Given an integration supports policy configuration, when an operator edits supported settings, then availability cache or external request policy changes are recorded.

## Verification

- Test or check: `deferred until implementation workflow exists`
- Evidence required: `Operator UI/API checks plus container/application logs, health checks, supported OCI no-cost telemetry, alert routing or manual alert checks, failing library identification, notification failure indicators, stale-data indicators, BullMQ backlog indicators, and supported policy configuration.`

## Dependencies

- `github-issues/11-implement-availability-cache-workers.md`
- `github-issues/17-implement-audit-integration-events.md`
- `github-issues/22-implement-member-notifications-preferences.md`
- `ARCHITECTURE.md#initial-architecture`
- `SECURITY.md#sr-008-logging-and-monitoring`

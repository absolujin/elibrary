## Requirement

As an `Admin or operator`, I need `audit and integration events captured with enough context` so that `security, data-integrity, and integration incidents can be investigated`.

## Owner

- Domain: `security`
- Owning file: `SECURITY.md`
- Existing requirement/control/decision ID, if any: `FR-7.6 | SR-008 | SR-014`

## Scope

In scope:

- Emit audit events for admin actions, high-risk integration changes, external library API key registration/rotation/removal, manual syncs, authentication events, loan attempts, and parser failures.
- Emit integration events for adapter errors, parser failures, sync results, and library-specific integration health.
- Include actor or system identity, action, target, outcome, timestamp, and correlation ID for audit events.
- Ensure audit events are append-only to application callers.

Out of scope:

- Full observability dashboards covered by a separate issue.

## Acceptance Criteria

- Given an audited action occurs, when the action completes or fails, then an audit event is created with required fields.
- Given an external library API key is registered, rotated, or removed, when the audit event is inspected, then the action is recorded without the secret value.
- Given an adapter or parser failure occurs, when the failure is handled, then an integration event is visible to Admins.
- Given application callers interact with audit events, when update or delete is attempted, then audit events remain append-only.
- Given integration events are older than 90 days, when retention cleanup runs, then they are deleted or anonymized according to `SR-010`.
- Given audit events are older than 3 years, when retention cleanup runs, then they are deleted or archived according to `SR-010` and append-only audit constraints.

## Verification

- Test or check: `deferred until implementation workflow exists`
- Evidence required: `Event creation checks for admin actions, external API key changes without secret values, auth events, loan attempts, parser failures, integration events, append-only behavior, and retention cleanup for integration/audit events.`

## Dependencies

- `github-issues/03-define-primary-data-schema.md`
- `SECURITY.md#sr-008-logging-and-monitoring`
- `SECURITY.md#sr-014-auditability-and-non-repudiation`

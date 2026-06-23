## Requirement

As a `Backend API`, I need `input validation, response allowlisting, deny-by-default authorization, and object-level checks` so that `API callers cannot tamper with or access unauthorized records`.

## Owner

- Domain: `security`
- Owning file: `SECURITY.md`
- Existing requirement/control/decision ID, if any: `SR-003 | SR-004`

## Scope

In scope:

- Validate API inputs for type, length, range, format, enum, allowed values, body size, content type, pagination, sorting, filtering, UUIDs, ISBNs, and URLs.
- Reject unknown or unauthorized request body properties.
- Allowlist response properties per endpoint and role.
- Enforce object-level authorization for member-owned IDs, including notification IDs, notification-preference IDs, and push-subscription IDs.

Out of scope:

- Endpoint-specific business logic for features covered by separate issues.
- UI validation as a substitute for API validation.

## Acceptance Criteria

- Given malformed or oversized input, when any API endpoint receives it, then the request is rejected with a safe error response.
- Given a Member supplies another Member's object ID, when the API handles the request, then access is denied.
- Given a Member supplies another Member's notification or push-subscription ID, when the API handles the request, then access is denied.
- Given a response is returned, when fields are inspected, then member-owned, admin-only, and internal fields are not exposed by default.

## Verification

- Test or check: `deferred until implementation workflow exists`
- Evidence required: `Validation and authorization tests covering invalid input, unknown properties, object-level access denial, and response allowlisting.`

## Dependencies

- `github-issues/04-implement-authentication-sessions-roles.md`
- `SECURITY.md#sr-003-authorization`
- `SECURITY.md#sr-004-api-input-and-response-safety`

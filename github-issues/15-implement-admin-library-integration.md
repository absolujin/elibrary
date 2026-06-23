## Requirement

As an `Admin`, I need `to manage library records and integration status` so that `operators can maintain the public directory and integration behavior`.

## Owner

- Domain: `requirements`
- Owning file: `REQUIREMENTS.md`
- Existing requirement/control/decision ID, if any: `FR-7.1 | FR-7.2 | FR-7.3 | FR-7.4 | SR-009`

## Scope

In scope:

- Implement admin endpoints for listing, creating, editing, deactivating, and reactivating library records.
- Allow Admins to set integration type and integration status.
- Allow Admins to register or rotate an external library API key from service settings when creating or editing an integrated library.
- Allow Admins to inspect integration failures by library.
- Allow Admins to trigger a library sync through the `metadata-sync` BullMQ queue when supported by the integration.
- Audit high-risk admin actions.

Out of scope:

- Implementing new adapter code for every external library.
- Enabling crawler-based adapters while crawler policy review requirements are deferred.

## Acceptance Criteria

- Given an Admin creates or edits a library, when the action succeeds, then the library record reflects the change.
- Given an Admin registers or rotates an external library API key in service settings, when the action succeeds, then the secret value is accepted for the selected library but is not returned by subsequent API responses.
- Given an Admin deactivates or reactivates a library, when the directory is viewed, then the integration status reflects the change.
- Given integration failures exist, when an Admin filters by library, then relevant failures are visible.
- Given a manual sync is triggered, when supported, then the sync is queued through BullMQ and audited.

## Verification

- Test or check: `deferred until implementation workflow exists`
- Evidence required: `Admin API/UI checks for create, edit, API key registration/rotation, masked secret handling, deactivate, reactivate, integration status, failure inspection, manual sync, and audit events.`

## Dependencies

- `github-issues/04-implement-authentication-sessions-roles.md`
- `github-issues/17-implement-audit-integration-events.md`
- `SECURITY.md#sr-009-admin-security`

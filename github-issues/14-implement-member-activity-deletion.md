## Requirement

As a `Member`, I need `to view and remove personal activity or request deletion` so that `my registered libraries, saved books, recent searches, loan attempts, and notification data are transparent and manageable`.

## Owner

- Domain: `requirements`
- Owning file: `REQUIREMENTS.md`
- Existing requirement/control/decision ID, if any: `FR-6.3 | FR-6.4 | FR-6.6 | FR-9.3 | SR-010`

## Scope

In scope:

- Implement Member account views for registered libraries, saved books, recent searches, loan attempts, notification preferences, in-app notifications, and push subscriptions.
- Implement removal of saved books and recent searches from the account view.
- Provide a user-visible path to request account deletion or personal activity deletion according to `SECURITY.md`.
- Enforce object-level authorization for member-owned activity.

Out of scope:

- Notification delivery implementation, which is owned by `github-issues/22-implement-member-notifications-preferences.md`.

## Acceptance Criteria

- Given a signed-in Member opens account activity, when records exist, then registered libraries, saved books, recent searches, loan attempts, notification preferences, and in-app notifications are visible to that Member where applicable.
- Given a Member removes a saved book or recent search, when removal succeeds, then it no longer appears in that Member's account view.
- Given recent searches are older than 90 days, when retention cleanup runs, then they are deleted or anonymized according to `SR-010`.
- Given loan attempts are older than 1 year, when retention cleanup runs, then they are deleted or anonymized according to `SR-010`.
- Given a Member requests account or activity deletion, when the path is used, then the request follows `SR-010`.
- Given another Member attempts access to the records, when the API handles the request, then access is denied.

## Verification

- Test or check: `deferred until implementation workflow exists`
- Evidence required: `Account activity API/UI checks for visibility, removal, deletion path, retention cleanup for recent searches and loan attempts, and object-level authorization.`

## Dependencies

- `github-issues/04-implement-authentication-sessions-roles.md`
- `github-issues/05-implement-api-validation-authorization.md`
- `github-issues/22-implement-member-notifications-preferences.md`
- `SECURITY.md#sr-010-data-protection-retention-and-deletion`

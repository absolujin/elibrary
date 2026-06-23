## Requirement

As a `Member`, I need `email, Web Push, and in-app notifications with account-level preferences` so that `I can choose how eLibrary tells me about saved-book and availability changes`.

## Owner

- Domain: `requirements`
- Owning file: `REQUIREMENTS.md`
- Existing requirement/control/decision ID, if any: `FR-9.1 | FR-9.2 | FR-9.3 | FR-9.4 | FR-9.5 | FR-9.6 | SR-003 | SR-010`

## Scope

In scope:

- Implement notification preferences for email, Web Push, and in-app channels.
- Provide account settings controls to enable or disable each channel.
- Store and remove Web Push subscriptions as member-owned records.
- Create in-app notifications for saved-book and availability-change events.
- Allow Members to view and mark in-app notifications as read.
- Dispatch notification jobs through the `notification-dispatch` BullMQ queue.
- Keep email and Web Push provider adapters and provider-specific delivery credentials unimplemented until future decisions select delivery providers and credential ownership.
- Minimize notification payloads according to `SECURITY.md`.

Out of scope:

- Selecting or integrating email or Web Push delivery providers, or creating provider-specific delivery credentials, while provider selection or credential ownership is deferred.
- Native mobile push notifications.
- Marketing or promotional notifications.

## Acceptance Criteria

- Given a signed-in Member opens account settings, when notification preferences are shown, then email, Web Push, and in-app channel controls are available.
- Given a Member disables a notification channel, when a saved-book or availability-change event occurs, then that channel is not used for that Member.
- Given a saved-book or availability-change event occurs and the Member has in-app notifications enabled, when the event is processed, then an in-app notification is visible only to that Member.
- Given a Member marks an in-app notification as read, when the action succeeds, then the read state is updated only for that Member.
- Given a notification dispatch job is created, when queue usage is inspected, then the `notification-dispatch` BullMQ queue is used.
- Given email or Web Push provider selection or credential ownership is deferred, when notification code is inspected, then no concrete delivery provider or provider-specific delivery credential is selected, created, or integrated.
- Given in-app notifications or notification delivery records are older than 90 days, when retention cleanup runs, then they are deleted or anonymized according to `SR-010`.

## Verification

- Test or check: `deferred until implementation workflow exists`
- Evidence required: `Preference UI/API checks, notification event fixtures, object-level authorization checks, 90-day notification retention cleanup, and payload-minimization review.`

## Dependencies

- `github-issues/01-resolve-mvp-implementation-decisions.md`
- `github-issues/03-define-primary-data-schema.md`
- `github-issues/05-implement-api-validation-authorization.md`
- `github-issues/11-implement-availability-cache-workers.md`
- `SECURITY.md#sr-003-authorization`
- `SECURITY.md#sr-010-data-protection-retention-and-deletion`

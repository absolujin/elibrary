# eLibrary Requirements

This file owns WHAT the system must do. Architecture belongs in [ARCHITECTURE.md](./ARCHITECTURE.md). Security and privacy controls belong in [SECURITY.md](./SECURITY.md). UI styling belongs in [DESIGN.md](./DESIGN.md).

## Required Requirement Inputs

- `Project purpose: Help users find ebooks across public electronic libraries, see which libraries hold or can lend a title, register libraries they can use, and continue to the appropriate external borrowing flow.`
- `Primary users / actors: Guest, Member, Admin, System worker`
- `Core workflows: Browse public electronic libraries; search ebooks; discover popular and recent ebooks from the home screen; choose and retain search result display layout; view ebook details, holdings, and availability; register usable libraries; personalize search/detail views by registered libraries; continue to an external borrowing page; administer libraries, integration status, external library API keys from service settings, duplicate ebook metadata, and audit/integration events.`
- `Business objects / data entities: users, user_preferences, user_libraries, saved_books, recent_searches, libraries, integration_events, ebooks, ebook_aliases / identifier merge keys, holdings, availability_snapshots, loan_attempts, notification_preferences, notifications, push_subscriptions, audit_events, adapter configuration.`
- `External integrations: public electronic-library websites or APIs; public ISBN/book metadata sources; LibraryAdapter integrations for searchBooks, getBookDetail, getAvailability, and getLoanUrl; email sign-in and Google, Apple, Kakao, and Naver social/OAuth providers; email and Web Push delivery provider selection and credential ownership are deferred.`
- `Authentication / roles: Guest, Member, Admin, System worker. Member sign-in supports email and Google, Apple, Kakao, and Naver social/OAuth providers. Security controls are defined in SECURITY.md.`
- `Regulatory or privacy constraints: SECURITY.md owns security and privacy controls.`

## Functional Requirements

Each numbered requirement is an acceptance criterion: the implementation passes only when the named actor can observe the stated behavior and data handling.

### FR-1 Public Library Directory

- `FR-1.1` The system MUST allow Guests and Members to browse public electronic-library records.
- `FR-1.2` Each library record MUST show name, region, operator, eligibility or usage conditions, homepage URL, ebook service URL, and integration status when those fields are known.
- `FR-1.3` The system MUST allow users to search or filter libraries by name, region, and operator.
- `FR-1.4` The system MUST distinguish integrated libraries from link-only libraries.

### FR-2 Ebook Search and Discovery

- `FR-2.1` The system MUST allow Guests and Members to search ebook metadata by keyword.
- `FR-2.2` Search MUST match title, author, publisher, ISBN, and subject terms when those fields are available.
- `FR-2.3` Each search result MUST show title, cover image, author, publisher, publication date, summary, holding library count, and available library count when known.
- `FR-2.4` Search results SHOULD support filters for availability, registered-library holdings, library, region, publication year, and category when the data is available.
- `FR-2.5` Search results SHOULD support relevance, newest-first, and availability sorting when the data is available.
- `FR-2.6` The home screen MUST include popular ebook and recent discovery modules when public catalog or aggregate activity data is available, without blocking the primary keyword search path.
- `FR-2.7` Search results MUST default to card layout when no saved display preference exists.
- `FR-2.8` Guests and Members MUST be able to switch search results between card and list layouts; the system MUST reuse the last selected layout on later search result visits for the same Member account or browser context when available.
- `FR-2.9` When a search result has no cover image, the system MUST show a default ebook cover image containing the ebook title.

### FR-3 Ebook Detail, Holdings, and Availability

- `FR-3.1` The system MUST show ebook detail fields including title, cover image, author, publisher, publication date, ISBN, description, category, and language when available.
- `FR-3.2` The system MUST show libraries that hold the ebook.
- `FR-3.3` Each holding MUST show one user-visible state: available, loaned out, reservable, owned but status unknown, not owned, login required, or integration unavailable.
- `FR-3.4` Each holding MUST show the last availability check time when known.
- `FR-3.5` For Members, registered libraries MUST be prioritized before other libraries in detail views.
- `FR-3.6` When an ebook detail has no cover image, the system MUST show a default ebook cover image containing the ebook title.

### FR-4 Member Libraries and Personalization

- `FR-4.1` A Member MUST be able to register a usable electronic library from the directory or detail flow.
- `FR-4.2` A Member MUST be able to remove a registered library.
- `FR-4.3` A Member MUST be able to mark one registered library as default.
- `FR-4.4` A Member MAY add or edit a note on a registered library.
- `FR-4.5` Search and detail screens MUST be able to prioritize or filter by the Member's registered libraries.

### FR-5 Borrowing Redirect

- `FR-5.1` The system MUST show a borrow or follow-up action only when the selected holding state supports it.
- `FR-5.2` The borrow action MUST identify the destination library before the user leaves eLibrary.
- `FR-5.3` Starting a borrow action MUST create a loan attempt record.
- `FR-5.4` The system MUST return an external library detail or borrowing URL for the selected holding when known.
- `FR-5.5` The loan attempt record MUST include selected library, ebook holding, result state, timestamp, and a redirect URL or normalized redirect destination when permitted by SECURITY.md.
- `FR-5.6` The MVP MUST NOT require confirmation that the external borrowing action was completed.
- `FR-5.7` eLibrary MUST NOT display external electronic-library login forms, request external electronic-library credentials, or imply that borrowing is completed inside eLibrary.
- `FR-5.8` Internal API-based borrowing MAY be supported when a selected library exposes an approved API and the flow satisfies SECURITY.md controls.
- `FR-5.9` External-library automatic borrowing or external-library account linking MAY be supported only when SECURITY.md credential-handling and future-linking conditions are implemented and reviewed.

### FR-6 Member Account and Activity

- `FR-6.1` A user MUST be able to sign up, sign in, and sign out using email or a supported social/OAuth provider.
- `FR-6.2` Supported MVP social/OAuth providers MUST be Google, Apple, Kakao, and Naver.
- `FR-6.3` A Member MUST be able to view registered libraries, saved books, recent searches, and loan attempts.
- `FR-6.4` A Member MUST be able to remove saved books and recent searches from their account view.
- `FR-6.5` Guest users MUST be able to use public browsing and search features without signing in.
- `FR-6.6` A Member MUST have a user-visible path to request account deletion or personal activity deletion according to SECURITY.md.
- `FR-6.7` Supported OAuth identities MUST be automatically linked to an existing email account only when the account-linking conditions in SECURITY.md are satisfied.

### FR-7 Admin Operations

- `FR-7.1` An Admin MUST be able to create, edit, deactivate, and reactivate library records.
- `FR-7.2` An Admin MUST be able to set a library's integration type and integration status.
- `FR-7.3` An Admin MUST be able to inspect integration failures by library.
- `FR-7.4` An Admin MUST be able to trigger a library sync when supported by the integration.
- `FR-7.5` An Admin MUST be able to review and correct duplicate or merged ebook metadata.
- `FR-7.6` An Admin MUST be able to inspect audit and integration events.
- `FR-7.7` An Admin MUST be able to register or rotate an external library API key from service settings while creating or editing an integrated library, with secret handling controlled by SECURITY.md.

### FR-8 Operational Visibility

- `FR-8.1` The system MUST expose search volume, detail views, loan attempts, integration failures, and availability-check health to operators.
- `FR-8.2` The system MUST allow operators to identify which library integration is failing.
- `FR-8.3` The system MUST expose stale-data and worker-backlog indicators for library integrations.
- `FR-8.4` The system SHOULD allow operators to configure availability cache and external request policies by library when the integration supports it.

### FR-9 Member Notifications

- `FR-9.1` A Member MUST be able to receive notifications for saved-book and availability-change events.
- `FR-9.2` The supported MVP notification channels MUST be email, Web Push, and in-app notifications.
- `FR-9.3` A Member MUST be able to enable or disable notification channels from account settings.
- `FR-9.4` A Member MUST be able to view in-app notifications while signed in.
- `FR-9.5` A Member MUST be able to mark in-app notifications as read.
- `FR-9.6` Notification delivery MUST follow SECURITY.md controls for personal activity disclosure, object-level access, and delivery payload minimization.

## Non-Functional Requirements

### NFR-1 Responsiveness and Degraded Integration Behavior

- `NFR-1.1` Search first response SHOULD complete within 2 seconds under the target MVP load profile. Acceptance: given the target MVP load profile is defined, when a Guest or Member searches, then the first response is returned within 2 seconds for supported test cases. The target MVP load profile is deferred.
- `NFR-1.2` Search and detail responses MUST NOT wait on slow live external-library calls when persisted or cached data can produce a truthful response. Acceptance: given one external library is slow or unavailable, when a user searches or opens detail, then available persisted or cached results for unaffected libraries are still returned.
- `NFR-1.3` A degraded library integration MUST NOT block unrelated library results. Acceptance: given one library integration is degraded, when search, detail, or availability refresh runs, then unrelated libraries remain visible and actionable according to their known state.

## Open Questions

- Deferred: first supported public electronic libraries are not selected yet; implementation MUST NOT hard-code or seed a final MVP library list until this is decided.
- Deferred: email and Web Push delivery providers and credential ownership are not selected yet; implementation MUST NOT choose or integrate a delivery provider or create provider-specific delivery credentials until this is decided.
- Deferred: target MVP load profile for `NFR-1.1` is not defined yet; implementation MUST NOT invent load assumptions for performance verification.

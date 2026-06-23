## Requirement

As a `Member`, I need `to register, manage, and use my available electronic libraries` so that `search and detail views can prioritize libraries I can use`.

## Owner

- Domain: `requirements`
- Owning file: `REQUIREMENTS.md`
- Existing requirement/control/decision ID, if any: `FR-4.1 | FR-4.2 | FR-4.3 | FR-4.4 | FR-4.5`

## Scope

In scope:

- Implement `GET /api/me/libraries`, `POST /api/me/libraries`, `PATCH /api/me/libraries/{userLibraryId}`, and `DELETE /api/me/libraries/{userLibraryId}`.
- Allow Members to register, remove, mark default, and add/edit a note on a registered library.
- Make registered libraries available for prioritization or filtering in search and detail screens.
- Enforce object-level authorization for `userLibraryId`.

Out of scope:

- Validating that the Member actually has an account at the external library.
- Collecting external electronic-library credentials.

## Acceptance Criteria

- Given a signed-in Member selects a library, when registration is submitted, then the library is added to that Member's registered libraries.
- Given a Member edits default or memo fields, when the update is accepted, then the registered library row reflects the change.
- Given a Member removes a registered library, when removal succeeds, then it no longer appears in that Member's registered library list.
- Given a Member references another Member's `userLibraryId`, when the API receives the request, then access is denied.

## Verification

- Test or check: `deferred until implementation workflow exists`
- Evidence required: `API and UI checks for create, update, delete, default, memo, personalization, and object-level denial.`

## Dependencies

- `github-issues/04-implement-authentication-sessions-roles.md`
- `github-issues/05-implement-api-validation-authorization.md`
- `github-issues/06-implement-public-library-directory.md`


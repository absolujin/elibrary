## Requirement

As a `Member`, I need `a safe borrowing handoff to the selected external library` so that `I can continue borrowing outside eLibrary while eLibrary records the attempt`.

## Owner

- Domain: `requirements`
- Owning file: `REQUIREMENTS.md`
- Existing requirement/control/decision ID, if any: `FR-5.1 | FR-5.2 | FR-5.3 | FR-5.4 | FR-5.5 | FR-5.6 | FR-5.7 | FR-5.8 | FR-5.9 | SR-001 | SR-006 | SR-013`

## Scope

In scope:

- Implement `POST /api/holdings/{holdingId}/loan-attempts`.
- Show borrow or follow-up action only when the selected holding state supports it.
- Identify the destination library before the user leaves eLibrary.
- Resolve holding and library server-side.
- Use `LibraryAdapter.getLoanUrl`, validate the URL against the selected library, and return approved URL or normalized destination.
- Support internal API-based borrowing only when the selected library exposes an approved API and SECURITY.md controls are satisfied.
- Create a loan attempt with selected library, ebook holding, result state, timestamp, and redirect URL or normalized destination when permitted by `SECURITY.md`.

Out of scope:

- Confirming external borrowing completion.
- Displaying external library login forms or collecting external library credentials.
- External-library automatic borrowing or account linking before `SR-001` future-linking controls are implemented and reviewed.

## Acceptance Criteria

- Given a holding state does not support borrowing, when the detail view renders, then the borrow action is not shown as a primary available action.
- Given a supported holding is selected, when the borrowing handoff begins, then a loan attempt is created.
- Given the adapter returns a URL outside the selected library's approved domain, when validation runs, then the URL is rejected.
- Given a selected library exposes an approved internal borrowing API and SECURITY.md controls are satisfied, when borrowing begins, then the API flow records a loan attempt outcome without collecting external library credentials.
- Given a borrowing path requires external library credentials and `SR-001` future-linking controls are not implemented and reviewed, when borrowing actions are evaluated, then that path is not offered inside eLibrary.
- Given a user is handed off, when the response is shown, then the destination library is identified before leaving eLibrary.

## Verification

- Test or check: `deferred until implementation workflow exists`
- Evidence required: `Borrowing API/UI checks for state gating, server-side holding resolution, URL validation, loan attempt creation, and no credential collection.`

## Dependencies

- `github-issues/09-implement-ebook-detail-holdings.md`
- `github-issues/10-implement-library-adapter-registry.md`
- `SECURITY.md#sr-001-external-library-credentials`
- `SECURITY.md#sr-006-adapter-and-external-request-safety`
- `SECURITY.md#sr-013-data-integrity-and-provenance`

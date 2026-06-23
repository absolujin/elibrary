## Requirement

As a `Guest or Member`, I need `to browse and filter public electronic-library records` so that `I can find libraries that may provide ebook access`.

## Owner

- Domain: `requirements`
- Owning file: `REQUIREMENTS.md`
- Existing requirement/control/decision ID, if any: `FR-1.1 | FR-1.2 | FR-1.3 | FR-1.4`

## Scope

In scope:

- Implement public library listing and library detail read flows.
- Show name, region, operator, eligibility or usage conditions, homepage URL, ebook service URL, and integration status when known.
- Support search or filtering by name, region, and operator.
- Distinguish integrated libraries from link-only libraries.

Out of scope:

- Admin editing of libraries.
- External adapter execution.

## Acceptance Criteria

- Given a Guest or Member opens the library directory, when library records exist, then the system lists public electronic-library records.
- Given known library fields exist, when a record is shown, then required fields from `FR-1.2` are visible.
- Given search or filter input by name, region, or operator, when the user applies it, then matching libraries are shown.
- Given a library is integrated or link-only, when shown, then that state is distinguishable.

## Verification

- Test or check: `deferred until implementation workflow exists`
- Evidence required: `API and UI checks for listing, detail, filtering, and integration status display.`

## Dependencies

- `github-issues/01-resolve-mvp-implementation-decisions.md`
- `github-issues/03-define-primary-data-schema.md`
- `github-issues/05-implement-api-validation-authorization.md`
- `DESIGN.md#public-library-directory`

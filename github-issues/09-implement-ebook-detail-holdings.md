## Requirement

As a `Guest or Member`, I need `ebook detail and holding availability views` so that `I can understand which libraries hold a title and what the current known borrowing state is`.

## Owner

- Domain: `requirements`
- Owning file: `REQUIREMENTS.md`
- Existing requirement/control/decision ID, if any: `FR-3.1 | FR-3.2 | FR-3.3 | FR-3.4 | FR-3.5 | FR-3.6`

## Scope

In scope:

- Implement `GET /api/ebooks/{ebookId}` and `GET /api/ebooks/{ebookId}/holdings`.
- Show ebook detail fields required by `FR-3.1` when available.
- Show a title-based default ebook cover image when the ebook has no cover image.
- Show holding libraries and one user-visible holding state per holding.
- Show last availability check time when known.
- Prioritize Member-registered libraries in detail views.

Out of scope:

- Creating loan attempts.
- Admin duplicate review.

## Acceptance Criteria

- Given an ebook exists, when the detail view opens, then fields required by `FR-3.1` are shown when available.
- Given an ebook detail has no cover image, when the detail view opens, then a default ebook cover image containing the title is visible.
- Given holdings exist, when holdings are shown, then each holding has one of the states listed in `FR-3.3`.
- Given an availability check time exists, when the holding row is shown, then that time is visible.
- Given a signed-in Member has registered libraries, when detail holdings are shown, then those libraries are prioritized before others.

## Verification

- Test or check: `deferred until implementation workflow exists`
- Evidence required: `Detail and holdings API/UI checks for fields, title-based cover fallback, states, last check time, and member prioritization.`

## Dependencies

- `github-issues/08-implement-ebook-search.md`
- `github-issues/12-implement-member-library-registration.md`
- `DESIGN.md#ebook-detail`

## Requirement

As a `Guest or Member`, I need `to search ebook metadata and browse home discovery modules` so that `I can discover ebooks and see known holding and availability counts`.

## Owner

- Domain: `requirements`
- Owning file: `REQUIREMENTS.md`
- Existing requirement/control/decision ID, if any: `FR-2.1 | FR-2.2 | FR-2.3 | FR-2.4 | FR-2.5 | FR-2.6 | FR-2.7 | FR-2.8 | FR-2.9 | NFR-1`

## Scope

In scope:

- Implement `GET /api/ebooks/search`.
- Search title, author, publisher, ISBN, and subject terms when available.
- Return title, cover image, author, publisher, publication date, summary, holding library count, and available library count when known.
- Show a title-based default ebook cover image when a search result has no cover image.
- Support filters and sorting listed in `FR-2.4` and `FR-2.5` when data is available.
- Implement home popular ebook and recent discovery modules when public catalog or aggregate activity data is available.
- Default search results to card layout and allow users to switch between card and list layouts.
- Reuse the last selected card/list layout on later search result visits for the same Member account or browser context when available.
- Use PostgreSQL full-text search over public ebook metadata, adding cached availability summaries when present.
- Maintain full-text search indexes or projections through the `search-indexing` BullMQ queue when asynchronous index refresh is needed.

Out of scope:

- Live waiting on slow external libraries during search.
- Storing member-owned activity in PostgreSQL full-text search indexes or projections.

## Acceptance Criteria

- Given a Guest or Member submits a keyword, when matching data exists, then matching ebook results are returned.
- Given searchable fields are available, when a query matches title, author, publisher, ISBN, or subject terms, then the matching ebook can appear.
- Given the search implementation is inspected, when MVP search runs, then it uses PostgreSQL full-text search rather than a separate search service.
- Given async index refresh is needed, when search indexing work is queued, then the `search-indexing` BullMQ queue is used.
- Given availability and holding summaries are known, when results are shown, then counts are included.
- Given a matching ebook has no cover image, when search results are shown, then a default ebook cover image containing the title is visible.
- Given public catalog or aggregate activity data is available, when a Guest or Member opens the home screen, then popular ebook and recent discovery modules are visible below the primary search area.
- Given no saved display preference exists, when search results are shown, then card layout is used.
- Given a user changes search results to list layout, when that user later opens search results in the same Member account or browser context, then list layout is reused.
- Given one external library is slow or unavailable, when search runs, then persisted or cached results for unaffected libraries are still returned.

## Verification

- Test or check: `deferred until implementation workflow exists`
- Evidence required: `Search API and UI checks for matching fields, title-based cover fallback, result summaries, filters, sorting, home discovery modules, display-layout persistence, and degraded integration behavior.`

## Dependencies

- `github-issues/01-resolve-mvp-implementation-decisions.md`
- `github-issues/07-implement-ebook-normalization-provenance.md`
- `github-issues/05-implement-api-validation-authorization.md`
- `SECURITY.md#sr-010-data-protection-retention-and-deletion`

## Requirement

As a `System worker`, I need `ebook metadata normalization with source provenance` so that `duplicate and conflicting external records can be searched, merged, and reviewed safely`.

## Owner

- Domain: `architecture`
- Owning file: `ARCHITECTURE.md`
- Existing requirement/control/decision ID, if any: `SR-013`

## Scope

In scope:

- Ingest and normalize ebook metadata from public electronic-library APIs and public ISBN/book metadata sources.
- Process asynchronous metadata ingestion work through the `metadata-sync` BullMQ queue.
- Normalize ebook metadata fields used by requirements: title, cover image, author, publisher, publication date, ISBN, description, category, language, and subject terms when available.
- Store ebook aliases or identifier merge keys.
- Preserve source library, external record ID, adapter version, fetched time, and normalized time when available.
- Preserve conflicting external records for admin review.

Out of scope:

- Implementing admin duplicate review UI.
- Selecting exact source providers or library-specific adapter mappings beyond the resolved source categories.

## Acceptance Criteria

- Given external ebook metadata is ingested, when normalized records are persisted, then provenance fields are kept when available.
- Given async metadata ingestion is queued, when the job is inspected, then it uses the `metadata-sync` BullMQ queue and carries only internal IDs or bounded parameters.
- Given conflicting external records exist, when normalization runs, then source context is preserved for operator review.
- Given duplicate identifiers or aliases exist, when records are searched or reviewed, then merge keys are available.

## Verification

- Test or check: `deferred until implementation workflow exists`
- Evidence required: `Normalization tests or fixtures showing provenance, aliases, and conflict preservation.`

## Dependencies

- `github-issues/01-resolve-mvp-implementation-decisions.md`
- `github-issues/03-define-primary-data-schema.md`
- `ARCHITECTURE.md#initial-architecture`
- `SECURITY.md#sr-013-data-integrity-and-provenance`

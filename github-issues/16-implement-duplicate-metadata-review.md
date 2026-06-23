## Requirement

As an `Admin`, I need `to review and correct duplicate or merged ebook metadata` so that `catalog search and detail views preserve quality and source provenance`.

## Owner

- Domain: `requirements`
- Owning file: `REQUIREMENTS.md`
- Existing requirement/control/decision ID, if any: `FR-7.5 | SR-013`

## Scope

In scope:

- Provide an admin workflow to review duplicate or merged ebook metadata.
- Show provenance needed to distinguish source library records.
- Allow corrections that preserve source context for conflicting external records.
- Audit admin corrections.

Out of scope:

- Fully automated merge decisions beyond documented merge keys.
- Removing provenance for conflicting source records.

## Acceptance Criteria

- Given duplicate or merged ebook metadata exists, when an Admin opens the review workflow, then the duplicate candidates and source provenance are visible.
- Given an Admin corrects metadata, when the change is saved, then catalog records update without losing provenance.
- Given a correction is saved, when audit records are inspected, then the admin action is captured.

## Verification

- Test or check: `deferred until implementation workflow exists`
- Evidence required: `Admin UI/API checks showing duplicate review, provenance display, correction, and audit event creation.`

## Dependencies

- `github-issues/07-implement-ebook-normalization-provenance.md`
- `github-issues/17-implement-audit-integration-events.md`
- `DESIGN.md#admin-ui`


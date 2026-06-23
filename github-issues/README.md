# GitHub Issue Pack

These files are ready to use with `gh issue create` after a GitHub remote and authenticated GitHub CLI or connector are available.

Suggested creation flow:

1. Create sub-issues from `01-*.md` through `22-*.md`.
2. Create the parent epic from `00-epic-elibrary-mvp.md`.
3. Replace the epic's local file links with created GitHub issue links if desired.

Commands:

```sh
gh issue create --title "Resolve MVP implementation decisions before code" --body-file github-issues/01-resolve-mvp-implementation-decisions.md
gh issue create --title "Establish modular monolith app skeleton" --body-file github-issues/02-establish-modular-monolith-skeleton.md
gh issue create --title "Define primary data schema and ownership boundaries" --body-file github-issues/03-define-primary-data-schema.md
gh issue create --title "Implement authentication, sessions, and role model" --body-file github-issues/04-implement-authentication-sessions-roles.md
gh issue create --title "Implement API validation, response allowlists, and object-level authorization" --body-file github-issues/05-implement-api-validation-authorization.md
gh issue create --title "Implement public library directory" --body-file github-issues/06-implement-public-library-directory.md
gh issue create --title "Implement ebook metadata normalization and provenance" --body-file github-issues/07-implement-ebook-normalization-provenance.md
gh issue create --title "Implement ebook search and search index flow" --body-file github-issues/08-implement-ebook-search.md
gh issue create --title "Implement ebook detail and holdings flow" --body-file github-issues/09-implement-ebook-detail-holdings.md
gh issue create --title "Implement LibraryAdapter registry and safe dispatch" --body-file github-issues/10-implement-library-adapter-registry.md
gh issue create --title "Implement availability cache and refresh workers" --body-file github-issues/11-implement-availability-cache-workers.md
gh issue create --title "Implement member library registration and personalization" --body-file github-issues/12-implement-member-library-registration.md
gh issue create --title "Implement borrowing handoff and loan attempts" --body-file github-issues/13-implement-borrowing-handoff-loan-attempts.md
gh issue create --title "Implement member activity and deletion paths" --body-file github-issues/14-implement-member-activity-deletion.md
gh issue create --title "Implement admin library and integration operations" --body-file github-issues/15-implement-admin-library-integration.md
gh issue create --title "Implement duplicate ebook metadata review" --body-file github-issues/16-implement-duplicate-metadata-review.md
gh issue create --title "Implement audit and integration event capture" --body-file github-issues/17-implement-audit-integration-events.md
gh issue create --title "Implement operational visibility indicators" --body-file github-issues/18-implement-operational-visibility.md
gh issue create --title "Implement UI visual system and screen layouts" --body-file github-issues/19-implement-ui-visual-system.md
gh issue create --title "Implement web client safety for external metadata and links" --body-file github-issues/20-implement-web-client-safety.md
gh issue create --title "Implement infrastructure, secrets, and supply-chain baseline" --body-file github-issues/21-implement-infra-secrets-supply-chain.md
gh issue create --title "Implement member notifications and preferences" --body-file github-issues/22-implement-member-notifications-preferences.md
gh issue create --title "Epic: Build eLibrary MVP Web and API Foundation" --body-file github-issues/00-epic-elibrary-mvp.md
```

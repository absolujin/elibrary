## Requirement

As a `System worker`, I need `primary data records and ownership boundaries for eLibrary entities` so that `catalog, member activity, integration, and audit workflows persist data consistently`.

## Owner

- Domain: `architecture`
- Owning file: `ARCHITECTURE.md`
- Existing requirement/control/decision ID, if any: `none`

## Scope

In scope:

- Define primary storage for users, user_preferences, user_libraries, saved_books, recent_searches, libraries, integration_events, ebooks, ebook_aliases, holdings, availability_snapshots, loan_attempts, notification_preferences, notifications, push_subscriptions, audit_events, and adapter configuration.
- Define PostgreSQL full-text search indexes or projections for public ebook metadata used by search.
- Preserve module ownership boundaries from Auth, User, Library, Ebook, Holding, Loan, Notification, Admin, Integration, and Audit.
- Model provenance fields required for external ebook, holding, availability, and redirect data.

Out of scope:

- Implementing search ranking behavior.
- Provisioning Oracle Cloud infrastructure, VM storage, or production database instances.

## Acceptance Criteria

- Given the schema is reviewed, when each entity named in `REQUIREMENTS.md` and `ARCHITECTURE.md` is checked, then it has an owner module and primary persistence strategy.
- Given external metadata is persisted, when records are inspected, then source library, external record ID, adapter version, fetched time, and normalized time are present when available.
- Given notification entities are persisted, when schema ownership is reviewed, then notification_preferences, notifications, and push_subscriptions belong to the Notification module and are tied to a Member.
- Given user preference entities are persisted, when schema ownership is reviewed, then search result display layout belongs to the User module and is tied to a Member account where applicable.
- Given search schema is reviewed, when full-text search structures are inspected, then they use PostgreSQL full-text search over public ebook metadata only.
- Given derived stores exist, when schema ownership is reviewed, then PostgreSQL remains the authority for persisted records.

## Verification

- Test or check: `deferred until implementation workflow exists`
- Evidence required: `Schema definitions or migration files plus a module ownership map.`

## Dependencies

- `github-issues/02-establish-modular-monolith-skeleton.md`
- `ARCHITECTURE.md#initial-architecture`
- `SECURITY.md#sr-013-data-integrity-and-provenance`

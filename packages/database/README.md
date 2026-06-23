# eLibrary Database

This package owns the database schema definition artifacts for the bootstrap implementation.

- `src/schema-definition.ts` is the code-level ownership map for primary tables, derived search structures, cache/queue stores, member-owned records, retention labels, and external provenance fields.
- `src/store-ownership.ts` exposes the compact store ownership view used by architecture tests.
- `migrations/0001_initial_schema.sql` defines the initial PostgreSQL schema and PostgreSQL full-text search projection.

PostgreSQL is the authority for persisted records. PostgreSQL full-text search structures, availability summary cache data, and BullMQ operational state are derived and rebuildable.

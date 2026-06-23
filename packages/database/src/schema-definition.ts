import type { ModuleName } from "@elibrary/domain";

export type PersistenceKind = "primary-postgresql" | "derived-postgresql-search" | "cache-or-queue";

export type ProvenanceField =
  | "source_library_id"
  | "external_record_id"
  | "adapter_version"
  | "fetched_at"
  | "normalized_at";

export type RetentionPolicy =
  | "account-lifetime"
  | "recent-searches-90-days"
  | "loan-attempts-1-year"
  | "integration-events-90-days"
  | "audit-events-3-years"
  | "notifications-90-days"
  | "not-applicable";

export interface SchemaTable {
  readonly table: string;
  readonly entity: string;
  readonly ownerModule: ModuleName;
  readonly persistence: Extract<PersistenceKind, "primary-postgresql">;
  readonly memberOwned: boolean;
  readonly retention: RetentionPolicy;
  readonly provenanceFields?: readonly ProvenanceField[];
}

export interface SearchStructure {
  readonly store: string;
  readonly ownerModule: ModuleName;
  readonly persistence: Extract<PersistenceKind, "derived-postgresql-search">;
  readonly sourceTables: readonly string[];
  readonly indexedFields: readonly string[];
  readonly containsMemberOwnedData: boolean;
  readonly rebuildableFrom: readonly string[];
}

export interface CacheOrQueueStore {
  readonly store: string;
  readonly ownerModule: ModuleName;
  readonly persistence: Extract<PersistenceKind, "cache-or-queue">;
  readonly authority: "derived-from-postgresql" | "operational-only";
}

export const provenanceFieldNames = [
  "source_library_id",
  "external_record_id",
  "adapter_version",
  "fetched_at",
  "normalized_at"
] as const satisfies readonly ProvenanceField[];

export const primarySchemaTables = [
  {
    table: "users",
    entity: "users",
    ownerModule: "User",
    persistence: "primary-postgresql",
    memberOwned: false,
    retention: "account-lifetime"
  },
  {
    table: "user_preferences",
    entity: "user_preferences",
    ownerModule: "User",
    persistence: "primary-postgresql",
    memberOwned: true,
    retention: "account-lifetime"
  },
  {
    table: "user_libraries",
    entity: "user_libraries",
    ownerModule: "User",
    persistence: "primary-postgresql",
    memberOwned: true,
    retention: "account-lifetime"
  },
  {
    table: "saved_books",
    entity: "saved_books",
    ownerModule: "User",
    persistence: "primary-postgresql",
    memberOwned: true,
    retention: "account-lifetime"
  },
  {
    table: "recent_searches",
    entity: "recent_searches",
    ownerModule: "User",
    persistence: "primary-postgresql",
    memberOwned: true,
    retention: "recent-searches-90-days"
  },
  {
    table: "libraries",
    entity: "libraries",
    ownerModule: "Library",
    persistence: "primary-postgresql",
    memberOwned: false,
    retention: "not-applicable"
  },
  {
    table: "integration_events",
    entity: "integration_events",
    ownerModule: "Integration",
    persistence: "primary-postgresql",
    memberOwned: false,
    retention: "integration-events-90-days"
  },
  {
    table: "ebooks",
    entity: "ebooks",
    ownerModule: "Ebook",
    persistence: "primary-postgresql",
    memberOwned: false,
    retention: "not-applicable",
    provenanceFields: provenanceFieldNames
  },
  {
    table: "ebook_aliases",
    entity: "ebook_aliases / identifier merge keys",
    ownerModule: "Ebook",
    persistence: "primary-postgresql",
    memberOwned: false,
    retention: "not-applicable",
    provenanceFields: provenanceFieldNames
  },
  {
    table: "holdings",
    entity: "holdings",
    ownerModule: "Holding",
    persistence: "primary-postgresql",
    memberOwned: false,
    retention: "not-applicable",
    provenanceFields: provenanceFieldNames
  },
  {
    table: "availability_snapshots",
    entity: "availability_snapshots",
    ownerModule: "Holding",
    persistence: "primary-postgresql",
    memberOwned: false,
    retention: "not-applicable",
    provenanceFields: provenanceFieldNames
  },
  {
    table: "loan_attempts",
    entity: "loan_attempts",
    ownerModule: "Loan",
    persistence: "primary-postgresql",
    memberOwned: true,
    retention: "loan-attempts-1-year",
    provenanceFields: provenanceFieldNames
  },
  {
    table: "notification_preferences",
    entity: "notification_preferences",
    ownerModule: "Notification",
    persistence: "primary-postgresql",
    memberOwned: true,
    retention: "account-lifetime"
  },
  {
    table: "notifications",
    entity: "notifications",
    ownerModule: "Notification",
    persistence: "primary-postgresql",
    memberOwned: true,
    retention: "notifications-90-days"
  },
  {
    table: "push_subscriptions",
    entity: "push_subscriptions",
    ownerModule: "Notification",
    persistence: "primary-postgresql",
    memberOwned: true,
    retention: "account-lifetime"
  },
  {
    table: "audit_events",
    entity: "audit_events",
    ownerModule: "Audit",
    persistence: "primary-postgresql",
    memberOwned: false,
    retention: "audit-events-3-years"
  },
  {
    table: "adapter_configurations",
    entity: "adapter configuration",
    ownerModule: "Integration",
    persistence: "primary-postgresql",
    memberOwned: false,
    retention: "not-applicable"
  }
] as const satisfies readonly SchemaTable[];

export const postgresFullTextSearchStructures = [
  {
    store: "ebook_search_documents",
    ownerModule: "Ebook",
    persistence: "derived-postgresql-search",
    sourceTables: ["ebooks", "ebook_aliases"],
    indexedFields: ["title", "authors", "publisher", "isbn_values", "subjects", "language"],
    containsMemberOwnedData: false,
    rebuildableFrom: ["ebooks", "ebook_aliases"]
  }
] as const satisfies readonly SearchStructure[];

export const cacheOrQueueStores = [
  {
    store: "availability_summary_cache",
    ownerModule: "Holding",
    persistence: "cache-or-queue",
    authority: "derived-from-postgresql"
  },
  {
    store: "bullmq_operational_state",
    ownerModule: "Integration",
    persistence: "cache-or-queue",
    authority: "operational-only"
  }
] as const satisfies readonly CacheOrQueueStore[];

export function getPrimarySchemaTable(table: string): SchemaTable {
  const match = primarySchemaTables.find((candidate) => candidate.table === table);

  if (!match) {
    throw new Error(`Unknown eLibrary primary schema table: ${table}`);
  }

  return match;
}

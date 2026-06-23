import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import {
  cacheOrQueueStores,
  getPrimarySchemaTable,
  postgresFullTextSearchStructures,
  primaryPostgresqlStores,
  primarySchemaTables,
  provenanceFieldNames
} from "../packages/database/src";

const initialMigration = readFileSync(
  new URL("../packages/database/migrations/0001_initial_schema.sql", import.meta.url),
  "utf8"
);

const requiredEntities = [
  "users",
  "user_preferences",
  "user_libraries",
  "saved_books",
  "recent_searches",
  "libraries",
  "integration_events",
  "ebooks",
  "ebook_aliases / identifier merge keys",
  "holdings",
  "availability_snapshots",
  "loan_attempts",
  "notification_preferences",
  "notifications",
  "push_subscriptions",
  "audit_events",
  "adapter configuration"
] as const;

const externallySourcedTables = [
  "ebooks",
  "ebook_aliases",
  "holdings",
  "availability_snapshots",
  "loan_attempts"
] as const;

describe("primary data schema", () => {
  it("maps every required entity to a PostgreSQL owner module", () => {
    expect(primarySchemaTables.map((table) => table.entity)).toEqual(requiredEntities);

    for (const table of primarySchemaTables) {
      expect(table.persistence).toBe("primary-postgresql");
      expect(table.ownerModule).toBeTruthy();
    }
  });

  it("keeps the compact ownership map derived from the schema definition", () => {
    expect(primaryPostgresqlStores).toHaveLength(primarySchemaTables.length);
    expect(primaryPostgresqlStores).toContainEqual({
      store: "adapter_configurations",
      ownerModule: "Integration",
      persistence: "primary-postgresql"
    });
  });

  it("declares primary tables in the initial PostgreSQL migration", () => {
    for (const table of primarySchemaTables) {
      expect(initialMigration).toContain(`create table ${table.table}`);
    }
  });

  it("ties member notification records to the Notification module", () => {
    for (const tableName of ["notification_preferences", "notifications", "push_subscriptions"]) {
      const table = getPrimarySchemaTable(tableName);

      expect(table.ownerModule).toBe("Notification");
      expect(table.memberOwned).toBe(true);
    }
  });

  it("ties search display preference to the User module and member account lifetime", () => {
    const table = getPrimarySchemaTable("user_preferences");

    expect(table.ownerModule).toBe("User");
    expect(table.memberOwned).toBe(true);
    expect(table.retention).toBe("account-lifetime");
  });

  it("preserves provenance fields for externally sourced records", () => {
    for (const tableName of externallySourcedTables) {
      const table = getPrimarySchemaTable(tableName);

      expect(table.provenanceFields).toEqual(provenanceFieldNames);
    }
  });

  it("limits full-text search structures to public ebook metadata", () => {
    expect(postgresFullTextSearchStructures).toEqual([
      {
        store: "ebook_search_documents",
        ownerModule: "Ebook",
        persistence: "derived-postgresql-search",
        sourceTables: ["ebooks", "ebook_aliases"],
        indexedFields: ["title", "authors", "publisher", "isbn_values", "subjects", "language"],
        containsMemberOwnedData: false,
        rebuildableFrom: ["ebooks", "ebook_aliases"]
      }
    ]);
    expect(initialMigration).toContain("create table ebook_search_documents");
    expect(initialMigration).toContain("ebook_search_documents_vector_idx");
  });

  it("treats caches, queues, and search indexes as derived stores", () => {
    expect(cacheOrQueueStores).toEqual([
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
    ]);
  });
});

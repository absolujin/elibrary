import { describe, expect, it } from "vitest";
import { LibraryAdapterRegistry } from "../packages/adapters/src";
import { primaryPostgresqlStores } from "../packages/database/src";
import { moduleBoundaries, runtimeComponents, workerQueueNames } from "../packages/domain/src";

describe("architecture skeleton", () => {
  it("declares every required module boundary", () => {
    expect(moduleBoundaries.map((boundary) => boundary.name)).toEqual([
      "Auth",
      "User",
      "Library",
      "Ebook",
      "Holding",
      "Loan",
      "Notification",
      "Admin",
      "Integration",
      "Audit"
    ]);
  });

  it("declares every required runtime component owner", () => {
    expect(runtimeComponents.map((component) => component.name)).toEqual([
      "web-app",
      "admin-ui",
      "backend-api",
      "workers",
      "library-adapters",
      "postgresql",
      "postgresql-full-text-search",
      "valkey-or-redis-cache",
      "bullmq-queues"
    ]);
  });

  it("keeps worker queue names explicit", () => {
    expect(workerQueueNames).toEqual([
      "metadata-sync",
      "availability-refresh",
      "search-indexing",
      "notification-dispatch",
      "integration-health"
    ]);
  });

  it("keeps PostgreSQL ownership mapped to modules", () => {
    expect(primaryPostgresqlStores).toContainEqual({
      store: "users",
      ownerModule: "User",
      persistence: "primary-postgresql"
    });
  });

  it("keeps adapter registration separated from request handling", () => {
    const registry = new LibraryAdapterRegistry();
    expect(registry.listLibraryIds()).toEqual([]);
  });
});

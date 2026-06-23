export type RuntimeComponentName =
  | "web-app"
  | "admin-ui"
  | "backend-api"
  | "workers"
  | "library-adapters"
  | "postgresql"
  | "postgresql-full-text-search"
  | "valkey-or-redis-cache"
  | "bullmq-queues";

export interface RuntimeComponent {
  readonly name: RuntimeComponentName;
  readonly owner: string;
  readonly responsibility: string;
}

export const runtimeComponents = [
  {
    name: "web-app",
    owner: "apps/web",
    responsibility: "React public/member UI shell for browsing, search, detail, personalization, and borrowing handoff."
  },
  {
    name: "admin-ui",
    owner: "apps/admin",
    responsibility: "React admin UI shell for library, integration, metadata, audit, and event operations."
  },
  {
    name: "backend-api",
    owner: "apps/api",
    responsibility: "NestJS REST boundary for validation, orchestration, persistence, and response shaping."
  },
  {
    name: "workers",
    owner: "apps/worker",
    responsibility: "NestJS-compatible worker runtime for queued integration, search, availability, and notification work."
  },
  {
    name: "library-adapters",
    owner: "packages/adapters",
    responsibility: "Per-library adapter contracts and registry separated from request handling."
  },
  {
    name: "postgresql",
    owner: "packages/database",
    responsibility: "Primary persistence ownership map for user, catalog, holding, activity, integration, and audit data."
  },
  {
    name: "postgresql-full-text-search",
    owner: "packages/database",
    responsibility: "Derived full-text search ownership map over normalized public ebook metadata."
  },
  {
    name: "valkey-or-redis-cache",
    owner: "apps/worker",
    responsibility: "Cache and BullMQ state dependency for worker queues."
  },
  {
    name: "bullmq-queues",
    owner: "apps/worker",
    responsibility: "Persisted worker queue names and registration."
  }
] as const satisfies readonly RuntimeComponent[];

export interface StoreOwnership {
  readonly store: string;
  readonly ownerModule: string;
  readonly persistence: "primary-postgresql" | "derived-postgresql-search" | "cache-or-queue";
}

export const primaryPostgresqlStores = [
  { store: "users", ownerModule: "User", persistence: "primary-postgresql" },
  { store: "user_preferences", ownerModule: "User", persistence: "primary-postgresql" },
  { store: "user_libraries", ownerModule: "User", persistence: "primary-postgresql" },
  { store: "saved_books", ownerModule: "User", persistence: "primary-postgresql" },
  { store: "recent_searches", ownerModule: "User", persistence: "primary-postgresql" },
  { store: "libraries", ownerModule: "Library", persistence: "primary-postgresql" },
  { store: "integration_events", ownerModule: "Integration", persistence: "primary-postgresql" },
  { store: "ebooks", ownerModule: "Ebook", persistence: "primary-postgresql" },
  { store: "ebook_aliases", ownerModule: "Ebook", persistence: "primary-postgresql" },
  { store: "holdings", ownerModule: "Holding", persistence: "primary-postgresql" },
  { store: "availability_snapshots", ownerModule: "Holding", persistence: "primary-postgresql" },
  { store: "loan_attempts", ownerModule: "Loan", persistence: "primary-postgresql" },
  { store: "notification_preferences", ownerModule: "Notification", persistence: "primary-postgresql" },
  { store: "notifications", ownerModule: "Notification", persistence: "primary-postgresql" },
  { store: "push_subscriptions", ownerModule: "Notification", persistence: "primary-postgresql" },
  { store: "audit_events", ownerModule: "Audit", persistence: "primary-postgresql" },
  { store: "adapter_configuration", ownerModule: "Integration", persistence: "primary-postgresql" }
] as const satisfies readonly StoreOwnership[];

export const derivedStores = [
  { store: "ebook_full_text_search", ownerModule: "Ebook", persistence: "derived-postgresql-search" },
  { store: "availability_summary_cache", ownerModule: "Holding", persistence: "cache-or-queue" },
  { store: "bullmq_operational_state", ownerModule: "Integration", persistence: "cache-or-queue" }
] as const satisfies readonly StoreOwnership[];

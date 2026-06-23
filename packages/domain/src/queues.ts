export type WorkerQueueName =
  | "metadata-sync"
  | "availability-refresh"
  | "search-indexing"
  | "notification-dispatch"
  | "integration-health";

export const workerQueueNames = [
  "metadata-sync",
  "availability-refresh",
  "search-indexing",
  "notification-dispatch",
  "integration-health"
] as const satisfies readonly WorkerQueueName[];

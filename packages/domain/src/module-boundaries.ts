export type ModuleName =
  | "Auth"
  | "User"
  | "Library"
  | "Ebook"
  | "Holding"
  | "Loan"
  | "Notification"
  | "Admin"
  | "Integration"
  | "Audit";

export interface ModuleBoundary {
  readonly name: ModuleName;
  readonly owns: readonly string[];
  readonly responsibility: string;
}

export const moduleBoundaries = [
  {
    name: "Auth",
    owns: ["user identity", "sign-in state", "role identity handoff"],
    responsibility: "Owns authentication and role identity boundaries."
  },
  {
    name: "User",
    owns: ["users", "user_preferences", "user_libraries", "saved_books", "recent_searches"],
    responsibility: "Owns member account activity and personalization records."
  },
  {
    name: "Library",
    owns: ["libraries", "public directory fields", "integration status"],
    responsibility: "Owns public library directory records and integration classification."
  },
  {
    name: "Ebook",
    owns: ["ebooks", "ebook_aliases", "identifier merge keys"],
    responsibility: "Owns normalized ebook metadata and duplicate resolution inputs."
  },
  {
    name: "Holding",
    owns: ["holdings", "availability_snapshots"],
    responsibility: "Owns library-specific ebook ownership and availability state."
  },
  {
    name: "Loan",
    owns: ["loan_attempts"],
    responsibility: "Owns external borrowing handoff records."
  },
  {
    name: "Notification",
    owns: ["notification_preferences", "notifications", "push_subscriptions", "notification delivery jobs"],
    responsibility: "Owns member notification preferences and dispatch records."
  },
  {
    name: "Admin",
    owns: ["admin-facing library operations", "admin-facing catalog operations"],
    responsibility: "Owns administrator workflows and delegates audit writes to Audit."
  },
  {
    name: "Integration",
    owns: ["adapter configuration", "adapter secret references", "adapter capability dispatch", "integration_events"],
    responsibility: "Owns external library adapter configuration and integration health."
  },
  {
    name: "Audit",
    owns: ["audit_events"],
    responsibility: "Owns append-only investigation and non-repudiation event records."
  }
] as const satisfies readonly ModuleBoundary[];

export function getModuleBoundary(name: ModuleName): ModuleBoundary {
  const boundary = moduleBoundaries.find((candidate) => candidate.name === name);

  if (!boundary) {
    throw new Error(`Unknown eLibrary module boundary: ${name}`);
  }

  return boundary;
}

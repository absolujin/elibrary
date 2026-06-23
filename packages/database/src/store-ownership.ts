import type { ModuleName } from "@elibrary/domain";
import {
  cacheOrQueueStores,
  postgresFullTextSearchStructures,
  primarySchemaTables,
  type PersistenceKind
} from "./schema-definition";

export interface StoreOwnership {
  readonly store: string;
  readonly ownerModule: ModuleName;
  readonly persistence: PersistenceKind;
}

export const primaryPostgresqlStores = primarySchemaTables.map(({ ownerModule, persistence, table }) => ({
  store: table,
  ownerModule,
  persistence
})) satisfies readonly StoreOwnership[];

export const derivedStores = [
  ...postgresFullTextSearchStructures.map(({ ownerModule, persistence, store }) => ({
    store,
    ownerModule,
    persistence
  })),
  ...cacheOrQueueStores.map(({ ownerModule, persistence, store }) => ({
    store,
    ownerModule,
    persistence
  }))
] satisfies readonly StoreOwnership[];

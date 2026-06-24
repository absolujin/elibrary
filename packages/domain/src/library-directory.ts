export const libraryIntegrationModes = ["integrated", "link-only"] as const;
export type LibraryIntegrationMode = (typeof libraryIntegrationModes)[number];

export const libraryIntegrationStatuses = ["planned", "active", "degraded", "disabled"] as const;
export type LibraryIntegrationStatus = (typeof libraryIntegrationStatuses)[number];

export interface PublicLibraryRecord {
  readonly id: string;
  readonly name: string;
  readonly region?: string;
  readonly operator?: string;
  readonly eligibilityConditions?: string;
  readonly homepageUrl?: string;
  readonly ebookServiceUrl?: string;
  readonly integrationMode: LibraryIntegrationMode;
  readonly integrationStatus: LibraryIntegrationStatus;
}

export interface LibraryDirectoryFilters {
  readonly q?: string;
  readonly name?: string;
  readonly region?: string;
  readonly operator?: string;
  readonly integrationMode?: LibraryIntegrationMode;
}

export const bootstrapLibraryDirectoryRecords = [] as const satisfies readonly PublicLibraryRecord[];

export function filterPublicLibraries(
  libraries: readonly PublicLibraryRecord[],
  filters: LibraryDirectoryFilters
): readonly PublicLibraryRecord[] {
  return libraries.filter((library) => {
    if (filters.integrationMode && library.integrationMode !== filters.integrationMode) {
      return false;
    }

    if (filters.name && !includesFolded(library.name, filters.name)) {
      return false;
    }

    if (filters.region && !includesFolded(library.region, filters.region)) {
      return false;
    }

    if (filters.operator && !includesFolded(library.operator, filters.operator)) {
      return false;
    }

    if (filters.q && !matchesAnyLibraryField(library, filters.q)) {
      return false;
    }

    return true;
  });
}

export function isIntegratedLibrary(library: PublicLibraryRecord): boolean {
  return library.integrationMode === "integrated";
}

export function getLibraryIntegrationLabel(library: PublicLibraryRecord): string {
  return library.integrationMode === "integrated" ? `Integrated (${library.integrationStatus})` : "Link-only";
}

function matchesAnyLibraryField(library: PublicLibraryRecord, query: string): boolean {
  return [library.name, library.region, library.operator].some((value) => includesFolded(value, query));
}

function includesFolded(value: string | undefined, query: string): boolean {
  return value?.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()) ?? false;
}

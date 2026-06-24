import {
  filterPublicLibraries,
  getLibraryIntegrationLabel,
  type LibraryDirectoryFilters,
  type PublicLibraryRecord
} from "@elibrary/domain";

export interface LibraryDirectoryRow {
  readonly id: string;
  readonly name: string;
  readonly region: string;
  readonly operator: string;
  readonly eligibilityConditions: string;
  readonly homepageUrl?: string;
  readonly ebookServiceUrl?: string;
  readonly integrationMode: PublicLibraryRecord["integrationMode"];
  readonly integrationStatus: PublicLibraryRecord["integrationStatus"];
  readonly integrationLabel: string;
}

export interface LibraryDirectoryViewModel {
  readonly totalCount: number;
  readonly resultCount: number;
  readonly rows: readonly LibraryDirectoryRow[];
}

export function createLibraryDirectoryViewModel(
  libraries: readonly PublicLibraryRecord[],
  filters: LibraryDirectoryFilters
): LibraryDirectoryViewModel {
  const rows = filterPublicLibraries(libraries, filters).map((library) => ({
    id: library.id,
    name: library.name,
    region: library.region ?? "Unknown",
    operator: library.operator ?? "Unknown",
    eligibilityConditions: library.eligibilityConditions ?? "Unknown",
    homepageUrl: library.homepageUrl,
    ebookServiceUrl: library.ebookServiceUrl,
    integrationMode: library.integrationMode,
    integrationStatus: library.integrationStatus,
    integrationLabel: getLibraryIntegrationLabel(library)
  }));

  return {
    totalCount: libraries.length,
    resultCount: rows.length,
    rows
  };
}

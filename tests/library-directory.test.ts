import { describe, expect, it } from "vitest";
import {
  bootstrapLibraryDirectoryRecords,
  filterPublicLibraries,
  getLibraryIntegrationLabel,
  type PublicLibraryRecord,
  SafeApiError
} from "../packages/domain/src";
import { LibraryController } from "../apps/api/src/modules/library/library.controller";
import { LibraryService } from "../apps/api/src/modules/library/library.service";
import { createLibraryDirectoryViewModel } from "../apps/web/src/library-directory";

const libraries = [
  {
    id: "123e4567-e89b-12d3-a456-426614174000",
    name: "Seoul Digital Library",
    region: "Seoul",
    operator: "Seoul Metropolitan Government",
    eligibilityConditions: "Residents with a city library account",
    homepageUrl: "https://library.seoul.example.test",
    ebookServiceUrl: "https://ebooks.seoul.example.test",
    integrationMode: "integrated",
    integrationStatus: "active"
  },
  {
    id: "123e4567-e89b-12d3-a456-426614174001",
    name: "Busan Public Ebook Portal",
    region: "Busan",
    operator: "Busan Library Office",
    eligibilityConditions: "Registered public library members",
    homepageUrl: "https://library.busan.example.test",
    ebookServiceUrl: "https://ebooks.busan.example.test",
    integrationMode: "link-only",
    integrationStatus: "planned"
  }
] as const satisfies readonly PublicLibraryRecord[];

describe("public library directory", () => {
  it("does not seed a final MVP library list while first supported libraries are deferred", () => {
    expect(bootstrapLibraryDirectoryRecords).toEqual([]);
  });

  it("filters public library records by name, region, operator, and integration mode", () => {
    expect(filterPublicLibraries(libraries, { name: "seoul" }).map((library) => library.name)).toEqual([
      "Seoul Digital Library"
    ]);
    expect(filterPublicLibraries(libraries, { region: "busan" }).map((library) => library.name)).toEqual([
      "Busan Public Ebook Portal"
    ]);
    expect(filterPublicLibraries(libraries, { operator: "metropolitan" }).map((library) => library.name)).toEqual([
      "Seoul Digital Library"
    ]);
    expect(filterPublicLibraries(libraries, { integrationMode: "link-only" }).map((library) => library.name)).toEqual([
      "Busan Public Ebook Portal"
    ]);
  });

  it("distinguishes integrated libraries from link-only libraries", () => {
    expect(getLibraryIntegrationLabel(libraries[0])).toBe("Integrated (active)");
    expect(getLibraryIntegrationLabel(libraries[1])).toBe("Link-only");
  });

  it("lists public library records through the API with required visible fields", () => {
    const controller = new LibraryController(LibraryService.createForTest(libraries));
    const response = controller.listLibraries({ region: "Seoul" });

    expect(response).toEqual({
      libraries: [
        {
          id: "123e4567-e89b-12d3-a456-426614174000",
          name: "Seoul Digital Library",
          region: "Seoul",
          operator: "Seoul Metropolitan Government",
          eligibilityConditions: "Residents with a city library account",
          homepageUrl: "https://library.seoul.example.test",
          ebookServiceUrl: "https://ebooks.seoul.example.test",
          integrationMode: "integrated",
          integrationStatus: "active"
        }
      ]
    });
  });

  it("returns public library detail through the API and rejects invalid filters", () => {
    const controller = new LibraryController(LibraryService.createForTest(libraries));

    expect(controller.getLibrary("123e4567-e89b-12d3-a456-426614174001")).toEqual({
      library: {
        id: "123e4567-e89b-12d3-a456-426614174001",
        name: "Busan Public Ebook Portal",
        region: "Busan",
        operator: "Busan Library Office",
        eligibilityConditions: "Registered public library members",
        homepageUrl: "https://library.busan.example.test",
        ebookServiceUrl: "https://ebooks.busan.example.test",
        integrationMode: "link-only",
        integrationStatus: "planned"
      }
    });

    expect(() => controller.listLibraries({ unknown: "field" })).toThrow(SafeApiError);
    expect(() => controller.getLibrary("not-a-uuid")).toThrow(SafeApiError);
  });

  it("builds the web directory view model with required fields and empty-state counts", () => {
    expect(createLibraryDirectoryViewModel([], {})).toEqual({
      totalCount: 0,
      resultCount: 0,
      rows: []
    });

    expect(createLibraryDirectoryViewModel(libraries, { q: "seoul" })).toEqual({
      totalCount: 2,
      resultCount: 1,
      rows: [
        {
          id: "123e4567-e89b-12d3-a456-426614174000",
          name: "Seoul Digital Library",
          region: "Seoul",
          operator: "Seoul Metropolitan Government",
          eligibilityConditions: "Residents with a city library account",
          homepageUrl: "https://library.seoul.example.test",
          ebookServiceUrl: "https://ebooks.seoul.example.test",
          integrationMode: "integrated",
          integrationStatus: "active",
          integrationLabel: "Integrated (active)"
        }
      ]
    });
  });
});

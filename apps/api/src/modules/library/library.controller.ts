import { Controller, Get, Param, Query } from "@nestjs/common";
import {
  allowResponseProperties,
  libraryIntegrationModes,
  SafeApiError,
  validateStrictObject,
  type ApiInputSchema,
  type LibraryDirectoryFilters,
  type ResponseAllowlist
} from "@elibrary/domain";
import { LibraryService } from "./library.service";

@Controller("libraries")
export class LibraryController {
  constructor(private readonly libraryService: LibraryService) {}

  @Get()
  listLibraries(@Query() query: unknown = {}): Record<string, unknown> {
    const filters = validateStrictObject(query, libraryDirectoryQuerySchema) as LibraryDirectoryFilters;
    const libraries = this.libraryService.listPublicLibraries(filters);
    return allowLibraryListResponse({ libraries });
  }

  @Get(":libraryId")
  getLibrary(@Param("libraryId") libraryId: string): Record<string, unknown> {
    const validated = validateStrictObject({ libraryId }, libraryDetailParamSchema);
    const library = this.libraryService.getPublicLibrary(String(validated.libraryId));

    if (!library) {
      throw new SafeApiError(404, "Not found.");
    }

    return allowLibraryDetailResponse({ library });
  }
}

const libraryDirectoryQuerySchema = {
  q: { type: "string", optional: true, minLength: 1, maxLength: 120 },
  name: { type: "string", optional: true, minLength: 1, maxLength: 120 },
  region: { type: "string", optional: true, minLength: 1, maxLength: 120 },
  operator: { type: "string", optional: true, minLength: 1, maxLength: 120 },
  integrationMode: { type: "enum", optional: true, values: libraryIntegrationModes }
} as const satisfies ApiInputSchema;

const libraryDetailParamSchema = {
  libraryId: { type: "uuid" }
} as const satisfies ApiInputSchema;

const publicLibraryFieldsAllowlist = {
  id: true,
  name: true,
  region: true,
  operator: true,
  eligibilityConditions: true,
  homepageUrl: true,
  ebookServiceUrl: true,
  integrationMode: true,
  integrationStatus: true
} as const satisfies ResponseAllowlist;

const libraryListResponseAllowlist = {
  libraries: publicLibraryFieldsAllowlist
} as const satisfies ResponseAllowlist;

const libraryDetailResponseAllowlist = {
  library: publicLibraryFieldsAllowlist
} as const satisfies ResponseAllowlist;

function allowLibraryListResponse(value: Record<string, unknown>): Record<string, unknown> {
  return allowResponseProperties(value, libraryListResponseAllowlist) as Record<string, unknown>;
}

function allowLibraryDetailResponse(value: Record<string, unknown>): Record<string, unknown> {
  return allowResponseProperties(value, libraryDetailResponseAllowlist) as Record<string, unknown>;
}

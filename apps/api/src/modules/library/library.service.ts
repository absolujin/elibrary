import { Injectable } from "@nestjs/common";
import {
  bootstrapLibraryDirectoryRecords,
  filterPublicLibraries,
  type LibraryDirectoryFilters,
  type PublicLibraryRecord
} from "@elibrary/domain";

@Injectable()
export class LibraryService {
  private readonly librariesById = new Map<string, PublicLibraryRecord>();

  constructor() {
    this.replaceRecords(bootstrapLibraryDirectoryRecords);
  }

  static createForTest(records: readonly PublicLibraryRecord[]): LibraryService {
    const service = new LibraryService();
    service.replaceRecords(records);
    return service;
  }

  listPublicLibraries(filters: LibraryDirectoryFilters): readonly PublicLibraryRecord[] {
    return filterPublicLibraries([...this.librariesById.values()], filters);
  }

  getPublicLibrary(libraryId: string): PublicLibraryRecord | undefined {
    return this.librariesById.get(libraryId);
  }

  private replaceRecords(records: readonly PublicLibraryRecord[]): void {
    this.librariesById.clear();

    for (const record of records) {
      this.librariesById.set(record.id, record);
    }
  }
}

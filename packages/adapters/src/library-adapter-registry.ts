import type { LibraryAdapter } from "./library-adapter";

export class LibraryAdapterRegistry {
  private readonly adapters = new Map<string, LibraryAdapter>();

  register(adapter: LibraryAdapter): void {
    if (this.adapters.has(adapter.libraryId)) {
      throw new Error(`Adapter already registered for library ${adapter.libraryId}`);
    }

    this.adapters.set(adapter.libraryId, adapter);
  }

  get(libraryId: string): LibraryAdapter | undefined {
    return this.adapters.get(libraryId);
  }

  listLibraryIds(): readonly string[] {
    return [...this.adapters.keys()].sort();
  }
}

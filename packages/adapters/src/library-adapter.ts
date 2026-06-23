export interface LibraryAdapterBookSummary {
  readonly externalId: string;
  readonly title: string;
  readonly author?: string;
  readonly isbn?: string;
}

export interface LibraryAdapterBookDetail extends LibraryAdapterBookSummary {
  readonly publisher?: string;
  readonly publicationDate?: string;
  readonly description?: string;
  readonly language?: string;
}

export interface LibraryAvailability {
  readonly state:
    | "available"
    | "loaned_out"
    | "reservable"
    | "owned_unknown"
    | "not_owned"
    | "login_required"
    | "integration_unavailable";
  readonly checkedAt: Date;
}

export interface LoanUrlResult {
  readonly url: string;
  readonly destinationLibraryId: string;
}

export interface LibraryAdapter {
  readonly libraryId: string;
  searchBooks(query: string): Promise<readonly LibraryAdapterBookSummary[]>;
  getBookDetail(externalId: string): Promise<LibraryAdapterBookDetail | null>;
  getAvailability(externalId: string): Promise<LibraryAvailability>;
  getLoanUrl(externalId: string): Promise<LoanUrlResult | null>;
}

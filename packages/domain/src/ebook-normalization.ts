export interface EbookMetadataSource {
  readonly sourceLibraryId?: string;
  readonly sourceName?: string;
  readonly externalRecordId?: string;
  readonly adapterVersion?: string;
  readonly fetchedAt?: Date | string;
}

export interface ExternalEbookMetadata {
  readonly source: EbookMetadataSource;
  readonly title?: string;
  readonly coverImageUrl?: string;
  readonly author?: string;
  readonly authors?: readonly string[];
  readonly publisher?: string;
  readonly publicationDate?: string;
  readonly isbn?: string;
  readonly isbns?: readonly string[];
  readonly description?: string;
  readonly category?: string;
  readonly language?: string;
  readonly subjects?: readonly string[];
}

export interface EbookProvenance {
  readonly sourceLibraryId?: string;
  readonly sourceName?: string;
  readonly externalRecordId?: string;
  readonly adapterVersion?: string;
  readonly fetchedAt?: string;
  readonly normalizedAt: string;
}

export type EbookAliasType = "isbn10" | "isbn13" | "external-record-id" | "title-author";

export interface EbookAlias {
  readonly aliasType: EbookAliasType;
  readonly aliasValue: string;
  readonly provenance: EbookProvenance;
}

export interface NormalizedEbookMetadata {
  readonly title: string;
  readonly coverImageUrl?: string;
  readonly authors: readonly string[];
  readonly publisher?: string;
  readonly publicationDate?: string;
  readonly isbn10?: string;
  readonly isbn13?: string;
  readonly description?: string;
  readonly category?: string;
  readonly language?: string;
  readonly subjectTerms: readonly string[];
  readonly aliases: readonly EbookAlias[];
  readonly mergeKeys: readonly string[];
  readonly provenance: EbookProvenance;
}

export interface EbookMetadataConflict {
  readonly mergeKey: string;
  readonly field: keyof Pick<
    NormalizedEbookMetadata,
    "title" | "publisher" | "publicationDate" | "isbn10" | "isbn13" | "language"
  >;
  readonly values: readonly {
    readonly value: string;
    readonly provenance: EbookProvenance;
  }[];
}

export interface MetadataSyncJobPayload {
  readonly libraryId?: string;
  readonly sourceRecordId?: string;
  readonly isbn?: string;
  readonly cursor?: string;
  readonly limit?: number;
}

export interface MetadataSyncJob {
  readonly queueName: "metadata-sync";
  readonly payload: MetadataSyncJobPayload;
}

export class EbookNormalizationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EbookNormalizationError";
  }
}

export function normalizeExternalEbookMetadata(
  input: ExternalEbookMetadata,
  normalizedAt: Date = new Date()
): NormalizedEbookMetadata {
  const title = normalizeRequiredText(input.title, "title");
  const authors = normalizeAuthors(input);
  const provenance = normalizeProvenance(input.source, normalizedAt);
  const isbnValues = normalizeIsbnValues([input.isbn, ...(input.isbns ?? [])]);
  const isbn10 = isbnValues.find((isbn) => isbn.length === 10);
  const isbn13 = isbnValues.find((isbn) => isbn.length === 13);
  const aliases = createAliases({
    title,
    authors,
    isbn10,
    isbn13,
    provenance
  });

  return {
    title,
    coverImageUrl: normalizeExternalUrl(input.coverImageUrl),
    authors,
    publisher: normalizeOptionalText(input.publisher),
    publicationDate: normalizePublicationDate(input.publicationDate),
    isbn10,
    isbn13,
    description: normalizeOptionalText(input.description),
    category: normalizeOptionalText(input.category),
    language: normalizeLanguage(input.language),
    subjectTerms: normalizeTextList(input.subjects),
    aliases,
    mergeKeys: aliases.map((alias) => `${alias.aliasType}:${alias.aliasValue}`),
    provenance
  };
}

export function detectEbookMetadataConflicts(
  records: readonly NormalizedEbookMetadata[]
): readonly EbookMetadataConflict[] {
  const recordsByMergeKey = new Map<string, NormalizedEbookMetadata[]>();

  for (const record of records) {
    for (const mergeKey of record.mergeKeys) {
      const matches = recordsByMergeKey.get(mergeKey) ?? [];
      matches.push(record);
      recordsByMergeKey.set(mergeKey, matches);
    }
  }

  const conflicts: EbookMetadataConflict[] = [];

  for (const [mergeKey, matchingRecords] of recordsByMergeKey.entries()) {
    if (matchingRecords.length < 2) {
      continue;
    }

    for (const field of ["title", "publisher", "publicationDate", "isbn10", "isbn13", "language"] as const) {
      const valuesByNormalizedValue = new Map<string, { value: string; provenance: EbookProvenance }>();

      for (const record of matchingRecords) {
        const value = record[field];

        if (!value) {
          continue;
        }

        valuesByNormalizedValue.set(value.toLocaleLowerCase(), {
          value,
          provenance: record.provenance
        });
      }

      if (valuesByNormalizedValue.size > 1) {
        conflicts.push({
          mergeKey,
          field,
          values: [...valuesByNormalizedValue.values()]
        });
      }
    }
  }

  return conflicts;
}

export function createMetadataSyncJob(payload: MetadataSyncJobPayload): MetadataSyncJob {
  const normalizedPayload: MetadataSyncJobPayload = {
    libraryId: normalizeBoundedParameter(payload.libraryId, 128),
    sourceRecordId: normalizeBoundedParameter(payload.sourceRecordId, 256),
    isbn: payload.isbn ? normalizeIsbn(payload.isbn) : undefined,
    cursor: normalizeBoundedParameter(payload.cursor, 512),
    limit: normalizeLimit(payload.limit)
  };

  if (
    !normalizedPayload.libraryId &&
    !normalizedPayload.sourceRecordId &&
    !normalizedPayload.isbn &&
    !normalizedPayload.cursor
  ) {
    throw new EbookNormalizationError("Metadata sync job requires at least one bounded selector.");
  }

  return {
    queueName: "metadata-sync",
    payload: dropUndefinedValues(normalizedPayload)
  };
}

function normalizeProvenance(source: EbookMetadataSource, normalizedAt: Date): EbookProvenance {
  return dropUndefinedValues({
    sourceLibraryId: normalizeOptionalText(source.sourceLibraryId),
    sourceName: normalizeOptionalText(source.sourceName),
    externalRecordId: normalizeOptionalText(source.externalRecordId),
    adapterVersion: normalizeOptionalText(source.adapterVersion),
    fetchedAt: normalizeOptionalDate(source.fetchedAt),
    normalizedAt: normalizedAt.toISOString()
  });
}

function createAliases(input: {
  readonly title: string;
  readonly authors: readonly string[];
  readonly isbn10?: string;
  readonly isbn13?: string;
  readonly provenance: EbookProvenance;
}): readonly EbookAlias[] {
  const aliases: EbookAlias[] = [];

  if (input.isbn13) {
    aliases.push({ aliasType: "isbn13", aliasValue: input.isbn13, provenance: input.provenance });
  }

  if (input.isbn10) {
    aliases.push({ aliasType: "isbn10", aliasValue: input.isbn10, provenance: input.provenance });
  }

  const firstAuthor = input.authors[0];

  if (firstAuthor) {
    aliases.push({
      aliasType: "title-author",
      aliasValue: `${foldMergeKey(input.title)}|${foldMergeKey(firstAuthor)}`,
      provenance: input.provenance
    });
  }

  if (input.provenance.externalRecordId) {
    aliases.push({
      aliasType: "external-record-id",
      aliasValue: input.provenance.externalRecordId,
      provenance: input.provenance
    });
  }

  return aliases;
}

function normalizeAuthors(input: ExternalEbookMetadata): readonly string[] {
  const authorValues = [...(input.authors ?? []), ...(input.author ? splitAuthorString(input.author) : [])];
  return normalizeTextList(authorValues);
}

function splitAuthorString(author: string): readonly string[] {
  return author.split(/[,;|]/g);
}

function normalizeIsbnValues(values: readonly (string | undefined)[]): readonly string[] {
  return [...new Set(values.filter((value): value is string => Boolean(value)).map(normalizeIsbn))];
}

function normalizeIsbn(value: string): string {
  const normalized = value.replaceAll(/[-\s]/g, "").toUpperCase();

  if (/^\d{13}$/.test(normalized) || /^\d{9}[\dX]$/.test(normalized)) {
    return normalized;
  }

  throw new EbookNormalizationError("Invalid ISBN value.");
}

function normalizePublicationDate(value: string | undefined): string | undefined {
  const text = normalizeOptionalText(value);

  if (!text) {
    return undefined;
  }

  if (/^\d{4}$/.test(text)) {
    return `${text}-01-01`;
  }

  if (/^\d{4}-\d{2}$/.test(text)) {
    return `${text}-01`;
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(text) && !Number.isNaN(Date.parse(`${text}T00:00:00Z`))) {
    return text;
  }

  return undefined;
}

function normalizeLanguage(value: string | undefined): string | undefined {
  const text = normalizeOptionalText(value);
  return text?.toLocaleLowerCase();
}

function normalizeTextList(values: readonly string[] | undefined): readonly string[] {
  return [
    ...new Set(
      (values ?? [])
        .map((value) => normalizeOptionalText(value))
        .filter((value): value is string => Boolean(value))
    )
  ];
}

function normalizeRequiredText(value: string | undefined, field: string): string {
  const normalized = normalizeOptionalText(value);

  if (!normalized) {
    throw new EbookNormalizationError(`Missing required ebook field: ${field}.`);
  }

  return normalized;
}

function normalizeOptionalText(value: string | undefined): string | undefined {
  const normalized = value?.replaceAll(/\s+/g, " ").trim();
  return normalized && normalized.length > 0 ? normalized : undefined;
}

function normalizeExternalUrl(value: string | undefined): string | undefined {
  const text = normalizeOptionalText(value);

  if (!text) {
    return undefined;
  }

  try {
    const url = new URL(text);

    if (url.protocol !== "https:" && url.protocol !== "http:") {
      return undefined;
    }

    url.username = "";
    url.password = "";
    url.hash = "";
    return url.toString();
  } catch {
    return undefined;
  }
}

function normalizeOptionalDate(value: Date | string | undefined): string | undefined {
  if (!value) {
    return undefined;
  }

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return undefined;
  }

  return date.toISOString();
}

function normalizeBoundedParameter(value: string | undefined, maxLength: number): string | undefined {
  const normalized = normalizeOptionalText(value);

  if (!normalized) {
    return undefined;
  }

  if (normalized.length > maxLength || /^https?:\/\//i.test(normalized)) {
    throw new EbookNormalizationError("Metadata sync job payload contains an unsafe parameter.");
  }

  return normalized;
}

function normalizeLimit(value: number | undefined): number | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (!Number.isInteger(value) || value < 1 || value > 100) {
    throw new EbookNormalizationError("Metadata sync job limit is out of bounds.");
  }

  return value;
}

function foldMergeKey(value: string): string {
  return value.toLocaleLowerCase().replaceAll(/\s+/g, " ").trim();
}

function dropUndefinedValues<T extends object>(value: T): T {
  return Object.fromEntries(Object.entries(value).filter(([, entryValue]) => entryValue !== undefined)) as T;
}

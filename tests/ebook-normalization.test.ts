import { describe, expect, it } from "vitest";
import {
  createMetadataSyncJob,
  detectEbookMetadataConflicts,
  EbookNormalizationError,
  normalizeExternalEbookMetadata,
  workerQueueNames
} from "../packages/domain/src";
import { MetadataSyncProcessor } from "../apps/worker/src/metadata-sync.processor";

const normalizedAt = new Date("2026-06-24T05:00:00.000Z");

describe("ebook metadata normalization and provenance", () => {
  it("normalizes external ebook metadata fields while preserving provenance", () => {
    const normalized = normalizeExternalEbookMetadata(
      {
        source: {
          sourceLibraryId: "library-1",
          sourceName: "Seoul Digital Library",
          externalRecordId: "ext-123",
          adapterVersion: "adapter@1.2.3",
          fetchedAt: "2026-06-24T04:58:00.000Z"
        },
        title: "  The Pragmatic Programmer  ",
        coverImageUrl: "https://images.example.test/cover.jpg#tracking",
        author: "Andrew Hunt; David Thomas",
        publisher: "  Addison-Wesley  ",
        publicationDate: "1999",
        isbn: "978-0-201-61622-4",
        description: "  A practical guide.  ",
        category: "Software",
        language: "EN",
        subjects: ["Programming", " Software Engineering ", "Programming"]
      },
      normalizedAt
    );

    expect(normalized).toMatchObject({
      title: "The Pragmatic Programmer",
      coverImageUrl: "https://images.example.test/cover.jpg",
      authors: ["Andrew Hunt", "David Thomas"],
      publisher: "Addison-Wesley",
      publicationDate: "1999-01-01",
      isbn13: "9780201616224",
      description: "A practical guide.",
      category: "Software",
      language: "en",
      subjectTerms: ["Programming", "Software Engineering"],
      provenance: {
        sourceLibraryId: "library-1",
        sourceName: "Seoul Digital Library",
        externalRecordId: "ext-123",
        adapterVersion: "adapter@1.2.3",
        fetchedAt: "2026-06-24T04:58:00.000Z",
        normalizedAt: "2026-06-24T05:00:00.000Z"
      }
    });
  });

  it("creates aliases and merge keys for ISBN, external record ID, and title-author review", () => {
    const normalized = normalizeExternalEbookMetadata(
      {
        source: {
          sourceLibraryId: "library-1",
          externalRecordId: "external-book-1",
          adapterVersion: "adapter@1.0.0"
        },
        title: "Clean Architecture",
        authors: ["Robert C. Martin"],
        isbns: ["978-0134494166", "0134494164"]
      },
      normalizedAt
    );

    expect(normalized.aliases.map((alias) => [alias.aliasType, alias.aliasValue])).toEqual([
      ["isbn13", "9780134494166"],
      ["isbn10", "0134494164"],
      ["title-author", "clean architecture|robert c. martin"],
      ["external-record-id", "external-book-1"]
    ]);
    expect(normalized.mergeKeys).toEqual([
      "isbn13:9780134494166",
      "isbn10:0134494164",
      "title-author:clean architecture|robert c. martin",
      "external-record-id:external-book-1"
    ]);
  });

  it("preserves conflicting source context for operator review", () => {
    const first = normalizeExternalEbookMetadata(
      {
        source: {
          sourceLibraryId: "library-1",
          externalRecordId: "a",
          adapterVersion: "adapter@1"
        },
        title: "Domain-Driven Design",
        publisher: "Addison-Wesley",
        isbn: "9780321125217"
      },
      normalizedAt
    );
    const second = normalizeExternalEbookMetadata(
      {
        source: {
          sourceLibraryId: "library-2",
          externalRecordId: "b",
          adapterVersion: "adapter@2"
        },
        title: "Domain Driven Design",
        publisher: "Pearson",
        isbn: "978-0-321-12521-7"
      },
      normalizedAt
    );

    const conflicts = detectEbookMetadataConflicts([first, second]);

    expect(conflicts).toEqual(
      expect.arrayContaining([
        {
          mergeKey: "isbn13:9780321125217",
          field: "title",
          values: [
            {
              value: "Domain-Driven Design",
              provenance: first.provenance
            },
            {
              value: "Domain Driven Design",
              provenance: second.provenance
            }
          ]
        },
        {
          mergeKey: "isbn13:9780321125217",
          field: "publisher",
          values: [
            {
              value: "Addison-Wesley",
              provenance: first.provenance
            },
            {
              value: "Pearson",
              provenance: second.provenance
            }
          ]
        }
      ])
    );
  });

  it("creates bounded metadata-sync jobs for asynchronous ingestion", () => {
    expect(workerQueueNames).toContain("metadata-sync");

    expect(
      createMetadataSyncJob({
        libraryId: "library-1",
        sourceRecordId: "external-123",
        isbn: "978-0132350884",
        limit: 50
      })
    ).toEqual({
      queueName: "metadata-sync",
      payload: {
        libraryId: "library-1",
        sourceRecordId: "external-123",
        isbn: "9780132350884",
        limit: 50
      }
    });

    expect(() =>
      createMetadataSyncJob({
        libraryId: "https://metadata.example.test/raw-url"
      })
    ).toThrow(EbookNormalizationError);
  });

  it("keeps the worker metadata-sync processor constrained to normalized job payloads", async () => {
    const processor = new MetadataSyncProcessor();

    await expect(
      processor.process({
        data: {
          libraryId: "library-1",
          cursor: "page-2"
        }
      } as Parameters<MetadataSyncProcessor["process"]>[0])
    ).resolves.toEqual({
      libraryId: "library-1",
      cursor: "page-2"
    });
  });
});

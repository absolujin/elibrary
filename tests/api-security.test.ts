import { describe, expect, it, vi } from "vitest";
import {
  accessDeniedMessage,
  allowResponsePropertiesForRole,
  allowResponseProperties,
  apiRequestPolicy,
  assertMemberOwnedAccess,
  invalidRequestMessage,
  memberOwnedIdParameterNames,
  requireRole,
  SafeApiError,
  validateHttpRequestBoundary,
  validatePagination,
  validateStrictObject,
  type ApiInputSchema,
  type MemberOwnedObjectType
} from "../packages/domain/src";
import { AuthController } from "../apps/api/src/modules/auth/auth.controller";
import { AuthService } from "../apps/api/src/modules/auth/auth.service";
import { HttpBoundaryMiddleware } from "../apps/api/src/modules/security/http-boundary.middleware";

const catalogQuerySchema = {
  ebookId: { type: "uuid" },
  isbn: { type: "isbn" },
  homepageUrl: { type: "url" },
  layout: { type: "enum", values: ["card", "list"] },
  includeUnavailable: { type: "boolean" },
  filters: { type: "jsonObject", maxKeys: 3 }
} as const satisfies ApiInputSchema;

describe("API validation and authorization security", () => {
  it("validates API inputs by type, format, enum, URL, ISBN, and JSON object bounds", () => {
    const result = validateStrictObject(
      {
        ebookId: "123e4567-e89b-12d3-a456-426614174000",
        isbn: "978-0-306-40615-7",
        homepageUrl: "https://library.example.test/books#fragment",
        layout: "card",
        includeUnavailable: false,
        filters: { region: "Seoul" }
      },
      catalogQuerySchema
    );

    expect(result).toEqual({
      ebookId: "123e4567-e89b-12d3-a456-426614174000",
      isbn: "9780306406157",
      homepageUrl: "https://library.example.test/books",
      layout: "card",
      includeUnavailable: false,
      filters: { region: "Seoul" }
    });
  });

  it("rejects malformed, oversized, and unknown request fields with safe errors", () => {
    expect(() => validateStrictObject({ ebookId: "not-a-uuid" }, { ebookId: { type: "uuid" } })).toThrow(
      new SafeApiError(400, invalidRequestMessage)
    );
    expect(() => validateStrictObject({ name: "ok", isAdmin: true }, { name: { type: "string", maxLength: 10 } })).toThrow(
      new SafeApiError(400, invalidRequestMessage)
    );
    expect(() => validateStrictObject({ name: "x".repeat(11) }, { name: { type: "string", maxLength: 10 } })).toThrow(
      new SafeApiError(400, invalidRequestMessage)
    );
    expect(() => validateStrictObject({ url: "javascript:alert(1)" }, { url: { type: "url" } })).toThrow(
      new SafeApiError(400, invalidRequestMessage)
    );
  });

  it("validates pagination, sort allowlists, HTTP body size, and content type", () => {
    expect(validatePagination({ page: "2", pageSize: "50", sort: "newest" }, {
      allowedSorts: ["relevance", "newest"],
      defaultSort: "relevance"
    })).toEqual({
      page: 2,
      pageSize: 50,
      sort: "newest"
    });

    expect(() =>
      validatePagination({ page: "1", pageSize: "500", sort: "newest" }, {
        allowedSorts: ["relevance", "newest"],
        defaultSort: "relevance"
      })
    ).toThrow(new SafeApiError(400, invalidRequestMessage));

    expect(() =>
      validateHttpRequestBoundary({
        method: "POST",
        headers: {
          "content-type": "text/plain",
          "content-length": "2"
        }
      })
    ).toThrow(new SafeApiError(400, invalidRequestMessage));

    expect(() =>
      validateHttpRequestBoundary({
        method: "POST",
        headers: {
          "content-type": "application/json",
          "content-length": String(apiRequestPolicy.maxBodyBytes + 1)
        }
      })
    ).toThrow(new SafeApiError(413, invalidRequestMessage));
  });

  it("applies the HTTP boundary middleware to reject unsafe envelopes before route handling", () => {
    const middleware = new HttpBoundaryMiddleware();
    const next = vi.fn();
    const json = vi.fn();
    const status = vi.fn(() => ({ json }));

    middleware.use(
      {
        method: "PATCH",
        headers: {
          "content-type": "application/json",
          "content-length": String(apiRequestPolicy.maxBodyBytes + 1)
        }
      },
      { status },
      next
    );

    expect(next).not.toHaveBeenCalled();
    expect(status).toHaveBeenCalledWith(413);
    expect(json).toHaveBeenCalledWith({ error: invalidRequestMessage });
  });

  it("rejects unknown Auth API body properties before authentication behavior runs", async () => {
    const controller = new AuthController(new AuthService());
    const response = {
      cookie: vi.fn(),
      clearCookie: vi.fn()
    };

    await expect(
      controller.signUp(
        {
          email: "member@example.com",
          password: "correct horse battery staple",
          role: "admin"
        },
        undefined,
        undefined,
        response
      )
    ).rejects.toMatchObject({
      statusCode: 400,
      publicMessage: invalidRequestMessage
    });
    expect(response.cookie).not.toHaveBeenCalled();
  });

  it("denies member-owned object access when the caller does not own the record", () => {
    const objectTypes: readonly MemberOwnedObjectType[] = [
      "notification",
      "notificationPreference",
      "pushSubscription"
    ];

    for (const objectType of objectTypes) {
      expect(() =>
        assertMemberOwnedAccess(
          { role: "member", userId: "member-a" },
          {
            objectType,
            objectId: `${objectType}-1`,
            ownerUserId: "member-b"
          }
        )
      ).toThrow(new SafeApiError(403, accessDeniedMessage));
    }

    expect(() =>
      assertMemberOwnedAccess(
        { role: "member", userId: "member-a" },
        {
          objectType: "notification",
          objectId: "notification-1",
          ownerUserId: "member-a"
        }
      )
    ).not.toThrow();
  });

  it("keeps deny-by-default role checks and member-owned ID names explicit", () => {
    expect(memberOwnedIdParameterNames).toEqual([
      "userLibraryId",
      "savedBookId",
      "searchHistoryId",
      "loanAttemptId",
      "notificationId",
      "notificationPreferenceId",
      "pushSubscriptionId"
    ]);

    expect(() => requireRole({ role: "guest" }, ["member"])).toThrow(new SafeApiError(403, accessDeniedMessage));
    expect(() => requireRole({ role: "member", userId: "member-a" }, ["member"])).not.toThrow();
  });

  it("allowlists response properties so member-owned, admin-only, and internal fields are stripped by default", () => {
    const response = allowResponseProperties(
      {
        id: "book-1",
        title: "Clean Architecture",
        ownerUserId: "member-a",
        adminNotes: "private correction notes",
        rawExternalResponse: { token: "secret" },
        sessionToken: "secret-session",
        holding: {
          state: "available",
          internalAdapterTrace: "trace"
        }
      },
      {
        id: true,
        title: true,
        holding: {
          state: true
        }
      }
    );

    expect(response).toEqual({
      id: "book-1",
      title: "Clean Architecture",
      holding: {
        state: "available"
      }
    });
  });

  it("selects response allowlists by role and denies roles without an allowlist", () => {
    const value = {
      id: "library-1",
      name: "Public Library",
      adminNotes: "internal",
      adapterSecretReference: "secret-ref"
    };

    expect(
      allowResponsePropertiesForRole(value, { role: "member", userId: "member-a" }, {
        member: {
          id: true,
          name: true
        },
        admin: {
          id: true,
          name: true,
          adminNotes: true
        }
      })
    ).toEqual({
      id: "library-1",
      name: "Public Library"
    });

    expect(
      allowResponsePropertiesForRole(value, { role: "admin", userId: "admin-a" }, {
        member: {
          id: true,
          name: true
        },
        admin: {
          id: true,
          name: true,
          adminNotes: true
        }
      })
    ).toEqual({
      id: "library-1",
      name: "Public Library",
      adminNotes: "internal"
    });

    expect(() =>
      allowResponsePropertiesForRole(value, { role: "guest" }, {
        member: {
          id: true
        }
      })
    ).toThrow(new SafeApiError(403, accessDeniedMessage));
  });
});

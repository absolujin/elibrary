import type { ActorIdentity, UserRole } from "./auth";

export const invalidRequestMessage = "Invalid request.";
export const accessDeniedMessage = "Access denied.";

export class SafeApiError extends Error {
  constructor(
    readonly statusCode: number,
    readonly publicMessage: string
  ) {
    super(publicMessage);
    this.name = "SafeApiError";
  }
}

export type ApiFieldRule =
  | {
      readonly type: "string";
      readonly optional?: boolean;
      readonly minLength?: number;
      readonly maxLength?: number;
      readonly trim?: boolean;
      readonly pattern?: RegExp;
    }
  | {
      readonly type: "uuid";
      readonly optional?: boolean;
    }
  | {
      readonly type: "isbn";
      readonly optional?: boolean;
    }
  | {
      readonly type: "url";
      readonly optional?: boolean;
      readonly protocols?: readonly ("https:" | "http:")[];
      readonly maxLength?: number;
    }
  | {
      readonly type: "enum";
      readonly optional?: boolean;
      readonly values: readonly string[];
    }
  | {
      readonly type: "integer";
      readonly optional?: boolean;
      readonly min?: number;
      readonly max?: number;
    }
  | {
      readonly type: "boolean";
      readonly optional?: boolean;
    }
  | {
      readonly type: "jsonObject";
      readonly optional?: boolean;
      readonly maxKeys?: number;
    };

export type ApiInputSchema = Readonly<Record<string, ApiFieldRule>>;
export type ValidatedInput = Readonly<Record<string, unknown>>;

export const apiRequestPolicy = {
  maxBodyBytes: 32 * 1024,
  allowedJsonContentTypes: ["application/json", "application/problem+json"] as const,
  maxPageSize: 100,
  defaultPageSize: 20
} as const;

export const memberOwnedObjectTypes = [
  "userLibrary",
  "savedBook",
  "searchHistory",
  "loanAttempt",
  "notification",
  "notificationPreference",
  "pushSubscription"
] as const;

export type MemberOwnedObjectType = (typeof memberOwnedObjectTypes)[number];

export const memberOwnedIdParameterNames = [
  "userLibraryId",
  "savedBookId",
  "searchHistoryId",
  "loanAttemptId",
  "notificationId",
  "notificationPreferenceId",
  "pushSubscriptionId"
] as const;

export interface MemberOwnedRecord {
  readonly objectType: MemberOwnedObjectType;
  readonly objectId: string;
  readonly ownerUserId: string;
}

export interface ObjectAuthorizationOptions {
  readonly allowAdminOverride?: boolean;
  readonly allowSystem?: boolean;
}

export interface PaginationOptions {
  readonly allowedSorts: readonly string[];
  readonly defaultSort: string;
  readonly maxPageSize?: number;
}

export interface PaginationInput {
  readonly page?: unknown;
  readonly pageSize?: unknown;
  readonly sort?: unknown;
}

export interface PaginationResult {
  readonly page: number;
  readonly pageSize: number;
  readonly sort: string;
}

export interface HttpBoundaryInput {
  readonly method?: string;
  readonly headers: Readonly<Record<string, string | readonly string[] | undefined>>;
}

export interface ResponseAllowlist {
  readonly [field: string]: true | ResponseAllowlist;
}

export type RoleResponseAllowlists = Partial<Record<UserRole, ResponseAllowlist>> & {
  readonly default?: ResponseAllowlist;
};

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const bodyMethods = new Set(["POST", "PUT", "PATCH"]);

export function validateStrictObject(input: unknown, schema: ApiInputSchema): ValidatedInput {
  if (!isPlainObject(input)) {
    throw invalidRequest();
  }

  const allowedKeys = new Set(Object.keys(schema));
  const normalized: Record<string, unknown> = {};

  for (const key of Object.keys(input)) {
    if (!allowedKeys.has(key)) {
      throw invalidRequest();
    }
  }

  for (const [key, rule] of Object.entries(schema)) {
    const value = input[key];

    if (value === undefined || value === null) {
      if (rule.optional) {
        continue;
      }

      throw invalidRequest();
    }

    normalized[key] = validateField(value, rule);
  }

  return normalized;
}

export function validatePagination(input: PaginationInput, options: PaginationOptions): PaginationResult {
  const page = validateIntegerLike(input.page ?? 1, 1, 10_000);
  const pageSize = validateIntegerLike(
    input.pageSize ?? apiRequestPolicy.defaultPageSize,
    1,
    options.maxPageSize ?? apiRequestPolicy.maxPageSize
  );
  const sort = typeof input.sort === "string" ? input.sort : options.defaultSort;

  if (!options.allowedSorts.includes(sort)) {
    throw invalidRequest();
  }

  return { page, pageSize, sort };
}

export function validateHttpRequestBoundary(input: HttpBoundaryInput): void {
  const method = input.method?.toUpperCase() ?? "GET";
  const contentLength = getHeader(input.headers, "content-length");
  const parsedContentLength = contentLength === undefined ? 0 : Number(contentLength);

  if (!Number.isInteger(parsedContentLength) || parsedContentLength < 0) {
    throw invalidRequest();
  }

  if (parsedContentLength > apiRequestPolicy.maxBodyBytes) {
    throw new SafeApiError(413, invalidRequestMessage);
  }

  if (bodyMethods.has(method) && parsedContentLength > 0) {
    const contentType = getHeader(input.headers, "content-type")?.toLowerCase();
    const mediaType = contentType?.split(";")[0]?.trim();

    if (
      !mediaType ||
      !apiRequestPolicy.allowedJsonContentTypes.includes(
        mediaType as (typeof apiRequestPolicy.allowedJsonContentTypes)[number]
      )
    ) {
      throw invalidRequest();
    }
  }
}

export function requireRole(actor: ActorIdentity, allowedRoles: readonly UserRole[]): void {
  if (!allowedRoles.includes(actor.role)) {
    throw new SafeApiError(403, accessDeniedMessage);
  }
}

export function assertMemberOwnedAccess(
  actor: ActorIdentity,
  record: MemberOwnedRecord | undefined,
  options: ObjectAuthorizationOptions = {}
): void {
  if (!record) {
    throw new SafeApiError(404, accessDeniedMessage);
  }

  if (actor.role === "system" && options.allowSystem) {
    return;
  }

  if (actor.role === "admin" && options.allowAdminOverride) {
    return;
  }

  if (actor.role !== "member" || !actor.userId || actor.userId !== record.ownerUserId) {
    throw new SafeApiError(403, accessDeniedMessage);
  }
}

export function allowResponseProperties(value: unknown, allowlist: ResponseAllowlist): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => allowResponseProperties(item, allowlist));
  }

  if (!isPlainObject(value)) {
    return value;
  }

  const output: Record<string, unknown> = {};

  for (const [field, nestedAllowlist] of Object.entries(allowlist)) {
    if (!(field in value)) {
      continue;
    }

    const fieldValue = value[field];
    output[field] =
      nestedAllowlist === true ? fieldValue : allowResponseProperties(fieldValue, nestedAllowlist);
  }

  return output;
}

export function allowResponsePropertiesForRole(
  value: unknown,
  actor: ActorIdentity,
  allowlists: RoleResponseAllowlists
): unknown {
  const allowlist = allowlists[actor.role] ?? allowlists.default;

  if (!allowlist) {
    throw new SafeApiError(403, accessDeniedMessage);
  }

  return allowResponseProperties(value, allowlist);
}

function validateField(value: unknown, rule: ApiFieldRule): unknown {
  switch (rule.type) {
    case "string":
      return validateString(value, rule);
    case "uuid":
      return validateUuid(value);
    case "isbn":
      return validateIsbn(value);
    case "url":
      return validateUrl(value, rule);
    case "enum":
      return validateEnum(value, rule.values);
    case "integer":
      return validateIntegerLike(value, rule.min, rule.max);
    case "boolean":
      return validateBoolean(value);
    case "jsonObject":
      return validateJsonObject(value, rule.maxKeys);
  }
}

function validateString(
  value: unknown,
  rule: Extract<ApiFieldRule, { readonly type: "string" }>
): string {
  if (typeof value !== "string") {
    throw invalidRequest();
  }

  const normalized = rule.trim === false ? value : value.trim();

  if (rule.minLength !== undefined && normalized.length < rule.minLength) {
    throw invalidRequest();
  }

  if (rule.maxLength !== undefined && normalized.length > rule.maxLength) {
    throw invalidRequest();
  }

  if (rule.pattern && !rule.pattern.test(normalized)) {
    throw invalidRequest();
  }

  return normalized;
}

function validateUuid(value: unknown): string {
  if (typeof value !== "string" || !uuidPattern.test(value)) {
    throw invalidRequest();
  }

  return value.toLowerCase();
}

function validateIsbn(value: unknown): string {
  if (typeof value !== "string") {
    throw invalidRequest();
  }

  const normalized = value.replaceAll(/[-\s]/g, "").toUpperCase();

  if (/^\d{13}$/.test(normalized) || /^\d{9}[\dX]$/.test(normalized)) {
    return normalized;
  }

  throw invalidRequest();
}

function validateUrl(
  value: unknown,
  rule: Extract<ApiFieldRule, { readonly type: "url" }>
): string {
  if (typeof value !== "string") {
    throw invalidRequest();
  }

  const maxLength = rule.maxLength ?? 2048;

  if (value.length > maxLength) {
    throw invalidRequest();
  }

  try {
    const url = new URL(value);
    const protocols = rule.protocols ?? ["https:"];

    if (!protocols.includes(url.protocol as (typeof protocols)[number])) {
      throw invalidRequest();
    }

    url.hash = "";
    return url.toString();
  } catch {
    throw invalidRequest();
  }
}

function validateEnum(value: unknown, allowedValues: readonly string[]): string {
  if (typeof value !== "string" || !allowedValues.includes(value)) {
    throw invalidRequest();
  }

  return value;
}

function validateIntegerLike(value: unknown, min = Number.MIN_SAFE_INTEGER, max = Number.MAX_SAFE_INTEGER): number {
  const numberValue = typeof value === "number" ? value : Number(value);

  if (!Number.isInteger(numberValue) || numberValue < min || numberValue > max) {
    throw invalidRequest();
  }

  return numberValue;
}

function validateBoolean(value: unknown): boolean {
  if (typeof value !== "boolean") {
    throw invalidRequest();
  }

  return value;
}

function validateJsonObject(value: unknown, maxKeys = 20): Record<string, unknown> {
  if (!isPlainObject(value)) {
    throw invalidRequest();
  }

  if (Object.keys(value).length > maxKeys) {
    throw invalidRequest();
  }

  return value;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getHeader(
  headers: Readonly<Record<string, string | readonly string[] | undefined>>,
  name: string
): string | undefined {
  const direct = headers[name] ?? headers[name.toLowerCase()];
  const value = Array.isArray(direct) ? direct[0] : direct;
  return value;
}

function invalidRequest(): SafeApiError {
  return new SafeApiError(400, invalidRequestMessage);
}

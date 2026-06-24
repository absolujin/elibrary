import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

export const userRoles = ["guest", "member", "admin", "system"] as const;
export type UserRole = (typeof userRoles)[number];
export type AuthenticatedRole = Exclude<UserRole, "guest">;

export const oauthProviders = ["google", "apple", "kakao", "naver"] as const;
export type OAuthProvider = (typeof oauthProviders)[number];

export const genericAuthErrorMessage = "Authentication failed.";

export class AuthenticationFailedError extends Error {
  constructor() {
    super(genericAuthErrorMessage);
    this.name = "AuthenticationFailedError";
  }
}

export interface ActorIdentity {
  readonly role: UserRole;
  readonly userId?: string;
}

export const guestActor: ActorIdentity = { role: "guest" };

export interface SessionCookiePolicy {
  readonly name: "elibrary_session";
  readonly httpOnly: true;
  readonly secure: true;
  readonly sameSite: "lax";
  readonly path: "/";
  readonly maxAgeSeconds: number;
}

export const sessionCookiePolicy = {
  name: "elibrary_session",
  httpOnly: true,
  secure: true,
  sameSite: "lax",
  path: "/",
  maxAgeSeconds: 60 * 60 * 24 * 7
} as const satisfies SessionCookiePolicy;

export const authRateLimitPolicy = {
  maxAttempts: 5,
  windowMs: 15 * 60 * 1000
} as const;

export const adminMfaPolicy = {
  issuer: "eLibrary",
  algorithm: "sha1",
  digits: 6,
  periodSeconds: 30,
  recoveryCodeCount: 10
} as const;

export interface ExistingAccountForOAuthLink {
  readonly userId: string;
  readonly normalizedEmail: string;
  readonly active: boolean;
  readonly restricted: boolean;
}

export interface OAuthAutoLinkInput {
  readonly provider: string;
  readonly providerTokensValidated: boolean;
  readonly redirectUriValidated: boolean;
  readonly stateValidated: boolean;
  readonly nonceRequired?: boolean;
  readonly nonceValidated?: boolean;
  readonly providerEmail?: string;
  readonly providerEmailVerified: boolean;
  readonly targetAccount?: ExistingAccountForOAuthLink | null;
}

export type OAuthAutoLinkBlockedReason =
  | "provider-not-allowlisted"
  | "provider-token-not-validated"
  | "redirect-uri-not-validated"
  | "state-not-validated"
  | "nonce-not-validated"
  | "provider-email-missing"
  | "provider-email-unverified"
  | "target-account-missing"
  | "target-account-inactive"
  | "email-mismatch";

export type OAuthAutoLinkDecision =
  | { readonly canLink: true }
  | { readonly canLink: false; readonly reason: OAuthAutoLinkBlockedReason };

export function isUserRole(role: string): role is UserRole {
  return userRoles.includes(role as UserRole);
}

export function isAllowedOAuthProvider(provider: string): provider is OAuthProvider {
  return oauthProviders.includes(provider as OAuthProvider);
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function decideOAuthAutoLink(input: OAuthAutoLinkInput): OAuthAutoLinkDecision {
  if (!isAllowedOAuthProvider(input.provider)) {
    return { canLink: false, reason: "provider-not-allowlisted" };
  }

  if (!input.providerTokensValidated) {
    return { canLink: false, reason: "provider-token-not-validated" };
  }

  if (!input.redirectUriValidated) {
    return { canLink: false, reason: "redirect-uri-not-validated" };
  }

  if (!input.stateValidated) {
    return { canLink: false, reason: "state-not-validated" };
  }

  if (input.nonceRequired === true && input.nonceValidated !== true) {
    return { canLink: false, reason: "nonce-not-validated" };
  }

  if (!input.providerEmail) {
    return { canLink: false, reason: "provider-email-missing" };
  }

  if (!input.providerEmailVerified) {
    return { canLink: false, reason: "provider-email-unverified" };
  }

  if (!input.targetAccount) {
    return { canLink: false, reason: "target-account-missing" };
  }

  if (!input.targetAccount.active || input.targetAccount.restricted) {
    return { canLink: false, reason: "target-account-inactive" };
  }

  if (normalizeEmail(input.providerEmail) !== input.targetAccount.normalizedEmail) {
    return { canLink: false, reason: "email-mismatch" };
  }

  return { canLink: true };
}

export function canAccessPublicFeature(actor: ActorIdentity): true {
  void actor;
  return true;
}

export function canAccessAdminFeature(actor: ActorIdentity, mfaSatisfied: boolean): boolean {
  return actor.role === "admin" && mfaSatisfied;
}

export function generateTotpSecret(): string {
  return base32Encode(randomBytes(20));
}

export function generateTotpCode(secret: string, timestampMs = Date.now()): string {
  const counter = Math.floor(timestampMs / 1000 / adminMfaPolicy.periodSeconds);
  return generateTotpCodeForCounter(secret, counter);
}

export function verifyTotpCode(secret: string, code: string, timestampMs = Date.now(), window = 1): boolean {
  if (!/^\d{6}$/.test(code)) {
    return false;
  }

  const counter = Math.floor(timestampMs / 1000 / adminMfaPolicy.periodSeconds);

  for (let offset = -window; offset <= window; offset += 1) {
    const expected = generateTotpCodeForCounter(secret, counter + offset);
    const expectedBuffer = Buffer.from(expected);
    const actualBuffer = Buffer.from(code);

    if (expectedBuffer.length === actualBuffer.length && timingSafeEqual(expectedBuffer, actualBuffer)) {
      return true;
    }
  }

  return false;
}

function generateTotpCodeForCounter(secret: string, counter: number): string {
  const key = base32Decode(secret);
  const buffer = Buffer.alloc(8);
  buffer.writeBigUInt64BE(BigInt(counter));

  const hmac = createHmac("sha1", key).update(buffer).digest();
  const lastByte = hmac.at(-1);

  if (lastByte === undefined) {
    throw new AuthenticationFailedError();
  }

  const offset = lastByte & 0x0f;
  const first = hmac[offset];
  const second = hmac[offset + 1];
  const third = hmac[offset + 2];
  const fourth = hmac[offset + 3];

  if (first === undefined || second === undefined || third === undefined || fourth === undefined) {
    throw new AuthenticationFailedError();
  }

  const binary =
    ((first & 0x7f) << 24) |
    ((second & 0xff) << 16) |
    ((third & 0xff) << 8) |
    (fourth & 0xff);

  return String(binary % 1_000_000).padStart(adminMfaPolicy.digits, "0");
}

function base32Encode(bytes: Buffer): string {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let bits = 0;
  let value = 0;
  let output = "";

  for (const byte of bytes) {
    value = (value << 8) | byte;
    bits += 8;

    while (bits >= 5) {
      output += alphabet[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }

  if (bits > 0) {
    output += alphabet[(value << (5 - bits)) & 31];
  }

  return output;
}

function base32Decode(value: string): Buffer {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  const cleanValue = value.toUpperCase().replaceAll("=", "");
  const output: number[] = [];
  let bits = 0;
  let currentValue = 0;

  for (const character of cleanValue) {
    const index = alphabet.indexOf(character);

    if (index === -1) {
      throw new AuthenticationFailedError();
    }

    currentValue = (currentValue << 5) | index;
    bits += 5;

    if (bits >= 8) {
      output.push((currentValue >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }

  return Buffer.from(output);
}

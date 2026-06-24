import { Injectable } from "@nestjs/common";
import {
  AuthenticationFailedError,
  adminMfaPolicy,
  authRateLimitPolicy,
  canAccessAdminFeature,
  decideOAuthAutoLink,
  generateTotpCode,
  generateTotpSecret,
  genericAuthErrorMessage,
  guestActor,
  isAllowedOAuthProvider,
  normalizeEmail,
  sessionCookiePolicy,
  verifyTotpCode,
  type ActorIdentity,
  type AuthenticatedRole,
  type OAuthProvider
} from "@elibrary/domain";
import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
  randomUUID,
  scrypt as scryptCallback,
  timingSafeEqual
} from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(scryptCallback);
const passwordKeyLength = 64;
const sessionTtlMs = sessionCookiePolicy.maxAgeSeconds * 1000;
const secretEnvelopeVersion = "v1";

export interface AuthRequestContext {
  readonly ipAddress?: string;
  readonly userAgent?: string;
  readonly now?: Date;
}

export interface EmailSignUpInput {
  readonly email: string;
  readonly password: string;
  readonly displayName?: string;
}

export interface EmailSignInInput {
  readonly email: string;
  readonly password: string;
}

export interface OAuthCallbackInput {
  readonly code: string;
  readonly state: string;
  readonly redirectUri: string;
  readonly nonce?: string;
}

export interface VerifiedOAuthIdentity {
  readonly provider: OAuthProvider;
  readonly providerSubject: string;
  readonly email?: string;
  readonly emailVerified: boolean;
  readonly displayName?: string;
  readonly providerTokensValidated: boolean;
  readonly redirectUriValidated: boolean;
  readonly stateValidated: boolean;
  readonly nonceRequired?: boolean;
  readonly nonceValidated?: boolean;
}

export interface OAuthProviderVerifier {
  verifyCallback(provider: OAuthProvider, input: OAuthCallbackInput): Promise<VerifiedOAuthIdentity>;
}

export interface PublicSession {
  readonly actor: ActorIdentity;
  readonly authenticated: boolean;
  readonly mfaRequired: boolean;
  readonly expiresAt?: string;
}

export interface AuthResult {
  readonly sessionId: string;
  readonly session: PublicSession;
}

export interface AuditEventRecord {
  readonly action: string;
  readonly actor: ActorIdentity;
  readonly targetType: string;
  readonly targetId: string;
  readonly outcome: "success" | "failure";
  readonly occurredAt: Date;
}

interface AccountRecord {
  readonly id: string;
  readonly email: string;
  readonly normalizedEmail: string;
  readonly displayName?: string;
  readonly role: AuthenticatedRole;
  readonly status: "active" | "disabled";
  passwordHash?: string;
  encryptedTotpSecret?: string;
  recoveryCodeHashes: string[];
}

interface OAuthIdentityRecord {
  readonly provider: OAuthProvider;
  readonly providerSubject: string;
  readonly accountId: string;
}

interface SessionRecord {
  readonly sessionHash: string;
  readonly accountId: string;
  readonly role: AuthenticatedRole;
  readonly expiresAt: Date;
  readonly issuedAt: Date;
  readonly userAgent?: string;
  readonly ipAddress?: string;
  invalidatedAt?: Date;
  mfaVerifiedAt?: Date;
}

interface RateLimitBucket {
  count: number;
  resetsAt: number;
}

export class NotConfiguredOAuthProviderVerifier implements OAuthProviderVerifier {
  async verifyCallback(): Promise<VerifiedOAuthIdentity> {
    throw new AuthenticationFailedError();
  }
}

@Injectable()
export class AuthService {
  private readonly accountsById = new Map<string, AccountRecord>();
  private readonly accountIdsByEmail = new Map<string, string>();
  private readonly oauthIdentities = new Map<string, OAuthIdentityRecord>();
  private readonly sessionsByHash = new Map<string, SessionRecord>();
  private readonly rateLimits = new Map<string, RateLimitBucket>();
  private readonly auditEvents: AuditEventRecord[] = [];
  private readonly secretProtectionKey: Buffer;

  constructor(
    private readonly oauthVerifier: OAuthProviderVerifier = new NotConfiguredOAuthProviderVerifier(),
    secretProtectionKey = resolveSecretProtectionKey()
  ) {
    this.secretProtectionKey = createHash("sha256").update(secretProtectionKey).digest();
  }

  async signUpWithEmail(input: EmailSignUpInput, context: AuthRequestContext = {}): Promise<AuthResult> {
    this.assertRateLimit("email-sign-up", input.email, context);
    const normalizedEmail = this.normalizeAndValidateEmail(input.email);

    if (this.accountIdsByEmail.has(normalizedEmail)) {
      throw new AuthenticationFailedError();
    }

    this.assertPasswordAcceptable(input.password);

    const account: AccountRecord = {
      id: randomUUID(),
      email: input.email.trim(),
      normalizedEmail,
      displayName: input.displayName?.trim(),
      role: "member",
      status: "active",
      passwordHash: await hashPassword(input.password),
      recoveryCodeHashes: []
    };

    this.accountsById.set(account.id, account);
    this.accountIdsByEmail.set(account.normalizedEmail, account.id);
    return this.issueSession(account, context);
  }

  async signInWithEmail(input: EmailSignInInput, context: AuthRequestContext = {}): Promise<AuthResult> {
    this.assertRateLimit("email-sign-in", input.email, context);
    const normalizedEmail = this.normalizeAndValidateEmail(input.email);
    const account = this.getAccountByEmail(normalizedEmail);

    if (!account?.passwordHash || account.status !== "active") {
      await verifyPassword(input.password, await getDummyPasswordHash());
      throw new AuthenticationFailedError();
    }

    const passwordValid = await verifyPassword(input.password, account.passwordHash);

    if (!passwordValid) {
      throw new AuthenticationFailedError();
    }

    return this.issueSession(account, context);
  }

  async signInWithOAuthCallback(
    provider: string,
    input: OAuthCallbackInput,
    context: AuthRequestContext = {}
  ): Promise<AuthResult> {
    this.assertRateLimit("oauth-sign-in", provider, context);

    if (!isAllowedOAuthProvider(provider)) {
      throw new AuthenticationFailedError();
    }

    const identity = await this.oauthVerifier.verifyCallback(provider, input);

    if (identity.provider !== provider || identity.providerSubject.trim().length === 0) {
      throw new AuthenticationFailedError();
    }

    const linkedIdentity = this.oauthIdentities.get(oauthIdentityKey(identity.provider, identity.providerSubject));

    if (linkedIdentity) {
      const account = this.getActiveAccount(linkedIdentity.accountId);
      return this.issueSession(account, context);
    }

    const normalizedEmail = identity.email ? normalizeEmail(identity.email) : undefined;
    const targetAccount = normalizedEmail ? this.getAccountByEmail(normalizedEmail) : undefined;
    const linkDecision = decideOAuthAutoLink({
      provider,
      providerTokensValidated: identity.providerTokensValidated,
      redirectUriValidated: identity.redirectUriValidated,
      stateValidated: identity.stateValidated,
      nonceRequired: identity.nonceRequired,
      nonceValidated: identity.nonceValidated,
      providerEmail: identity.email,
      providerEmailVerified: identity.emailVerified,
      targetAccount: targetAccount
        ? {
            userId: targetAccount.id,
            normalizedEmail: targetAccount.normalizedEmail,
            active: targetAccount.status === "active",
            restricted: false
          }
        : null
    });

    if (linkDecision.canLink) {
      if (!targetAccount) {
        throw new AuthenticationFailedError();
      }

      this.linkOAuthIdentity(targetAccount, identity);
      this.recordAuditEvent(
        "oauth_identity_linked",
        { role: targetAccount.role, userId: targetAccount.id },
        "user",
        targetAccount.id
      );
      return this.issueSession(targetAccount, context);
    }

    if (!targetAccount && identity.email && identity.emailVerified) {
      const account = this.createOAuthMemberAccount(identity);
      this.linkOAuthIdentity(account, identity);
      this.recordAuditEvent("oauth_account_created", { role: account.role, userId: account.id }, "user", account.id);
      return this.issueSession(account, context);
    }

    throw new AuthenticationFailedError();
  }

  signOut(sessionId: string | undefined, context: AuthRequestContext = {}): void {
    if (!sessionId) {
      return;
    }

    const session = this.sessionsByHash.get(hashSessionId(sessionId));

    if (session) {
      session.invalidatedAt = context.now ?? new Date();
    }
  }

  getPublicSession(sessionId: string | undefined, now = new Date()): PublicSession {
    if (!sessionId) {
      return { actor: guestActor, authenticated: false, mfaRequired: false };
    }

    const session = this.sessionsByHash.get(hashSessionId(sessionId));

    if (!session || session.invalidatedAt || session.expiresAt <= now) {
      return { actor: guestActor, authenticated: false, mfaRequired: false };
    }

    return this.toPublicSession(session);
  }

  canAccessAdmin(sessionId: string | undefined, now = new Date()): boolean {
    const session = this.getSessionRecord(sessionId, now);

    if (!session) {
      return false;
    }

    return canAccessAdminFeature({ role: session.role, userId: session.accountId }, Boolean(session.mfaVerifiedAt));
  }

  async verifyAdminMfa(
    sessionId: string | undefined,
    input: { readonly totpCode?: string; readonly recoveryCode?: string },
    context: AuthRequestContext = {}
  ): Promise<AuthResult> {
    const session = this.getSessionRecord(sessionId, context.now ?? new Date());

    if (!session || session.role !== "admin") {
      throw new AuthenticationFailedError();
    }

    const account = this.getActiveAccount(session.accountId);
    const verified =
      (input.totpCode ? this.verifyAdminTotp(account, input.totpCode, context.now) : false) ||
      (input.recoveryCode ? await this.consumeRecoveryCode(account, input.recoveryCode) : false);

    if (!verified) {
      throw new AuthenticationFailedError();
    }

    session.invalidatedAt = context.now ?? new Date();
    const renewed = this.createSessionRecord(account, context, context.now ?? new Date(), context.now ?? new Date());
    this.recordAuditEvent("admin_mfa_verified", { role: "admin", userId: account.id }, "user", account.id);
    return renewed;
  }

  async createBootstrapAdmin(email: string, password: string): Promise<AccountRecord> {
    const normalizedEmail = this.normalizeAndValidateEmail(email);

    if (this.accountIdsByEmail.has(normalizedEmail)) {
      throw new AuthenticationFailedError();
    }

    this.assertPasswordAcceptable(password);

    const account: AccountRecord = {
      id: randomUUID(),
      email: email.trim(),
      normalizedEmail,
      role: "admin",
      status: "active",
      passwordHash: await hashPassword(password),
      recoveryCodeHashes: []
    };

    this.accountsById.set(account.id, account);
    this.accountIdsByEmail.set(account.normalizedEmail, account.id);
    return account;
  }

  enrollAdminTotp(accountId: string): { readonly secret: string; readonly otpauthUrl: string } {
    const account = this.getActiveAccount(accountId);

    if (account.role !== "admin") {
      throw new AuthenticationFailedError();
    }

    const secret = generateTotpSecret();
    account.encryptedTotpSecret = this.encryptSecret(secret);
    this.recordAuditEvent("admin_totp_enrolled", { role: "admin", userId: account.id }, "user", account.id);

    return {
      secret,
      otpauthUrl: `otpauth://totp/${encodeURIComponent(`eLibrary:${account.email}`)}?secret=${secret}&issuer=${encodeURIComponent(adminMfaPolicy.issuer)}&algorithm=SHA1&digits=${adminMfaPolicy.digits}&period=${adminMfaPolicy.periodSeconds}`
    };
  }

  async generateAdminRecoveryCodes(accountId: string): Promise<readonly string[]> {
    const account = this.getActiveAccount(accountId);

    if (account.role !== "admin") {
      throw new AuthenticationFailedError();
    }

    const codes = Array.from({ length: adminMfaPolicy.recoveryCodeCount }, () => generateRecoveryCode());
    account.recoveryCodeHashes = await Promise.all(codes.map((code) => hashPassword(code)));
    this.recordAuditEvent("admin_recovery_codes_generated", { role: "admin", userId: account.id }, "user", account.id);
    return codes;
  }

  async generateAdminRecoveryCodesForSession(sessionId: string | undefined, now = new Date()): Promise<readonly string[]> {
    const session = this.getSessionRecord(sessionId, now);

    if (!session || session.role !== "admin" || !session.mfaVerifiedAt) {
      throw new AuthenticationFailedError();
    }

    return this.generateAdminRecoveryCodes(session.accountId);
  }

  getAuditEvents(): readonly AuditEventRecord[] {
    return this.auditEvents;
  }

  private issueSession(account: AccountRecord, context: AuthRequestContext): AuthResult {
    return this.createSessionRecord(account, context, context.now ?? new Date());
  }

  private createSessionRecord(
    account: AccountRecord,
    context: AuthRequestContext,
    issuedAt: Date,
    mfaVerifiedAt?: Date
  ): AuthResult {
    const sessionId = randomBytes(32).toString("base64url");
    const session: SessionRecord = {
      sessionHash: hashSessionId(sessionId),
      accountId: account.id,
      role: account.role,
      issuedAt,
      expiresAt: new Date(issuedAt.getTime() + sessionTtlMs),
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
      mfaVerifiedAt
    };

    this.sessionsByHash.set(session.sessionHash, session);
    return {
      sessionId,
      session: this.toPublicSession(session)
    };
  }

  private toPublicSession(session: SessionRecord): PublicSession {
    const mfaRequired = session.role === "admin" && !session.mfaVerifiedAt;

    return {
      actor: { role: session.role, userId: session.accountId },
      authenticated: !mfaRequired,
      mfaRequired,
      expiresAt: session.expiresAt.toISOString()
    };
  }

  private verifyAdminTotp(account: AccountRecord, code: string, now?: Date): boolean {
    if (!account.encryptedTotpSecret) {
      return false;
    }

    return verifyTotpCode(this.decryptSecret(account.encryptedTotpSecret), code, now?.getTime());
  }

  private async consumeRecoveryCode(account: AccountRecord, code: string): Promise<boolean> {
    for (const [index, hash] of account.recoveryCodeHashes.entries()) {
      if (await verifyPassword(code, hash)) {
        account.recoveryCodeHashes.splice(index, 1);
        return true;
      }
    }

    return false;
  }

  private createOAuthMemberAccount(identity: VerifiedOAuthIdentity): AccountRecord {
    const email = identity.email?.trim();

    if (!email) {
      throw new AuthenticationFailedError();
    }

    const account: AccountRecord = {
      id: randomUUID(),
      email,
      normalizedEmail: normalizeEmail(email),
      displayName: identity.displayName,
      role: "member",
      status: "active",
      recoveryCodeHashes: []
    };

    this.accountsById.set(account.id, account);
    this.accountIdsByEmail.set(account.normalizedEmail, account.id);
    return account;
  }

  private linkOAuthIdentity(account: AccountRecord, identity: VerifiedOAuthIdentity): void {
    this.oauthIdentities.set(oauthIdentityKey(identity.provider, identity.providerSubject), {
      provider: identity.provider,
      providerSubject: identity.providerSubject,
      accountId: account.id
    });
  }

  private getAccountByEmail(normalizedEmail: string): AccountRecord | undefined {
    const accountId = this.accountIdsByEmail.get(normalizedEmail);
    return accountId ? this.accountsById.get(accountId) : undefined;
  }

  private getActiveAccount(accountId: string): AccountRecord {
    const account = this.accountsById.get(accountId);

    if (!account || account.status !== "active") {
      throw new AuthenticationFailedError();
    }

    return account;
  }

  private getSessionRecord(sessionId: string | undefined, now: Date): SessionRecord | undefined {
    if (!sessionId) {
      return undefined;
    }

    const session = this.sessionsByHash.get(hashSessionId(sessionId));

    if (!session || session.invalidatedAt || session.expiresAt <= now) {
      return undefined;
    }

    return session;
  }

  private assertRateLimit(flow: string, key: string, context: AuthRequestContext): void {
    const now = context.now?.getTime() ?? Date.now();
    const bucketKey = `${flow}:${context.ipAddress ?? "unknown"}:${normalizeEmail(key)}`;
    const existing = this.rateLimits.get(bucketKey);

    if (!existing || existing.resetsAt <= now) {
      this.rateLimits.set(bucketKey, {
        count: 1,
        resetsAt: now + authRateLimitPolicy.windowMs
      });
      return;
    }

    existing.count += 1;

    if (existing.count > authRateLimitPolicy.maxAttempts) {
      throw new AuthenticationFailedError();
    }
  }

  private normalizeAndValidateEmail(email: string): string {
    const normalizedEmail = normalizeEmail(email);

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      throw new AuthenticationFailedError();
    }

    return normalizedEmail;
  }

  private assertPasswordAcceptable(password: string): void {
    if (password.length < 12 || password.length > 256) {
      throw new AuthenticationFailedError();
    }
  }

  private encryptSecret(secret: string): string {
    const iv = randomBytes(12);
    const cipher = createCipheriv("aes-256-gcm", this.secretProtectionKey, iv);
    const ciphertext = Buffer.concat([cipher.update(secret, "utf8"), cipher.final()]);
    const tag = cipher.getAuthTag();
    return [secretEnvelopeVersion, iv.toString("base64url"), tag.toString("base64url"), ciphertext.toString("base64url")].join(":");
  }

  private decryptSecret(envelope: string): string {
    const [version, ivValue, tagValue, ciphertextValue] = envelope.split(":");

    if (version !== secretEnvelopeVersion || !ivValue || !tagValue || !ciphertextValue) {
      throw new AuthenticationFailedError();
    }

    const decipher = createDecipheriv("aes-256-gcm", this.secretProtectionKey, Buffer.from(ivValue, "base64url"));
    decipher.setAuthTag(Buffer.from(tagValue, "base64url"));
    return Buffer.concat([
      decipher.update(Buffer.from(ciphertextValue, "base64url")),
      decipher.final()
    ]).toString("utf8");
  }

  private recordAuditEvent(
    action: string,
    actor: ActorIdentity,
    targetType: string,
    targetId: string,
    outcome: "success" | "failure" = "success"
  ): void {
    this.auditEvents.push({
      action,
      actor,
      targetType,
      targetId,
      outcome,
      occurredAt: new Date()
    });
  }
}

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("base64url");
  const derivedKey = (await scrypt(password, salt, passwordKeyLength)) as Buffer;
  return `scrypt:${salt}:${derivedKey.toString("base64url")}`;
}

async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  const [algorithm, salt, encodedHash] = storedHash.split(":");

  if (algorithm !== "scrypt" || !salt || !encodedHash) {
    return false;
  }

  const expected = Buffer.from(encodedHash, "base64url");
  const actual = (await scrypt(password, salt, expected.length)) as Buffer;

  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

let dummyPasswordHash: Promise<string> | undefined;

function getDummyPasswordHash(): Promise<string> {
  dummyPasswordHash ??= hashPassword("not-the-real-password");
  return dummyPasswordHash;
}

function hashSessionId(sessionId: string): string {
  return createHash("sha256").update(sessionId).digest("base64url");
}

function oauthIdentityKey(provider: OAuthProvider, providerSubject: string): string {
  return `${provider}:${providerSubject}`;
}

function generateRecoveryCode(): string {
  return `${randomBytes(4).toString("hex")}-${randomBytes(4).toString("hex")}`;
}

function resolveSecretProtectionKey(): string {
  const configuredSecret = process.env.AUTH_SECRET_KEY;

  if (configuredSecret) {
    return configuredSecret;
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("AUTH_SECRET_KEY is required in production.");
  }

  return "bootstrap-development-auth-secret";
}

export { generateTotpCode, genericAuthErrorMessage };

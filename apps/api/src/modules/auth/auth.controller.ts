import { Body, Controller, Get, Headers, Param, Post, Res, UnauthorizedException } from "@nestjs/common";
import {
  allowResponseProperties,
  genericAuthErrorMessage,
  sessionCookiePolicy,
  validateStrictObject,
  type ApiInputSchema,
  type ResponseAllowlist
} from "@elibrary/domain";
import { AuthService } from "./auth.service";

interface CookieResponse {
  cookie(name: string, value: string, options: Record<string, unknown>): void;
  clearCookie(name: string, options: Record<string, unknown>): void;
}

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("signup")
  async signUp(
    @Body() body: unknown = {},
    @Headers("x-forwarded-for") forwardedFor: string | undefined,
    @Headers("user-agent") userAgent: string | undefined,
    @Res({ passthrough: true }) response: CookieResponse
  ): Promise<Record<string, unknown>> {
    const validatedBody = validateStrictObject(body, signUpBodySchema);

    try {
      const result = await this.authService.signUpWithEmail(
        {
          email: getRequiredString(validatedBody, "email"),
          password: getRequiredString(validatedBody, "password"),
          displayName: getOptionalString(validatedBody, "displayName")
        },
        { ipAddress: forwardedFor, userAgent }
      );
      writeSessionCookie(response, result.sessionId);
      return allowAuthSessionResponse({ session: result.session });
    } catch {
      throwGenericAuthFailure();
    }
  }

  @Post("signin")
  async signIn(
    @Body() body: unknown = {},
    @Headers("x-forwarded-for") forwardedFor: string | undefined,
    @Headers("user-agent") userAgent: string | undefined,
    @Res({ passthrough: true }) response: CookieResponse
  ): Promise<Record<string, unknown>> {
    const validatedBody = validateStrictObject(body, signInBodySchema);

    try {
      const result = await this.authService.signInWithEmail(
        {
          email: getRequiredString(validatedBody, "email"),
          password: getRequiredString(validatedBody, "password")
        },
        { ipAddress: forwardedFor, userAgent }
      );
      writeSessionCookie(response, result.sessionId);
      return allowAuthSessionResponse({ session: result.session });
    } catch {
      throwGenericAuthFailure();
    }
  }

  @Post("oauth/:provider/callback")
  async oauthCallback(
    @Param("provider") provider: string,
    @Body() body: unknown = {},
    @Headers("x-forwarded-for") forwardedFor: string | undefined,
    @Headers("user-agent") userAgent: string | undefined,
    @Res({ passthrough: true }) response: CookieResponse
  ): Promise<Record<string, unknown>> {
    const validatedBody = validateStrictObject(body, oauthCallbackBodySchema);

    try {
      const result = await this.authService.signInWithOAuthCallback(
        provider,
        {
          code: getRequiredString(validatedBody, "code"),
          state: getRequiredString(validatedBody, "state"),
          redirectUri: getRequiredString(validatedBody, "redirectUri"),
          nonce: getOptionalString(validatedBody, "nonce")
        },
        { ipAddress: forwardedFor, userAgent }
      );
      writeSessionCookie(response, result.sessionId);
      return allowAuthSessionResponse({ session: result.session });
    } catch {
      throwGenericAuthFailure();
    }
  }

  @Post("signout")
  signOut(
    @Headers("cookie") cookieHeader: string | undefined,
    @Res({ passthrough: true }) response: CookieResponse
  ): Record<string, unknown> {
    this.authService.signOut(readSessionCookie(cookieHeader));
    response.clearCookie(sessionCookiePolicy.name, {
      path: sessionCookiePolicy.path,
      httpOnly: sessionCookiePolicy.httpOnly,
      secure: sessionCookiePolicy.secure,
      sameSite: sessionCookiePolicy.sameSite
    });
    return { signedOut: true };
  }

  @Get("session")
  getSession(@Headers("cookie") cookieHeader: string | undefined): Record<string, unknown> {
    return allowAuthSessionResponse({ session: this.authService.getPublicSession(readSessionCookie(cookieHeader)) });
  }

  @Post("admin/mfa/verify")
  async verifyAdminMfa(
    @Body() body: unknown = {},
    @Headers("cookie") cookieHeader: string | undefined,
    @Res({ passthrough: true }) response: CookieResponse
  ): Promise<Record<string, unknown>> {
    const validatedBody = validateStrictObject(body, adminMfaBodySchema);

    try {
      const result = await this.authService.verifyAdminMfa(readSessionCookie(cookieHeader), {
        totpCode: getOptionalString(validatedBody, "totpCode"),
        recoveryCode: getOptionalString(validatedBody, "recoveryCode")
      });
      writeSessionCookie(response, result.sessionId);
      return allowAuthSessionResponse({ session: result.session });
    } catch {
      throwGenericAuthFailure();
    }
  }

  @Post("admin/recovery-codes")
  async generateAdminRecoveryCodes(@Headers("cookie") cookieHeader: string | undefined): Promise<Record<string, unknown>> {
    try {
      return { recoveryCodes: await this.authService.generateAdminRecoveryCodesForSession(readSessionCookie(cookieHeader)) };
    } catch {
      throwGenericAuthFailure();
    }
  }
}

const signUpBodySchema = {
  email: { type: "string", minLength: 3, maxLength: 320 },
  password: { type: "string", minLength: 1, maxLength: 256, trim: false },
  displayName: { type: "string", optional: true, minLength: 1, maxLength: 120 }
} as const satisfies ApiInputSchema;

const signInBodySchema = {
  email: { type: "string", minLength: 3, maxLength: 320 },
  password: { type: "string", minLength: 1, maxLength: 256, trim: false }
} as const satisfies ApiInputSchema;

const oauthCallbackBodySchema = {
  code: { type: "string", minLength: 1, maxLength: 2048, trim: false },
  state: { type: "string", minLength: 1, maxLength: 512, trim: false },
  redirectUri: { type: "url", maxLength: 2048 },
  nonce: { type: "string", optional: true, minLength: 1, maxLength: 512, trim: false }
} as const satisfies ApiInputSchema;

const adminMfaBodySchema = {
  totpCode: { type: "string", optional: true, minLength: 6, maxLength: 6, pattern: /^\d{6}$/ },
  recoveryCode: { type: "string", optional: true, minLength: 17, maxLength: 17, pattern: /^[0-9a-f]{8}-[0-9a-f]{8}$/ }
} as const satisfies ApiInputSchema;

const authSessionResponseAllowlist = {
  session: {
    actor: {
      role: true,
      userId: true
    },
    authenticated: true,
    mfaRequired: true,
    expiresAt: true
  }
} as const satisfies ResponseAllowlist;

function writeSessionCookie(response: CookieResponse, sessionId: string): void {
  response.cookie(sessionCookiePolicy.name, sessionId, {
    httpOnly: sessionCookiePolicy.httpOnly,
    secure: sessionCookiePolicy.secure,
    sameSite: sessionCookiePolicy.sameSite,
    path: sessionCookiePolicy.path,
    maxAge: sessionCookiePolicy.maxAgeSeconds * 1000
  });
}

function readSessionCookie(cookieHeader: string | undefined): string | undefined {
  if (!cookieHeader) {
    return undefined;
  }

  for (const chunk of cookieHeader.split(";")) {
    const [name, ...valueParts] = chunk.trim().split("=");

    if (name === sessionCookiePolicy.name) {
      return valueParts.join("=");
    }
  }

  return undefined;
}

function throwGenericAuthFailure(): never {
  throw new UnauthorizedException(genericAuthErrorMessage);
}

function allowAuthSessionResponse(value: Record<string, unknown>): Record<string, unknown> {
  return allowResponseProperties(value, authSessionResponseAllowlist) as Record<string, unknown>;
}

function getRequiredString(input: Record<string, unknown>, field: string): string {
  const value = input[field];

  if (typeof value !== "string") {
    throwGenericAuthFailure();
  }

  return value;
}

function getOptionalString(input: Record<string, unknown>, field: string): string | undefined {
  const value = input[field];

  if (value === undefined) {
    return undefined;
  }

  if (typeof value !== "string") {
    throwGenericAuthFailure();
  }

  return value;
}

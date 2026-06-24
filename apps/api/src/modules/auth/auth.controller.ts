import { Body, Controller, Get, Headers, Param, Post, Res, UnauthorizedException } from "@nestjs/common";
import { genericAuthErrorMessage, sessionCookiePolicy } from "@elibrary/domain";
import { AuthService, type OAuthCallbackInput } from "./auth.service";

interface CookieResponse {
  cookie(name: string, value: string, options: Record<string, unknown>): void;
  clearCookie(name: string, options: Record<string, unknown>): void;
}

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("signup")
  async signUp(
    @Body() body: { readonly email?: string; readonly password?: string; readonly displayName?: string } = {},
    @Headers("x-forwarded-for") forwardedFor: string | undefined,
    @Headers("user-agent") userAgent: string | undefined,
    @Res({ passthrough: true }) response: CookieResponse
  ): Promise<Record<string, unknown>> {
    try {
      const result = await this.authService.signUpWithEmail(
        { email: String(body.email ?? ""), password: String(body.password ?? ""), displayName: body.displayName },
        { ipAddress: forwardedFor, userAgent }
      );
      writeSessionCookie(response, result.sessionId);
      return { session: result.session };
    } catch {
      throwGenericAuthFailure();
    }
  }

  @Post("signin")
  async signIn(
    @Body() body: { readonly email?: string; readonly password?: string } = {},
    @Headers("x-forwarded-for") forwardedFor: string | undefined,
    @Headers("user-agent") userAgent: string | undefined,
    @Res({ passthrough: true }) response: CookieResponse
  ): Promise<Record<string, unknown>> {
    try {
      const result = await this.authService.signInWithEmail(
        { email: String(body.email ?? ""), password: String(body.password ?? "") },
        { ipAddress: forwardedFor, userAgent }
      );
      writeSessionCookie(response, result.sessionId);
      return { session: result.session };
    } catch {
      throwGenericAuthFailure();
    }
  }

  @Post("oauth/:provider/callback")
  async oauthCallback(
    @Param("provider") provider: string,
    @Body() body: Partial<OAuthCallbackInput> = {},
    @Headers("x-forwarded-for") forwardedFor: string | undefined,
    @Headers("user-agent") userAgent: string | undefined,
    @Res({ passthrough: true }) response: CookieResponse
  ): Promise<Record<string, unknown>> {
    try {
      const result = await this.authService.signInWithOAuthCallback(
        provider,
        {
          code: String(body.code ?? ""),
          state: String(body.state ?? ""),
          redirectUri: String(body.redirectUri ?? ""),
          nonce: body.nonce
        },
        { ipAddress: forwardedFor, userAgent }
      );
      writeSessionCookie(response, result.sessionId);
      return { session: result.session };
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
    return { session: this.authService.getPublicSession(readSessionCookie(cookieHeader)) };
  }

  @Post("admin/mfa/verify")
  async verifyAdminMfa(
    @Body() body: { readonly totpCode?: string; readonly recoveryCode?: string } = {},
    @Headers("cookie") cookieHeader: string | undefined,
    @Res({ passthrough: true }) response: CookieResponse
  ): Promise<Record<string, unknown>> {
    try {
      const result = await this.authService.verifyAdminMfa(readSessionCookie(cookieHeader), {
        totpCode: body.totpCode,
        recoveryCode: body.recoveryCode
      });
      writeSessionCookie(response, result.sessionId);
      return { session: result.session };
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

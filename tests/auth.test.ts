import { describe, expect, it } from "vitest";
import {
  AuthenticationFailedError,
  canAccessPublicFeature,
  decideOAuthAutoLink,
  generateTotpCode,
  genericAuthErrorMessage,
  oauthProviders,
  sessionCookiePolicy
} from "../packages/domain/src";
import {
  AuthService,
  type OAuthCallbackInput,
  type OAuthProviderVerifier,
  type VerifiedOAuthIdentity
} from "../apps/api/src/modules/auth/auth.service";

class FakeOAuthVerifier implements OAuthProviderVerifier {
  constructor(private readonly identity: VerifiedOAuthIdentity) {}

  async verifyCallback(): Promise<VerifiedOAuthIdentity> {
    return this.identity;
  }
}

const oauthCallback = {
  code: "provider-code",
  state: "state",
  redirectUri: "https://elibrary.example.test/api/auth/google/callback"
} satisfies OAuthCallbackInput;

describe("auth, sessions, and role identity", () => {
  it("keeps public access available for guests and issues secure member sessions", async () => {
    const auth = new AuthService();

    expect(canAccessPublicFeature(auth.getPublicSession(undefined).actor)).toBe(true);
    expect(sessionCookiePolicy).toMatchObject({
      httpOnly: true,
      secure: true,
      sameSite: "lax"
    });

    const result = await auth.signUpWithEmail(
      {
        email: "Member@Example.com",
        password: "correct horse battery staple"
      },
      { ipAddress: "127.0.0.1" }
    );

    expect(result.session).toMatchObject({
      actor: { role: "member" },
      authenticated: true,
      mfaRequired: false
    });
    expect(result.sessionId).not.toContain("Member@Example.com");

    auth.signOut(result.sessionId);
    expect(auth.getPublicSession(result.sessionId)).toMatchObject({
      actor: { role: "guest" },
      authenticated: false
    });
  });

  it("uses generic auth failures that do not reveal whether an account exists", async () => {
    const auth = new AuthService();
    await auth.signUpWithEmail({
      email: "member@example.com",
      password: "correct horse battery staple"
    });

    await expect(
      auth.signInWithEmail({ email: "member@example.com", password: "wrong password value" }, { ipAddress: "wrong-password" })
    ).rejects.toMatchObject({ message: genericAuthErrorMessage });

    await expect(
      auth.signInWithEmail({ email: "missing@example.com", password: "wrong password value" }, { ipAddress: "missing-account" })
    ).rejects.toMatchObject({ message: genericAuthErrorMessage });
  });

  it("allowlists selected OAuth providers and auto-links only validated verified email matches", async () => {
    expect(oauthProviders).toEqual(["google", "apple", "kakao", "naver"]);

    const auth = new AuthService(
      new FakeOAuthVerifier({
        provider: "google",
        providerSubject: "google-user-1",
        email: "member@example.com",
        emailVerified: true,
        providerTokensValidated: true,
        redirectUriValidated: true,
        stateValidated: true,
        nonceRequired: true,
        nonceValidated: true
      })
    );
    const emailSession = await auth.signUpWithEmail({
      email: "member@example.com",
      password: "correct horse battery staple"
    });

    const oauthSession = await auth.signInWithOAuthCallback("google", oauthCallback);

    expect(oauthSession.session.actor).toEqual(emailSession.session.actor);
    expect(auth.getAuditEvents().map((event) => event.action)).toContain("oauth_identity_linked");
  });

  it("blocks OAuth auto-linking when matching provider email is not verified", async () => {
    const decision = decideOAuthAutoLink({
      provider: "google",
      providerTokensValidated: true,
      redirectUriValidated: true,
      stateValidated: true,
      providerEmail: "member@example.com",
      providerEmailVerified: false,
      targetAccount: {
        userId: "user-1",
        normalizedEmail: "member@example.com",
        active: true,
        restricted: false
      }
    });

    expect(decision).toEqual({ canLink: false, reason: "provider-email-unverified" });

    const auth = new AuthService(
      new FakeOAuthVerifier({
        provider: "google",
        providerSubject: "google-user-1",
        email: "member@example.com",
        emailVerified: false,
        providerTokensValidated: true,
        redirectUriValidated: true,
        stateValidated: true
      })
    );
    await auth.signUpWithEmail({
      email: "member@example.com",
      password: "correct horse battery staple"
    });

    await expect(auth.signInWithOAuthCallback("google", oauthCallback)).rejects.toBeInstanceOf(AuthenticationFailedError);
    expect(auth.getAuditEvents().map((event) => event.action)).not.toContain("oauth_identity_linked");
  });

  it("requires Google Authenticator-compatible TOTP before admin access and renews the session after MFA", async () => {
    const auth = new AuthService();
    const admin = await auth.createBootstrapAdmin("admin@example.com", "correct horse battery staple");
    const enrollment = auth.enrollAdminTotp(admin.id);
    const signIn = await auth.signInWithEmail({
      email: "admin@example.com",
      password: "correct horse battery staple"
    });

    expect(signIn.session).toMatchObject({
      actor: { role: "admin" },
      authenticated: false,
      mfaRequired: true
    });
    expect(auth.canAccessAdmin(signIn.sessionId)).toBe(false);

    const verified = await auth.verifyAdminMfa(signIn.sessionId, {
      totpCode: generateTotpCode(enrollment.secret)
    });

    expect(verified.session).toMatchObject({
      actor: { role: "admin" },
      authenticated: true,
      mfaRequired: false
    });
    expect(auth.canAccessAdmin(verified.sessionId)).toBe(true);
    expect(auth.canAccessAdmin(signIn.sessionId)).toBe(false);
  });

  it("generates single-use admin recovery codes after MFA", async () => {
    const auth = new AuthService();
    const admin = await auth.createBootstrapAdmin("admin@example.com", "correct horse battery staple");
    const enrollment = auth.enrollAdminTotp(admin.id);
    const signIn = await auth.signInWithEmail({
      email: "admin@example.com",
      password: "correct horse battery staple"
    });
    const verified = await auth.verifyAdminMfa(signIn.sessionId, {
      totpCode: generateTotpCode(enrollment.secret)
    });

    const [recoveryCode] = await auth.generateAdminRecoveryCodesForSession(verified.sessionId);

    if (!recoveryCode) {
      throw new Error("Expected at least one recovery code");
    }

    const secondSignIn = await auth.signInWithEmail({
      email: "admin@example.com",
      password: "correct horse battery staple"
    });
    const recovered = await auth.verifyAdminMfa(secondSignIn.sessionId, { recoveryCode });

    expect(auth.canAccessAdmin(recovered.sessionId)).toBe(true);

    const thirdSignIn = await auth.signInWithEmail(
      {
        email: "admin@example.com",
        password: "correct horse battery staple"
      },
      { ipAddress: "third-admin-login" }
    );
    await expect(auth.verifyAdminMfa(thirdSignIn.sessionId, { recoveryCode })).rejects.toBeInstanceOf(AuthenticationFailedError);
  });
});

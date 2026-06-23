## Requirement

As a `Member or Admin`, I need `secure sign-in, sign-out, session handling, and role identity` so that `account and admin workflows are available only to the correct actor`.

## Owner

- Domain: `security`
- Owning file: `SECURITY.md`
- Existing requirement/control/decision ID, if any: `FR-6.1 | SR-002 | SR-003`

## Scope

In scope:

- Implement email sign-up, sign-in, and sign-out behavior from `FR-6.1`.
- Implement Google, Apple, Kakao, and Naver social/OAuth sign-in behavior from `FR-6.2`.
- Automatically link supported OAuth identities to existing email accounts when `FR-6.7` and `SR-002` account-linking conditions are satisfied.
- Establish roles for guest, member, admin, and system.
- Apply session controls, generic auth errors, rate limits, logout invalidation, and Google Authenticator-compatible TOTP admin MFA requirements from `SR-002`.
- Provide single-use admin recovery codes according to `SR-002`.

Out of scope:

- External electronic-library credential collection or account linking.
- Additional social/OAuth providers beyond Google, Apple, Kakao, and Naver.

## Acceptance Criteria

- Given a Guest uses public browsing or search, when no session exists, then public features remain available.
- Given a Member signs in successfully, when the session is issued, then the session follows `SR-002`.
- Given Google, Apple, Kakao, or Naver OAuth sign-in succeeds, when the callback is accepted, then the user identity is linked or signed in according to the selected account flow and `SR-002`.
- Given a supported OAuth identity has a verified email that exactly matches an active existing email account, when OAuth callback validation succeeds, then the identity is automatically linked and an audit event is emitted.
- Given a supported OAuth identity has no verified matching email, when OAuth callback validation succeeds, then it is not automatically linked to an existing account.
- Given an Admin signs in, when admin access is requested, then Google Authenticator-compatible TOTP MFA is required according to `SECURITY.md`.
- Given admin recovery codes are generated, when they are stored, then only hashed single-use recovery codes are retained.
- Given auth errors occur, when responses are shown, then they do not reveal whether an account exists.

## Verification

- Test or check: `deferred until implementation workflow exists`
- Evidence required: `Auth flow tests or manual checks for sign-up, sign-in, sign-out, role identity, generic errors, Google Authenticator-compatible admin MFA, and recovery codes.`

## Dependencies

- `github-issues/01-resolve-mvp-implementation-decisions.md`
- `SECURITY.md#sr-002-authentication-and-sessions`
- `SECURITY.md#sr-003-authorization`

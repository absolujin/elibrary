## Requirement

As a `Guest, Member, or Admin`, I need `the web client to render external metadata and links safely` so that `public catalog data, cover images, and borrowing handoffs do not expose users or sessions`.

## Owner

- Domain: `security`
- Owning file: `SECURITY.md`
- Existing requirement/control/decision ID, if any: `SR-005 | SR-013`

## Scope

In scope:

- Escape or sanitize user input and external metadata before rendering.
- Configure CSP, referrer policy, mixed-content blocking, and safe external links.
- Use `rel="noopener noreferrer"` for external links opened in a new context.
- Constrain remote cover images and external assets by allowlisting, proxying, CSP, or equivalent controls.
- Ensure borrowing handoff UI does not display external library login forms or imply eLibrary completed borrowing.

Out of scope:

- Backend adapter SSRF controls covered by `SR-006`.
- Collecting external electronic-library credentials.

## Acceptance Criteria

- Given external metadata contains unsafe markup, when rendered, then it is escaped or sanitized.
- Given an external link opens in a new context, when inspected, then `rel="noopener noreferrer"` is present.
- Given the browser sends requests to external libraries, when referrer behavior is inspected, then sensitive eLibrary paths or query strings are not leaked.
- Given cover images or external assets are rendered, when policy is inspected, then they are constrained by the selected control.

## Verification

- Test or check: `deferred until implementation workflow exists`
- Evidence required: `Web client checks for sanitization, CSP/referrer policy, external link attributes, cover image constraints, and borrowing handoff wording.`

## Dependencies

- `github-issues/13-implement-borrowing-handoff-loan-attempts.md`
- `SECURITY.md#sr-005-web-client-safety`
- `DESIGN.md`

